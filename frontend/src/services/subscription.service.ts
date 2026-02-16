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
}

export const subscriptionService = {
  async getActivePlan(): Promise<ActivePlan> {
    const response = await api.get<ActivePlan>('/subscriptions/active');
    return response.data;
  },
};
