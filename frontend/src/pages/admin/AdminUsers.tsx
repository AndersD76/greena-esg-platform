import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminUser } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';

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
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(page, 20, search || undefined, roleFilter || undefined);
      setUsers(data.users);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { const t = setTimeout(() => loadUsers(1), 300); return () => clearTimeout(t); }, [loadUsers]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleToggleStatus(u: AdminUser) {
    try { await adminService.toggleUserStatus(u.id); flash(`${u.isActive ? 'Desativado' : 'Ativado'}: ${u.name}`); loadUsers(pagination.page); } catch (e: any) { flash(e.message); }
  }

  async function handleChangeRole(u: AdminUser, role: string) {
    try { await adminService.updateUser(u.id, { role }); flash(`Role de ${u.name} → ${role}`); loadUsers(pagination.page); } catch (e: any) { flash(e.message); }
  }

  async function handleAddHours() {
    if (!hoursModal) return;
    try { await adminService.addConsultationHours(hoursModal.id, Number(hours), hoursReason); flash(`${hours}h adicionadas para ${hoursModal.name}`); setHoursModal(null); setHours('1'); setHoursReason(''); } catch (e: any) { flash(e.message); }
  }

  async function handleCreateAdmin() {
    try { await adminService.createAdmin(newAdmin); flash(`Admin ${newAdmin.email} criado`); setCreateModal(false); setNewAdmin({ name: '', email: '', password: '', role: 'admin' }); loadUsers(1); } catch (e: any) { flash(e.message); }
  }

  const roleBadge = (r: string) => ({ superadmin: 'bg-purple-100 text-purple-800', admin: 'bg-blue-100 text-blue-800', user: 'bg-gray-100 text-gray-600' }[r] || 'bg-gray-100 text-gray-600');

  return (
    <div className="p-8">
      {msg && <div className="fixed top-4 right-4 bg-brand-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">{msg}</div>}
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-brand-900">Usuários</h1><p className="text-sm text-gray-400">{pagination.total} cadastrados</p></div>
        {isSuperAdmin && <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-brand-900 text-white text-sm font-semibold rounded-lg hover:bg-brand-900/90">+ Criar Admin</button>}
      </div>
      <div className="flex gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nome, email ou empresa..." className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/30" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
          <option value="">Todos</option><option value="user">Usuário</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Usuário</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Empresa</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Role</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Diag.</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr> :
             users.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum usuário</td></tr> :
             users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3"><p className="font-semibold text-brand-900">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></td>
                <td className="px-4 py-3 text-gray-600">{u.companyName || '—'}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadge(u.role)}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Ativo' : 'Inativo'}</span></td>
                <td className="px-4 py-3 text-center text-gray-500">{u._count?.diagnoses || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleToggleStatus(u)} className="px-2 py-1 text-[10px] font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-600">{u.isActive ? 'Desativar' : 'Ativar'}</button>
                    {u.role === 'user' && <button onClick={() => handleChangeRole(u, 'admin')} className="px-2 py-1 text-[10px] font-medium rounded bg-blue-50 hover:bg-blue-100 text-blue-700">→ Admin</button>}
                    {u.role === 'admin' && <button onClick={() => handleChangeRole(u, 'user')} className="px-2 py-1 text-[10px] font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-600">→ User</button>}
                    <button onClick={() => setHoursModal(u)} className="px-2 py-1 text-[10px] font-medium rounded bg-purple-50 hover:bg-purple-100 text-purple-700">+Horas</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && <div className="flex justify-center gap-2 mt-4">{Array.from({ length: pagination.totalPages }, (_, i) => (<button key={i} onClick={() => loadUsers(i + 1)} className={`px-3 py-1 text-sm rounded ${pagination.page === i + 1 ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>))}</div>}
      {hoursModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setHoursModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-4">Adicionar Horas — {hoursModal.name}</h3>
            <input type="number" min="1" value={hours} onChange={e => setHours(e.target.value)} className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Horas" />
            <textarea value={hoursReason} onChange={e => setHoursReason(e.target.value)} className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} placeholder="Motivo" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setHoursModal(null)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
              <button onClick={handleAddHours} className="px-4 py-2 text-sm bg-brand-900 text-white rounded-lg">Adicionar</button>
            </div>
          </div>
        </div>
      )}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCreateModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-4">Criar Admin</h3>
            <div className="space-y-3">
              <input placeholder="Nome" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input placeholder="Email" type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input placeholder="Senha" type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"><option value="admin">Admin</option><option value="superadmin">Superadmin</option></select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
              <button onClick={handleCreateAdmin} className="px-4 py-2 text-sm bg-brand-900 text-white rounded-lg">Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
