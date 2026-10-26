import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { ModelCard } from '@/components/model-card';
import { HomeSearch, type SearchEntry } from '@/components/home-search';
import {
  makes,
  modelPages,
  pagesByMake,
  brandHubPath,
  RFQ_PATH,
  type ModelPage,
} from '@/lib/data';

export const metadata: Metadata = buildMetadata({
  title: `Aftermarket Parts Sourcing for Mobile Machinery`,
  description:
    'Factory-direct sourcing for replacement excavator final drives and travel motors — vetted China aftermarket and OEM-equivalent supply, technical confirmation before every quote.',
  path: '/',
});

const FEATURED_MODELS = [
  'hyundai/r140lc-7',
  'caterpillar/320d',
  'komatsu/pc200-7',
  'kobelco/sk200-8',
  'hitachi/zx200-3',
  'doosan/dx225',
  'volvo/ec220d',
  'sany/sy285',
];

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
  return modelPages.map((p) => {
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
  return modelPages.find((p) => allPartNumbers(p).includes(pn));
}

const TRUST_ITEMS = [
  'Nameplate-verified fitment',
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
    t: 'Get a factory-direct quote',
    d: 'Receive a clear sourcing quote with the technical confirmation attached — no guesswork, no blind cross-reference.',
  },
];

export default function HomePage() {
  const featured = FEATURED_MODELS.map((key) => {
    const [make, model] = key.split('/');
    return modelPages.find((p) => p.make_slug === make && p.model_slug === model);
  }).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const searchEntries = buildSearchEntries();
  const hotPns = HOT_PNS.map((pn) => ({ pn, page: pageForPartNumber(pn) })).filter(
    (h): h is { pn: string; page: ModelPage } => Boolean(h.page),
  );

  return (
    <div>
      {/* Hero */}
      <section className="v6-hero">
        <div className="v6-wrap">
          <p className="v6-kicker">Replacement travel motor &amp; gearbox assemblies</p>
          <h1>
            Find the exact final drive by <em>part number.</em>
          </h1>
          <p className="v6-sub">
            {`Search ${modelPages.length} equipment models across ${makes.length} brands. Every unit is checked against the OEM number, serial number and nameplate before we quote — no blind cross-reference.`}
          </p>
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

      {/* Brands */}
      <section id="makes" className="v6-block">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>Browse final drives by make</h2>
            <span className="rule" />
            <span className="cnt">{`${makes.length} brands · ${modelPages.length} models`}</span>
          </div>
          <div className="v6-brands">
            {makes.map((make) => {
              const count = pagesByMake(make.slug).length;
              return (
                <Link
                  key={make.slug}
                  href={brandHubPath(make.slug)}
                  className="v6-brandchip"
                >
                  <span className="b-name">{make.name}</span>
                  <span className="b-count">{count}</span>
                  <span className="sr-only">{`${count} ${make.name} ${count === 1 ? 'model' : 'models'}`}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured models */}
      <section className="v6-block border-t border-border">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>Frequently requested models</h2>
            <span className="rule" />
            <span className="cnt">{`sample of ${modelPages.length}`}</span>
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
              Send it through and we will confirm the exact final drive for your
              machine before quoting factory-direct supply.
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
