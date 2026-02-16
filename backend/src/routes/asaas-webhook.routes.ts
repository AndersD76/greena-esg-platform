import { Router } from 'express';
import { AsaasWebhookController } from '../controllers/asaas-webhook.controller';

const router = Router();
const webhookController = new AsaasWebhookController();

// Rota pública (sem autenticação JWT) - acessada pelo Asaas
router.post('/', (req, res) => webhookController.handleWebhook(req, res));

export default router;
