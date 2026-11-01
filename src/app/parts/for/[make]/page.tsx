import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BRAND_PAGE_MAKES,
  brandHubPath,
  brandPagePath,
  categoryOf,
  equipmentType,
  equipmentTypeLabel,
  getMake,
  makeModelRows,
  makesAcrossCategories,
  pagesByMakeAllCategories,
  RFQ_PATH,
} from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbLd, graphLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/breadcrumbs';

type RouteParams = Promise<{ make: string }>;

export function generateStaticParams(): { make: string }[] {
  return BRAND_PAGE_MAKES.map(make => ({ make }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { make } = await params;
  const info = getMake(make);
  if (!info || !BRAND_PAGE_MAKES.includes(make)) return {};

  const rows = makeModelRows(info.slug);
  const pages = pagesByMakeAllCategories(info.slug);
  const catNames = [
    ...new Set(pages.map(p => categoryOf(p.category_slug).name)),
  ];
  const sample = rows.slice(0, 6).map(r => r.modelName).join(', ');

  return buildMetadata({
    title: `${info.name} Parts — ${catNames.join(' & ')}`,
    description:
      `Replacement parts for ${rows.length} ${info.name} machine models (${sample}). ` +
      `${pages.length} catalogue entries across ${catNames.length} part categories. ` +
      `Pick your model to see which categories are catalogued for it. ` +
      `Fitment confirmed by part number, serial number and nameplate before quoting.`,
    path: brandPagePath(info.slug),
  });
}

export default async function Page({ params }: { params: RouteParams }) {
  const { make } = await params;
  const info = getMake(make);
  if (!info || !BRAND_PAGE_MAKES.includes(make)) notFound();

  const pages = pagesByMakeAllCategories(info.slug);
  const rows = makeModelRows(info.slug);
  const group = makesAcrossCategories().find(g => g.make.slug === info.slug);

  const catEntries = new Map<string, number>();
  for (const page of pages) {
    catEntries.set(page.category_slug, (catEntries.get(page.category_slug) ?? 0) + 1);
  }
  const categories = [...catEntries.entries()].map(([slug, entries]) => ({
    category: categoryOf(slug),
    entries,
  }));

  // Coverage sentence is built from the data, never hardcoded to excavators:
  // the batch already contains a compact track loader.
  const types = group?.equipmentTypes ?? ['excavator'];
  const typeSummary = types
    .map(t => {
      const n = rows.filter(r => r.listings.some(l => equipmentType(l.page) === t)).length;
      return `${n} ${equipmentTypeLabel(t, n)}`;
    })
    .join(' and ');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graphLd([
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: `${info.name} Parts`, path: brandPagePath(make) },
              ]),
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: `${info.name} Parts` }]}
      />

      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
        {`${info.name} Parts`}
      </h1>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
        {`Replacement components for ${typeSummary} in the ${info.name} range — `}
        {`${pages.length} catalogue ${pages.length === 1 ? 'entry' : 'entries'} across ${categories.length} part ${
          categories.length === 1 ? 'category' : 'categories'
        }. Pick your machine to see which categories are covered for it, or start from a part category.`}
      </p>

      {/* Category shortcut — the second way in, for buyers who already know what part they need. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map(({ category, entries }) => (
          <Link
            key={category.slug}
            href={brandHubPath(info.slug, category.slug)}
            className="group rounded-xl border border-border bg-white p-5 transition-colors hover:border-[#1D2A33]"
          >
            <div className="v6-kicker">{category.name}</div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5a6268]">
              {`${entries} ${entries === 1 ? 'listing' : 'listings'} for ${info.name} machines`}
            </p>
          </Link>
        ))}
      </div>

      {/* Model list — the primary path. One row per machine, categories as links. */}
      <section className="mt-12">
        <div className="v6-sec-head">
          <h2>{`Browse ${info.name} models`}</h2>
          <span className="rule" />
          <span className="cnt">{`${rows.length} machines`}</span>
        </div>
        <ul className="mt-6 border-t border-border">
          {rows.map(row => (
            <li
              key={row.modelSlug}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-3"
            >
              <span className="min-w-[110px] text-[15px] font-semibold text-[#1D2A33]">
                {row.modelName}
              </span>
              {row.ton !== null ? (
                <span className="font-mono text-[11px] tracking-[0.06em] text-[#7e8a93]">
                  {`~${row.ton} T`}
                </span>
              ) : (
                <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#7e8a93]">
                  {equipmentTypeLabel(equipmentType(row.listings[0].page), 1)}
                </span>
              )}
              <span className="ml-auto flex flex-wrap gap-2">
                {row.listings.map(({ category, page }) => (
                  <Link
                    key={category.slug}
                    href={page.url_path}
                    className="rounded border border-border px-2.5 py-1 text-[11.5px] font-medium text-[#1D2A33] transition-colors hover:border-[#1D2A33]"
                  >
                    {category.name}
                  </Link>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-lg border border-border bg-muted/40 p-8">
        <h2 className="text-lg font-semibold text-[#1D2A33]">
          {`Sourcing for a ${info.name} not listed here?`}
        </h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[#5a6268]">
          {`Send the model, machine serial number and the part number stamped on your unit — or a photo of the nameplate — and we will confirm and quote the matching part.`}
        </p>
        <Link
          href={`${RFQ_PATH}?make=${encodeURIComponent(info.name)}`}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
        >
          Request a quote
        </Link>
      </section>
    </div>
  );
}
