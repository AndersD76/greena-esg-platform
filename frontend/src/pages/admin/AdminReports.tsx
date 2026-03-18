import { useState, useEffect } from 'react';
import { adminService, AccessMetrics } from '../../services/admin.service';

interface MetricsReport {
  period: { from: string; to: string };
  metrics: {
    newUsers: number;
    diagnoses: number;
    completedDiagnoses: number;
    consultations: number;
    certificates: number;
    subscriptions: number;
    averageScores: {
      overall: number;
      environmental: number;
      social: number;
      governance: number;
    };
  };
}

interface HoursReport {
  user: { id: string; name: string; email: string; companyName: string | null };
  plan: string;
  hoursTotal: number;
  hoursUsed: number;
  hoursRemaining: number;
  usagePercentage: number;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Landing Page',
  '/login': 'Login',
  '/register': 'Cadastro',
  '/dashboard': 'Dashboard',
  '/reports': 'Relatórios',
  '/insights': 'Insights',
  '/profile': 'Perfil',
  '/consultations': 'Consultorias',
  '/checkout': 'Checkout',
  '/contact': 'Contato',
  '/privacy': 'Privacidade',
  '/terms': 'Termos',
};

export default function AdminReports() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [metrics, setMetrics] = useState<MetricsReport | null>(null);
  const [hoursReport, setHoursReport] = useState<HoursReport[]>([]);
  const [accessMetrics, setAccessMetrics] = useState<AccessMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'access' | 'metrics' | 'hours'>('access');

  // Carregar métricas de acesso ao montar
  useEffect(() => { loadAccessMetrics(); }, []);

  async function loadAccessMetrics() {
    setLoading(true);
    try {
      const data = await adminService.getAccessMetrics(startDate, endDate);
      setAccessMetrics(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function loadMetrics() {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const data = await adminService.getMetricsReport(startDate, endDate);
      setMetrics(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function loadHoursReport() {
    setLoading(true);
    try {
      const data = await adminService.getConsultationHoursReport();
      setHoursReport(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function handleTabChange(t: 'access' | 'metrics' | 'hours') {
    setTab(t);
    if (t === 'access' && !accessMetrics) loadAccessMetrics();
    if (t === 'metrics' && !metrics) loadMetrics();
    if (t === 'hours' && hoursReport.length === 0) loadHoursReport();
  }

  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  function getPageLabel(path: string) {
    if (PAGE_LABELS[path]) return PAGE_LABELS[path];
    if (path.includes('/questionnaire')) return 'Questionário';
    if (path.includes('/results')) return 'Resultados';
    if (path.includes('/certificate')) return 'Certificado';
    if (path.includes('/stakeholder')) return 'Relatório Stakeholders';
    if (path.startsWith('/empresa/')) return 'Perfil Público';
    return path;
  }

  // Maior valor para calcular barras proporcionais
  const maxDayViews = accessMetrics ? Math.max(...accessMetrics.viewsByDay.map(d => d.count), 1) : 1;
  const maxPageViews = accessMetrics ? Math.max(...accessMetrics.topPages.map(p => p.count), 1) : 1;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Relatórios</h1>
        <p className="text-sm text-gray-400">Métricas de acesso, plataforma e consultorias</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'access' as const, label: 'Acessos' },
          { key: 'metrics' as const, label: 'Métricas por Período' },
          { key: 'hours' as const, label: 'Horas de Consultoria' },
        ].map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${tab === t.key ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== TAB: ACESSOS ========== */}
      {tab === 'access' && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">De</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Até</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>
              <button onClick={loadAccessMetrics}
                className="px-4 py-2 text-sm font-semibold bg-brand-900 text-white rounded-lg hover:bg-brand-900/90">
                Atualizar
              </button>
            </div>
          </div>

          {loading && <p className="text-center text-gray-400 py-8">Carregando...</p>}

          {accessMetrics && !loading && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Page Views', value: accessMetrics.summary.totalViews, color: '#3B82F6', bg: '#EFF6FF' },
                  { label: 'Sessões Únicas', value: accessMetrics.summary.uniqueSessions, color: '#8B5CF6', bg: '#F5F3FF' },
                  { label: 'Usuários Únicos', value: accessMetrics.summary.uniqueUsers, color: '#7B9965', bg: '#f0f7ed' },
                  { label: 'Views Hoje', value: accessMetrics.summary.todayViews, color: '#10B981', bg: '#ECFDF5' },
                  { label: 'Online Agora', value: accessMetrics.summary.activeNow, color: '#EF4444', bg: '#FEF2F2' },
                  { label: 'Págs/Sessão', value: accessMetrics.summary.avgPagesPerSession, color: '#b8963a', bg: '#faf6ee' },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">{c.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-brand-900">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Views por Dia - Bar Chart */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Acessos por Dia</h2>
                {accessMetrics.viewsByDay.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum dado no período</p>
                ) : (
                  <div className="space-y-2">
                    {accessMetrics.viewsByDay.map(d => (
                      <div key={d.date} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                          {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(d.count / maxDayViews) * 100}%`, backgroundColor: '#7B9965' }} />
                        </div>
                        <span className="text-xs font-semibold text-brand-900 w-10 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Páginas mais visitadas */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Páginas Mais Visitadas</h2>
                  {accessMetrics.topPages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
                  ) : (
                    <div className="space-y-3">
                      {accessMetrics.topPages.map((p, i) => (
                        <div key={p.path} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand-900 truncate">{getPageLabel(p.path)}</p>
                            <p className="text-[10px] text-gray-400 truncate">{p.path}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(p.count / maxPageViews) * 100}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-brand-900 w-8 text-right">{p.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Atividade por Hora */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Atividade por Hora</h2>
                  {accessMetrics.viewsByHour.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
                  ) : (
                    <div className="flex items-end gap-1 h-32">
                      {Array.from({ length: 24 }, (_, h) => {
                        const data = accessMetrics.viewsByHour.find(v => v.hour === h);
                        const count = data?.count || 0;
                        const maxH = Math.max(...accessMetrics.viewsByHour.map(v => v.count), 1);
                        const height = count > 0 ? Math.max(4, (count / maxH) * 100) : 2;
                        return (
                          <div key={h} className="flex-1 flex flex-col items-center gap-1" title={`${h}h: ${count} views`}>
                            <div className="w-full rounded-t transition-all"
                              style={{ height: `${height}%`, backgroundColor: count > 0 ? '#7B9965' : '#e5e7eb' }} />
                            {h % 3 === 0 && <span className="text-[9px] text-gray-400">{h}h</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Top Referrers */}
                  {accessMetrics.topReferrers.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Fontes de Tráfego</h3>
                      <div className="space-y-2">
                        {accessMetrics.topReferrers.slice(0, 5).map(r => (
                          <div key={r.referrer} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 truncate max-w-[200px]">{r.referrer}</span>
                            <span className="text-xs font-semibold text-brand-900">{r.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========== TAB: MÉTRICAS ========== */}
      {tab === 'metrics' && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Data Inicial</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Data Final</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              </div>
              <button onClick={loadMetrics}
                className="px-4 py-2 text-sm font-semibold bg-brand-900 text-white rounded-lg hover:bg-brand-900/90">
                Gerar Relatório
              </button>
            </div>
          </div>

          {loading && <p className="text-center text-gray-400 py-8">Carregando...</p>}

          {metrics && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Novos Usuários', value: metrics.metrics.newUsers, color: '#3B82F6', bg: '#EFF6FF' },
                  { label: 'Diagnósticos', value: metrics.metrics.diagnoses, color: '#7B9965', bg: '#f0f7ed' },
                  { label: 'Diag. Concluídos', value: metrics.metrics.completedDiagnoses, color: '#10B981', bg: '#ECFDF5' },
                  { label: 'Consultorias', value: metrics.metrics.consultations, color: '#8B5CF6', bg: '#F5F3FF' },
                  { label: 'Certificados', value: metrics.metrics.certificates, color: '#b8963a', bg: '#faf6ee' },
                  { label: 'Assinaturas', value: metrics.metrics.subscriptions, color: '#F59E0B', bg: '#FFFBEB' },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">{c.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-brand-900">{c.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Scores Médios ESG</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Geral', value: metrics.metrics.averageScores.overall },
                    { label: 'Ambiental', value: metrics.metrics.averageScores.environmental },
                    { label: 'Social', value: metrics.metrics.averageScores.social },
                    { label: 'Governança', value: metrics.metrics.averageScores.governance },
                  ].map(s => (
                    <div key={s.label} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                      <p className={`text-3xl font-bold ${scoreColor(s.value)}`}>{s.value ? Number(s.value).toFixed(0) : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========== TAB: HORAS ========== */}
      {tab === 'hours' && (
        <>
          {loading && <p className="text-center text-gray-400 py-8">Carregando...</p>}
          {!loading && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Usuário</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Plano</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Total</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Usadas</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Restantes</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {hoursReport.length === 0
                    ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma assinatura ativa</td></tr>
                    : hoursReport.map((r) => (
                    <tr key={r.user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-900">{r.user.name}</p>
                        <p className="text-xs text-gray-400">{r.user.companyName || r.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.plan}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.hoursTotal}h</td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.hoursUsed}h</td>
                      <td className="px-4 py-3 text-center font-semibold text-brand-900">{r.hoursRemaining}h</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, r.usagePercentage)}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{r.usagePercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
