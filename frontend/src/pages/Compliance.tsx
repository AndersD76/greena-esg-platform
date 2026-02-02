import { Link } from 'react-router-dom';

export default function Compliance() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-14" />
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

      {/* Hero */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl font-black mb-4">Compliance</h1>
          <p className="text-xl opacity-90">Nosso compromisso com ética e conformidade</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <svg className="w-10 h-10 mx-auto mb-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <h3 className="font-black text-xl mb-2" style={{ color: '#152F27' }}>Etica</h3>
                <p className="text-gray-600">Conduzimos nossos negocios com integridade e transparencia</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <svg className="w-10 h-10 mx-auto mb-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="font-black text-xl mb-2" style={{ color: '#152F27' }}>Seguranca</h3>
                <p className="text-gray-600">Protegemos dados e informacoes de nossos clientes</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <svg className="w-10 h-10 mx-auto mb-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-black text-xl mb-2" style={{ color: '#152F27' }}>Sustentabilidade</h3>
                <p className="text-gray-600">Praticamos o que pregamos em ESG</p>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Programa de Compliance</h2>
            <p className="text-gray-700 mb-6">
              A GREENA mantém um robusto programa de compliance que abrange todas as áreas de nossa operação.
              Nosso compromisso é garantir que todas as atividades estejam em conformidade com as leis,
              regulamentos e melhores práticas do mercado.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Pilares do Nosso Compliance</h2>

            <div className="space-y-6 mb-8">
              <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#7B9965' }}>
                <h3 className="font-bold text-xl mb-2" style={{ color: '#152F27' }}>1. Código de Ética e Conduta</h3>
                <p className="text-gray-700">
                  Documento que estabelece os princípios e valores que norteiam nossas ações e decisões.
                  Todos os colaboradores e parceiros devem conhecer e seguir este código.
                </p>
              </div>

              <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#7B9965' }}>
                <h3 className="font-bold text-xl mb-2" style={{ color: '#152F27' }}>2. Política Anticorrupção</h3>
                <p className="text-gray-700">
                  Temos tolerância zero para qualquer forma de corrupção, suborno ou práticas antiéticas.
                  Nossa política está alinhada com a Lei Anticorrupção (Lei 12.846/2013).
                </p>
              </div>

              <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#7B9965' }}>
                <h3 className="font-bold text-xl mb-2" style={{ color: '#152F27' }}>3. Proteção de Dados</h3>
                <p className="text-gray-700">
                  Conformidade total com a LGPD (Lei Geral de Proteção de Dados) e melhores práticas
                  internacionais de proteção de informações pessoais.
                </p>
              </div>

              <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#7B9965' }}>
                <h3 className="font-bold text-xl mb-2" style={{ color: '#152F27' }}>4. Gestão de Riscos</h3>
                <p className="text-gray-700">
                  Identificação, avaliação e mitigação contínua de riscos operacionais, financeiros,
                  regulatórios e reputacionais.
                </p>
              </div>

              <div className="border-l-4 pl-6 py-2" style={{ borderColor: '#7B9965' }}>
                <h3 className="font-bold text-xl mb-2" style={{ color: '#152F27' }}>5. Due Diligence</h3>
                <p className="text-gray-700">
                  Avaliação rigorosa de parceiros, fornecedores e clientes para garantir que compartilham
                  nossos valores éticos e de compliance.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Canal de Denúncias</h2>
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl mb-8">
              <h3 className="font-bold text-xl mb-4 text-red-800">Reporte Irregularidades</h3>
              <p className="text-red-700 mb-4">
                Se você identificar qualquer conduta irregular, antiética ou ilegal, denuncie através
                do nosso canal confidencial. Garantimos sigilo absoluto e proteção contra retaliação.
              </p>
              <div className="space-y-2">
                <p className="text-red-700"><strong>E-mail:</strong> denuncia@greenasolucoes.com.br</p>
                <p className="text-red-700"><strong>Telefone:</strong> 0800 123 4567 (24h)</p>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Certificações e Reconhecimentos</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { title: 'ISO 27001', desc: 'Sistema de Gestão de Segurança da Informação' },
                { title: 'ISO 9001', desc: 'Sistema de Gestão da Qualidade' },
                { title: 'LGPD Compliant', desc: 'Conformidade com a Lei Geral de Proteção de Dados' },
                { title: 'ESG Rating A', desc: 'Avaliação ESG própria nível Ouro' }
              ].map((cert, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7B996520' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B9965" strokeWidth="2">
                      <circle cx="12" cy="8" r="7"/>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ color: '#152F27' }}>{cert.title}</h4>
                    <p className="text-sm text-gray-600">{cert.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Treinamento e Conscientização</h2>
            <p className="text-gray-700 mb-6">
              Todos os colaboradores da GREENA passam por treinamentos regulares sobre:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Código de Ética e Conduta</li>
              <li>Prevenção à Lavagem de Dinheiro</li>
              <li>Proteção de Dados e Privacidade</li>
              <li>Segurança da Informação</li>
              <li>Práticas Anticorrupção</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Contato do Compliance</h2>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-700 mb-2"><strong>Responsável:</strong> Comitê de Compliance GREENA</p>
              <p className="text-gray-700 mb-2"><strong>E-mail:</strong> compliance@greenasolucoes.com.br</p>
              <p className="text-gray-700"><strong>Telefone:</strong> (54) 99189-7645</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p className="text-sm">© 2025 GREENA ESG Platform. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
