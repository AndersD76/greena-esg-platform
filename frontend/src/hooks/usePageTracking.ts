import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import api from '../services/api';

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

    // Não trackear rotas de admin
    if (path.startsWith('/admin')) return;

    // Fire and forget
    api.post('/analytics/track', {
      path,
      sessionId: getSessionId(),
      referrer: document.referrer || undefined,
      userId: user?.id || undefined,
    }).catch(() => {});

    // Google Analytics (se disponível)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
      });
    }
  }, [location.pathname, user]);
}
