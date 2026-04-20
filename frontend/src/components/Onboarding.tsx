import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const SECTORS = [
  'Agronegócio', 'Alimentação e Bebidas', 'Comércio', 'Construção Civil',
  'Educação', 'Energia', 'Indústria', 'Logística e Transporte',
  'Mineração', 'Saúde', 'Serviços', 'Tecnologia', 'Têxtil', 'Turismo', 'Outro'
];

const COMPANY_SIZES = [
  'Microempresa', 'Pequena I', 'Pequena II', 'Pequena III', 'Média', 'Grande I', 'Grande II'
];

const EMPLOYEES_RANGES = ['1-9', '10-49', '50-99', '100-499', '500+'];

const ESG_PAIN_POINTS = [
  'Não sei por onde começar em ESG',
  'Preciso de certificação ESG',
  'Quero reduzir impacto ambiental',
  'Melhorar práticas sociais',
  'Adequar governança corporativa',
  'Atender exigências de investidores',
  'Compliance e regulamentação',
  'Relatórios de sustentabilidade',
  'Outro'
];

interface Props {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: Props) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: user?.companyName || '',
    cnpj: user?.cnpj || '',
    city: user?.city || '',
    foundingYear: user?.foundingYear?.toString() || '',
    responsiblePerson: user?.responsiblePerson || user?.name || '',
    responsibleContact: user?.responsibleContact || '',
    companySize: user?.companySize || '',
    sector: user?.sector || '',
    employeesRange: user?.employeesRange || '',
    esgPainPoint: user?.esgPainPoint || '',
  });

  const steps = [
    { title: 'Dados da Empresa', subtitle: 'Informações básicas sobre sua organização' },
    { title: 'Perfil e Porte', subtitle: 'Setor de atuação e tamanho da empresa' },
    { title: 'Objetivo ESG', subtitle: 'Sua principal motivação com ESG' },
  ];

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canAdvance = () => {
    if (step === 0) return form.companyName.trim() && form.city.trim();
    if (step === 1) return form.sector && form.companySize && form.employeesRange;
    if (step === 2) return form.esgPainPoint;
    return true;
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        await updateUser({
          companyName: form.companyName,
          cnpj: form.cnpj || undefined,
          city: form.city,
          foundingYear: form.foundingYear ? parseInt(form.foundingYear) : undefined,
          responsiblePerson: form.responsiblePerson || undefined,
          responsibleContact: form.responsibleContact || undefined,
          companySize: form.companySize,
          sector: form.sector,
          employeesRange: form.employeesRange,
          esgPainPoint: form.esgPainPoint,
        } as any);
        onComplete();
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B9965]/40 focus:border-[#7B9965] transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(21,47,39,0.85)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e2f7d0' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#152F27" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#152F27' }}>
                Bem-vindo, {user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-sm text-gray-500">Complete seu perfil para começar</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-[#7B9965]' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#152F27' }}>{steps[step].title}</p>
              <p className="text-xs text-gray-400">{steps[step].subtitle}</p>
            </div>
            <span className="text-xs font-medium text-gray-400">{step + 1} de {steps.length}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-4 space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className={labelClass}>Nome da Empresa *</label>
                <input type="text" className={inputClass} placeholder="Ex: Greena Soluções"
                  value={form.companyName} onChange={e => handleChange('companyName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CNPJ</label>
                  <input type="text" className={inputClass} placeholder="00.000.000/0000-00"
                    value={form.cnpj} onChange={e => handleChange('cnpj', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input type="text" className={inputClass} placeholder="Ex: Passo Fundo/RS"
                    value={form.city} onChange={e => handleChange('city', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ano de Fundação</label>
                  <input type="number" className={inputClass} placeholder="Ex: 2015"
                    value={form.foundingYear} onChange={e => handleChange('foundingYear', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Responsável</label>
                  <input type="text" className={inputClass} placeholder="Nome do responsável"
                    value={form.responsiblePerson} onChange={e => handleChange('responsiblePerson', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contato do Responsável</label>
                <input type="text" className={inputClass} placeholder="Telefone ou e-mail"
                  value={form.responsibleContact} onChange={e => handleChange('responsibleContact', e.target.value)} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className={labelClass}>Setor de Atuação *</label>
                <div className="grid grid-cols-3 gap-2">
                  {SECTORS.map(s => (
                    <button key={s} onClick={() => handleChange('sector', s)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        form.sector === s
                          ? 'bg-[#152F27] text-white border-[#152F27]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B9965]'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Porte da Empresa *</label>
                <div className="grid grid-cols-4 gap-2">
                  {COMPANY_SIZES.map(s => (
                    <button key={s} onClick={() => handleChange('companySize', s)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        form.companySize === s
                          ? 'bg-[#152F27] text-white border-[#152F27]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B9965]'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Faixa de Funcionários *</label>
                <div className="flex gap-2">
                  {EMPLOYEES_RANGES.map(r => (
                    <button key={r} onClick={() => handleChange('employeesRange', r)}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                        form.employeesRange === r
                          ? 'bg-[#152F27] text-white border-[#152F27]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B9965]'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <label className={labelClass}>Qual sua principal motivação com ESG? *</label>
              <div className="space-y-2">
                {ESG_PAIN_POINTS.map(p => (
                  <button key={p} onClick={() => handleChange('esgPainPoint', p)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left border transition-all ${
                      form.esgPainPoint === p
                        ? 'bg-[#f5ffeb] border-[#7B9965] text-[#152F27]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B9965]'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        form.esgPainPoint === p ? 'border-[#7B9965] bg-[#7B9965]' : 'border-gray-300'
                      }`}>
                        {form.esgPainPoint === p && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {p}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Voltar
            </button>
          ) : (
            <button onClick={onComplete}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Pular
            </button>
          )}
          <button onClick={handleNext} disabled={!canAdvance() || saving}
            className="px-8 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#152F27' }}>
            {saving ? 'Salvando...' : step < steps.length - 1 ? 'Continuar' : 'Começar a usar'}
          </button>
        </div>
      </div>
    </div>
  );
}
