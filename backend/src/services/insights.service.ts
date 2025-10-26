import prisma from '../config/database';
import { ScoringService } from './scoring.service';

export class InsightsService {
  private scoringService: ScoringService;

  constructor() {
    this.scoringService = new ScoringService();
  }

  /**
   * Gera insights estratégicos baseado nos scores
   */
  async generateInsights(diagnosisId: string) {
    // Calcular scores
    const scores = await this.scoringService.calculateAllScores(diagnosisId);

    const insights: Array<{
      category: string;
      categoryLabel: string;
      title: string;
      description: string;
      pillarId?: number;
    }> = [];

    // Buscar pilares
    const pillars = await prisma.pillar.findMany();
    const pillarMap = new Map(pillars.map((p) => [p.code, p]));

    // Insight para Pilar Ambiental
    const envPillar = pillarMap.get('E');
    if (scores.environmental < 50) {
      insights.push({
        category: 'critical',
        categoryLabel: 'Crítico',
        title: 'Gestão Ambiental Urgente',
        description: `Implementação urgente de políticas ambientais necessária. Potencial de melhoria de até ${Math.round(100 - scores.environmental)} pontos no score ESG, com ações específicas de gestão de emissões, energia e resíduos.`,
        pillarId: envPillar?.id,
      });
    } else if (scores.environmental < 70) {
      insights.push({
        category: 'attention',
        categoryLabel: 'Atenção',
        title: 'Políticas Ambientais Parciais',
        description: 'Políticas ambientais parcialmente implementadas. Recomendamos expansão das iniciativas com foco em eficiência energética e gestão de resíduos nos próximos 90 dias.',
        pillarId: envPillar?.id,
      });
    } else if (scores.environmental > 85) {
      insights.push({
        category: 'excellent',
        categoryLabel: 'Excelente',
        title: 'Destaque em Sustentabilidade Ambiental',
        description: `Parabéns! Suas práticas ambientais estão ${Math.round(scores.environmental - 70)}% acima da média. Continue investindo em inovação verde e economia circular.`,
        pillarId: envPillar?.id,
      });
    }

    // Insight para Pilar Social
    const socPillar = pillarMap.get('S');
    if (scores.social < 50) {
      insights.push({
        category: 'critical',
        categoryLabel: 'Crítico',
        title: 'Responsabilidade Social Crítica',
        description: 'Implementação urgente de políticas sociais e de direitos humanos necessária. Foco em diversidade, saúde ocupacional e desenvolvimento de colaboradores.',
        pillarId: socPillar?.id,
      });
    } else if (scores.social < 70) {
      insights.push({
        category: 'attention',
        categoryLabel: 'Atenção',
        title: 'Diversidade e Inclusão',
        description: 'Políticas de diversidade parcialmente implementadas. Recomendamos expansão das iniciativas com foco em representatividade em cargos executivos.',
        pillarId: socPillar?.id,
      });
    } else if (scores.social > 85) {
      insights.push({
        category: 'excellent',
        categoryLabel: 'Excelente',
        title: 'Excelência em Responsabilidade Social',
        description: 'Parabéns! Suas práticas sociais são referência. Continue investindo em bem-estar dos colaboradores e impacto comunitário.',
        pillarId: socPillar?.id,
      });
    }

    // Insight para Pilar Governança
    const govPillar = pillarMap.get('G');
    if (scores.governance < 50) {
      insights.push({
        category: 'critical',
        categoryLabel: 'Crítico',
        title: 'Governança e Compliance Urgente',
        description: 'Implementação urgente de estruturas de governança e compliance necessária. Foco em transparência, ética e gestão de riscos.',
        pillarId: govPillar?.id,
      });
    } else if (scores.governance < 70) {
      insights.push({
        category: 'attention',
        categoryLabel: 'Atenção',
        title: 'Governança em Desenvolvimento',
        description: 'Estruturas de governança parcialmente implementadas. Recomendamos fortalecimento de compliance e transparência.',
        pillarId: govPillar?.id,
      });
    } else if (scores.governance > 85) {
      insights.push({
        category: 'excellent',
        categoryLabel: 'Excelente',
        title: 'Excelência em Governança',
        description: 'Parabéns! Suas práticas de ética e transparência estão acima da média do mercado. Continue investindo em compliance e comunicação transparente.',
        pillarId: govPillar?.id,
      });
    }

    // Insight geral
    if (scores.overall < 50) {
      insights.push({
        category: 'critical',
        categoryLabel: 'Crítico',
        title: 'Score ESG Crítico - Ação Urgente Necessária',
        description: 'Seu score ESG geral está abaixo de 50, indicando necessidade urgente de implementação de práticas sustentáveis nos três pilares.',
      });
    } else if (scores.overall > 85) {
      insights.push({
        category: 'excellent',
        categoryLabel: 'Excelente',
        title: 'Empresa ESG Referência',
        description: `Parabéns! Seu score ESG de ${scores.overall} pontos coloca sua empresa entre as líderes em sustentabilidade. Continue sendo exemplo para o mercado.`,
      });
    }

    // Deletar insights antigos
    await prisma.strategicInsight.deleteMany({
      where: { diagnosisId },
    });

    // Criar novos insights
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

  /**
   * Busca insights de um diagnóstico
   */
  async getInsights(diagnosisId: string) {
    return prisma.strategicInsight.findMany({
      where: { diagnosisId },
      include: { pillar: true },
      orderBy: [
        { category: 'asc' }, // critical, attention, excellent
        { createdAt: 'desc' },
      ],
    });
  }
}
