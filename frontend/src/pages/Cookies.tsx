import { Link } from 'react-router-dom';

export default function Cookies() {
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
          <h1 className="text-5xl font-black mb-4">Política de Cookies</h1>
          <p className="text-xl opacity-90">Como utilizamos cookies em nossa plataforma</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>O que são Cookies?</h2>
            <p className="text-gray-700 mb-6">
              Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site.
              Eles ajudam o site a lembrar suas preferências e melhorar sua experiência de navegação.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Tipos de Cookies que Utilizamos</h2>

            <div className="space-y-4 mb-8">
              <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b">
                  <h3 className="font-bold text-lg" style={{ color: '#152F27' }}>Cookies Essenciais</h3>
                  <span className="text-sm text-green-600 font-semibold">Sempre ativos</span>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-700 mb-2">
                    Necessários para o funcionamento básico da plataforma. Sem eles, você não conseguiria
                    fazer login ou usar recursos essenciais.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Autenticação de sessão</li>
                    <li>• Segurança e prevenção de fraudes</li>
                    <li>• Preferências de idioma</li>
                  </ul>
                </div>
              </div>

              <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b">
                  <h3 className="font-bold text-lg" style={{ color: '#152F27' }}>Cookies de Desempenho</h3>
                  <span className="text-sm text-blue-600 font-semibold">Opcionais</span>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-700 mb-2">
                    Nos ajudam a entender como você usa a plataforma para melhorar sua experiência.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Analytics</li>
                    <li>• Tempo de carregamento de páginas</li>
                    <li>• Erros e problemas técnicos</li>
                  </ul>
                </div>
              </div>

              <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b">
                  <h3 className="font-bold text-lg" style={{ color: '#152F27' }}>Cookies de Funcionalidade</h3>
                  <span className="text-sm text-purple-600 font-semibold">Opcionais</span>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-700 mb-2">
                    Permitem recursos aprimorados e personalização.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Preferências de exibição</li>
                    <li>• Configurações do dashboard</li>
                    <li>• Histórico de navegação interno</li>
                  </ul>
                </div>
              </div>

              <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-orange-50 px-6 py-4 border-b">
                  <h3 className="font-bold text-lg" style={{ color: '#152F27' }}>Cookies de Marketing</h3>
                  <span className="text-sm text-orange-600 font-semibold">Opcionais</span>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-700 mb-2">
                    Usados para exibir anúncios relevantes e medir a eficácia de campanhas.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Facebook Pixel</li>
                    <li>• Google Ads</li>
                    <li>• LinkedIn Insights</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Como Gerenciar Cookies</h2>
            <p className="text-gray-700 mb-4">
              Você pode gerenciar suas preferências de cookies de várias formas:
            </p>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="font-bold mb-4" style={{ color: '#152F27' }}>Configurações do Navegador</h4>
              <p className="text-gray-700 mb-4">
                A maioria dos navegadores permite controlar cookies através das configurações:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
                <li><strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies</li>
                <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
                <li><strong>Edge:</strong> Configurações → Privacidade → Cookies</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-8">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Atenção</h3>
              <p className="text-yellow-700">
                Desativar cookies essenciais pode impedir o funcionamento correto da plataforma.
                Você pode não conseguir fazer login ou acessar algumas funcionalidades.
              </p>
            </div>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Cookies de Terceiros</h2>
            <p className="text-gray-700 mb-6">
              Alguns cookies são definidos por serviços de terceiros que aparecem em nossas páginas.
              Não temos controle sobre esses cookies. Consulte as políticas de privacidade desses serviços
              para mais informações.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Atualizações desta Política</h2>
            <p className="text-gray-700 mb-6">
              Podemos atualizar esta política periodicamente. A data da última atualização será sempre
              indicada no topo da página. Recomendamos que você revise esta política regularmente.
            </p>

            <h2 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Contato</h2>
            <p className="text-gray-700 mb-4">
              Para dúvidas sobre nossa política de cookies:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl">
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
