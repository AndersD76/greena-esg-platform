import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

const PILLAR_COLORS: Record<string, string> = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#b8963a',
};

interface DbActionPlan {
  id: number;
  title: string;
  description: string;
  priority: string;
  priorityLabel: string;
  investment: string;
  investmentLabel: string;
  deadlineDays: number;
  status: string;
  impactScore: number;
}

type FilterPillar = 'all' | 'E' | 'S' | 'G';
type FilterPriority = 'all' | 'critical' | 'high' | 'medium';
type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed';

export default function Insights() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [partialScores, setPartialScores] = useState<any>(null);
  const [isPartial, setIsPartial] = useState(false);
  const [actions, setActions] = useState<DbActionPlan[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filters
  const [filterPillar, setFilterPillar] = useState<FilterPillar>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    loadDiagnosis();
  }, [diagnosisId]);

  async function loadDiagnosis() {
    try {
      let targetDiagnosis: Diagnosis | undefined;
      if (!diagnosisId) {
        const diagnoses = await diagnosisService.list();
        targetDiagnosis = diagnoses.find((d) => d.status === 'completed');
        if (!targetDiagnosis) {
          targetDiagnosis = diagnoses.find((d) => d.status === 'in_progress');
          if (targetDiagnosis) setIsPartial(true);
        }
      } else {
        targetDiagnosis = await diagnosisService.getById(diagnosisId);
        if (targetDiagnosis?.status === 'in_progress') setIsPartial(true);
      }

      if (targetDiagnosis) {
        setDiagnosis(targetDiagnosis);
        await loadPartialScores(targetDiagnosis.id);
        if (targetDiagnosis.status === 'completed') {
          const ap = await diagnosisService.getActionPlans(targetDiagnosis.id);
          setActions(ap);
        }
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

  async function handleStatusChange(actionId: number, newStatus: string) {
    if (!diagnosis) return;
    setUpdatingId(actionId);
    try {
      await diagnosisService.updateActionStatus(diagnosis.id, actionId, newStatus);
      setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a)));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setUpdatingId(null);
    }
  }

  // Padrão de cores em todas as páginas
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#7B9965';
    if (score >= 60) return '#b8963a';
    if (score >= 40) return '#924131';
    return '#9ca3af';
  };

  const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: '#FEE2E2', text: '#991B1B', label: 'CRÍTICA' },
    high: { bg: '#FEF3C7', text: '#92400E', label: 'ALTA' },
    medium: { bg: '#DBEAFE', text: '#1E40AF', label: 'MÉDIA' },
    low: { bg: '#E5E7EB', text: '#374151', label: 'BAIXA' },
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pendente', icon: '○' },
    in_progress: { bg: '#DBEAFE', text: '#1E40AF', label: 'Em Andamento', icon: '◐' },
    completed: { bg: '#D1FAE5', text: '#065F46', label: 'Concluído', icon: '●' },
  };

  // Parse pillar from description (format: "[E] Ambiental > Tema — ...")
  const getPillarFromAction = (action: DbActionPlan): string => {
    const desc = action.description || '';
    if (desc.startsWith('[E]')) return 'E';
    if (desc.startsWith('[S]')) return 'S';
    if (desc.startsWith('[G]')) return 'G';
    // Fallback para formato antigo
    if (desc.startsWith('Ambiental') || desc.includes('Ambiental')) return 'E';
    if (desc.startsWith('Social') || desc.includes('Social')) return 'S';
    if (desc.startsWith('Governança') || desc.includes('Governança')) return 'G';
    return 'E';
  };

  // Filter actions
  const filteredActions = actions.filter((a) => {
    if (filterPillar !== 'all' && getPillarFromAction(a) !== filterPillar) return false;
    if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const totalActions = actions.length;
  const completedActions = actions.filter((a) => a.status === 'completed').length;
  const inProgressActions = actions.filter((a) => a.status === 'in_progress').length;
  const pendingActions = actions.filter((a) => a.status === 'pending').length;
  const progressPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

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
          <h2 className="text-2xl font-bold text-brand-900 mb-3">Nenhum diagnóstico encontrado</h2>
          <p className="text-sm text-gray-500 mb-6">Complete um diagnóstico ESG para visualizar insights e planos de ação.</p>
          <Link to="/dashboard">
            <button className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">Ir para Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const envScore = partialScores?.environmental ?? Number(diagnosis.environmentalScore || 0);
  const socScore = partialScores?.social ?? Number(diagnosis.socialScore || 0);
  const govScore = partialScores?.governance ?? Number(diagnosis.governanceScore || 0);
  const overallScore = partialScores?.overall ?? Number(diagnosis.overallScore || 0);

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-brand-900">Insights & Plano de Ação</h1>
              {isPartial && (
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>PARCIAL</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{isPartial ? 'Análise preliminar baseada nas respostas atuais' : 'Análise detalhada e recomendações estratégicas'}</p>
          </div>
          <Link to="/dashboard">
            <button className="px-5 py-2 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Voltar</button>
          </Link>
        </div>

        {/* Score Overview - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Geral', score: overallScore, color: getScoreColor(overallScore) },
            { label: 'Ambiental', score: envScore, color: PILLAR_COLORS.environmental },
            { label: 'Social', score: socScore, color: PILLAR_COLORS.social },
            { label: 'Governança', score: govScore, color: PILLAR_COLORS.governance },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold" style={{ color: item.color }}>{item.score.toFixed(0)}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certification */}
        {partialScores?.certification && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-5">
              <img
                src={`/images/assets/selo-${partialScores.certification.level === 'gold' ? 'ouro' : partialScores.certification.level === 'silver' ? 'prata' : 'bronze'}.png`}
                alt="Selo" className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-brand-900">
                    Certificação {partialScores.certification.level === 'bronze' ? 'Bronze' : partialScores.certification.level === 'silver' ? 'Prata' : 'Ouro'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: partialScores.certification.color }}>
                    {partialScores.certification.scoreRange}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{partialScores.certification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights por Pilar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-900 mb-4">Insights por Pilar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Ambiental', score: envScore, color: PILLAR_COLORS.environmental, code: 'E' },
              { label: 'Social', score: socScore, color: PILLAR_COLORS.social, code: 'S' },
              { label: 'Governança', score: govScore, color: PILLAR_COLORS.governance, code: 'G' },
            ].map((pillar) => {
              const level = pillar.score >= 80 ? 'excellent' : pillar.score >= 60 ? 'attention' : 'critical';
              const messages: Record<string, Record<string, string>> = {
                E: {
                  critical: 'Práticas ambientais precisam de atenção urgente. Priorize políticas de redução de emissões e gestão de resíduos.',
                  attention: 'Desempenho ambiental no caminho certo. Continue melhorando eficiência energética e uso de recursos.',
                  excellent: 'Excelente desempenho ambiental! Mantenha as boas práticas e considere certificações.',
                },
                S: {
                  critical: 'Fortaleça práticas sociais: diversidade, inclusão e bem-estar dos colaboradores.',
                  attention: 'Boas práticas sociais. Expanda capacitação e engajamento comunitário.',
                  excellent: 'Destaque nas práticas sociais! Continue investindo no desenvolvimento das pessoas.',
                },
                G: {
                  critical: 'Governança requer melhorias em transparência, ética e conformidade.',
                  attention: 'Governança adequada. Reforce controle interno e comunicação com stakeholders.',
                  excellent: 'Governança exemplar! Alto padrão de ética e transparência.',
                },
              };
              return (
                <div key={pillar.code} className="p-4 rounded-xl border-l-4" style={{ borderColor: pillar.color, backgroundColor: pillar.score >= 80 ? '#f0fdf4' : pillar.score >= 60 ? '#fefce8' : '#fef2f2' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: pillar.color }}>{pillar.code}</div>
                    <div>
                      <span className="text-sm font-bold text-brand-900">{pillar.label}</span>
                      <span className="ml-2 text-lg font-bold" style={{ color: pillar.color }}>{pillar.score.toFixed(0)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{messages[pillar.code][level]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* === PLANO DE AÇÃO COM TRACKING === */}
        {actions.length > 0 && (
          <div className="mb-6">
            {/* Critério de seleção */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Como as ações são geradas?</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Cada questão respondida como <strong>"Não iniciado"</strong> gera uma ação guiada no plano.
                    Essas são práticas que ainda não existem na sua organização e precisam ser implementadas para melhorar seu nível ESG.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar + Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-brand-900">Plano de Ação</h2>
                <span className="text-sm font-bold" style={{ color: progressPct >= 70 ? '#7B9965' : progressPct >= 30 ? '#b8963a' : '#924131' }}>
                  {progressPct}% concluído
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all duration-500 bg-brand-700" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-700">{pendingActions}</p>
                  <p className="text-[10px] font-medium text-amber-600 uppercase">Pendentes</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{inProgressActions}</p>
                  <p className="text-[10px] font-medium text-blue-600 uppercase">Em Andamento</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{completedActions}</p>
                  <p className="text-[10px] font-medium text-green-600 uppercase">Concluídas</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase">Filtrar:</span>

              {/* Pillar filter */}
              <div className="flex gap-1">
                {[
                  { value: 'all' as FilterPillar, label: 'Todos' },
                  { value: 'E' as FilterPillar, label: 'Ambiental' },
                  { value: 'S' as FilterPillar, label: 'Social' },
                  { value: 'G' as FilterPillar, label: 'Governança' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setFilterPillar(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterPillar === opt.value ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <span className="text-gray-300">|</span>

              {/* Priority filter */}
              <div className="flex gap-1">
                {[
                  { value: 'all' as FilterPriority, label: 'Todas' },
                  { value: 'critical' as FilterPriority, label: 'Crítica' },
                  { value: 'high' as FilterPriority, label: 'Alta' },
                  { value: 'medium' as FilterPriority, label: 'Média' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setFilterPriority(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterPriority === opt.value ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <span className="text-gray-300">|</span>

              {/* Status filter */}
              <div className="flex gap-1">
                {[
                  { value: 'all' as FilterStatus, label: 'Todos' },
                  { value: 'pending' as FilterStatus, label: 'Pendente' },
                  { value: 'in_progress' as FilterStatus, label: 'Em Andamento' },
                  { value: 'completed' as FilterStatus, label: 'Concluído' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterStatus === opt.value ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {(filterPillar !== 'all' || filterPriority !== 'all' || filterStatus !== 'all') && (
                <button onClick={() => { setFilterPillar('all'); setFilterPriority('all'); setFilterStatus('all'); }}
                  className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100">
                  Limpar filtros
                </button>
              )}

              <span className="ml-auto text-xs text-gray-400">
                {filteredActions.length} de {totalActions} ações
              </span>
            </div>

            {/* Actions List */}
            <div className="space-y-2">
              {filteredActions.map((action) => {
                const pCfg = priorityConfig[action.priority] || priorityConfig.medium;
                const sCfg = statusConfig[action.status] || statusConfig.pending;
                const pillarCode = getPillarFromAction(action);
                const pillarColor = pillarCode === 'E' ? PILLAR_COLORS.environmental : pillarCode === 'S' ? PILLAR_COLORS.social : PILLAR_COLORS.governance;
                const isUpdating = updatingId === action.id;

                return (
                  <div key={action.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 border-l-4 transition-all ${action.status === 'completed' ? 'opacity-60' : ''}`}
                    style={{ borderLeftColor: pillarColor }}>
                    <div className="flex items-start gap-3">
                      {/* Status Toggle */}
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <button
                          onClick={() => {
                            const next = action.status === 'pending' ? 'in_progress' : action.status === 'in_progress' ? 'completed' : 'pending';
                            handleStatusChange(action.id, next);
                          }}
                          disabled={isUpdating}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${isUpdating ? 'animate-pulse' : ''}`}
                          style={{ borderColor: action.status === 'completed' ? '#065F46' : action.status === 'in_progress' ? '#1E40AF' : '#D1D5DB',
                            backgroundColor: action.status === 'completed' ? '#D1FAE5' : action.status === 'in_progress' ? '#DBEAFE' : 'white' }}
                          title={`Clique para mudar: ${action.status === 'pending' ? 'Em Andamento' : action.status === 'in_progress' ? 'Concluído' : 'Pendente'}`}
                        >
                          {action.status === 'completed' && <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          {action.status === 'in_progress' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-1">
                          <h4 className={`text-sm font-bold text-brand-900 flex-1 ${action.status === 'completed' ? 'line-through' : ''}`}>
                            {action.title}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: pCfg.bg, color: pCfg.text }}>
                              {pCfg.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: sCfg.bg, color: sCfg.text }}>
                              {sCfg.label}
                            </span>
                          </div>
                        </div>

                        {action.description && (
                          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{action.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Investimento: <strong className="text-gray-600">{action.investmentLabel}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Prazo: <strong className="text-gray-600">{action.deadlineDays} dias</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            Impacto: <strong className="text-gray-600">{Number(action.impactScore)}/10</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredActions.length === 0 && actions.length > 0 && (
                <div className="text-center py-8 text-sm text-gray-400">
                  Nenhuma ação encontrada com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* No actions (partial diagnosis) */}
        {actions.length === 0 && !isPartial && diagnosis.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-lg font-bold text-green-800">Parabéns!</p>
            <p className="text-sm text-green-600 mt-1">Nenhuma ação necessária. Todas as questões foram implementadas.</p>
          </div>
        )}

        {actions.length === 0 && isPartial && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-sm text-amber-700">O plano de ação será gerado quando o diagnóstico for concluído.</p>
            <Link to={`/diagnosis/${diagnosis.id}/questionnaire`}>
              <button className="mt-3 px-6 py-2 text-sm font-semibold text-white bg-brand-900 rounded-full">Continuar Diagnóstico</button>
            </Link>
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 justify-center mt-6">
          <Link to={`/diagnosis/${diagnosis.id}/results`}>
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Ver Resultados</button>
          </Link>
          <Link to={`/diagnosis/${diagnosis.id}/report`}>
            <button className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Relatório</button>
          </Link>
          <Link to="/dashboard">
            <button className="px-6 py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
