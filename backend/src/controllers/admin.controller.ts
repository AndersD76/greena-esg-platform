import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AdminService } from '../services/admin.service';

const adminService = new AdminService();

export class AdminController {
  // ==================== USUÁRIOS ====================

  async listUsers(req: AuthRequest, res: Response) {
    try {
      const { page, limit, search, role, isActive } = req.query;
      const result = await adminService.listUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        role: role as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserDetails(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const user = await adminService.getUserDetails(userId);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const data = req.body;
      const user = await adminService.updateUser(userId, data);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const user = await adminService.toggleUserStatus(userId);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createAdmin(req: AuthRequest, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ error: 'Role inválida' });
      }

      const admin = await adminService.createAdmin({ email, password, name, role });
      res.status(201).json(admin);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== CONSULTORIAS ====================

  async listConsultations(req: AuthRequest, res: Response) {
    try {
      const { page, limit, status, dateFrom, dateTo } = req.query;
      const result = await adminService.listConsultations({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateConsultation(req: AuthRequest, res: Response) {
    try {
      const { consultationId } = req.params;
      const data = req.body;
      const consultation = await adminService.updateConsultation(consultationId, data);
      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== DIAGNÓSTICOS ====================

  async listDiagnoses(req: AuthRequest, res: Response) {
    try {
      const { page, limit, status, userId } = req.query;
      const result = await adminService.listDiagnoses({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
        userId: userId as string,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== ASSINATURAS ====================

  async listSubscriptions(req: AuthRequest, res: Response) {
    try {
      const { page, limit, status, planCode } = req.query;
      const result = await adminService.listSubscriptions({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
        planCode: planCode as string,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSubscription(req: AuthRequest, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const data = req.body;
      const subscription = await adminService.updateSubscription(subscriptionId, data);
      res.json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== RELATÓRIOS ====================

  async getMetricsReport(req: AuthRequest, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ error: 'Período é obrigatório' });
      }

      const report = await adminService.getMetricsReport(
        new Date(dateFrom as string),
        new Date(dateTo as string)
      );
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== ATIVIDADES ====================

  async getRecentActivities(req: AuthRequest, res: Response) {
    try {
      const { limit } = req.query;
      const activities = await adminService.getRecentActivities(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== HORAS ====================

  async getConsultationHoursReport(req: AuthRequest, res: Response) {
    try {
      const report = await adminService.getConsultationHoursReport();
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
