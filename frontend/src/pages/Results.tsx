import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis, PillarScore } from '../services/diagnosis.service';
import api from '../services/api';

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

const DEFAULT_PILLAR_STYLES: Record<string, { color: string; bg: string }> = {
  E: { color: '#7B9965', bg: '#f5ffeb' },
  S: { color: '#924131', bg: '#fdf5f3' },
  G: { color: '#b8963a', bg: '#fdf8ef' },
};

const getPillarStyle = (pillar: PillarScore) => {
  const defaults = DEFAULT_PILLAR_STYLES[pillar.code];
  const color = pillar.color || defaults?.color || '#6b7280';
  const bg = defaults?.bg || `${color}12`;
  return { color, bg };
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
  const [certificate, setCertificate] = useState<any>(null);
  const [issuingCert, setIssuingCert] = useState(false);
  const [pillarScores, setPillarScores] = useState<PillarScore[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

      try {
        const resultsData = await diagnosisService.getResults(diagnosisId);
        if (resultsData.pillarScores?.length > 0) {
          setPillarScores(resultsData.pillarScores);
        }
      } catch {}

      // Check if certificate already exists
      try {
        const certRes = await api.get(`/certificates/diagnosis/${diagnosisId}`);
        if (certRes.data) setCertificate(certRes.data);
      } catch {}

      // Check AI consultant status
      try {
        const aiStatusRes = await api.get('/diagnoses/ai/status');
        setAiEnabled(aiStatusRes.data.enabled);
      } catch {}
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

  const effectivePillarScores: PillarScore[] = pillarScores.length > 0
    ? pillarScores
    : [
        { code: 'E', name: 'Ambiental', color: '#7B9965', score: environmentalScore },
        { code: 'S', name: 'Social', color: '#924131', score: socialScore },
        { code: 'G', name: 'Governança', color: '#b8963a', score: governanceScore },
      ];

  const frameworkLabel = diagnosis.framework === 'GRI' ? 'GRI'
    : diagnosis.framework === 'ESG_GRI' ? 'ESG+GRI'
    : 'ESG';

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
              <h1 className="text-3xl font-bold text-brand-900 mb-1">Resultados do Diagnóstico {frameworkLabel}</h1>
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
            <h2 className="text-xl font-bold text-brand-900 mb-4">Score {frameworkLabel} Geral</h2>
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
              indicando um nível <strong className="text-brand-900">{getScoreLevel(overallScore)}</strong> de maturidade {frameworkLabel}.
            </p>
          </div>
        </div>

        {/* Pillar Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {effectivePillarScores.map((pillar) => {
            const style = getPillarStyle(pillar);
            const score = Number(pillar.score);
            return (
              <div
                key={pillar.code}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                style={{ backgroundColor: style.bg }}
              >
                <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">{pillar.name}</p>
                <p className="text-5xl font-bold mb-3" style={{ color: style.color }}>
                  {score.toFixed(0)}
                </p>
                <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, backgroundColor: style.color }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">{getScoreLevel(score)}</p>
              </div>
            );
          })}
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
                    style={{ borderLeftColor: DEFAULT_PILLAR_STYLES.E.color }}
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

        {/* AI Consultant */}
        {aiEnabled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-8 py-6 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #152F27 0%, #1a4a3a 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Consultor IA ESG</h2>
                    <p className="text-xs text-white/50">Análise estratégica personalizada por inteligência artificial</p>
                  </div>
                </div>
                {!aiAnalysis && (
                  <button
                    onClick={async () => {
                      if (!diagnosisId) return;
                      setAiLoading(true);
                      setAiError(null);
                      try {
                        const res = await api.post(`/diagnoses/${diagnosisId}/ai-analysis`);
                        setAiAnalysis(res.data.analysis);
                      } catch (err: any) {
                        setAiError(err?.response?.data?.error || 'Erro ao gerar análise');
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    disabled={aiLoading}
                    className="px-6 py-2.5 text-sm font-bold text-brand-900 bg-white rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-900 border-t-transparent" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Gerar Análise IA
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {aiError && (
              <div className="px-8 py-4 bg-red-50 text-red-700 text-sm">{aiError}</div>
            )}

            {aiLoading && !aiAnalysis && (
              <div className="px-8 py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-brand-900/20 border-t-brand-900 mx-auto mb-4" />
                <p className="text-sm font-semibold text-brand-900">O consultor IA está analisando seu diagnóstico...</p>
                <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos</p>
              </div>
            )}

            {aiAnalysis && (
              <div className="p-8 space-y-6">
                {/* Executive Summary */}
                <div className="bg-brand-100/50 rounded-xl p-5 border border-brand-900/10">
                  <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wide mb-2">Sumário Executivo</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis.executiveSummary}</p>
                </div>

                {/* Strengths */}
                {aiAnalysis.strengths?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">+</span>
                      Pontos Fortes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {aiAnalysis.strengths.map((s: string, i: number) => (
                        <div key={i} className="bg-green-50 rounded-lg p-3 text-sm text-green-800 border border-green-100">{s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Risks */}
                {aiAnalysis.criticalRisks?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">!</span>
                      Riscos Críticos
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.criticalRisks.map((r: any, i: number) => (
                        <div key={i} className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-red-800">{r.area}</p>
                              <p className="text-xs text-red-700 mt-1">{r.risk}</p>
                            </div>
                            <span className="flex-shrink-0 px-2 py-1 rounded-lg bg-red-100 text-[10px] font-bold text-red-800">{r.financialImpact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Recommendations */}
                {aiAnalysis.strategicRecommendations?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">&#8594;</span>
                      Recomendações Estratégicas
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.strategicRecommendations.map((rec: any, i: number) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-bold text-brand-900">{rec.title}</p>
                            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.priority === 'alta' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'média' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>{rec.priority}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex gap-4 text-[10px] text-gray-400 font-medium">
                            <span>Investimento: <strong className="text-gray-600">{rec.estimatedInvestment}</strong></span>
                            <span>Retorno: <strong className="text-gray-600">{rec.expectedReturn}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benchmark */}
                {aiAnalysis.benchmarkInsight && (
                  <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                    <h3 className="text-sm font-bold text-indigo-900 mb-2">Benchmark do Setor</h3>
                    <p className="text-sm text-indigo-700 leading-relaxed">{aiAnalysis.benchmarkInsight}</p>
                  </div>
                )}

                {/* Regulatory Alerts */}
                {aiAnalysis.regulatoryAlerts?.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">Alertas Regulatórios</h3>
                    <ul className="space-y-1">
                      {aiAnalysis.regulatoryAlerts.map((a: string, i: number) => (
                        <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                          <span className="mt-0.5">&#9888;</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ESG Narrative */}
                {aiAnalysis.esgNarrative && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h3 className="text-sm font-bold text-brand-900 mb-2">Narrativa ESG — Pronta para Publicação</h3>
                    <p className="text-xs text-gray-400 mb-3">Use este texto no relatório de sustentabilidade, LinkedIn ou propostas comerciais</p>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiAnalysis.esgNarrative}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-900">Certificado ESG</h3>
                <p className="text-sm text-gray-500">
                  {certificate ? `Certificado #${certificate.certificateNumber} emitido` : 'Emita seu certificado baseado neste diagnóstico'}
                </p>
              </div>
            </div>
            {certificate ? (
              <button
                onClick={() => navigate(`/certificate/${certificate.id}`)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Ver Certificado
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (!diagnosisId) return;
                  setIssuingCert(true);
                  try {
                    const res = await api.post(`/certificates/${diagnosisId}`);
                    setCertificate(res.data);
                    navigate(`/certificate/${res.data.id}`);
                  } catch (err: any) {
                    const msg = err?.response?.data?.error || 'Erro ao emitir certificado';
                    alert(msg);
                  } finally {
                    setIssuingCert(false);
                  }
                }}
                disabled={issuingCert}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {issuingCert ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
                Emitir Certificado
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
          >
            Voltar ao Dashboard
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
          >
            Ver Relatório Completo
          </button>
          <button
            onClick={() => navigate(`/diagnosis/${diagnosisId}/stakeholder-report`)}
            className="px-6 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full transition-all hover:bg-blue-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Stakeholders
          </button>
          <button
            onClick={() => navigate(`/diagnosis/${diagnosisId}/insights`)}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
          >
            Plano de Ação
          </button>
        </div>
      </div>
    </div>
  );
}
