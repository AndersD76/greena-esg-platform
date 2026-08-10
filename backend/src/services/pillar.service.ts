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
    if (framework === 'ESG_GRI') {
      return this.getAllQuestionsEsgGri();
    }

    const frameworkFilter = framework ? framework : undefined;

    const questions = await prisma.assessmentItem.findMany({
      where: frameworkFilter
        ? { criteria: { theme: { pillar: { framework: frameworkFilter } } } }
        : undefined,
      include: {
        criteria: {
          include: {
            theme: { include: { pillar: true } },
          },
        },
      },
    });

    return this.sortQuestions(questions);
  }

  private async getAllQuestionsEsgGri() {
    const esgQuestions = await prisma.assessmentItem.findMany({
      where: { criteria: { theme: { pillar: { framework: 'ESG' } } } },
      include: {
        criteria: {
          include: {
            theme: { include: { pillar: true } },
          },
        },
        esgMappings: {
          include: {
            griItem: {
              include: {
                criteria: {
                  include: {
                    theme: { include: { pillar: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const mappedGriIds = new Set<number>();
    for (const q of esgQuestions) {
      for (const m of q.esgMappings) {
        mappedGriIds.add(m.griAssessmentItemId);
      }
    }

    const griOnlyQuestions = await prisma.assessmentItem.findMany({
      where: {
        criteria: { theme: { pillar: { framework: 'GRI' } } },
        id: { notIn: [...mappedGriIds] },
      },
      include: {
        criteria: {
          include: {
            theme: { include: { pillar: true } },
          },
        },
      },
    });

    const enriched = esgQuestions.map(q => ({
      ...q,
      griItems: q.esgMappings.map(m => m.griItem),
      esgMappings: undefined,
    }));

    const sorted = this.sortQuestions(enriched);
    const sortedGriOnly = this.sortQuestions(griOnlyQuestions);

    return [...sorted, ...sortedGriOnly];
  }

  private sortQuestions<T extends { criteria: { theme: { pillar: { sortOrder: number }; order: number }; order: number }; order: number }>(questions: T[]): T[] {
    return questions.sort((a, b) => {
      const pillarA = a.criteria.theme.pillar.sortOrder;
      const pillarB = b.criteria.theme.pillar.sortOrder;
      if (pillarA !== pillarB) return pillarA - pillarB;
      if (a.criteria.theme.order !== b.criteria.theme.order) return a.criteria.theme.order - b.criteria.theme.order;
      if (a.criteria.order !== b.criteria.order) return a.criteria.order - b.criteria.order;
      return a.order - b.order;
    });
  }
}
