import Link from 'next/link';
import { absoluteUrl } from '@/config/site';

/**
 * Stub page for a URL that was published under the old single swing category and has since
 * been reclassified. `next.config.ts` uses `output: 'export'`, and static export ignores
 * `redirects()`, so the hop is done with a meta refresh here plus the same rule configured
 * at the CDN. The stub carries noindex and is deliberately left out of the sitemap.
 */
export function MetaRedirect({ to }: { to: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <link rel="canonical" href={absoluteUrl(to)} />
      <h1 className="text-2xl font-semibold text-slate-900">This page has moved</h1>
      <p className="mt-4 text-slate-600">
        The part on this machine is a swing gearbox rather than a complete swing drive
        assembly, so it now sits in the swing gearbox category.
      </p>
      <p className="mt-6">
        <Link href={to} className="font-medium text-slate-900 underline">
          Continue to the new page
        </Link>
      </p>
    </div>
  );
}
