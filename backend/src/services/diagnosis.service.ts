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

  async findInProgress(userId: string, framework?: string) {
    return prisma.diagnosis.findFirst({
      where: {
        userId,
        status: 'in_progress',
        ...(framework ? { framework } : {}),
      },
    });
  }

  async create(userId: string, type: 'full' | 'demo' = 'full', framework: string = 'ESG') {
    const existingDiagnosis = await this.findInProgress(userId, framework);

    if (existingDiagnosis) {
      if (existingDiagnosis.type !== type) {
        return prisma.diagnosis.update({
          where: { id: existingDiagnosis.id },
          data: { type },
        });
      }

      return existingDiagnosis;
    }

    const frameworkLabel = framework === 'GRI' ? 'GRI'
      : framework === 'ESG_GRI' ? 'ESG+GRI'
      : 'ESG';

    const diagnosis = await prisma.diagnosis.create({
      data: {
        userId,
        status: 'in_progress',
        type,
        framework,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'diagnosis_started',
        description: `Diagnóstico ${frameworkLabel} iniciado`,
      },
    });

    return diagnosis;
  }

  async list(userId: string) {
    return prisma.diagnosis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

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

  async complete(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status === 'completed') {
      throw new Error('Diagnóstico já foi concluído');
    }

    const scores = await this.scoringService.calculateAllScores(id);
    await this.insightsService.generateInsights(id);
    await this.actionPlanService.generateActionPlan(id);

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    const framework = diagnosis.framework || 'ESG';
    const frameworkLabel = framework === 'GRI' ? 'GRI'
      : framework === 'ESG_GRI' ? 'ESG+GRI'
      : 'ESG';

    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'diagnosis_completed',
        description: `Diagnóstico ${frameworkLabel} concluído com score ${scores.overall}`,
      },
    });

    return {
      diagnosis: updatedDiagnosis,
      scores,
    };
  }

  async getResults(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    const insights = await this.insightsService.getInsights(id);
    const actionPlan = await this.actionPlanService.getActionPlan(id);

    // Fetch dynamic pillar scores
    const pillarScores = await prisma.diagnosisScore.findMany({
      where: { diagnosisId: id },
      include: { pillar: true },
      orderBy: { pillar: { sortOrder: 'asc' } },
    });

    const scores: Record<string, number> = {
      overall: Number(diagnosis.overallScore),
    };

    // Legacy fields
    scores.environmental = Number(diagnosis.environmentalScore);
    scores.social = Number(diagnosis.socialScore);
    scores.governance = Number(diagnosis.governanceScore);

    return {
      diagnosis,
      scores,
      pillarScores: pillarScores.map(ps => ({
        code: ps.pillar.code,
        name: ps.pillar.name,
        color: ps.pillar.color,
        score: Number(ps.score),
      })),
      insights,
      actionPlan,
    };
  }

  async getProgress(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);
    const framework = diagnosis.framework || 'ESG';

    // Count only questions for this framework
    const frameworkPillars = framework === 'ESG_GRI'
      ? { in: ['ESG', 'GRI'] as string[] }
      : framework;

    const totalQuestions = await prisma.assessmentItem.count({
      where: {
        criteria: {
          theme: {
            pillar: typeof frameworkPillars === 'string'
              ? { framework: frameworkPillars }
              : { framework: frameworkPillars },
          },
        },
      },
    });

    const answeredQuestions = diagnosis.responses.length;
    const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return {
      total: totalQuestions,
      answered: answeredQuestions,
      remaining: totalQuestions - answeredQuestions,
      progress,
    };
  }

  async finalize(id: string, userId: string) {
    return this.complete(id, userId);
  }

  async getInsights(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    return this.insightsService.getInsights(id);
  }

  async getActionPlans(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    return this.actionPlanService.getActionPlan(id);
  }

  async updateActionStatus(actionId: number, status: string) {
    return this.actionPlanService.updateActionStatus(actionId, status);
  }

  async getSimulatedActions(id: string, userId: string) {
    const diagnosis = await prisma.diagnosis.findFirst({ where: { id, userId } });
    if (!diagnosis) throw new Error('Diagnóstico não encontrado');
    if (diagnosis.status !== 'completed') throw new Error('Diagnóstico ainda não foi concluído');
    return this.scoringService.simulateActionImpact(id);
  }

  async getBenchmarking(id: string, userId: string) {
    const diagnosis = await prisma.diagnosis.findFirst({ where: { id, userId } });
    if (!diagnosis) throw new Error('Diagnóstico não encontrado');
    if (diagnosis.status !== 'completed') throw new Error('Diagnóstico ainda não foi concluído');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.sector) return { insufficient: true, reason: 'Setor não informado no perfil' };

    const framework = diagnosis.framework || 'ESG';

    const sectorDiagnoses = await prisma.diagnosis.findMany({
      where: {
        status: 'completed',
        framework,
        user: { sector: user.sector, isActive: true },
      },
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { id: true } },
        pillarScores: { include: { pillar: true } },
      },
    });

    const seen = new Set<string>();
    const unique = sectorDiagnoses.filter(d => {
      if (seen.has(d.user.id)) return false;
      seen.add(d.user.id);
      return true;
    });

    if (unique.length < 3) {
      return { insufficient: true, reason: `Dados insuficientes (${unique.length} empresas no setor ${user.sector})` };
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const overalls = unique.map(d => Number(d.overallScore));

    const userOverall = Number(diagnosis.overallScore);
    const belowCount = overalls.filter(s => s < userOverall).length;
    const percentile = Math.round((belowCount / unique.length) * 100);

    const result: Record<string, unknown> = {
      insufficient: false,
      sector: user.sector,
      companiesCount: unique.length,
      userScores: {
        overall: userOverall,
        environmental: Number(diagnosis.environmentalScore),
        social: Number(diagnosis.socialScore),
        governance: Number(diagnosis.governanceScore),
      },
      sectorAverage: {
        overall: Math.round(avg(overalls) * 100) / 100,
      },
      percentile,
      sectorBest: Math.max(...overalls),
      sectorWorst: Math.min(...overalls),
    };

    // Add legacy ESG averages when applicable
    if (framework === 'ESG' || framework === 'ESG_GRI') {
      const envs = unique.map(d => Number(d.environmentalScore));
      const socs = unique.map(d => Number(d.socialScore));
      const govs = unique.map(d => Number(d.governanceScore));
      (result.sectorAverage as Record<string, number>).environmental = Math.round(avg(envs) * 100) / 100;
      (result.sectorAverage as Record<string, number>).social = Math.round(avg(socs) * 100) / 100;
      (result.sectorAverage as Record<string, number>).governance = Math.round(avg(govs) * 100) / 100;
    }

    return result;
  }

  async completeSimplified(id: string, userId: string, scores: Record<string, number>) {
    const diagnosis = await prisma.diagnosis.findFirst({
      where: { id, userId },
    });

    if (!diagnosis) {
      throw new Error('Diagnóstico não encontrado');
    }

    if (diagnosis.status === 'completed') {
      throw new Error('Diagnóstico já foi concluído');
    }

    const scoreValues = Object.values(scores);
    const overall = scoreValues.length > 0
      ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 100) / 100
      : 0;

    const updateData: Record<string, unknown> = {
      status: 'completed',
      completedAt: new Date(),
      overallScore: new Decimal(overall),
    };

    // Dual-write legacy columns for ESG
    if (scores.environmental !== undefined) updateData.environmentalScore = new Decimal(scores.environmental);
    if (scores.social !== undefined) updateData.socialScore = new Decimal(scores.social);
    if (scores.governance !== undefined) updateData.governanceScore = new Decimal(scores.governance);

    const updatedDiagnosis = await prisma.diagnosis.update({
      where: { id },
      data: updateData,
    });

    const framework = diagnosis.framework || 'ESG';
    const frameworkLabel = framework === 'GRI' ? 'GRI'
      : framework === 'ESG_GRI' ? 'ESG+GRI'
      : 'ESG';

    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'diagnosis_completed',
        description: `Diagnóstico ${frameworkLabel} simplificado concluído com score ${overall}`,
      },
    });

    return {
      diagnosis: updatedDiagnosis,
      scores: { ...scores, overall },
    };
  }

  async getPartialScores(id: string, userId: string) {
    const diagnosis = await this.getById(id, userId);
    const framework = diagnosis.framework || 'ESG';

    if (diagnosis.status === 'completed') {
      const overallScore = Number(diagnosis.overallScore);
      const certification = this.scoringService.getCertificationLevel(overallScore, framework);
      const themeScores = await this.scoringService.calculateThemeScores(id, framework);

      const pillarScores = await prisma.diagnosisScore.findMany({
        where: { diagnosisId: id },
        include: { pillar: true },
        orderBy: { pillar: { sortOrder: 'asc' } },
      });

      const result: Record<string, unknown> = {
        overall: overallScore,
        isPartial: false,
        certification,
        themeScores,
        pillarScores: pillarScores.map(ps => ({
          code: ps.pillar.code,
          name: ps.pillar.name,
          color: ps.pillar.color,
          score: Number(ps.score),
        })),
      };

      // Legacy fields
      result.environmental = Number(diagnosis.environmentalScore);
      result.social = Number(diagnosis.socialScore);
      result.governance = Number(diagnosis.governanceScore);

      return result;
    }

    const partialScores = await this.scoringService.calculatePartialScores(id);
    const certification = this.scoringService.getCertificationLevel(
      partialScores.overall as number,
      framework
    );

    return {
      ...partialScores,
      isPartial: true,
      certification,
    };
  }
}
