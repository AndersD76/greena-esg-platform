import { Router } from 'express';
import { PillarController } from '../controllers/pillar.controller';

const router = Router();
const pillarController = new PillarController();

router.get('/', (req, res) => pillarController.list(req, res));
router.get('/questions/all', (req, res) => pillarController.getAllQuestions(req, res));
router.get('/:code/assessment', (req, res) => pillarController.getAssessment(req, res));

export default router;
