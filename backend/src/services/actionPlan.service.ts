import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export class ActionPlanService {
  /**
   * Gera plano de ação automático baseado nas respostas
   */
  async generateActionPlan(diagnosisId: string) {
    // Buscar TODAS as respostas "Não iniciado" (score 1) — são as que precisam de ação imediata
    const responses = await prisma.response.findMany({
      where: {
        diagnosisId,
        evaluationValue: 1, // Somente "Não iniciado"
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
        { assessmentItem: { criteria: { theme: { pillar: { code: 'asc' } } } } },
      ],
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

    responses.forEach((response) => {
      const pillarName = response.assessmentItem.criteria.theme.pillar.name;
      const pillarCode = response.assessmentItem.criteria.theme.pillar.code;
      const themeName = response.assessmentItem.criteria.theme.name;
      const question = response.assessmentItem.question;

      // Impacto máximo: score 1 → pode melhorar até 5 = impacto 8/10
      const impactScore = 8;

      // Determinar investimento por tema
      let investment = 'medium';
      let investmentLabel = 'Médio';
      const tLower = themeName.toLowerCase();
      if (tLower.includes('governança') || tLower.includes('transparência') || tLower.includes('ética') || tLower.includes('compliance')) {
        investment = 'low';
        investmentLabel = 'Baixo';
      } else if (tLower.includes('energia') || tLower.includes('clima') || tLower.includes('emissão') || tLower.includes('infraestrutura')) {
        investment = 'high';
        investmentLabel = 'Alto';
      }

      // Prazo baseado no tipo de investimento
      const deadlineDays = investment === 'low' ? 30 : investment === 'high' ? 90 : 60;

      actions.push({
        title: question,
        description: `[${pillarCode}] ${pillarName} > ${themeName} — Esta prática ainda não foi iniciada na sua organização. Implemente políticas, processos ou controles para atender este critério e elevar significativamente seu score ESG.`,
        priority: 'critical',
        priorityLabel: 'PRIORIDADE CRÍTICA',
        investment,
        investmentLabel,
        deadlineDays,
        impactScore,
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
