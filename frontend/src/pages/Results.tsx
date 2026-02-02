import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

interface Insight {
  id: number;
  category: string;
  pillar: string;
  title: string;
  description: string;
  priority: number;
}

interface ActionPlan {
  id: number;
  pillar: string;
  action: string;
  urgency: string;
  estimatedInvestment: string;
  deadline: string;
  expectedImpact: number;
  priority: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#7B9965';
  if (score >= 60) return '#EFD4A8';
  if (score >= 40) return '#924131';
  return '#666';
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

      // Load insights
      const insightsData = await diagnosisService.getInsights(diagnosisId);
      setInsights(insightsData);

      // Load action plans
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#EFD4A8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-black mb-2" style={{ color: '#152F27' }}>
            Diagnostico nao encontrado
          </h2>
          <p className="font-semibold mb-6" style={{ color: '#666' }}>
            Nao foi possivel carregar os resultados do diagnostico.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
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

  const urgencyColors = {
    Alta: { bg: '#FEE2E2', text: '#991B1B' },
    Media: { bg: '#FEF3C7', text: '#92400E' },
    Baixa: { bg: '#DBEAFE', text: '#1E40AF' },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>Resultados do Diagnostico ESG</h1>
              <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>
                Concluido em {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Link to="/dashboard">
              <button
                className="px-6 py-3 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: '#152F27', color: '#152F27' }}
              >
                Voltar ao Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Score ESG Geral</h2>
            <div className="text-8xl font-black mb-4" style={{ color: getScoreColor(overallScore) }}>
              {overallScore.toFixed(0)}
            </div>
            <span
              className="inline-block px-6 py-2 rounded-full text-lg font-bold"
              style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
            >
              {getScoreLevel(overallScore)}
            </span>
            <p className="mt-6 text-lg font-semibold max-w-2xl mx-auto" style={{ color: '#666' }}>
              Sua empresa alcancou um score de <strong style={{ color: '#152F27' }}>{overallScore.toFixed(0)}</strong> pontos,
              indicando um nivel <strong style={{ color: '#152F27' }}>{getScoreLevel(overallScore)}</strong> de maturidade ESG.
            </p>
          </div>
        </div>

        {/* Pillar Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-black mb-4" style={{ color: '#152F27' }}>Ambiental</h3>
            <div className="text-5xl font-black mb-3" style={{ color: getScoreColor(environmentalScore) }}>
              {environmentalScore.toFixed(0)}
            </div>
            <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${environmentalScore}%`, backgroundColor: getScoreColor(environmentalScore) }}
              />
            </div>
            <p className="mt-3 font-semibold" style={{ color: '#666' }}>
              {getScoreLevel(environmentalScore)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-black mb-4" style={{ color: '#152F27' }}>Social</h3>
            <div className="text-5xl font-black mb-3" style={{ color: getScoreColor(socialScore) }}>
              {socialScore.toFixed(0)}
            </div>
            <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${socialScore}%`, backgroundColor: getScoreColor(socialScore) }}
              />
            </div>
            <p className="mt-3 font-semibold" style={{ color: '#666' }}>
              {getScoreLevel(socialScore)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-black mb-4" style={{ color: '#152F27' }}>Governanca</h3>
            <div className="text-5xl font-black mb-3" style={{ color: getScoreColor(governanceScore) }}>
              {governanceScore.toFixed(0)}
            </div>
            <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${governanceScore}%`, backgroundColor: getScoreColor(governanceScore) }}
              />
            </div>
            <p className="mt-3 font-semibold" style={{ color: '#666' }}>
              {getScoreLevel(governanceScore)}
            </p>
          </div>
        </div>

        {/* Strategic Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: '#152F27' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                <svg className="w-6 h-6" fill="none" stroke="#92400E" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Insights Estrategicos
            </h2>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-6 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-4 py-1.5 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: categoryColors[insight.category as keyof typeof categoryColors]?.bg || '#E5E7EB',
                          color: categoryColors[insight.category as keyof typeof categoryColors]?.text || '#374151'
                        }}
                      >
                        {insight.category === 'critical' && 'Critico'}
                        {insight.category === 'attention' && 'Atencao'}
                        {insight.category === 'excellent' && 'Excelente'}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: '#7B9965' }}>{insight.pillar}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#666' }}>
                      Prioridade {insight.priority}
                    </span>
                  </div>
                  <h3 className="font-black text-lg mb-2" style={{ color: '#152F27' }}>{insight.title}</h3>
                  <p className="font-semibold leading-relaxed" style={{ color: '#666' }}>{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {actionPlans.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: '#152F27' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-6 h-6" fill="none" stroke="#065F46" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              Plano de Acao
            </h2>
            <p className="font-semibold mb-6" style={{ color: '#666' }}>
              Acoes priorizadas para melhorar seu desempenho ESG, ordenadas por impacto e urgencia.
            </p>
            <div className="space-y-4">
              {actionPlans.map((action, index) => (
                <div
                  key={action.id}
                  className="p-6 rounded-xl border-l-4"
                  style={{ backgroundColor: '#f5f5f5', borderLeftColor: '#7B9965' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-black"
                        style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-sm font-semibold" style={{ color: '#7B9965' }}>{action.pillar}</span>
                        <h3 className="font-black text-lg" style={{ color: '#152F27' }}>{action.action}</h3>
                      </div>
                    </div>
                    <span
                      className="px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: urgencyColors[action.urgency as keyof typeof urgencyColors]?.bg || '#E5E7EB',
                        color: urgencyColors[action.urgency as keyof typeof urgencyColors]?.text || '#374151'
                      }}
                    >
                      {action.urgency}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mt-4">
                    <div>
                      <span className="text-sm font-bold" style={{ color: '#666' }}>Investimento:</span>
                      <p className="font-black" style={{ color: '#152F27' }}>{action.estimatedInvestment}</p>
                    </div>
                    <div>
                      <span className="text-sm font-bold" style={{ color: '#666' }}>Prazo:</span>
                      <p className="font-black" style={{ color: '#152F27' }}>{action.deadline}</p>
                    </div>
                    <div>
                      <span className="text-sm font-bold" style={{ color: '#666' }}>Impacto Esperado:</span>
                      <p className="font-black" style={{ color: getScoreColor(action.expectedImpact) }}>
                        +{action.expectedImpact} pontos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: '#152F27', color: '#152F27' }}
          >
            Voltar ao Dashboard
          </button>
          <button
            onClick={() => navigate(`/diagnosis/${diagnosisId}/report`)}
            className="px-8 py-3 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: '#152F27', color: '#152F27' }}
          >
            Ver Relatorio Completo
          </button>
          <button
            onClick={() => navigate('/diagnosis/new')}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
          >
            Fazer Novo Diagnostico
          </button>
        </div>
      </div>
    </div>
  );
}
