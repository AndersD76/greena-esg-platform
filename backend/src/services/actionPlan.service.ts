import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export class ActionPlanService {
  /**
   * Gera plano de ação automático baseado nas respostas
   */
  async generateActionPlan(diagnosisId: string) {
    // Buscar todas as respostas com baixo score (1, 2 ou 3 de 5)
    const responses = await prisma.response.findMany({
      where: {
        diagnosisId,
        evaluation: { in: ['Não é feito', 'É mal feito', 'É feito'] },
        // Excluir "Não se aplica"
        NOT: { evaluation: 'Não se aplica' },
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
      orderBy: [
        { evaluationValue: 'asc' }, // Menores valores primeiro (maior necessidade de melhoria)
      ],
      take: 10, // Top 10 ações
    });

    const actions: Array<{
      title: string;
      description: string;
      priority: string;
      priorityLabel: string;
      investment: string;
      investmentLabel: string;
      deadlineDays: number;
      impactScore: number;
    }> = [];

    responses.forEach((response, index) => {
      const pillarName = response.assessmentItem.criteria.theme.pillar.name;
      const themeName = response.assessmentItem.criteria.theme.name;
      const question = response.assessmentItem.question;

      // Calcular impacto potencial (quanto pode melhorar se atingir nota 5)
      const currentScore = response.evaluationValue;
      const potentialScore = 5; // Máximo (É muito bem feito)
      const impact = potentialScore - currentScore;

      // Determinar prioridade baseado no evaluationValue
      let priority = 'medium';
      let priorityLabel = 'MÉDIA PRIORIDADE';
      if (response.evaluationValue === 1) { // Não é feito
        priority = 'critical';
        priorityLabel = 'PRIORIDADE CRÍTICA';
      } else if (response.evaluationValue === 2) { // É mal feito
        priority = 'high';
        priorityLabel = 'ALTA PRIORIDADE';
      }

      // Determinar investimento estimado
      let investment = 'medium';
      let investmentLabel = 'Médio';
      if (themeName.includes('Governança') || themeName.includes('Transparência')) {
        investment = 'low';
        investmentLabel = 'Baixo';
      } else if (themeName.includes('Energia') || themeName.includes('Mudanças climáticas')) {
        investment = 'high';
        investmentLabel = 'Alto';
      }

      // Determinar prazo
      let deadlineDays = 90;
      if (priority === 'critical') {
        deadlineDays = 30;
      } else if (priority === 'high') {
        deadlineDays = 60;
      } else {
        deadlineDays = 180;
      }

      actions.push({
        title: `${index + 1}. Implementar: ${question.substring(0, 60)}${question.length > 60 ? '...' : ''}`,
        description: `${pillarName} - ${themeName}: ${question}. Esta ação terá impacto significativo no seu score ESG, melhorando a performance neste critério crítico.`,
        priority,
        priorityLabel,
        investment,
        investmentLabel,
        deadlineDays,
        impactScore: Math.round((impact / 5) * 10), // Impacto em escala 0-10
      });
    });

    // Deletar plano de ação antigo
    await prisma.actionPlan.deleteMany({
      where: { diagnosisId },
    });

    // Criar novas ações
    for (const action of actions) {
      await prisma.actionPlan.create({
        data: {
          diagnosisId,
          ...action,
          impactScore: new Decimal(action.impactScore),
        },
      });
    }

    return actions;
  }

  /**
   * Busca plano de ação de um diagnóstico
   */
  async getActionPlan(diagnosisId: string) {
    return prisma.actionPlan.findMany({
      where: { diagnosisId },
      orderBy: [
        { priority: 'desc' },
        { impactScore: 'desc' },
      ],
    });
  }

  /**
   * Atualiza status de uma ação
   */
  async updateActionStatus(actionId: number, status: string) {
    return prisma.actionPlan.update({
      where: { id: actionId },
      data: { status },
    });
  }
}
