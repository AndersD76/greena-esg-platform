import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DiagnosisService } from '../services/diagnosis.service';
import { SubscriptionService } from '../services/subscription.service';

const diagnosisService = new DiagnosisService();
const subscriptionService = new SubscriptionService();

export class DiagnosisController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'superadmin';

      const { framework = 'ESG' } = req.body || {};

      // O tipo vem do plano, nunca do cliente
      const activePlan = await subscriptionService.getActivePlan(userId);
      const type = activePlan.isFreePlan && !isAdmin ? 'demo' : 'full';

      // GRI e ESG_GRI exigem plano pago
      if ((framework === 'GRI' || framework === 'ESG_GRI') && activePlan.isFreePlan && !isAdmin) {
        return res.status(403).json({
          error: 'O framework GRI está disponível apenas para planos pagos.',
          code: 'GRI_REQUIRES_PAID_PLAN',
        });
      }

      // Retomar um diagnóstico em andamento não consome uma nova cota
      const inProgress = await diagnosisService.findInProgress(userId);

      if (!isAdmin && !inProgress) {
        const limit = await subscriptionService.canCreateDiagnosis(userId);
        if (!limit.allowed) {
          return res.status(403).json({
            error: limit.reason,
            code: 'DIAGNOSIS_LIMIT_REACHED',
            currentCount: limit.currentCount,
            limit: limit.limit,
          });
        }
      }

      const diagnosis = await diagnosisService.create(userId, type, framework);

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

  async updateActionStatus(req: AuthRequest, res: Response) {
    try {
      const { actionId } = req.params;
      const { status } = req.body;
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Use: pending, in_progress ou completed' });
      }
      const result = await diagnosisService.updateActionStatus(Number(actionId), status);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSimulatedActions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const simulations = await diagnosisService.getSimulatedActions(id, userId);
      res.json(simulations);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getBenchmarking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const benchmarking = await diagnosisService.getBenchmarking(id, userId);
      res.json(benchmarking);
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
