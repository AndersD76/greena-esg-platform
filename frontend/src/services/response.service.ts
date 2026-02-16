import api from './api';

export interface ResponseData {
  assessmentItemId: number;
  evaluation: 'Não se aplica' | 'Não iniciado' | 'Planejado' | 'Em andamento' | 'Implementado parcialmente' | 'Totalmente implementado';
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
