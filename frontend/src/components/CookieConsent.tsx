import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hasDecided, setConsent, acceptAll, rejectAll, getConsent } from '../lib/consent';
import { applyConsent } from '../lib/analytics';

// Banner de consentimento de cookies (LGPD / Consent Mode v2).
// Por padrão nenhum cookie de análise/marketing é ativado até a decisão do usuário.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!hasDecided()) {
      setVisible(true);
    } else {
      const c = getConsent();
      setAnalytics(c.analytics === 'granted');
      setMarketing(c.marketing === 'granted');
    }
  }, []);

  function finish() {
    applyConsent();
    setVisible(false);
    setCustomizing(false);
  }

  function handleAcceptAll() {
    acceptAll();
    finish();
  }

  function handleRejectAll() {
    rejectAll();
    finish();
  }

  function handleSavePrefs() {
    setConsent({
      analytics: analytics ? 'granted' : 'denied',
      marketing: marketing ? 'granted' : 'denied',
    });
    finish();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4"
    >
      <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#152F27' }}>
              Nós usamos cookies 🍪
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Usamos cookies essenciais para o funcionamento da plataforma e, com seu
              consentimento, cookies de análise e marketing para melhorar sua experiência.
              Você pode escolher quais aceitar. Saiba mais na nossa{' '}
              <Link to="/cookies" className="underline font-medium" style={{ color: '#7B9965' }}>
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          {customizing && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
              <label className="flex items-center justify-between gap-4 cursor-not-allowed opacity-70">
                <span className="text-sm">
                  <strong>Essenciais</strong> — necessários para o funcionamento (sempre ativos)
                </span>
                <input type="checkbox" checked readOnly className="h-4 w-4" />
              </label>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <span className="text-sm">
                  <strong>Análise</strong> — métricas de uso (Google Analytics)
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <span className="text-sm">
                  <strong>Marketing</strong> — anúncios e remarketing
                </span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            {!customizing ? (
              <button
                onClick={() => setCustomizing(true)}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Personalizar
              </button>
            ) : (
              <button
                onClick={handleSavePrefs}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Salvar preferências
              </button>
            )}
            <button
              onClick={handleRejectAll}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Apenas essenciais
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 text-sm font-bold text-white rounded-lg transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
