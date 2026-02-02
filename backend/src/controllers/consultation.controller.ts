import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ConsultationService } from '../services/consultation.service';

const consultationService = new ConsultationService();

export class ConsultationController {
  async schedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { scheduledAt, duration, topic } = req.body;

      if (!scheduledAt || !duration) {
        return res.status(400).json({ error: 'Data e duração são obrigatórios' });
      }

      const consultation = await consultationService.schedule(userId, {
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        topic,
      });

      res.status(201).json(consultation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;

      const consultations = await consultationService.list(
        userId,
        status as string | undefined
      );

      res.json(consultations);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const consultation = await consultationService.getById(id, userId);

      res.json(consultation);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async start(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const consultation = await consultationService.start(id, userId);

      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async complete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { notes } = req.body;

      const consultation = await consultationService.complete(id, userId, notes);

      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancel(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const consultation = await consultationService.cancel(id, userId);

      res.json(consultation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
      }

      const message = await consultationService.sendMessage(id, userId, content);

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const messages = await consultationService.getMessages(id, userId);

      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAvailableSlots(req: AuthRequest, res: Response) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Data é obrigatória' });
      }

      const slots = await consultationService.getAvailableSlots(new Date(date as string));

      res.json(slots);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUpcoming(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const consultations = await consultationService.getUpcoming(userId);

      res.json(consultations);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
