import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import api from '../services/api';
import { trackPageView } from '../lib/analytics';

function getSessionId(): string {
  let sid = sessionStorage.getItem('_greena_sid');
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('_greena_sid', sid);
  }
  return sid;
}

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const lastPath = useRef('');

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    // Fire and forget
    api.post('/analytics/track', {
      path,
      sessionId: getSessionId(),
      referrer: document.referrer || undefined,
      userId: user?.id || undefined,
    }).catch(() => {});

    // Google Analytics (consent-gated; só dispara se VITE_GA_ID e consentimento)
    trackPageView(path);
  }, [location.pathname, user]);
}
