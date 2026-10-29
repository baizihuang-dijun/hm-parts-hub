'use client';

import { useEffect, useState } from 'react';
import { CONSENT_STORAGE_KEY, GA4_ID } from '@/config/site';

export type ConsentState = 'granted' | 'denied' | null;

export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function writeConsent(value: 'granted' | 'denied') {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent('consent-changed', { detail: value }));
}

/**
 * Withdraw a stored choice so the banner shows again.
 * GDPR requires consent to be as easy to withdraw as to give.
 */
export function resetConsent() {
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('consent-changed', { detail: null }));
}

/** Fire a GA4 event only when consent was granted and gtag is loaded. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (readConsent() !== 'granted') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params);
  }
}

let gaInjected = false;

function injectGa4(id: string) {
  if (gaInjected || typeof document === 'undefined') return;
  gaInjected = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  const inline = document.createElement('script');
  inline.textContent =
    `window.dataLayer = window.dataLayer || [];` +
    `function gtag(){dataLayer.push(arguments);}` +
    `gtag('js', new Date());` +
    `gtag('config', '${id}');`;
  document.head.appendChild(inline);
}

/**
 * Loads GA4 only after explicit consent. Default / declined = never loaded.
 * Mounted once in the root layout.
 */
export function Analytics() {
  const [consent, setConsent] = useState<ConsentState>(null);

  useEffect(() => {
    setConsent(readConsent());
    const onChange = () => setConsent(readConsent());
    window.addEventListener('consent-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('consent-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  useEffect(() => {
    if (consent === 'granted' && GA4_ID) {
      injectGa4(GA4_ID);
    }
  }, [consent]);

  return null;
}
