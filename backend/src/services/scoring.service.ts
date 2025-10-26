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

    // Calcular score
    let totalScore = 0;
    let validQuestions = 0;

    responses.forEach((response) => {
      // Ignorar "Não se aplica"
      if (response.evaluation === 'Não se aplica') {
        return;
      }

      totalScore += response.importanceValue * response.evaluationValue;
      validQuestions++;
    });

    if (validQuestions === 0) {
      return 0;
    }

    const maxPossible = validQuestions * 81; // 9 × 9
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
}
