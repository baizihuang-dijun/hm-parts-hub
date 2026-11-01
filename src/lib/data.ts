import fdRaw from '@/content/public_batch1.json';
import tgRaw from '@/content/travel_gearboxes.json';

export interface PageImage {
  slug: string;
  tag: string;
  file: string;
}

export interface ModelCopy {
  intro: string;
  sourcing: string;
  fit_check: string;
  pn_heading: string;
  pn_note: string;
  generation_note: string;
  application?: string;
  ton_class_approx?: number | null;
  band?: string;
  machine_kind: string;
}

/**
 * Pre-grouped part numbers shipped in the batch file. Render only non-empty
 * groups; headings come from groupLabels() below.
 */
export interface PartNumberGroups {
  assembly?: string[];
  motor?: string[];
  service?: string[];
}

export interface ModelPage {
  url_path: string;
  title: string;
  h1: string;
  publish_tier: string;
  meta_description: string | null;
  lead_pn: string;
  part_number_groups: PartNumberGroups;
  make_slug: string;
  make_name: string;
  model_slug: string;
  model_name: string;
  model_aliases: string[];
  serial_note: string | null;
  images: PageImage[];
  copy: ModelCopy;
  /** Which category this page belongs to. Always set at load time below. */
  category_slug: string;
}

export interface Make {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  intro: string;
}

export interface BatchData {
  category: Category;
  makes: Make[];
  pages: ModelPage[];
}

/**
 * Per-category presentation strings. The three axis URLs stay stable
 * (`/parts/{category}/`, `/parts/{category}/for/{make}/`,
 * `/equipment/{make}/{model}/{category}/`); only wording differs.
 */
export interface CategoryConfig {
  slug: string;
  /** Plural, used in nav and breadcrumbs. */
  name: string;
  /** Singular, used inside sentences and Product schema. */
  unitName: string;
  /** Lowercase singular for mid-sentence use. */
  unitNameSentence: string;
  /** Lowercase phrase for kickers. */
  kicker: string;
  /** schema.org Product.category value. */
  schemaCategory: string;
  /** Group headings for the part-number table. */
  groupLabels: Record<'assembly' | 'motor' | 'service', string>;
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    slug: 'final-drives',
    name: 'Final Drives',
    unitName: 'Final Drive',
    unitNameSentence: 'final drive',
    kicker: 'final drive',
    schemaCategory: 'Final drive / travel motor assembly',
    groupLabels: {
      assembly: 'Final drive assembly numbers',
      motor: 'Travel motor numbers',
      service: 'Service & repair kit numbers',
    },
  },
  {
    slug: 'travel-gearboxes',
    name: 'Travel Gearboxes',
    unitName: 'Travel Gearbox',
    unitNameSentence: 'travel gearbox',
    kicker: 'travel gearbox',
    schemaCategory: 'Travel gearbox / travel reduction unit',
    groupLabels: {
      assembly: 'Travel gearbox assembly numbers',
      motor: 'Travel motor numbers',
      service: 'Service & repair kit numbers',
    },
  },
];

export const DEFAULT_CATEGORY = 'final-drives';

export function categoryOf(slug: string | undefined): CategoryConfig {
  return (
    CATEGORY_CONFIGS.find(c => c.slug === (slug ?? DEFAULT_CATEGORY)) ?? CATEGORY_CONFIGS[0]
  );
}

const fd = fdRaw as unknown as BatchData;
const tg = tgRaw as unknown as BatchData;

/** Category slug attached to every page so lookups never cross categories. */
function withCategory(pages: ModelPage[], slug: string): ModelPage[] {
  return pages.map(p => ({ ...p, category_slug: slug }));
}

export const data = fd;

/** Category hub intro paragraph for the given category slug. */
export function categoryIntro(slug: string = DEFAULT_CATEGORY): string {
  if (slug === 'travel-gearboxes') return tg.category.intro;
  return fd.category.intro;
}

/** All published model pages across every category. These are the ONLY equipment routes. */
export const modelPages: ModelPage[] = [
  ...withCategory(fd.pages, 'final-drives'),
  ...withCategory(tg.pages, 'travel-gearboxes'),
];

