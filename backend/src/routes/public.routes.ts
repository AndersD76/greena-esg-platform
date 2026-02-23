import { Router } from 'express';
import { PublicProfileController } from '../controllers/publicProfile.controller';

const router = Router();
const controller = new PublicProfileController();

// Rotas PÚBLICAS — sem autenticação
router.get('/company/:slug', (req, res) => controller.getPublicProfile(req, res));
router.get('/validate/:certificateNumber', (req, res) => controller.validateCertificate(req, res));

export default router;
