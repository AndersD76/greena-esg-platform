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
  evaluation: z.enum(['Não se aplica', 'Não é feito', 'É mal feito', 'É feito', 'É bem feito', 'É muito bem feito']),
  observations: z.string().nullable().optional(),
});

// Mantido por compatibilidade, mas não é mais usado no cálculo
export const importanceValues: Record<string, number> = {
  'Sem Importância': 1,
  'Importante': 1,
  'Muito Importante': 1,
  'Crítico': 1,
};

// Novos valores de avaliação: 0 (não contado) ou 1-5
export const evaluationValues: Record<string, number> = {
  'Não se aplica': 0,      // Não é contabilizado no cálculo
  'Não é feito': 1,        // Score 1
  'É mal feito': 2,        // Score 2
  'É feito': 3,            // Score 3
  'É bem feito': 4,        // Score 4
  'É muito bem feito': 5,  // Score 5
};
