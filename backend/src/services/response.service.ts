import prisma from '../config/database';
import { evaluationValues } from '../utils/validators';
import { Decimal } from '@prisma/client/runtime/library';

interface ResponseData {
  assessmentItemId: number;
  evaluation: string;
  observations?: string | null;
}

export class ResponseService {
  /**
   * Garante que o diagnóstico pertence ao usuário autenticado
   */
  private async getOwnedDiagnosis(diagnosisId: string, userId: string) {
    const diagnosis = await prisma.diagnosis.findFirst({
      where: { id: diagnosisId, userId },
    });

    if (!diagnosis) {
      throw new Error('Diagnóstico não encontrado');
    }

    return diagnosis;
  }

  /**
   * Cria ou atualiza uma resposta
   */
  async upsert(diagnosisId: string, userId: string, data: ResponseData) {
    const diagnosis = await this.getOwnedDiagnosis(diagnosisId, userId);

    if (diagnosis.status === 'completed') {
      throw new Error('Não é possível modificar diagnóstico concluído');
    }

    // O demo do plano gratuito é respondido no frontend e finalizado via
    // complete-simplified; nenhuma resposta do questionário completo pode
    // ser gravada nele.
    if (diagnosis.type === 'demo') {
      throw new Error('O questionário completo está disponível apenas nos planos pagos');
    }

    // Calcular valor numérico da avaliação (escala de maturidade 0-5)
    const evaluationValue = evaluationValues[data.evaluation] || 0;
    const score = evaluationValue;

    // Criar ou atualizar resposta
    const response = await prisma.response.upsert({
      where: {
        diagnosisId_assessmentItemId: {
          diagnosisId,
          assessmentItemId: data.assessmentItemId,
        },
      },
      update: {
        evaluation: data.evaluation,
        evaluationValue,
        score: new Decimal(score),
        observations: data.observations,
      },
      create: {
        diagnosisId,
        assessmentItemId: data.assessmentItemId,
        evaluation: data.evaluation,
        evaluationValue,
        score: new Decimal(score),
        observations: data.observations,
      },
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
    });

    return response;
  }

  /**
   * Busca todas as respostas de um diagnóstico
   */
  async getByDiagnosisId(diagnosisId: string, userId: string) {
    await this.getOwnedDiagnosis(diagnosisId, userId);

    return prisma.response.findMany({
      where: { diagnosisId },
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
      orderBy: {
        assessmentItem: {
          order: 'asc',
        },
      },
    });
  }

  /**
   * Busca respostas por pilar
   */
  async getByPillar(diagnosisId: string, userId: string, pillarCode: string) {
    await this.getOwnedDiagnosis(diagnosisId, userId);

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

    // Obter IDs das questões deste pilar
    const assessmentItemIds: number[] = [];
    pillar.themes.forEach((theme) => {
      theme.criteria.forEach((criteria) => {
        criteria.assessmentItems.forEach((item) => {
          assessmentItemIds.push(item.id);
        });
      });
    });

    return prisma.response.findMany({
      where: {
        diagnosisId,
        assessmentItemId: { in: assessmentItemIds },
      },
      include: {
        assessmentItem: {
          include: {
            criteria: {
              include: {
                theme: true,
              },
            },
          },
        },
      },
      orderBy: {
        assessmentItem: {
          order: 'asc',
        },
      },
    });
  }
}
