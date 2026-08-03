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

  async generateFullReport(diagnosisId: string, userId: string) {
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

    const framework = diagnosis.framework || 'ESG';
    const frameworkLabel = framework === 'GRI' ? 'GRI'
      : framework === 'ESG_GRI' ? 'ESG+GRI'
      : 'ESG';

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

    // Dynamic scores from pivot table
    const pillarScoreRecords = await prisma.diagnosisScore.findMany({
      where: { diagnosisId },
      include: { pillar: true },
      orderBy: { pillar: { sortOrder: 'asc' } },
    });

    const scores: Record<string, number> = {
      overall: Number(diagnosis.overallScore),
      environmental: Number(diagnosis.environmentalScore),
      social: Number(diagnosis.socialScore),
      governance: Number(diagnosis.governanceScore),
    };

    const certification = this.scoringService.getCertificationLevel(scores.overall, framework);
    const pillarBreakdowns = await this.getPillarBreakdowns(diagnosisId, framework);
    const insights = await this.insightsService.getInsights(diagnosisId);
    const actionPlans = await this.actionPlanService.getActionPlan(diagnosisId);

    const certificate = await prisma.certificate.findFirst({
      where: { diagnosisId },
    });

    const previousDiagnoses = await prisma.diagnosis.findMany({
      where: {
        userId,
        status: 'completed',
        framework,
        id: { not: diagnosisId },
      },
      orderBy: { completedAt: 'desc' },
      take: 3,
      include: {
        pillarScores: { include: { pillar: true } },
      },
    });

    const evolution = previousDiagnoses.map((d) => {
      const entry: Record<string, unknown> = {
        date: d.completedAt,
        overall: Number(d.overallScore),
      };
      for (const ps of d.pillarScores) {
        entry[ps.pillar.code] = Number(ps.score);
      }
      // Legacy
      entry.environmental = Number(d.environmentalScore);
      entry.social = Number(d.socialScore);
      entry.governance = Number(d.governanceScore);
      return entry;
    });

    return {
      reportDate: new Date(),
      diagnosisId,
      framework,
      frameworkLabel,
      completedAt: diagnosis.completedAt,
      companyInfo,
      scores,
      pillarScores: pillarScoreRecords.map(ps => ({
        code: ps.pillar.code,
        name: ps.pillar.name,
        color: ps.pillar.color,
        score: Number(ps.score),
      })),
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
      summary: this.generateExecutiveSummary(pillarBreakdowns, certification, frameworkLabel),
    };
  }

  private async getPillarBreakdowns(diagnosisId: string, framework: string = 'ESG'): Promise<PillarBreakdown[]> {
    const whereClause = framework === 'ESG_GRI'
      ? { framework: { in: ['ESG', 'GRI'] as string[] } }
      : { framework: framework === 'GRI' ? 'GRI' : 'ESG' };

    const pillars = await prisma.pillar.findMany({
      where: whereClause,
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
      orderBy: { sortOrder: 'asc' },
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

        if (percentage >= 80) {
          pillarStrengths.push(theme.name);
        } else if (percentage < 50) {
          pillarWeaknesses.push(theme.name);
        }
      }

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

  private generateExecutiveSummary(
    pillarBreakdowns: PillarBreakdown[],
    certification: ReturnType<ScoringService['getCertificationLevel']>,
    frameworkLabel: string = 'ESG'
  ) {
    const allStrengths = pillarBreakdowns.flatMap((p) =>
      p.strengths.map((s) => `${s} (${p.pillarName})`)
    );
    const allWeaknesses = pillarBreakdowns.flatMap((p) =>
      p.weaknesses.map((w) => `${w} (${p.pillarName})`)
    );

    const pillarScores = pillarBreakdowns.map(b => ({
      name: b.pillarName,
      code: b.pillarCode,
      score: b.score,
    }));

    const strongestPillar = pillarScores.reduce((a, b) => (a.score > b.score ? a : b));
    const weakestPillar = pillarScores.reduce((a, b) => (a.score < b.score ? a : b));

    const overallScore = pillarScores.length > 0
      ? pillarScores.reduce((sum, p) => sum + p.score, 0) / pillarScores.length
      : 0;

    return {
      overallAssessment: this.getOverallAssessment(overallScore, frameworkLabel),
      certificationLevel: certification.level,
      certificationName: certification.name,
      strongestPillar: strongestPillar.name,
      strongestPillarScore: strongestPillar.score,
      weakestPillar: weakestPillar.name,
      weakestPillarScore: weakestPillar.score,
      topStrengths: allStrengths.slice(0, 5),
      topWeaknesses: allWeaknesses.slice(0, 5),
      recommendation: this.getRecommendation(overallScore, weakestPillar),
    };
  }

  private getOverallAssessment(score: number, frameworkLabel: string = 'ESG'): string {
    if (score >= 85) {
      return `Sua empresa demonstra excelência em práticas ${frameworkLabel}, sendo referência no mercado. Continue investindo em inovação sustentável e compartilhando boas práticas.`;
    }
    if (score >= 70) {
      return `Sua empresa possui uma gestão ${frameworkLabel} sólida com resultados consistentes. Há oportunidades de melhoria para atingir a excelência.`;
    }
    if (score >= 50) {
      return `Sua empresa está no caminho certo com práticas ${frameworkLabel} em desenvolvimento. É necessário intensificar os esforços para uma gestão mais integrada.`;
    }
    if (score >= 30) {
      return `Sua empresa apresenta práticas ${frameworkLabel} iniciais. Recomenda-se priorizar ações estruturantes nos pilares mais críticos.`;
    }
    return `Sua empresa está no início da jornada ${frameworkLabel}. É fundamental implementar políticas básicas e criar uma cultura de sustentabilidade.`;
  }

  private getRecommendation(
    overallScore: number,
    weakestPillar: { name: string; code: string; score: number }
  ): string {
    const pillarRecommendations: Record<string, string> = {
      Ambiental: 'Implemente políticas de gestão ambiental, monitore indicadores de emissões, energia e resíduos.',
      Social: 'Fortaleça programas de diversidade, saúde ocupacional e engajamento com comunidades.',
      Governança: 'Estruture comitês de governança, políticas anticorrupção e mecanismos de transparência.',
      Universais: 'Documente detalhes organizacionais, estrutura de governança, políticas de remuneração e engajamento de stakeholders conforme GRI 2 e 3.',
      Econômico: 'Divulgue desempenho econômico, práticas de compras locais e políticas anticorrupção conforme padrões GRI.',
    };

    const rec = pillarRecommendations[weakestPillar.name] || `Foque em melhorar as práticas do pilar ${weakestPillar.name}.`;

    if (overallScore < 50) {
      return `Priorize ações no pilar ${weakestPillar.name} (score ${weakestPillar.score}). ${rec}`;
    }

    return `Para atingir o próximo nível de certificação, foque em melhorar o pilar ${weakestPillar.name}. ${rec}`;
  }

  async getReportForPDF(diagnosisId: string, userId: string) {
    const report = await this.generateFullReport(diagnosisId, userId);

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
