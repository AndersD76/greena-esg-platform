import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { AiChatService } from '../services/ai-chat.service';

const router = Router();
const chatService = new AiChatService();

router.use(authMiddleware);

router.get('/chat/status', (_req: AuthRequest, res: Response) => {
  res.json({ enabled: chatService.isEnabled() });
});

router.get('/chat/history', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const messages = await chatService.getHistory(userId);
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/chat/greeting', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const greeting = await chatService.getGreeting(userId);
    res.json({ greeting });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/chat/message', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    const reply = await chatService.sendMessage(userId, message.trim());
    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
