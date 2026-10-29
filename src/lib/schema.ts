/**
 * JSON-LD helpers.
 *
 * Only facts already visible on the page are emitted — no prices, no ratings,
 * no availability claims. Model pages own their own graph (breadcrumb +
 * product + FAQ); these helpers cover the site-level and hub-level entities
 * that were previously missing.
 */
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/config/site';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationLd(): object {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/logo.png'),
      width: 512,
      height: 512,
    },
    image: absoluteUrl('/og-image.png'),
    description:
      'Independent sourcing support for aftermarket final drives and travel motors used in mobile machinery.',
  };
}

export function webSiteLd(): object {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface CrumbNode {
  name: string;
  path: string;
}

export function breadcrumbLd(items: CrumbNode[]): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function graphLd(nodes: object[]): object {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
