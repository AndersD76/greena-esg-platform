import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  cnpj?: string;
  sector?: string;
  employees?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  cnpj?: string;
  sector?: string;
  employees?: number;
  role?: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};
