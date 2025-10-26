import prisma from '../config/database';
import { importanceValues, evaluationValues } from '../utils/validators';
import { Decimal } from '@prisma/client/runtime/library';

interface ResponseData {
  assessmentItemId: number;
  importance: string;
  evaluation: string;
  observations?: string;
}

export class ResponseService {
  /**
   * Cria ou atualiza uma resposta
   */
  async upsert(diagnosisId: string, data: ResponseData) {
    // Verificar se diagnóstico existe e está em progresso
    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id: diagnosisId },
    });

    if (!diagnosis) {
      throw new Error('Diagnóstico não encontrado');
    }

    if (diagnosis.status === 'completed') {
      throw new Error('Não é possível modificar diagnóstico concluído');
    }

    // Calcular valores numéricos
    const importanceValue = importanceValues[data.importance];
    const evaluationValue = evaluationValues[data.evaluation];
    const score = importanceValue * evaluationValue;

    // Criar ou atualizar resposta
    const response = await prisma.response.upsert({
      where: {
        diagnosisId_assessmentItemId: {
          diagnosisId,
          assessmentItemId: data.assessmentItemId,
        },
      },
      update: {
        importance: data.importance,
        importanceValue,
        evaluation: data.evaluation,
        evaluationValue,
        score: new Decimal(score),
        observations: data.observations,
      },
      create: {
        diagnosisId,
        assessmentItemId: data.assessmentItemId,
        importance: data.importance,
        importanceValue,
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
  async getByDiagnosisId(diagnosisId: string) {
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
  async getByPillar(diagnosisId: string, pillarCode: string) {
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
