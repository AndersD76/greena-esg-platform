import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  companyName: string;
  cnpj?: string;
  sector?: string;
  employees?: string;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  billingCycle: string;
  maxDiagnoses: number | null;
  consultationHours: number;
  features: any;
  active: boolean;
}

interface UsageStats {
  plan: SubscriptionPlan;
  subscription: any;
  usage: {
    diagnoses: {
      current: number;
      limit: number | null;
      unlimited: boolean;
    };
    consultationHours: {
      used: number;
      total: number;
      remaining: number;
    };
    certificates: number;
  };
}

export default function Profile() {
  const { } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    cnpj: '',
    sector: '',
    employees: '',
  });

  useEffect(() => {
    loadProfile();
    loadSubscriptionData();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        companyName: response.data.companyName || '',
        cnpj: response.data.cnpj || '',
        sector: response.data.sector || '',
        employees: response.data.employees || '',
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubscriptionData() {
    try {
      const [statsResponse, plansResponse] = await Promise.all([
        api.get('/subscriptions/usage-stats'),
        api.get('/subscriptions/plans')
      ]);
      setUsageStats(statsResponse.data);
      setAvailablePlans(plansResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados de assinatura:', error);
    }
  }

  async function handleUpgradePlan(planCode: string) {
    if (!confirm(`Deseja fazer upgrade para o plano ${planCode.toUpperCase()}?`)) {
      return;
    }

    try {
      await api.post('/subscriptions', { planCode });
      await loadSubscriptionData();
      alert('Plano atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      alert(error.response?.data?.error || 'Erro ao atualizar plano');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/auth/profile', formData);
      await loadProfile();
      setEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>Meu Perfil</h1>
          <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>Gerencie suas informacoes pessoais e da empresa</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              {profile?.name ? getInitials(profile.name) : 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black" style={{ color: '#152F27' }}>{profile?.name}</h2>
              <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>{profile?.companyName}</p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#666' }}>{profile?.email}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              {editing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-black mb-6" style={{ color: '#152F27' }}>Informacoes da Empresa</h3>

          {!editing ? (
            <>
              {/* View Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                      <svg className="w-4 h-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#666' }}>EMPRESA</span>
                  </div>
                  <p className="text-lg font-black" style={{ color: '#152F27' }}>{profile?.companyName || '-'}</p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                      <svg className="w-4 h-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#666' }}>CNPJ</span>
                  </div>
                  <p className="text-lg font-black" style={{ color: '#152F27' }}>{profile?.cnpj || '-'}</p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                      <svg className="w-4 h-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#666' }}>SETOR</span>
                  </div>
                  <p className="text-lg font-black" style={{ color: '#152F27' }}>{profile?.sector || '-'}</p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                      <svg className="w-4 h-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#666' }}>FUNCIONARIOS</span>
                  </div>
                  <p className="text-lg font-black" style={{ color: '#152F27' }}>{profile?.employees || '-'}</p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                      <svg className="w-4 h-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#666' }}>MEMBRO DESDE</span>
                  </div>
                  <p className="text-lg font-black" style={{ color: '#152F27' }}>
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold"
                        style={{ borderColor: '#7B9965', color: '#152F27' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Empresa *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold"
                        style={{ borderColor: '#7B9965', color: '#152F27' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        CNPJ
                      </label>
                      <input
                        type="text"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold"
                        style={{ borderColor: '#7B9965', color: '#152F27' }}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Setor
                      </label>
                      <input
                        type="text"
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold"
                        style={{ borderColor: '#7B9965', color: '#152F27' }}
                        placeholder="Ex: Tecnologia, Indústria, Serviços..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Número de Funcionários
                      </label>
                      <select
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold"
                        style={{ borderColor: '#7B9965', color: '#152F27' }}
                      >
                        <option value="">Selecione...</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-lg font-bold text-white rounded-xl transition-all hover:scale-105 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alteracoes'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Subscription Section */}
        {usageStats && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-black mb-6" style={{ color: '#152F27' }}>Minha Assinatura</h2>

            {/* Current Plan */}
            <div className="mb-8 p-6 rounded-2xl border-4" style={{
              borderColor: usageStats.plan.code === 'free' ? '#7B9965' :
                           usageStats.plan.code === 'start' ? '#152F27' :
                           usageStats.plan.code === 'grow' ? '#924131' : '#EFD4A8',
              backgroundColor: `${usageStats.plan.code === 'free' ? '#7B9965' :
                               usageStats.plan.code === 'start' ? '#152F27' :
                               usageStats.plan.code === 'grow' ? '#924131' : '#EFD4A8'}10`
            }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-bold text-gray-500 mb-1">PLANO ATUAL</div>
                  <h3 className="text-3xl font-black" style={{ color: '#152F27' }}>{usageStats.plan.name}</h3>
                  <p className="text-xl font-bold text-gray-600 mt-1">
                    R$ {usageStats.plan.price.toFixed(2)}/{usageStats.plan.billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: usageStats.plan.code === 'free' ? '#7B9965' :
                           usageStats.plan.code === 'start' ? '#152F27' :
                           usageStats.plan.code === 'grow' ? '#924131' : '#EFD4A8' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="8" r="7"/>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Diagnoses */}
              <div className="p-6 rounded-xl border-2" style={{ borderColor: '#7B996530', backgroundColor: '#f9fbf7' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold" style={{ color: '#666' }}>DIAGNÓSTICOS</div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                  </svg>
                </div>
                <div className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>
                  {usageStats.usage.diagnoses.current}{usageStats.usage.diagnoses.unlimited ? '' : `/${usageStats.usage.diagnoses.limit}`}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {usageStats.usage.diagnoses.unlimited ? 'Ilimitados' : 'neste período'}
                </div>
              </div>

              {/* Consultation Hours */}
              <div className="p-6 rounded-xl border-2" style={{ borderColor: '#92413130', backgroundColor: '#fef8f7' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold" style={{ color: '#666' }}>CONSULTORIA</div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#924131" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>
                  {usageStats.usage.consultationHours.remaining}h
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  de {usageStats.usage.consultationHours.total}h disponíveis
                </div>
              </div>

              {/* Certificates */}
              <div className="p-6 rounded-xl border-2" style={{ borderColor: '#152F2730', backgroundColor: '#f7f9f8' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold" style={{ color: '#666' }}>CERTIFICADOS</div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#152F27" strokeWidth="2">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                </div>
                <div className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>
                  {usageStats.usage.certificates}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  certificados emitidos
                </div>
              </div>
            </div>

            {/* Available Plans */}
            {usageStats.plan.code !== 'impact' && (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-black" style={{ color: '#152F27' }}>Fazer Upgrade</h3>
                  <p className="text-sm text-gray-600 font-semibold">Escolha um plano superior para desbloquear mais recursos</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {availablePlans
                    .filter(plan => plan.price > usageStats.plan.price)
                    .map((plan) => (
                      <div
                        key={plan.id}
                        className="p-6 rounded-xl border-2 hover:shadow-lg transition-all"
                        style={{ borderColor: '#e0e0e0' }}
                      >
                        <div className="text-center mb-4">
                          <h4 className="text-2xl font-black mb-2" style={{ color: '#152F27' }}>{plan.name}</h4>
                          <div className="text-3xl font-black" style={{ color: '#7B9965' }}>
                            R$ {plan.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 font-semibold">por mês</div>
                        </div>

                        <ul className="space-y-2 mb-6">
                          <li className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {plan.maxDiagnoses === -1 ? 'Diagnósticos ilimitados' : `${plan.maxDiagnoses} diagnósticos/mês`}
                          </li>
                          <li className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {plan.consultationHours}h de consultoria
                          </li>
                          <li className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Certificação inclusa
                          </li>
                        </ul>

                        <button
                          onClick={() => handleUpgradePlan(plan.code)}
                          className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                        >
                          Fazer Upgrade
                        </button>
                      </div>
                    ))}
                </div>
              </>
            )}

            {usageStats.plan.code === 'impact' && (
              <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                <h3 className="text-2xl font-black mb-2" style={{ color: '#152F27' }}>
                  Você está no plano mais alto!
                </h3>
                <p className="text-gray-600 font-semibold">
                  Aproveite todos os recursos premium da plataforma GREENA.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-black mb-6" style={{ color: '#152F27' }}>Seguranca</h3>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <svg className="w-5 h-5" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#666' }}>SENHA</p>
                <p className="text-lg font-black" style={{ color: '#152F27' }}>••••••••</p>
              </div>
            </div>
            <button
              className="px-6 py-2.5 text-sm font-bold border-2 rounded-xl transition-all hover:bg-white"
              style={{ borderColor: '#152F27', color: '#152F27' }}
            >
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
