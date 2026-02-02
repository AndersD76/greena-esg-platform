import prisma from '../config/database';
import { ScoringService } from './scoring.service';
import { InsightsService } from './insights.service';
import { ActionPlanService } from './actionPlan.service';

interface ThemeScore {
  themeId: number;
  themeName: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsCount: number;
  answeredCount: number;
}

interface PillarBreakdown {
  pillarId: number;
  pillarCode: string;
  pillarName: string;
  score: number;
  themes: ThemeScore[];
  strengths: string[];
  weaknesses: string[];
}

export class ReportService {
  private scoringService: ScoringService;
  private insightsService: InsightsService;
  private actionPlanService: ActionPlanService;

  constructor() {
    this.scoringService = new ScoringService();
    this.insightsService = new InsightsService();
    this.actionPlanService = new ActionPlanService();
  }

  /**
   * Gera relatório completo do diagnóstico
   */
  async generateFullReport(diagnosisId: string, userId: string) {
    // Buscar diagnóstico com user
    const diagnosis = await prisma.diagnosis.findFirst({
      where: { id: diagnosisId, userId },
      include: {
        user: true,
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

    if (diagnosis.status !== 'completed') {
      throw new Error('Diagnóstico ainda não foi concluído');
    }

    // Dados da empresa
    const companyInfo = {
      name: diagnosis.user.companyName || diagnosis.user.name,
      cnpj: diagnosis.user.cnpj,
      city: diagnosis.user.city,
      sector: diagnosis.user.sector,
      size: diagnosis.user.companySize,
      employeesRange: diagnosis.user.employeesRange,
      responsiblePerson: diagnosis.user.responsiblePerson,
      responsibleContact: diagnosis.user.responsibleContact,
    };

    // Scores
    const scores = {
      overall: Number(diagnosis.overallScore),
      environmental: Number(diagnosis.environmentalScore),
      social: Number(diagnosis.socialScore),
      governance: Number(diagnosis.governanceScore),
    };

    // Certificação
    const certification = this.scoringService.getCertificationLevel(scores.overall);

    // Breakdown por pilar
    const pillarBreakdowns = await this.getPillarBreakdowns(diagnosisId);

    // Insights
    const insights = await this.insightsService.getInsights(diagnosisId);

    // Plano de ação
    const actionPlans = await this.actionPlanService.getActionPlan(diagnosisId);

    // Certificado (se existir)
    const certificate = await prisma.certificate.findFirst({
      where: { diagnosisId },
    });

    // Histórico de diagnósticos anteriores (para comparação)
    const previousDiagnoses = await prisma.diagnosis.findMany({
      where: {
        userId,
        status: 'completed',
        id: { not: diagnosisId },
      },
      orderBy: { completedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        overallScore: true,
        environmentalScore: true,
        socialScore: true,
        governanceScore: true,
        completedAt: true,
      },
    });

    const evolution = previousDiagnoses.map((d) => ({
      date: d.completedAt,
      overall: Number(d.overallScore),
      environmental: Number(d.environmentalScore),
      social: Number(d.socialScore),
      governance: Number(d.governanceScore),
    }));

    return {
      reportDate: new Date(),
      diagnosisId,
      completedAt: diagnosis.completedAt,
      companyInfo,
      scores,
      certification,
      pillarBreakdowns,
      insights,
      actionPlans,
      certificate: certificate
        ? {
            number: certificate.certificateNumber,
            level: certificate.level,
            issuedAt: certificate.issuedAt,
            expiresAt: certificate.expiresAt,
            isValid: certificate.isValid,
          }
        : null,
      evolution,
      summary: this.generateExecutiveSummary(scores, certification, pillarBreakdowns),
    };
  }

  /**
   * Calcula breakdown detalhado por pilar e tema
   */
  private async getPillarBreakdowns(diagnosisId: string): Promise<PillarBreakdown[]> {
    const pillars = await prisma.pillar.findMany({
      include: {
        themes: {
          include: {
            criteria: {
              include: {
                assessmentItems: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    const breakdowns: PillarBreakdown[] = [];

    for (const pillar of pillars) {
      const themes: ThemeScore[] = [];
      let pillarStrengths: string[] = [];
      let pillarWeaknesses: string[] = [];

      for (const theme of pillar.themes) {
        const assessmentItemIds = theme.criteria.flatMap((c) =>
          c.assessmentItems.map((a) => a.id)
        );

        const responses = await prisma.response.findMany({
          where: {
            diagnosisId,
            assessmentItemId: { in: assessmentItemIds },
          },
          include: {
            assessmentItem: true,
          },
        });

        // Filtrar respostas válidas (excluir "Não se aplica")
        const validResponses = responses.filter(
          (r) => r.evaluation !== 'Não se aplica' && r.evaluationValue > 0
        );

        const totalScore = validResponses.reduce((sum, r) => sum + r.evaluationValue, 0);
        const maxScore = validResponses.length * 5;
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        themes.push({
          themeId: theme.id,
          themeName: theme.name,
          score: totalScore,
          maxScore,
          percentage: Math.round(percentage * 100) / 100,
          questionsCount: assessmentItemIds.length,
          answeredCount: responses.length,
        });

        // Identificar pontos fortes e fracos
        if (percentage >= 80) {
          pillarStrengths.push(theme.name);
        } else if (percentage < 50) {
          pillarWeaknesses.push(theme.name);
        }
      }

      // Calcular score do pilar
      const pillarScore = await this.scoringService.calculatePillarScore(
        diagnosisId,
        pillar.code
      );

      breakdowns.push({
        pillarId: pillar.id,
        pillarCode: pillar.code,
        pillarName: pillar.name,
        score: pillarScore,
        themes,
        strengths: pillarStrengths,
        weaknesses: pillarWeaknesses,
      });
    }

    return breakdowns;
  }

  /**
   * Gera sumário executivo
   */
  private generateExecutiveSummary(
    scores: { overall: number; environmental: number; social: number; governance: number },
    certification: ReturnType<ScoringService['getCertificationLevel']>,
    pillarBreakdowns: PillarBreakdown[]
  ) {
    const allStrengths = pillarBreakdowns.flatMap((p) =>
      p.strengths.map((s) => `${s} (${p.pillarName})`)
    );
    const allWeaknesses = pillarBreakdowns.flatMap((p) =>
      p.weaknesses.map((w) => `${w} (${p.pillarName})`)
    );

    // Pilar mais forte e mais fraco
    const pillarScores = [
      { name: 'Ambiental', code: 'E', score: scores.environmental },
      { name: 'Social', code: 'S', score: scores.social },
      { name: 'Governança', code: 'G', score: scores.governance },
    ];
    const strongestPillar = pillarScores.reduce((a, b) => (a.score > b.score ? a : b));
    const weakestPillar = pillarScores.reduce((a, b) => (a.score < b.score ? a : b));

    return {
      overallAssessment: this.getOverallAssessment(scores.overall),
      certificationLevel: certification.level,
      certificationName: certification.name,
      strongestPillar: strongestPillar.name,
      strongestPillarScore: strongestPillar.score,
      weakestPillar: weakestPillar.name,
      weakestPillarScore: weakestPillar.score,
      topStrengths: allStrengths.slice(0, 5),
      topWeaknesses: allWeaknesses.slice(0, 5),
      recommendation: this.getRecommendation(scores.overall, weakestPillar),
    };
  }

  /**
   * Avaliação geral baseada no score
   */
  private getOverallAssessment(score: number): string {
    if (score >= 85) {
      return 'Sua empresa demonstra excelência em práticas ESG, sendo referência no mercado. Continue investindo em inovação sustentável e compartilhando boas práticas.';
    }
    if (score >= 70) {
      return 'Sua empresa possui uma gestão ESG sólida com resultados consistentes. Há oportunidades de melhoria para atingir a excelência.';
    }
    if (score >= 50) {
      return 'Sua empresa está no caminho certo com práticas ESG em desenvolvimento. É necessário intensificar os esforços para uma gestão mais integrada.';
    }
    if (score >= 30) {
      return 'Sua empresa apresenta práticas ESG iniciais. Recomenda-se priorizar ações estruturantes nos pilares mais críticos.';
    }
    return 'Sua empresa está no início da jornada ESG. É fundamental implementar políticas básicas e criar uma cultura de sustentabilidade.';
  }

  /**
   * Recomendação principal
   */
  private getRecommendation(
    overallScore: number,
    weakestPillar: { name: string; code: string; score: number }
  ): string {
    const pillarRecommendations: Record<string, string> = {
      Ambiental:
        'Implemente políticas de gestão ambiental, monitore indicadores de emissões, energia e resíduos.',
      Social:
        'Fortaleça programas de diversidade, saúde ocupacional e engajamento com comunidades.',
      Governança:
        'Estruture comitês de governança, políticas anticorrupção e mecanismos de transparência.',
    };

    if (overallScore < 50) {
      return `Priorize ações no pilar ${weakestPillar.name} (score ${weakestPillar.score}). ${pillarRecommendations[weakestPillar.name]}`;
    }

    return `Para atingir o próximo nível de certificação, foque em melhorar o pilar ${weakestPillar.name}. ${pillarRecommendations[weakestPillar.name]}`;
  }

  /**
   * Gera dados para exportação PDF
   */
  async getReportForPDF(diagnosisId: string, userId: string) {
    const report = await this.generateFullReport(diagnosisId, userId);

    // Formatar para PDF
    return {
      ...report,
      formattedDate: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      completedDate: report.completedAt
        ? new Date(report.completedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : null,
    };
  }
}
