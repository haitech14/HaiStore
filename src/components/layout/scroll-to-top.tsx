import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Al cambiar de ruta, lleva la vista al inicio (salvo anclas `#` o retroceso del navegador).
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useLayoutEffect(() => {
    if (hash) return;
    if (navigationType === 'POP') {
      const state = window.history.state as { idx?: number } | null;
      if (typeof state?.idx === 'number' && state.idx > 0) return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash, navigationType]);

  return null;
}
