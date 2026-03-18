import { useState } from 'react';
import { adminService } from '../../services/admin.service';

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

export default function AdminReports() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [metrics, setMetrics] = useState<MetricsReport | null>(null);
  const [hoursReport, setHoursReport] = useState<HoursReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'metrics' | 'hours'>('metrics');

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

  function handleTabChange(t: 'metrics' | 'hours') {
    setTab(t);
    if (t === 'metrics' && !metrics) loadMetrics();
    if (t === 'hours' && hoursReport.length === 0) loadHoursReport();
  }

  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Relatórios</h1>
        <p className="text-sm text-gray-400">Métricas e estatísticas da plataforma</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => handleTabChange('metrics')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${tab === 'metrics' ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Métricas por Período
        </button>
        <button onClick={() => handleTabChange('hours')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${tab === 'hours' ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Horas de Consultoria
        </button>
      </div>

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
