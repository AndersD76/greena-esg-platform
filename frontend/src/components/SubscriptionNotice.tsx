import { Link } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';

function formatDate(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Aviso de vencimento de assinatura.
 *
 * Até então o vencimento era completamente silencioso: a assinatura simplesmente
 * parava de valer e o cliente descobria ao esbarrar num bloqueio.
 */
export default function SubscriptionNotice() {
  const { loading, daysUntilExpiry, isExpiringSoon, expiredSubscription } = usePlan();

  if (loading) return null;

  if (expiredSubscription) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.97l-6.93-12a2 2 0 00-3.46 0l-6.93 12A2 2 0 005.07 19z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-red-900">
              Seu plano {expiredSubscription.planName} venceu
            </p>
            <p className="text-sm text-red-700/80 mt-0.5">
              Expirou em {formatDate(expiredSubscription.expiresAt)}. Diagnóstico completo, relatórios e planos de ação
              ficam indisponíveis até a renovação. Seus dados continuam salvos.
            </p>
          </div>
          <Link to="/checkout" className="flex-shrink-0">
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-red-700 rounded-full hover:bg-red-800">
              Renovar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isExpiringSoon && daysUntilExpiry !== null) {
    const prazo =
      daysUntilExpiry === 0 ? 'vence hoje' : daysUntilExpiry === 1 ? 'vence amanhã' : `vence em ${daysUntilExpiry} dias`;

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-amber-900">Sua assinatura {prazo}</p>
            <p className="text-sm text-amber-700/80 mt-0.5">
              Renove para não perder o acesso ao diagnóstico completo e aos relatórios.
            </p>
          </div>
          <Link to="/checkout" className="flex-shrink-0">
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-700 rounded-full hover:bg-amber-800">
              Renovar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
