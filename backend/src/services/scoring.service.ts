import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export class ScoringService {
  /**
   * Calcula o score de um pilar
   */
  async calculatePillarScore(diagnosisId: string, pillarCode: string): Promise<number> {
    // Buscar pillar
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

    // Obter todas as questões do pilar
    const assessmentItemIds: number[] = [];
    pillar.themes.forEach((theme) => {
      theme.criteria.forEach((criteria) => {
        criteria.assessmentItems.forEach((item) => {
          assessmentItemIds.push(item.id);
        });
      });
    });

    // Buscar respostas do diagnóstico para este pilar
    const responses = await prisma.response.findMany({
      where: {
        diagnosisId,
        assessmentItemId: { in: assessmentItemIds },
      },
    });

    if (responses.length === 0) {
      return 0;
    }

    // Calcular score usando apenas evaluationValue (1-5)
    let totalScore = 0;
    let validQuestions = 0;

    responses.forEach((response) => {
      // Ignorar "Não se aplica" (evaluationValue = 0)
      if (response.evaluation === 'Não se aplica' || response.evaluationValue === 0) {
        return;
      }

      totalScore += response.evaluationValue;
      validQuestions++;
    });

    if (validQuestions === 0) {
      return 0;
    }

    // Score máximo possível = validQuestions * 5 (nota máxima)
    const maxPossible = validQuestions * 5;
    const score = (totalScore / maxPossible) * 100;

    return Math.round(score * 100) / 100; // 2 casas decimais
  }

  /**
   * Calcula todos os scores de um diagnóstico
   */
  async calculateAllScores(diagnosisId: string) {
    const environmentalScore = await this.calculatePillarScore(diagnosisId, 'E');
    const socialScore = await this.calculatePillarScore(diagnosisId, 'S');
    const governanceScore = await this.calculatePillarScore(diagnosisId, 'G');

    const overallScore = (environmentalScore + socialScore + governanceScore) / 3;

    // Atualizar diagnóstico
    await prisma.diagnosis.update({
      where: { id: diagnosisId },
      data: {
        environmentalScore: new Decimal(environmentalScore),
        socialScore: new Decimal(socialScore),
        governanceScore: new Decimal(governanceScore),
        overallScore: new Decimal(Math.round(overallScore * 100) / 100),
      },
    });

    return {
      environmental: environmentalScore,
      social: socialScore,
      governance: governanceScore,
      overall: Math.round(overallScore * 100) / 100,
    };
  }

  /**
   * Classifica score por nível
   */
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

  /**
   * Retorna o nível de certificação ESG baseado na pontuação
   */
  getCertificationLevel(score: number): {
    level: 'bronze' | 'silver' | 'gold';
    name: string;
    title: string;
    message: string;
    color: string;
    scoreRange: string;
    characteristics: string[];
  } {
    if (score < 40) {
      return {
        level: 'bronze',
        name: 'Compromisso ESG',
        title: 'Fundamentos ESG',
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
        name: 'Integração ESG',
        title: 'Gestão ESG',
        message: 'Quem transforma intenções em práticas consistentes.',
        color: '#C0C0C0',
        scoreRange: '40-69',
        characteristics: [
          'Gestão integrada das dimensões ESG',
          'Políticas estruturadas e metas claras para reduzir impactos',
          'Indicadores ESG integrados ao planejamento estratégico',
          'Práticas de governança ativas, com transparência e compliance',
          'Comunicação interna e externa sobre ações e resultados ESG'
        ]
      };
    }

    return {
      level: 'gold',
      name: 'Liderança ESG',
      title: 'Excelência ESG',
      message: 'Quem inspira o mercado e multiplica o impacto positivo.',
      color: '#FFD700',
      scoreRange: '70-100',
      characteristics: [
        'Excelência em ESG com impacto positivo em todo ecossistema',
        'Estratégia ESG integrada à governança e cultura organizacional',
        'Relatórios públicos seguindo padrões reconhecidos (GRI, SASB, IFRS)',
        'Engajamento ativo com comunidades, fornecedores e stakeholders',
        'Referência setorial em inovação e impacto positivo',
        'Contribui para um futuro regenerativo e de baixo carbono'
      ]
    };
  }

  /**
   * Calcula scores parciais baseado nas respostas atuais (mesmo sem finalizar)
   */
  async calculatePartialScores(diagnosisId: string) {
    const environmentalScore = await this.calculatePillarScore(diagnosisId, 'E');
    const socialScore = await this.calculatePillarScore(diagnosisId, 'S');
    const governanceScore = await this.calculatePillarScore(diagnosisId, 'G');

    const overallScore = (environmentalScore + socialScore + governanceScore) / 3;

    // Contar respostas e total de questões
    const answeredCount = await prisma.response.count({
      where: { diagnosisId },
    });

    const totalCount = await prisma.assessmentItem.count();

    // Scores por tema para gráficos detalhados
    const themeScores = await this.calculateThemeScores(diagnosisId);

    return {
      environmental: environmentalScore,
      social: socialScore,
      governance: governanceScore,
      overall: Math.round(overallScore * 100) / 100,
      answeredCount,
      totalCount,
      themeScores,
    };
  }

  /**
   * Simula impacto de cada ação do plano no score
   * Para cada ação (que corresponde a uma resposta com evaluationValue=1),
   * calcula o que aconteceria se a resposta mudasse de 1→5
   */
  async simulateActionImpact(diagnosisId: string) {
    // 1. Buscar todos os pilares com hierarquia completa
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
        },
      },
    });

    // 2. Buscar todas as respostas do diagnóstico
    const responses = await prisma.response.findMany({
      where: { diagnosisId },
    });

    // 3. Construir mapa assessmentItemId → pillarCode
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

    // 4. Calcular totais atuais por pilar
    const pillarTotals: Record<string, { totalScore: number; validQuestions: number }> = {
      E: { totalScore: 0, validQuestions: 0 },
      S: { totalScore: 0, validQuestions: 0 },
      G: { totalScore: 0, validQuestions: 0 },
    };

    for (const resp of responses) {
      if (resp.evaluation === 'Não se aplica' || resp.evaluationValue === 0) continue;
      const pillarCode = itemToPillar[resp.assessmentItemId];
      if (pillarCode && pillarTotals[pillarCode]) {
        pillarTotals[pillarCode].totalScore += resp.evaluationValue;
        pillarTotals[pillarCode].validQuestions++;
      }
    }

    // Calcular scores atuais
    const currentScores: Record<string, number> = {};
    for (const code of ['E', 'S', 'G']) {
      const { totalScore, validQuestions } = pillarTotals[code];
      currentScores[code] = validQuestions > 0 ? (totalScore / (validQuestions * 5)) * 100 : 0;
    }
    const currentOverall = (currentScores['E'] + currentScores['S'] + currentScores['G']) / 3;
    const currentLevel = this.getCertificationLevel(currentOverall).level;

    // 5. Buscar ações do diagnóstico
    const actions = await prisma.actionPlan.findMany({
      where: { diagnosisId },
    });

    // 6. Construir mapa question → assessmentItemId para matching
    const questionToItem: Record<string, { id: number; pillarCode: string }> = {};
    for (const [idStr, question] of Object.entries(itemToQuestion)) {
      const id = Number(idStr);
      const pillarCode = itemToPillar[id];
      questionToItem[question] = { id, pillarCode };
    }

    // 7. Simular impacto de cada ação
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
      const match = questionToItem[action.title];
      if (!match) continue;

      const { pillarCode } = match;
      const { totalScore, validQuestions } = pillarTotals[pillarCode];
      if (validQuestions === 0) continue;

      // Simular: mudar resposta de 1→5 (+4 no total)
      const simulatedPillarScore = ((totalScore + 4) / (validQuestions * 5)) * 100;
      const scoreDelta = simulatedPillarScore - currentScores[pillarCode];

      // Recalcular overall com pilar simulado
      const scores = { ...currentScores };
      scores[pillarCode] = simulatedPillarScore;
      const simulatedOverall = (scores['E'] + scores['S'] + scores['G']) / 3;
      const simulatedLevel = this.getCertificationLevel(simulatedOverall).level;

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

  /**
   * Calcula scores por tema para gráficos detalhados
   */
  async calculateThemeScores(diagnosisId: string) {
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
        },
      },
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
