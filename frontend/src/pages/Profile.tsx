import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  companyName: string;
  cnpj?: string;
  city?: string;
  foundingYear?: number;
  responsiblePerson?: string;
  responsibleContact?: string;
  companySize?: string;
  sector?: string;
  employeesRange?: string;
  slug?: string;
  isPublicProfile?: boolean;
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
    city: '',
    foundingYear: '' as string | number,
    responsiblePerson: '',
    responsibleContact: '',
    companySize: '',
    sector: '',
    employeesRange: '',
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
        city: response.data.city || '',
        foundingYear: response.data.foundingYear || '',
        responsiblePerson: response.data.responsiblePerson || '',
        responsibleContact: response.data.responsibleContact || '',
        companySize: response.data.companySize || '',
        sector: response.data.sector || '',
        employeesRange: response.data.employeesRange || '',
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
      const payload = {
        ...formData,
        foundingYear: formData.foundingYear ? Number(formData.foundingYear) : undefined,
      };
      await api.put('/auth/profile', payload);
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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-1">Meu Perfil</h1>
          <p className="text-sm text-gray-500">Gerencie suas informações pessoais e da empresa</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-brand-900">
              {profile?.name ? getInitials(profile.name) : 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-brand-900">{profile?.name}</h2>
              <p className="text-sm text-brand-700">{profile?.companyName}</p>
              <p className="text-xs text-gray-400 mt-1">{profile?.email}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
            >
              {editing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-base font-bold text-brand-900 mb-5">Informações da Empresa</h3>

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Empresa</p>
                <p className="text-sm font-bold text-brand-900">{profile?.companyName || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">CNPJ</p>
                <p className="text-sm font-bold text-brand-900">{profile?.cnpj || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Cidade/UF</p>
                <p className="text-sm font-bold text-brand-900">{profile?.city || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Ano de Fundação</p>
                <p className="text-sm font-bold text-brand-900">{profile?.foundingYear || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Pessoa Responsável</p>
                <p className="text-sm font-bold text-brand-900">{profile?.responsiblePerson || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Contato do Responsável</p>
                <p className="text-sm font-bold text-brand-900">{profile?.responsibleContact || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Porte da Empresa</p>
                <p className="text-sm font-bold text-brand-900">{profile?.companySize || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Segmento de Atuação</p>
                <p className="text-sm font-bold text-brand-900">{profile?.sector || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Número de Colaboradores</p>
                <p className="text-sm font-bold text-brand-900">{profile?.employeesRange || '-'}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Membro desde</p>
                <p className="text-sm font-bold text-brand-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Cidade/UF *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                    placeholder="Ex: Passo Fundo/RS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Ano de Fundação *
                  </label>
                  <input
                    type="number"
                    value={formData.foundingYear}
                    onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                    placeholder="Ex: 2020"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Pessoa Responsável (nome + cargo) *
                  </label>
                  <input
                    type="text"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                    placeholder="Ex: João Silva - Diretor de Sustentabilidade"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Contato do Responsável *
                  </label>
                  <input
                    type="text"
                    value={formData.responsibleContact}
                    onChange={(e) => setFormData({ ...formData, responsibleContact: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                    placeholder="Ex: (54) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Porte da Empresa *
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                  >
                    <option value="">Selecione...</option>
                    <option value="MEI">MEI</option>
                    <option value="ME">ME - Microempresa</option>
                    <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                    <option value="Médio">Médio Porte</option>
                    <option value="Grande">Grande Porte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Segmento de Atuação *
                  </label>
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
                    placeholder="Ex: Tecnologia, Indústria, Serviços..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    Número de Colaboradores *
                  </label>
                  <select
                    value={formData.employeesRange}
                    onChange={(e) => setFormData({ ...formData, employeesRange: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-brand-900 focus:outline-none focus:border-brand-700 transition-colors"
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

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Public Profile Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h3 className="text-base font-bold text-brand-900 mb-2">Perfil Público ESG</h3>
          <p className="text-sm text-gray-500 mb-4">
            Ative o perfil público para compartilhar seu selo ESG com clientes, parceiros e investidores.
          </p>
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div>
              <p className="text-sm font-bold text-brand-900">Perfil Público</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile?.isPublicProfile
                  ? <span>Acessível em: <a href={`/empresa/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">{window.location.origin}/empresa/{profile.slug}</a></span>
                  : 'Desativado — sua empresa não aparece publicamente'}
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await api.put('/auth/profile', { isPublicProfile: !profile?.isPublicProfile });
                  await loadProfile();
                } catch (err: any) {
                  alert(err?.response?.data?.error || 'Erro ao atualizar perfil público');
                }
              }}
              className={`relative w-12 h-6 rounded-full transition-all ${profile?.isPublicProfile ? 'bg-brand-900' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow ${profile?.isPublicProfile ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          {profile?.isPublicProfile && profile?.slug && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/empresa/${profile.slug}`); alert('Link copiado!'); }}
                className="px-4 py-2 text-xs font-semibold text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50"
              >
                Copiar Link
              </button>
              <a href={`/empresa/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-900 rounded-full hover:opacity-90">
                Ver Página Pública
              </a>
            </div>
          )}
        </div>

        {/* Subscription Section */}
        {usageStats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h3 className="text-base font-bold text-brand-900 mb-5">Minha Assinatura</h3>

            {/* Current Plan */}
            <div className="mb-6 p-5 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Plano Atual</p>
                  <h4 className="text-xl font-bold text-brand-900">{usageStats.plan.name}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    R$ {Number(usageStats.plan.price || 0).toFixed(2)}/{usageStats.plan.billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-900">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Diagnósticos</p>
                <p className="text-3xl font-bold text-brand-900">
                  {usageStats.usage.diagnoses.current}{usageStats.usage.diagnoses.unlimited ? '' : `/${usageStats.usage.diagnoses.limit}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {usageStats.usage.diagnoses.unlimited ? 'Ilimitados' : 'neste período'}
                </p>
              </div>

              <div className="p-5 rounded-xl" style={{ backgroundColor: '#fdf5f3' }}>
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Consultoria</p>
                <p className="text-3xl font-bold text-brand-900">
                  {usageStats.usage.consultationHours.remaining}h
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  de {usageStats.usage.consultationHours.total}h disponíveis
                </p>
              </div>

              <div className="p-5 rounded-xl" style={{ backgroundColor: '#f5ffeb' }}>
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Certificados</p>
                <p className="text-3xl font-bold text-brand-900">
                  {usageStats.usage.certificates}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  certificados emitidos
                </p>
              </div>
            </div>

            {/* Available Plans */}
            {usageStats.plan.code !== 'impact' && (
              <>
                <div className="mb-4">
                  <h4 className="text-base font-bold text-brand-900">Fazer Upgrade</h4>
                  <p className="text-xs text-gray-400">Escolha um plano superior para desbloquear mais recursos</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {availablePlans
                    .filter(plan => Number(plan.price || 0) > Number(usageStats.plan.price || 0))
                    .map((plan) => (
                      <div
                        key={plan.id}
                        className="p-5 rounded-xl border border-gray-200 hover:border-brand-700/30 transition-all"
                      >
                        <div className="text-center mb-4">
                          <h5 className="text-lg font-bold text-brand-900 mb-1">{plan.name}</h5>
                          <p className="text-2xl font-bold text-brand-700">
                            R$ {Number(plan.price || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">por mês</p>
                        </div>

                        <ul className="space-y-2 mb-5">
                          <li className="text-xs text-gray-500 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {plan.maxDiagnoses === -1 ? 'Diagnósticos ilimitados' : `${plan.maxDiagnoses} diagnósticos/mês`}
                          </li>
                          <li className="text-xs text-gray-500 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {plan.consultationHours}h de consultoria
                          </li>
                          <li className="text-xs text-gray-500 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Certificação inclusa
                          </li>
                        </ul>

                        <button
                          onClick={() => handleUpgradePlan(plan.code)}
                          className="w-full py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
                        >
                          Fazer Upgrade
                        </button>
                      </div>
                    ))}
                </div>
              </>
            )}

            {usageStats.plan.code === 'impact' && (
              <div className="text-center p-6 rounded-xl bg-brand-300">
                <h4 className="text-lg font-bold text-brand-900 mb-1">
                  Você está no plano mais alto!
                </h4>
                <p className="text-sm text-gray-500">
                  Aproveite todos os recursos premium da plataforma engreena.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-base font-bold text-brand-900 mb-5">Segurança</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-300">
                <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Senha</p>
                <p className="text-sm font-bold text-brand-900">••••••••</p>
              </div>
            </div>
            <button className="px-4 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-white">
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
