import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminDiagnosis } from '../../services/admin.service';

interface DiagnosisDetails {
  id: string;
  userId: string;
  status: string;
  overallScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  completedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; companyName: string | null };
  answers?: Array<{
    id: string;
    questionId: string;
    answer: string;
    score: number | null;
    question?: {
      id: string;
      title: string;
      theme: string;
      pillar: string;
    };
  }>;
  [key: string]: unknown;
}

export default function AdminDiagnoses() {
  const [diagnoses, setDiagnoses] = useState<AdminDiagnosis[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail modal state
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AdminDiagnosis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadDiagnoses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminService.getDiagnoses(page, 20, statusFilter || undefined);
      setDiagnoses(data.diagnoses);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadDiagnoses(1); }, [loadDiagnoses]);

  const statusBadge = (s: string) => ({
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-yellow-100 text-yellow-800',
  }[s] || 'bg-gray-100 text-gray-600');

  function getStatusLabel(s: string) {
    return { completed: 'Concluido', in_progress: 'Em andamento' }[s] || s;
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const pillarLabel = (pillar: string) => {
    const map: Record<string, string> = {
      environmental: 'Ambiental',
      social: 'Social',
      governance: 'Governanca',
      E: 'Ambiental',
      S: 'Social',
      G: 'Governanca',
    };
    return map[pillar] || pillar;
  };

  const pillarColor = (pillar: string) => {
    const p = pillar.toLowerCase();
    if (p === 'environmental' || p === 'e' || p === 'ambiental') return '#7B9965';
    if (p === 'social' || p === 's') return '#924131';
    if (p === 'governance' || p === 'g' || p === 'governanca') return '#b8963a';
    return '#6b7280';
  };

  // View details
  const handleViewDetails = async (diagnosis: AdminDiagnosis) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setSelectedDiagnosis(null);
    try {
      const details = await adminService.getDiagnosisDetails(diagnosis.id);
      setSelectedDiagnosis(details);
    } catch (e) {
      console.error('Erro ao carregar detalhes:', e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteDiagnosis(deleteTarget.id);
      setDeleteTarget(null);
      loadDiagnoses(pagination.page);
    } catch (e) {
      console.error('Erro ao excluir:', e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const completedCount = diagnoses.filter(d => d.status === 'completed').length;
  const avgScore = completedCount > 0
    ? diagnoses.filter(d => d.status === 'completed' && d.overallScore).reduce((sum, d) => sum + Number(d.overallScore), 0) / completedCount
    : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Diagnosticos</h1>
          <p className="text-sm text-gray-400">{pagination.total} total — {completedCount} concluidos — Score medio: {avgScore.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'Todos' },
          { value: 'completed', label: 'Concluidos' },
          { value: 'in_progress', label: 'Em andamento' },
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
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Usuario</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Data</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Geral</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">E</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">S</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">G</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Carregando...</td></tr> :
             diagnoses.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Nenhum diagnostico</td></tr> :
             diagnoses.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => handleViewDetails(d)}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-brand-900">{d.user.name}</p>
                  <p className="text-xs text-gray-400">{d.user.companyName || d.user.email}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(d.status)}`}>{getStatusLabel(d.status)}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600 text-xs">
                  {d.completedAt ? new Date(d.completedAt).toLocaleDateString('pt-BR') : new Date(d.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-center">
                  {d.overallScore !== null
                    ? <span className={`font-bold text-lg ${scoreColor(Number(d.overallScore))}`}>{Number(d.overallScore).toFixed(0)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {d.environmentalScore !== null
                    ? <span className={`font-semibold ${scoreColor(Number(d.environmentalScore))}`}>{Number(d.environmentalScore).toFixed(0)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {d.socialScore !== null
                    ? <span className={`font-semibold ${scoreColor(Number(d.socialScore))}`}>{Number(d.socialScore).toFixed(0)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {d.governanceScore !== null
                    ? <span className={`font-semibold ${scoreColor(Number(d.governanceScore))}`}>{Number(d.governanceScore).toFixed(0)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleViewDetails(d)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-900 hover:bg-brand-900/5 transition-colors"
                      title="Ver detalhes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
            <button key={i} onClick={() => loadDiagnoses(i + 1)}
              className={`px-3 py-1 text-sm rounded ${pagination.page === i + 1 ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-brand-900">Detalhes do Diagnostico</h2>
                {selectedDiagnosis && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {selectedDiagnosis.user.name} — {selectedDiagnosis.user.companyName || selectedDiagnosis.user.email}
                  </p>
                )}
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-3 border-brand-900/20 border-t-brand-900 rounded-full animate-spin" />
                </div>
              ) : selectedDiagnosis ? (
                <div className="space-y-6">
                  {/* Score overview */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Geral</p>
                      <p className={`text-2xl font-bold ${selectedDiagnosis.overallScore !== null ? scoreColor(Number(selectedDiagnosis.overallScore)) : 'text-gray-300'}`}>
                        {selectedDiagnosis.overallScore !== null ? Number(selectedDiagnosis.overallScore).toFixed(0) : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#7B996510' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7B9965' }}>Ambiental</p>
                      <p className="text-2xl font-bold" style={{ color: '#7B9965' }}>
                        {selectedDiagnosis.environmentalScore !== null ? Number(selectedDiagnosis.environmentalScore).toFixed(0) : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#92413110' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#924131' }}>Social</p>
                      <p className="text-2xl font-bold" style={{ color: '#924131' }}>
                        {selectedDiagnosis.socialScore !== null ? Number(selectedDiagnosis.socialScore).toFixed(0) : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#b8963a10' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#b8963a' }}>Governanca</p>
                      <p className="text-2xl font-bold" style={{ color: '#b8963a' }}>
                        {selectedDiagnosis.governanceScore !== null ? Number(selectedDiagnosis.governanceScore).toFixed(0) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-0.5">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(selectedDiagnosis.status)}`}>
                        {getStatusLabel(selectedDiagnosis.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-0.5">Email</p>
                      <p className="text-brand-900 font-medium">{selectedDiagnosis.user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-0.5">Criado em</p>
                      <p className="text-gray-700">{new Date(selectedDiagnosis.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-0.5">Concluido em</p>
                      <p className="text-gray-700">
                        {selectedDiagnosis.completedAt
                          ? new Date(selectedDiagnosis.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Answers */}
                  {selectedDiagnosis.answers && selectedDiagnosis.answers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-brand-900 mb-3">Respostas ({selectedDiagnosis.answers.length})</h3>
                      <div className="space-y-2">
                        {selectedDiagnosis.answers.map((a, idx) => (
                          <div key={a.id || idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                {a.question ? (
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                                      style={{ backgroundColor: pillarColor(a.question.pillar) }}
                                    >
                                      {pillarLabel(a.question.pillar)}
                                    </span>
                                    {a.question.theme && (
                                      <span className="text-[10px] text-gray-400 font-medium">{a.question.theme}</span>
                                    )}
                                  </div>
                                ) : null}
                                <p className="text-sm text-gray-700 font-medium">
                                  {a.question?.title || `Pergunta ${idx + 1}`}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{a.answer}</p>
                              </div>
                              {a.score !== null && a.score !== undefined && (
                                <div className="flex-shrink-0 text-right">
                                  <span className={`text-lg font-bold ${scoreColor(Number(a.score))}`}>
                                    {Number(a.score).toFixed(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If no answers */}
                  {selectedDiagnosis.answers && selectedDiagnosis.answers.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Nenhuma resposta registrada.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 text-sm">
                  Erro ao carregar detalhes.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir diagnostico</h3>
                <p className="text-sm text-gray-500">Esta acao nao pode ser desfeita.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">{deleteTarget.user.name}</span>
                {deleteTarget.user.companyName && <span className="text-gray-400"> — {deleteTarget.user.companyName}</span>}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {getStatusLabel(deleteTarget.status)} — {deleteTarget.completedAt ? new Date(deleteTarget.completedAt).toLocaleDateString('pt-BR') : new Date(deleteTarget.createdAt).toLocaleDateString('pt-BR')}
                {deleteTarget.overallScore !== null && ` — Score: ${Number(deleteTarget.overallScore).toFixed(0)}`}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
