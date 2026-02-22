import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

const PILLAR_COLORS = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#b8963a',
};

interface ActionPlan {
  pillar: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  timeline: string;
  icon: string;
}

export default function Insights() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [partialScores, setPartialScores] = useState<any>(null);
  const [isPartial, setIsPartial] = useState(false);

  useEffect(() => {
    loadDiagnosis();
  }, [diagnosisId]);

  async function loadDiagnosis() {
    try {
      if (!diagnosisId) {
        const diagnoses = await diagnosisService.list();
        let targetDiagnosis = diagnoses.find((d) => d.status === 'completed');
        if (!targetDiagnosis) {
          targetDiagnosis = diagnoses.find((d) => d.status === 'in_progress');
          if (targetDiagnosis) {
            setIsPartial(true);
            await loadPartialScores(targetDiagnosis.id);
          }
        } else {
          await loadPartialScores(targetDiagnosis.id);
        }
        if (targetDiagnosis) {
          setDiagnosis(targetDiagnosis);
        }
      } else {
        const data = await diagnosisService.getById(diagnosisId);
        setDiagnosis(data);
        if (data.status === 'in_progress') {
          setIsPartial(true);
        }
        await loadPartialScores(data.id);
      }
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPartialScores(id: string) {
    try {
      const data = await diagnosisService.getPartialScores(id);
      setPartialScores(data);
    } catch (error) {
      console.error('Erro ao carregar scores parciais:', error);
    }
  }

  const generateInsights = (): { pillar: string; message: string; icon: string; color: string }[] => {
    if (!diagnosis && !partialScores) return [];

    const insights = [];
    const envScore = partialScores ? partialScores.environmental : Number(diagnosis?.environmentalScore || 0);
    const socScore = partialScores ? partialScores.social : Number(diagnosis?.socialScore || 0);
    const govScore = partialScores ? partialScores.governance : Number(diagnosis?.governanceScore || 0);

    if (envScore < 60) {
      insights.push({
        pillar: 'Ambiental',
        message: 'Suas práticas ambientais precisam de atenção urgente. Implemente políticas de redução de emissões e gestão de resíduos.',
        icon: 'E',
        color: '#924131'
      });
    } else if (envScore < 80) {
      insights.push({
        pillar: 'Ambiental',
        message: 'Seu desempenho ambiental está no caminho certo. Continue melhorando eficiência energética e uso de recursos.',
        icon: 'E',
        color: '#EFD4A8'
      });
    } else {
      insights.push({
        pillar: 'Ambiental',
        message: 'Excelente desempenho ambiental! Mantenha as boas práticas e considere certificações ambientais.',
        icon: 'E',
        color: '#7B9965'
      });
    }

    if (socScore < 60) {
      insights.push({
        pillar: 'Social',
        message: 'Fortaleça suas práticas sociais, focando em diversidade, inclusão e bem-estar dos colaboradores.',
        icon: 'S',
        color: '#924131'
      });
    } else if (socScore < 80) {
      insights.push({
        pillar: 'Social',
        message: 'Boas práticas sociais. Expanda programas de capacitação e engajamento comunitário.',
        icon: 'S',
        color: '#EFD4A8'
      });
    } else {
      insights.push({
        pillar: 'Social',
        message: 'Destaque nas práticas sociais! Continue investindo no desenvolvimento das pessoas.',
        icon: 'S',
        color: '#7B9965'
      });
    }

    if (govScore < 60) {
      insights.push({
        pillar: 'Governança',
        message: 'A governança requer melhorias em transparência, ética e conformidade regulatória.',
        icon: 'G',
        color: '#924131'
      });
    } else if (govScore < 80) {
      insights.push({
        pillar: 'Governança',
        message: 'Governança adequada. Reforce controle interno e comunicação com stakeholders.',
        icon: 'G',
        color: '#EFD4A8'
      });
    } else {
      insights.push({
        pillar: 'Governança',
        message: 'Governança exemplar! Alto padrão de ética e transparência.',
        icon: 'G',
        color: '#7B9965'
      });
    }

    return insights;
  };

  const generateActionPlan = (): ActionPlan[] => {
    if (!diagnosis && !partialScores) return [];

    const actions: ActionPlan[] = [];
    const envScore = partialScores ? partialScores.environmental : Number(diagnosis?.environmentalScore || 0);
    const socScore = partialScores ? partialScores.social : Number(diagnosis?.socialScore || 0);
    const govScore = partialScores ? partialScores.governance : Number(diagnosis?.governanceScore || 0);

    if (envScore < 60) {
      actions.push(
        {
          pillar: 'Ambiental',
          priority: 'high',
          action: 'Implementar programa de gestão de resíduos e reciclagem',
          impact: 'Redução de 30% no descarte inadequado',
          timeline: '3-6 meses',
          icon: 'E'
        },
        {
          pillar: 'Ambiental',
          priority: 'high',
          action: 'Realizar inventário de emissões de GEE',
          impact: 'Base para estratégia de descarbonização',
          timeline: '2-3 meses',
          icon: 'E'
        }
      );
    } else if (envScore < 80) {
      actions.push({
        pillar: 'Ambiental',
        priority: 'medium',
        action: 'Otimizar eficiência energética nas operações',
        impact: 'Economia de até 20% no consumo',
        timeline: '6-12 meses',
        icon: 'E'
      });
    }

    if (socScore < 60) {
      actions.push(
        {
          pillar: 'Social',
          priority: 'high',
          action: 'Criar programa de diversidade e inclusão',
          impact: 'Aumento de 40% na diversidade',
          timeline: '6-12 meses',
          icon: 'S'
        },
        {
          pillar: 'Social',
          priority: 'high',
          action: 'Implementar pesquisa de clima organizacional',
          impact: 'Identificar e resolver pontos críticos',
          timeline: '1-2 meses',
          icon: 'S'
        }
      );
    } else if (socScore < 80) {
      actions.push({
        pillar: 'Social',
        priority: 'medium',
        action: 'Expandir programas de capacitação profissional',
        impact: 'Desenvolvimento de 50+ colaboradores/ano',
        timeline: '3-6 meses',
        icon: 'S'
      });
    }

    if (govScore < 60) {
      actions.push(
        {
          pillar: 'Governança',
          priority: 'high',
          action: 'Estabelecer código de ética e conduta',
          impact: 'Clareza em padrões éticos',
          timeline: '2-4 meses',
          icon: 'G'
        },
        {
          pillar: 'Governança',
          priority: 'high',
          action: 'Implementar canal de denúncias',
          impact: 'Transparência e compliance',
          timeline: '1-3 meses',
          icon: 'G'
        }
      );
    } else if (govScore < 80) {
      actions.push({
        pillar: 'Governança',
        priority: 'medium',
        action: 'Fortalecer comitês de gestão de riscos',
        impact: 'Melhor identificação e mitigação de riscos',
        timeline: '3-6 meses',
        icon: 'G'
      });
    }

    actions.push({
      pillar: 'Geral',
      priority: 'low',
      action: 'Publicar relatório de sustentabilidade anual',
      impact: 'Transparência e engajamento com stakeholders',
      timeline: '12 meses',
      icon: 'ESG'
    });

    return actions;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return '#924131';
    if (priority === 'medium') return '#EFD4A8';
    return '#7B9965';
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'high') return 'ALTA';
    if (priority === 'medium') return 'MÉDIA';
    return 'BAIXA';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#7B9965';
    if (score >= 60) return '#EFD4A8';
    if (score >= 40) return '#924131';
    return '#9ca3af';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando insights...</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-brand-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-brand-900 mb-3">
            Nenhum diagnóstico encontrado
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Complete um diagnóstico ESG para visualizar insights e planos de ação.
          </p>
          <Link to="/dashboard">
            <button className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
              Ir para Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const insights = generateInsights();
  const actionPlan = generateActionPlan();
  const envScore = partialScores ? partialScores.environmental : Number(diagnosis?.environmentalScore || 0);
  const socScore = partialScores ? partialScores.social : Number(diagnosis?.socialScore || 0);
  const govScore = partialScores ? partialScores.governance : Number(diagnosis?.governanceScore || 0);
  const overallScore = partialScores ? partialScores.overall : Number(diagnosis?.overallScore || 0);

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-brand-900">Insights & Plano de Ação</h1>
            {isPartial && (
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>
                RESULTADOS PARCIAIS
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {isPartial ? 'Análise preliminar baseada nas respostas atuais' : 'Análise detalhada e recomendações estratégicas'}
          </p>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Score Geral</p>
            <p className="text-5xl font-bold mb-2" style={{ color: getScoreColor(overallScore) }}>
              {overallScore.toFixed(0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center" style={{ backgroundColor: '#f5ffeb' }}>
            <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Ambiental</p>
            <p className="text-5xl font-bold mb-2" style={{ color: PILLAR_COLORS.environmental }}>
              {envScore.toFixed(0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center" style={{ backgroundColor: '#fdf5f3' }}>
            <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Social</p>
            <p className="text-5xl font-bold mb-2" style={{ color: PILLAR_COLORS.social }}>
              {socScore.toFixed(0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center" style={{ backgroundColor: '#fdf8ef' }}>
            <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Governança</p>
            <p className="text-5xl font-bold mb-2" style={{ color: PILLAR_COLORS.governance }}>
              {govScore.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Certification Card */}
        {partialScores?.certification && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-start gap-6">
              <img
                src={`/images/assets/selo-${partialScores.certification.level === 'gold' ? 'ouro' : partialScores.certification.level === 'silver' ? 'prata' : 'bronze'}.png`}
                alt={`Selo ${partialScores.certification.level === 'gold' ? 'Ouro' : partialScores.certification.level === 'silver' ? 'Prata' : 'Bronze'}`}
                className="w-24 h-24 object-contain flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-brand-900">
                    Certificação Nível {partialScores.certification.level === 'bronze' ? 'Bronze' : partialScores.certification.level === 'silver' ? 'Prata' : 'Ouro'}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: partialScores.certification.color }}>
                    {partialScores.certification.scoreRange} pontos
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: partialScores.certification.color }}>
                  {partialScores.certification.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{partialScores.certification.message}</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Características deste nível</p>
                  <ul className="space-y-2">
                    {partialScores.certification.characteristics.map((char: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke={partialScores.certification.color} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-500">{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-bold text-brand-900 mb-6">Insights Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-5 rounded-xl border border-gray-100"
                style={{ borderLeftWidth: 4, borderLeftColor: insight.color }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: insight.color }}
                  >
                    {insight.icon}
                  </div>
                  <h3 className="text-base font-bold text-brand-900">{insight.pillar}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan - Separated by Pillar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-brand-900">Plano de Ação Recomendado</h2>
            <div className="flex gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#924131' }}></div>
                <span>Alta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EFD4A8' }}></div>
                <span>Média</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#7B9965' }}></div>
                <span>Baixa</span>
              </div>
            </div>
          </div>

          {/* Pillar sections */}
          {[
            { name: 'Ambiental', code: 'E', icon: 'Ambiental', color: PILLAR_COLORS.environmental, bgColor: '#f5ffeb', score: envScore, pillarKey: 'Ambiental',
              svgPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Social', code: 'S', icon: 'Social', color: PILLAR_COLORS.social, bgColor: '#fdf5f3', score: socScore, pillarKey: 'Social',
              svgPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { name: 'Governança', code: 'G', icon: 'Governança', color: '#b8963a', bgColor: '#fdf8ef', score: govScore, pillarKey: 'Governança',
              svgPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          ].map((pillar) => {
            const pillarActions = actionPlan.filter((a) => a.pillar === pillar.pillarKey);
            const pillarInsight = insights.find((i) => i.pillar === pillar.pillarKey);
            if (!pillarInsight && pillarActions.length === 0) return null;

            return (
              <div key={pillar.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                {/* Pillar header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: pillar.bgColor }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: pillar.color }}>
                      {pillar.code}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-900">{pillar.name}</h3>
                      <p className="text-xs text-gray-500">Score: {pillar.score.toFixed(0)}/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pillar.score}%`, backgroundColor: pillar.color }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: pillar.color }}>{pillar.score.toFixed(0)}</span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Insight for this pillar */}
                  {pillarInsight && (
                    <div className="flex items-start gap-3 mb-5 p-4 rounded-xl bg-gray-50">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={pillarInsight.color}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: pillarInsight.color }}>
                          {pillarInsight.color === '#7B9965' ? 'Excelente' : pillarInsight.color === '#EFD4A8' ? 'Atenção' : 'Crítico'}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">{pillarInsight.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions for this pillar */}
                  {pillarActions.length > 0 && (
                    <div className="space-y-3">
                      {pillarActions.map((action, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border-l-4 bg-gray-50"
                          style={{ borderColor: getPriorityColor(action.priority) }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-bold text-brand-900 flex-1">{action.action}</h4>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              <span
                                className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getPriorityColor(action.priority) }}
                              >
                                {getPriorityLabel(action.priority)}
                              </span>
                              <span className="text-xs text-gray-400">{action.timeline}</span>
                            </div>
                          </div>
                          <p className="text-xs text-brand-700 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {action.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {pillarActions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">Nenhuma ação prioritária necessária</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* General actions */}
          {actionPlan.filter((a) => a.pillar === 'Geral').length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-900 text-white font-bold text-xs">
                  ESG
                </div>
                <h3 className="text-lg font-bold text-brand-900">Ações Gerais</h3>
              </div>
              <div className="space-y-3">
                {actionPlan.filter((a) => a.pillar === 'Geral').map((action, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border-l-4 bg-gray-50"
                    style={{ borderColor: getPriorityColor(action.priority) }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-bold text-brand-900 flex-1">{action.action}</h4>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getPriorityColor(action.priority) }}
                        >
                          {getPriorityLabel(action.priority)}
                        </span>
                        <span className="text-xs text-gray-400">{action.timeline}</span>
                      </div>
                    </div>
                    <p className="text-xs text-brand-700 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {action.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 justify-center">
          <Link to={`/diagnosis/${diagnosis.id}/results`}>
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
              Ver Resultados Completos
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
              Voltar ao Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
