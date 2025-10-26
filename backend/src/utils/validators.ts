import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  sector: z.string().optional(),
  employees: z.number().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const responseSchema = z.object({
  assessmentItemId: z.number(),
  importance: z.enum(['Sem Importância', 'Importante', 'Muito Importante', 'Crítico']),
  evaluation: z.enum(['Não se aplica', 'Não é feito', 'É mal feito', 'É feito', 'É bem feito']),
  observations: z.string().optional(),
});

export const importanceValues: Record<string, number> = {
  'Sem Importância': 0,
  'Importante': 3,
  'Muito Importante': 6,
  'Crítico': 9,
};

export const evaluationValues: Record<string, number> = {
  'Não se aplica': 0,
  'Não é feito': 0,
  'É mal feito': 3,
  'É feito': 6,
  'É bem feito': 9,
};
