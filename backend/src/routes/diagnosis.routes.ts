import { Router } from 'express';
import { DiagnosisController } from '../controllers/diagnosis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePaidPlan } from '../middlewares/plan.middleware';

const router = Router();
const diagnosisController = new DiagnosisController();

router.use(authMiddleware);

// Disponível em todos os planos (o gratuito usa o fluxo demo)
router.post('/', (req, res) => diagnosisController.create(req, res));
router.get('/', (req, res) => diagnosisController.list(req, res));
router.get('/:id', (req, res) => diagnosisController.getById(req, res));
router.post('/:id/complete-simplified', (req, res) => diagnosisController.completeSimplified(req, res));
router.get('/:id/progress', (req, res) => diagnosisController.getProgress(req, res));
router.get('/:id/partial-scores', (req, res) => diagnosisController.getPartialScores(req, res));
router.get('/:id/benchmarking', (req, res) => diagnosisController.getBenchmarking(req, res));

// Exclusivo dos planos pagos (questionário completo, relatórios e planos de ação)
router.post('/:id/complete', requirePaidPlan, (req, res) => diagnosisController.complete(req, res));
router.post('/:id/finalize', requirePaidPlan, (req, res) => diagnosisController.finalize(req, res));
router.get('/:id/results', requirePaidPlan, (req, res) => diagnosisController.getResults(req, res));
router.get('/:id/insights', requirePaidPlan, (req, res) => diagnosisController.getInsights(req, res));
router.get('/:id/action-plans', requirePaidPlan, (req, res) => diagnosisController.getActionPlans(req, res));
router.get('/:id/simulate-actions', requirePaidPlan, (req, res) => diagnosisController.getSimulatedActions(req, res));
router.patch('/:id/action-plans/:actionId/status', requirePaidPlan, (req, res) => diagnosisController.updateActionStatus(req, res));

export default router;
