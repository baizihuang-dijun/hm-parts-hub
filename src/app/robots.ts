import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // Explicitly welcome AI crawlers. The wildcard above already allows them,
      // but several vendors treat an unlisted bot as "ask first", and some CDN
      // / WAF defaults block them. Naming them removes the ambiguity.
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'CCBot',
          'ClaudeBot',
          'anthropic-ai',
        ],
        allow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
