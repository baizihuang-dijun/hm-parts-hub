'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readConsent, writeConsent, type ConsentState } from './analytics';

export function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setMounted(true);
    const onChange = () => setConsent(readConsent());
    window.addEventListener('consent-changed', onChange);
    return () => window.removeEventListener('consent-changed', onChange);
  }, []);

  // Render nothing until mounted (avoids hydration mismatch) or once a choice exists.
  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background shadow-lg"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-foreground/80">
          We use analytics cookies (Google Analytics 4) to understand how buyers use this
          site — only with your consent. Analytics is off unless you accept. Read our{' '}
          <Link href="/privacy/" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          . You can change this any time via <em>Cookie settings</em> in the footer.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => writeConsent('denied')}
            className="border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Reject analytics
          </button>
          <button
            type="button"
            onClick={() => writeConsent('granted')}
            className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
