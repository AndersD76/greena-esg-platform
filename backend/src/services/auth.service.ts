import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { PublicProfileService } from './publicProfile.service';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  esgPainPoint?: string;
  companyName?: string;
  cnpj?: string;
  city?: string;
  foundingYear?: number;
  responsiblePerson?: string;
  responsibleContact?: string;
  companySize?: string;
  sector?: string;
  employeesRange?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        companyName: data.companyName,
        cnpj: data.cnpj,
        city: data.city,
        foundingYear: data.foundingYear,
        responsiblePerson: data.responsiblePerson,
        responsibleContact: data.responsibleContact,
        companySize: data.companySize,
        sector: data.sector,
        employeesRange: data.employeesRange,
        esgPainPoint: data.esgPainPoint,
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: 'user' });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: 'user' });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new Error('Conta desativada. Entre em contato com o suporte.');
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        cnpj: true,
        city: true,
        foundingYear: true,
        responsiblePerson: true,
        responsibleContact: true,
        companySize: true,
        sector: true,
        employeesRange: true,
        slug: true,
        isPublicProfile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<RegisterData> & { isPublicProfile?: boolean }) {
    // Se está ativando perfil público e não tem slug, gerar
    let slug: string | undefined;
    if (data.isPublicProfile === true) {
      const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { slug: true, companyName: true } });
      if (!currentUser?.slug) {
        const companyName = data.companyName || currentUser?.companyName;
        if (companyName) {
          let baseSlug = PublicProfileService.generateSlug(companyName);
          // Verificar unicidade
          const existing = await prisma.user.findUnique({ where: { slug: baseSlug } });
          if (existing) {
            baseSlug = baseSlug + '-' + Math.random().toString(36).substring(2, 6);
          }
          slug = baseSlug;
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        companyName: data.companyName,
        cnpj: data.cnpj,
        city: data.city,
        foundingYear: data.foundingYear,
        responsiblePerson: data.responsiblePerson,
        responsibleContact: data.responsibleContact,
        companySize: data.companySize,
        sector: data.sector,
        employeesRange: data.employeesRange,
        ...(data.isPublicProfile !== undefined ? { isPublicProfile: data.isPublicProfile } : {}),
        ...(slug ? { slug } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        cnpj: true,
        city: true,
        foundingYear: true,
        responsiblePerson: true,
        responsibleContact: true,
        companySize: true,
        sector: true,
        employeesRange: true,
        slug: true,
        isPublicProfile: true,
      },
    });

    return user;
  }
}
