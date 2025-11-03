import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

interface ActionPlan {
  pillar: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  timeline: string;
  icon: string;
}

// Componente de Gráfico de Progresso Circular
function CircularProgress({ value, size = 120, strokeWidth = 10, color = '#7B9965' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e0e0e0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
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
        // Tentar buscar diagnóstico completo primeiro
        let targetDiagnosis = diagnoses.find((d) => d.status === 'completed');
        // Se não houver completo, buscar em andamento
        if (!targetDiagnosis) {
          targetDiagnosis = diagnoses.find((d) => d.status === 'in_progress');
          if (targetDiagnosis) {
            setIsPartial(true);
            await loadPartialScores(targetDiagnosis.id);
          }
        } else {
          // Se completo, carregar certificação
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
        // Sempre carregar scores (que incluem certificação)
        await loadPartialScores(data.id);
      }
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPartialScores(diagnosisId: string) {
    try {
      const response = await fetch(`/api/diagnosis/${diagnosisId}/partial-scores`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPartialScores(data);
    } catch (error) {
      console.error('Erro ao carregar scores parciais:', error);
    }
  }

  const generateInsights = (): { pillar: string; message: string; icon: string; color: string }[] => {
    if (!diagnosis && !partialScores) return [];

    const insights = [];
    // Usar scores parciais se disponíveis, senão usar scores do diagnóstico
    const envScore = partialScores ? partialScores.environmental : Number(diagnosis?.environmentalScore || 0);
    const socScore = partialScores ? partialScores.social : Number(diagnosis?.socialScore || 0);
    const govScore = partialScores ? partialScores.governance : Number(diagnosis?.governanceScore || 0);

    // Environmental
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

    // Social
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

    // Governance
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
    // Usar scores parciais se disponíveis, senão usar scores do diagnóstico
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
    return '#666';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando insights...</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#152F27' }}>
            Nenhum diagnóstico encontrado
          </h2>
          <p className="mb-6" style={{ color: '#666' }}>
            Complete um diagnóstico ESG para visualizar insights e planos de ação.
          </p>
          <Link to="/dashboard">
            <button
              className="px-8 py-3 text-lg font-black text-white rounded-xl transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              Ir para Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const insights = generateInsights();
  const actionPlan = generateActionPlan();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black" style={{ color: '#152F27' }}>Insights & Plano de Ação</h1>
                {isPartial && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>
                    RESULTADOS PARCIAIS
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>
                {isPartial ? 'Análise preliminar baseada nas respostas atuais' : 'Análise detalhada e recomendações estratégicas'}
              </p>
            </div>
            <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-20" />
          </div>
        </div>

        {/* Score Overview with Circular Charts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Overall Score */}
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
            <p className="text-sm font-bold mb-4" style={{ color: '#666' }}>SCORE GERAL</p>
            <div className="relative inline-block">
              <CircularProgress
                value={partialScores ? partialScores.overall : Number(diagnosis?.overallScore || 0)}
                color={getScoreColor(partialScores ? partialScores.overall : Number(diagnosis?.overallScore || 0))}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black" style={{ color: getScoreColor(partialScores ? partialScores.overall : Number(diagnosis?.overallScore || 0)) }}>
                  {(partialScores ? partialScores.overall : Number(diagnosis?.overallScore || 0)).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Environmental */}
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center" style={{ backgroundColor: '#e8f5e9' }}>
            <p className="text-sm font-bold mb-4" style={{ color: '#152F27' }}>AMBIENTAL</p>
            <div className="relative inline-block">
              <CircularProgress
                value={partialScores ? partialScores.environmental : Number(diagnosis?.environmentalScore || 0)}
                color="#4CAF50"
                size={100}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black" style={{ color: '#4CAF50' }}>
                  {(partialScores ? partialScores.environmental : Number(diagnosis?.environmentalScore || 0)).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center" style={{ backgroundColor: '#e3f2fd' }}>
            <p className="text-sm font-bold mb-4" style={{ color: '#152F27' }}>SOCIAL</p>
            <div className="relative inline-block">
              <CircularProgress
                value={partialScores ? partialScores.social : Number(diagnosis?.socialScore || 0)}
                color="#2196F3"
                size={100}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black" style={{ color: '#2196F3' }}>
                  {(partialScores ? partialScores.social : Number(diagnosis?.socialScore || 0)).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Governance */}
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center" style={{ backgroundColor: '#fff3e0' }}>
            <p className="text-sm font-bold mb-4" style={{ color: '#152F27' }}>GOVERNANÇA</p>
            <div className="relative inline-block">
              <CircularProgress
                value={partialScores ? partialScores.governance : Number(diagnosis?.governanceScore || 0)}
                color="#FF9800"
                size={100}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black" style={{ color: '#FF9800' }}>
                  {(partialScores ? partialScores.governance : Number(diagnosis?.governanceScore || 0)).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certification Card */}
        {partialScores?.certification && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 mb-6 border-4"
               style={{ borderColor: partialScores.certification.color }}>
            <div className="flex items-start gap-6">
              <div className="text-8xl">{partialScores.certification.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black" style={{ color: '#152F27' }}>
                    Certificação Nível {partialScores.certification.level === 'bronze' ? 'Bronze' : partialScores.certification.level === 'silver' ? 'Prata' : 'Ouro'}
                  </h2>
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: partialScores.certification.color }}>
                    {partialScores.certification.scoreRange} pontos
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: partialScores.certification.color }}>
                  {partialScores.certification.name}
                </h3>
                <p className="text-lg font-semibold mb-4" style={{ color: '#666' }}>
                  {partialScores.certification.message}
                </p>
                <div className="bg-white rounded-xl p-4 border-2" style={{ borderColor: partialScores.certification.color }}>
                  <p className="text-sm font-bold mb-3" style={{ color: '#152F27' }}>Características deste nível:</p>
                  <ul className="space-y-2">
                    {partialScores.certification.characteristics.map((char: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span style={{ color: partialScores.certification.color }}>✓</span>
                        <span className="text-sm font-semibold" style={{ color: '#666' }}>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Cards */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-black mb-6" style={{ color: '#152F27' }}>
            Insights Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border-2 transition-all hover:shadow-lg"
                style={{ borderColor: insight.color }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{insight.icon}</div>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: '#152F27' }}>{insight.pillar}</h3>
                    <div className="w-12 h-1 rounded" style={{ backgroundColor: insight.color }}></div>
                  </div>
                </div>
                <p className="text-base font-semibold leading-relaxed" style={{ color: '#666' }}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black" style={{ color: '#152F27' }}>
              🎯 Plano de Ação Recomendado
            </h2>
            <div className="flex gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#924131' }}></div>
                <span>ALTA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EFD4A8' }}></div>
                <span>MÉDIA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7B9965' }}></div>
                <span>BAIXA</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionPlan.map((action, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border-l-4 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderColor: getPriorityColor(action.priority)
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{action.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-black text-white"
                        style={{ backgroundColor: getPriorityColor(action.priority) }}
                      >
                        {getPriorityLabel(action.priority)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#e0f0e0', color: '#152F27' }}>
                        {action.pillar}
                      </span>
                      <span className="ml-auto text-xs font-bold" style={{ color: '#666' }}>
                        {action.timeline}
                      </span>
                    </div>
                    <h3 className="text-lg font-black mb-2" style={{ color: '#152F27' }}>
                      {action.action}
                    </h3>
                    <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                      📈 {action.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <Link to={`/diagnosis/${diagnosis.id}/results`}>
              <button
                className="px-8 py-3 text-lg font-black text-white rounded-xl transition-all hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Ver Resultados Completos
              </button>
            </Link>
            <Link to="/dashboard">
              <button
                className="px-8 py-3 text-lg font-black border-2 rounded-xl transition-all hover:bg-gray-50"
                style={{ borderColor: '#152F27', color: '#152F27' }}
              >
                Voltar ao Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
