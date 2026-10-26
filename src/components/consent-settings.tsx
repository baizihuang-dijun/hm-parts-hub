'use client';

import { useEffect, useState } from 'react';
import { readConsent, writeConsent, type ConsentState } from './analytics';

/** Consent management block for the Privacy page (view / change / withdraw). */
export function ConsentSettings() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setMounted(true);
    const onChange = () => setConsent(readConsent());
    window.addEventListener('consent-changed', onChange);
    return () => window.removeEventListener('consent-changed', onChange);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-muted-foreground">Loading your current choice…</p>;
  }

  const label =
    consent === 'granted' ? 'Accepted' : consent === 'denied' ? 'Declined' : 'No choice made yet';

  return (
    <div className="border border-border bg-muted p-4">
      <p className="text-sm text-foreground">
        Current analytics consent status: <strong>{label}</strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => writeConsent('granted')}
          className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={() => writeConsent('denied')}
          className="border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
        >
          Withdraw / decline
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Withdrawing consent stops all analytics collection immediately for future page
        views on this device. Google Analytics is never loaded when consent is absent or
        declined.
      </p>
    </div>
  );
}