/** Union of makes across categories, first occurrence wins. */
export const makes: Make[] = (() => {
  const seen = new Set<string>();
  const out: Make[] = [];
  for (const m of [...fd.makes, ...tg.makes]) {
    if (seen.has(m.slug)) continue;
    seen.add(m.slug);
    out.push(m);
  }
  return out;
})();

export function pagesInCategory(category: string): ModelPage[] {
  return modelPages.filter(p => p.category_slug === category);
}

export function makesInCategory(category: string): Make[] {
  const slugs = new Set(pagesInCategory(category).map(p => p.make_slug));
  return makes.filter(m => slugs.has(m.slug));
}

export function getModelPage(
  make: string,
  model: string,
  category: string = DEFAULT_CATEGORY,
): ModelPage | undefined {
  return modelPages.find(
    p => p.make_slug === make && p.model_slug === model && p.category_slug === category,
  );
}

export function getMake(slug: string): Make | undefined {
  return makes.find(m => m.slug === slug);
}

export function pagesByMake(makeSlug: string, category: string = DEFAULT_CATEGORY): ModelPage[] {
  return sortPagesByTonnage(
    modelPages.filter(p => p.make_slug === makeSlug && p.category_slug === category),
  );
}

/**
 * Brand hub listing order: by approximate operating weight (tonnage) ascending,
 * falling back to an alphanumeric model sort when tonnage is missing.
 */
export function sortPagesByTonnage(pages: ModelPage[]): ModelPage[] {
  const nat = (s: string): (string | number)[] =>
    s.toLowerCase().split(/(\d+)/).map(part => (/^\d+$/.test(part) ? Number(part) : part));

  return [...pages].sort((a, b) => {
    const ta = a.copy.ton_class_approx;
    const tb = b.copy.ton_class_approx;
    if (typeof ta === 'number' && typeof tb === 'number' && ta !== tb) return ta - tb;
    const ka = nat(a.model_name);
    const kb = nat(b.model_name);
    for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
      const va = ka[i] ?? '';
      const vb = kb[i] ?? '';
      if (va === vb) continue;
      if (typeof va === 'number' && typeof vb === 'number') return va - vb;
      return String(va).localeCompare(String(vb), 'en');
    }
    return 0;
  });
}

export function mainImage(page: ModelPage): PageImage | undefined {
  return page.images.find(i => i.tag === 'main') ?? page.images[0];
}

export function extraImages(page: ModelPage): PageImage[] {
  const main = mainImage(page);
  return page.images.filter(i => i !== main);
}

/** Group display order for the part-number section. */
export const GROUP_ORDER = ['assembly', 'motor', 'service'] as const;
export type PartGroupKey = (typeof GROUP_ORDER)[number];

/** Group headings for the given category. */
export function groupLabels(category?: string): Record<PartGroupKey, string> {
  return categoryOf(category).groupLabels;
}

/** Non-empty part-number groups in display order. */
export function partGroups(page: ModelPage): { key: PartGroupKey; label: string; numbers: string[] }[] {
  const groups = page.part_number_groups ?? {};
  const labels = groupLabels(page.category_slug);
  return GROUP_ORDER.map(key => ({ key, label: labels[key], numbers: groups[key] ?? [] })).filter(
    g => g.numbers.length > 0,
  );
}

export function hasPartNumbers(page: ModelPage): boolean {
  return partGroups(page).length > 0;
}

/**
 * Showcase skip list: models whose only usable photo shows several units stacked
 * up or a messy packing shot. The pages stay live and indexed — they just do not
 * get a card in the hub row until a clean single-unit photo comes in.
 */
const SHOWCASE_SKIP = new Set<string>([
  'travel-gearboxes:caterpillar:320-gc',
  'travel-gearboxes:hitachi:ex30',
  'travel-gearboxes:komatsu:pc20a',
  'travel-gearboxes:hitachi:zx670',
]);

