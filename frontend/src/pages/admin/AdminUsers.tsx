import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminUser } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';

interface EditForm {
  name: string;
  companyName: string;
  cnpj: string;
  city: string;
  sector: string;
  role: string;
}

interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  consultationHours: number;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: string;
  plan: { name: string; code: string };
}

export default function AdminUsers() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [hoursModal, setHoursModal] = useState<AdminUser | null>(null);
  const [hours, setHours] = useState('1');
  const [hoursReason, setHoursReason] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin', planId: '' });
  const [editModal, setEditModal] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', companyName: '', cnpj: '', city: '', sector: '', role: 'user' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Plano
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userSubs, setUserSubs] = useState<Record<string, UserSubscription | null>>({});
  const [planModal, setPlanModal] = useState<AdminUser | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(page, 20, search || undefined, roleFilter || undefined);
      setUsers(data.users);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });

      // Carregar assinatura de cada usuário
      const subs: Record<string, UserSubscription | null> = {};
      const subsData = await adminService.getSubscriptions(1, 100);
      for (const sub of subsData.subscriptions) {
        if (sub.status === 'active' || sub.status === 'pending_payment') {
          subs[sub.userId] = {
            id: sub.id,
            planId: sub.planId,
            status: sub.status,
            plan: { name: sub.plan.name, code: sub.plan.code },
          };
        }
      }
      setUserSubs(subs);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => {
    adminService.getPlans().then(setPlans).catch(console.error);
  }, []);

  useEffect(() => { const t = setTimeout(() => loadUsers(1), 300); return () => clearTimeout(t); }, [loadUsers]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleToggleStatus(u: AdminUser) {
    try {
      await adminService.toggleUserStatus(u.id);
      flash(`${u.isActive ? 'Desativado' : 'Ativado'}: ${u.name}`);
      loadUsers(pagination.page);
    } catch (e: any) { flash(e.message); }
  }

  async function handleAddHours() {
    if (!hoursModal) return;
    try {
      await adminService.addConsultationHours(hoursModal.id, Number(hours), hoursReason);
      flash(`${hours}h adicionadas para ${hoursModal.name}`);
      setHoursModal(null); setHours('1'); setHoursReason('');
    } catch (e: any) { flash(e.message); }
  }

  async function handleCreateAdmin() {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      flash('Preencha todos os campos obrigatórios');
      return;
    }
    setCreateLoading(true);
    try {
      const result = await adminService.createAdmin({ name: newAdmin.name, email: newAdmin.email, password: newAdmin.password, role: newAdmin.role });

      // Se um plano foi selecionado, atribuir ao usuário criado
      if (newAdmin.planId && result?.id) {
        try {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          await adminService.createSubscription({
            userId: result.id,
            planId: newAdmin.planId,
            status: 'active',
            expiresAt: expiresAt.toISOString(),
          });
        } catch (subErr: any) {
          console.error('Erro ao atribuir plano:', subErr);
        }
      }

      flash(`Admin ${newAdmin.email} criado com sucesso`);
      setCreateModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin', planId: '' });
      loadUsers(1);
    } catch (e: any) { flash(e.message); } finally { setCreateLoading(false); }
  }

  function openEditModal(u: AdminUser) {
    setEditForm({
      name: u.name || '',
      companyName: u.companyName || '',
      cnpj: u.cnpj || '',
      city: u.city || '',
      sector: u.sector || '',
      role: u.role || 'user',
    });
    setEditModal(u);
  }

  async function handleEditSave() {
    if (!editModal) return;
    if (!editForm.name.trim()) {
      flash('Nome é obrigatório');
      return;
    }
    setEditLoading(true);
    try {
      await adminService.updateUser(editModal.id, {
        name: editForm.name.trim(),
        companyName: editForm.companyName.trim() || undefined,
        cnpj: editForm.cnpj.trim() || undefined,
        city: editForm.city.trim() || undefined,
        sector: editForm.sector.trim() || undefined,
        role: editForm.role,
      });
      flash(`Usuário ${editForm.name} atualizado`);
      setEditModal(null);
      loadUsers(pagination.page);
    } catch (e: any) { flash(e.message); } finally { setEditLoading(false); }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deleteConfirm.id);
      flash(`Usuário ${deleteConfirm.name} removido`);
      setDeleteConfirm(null);
      loadUsers(pagination.page);
    } catch (e: any) { flash(e.message); } finally { setDeleteLoading(false); }
  }

  function openPlanModal(u: AdminUser) {
    const currentSub = userSubs[u.id];
    setSelectedPlanId(currentSub?.planId || '');
    setPlanModal(u);
  }

  async function handleAssignPlan() {
    if (!planModal || !selectedPlanId) {
      flash('Selecione um plano');
      return;
    }
    setPlanLoading(true);
    try {
      // Se já tem assinatura ativa, deletar antes
      const currentSub = userSubs[planModal.id];
      if (currentSub) {
        await adminService.deleteSubscription(currentSub.id);
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await adminService.createSubscription({
        userId: planModal.id,
        planId: selectedPlanId,
        status: 'active',
        expiresAt: expiresAt.toISOString(),
      });

      const plan = plans.find(p => p.id === selectedPlanId);
      flash(`Plano ${plan?.name || ''} atribuído para ${planModal.name}`);
      setPlanModal(null);
      loadUsers(pagination.page);
    } catch (e: any) { flash(e.response?.data?.error || e.message); } finally { setPlanLoading(false); }
  }

  const roleBadge = (r: string) => ({ superadmin: 'bg-purple-100 text-purple-800', admin: 'bg-blue-100 text-blue-800', user: 'bg-gray-100 text-gray-600' }[r] || 'bg-gray-100 text-gray-600');

  const planBadge = (code: string) => ({
    free: 'bg-gray-100 text-gray-500',
    start: 'bg-blue-50 text-blue-700',
    grow: 'bg-green-50 text-green-700',
    impact: 'bg-amber-50 text-amber-700',
  }[code] || 'bg-gray-100 text-gray-500');

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 transition-colors';
  const labelClass = 'block text-xs font-semibold text-gray-500 mb-1';

  return (
    <div className="p-8">
      {msg && <div className="fixed top-4 right-4 bg-brand-900 text-white px-6 py-3 rounded-lg shadow-lg z-[60] text-sm font-medium animate-fade-in">{msg}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Usuários</h1>
          <p className="text-sm text-gray-400">{pagination.total} cadastrados</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-brand-900 text-white text-sm font-semibold rounded-lg hover:bg-brand-900/90 transition-colors">
            + Novo Admin
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nome, email ou empresa..." className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/30" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
          <option value="">Todos</option><option value="user">Usuário</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Usuário</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Empresa</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Role</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Plano</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Diag.</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Carregando...</td></tr> :
             users.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum usuário</td></tr> :
             users.map((u) => {
              const sub = userSubs[u.id];
              return (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-brand-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.companyName || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadge(u.role)}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {sub ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${planBadge(sub.plan.code)}`}>
                      {sub.plan.name}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400">
                      Demo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{u._count?.diagnoses || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openPlanModal(u)} className="px-2 py-1 text-[10px] font-medium rounded bg-green-50 hover:bg-green-100 text-green-700 transition-colors">
                      Plano
                    </button>
                    <button onClick={() => handleToggleStatus(u)} className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${u.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}>
                      {u.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => openEditModal(u)} className="px-2 py-1 text-[10px] font-medium rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => setHoursModal(u)} className="px-2 py-1 text-[10px] font-medium rounded bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors">
                      +Horas
                    </button>
                    <button onClick={() => setDeleteConfirm(u)} className="px-2 py-1 text-[10px] font-medium rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => loadUsers(i + 1)} className={`px-3 py-1 text-sm rounded ${pagination.page === i + 1 ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ===== ASSIGN PLAN MODAL ===== */}
      {planModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setPlanModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-1">Atribuir Plano</h3>
            <p className="text-xs text-gray-400 mb-5">{planModal.name} — {planModal.email}</p>

            {userSubs[planModal.id] && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 text-sm">
                <span className="text-blue-700 font-medium">Plano atual: </span>
                <span className="font-bold text-blue-900">{userSubs[planModal.id]?.plan.name}</span>
              </div>
            )}

            <div className="space-y-2 mb-6">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlanId === plan.id
                      ? 'border-brand-700 bg-brand-100/50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-brand-900">{plan.name}</p>
                    <p className="text-xs text-gray-400">
                      {plan.consultationHours > 0 ? `${plan.consultationHours}h consultoria/mês` : 'Sem consultoria'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-900">
                      {plan.price > 0 ? `R$ ${plan.price}` : 'Grátis'}
                    </p>
                    <p className="text-[10px] text-gray-400">{plan.price > 0 ? '/mês' : ''}</p>
                  </div>
                </button>
              ))}
              {plans.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum plano cadastrado no banco de dados.</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setPlanModal(null)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleAssignPlan}
                disabled={planLoading || !selectedPlanId}
                className="px-5 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900/90 disabled:opacity-50 transition-colors"
              >
                {planLoading ? 'Salvando...' : 'Atribuir Plano'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT USER MODAL ===== */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-1">Editar Usuário</h3>
            <p className="text-xs text-gray-400 mb-5">{editModal.email}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nome *</label>
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} placeholder="Nome completo" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Empresa</label>
                <input value={editForm.companyName} onChange={e => setEditForm({ ...editForm, companyName: e.target.value })} className={inputClass} placeholder="Nome da empresa" />
              </div>
              <div>
                <label className={labelClass}>CNPJ</label>
                <input value={editForm.cnpj} onChange={e => setEditForm({ ...editForm, cnpj: e.target.value })} className={inputClass} placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <label className={labelClass}>Cidade</label>
                <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className={inputClass} placeholder="Cidade" />
              </div>
              <div>
                <label className={labelClass}>Setor</label>
                <input value={editForm.sector} onChange={e => setEditForm({ ...editForm, sector: e.target.value })} className={inputClass} placeholder="Ex: Tecnologia, Indústria..." />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className={inputClass}>
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin && <option value="superadmin">Superadmin</option>}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleEditSave} disabled={editLoading} className="px-5 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900/90 disabled:opacity-50 transition-colors">
                {editLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Excluir Usuário</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              Tem certeza que deseja excluir <span className="font-semibold text-brand-900">{deleteConfirm.name}</span>?
            </p>
            <p className="text-xs text-red-500 text-center mb-5">
              Esta ação é irreversível. Todos os dados do usuário serão removidos.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleteLoading ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD HOURS MODAL ===== */}
      {hoursModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setHoursModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-4">Adicionar Horas — {hoursModal.name}</h3>
            <div>
              <label className={labelClass}>Quantidade de horas</label>
              <input type="number" min="1" value={hours} onChange={e => setHours(e.target.value)} className={`${inputClass} mb-3`} placeholder="Horas" />
            </div>
            <div>
              <label className={labelClass}>Motivo</label>
              <textarea value={hoursReason} onChange={e => setHoursReason(e.target.value)} className={`${inputClass} mb-4`} rows={2} placeholder="Motivo da adição" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setHoursModal(null)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleAddHours} className="px-4 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900/90 transition-colors">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE ADMIN MODAL ===== */}
      {createModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-1">Novo Admin</h3>
            <p className="text-xs text-gray-400 mb-5">Criar uma nova conta de administrador</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome *</label>
                <input placeholder="Nome completo" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input placeholder="admin@empresa.com" type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Senha *</label>
                <input placeholder="Mínimo 6 caracteres" type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nível de acesso</label>
                <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })} className={inputClass}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Plano (opcional)</label>
                <select value={newAdmin.planId} onChange={e => setNewAdmin({ ...newAdmin, planId: e.target.value })} className={inputClass}>
                  <option value="">Demo (gratuito)</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — R$ {p.price}/mês</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleCreateAdmin} disabled={createLoading} className="px-5 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900/90 disabled:opacity-50 transition-colors">
                {createLoading ? 'Criando...' : 'Criar Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
