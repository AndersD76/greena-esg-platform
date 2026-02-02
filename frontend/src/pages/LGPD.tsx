import { Link } from 'react-router-dom';

export default function LGPD() {
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
          <h1 className="text-5xl font-black mb-4">LGPD</h1>
          <p className="text-xl opacity-90">Lei Geral de Proteção de Dados</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-8">
              <h3 className="text-lg font-bold text-green-800 mb-2">Nosso Compromisso</h3>
              <p className="text-green-700">
                A GREENA está em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                Tratamos seus dados com transparência, segurança e respeito aos seus direitos.
              </p>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>O que é a LGPD?</h2>
            <p className="text-gray-700 mb-6">
              A Lei Geral de Proteção de Dados (LGPD) é a legislação brasileira que regula o tratamento de
              dados pessoais. Ela estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento
              de dados pessoais, garantindo maior proteção e transparência.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Seus Direitos como Titular</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { title: 'Acesso', desc: 'Solicitar cópia de todos os seus dados pessoais' },
                { title: 'Correção', desc: 'Corrigir dados incompletos, inexatos ou desatualizados' },
                { title: 'Eliminação', desc: 'Solicitar a exclusão de dados desnecessários' },
                { title: 'Portabilidade', desc: 'Transferir seus dados para outro fornecedor' },
                { title: 'Revogação', desc: 'Revogar o consentimento a qualquer momento' },
                { title: 'Informação', desc: 'Saber com quem seus dados são compartilhados' }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-bold mb-1" style={{ color: '#152F27' }}>{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Bases Legais para Tratamento</h2>
            <p className="text-gray-700 mb-4">
              Tratamos seus dados com base nas seguintes hipóteses legais da LGPD:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Consentimento:</strong> Para marketing e comunicações promocionais</li>
              <li><strong>Execução de contrato:</strong> Para prestação dos serviços de avaliação ESG</li>
              <li><strong>Legítimo interesse:</strong> Para melhoria dos serviços e segurança</li>
              <li><strong>Cumprimento de obrigação legal:</strong> Para atender exigências regulatórias</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Encarregado de Dados (DPO)</h2>
            <p className="text-gray-700 mb-4">
              A GREENA possui um Encarregado de Proteção de Dados responsável por:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Receber reclamações e comunicações dos titulares</li>
              <li>Orientar funcionários sobre práticas de proteção de dados</li>
              <li>Interagir com a Autoridade Nacional de Proteção de Dados (ANPD)</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Como Exercer seus Direitos</h2>
            <p className="text-gray-700 mb-4">
              Para exercer qualquer um dos seus direitos, entre em contato através dos canais abaixo.
              Responderemos sua solicitação em até 15 dias úteis.
            </p>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="font-bold mb-4" style={{ color: '#152F27' }}>Canal de Atendimento LGPD</h4>
              <p className="text-gray-700 mb-2"><strong>E-mail:</strong> lgpd@greenasolucoes.com.br</p>
              <p className="text-gray-700 mb-2"><strong>Telefone:</strong> (54) 99189-7645</p>
              <p className="text-gray-700"><strong>Horário:</strong> Segunda a Sexta, 9h às 18h</p>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Segurança da Informação</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas técnicas e administrativas para proteger seus dados:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border-2 border-gray-100 p-4 rounded-xl text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h4 className="font-bold mb-1" style={{ color: '#152F27' }}>Criptografia</h4>
                <p className="text-sm text-gray-600">Dados protegidos em transito e repouso</p>
              </div>
              <div className="bg-white border-2 border-gray-100 p-4 rounded-xl text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h4 className="font-bold mb-1" style={{ color: '#152F27' }}>Firewall</h4>
                <p className="text-sm text-gray-600">Protecao contra acessos nao autorizados</p>
              </div>
              <div className="bg-white border-2 border-gray-100 p-4 rounded-xl text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h4 className="font-bold mb-1" style={{ color: '#152F27' }}>Auditoria</h4>
                <p className="text-sm text-gray-600">Logs de acesso e monitoramento continuo</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Mais Informações</h3>
              <p className="text-blue-700">
                Para informações completas sobre como tratamos seus dados, consulte nossa{' '}
                <Link to="/privacy" className="underline font-bold">Política de Privacidade</Link>.
              </p>
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
