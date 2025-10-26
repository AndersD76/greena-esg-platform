import api from './api';

export interface Diagnosis {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed';
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
  insights: Array<{
    id: number;
    category: string;
    categoryLabel: string;
    title: string;
    description: string;
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
  async create() {
    const response = await api.post<Diagnosis>('/diagnoses');
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
};
