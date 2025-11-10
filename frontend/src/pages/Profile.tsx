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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>Meu Perfil</h1>
              <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>Gerencie suas informações pessoais e da empresa</p>
            </div>
            <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-20" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {!editing ? (
            <>
              {/* View Mode */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold" style={{ color: '#666' }}>NOME COMPLETO</label>
                    <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>{profile?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold" style={{ color: '#666' }}>EMAIL</label>
                    <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>{profile?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold" style={{ color: '#666' }}>EMPRESA</label>
                    <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>{profile?.companyName}</p>
                  </div>
                  {profile?.cnpj && (
                    <div>
                      <label className="text-sm font-bold" style={{ color: '#666' }}>CNPJ</label>
                      <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>{profile.cnpj}</p>
                    </div>
                  )}
                  {profile?.sector && (
                    <div>
                      <label className="text-sm font-bold" style={{ color: '#666' }}>SETOR</label>
                      <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>{profile.sector}</p>
                    </div>
                  )}
                  {profile?.employees && (
                    <div>
                      <label className="text-sm font-bold" style={{ color: '#666' }}>FUNCIONÁRIOS</label>
                      <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>{profile.employees}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-bold" style={{ color: '#666' }}>MEMBRO DESDE</label>
                  <p className="text-xl font-black mt-1" style={{ color: '#152F27' }}>
                    {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setEditing(true)}
                  className="px-8 py-3 text-lg font-black text-white rounded-xl transition-all hover:scale-105 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  Editar Perfil
                </button>
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

                <div className="mt-8 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-lg font-black text-white rounded-xl transition-all hover:scale-105 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile?.name || '',
                        companyName: profile?.companyName || '',
                        cnpj: profile?.cnpj || '',
                        sector: profile?.sector || '',
                        employees: profile?.employees || '',
                      });
                    }}
                    className="px-8 py-3 text-lg font-black rounded-xl border-2 transition-all hover:bg-gray-50"
                    style={{ borderColor: '#152F27', color: '#152F27' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Subscription Section */}
        {usageStats && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-black mb-6" style={{ color: '#152F27' }}>Minha Assinatura</h2>

            {/* Current Plan */}
            <div className="mb-8 p-6 rounded-2xl border-4" style={{
              borderColor: usageStats.plan.code === 'free' ? '#7B9965' :
                           usageStats.plan.code === 'basic' ? '#152F27' :
                           usageStats.plan.code === 'professional' ? '#924131' : '#EFD4A8',
              backgroundColor: `${usageStats.plan.code === 'free' ? '#7B9965' :
                               usageStats.plan.code === 'basic' ? '#152F27' :
                               usageStats.plan.code === 'professional' ? '#924131' : '#EFD4A8'}10`
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
                           usageStats.plan.code === 'basic' ? '#152F27' :
                           usageStats.plan.code === 'professional' ? '#924131' : '#EFD4A8' }}>
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
            {usageStats.plan.code !== 'enterprise' && (
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

            {usageStats.plan.code === 'enterprise' && (
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
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-black mb-6" style={{ color: '#152F27' }}>Segurança</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold" style={{ color: '#666' }}>SENHA</label>
              <p className="text-lg font-semibold mt-1" style={{ color: '#152F27' }}>••••••••</p>
            </div>
            <button
              className="px-6 py-2.5 text-sm font-bold border-2 rounded-lg transition-all hover:bg-gray-50"
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
