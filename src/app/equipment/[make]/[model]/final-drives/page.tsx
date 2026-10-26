import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE_NAME, absoluteUrl } from '@/config/site';
import {
  CATEGORY_PATH,
  GUIDE_PATH,
  RFQ_PATH,
  brandHubPath,
  dedupedReportedNumbers,
  extraImages,
  getModelPage,
  mainImage,
  modelDescription,
  modelPages,
  partTypeEn,
} from '@/lib/data';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { imageSize } from '@/lib/image-sizes';

export const dynamicParams = false;

export function generateStaticParams() {
  return modelPages.map(p => ({ make: p.make_slug, model: p.model_slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string; model: string }>;
}): Promise<Metadata> {
  const { make, model } = await params;
  const page = getModelPage(make, model);
  if (!page) return {};
  return buildMetadata({
    title: page.title,
    description: modelDescription(page),
    path: page.url_path,
  });
}

function jsonLd(page: NonNullable<ReturnType<typeof getModelPage>>) {
  const main = mainImage(page);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Final Drives', item: absoluteUrl(CATEGORY_PATH) },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.make_name,
        item: absoluteUrl(brandHubPath(page.make_slug)),
      },
      { '@type': 'ListItem', position: 4, name: page.h1, item: absoluteUrl(page.url_path) },
    ],
  };
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: page.h1,
    description: modelDescription(page),
    // Brand is our sourcing service, never the OEM — OEM names appear only as
    // compatibility references in text.
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: 'Excavator final drive (OEM-equivalent aftermarket sourcing)',
    image: main ? [absoluteUrl(`/images/products/${main.file}`)] : undefined,
    url: absoluteUrl(page.url_path),
  };
  return [breadcrumb, product];
}

export default async function ModelFinalDrivePage({
  params,
}: {
  params: Promise<{ make: string; model: string }>;
}) {
  const { make, model } = await params;
  const page = getModelPage(make, model);
  if (!page) notFound();

  const main = mainImage(page);
  const extras = extraImages(page);
  const reported = dedupedReportedNumbers(page);
  const firstPn = reported[0]?.pn ?? '';
  const rfqHref =
    `${RFQ_PATH}?make=${encodeURIComponent(page.make_name)}` +
    `&model=${encodeURIComponent(page.model_name)}` +
    (firstPn ? `&pn=${encodeURIComponent(firstPn)}` : '');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(page)) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Final Drives', href: CATEGORY_PATH },
          { label: page.make_name, href: brandHubPath(page.make_slug) },
          { label: page.model_name },
        ]}
      />

      {/* Header + images */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          {main && (
            <figure className="border border-border bg-card">
              {/* Above the fold: no lazy loading, high fetch priority. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/products/${main.file}`}
                alt={`Final drive assembly for ${page.make_name} ${page.model_name} excavator`}
                width={imageSize(main.file).width}
                height={imageSize(main.file).height}
                className="h-auto w-full"
                fetchPriority="high"
              />
              <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                Reference photo — final drive / travel assembly reported to fit{' '}
                {page.make_name} {page.model_name}
              </figcaption>
            </figure>
          )}
          {extras.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {extras.map((img, i) => (
                <li key={img.file} className="border border-border bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/products/${img.file}`}
                    alt={`Final drive for ${page.make_name} ${page.model_name} excavator — additional view ${i + 2}`}
                    width={imageSize(img.file).width}
                    height={imageSize(img.file).height}
                    className="h-auto w-full"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sourcing &amp; RFQ
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {page.h1}
          </h1>
          {page.model_aliases.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Also reported for:{' '}
              <span className="font-mono">{page.model_aliases.join(', ')}</span>
            </p>
          )}

          <div className="mt-6 border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">
              Reporting &amp; sourcing for this model
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We help source a matching final drive for the {page.make_name}{' '}
              {page.model_name} through a vetted China aftermarket / OEM-equivalent supply
              network. Nothing is ordered from a listing alone: every unit is confirmed
              technically against your OEM part number, machine serial number and
              nameplate before the order is placed.
            </p>
            <Link
              href={rfqHref}
              className="mt-4 inline-block bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Request a quote for this {page.make_name} {page.model_name}
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              The RFQ form opens pre-filled with this machine&apos;s details.
            </p>
          </div>
        </div>
      </div>

      {/* Reported OEM numbers */}
      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Reported OEM part numbers{' '}
          <span className="text-sm font-normal text-muted-foreground">
            — reported for reference
          </span>
        </h2>
        {reported.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto border border-border">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Part number</th>
                    <th className="px-4 py-3 font-semibold">Reported part type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {reported.map(r => (
                    <tr key={r.pn}>
                      <td className="px-4 py-3 font-mono text-sm text-foreground">{r.pn}</td>
                      <td className="px-4 py-3 text-muted-foreground">{partTypeEn(r.part_type)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          reported
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 border-l-2 border-accent bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              These are reported cross-references, not independently verified. Do not
              order by these numbers alone — always confirm by OEM part number, machine
              serial number and nameplate before ordering.
            </p>
          </>
        ) : (
          <p className="mt-4 border border-border bg-card p-5 text-sm text-muted-foreground">
            No OEM part numbers are reported for this model yet. Sourcing is still
            available — send the machine serial number and nameplate photos and we will
            work the identification from scratch.
          </p>
        )}
      </section>

      {/* How we confirm fit */}
      <section className="mt-12 border border-border bg-muted p-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          How we confirm fit before quoting
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          <li className="border border-border bg-background p-4">
            <p className="font-mono text-xs text-muted-foreground">Step 1</p>
            <p className="mt-1 text-sm font-semibold text-foreground">OEM part number</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Any number from the old unit, the parts book or a dealer quote — it anchors
              the cross-reference.
            </p>
          </li>
          <li className="border border-border bg-background p-4">
            <p className="font-mono text-xs text-muted-foreground">Step 2</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Machine serial number</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Serial breaks separate different configurations of the same model — we check
              against them before quoting.
            </p>
          </li>
          <li className="border border-border bg-background p-4">
            <p className="font-mono text-xs text-muted-foreground">Step 3</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Nameplate photos</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              A clear photo of the final drive nameplate and the mounting face settles the
              identification.
            </p>
          </li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Not sure where the nameplate is or what to photograph?{' '}
          <Link
            href={GUIDE_PATH}
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            How to check your excavator final drive nameplate
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 border border-border bg-primary p-6 text-primary-foreground">
        <div>
          <h2 className="text-lg font-semibold">Get sourcing support for this machine</h2>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Send the reported numbers plus your serial and nameplate photos — we confirm
            the match technically before any order.
          </p>
        </div>
        <Link
          href={rfqHref}
          className="bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Request a Quote
        </Link>
      </section>
    </div>
  );
}
