import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface ManualSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
    image?: string;
  }[];
}

const sections: ManualSection[] = [
  {
    id: 'cadastro',
    title: 'Cadastro e Login',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    color: '#7B9965',
    steps: [
      {
        title: 'Criar sua conta',
        description: 'Acesse a plataforma e clique em "Cadastro". Preencha nome, e-mail, senha e os dados da sua empresa (nome, CNPJ, setor e porte).',
        tip: 'Use o e-mail corporativo para facilitar a identificacao da empresa.'
      },
      {
        title: 'Fazer login',
        description: 'Na pagina de login, insira seu e-mail e senha cadastrados. Voce sera redirecionado automaticamente para o Dashboard.',
      },
      {
        title: 'Escolher um plano',
        description: 'Apos o cadastro, voce inicia no plano Demo (gratuito) com 6 perguntas. Para o diagnostico completo com 215 perguntas, assine um dos planos pagos (Start, Grow ou Impact).',
        tip: 'O plano Grow e o mais escolhido pois inclui certificacao ESG e 2h de consultoria.'
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    color: '#152F27',
    steps: [
      {
        title: 'Visao geral do score ESG',
        description: 'O Dashboard exibe seu score ESG geral em um grafico circular (gauge), alem dos scores individuais de cada pilar: Ambiental, Social e Governanca.',
      },
      {
        title: 'Grafico Radar',
        description: 'Visualize a distribuicao da sua performance nos 3 pilares ESG em um grafico radar interativo, permitindo identificar rapidamente areas fortes e fracas.',
      },
      {
        title: 'Benchmarking setorial',
        description: 'Compare sua pontuacao com a media do seu setor para entender como sua empresa se posiciona em relacao a concorrencia.',
        tip: 'Use o benchmarking para definir prioridades de melhoria.'
      },
      {
        title: 'Historico de diagnosticos',
        description: 'Acompanhe a evolucao da sua empresa ao longo do tempo com graficos de linha mostrando a progressao dos seus diagnosticos anteriores.',
      },
      {
        title: 'Certificacao',
        description: 'Ao concluir um diagnostico, voce recebe uma certificacao ESG (Bronze, Prata ou Ouro) baseada na sua pontuacao. O certificado pode ser baixado e compartilhado.',
      }
    ]
  },
  {
    id: 'diagnostico',
    title: 'Diagnostico ESG',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: '#7B9965',
    steps: [
      {
        title: 'Iniciar novo diagnostico',
        description: 'Clique em "Novo Diagnostico" no menu superior. O sistema criara automaticamente um novo diagnostico e redirecionara para o questionario adequado ao seu plano.',
      },
      {
        title: 'Responder o questionario',
        description: 'O diagnostico completo possui 215 perguntas divididas em 3 pilares (Ambiental, Social, Governanca) e 14 temas. Cada pergunta utiliza uma escala de maturidade de 6 niveis.',
        tip: 'Voce pode salvar e continuar depois. O progresso e salvo automaticamente.'
      },
      {
        title: 'Escala de maturidade',
        description: 'As respostas seguem uma escala: N/A (nao aplicavel), Nao iniciado, Planejado, Em andamento, Parcialmente implementado e Totalmente implementado. Quanto maior a maturidade, maior a pontuacao.',
      },
      {
        title: 'Observacoes',
        description: 'Cada pergunta possui um campo opcional de observacoes onde voce pode detalhar acoes ja realizadas ou evidencias que justifiquem sua resposta.',
        tip: 'Adicionar observacoes enriquece o relatorio e facilita a consultoria.'
      },
      {
        title: 'Acompanhar progresso',
        description: 'Uma barra de progresso no topo indica quantas perguntas ja foram respondidas. Navegue livremente entre as perguntas usando os botoes de navegacao.',
      }
    ]
  },
  {
    id: 'resultados',
    title: 'Resultados e Relatorios',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: '#924131',
    steps: [
      {
        title: 'Pagina de resultados',
        description: 'Ao finalizar o questionario, voce e redirecionado para a pagina de resultados com o score geral, breakdown por pilar e insights iniciais.',
      },
      {
        title: 'Relatorios detalhados',
        description: 'Na aba "Relatorios" do menu, acesse analises detalhadas com graficos de barras por tema, radar por pilar e comparativos historicos.',
        tip: 'Exporte os relatorios em PDF para apresentacoes e reunioes.'
      },
      {
        title: 'Relatorio para stakeholders',
        description: 'Gere um relatorio formatado especialmente para compartilhar com investidores, parceiros e stakeholders externos, com visual profissional.',
      },
      {
        title: 'Niveis de certificacao',
        description: 'Bronze (0-39 pontos): Compromisso ESG inicial. Prata (40-69 pontos): Integracao ESG em andamento. Ouro (70-100 pontos): Lideranca ESG consolidada.',
      }
    ]
  },
  {
    id: 'planos-acao',
    title: 'Planos de Acao (Insights)',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: '#b8963a',
    steps: [
      {
        title: 'Insights automaticos',
        description: 'Apos o diagnostico, o sistema gera automaticamente planos de acao priorizados com base nas suas respostas, identificando as areas com maior potencial de melhoria.',
      },
      {
        title: 'Filtrar por pilar e prioridade',
        description: 'Use os filtros para visualizar planos de acao por pilar (E, S ou G), nivel de prioridade (alta, media, baixa) e status de implementacao.',
      },
      {
        title: 'Simulacao de impacto',
        description: 'Veja como a implementacao de cada acao impactaria seu score ESG, ajudando a priorizar investimentos e esforcos.',
        tip: 'Foque nas acoes de alta prioridade com maior impacto no score.'
      },
      {
        title: 'Acompanhar status',
        description: 'Atualize o status de cada acao (pendente, em andamento, concluido) para acompanhar o progresso da implementacao.',
      }
    ]
  },
  {
    id: 'consultoria',
    title: 'Consultoria ESG',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: '#152F27',
    steps: [
      {
        title: 'Horas disponiveis',
        description: 'As horas de consultoria dependem do seu plano: Grow inclui 2h/mes e Impact inclui 4h/mes. Demo e Start nao incluem consultoria.',
      },
      {
        title: 'Agendar sessao',
        description: 'Acesse "Consultorias" no menu, visualize os horarios disponiveis e agende uma sessao com nosso especialista ESG.',
        tip: 'Agende com antecedencia para garantir o melhor horario.'
      },
      {
        title: 'Sala de consultoria',
        description: 'No horario agendado, acesse a sala virtual de consultoria para a sessao por video com o especialista. Tenha seu relatorio aberto para discussao.',
      }
    ]
  },
  {
    id: 'perfil',
    title: 'Perfil e Configuracoes',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    color: '#7B9965',
    steps: [
      {
        title: 'Dados da empresa',
        description: 'Edite informacoes da empresa como nome, CNPJ, setor de atuacao e porte. Esses dados sao usados para benchmarking setorial.',
      },
      {
        title: 'Perfil publico',
        description: 'Ative o perfil publico para que sua empresa seja visivel com o selo ESG. Outras empresas e stakeholders poderao ver sua performance.',
        tip: 'Um perfil publico com selo Ouro agrega valor a imagem da empresa.'
      },
      {
        title: 'Gerenciar assinatura',
        description: 'Visualize seu plano atual, uso de recursos e faca upgrade para desbloquear mais funcionalidades como consultoria e certificacao.',
      }
    ]
  }
];

export default function UserManual() {
  const [activeSection, setActiveSection] = useState('cadastro');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const currentSection = sections.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Manual do Usuario"
        description="Guia completo de como usar a plataforma engreena ESG. Aprenda todas as funcionalidades passo a passo."
        url="/manual"
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-12" />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Voltar ao inicio
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90" style={{ backgroundColor: '#152F27' }}>
                Cadastro
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6" style={{ backgroundColor: '#f5ffeb' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: '#e2f7d0', color: '#152F27' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Manual do Usuario
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#152F27' }}>
            Como usar a plataforma engreena
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Guia completo com todas as funcionalidades. Navegue pelas secoes abaixo para aprender a usar cada recurso.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[280px_1fr] gap-10">
            {/* Sidebar navigation */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-3">Secoes</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => { setActiveSection(section.id); setExpandedStep(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={activeSection === section.id ? { backgroundColor: section.color } : undefined}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                    </svg>
                    {section.title}
                  </button>
                ))}
              </nav>

              {/* Quick access box */}
              <div className="mt-8 p-5 rounded-2xl border border-gray-100 bg-gray-50">
                <h4 className="text-sm font-semibold mb-3" style={{ color: '#152F27' }}>Acesso rapido</h4>
                <div className="space-y-2">
                  <Link to="/register" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Criar conta gratuita
                  </Link>
                  <Link to="/login" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Fazer login
                  </Link>
                  <Link to="/contact" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Falar com suporte
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: currentSection.color + '15' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={currentSection.color} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={currentSection.icon} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: '#152F27' }}>{currentSection.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{currentSection.steps.length} passos nesta secao</p>
                </div>
              </div>

              <div className="space-y-4">
                {currentSection.steps.map((step, index) => {
                  const stepKey = `${activeSection}-${index}`;
                  const isExpanded = expandedStep === stepKey;

                  return (
                    <div
                      key={index}
                      className={`rounded-2xl border-2 transition-all overflow-hidden ${
                        isExpanded ? 'shadow-md' : 'hover:shadow-sm'
                      }`}
                      style={{ borderColor: isExpanded ? currentSection.color + '40' : '#f3f4f6' }}
                    >
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : stepKey)}
                        className="w-full flex items-center gap-4 p-5 text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                          style={{ backgroundColor: currentSection.color }}
                        >
                          {index + 1}
                        </div>
                        <h3 className="flex-1 text-lg font-semibold" style={{ color: '#152F27' }}>
                          {step.title}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="ml-14">
                            <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>
                            {step.tip && (
                              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#f5ffeb' }}>
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="#7B9965" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <p className="text-sm font-medium" style={{ color: '#152F27' }}>
                                  <span className="font-bold">Dica:</span> {step.tip}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation between sections */}
              <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-100">
                {sections.findIndex(s => s.id === activeSection) > 0 ? (
                  <button
                    onClick={() => {
                      const idx = sections.findIndex(s => s.id === activeSection);
                      setActiveSection(sections[idx - 1].id);
                      setExpandedStep(null);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    {sections[sections.findIndex(s => s.id === activeSection) - 1].title}
                  </button>
                ) : <div />}
                {sections.findIndex(s => s.id === activeSection) < sections.length - 1 ? (
                  <button
                    onClick={() => {
                      const idx = sections.findIndex(s => s.id === activeSection);
                      setActiveSection(sections[idx + 1].id);
                      setExpandedStep(null);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: '#152F27' }}
                  >
                    {sections[sections.findIndex(s => s.id === activeSection) + 1].title}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ) : <div />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: '#152F27' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para comecar?</h2>
          <p className="text-lg text-white/70 mb-8">Crie sua conta gratuita e faca seu primeiro diagnostico ESG agora mesmo.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-3.5 text-sm font-semibold rounded-full text-white transition-all hover:opacity-90" style={{ backgroundColor: '#7B9965' }}>
              Criar conta gratuita
            </Link>
            <Link to="/" className="px-8 py-3.5 text-sm font-semibold rounded-full border-2 border-white/30 text-white transition-all hover:bg-white/10">
              Voltar ao inicio
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">&copy; 2025 engreena ESG Platform. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
