import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  cnpj?: string;
  sector?: string;
  employees?: number;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
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
        sector: data.sector,
        employees: data.employees,
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
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
        companyName: true,
        cnpj: true,
        sector: true,
        employees: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<RegisterData>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        companyName: data.companyName,
        cnpj: data.cnpj,
        sector: data.sector,
        employees: data.employees,
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        cnpj: true,
        sector: true,
        employees: true,
      },
    });

    return user;
  }
}
