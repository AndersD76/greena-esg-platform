import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const subscriptionController = new SubscriptionController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Obter plano ativo do usuário
router.get('/active', (req, res) => subscriptionController.getActivePlan(req, res));

// Verificar se pode criar diagnóstico
router.get('/can-create-diagnosis', (req, res) => subscriptionController.canCreateDiagnosis(req, res));

// Obter horas de consultoria restantes
router.get('/remaining-hours', (req, res) => subscriptionController.getRemainingHours(req, res));

// Obter estatísticas de uso
router.get('/usage-stats', (req, res) => subscriptionController.getUserUsageStats(req, res));

// Listar planos disponíveis
router.get('/plans', (req, res) => subscriptionController.getAvailablePlans(req, res));

// Obter plano por código
router.get('/plans/:code', (req, res) => subscriptionController.getPlanByCode(req, res));

// Obter QR Code PIX de um pagamento
router.get('/pix-qrcode/:paymentId', (req, res) => subscriptionController.getPixQrCode(req, res));

// Verificar status de um pagamento (polling)
router.get('/payment-status/:paymentId', (req, res) => subscriptionController.getPaymentStatus(req, res));

// Criar nova assinatura
router.post('/', (req, res) => subscriptionController.createSubscription(req, res));

// Registrar uso de horas de consultoria
router.post('/track-hours', (req, res) => subscriptionController.trackConsultationHours(req, res));

// Atualizar assinatura
router.put('/', (req, res) => subscriptionController.updateSubscription(req, res));

// Cancelar assinatura
router.delete('/', (req, res) => subscriptionController.cancelSubscription(req, res));

export default router;
