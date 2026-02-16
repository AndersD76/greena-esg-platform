import { Router } from 'express';
import authRoutes from './auth.routes';
import diagnosisRoutes from './diagnosis.routes';
import responseRoutes from './response.routes';
import pillarRoutes from './pillar.routes';
import certificateRoutes from './certificate.routes';
import subscriptionRoutes from './subscription.routes';
import reportRoutes from './report.routes';
import consultationRoutes from './consultation.routes';
import adminRoutes from './admin.routes';
import asaasWebhookRoutes from './asaas-webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/responses', responseRoutes);
router.use('/pillars', pillarRoutes);
router.use('/certificates', certificateRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/reports', reportRoutes);
router.use('/consultations', consultationRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks/asaas', asaasWebhookRoutes);

export default router;
