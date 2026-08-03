import prisma from '../config/database';
import { ScoringService } from './scoring.service';

interface InsightTemplate {
  critical: { title: string; description: (score: number) => string };
  attention: { title: string; description: string };
  excellent: { title: string; description: (score: number) => string };
}

const PILLAR_INSIGHTS: Record<string, InsightTemplate> = {
  E: {
    critical: {
      title: 'Gestão Ambiental Urgente',
      description: (score) => `Implementação urgente de políticas ambientais necessária. Potencial de melhoria de até ${Math.round(100 - score)} pontos no score, com ações específicas de gestão de emissões, energia e resíduos.`,
    },
    attention: {
      title: 'Políticas Ambientais Parciais',
      description: 'Políticas ambientais parcialmente implementadas. Recomendamos expansão das iniciativas com foco em eficiência energética e gestão de resíduos nos próximos 90 dias.',
    },
    excellent: {
      title: 'Destaque em Sustentabilidade Ambiental',
      description: (score) => `Parabéns! Suas práticas ambientais estão ${Math.round(score - 70)}% acima da média. Continue investindo em inovação verde e economia circular.`,
    },
  },
  S: {
    critical: {
      title: 'Responsabilidade Social Crítica',
      description: () => 'Implementação urgente de políticas sociais e de direitos humanos necessária. Foco em diversidade, saúde ocupacional e desenvolvimento de colaboradores.',
    },
    attention: {
      title: 'Diversidade e Inclusão',
      description: 'Políticas de diversidade parcialmente implementadas. Recomendamos expansão das iniciativas com foco em representatividade em cargos executivos.',
    },
    excellent: {
      title: 'Excelência em Responsabilidade Social',
      description: () => 'Parabéns! Suas práticas sociais são referência. Continue investindo em bem-estar dos colaboradores e impacto comunitário.',
    },
  },
  G: {
    critical: {
      title: 'Governança e Compliance Urgente',
      description: () => 'Implementação urgente de estruturas de governança e compliance necessária. Foco em transparência, ética e gestão de riscos.',
    },
    attention: {
      title: 'Governança em Desenvolvimento',
      description: 'Estruturas de governança parcialmente implementadas. Recomendamos fortalecimento de compliance e transparência.',
    },
    excellent: {
      title: 'Excelência em Governança',
      description: () => 'Parabéns! Suas práticas de ética e transparência estão acima da média do mercado. Continue investindo em compliance e comunicação transparente.',
    },
  },
  'GRI-U': {
    critical: {
      title: 'Divulgações Universais Insuficientes',
      description: (score) => `Sua organização reporta apenas ${Math.round(score)}% dos conteúdos gerais do GRI. Priorize a divulgação de detalhes organizacionais, governança e engajamento de stakeholders.`,
    },
    attention: {
      title: 'Divulgações Universais Parciais',
      description: 'Os conteúdos gerais do GRI estão parcialmente reportados. Avance na documentação de políticas de remuneração, conflitos de interesse e tópicos materiais.',
    },
    excellent: {
      title: 'Conteúdos Universais GRI Exemplares',
      description: () => 'Excelente aderência aos conteúdos gerais GRI. Sua transparência organizacional é referência para o setor.',
    },
  },
  'GRI-E': {
    critical: {
      title: 'Divulgações Ambientais GRI Críticas',
      description: (score) => `Apenas ${Math.round(score)}% dos indicadores ambientais GRI estão reportados. Priorize emissões de GEE, gestão de energia, água e resíduos.`,
    },
    attention: {
      title: 'Indicadores Ambientais GRI Parciais',
      description: 'Indicadores ambientais parcialmente divulgados. Recomendamos completar reportes de biodiversidade, energia e cadeia de fornecedores.',
    },
    excellent: {
      title: 'Excelência em Indicadores Ambientais GRI',
      description: () => 'Parabéns! Sua divulgação ambiental atende plenamente os padrões GRI. Mantenha a qualidade e explore divulgações setoriais.',
    },
  },
  'GRI-S': {
    critical: {
      title: 'Divulgações Sociais GRI Críticas',
      description: () => 'Indicadores sociais GRI insuficientes. Priorize emprego, saúde e segurança, diversidade e avaliação de fornecedores.',
    },
    attention: {
      title: 'Indicadores Sociais GRI Parciais',
      description: 'Divulgações sociais parciais. Avance em capacitação, comunidades locais e privacidade do cliente.',
    },
    excellent: {
      title: 'Excelência em Indicadores Sociais GRI',
      description: () => 'Suas práticas sociais atendem plenamente os padrões GRI. Referência em emprego, diversidade e engajamento comunitário.',
    },
  },
  'GRI-EC': {
    critical: {
      title: 'Divulgações Econômicas GRI Críticas',
      description: () => 'Indicadores econômicos GRI insuficientes. Priorize desempenho econômico, práticas de compras e combate à corrupção.',
    },
    attention: {
      title: 'Indicadores Econômicos GRI Parciais',
      description: 'Divulgações econômicas parciais. Avance em presença no mercado e impactos econômicos indiretos.',
    },
    excellent: {
      title: 'Excelência em Indicadores Econômicos GRI',
      description: () => 'Parabéns! Divulgação econômica completa e aderente ao GRI. Continue mantendo a transparência financeira e anticorrupção.',
    },
  },
};

