import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators';
import { AuthRequest } from '../middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);

      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await authService.updateProfile(userId, req.body);

      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
