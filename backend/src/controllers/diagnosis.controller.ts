import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DiagnosisService } from '../services/diagnosis.service';

const diagnosisService = new DiagnosisService();

export class DiagnosisController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const diagnosis = await diagnosisService.create(userId);

      res.status(201).json(diagnosis);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const diagnoses = await diagnosisService.list(userId);

      res.json(diagnoses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const diagnosis = await diagnosisService.getById(id, userId);

      res.json(diagnosis);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async complete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await diagnosisService.complete(id, userId);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getResults(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const results = await diagnosisService.getResults(id, userId);

      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const progress = await diagnosisService.getProgress(id, userId);

      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async finalize(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await diagnosisService.finalize(id, userId);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const insights = await diagnosisService.getInsights(id, userId);

      res.json(insights);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getActionPlans(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const actionPlans = await diagnosisService.getActionPlans(id, userId);

      res.json(actionPlans);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeSimplified(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { scores } = req.body;

      if (!scores || typeof scores.environmental !== 'number' || typeof scores.social !== 'number' || typeof scores.governance !== 'number') {
        return res.status(400).json({ error: 'Scores inválidos' });
      }

      const result = await diagnosisService.completeSimplified(id, userId, scores);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPartialScores(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const partialScores = await diagnosisService.getPartialScores(id, userId);

      res.json(partialScores);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
