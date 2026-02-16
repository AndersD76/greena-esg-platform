import { Router } from 'express';
import { DiagnosisController } from '../controllers/diagnosis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const diagnosisController = new DiagnosisController();

router.use(authMiddleware);

router.post('/', (req, res) => diagnosisController.create(req, res));
router.get('/', (req, res) => diagnosisController.list(req, res));
router.get('/:id', (req, res) => diagnosisController.getById(req, res));
router.post('/:id/complete', (req, res) => diagnosisController.complete(req, res));
router.post('/:id/finalize', (req, res) => diagnosisController.finalize(req, res));
router.post('/:id/complete-simplified', (req, res) => diagnosisController.completeSimplified(req, res));
router.get('/:id/results', (req, res) => diagnosisController.getResults(req, res));
router.get('/:id/progress', (req, res) => diagnosisController.getProgress(req, res));
router.get('/:id/insights', (req, res) => diagnosisController.getInsights(req, res));
router.get('/:id/action-plans', (req, res) => diagnosisController.getActionPlans(req, res));
router.get('/:id/partial-scores', (req, res) => diagnosisController.getPartialScores(req, res));

export default router;
