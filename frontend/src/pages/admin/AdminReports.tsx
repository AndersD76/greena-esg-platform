import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';

interface PlatformReport {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: { role: string; _count: number }[];
  };
  diagnoses: {
    total: number;
    completed: number;
    inProgress: number;
    averageScore: number;
    byPillar: {
      environmental: number;
      social: number;
      governance: number;
    };
  };
  consultations: {
    total: number;
    scheduled: number;
    completed: number;
    totalHours: number;
  };
  subscriptions: {
    total: number;
    active: number;
    revenue: number;
    byPlan: { planId: string; _count: number }[];
  };
}

export default function AdminReports() {
  const [report, setReport] = useState<PlatformReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      const data = await adminService.getReports(startDate || undefined, endDate || undefined);
      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#7B9965';
    if (score >= 60) return '#EFD4A8';
    if (score >= 40) return '#924131';
    return '#666';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Gerando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <p className="text-xl text-red-600">Erro ao carregar relatório</p>
      </div>
    );
  }

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
                <h1 className="text-3xl font-black">Relatórios da Plataforma</h1>
                <p className="text-green-200 mt-1">Métricas e estatísticas gerais</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Date Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#152F27' }}>Filtrar por Período</h3>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#666' }}>Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-lg border-2"
                style={{ borderColor: '#e5e5e5' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#666' }}>Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-lg border-2"
                style={{ borderColor: '#e5e5e5' }}
              />
            </div>
            <button
              onClick={loadReport}
              className="px-6 py-2 text-white font-bold rounded-lg"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              Aplicar Filtro
            </button>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#152F27' }}>
            <svg className="w-6 h-6" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Usuários
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#152F27' }}>{report.users.total}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Total Cadastrados</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-green-600">{report.users.active}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Usuários Ativos</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-blue-600">{report.users.newThisMonth}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Novos este Mês</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#7B9965' }}>
                {((report.users.active / report.users.total) * 100).toFixed(0)}%
              </p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Taxa de Ativação</p>
            </div>
          </div>
        </div>

        {/* Diagnoses Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#152F27' }}>
            <svg className="w-6 h-6" fill="none" stroke="#10B981" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Diagnósticos ESG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#152F27' }}>{report.diagnoses.total}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Total</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-green-600">{report.diagnoses.completed}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Concluídos</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: getScoreColor(report.diagnoses.averageScore) }}>
                {report.diagnoses.averageScore.toFixed(0)}
              </p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Score Médio</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#7B9965' }}>
                {((report.diagnoses.completed / report.diagnoses.total) * 100 || 0).toFixed(0)}%
              </p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Taxa de Conclusão</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-yellow-600">{report.diagnoses.inProgress}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Em Andamento</p>
            </div>
          </div>

          {/* Pillar Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#152F27' }}>Média por Pilar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: '#f5f5f5', borderColor: '#7B9965' }}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Ambiental</span>
                  <span className="text-2xl font-black" style={{ color: getScoreColor(report.diagnoses.byPillar.environmental) }}>
                    {report.diagnoses.byPillar.environmental.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: '#f5f5f5', borderColor: '#4A90D9' }}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Social</span>
                  <span className="text-2xl font-black" style={{ color: getScoreColor(report.diagnoses.byPillar.social) }}>
                    {report.diagnoses.byPillar.social.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: '#f5f5f5', borderColor: '#9B59B6' }}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Governança</span>
                  <span className="text-2xl font-black" style={{ color: getScoreColor(report.diagnoses.byPillar.governance) }}>
                    {report.diagnoses.byPillar.governance.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#152F27' }}>
            <svg className="w-6 h-6" fill="none" stroke="#8B5CF6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Consultorias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#152F27' }}>{report.consultations.total}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Total</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-blue-600">{report.consultations.scheduled}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Agendadas</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-green-600">{report.consultations.completed}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Concluídas</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#7B9965' }}>{report.consultations.totalHours.toFixed(1)}h</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Horas Realizadas</p>
            </div>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#152F27' }}>
            <svg className="w-6 h-6" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Assinaturas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#152F27' }}>{report.subscriptions.total}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Total</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black text-green-600">{report.subscriptions.active}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Ativas</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#7B9965' }}>{formatCurrency(report.subscriptions.revenue)}</p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Receita Mensal</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-3xl font-black" style={{ color: '#152F27' }}>
                {((report.subscriptions.active / report.subscriptions.total) * 100 || 0).toFixed(0)}%
              </p>
              <p className="text-sm font-bold" style={{ color: '#666' }}>Taxa de Retenção</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
