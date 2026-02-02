import prisma from '../config/database';
import { SubscriptionService } from './subscription.service';
import crypto from 'crypto';

const subscriptionService = new SubscriptionService();

export class ConsultationService {
  /**
   * Gera URL única para sala Jitsi
   */
  private generateMeetingUrl(meetingId: string): string {
    return `https://meet.jit.si/greena-${meetingId}`;
  }

  /**
   * Agenda uma nova consultoria
   */
  async schedule(
    userId: string,
    data: {
      scheduledAt: Date;
      duration: number;
      topic?: string;
    }
  ) {
    // Verificar horas disponíveis
    const remainingHours = await subscriptionService.getRemainingHours(userId);
    const hoursNeeded = data.duration / 60;

    if (remainingHours.remaining < hoursNeeded) {
      throw new Error(
        `Horas de consultoria insuficientes. Disponível: ${remainingHours.remaining}h, Necessário: ${hoursNeeded}h`
      );
    }

    // Verificar se não há conflito de horário
    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        userId,
        status: { in: ['scheduled', 'in_progress'] },
        scheduledAt: {
          gte: new Date(data.scheduledAt.getTime() - 60 * 60 * 1000), // 1 hora antes
          lte: new Date(data.scheduledAt.getTime() + data.duration * 60 * 1000), // duração após
        },
      },
    });

    if (existingConsultation) {
      throw new Error('Já existe uma consultoria agendada neste horário');
    }

    // Gerar ID único para a sala
    const meetingId = crypto.randomBytes(4).toString('hex');
    const meetingUrl = this.generateMeetingUrl(meetingId);

    // Criar consultoria
    const consultation = await prisma.consultation.create({
      data: {
        userId,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        topic: data.topic,
        meetingId,
        meetingUrl,
        consultantName: 'Consultor Greena ESG', // Pode ser dinâmico no futuro
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    // Registrar atividade
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'consultation_scheduled',
        description: `Consultoria agendada para ${data.scheduledAt.toLocaleDateString('pt-BR')}`,
      },
    });

    return consultation;
  }

  /**
   * Lista consultorias do usuário
   */
  async list(userId: string, status?: string) {
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    return prisma.consultation.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * Busca consultoria por ID
   */
  async getById(id: string, userId: string) {
    const consultation = await prisma.consultation.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!consultation) {
      throw new Error('Consultoria não encontrada');
    }

    return consultation;
  }

  /**
   * Inicia uma consultoria
   */
  async start(id: string, userId: string) {
    const consultation = await this.getById(id, userId);

    if (consultation.status !== 'scheduled') {
      throw new Error('Esta consultoria não pode ser iniciada');
    }

    return prisma.consultation.update({
      where: { id },
      data: {
        status: 'in_progress',
      },
    });
  }

  /**
   * Finaliza uma consultoria e registra as horas usadas
   */
  async complete(id: string, userId: string, notes?: string) {
    const consultation = await this.getById(id, userId);

    if (consultation.status !== 'in_progress') {
      throw new Error('Esta consultoria não pode ser finalizada');
    }

    // Registrar horas usadas
    const hoursUsed = consultation.duration / 60;
    await subscriptionService.trackConsultationHours(userId, hoursUsed);

    // Atualizar consultoria
    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        status: 'completed',
        notes,
      },
    });

    // Registrar atividade
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'consultation_completed',
        description: `Consultoria finalizada. ${hoursUsed}h registradas.`,
      },
    });

    return updated;
  }

  /**
   * Cancela uma consultoria
   */
  async cancel(id: string, userId: string) {
    const consultation = await this.getById(id, userId);

    if (!['scheduled', 'in_progress'].includes(consultation.status)) {
      throw new Error('Esta consultoria não pode ser cancelada');
    }

    // Atualizar status
    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });

    // Registrar atividade
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'consultation_cancelled',
        description: 'Consultoria cancelada',
      },
    });

    return updated;
  }

  /**
   * Envia uma mensagem no chat da consultoria
   */
  async sendMessage(
    consultationId: string,
    userId: string,
    content: string,
    senderType: 'user' | 'consultant' = 'user'
  ) {
    const consultation = await this.getById(consultationId, userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const message = await prisma.consultationMessage.create({
      data: {
        consultationId,
        senderId: userId,
        senderName: senderType === 'consultant' ? 'Consultor Greena' : user?.name || 'Usuário',
        senderType,
        content,
      },
    });

    return message;
  }

  /**
   * Busca mensagens de uma consultoria
   */
  async getMessages(consultationId: string, userId: string) {
    // Verificar acesso
    await this.getById(consultationId, userId);

    return prisma.consultationMessage.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Obtém horários disponíveis para agendamento
   */
  async getAvailableSlots(date: Date) {
    // Horários padrão de funcionamento: 9h às 18h
    const slots: { time: string; available: boolean }[] = [];
    const startHour = 9;
    const endHour = 18;

    // Buscar consultorias já agendadas neste dia
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const scheduledConsultations = await prisma.consultation.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['scheduled', 'in_progress'] },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Gerar slots
    for (let hour = startHour; hour < endHour; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);

      // Verificar se o horário está ocupado
      const isOccupied = scheduledConsultations.some((c) => {
        const consultStart = new Date(c.scheduledAt);
        const consultEnd = new Date(consultStart.getTime() + c.duration * 60 * 1000);
        return slotTime >= consultStart && slotTime < consultEnd;
      });

      // Verificar se o horário não é no passado
      const now = new Date();
      const isPast = slotTime < now;

      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: !isOccupied && !isPast,
      });
    }

    return slots;
  }

  /**
   * Obtém próximas consultorias do usuário
   */
  async getUpcoming(userId: string) {
    return prisma.consultation.findMany({
      where: {
        userId,
        status: 'scheduled',
        scheduledAt: {
          gte: new Date(),
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });
  }
}
