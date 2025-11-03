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
   * Ordenadas por pilar (E→S→G), tema, critério e ordem
   */
  async getAllQuestions() {
    const questions = await prisma.assessmentItem.findMany({
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
    });

    // Ordenar manualmente para garantir ordem E→S→G
    const pillarOrder: { [key: string]: number } = {
      'E': 1,  // Environmental
      'S': 2,  // Social
      'G': 3,  // Governance
    };

    return questions.sort((a, b) => {
      const pillarA = pillarOrder[a.criteria.theme.pillar.code] || 999;
      const pillarB = pillarOrder[b.criteria.theme.pillar.code] || 999;

      // Primeiro ordena por pilar
      if (pillarA !== pillarB) {
        return pillarA - pillarB;
      }

      // Depois ordena por tema
      if (a.criteria.theme.order !== b.criteria.theme.order) {
        return a.criteria.theme.order - b.criteria.theme.order;
      }

      // Depois ordena por critério
      if (a.criteria.order !== b.criteria.order) {
        return a.criteria.order - b.criteria.order;
      }

      // Por fim ordena pela ordem da pergunta
      return a.order - b.order;
    });
  }
}
