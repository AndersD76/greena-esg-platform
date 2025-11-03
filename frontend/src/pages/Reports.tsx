import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

export default function Reports() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    loadDiagnoses();
  }, []);

  async function loadDiagnoses() {
    try {
      const data = await diagnosisService.list();
      setDiagnoses(data);
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#7B9965';
    if (score >= 60) return '#EFD4A8';
    if (score >= 40) return '#924131';
    return '#666';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Necessita Melhoria';
  };

  const filteredDiagnoses = diagnoses.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return d.status === 'completed';
    if (filter === 'in_progress') return d.status === 'in_progress';
    return true;
  });

  const completedDiagnoses = diagnoses.filter((d) => d.status === 'completed');
  const avgScore = completedDiagnoses.length > 0
    ? completedDiagnoses.reduce((sum, d) => sum + Number(d.overallScore), 0) / completedDiagnoses.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>Relatórios ESG</h1>
              <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>Histórico completo de diagnósticos</p>
            </div>
            <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-20" />
          </div>
        </div>

        {/* Summary Cards */}
        {completedDiagnoses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-sm font-bold mb-2" style={{ color: '#666' }}>TOTAL DE DIAGNÓSTICOS</p>
              <p className="text-5xl font-black" style={{ color: '#152F27' }}>{diagnoses.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-sm font-bold mb-2" style={{ color: '#666' }}>CONCLUÍDOS</p>
              <p className="text-5xl font-black" style={{ color: '#7B9965' }}>{completedDiagnoses.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-sm font-bold mb-2" style={{ color: '#666' }}>SCORE MÉDIO</p>
              <p className="text-5xl font-black" style={{ color: getScoreColor(avgScore) }}>
                {avgScore.toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-sm font-bold mb-2" style={{ color: '#666' }}>ÚLTIMO SCORE</p>
              <p className="text-5xl font-black" style={{ color: getScoreColor(Number(completedDiagnoses[0]?.overallScore || 0)) }}>
                {Number(completedDiagnoses[0]?.overallScore || 0).toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                filter === 'all' ? 'text-white' : 'border-2'
              }`}
              style={
                filter === 'all'
                  ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }
                  : { borderColor: '#152F27', color: '#152F27' }
              }
            >
              Todos ({diagnoses.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                filter === 'completed' ? 'text-white' : 'border-2'
              }`}
              style={
                filter === 'completed'
                  ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }
                  : { borderColor: '#152F27', color: '#152F27' }
              }
            >
              Concluídos ({completedDiagnoses.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                filter === 'in_progress' ? 'text-white' : 'border-2'
              }`}
              style={
                filter === 'in_progress'
                  ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }
                  : { borderColor: '#152F27', color: '#152F27' }
              }
            >
              Em Andamento ({diagnoses.filter((d) => d.status === 'in_progress').length})
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-black mb-6" style={{ color: '#152F27' }}>
            {filter === 'all' ? 'Todos os Diagnósticos' : filter === 'completed' ? 'Diagnósticos Concluídos' : 'Em Andamento'}
          </h2>

          {filteredDiagnoses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-semibold mb-4" style={{ color: '#666' }}>
                Nenhum diagnóstico encontrado
              </p>
              <Link to="/dashboard">
                <button
                  className="px-8 py-3 text-lg font-black text-white rounded-xl transition-all hover:scale-105 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  Fazer Novo Diagnóstico
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="p-6 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-bold ${
                            diagnosis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {diagnosis.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                        </span>
                        <p className="text-sm font-semibold" style={{ color: '#666' }}>
                          {diagnosis.status === 'completed' && diagnosis.completedAt
                            ? `Concluído em ${new Date(diagnosis.completedAt).toLocaleDateString('pt-BR')}`
                            : `Iniciado em ${new Date(diagnosis.startedAt).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>

                      {diagnosis.status === 'completed' && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: '#666' }}>GERAL</p>
                            <div className="flex items-center gap-2">
                              <p className="text-3xl font-black" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                                {Number(diagnosis.overallScore).toFixed(0)}
                              </p>
                              <span className="text-xs font-bold" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                                {getScoreLevel(Number(diagnosis.overallScore))}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: '#666' }}>AMBIENTAL</p>
                            <p className="text-3xl font-black" style={{ color: getScoreColor(Number(diagnosis.environmentalScore)) }}>
                              {Number(diagnosis.environmentalScore).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: '#666' }}>SOCIAL</p>
                            <p className="text-3xl font-black" style={{ color: getScoreColor(Number(diagnosis.socialScore)) }}>
                              {Number(diagnosis.socialScore).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: '#666' }}>GOVERNANÇA</p>
                            <p className="text-3xl font-black" style={{ color: getScoreColor(Number(diagnosis.governanceScore)) }}>
                              {Number(diagnosis.governanceScore).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      {diagnosis.status === 'completed' ? (
                        <Link to={`/diagnosis/${diagnosis.id}/results`}>
                          <button
                            className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                          >
                            Ver Resultados
                          </button>
                        </Link>
                      ) : (
                        <Link to={`/diagnosis/${diagnosis.id}/questionnaire`}>
                          <button
                            className="px-6 py-2.5 text-sm font-bold border-2 rounded-lg transition-all hover:bg-green-50"
                            style={{ borderColor: '#152F27', color: '#152F27' }}
                          >
                            Continuar
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
