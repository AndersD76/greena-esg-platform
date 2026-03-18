import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminConsultation } from '../../services/admin.service';

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [modal, setModal] = useState<AdminConsultation | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

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

  const statusBadge = (s: string) => ({
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-600');

  function getStatusLabel(s: string) {
    return { scheduled: 'Agendada', in_progress: 'Em andamento', completed: 'Concluída', cancelled: 'Cancelada' }[s] || s;
  }

  return (
    <div className="p-8">
      {msg && <div className="fixed top-4 right-4 bg-brand-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">{msg}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Consultorias</h1>
        <p className="text-sm text-gray-400">{pagination.total} registradas</p>
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

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-900 mb-4">Alterar Status — {modal.user.name}</h3>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="scheduled">Agendada</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} placeholder="Observações (opcional)" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setModal(null); setNewStatus(''); setNotes(''); }} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
              <button onClick={handleUpdateStatus} className="px-4 py-2 text-sm bg-brand-900 text-white rounded-lg">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
