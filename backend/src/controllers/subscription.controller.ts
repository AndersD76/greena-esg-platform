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
   * Cria uma nova assinatura
   * POST /api/subscriptions
   */
  async createSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { planCode, trialDays } = req.body;

      if (!planCode) {
        return res.status(400).json({ error: 'Código do plano é obrigatório' });
      }

      const subscription = await subscriptionService.createSubscription(
        userId,
        planCode,
        trialDays
      );

      res.status(201).json(subscription);
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
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
}
