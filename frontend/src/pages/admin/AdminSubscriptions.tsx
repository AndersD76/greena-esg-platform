import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService, AdminSubscription } from '../../services/admin.service';

interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  consultationHours: number;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [newStatus, setNewStatus] = useState('active');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AdminSubscription | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSubscriptions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getSubscriptions(page, 20, statusFilter || undefined);
      setSubscriptions(data.subscriptions);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadSubscriptions(1); }, [loadSubscriptions]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleUpdateStatus(sub: AdminSubscription, newSt: string) {
    try {
      await adminService.updateSubscription(sub.id, { status: newSt });
      flash(`Assinatura de ${sub.user.name} \u2192 ${getStatusLabel(newSt)}`);
      loadSubscriptions(pagination.page);
    } catch (e: any) { flash(e.message); }
  }

  // --- Create subscription ---
  async function openCreateModal() {
    setShowCreateModal(true);
    setSelectedUser(null);
    setUserSearch('');
    setUserResults([]);
    setSelectedPlanId('');
    setNewStatus('active');
    setNewExpiresAt('');
    try {
      const p = await adminService.getPlans();
      setPlans(p);
      if (p.length > 0) setSelectedPlanId(p[0].id);
    } catch (e) { console.error(e); }
  }

  function handleUserSearch(value: string) {
    setUserSearch(value);
    setSelectedUser(null);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length < 2) {
      setUserResults([]);
      setShowUserDropdown(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const data = await adminService.getUsers(1, 10, value.trim());
        setUserResults(data.users.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
        setShowUserDropdown(true);
      } catch (e) { console.error(e); } finally { setUserSearchLoading(false); }
    }, 350);
  }

  function selectUser(user: UserOption) {
    setSelectedUser(user);
    setUserSearch(user.name);
    setShowUserDropdown(false);
  }

  async function handleCreate() {
    if (!selectedUser) { flash('Selecione um usu\u00e1rio'); return; }
    if (!selectedPlanId) { flash('Selecione um plano'); return; }
    setCreating(true);
    try {
      await adminService.createSubscription({
        userId: selectedUser.id,
        planId: selectedPlanId,
        status: newStatus,
        ...(newExpiresAt ? { expiresAt: newExpiresAt } : {}),
      });
      flash(`Assinatura criada para ${selectedUser.name}`);
      setShowCreateModal(false);
      loadSubscriptions(pagination.page);
    } catch (e: any) { flash(e?.response?.data?.message || e.message || 'Erro ao criar assinatura'); }
    finally { setCreating(false); }
  }

  // --- Delete subscription ---
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteSubscription(deleteTarget.id);
      flash(`Assinatura de ${deleteTarget.user.name} exclu\u00edda`);
      setDeleteTarget(null);
      loadSubscriptions(pagination.page);
    } catch (e: any) { flash(e?.response?.data?.message || e.message || 'Erro ao excluir'); }
    finally { setDeleting(false); }
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Assinaturas</h1>
          <p className="text-sm text-gray-400">{pagination.total} registradas &mdash; {activeCount} ativas &mdash; Receita: {fmt(totalRevenue)}/m&ecirc;s</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-900 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Assinatura
        </button>
      </div>

      {/* Filter buttons */}
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Cliente</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Plano</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Per\u00edodo</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Horas</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">A\u00e7\u00f5es</th>
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
                  <p className="text-[10px] text-gray-400">{fmt(Number(s.plan.price))}/m\u00eas</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(s.status)}`}>{getStatusLabel(s.status)}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600 text-xs">
                  <p>{new Date(s.startedAt).toLocaleDateString('pt-BR')}</p>
                  {s.expiresAt && <p className="text-gray-400">at\u00e9 {new Date(s.expiresAt).toLocaleDateString('pt-BR')}</p>}
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
                    <button onClick={() => setDeleteTarget(s)}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-red-50 hover:bg-red-100 text-red-700"
                      title="Excluir assinatura"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => loadSubscriptions(i + 1)}
              className={`px-3 py-1 text-sm rounded ${pagination.page === i + 1 ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* ==================== CREATE MODAL ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-900">Nova Assinatura</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* User search */}
              <div ref={userSearchRef} className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Usu\u00e1rio</label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  onFocus={() => userResults.length > 0 && setShowUserDropdown(true)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                />
                {selectedUser && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-brand-900 bg-brand-900/5 px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {selectedUser.name} &mdash; {selectedUser.email}
                  </div>
                )}
                {showUserDropdown && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {userSearchLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Buscando...</div>
                    ) : userResults.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Nenhum usu\u00e1rio encontrado</div>
                    ) : (
                      userResults.map((u) => (
                        <button key={u.id} onClick={() => selectUser(u)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Plan select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plano</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all bg-white"
                >
                  <option value="">Selecione um plano</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} &mdash; {fmt(p.price)}/m\u00eas ({p.consultationHours}h consultoria)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all bg-white"
                >
                  <option value="active">Ativa</option>
                  <option value="pending">Pendente</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              {/* Expiration date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data de expira\u00e7\u00e3o <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating || !selectedUser || !selectedPlanId}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-900 rounded-lg hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {creating ? 'Criando...' : 'Criar Assinatura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Excluir Assinatura</h3>
                  <p className="text-sm text-gray-500">Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Tem certeza que deseja excluir a assinatura de <span className="font-semibold text-brand-900">{deleteTarget.user.name}</span>?
              </p>
              <p className="text-xs text-gray-400">
                Plano: {deleteTarget.plan.name} &mdash; Status: {getStatusLabel(deleteTarget.status)}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm">
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
