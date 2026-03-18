import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminSubscription } from '../../services/admin.service';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadSubscriptions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getSubscriptions(page, 20, statusFilter || undefined);
      setSubscriptions(data.subscriptions);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadSubscriptions(1); }, [loadSubscriptions]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleUpdateStatus(sub: AdminSubscription, newStatus: string) {
    try {
      await adminService.updateSubscription(sub.id, { status: newStatus });
      flash(`Assinatura de ${sub.user.name} → ${getStatusLabel(newStatus)}`);
      loadSubscriptions(pagination.page);
    } catch (e: any) { flash(e.message); }
  }

  const statusBadge = (s: string) => ({
    active: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
  }[s] || 'bg-gray-100 text-gray-600');

  function getStatusLabel(s: string) {
    return { active: 'Ativa', cancelled: 'Cancelada', expired: 'Expirada', pending: 'Pendente' }[s] || s;
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.plan.price), 0);

  return (
    <div className="p-8">
      {msg && <div className="fixed top-4 right-4 bg-brand-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">{msg}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Assinaturas</h1>
        <p className="text-sm text-gray-400">{pagination.total} registradas — {activeCount} ativas — Receita: {fmt(totalRevenue)}/mês</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'Todas' },
          { value: 'active', label: 'Ativas' },
          { value: 'pending', label: 'Pendentes' },
          { value: 'cancelled', label: 'Canceladas' },
          { value: 'expired', label: 'Expiradas' },
        ].map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${statusFilter === f.value ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Cliente</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Plano</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Período</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Horas</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr> :
             subscriptions.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma assinatura</td></tr> :
             subscriptions.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-brand-900">{s.user.name}</p>
                  <p className="text-xs text-gray-400">{s.user.companyName || s.user.email}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="font-semibold text-brand-900">{s.plan.name}</p>
                  <p className="text-[10px] text-gray-400">{fmt(Number(s.plan.price))}/mês</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(s.status)}`}>{getStatusLabel(s.status)}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600 text-xs">
                  <p>{new Date(s.startDate).toLocaleDateString('pt-BR')}</p>
                  {s.expiresAt && <p className="text-gray-400">até {new Date(s.expiresAt).toLocaleDateString('pt-BR')}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  <p className="font-semibold text-brand-900">{s.consultationHoursUsed}h / {s.plan.consultationHours}h</p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                    <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, s.plan.consultationHours > 0 ? (s.consultationHoursUsed / s.plan.consultationHours) * 100 : 0)}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {s.status === 'active' && (
                      <button onClick={() => handleUpdateStatus(s, 'cancelled')}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-red-50 hover:bg-red-100 text-red-700">Cancelar</button>
                    )}
                    {s.status === 'cancelled' && (
                      <button onClick={() => handleUpdateStatus(s, 'active')}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-green-50 hover:bg-green-100 text-green-700">Reativar</button>
                    )}
                    {s.status === 'pending' && (
                      <button onClick={() => handleUpdateStatus(s, 'active')}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-green-50 hover:bg-green-100 text-green-700">Aprovar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => loadSubscriptions(i + 1)}
              className={`px-3 py-1 text-sm rounded ${pagination.page === i + 1 ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
