import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CertificateService } from '../services/certificate.service';

const certificateService = new CertificateService();

export class CertificateController {
  /**
   * Emite um certificado para um diagnóstico
   * POST /api/certificates/:diagnosisId
   */
  async issueCertificate(req: AuthRequest, res: Response) {
    try {
      const { diagnosisId } = req.params;
      const userId = req.user!.userId;

      const certificate = await certificateService.issueCertificate(diagnosisId, userId);

      res.status(201).json(certificate);
    } catch (error: any) {
      console.error('Erro ao emitir certificado:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca certificado por ID do diagnóstico
   * GET /api/certificates/diagnosis/:diagnosisId
   */
  async getByDiagnosisId(req: AuthRequest, res: Response) {
    try {
      const { diagnosisId } = req.params;

      const certificate = await certificateService.getCertificateByDiagnosisId(diagnosisId);

      if (!certificate) {
        return res.status(404).json({ error: 'Certificado não encontrado' });
      }

      res.json(certificate);
    } catch (error: any) {
      console.error('Erro ao buscar certificado:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca certificado por ID
   * GET /api/certificates/:certificateId
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const { certificateId } = req.params;

      const certificate = await certificateService.getCertificateById(certificateId);

      res.json(certificate);
    } catch (error: any) {
      console.error('Erro ao buscar certificado:', error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Lista todos os certificados do usuário
   * GET /api/certificates/user/me
   */
  async getUserCertificates(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const certificates = await certificateService.getUserCertificates(userId);

      res.json(certificates);
    } catch (error: any) {
      console.error('Erro ao listar certificados:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca benefícios por nível
   * GET /api/certificates/benefits/:level
   */
  async getBenefitsByLevel(req: AuthRequest, res: Response) {
    try {
      const { level } = req.params;

      if (!['bronze', 'silver', 'gold'].includes(level)) {
        return res.status(400).json({ error: 'Nível inválido. Use: bronze, silver ou gold' });
      }

      const benefits = await certificateService.getBenefitsByLevel(level);

      res.json(benefits);
    } catch (error: any) {
      console.error('Erro ao buscar benefícios:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Valida um certificado por número
   * GET /api/certificates/validate/:certificateNumber
   */
  async validateCertificate(req: AuthRequest, res: Response) {
    try {
      const { certificateNumber } = req.params;

      const validation = await certificateService.validateCertificate(certificateNumber);

      res.json(validation);
    } catch (error: any) {
      console.error('Erro ao validar certificado:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Invalida um certificado
   * DELETE /api/certificates/:certificateId
   */
  async invalidateCertificate(req: AuthRequest, res: Response) {
    try {
      const { certificateId } = req.params;
      const userId = req.user!.userId;

      const result = await certificateService.invalidateCertificate(certificateId, userId);

      res.json(result);
    } catch (error: any) {
      console.error('Erro ao invalidar certificado:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
