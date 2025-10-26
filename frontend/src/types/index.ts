export type ImportanceLevel = 'Sem Importância' | 'Importante' | 'Muito Importante' | 'Crítico';
export type EvaluationLevel = 'Não se aplica' | 'Não é feito' | 'É mal feito' | 'É feito' | 'É bem feito';

export const IMPORTANCE_OPTIONS: ImportanceLevel[] = [
  'Sem Importância',
  'Importante',
  'Muito Importante',
  'Crítico',
];

export const EVALUATION_OPTIONS: EvaluationLevel[] = [
  'Não se aplica',
  'Não é feito',
  'É mal feito',
  'É feito',
  'É bem feito',
];

export function getScoreColor(score: number): string {
  if (score < 26) return 'text-red-600';
  if (score < 51) return 'text-orange-600';
  if (score < 71) return 'text-yellow-600';
  if (score < 86) return 'text-green-500';
  return 'text-green-700';
}

export function getScoreLevel(score: number): string {
  if (score < 26) return 'Crítico';
  if (score < 51) return 'Atenção';
  if (score < 71) return 'Bom';
  if (score < 86) return 'Muito Bom';
  return 'Excelente';
}
