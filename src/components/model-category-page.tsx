import Link from 'next/link';
import {
  CATEGORY_CONFIGS,
  brandHubPath,
  categoryPath,
  getModelPage,
  mainImage,
  modelDescription,
  partGroups,
  hasPartNumbers,
  GUIDE_PATH,
  type CategoryConfig,
  type ModelPage,
  type PartGroupKey,
} from '@/lib/data';
import { ImageGallery, type GalleryImage } from '@/components/image-gallery';
import { CopyPnButton, QuoteThisLink } from '@/components/pn-actions';
import { ModelRfqForm } from '@/components/model-rfq-form';
import { SITE_NAME, absoluteUrl } from '@/config/site';

/** 'final drive' -> 'Final drive' (only the first character changes). */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function rfqHref(page: ModelPage, pn?: string): string {
  const params = new URLSearchParams({
    make: page.make_name,
    model: page.model_name,
  });
  if (pn) params.set('pn', pn);
  return `/request-quote/?${params.toString()}`;
}

/* ---------- per-model buying FAQ (rendered as <details> + FAQPage JSON-LD) ---------- */

function faqs(page: ModelPage, cat: CategoryConfig): { q: string; a: string }[] {
  const machine = `${page.make_name} ${page.model_name}`;
  return [
    {
      q: `What is the lead time for a ${machine} ${cat.unitNameSentence}?`,
      a: 'Lead time depends on the confirmed configuration and the supply route for your unit. Once we have matched the unit to your tag, the quote states packing dimensions, gross weight and the current lead time — these are confirmed per order rather than posted as blanket promises.',
    },
    {
      q: 'Do I need the nameplate part number to order?',
      a: 'It is the fastest way, but not required. Send a clear photo of the travel-motor nameplate together with the machine serial number and we identify the unit from the tag instead of guessing from the model name.',
    },
    {
      q: 'Is this an OEM or an aftermarket unit?',
      a: 'We source from vetted China aftermarket and OEM-equivalent manufacturers. Each quote states the supply type and country of origin for that specific unit, so you know exactly what you are buying.',
    },
    {
      q: 'How do you confirm the unit fits my machine?',
      a: 'We match the OEM number and machine serial, check the nameplate photo, and verify displacement, mounting bolt pattern, sprocket interface and speed ratio against the factory data sheet. The configuration is confirmed on paper before anything ships.',
    },
    {
      q: 'Do you ship worldwide?',
      a: 'Yes. We arrange EXW, FOB, CIF or air freight depending on destination and urgency. Shipping method, packing and terms are stated on your individual quote.',
    },
    {
      q: 'When will I receive my quote, and how long is it valid?',
      a: 'We reply after the configuration check is complete, and the quote states its own validity period. Complete nameplate details up front keep the turnaround short.',
    },
  ];
}

