import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { SubscriptionService } from '../services/subscription.service';

const subscriptionService = new SubscriptionService();

/**
 * Bloqueia recursos exclusivos de planos pagos.
 *
 * O plano gratuito (code 'free') dá acesso apenas ao diagnóstico demo de 6
 * perguntas e ao resultado simplificado. Sem este middleware, a única barreira
 * era o redirecionamento no frontend, que podia ser contornado por qualquer
 * link direto para o questionário completo.
 *
 * Deve ser usado sempre depois de authMiddleware.
 */
export const requirePaidPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Admins precisam navegar por todos os fluxos para dar suporte
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    return next();
  }

  try {
    const activePlan = await subscriptionService.getActivePlan(req.user.userId);

    if (activePlan.isFreePlan) {
      return res.status(403).json({
        error: 'Este recurso está disponível apenas nos planos pagos. Faça upgrade para continuar.',
        code: 'UPGRADE_REQUIRED',
      });
    }

    next();
  } catch (error: any) {
    console.error('[PLAN] Erro ao verificar plano do usuário:', error.message);
    return res.status(500).json({ error: 'Não foi possível verificar seu plano' });
  }
};
