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
          This platform is an independent sourcing service for mobile machinery
          aftermarket parts. Our first published category is excavator final drives and
          travel motors; further categories are added in batches as our reported
          cross-reference data matures.
        </p>
        <p>
          We are not a parts catalog and not an authorized dealer of any equipment
          manufacturer. What we provide is identification and sourcing: you tell us the
          machine, the part numbers you have and show us the nameplate; we confirm the
          matching unit technically and source it through a vetted OEM-equivalent
          aftermarket supply network in China.
        </p>
        <p>
          Every part number published on this site is a reported cross-reference shown for
          reference — not independently verified — and we never ask you to order by a
          number alone. Confirmation by OEM part number, machine serial number and
          nameplate is part of every request.
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
