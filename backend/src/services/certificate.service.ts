import { PrismaClient } from '@prisma/client';
import { ScoringService } from './scoring.service';

const prisma = new PrismaClient();

export class CertificateService {
  private scoringService: ScoringService;

  constructor() {
    this.scoringService = new ScoringService();
  }

  /**
   * Emite um certificado para um diagnóstico completo
   */
  async issueCertificate(diagnosisId: string, userId: string) {
    // Verificar se o diagnóstico existe e pertence ao usuário
    const diagnosis = await prisma.diagnosis.findFirst({
      where: {
        id: diagnosisId,
        userId: userId,
        status: 'completed'
      }
    });

    if (!diagnosis) {
      throw new Error('Diagnóstico não encontrado ou não está completo');
    }

    // Verificar se o usuário tem assinatura ativa com permissão para certificação
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'active',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        plan: true
      }
    });

    if (!activeSubscription) {
      throw new Error('É necessário ter uma assinatura ativa para emitir certificados');
    }

    // Verificar se o plano permite certificação
    const features = activeSubscription.plan.features as any;
    if (!features.certification) {
      throw new Error('Seu plano atual não inclui emissão de certificados. Faça upgrade para um plano superior.');
    }

    // Verificar se já existe certificado para este diagnóstico
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        diagnosisId: diagnosisId,
        isValid: true
      }
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    // Obter o nível de certificação baseado na pontuação
    const score = Number(diagnosis.overallScore);
    const certificationLevel = this.scoringService.getCertificationLevel(score);

    // Gerar número único do certificado
    const certificateNumber = this.generateCertificateNumber();

    // Criar o certificado
    const certificate = await prisma.certificate.create({
      data: {
        userId: userId,
        diagnosisId: diagnosisId,
        certificateNumber: certificateNumber,
        level: certificationLevel.level,
        score: score,
        issuedAt: new Date(),
        expiresAt: this.calculateExpirationDate(),
        isValid: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true
          }
        },
        diagnosis: true
      }
    });

    return certificate;
  }

  /**
   * Gera um número único para o certificado
   */
  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `GREENA-${year}-${random}`;
  }

  /**
   * Calcula a data de expiração do certificado (1 ano)
   */
  private calculateExpirationDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  /**
   * Busca certificado por ID do diagnóstico
   */
  async getCertificateByDiagnosisId(diagnosisId: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        diagnosisId: diagnosisId,
        isValid: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true
          }
        },
        diagnosis: true
      }
    });

    if (!certificate) {
      return null;
    }

    // Adicionar informações do nível de certificação
    const certificationLevel = this.scoringService.getCertificationLevel(Number(certificate.score));
    const benefits = await this.getBenefitsByLevel(certificate.level);

    return {
      ...certificate,
      certificationLevel,
      benefits
    };
  }

  /**
   * Busca certificado por ID
   */
  async getCertificateById(certificateId: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyName: true
          }
        },
        diagnosis: true
      }
    });

    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }

    const certificationLevel = this.scoringService.getCertificationLevel(Number(certificate.score));
    const benefits = await this.getBenefitsByLevel(certificate.level);

    return {
      ...certificate,
      certificationLevel,
      benefits
    };
  }

  /**
   * Busca todos os certificados de um usuário
   */
  async getUserCertificates(userId: string) {
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: userId,
        isValid: true
      },
      include: {
        diagnosis: true
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    return certificates.map(cert => ({
      ...cert,
      certificationLevel: this.scoringService.getCertificationLevel(Number(cert.score))
    }));
  }

  /**
   * Busca benefícios por nível de certificação
   */
  async getBenefitsByLevel(level: string) {
    const benefits = await prisma.certificationBenefit.findMany({
      where: {
        level: level,
        active: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return benefits;
  }

  /**
   * Valida se um certificado é válido
   */
  async validateCertificate(certificateNumber: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: {
          select: {
            name: true,
            companyName: true
          }
        }
      }
    });

    if (!certificate) {
      return { valid: false, message: 'Certificado não encontrado' };
    }

    if (!certificate.isValid) {
      return { valid: false, message: 'Certificado inválido' };
    }

    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return { valid: false, message: 'Certificado expirado' };
    }

    return {
      valid: true,
      certificate: {
        ...certificate,
        certificationLevel: this.scoringService.getCertificationLevel(Number(certificate.score))
      }
    };
  }

  /**
   * Invalida um certificado
   */
  async invalidateCertificate(certificateId: string, userId: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        userId: userId
      }
    });

    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }

    await prisma.certificate.update({
      where: { id: certificateId },
      data: { isValid: false }
    });

    return { message: 'Certificado invalidado com sucesso' };
  }
}
