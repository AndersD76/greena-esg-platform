import { Request, Response } from 'express';
import { PublicProfileService } from '../services/publicProfile.service';

const publicProfileService = new PublicProfileService();

export class PublicProfileController {
  async getPublicProfile(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const profile = await publicProfileService.getPublicProfile(slug);
      if (!profile) return res.status(404).json({ error: 'Empresa não encontrada' });
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async validateCertificate(req: Request, res: Response) {
    try {
      const { certificateNumber } = req.params;
      const result = await publicProfileService.validateCertificate(certificateNumber);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
