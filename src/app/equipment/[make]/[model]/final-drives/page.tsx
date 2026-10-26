import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  makes,
  getModelPage,
  getMake,
  modelDescription,
  mainImage,
  partGroups,
  hasPartNumbers,
  pagesByMake,
  sortPagesByTonnage,
  brandHubPath,
  CATEGORY_PATH,
  GUIDE_PATH,
  type ModelPage,
} from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ImageGallery, type GalleryImage } from '@/components/image-gallery';
import { SITE_NAME, absoluteUrl } from '@/config/site';

type RouteParams = Promise<{ make: string; model: string }>;

export function generateStaticParams(): { make: string; model: string }[] {
  return makes.flatMap(m =>
    pagesByMake(m.slug).map(p => ({ make: p.make_slug, model: p.model_slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { make, model } = await params;
  const page = getModelPage(make, model);
  if (!page) return {};
  // The root layout applies a "%s | <site>" title template, so pass the bare title.
  return buildMetadata({
    title: page.title,
    description: modelDescription(page),
    path: page.url_path,
  });
}

function rfqHref(page: ModelPage, pn?: string): string {
  const params = new URLSearchParams({
    make: page.make_name,
    model: page.model_name,
  });
  if (pn) params.set('pn', pn);
  return `/request-quote/?${params.toString()}`;
}

function jsonLd(page: ModelPage): object {
  const main = mainImage(page);
  // absoluteUrl falls back to root-relative paths when no public origin is
  // configured — never emit a placeholder domain.
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Final Drives',
            item: absoluteUrl(CATEGORY_PATH),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.make_name,
            item: absoluteUrl(brandHubPath(page.make_slug)),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: `${page.make_name} ${page.model_name}`,
            item: absoluteUrl(page.url_path),
          },
        ],
      },
      {
        '@type': 'Product',
        name: `Final Drive for ${page.make_name} ${page.model_name}`,
        category: 'Final drive / travel motor assembly',
        image: main ? [absoluteUrl(`/images/products/${main.file}`)] : undefined,
        brand: { '@type': 'Brand', name: SITE_NAME },
        description: modelDescription(page),
      },
    ],
  };
}

function galleryImages(page: ModelPage): GalleryImage[] {
  const main = mainImage(page);
  const ordered = main ? [main, ...page.images.filter(i => i !== main)] : page.images;
  return ordered.map((img, idx) => ({
    file: img.file,
    alt:
      idx === 0
        ? `Final drive assembly for ${page.make_name} ${page.model_name} excavator`
        : `Final drive for ${page.make_name} ${page.model_name} excavator — additional view ${idx}`,
  }));
}

function PartNumberBlock({ page }: { page: ModelPage }) {
  const groups = partGroups(page);
  return (
    <section className="border-t border-border py-10">
      <h2 className="text-xl font-semibold tracking-tight">{page.copy.pn_heading}</h2>
      {hasPartNumbers(page) ? (
        <>
          <div className="mt-6 space-y-7">
            {groups.map(group => (
              <div key={group.key}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.numbers.map(pn => (
                    <li key={pn}>
                      <Link
                        href={rfqHref(page, pn)}
                        title={`Request a quote for ${pn}`}
                        className="inline-flex select-all items-center rounded-md border border-border bg-white px-3 py-1.5 font-mono text-sm font-semibold tracking-wide text-primary transition-colors duration-150 hover:border-primary hover:bg-muted"
                      >
                        {pn}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-sm leading-6">
            {page.copy.pn_note}
          </div>
        </>
      ) : (
        <div className="mt-5 space-y-5">
          <p className="max-w-prose text-sm leading-6 text-muted-foreground">{page.copy.pn_note}</p>
          <Link
            href={rfqHref(page)}
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
          >
            Send my nameplate
          </Link>
        </div>
      )}
    </section>
  );
}

export default async function ModelFinalDrivesPage({ params }: { params: RouteParams }) {
  const { make, model } = await params;
  const page = getModelPage(make, model);
  if (!page) notFound();

  const makeInfo = getMake(page.make_slug);
  const images = galleryImages(page);
  const siblingModels = sortPagesByTonnage(
    pagesByMake(page.make_slug).filter(p => p.model_slug !== page.model_slug),
  ).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(page)) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Final Drives', href: CATEGORY_PATH },
          { label: makeInfo?.name ?? page.make_name, href: brandHubPath(page.make_slug) },
          { label: `${page.make_name} ${page.model_name}` },
        ]}
      />

      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{page.h1}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Replacement final drive &amp; travel motor assembly · excavator undercarriage
        </p>
        {typeof page.copy.ton_class_approx === 'number' && (
          <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground">
            ~{page.copy.ton_class_approx} T
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left: gallery + CTA */}
        <div className="space-y-4">
          <ImageGallery images={images} />
          <p className="text-center text-xs text-muted-foreground">
            Final drive for {page.make_name} {page.model_name}
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-5">
            <p className="text-sm font-semibold text-primary">
              Sourcing a {page.make_name} {page.model_name} final drive?
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Send the part number and a nameplate photo. We confirm the exact unit and quote
              factory-direct pricing before you commit.
            </p>
            <Link
              href={rfqHref(page)}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
            >
              Request a quote for this model
            </Link>
          </div>
        </div>

        {/* Right: commercial copy */}
        <div>
          <p className="text-[15px] leading-7 text-foreground">{page.copy.intro}</p>

          {page.model_aliases.length > 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">Also known as: </span>
              {page.model_aliases.join(', ')} — same machine family in some markets.
            </p>
          ) : null}

          <section className="mt-8 border-t border-border pt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sourcing
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Why source this final drive through us
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{page.copy.sourcing}</p>
            <ul className="mt-5 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
              {[
                'Vetted China aftermarket & OEM-equivalent factories',
                'Technical check before every quote',
                'Factory-direct pricing, no middleman markup',
                'One point of contact from order to delivery',
              ].map(item => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-2">
            <PartNumberBlock page={page} />
          </div>

          <section className="border-t border-border py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Fitment
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Confirm the exact fit before you order
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{page.copy.fit_check}</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Not sure how to read the tag? Follow the{' '}
              <Link href={GUIDE_PATH} className="text-primary underline underline-offset-4">
                nameplate check guide
              </Link>
              .
            </p>
          </section>

          <section className="border-t border-border py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Build year &amp; region
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Same model name can mean a different unit
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {page.copy.generation_note}
            </p>
          </section>

          <section className="border-t border-border py-10">
            <h2 className="text-xl font-semibold tracking-tight">
              Get your {page.make_name} {page.model_name} back on track
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tell us the part number on your travel motor or gearbox — or send a photo of the
              nameplate — and we will confirm the right unit and come back with a factory-direct
              quote.
            </p>
            <Link
              href={rfqHref(page)}
              className="mt-5 inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
            >
              Request a quote for this model
            </Link>
          </section>

          {siblingModels.length > 0 ? (
            <section className="border-t border-border py-10">
              <h2 className="text-lg font-semibold tracking-tight">
                Other {page.make_name} excavator final drives
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {siblingModels.map(sib => (
                  <li key={sib.url_path}>
                    <Link
                      href={sib.url_path}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="font-mono text-xs">{sib.model_name}</span>
                      {typeof sib.copy.ton_class_approx === 'number' ? (
                        <span className="text-xs text-muted-foreground/70">
                          ~{sib.copy.ton_class_approx} t
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Link
          href={rfqHref(page)}
          className="flex w-full items-center justify-center rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
        >
          Request a quote — {page.make_name} {page.model_name}
        </Link>
      </div>
    </div>
  );
}
