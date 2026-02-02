import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware, superadminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const adminController = new AdminController();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', (req, res) => adminController.getDashboardStats(req, res));

// Usuários
router.get('/users', (req, res) => adminController.listUsers(req, res));
router.get('/users/:userId', (req, res) => adminController.getUserDetails(req, res));
router.put('/users/:userId', (req, res) => adminController.updateUser(req, res));
router.post('/users/:userId/toggle-status', (req, res) => adminController.toggleUserStatus(req, res));

// Criar admin (apenas superadmin)
router.post('/admins', superadminMiddleware, (req, res) => adminController.createAdmin(req, res));

// Consultorias
router.get('/consultations', (req, res) => adminController.listConsultations(req, res));
router.put('/consultations/:consultationId', (req, res) => adminController.updateConsultation(req, res));

// Diagnósticos
router.get('/diagnoses', (req, res) => adminController.listDiagnoses(req, res));

// Assinaturas
router.get('/subscriptions', (req, res) => adminController.listSubscriptions(req, res));
router.put('/subscriptions/:subscriptionId', (req, res) => adminController.updateSubscription(req, res));

// Relatórios
router.get('/reports/metrics', (req, res) => adminController.getMetricsReport(req, res));
router.get('/reports/consultation-hours', (req, res) => adminController.getConsultationHoursReport(req, res));

// Atividades
router.get('/activities', (req, res) => adminController.getRecentActivities(req, res));

export default router;
