import api from './api';

export interface Pillar {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  framework: string;
  sortOrder: number;
  macroCategory?: string;
}

export interface DataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'percentage' | 'currency' | 'boolean';
  unit?: string;
  placeholder?: string;
  options?: string[];
}

export interface GriItem {
  id: number;
  question: string;
  griCode?: string;
  dataFields?: DataField[];
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

export interface AssessmentItem {
  id: number;
  question: string;
  order: number;
  griCode?: string;
  frameworkTag: string;
  dataFields?: DataField[];
  griItems?: GriItem[];
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
  async list(framework?: string) {
    const params = framework ? { framework } : {};
    const response = await api.get<Pillar[]>('/pillars', { params });
    return response.data;
  },

  async getAssessment(code: string) {
    const response = await api.get(`/pillars/${code}/assessment`);
    return response.data;
  },

  async getAllQuestions(framework?: string) {
    const params = framework ? { framework } : {};
    const response = await api.get<AssessmentItem[]>('/pillars/questions/all', { params });
    return response.data;
  },
};
