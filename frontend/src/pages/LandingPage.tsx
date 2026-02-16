import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoAnswers, setDemoAnswers] = useState<number[]>([]);
  const [showDemoResult, setShowDemoResult] = useState(false);

  const demoQuestions = [
    {
      category: 'Ambiental',
      categoryColor: '#7B9965',
      question: 'Sua empresa possui política de gestão de resíduos sólidos?',
      options: ['Não possui', 'Em desenvolvimento', 'Parcialmente implementada', 'Totalmente implementada']
    },
    {
      category: 'Ambiental',
      categoryColor: '#7B9965',
      question: 'A empresa monitora e busca reduzir seu consumo de energia?',
      options: ['Não monitora', 'Monitora mas não atua', 'Monitora e tem metas', 'Monitora, tem metas e as atinge']
    },
    {
      category: 'Social',
      categoryColor: '#924131',
      question: 'A empresa possui programa de diversidade e inclusão?',
      options: ['Não possui', 'Em planejamento', 'Possui programa básico', 'Programa estruturado com metas']
    },
    {
      category: 'Social',
      categoryColor: '#924131',
      question: 'Como a empresa avalia a satisfação dos colaboradores?',
      options: ['Não avalia', 'Avaliação informal', 'Pesquisa anual', 'Pesquisas frequentes com planos de ação']
    },
    {
      category: 'Governança',
      categoryColor: '#152F27',
      question: 'A empresa possui código de ética e conduta documentado?',
      options: ['Não possui', 'Em elaboração', 'Possui mas não divulga', 'Possui e todos conhecem']
    },
    {
      category: 'Governança',
      categoryColor: '#152F27',
      question: 'Existe canal de denúncias para questões éticas?',
      options: ['Não existe', 'Existe informalmente', 'Canal formal interno', 'Canal independente e anônimo']
    }
  ];

  const handleDemoAnswer = (answerIndex: number) => {
    const newAnswers = [...demoAnswers, answerIndex];
    setDemoAnswers(newAnswers);
    if (demoStep < demoQuestions.length - 1) {
      setDemoStep(demoStep + 1);
    } else {
      setShowDemoResult(true);
    }
  };

  const getDemoScore = () => {
    const totalPoints = demoAnswers.reduce((sum, answer) => sum + answer, 0);
    const maxPoints = demoQuestions.length * 3;
    return Math.round((totalPoints / maxPoints) * 100);
  };

  const getDemoLevel = () => {
    const score = getDemoScore();
    if (score >= 70) return { level: 'Ouro', color: '#FFD700', title: 'Liderança ESG' };
    if (score >= 40) return { level: 'Prata', color: '#C0C0C0', title: 'Integração ESG' };
    return { level: 'Bronze', color: '#CD7F32', title: 'Compromisso ESG' };
  };

  const resetDemo = () => {
    setShowDemo(false);
    setDemoStep(0);
    setDemoAnswers([]);
    setShowDemoResult(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-12" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#sobre" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sobre</a>
              <a href="#pilares" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pilares ESG</a>
              <a href="#planos" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Planos</a>
              <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Contato</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90" style={{ backgroundColor: '#152F27' }}>
                Cadastro
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden" style={{ backgroundColor: '#f5ffeb' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#152F27' }}>
                Diagnóstico<br/>ESG completo
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Avalie práticas ambientais, sociais e de governança em minutos. Receba insights personalizados e um plano de ação para tornar sua empresa mais sustentável.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                <Link to="/register" className="px-8 py-3.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90" style={{ backgroundColor: '#152F27' }}>
                  Começar diagnóstico gratuito
                </Link>
                <button onClick={() => setShowDemo(true)} className="px-8 py-3.5 text-sm font-semibold rounded-full border-2 transition-all hover:bg-white" style={{ borderColor: '#152F27', color: '#152F27' }}>
                  Ver demo
                </button>
              </div>
              <div className="flex gap-4">
                {[
                  { value: '+500', label: 'Empresas avaliadas' },
                  { value: '15 min', label: 'Tempo médio' },
                  { value: '98%', label: 'Satisfação' }
                ].map((stat, i) => (
                  <div key={i} className="px-5 py-4 bg-white rounded-2xl border border-gray-100">
                    <p className="text-2xl font-bold" style={{ color: '#152F27' }}>{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Environmental', subtitle: 'Gestão Ambiental e Climática', detail: '15 critérios  ·  5 temas  ·  75 questões', color: '#7B9965', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'Social', subtitle: 'Responsabilidade Social', detail: '15 critérios  ·  5 temas  ·  75 questões', color: '#924131', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { title: 'Governance', subtitle: 'Governança Corporativa', detail: '13 critérios  ·  4 temas  ·  65 questões', color: '#152F27', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
              ].map((card, i) => (
                <div key={i} className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.color + '15' }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={card.color} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: card.color }}>{card.title}</h3>
                    <p className="text-sm text-gray-500">{card.subtitle}</p>
                    <p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Por que engreena */}
      <section id="sobre" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#7B9965' }}>Por que engreena</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#152F27' }}>A plataforma ESG mais completa do Brasil</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Tudo que sua empresa precisa para iniciar e evoluir na jornada ESG</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '215 Perguntas ESG', description: 'Questionário completo cobrindo Environmental, Social e Governance com metodologia internacional.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              { title: 'Relatórios Inteligentes', description: 'Dashboards interativos com análises profundas, gráficos e insights acionáveis em tempo real.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { title: 'Certificação ESG engreena', description: 'Certificação que valida sua performance e compromisso ESG com metodologia própria reconhecida.', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#e2f7d0' }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#152F27" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#152F27' }}>{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares ESG */}
      <section id="pilares" className="py-24 px-6" style={{ backgroundColor: '#f5ffeb' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#7B9965' }}>Metodologia</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#152F27' }}>Avaliação completa dos 3 pilares ESG</h2>
            <p className="text-lg text-gray-500">Metodologia estruturada e reconhecida globalmente</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { title: 'Ambiental', subtitle: 'Environmental', temas: '5 temas estratégicos', criterios: '15 critérios avaliados', questoes: '75 questões detalhadas', color: '#7B9965', examples: ['Mudanças Climáticas', 'Recursos Hídricos', 'Biodiversidade', 'Economia Circular', 'Gestão Ambiental'], icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'Social', subtitle: 'Social', temas: '5 temas estratégicos', criterios: '15 critérios avaliados', questoes: '75 questões detalhadas', color: '#924131', examples: ['Direitos Humanos', 'Diversidade & Inclusão', 'Saúde e Segurança', 'Comunidade', 'Cadeia de Valor'], icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
              { title: 'Governança', subtitle: 'Governance', temas: '4 temas estratégicos', criterios: '13 critérios avaliados', questoes: '65 questões detalhadas', color: '#152F27', examples: ['Ética e Compliance', 'Transparência', 'Gestão de Riscos', 'Conselho'], icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
            ].map((pilar, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: pilar.color + '15' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={pilar.color} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={pilar.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: pilar.color }}>{pilar.title}</h3>
                <p className="text-sm text-gray-400 mb-6">{pilar.subtitle}</p>
                <div className="space-y-3 mb-6">
                  {[pilar.temas, pilar.criterios, pilar.questoes].map((item, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pilar.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {pilar.examples.map((ex, j) => (
                      <span key={j} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: pilar.color + '10', color: pilar.color }}>{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificação */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#7B9965' }}>Certificação</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#152F27' }}>Níveis de Certificação ESG</h2>
            <p className="text-lg text-gray-500">Sua conquista reconhecida</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { level: 'Bronze', title: 'Compromisso ESG', score: '0-39 pontos', color: '#CD7F32', seal: '/images/assets/selo-bronze.png' },
              { level: 'Prata', title: 'Integração ESG', score: '40-69 pontos', color: '#C0C0C0', seal: '/images/assets/selo-prata.png' },
              { level: 'Ouro', title: 'Liderança ESG', score: '70-100 pontos', color: '#FFD700', seal: '/images/assets/selo-ouro.png' }
            ].map((cert, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-1" style={{ borderColor: cert.color + '60' }}>
                <img src={cert.seal} alt={`Selo ${cert.level}`} className="w-28 h-28 object-contain mx-auto mb-5" />
                <h3 className="text-2xl font-bold mb-1" style={{ color: cert.color }}>{cert.level}</h3>
                <p className="text-base font-medium text-gray-700 mb-3">{cert.title}</p>
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: cert.color + '15', color: cert.color }}>{cert.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 px-6" style={{ backgroundColor: '#f5ffeb' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#7B9965' }}>Planos</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#152F27' }}>Planos para sua jornada ESG</h2>
            <p className="text-lg text-gray-500">Comece gratuitamente e evolua conforme sua necessidade</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Demo', code: 'free', price: 'Grátis', period: '', highlight: false, features: [{ text: 'Diagnóstico rápido (6 perguntas)', included: true }, { text: 'Resultado simplificado', included: true }, { text: 'Relatório completo', included: false }, { text: 'Consultoria', included: false }, { text: 'Certificação', included: false }], cta: 'Começar Grátis', subtitle: 'Conheça a plataforma' },
              { name: 'Start', code: 'start', price: 'R$ 49', period: '/mês', highlight: false, features: [{ text: 'Diagnóstico completo (215 perguntas)', included: true }, { text: 'Dashboard de indicadores', included: true }, { text: 'Relatório detalhado', included: true }, { text: 'Consultoria', included: false }, { text: 'Certificação', included: false }], cta: 'Assinar Start', subtitle: 'Para quem está começando' },
              { name: 'Grow', code: 'grow', price: 'R$ 99', period: '/mês', highlight: true, features: [{ text: 'Tudo do Start', included: true }, { text: '2h/mês de consultoria ESG', included: true }, { text: 'Certificação ESG', included: true }, { text: 'Insights estratégicos', included: true }, { text: 'Planos de ação', included: false }], cta: 'Assinar Grow', badge: 'Recomendado', subtitle: 'Mais escolhido' },
              { name: 'Impact', code: 'impact', price: 'R$ 159', period: '/mês', highlight: false, features: [{ text: 'Tudo do Grow', included: true }, { text: '4h/mês de consultoria ESG', included: true }, { text: 'Planos de ação personalizados', included: true }, { text: 'Benchmarking setorial', included: true }, { text: 'Suporte prioritário', included: true }], cta: 'Assinar Impact', subtitle: 'Máximo impacto' }
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-2xl bg-white transition-all ${plan.highlight ? 'shadow-lg ring-2 scale-[1.02] z-10' : 'border border-gray-100 hover:shadow-md'}`} style={plan.highlight ? { '--tw-ring-color': '#7B9965' } as any : undefined}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: '#152F27' }}>{plan.badge}</div>
                )}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#152F27' }}>{plan.name}</h3>
                    <p className="text-xs text-gray-400">{plan.subtitle}</p>
                  </div>
                  <div className="mb-5">
                    <span className="text-3xl font-bold" style={{ color: plan.highlight ? '#7B9965' : '#152F27' }}>{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        {feature.included ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="12" fill="#7B9965" opacity="0.15"/><polyline points="8 12 11 15 16 9" stroke="#7B9965" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="12" fill="#e5e7eb"/><line x1="8" y1="12" x2="16" y2="12" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.code === 'free' ? '/register' : `/checkout?plan=${plan.code}`} className={`block w-full py-3 text-center font-semibold text-sm rounded-full transition-all hover:opacity-90 ${plan.highlight ? 'text-white' : 'border-2'}`} style={plan.highlight ? { backgroundColor: '#152F27' } : { borderColor: '#152F27', color: '#152F27' }}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-10 text-sm">Sem fidelidade · Cancele quando quiser · Dados protegidos por criptografia</p>
        </div>
      </section>

      {/* Consultoria */}
      <section className="py-24 px-6" style={{ backgroundColor: '#152F27' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#e2f7d0' }}>Consultoria</p>
            <h2 className="text-4xl font-bold text-white mb-4">Consultoria Especializada <span style={{ color: '#e2f7d0' }}>Inclusa</span></h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Assinantes contam com horas de consultoria ESG para acelerar sua transformação</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-bold text-white mb-6">O que inclui?</h3>
              <ul className="space-y-4">
                {['Orientação estratégica personalizada', 'Análise de resultados do diagnóstico', 'Plano de ação para melhorias', 'Acompanhamento de implementação', 'Benchmarking setorial', 'Preparação para auditorias'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2f7d0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-bold text-white mb-6">Horas por Plano</h3>
              <div className="space-y-3">
                {[
                  { plan: 'Demo', hours: '0 horas', dim: true },
                  { plan: 'Start', hours: '0 horas', dim: true },
                  { plan: 'Grow', hours: '2 horas/mês', dim: false },
                  { plan: 'Impact', hours: '4 horas/mês', dim: false }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 ${item.dim ? 'opacity-40' : ''}`}>
                    <span className="font-semibold text-white">{item.plan}</span>
                    <span className="font-bold" style={{ color: '#e2f7d0' }}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white text-sm"><strong style={{ color: '#e2f7d0' }}>Certificados ganham horas extras!</strong> Bronze: 1h extra · Prata: 3h extras · Ouro: 6h extras de consultoria gratuita</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ backgroundColor: '#f5ffeb' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#152F27' }}>Pronto para liderar a sustentabilidade?</h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">Junte-se a mais de 500 empresas que já estão transformando seus negócios com práticas ESG de excelência.</p>
          <Link to="/register" className="inline-flex items-center gap-3 px-10 py-4 text-white font-semibold rounded-full transition-all hover:opacity-90" style={{ backgroundColor: '#152F27' }}>
            Começar agora — é grátis
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <p className="mt-6 text-sm text-gray-400">Sem cartão de crédito · Suporte disponível · Certificação inclusa</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#152F27' }}>
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-14 mb-4 brightness-0 invert" />
              <p className="text-sm text-white/60 leading-relaxed">Transformando negócios através de práticas ESG sustentáveis e responsáveis.</p>
              <div className="flex gap-3 mt-6">
                {[
                  { icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', url: 'https://br.linkedin.com/company/greena-solu%C3%A7%C3%B5es-em-sustentabilidade' },
                  { icon: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M6.5 2h11A4.5 4.5 0 0 1 22 6.5v11a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 17.5v-11A4.5 4.5 0 0 1 6.5 2z', url: 'https://www.instagram.com/greena.solucoes/' },
                  { icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', url: 'https://www.facebook.com/profile.php?id=61550708137780' }
                ].map((social, i) => (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={social.icon}/></svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-3">
                {['Avaliação ESG', 'Relatórios', 'Certificação', 'Dashboard', 'Indicadores'].map(label => (
                  <li key={label}><Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {[{ label: 'Privacidade', href: '/privacy' }, { label: 'Termos de Uso', href: '/terms' }, { label: 'LGPD', href: '/lgpd' }, { label: 'Cookies', href: '/cookies' }, { label: 'Compliance', href: '/compliance' }].map(item => (
                  <li key={item.label}><Link to={item.href} className="text-sm text-white/60 hover:text-white transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><p className="font-medium text-white/80">UPF Parque Científico e Tecnológico</p><p>Passo Fundo / RS</p></li>
                <li><a href="tel:+5554991897645" className="hover:text-white transition-colors">(54) 99189-7645</a></li>
                <li><a href="mailto:contato@greenasolucoes.com.br" className="hover:text-white transition-colors">contato@greenasolucoes.com.br</a></li>
                <li>Segunda a Sexta: 9h às 18h</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">© 2025 engreena ESG Platform. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b" style={{ backgroundColor: '#152F27' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Demonstração ESG</h2>
                  <p className="text-white/60 text-sm mt-1">{showDemoResult ? 'Resultado do seu diagnóstico' : `Pergunta ${demoStep + 1} de ${demoQuestions.length}`}</p>
                </div>
                <button onClick={resetDemo} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {!showDemoResult && (
                <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((demoStep + 1) / demoQuestions.length) * 100}%`, backgroundColor: '#e2f7d0' }} />
                </div>
              )}
            </div>
            <div className="p-6">
              {!showDemoResult ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-5" style={{ backgroundColor: demoQuestions[demoStep].categoryColor }}>{demoQuestions[demoStep].category}</span>
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#152F27' }}>{demoQuestions[demoStep].question}</h3>
                  <div className="space-y-2.5">
                    {demoQuestions[demoStep].options.map((option, index) => (
                      <button key={index} onClick={() => handleDemoAnswer(index)} className="w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all hover:bg-green-50" style={{ borderColor: '#e5e7eb', color: '#152F27' }}>
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: getDemoLevel().color + '20', border: `3px solid ${getDemoLevel().color}` }}>
                    <span className="text-4xl font-bold" style={{ color: getDemoLevel().color }}>{getDemoScore()}%</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: getDemoLevel().color }}>Nível {getDemoLevel().level}</h3>
                  <p className="text-base text-gray-500 mb-6">{getDemoLevel().title}</p>
                  <div className="p-5 rounded-xl mb-6" style={{ backgroundColor: '#f5ffeb' }}>
                    <p className="text-sm text-gray-600 leading-relaxed">Este foi um diagnóstico demonstrativo com 6 perguntas. O diagnóstico completo possui <strong style={{ color: '#152F27' }}>215 questões</strong> que avaliam detalhadamente todos os aspectos ESG da sua empresa.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={resetDemo} className="flex-1 py-3 rounded-full border-2 font-semibold text-sm transition-all hover:bg-gray-50" style={{ borderColor: '#152F27', color: '#152F27' }}>Fechar</button>
                    <Link to="/register" onClick={resetDemo} className="flex-1 py-3 rounded-full font-semibold text-sm text-white text-center transition-all hover:opacity-90" style={{ backgroundColor: '#152F27' }}>Diagnóstico Completo</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
