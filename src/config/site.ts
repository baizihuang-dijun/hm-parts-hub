/**
 * Central site configuration.
 * All runtime-tunable values come from NEXT_PUBLIC_* environment variables.
 * Never hardcode real keys or recipients here.
 */
export const SITE_NAME = 'Mobile Parts Platform';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'
).replace(/\/+$/, '');

export const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';

export const RFQ_EMAIL = process.env.NEXT_PUBLIC_RFQ_EMAIL || '';

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || '';

/** localStorage key used by the consent banner / GA4 loader. */
export const CONSENT_STORAGE_KEY = 'mpp_analytics_consent';

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
