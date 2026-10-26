import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from '@/config/site';

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
    },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
