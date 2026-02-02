import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminDashboardStats } from '../../services/admin.service';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Erro ao carregar dados do painel</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="text-white py-6 px-8" style={{ background: 'linear-gradient(135deg, #152F27 0%, #1a3d33 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">Painel Administrativo</h1>
              <p className="text-green-200 mt-1">Gestão completa da plataforma Greena ESG</p>
            </div>
            <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-16 filter brightness-0 invert" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">👥</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                Usuários
              </span>
            </div>
            <p className="text-4xl font-black" style={{ color: '#152F27' }}>{stats.totalUsers}</p>
            <p className="text-sm font-semibold mt-2" style={{ color: '#666' }}>
              {stats.activeUsers} ativos
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📊</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
                Diagnósticos
              </span>
            </div>
            <p className="text-4xl font-black" style={{ color: '#152F27' }}>{stats.totalDiagnoses}</p>
            <p className="text-sm font-semibold mt-2" style={{ color: '#666' }}>
              {stats.completedDiagnoses} concluídos
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📅</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                Consultorias
              </span>
            </div>
            <p className="text-4xl font-black" style={{ color: '#152F27' }}>{stats.totalConsultations}</p>
            <p className="text-sm font-semibold mt-2" style={{ color: '#666' }}>
              {stats.scheduledConsultations} agendadas
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💳</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                Assinaturas
              </span>
            </div>
            <p className="text-4xl font-black" style={{ color: '#152F27' }}>{stats.totalSubscriptions}</p>
            <p className="text-sm font-semibold mt-2" style={{ color: '#666' }}>
              {stats.activeSubscriptions} ativas
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-black mb-4" style={{ color: '#152F27' }}>Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link to="/admin/users">
              <button className="w-full p-4 rounded-xl border-2 hover:bg-green-50 transition-all" style={{ borderColor: '#152F27' }}>
                <span className="text-2xl block mb-2">👥</span>
                <span className="font-bold text-sm" style={{ color: '#152F27' }}>Usuários</span>
              </button>
            </Link>
            <Link to="/admin/consultations">
              <button className="w-full p-4 rounded-xl border-2 hover:bg-green-50 transition-all" style={{ borderColor: '#152F27' }}>
                <span className="text-2xl block mb-2">📅</span>
                <span className="font-bold text-sm" style={{ color: '#152F27' }}>Consultorias</span>
              </button>
            </Link>
            <Link to="/admin/subscriptions">
              <button className="w-full p-4 rounded-xl border-2 hover:bg-green-50 transition-all" style={{ borderColor: '#152F27' }}>
                <span className="text-2xl block mb-2">💳</span>
                <span className="font-bold text-sm" style={{ color: '#152F27' }}>Assinaturas</span>
              </button>
            </Link>
            <Link to="/admin/diagnoses">
              <button className="w-full p-4 rounded-xl border-2 hover:bg-green-50 transition-all" style={{ borderColor: '#152F27' }}>
                <span className="text-2xl block mb-2">📊</span>
                <span className="font-bold text-sm" style={{ color: '#152F27' }}>Diagnósticos</span>
              </button>
            </Link>
            <Link to="/admin/reports">
              <button className="w-full p-4 rounded-xl border-2 hover:bg-green-50 transition-all" style={{ borderColor: '#152F27' }}>
                <span className="text-2xl block mb-2">📈</span>
                <span className="font-bold text-sm" style={{ color: '#152F27' }}>Relatórios</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black" style={{ color: '#152F27' }}>Usuários Recentes</h2>
              <Link to="/admin/users">
                <span className="text-sm font-bold" style={{ color: '#7B9965' }}>Ver todos →</span>
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
                  <div>
                    <p className="font-bold" style={{ color: '#152F27' }}>{user.name}</p>
                    <p className="text-sm" style={{ color: '#666' }}>{user.companyName || user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Diagnoses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black" style={{ color: '#152F27' }}>Diagnósticos Recentes</h2>
              <Link to="/admin/diagnoses">
                <span className="text-sm font-bold" style={{ color: '#7B9965' }}>Ver todos →</span>
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentDiagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
                  <div>
                    <p className="font-bold" style={{ color: '#152F27' }}>{diagnosis.user?.name || 'Usuário'}</p>
                    <p className="text-sm" style={{ color: '#666' }}>{diagnosis.user?.companyName || 'Empresa não informada'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      diagnosis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {diagnosis.status === 'completed' ? 'Concluído' : 'Em andamento'}
                    </span>
                    {diagnosis.status === 'completed' && diagnosis.overallScore && (
                      <p className="text-lg font-black mt-1" style={{ color: '#7B9965' }}>
                        {Number(diagnosis.overallScore).toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
