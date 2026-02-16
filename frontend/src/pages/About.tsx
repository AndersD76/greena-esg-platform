import { Link } from 'react-router-dom';

export default function About() {
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
              <Link to="/solutions" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Soluções
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
            <h1 className="text-6xl font-black mb-6">Sobre a GREENA</h1>
            <p className="text-2xl opacity-90 max-w-3xl mx-auto">
              Transformando empresas através de práticas ESG sustentáveis e responsáveis
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#7B9965' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>Missão</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Capacitar empresas a alcançar excelência em sustentabilidade através de avaliações precisas,
                insights acionáveis e acompanhamento contínuo das práticas ESG.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#924131' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>Visão</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Ser a plataforma ESG mais confiável e inovadora do Brasil,
                reconhecida por impulsionar transformações positivas nas organizações.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#152F27' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black mb-4" style={{ color: '#152F27' }}>Valores</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Transparência, excelência técnica, compromisso com resultados sustentáveis e
                parcerias de longo prazo baseadas em confiança mútua.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-black mb-12 text-center" style={{ color: '#152F27' }}>Nossa História</h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#7B9965' }}></div>
              <div>
                <h3 className="text-2xl font-black mb-3" style={{ color: '#152F27' }}>Origem</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  A GREENA nasceu da visão de especialistas em sustentabilidade com mais de 20 anos de experiência
                  em consultoria ESG. Percebemos a necessidade de democratizar o acesso a avaliações de qualidade
                  e criar ferramentas que realmente impulsionem mudanças concretas.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#924131' }}></div>
              <div>
                <h3 className="text-2xl font-black mb-3" style={{ color: '#152F27' }}>Metodologia</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Desenvolvemos uma metodologia proprietária baseada em frameworks internacionais como GRI, SASB e ODS,
                  adaptada à realidade brasileira. Nosso questionário com 215 questões especializadas cobre todos os
                  aspectos relevantes das práticas ESG.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#152F27' }}></div>
              <div>
                <h3 className="text-2xl font-black mb-3" style={{ color: '#152F27' }}>Impacto</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Desde nossa fundação, já auxiliamos mais de 500 empresas em sua jornada ESG,
                  contribuindo para a redução de mais de 1 milhão de toneladas de CO₂ e impactando
                  positivamente milhares de colaboradores e comunidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black mb-6 text-center" style={{ color: '#152F27' }}>Nossa Equipe</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Profissionais especializados em sustentabilidade, tecnologia e gestão empresarial
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { area: 'Consultoria ESG', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { area: 'Tecnologia', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { area: 'Análise de Dados', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { area: 'Suporte', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' }
            ].map((member, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#7B996520' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                    <path d={member.icon}/>
                  </svg>
                </div>
                <h3 className="text-xl font-black" style={{ color: '#152F27' }}>{member.area}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl font-black mb-6">Vamos Transformar Juntos?</h2>
          <p className="text-xl mb-8 opacity-90">
            Faça parte da revolução ESG e leve sua empresa ao próximo nível de sustentabilidade
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 bg-white text-xl font-black rounded-xl transition-all hover:scale-105 shadow-lg"
            style={{ color: '#152F27' }}
          >
            Começar Agora
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
