import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  sector: z.string().optional(),
  employees: z.number().optional(),
  esgPainPoint: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const responseSchema = z.object({
  assessmentItemId: z.number(),
  evaluation: z.enum(['Não se aplica', 'Não iniciado', 'Planejado', 'Em andamento', 'Implementado parcialmente', 'Totalmente implementado']),
  observations: z.string().nullable().optional(),
});

// Escala de maturidade ESG: 0-5
export const evaluationValues: Record<string, number> = {
  'Não se aplica': 0,                // N/A - Não contabilizado
  'Não iniciado': 1,                 // ELEMENTAR
  'Planejado': 2,                    // NÃO INTEGRADO
  'Em andamento': 3,                 // GERENCIAL
  'Implementado parcialmente': 4,    // ESTRATÉGICO
  'Totalmente implementado': 5,      // TRANSFORMADOR
};
