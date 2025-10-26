import { Router } from 'express';
import authRoutes from './auth.routes';
import diagnosisRoutes from './diagnosis.routes';
import responseRoutes from './response.routes';
import pillarRoutes from './pillar.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/responses', responseRoutes);
router.use('/pillars', pillarRoutes);

export default router;
