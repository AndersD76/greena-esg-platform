import { Link } from 'react-router-dom';

interface UpgradeRequiredProps {
  title?: string;
  description?: string;
}

/**
 * Tela exibida quando um usuário do plano gratuito tenta acessar um recurso pago.
 */
export default function UpgradeRequired({
  title = 'Recurso exclusivo dos planos pagos',
  description = 'O teste gratuito inclui o diagnóstico rápido de 6 perguntas e o resultado simplificado. Para o diagnóstico completo, relatórios e planos de ação, escolha um plano.',
}: UpgradeRequiredProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-900/5 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-brand-900 mb-3">{title}</h2>
        <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">{description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/checkout"
            className="px-10 py-3 font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 text-sm"
          >
            Ver planos
          </Link>
          <Link
            to="/dashboard"
            className="px-10 py-3 font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50 text-sm"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
