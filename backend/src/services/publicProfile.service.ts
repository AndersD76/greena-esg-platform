import prisma from '../config/database';
import { ScoringService } from './scoring.service';

const scoringService = new ScoringService();

export class PublicProfileService {
  /**
   * Gera slug a partir do nome da empresa
   */
  static generateSlug(companyName: string): string {
    return companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Busca perfil público por slug
   */
  async getPublicProfile(slug: string) {
    const user = await prisma.user.findFirst({
      where: { slug, isPublicProfile: true, isActive: true },
      select: {
        companyName: true,
        sector: true,
        city: true,
        slug: true,
      },
    });

    if (!user) return null;

    // Buscar último diagnóstico concluído
    const latestDiagnosis = await prisma.diagnosis.findFirst({
      where: { user: { slug }, status: 'completed' },
      orderBy: { completedAt: 'desc' },
    });

    if (!latestDiagnosis) {
      return { company: user, scores: null, certification: null, certificate: null, completedAt: null };
    }

    const scores = {
      overall: Number(latestDiagnosis.overallScore),
      environmental: Number(latestDiagnosis.environmentalScore),
      social: Number(latestDiagnosis.socialScore),
      governance: Number(latestDiagnosis.governanceScore),
    };

    const certification = scoringService.getCertificationLevel(scores.overall);

    // Buscar certificado válido
    const certificate = await prisma.certificate.findFirst({
      where: { diagnosisId: latestDiagnosis.id, isValid: true },
      orderBy: { issuedAt: 'desc' },
    });

    return {
      company: user,
      scores,
      certification,
      certificate: certificate
        ? {
            number: certificate.certificateNumber,
            level: certificate.level,
            issuedAt: certificate.issuedAt,
            expiresAt: certificate.expiresAt,
            isValid: certificate.isValid,
          }
        : null,
      completedAt: latestDiagnosis.completedAt,
    };
  }

  /**
   * Valida certificado publicamente (sem auth)
   */
  async validateCertificate(certificateNumber: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: {
          select: { companyName: true, sector: true, city: true, slug: true, isPublicProfile: true },
        },
      },
    });

    if (!certificate) return { valid: false, message: 'Certificado não encontrado' };
    if (!certificate.isValid) return { valid: false, message: 'Certificado invalidado' };
    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return { valid: false, message: 'Certificado expirado' };
    }

    const certification = scoringService.getCertificationLevel(Number(certificate.score));

    return {
      valid: true,
      certificate: {
        number: certificate.certificateNumber,
        level: certificate.level,
        score: Number(certificate.score),
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        companyName: certificate.user.companyName,
        sector: certificate.user.sector,
        certification,
        publicProfileSlug: certificate.user.isPublicProfile ? certificate.user.slug : null,
      },
    };
  }
}
