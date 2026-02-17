import { PrismaClient } from '@prisma/client';
import { AsaasService } from './asaas.service';

const prisma = new PrismaClient();
const asaasService = new AsaasService();

interface CreditCardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface CreditCardHolderInput {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  mobilePhone?: string;
}

interface CreateSubscriptionInput {
  planCode: string;
  paymentMethod: 'CREDIT_CARD' | 'PIX';
  creditCard?: CreditCardInput;
  creditCardHolderInfo?: CreditCardHolderInput;
  billingData: {
    cpfCnpj: string;
    address?: string;
    addressNumber?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    mobilePhone?: string;
  };
}

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
   * Busca ou cria um customer no Asaas para o usuário
   */
  private async ensureAsaasCustomer(userId: string, billingData: CreateSubscriptionInput['billingData']) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    // Se já tem customer no Asaas, retorna o ID
    if (user.asaasCustomerId) {
      return user.asaasCustomerId;
    }

    const cpfCnpj = billingData.cpfCnpj.replace(/[.\-\/]/g, '');

    // Tenta encontrar customer existente no Asaas pelo CPF/CNPJ
    const existingCustomer = await asaasService.findCustomerByCpfCnpj(cpfCnpj);
    if (existingCustomer) {
      await prisma.user.update({
        where: { id: userId },
        data: { asaasCustomerId: existingCustomer.id }
      });
      return existingCustomer.id;
    }

    // Cria novo customer no Asaas
    const customer = await asaasService.createCustomer({
      name: user.name,
      cpfCnpj: cpfCnpj,
      email: user.email,
      mobilePhone: billingData.mobilePhone || user.responsibleContact || undefined,
      externalReference: userId,
    });

    // Salva o ID do customer no banco local
    await prisma.user.update({
      where: { id: userId },
      data: { asaasCustomerId: customer.id }
    });

    return customer.id;
  }

  /**
   * Cria uma nova assinatura com pagamento via Asaas
   */
  async createSubscription(userId: string, input: CreateSubscriptionInput) {
    const { planCode, paymentMethod, creditCard, creditCardHolderInfo, billingData } = input;

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

    // Buscar ou criar customer no Asaas
    let asaasCustomerId: string;
    try {
      asaasCustomerId = await this.ensureAsaasCustomer(userId, billingData);
    } catch (error: any) {
      const msg = error.response?.data?.errors?.[0]?.description || error.response?.data?.message || error.message;
      console.error('[ASAAS] Erro ao criar/buscar customer:', msg);
      throw new Error(`Erro na comunicação com o gateway de pagamento: ${msg}`);
    }

    // Calcular próximo vencimento (hoje)
    const today = new Date();
    const nextDueDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Mapear ciclo de cobrança
    const cycle = plan.billingCycle === 'yearly' ? 'YEARLY' as const : 'MONTHLY' as const;

    // Montar dados para criação da assinatura no Asaas
    const asaasSubscriptionData: any = {
      customerId: asaasCustomerId,
      billingType: paymentMethod,
      value: Number(plan.price),
      nextDueDate,
      cycle,
      description: `GREENA ESG - Plano ${plan.name}`,
    };

    // Se for cartão, adicionar dados do cartão
    if (paymentMethod === 'CREDIT_CARD' && creditCard && creditCardHolderInfo) {
      asaasSubscriptionData.creditCard = {
        holderName: creditCard.holderName,
        number: creditCard.number.replace(/\s/g, ''),
        expiryMonth: creditCard.expiryMonth,
        expiryYear: creditCard.expiryYear,
        ccv: creditCard.ccv,
      };
      asaasSubscriptionData.creditCardHolderInfo = {
        name: creditCardHolderInfo.name,
        email: creditCardHolderInfo.email,
        cpfCnpj: creditCardHolderInfo.cpfCnpj.replace(/[.\-\/]/g, ''),
        postalCode: creditCardHolderInfo.postalCode.replace(/\D/g, ''),
        addressNumber: creditCardHolderInfo.addressNumber,
        mobilePhone: creditCardHolderInfo.mobilePhone?.replace(/\D/g, '') || undefined,
      };
    }

    // Criar assinatura no Asaas
    let asaasSubscription;
    try {
      asaasSubscription = await asaasService.createSubscription(asaasSubscriptionData);
    } catch (error: any) {
      const asaasErrors = error.response?.data?.errors;
      const msg = asaasErrors?.[0]?.description || error.response?.data?.message || error.message;
      console.error('[ASAAS] Erro ao criar assinatura:', JSON.stringify(error.response?.data || error.message));
      throw new Error(`Erro no pagamento: ${msg}`);
    }

    // Calcular data de expiração
    const now = new Date();
    let expiresAt: Date | null = null;

    if (plan.billingCycle === 'monthly') {
      expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Status inicial: pending_payment para PIX, active para cartão (cobrado imediatamente)
    const initialStatus = paymentMethod === 'CREDIT_CARD' ? 'active' : 'pending_payment';

    // Criar assinatura no banco local
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status: initialStatus,
        startedAt: now,
        expiresAt,
        asaasSubscriptionId: asaasSubscription.id,
        paymentMethod,
        consultationHoursUsed: 0,
      },
      include: { plan: true }
    });

    // Se for PIX, buscar o QR code do primeiro pagamento
    let pixData = null;
    if (paymentMethod === 'PIX') {
      const payments = await asaasService.getSubscriptionPayments(asaasSubscription.id);
      if (payments.data && payments.data.length > 0) {
        const firstPayment = payments.data[0];
        const pixQrCode = await asaasService.getPaymentPixQrCode(firstPayment.id);
        pixData = {
          paymentId: firstPayment.id,
          encodedImage: pixQrCode.encodedImage,
          payload: pixQrCode.payload,
          expirationDate: pixQrCode.expirationDate,
        };
      }
    }

    return {
      subscription,
      pixData,
    };
  }

  /**
   * Cancela a assinatura do usuário
   */
  async cancelSubscription(userId: string) {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: { in: ['active', 'trial', 'pending_payment'] }
      }
    });

    if (!subscription) {
      throw new Error('Assinatura ativa não encontrada');
    }

    // Cancelar no Asaas se tiver ID
    if (subscription.asaasSubscriptionId) {
      try {
        await asaasService.cancelSubscription(subscription.asaasSubscriptionId);
      } catch (error) {
        console.error('Erro ao cancelar assinatura no Asaas:', error);
      }
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

  /**
   * Busca QR Code PIX de um pagamento
   */
  async getPixQrCode(paymentId: string) {
    return asaasService.getPaymentPixQrCode(paymentId);
  }

  /**
   * Verifica status de um pagamento
   */
  async checkPaymentStatus(paymentId: string) {
    return asaasService.getPaymentStatus(paymentId);
  }
}
