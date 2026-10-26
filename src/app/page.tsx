import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import {
  makes,
  modelPages,
  pagesByMake,
  sortPagesByTonnage,
  brandHubPath,
  CATEGORY_PATH,
  RFQ_PATH,
  GUIDE_PATH,
} from '@/lib/data';

export const metadata: Metadata = buildMetadata({
  title: `Aftermarket Parts Sourcing for Mobile Machinery`,
  description:
    'Factory-direct sourcing for replacement excavator final drives and travel motors — vetted China aftermarket and OEM-equivalent supply, technical confirmation before every quote.',
  path: '/',
});

const FEATURED_MODELS = [
  'caterpillar/320d',
  'komatsu/pc200-7',
  'hitachi/zx200-3',
  'volvo/ec220d',
  'doosan/dx225',
  'sany/sy285',
  'kobelco/sk200-8',
  'hyundai/r140lc-7',
];

export default function HomePage() {
  const featured = FEATURED_MODELS.map(key => {
    const [make, model] = key.split('/');
    return modelPages.find(p => p.make_slug === make && p.model_slug === model);
  }).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
            Mobile machinery · aftermarket parts sourcing
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Final drives for excavators, sourced from vetted factories and confirmed before you
            buy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/80">
            We help fleet and workshop buyers source replacement travel motor and gearbox
            assemblies from vetted China aftermarket and OEM-equivalent manufacturers. Every unit
            is checked against the OEM number, machine serial number and nameplate before quoting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={CATEGORY_PATH}
              className="inline-flex items-center justify-center rounded-sm bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Browse final drives by make
            </Link>
            <Link
              href={RFQ_PATH}
              className="inline-flex items-center justify-center rounded-sm border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Request a quote
            </Link>
          </div>
          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-8">
            {[
              { n: `${modelPages.length}`, l: 'Excavator models covered' },
              { n: `${makes.length}`, l: 'Equipment brands' },
              { n: 'Pre-quote', l: 'Technical fit confirmation' },
            ].map(stat => (
              <div key={stat.l}>
                <dt className="text-2xl font-semibold tracking-tight">{stat.n}</dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-primary-foreground/60">
                  {stat.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Buy the right final drive the first time
        </h2>
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
          {[
            {
              t: 'Send the numbers',
              d: 'Share the OEM part number on your travel motor or gearbox, the machine serial number, and a nameplate photo.',
            },
            {
              t: 'We confirm the unit',
              d: 'Our team checks displacement, mounting pattern, sprocket interface and speed ratio against vetted factory supply.',
            },
            {
              t: 'Get a factory-direct quote',
              d: 'Receive a clear sourcing quote with the technical confirmation attached — no guesswork, no blind cross-reference.',
            },
          ].map((step, i) => (
            <div key={step.t} className="bg-background p-6">
              <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{step.t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Need help reading the tag? See the{' '}
          <Link href={GUIDE_PATH} className="text-primary underline underline-offset-4">
            nameplate check guide
          </Link>
          .
        </p>
      </section>

      {/* Makes */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Browse catalog
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Final drives by make</h2>
            </div>
            <Link
              href={CATEGORY_PATH}
              className="text-sm font-semibold text-primary underline underline-offset-4"
            >
              View all {makes.length} brands
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {makes.map(make => {
              const count = pagesByMake(make.slug).length;
              return (
                <li key={make.slug}>
                  <Link
                    href={brandHubPath(make.slug)}
                    className="flex h-full flex-col justify-between gap-3 bg-background p-5 transition-colors hover:bg-muted"
                  >
                    <span className="text-base font-semibold tracking-tight text-primary">
                      {make.name}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {count} {count === 1 ? 'model' : 'models'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Featured models */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Common requests
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Frequently requested model pages
        </h2>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {sortPagesByTonnage(featured).map(page => (
            <li key={page.url_path}>
              <Link
                href={page.url_path}
                className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_1fr_auto]"
              >
                <span className="font-mono text-sm font-semibold text-primary">
                  {page.make_name} {page.model_name}
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {typeof page.copy.ton_class_approx === 'number'
                    ? `~${page.copy.ton_class_approx} t class · `
                    : ''}
                  {page.copy.application}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  View page →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA band */}
      <section className="border-t border-border bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-primary-foreground">
              Have a part number or nameplate photo?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-primary-foreground/80">
              Send it through and we will confirm the exact final drive for your machine before
              quoting factory-direct supply.
            </p>
          </div>
          <Link
            href={RFQ_PATH}
            className="inline-flex shrink-0 items-center justify-center rounded-sm bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Request a quote
          </Link>
        </div>
      </section>
    </div>
  );
}
