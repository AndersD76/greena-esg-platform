import prisma from '../config/database';
import { hashPassword } from '../utils/bcrypt';

export class AdminService {
  // ==================== USUÁRIOS ====================

  /**
   * Lista todos os usuários com paginação e filtros
   */
  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, search, role, isActive } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          companyName: true,
          cnpj: true,
          city: true,
          sector: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              diagnoses: true,
              consultations: true,
              certificates: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca detalhes de um usuário específico
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        diagnoses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        consultations: {
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        certificates: {
          orderBy: { issuedAt: 'desc' },
          take: 5,
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Atualiza um usuário (admin pode mudar role, status, etc)
   */
  async updateUser(
    userId: string,
    data: {
      name?: string;
      role?: string;
      isActive?: boolean;
      companyName?: string;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        companyName: true,
      },
    });
  }

  /**
   * Ativa/Desativa um usuário
   */
  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  /**
   * Cria um novo admin
   */
  async createAdmin(data: { email: string; password: string; name: string; role: 'admin' | 'superadmin' }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error('Email já cadastrado');

    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ==================== DASHBOARD STATS ====================

  /**
   * Estatísticas gerais do dashboard admin
   */
  async getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalDiagnoses,
      completedDiagnoses,
      diagnosesThisMonth,
      totalConsultations,
      scheduledConsultations,
      completedConsultations,
      totalCertificates,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, role: 'user' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.diagnosis.count(),
      prisma.diagnosis.count({ where: { status: 'completed' } }),
      prisma.diagnosis.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.consultation.count(),
      prisma.consultation.count({ where: { status: 'scheduled' } }),
      prisma.consultation.count({ where: { status: 'completed' } }),
      prisma.certificate.count(),
      prisma.userSubscription.count({ where: { status: 'active' } }),
    ]);

    // Calcular crescimento
    const userGrowth = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 100;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        growth: Math.round(userGrowth),
      },
      diagnoses: {
        total: totalDiagnoses,
        completed: completedDiagnoses,
        thisMonth: diagnosesThisMonth,
        completionRate: totalDiagnoses > 0 ? Math.round((completedDiagnoses / totalDiagnoses) * 100) : 0,
      },
      consultations: {
        total: totalConsultations,
        scheduled: scheduledConsultations,
        completed: completedConsultations,
      },
      certificates: {
        total: totalCertificates,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
    };
  }

  // ==================== CONSULTORIAS ====================

  /**
   * Lista todas as consultorias com filtros
   */
  async listConsultations(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) where.scheduledAt.gte = dateFrom;
      if (dateTo) where.scheduledAt.lte = dateTo;
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.consultation.count({ where }),
    ]);

    return {
      consultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atualiza consultoria (atribuir consultor, mudar status, etc)
   */
  async updateConsultation(
    consultationId: string,
    data: {
      consultantName?: string;
      status?: string;
      notes?: string;
    }
  ) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // ==================== DIAGNÓSTICOS ====================

  /**
   * Lista todos os diagnósticos
   */
  async listDiagnoses(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) {
    const { page = 1, limit = 20, status, userId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const [diagnoses, total] = await Promise.all([
      prisma.diagnosis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
        },
      }),
      prisma.diagnosis.count({ where }),
    ]);

    return {
      diagnoses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== ASSINATURAS ====================

  /**
   * Lista todas as assinaturas
   */
  async listSubscriptions(params: {
    page?: number;
    limit?: number;
    status?: string;
    planCode?: string;
  }) {
    const { page = 1, limit = 20, status, planCode } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (planCode) {
      where.plan = { code: planCode };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.userSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
          plan: true,
        },
      }),
      prisma.userSubscription.count({ where }),
    ]);

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atualiza assinatura (renovar, cancelar, etc)
   */
  async updateSubscription(
    subscriptionId: string,
    data: {
      status?: string;
      expiresAt?: Date;
      consultationHoursUsed?: number;
    }
  ) {
    return prisma.userSubscription.update({
      where: { id: subscriptionId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
      },
    });
  }

  // ==================== RELATÓRIOS ====================

  /**
   * Gera relatório de métricas por período
   */
  async getMetricsReport(dateFrom: Date, dateTo: Date) {
    const [
      newUsers,
      diagnoses,
      completedDiagnoses,
      consultations,
      certificates,
      subscriptions,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }),
      prisma.diagnosis.count({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }),
      prisma.diagnosis.count({
        where: { completedAt: { gte: dateFrom, lte: dateTo }, status: 'completed' },
      }),
      prisma.consultation.count({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }),
      prisma.certificate.count({
        where: { issuedAt: { gte: dateFrom, lte: dateTo } },
      }),
      prisma.userSubscription.count({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }),
    ]);

    // Score médio dos diagnósticos concluídos
    const avgScoreResult = await prisma.diagnosis.aggregate({
      where: {
        completedAt: { gte: dateFrom, lte: dateTo },
        status: 'completed',
      },
      _avg: {
        overallScore: true,
        environmentalScore: true,
        socialScore: true,
        governanceScore: true,
      },
    });

    return {
      period: { from: dateFrom, to: dateTo },
      metrics: {
        newUsers,
        diagnoses,
        completedDiagnoses,
        consultations,
        certificates,
        subscriptions,
        averageScores: {
          overall: avgScoreResult._avg.overallScore || 0,
          environmental: avgScoreResult._avg.environmentalScore || 0,
          social: avgScoreResult._avg.socialScore || 0,
          governance: avgScoreResult._avg.governanceScore || 0,
        },
      },
    };
  }

  // ==================== ATIVIDADES ====================

  /**
   * Lista atividades recentes
   */
  async getRecentActivities(limit: number = 50) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // ==================== HORAS DE CONSULTORIA ====================

  /**
   * Relatório de horas de consultoria
   */
  async getConsultationHoursReport() {
    const subscriptions = await prisma.userSubscription.findMany({
      where: { status: 'active' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        plan: true,
      },
    });

    return subscriptions.map((sub) => ({
      user: sub.user,
      plan: sub.plan.name,
      hoursTotal: sub.plan.consultationHours,
      hoursUsed: sub.consultationHoursUsed,
      hoursRemaining: sub.plan.consultationHours - sub.consultationHoursUsed,
      usagePercentage:
        sub.plan.consultationHours > 0
          ? Math.round((sub.consultationHoursUsed / sub.plan.consultationHours) * 100)
          : 0,
    }));
  }
}
