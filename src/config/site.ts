/**
 * Central site configuration.
 * All runtime-tunable values come from environment variables.
 * Never hardcode real keys, recipients or placeholder domains here.
 */
export const SITE_NAME = 'Parts Desk';

/**
 * Public origin of the deployed site.
 * - Prefer NEXT_PUBLIC_SITE_URL (set per environment, e.g. https://parts.example-corp.com).
 * - Fallback: the sandbox-provided deployment domain (COZE_PROJECT_DOMAIN_DEFAULT,
 *   which may or may not carry a protocol — normalize either way).
 * - If neither is configured we return an empty string and callers emit
 *   root-relative URLs instead of any placeholder domain.
 */
const RAW_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
  ''
).trim();
const ORIGIN_HOST = RAW_ORIGIN.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
export const SITE_URL = ORIGIN_HOST ? `https://${ORIGIN_HOST}` : '';

export const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';

export const RFQ_EMAIL = process.env.NEXT_PUBLIC_RFQ_EMAIL || '';

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || '';

/** localStorage key used by the consent banner / GA4 loader. */
export const CONSENT_STORAGE_KEY = 'mpp_analytics_consent';

/**
 * Absolute URL when SITE_URL is configured, otherwise the root-relative path.
 * Canonical/OG/JSON-LD consumers must tolerate relative output (no placeholder
 * domain is ever emitted).
 */
export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return SITE_URL ? `${SITE_URL}${p}` : p;
}
