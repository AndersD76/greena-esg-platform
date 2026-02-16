import { useState, useEffect, useRef } from 'react';
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
    code: 'start',
    name: 'Start',
    price: 49.00,
    period: '/mês',
    features: [
      'Diagnóstico Maturidade ESG',
      'Acesso ao dashboard'
    ],
    color: '#152F27'
  },
  {
    code: 'grow',
    name: 'Grow',
    price: 99.00,
    period: '/mês',
    features: [
      'Diagnóstico Maturidade ESG',
      'Acesso ao dashboard',
      '2h mensais de consultoria',
      'Certificação'
    ],
    color: '#924131'
  },
  {
    code: 'impact',
    name: 'Impact',
    price: 159.00,
    period: '/mês',
    features: [
      'Diagnóstico Maturidade ESG',
      'Acesso ao dashboard',
      '4h mensais de consultoria',
      'Certificação',
      'Planos de Ação'
    ],
    color: '#152F27'
  }
];

type PaymentMethod = 'CREDIT_CARD' | 'PIX';

interface PixData {
  paymentId: string;
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

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
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [billingData, setBillingData] = useState({
    cpfCnpj: '',
    address: '',
    addressNumber: '',
    city: '',
    state: '',
    zipCode: '',
    mobilePhone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout' + (planParam ? `?plan=${planParam}` : ''));
    }
  }, [user, navigate, planParam]);

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

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

  const formatCpfCnpj = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatZipCode = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const startPixPolling = (paymentId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/subscriptions/payment-status/${paymentId}`);
        if (response.data.status === 'RECEIVED' || response.data.status === 'CONFIRMED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStep(4); // Sucesso
        }
      } catch {
        // Ignora erros de polling silenciosamente
      }
    }, 5000); // A cada 5 segundos
  };

  const copyPixCode = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    setError('');
    setLoading(true);

    try {
      // Montar payload para o backend
      const payload: any = {
        planCode: selectedPlan.code,
        paymentMethod,
        billingData: {
          cpfCnpj: billingData.cpfCnpj,
          address: billingData.address,
          addressNumber: billingData.addressNumber,
          city: billingData.city,
          state: billingData.state,
          zipCode: billingData.zipCode,
          mobilePhone: billingData.mobilePhone,
        },
      };

      if (paymentMethod === 'CREDIT_CARD') {
        const [expiryMonth, expiryYear] = cardData.expiry.split('/');
        payload.creditCard = {
          holderName: cardData.name,
          number: cardData.number,
          expiryMonth,
          expiryYear: '20' + expiryYear,
          ccv: cardData.cvv,
        };
        payload.creditCardHolderInfo = {
          name: cardData.name,
          email: user?.email || '',
          cpfCnpj: billingData.cpfCnpj,
          postalCode: billingData.zipCode,
          addressNumber: billingData.addressNumber || '0',
          mobilePhone: billingData.mobilePhone,
        };
      }

      const response = await api.post('/subscriptions', payload);

      if (paymentMethod === 'PIX' && response.data.pixData) {
        setPixData(response.data.pixData);
        setStep(3); // Mostra QR Code PIX
        startPixPolling(response.data.pixData.paymentId);
      } else {
        setStep(4); // Sucesso direto (cartão)
      }
    } catch (err: any) {
      console.error('Erro ao processar pagamento:', err);
      const errorMsg = err.response?.data?.error || 'Erro ao processar pagamento. Tente novamente.';
      setError(errorMsg);
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
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-14" />
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
              { num: 3, label: paymentMethod === 'PIX' ? 'PIX' : 'Processando' },
              { num: 4, label: 'Confirmação' }
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
                {i < 3 && (
                  <div className={`w-16 h-1 mx-3 rounded ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Step 1 - Escolha do plano */}
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

        {/* Step 2 - Dados de pagamento */}
        {step === 2 && selectedPlan && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-black mb-6" style={{ color: '#152F27' }}>
                Dados de Pagamento
              </h2>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'CREDIT_CARD' ? 'shadow-md' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      borderColor: paymentMethod === 'CREDIT_CARD' ? '#7B9965' : '#e0e0e0',
                      backgroundColor: paymentMethod === 'CREDIT_CARD' ? '#7B996510' : undefined
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'CREDIT_CARD' ? '#7B9965' : '#666'} strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <div className="text-left">
                      <span className="font-bold block" style={{ color: paymentMethod === 'CREDIT_CARD' ? '#152F27' : '#666' }}>
                        Cartão de Crédito
                      </span>
                      <span className="text-xs text-gray-500">Ativação imediata</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'PIX' ? 'shadow-md' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      borderColor: paymentMethod === 'PIX' ? '#7B9965' : '#e0e0e0',
                      backgroundColor: paymentMethod === 'PIX' ? '#7B996510' : undefined
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'PIX' ? '#7B9965' : '#666'} strokeWidth="2">
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                      <path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <div className="text-left">
                      <span className="font-bold block" style={{ color: paymentMethod === 'PIX' ? '#152F27' : '#666' }}>
                        PIX
                      </span>
                      <span className="text-xs text-gray-500">Pagamento instantâneo</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Card Form - only for CREDIT_CARD */}
              {paymentMethod === 'CREDIT_CARD' && (
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
              )}

              {/* Billing Data */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#152F27' }}>Dados de Cobrança</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        CPF/CNPJ *
                      </label>
                      <input
                        type="text"
                        value={billingData.cpfCnpj}
                        onChange={(e) => setBillingData({ ...billingData, cpfCnpj: formatCpfCnpj(e.target.value) })}
                        maxLength={18}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Celular
                      </label>
                      <input
                        type="text"
                        value={billingData.mobilePhone}
                        onChange={(e) => setBillingData({ ...billingData, mobilePhone: formatPhone(e.target.value) })}
                        maxLength={15}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={billingData.address}
                        onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                        placeholder="Rua, Avenida..."
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                        Número
                      </label>
                      <input
                        type="text"
                        value={billingData.addressNumber}
                        onChange={(e) => setBillingData({ ...billingData, addressNumber: e.target.value })}
                        placeholder="Nº"
                        className="w-full px-4 py-3 rounded-xl border-2 font-semibold focus:outline-none focus:border-green-600"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </div>
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
                        placeholder="SC"
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
                        onChange={(e) => setBillingData({ ...billingData, zipCode: formatZipCode(e.target.value) })}
                        maxLength={9}
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
                  onClick={() => { setStep(1); setError(''); }}
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
                  ) : paymentMethod === 'PIX' ? (
                    <>Gerar QR Code PIX - R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/mês</>
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
                    <span className="text-gray-600">Forma de pagamento</span>
                    <span className="font-semibold">{paymentMethod === 'CREDIT_CARD' ? 'Cartão' : 'PIX'}</span>
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
                    Pagamento 100% seguro via Asaas
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

        {/* Step 3 - PIX QR Code */}
        {step === 3 && selectedPlan && pixData && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-12 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black mb-2" style={{ color: '#152F27' }}>
                Pague com PIX
              </h2>
              <p className="text-gray-600 mb-8">
                Escaneie o QR Code ou copie o código para pagar
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white border-2 rounded-2xl" style={{ borderColor: '#7B9965' }}>
                  <img
                    src={`data:image/png;base64,${pixData.encodedImage}`}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Valor */}
              <div className="mb-6">
                <span className="text-gray-600">Valor:</span>
                <span className="text-3xl font-black ml-2" style={{ color: '#152F27' }}>
                  R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Código copia e cola */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <p className="text-sm font-bold mb-2" style={{ color: '#152F27' }}>Código PIX (copia e cola):</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixData.payload}
                    className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono bg-white truncate"
                  />
                  <button
                    onClick={copyPixCode}
                    className="px-4 py-2 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: pixCopied ? '#22c55e' : '#7B9965' }}
                  >
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Status de aguardando */}
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
                <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-yellow-700">Aguardando pagamento...</span>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                O pagamento será confirmado automaticamente. Esta página atualizará sozinha.
              </p>

              <button
                onClick={() => { setStep(2); if (pollingRef.current) clearInterval(pollingRef.current); }}
                className="mt-6 px-6 py-3 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: '#152F27', color: '#152F27' }}
              >
                Voltar e alterar forma de pagamento
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Confirmação */}
        {step === 4 && selectedPlan && (
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
