import api from './api';

export interface Pillar {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface AssessmentItem {
  id: number;
  question: string;
  order: number;
  criteria: {
    id: number;
    name: string;
    theme: {
      id: number;
      name: string;
      pillar: Pillar;
    };
  };
}

export const pillarService = {
  async list() {
    const response = await api.get<Pillar[]>('/pillars');
    return response.data;
  },

  async getAssessment(code: string) {
    const response = await api.get(`/pillars/${code}/assessment`);
    return response.data;
  },

  async getAllQuestions() {
    const response = await api.get<AssessmentItem[]>('/pillars/questions/all');
    return response.data;
  },
};
