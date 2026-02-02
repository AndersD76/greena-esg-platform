import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ReportService } from '../services/report.service';

const reportService = new ReportService();

export class ReportController {
  async getFullReport(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { diagnosisId } = req.params;
      const report = await reportService.generateFullReport(diagnosisId, userId);

      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getReportForPDF(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { diagnosisId } = req.params;
      const report = await reportService.getReportForPDF(diagnosisId, userId);

      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
