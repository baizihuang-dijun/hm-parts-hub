import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from '@/config/site';

/** Shared social-share card (1200x630) used by every page's Open Graph tags. */
export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'HM Parts Hub — replacement final drives and travel motors for mobile machinery',
};

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
      images: [OG_IMAGE],
    },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
