import api from './api';

export interface ResponseData {
  assessmentItemId: number;
  importance: 'Sem Importância' | 'Importante' | 'Muito Importante' | 'Crítico';
  evaluation: 'Não se aplica' | 'Não é feito' | 'É mal feito' | 'É feito' | 'É bem feito';
  observations?: string;
}

export const responseService = {
  async upsert(diagnosisId: string, data: ResponseData) {
    const response = await api.post(`/responses/${diagnosisId}`, data);
    return response.data;
  },

  async getByDiagnosisId(diagnosisId: string) {
    const response = await api.get(`/responses/${diagnosisId}`);
    return response.data;
  },

  async getByPillar(diagnosisId: string, pillarCode: string) {
    const response = await api.get(`/responses/${diagnosisId}/pillar/${pillarCode}`);
    return response.data;
  },
};