/**
 * Hub showcase cards ("Common model requests").
 *
 * Deliberately NOT the lightest models in the catalog: mini excavators are a
 * small slice of the aftermarket, while 20-45 t machines are the volume end.
 * Picks mainstream mid-size models that carry part numbers, one per brand first,
 * then widens if the band is too thin to fill the row.
 */
export function featuredModels(pages: ModelPage[], count = 6): ModelPage[] {
  const ton = (p: ModelPage): number =>
    typeof p.copy.ton_class_approx === 'number' ? p.copy.ton_class_approx : 0;
  const usable = pages.filter(
    (p) => !SHOWCASE_SKIP.has(`${p.category_slug}:${p.make_slug}:${p.model_slug}`),
  );
  const inBand = usable.filter((p) => ton(p) >= 13 && ton(p) <= 45);
  const pool = inBand.length >= count ? inBand : usable;

  // Part numbers first, then lightest-to-heaviest inside each tier.
  const ranked = [...pool].sort((a, b) => {
    const pn = Number(hasPartNumbers(b)) - Number(hasPartNumbers(a));
    return pn !== 0 ? pn : ton(a) - ton(b);
  });

  const out: ModelPage[] = [];
  const seenBrand = new Set<string>();
  const take = (list: ModelPage[], limit: number): void => {
    for (const p of list) {
      if (out.length >= count || limit <= 0) break;
      if (seenBrand.has(p.make_slug) || out.includes(p)) continue;
      seenBrand.add(p.make_slug);
      out.push(p);
      limit -= 1;
    }
  };

  // Walk the tonnage tiers so one row never ends up as six 20-ton machines.
  // Only models with part numbers seed the row; blank-number models are the
  // last resort so the cards still look complete if a catalog is thin.
  const withNumbers = ranked.filter((p) => hasPartNumbers(p));
  const withoutNumbers = ranked.filter((p) => !hasPartNumbers(p));
  const TIERS: Array<[number, number]> = [
    [13, 20],
    [20, 30],
    [30, 46],
  ];
  const perTier = Math.ceil(count / TIERS.length);
  for (const [lo, hi] of TIERS) {
    take(
      withNumbers.filter((p) => ton(p) >= lo && ton(p) < hi),
      perTier,
    );
  }
  take(withNumbers, count);
  take(withoutNumbers, count);

  return out.sort((a, b) => ton(a) - ton(b));
}

export function modelDescription(page: ModelPage): string {
  if (page.meta_description) return page.meta_description;
  const cat = categoryOf(page.category_slug);
  const ton =
    typeof page.copy.ton_class_approx === 'number'
      ? ` ~${page.copy.ton_class_approx} t class`
      : '';
  return (
    `Source a replacement ${cat.unitNameSentence} for the ${page.make_name} ${page.model_name} excavator${ton} ` +
    `from vetted China aftermarket and OEM-equivalent suppliers. We confirm the unit against ` +
    `the OEM part number, machine serial number and nameplate before quoting. Request a quote.`
  );
}

/** Category hub path, e.g. /parts/final-drives/. */
export function categoryPath(category: string = DEFAULT_CATEGORY): string {
  return `/parts/${category}/`;
}

/** Brand hub path for a make inside a category. */
export function brandHubPath(makeSlug: string, category: string = DEFAULT_CATEGORY): string {
  return `/parts/${category}/for/${makeSlug}/`;
}

/** Every public route, derived only from the JSON + fixed static pages. */
export function allPublicRoutes(): string[] {
  const routes: string[] = ['/'];
  for (const cat of CATEGORY_CONFIGS) {
    const pages = pagesInCategory(cat.slug);
    if (pages.length === 0) continue;
    routes.push(categoryPath(cat.slug));
    routes.push(...makesInCategory(cat.slug).map(m => brandHubPath(m.slug, cat.slug)));
    routes.push(...pages.map(p => p.url_path));
  }
  routes.push(
    '/request-quote/',
    '/about/',
    '/privacy/',
    '/terms/',
    GUIDE_PATH,
  );
  return routes;
}

export const GUIDE_PATH = '/guides/how-to-check-excavator-final-drive-nameplate/';
export const CATEGORY_PATH = '/parts/final-drives/';
export const RFQ_PATH = '/request-quote/';
