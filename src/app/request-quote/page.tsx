import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { GUIDE_PATH, RFQ_PATH } from '@/lib/data';
import { RfqForm } from '@/components/rfq-form';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: 'Request a Quote — Final Drive Sourcing',
  description:
    'Request sourcing for an excavator final drive. Send part numbers, machine serial number and nameplate photos — technical confirmation before any order.',
  path: RFQ_PATH,
});

export default function RequestQuotePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Request a Quote' }]} />

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          RFQ · Final drives
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Request a Quote
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
          Tell us the machine, the part numbers you have, and attach photos of the
          nameplate and mounting face. We confirm the matching final drive technically —
          OEM part number, serial number and nameplate — before quoting from our vetted
          OEM-equivalent aftermarket supply network.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Unsure what to send?{' '}
          <Link
            href={GUIDE_PATH}
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            How to check your final drive nameplate
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading form…
            </div>
          }
        >
          <RfqForm />
        </Suspense>
      </div>
    </div>
  );
}
