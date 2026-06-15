// Gestão de consentimento de cookies (LGPD / Consent Mode v2)
export type ConsentValue = 'granted' | 'denied';

export interface ConsentState {
  analytics: ConsentValue;
  marketing: ConsentValue;
  decidedAt: string | null;
}

const STORAGE_KEY = '@greena:consent';

const DEFAULT: ConsentState = {
  analytics: 'denied',
  marketing: 'denied',
  decidedAt: null,
};

export function getConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) } as ConsentState;
  } catch {
    /* ignore */
  }
  return { ...DEFAULT };
}

/** True se o usuário já tomou uma decisão (não exibir o banner novamente). */
export function hasDecided(): boolean {
  return getConsent().decidedAt !== null;
}

export function setConsent(state: { analytics: ConsentValue; marketing: ConsentValue }): ConsentState {
  const next: ConsentState = { ...state, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function acceptAll(): ConsentState {
  return setConsent({ analytics: 'granted', marketing: 'granted' });
}

export function rejectAll(): ConsentState {
  return setConsent({ analytics: 'denied', marketing: 'denied' });
}
