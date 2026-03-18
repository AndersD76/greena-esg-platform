import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  companyName: string | null;
  cnpj: string | null;
  city: string | null;
  sector: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    diagnoses: number;
    consultations: number;
    certificates: number;
  };
}

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  diagnoses: {
    total: number;
    completed: number;
    thisMonth: number;
    completionRate: number;
  };
  consultations: {
    total: number;
    scheduled: number;
    completed: number;
  };
  certificates: {
    total: number;
  };
  subscriptions: {
    active: number;
  };
}

export interface AdminConsultation {
  id: string;
  userId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  topic: string | null;
  notes: string | null;
  meetingUrl: string | null;
  meetingId: string | null;
  consultantName: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
  };
  _count: {
    messages: number;
  };
}

export interface AdminSubscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  expiresAt: string | null;
  consultationHoursUsed: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
  };
  plan: {
    id: string;
    name: string;
    code: string;
    price: number;
    consultationHours: number;
  };
}

export interface AdminDiagnosis {
  id: string;
  userId: string;
  status: string;
  overallScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  completedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
  };
}

export interface AccessMetrics {
  summary: {
    totalViews: number;
    uniqueSessions: number;
    uniqueUsers: number;
    todayViews: number;
    activeNow: number;
    avgPagesPerSession: number;
  };
  viewsByDay: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  viewsByHour: { hour: number; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AdminServiceClass {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }

  // Users
  async getUsers(page = 1, limit = 20, search?: string, role?: string): Promise<{ users: AdminUser[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  }

  async getUserById(userId: string): Promise<any> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, data: { name?: string; role?: string; isActive?: boolean; companyName?: string }): Promise<AdminUser> {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  }

  async toggleUserStatus(userId: string): Promise<AdminUser> {
    const response = await api.post(`/admin/users/${userId}/toggle-status`);
    return response.data;
  }

  // Admins
  async createAdmin(data: { email: string; password: string; name: string; role: string }): Promise<any> {
    const response = await api.post('/admin/admins', data);
    return response.data;
  }

  // Consultations
  async getConsultations(page = 1, limit = 20, status?: string): Promise<{ consultations: AdminConsultation[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await api.get(`/admin/consultations?${params}`);
    return response.data;
  }

  async updateConsultation(id: string, data: { status?: string; consultantName?: string; notes?: string }): Promise<any> {
    const response = await api.put(`/admin/consultations/${id}`, data);
    return response.data;
  }

  async addConsultationHours(userId: string, hours: number, reason: string): Promise<any> {
    const response = await api.post('/admin/consultation-hours', { userId, hours, reason });
    return response.data;
  }

  // Subscriptions
  async getSubscriptions(page = 1, limit = 20, status?: string): Promise<{ subscriptions: AdminSubscription[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await api.get(`/admin/subscriptions?${params}`);
    return response.data;
  }

  async updateSubscription(id: string, data: { status?: string; expiresAt?: string }): Promise<any> {
    const response = await api.put(`/admin/subscriptions/${id}`, data);
    return response.data;
  }

  // Diagnoses
  async getDiagnoses(page = 1, limit = 20, status?: string): Promise<{ diagnoses: AdminDiagnosis[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await api.get(`/admin/diagnoses?${params}`);
    return response.data;
  }

  // Reports
  async getMetricsReport(dateFrom: string, dateTo: string): Promise<any> {
    const response = await api.get(`/admin/reports/metrics?dateFrom=${dateFrom}&dateTo=${dateTo}`);
    return response.data;
  }

  async getConsultationHoursReport(): Promise<any[]> {
    const response = await api.get('/admin/reports/consultation-hours');
    return response.data;
  }

  // Activities
  async getActivities(limit = 50): Promise<any[]> {
    const response = await api.get(`/admin/activities?limit=${limit}`);
    return response.data;
  }

  // Analytics
  async getAccessMetrics(dateFrom?: string, dateTo?: string): Promise<AccessMetrics> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    const response = await api.get(`/analytics/metrics?${params}`);
    return response.data;
  }
}

export const adminService = new AdminServiceClass();
