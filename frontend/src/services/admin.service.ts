import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  companyName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    diagnoses: number;
    subscriptions: number;
    consultations: number;
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDiagnoses: number;
  completedDiagnoses: number;
  totalConsultations: number;
  scheduledConsultations: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  recentUsers: AdminUser[];
  recentDiagnoses: any[];
}

export interface AdminConsultation {
  id: string;
  userId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  topic: string | null;
  meetingUrl: string | null;
  consultantName: string | null;
  user: {
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
  endDate: string | null;
  consultationHoursUsed: number;
  user: {
    name: string;
    email: string;
    companyName: string | null;
  };
  plan: {
    name: string;
    price: number;
    consultationHours: number;
  };
}

class AdminService {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }

  // Users
  async getUsers(page = 1, limit = 10, search?: string): Promise<{ users: AdminUser[]; total: number; pages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  }

  async getUserById(userId: string): Promise<AdminUser & { diagnoses: any[]; subscriptions: any[]; consultations: any[] }> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  async toggleUserStatus(userId: string): Promise<AdminUser> {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  }

  // Consultations
  async getConsultations(status?: string): Promise<AdminConsultation[]> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/admin/consultations${params}`);
    return response.data;
  }

  async updateConsultationStatus(id: string, status: string, notes?: string): Promise<any> {
    const response = await api.patch(`/admin/consultations/${id}/status`, { status, notes });
    return response.data;
  }

  async addConsultationHours(userId: string, hours: number, reason: string): Promise<any> {
    const response = await api.post('/admin/consultation-hours', { userId, hours, reason });
    return response.data;
  }

  // Subscriptions
  async getSubscriptions(status?: string): Promise<AdminSubscription[]> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/admin/subscriptions${params}`);
    return response.data;
  }

  async updateSubscriptionStatus(id: string, status: string): Promise<any> {
    const response = await api.patch(`/admin/subscriptions/${id}/status`, { status });
    return response.data;
  }

  // Diagnoses
  async getDiagnoses(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/admin/diagnoses${params}`);
    return response.data;
  }

  // Reports
  async getReports(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/admin/reports?${params}`);
    return response.data;
  }

  // Activities
  async getActivities(userId?: string, limit = 50): Promise<any[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (userId) params.append('userId', userId);
    const response = await api.get(`/admin/activities?${params}`);
    return response.data;
  }
}

export const adminService = new AdminService();
