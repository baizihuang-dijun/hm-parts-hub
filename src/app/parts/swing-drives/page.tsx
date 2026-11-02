import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbLd, graphLd } from '@/lib/schema';
import { ModelCard } from '@/components/model-card';
import {
  categoryIntro,
  makesInCategory,
  pagesInCategory,
  pagesByMake,
  sortPagesByTonnage,
  featuredModels,
  brandHubPath,
  RFQ_PATH,
  GUIDE_PATH,
} from '@/lib/data';

const CATEGORY = 'swing-drives';

export const metadata: Metadata = buildMetadata({
  title: `Excavator Swing Drives, Swing Gearboxes & Swing Motors — Aftermarket Sourcing`,
  description:
    'Swing drives, swing gearboxes and swing motors for crawler and wheeled excavators across all major brands. Vetted China aftermarket and OEM-equivalent supply, fitment confirmed against OEM number, serial number and nameplate before quoting.',
  path: '/parts/swing-drives/',
});

export default function SwingDrivesHubPage() {
  const recentCommon = featuredModels(pagesInCategory(CATEGORY), 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graphLd([
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: 'Swing Drives', path: '/parts/swing-drives/' },
              ]),
            ]),
          ),
        }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Parts catalog
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Excavator swing drives, gearboxes &amp; swing motors
      </h1>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
        {categoryIntro(CATEGORY)} We source the complete swing drive, the swing gearbox on its own,
        or the swing motor separately from vetted China aftermarket and OEM-equivalent factories,
        then confirm every order against the OEM part number, machine serial number and a nameplate
        photo — so the unit that ships is the one that bolts on.
      </p>

      {/* Brand grid */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">Browse by equipment make</h2>
        <ul className="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {makesInCategory(CATEGORY).map(make => {
            const pages = sortPagesByTonnage(pagesByMake(make.slug, CATEGORY));
            const range = pages
              .map(p => p.copy.ton_class_approx)
              .filter((t): t is number => typeof t === 'number');
            const rangeLabel =
              range.length > 0
                ? `${Math.min(...range)}–${Math.max(...range)} t class`
                : 'multiple classes';
            return (
              <li key={make.slug}>
                <Link
                  href={brandHubPath(make.slug, CATEGORY)}
                  className="flex h-full flex-col gap-2 bg-background p-5 transition-colors hover:bg-muted"
                >
                  <span className="text-base font-semibold tracking-tight text-primary">
                    {make.name}
                  </span>{' '}
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {`${pages.length} ${pages.length === 1 ? 'model' : 'models'} · ${rangeLabel}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Buying guidance */}
      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            When a swing drive needs replacing
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            {[
              'The upper structure swings slowly or judders on start-up',
              'Swing holding power drops on a slope or under wind load',
              'Grinding or knocking noise from the swing gearbox under load',
              'Gear oil or grease leaking around the swing housing',
            ].map(item => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-foreground" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Order with the right information</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Model name alone is not enough — the same model can use different swing drives across
            build years and regions. Before quoting we check:
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {[
              'The OEM number stamped on the swing drive, gearbox or motor',
              'The machine serial number',
              'A clear nameplate or tag photo',
              'Mounting bolt pattern, gear ratio, output flange and motor interface',
            ].map(item => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-foreground" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={GUIDE_PATH}
            className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4"
          >
            Read the nameplate check guide
          </Link>
        </div>
      </section>

      {/* Quick model cards */}
      <section className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">Common model requests</h2>
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentCommon.map(page => (
            <li key={page.url_path}>
              <ModelCard page={page} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-lg border border-border bg-muted/40 p-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Do not see your machine on the list?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          The catalog expands batch by batch. Send your machine make, model, serial number and the
          part number or nameplate photo — we can source most common excavator swing drives even
          before the model page is published.
        </p>
        <Link
          href={RFQ_PATH}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
        >
          Request a quote
        </Link>
      </section>
    </div>
  );
}