export class InsightsService {
  private scoringService: ScoringService;

  constructor() {
    this.scoringService = new ScoringService();
  }

  async generateInsights(diagnosisId: string) {
    const scores = await this.scoringService.calculateAllScores(diagnosisId);

    const diagnosis = await prisma.diagnosis.findUnique({ where: { id: diagnosisId } });
    const framework = diagnosis?.framework || 'ESG';
    const frameworkLabel = framework === 'GRI' ? 'GRI'
      : framework === 'ESG_GRI' ? 'ESG+GRI'
      : 'ESG';

    const pillars = await prisma.pillar.findMany({
      where: framework === 'ESG_GRI'
        ? { framework: { in: ['ESG', 'GRI'] } }
        : { framework: framework === 'GRI' ? 'GRI' : 'ESG' },
      orderBy: { sortOrder: 'asc' },
    });

    const insights: Array<{
      category: string;
      categoryLabel: string;
      title: string;
      description: string;
      pillarId?: number;
    }> = [];

    for (const pillar of pillars) {
      const pillarScore = scores[pillar.code];
      if (pillarScore === undefined) continue;

      const template = PILLAR_INSIGHTS[pillar.code];
      if (!template) continue;

      if (pillarScore < 50) {
        const desc = typeof template.critical.description === 'function'
          ? template.critical.description(pillarScore)
          : template.critical.description;
        insights.push({
          category: 'critical',
          categoryLabel: 'Crítico',
          title: template.critical.title,
          description: desc,
          pillarId: pillar.id,
        });
      } else if (pillarScore < 70) {
        insights.push({
          category: 'attention',
          categoryLabel: 'Atenção',
          title: template.attention.title,
          description: template.attention.description,
          pillarId: pillar.id,
        });
      } else if (pillarScore > 85) {
        const desc = typeof template.excellent.description === 'function'
          ? template.excellent.description(pillarScore)
          : template.excellent.description;
        insights.push({
          category: 'excellent',
          categoryLabel: 'Excelente',
          title: template.excellent.title,
          description: desc,
          pillarId: pillar.id,
        });
      }
    }

    // Overall insight
    if (scores.overall < 50) {
      insights.push({
        category: 'critical',
        categoryLabel: 'Crítico',
        title: `Score ${frameworkLabel} Crítico - Ação Urgente Necessária`,
        description: `Seu score ${frameworkLabel} geral está abaixo de 50, indicando necessidade urgente de implementação de práticas sustentáveis.`,
      });
    } else if (scores.overall > 85) {
      insights.push({
        category: 'excellent',
        categoryLabel: 'Excelente',
        title: `Empresa ${frameworkLabel} Referência`,
        description: `Parabéns! Seu score ${frameworkLabel} de ${scores.overall} pontos coloca sua empresa entre as líderes em sustentabilidade. Continue sendo exemplo para o mercado.`,
      });
    }

    await prisma.strategicInsight.deleteMany({
      where: { diagnosisId },
    });

    for (const insight of insights) {
      await prisma.strategicInsight.create({
        data: {
          diagnosisId,
          ...insight,
        },
      });
    }

    return insights;
  }

  async getInsights(diagnosisId: string) {
    return prisma.strategicInsight.findMany({
      where: { diagnosisId },
      include: { pillar: true },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }
}