export function modelJsonLd(page: ModelPage, cat: CategoryConfig): object {
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
            name: cat.name,
            item: absoluteUrl(categoryPath(cat.slug)),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.make_name,
            item: absoluteUrl(brandHubPath(page.make_slug, cat.slug)),
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
        name: `${cat.unitName} for ${page.make_name} ${page.model_name}`,
        category: cat.schemaCategory,
        image: main ? [absoluteUrl(`/images/products/${main.file}`)] : undefined,
        brand: { '@type': 'Brand', name: SITE_NAME },
        description: modelDescription(page),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs(page, cat).map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

function galleryImages(page: ModelPage, cat: CategoryConfig): GalleryImage[] {
  const main = mainImage(page);
  const ordered = main ? [main, ...page.images.filter(i => i !== main)] : page.images;
  const unit = cap(cat.unitNameSentence);
  return ordered.map((img, idx) => ({
    file: img.file,
    alt:
      idx === 0
        ? `${unit} assembly for ${page.make_name} ${page.model_name} excavator`
        : `${unit} for ${page.make_name} ${page.model_name} excavator — additional view ${idx}`,
  }));
}

/** Group subtitle (mono chip) and per-row type label, keyed by JSON group. */
const GROUP_META: Record<PartGroupKey, { code: string; role: string }> = {
  assembly: { code: 'complete unit', role: 'assembly' },
  motor: { code: 'hydraulic motor only', role: 'travel motor' },
  service: { code: 'components / seals', role: 'service part' },
};

const FIT_CHECKLIST: { what: string; why: string }[] = [
  { what: 'OEM number stamped on the unit', why: 'identifies the build' },
  { what: 'Machine serial number', why: 'year & region' },
  { what: 'Clear nameplate photo', why: 'removes tag-reading errors' },
  {
    what: 'We verify 4 fit points',
    why: 'displacement · mounting holes · sprocket interface · speed ratio',
  },
];

export function ModelCategoryPageView({
  page,
  category: cat,
}: {
  page: ModelPage;
  category: CategoryConfig;
}) {
  const images = galleryImages(page, cat);
  const groups = partGroups(page);
  const hasNumbers = hasPartNumbers(page);
  const ton = page.copy.ton_class_approx;
  const faqItems = faqs(page, cat);
  const unit = cap(cat.unitNameSentence);
  /* Cross-category links: the same machine often needs parts from both ranges. */
  const crossLinks = CATEGORY_CONFIGS.filter((c) => c.slug !== cat.slug)
    .map((c) => ({ category: c, target: getModelPage(page.make_slug, page.model_slug, c.slug) }))
    .filter((x): x is { category: CategoryConfig; target: ModelPage } => Boolean(x.target));

  return (
    <div className="pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(modelJsonLd(page, cat)) }}
      />

      {/* Breadcrumb */}
      <div className="v6-wrap">
        <nav className="v6-crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={categoryPath(cat.slug)}>{cat.name}</Link>
          <span>/</span>
          <Link href={brandHubPath(page.make_slug, cat.slug)}>{page.make_name}</Link>
          <span>/</span>
          {page.model_name}
        </nav>
      </div>

      {/* Identity bar — CSS uppercases visually; source keeps JSON casing for checks. */}
      <div className="v6-idbar">
        <div className="v6-wrap">
          <i className="idi">
            <b>{page.make_name.toUpperCase()}</b>
          </i>
          <i className="idi">
            <b>{page.model_name}</b>
          </i>
          <i className="idi idi-kind">
            {typeof ton === 'number'
              ? `${page.copy.machine_kind} undercarriage · ~${ton} T class`
              : `${page.copy.machine_kind} undercarriage`}
          </i>
          {page.copy.band ? <i className="idi idi-kind">{page.copy.band}</i> : null}
          <i className="idi idi-ok">● page data verified to catalog</i>
        </div>
      </div>

      {/* Gallery + buy column */}
      <div className="v6-wrap v6-model-grid">
        <ImageGallery images={images} caption={`${unit} for ${page.make_name} ${page.model_name}`} />

        <div className="v6-buy">
          <div className="v6-kicker">Sourcing &amp; RFQ · {cat.unitNameSentence}</div>
          <h1>{page.h1}</h1>
          <p className="v6-lead">{page.copy.intro}</p>
          <div className="v6-cta-row">
            <a href="#rfq" className="v6-btn v6-btn-primary v6-btn-lg">
              Request a quote — {page.model_name}
            </a>
            <a href="#rfq" className="v6-btn v6-btn-outline v6-btn-lg">
              Send nameplate photo
            </a>
          </div>
          <ul className="v6-assure">
            <li>
              <span className="v6-tick">✓</span>
              <span>Configuration matched to OEM number, serial &amp; nameplate before you commit</span>
            </li>
            <li>
              <span className="v6-tick">✓</span>
              <span>Sourced from vetted China aftermarket / OEM-equivalent factories</span>
            </li>
            <li>
              <span className="v6-tick">✓</span>
              <span>One technical contact from RFQ through delivery</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Part numbers */}
      <section className="v6-pnsection" id="numbers">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>{page.copy.pn_heading}</h2>
            <span className="rule" />
            <span className="cnt">cross-check against your tag</span>
          </div>
          <p className="v6-pn-note">{page.copy.pn_note}</p>

          {hasNumbers ? (
            groups.map(group => (
              <div className="v6-pn-group" key={group.key}>
                <div className="v6-pn-gtitle">
                  <h3>{group.label}</h3>
                  <span className="gcode">{GROUP_META[group.key].code}</span>
                  <span className="rule" />
                </div>
                <table className="v6-pn">
                  <thead>
                    <tr>
                      <th scope="col">Part number</th>
                      <th scope="col">Type</th>
                      <th scope="col" className="th-act">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.numbers.map(pn => (
                      <tr key={pn}>
                        <td className="pn-num">{pn}</td>
                        <td className="pn-role">{GROUP_META[group.key].role}</td>
                        <td className="pn-act">
                          <CopyPnButton pn={pn} />
                          <QuoteThisLink pn={pn} href={rfqHref(page, pn)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="v6-nonum">
              <div>
                <h3 style={{ margin: 0, fontSize: '17px' }}>Need the right part number?</h3>
                <p>
                  Numbering varies by serial number and build region. Send a photo of the
                  travel-motor nameplate and the machine serial — we identify the correct unit
                  from the tag instead of guessing from the model name.
                </p>
              </div>
              <Link href={rfqHref(page)} className="v6-btn v6-btn-primary v6-btn-lg">
                Send my nameplate
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Lower: prose + sticky RFQ */}
      <div className="v6-wrap v6-lower">
        <div className="v6-prose">
          <h2>{`Why source this ${cat.unitNameSentence} through us`}</h2>
          <p>{page.copy.sourcing}</p>

          <h2>Confirm the exact fit before you order</h2>
          <p>{page.copy.fit_check}</p>
          <ul className="v6-checklist">
            {FIT_CHECKLIST.map((item, i) => (
              <li key={item.what}>
                <span className="ck">{`0${i + 1}`}</span>
                <span className="what">{item.what}</span>
                <span className="why">{item.why}</span>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '14px' }}>
            Not sure how to read the tag? Follow the{' '}
            <Link href={GUIDE_PATH}>nameplate check guide</Link>.
          </p>

          <h2>Same model name can mean a different unit</h2>
          <p className="v6-gennote">{page.copy.generation_note}</p>

          {crossLinks.length > 0 ? (
            <>
              <h2>Also sourcing for this model</h2>
              <p>
                {`This machine also has a ${crossLinks
                  .map((l) => l.category.unitNameSentence)
                  .join(' and ')} page on this site, with its own photos and sourcing notes.`}
              </p>
              <ul className="mt-3 space-y-2">
                {crossLinks.map(({ category: other, target }) => (
                  <li key={other.slug}>
                    <Link
                      href={target.url_path}
                      className="text-[14.5px] font-medium text-[#1D2A33] underline decoration-[#c9cdd2] underline-offset-4 hover:decoration-[#1D2A33]"
                    >
                      {`${other.unitName} for ${page.make_name} ${page.model_name}`}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <ModelRfqForm make={page.make_name} model={page.model_name} />
      </div>

      {/* FAQ */}
      <section className="v6-faq">
        <div className="v6-wrap">
          <div className="v6-sec-head">
            <h2>Buying questions</h2>
            <span className="rule" />
          </div>
          {faqItems.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <div className="ans">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="v6-ctaband">
        <div className="v6-wrap">
          <div>
            <h2>{`Get your ${page.make_name} ${page.model_name} back on track`}</h2>
            <p>
              Tell us the part number — or send a nameplate photo — and we&apos;ll confirm the
              right unit and quote.
            </p>
          </div>
          <a href="#rfq" className="v6-btn v6-btn-primary v6-btn-lg">
            Request a quote
          </a>
        </div>
      </section>

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Link
          href={rfqHref(page)}
          className="v6-btn v6-btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Request a quote — {page.make_name} {page.model_name}
        </Link>
      </div>
    </div>
  );
}
