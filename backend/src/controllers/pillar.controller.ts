import { Request, Response } from 'express';
import { PillarService } from '../services/pillar.service';

const pillarService = new PillarService();

export class PillarController {
  async list(req: Request, res: Response) {
    try {
      const pillars = await pillarService.list();
      res.json(pillars);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAssessment(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const assessment = await pillarService.getAssessment(code);
      res.json(assessment);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllQuestions(req: Request, res: Response) {
    try {
      const questions = await pillarService.getAllQuestions();
      res.json(questions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
