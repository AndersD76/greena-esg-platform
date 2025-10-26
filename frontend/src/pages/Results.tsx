import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { getScoreColor, getScoreLevel } from '../types';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Diagnóstico não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Não foi possível carregar os resultados do diagnóstico.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const overallScore = Number(diagnosis.overallScore);
  const environmentalScore = Number(diagnosis.environmentalScore);
  const socialScore = Number(diagnosis.socialScore);
  const governanceScore = Number(diagnosis.governanceScore);

  const categoryColors = {
    critical: 'bg-red-100 text-red-800',
    attention: 'bg-yellow-100 text-yellow-800',
    excellent: 'bg-green-100 text-green-800',
  };

  const urgencyColors = {
    Alta: 'bg-red-100 text-red-800',
    Média: 'bg-yellow-100 text-yellow-800',
    Baixa: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resultados do Diagnóstico ESG</h1>
              <p className="text-gray-600 mt-2">
                Concluído em {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Score ESG Geral</h2>
            <div className={`text-7xl font-bold mb-4 ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(0)}
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              {getScoreLevel(overallScore)}
            </Badge>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Sua empresa alcançou um score de <strong>{overallScore.toFixed(0)}</strong> pontos,
              indicando um nível <strong>{getScoreLevel(overallScore)}</strong> de maturidade ESG.
            </p>
          </div>
        </Card>

        {/* Pillar Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Ambiental</h3>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(environmentalScore)}`}>
              {environmentalScore.toFixed(0)}
            </div>
            <ProgressBar progress={environmentalScore} showPercentage={false} />
            <p className="mt-3 text-sm text-gray-600">
              {getScoreLevel(environmentalScore)}
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Social</h3>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(socialScore)}`}>
              {socialScore.toFixed(0)}
            </div>
            <ProgressBar progress={socialScore} showPercentage={false} />
            <p className="mt-3 text-sm text-gray-600">
              {getScoreLevel(socialScore)}
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Governança</h3>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(governanceScore)}`}>
              {governanceScore.toFixed(0)}
            </div>
            <ProgressBar progress={governanceScore} showPercentage={false} />
            <p className="mt-3 text-sm text-gray-600">
              {getScoreLevel(governanceScore)}
            </p>
          </Card>
        </div>

        {/* Strategic Insights */}
        {insights.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">💡 Insights Estratégicos</h2>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          categoryColors[insight.category as keyof typeof categoryColors]
                        }`}
                      >
                        {insight.category === 'critical' && '🔴 Crítico'}
                        {insight.category === 'attention' && '⚠️ Atenção'}
                        {insight.category === 'excellent' && '✅ Excelente'}
                      </span>
                      <span className="text-sm text-gray-600">{insight.pillar}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Prioridade {insight.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Plan */}
        {actionPlans.length > 0 && (
          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">📋 Plano de Ação</h2>
            <p className="text-gray-600 mb-6">
              Ações priorizadas para melhorar seu desempenho ESG, ordenadas por impacto e urgência.
            </p>
            <div className="space-y-4">
              {actionPlans.map((action, index) => (
                <div
                  key={action.id}
                  className="p-5 border-l-4 border-primary bg-gray-50 rounded-r-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-sm text-gray-600">{action.pillar}</span>
                        <h3 className="font-semibold text-gray-900 mt-1">{action.action}</h3>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        urgencyColors[action.urgency as keyof typeof urgencyColors]
                      }`}
                    >
                      {action.urgency}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-600">Investimento:</span>
                      <p className="font-medium text-gray-900">{action.estimatedInvestment}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Prazo:</span>
                      <p className="font-medium text-gray-900">{action.deadline}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Impacto Esperado:</span>
                      <p className={`font-medium ${getScoreColor(action.expectedImpact)}`}>
                        +{action.expectedImpact} pontos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Fazer Novo Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  );
}
