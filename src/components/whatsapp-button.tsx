'use client';

import { useEffect, useState } from 'react';
import { WHATSAPP_NUMBER, whatsappUrl } from '@/config/site';
import { readConsent } from './analytics';

/**
 * Floating click-to-chat button.
 *
 * Two things can sit at the bottom of the viewport:
 *   - the mobile CTA bar on model pages (fixed, md:hidden, z-40)
 *   - the cookie consent banner (fixed, z-50, full width, only on first visit)
 * so the vertical offset is chosen per breakpoint and per consent state.
 * Renders nothing when no number is configured — never emit a dead wa.me link.
 */
const DEFAULT_MESSAGE =
  'Hi HM Parts Hub, I would like a quote for a final drive or travel motor. Machine make / model: ';

export function WhatsAppButton() {
  // The consent banner is shown only while no choice is stored. Lift the button
  // while it is up so the first-visit CTA is never buried under it.
  const [bannerUp, setBannerUp] = useState(false);

  useEffect(() => {
    const sync = () => setBannerUp(readConsent() === null);
    sync();
    window.addEventListener('consent-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('consent-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!WHATSAPP_NUMBER) return null;

  return (
    <a
      href={whatsappUrl(DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with HM Parts Hub on WhatsApp"
      className={`fixed right-4 z-30 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e2a33] md:right-6 ${
        bannerUp ? 'bottom-44 md:bottom-28' : 'bottom-20 md:bottom-6'
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0 fill-current"
      >
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.83 9.83 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2zm0 17.94h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.34c0-4.51 3.67-8.18 8.19-8.18 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.79c0 4.51-3.68 8.19-8.13 8.19z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
