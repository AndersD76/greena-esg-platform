import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/dashboard" className="inline-block mb-4">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-10" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Transformando negócios através de práticas ESG sustentáveis e responsáveis.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-900 mb-4">Plataforma</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link to="/dashboard" className="hover:text-brand-900 transition-colors">Dashboard</Link></li>
              <li><Link to="/diagnosis/new" className="hover:text-brand-900 transition-colors">Diagnóstico ESG</Link></li>
              <li><Link to="/reports" className="hover:text-brand-900 transition-colors">Relatórios</Link></li>
              <li><Link to="/consultations" className="hover:text-brand-900 transition-colors">Consultorias</Link></li>
              <li><Link to="/profile" className="hover:text-brand-900 transition-colors">Meu Perfil</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-900 mb-4">Empresa</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-brand-900 transition-colors">Sobre nós</Link></li>
              <li><Link to="/contact" className="hover:text-brand-900 transition-colors">Contato</Link></li>
              <li><Link to="/checkout" className="hover:text-brand-900 transition-colors">Planos e Preços</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-900 mb-4">Legal</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link to="/privacy" className="hover:text-brand-900 transition-colors">Privacidade</Link></li>
              <li><Link to="/terms" className="hover:text-brand-900 transition-colors">Termos de Uso</Link></li>
              <li><Link to="/lgpd" className="hover:text-brand-900 transition-colors">LGPD</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-900 transition-colors">Cookies</Link></li>
              <li><Link to="/compliance" className="hover:text-brand-900 transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            © 2025 engreena ESG Platform. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
