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
import { breadcrumbLd, graphLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModelCard } from '@/components/model-card';

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

export default async function BrandHubPage({ params }: { params: RouteParams }) {
  const { make } = await params;
  const makeInfo = getMake(make);
  if (!makeInfo) notFound();

  const pages = sortPagesByTonnage(pagesByMake(makeInfo.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graphLd([
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: 'Final Drives', path: CATEGORY_PATH },
                { name: makeInfo.name, path: brandHubPath(makeInfo.slug) },
              ]),
            ]),
          ),
        }}
      />
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
        {`Replacement final drive and travel motor assemblies for ${pages.length} ${
          pages.length === 1 ? 'excavator model' : 'excavator models'
        } in the ${makeInfo.name} range. Each listing links to a sourcing page with the associated OEM numbers for that model. We confirm every unit against the part number, machine serial number and nameplate before quoting factory-direct supply.`}
      </p>

      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map(page => (
          <li key={page.url_path}>
            <ModelCard page={page} />
          </li>
        ))}
      </ul>

      <section className="mt-12 rounded-lg border border-border bg-muted/40 p-8">
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
          className="mt-5 inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
        >
          Request a quote
        </Link>
      </section>
    </div>
  );
}
