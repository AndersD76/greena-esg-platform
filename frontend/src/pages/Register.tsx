import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const COMPANY_SIZES = [
  { value: 'micro', label: 'Microempresa (faturamento até R$ 360.000,00)' },
  { value: 'pequena-i', label: 'Pequena empresa I (faturamento até R$ 3.600.000,00)' },
  { value: 'pequena-ii', label: 'Pequena empresa II (faturamento até R$ 4.800.000,00)' },
  { value: 'pequena-iii', label: 'Pequena empresa III (faturamento até R$ 16.000.000,00)' },
  { value: 'media', label: 'Média empresa (faturamento até R$ 90.000.000,00)' },
  { value: 'grande-i', label: 'Grande empresa I (faturamento até R$ 300.000.000,00)' },
  { value: 'grande-ii', label: 'Grande empresa II (faturamento acima R$ 300.000.000,00)' },
];

const SECTORS = [
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'industria', label: 'Indústria' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'tecnologia', label: 'Tecnologia da Informação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'logistica', label: 'Logística/Transporte' },
  { value: 'energia', label: 'Energia' },
  { value: 'outros', label: 'Outros' },
];

const EMPLOYEES_RANGES = [
  { value: '1-9', label: '1 a 9 colaboradores' },
  { value: '10-49', label: '10 a 49 colaboradores' },
  { value: '50-99', label: '50 a 99 colaboradores' },
  { value: '100-499', label: '100 a 499 colaboradores' },
  { value: '500+', label: '500 ou mais colaboradores' },
];

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Etapa 1: Dados de acesso
    name: '',
    email: '',
    password: '',

    // Etapa 2: Dados da empresa
    companyName: '',
    cnpj: '',
    city: '',
    foundingYear: '',

    // Etapa 3: Informações adicionais
    responsiblePerson: '',
    responsibleContact: '',
    companySize: '',
    sector: '',
    employeesRange: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        foundingYear: formData.foundingYear ? parseInt(formData.foundingYear) : undefined,
      };
      await signUp(submitData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #152F27 0%, #2d5a45 50%, #7B9965 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-14" />
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold transition-colors"
              style={{ color: '#152F27' }}
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-3">Crie sua conta</h2>
            <p className="text-xl text-white opacity-90">Comece a avaliar suas práticas ESG gratuitamente</p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
                      step >= s ? 'bg-white text-green-800' : 'bg-white bg-opacity-30 text-white'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 transition-all ${
                        step > s ? 'bg-white' : 'bg-white bg-opacity-30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-white text-sm font-bold mt-2">
              {step === 1 && 'Dados de Acesso'}
              {step === 2 && 'Dados da Empresa'}
              {step === 3 && 'Informações Adicionais'}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#fee', border: '2px solid #fcc' }}>
                <p className="text-sm font-semibold" style={{ color: '#c33' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Etapa 1: Dados de Acesso */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Senha *
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>
                </>
              )}

              {/* Etapa 2: Dados da Empresa */}
              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      placeholder="Sua Empresa LTDA"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      CNPJ <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Cidade/UF <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="São Paulo/SP"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Ano de Fundação <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.foundingYear}
                      onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>
                </>
              )}

              {/* Etapa 3: Informações Adicionais */}
              {step === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Pessoa Responsável <span className="font-normal text-gray-500">(nome + cargo, opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="João Silva - Gerente de Sustentabilidade"
                      value={formData.responsiblePerson}
                      onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Contato do Responsável <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={formData.responsibleContact}
                      onChange={(e) => setFormData({ ...formData, responsibleContact: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Porte da Empresa <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    >
                      <option value="">Selecione...</option>
                      {COMPANY_SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Segmento de Atuação <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    >
                      <option value="">Selecione...</option>
                      {SECTORS.map((sector) => (
                        <option key={sector.value} value={sector.value}>
                          {sector.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Número de Colaboradores <span className="font-normal text-gray-500">(opcional)</span>
                    </label>
                    <select
                      value={formData.employeesRange}
                      onChange={(e) => setFormData({ ...formData, employeesRange: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    >
                      <option value="">Selecione...</option>
                      {EMPLOYEES_RANGES.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 w-4 h-4 rounded"
                      style={{ accentColor: '#7B9965' }}
                    />
                    <label className="ml-2 text-sm font-semibold" style={{ color: '#152F27' }}>
                      Concordo com os{' '}
                      <a href="#" className="font-black hover:underline" style={{ color: '#7B9965' }}>
                        termos de uso
                      </a>{' '}
                      e{' '}
                      <a href="#" className="font-black hover:underline" style={{ color: '#7B9965' }}>
                        política de privacidade
                      </a>
                    </label>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 py-4 rounded-xl font-black text-lg transition-all hover:opacity-80 border-2"
                    style={{ color: '#152F27', borderColor: '#152F27' }}
                  >
                    Voltar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl text-white font-black text-lg transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  {loading ? 'Criando conta...' : step < 3 ? 'Próximo' : 'Criar Conta Grátis'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-semibold" style={{ color: '#666' }}>
                Já tem uma conta?{' '}
                <Link to="/login" className="font-black hover:underline" style={{ color: '#7B9965' }}>
                  Fazer login
                </Link>
              </p>
            </div>
          </div>

          {/* Voltar para home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-bold text-white hover:underline flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
