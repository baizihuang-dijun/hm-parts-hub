import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  makes,
  getMake,
  pagesByMake,
  sortPagesByTonnage,
  brandHubPath,
  CATEGORY_PATH,
  RFQ_PATH,
} from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';

type RouteParams = Promise<{ make: string }>;

export function generateStaticParams(): { make: string }[] {
  return makes.map(m => ({ make: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { make } = await params;
  const makeInfo = getMake(make);
  if (!makeInfo) return {};
  const pages = pagesByMake(makeInfo.slug);
  const models = pages.map(p => p.model_name).join(', ');
  return buildMetadata({
    title: `${makeInfo.name} Excavator Final Drives — Sourcing & RFQ`,
    description:
      `Replacement final drives and travel motors for ${makeInfo.name} excavators (${models}). ` +
      `Vetted China aftermarket and OEM-equivalent supply, fitment confirmed by part number, serial number and nameplate before quoting.`,
    path: brandHubPath(makeInfo.slug),
  });
}

const BAND_LABEL: Record<string, string> = {
  'mini and compact': 'Mini & compact',
  'mid-size': 'Mid-size',
  large: 'Large',
  heavy: 'Heavy',
  'ultra-class mining': 'Ultra-class / mining',
};

export default async function BrandHubPage({ params }: { params: RouteParams }) {
  const { make } = await params;
  const makeInfo = getMake(make);
  if (!makeInfo) notFound();

  const pages = sortPagesByTonnage(pagesByMake(makeInfo.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Final Drives', href: CATEGORY_PATH },
          { label: makeInfo.name },
        ]}
      />

      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
        {makeInfo.name} excavator final drives
      </h1>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
        Replacement final drive and travel motor assemblies for {pages.length}{' '}
        {pages.length === 1 ? 'excavator model' : 'excavator models'} in the {makeInfo.name}{' '}
        range. Each listing links to a sourcing page with the associated OEM numbers for that
        model. We confirm every unit against the part number, machine serial number and nameplate
        before quoting factory-direct supply.
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {pages.map(page => (
          <li key={page.url_path}>
            <Link
              href={page.url_path}
              className="grid grid-cols-1 items-center gap-2 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[180px_1fr_120px_auto] sm:gap-6"
            >
              <span className="font-mono text-sm font-semibold text-primary">
                {page.model_name}
              </span>
              <span className="text-sm text-muted-foreground">{page.copy.application}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {typeof page.copy.ton_class_approx === 'number'
                  ? `~${page.copy.ton_class_approx} t`
                  : (page.copy.band && BAND_LABEL[page.copy.band]) || ''}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                View page →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12 border border-border bg-muted/40 p-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Sourcing for a {makeInfo.name} not listed here?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Send the model, machine serial number and the part number stamped on your travel motor
          or gearbox — or a photo of the nameplate — and we will confirm and quote the matching
          unit.
        </p>
        <Link
          href={`${RFQ_PATH}?make=${encodeURIComponent(makeInfo.name)}`}
          className="mt-5 inline-flex items-center justify-center rounded-sm bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
        >
          Request a quote
        </Link>
      </section>
    </div>
  );
}
