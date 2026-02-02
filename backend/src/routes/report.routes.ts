import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const reportController = new ReportController();

router.use(authMiddleware);

router.get('/:diagnosisId', (req, res) => reportController.getFullReport(req, res));
router.get('/:diagnosisId/pdf', (req, res) => reportController.getReportForPDF(req, res));

export default router;
