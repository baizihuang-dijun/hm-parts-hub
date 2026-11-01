import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { imageSize } from '@/lib/image-sizes';
import { ModelCard } from '@/components/model-card';
import { HomeSearch, type SearchEntry } from '@/components/home-search';
import {
  CATEGORY_CONFIGS,
  brandEntryPath,
  categoryPath,
  distinctModelCount,
  featuredAcrossCategories,
  makesAcrossCategories,
  makesInCategory,
  modelPages,
  pagesInCategory,
  RFQ_PATH,
  type ModelPage,
} from '@/lib/data';

const FD = 'final-drives';
/* Search indexes every category — the box is site-wide, not final-drive-only. */
const searchable = [...pagesInCategory('final-drives'), ...pagesInCategory('travel-gearboxes')];
/* Distinct machines, not catalogue entries: one machine can hold a page in
   more than one category, so 137 entries are 121 machines. */
const MACHINE_COUNT = distinctModelCount(modelPages);

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'HM Parts Hub — Replacement Parts for Mobile Equipment',
    description:
      'Find replacement parts for mobile equipment by part number, equipment make or model. Starting with excavator final drives and travel gearboxes, with fitment confirmed against the part number, serial number and nameplate before quoting.',
    path: '/',
  }),
  // Absolute title — do not apply the layout "%s | SITE_NAME" template.
  title: 'HM Parts Hub — Replacement Parts for Mobile Equipment',
};

const HOT_PNS = [
  '20Y-27-00300',
  '227-6913',
  '9233692',
  'K1000681A',
  '31E6-42000',
  'YN15V00037F1',
];

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function allPartNumbers(p: ModelPage): string[] {
  const g = p.part_number_groups;
  return [...(g.assembly ?? []), ...(g.motor ?? []), ...(g.service ?? [])];
}

function buildSearchEntries(): SearchEntry[] {
  return searchable.map((p) => {
    const ton = p.copy.ton_class_approx;
    const parts = [
      p.make_name,
      p.model_name,
      `${p.make_name}${p.model_name}`,
      ...p.model_aliases,
      ...allPartNumbers(p),
    ];
    if (typeof ton === 'number') parts.push(`${ton}t`, `${ton} t`, `~${ton}t`);
    return {
      make: p.make_name,
      model: p.model_name,
      ton: typeof ton === 'number' ? ton : null,
      leadPn: p.lead_pn,
      url: p.url_path,
      hay: parts.map(norm).join('|'),
    };
  });
}

/** Resolve a hot part number to the model page that carries it. */
function pageForPartNumber(pn: string): ModelPage | undefined {
  return searchable.find((p) => allPartNumbers(p).includes(pn));
}

const TRUST_ITEMS = [
  // A check we run before quoting — not a claim that fitment is already proven.
  'Nameplate-based fitment check',
  'China aftermarket sourcing',
  'Quote by part number',
];

const HOW_STEPS = [
  {
    t: 'Send the numbers',
    d: 'Share the OEM part number on your travel motor or gearbox, the machine serial number, and a nameplate photo.',
  },
  {
    t: 'We confirm the unit',
    d: 'Our team checks displacement, mounting pattern, sprocket interface and speed ratio against vetted factory supply.',
  },
  {
    t: 'Get a sourcing quote',
    d: 'Receive a clear quote with the technical confirmation attached — no guesswork, no blind cross-reference.',
  },
];

