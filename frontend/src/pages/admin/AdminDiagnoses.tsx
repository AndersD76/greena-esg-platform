import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminDiagnosis } from '../../services/admin.service';

export default function AdminDiagnoses() {
  const [diagnoses, setDiagnoses] = useState<AdminDiagnosis[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

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
    return { completed: 'Concluído', in_progress: 'Em andamento' }[s] || s;
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const completedCount = diagnoses.filter(d => d.status === 'completed').length;
  const avgScore = completedCount > 0
    ? diagnoses.filter(d => d.status === 'completed' && d.overallScore).reduce((sum, d) => sum + Number(d.overallScore), 0) / completedCount
    : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Diagnósticos</h1>
          <p className="text-sm text-gray-400">{pagination.total} total — {completedCount} concluídos — Score médio: {avgScore.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'Todos' },
          { value: 'completed', label: 'Concluídos' },
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
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Usuário</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Data</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Geral</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">E</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">S</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">G</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Carregando...</td></tr> :
             diagnoses.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum diagnóstico</td></tr> :
             diagnoses.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
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
    </div>
  );
}
