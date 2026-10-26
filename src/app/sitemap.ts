import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/site';
import { allPublicRoutes } from '@/lib/data';

export const dynamic = 'force-static';

// Sitemap is generated entirely from the batch JSON route list.
// The 404 page is never included; unpublished machines have no routes.
export default function sitemap(): MetadataRoute.Sitemap {
  return allPublicRoutes().map(path => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
