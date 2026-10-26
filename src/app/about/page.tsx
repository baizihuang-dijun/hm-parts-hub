import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { RFQ_PATH } from '@/lib/data';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: 'About — Independent Aftermarket Parts Sourcing',
  description:
    'About this platform: independent sourcing support for mobile machinery aftermarket parts, with technical confirmation before ordering.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">About</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/80 md:text-base">
        <p>
          This platform is a sourcing service for mobile machinery aftermarket parts, built
          for fleet operators and repair workshops that buy on technical facts rather than
          catalog guesswork. Our first category covers excavator final drives and travel
          motors, with new makes and models added in batches.
        </p>
        <p>
          We are not an authorized dealer of any equipment manufacturer. What we do is
          identify and source: you tell us the machine, the numbers stamped on your unit and
          show us the nameplate; our team confirms the exact part against those details and
          sources it through vetted China aftermarket and OEM-equivalent factories at
          factory-direct pricing.
        </p>
        <p>
          The part numbers listed on our model pages are the catalog numbers commonly
          associated with each model. They are a starting point for matching, not the final
          word: the same model name can use different units across build years and regions,
          so every quote is confirmed against the OEM part number, machine serial number and
          a nameplate photo before you commit.
        </p>
        <p>
          Manufacturer names, model designations and part numbers are trademarks of their
          respective owners and are used on this site for identification purposes only.
        </p>
      </div>
      <Link
        href={RFQ_PATH}
        className="mt-8 inline-block bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
      >
        Request a Quote
      </Link>
    </div>
  );
}
