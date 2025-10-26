import prisma from '../config/database';

export class PillarService {
  /**
   * Lista todos os pilares
   */
  async list() {
    return prisma.pillar.findMany({
      include: {
        _count: {
          select: {
            themes: true,
          },
        },
      },
    });
  }

  /**
   * Busca pilar por código com todas as questões
   */
  async getAssessment(code: string) {
    const pillar = await prisma.pillar.findUnique({
      where: { code },
      include: {
        themes: {
          include: {
            criteria: {
              include: {
                assessmentItems: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!pillar) {
      throw new Error('Pilar não encontrado');
    }

    // Contar total de questões
    let totalQuestions = 0;
    pillar.themes.forEach((theme) => {
      theme.criteria.forEach((criteria) => {
        totalQuestions += criteria.assessmentItems.length;
      });
    });

    return {
      ...pillar,
      totalQuestions,
    };
  }

  /**
   * Busca todas as questões (para uso em diagnósticos)
   */
  async getAllQuestions() {
    return prisma.assessmentItem.findMany({
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
      orderBy: { order: 'asc' },
    });
  }
}
