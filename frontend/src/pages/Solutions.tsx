import { Link } from 'react-router-dom';

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-14" />
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/#sobre" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Sobre
              </Link>
              <Link to="/#pilares" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Pilares ESG
              </Link>
              <Link to="/about" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Quem Somos
              </Link>
              <Link to="/contact" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Contato
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Acessar Plataforma
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #152F27 0%, #2d5a45 100%)' }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center text-white">
            <h1 className="text-6xl font-black mb-6">Nossas Soluções</h1>
            <p className="text-2xl opacity-90 max-w-3xl mx-auto">
              Plataforma completa para gestão e certificação ESG da sua empresa
            </p>
          </div>
        </div>
      </section>

      {/* Main Solutions */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Platform Assessment */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#7B9965' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>
                Plataforma de Avaliação ESG
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Questionário especializado com 215 questões estruturadas que avaliam todos os aspectos
                das práticas ambientais, sociais e de governança da sua organização.
              </p>
              <ul className="space-y-3">
                {[
                  'Avaliação completa dos 3 pilares ESG',
                  'Pontuação detalhada por categoria',
                  'Benchmarking setorial',
                  'Identificação de gaps e oportunidades',
                  'Interface intuitiva e responsiva'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2" className="flex-shrink-0 mt-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consulting */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#924131' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>
                Consultoria Especializada
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Time de especialistas em sustentabilidade com mais de 20 anos de experiência
                para orientar sua empresa na jornada ESG.
              </p>
              <ul className="space-y-3">
                {[
                  'Análise estratégica personalizada',
                  'Plano de ação detalhado',
                  'Acompanhamento de implementação',
                  'Treinamento de equipes',
                  'Suporte contínuo'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#924131" strokeWidth="2" className="flex-shrink-0 mt-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certification */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#152F27' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>
                Sistema de Certificação
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Certificações Bronze, Prata e Ouro que validam o nível de maturidade ESG
                da sua empresa perante o mercado e stakeholders.
              </p>
              <ul className="space-y-3">
                {[
                  'Certificado digital verificável',
                  'Selo para uso em materiais institucionais',
                  'Relatório completo de maturidade',
                  'Acesso a benefícios exclusivos',
                  'Reconhecimento público'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#152F27" strokeWidth="2" className="flex-shrink-0 mt-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#EFD4A8' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#152F27" strokeWidth="2">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="16"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>
                Relatórios e Analytics
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Dashboards inteligentes e relatórios personalizados para acompanhar
                a evolução das suas práticas ESG ao longo do tempo.
              </p>
              <ul className="space-y-3">
                {[
                  'Visualizações interativas de dados',
                  'Métricas de progresso em tempo real',
                  'Comparativos históricos',
                  'Relatórios para stakeholders',
                  'Exportação de dados'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2" className="flex-shrink-0 mt-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black mb-6 text-center" style={{ color: '#152F27' }}>
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Processo simples e eficiente para transformar a gestão ESG da sua empresa
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Cadastro',
                description: 'Crie sua conta gratuitamente e configure o perfil da sua empresa',
                color: '#7B9965'
              },
              {
                step: '02',
                title: 'Avaliação',
                description: 'Responda o questionário ESG completo no seu próprio ritmo',
                color: '#924131'
              },
              {
                step: '03',
                title: 'Resultados',
                description: 'Receba análise detalhada com pontuação e insights acionáveis',
                color: '#152F27'
              },
              {
                step: '04',
                title: 'Certificação',
                description: 'Obtenha sua certificação e acesso a benefícios exclusivos',
                color: '#EFD4A8'
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-black" style={{ backgroundColor: item.color }}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-black mb-3" style={{ color: '#152F27' }}>
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
                {i < 3 && (
                  <svg className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 px-6" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black mb-6 text-center" style={{ color: '#152F27' }}>
            Setores Atendidos
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Metodologia adaptável para diferentes segmentos de mercado
          </p>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: 'Indústria', icon: 'M3 21h18M9 8l3 3m0 0l3-3m-3 3V3m-6 18h12' },
              { name: 'Varejo', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
              { name: 'Tecnologia', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { name: 'Financeiro', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { name: 'Saúde', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
              { name: 'Educação', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
              { name: 'Construção', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { name: 'Agronegócio', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' }
            ].map((industry, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#7B996520' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                    <path d={industry.icon}/>
                  </svg>
                </div>
                <h3 className="text-lg font-black" style={{ color: '#152F27' }}>{industry.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl font-black mb-6">Pronto para Começar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Cadastre-se gratuitamente e inicie sua jornada de transformação ESG hoje mesmo
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 bg-white text-xl font-black rounded-xl transition-all hover:scale-105 shadow-lg"
            style={{ color: '#152F27' }}
          >
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p className="text-sm">© 2025 GREENA ESG Platform. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
