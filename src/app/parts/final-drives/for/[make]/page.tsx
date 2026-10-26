import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import {
  CATEGORY_PATH,
  RFQ_PATH,
  brandHubPath,
  getMake,
  makes,
  pagesByMake,
} from '@/lib/data';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const dynamicParams = false;

export function generateStaticParams() {
  return makes.map(m => ({ make: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string }>;
}): Promise<Metadata> {
  const { make } = await params;
  const m = getMake(make);
  if (!m) return {};
  return buildMetadata({
    title: `${m.name} Final Drives — Sourcing & RFQ`,
    description: `${m.name} excavator final drive sourcing support. Reported OEM cross-reference numbers for reference; technical confirmation by part number, serial number and nameplate before ordering.`,
    path: brandHubPath(m.slug),
  });
}

export default async function BrandHubPage({
  params,
}: {
  params: Promise<{ make: string }>;
}) {
  const { make } = await params;
  const m = getMake(make);
  if (!m) notFound();

  const pages = pagesByMake(m.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Final Drives', href: CATEGORY_PATH },
          { label: m.name },
        ]}
      />

      <div className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Brand hub
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {m.name} Final Drives
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-foreground/80 md:text-base">
          Sourcing support for {m.name} excavator final drives, travel motors and travel
          reduction gearboxes. Published model pages below list OEM part numbers reported
          to fit each machine for reference; every request is confirmed by part number,
          machine serial number and nameplate before ordering through our vetted
          OEM-equivalent aftermarket supply network.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {m.name} is a trademark of its respective owner, referenced for identification
          only. We are not an authorized {m.name} dealer.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Published {m.name} model pages
        </h2>
        {pages.length > 0 ? (
          <ul className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {pages.map(p => (
              <li key={p.url_path} className="bg-card">
                <Link href={p.url_path} className="block px-5 py-5 transition-colors hover:bg-muted">
                  <span className="block text-sm font-semibold text-foreground">
                    {p.make_name} {p.model_name}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {p.reported_numbers.length} reported OEM number
                    {p.reported_numbers.length > 1 ? 's' : ''} · sourcing support
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 border border-border bg-card p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              No {m.name} model pages are published yet in this batch. Sourcing for{' '}
              {m.name} machines is still available on request — send the machine model,
              any OEM part numbers you have, the serial number and nameplate photos, and
              we will confirm a matching final drive before quoting.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Request sourcing for a {m.name} machine
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Include the machine model, serial number and a nameplate photo if available.
            </p>
          </div>
          <Link
            href={`${RFQ_PATH}?make=${encodeURIComponent(m.name)}`}
            className="bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Request a Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
