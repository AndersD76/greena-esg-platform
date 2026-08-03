import prisma from '../config/database';

export class PillarService {
  async list(framework?: string) {
    const where = framework
      ? framework === 'ESG_GRI'
        ? { framework: { in: ['ESG', 'GRI'] } }
        : { framework }
      : {};

    return prisma.pillar.findMany({
      where,
      include: {
        _count: {
          select: {
            themes: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

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

  async getAllQuestions(framework?: string) {
    const frameworkFilter = framework
      ? framework === 'ESG_GRI'
        ? { in: ['ESG', 'GRI'] as string[] }
        : framework
      : undefined;

    const questions = await prisma.assessmentItem.findMany({
      where: frameworkFilter
        ? {
            criteria: {
              theme: {
                pillar: typeof frameworkFilter === 'string'
                  ? { framework: frameworkFilter }
                  : { framework: frameworkFilter },
              },
            },
          }
        : undefined,
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

    return questions.sort((a, b) => {
      const pillarA = a.criteria.theme.pillar.sortOrder;
      const pillarB = b.criteria.theme.pillar.sortOrder;

      if (pillarA !== pillarB) return pillarA - pillarB;
      if (a.criteria.theme.order !== b.criteria.theme.order) {
        return a.criteria.theme.order - b.criteria.theme.order;
      }
      if (a.criteria.order !== b.criteria.order) {
        return a.criteria.order - b.criteria.order;
      }
      return a.order - b.order;
    });
  }
}
