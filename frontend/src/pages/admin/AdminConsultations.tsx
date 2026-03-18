import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService, AdminConsultation, AdminUser } from '../../services/admin.service';

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [modal, setModal] = useState<AdminConsultation | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: '',
    scheduledAt: '',
    scheduledTime: '09:00',
    duration: 60,
    topic: '',
    consultantName: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AdminConsultation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadConsultations = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getConsultations(page, 20, statusFilter || undefined);
      setConsultations(data.consultations);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadConsultations(1); }, [loadConsultations]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  async function handleUpdateStatus() {
    if (!modal || !newStatus) return;
    try {
      await adminService.updateConsultation(modal.id, { status: newStatus, notes: notes || undefined });
      flash(`Status atualizado para ${getStatusLabel(newStatus)}`);
      setModal(null); setNewStatus(''); setNotes('');
      loadConsultations(pagination.page);
    } catch (e: any) { flash(e.message); }
  }

  // User search with debounce
  function handleUserSearch(value: string) {
    setUserSearch(value);
    setSelectedUser(null);
    setCreateForm(prev => ({ ...prev, userId: '' }));
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setUserResults([]);
      setShowUserDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const data = await adminService.getUsers(1, 10, value.trim());
        setUserResults(data.users);
        setShowUserDropdown(true);
      } catch (e) {
        console.error(e);
      } finally {
        setUserSearchLoading(false);
      }
    }, 350);
  }

  function selectUser(user: AdminUser) {
    setSelectedUser(user);
    setCreateForm(prev => ({ ...prev, userId: user.id }));
    setUserSearch(user.name || user.email);
    setShowUserDropdown(false);
  }

  function resetCreateModal() {
    setShowCreateModal(false);
    setCreateForm({ userId: '', scheduledAt: '', scheduledTime: '09:00', duration: 60, topic: '', consultantName: '' });
    setUserSearch('');
    setSelectedUser(null);
    setUserResults([]);
    setShowUserDropdown(false);
  }

  async function handleCreate() {
    if (!createForm.userId || !createForm.scheduledAt) {
      flash('Selecione um usuário e uma data.');
      return;
    }
    setCreating(true);
    try {
      const scheduledAt = new Date(`${createForm.scheduledAt}T${createForm.scheduledTime}:00`).toISOString();
      await adminService.createConsultation({
        userId: createForm.userId,
        scheduledAt,
        duration: createForm.duration,
        topic: createForm.topic || undefined,
        consultantName: createForm.consultantName || undefined,
      });
      flash('Consultoria criada com sucesso!');
      resetCreateModal();
      loadConsultations(1);
    } catch (e: any) {
      flash(e.message || 'Erro ao criar consultoria');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteConsultation(deleteTarget.id);
      flash('Consultoria excluída com sucesso.');
      setDeleteTarget(null);
      loadConsultations(pagination.page);
    } catch (e: any) {
      flash(e.message || 'Erro ao excluir consultoria');
    } finally {
      setDeleting(false);
    }
  }

  const statusBadge = (s: string) => ({
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-600');

  function getStatusLabel(s: string) {
    return { scheduled: 'Agendada', in_progress: 'Em andamento', completed: 'Concluída', cancelled: 'Cancelada' }[s] || s;
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-colors';

  return (
    <div className="p-8">
      {msg && <div className="fixed top-4 right-4 bg-brand-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">{msg}</div>}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Consultorias</h1>
          <p className="text-sm text-gray-400">{pagination.total} registradas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-brand-900 text-white text-sm font-semibold rounded-lg hover:bg-brand-900/90 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Consultoria
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'Todas' },
          { value: 'scheduled', label: 'Agendadas' },
          { value: 'in_progress', label: 'Em andamento' },
          { value: 'completed', label: 'Concluídas' },
          { value: 'cancelled', label: 'Canceladas' },
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
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Usuário</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Data</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Duração</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Msgs</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td></tr> :
             consultations.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma consultoria</td></tr> :
             consultations.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-brand-900">{c.user.name}</p>
                  <p className="text-xs text-gray-400">{c.user.companyName || c.user.email}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(c.status)}`}>{getStatusLabel(c.status)}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {new Date(c.scheduledAt).toLocaleDateString('pt-BR')}
                  <p className="text-[10px] text-gray-400">{new Date(c.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{c.duration}min</td>
                <td className="px-4 py-3 text-center text-gray-500">{c._count.messages}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {c.meetingUrl && c.status === 'scheduled' && (
                      <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer"
                        className="px-2 py-1 text-[10px] font-medium rounded bg-green-50 hover:bg-green-100 text-green-700">Entrar</a>
                    )}
                    <button onClick={() => { setModal(c); setNewStatus(c.status); }}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-blue-50 hover:bg-blue-100 text-blue-700">Alterar Status</button>
                    <button onClick={() => setDeleteTarget(c)}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-red-50 hover:bg-red-100 text-red-700">Excluir</button>
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
            <button key={i} onClick={() => loadConsultations(i + 1)}
              className={`px-3 py-1 text-sm rounded ${pagination.page === i + 1 ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Status update modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-4">Alterar Status — {modal.user.name}</h3>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className={inputClass + ' mb-3'}>
              <option value="scheduled">Agendada</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className={inputClass + ' mb-4'} rows={2} placeholder="Observações (opcional)" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setModal(null); setNewStatus(''); setNotes(''); }} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
              <button onClick={handleUpdateStatus} className="px-4 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900/90 transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Create consultation modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={resetCreateModal}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-5">Nova Consultoria</h3>

            {/* User search */}
            <label className="block text-xs font-semibold text-gray-500 mb-1">Usuário *</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={userSearch}
                onChange={e => handleUserSearch(e.target.value)}
                onFocus={() => { if (userResults.length > 0 && !selectedUser) setShowUserDropdown(true); }}
                placeholder="Buscar por nome, email ou empresa..."
                className={inputClass}
              />
              {userSearchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-brand-900/30 border-t-brand-900 rounded-full animate-spin" />
                </div>
              )}
              {selectedUser && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {showUserDropdown && userResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {userResults.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-brand-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}{u.companyName ? ` — ${u.companyName}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}
              {showUserDropdown && userResults.length === 0 && userSearch.trim().length >= 2 && !userSearchLoading && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                  <p className="text-sm text-gray-400 text-center">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>

            {/* Date and time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Data *</label>
                <input
                  type="date"
                  value={createForm.scheduledAt}
                  onChange={e => setCreateForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Horário *</label>
                <input
                  type="time"
                  value={createForm.scheduledTime}
                  onChange={e => setCreateForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Duration */}
            <label className="block text-xs font-semibold text-gray-500 mb-1">Duração</label>
            <div className="flex gap-2 mb-4">
              {[30, 60, 90].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setCreateForm(prev => ({ ...prev, duration: d }))}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    createForm.duration === d
                      ? 'bg-brand-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>

            {/* Topic */}
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tópico</label>
            <input
              type="text"
              value={createForm.topic}
              onChange={e => setCreateForm(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Ex: Diagnóstico ESG inicial"
              className={inputClass + ' mb-4'}
            />

            {/* Consultant name */}
            <label className="block text-xs font-semibold text-gray-500 mb-1">Consultor</label>
            <input
              type="text"
              value={createForm.consultantName}
              onChange={e => setCreateForm(prev => ({ ...prev, consultantName: e.target.value }))}
              placeholder="Nome do consultor"
              className={inputClass + ' mb-5'}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={resetCreateModal} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.userId || !createForm.scheduledAt}
                className="px-5 py-2 text-sm bg-brand-900 text-white rounded-lg hover:bg-brand-900/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Criando...' : 'Criar Consultoria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Consultoria</h3>
                <p className="text-xs text-gray-400">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Tem certeza que deseja excluir a consultoria de <span className="font-semibold text-brand-900">{deleteTarget.user.name}</span> agendada para{' '}
              <span className="font-semibold">{new Date(deleteTarget.scheduledAt).toLocaleDateString('pt-BR')}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
