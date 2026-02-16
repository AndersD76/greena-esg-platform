import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SubscriptionService } from '../services/subscription.service';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  /**
   * Obtém o plano ativo do usuário
   * GET /api/subscriptions/active
   */
  async getActivePlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const activePlan = await subscriptionService.getActivePlan(userId);

      res.json(activePlan);
    } catch (error: any) {
      console.error('Erro ao buscar plano ativo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verifica se o usuário pode criar um novo diagnóstico
   * GET /api/subscriptions/can-create-diagnosis
   */
  async canCreateDiagnosis(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await subscriptionService.canCreateDiagnosis(userId);

      res.json(result);
    } catch (error: any) {
      console.error('Erro ao verificar limite de diagnósticos:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Registra uso de horas de consultoria
   * POST /api/subscriptions/track-hours
   */
  async trackConsultationHours(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { hours } = req.body;

      if (!hours || hours <= 0) {
        return res.status(400).json({ error: 'Número de horas inválido' });
      }

      const result = await subscriptionService.trackConsultationHours(userId, hours);

      res.json(result);
    } catch (error: any) {
      console.error('Erro ao registrar horas:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtém horas de consultoria restantes
   * GET /api/subscriptions/remaining-hours
   */
  async getRemainingHours(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const hours = await subscriptionService.getRemainingHours(userId);

      res.json(hours);
    } catch (error: any) {
      console.error('Erro ao buscar horas restantes:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cria uma nova assinatura com pagamento via Asaas
   * POST /api/subscriptions
   */
  async createSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { planCode, paymentMethod, creditCard, creditCardHolderInfo, billingData } = req.body;

      if (!planCode) {
        return res.status(400).json({ error: 'Código do plano é obrigatório' });
      }

      if (!paymentMethod || !['CREDIT_CARD', 'PIX'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Método de pagamento inválido. Use CREDIT_CARD ou PIX' });
      }

      if (!billingData?.cpfCnpj) {
        return res.status(400).json({ error: 'CPF/CNPJ é obrigatório' });
      }

      if (paymentMethod === 'CREDIT_CARD') {
        if (!creditCard || !creditCard.number || !creditCard.holderName || !creditCard.expiryMonth || !creditCard.expiryYear || !creditCard.ccv) {
          return res.status(400).json({ error: 'Dados do cartão de crédito são obrigatórios' });
        }
        if (!creditCardHolderInfo || !creditCardHolderInfo.name || !creditCardHolderInfo.email || !creditCardHolderInfo.cpfCnpj || !creditCardHolderInfo.postalCode || !creditCardHolderInfo.addressNumber) {
          return res.status(400).json({ error: 'Dados do titular do cartão são obrigatórios' });
        }
      }

      const result = await subscriptionService.createSubscription(userId, {
        planCode,
        paymentMethod,
        creditCard,
        creditCardHolderInfo,
        billingData,
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);

      // Tratar erros da API Asaas
      if (error.response?.data) {
        const asaasErrors = error.response.data.errors;
        if (asaasErrors && asaasErrors.length > 0) {
          return res.status(400).json({
            error: asaasErrors.map((e: any) => e.description).join('. '),
          });
        }
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cancela a assinatura do usuário
   * DELETE /api/subscriptions
   */
  async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await subscriptionService.cancelSubscription(userId);

      res.json(result);
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Lista todos os planos disponíveis
   * GET /api/subscriptions/plans
   */
  async getAvailablePlans(req: AuthRequest, res: Response) {
    try {
      const plans = await subscriptionService.getAvailablePlans();

      res.json(plans);
    } catch (error: any) {
      console.error('Erro ao listar planos:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtém detalhes de um plano específico
   * GET /api/subscriptions/plans/:code
   */
  async getPlanByCode(req: AuthRequest, res: Response) {
    try {
      const { code } = req.params;

      const plan = await subscriptionService.getPlanByCode(code);

      res.json(plan);
    } catch (error: any) {
      console.error('Erro ao buscar plano:', error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Atualiza o plano do usuário
   * PUT /api/subscriptions
   */
  async updateSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { planCode } = req.body;

      if (!planCode) {
        return res.status(400).json({ error: 'Código do plano é obrigatório' });
      }

      const subscription = await subscriptionService.updateSubscription(userId, planCode);

      res.json(subscription);
    } catch (error: any) {
      console.error('Erro ao atualizar assinatura:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtém estatísticas de uso do usuário
   * GET /api/subscriptions/usage-stats
   */
  async getUserUsageStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const stats = await subscriptionService.getUserUsageStats(userId);

      res.json(stats);
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtém QR Code PIX de um pagamento
   * GET /api/subscriptions/pix-qrcode/:paymentId
   */
  async getPixQrCode(req: AuthRequest, res: Response) {
    try {
      const { paymentId } = req.params;

      const pixData = await subscriptionService.getPixQrCode(paymentId);

      res.json(pixData);
    } catch (error: any) {
      console.error('Erro ao buscar QR Code PIX:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verifica status de um pagamento (para polling do frontend)
   * GET /api/subscriptions/payment-status/:paymentId
   */
  async getPaymentStatus(req: AuthRequest, res: Response) {
    try {
      const { paymentId } = req.params;

      const status = await subscriptionService.checkPaymentStatus(paymentId);

      res.json({ status });
    } catch (error: any) {
      console.error('Erro ao verificar status do pagamento:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
