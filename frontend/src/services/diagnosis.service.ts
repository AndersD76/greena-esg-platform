import api from './api';

export interface PillarScore {
  code: string;
  name: string;
  color: string | null;
  score: number;
}

export interface Diagnosis {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed';
  type: 'full' | 'demo';
  framework: string;
  overallScore?: number;
  environmentalScore?: number;
  socialScore?: number;
  governanceScore?: number;
  rankingPosition?: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface DiagnosisResults {
  diagnosis: Diagnosis;
  scores: {
    overall: number;
    environmental: number;
    social: number;
    governance: number;
  };
  pillarScores: PillarScore[];
  insights: Array<{
    id: number;
    category: string;
    categoryLabel: string;
    title: string;
    description: string;
    pillar?: { id: number; code: string; name: string; color: string | null };
  }>;
  actionPlan: Array<{
    id: number;
    title: string;
    description: string;
    priority: string;
    priorityLabel: string;
    investment: string;
    investmentLabel: string;
    deadlineDays: number;
    status: string;
    impactScore: number;
  }>;
}

export const diagnosisService = {
  async create(framework: string = 'ESG') {
    const response = await api.post<Diagnosis>('/diagnoses', { framework });
    return response.data;
  },

  async list() {
    const response = await api.get<Diagnosis[]>('/diagnoses');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Diagnosis>(`/diagnoses/${id}`);
    return response.data;
  },

  async complete(id: string) {
    const response = await api.post(`/diagnoses/${id}/complete`);
    return response.data;
  },

  async getResults(id: string) {
    const response = await api.get<DiagnosisResults>(`/diagnoses/${id}/results`);
    return response.data;
  },

  async getProgress(id: string) {
    const response = await api.get(`/diagnoses/${id}/progress`);
    return response.data;
  },

  async finalize(id: string) {
    const response = await api.post(`/diagnoses/${id}/finalize`);
    return response.data;
  },

  async getInsights(id: string) {
    const response = await api.get(`/diagnoses/${id}/insights`);
    return response.data;
  },

  async getActionPlans(id: string) {
    const response = await api.get(`/diagnoses/${id}/action-plans`);
    return response.data;
  },

  async updateActionStatus(diagnosisId: string, actionId: number, status: string) {
    const response = await api.patch(`/diagnoses/${diagnosisId}/action-plans/${actionId}/status`, { status });
    return response.data;
  },

  async getPartialScores(id: string) {
    const response = await api.get(`/diagnoses/${id}/partial-scores`);
    return response.data;
  },

  async getSimulatedActions(id: string) {
    const response = await api.get(`/diagnoses/${id}/simulate-actions`);
    return response.data;
  },

  async getBenchmarking(id: string) {
    const response = await api.get(`/diagnoses/${id}/benchmarking`);
    return response.data;
  },

  async completeSimplified(id: string, scores: Record<string, number>) {
    const response = await api.post(`/diagnoses/${id}/complete-simplified`, { scores });
    return response.data;
  },
};
