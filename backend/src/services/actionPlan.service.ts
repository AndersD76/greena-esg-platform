import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export class ActionPlanService {
  /**
   * Gera plano de ação automático baseado nas respostas
   */
  async generateActionPlan(diagnosisId: string) {
    // Buscar respostas com maturidade baixa (1-3) — todas precisam de ação
    // 1 = Não iniciado, 2 = Planejado, 3 = Em andamento
    const responses = await prisma.response.findMany({
      where: {
        diagnosisId,
        evaluationValue: { in: [1, 2, 3] },
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

    const priorityByLevel: Record<number, { priority: string; priorityLabel: string; impactScore: number; description: string }> = {
      1: { priority: 'critical', priorityLabel: 'PRIORIDADE CRÍTICA', impactScore: 8, description: 'Esta prática ainda não foi iniciada na sua organização. Implemente políticas, processos ou controles para atender este critério e elevar significativamente seu score ESG.' },
      2: { priority: 'high', priorityLabel: 'PRIORIDADE ALTA', impactScore: 6, description: 'Esta prática está planejada mas ainda não implementada. Avance para a fase de execução para converter intenção em resultado concreto.' },
      3: { priority: 'medium', priorityLabel: 'PRIORIDADE MÉDIA', impactScore: 4, description: 'Esta prática está em andamento. Conclua a implementação e formalize os processos para consolidar os ganhos no seu score ESG.' },
    };

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
      const level = response.evaluationValue;

      const cfg = priorityByLevel[level] || priorityByLevel[1];

      // Determinar investimento por tema
      let investment = 'medium';
      let investmentLabel = 'Médio';
      const tLower = themeName.toLowerCase();
      if (tLower.includes('governança') || tLower.includes('transparência') || tLower.includes('ética') || tLower.includes('compliance') || tLower.includes('tópicos materiais') || tLower.includes('políticas') || tLower.includes('anticorrupção') || tLower.includes('conformidade')) {
        investment = 'low';
        investmentLabel = 'Baixo';
      } else if (tLower.includes('energia') || tLower.includes('clima') || tLower.includes('emissão') || tLower.includes('infraestrutura') || tLower.includes('biodiversidade') || tLower.includes('água') || tLower.includes('resíduo')) {
        investment = 'high';
        investmentLabel = 'Alto';
      }

      // Prazo baseado no nível de maturidade e tipo de investimento
      const baseDays = investment === 'low' ? 30 : investment === 'high' ? 90 : 60;
      const deadlineDays = level === 3 ? Math.round(baseDays * 0.5) : level === 2 ? Math.round(baseDays * 0.75) : baseDays;

      actions.push({
        title: question,
        description: `[${pillarCode}] ${pillarName} > ${themeName} — ${cfg.description}`,
        priority: cfg.priority,
        priorityLabel: cfg.priorityLabel,
        investment,
        investmentLabel,
        deadlineDays,
        impactScore: cfg.impactScore,
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
