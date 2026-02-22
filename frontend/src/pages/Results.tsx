import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

interface Insight {
  id: number;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  pillar?: { id: number; code: string; name: string } | null;
}

interface ActionPlan {
  id: number;
  title: string;
  description?: string;
  priority: string;
  priorityLabel: string;
  investment: string;
  investmentLabel: string;
  deadlineDays: number;
  status: string;
  impactScore: number;
}

const PILLAR_COLORS = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#b8963a',
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#7B9965';
  if (score >= 60) return '#EFD4A8';
  if (score >= 40) return '#924131';
  return '#9ca3af';
};

const getScoreLevel = (score: number) => {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Necessita Melhoria';
};

export default function Results() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [diagnosisId]);

  async function loadResults() {
    if (!diagnosisId) return;

    try {
      setLoading(true);
      const diagnosisData = await diagnosisService.getById(diagnosisId);
      setDiagnosis(diagnosisData);

      const insightsData = await diagnosisService.getInsights(diagnosisId);
      setInsights(insightsData);

      const actionPlansData = await diagnosisService.getActionPlans(diagnosisId);
      setActionPlans(actionPlansData);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-brand-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-brand-900 mb-3">Diagnóstico não encontrado</h2>
          <p className="text-sm text-gray-500 mb-6">Não foi possível carregar os resultados do diagnóstico.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overallScore = Number(diagnosis.overallScore);
  const environmentalScore = Number(diagnosis.environmentalScore);
  const socialScore = Number(diagnosis.socialScore);
  const governanceScore = Number(diagnosis.governanceScore);

  const categoryColors = {
    critical: { bg: '#FEE2E2', text: '#991B1B' },
    attention: { bg: '#FEF3C7', text: '#92400E' },
    excellent: { bg: '#D1FAE5', text: '#065F46' },
  };

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-900 mb-1">Resultados do Diagnóstico ESG</h1>
              <p className="text-sm text-gray-500">
                Concluído em {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Link to="/dashboard">
              <button className="px-5 py-2 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                Voltar ao Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-brand-900 mb-4">Score ESG Geral</h2>
            <p className="text-7xl font-bold mb-4" style={{ color: getScoreColor(overallScore) }}>
              {overallScore.toFixed(0)}
            </p>
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: getScoreColor(overallScore) + '15', color: getScoreColor(overallScore) }}
            >
              {getScoreLevel(overallScore)}
            </span>
            <p className="mt-6 text-sm text-gray-500 max-w-2xl mx-auto">
              Sua empresa alcançou um score de <strong className="text-brand-900">{overallScore.toFixed(0)}</strong> pontos,
              indicando um nível <strong className="text-brand-900">{getScoreLevel(overallScore)}</strong> de maturidade ESG.
            </p>
          </div>
        </div>

        {/* Pillar Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" style={{ backgroundColor: '#f5ffeb' }}>
            <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Ambiental</p>
            <p className="text-5xl font-bold mb-3" style={{ color: PILLAR_COLORS.environmental }}>
              {environmentalScore.toFixed(0)}
            </p>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${environmentalScore}%`, backgroundColor: PILLAR_COLORS.environmental }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">{getScoreLevel(environmentalScore)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" style={{ backgroundColor: '#fdf5f3' }}>
            <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Social</p>
            <p className="text-5xl font-bold mb-3" style={{ color: PILLAR_COLORS.social }}>
              {socialScore.toFixed(0)}
            </p>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${socialScore}%`, backgroundColor: PILLAR_COLORS.social }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">{getScoreLevel(socialScore)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" style={{ backgroundColor: '#fdf8ef' }}>
            <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Governança</p>
            <p className="text-5xl font-bold mb-3" style={{ color: PILLAR_COLORS.governance }}>
              {governanceScore.toFixed(0)}
            </p>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${governanceScore}%`, backgroundColor: PILLAR_COLORS.governance }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">{getScoreLevel(governanceScore)}</p>
          </div>
        </div>

        {/* Strategic Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold text-brand-900 mb-6">Insights Estratégicos</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-5 rounded-xl bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: categoryColors[insight.category as keyof typeof categoryColors]?.bg || '#E5E7EB',
                          color: categoryColors[insight.category as keyof typeof categoryColors]?.text || '#374151'
                        }}
                      >
                        {insight.categoryLabel || (insight.category === 'critical' ? 'Crítico' : insight.category === 'attention' ? 'Atenção' : 'Excelente')}
                      </span>
                      {insight.pillar && (
                        <span className="text-xs font-medium text-brand-700">{insight.pillar.name}</span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-brand-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {actionPlans.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold text-brand-900 mb-2">Plano de Ação</h2>
            <p className="text-sm text-gray-500 mb-6">
              Ações priorizadas para melhorar seu desempenho ESG, ordenadas por impacto e urgência.
            </p>
            <div className="space-y-3">
              {actionPlans.map((action, index) => {
                const priorityColors: Record<string, { bg: string; text: string }> = {
                  critical: { bg: '#FEE2E2', text: '#991B1B' },
                  high: { bg: '#FEF3C7', text: '#92400E' },
                  medium: { bg: '#DBEAFE', text: '#1E40AF' },
                  low: { bg: '#E5E7EB', text: '#374151' },
                };
                const pColor = priorityColors[action.priority] || priorityColors.medium;

                return (
                  <div
                    key={action.id}
                    className="p-5 rounded-xl bg-gray-50 border-l-4"
                    style={{ borderLeftColor: PILLAR_COLORS.environmental }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm bg-brand-900">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-brand-900">
                            {action.title.replace(/^\d+\.\s*/, '')}
                          </h3>
                          {action.description && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {action.description.substring(0, 120)}{action.description.length > 120 ? '...' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: pColor.bg, color: pColor.text }}
                      >
                        {action.priorityLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Investimento</span>
                        <p className="text-sm font-bold text-brand-900">{action.investmentLabel}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Prazo</span>
                        <p className="text-sm font-bold text-brand-900">{action.deadlineDays} dias</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Impacto</span>
                        <p className="text-sm font-bold" style={{ color: getScoreColor(Number(action.impactScore) * 10) }}>
                          {Number(action.impactScore)}/10
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
          >
            Voltar ao Dashboard
          </button>
          <button
            onClick={() => navigate(`/diagnosis/${diagnosisId}/report`)}
            className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
          >
            Ver Relatório Completo
          </button>
          <button
            onClick={() => navigate('/diagnosis/new')}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
          >
            Fazer Novo Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
}
