import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosisService } from '../services/diagnosis.service';

const FRAMEWORKS = [
  {
    key: 'ESG',
    title: 'ESG',
    subtitle: '215 perguntas',
    description: 'Avaliação Environmental, Social e Governança — o diagnóstico padrão para medir a maturidade ESG da sua organização.',
    accent: '#7B9965',
    pillars: [
      { name: 'Ambiental', color: '#7B9965' },
      { name: 'Social', color: '#924131' },
      { name: 'Governança', color: '#b8963a' },
    ],
    requiresPaid: false,
  },
  {
    key: 'GRI',
    title: 'GRI Standards',
    subtitle: '84 divulgações',
    description: 'Avaliação baseada nos Standards do Global Reporting Initiative — indicadores reconhecidos internacionalmente para relato de sustentabilidade.',
    accent: '#5B6ABF',
    pillars: [
      { name: 'Universais', color: '#5B6ABF' },
      { name: 'Ambiental', color: '#2E7D4F' },
      { name: 'Social', color: '#C0392B' },
      { name: 'Econômico', color: '#D4A017' },
    ],
    requiresPaid: true,
  },
  {
    key: 'ESG_GRI',
    title: 'ESG + GRI',
    subtitle: '~232 perguntas',
    description: 'Avaliação integrada combinando ESG e GRI — perguntas compatíveis são unificadas, com sinalização clara de cada framework.',
    accent: '#D4A017',
    pillars: [
      { name: 'Ambiental', color: '#7B9965' },
      { name: 'Social', color: '#924131' },
      { name: 'Governança', color: '#b8963a' },
      { name: 'Universais', color: '#5B6ABF' },
      { name: 'Econômico', color: '#D4A017' },
    ],
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-900">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-white">Novo Diagnóstico</h1>
          <p className="text-sm text-white/50 mt-1">Escolha o framework de avaliação para sua organização</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FRAMEWORKS.map((fw) => {
            const disabled = fw.requiresPaid && isFreePlan;
            const isLoading = loading === fw.key;

            return (
              <div
                key={fw.key}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden transition-all ${
                  disabled ? 'opacity-50' : 'hover:shadow-md hover:border-gray-200 cursor-pointer'
                }`}
                onClick={() => !disabled && !loading && handleSelect(fw.key)}
              >
                <div className="h-1.5" style={{ backgroundColor: fw.accent }} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-brand-900">{fw.title}</h2>
                    {fw.requiresPaid && isFreePlan && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                        Plano Pago
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mb-3" style={{ color: fw.accent }}>{fw.subtitle}</p>
                  <p className="text-sm text-gray-500 flex-1">{fw.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
                    {fw.pillars.map((p) => (
                      <span
                        key={p.name}
                        className="flex items-center gap-1.5 text-xs text-gray-600 px-2 py-1 rounded-full bg-gray-50"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                    ))}
                  </div>

                  <button
                    disabled={disabled || !!loading}
                    className={`w-full py-2.5 text-sm font-semibold rounded-full transition-all disabled:opacity-50 ${
                      disabled
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-brand-900 text-white hover:bg-brand-900/90'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Criando...
                      </span>
                    ) : disabled ? (
                      'Fazer Upgrade'
                    ) : (
                      'Iniciar Diagnóstico'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
