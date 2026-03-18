import { useState, useEffect } from 'react';
import { adminService, AccessMetrics } from '../../services/admin.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

interface MetricsReport {
  period: { from: string; to: string };
  metrics: {
    newUsers: number;
    diagnoses: number;
    completedDiagnoses: number;
    consultations: number;
    certificates: number;
    subscriptions: number;
    averageScores: { overall: number; environmental: number; social: number; governance: number };
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
  '/': 'Landing Page', '/login': 'Login', '/register': 'Cadastro', '/dashboard': 'Dashboard',
  '/reports': 'Relatórios', '/insights': 'Insights', '/profile': 'Perfil',
  '/consultations': 'Consultorias', '/checkout': 'Checkout', '/contact': 'Contato',
};

const COLORS = ['#7B9965', '#924131', '#b8963a', '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B'];

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

  useEffect(() => { loadAccessMetrics(); }, []);

  async function loadAccessMetrics() {
    setLoading(true);
    try { setAccessMetrics(await adminService.getAccessMetrics(startDate, endDate)); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function loadMetrics() {
    if (!startDate || !endDate) return;
    setLoading(true);
    try { setMetrics(await adminService.getMetricsReport(startDate, endDate)); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function loadHoursReport() {
    setLoading(true);
    try { setHoursReport(await adminService.getConsultationHoursReport()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function handleTabChange(t: 'access' | 'metrics' | 'hours') {
    setTab(t);
    if (t === 'access' && !accessMetrics) loadAccessMetrics();
    if (t === 'metrics' && !metrics) loadMetrics();
    if (t === 'hours' && hoursReport.length === 0) loadHoursReport();
  }

  function getPageLabel(path: string) {
    if (PAGE_LABELS[path]) return PAGE_LABELS[path];
    if (path.includes('/questionnaire')) return 'Questionário';
    if (path.includes('/results')) return 'Resultados';
    if (path.includes('/certificate')) return 'Certificado';
    if (path.startsWith('/empresa/')) return 'Perfil Público';
    return path;
  }

  const DateFilter = ({ onApply }: { onApply: () => void }) => (
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
        <button onClick={onApply}
          className="px-4 py-2 text-sm font-semibold bg-brand-900 text-white rounded-lg hover:bg-brand-900/90">
          Gerar Relatório
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Relatórios</h1>
        <p className="text-sm text-gray-400">Métricas de acesso, plataforma e consultorias</p>
      </div>

      <div className="flex gap-2 mb-6">
        {([
          { key: 'access', label: 'Acessos' },
          { key: 'metrics', label: 'Métricas por Período' },
          { key: 'hours', label: 'Horas de Consultoria' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${tab === t.key ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== TAB: ACESSOS ========== */}
      {tab === 'access' && (
        <>
          <DateFilter onApply={loadAccessMetrics} />
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

              {/* Gráfico: Acessos por Dia (Area Chart) */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Acessos por Dia</h2>
                {accessMetrics.viewsByDay.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum dado no período</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={accessMetrics.viewsByDay.map(d => ({
                      date: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                      views: d.count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                      <Area type="monotone" dataKey="views" stroke="#7B9965" fill="#7B9965" fillOpacity={0.2} strokeWidth={2} name="Views" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico: Páginas mais visitadas (Bar Chart horizontal) */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Páginas Mais Visitadas</h2>
                  {accessMetrics.topPages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(200, accessMetrics.topPages.length * 36)}>
                      <BarChart layout="vertical" data={accessMetrics.topPages.map(p => ({
                        page: getPageLabel(p.path),
                        views: p.count,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#999' }} />
                        <YAxis type="category" dataKey="page" width={120} tick={{ fontSize: 11, fill: '#333' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                        <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]}>
                          {accessMetrics.topPages.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Gráfico: Atividade por Hora (Bar Chart) */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Atividade por Hora</h2>
                  {accessMetrics.viewsByHour.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Array.from({ length: 24 }, (_, h) => ({
                        hora: `${h}h`,
                        views: accessMetrics.viewsByHour.find(v => v.hour === h)?.count || 0,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#999' }} interval={2} />
                        <YAxis tick={{ fontSize: 10, fill: '#999' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                        <Bar dataKey="views" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

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
          <DateFilter onApply={loadMetrics} />
          {loading && <p className="text-center text-gray-400 py-8">Carregando...</p>}

          {metrics && !loading && (
            <div className="space-y-6">
              {/* Gráfico: Visão Geral (Bar Chart) */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Visão Geral do Período</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Novos Usuários', valor: metrics.metrics.newUsers, fill: '#3B82F6' },
                    { name: 'Diagnósticos', valor: metrics.metrics.diagnoses, fill: '#7B9965' },
                    { name: 'Concluídos', valor: metrics.metrics.completedDiagnoses, fill: '#10B981' },
                    { name: 'Consultorias', valor: metrics.metrics.consultations, fill: '#8B5CF6' },
                    { name: 'Certificados', valor: metrics.metrics.certificates, fill: '#b8963a' },
                    { name: 'Assinaturas', valor: metrics.metrics.subscriptions, fill: '#F59E0B' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="valor" name="Quantidade" radius={[6, 6, 0, 0]}>
                      {[
                        '#3B82F6', '#7B9965', '#10B981', '#8B5CF6', '#b8963a', '#F59E0B'
                      ].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico: Scores ESG (Radar-like com barras) */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Scores Médios ESG</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { pilar: 'Geral', score: Number(metrics.metrics.averageScores.overall) || 0 },
                      { pilar: 'Ambiental', score: Number(metrics.metrics.averageScores.environmental) || 0 },
                      { pilar: 'Social', score: Number(metrics.metrics.averageScores.social) || 0 },
                      { pilar: 'Governança', score: Number(metrics.metrics.averageScores.governance) || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="pilar" tick={{ fontSize: 12, fill: '#333' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#999' }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                      <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                        <Cell fill="#152F27" />
                        <Cell fill="#7B9965" />
                        <Cell fill="#924131" />
                        <Cell fill="#b8963a" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico: Distribuição (Pie Chart) */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Distribuição de Atividades</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Diagnósticos', value: metrics.metrics.diagnoses },
                          { name: 'Consultorias', value: metrics.metrics.consultations },
                          { name: 'Certificados', value: metrics.metrics.certificates },
                          { name: 'Assinaturas', value: metrics.metrics.subscriptions },
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                        paddingAngle={3} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {[0, 1, 2, 3].map(i => (
                          <Cell key={i} fill={['#7B9965', '#8B5CF6', '#b8963a', '#F59E0B'][i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cards resumo */}
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
            </div>
          )}
        </>
      )}

      {/* ========== TAB: HORAS ========== */}
      {tab === 'hours' && (
        <>
          {loading && <p className="text-center text-gray-400 py-8">Carregando...</p>}
          {!loading && hoursReport.length > 0 && (
            <div className="space-y-6">
              {/* Gráfico: Uso de Horas por Usuário */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Uso de Horas por Usuário</h2>
                <ResponsiveContainer width="100%" height={Math.max(200, hoursReport.length * 50)}>
                  <BarChart layout="vertical" data={hoursReport.map(r => ({
                    name: r.user.name.split(' ').slice(0, 2).join(' '),
                    usadas: r.hoursUsed,
                    restantes: r.hoursRemaining,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#999' }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#333' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="usadas" stackId="a" fill="#924131" name="Usadas" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="restantes" stackId="a" fill="#7B9965" name="Restantes" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico: % de Uso (Pie) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Distribuição por Plano</h2>
                  {(() => {
                    const planCounts: Record<string, number> = {};
                    hoursReport.forEach(r => { planCounts[r.plan] = (planCounts[r.plan] || 0) + 1; });
                    const pieData = Object.entries(planCounts).map(([name, value]) => ({ name, value }));
                    return (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80}
                            paddingAngle={3} dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Resumo</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-brand-900">{hoursReport.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Assinaturas Ativas</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-brand-900">{hoursReport.reduce((s, r) => s + r.hoursTotal, 0)}h</p>
                      <p className="text-xs text-gray-500 mt-1">Horas Totais</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold" style={{ color: '#924131' }}>{hoursReport.reduce((s, r) => s + r.hoursUsed, 0)}h</p>
                      <p className="text-xs text-gray-500 mt-1">Horas Usadas</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold" style={{ color: '#7B9965' }}>{hoursReport.reduce((s, r) => s + r.hoursRemaining, 0)}h</p>
                      <p className="text-xs text-gray-500 mt-1">Horas Restantes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela detalhada */}
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
                    {hoursReport.map((r) => (
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
            </div>
          )}
          {!loading && hoursReport.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">Nenhuma assinatura ativa</div>
          )}
        </>
      )}
    </div>
  );
}