export default function HomePage() {
  const featured = featuredAcrossCategories(8);
  const brandGroups = makesAcrossCategories();

  const searchEntries = buildSearchEntries();
  const hotPns = HOT_PNS.map((pn) => ({ pn, page: pageForPartNumber(pn) })).filter(
    (h): h is { pn: string; page: ModelPage } => Boolean(h.page),
  );

  return (
    <div>
      {/* Hero */}
      <section className="v6-hero">
        <div className="v6-wrap">
          <p className="v6-kicker">Starting with excavator final drives &amp; travel gearboxes</p>
          <h1>
            Find Replacement Parts for <em>Mobile Equipment</em>
          </h1>
          <p className="v6-sub">
            Search by part number, equipment make or model. Fitment is confirmed
            against the part number, machine serial number and nameplate before
            quoting.
          </p>
          <p className="v6-data-note">{`Search ${MACHINE_COUNT} equipment models across ${brandGroups.length} brands.`}</p>
          <HomeSearch entries={searchEntries} />
          <p className="v6-search-hint">
            Popular OEM numbers — <b>tap a chip to open its model page</b>
          </p>
          <div className="v6-hotpns">
            <span className="v6-lbl">Hot:</span>
            {hotPns.map(({ pn, page }) => (
              <Link key={pn} href={page.url_path} className="v6-pnchip">
                {pn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="v6-trust" aria-label="Why buyers work with us">
        <div className="v6-wrap">
          {TRUST_ITEMS.map((t, i) => (
            <div key={t} className="ti">
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <b>{t}</b>
            </div>
          ))}
        </div>
      </section>

      {/* Current product range — one card per live category (growth rule §7) */}
      <section className="v6-block border-t border-border">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>Current product range</h2>
            <span className="rule" />
            <span className="cnt">{`${CATEGORY_CONFIGS.length} categories · ${modelPages.length} catalogue entries`}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORY_CONFIGS.map((cat) => {
              const catPages = pagesInCategory(cat.slug);
              const catMakes = makesInCategory(cat.slug);
              const shot = imageSize(cat.cardImage);
              return (
                <Link
                  key={cat.slug}
                  href={categoryPath(cat.slug)}
                  className="group flex items-center gap-5 rounded-xl border border-border bg-white p-5 transition-colors hover:border-[#1D2A33]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="v6-kicker">{cat.name}</div>
                    <p className="mt-2 text-lg font-semibold text-[#1D2A33]">{cat.cardTitle}</p>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5a6268]">
                      {cat.cardBlurb}
                    </p>
                    <span className="mt-3 inline-block text-[12.5px] font-medium text-[#7e8a93]">
                      {`${catPages.length} models · ${catMakes.length} brands`}
                    </span>
                  </div>
                  {/* Contained, never cropped — same treatment as the model cards. */}
                  <figure className="hidden h-[132px] w-[132px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1e2a33] lg:flex">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/products/${cat.cardImage}`}
                      alt={`${cat.unitName} assembly`}
                      width={shot.width}
                      height={shot.height}
                      loading="lazy"
                      className="h-full w-full object-contain p-3"
                    />
                  </figure>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section id="makes" className="v6-block">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>Browse by make</h2>
            <span className="rule" />
            <span className="cnt">{`${brandGroups.length} brands · ${MACHINE_COUNT} machines`}</span>
          </div>
          <div className="v6-brands">
            {brandGroups.map((group) => (
              <Link
                key={group.make.slug}
                href={brandEntryPath(group.make.slug)}
                className="v6-brandchip"
              >
                <span className="b-name">{group.make.name}</span>
                <span className="b-count">{group.models}</span>
                <span className="sr-only">
                  {`${group.models} ${group.make.name} ${
                    group.models === 1 ? 'model' : 'models'
                  }, ${group.entries} catalogue ${group.entries === 1 ? 'entry' : 'entries'}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured models */}
      <section className="v6-block border-t border-border">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>Featured equipment models</h2>
            <span className="rule" />
            <span className="cnt">{`${featured.length} of ${MACHINE_COUNT} machines`}</span>
          </div>
          <div className="v6-mgrid">
            {featured.map((page) => (
              <ModelCard key={page.url_path} page={page} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="v6-how v6-block">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>How it works</h2>
            <span className="rule" />
            <span className="cnt">3 steps</span>
          </div>
          <div className="v6-steps">
            {HOW_STEPS.map((s, i) => (
              <div key={s.t} className="v6-step">
                <span className="sn">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <b>{s.t}</b>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="v6-ctaband">
        <div className="v6-wrap">
          <div>
            <h2>Have a nameplate photo?</h2>
            <p>
              Send it through and we will confirm the exact part for your
              machine before quoting.
            </p>
          </div>
          <Link href={RFQ_PATH} className="v6-btn v6-btn-primary v6-btn-lg">
            Request a quote
          </Link>
        </div>
      </section>
    </div>
  );
}
