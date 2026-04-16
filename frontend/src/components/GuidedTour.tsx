import { useState, useEffect, useCallback, useRef } from 'react';

interface TourStep {
  title: string;
  description: string;
  narration: string;
  icon: string;
  color: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Bem-vinda à engreena!',
    description: 'A plataforma completa de diagnóstico ESG para empresas que desejam liderar a sustentabilidade.',
    narration: 'Bem-vinda à engreena! A plataforma completa de diagnóstico ESG para empresas. Vamos conhecer todas as funcionalidades juntos neste tour guiado.',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#7B9965'
  },
  {
    title: '1. Cadastro Rápido',
    description: 'Crie sua conta em segundos. Informe nome, e-mail, senha e dados da empresa. Você começa no plano Demo gratuito com acesso a 6 perguntas do diagnóstico.',
    narration: 'O primeiro passo é criar sua conta. Informe seus dados e os dados da empresa. Você já começa no plano gratuito com acesso imediato ao diagnóstico simplificado.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    color: '#7B9965'
  },
  {
    title: '2. Escolha seu Plano',
    description: 'Temos 4 planos: Demo (grátis), Start (R$49/mês), Grow (R$99/mês, recomendado) e Impact (R$159/mês). Cada plano libera mais funcionalidades como consultoria e certificação.',
    narration: 'Escolha o plano ideal para sua empresa. O plano Grow é o mais popular, pois inclui certificação ESG e duas horas mensais de consultoria com especialistas.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    color: '#152F27'
  },
  {
    title: '3. Diagnóstico ESG',
    description: 'Responda 215 perguntas divididas em 3 pilares: Ambiental (75 perguntas), Social (75 perguntas) e Governança (65 perguntas). Use a escala de maturidade de 6 níveis para cada resposta.',
    narration: 'O diagnóstico ESG possui duzentas e quinze perguntas divididas em três pilares. Cada pergunta usa uma escala de maturidade de seis níveis. Você pode salvar o progresso e continuar depois.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: '#7B9965'
  },
  {
    title: '4. Dashboard Inteligente',
    description: 'Visualize seu score ESG geral e por pilar em gráficos interativos. Acompanhe a evolução ao longo do tempo e compare com a média do setor no benchmarking.',
    narration: 'O dashboard mostra seu score ESG em gráficos interativos. Você pode ver a performance por pilar, acompanhar a evolução histórica e comparar com empresas do mesmo setor.',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    color: '#152F27'
  },
  {
    title: '5. Relatórios e Insights',
    description: 'Acesse relatórios detalhados com gráficos de barras, radar e comparativos. Gere relatórios para stakeholders e exporte em PDF para apresentações.',
    narration: 'Os relatórios mostram análises detalhadas da sua performance ESG. Você pode gerar relatórios especiais para stakeholders e exportar tudo em PDF.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: '#924131'
  },
  {
    title: '6. Planos de Ação',
    description: 'O sistema gera automaticamente planos de ação priorizados. Filtre por pilar e prioridade, simule o impacto no score e acompanhe o status de implementação.',
    narration: 'Após o diagnóstico, você recebe planos de ação automáticos e priorizados. Pode filtrar por pilar, simular o impacto de cada ação no score e acompanhar a implementação.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: '#b8963a'
  },
  {
    title: '7. Certificação ESG',
    description: 'Receba sua certificação: Bronze (0-39 pontos), Prata (40-69 pontos) ou Ouro (70-100 pontos). Baixe o certificado digital e compartilhe com o mercado.',
    narration: 'Ao concluir o diagnóstico, você recebe uma certificação ESG. Pode ser Bronze, Prata ou Ouro, dependendo da sua pontuação. O certificado digital pode ser baixado e compartilhado.',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    color: '#FFD700'
  },
  {
    title: '8. Consultoria Especializada',
    description: 'Agende sessões de consultoria com especialistas ESG (disponível nos planos Grow e Impact). Receba orientação personalizada para acelerar sua jornada ESG.',
    narration: 'Nos planos Grow e Impact, você tem acesso à consultoria com especialistas ESG. Agende sessões por vídeo e receba orientação personalizada para sua empresa.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: '#152F27'
  },
  {
    title: 'Comece sua jornada ESG!',
    description: 'Você conheceu todas as funcionalidades da plataforma engreena. Crie sua conta gratuita e faça seu primeiro diagnóstico ESG agora mesmo!',
    narration: 'Você conheceu todas as funcionalidades da plataforma engreena! Agora é só criar sua conta gratuita e começar seu primeiro diagnóstico ESG. Estamos juntos nessa jornada rumo à sustentabilidade!',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    color: '#7B9965'
  }
];

/**
 * Seleciona a melhor voz feminina em português brasileiro disponível no sistema.
 * Prioriza vozes femininas naturais (não-robóticas), com preferência por:
 * 1. Vozes "Natural" / "Online" (Google, Microsoft Azure)
 * 2. Vozes femininas pt-BR explícitas
 * 3. Qualquer voz pt-BR feminina
 * 4. Fallback: qualquer voz pt-BR
 */
function getBestFeminineVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ptBrVoices = voices.filter(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
  const ptVoices = ptBrVoices.length > 0 ? ptBrVoices : voices.filter(v => v.lang.startsWith('pt'));

  if (ptVoices.length === 0) return null;

  // Nomes comuns de vozes femininas em pt-BR nos diferentes sistemas
  const feminineKeywords = [
    'francisca', 'vitoria', 'vitória', 'fernanda', 'raquel',
    'camila', 'leticia', 'letícia', 'maria', 'ana',
    'thalita', 'female', 'feminino', 'mulher', 'woman'
  ];

  // Preferir vozes "Natural" ou "Online" (mais naturais)
  const naturalFeminine = ptVoices.find(v => {
    const name = v.name.toLowerCase();
    const isNatural = name.includes('natural') || name.includes('online') || name.includes('neural');
    const isFeminine = feminineKeywords.some(k => name.includes(k));
    return isNatural && isFeminine;
  });
  if (naturalFeminine) return naturalFeminine;

  // Qualquer voz feminina pt-BR
  const anyFeminine = ptVoices.find(v => {
    const name = v.name.toLowerCase();
    return feminineKeywords.some(k => name.includes(k));
  });
  if (anyFeminine) return anyFeminine;

  // Qualquer voz "Natural" em pt-BR
  const anyNatural = ptVoices.find(v => {
    const name = v.name.toLowerCase();
    return name.includes('natural') || name.includes('online') || name.includes('neural');
  });
  if (anyNatural) return anyNatural;

  // Fallback: primeira voz pt-BR disponível
  return ptVoices[0];
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    setIsSpeechSupported('speechSynthesis' in window);
  }, []);

  // Carrega vozes (async em alguns navegadores) e seleciona a melhor feminina
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        selectedVoiceRef.current = getBestFeminineVoice(voices);
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stopNarration = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNarrating(false);
    utteranceRef.current = null;
  }, []);

  const narrate = useCallback((text: string) => {
    if (!isSpeechSupported) return;

    stopNarration();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';

    // Configurações para voz mais natural e suave
    utterance.rate = 0.92;   // Levemente mais lento que o normal para soar natural
    utterance.pitch = 1.05;  // Tom levemente mais agudo (feminino)
    utterance.volume = 1;

    // Usa a voz feminina pré-selecionada
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    } else if (voicesLoaded) {
      // Tenta novamente caso vozes tenham carregado depois
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = getBestFeminineVoice(voices);
      if (bestVoice) {
        selectedVoiceRef.current = bestVoice;
        utterance.voice = bestVoice;
      }
    }

    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => {
      setIsNarrating(false);
      utteranceRef.current = null;
      if (autoPlay && currentStep < tourSteps.length - 1) {
        autoPlayTimerRef.current = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 1500);
      }
    };
    utterance.onerror = () => {
      setIsNarrating(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSpeechSupported, stopNarration, autoPlay, currentStep, voicesLoaded]);

  // Auto-narrar ao mudar de step quando autoPlay está ativo
  useEffect(() => {
    if (isOpen && autoPlay && isSpeechSupported) {
      const timer = setTimeout(() => narrate(tourSteps[currentStep].narration), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, autoPlay, isOpen, isSpeechSupported, narrate]);

  // Cleanup ao fechar
  useEffect(() => {
    if (!isOpen) {
      stopNarration();
      setCurrentStep(0);
      setAutoPlay(false);
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    }
  }, [isOpen, stopNarration]);

  // Navegação por teclado
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentStep < tourSteps.length - 1) {
        stopNarration();
        setCurrentStep(prev => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        stopNarration();
        setCurrentStep(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, onClose, stopNarration]);

  if (!isOpen) return null;

  const goNext = () => {
    if (currentStep < tourSteps.length - 1) {
      stopNarration();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      stopNarration();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleAutoPlay = () => {
    if (autoPlay) {
      stopNarration();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    }
    setAutoPlay(!autoPlay);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b relative overflow-hidden" style={{ backgroundColor: '#152F27' }}>
          {/* Animated background circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: step.color }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: '#7B9965' }} />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tour Guiado</h2>
                <p className="text-white/50 text-xs">{currentStep + 1} de {tourSteps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Auto-play toggle */}
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  autoPlay ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title={autoPlay ? 'Pausar apresentação automática' : 'Iniciar apresentação automática com narração'}
              >
                {autoPlay ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                )}
                {autoPlay ? 'Pausar' : 'Auto'}
              </button>

              {/* Close button */}
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, backgroundColor: '#e2f7d0' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="text-center">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-500"
              style={{ backgroundColor: step.color + '15' }}
            >
              <svg className="w-10 h-10 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke={step.color} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold mb-4 transition-all duration-300" style={{ color: '#152F27' }}>
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto text-base mb-6">
              {step.description}
            </p>

            {/* Narration indicator */}
            {isNarrating && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#e2f7d0', color: '#152F27' }}>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#7B9965' }} />
                  <span className="w-1.5 h-4 rounded-full animate-pulse" style={{ backgroundColor: '#7B9965', animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#7B9965', animationDelay: '0.3s' }} />
                  <span className="w-1.5 h-5 rounded-full animate-pulse" style={{ backgroundColor: '#7B9965', animationDelay: '0.45s' }} />
                  <span className="w-1.5 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#7B9965', animationDelay: '0.6s' }} />
                </div>
                Narrando...
              </div>
            )}

            {/* Narrate button (manual) */}
            {!isNarrating && isSpeechSupported && !autoPlay && (
              <button
                onClick={() => narrate(step.narration)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Ouvir narração
              </button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-8">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  stopNarration();
                  if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
                  setCurrentStep(index);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 h-2'
                    : index < currentStep
                    ? 'w-2 h-2 opacity-60'
                    : 'w-2 h-2 opacity-30'
                }`}
                style={{
                  backgroundColor: index === currentStep ? step.color : '#152F27'
                }}
                title={tourSteps[index].title}
              />
            ))}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            <p className="text-xs text-gray-400 hidden sm:block">
              Use as setas do teclado para navegar
            </p>

            {currentStep < tourSteps.length - 1 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#152F27' }}
              >
                Próximo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#7B9965' }}
              >
                Começar agora!
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
