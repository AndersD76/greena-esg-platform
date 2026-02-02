import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminSubscription } from '../../services/admin.service';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadSubscriptions();
  }, [filter]);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const data = await adminService.getSubscriptions(filter || undefined);
      setSubscriptions(data);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(subscription: AdminSubscription, newStatus: string) {
    if (!confirm(`Deseja alterar o status da assinatura para "${newStatus}"?`)) return;

    try {
      await adminService.updateSubscriptionStatus(subscription.id, newStatus);
      loadSubscriptions();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da assinatura');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getPlanBadge = (planName: string) => {
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('avançado')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (planName.toLowerCase().includes('profissional')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + Number(s.plan.price), 0);

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
                <h1 className="text-3xl font-black">Gestão de Assinaturas</h1>
                <p className="text-green-200 mt-1">Gerenciar planos e pagamentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black" style={{ color: '#152F27' }}>{subscriptions.length}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Total</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black text-green-600">{activeCount}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Ativas</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black" style={{ color: '#7B9965' }}>{formatCurrency(totalRevenue)}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Receita Mensal</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black" style={{ color: '#152F27' }}>
              {subscriptions.reduce((sum, s) => sum + s.consultationHoursUsed, 0).toFixed(1)}h
            </p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Horas Utilizadas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            {['', 'active', 'pending', 'cancelled', 'expired'].map((status) => (
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
                {status === '' ? 'Todas' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
              <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando assinaturas...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xl" style={{ color: '#666' }}>Nenhuma assinatura encontrada</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#152F27' }}>Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#152F27' }}>Plano</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Período</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Horas</th>
                  <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold" style={{ color: '#152F27' }}>{subscription.user.name}</p>
                      <p className="text-sm" style={{ color: '#666' }}>{subscription.user.companyName || subscription.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPlanBadge(subscription.plan.name)}`}>
                        {subscription.plan.name}
                      </span>
                      <p className="text-sm mt-1" style={{ color: '#666' }}>{formatCurrency(Number(subscription.plan.price))}/mês</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(subscription.status)}`}>
                        {getStatusLabel(subscription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm" style={{ color: '#152F27' }}>{formatDate(subscription.startDate)}</p>
                      {subscription.endDate && (
                        <p className="text-xs" style={{ color: '#666' }}>até {formatDate(subscription.endDate)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold" style={{ color: '#152F27' }}>
                        {subscription.consultationHoursUsed}h / {subscription.plan.consultationHours}h
                      </p>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (subscription.consultationHoursUsed / subscription.plan.consultationHours) * 100)}%`,
                            backgroundColor: '#7B9965'
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(subscription, 'cancelled')}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            Cancelar
                          </button>
                        )}
                        {subscription.status === 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(subscription, 'active')}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            Reativar
                          </button>
                        )}
                        {subscription.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(subscription, 'active')}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            Aprovar
                          </button>
                        )}
                      </div>
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
