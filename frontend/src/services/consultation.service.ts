import api from './api';

export interface Consultation {
  id: string;
  userId: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingUrl: string | null;
  meetingId: string | null;
  topic: string | null;
  notes: string | null;
  consultantName: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    companyName: string | null;
  };
  messages?: ConsultationMessage[];
  _count?: {
    messages: number;
  };
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'consultant';
  content: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const consultationService = {
  async schedule(data: { scheduledAt: string; duration: number; topic?: string }): Promise<Consultation> {
    const response = await api.post<Consultation>('/consultations', data);
    return response.data;
  },

  async list(status?: string): Promise<Consultation[]> {
    const params = status ? { status } : {};
    const response = await api.get<Consultation[]>('/consultations', { params });
    return response.data;
  },

  async getById(id: string): Promise<Consultation> {
    const response = await api.get<Consultation>(`/consultations/${id}`);
    return response.data;
  },

  async start(id: string): Promise<Consultation> {
    const response = await api.post<Consultation>(`/consultations/${id}/start`);
    return response.data;
  },

  async complete(id: string, notes?: string): Promise<Consultation> {
    const response = await api.post<Consultation>(`/consultations/${id}/complete`, { notes });
    return response.data;
  },

  async cancel(id: string): Promise<Consultation> {
    const response = await api.post<Consultation>(`/consultations/${id}/cancel`);
    return response.data;
  },

  async sendMessage(id: string, content: string): Promise<ConsultationMessage> {
    const response = await api.post<ConsultationMessage>(`/consultations/${id}/messages`, { content });
    return response.data;
  },

  async getMessages(id: string): Promise<ConsultationMessage[]> {
    const response = await api.get<ConsultationMessage[]>(`/consultations/${id}/messages`);
    return response.data;
  },

  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    const response = await api.get<TimeSlot[]>('/consultations/slots', { params: { date } });
    return response.data;
  },

  async getUpcoming(): Promise<Consultation[]> {
    const response = await api.get<Consultation[]>('/consultations/upcoming');
    return response.data;
  },
};
