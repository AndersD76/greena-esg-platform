import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const consultationController = new ConsultationController();

router.use(authMiddleware);

// Agendamento
router.post('/', (req, res) => consultationController.schedule(req, res));
router.get('/slots', (req, res) => consultationController.getAvailableSlots(req, res));

// Listagem
router.get('/', (req, res) => consultationController.list(req, res));
router.get('/upcoming', (req, res) => consultationController.getUpcoming(req, res));

// Operações em consultoria específica
router.get('/:id', (req, res) => consultationController.getById(req, res));
router.post('/:id/start', (req, res) => consultationController.start(req, res));
router.post('/:id/complete', (req, res) => consultationController.complete(req, res));
router.post('/:id/cancel', (req, res) => consultationController.cancel(req, res));

// Mensagens
router.get('/:id/messages', (req, res) => consultationController.getMessages(req, res));
router.post('/:id/messages', (req, res) => consultationController.sendMessage(req, res));

export default router;
