export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold text-primary">engreena</span>
            </div>
            <p className="text-sm text-gray-600">
              Soluções em Sustentabilidade
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Produto</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary">Como funciona</a></li>
              <li><a href="#" className="hover:text-primary">Pilares ESG</a></li>
              <li><a href="#" className="hover:text-primary">Preços</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary">Sobre nós</a></li>
              <li><a href="#" className="hover:text-primary">Contato</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            © 2025 engreena. Todos os direitos reservados. Feito para um mundo mais sustentável.
          </p>
        </div>
      </div>
    </footer>
  );
}
