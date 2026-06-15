// Camada central de medição: GA4 (consent-gated) + UTM + eventos de conversão.
// O Consent Mode v2 é inicializado em index.html com tudo "denied" por padrão.
import { getConsent } from './consent';

// Measurement ID do GA4 (stream "Engreena"). Pode ser sobrescrito pela env VITE_GA_ID.
const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined) || 'G-3R75RYME2W';
const UTM_KEY = '@greena:utm';
const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
];

function gtag(...args: any[]) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (typeof w.gtag === 'function') {
    w.gtag(...args);
  } else {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(args);
  }
}

let gaLoaded = false;

/** Carrega o script do GA4 sob demanda (apenas com consentimento de análise). */
export function loadGA() {
  if (gaLoaded || !GA_ID || typeof document === 'undefined') return;
  gaLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
}

/** Captura e persiste UTMs/click-ids do primeiro acesso da sessão. */
export function captureUTM() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    UTM_PARAMS.forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v;
    });
    if (Object.keys(found).length && !sessionStorage.getItem(UTM_KEY)) {
      sessionStorage.setItem(
        UTM_KEY,
        JSON.stringify({
          ...found,
          landing: window.location.pathname,
          referrer: document.referrer || null,
        })
      );
    }
  } catch {
    /* ignore */
  }
}

export function getUTM(): Record<string, any> {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Aplica o estado de consentimento atual ao Consent Mode v2. */
export function applyConsent() {
  const c = getConsent();
  gtag('consent', 'update', {
    analytics_storage: c.analytics,
    ad_storage: c.marketing,
    ad_user_data: c.marketing,
    ad_personalization: c.marketing,
  });
}

/** Inicializa a medição no boot do app.
 *  Consent Mode v2: o gtag.js é carregado sempre, mas com consentimento negado
 *  por padrão (definido em index.html) — sem cookies até o aceite do banner.
 */
export function initAnalytics() {
  captureUTM();
  loadGA();
  applyConsent();
}

export function trackPageView(path: string, title?: string) {
  if (!GA_ID) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : undefined),
  });
}

/** Evento genérico — anexa automaticamente os UTMs da sessão. */
export function trackEvent(name: string, params: Record<string, any> = {}) {
  gtag('event', name, { ...getUTM(), ...params });
}

// ---- Eventos de conversão de alto nível (funil engreena) ----
export const conversions = {
  signUp: () => trackEvent('sign_up', { method: 'email' }),
  login: () => trackEvent('login', { method: 'email' }),
  diagnosisStarted: (plan?: string) => trackEvent('diagnosis_started', { plan }),
  diagnosisCompleted: (score?: number) =>
    trackEvent('diagnosis_completed', { score }),
  beginCheckout: (plan?: string, value?: number) =>
    trackEvent('begin_checkout', { plan, value, currency: 'BRL' }),
  purchase: (value: number, plan?: string) =>
    trackEvent('purchase', { value, items: plan ? [{ item_name: plan }] : undefined, currency: 'BRL' }),
  consultationScheduled: () => trackEvent('consultation_scheduled'),
};
