import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ResponseService } from '../services/response.service';
import { responseSchema } from '../utils/validators';

const responseService = new ResponseService();

export class ResponseController {
  async upsert(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { diagnosisId } = req.params;
      const data = responseSchema.parse(req.body);
      const response = await responseService.upsert(diagnosisId, userId, data);

      res.json(response);
    } catch (error: any) {
      console.error('❌ Erro no upsert:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getByDiagnosisId(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { diagnosisId } = req.params;
      const responses = await responseService.getByDiagnosisId(diagnosisId, userId);

      res.json(responses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByPillar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { diagnosisId, pillarCode } = req.params;
      const responses = await responseService.getByPillar(diagnosisId, userId, pillarCode);

      res.json(responses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
