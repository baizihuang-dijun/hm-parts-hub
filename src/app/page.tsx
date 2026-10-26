import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { CATEGORY_PATH, GUIDE_PATH, RFQ_PATH, makes, modelPages, brandHubPath } from '@/lib/data';

export const metadata: Metadata = buildMetadata({
  title: 'Aftermarket Parts Sourcing for Mobile Machinery',
  description:
    'Independent sourcing platform for mobile machinery aftermarket parts. Excavator final drives with reported OEM cross-references and technical confirmation before ordering.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Mobile machinery aftermarket · Sourcing support
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Source the right replacement part — confirmed before you order.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/80 md:text-lg">
            We help equipment owners and repair shops source matching parts through a
            vetted OEM-equivalent aftermarket supply network in China. Every request is
            confirmed technically — by OEM part number, machine serial number and
            nameplate — before any order is placed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={RFQ_PATH}
              className="bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Request a Quote
            </Link>
            <Link
              href={CATEGORY_PATH}
              className="border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Browse Final Drives
            </Link>
          </div>
        </div>
      </section>

      {/* Category */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Product categories
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Current coverage
        </h2>
        <div className="mt-6 border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Excavator Final Drives</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Replacement final drives and travel motors for excavators — {modelPages.length}{' '}
                published machine model pages across {makes.length} brands, with reported OEM
                cross-reference numbers for reference and fit confirmation support.
              </p>
            </div>
            <Link
              href={CATEGORY_PATH}
              className="shrink-0 border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Open category hub
            </Link>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Further categories are in preparation. Category-neutral RFQ: if your part is not
          listed, send the part number and machine details anyway.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            Three steps before any order
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Report your machine & part',
                body: 'Send the machine make and model, the OEM part number you have, the machine serial number, and photos of the nameplate and mounting face.',
              },
              {
                step: '02',
                title: 'Technical confirmation',
                body: 'We cross-check the reported numbers against supplier data and your nameplate, then confirm the matching configuration before quoting.',
              },
              {
                step: '03',
                title: 'Sourcing & delivery',
                body: 'A matching unit is sourced from vetted OEM-equivalent aftermarket supply and prepared for shipment to your country.',
              },
            ].map(s => (
              <li key={s.step} className="border border-border bg-background p-6">
                <p className="font-mono text-xs text-muted-foreground">{s.step}</p>
                <h3 className="mt-2 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Brands */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Brand coverage
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Final drives by brand
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 md:grid-cols-4">
          {makes.map(m => (
            <li key={m.slug} className="bg-card">
              <Link
                href={brandHubPath(m.slug)}
                className="block px-4 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          All brand names are trademarks of their respective owners and are used for
          identification only.
        </p>
      </section>

      {/* Guide + CTA */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="border border-border bg-background p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Not sure which final drive you need?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The nameplate on your final drive is the single most reliable identifier.
              Follow our checklist before requesting a quote.
            </p>
            <Link
              href={GUIDE_PATH}
              className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
            >
              How to check your final drive nameplate
            </Link>
          </div>
          <div className="border border-border bg-background p-6">
            <h2 className="text-lg font-semibold text-foreground">Ready to request sourcing?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Send your machine details and part numbers. We reply with a technical
              confirmation path — no obligation.
            </p>
            <Link
              href={RFQ_PATH}
              className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Start an RFQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
