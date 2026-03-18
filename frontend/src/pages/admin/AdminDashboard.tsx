import { useState, useEffect } from 'react';
import { adminService, AdminDashboardStats } from '../../services/admin.service';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getActivities(20),
    ]).then(([s, a]) => {
      setStats(s);
      setActivities(a);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent" />
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-red-500">Erro ao carregar dados</div>;

  const cards = [
    { label: 'Usuários', value: stats.users.total, sub: `${stats.users.active} ativos`, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Novos este Mês', value: stats.users.newThisMonth, sub: `${stats.users.growth >= 0 ? '+' : ''}${stats.users.growth}% vs mês anterior`, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Diagnósticos', value: stats.diagnoses.total, sub: `${stats.diagnoses.completed} concluídos`, color: '#7B9965', bg: '#f0f7ed' },
    { label: 'Taxa Conclusão', value: `${stats.diagnoses.completionRate}%`, sub: `${stats.diagnoses.thisMonth} este mês`, color: '#b8963a', bg: '#faf6ee' },
    { label: 'Consultorias', value: stats.consultations.total, sub: `${stats.consultations.scheduled} agendadas`, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Assinaturas Ativas', value: stats.subscriptions.active, sub: `${stats.certificates.total} certificados`, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase">{c.label}</span>
            </div>
            <p className="text-3xl font-bold text-brand-900">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Atividades Recentes</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma atividade registrada</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a: any) => (
              <div key={a.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-900 flex-shrink-0">
                  {a.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-900 truncate">
                    <strong>{a.user?.name || 'Sistema'}</strong> — {a.description}
                  </p>
                  <p className="text-[10px] text-gray-400">{a.actionType}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(a.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
