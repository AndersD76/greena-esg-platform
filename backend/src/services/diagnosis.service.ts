import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { ScoringService } from './scoring.service';
import { InsightsService } from './insights.service';
import { ActionPlanService } from './actionPlan.service';

export class DiagnosisService {
  private scoringService: ScoringService;
  private insightsService: InsightsService;
  private actionPlanService: ActionPlanService;

  constructor() {
    this.scoringService = new ScoringService();
    this.insightsService = new InsightsService();
    this.actionPlanService = new ActionPlanService();
  }

  /**
   * Cria novo diagnóstico
   */
  async create(userId: string) {
    // Verificar se já existe diagnóstico em progresso
    const existingDiagnosis = await prisma.diagnosis.findFirst({
      where: {
        userId,
        status: 'in_progress',
      },
    });

    if (existingDiagnosis) {
      return existingDiagnosis;
    }

    const diagnosis = await prisma.diagnosis.create({
      data: {
        userId,
        status: 'in_progress',
      },
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'diagnosis_started',
        description: 'Diagnóstico ESG iniciado',
      },
    });

    return diagnosis;
  }

  /**
   * Lista diagnósticos do usuário
   */
  async list(userId: string) {
    return prisma.diagnosis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Busca diagnóstico por ID
   */
  async getById(id: string, userId: string) {
    const diagnosis = await prisma.diagnosis.findFirst({
      where: { id, userId },
      include: {
        responses: {
          include: {
            assessmentItem: {
              include: {
                criteria: {
                  include: {
                    theme: {
                      include: {
                        pillar: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!diagnosis) {
      throw new Error('Diagnóstico não encontrado');
    }

    return diagnosis;
  }

  /**
   * Completa diagnóstico e gera insights e plano de ação
   */
  async complete(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status === 'completed') {
      throw new Error('Diagnóstico já foi concluído');
    }

    // Calcular scores
    const scores = await this.scoringService.calculateAllScores(id);

    // Gerar insights
    await this.insightsService.generateInsights(id);

    // Gerar plano de ação
    await this.actionPlanService.generateActionPlan(id);

    // Atualizar diagnóstico
    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'diagnosis_completed',
        description: `Diagnóstico ESG concluído com score ${scores.overall}`,
      },
    });

    return {
      diagnosis: updatedDiagnosis,
      scores,
    };
  }

  /**
   * Busca resultados de um diagnóstico
   */
  async getResults(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    const insights = await this.insightsService.getInsights(id);
    const actionPlan = await this.actionPlanService.getActionPlan(id);

    return {
      diagnosis,
      scores: {
        overall: Number(diagnosis.overallScore),
        environmental: Number(diagnosis.environmentalScore),
        social: Number(diagnosis.socialScore),
        governance: Number(diagnosis.governanceScore),
      },
      insights,
      actionPlan,
    };
  }

  /**
   * Calcula progresso do diagnóstico
   */
  async getProgress(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    // Contar total de questões
    const totalQuestions = await prisma.assessmentItem.count();

    // Contar questões respondidas
    const answeredQuestions = diagnosis.responses.length;

    const progress = Math.round((answeredQuestions / totalQuestions) * 100);

    return {
      total: totalQuestions,
      answered: answeredQuestions,
      remaining: totalQuestions - answeredQuestions,
      progress,
    };
  }

  /**
   * Finaliza diagnóstico (alias for complete)
   */
  async finalize(id: string, userId: string) {
    return this.complete(id, userId);
  }

  /**
   * Busca apenas insights de um diagnóstico
   */
  async getInsights(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    return this.insightsService.getInsights(id);
  }

  /**
   * Busca apenas plano de ação de um diagnóstico
   */
  async getActionPlans(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    return this.actionPlanService.getActionPlan(id);
  }

  /**
   * Completa diagnóstico simplificado (plano free) com scores diretos
   */
  async completeSimplified(id: string, userId: string, scores: {
    environmental: number;
    social: number;
    governance: number;
  }) {
    const diagnosis = await prisma.diagnosis.findFirst({
      where: { id, userId },
    });

    if (!diagnosis) {
      throw new Error('Diagnóstico não encontrado');
    }

    if (diagnosis.status === 'completed') {
      throw new Error('Diagnóstico já foi concluído');
    }

    const overall = Math.round(((scores.environmental + scores.social + scores.governance) / 3) * 100) / 100;

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        overallScore: new Decimal(overall),
        environmentalScore: new Decimal(scores.environmental),
        socialScore: new Decimal(scores.social),
        governanceScore: new Decimal(scores.governance),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'diagnosis_completed',
        description: `Diagnóstico ESG simplificado concluído com score ${overall}`,
      },
    });

    return {
      diagnosis: updatedDiagnosis,
      scores: { ...scores, overall },
    };
  }

  /**
   * Calcula scores parciais baseado nas respostas atuais (mesmo sem finalizar)
   */
  async getPartialScores(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    // Se já está completo, retornar scores oficiais
    if (diagnosis.status === 'completed') {
      const overallScore = Number(diagnosis.overallScore);
      const certification = this.scoringService.getCertificationLevel(overallScore);

      return {
        overall: overallScore,
        environmental: Number(diagnosis.environmentalScore),
        social: Number(diagnosis.socialScore),
        governance: Number(diagnosis.governanceScore),
        isPartial: false,
        certification,
      };
    }

    // Calcular scores parciais baseado nas respostas existentes
    const partialScores = await this.scoringService.calculatePartialScores(id);
    const certification = this.scoringService.getCertificationLevel(partialScores.overall);

    return {
      ...partialScores,
      isPartial: true,
      certification,
    };
  }
}
