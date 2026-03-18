import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const analyticsService = new AnalyticsService();

// Tracking endpoint (público - sem auth)
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { path, sessionId, referrer, userId } = req.body;
    if (!path || !sessionId) {
      return res.status(400).json({ error: 'path e sessionId são obrigatórios' });
    }

    await analyticsService.trackPageView({
      path,
      sessionId,
      userId: userId || undefined,
      referrer: referrer || undefined,
      userAgent: req.headers['user-agent'] || undefined,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || undefined,
    });

    res.status(204).end();
  } catch (error) {
    // Silencioso - não queremos que erros de tracking afetem o UX
    res.status(204).end();
  }
});

// Admin analytics endpoint (protegido)
router.get('/metrics', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const from = dateFrom ? new Date(dateFrom as string) : (() => {
      const d = new Date(); d.setDate(d.getDate() - 30); return d;
    })();
    const to = dateTo ? new Date(dateTo as string) : new Date();

    const metrics = await analyticsService.getAccessMetrics(from, to);
    res.json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas de acesso' });
  }
});

export default router;
