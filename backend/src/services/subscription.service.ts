import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {
  /**
   * Busca o plano ativo de um usuário
   */
  async getActivePlan(userId: string) {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'active',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      // Retornar plano gratuito padrão se não houver assinatura
      const freePlan = await prisma.subscriptionPlan.findUnique({
        where: { code: 'free' }
      });

      if (!freePlan) {
        throw new Error('Plano gratuito não encontrado');
      }

      return {
        plan: freePlan,
        subscription: null,
        isFreePlan: true,
        consultationHoursUsed: 0,
        consultationHoursRemaining: 0
      };
    }

    const consultationHoursRemaining =
      subscription.plan.consultationHours - subscription.consultationHoursUsed;

    return {
      plan: subscription.plan,
      subscription: subscription,
      isFreePlan: false,
      consultationHoursUsed: subscription.consultationHoursUsed,
      consultationHoursRemaining: consultationHoursRemaining
    };
  }

  /**
   * Verifica se o usuário pode criar um novo diagnóstico
   */
  async canCreateDiagnosis(userId: string): Promise<{ allowed: boolean; reason?: string; currentCount?: number; limit?: number }> {
    const activePlan = await this.getActivePlan(userId);
    const plan = activePlan.plan;

    // Se maxDiagnoses for -1, significa ilimitado
    if (plan.maxDiagnoses === -1 || plan.maxDiagnoses === null) {
      return { allowed: true };
    }

    // Contar diagnósticos do usuário
    const diagnosisCount = await prisma.diagnosis.count({
      where: {
        userId: userId,
        status: { in: ['in_progress', 'completed'] }
      }
    });

    if (diagnosisCount >= plan.maxDiagnoses) {
      return {
        allowed: false,
        reason: `Você atingiu o limite de ${plan.maxDiagnoses} diagnóstico(s) do seu plano. Faça upgrade para continuar.`,
        currentCount: diagnosisCount,
        limit: plan.maxDiagnoses
      };
    }

    return {
      allowed: true,
      currentCount: diagnosisCount,
      limit: plan.maxDiagnoses
    };
  }

  /**
   * Registra uso de horas de consultoria
   */
  async trackConsultationHours(userId: string, hours: number) {
    const activePlan = await this.getActivePlan(userId);

    if (!activePlan.subscription) {
      throw new Error('Usuário não possui assinatura ativa com horas de consultoria');
    }

    const newHoursUsed = activePlan.consultationHoursUsed + hours;

    if (newHoursUsed > activePlan.plan.consultationHours) {
      throw new Error('Horas de consultoria insuficientes');
    }

    await prisma.userSubscription.update({
      where: { id: activePlan.subscription.id },
      data: {
        consultationHoursUsed: newHoursUsed,
        updatedAt: new Date()
      }
    });

    return {
      hoursUsed: hours,
      totalUsed: newHoursUsed,
      remaining: activePlan.plan.consultationHours - newHoursUsed
    };
  }

  /**
   * Obtém horas de consultoria restantes
   */
  async getRemainingHours(userId: string) {
    const activePlan = await this.getActivePlan(userId);

    return {
      total: activePlan.plan.consultationHours,
      used: activePlan.consultationHoursUsed,
      remaining: activePlan.consultationHoursRemaining
    };
  }

  /**
   * Cria uma nova assinatura para o usuário
   */
  async createSubscription(userId: string, planCode: string, trialDays?: number) {
    // Verificar se o plano existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode }
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (!plan.active) {
      throw new Error('Plano não está disponível');
    }

    // Verificar se já existe assinatura ativa
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'active',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (existingSubscription) {
      throw new Error('Usuário já possui uma assinatura ativa');
    }

    // Calcular datas
    const now = new Date();
    let expiresAt: Date | null = null;
    let trialEndsAt: Date | null = null;

    if (trialDays && trialDays > 0) {
      trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
    }

    if (plan.billingCycle === 'monthly') {
      expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Criar assinatura
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: userId,
        planId: plan.id,
        status: trialDays ? 'trial' : 'active',
        startedAt: now,
        expiresAt: expiresAt,
        trialEndsAt: trialEndsAt,
        consultationHoursUsed: 0
      },
      include: {
        plan: true
      }
    });

    return subscription;
  }

  /**
   * Cancela a assinatura do usuário
   */
  async cancelSubscription(userId: string) {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: { in: ['active', 'trial'] }
      }
    });

    if (!subscription) {
      throw new Error('Assinatura ativa não encontrada');
    }

    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    return { message: 'Assinatura cancelada com sucesso' };
  }

  /**
   * Lista todos os planos disponíveis
   */
  async getAvailablePlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });

    return plans;
  }

  /**
   * Obtém detalhes de um plano específico
   */
  async getPlanByCode(code: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code }
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    return plan;
  }

  /**
   * Atualiza o plano do usuário (upgrade/downgrade)
   */
  async updateSubscription(userId: string, newPlanCode: string) {
    const currentSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: { in: ['active', 'trial'] }
      },
      include: {
        plan: true
      }
    });

    if (!currentSubscription) {
      throw new Error('Assinatura ativa não encontrada');
    }

    const newPlan = await this.getPlanByCode(newPlanCode);

    // Atualizar para o novo plano
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: currentSubscription.id },
      data: {
        planId: newPlan.id,
        status: 'active',
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    });

    return updatedSubscription;
  }

  /**
   * Obtém estatísticas de uso do usuário
   */
  async getUserUsageStats(userId: string) {
    const activePlan = await this.getActivePlan(userId);
    const diagnosisCount = await prisma.diagnosis.count({
      where: {
        userId: userId,
        status: { in: ['in_progress', 'completed'] }
      }
    });

    const certificatesCount = await prisma.certificate.count({
      where: {
        userId: userId,
        isValid: true
      }
    });

    return {
      plan: activePlan.plan,
      subscription: activePlan.subscription,
      usage: {
        diagnoses: {
          current: diagnosisCount,
          limit: activePlan.plan.maxDiagnoses,
          unlimited: activePlan.plan.maxDiagnoses === -1
        },
        consultationHours: {
          used: activePlan.consultationHoursUsed,
          total: activePlan.plan.consultationHours,
          remaining: activePlan.consultationHoursRemaining
        },
        certificates: certificatesCount
      }
    };
  }
}
