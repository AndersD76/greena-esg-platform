import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosisService } from '../services/diagnosis.service';

const FRAMEWORKS = [
  {
    key: 'ESG',
    title: 'ESG',
    subtitle: '215 perguntas',
    description: 'Avaliação Environmental, Social e Governança — o diagnóstico padrão para medir a maturidade ESG da sua organização.',
    icon: '🌍',
    color: '#2E7D4F',
    pillars: ['Ambiental', 'Social', 'Governança'],
    requiresPaid: false,
  },
  {
    key: 'GRI',
    title: 'GRI Standards',
    subtitle: '84 divulgações',
    description: 'Avaliação baseada nos Standards do Global Reporting Initiative — indicadores reconhecidos internacionalmente para relato de sustentabilidade.',
    icon: '📊',
    color: '#5B6ABF',
    pillars: ['Universais', 'Ambiental', 'Social', 'Econômico'],
    requiresPaid: true,
  },
  {
    key: 'ESG_GRI',
    title: 'ESG + GRI',
    subtitle: '~232 perguntas',
    description: 'Avaliação integrada combinando ESG e GRI — perguntas compatíveis são unificadas, com sinalização clara de cada framework.',
    icon: '🔗',
    color: '#D4A017',
    pillars: ['Ambiental', 'Social', 'Governança', 'Universais', 'Econômico'],
    requiresPaid: true,
  },
];

interface FrameworkSelectorProps {
  isFreePlan: boolean;
}

export default function FrameworkSelector({ isFreePlan }: FrameworkSelectorProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (framework: string) => {
    setLoading(framework);
    setError(null);

    try {
      const diagnosis = await diagnosisService.create(framework);

      if (diagnosis.type === 'demo') {
        navigate(`/diagnosis/${diagnosis.id}/simplified-questionnaire`);
      } else {
        navigate(`/diagnosis/${diagnosis.id}/questionnaire`);
      }
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.code === 'GRI_REQUIRES_PAID_PLAN') {
        setError('O framework GRI está disponível apenas para planos pagos.');
      } else if (data?.code === 'DIAGNOSIS_LIMIT_REACHED') {
        setError(data.error);
      } else {
        setError('Erro ao criar diagnóstico. Tente novamente.');
      }
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#F8FAF7' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#152F27' }}>
            Escolha o Framework de Avaliação
          </h1>
          <p className="text-lg" style={{ color: '#4A5C52' }}>
            Selecione o tipo de diagnóstico que melhor atende às necessidades da sua organização.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FRAMEWORKS.map((fw) => {
            const disabled = fw.requiresPaid && isFreePlan;
            const isLoading = loading === fw.key;

            return (
              <div
                key={fw.key}
                className={`relative rounded-2xl border-2 p-6 transition-all ${
                  disabled
                    ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                    : 'cursor-pointer hover:shadow-lg bg-white'
                }`}
                style={disabled ? {} : { borderColor: fw.color + '40' }}
                onClick={() => !disabled && !loading && handleSelect(fw.key)}
              >
                {fw.requiresPaid && (
                  <span
                    className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: fw.color }}
                  >
                    Plano Pago
                  </span>
                )}

                <div className="text-4xl mb-4">{fw.icon}</div>

                <h2 className="text-xl font-bold mb-1" style={{ color: '#152F27' }}>
                  {fw.title}
                </h2>
                <p className="text-sm font-medium mb-3" style={{ color: fw.color }}>
                  {fw.subtitle}
                </p>
                <p className="text-sm mb-4" style={{ color: '#4A5C52' }}>
                  {fw.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {fw.pillars.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: fw.color + '15', color: fw.color }}
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <button
                  disabled={disabled || !!loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: disabled ? '#9CA3AF' : fw.color }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Criando...
                    </span>
                  ) : disabled ? (
                    'Fazer Upgrade'
                  ) : (
                    'Iniciar Diagnóstico'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
