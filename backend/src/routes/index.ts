import { Router } from 'express';
import authRoutes from './auth.routes';
import diagnosisRoutes from './diagnosis.routes';
import responseRoutes from './response.routes';
import pillarRoutes from './pillar.routes';
import certificateRoutes from './certificate.routes';
import subscriptionRoutes from './subscription.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/responses', responseRoutes);
router.use('/pillars', pillarRoutes);
router.use('/certificates', certificateRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
