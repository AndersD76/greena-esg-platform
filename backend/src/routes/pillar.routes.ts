import { Router } from 'express';
import { PillarController } from '../controllers/pillar.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePaidPlan } from '../middlewares/plan.middleware';

const router = Router();
const pillarController = new PillarController();

router.get('/', (req, res) => pillarController.list(req, res));

// O banco de questões do diagnóstico completo é conteúdo de plano pago
router.get('/questions/all', authMiddleware, requirePaidPlan, (req, res) => pillarController.getAllQuestions(req, res));
router.get('/:code/assessment', authMiddleware, requirePaidPlan, (req, res) => pillarController.getAssessment(req, res));

export default router;
