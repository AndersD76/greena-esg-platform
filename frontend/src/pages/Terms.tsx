import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-14" />
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
          <h1 className="text-5xl font-black mb-4">Termos de Uso</h1>
          <p className="text-xl opacity-90">Última atualização: Janeiro de 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>1. Aceitação dos Termos</h2>
            <p className="text-gray-700 mb-6">
              Ao acessar e usar a plataforma GREENA ESG, você concorda com estes Termos de Uso.
              Se você não concordar com qualquer parte destes termos, não poderá acessar nossos serviços.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>2. Descrição do Serviço</h2>
            <p className="text-gray-700 mb-6">
              A GREENA oferece uma plataforma de avaliação e gestão ESG (Environmental, Social, Governance) que inclui:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Questionários de diagnóstico ESG com 215 questões</li>
              <li>Relatórios detalhados de performance</li>
              <li>Certificação ESG em três níveis (Bronze, Prata, Ouro)</li>
              <li>Dashboard de acompanhamento de indicadores</li>
              <li>Consultoria especializada (conforme plano contratado)</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>3. Cadastro e Conta</h2>
            <p className="text-gray-700 mb-6">
              Para utilizar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações precisas e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>4. Planos e Pagamentos</h2>
            <p className="text-gray-700 mb-4">
              Oferecemos diferentes planos de assinatura:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Teste Grátis (Demo):</strong> Acesso limitado para conhecer a plataforma</li>
              <li><strong>Start:</strong> R$ 49,00/mês</li>
              <li><strong>Grow:</strong> R$ 99,00/mês</li>
              <li><strong>Impact:</strong> R$ 159,00/mês</li>
            </ul>
            <p className="text-gray-700 mb-6">
              Os pagamentos são processados mensalmente. Você pode cancelar sua assinatura a qualquer momento,
              e o acesso permanecerá ativo até o final do período pago.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>5. Uso Aceitável</h2>
            <p className="text-gray-700 mb-4">
              Você concorda em não:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Usar a plataforma para fins ilegais ou não autorizados</li>
              <li>Fornecer informações falsas nos questionários de diagnóstico</li>
              <li>Compartilhar sua conta com terceiros</li>
              <li>Tentar acessar áreas restritas do sistema</li>
              <li>Copiar, modificar ou distribuir conteúdo da plataforma</li>
            </ul>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>6. Propriedade Intelectual</h2>
            <p className="text-gray-700 mb-6">
              Todo o conteúdo da plataforma, incluindo metodologia de avaliação, questionários, relatórios
              e materiais de suporte, são propriedade da GREENA ou de seus licenciadores. O uso da plataforma
              não transfere nenhum direito de propriedade intelectual.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>7. Certificação ESG</h2>
            <p className="text-gray-700 mb-6">
              A certificação ESG GREENA é baseada nas respostas fornecidas pelo usuário. A GREENA não se
              responsabiliza por informações incorretas ou fraudulentas. A certificação é válida por 12 meses
              e pode ser revogada em caso de descumprimento destes termos.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 mb-6">
              A GREENA não será responsável por danos indiretos, incidentais ou consequentes resultantes do
              uso ou impossibilidade de uso da plataforma. Nossa responsabilidade total está limitada ao valor
              pago pelo usuário nos últimos 12 meses.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>9. Modificações</h2>
            <p className="text-gray-700 mb-6">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas
              serão comunicadas por e-mail ou através da plataforma com antecedência de 30 dias.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>10. Contato</h2>
            <p className="text-gray-700 mb-6">
              Para dúvidas sobre estes termos:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <p className="text-gray-700"><strong>E-mail:</strong> contato@greenasolucoes.com.br</p>
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
