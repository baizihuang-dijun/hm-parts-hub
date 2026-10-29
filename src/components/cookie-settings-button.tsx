'use client';

import { resetConsent } from './analytics';

/**
 * Footer entry point that reopens the consent banner.
 * Without this, a visitor who once clicked Accept or Decline could never
 * change their mind — which fails GDPR's "as easy to withdraw as to give".
 */
export function CookieSettingsButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Cookie settings
    </button>
  );
}
