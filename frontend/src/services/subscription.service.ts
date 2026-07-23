import api from './api';

export interface ActivePlan {
  plan: {
    id: string;
    name: string;
    code: string;
    price: number;
    billingCycle: string;
    maxDiagnoses: number | null;
    consultationHours: number;
    features: Record<string, boolean>;
    active: boolean;
  };
  subscription: {
    id: string;
    status: string;
    startedAt: string;
    expiresAt: string | null;
  } | null;
  isFreePlan: boolean;
  consultationHoursUsed: number;
  consultationHoursRemaining: number;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  /** Preenchido quando o usuário já teve um plano pago que venceu */
  expiredSubscription: {
    planName: string;
    planCode: string;
    expiresAt: string | null;
  } | null;
}

export const subscriptionService = {
  async getActivePlan(): Promise<ActivePlan> {
    const response = await api.get<ActivePlan>('/subscriptions/active');
    return response.data;
  },
};
