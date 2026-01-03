import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoAnswers, setDemoAnswers] = useState<number[]>([]);
  const [showDemoResult, setShowDemoResult] = useState(false);

  // Perguntas de demonstração ESG
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


  // Ícone Planeta/Global
  const GlobeIcon = ({ size = 48, color = "#7B9965" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );

  // Ícone Pessoas/Comunidade
  const UsersIcon = ({ size = 48, color = "#924131" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );

  // Ícone Escudo/Governança
  const ShieldIcon = ({ size = 48, color = "#152F27" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M12 8v4"/>
      <path d="M12 16h.01"/>
    </svg>
  );

  // Ícone Checklist/Avaliação
  const ChecklistIcon = ({ size = 48, color = "#7B9965" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 14l2 2 4-4"/>
    </svg>
  );

  // Ícone Gráfico/Analytics
  const ChartIcon = ({ size = 48, color = "#152F27" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );

  // Ícone Certificado
  const AwardIcon = ({ size = 48, color = "#924131" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  );

  // Ícone Folha/Sustentabilidade
  const LeafIcon = ({ size = 48, color = "#7B9965" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );

  // Ícone Rocket
  const RocketIcon = ({ size = 48, color = "white" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );

  // Ícone Trending Up
  const TrendingIcon = ({ size = 24, color = "#7B9965" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-slide-in { animation: slideIn 1s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }
        .animate-scale-in { animation: scaleIn 0.8s ease-out forwards; }

        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
        .delay-600 { animation-delay: 0.6s; opacity: 0; }

        .hover-lift {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(21, 47, 39, 0.25);
        }

        .gradient-green {
          background: linear-gradient(135deg, #152F27 0%, #2d5a45 50%, #7B9965 100%);
        }

        .gradient-overlay {
          background: linear-gradient(180deg, rgba(21, 47, 39, 0.95) 0%, rgba(21, 47, 39, 0.7) 100%);
        }

        .text-gradient {
          background: linear-gradient(135deg, #7B9965 0%, #152F27 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-14" />
            </Link>

            {/* Menu */}
            <div className="flex items-center gap-6">
              <a
                href="#sobre"
                className="text-sm font-semibold transition-colors"
                style={{ color: '#152F27' }}
              >
                Sobre
              </a>
              <a
                href="#pilares"
                className="text-sm font-semibold transition-colors"
                style={{ color: '#152F27' }}
              >
                Pilares ESG
              </a>
              <Link
                to="/contact"
                className="text-sm font-semibold transition-colors"
                style={{ color: '#152F27' }}
              >
                Contato
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90 gradient-green"
              >
                Acessar Plataforma
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner - FULL SCREEN */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 gradient-green"></div>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 Q30 30 50 50 Q70 30 50 10 Z' fill='white' opacity='0.5'/%3E%3Cpath d='M30 40 Q20 55 30 70 Q40 55 30 40 Z' fill='white' opacity='0.4'/%3E%3Cpath d='M70 40 Q60 55 70 70 Q80 55 70 40 Z' fill='white' opacity='0.4'/%3E%3Cpath d='M50 60 Q40 75 50 90 Q60 75 50 60 Z' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}/>
          <div className="absolute top-20 left-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-6 animate-fade-up bg-white/20 backdrop-blur-sm border border-white/30">
                <LeafIcon size={20} color="white" />
                <span className="text-sm font-bold">Plataforma ESG Completa</span>
              </div>

              <h1 className="text-7xl font-black mb-6 leading-tight animate-fade-up delay-100">
                Transforme seu<br/>
                Negócio com<br/>
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #EFD4A8, #7B9965)' }}>
                  Sustentabilidade
                </span>
              </h1>

              <p className="text-2xl mb-8 leading-relaxed opacity-95 animate-fade-up delay-200">
                Avalie, monitore e evolua sua performance ESG com <strong className="text-yellow-200">215 questões especializadas</strong> e relatórios completos.
              </p>

              <div className="flex flex-wrap gap-4 mb-12 animate-fade-up delay-300">
                <Link
                  to="/login"
                  className="px-10 py-5 bg-white font-bold rounded-2xl transition-all hover:scale-105 shadow-2xl text-xl flex items-center gap-3"
                  style={{ color: '#152F27' }}
                >
                  Começar Diagnóstico Gratuito
                  <TrendingIcon size={20} color="#152F27" />
                </Link>
                <button
                  onClick={() => setShowDemo(true)}
                  className="px-10 py-5 border-3 border-white font-bold rounded-2xl transition-all hover:bg-white/10 text-xl text-white"
                >
                  Ver Demo
                </button>
              </div>

            </div>

            {/* Right - Visual ESG Cards */}
            <div className="relative animate-float">
              <div className="grid gap-6">
                {/* Environmental Card */}
                <div className="p-8 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 hover-lift">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#7B9965' }}>
                      <GlobeIcon size={40} color="white" />
                    </div>
                    <div className="text-white">
                      <div className="text-3xl font-black mb-1">Environmental</div>
                      <div className="text-lg opacity-90">Gestão Ambiental e Climática</div>
                      <div className="text-sm font-bold mt-2" style={{ color: '#EFD4A8' }}>15 critérios • 5 temas</div>
                    </div>
                  </div>
                </div>

                {/* Social Card */}
                <div className="p-8 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 hover-lift">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#924131' }}>
                      <UsersIcon size={40} color="white" />
                    </div>
                    <div className="text-white">
                      <div className="text-3xl font-black mb-1">Social</div>
                      <div className="text-lg opacity-90">Responsabilidade Social</div>
                      <div className="text-sm font-bold mt-2" style={{ color: '#EFD4A8' }}>15 critérios • 5 temas</div>
                    </div>
                  </div>
                </div>

                {/* Governance Card */}
                <div className="p-8 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 hover-lift">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EFD4A8' }}>
                      <ShieldIcon size={40} color="#152F27" />
                    </div>
                    <div className="text-white">
                      <div className="text-3xl font-black mb-1">Governance</div>
                      <div className="text-lg opacity-90">Governança Corporativa</div>
                      <div className="text-sm font-bold mt-2" style={{ color: '#EFD4A8' }}>13 critérios • 4 temas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section - Por que GREENA */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: '#f0f9f4' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-6 text-gradient">
              Por que escolher a GREENA?
            </h2>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
              A plataforma ESG mais completa e moderna do Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: ChecklistIcon,
                title: '215 Perguntas ESG',
                description: 'Questionário completo cobrindo Environmental, Social e Governance com metodologia internacional',
                color: '#7B9965'
              },
              {
                Icon: ChartIcon,
                title: 'Relatórios Inteligentes',
                description: 'Dashboards interativos com análises profundas, gráficos e insights acionáveis em tempo real',
                color: '#152F27'
              },
              {
                Icon: AwardIcon,
                title: 'Certificação ESG Greena',
                description: 'Certificação que valida sua performance e compromisso ESG com metodologia própria',
                color: '#924131'
              }
            ].map((feature, i) => (
              <div key={i} className="hover-lift p-10 bg-white rounded-3xl shadow-lg border-2 animate-scale-in" style={{ borderColor: feature.color + '40', animationDelay: `${i * 0.1}s` }}>
                <div className="mb-6 flex justify-center">
                  <feature.Icon size={64} color={feature.color} />
                </div>
                <h3 className="text-3xl font-black mb-4 text-center" style={{ color: feature.color }}>
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares ESG - Detalhado */}
      <section id="pilares" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6" style={{ color: '#152F27' }}>
              Avaliação Completa dos<br/>
              <span className="text-gradient">3 Pilares ESG</span>
            </h2>
            <p className="text-2xl text-gray-600">Metodologia estruturada e reconhecida globalmente</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                title: 'Ambiental',
                subtitle: 'Environmental',
                Icon: GlobeIcon,
                temas: '5 temas estratégicos',
                criterios: '15 critérios avaliados',
                questoes: '75 questões detalhadas',
                color: '#7B9965',
                examples: ['Mudanças Climáticas', 'Recursos Hídricos', 'Biodiversidade', 'Economia Circular', 'Gestão Ambiental']
              },
              {
                title: 'Social',
                subtitle: 'Social',
                Icon: UsersIcon,
                temas: '5 temas estratégicos',
                criterios: '15 critérios avaliados',
                questoes: '75 questões detalhadas',
                color: '#924131',
                examples: ['Direitos Humanos', 'Diversidade & Inclusão', 'Saúde e Segurança', 'Comunidade', 'Relações com a cadeia de valor']
              },
              {
                title: 'Governança',
                subtitle: 'Governance',
                Icon: ShieldIcon,
                temas: '4 temas estratégicos',
                criterios: '13 critérios avaliados',
                questoes: '65 questões detalhadas',
                color: '#152F27',
                examples: ['Ética e Compliance', 'Transparência', 'Gestão de Riscos', 'Conselho']
              }
            ].map((pilar, i) => (
              <div key={i} className="hover-lift p-10 rounded-3xl border-4 bg-white shadow-xl animate-scale-in" style={{ borderColor: pilar.color, animationDelay: `${i * 0.15}s` }}>
                <div className="mb-6 flex justify-center">
                  <pilar.Icon size={80} color={pilar.color} />
                </div>
                <h3 className="text-5xl font-black mb-2 text-center" style={{ color: pilar.color }}>
                  {pilar.title}
                </h3>
                <p className="text-xl text-center text-gray-500 mb-8 font-semibold">{pilar.subtitle}</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: pilar.color + '15' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pilar.color} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="font-bold text-lg">{pilar.temas}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: pilar.color + '15' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pilar.color} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="font-bold text-lg">{pilar.criterios}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: pilar.color + '15' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pilar.color} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="font-black text-xl" style={{ color: pilar.color }}>{pilar.questoes}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {pilar.examples.map((ex, j) => (
                    <div key={j} className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pilar.color }}></div>
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Levels Section */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #f8fafb 0%, white 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-6" style={{ color: '#152F27' }}>
              Níveis de <span className="text-gradient">Certificação ESG</span>
            </h2>
            <p className="text-2xl text-gray-600 mb-4">
              Sua conquista reconhecida
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                level: 'Bronze',
                title: 'Compromisso ESG',
                score: '0-39 pontos',
                color: '#CD7F32'
              },
              {
                level: 'Prata',
                title: 'Integração ESG',
                score: '40-69 pontos',
                color: '#C0C0C0'
              },
              {
                level: 'Ouro',
                title: 'Liderança ESG',
                score: '70-100 pontos',
                color: '#FFD700'
              }
            ].map((cert, i) => (
              <div
                key={i}
                className="relative p-8 rounded-3xl border-4 hover-lift shadow-xl bg-white"
                style={{ borderColor: cert.color }}
              >
                <div className="text-center">
                  <h3 className="text-4xl font-black mb-2" style={{ color: cert.color }}>
                    {cert.level}
                  </h3>
                  <p className="text-xl font-bold text-gray-700 mb-4">{cert.title}</p>
                  <p className="text-sm font-semibold text-gray-500 px-4 py-2 rounded-full inline-block" style={{ backgroundColor: cert.color + '20' }}>
                    {cert.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Planos */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-6" style={{ color: '#152F27' }}>
              Planos que Crescem com<br/>
              <span className="text-gradient">Seu Negócio</span>
            </h2>
            <p className="text-2xl text-gray-600">Escolha o melhor plano para sua jornada ESG</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: 'Teste Grátis',
                price: 'R$ 0',
                period: '/mês',
                highlight: false,
                features: [
                  '1 diagnóstico completo',
                  '0 horas de consultoria',
                  'Dashboard básico',
                  'Relatórios simples',
                  'Suporte por email',
                  'Sem certificação'
                ],
                cta: 'Experimente Grátis',
                color: '#7B9965',
                badge: 'Comece Agora',
                limitation: 'Acesso limitado para conhecer a plataforma'
              },
              {
                name: 'Básico',
                price: 'R$ 99,90',
                period: '/mês',
                highlight: false,
                features: [
                  '5 diagnósticos/mês',
                  '2 horas de consultoria',
                  'Dashboard avançado',
                  'Relatórios detalhados',
                  'Suporte prioritário',
                  'Certificação inclusa',
                  'Até 3 usuários'
                ],
                cta: 'Assinar Básico',
                color: '#152F27'
              },
              {
                name: 'Profissional',
                price: 'R$ 299,90',
                period: '/mês',
                highlight: true,
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
                cta: 'Assinar Profissional',
                color: '#924131',
                badge: 'Mais Popular'
              },
              {
                name: 'Empresarial',
                price: 'R$ 999,90',
                period: '/mês',
                highlight: false,
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
                cta: 'Falar com Vendas',
                color: '#152F27'
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-3xl border-2 hover-lift ${plan.highlight ? 'shadow-2xl' : 'shadow-lg'}`}
                style={{
                  borderColor: plan.color,
                  backgroundColor: plan.highlight ? plan.color + '10' : 'white',
                  transform: plan.highlight ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-black"
                    style={{ backgroundColor: plan.color }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-3xl font-black mb-2" style={{ color: plan.color }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end justify-center gap-1 mb-2">
                    <span className="text-5xl font-black" style={{ color: plan.color }}>
                      {plan.price}
                    </span>
                    <span className="text-xl text-gray-500 mb-2">{plan.period}</span>
                  </div>
                  {plan.limitation && (
                    <p className="text-xs text-gray-500 italic">{plan.limitation}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2" className="flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="font-semibold text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Teste Grátis' ? '/register' : '/login'}
                  className={`block w-full py-4 text-center font-black rounded-xl transition-all hover:scale-105 ${
                    plan.highlight ? 'text-white shadow-lg' : 'border-2 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: plan.highlight ? plan.color : 'transparent',
                    borderColor: plan.color,
                    color: plan.highlight ? 'white' : plan.color
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.highlight) {
                      e.currentTarget.style.backgroundColor = plan.color;
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.highlight) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = plan.color;
                    }
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Sem compromisso • Cancelamento fácil • Dados protegidos
          </p>
        </div>
      </section>

      {/* Consultation Benefits Section */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #152F27 0%, #2d5a45 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='white' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}/>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-6 text-white">
              Consultoria Especializada <span style={{ color: '#EFD4A8' }}>Inclusa</span>
            </h2>
            <p className="text-2xl text-white opacity-90 max-w-3xl mx-auto">
              Assinantes contam com horas de consultoria ESG para acelerar sua transformação
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#7B9965' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white">O que inclui?</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Orientação estratégica personalizada',
                  'Análise de resultados do diagnóstico',
                  'Plano de ação para melhorias',
                  'Acompanhamento de implementação',
                  'Benchmarking setorial',
                  'Preparação para auditorias'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFD4A8" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="font-semibold text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#924131' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white">Horas por Plano</h3>
              </div>
              <div className="space-y-4">
                {[
                  { plan: 'Teste Grátis', hours: '0 horas', color: '#7B9965' },
                  { plan: 'Básico', hours: '2 horas/mês', color: '#152F27' },
                  { plan: 'Profissional', hours: '8 horas/mês', color: '#924131' },
                  { plan: 'Empresarial', hours: '24 horas/mês', color: '#EFD4A8' }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: item.color + '20', borderLeft: `4px solid ${item.color}` }}
                  >
                    <span className="font-black text-white text-lg">{item.plan}</span>
                    <span className="font-black text-2xl" style={{ color: item.color }}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
            <p className="text-white text-xl mb-4">
              <strong style={{ color: '#EFD4A8' }}>Certificados ganham horas extras!</strong>
            </p>
            <p className="text-white opacity-90">
              Bronze: 1h extra • Prata: 3h extras • Ouro: 6h extras de consultoria gratuita adicional
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner - GRANDE */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 gradient-green"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-emerald-300 rounded-full blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 text-white">
          <div className="mb-8 flex justify-center">
            <RocketIcon size={120} color="white" />
          </div>
          <h2 className="text-8xl font-black mb-8 leading-tight">
            Pronto para Liderar a<br/>Sustentabilidade?
          </h2>
          <p className="text-3xl mb-12 opacity-95 leading-relaxed max-w-4xl mx-auto">
            Junte-se a <strong className="text-yellow-200">mais de 500 empresas</strong> que já estão transformando seus negócios com práticas ESG de excelência
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-4 px-16 py-7 bg-white font-black rounded-2xl transition-all hover:scale-110 shadow-2xl text-3xl"
            style={{ color: '#152F27' }}
          >
            Começar Agora - É Grátis
            <TrendingIcon size={32} color="#152F27" />
          </Link>
          <p className="mt-8 text-xl opacity-80">Sem cartão de crédito • Suporte 24/7 • Certificação Inclusa</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1a14 0%, #152F27 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%237B9965' fill-opacity='1'%3E%3Cpath d='M30 10 L25 15 Q25 18 25 20 Q27 22 30 22 Q33 22 35 20 Q35 18 35 15 L30 10 Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}/>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-20 relative">
          {/* Top Section */}
          <div className="grid md:grid-cols-5 gap-16 mb-16">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-24" />
              </div>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#EFD4A8' }}>
                Transformando negócios através de práticas ESG sustentáveis e responsáveis. Liderando a mudança para um futuro mais verde.
              </p>

              {/* Social Icons */}
              <div className="flex gap-4">
                {[
                  { icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', label: 'LinkedIn', url: 'https://br.linkedin.com/company/greena-solu%C3%A7%C3%B5es-em-sustentabilidade' },
                  { icon: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M6.5 2h11A4.5 4.5 0 0 1 22 6.5v11a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 17.5v-11A4.5 4.5 0 0 1 6.5 2z', label: 'Instagram', url: 'https://www.instagram.com/greena.solucoes/' },
                  { icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61550708137780' }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                    style={{ backgroundColor: '#7B996530', color: '#7B9965' }}
                    aria-label={social.label}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={social.icon}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-black text-xl mb-6 flex items-center gap-2" style={{ color: '#7B9965' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Contato
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#EFD4A8' }}>UPF Parque Científico e Tecnológico</p>
                    <p className="text-xs opacity-80" style={{ color: '#EFD4A8' }}>Módulo II - Universidade de Passo Fundo</p>
                    <p className="text-xs opacity-80" style={{ color: '#EFD4A8' }}>BR 285, Bairro São José, 99052-900</p>
                    <p className="text-xs opacity-80" style={{ color: '#EFD4A8' }}>Passo Fundo / RS</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <a href="tel:+5554991897645" className="text-sm font-semibold hover:text-green-400 transition-colors" style={{ color: '#EFD4A8' }}>
                    (54) 99189-7645
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href="mailto:contato@greenasolucoes.com.br" className="text-sm font-semibold hover:text-green-400 transition-colors" style={{ color: '#EFD4A8' }}>
                    contato@greenasolucoes.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-10 border-t" style={{ borderColor: '#7B996530' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap gap-6 text-sm">
                {['Privacidade', 'Termos de Uso', 'LGPD', 'Cookies', 'Compliance'].map(item => (
                  <a
                    key={item}
                    href="#"
                    className="font-semibold hover:text-green-400 transition-colors"
                    style={{ color: '#EFD4A8' }}
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                © 2025 GREENA ESG Platform. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Demonstração ESG</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {showDemoResult ? 'Resultado do seu diagnóstico' : `Pergunta ${demoStep + 1} de ${demoQuestions.length}`}
                  </p>
                </div>
                <button
                  onClick={resetDemo}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              {/* Progress Bar */}
              {!showDemoResult && (
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${((demoStep + 1) / demoQuestions.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              {!showDemoResult ? (
                <>
                  {/* Category Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white mb-6"
                    style={{ backgroundColor: demoQuestions[demoStep].categoryColor }}
                  >
                    {demoQuestions[demoStep].category === 'Ambiental' && <GlobeIcon size={18} color="white" />}
                    {demoQuestions[demoStep].category === 'Social' && <UsersIcon size={18} color="white" />}
                    {demoQuestions[demoStep].category === 'Governança' && <ShieldIcon size={18} color="white" />}
                    {demoQuestions[demoStep].category}
                  </div>

                  {/* Question */}
                  <h3 className="text-2xl font-black mb-8" style={{ color: '#152F27' }}>
                    {demoQuestions[demoStep].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {demoQuestions[demoStep].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleDemoAnswer(index)}
                        className="w-full p-4 rounded-xl border-2 text-left font-semibold transition-all hover:border-green-600 hover:bg-green-50"
                        style={{ borderColor: '#e0e0e0', color: '#152F27' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: '#f0f0f0', color: '#152F27' }}
                          >
                            {index + 1}
                          </div>
                          {option}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Result */
                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: getDemoLevel().color + '30', border: `4px solid ${getDemoLevel().color}` }}
                  >
                    <span className="text-5xl font-black" style={{ color: getDemoLevel().color }}>
                      {getDemoScore()}%
                    </span>
                  </div>

                  <h3 className="text-3xl font-black mb-2" style={{ color: getDemoLevel().color }}>
                    Nível {getDemoLevel().level}
                  </h3>
                  <p className="text-xl font-semibold text-gray-600 mb-6">
                    {getDemoLevel().title}
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <p className="text-gray-700 leading-relaxed">
                      Este foi apenas um diagnóstico demonstrativo com 6 perguntas.
                      O diagnóstico completo possui <strong className="text-green-700">215 questões</strong> que
                      avaliam detalhadamente todos os aspectos ESG da sua empresa.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={resetDemo}
                      className="flex-1 py-4 rounded-xl border-2 font-bold transition-all hover:bg-gray-50"
                      style={{ borderColor: '#152F27', color: '#152F27' }}
                    >
                      Fechar
                    </button>
                    <Link
                      to="/register"
                      onClick={resetDemo}
                      className="flex-1 py-4 rounded-xl font-bold text-white text-center transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                    >
                      Fazer Diagnóstico Completo
                    </Link>
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
