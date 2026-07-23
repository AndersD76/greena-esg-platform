import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { subscriptionService, ActivePlan } from '../services/subscription.service';

/**
 * Plano ativo do usuário logado.
 *
 * Enquanto carrega, `isFreePlan` fica true para não liberar telas pagas por um
 * instante antes da resposta da API. Admins são tratados como plano pago.
 */
export function usePlan() {
  const { user, isAdmin } = useAuth();
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    subscriptionService
      .getActivePlan()
      .then((p) => {
        if (active) setPlan(p);
      })
      .catch(() => {
        if (active) setPlan(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const daysUntilExpiry = plan?.daysUntilExpiry ?? null;

  return {
    plan,
    loading,
    isFreePlan: isAdmin ? false : plan?.isFreePlan ?? true,
    daysUntilExpiry,
    /** Assinatura paga que vence em até 7 dias */
    isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7,
    /** Já teve plano pago e deixou vencer — diferente de nunca ter assinado */
    expiredSubscription: plan?.expiredSubscription ?? null,
  };
}
