import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

const LEGACY_PILLAR_MAP: Record<string, string> = {
  E: 'environmentalScore',
  S: 'socialScore',
  G: 'governanceScore',
};

export class ScoringService {
  async calculatePillarScore(diagnosisId: string, pillarCode: string): Promise<number> {
    const pillar = await prisma.pillar.findUnique({
      where: { code: pillarCode },
      include: {
        themes: {
          include: {
            criteria: {
              include: {
                assessmentItems: true,
              },
            },
          },
        },
      },
    });

    if (!pillar) {
      throw new Error('Pilar não encontrado');
    }

    const assessmentItemIds: number[] = [];
    pillar.themes.forEach((theme) => {
      theme.criteria.forEach((criteria) => {
        criteria.assessmentItems.forEach((item) => {
          assessmentItemIds.push(item.id);
        });
      });
    });

    const responses = await prisma.response.findMany({
      where: {
        diagnosisId,
        assessmentItemId: { in: assessmentItemIds },
      },
    });

    if (responses.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let validQuestions = 0;

    responses.forEach((response) => {
      if (response.evaluation === 'Não se aplica' || response.evaluationValue === 0) {
        return;
      }

      totalScore += response.evaluationValue;
      validQuestions++;
    });

    if (validQuestions === 0) {
      return 0;
    }

    const maxPossible = validQuestions * 5;
    const score = (totalScore / maxPossible) * 100;

    return Math.round(score * 100) / 100;
  }

  private async getPillarsForFramework(framework: string) {
    if (framework === 'ESG_GRI') {
      return prisma.pillar.findMany({
        where: { framework: { in: ['ESG', 'GRI'] } },
        orderBy: { sortOrder: 'asc' },
      });
    }
    return prisma.pillar.findMany({
      where: { framework: framework === 'GRI' ? 'GRI' : 'ESG' },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async calculateAllScores(diagnosisId: string) {
    const diagnosis = await prisma.diagnosis.findUnique({ where: { id: diagnosisId } });
    if (!diagnosis) throw new Error('Diagnóstico não encontrado');

    const framework = diagnosis.framework || 'ESG';
    const pillars = await this.getPillarsForFramework(framework);

    const pillarScores: Record<string, number> = {};
    for (const pillar of pillars) {
      const score = await this.calculatePillarScore(diagnosisId, pillar.code);
      pillarScores[pillar.code] = score;

      await prisma.diagnosisScore.upsert({
        where: {
          diagnosisId_pillarId: { diagnosisId, pillarId: pillar.id },
        },
        update: { score: new Decimal(score) },
        create: {
          diagnosisId,
          pillarId: pillar.id,
          score: new Decimal(score),
        },
      });
    }

    const scores = Object.values(pillarScores);
    const overallScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0;

    // Dual-write: legacy columns for ESG/ESG_GRI
    const legacyData: Record<string, Decimal> = {
      overallScore: new Decimal(overallScore),
    };
    if (framework === 'ESG' || framework === 'ESG_GRI') {
      for (const [code, field] of Object.entries(LEGACY_PILLAR_MAP)) {
        if (pillarScores[code] !== undefined) {
          legacyData[field] = new Decimal(pillarScores[code]);
        }
      }
    }

    await prisma.diagnosis.update({
      where: { id: diagnosisId },
      data: legacyData,
    });

    const result: Record<string, number> = { overall: overallScore };
    for (const pillar of pillars) {
      result[pillar.code] = pillarScores[pillar.code];
    }
    return result;
  }

  getScoreLevel(score: number): {
    level: string;
    label: string;
    color: string;
  } {
    if (score < 26) {
      return { level: 'critical', label: 'Crítico', color: '#DC2626' };
    }
    if (score < 51) {
      return { level: 'attention', label: 'Atenção', color: '#F59E0B' };
    }
    if (score < 71) {
      return { level: 'good', label: 'Bom', color: '#FCD34D' };
    }
    if (score < 86) {
      return { level: 'very-good', label: 'Muito Bom', color: '#84CC16' };
    }
    return { level: 'excellent', label: 'Excelente', color: '#22C55E' };
  }

  getCertificationLevel(score: number, framework: string = 'ESG'): {
    level: 'bronze' | 'silver' | 'gold';
    name: string;
    title: string;
    message: string;
    color: string;
    scoreRange: string;
    characteristics: string[];
  } {
    const frameworkLabel = framework === 'GRI' ? 'GRI'
      : framework === 'ESG_GRI' ? 'ESG+GRI'
      : 'ESG';

    if (score < 40) {
      return {
        level: 'bronze',
        name: `Compromisso ${frameworkLabel}`,
        title: `Fundamentos ${frameworkLabel}`,
        message: 'Quem dá o primeiro passo na transformação sustentável.',
        color: '#CD7F32',
        scoreRange: '0-39',
        characteristics: [
          'Atua na conformidade básica legal e regulatória',
          'Possui políticas iniciais ou ações pontuais de sustentabilidade',
          'Liderança comprometida com o tema, mas ainda sem integração estratégica',
          'Iniciou sua trajetória rumo à sustentabilidade corporativa'
        ]
      };
    }

    if (score < 70) {
      return {
        level: 'silver',
        name: `Integração ${frameworkLabel}`,
        title: `Gestão ${frameworkLabel}`,
        message: 'Quem transforma intenções em práticas consistentes.',
        color: '#C0C0C0',
        scoreRange: '40-69',
        characteristics: [
          `Gestão integrada das dimensões ${frameworkLabel}`,
          'Políticas estruturadas e metas claras para reduzir impactos',
          `Indicadores ${frameworkLabel} integrados ao planejamento estratégico`,
          'Práticas de governança ativas, com transparência e compliance',
          `Comunicação interna e externa sobre ações e resultados ${frameworkLabel}`
        ]
      };
    }

    return {
      level: 'gold',
      name: `Liderança ${frameworkLabel}`,
      title: `Excelência ${frameworkLabel}`,
      message: 'Quem inspira o mercado e multiplica o impacto positivo.',
      color: '#FFD700',
      scoreRange: '70-100',
      characteristics: [
        `Excelência em ${frameworkLabel} com impacto positivo em todo ecossistema`,
        `Estratégia ${frameworkLabel} integrada à governança e cultura organizacional`,
        'Relatórios públicos seguindo padrões reconhecidos (GRI, SASB, IFRS)',
        'Engajamento ativo com comunidades, fornecedores e stakeholders',
        'Referência setorial em inovação e impacto positivo',
        'Contribui para um futuro regenerativo e de baixo carbono'
      ]
    };
  }

  async calculatePartialScores(diagnosisId: string) {
    const diagnosis = await prisma.diagnosis.findUnique({ where: { id: diagnosisId } });
    if (!diagnosis) throw new Error('Diagnóstico não encontrado');

    const framework = diagnosis.framework || 'ESG';
    const pillars = await this.getPillarsForFramework(framework);

    const pillarScores: Record<string, number> = {};
    for (const pillar of pillars) {
      pillarScores[pillar.code] = await this.calculatePillarScore(diagnosisId, pillar.code);
    }

    const scores = Object.values(pillarScores);
    const overallScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0;

    const answeredCount = await prisma.response.count({
      where: { diagnosisId },
    });

    const pillarIds = pillars.map(p => p.id);
    const totalCount = await prisma.assessmentItem.count({
      where: {
        criteria: {
          theme: {
            pillarId: { in: pillarIds },
          },
        },
      },
    });

    const themeScores = await this.calculateThemeScores(diagnosisId, framework);

    const result: Record<string, unknown> = {
      overall: overallScore,
      answeredCount,
      totalCount,
      themeScores,
      pillarScores: pillars.map(p => ({
        code: p.code,
        name: p.name,
        color: p.color,
        score: pillarScores[p.code],
      })),
    };

    // Legacy fields for backward compat
    if (framework === 'ESG' || framework === 'ESG_GRI') {
      result.environmental = pillarScores['E'] ?? 0;
      result.social = pillarScores['S'] ?? 0;
      result.governance = pillarScores['G'] ?? 0;
    }

    return result;
  }

  async simulateActionImpact(diagnosisId: string) {
    const diagnosis = await prisma.diagnosis.findUnique({ where: { id: diagnosisId } });
    if (!diagnosis) throw new Error('Diagnóstico não encontrado');

    const framework = diagnosis.framework || 'ESG';
    const frameworkPillars = await this.getPillarsForFramework(framework);
    const pillarCodes: Set<string> = new Set(frameworkPillars.map(p => p.code));

    const pillars = await prisma.pillar.findMany({
      where: { code: { in: [...pillarCodes] } },
      include: {
        themes: {
          include: {
            criteria: {
              include: {
                assessmentItems: true,
              },
            },
          },
        },
      },
    });

    const responses = await prisma.response.findMany({
      where: { diagnosisId },
    });

    const itemToPillar: Record<number, string> = {};
    const itemToQuestion: Record<number, string> = {};
    for (const pillar of pillars) {
      for (const theme of pillar.themes) {
        for (const criteria of theme.criteria) {
          for (const item of criteria.assessmentItems) {
            itemToPillar[item.id] = pillar.code;
            itemToQuestion[item.id] = item.question;
          }
        }
      }
    }

    const pillarTotals: Record<string, { totalScore: number; validQuestions: number }> = {};
    for (const code of pillarCodes) {
      pillarTotals[code] = { totalScore: 0, validQuestions: 0 };
    }

    for (const resp of responses) {
      if (resp.evaluation === 'Não se aplica' || resp.evaluationValue === 0) continue;
      const pillarCode = itemToPillar[resp.assessmentItemId];
      if (pillarCode && pillarTotals[pillarCode]) {
        pillarTotals[pillarCode].totalScore += resp.evaluationValue;
        pillarTotals[pillarCode].validQuestions++;
      }
    }

    const currentScores: Record<string, number> = {};
    for (const code of pillarCodes) {
      const { totalScore, validQuestions } = pillarTotals[code];
      currentScores[code] = validQuestions > 0 ? (totalScore / (validQuestions * 5)) * 100 : 0;
    }

    const allScoreValues = Object.values(currentScores);
    const currentOverall = allScoreValues.length > 0
      ? allScoreValues.reduce((a, b) => a + b, 0) / allScoreValues.length
      : 0;
    const currentLevel = this.getCertificationLevel(currentOverall, framework).level;

    const actions = await prisma.actionPlan.findMany({
      where: { diagnosisId },
    });

    const questionItems: Array<{ question: string; id: number; pillarCode: string }> = [];
    for (const [idStr, question] of Object.entries(itemToQuestion)) {
      const id = Number(idStr);
      const pillarCode = itemToPillar[id];
      questionItems.push({ question, id, pillarCode });
    }

    const simulations: Array<{
      actionId: number;
      pillarCode: string;
      scoreDelta: number;
      simulatedPillarScore: number;
      simulatedOverall: number;
      currentLevel: string;
      simulatedLevel: string;
    }> = [];

    for (const action of actions) {
      const cleanTitle = action.title.replace(/^\d+\.\s*(Implementar:\s*)?/, '').replace(/\.{3}$/, '');
      const match = questionItems.find(q => q.question === cleanTitle || q.question === action.title || q.question.startsWith(cleanTitle));
      if (!match) continue;

      const { pillarCode } = match;
      const { totalScore, validQuestions } = pillarTotals[pillarCode];
      if (validQuestions === 0) continue;

      const simulatedPillarScore = ((totalScore + 4) / (validQuestions * 5)) * 100;
      const scoreDelta = simulatedPillarScore - currentScores[pillarCode];

      const scores = { ...currentScores };
      scores[pillarCode] = simulatedPillarScore;
      const allSimScores = Object.values(scores);
      const simulatedOverall = allSimScores.reduce((a, b) => a + b, 0) / allSimScores.length;
      const simulatedLevel = this.getCertificationLevel(simulatedOverall, framework).level;

      simulations.push({
        actionId: action.id,
        pillarCode,
        scoreDelta: Math.round(scoreDelta * 10) / 10,
        simulatedPillarScore: Math.round(simulatedPillarScore * 10) / 10,
        simulatedOverall: Math.round(simulatedOverall * 10) / 10,
        currentLevel,
        simulatedLevel,
      });
    }

    return simulations;
  }

  async calculateThemeScores(diagnosisId: string, framework?: string) {
    const whereClause = framework
      ? { framework: framework === 'ESG_GRI' ? undefined : framework }
      : {};

    const pillars = await prisma.pillar.findMany({
      where: framework === 'ESG_GRI'
        ? { framework: { in: ['ESG', 'GRI'] } }
        : whereClause,
      include: {
        themes: {
          include: {
            criteria: {
              include: {
                assessmentItems: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const results: Array<{
      pillarCode: string;
      pillarName: string;
      themeName: string;
      score: number;
      answeredCount: number;
      totalCount: number;
    }> = [];

    for (const pillar of pillars) {
      for (const theme of pillar.themes) {
        const itemIds: number[] = [];
        theme.criteria.forEach((c) => {
          c.assessmentItems.forEach((item) => {
            itemIds.push(item.id);
          });
        });

        const responses = await prisma.response.findMany({
          where: {
            diagnosisId,
            assessmentItemId: { in: itemIds },
          },
        });

        let totalScore = 0;
        let validCount = 0;
        responses.forEach((r) => {
          if (r.evaluation !== 'Não se aplica' && r.evaluationValue !== 0) {
            totalScore += r.evaluationValue;
            validCount++;
          }
        });

        const score = validCount > 0 ? (totalScore / (validCount * 5)) * 100 : 0;

        results.push({
          pillarCode: pillar.code,
          pillarName: pillar.name,
          themeName: theme.name,
          score: Math.round(score * 100) / 100,
          answeredCount: responses.length,
          totalCount: itemIds.length,
        });
      }
    }

    return results;
  }
}
