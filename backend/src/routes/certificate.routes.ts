import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const certificateController = new CertificateController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar certificados do usuário
router.get('/user/me', (req, res) => certificateController.getUserCertificates(req, res));

// Buscar certificado por ID do diagnóstico
router.get('/diagnosis/:diagnosisId', (req, res) => certificateController.getByDiagnosisId(req, res));

// Buscar benefícios por nível
router.get('/benefits/:level', (req, res) => certificateController.getBenefitsByLevel(req, res));

// Validar certificado
router.get('/validate/:certificateNumber', (req, res) => certificateController.validateCertificate(req, res));

// Buscar certificado por ID (catch-all — must be AFTER specific routes)
router.get('/:certificateId', (req, res) => certificateController.getById(req, res));

// Emitir certificado para um diagnóstico
router.post('/:diagnosisId', (req, res) => certificateController.issueCertificate(req, res));

// Invalidar certificado
router.delete('/:certificateId', (req, res) => certificateController.invalidateCertificate(req, res));

export default router;
