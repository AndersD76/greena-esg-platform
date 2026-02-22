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
    return '#9ca3af';
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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-1">Relatórios ESG</h1>
          <p className="text-sm text-gray-500">Histórico completo de diagnósticos</p>
        </div>

        {/* Summary Cards */}
        {completedDiagnoses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Total de Diagnósticos</p>
              <p className="text-4xl font-bold text-brand-900">{diagnoses.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Concluídos</p>
              <p className="text-4xl font-bold" style={{ color: '#7B9965' }}>{completedDiagnoses.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Score Médio</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(avgScore) }}>
                {avgScore.toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Último Score</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(Number(completedDiagnoses[0]?.overallScore || 0)) }}>
                {Number(completedDiagnoses[0]?.overallScore || 0).toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-2">
            {[
              { key: 'all' as const, label: `Todos (${diagnoses.length})` },
              { key: 'completed' as const, label: `Concluídos (${completedDiagnoses.length})` },
              { key: 'in_progress' as const, label: `Em Andamento (${diagnoses.filter((d) => d.status === 'in_progress').length})` },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                  filter === item.key
                    ? 'text-white bg-brand-900'
                    : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-brand-900 mb-6">
            {filter === 'all' ? 'Todos os Diagnósticos' : filter === 'completed' ? 'Diagnósticos Concluídos' : 'Em Andamento'}
          </h2>

          {filteredDiagnoses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-6">Nenhum diagnóstico encontrado</p>
              <Link to="/dashboard">
                <button className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                  Fazer Novo Diagnóstico
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="p-5 rounded-xl bg-gray-50 hover:bg-brand-100 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            diagnosis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {diagnosis.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                        </span>
                        <p className="text-xs text-gray-400">
                          {diagnosis.status === 'completed' && diagnosis.completedAt
                            ? `Concluído em ${new Date(diagnosis.completedAt).toLocaleDateString('pt-BR')}`
                            : `Iniciado em ${new Date(diagnosis.startedAt).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>

                      {diagnosis.status === 'completed' && (
                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Geral</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                                {Number(diagnosis.overallScore).toFixed(0)}
                              </p>
                              <span className="text-xs font-medium" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                                {getScoreLevel(Number(diagnosis.overallScore))}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ambiental</p>
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.environmentalScore)) }}>
                              {Number(diagnosis.environmentalScore).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Social</p>
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.socialScore)) }}>
                              {Number(diagnosis.socialScore).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Governança</p>
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.governanceScore)) }}>
                              {Number(diagnosis.governanceScore).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex gap-2">
                      {diagnosis.status === 'completed' ? (
                        <>
                          <Link to={`/diagnosis/${diagnosis.id}/results`}>
                            <button className="px-5 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                              Resultados
                            </button>
                          </Link>
                          <Link to={`/diagnosis/${diagnosis.id}/report`}>
                            <button className="px-5 py-2 text-xs font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                              Relatório Completo
                            </button>
                          </Link>
                        </>
                      ) : (
                        <Link to={`/diagnosis/${diagnosis.id}/questionnaire`}>
                          <button className="px-5 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
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
