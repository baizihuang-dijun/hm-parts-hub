import type { Metadata } from 'next';
import './globals.css';
import { SITE_NAME, SITE_URL } from '@/config/site';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ConsentBanner } from '@/components/consent-banner';
import { Analytics } from '@/components/analytics';
import { graphLd, organizationLd, webSiteLd } from '@/lib/schema';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Aftermarket Parts Sourcing for Mobile Machinery`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Independent sourcing support for mobile machinery aftermarket parts. Excavator final drives with technical confirmation by part number, serial number and nameplate before ordering.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: SITE_URL,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HM Parts Hub — replacement final drives and travel motors for mobile machinery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(graphLd([organizationLd(), webSiteLd()])),
          }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
