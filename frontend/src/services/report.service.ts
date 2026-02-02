import api from './api';

export interface ThemeScore {
  themeId: number;
  themeName: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsCount: number;
  answeredCount: number;
}

export interface PillarBreakdown {
  pillarId: number;
  pillarCode: string;
  pillarName: string;
  score: number;
  themes: ThemeScore[];
  strengths: string[];
  weaknesses: string[];
}

export interface Certification {
  level: 'bronze' | 'silver' | 'gold';
  name: string;
  title: string;
  message: string;
  color: string;
  scoreRange: string;
  characteristics: string[];
}

export interface ReportSummary {
  overallAssessment: string;
  certificationLevel: string;
  certificationName: string;
  strongestPillar: string;
  strongestPillarScore: number;
  weakestPillar: string;
  weakestPillarScore: number;
  topStrengths: string[];
  topWeaknesses: string[];
  recommendation: string;
}

export interface Insight {
  id: number;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  pillarId?: number;
}

export interface ActionPlan {
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
}

export interface FullReport {
  reportDate: string;
  diagnosisId: string;
  completedAt: string;
  companyInfo: {
    name: string;
    cnpj: string | null;
    city: string | null;
    sector: string | null;
    size: string | null;
    employeesRange: string | null;
    responsiblePerson: string | null;
    responsibleContact: string | null;
  };
  scores: {
    overall: number;
    environmental: number;
    social: number;
    governance: number;
  };
  certification: Certification;
  pillarBreakdowns: PillarBreakdown[];
  insights: Insight[];
  actionPlans: ActionPlan[];
  certificate: {
    number: string;
    level: string;
    issuedAt: string;
    expiresAt: string;
    isValid: boolean;
  } | null;
  evolution: Array<{
    date: string;
    overall: number;
    environmental: number;
    social: number;
    governance: number;
  }>;
  summary: ReportSummary;
  formattedDate?: string;
  completedDate?: string;
}

export const reportService = {
  async getFullReport(diagnosisId: string): Promise<FullReport> {
    const response = await api.get<FullReport>(`/reports/${diagnosisId}`);
    return response.data;
  },

  async getReportForPDF(diagnosisId: string): Promise<FullReport> {
    const response = await api.get<FullReport>(`/reports/${diagnosisId}/pdf`);
    return response.data;
  },
};
