export type EvaluationLevel = 'Não se aplica' | 'Não iniciado' | 'Planejado' | 'Em andamento' | 'Implementado parcialmente' | 'Totalmente implementado';

export type MaturityStage = 'N/A' | 'ELEMENTAR' | 'NÃO INTEGRADO' | 'GERENCIAL' | 'ESTRATÉGICO' | 'TRANSFORMADOR';

export const EVALUATION_OPTIONS: { value: EvaluationLevel; score: number; maturity: MaturityStage }[] = [
  { value: 'Não se aplica', score: 0, maturity: 'N/A' },
  { value: 'Não iniciado', score: 1, maturity: 'ELEMENTAR' },
  { value: 'Planejado', score: 2, maturity: 'NÃO INTEGRADO' },
  { value: 'Em andamento', score: 3, maturity: 'GERENCIAL' },
  { value: 'Implementado parcialmente', score: 4, maturity: 'ESTRATÉGICO' },
  { value: 'Totalmente implementado', score: 5, maturity: 'TRANSFORMADOR' },
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
