import { Link } from 'react-router-dom';

export default function Privacy() {
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
          <h1 className="text-5xl font-black mb-4">Política de Privacidade</h1>
          <p className="text-xl opacity-90">Última atualização: Janeiro de 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>1. Introdução</h2>
            <p className="text-gray-700 mb-6">
              A GREENA Soluções em Sustentabilidade ("nós", "nosso" ou "GREENA") está comprometida em proteger sua privacidade.
              Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você
              utiliza nossa plataforma ESG.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>2. Informações que Coletamos</h2>
            <p className="text-gray-700 mb-4">Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Dados de Cadastro:</strong> Nome, e-mail, telefone, empresa, cargo</li>
              <li><strong>Dados da Empresa:</strong> CNPJ, setor de atuação, porte, localização</li>
              <li><strong>Dados de Diagnóstico ESG:</strong> Respostas aos questionários, documentos enviados</li>
              <li><strong>Dados de Uso:</strong> Páginas acessadas, tempo de uso, interações na plataforma</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, dispositivo</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>3. Como Usamos suas Informações</h2>
            <p className="text-gray-700 mb-4">Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Fornecer e manter nossos serviços de avaliação ESG</li>
              <li>Gerar relatórios e certificações ESG personalizados</li>
              <li>Melhorar e personalizar sua experiência na plataforma</li>
              <li>Enviar comunicações sobre sua conta e nossos serviços</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>4. Compartilhamento de Dados</h2>
            <p className="text-gray-700 mb-6">
              Não vendemos suas informações pessoais. Podemos compartilhar dados com:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Prestadores de Serviço:</strong> Empresas que nos auxiliam na operação da plataforma</li>
              <li><strong>Parceiros de Certificação:</strong> Quando você solicita certificação ESG</li>
              <li><strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>5. Segurança dos Dados</h2>
            <p className="text-gray-700 mb-6">
              Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e plano de recuperação</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>6. Seus Direitos</h2>
            <p className="text-gray-700 mb-4">
              De acordo com a LGPD, você tem direito a:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar seu consentimento</li>
              <li>Solicitar a portabilidade de seus dados</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>7. Retenção de Dados</h2>
            <p className="text-gray-700 mb-6">
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprir
              obrigações legais. Após o encerramento da conta, os dados são mantidos por até 5 anos
              para fins de auditoria e compliance.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>8. Contato</h2>
            <p className="text-gray-700 mb-6">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <p className="text-gray-700"><strong>E-mail:</strong> privacidade@greenasolucoes.com.br</p>
              <p className="text-gray-700"><strong>Telefone:</strong> (54) 99189-7645</p>
              <p className="text-gray-700"><strong>Endereço:</strong> UPF Parque Científico e Tecnológico, Passo Fundo/RS</p>
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
