import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface Plan {
  code: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  color: string;
}

const plans: Plan[] = [
  {
    code: 'basic',
    name: 'Básico',
    price: 99.90,
    period: '/mês',
    features: [
      '5 diagnósticos/mês',
      '2 horas de consultoria',
      'Dashboard avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
      'Certificação inclusa',
      'Até 3 usuários'
    ],
    color: '#152F27'
  },
  {
    code: 'professional',
    name: 'Profissional',
    price: 299.90,
    period: '/mês',
    features: [
      '20 diagnósticos/mês',
      '8 horas de consultoria',
      'Dashboard completo',
      'Relatórios customizados',
      'Suporte dedicado',
      'Certificação premium',
      'Até 10 usuários',
      'Acesso à API'
    ],
    color: '#924131'
  },
  {
    code: 'enterprise',
    name: 'Empresarial',
    price: 999.90,
    period: '/mês',
    features: [
      'Diagnósticos ilimitados',
      '24 horas de consultoria',
      'White label',
      'Relatórios personalizados',
      'Suporte 24/7',
      'Certificação enterprise',
      'Usuários ilimitados',
      'API completa',
      'Gerente dedicado'
    ],
    color: '#152F27'
  }
];

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    plans.find(p => p.code === planParam) || plans[1]
  );
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [billingData, setBillingData] = useState({
    cpfCnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout' + (planParam ? `?plan=${planParam}` : ''));
    }
  }, [user, navigate, planParam]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar assinatura no backend
      await api.post('/subscriptions', { planCode: selectedPlan.code });

      setStep(3);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-14" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-600">Checkout Seguro</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Plano' },
              { num: 2, label: 'Pagamento' },
              { num: 3, label: 'Confirmação' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.num ? 'text-white' : 'text-gray-400 bg-gray-200'
                  }`}
                  style={{ backgroundColor: step >= s.num ? '#7B9965' : undefined }}
                >
                  {step > s.num ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span className={`ml-2 font-semibold ${step >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`w-20 h-1 mx-4 rounded ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {step === 1 && (
          <div>
            <h1 className="text-4xl font-black mb-2 text-center" style={{ color: '#152F27' }}>
              Escolha seu Plano
            </h1>
            <p className="text-gray-600 text-center mb-12">Selecione o plano ideal para sua empresa</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.code}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan?.code === plan.code ? 'shadow-xl' : ''
                  }`}
                  style={{
                    borderColor: selectedPlan?.code === plan.code ? plan.color : '#e0e0e0',
                    backgroundColor: selectedPlan?.code === plan.code ? plan.color + '10' : 'white'
                  }}
                >
                  <h3 className="text-2xl font-black mb-2" style={{ color: plan.color }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-black" style={{ color: plan.color }}>
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-500 mb-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedPlan}
                className="px-12 py-4 rounded-xl font-black text-white text-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Continuar para Pagamento
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedPlan && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-black mb-6" style={{ color: '#152F27' }}>
                Dados de Pagamento
              </h2>

              {/* Card Form */}
              <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#152F27' }}>Cartão de Crédito</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Validade
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                        placeholder="000"
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#152F27' }}>Endereço de Cobrança</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      CPF/CNPJ
                    </label>
                    <input
                      type="text"
                      value={billingData.cpfCnpj}
                      onChange={(e) => setBillingData({ ...billingData, cpfCnpj: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={billingData.address}
                      onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                      placeholder="Rua, número, complemento"
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={billingData.city}
                        onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Estado
                      </label>
                      <input
                        type="text"
                        value={billingData.state}
                        onChange={(e) => setBillingData({ ...billingData, state: e.target.value })}
                        maxLength={2}
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        CEP
                      </label>
                      <input
                        type="text"
                        value={billingData.zipCode}
                        onChange={(e) => setBillingData({ ...billingData, zipCode: e.target.value })}
                        placeholder="00000-000"
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#152F27', color: '#152F27' }}
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-8 py-4 rounded-xl font-black text-white text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    <>Finalizar Assinatura - R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/mês</>
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#152F27' }}>Resumo do Pedido</h3>

                <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: selectedPlan.color + '10' }}>
                  <h4 className="text-lg font-black" style={{ color: selectedPlan.color }}>
                    Plano {selectedPlan.name}
                  </h4>
                  <p className="text-sm text-gray-600">Cobrança mensal</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desconto</span>
                    <span className="font-semibold text-green-600">- R$ 0,00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold" style={{ color: '#152F27' }}>Total mensal</span>
                      <span className="text-2xl font-black" style={{ color: '#152F27' }}>
                        R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Pagamento 100% seguro
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Cancele quando quiser
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && selectedPlan && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-12 rounded-3xl shadow-lg">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#7B996520' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h2 className="text-4xl font-black mb-4" style={{ color: '#152F27' }}>
                Assinatura Confirmada!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Parabéns! Você agora é assinante do plano <strong style={{ color: selectedPlan.color }}>{selectedPlan.name}</strong>
              </p>

              <div className="bg-gray-50 p-6 rounded-xl mb-8 text-left">
                <h3 className="font-bold mb-4" style={{ color: '#152F27' }}>Próximos passos:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#7B9965' }}>1</div>
                    <span>Acesse o Dashboard e comece seu diagnóstico ESG</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#7B9965' }}>2</div>
                    <span>Agende suas horas de consultoria no Perfil</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#7B9965' }}>3</div>
                    <span>Explore os relatórios e insights da plataforma</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  to="/dashboard"
                  className="px-8 py-4 rounded-xl font-black text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  Ir para o Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-8 py-4 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#152F27', color: '#152F27' }}
                >
                  Ver Minha Assinatura
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
