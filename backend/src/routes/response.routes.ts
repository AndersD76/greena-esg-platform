import { Router } from 'express';
import { ResponseController } from '../controllers/response.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const responseController = new ResponseController();

router.use(authMiddleware);

router.post('/:diagnosisId', (req, res) => responseController.upsert(req, res));
router.get('/:diagnosisId', (req, res) => responseController.getByDiagnosisId(req, res));
router.get('/:diagnosisId/pillar/:pillarCode', (req, res) => responseController.getByPillar(req, res));

export default router;
