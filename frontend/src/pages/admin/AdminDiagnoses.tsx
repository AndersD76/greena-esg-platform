import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';

interface AdminDiagnosis {
  id: string;
  userId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  overallScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  user: {
    name: string;
    email: string;
    companyName: string | null;
  };
}

export default function AdminDiagnoses() {
  const [diagnoses, setDiagnoses] = useState<AdminDiagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadDiagnoses();
  }, [filter]);

  async function loadDiagnoses() {
    try {
      setLoading(true);
      const data = await adminService.getDiagnoses(filter || undefined);
      setDiagnoses(data);
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em andamento';
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#7B9965';
    if (score >= 60) return '#EFD4A8';
    if (score >= 40) return '#924131';
    return '#666';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const completedCount = diagnoses.filter(d => d.status === 'completed').length;
  const avgScore = completedCount > 0
    ? diagnoses.filter(d => d.status === 'completed' && d.overallScore).reduce((sum, d) => sum + Number(d.overallScore), 0) / completedCount
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="text-white py-6 px-8" style={{ background: 'linear-gradient(135deg, #152F27 0%, #1a3d33 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="hover:opacity-80">
                <span className="text-2xl">←</span>
              </Link>
              <div>
                <h1 className="text-3xl font-black">Gestão de Diagnósticos</h1>
                <p className="text-green-200 mt-1">Visualizar todos os diagnósticos ESG</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black" style={{ color: '#152F27' }}>{diagnoses.length}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Total</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black text-green-600">{completedCount}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Concluídos</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black text-yellow-600">{diagnoses.filter(d => d.status === 'in_progress').length}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Em andamento</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black" style={{ color: getScoreColor(avgScore) }}>{avgScore.toFixed(0)}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Score Médio</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            {['', 'completed', 'in_progress'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filter === status ? 'text-white' : 'border-2'
                }`}
                style={
                  filter === status
                    ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }
                    : { borderColor: '#e5e5e5', color: '#666' }
                }
              >
                {status === '' ? 'Todos' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnoses List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
              <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando diagnósticos...</p>
            </div>
          ) : diagnoses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xl" style={{ color: '#666' }}>Nenhum diagnóstico encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#152F27' }}>Cliente</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Data</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Score Geral</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>E</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>S</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>G</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold" style={{ color: '#152F27' }}>{diagnosis.user.name}</p>
                      <p className="text-sm" style={{ color: '#666' }}>{diagnosis.user.companyName || diagnosis.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(diagnosis.status)}`}>
                        {getStatusLabel(diagnosis.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm" style={{ color: '#152F27' }}>
                        {diagnosis.status === 'completed' && diagnosis.completedAt
                          ? formatDate(diagnosis.completedAt)
                          : formatDate(diagnosis.startedAt)
                        }
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {diagnosis.overallScore !== null ? (
                        <span className="text-2xl font-black" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                          {Number(diagnosis.overallScore).toFixed(0)}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {diagnosis.environmentalScore !== null ? (
                        <span className="font-bold" style={{ color: getScoreColor(Number(diagnosis.environmentalScore)) }}>
                          {Number(diagnosis.environmentalScore).toFixed(0)}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {diagnosis.socialScore !== null ? (
                        <span className="font-bold" style={{ color: getScoreColor(Number(diagnosis.socialScore)) }}>
                          {Number(diagnosis.socialScore).toFixed(0)}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {diagnosis.governanceScore !== null ? (
                        <span className="font-bold" style={{ color: getScoreColor(Number(diagnosis.governanceScore)) }}>
                          {Number(diagnosis.governanceScore).toFixed(0)}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {diagnosis.status === 'completed' && (
                        <Link
                          to={`/diagnosis/${diagnosis.id}/report`}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          Ver Relatório
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
