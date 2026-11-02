import fdRaw from '@/content/public_batch1.json';
import tgRaw from '@/content/travel_gearboxes.json';
import sdRaw from '@/content/swing_drives.json';

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
  gearbox?: string[];
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
  groupLabels: Record<'assembly' | 'gearbox' | 'motor' | 'service', string>;
  /** Headline on the home "Current product range" card — what the range covers. */
  cardTitle: string;
  /** One-line blurb under that headline. */
  cardBlurb: string;
  /** Product photo shown beside the card copy. */
  cardImage: string;
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
      gearbox: 'Gearbox numbers',
      motor: 'Travel motor numbers',
      service: 'Service & repair kit numbers',
    },
    cardTitle: 'Final drives & travel motors',
    cardBlurb:
      'Replacement assemblies for excavators, matched to OEM and aftermarket part numbers.',
    cardImage: 'caterpillar-320-final-drive.jpg',
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
      gearbox: 'Gearbox numbers',
      motor: 'Travel motor numbers',
      service: 'Service & repair kit numbers',
    },
    cardTitle: 'Travel gearboxes & reduction units',
    cardBlurb:
      'Crawler excavator units matched against the OEM number, machine serial and the tag on the existing gearbox.',
    cardImage: 'komatsu-pc300-7-travel-gearbox-2.jpg',
  },
  {
    slug: 'swing-drives',
    name: 'Swing Drives',
    unitName: 'Swing Drive',
    unitNameSentence: 'swing drive',
    kicker: 'swing drive',
    schemaCategory: 'Swing drive / swing gearbox / swing motor assembly',
    groupLabels: {
      assembly: 'Swing drive assembly numbers',
      gearbox: 'Swing gearbox numbers',
      motor: 'Swing motor numbers',
      service: 'Service & repair kit numbers',
    },
    cardTitle: 'Swing drives, gearboxes & swing motors',
    cardBlurb:
      'Slewing units matched to the OEM reference numbers published for each machine, then confirmed on serial number before quoting.',
    cardImage: 'caterpillar-336d-swing-drive.jpg',
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
const sd = sdRaw as unknown as BatchData;

/** Category slug attached to every page so lookups never cross categories. */
function withCategory(pages: ModelPage[], slug: string): ModelPage[] {
  return pages.map(p => ({ ...p, category_slug: slug }));
}

export const data = fd;

/** Category hub intro paragraph for the given category slug. */
export function categoryIntro(slug: string = DEFAULT_CATEGORY): string {
  if (slug === 'travel-gearboxes') return tg.category.intro;
  if (slug === 'swing-drives') return sd.category.intro;
  return fd.category.intro;
}

/** All published model pages across every category. These are the ONLY equipment routes. */
export const modelPages: ModelPage[] = [
  ...withCategory(fd.pages, 'final-drives'),
  ...withCategory(tg.pages, 'travel-gearboxes'),
  ...withCategory(sd.pages, 'swing-drives'),
];

/** Union of makes across categories, first occurrence wins. */
export const makes: Make[] = (() => {
  const seen = new Set<string>();
  const out: Make[] = [];
  for (const m of [...fd.makes, ...tg.makes, ...sd.makes]) {
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
export const GROUP_ORDER = ['assembly', 'gearbox', 'motor', 'service'] as const;
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

/**
 * Brands that get a cross-category landing page at /parts/for/{make}/.
 *
 * Not a formula, and not a permanent roster. These are the brands where the
 * catalogue covers enough machines that "pick your model" beats browsing
 * category by category. CASE (3 models), Kobelco (3), Sumitomo (3), JCB (1),
 * Kato (1) and Kubota (1) stay category-only for now — their machines are
 * already one screen long inside the category brand hub, so a separate page
 * would add a click without adding navigation value. Their home-page chips
 * fall back to that hub, so nothing is orphaned. Revisit per brand when its
 * catalogue grows, not against a model-count threshold.
 */
export const BRAND_PAGE_MAKES: string[] = [
  'caterpillar',
  'hitachi',
  'komatsu',
  'doosan',
  'volvo',
  'sany',
  'xcmg',
  'hyundai',
];

/** Cross-category brand landing page, e.g. /parts/for/caterpillar/. */
export function brandPagePath(makeSlug: string): string {
  return `/parts/for/${makeSlug}/`;
}

/**
 * Where a brand chip should point. Brands with a cross-category page go there;
 * everyone else falls back to the category brand hub holding most of their
 * machines, so a chip is never a dead link.
 */
export function brandEntryPath(makeSlug: string): string {
  if (BRAND_PAGE_MAKES.includes(makeSlug)) return brandPagePath(makeSlug);
  let best = CATEGORY_CONFIGS[0].slug;
  let bestCount = -1;
  for (const cat of CATEGORY_CONFIGS) {
    const n = pagesByMake(makeSlug, cat.slug).length;
    if (n > bestCount) {
      best = cat.slug;
      bestCount = n;
    }
  }
  return brandHubPath(makeSlug, best);
}

/**
 * Equipment type for a machine, derived from the copy field the catalogue
 * already carries. Nothing is hardcoded to "excavator": the batch includes a
 * compact track loader and several mini excavators, and this keeps them
 * distinct instead of silently flattening the range into one machine type.
 * No new database column — a future loader or dozer only needs its
 * machine_kind filled in.
 */
export function equipmentType(page: ModelPage): string {
  const kind = (page.copy.machine_kind ?? 'excavator').toLowerCase().trim();
  if (kind.includes('excavator')) return 'excavator';
  return kind || 'excavator';
}

export function equipmentTypeLabel(type: string, count = 2): string {
  const one = count === 1;
  if (type === 'excavator') return one ? 'excavator' : 'excavators';
  if (type === 'compact track loader') {
    return one ? 'compact track loader' : 'compact track loaders';
  }
  return one ? type : `${type}s`;
}

/** Every catalogue entry for a make, across all live categories. */
export function pagesByMakeAllCategories(makeSlug: string): ModelPage[] {
  return modelPages.filter(p => p.make_slug === makeSlug);
}

/**
 * Distinct machines in a set of catalogue entries.
 *
 * One machine can hold a page in more than one category, so entry count and
 * machine count are different numbers and must never be shown as one. Cat has
 * 48 entries but 38 machines.
 */
export function distinctModelCount(pages: ModelPage[]): number {
  return new Set(pages.map(p => `${p.make_slug}:${p.model_slug}`)).size;
}

export interface MakeGroup {
  make: Make;
  /** Catalogue entries — one per model x category pair. */
  entries: number;
  /** Distinct machines. Smaller than `entries` when a model spans categories. */
  models: number;
  byCategory: { category: CategoryConfig; entries: number }[];
  /** Equipment types present, most common first. */
  equipmentTypes: string[];
}

/** Every make across all live categories, richest first. */
export function makesAcrossCategories(): MakeGroup[] {
  const out: MakeGroup[] = [];
  for (const make of makes) {
    const own = pagesByMakeAllCategories(make.slug);
    if (own.length === 0) continue;
    const byCategory = CATEGORY_CONFIGS.map(category => ({
      category,
      entries: own.filter(p => p.category_slug === category.slug).length,
    })).filter(row => row.entries > 0);

    const typeCount = new Map<string, number>();
    for (const p of own) {
      const t = equipmentType(p);
      typeCount.set(t, (typeCount.get(t) ?? 0) + 1);
    }

    out.push({
      make,
      entries: own.length,
      models: distinctModelCount(own),
      byCategory,
      equipmentTypes: [...typeCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t),
    });
  }
  return out.sort((a, b) => b.entries - a.entries || a.make.name.localeCompare(b.make.name));
}

export interface MakeModelRow {
  modelSlug: string;
  modelName: string;
  ton: number | null;
  listings: { category: CategoryConfig; page: ModelPage }[];
}

/** One row per machine for a make, lightest first, missing tonnage last. */
export function makeModelRows(makeSlug: string): MakeModelRow[] {
  const rows = new Map<string, MakeModelRow>();
  for (const page of pagesByMakeAllCategories(makeSlug)) {
    let row = rows.get(page.model_slug);
    if (!row) {
      row = {
        modelSlug: page.model_slug,
        modelName: page.model_name,
        ton: typeof page.copy.ton_class_approx === 'number' ? page.copy.ton_class_approx : null,
        listings: [],
      };
      rows.set(page.model_slug, row);
    }
    row.listings.push({ category: categoryOf(page.category_slug), page });
  }
  for (const row of rows.values()) {
    row.listings.sort((a, b) => a.category.slug.localeCompare(b.category.slug));
  }
  return [...rows.values()].sort((a, b) => {
    if (a.ton === null && b.ton === null) return a.modelName.localeCompare(b.modelName);
    if (a.ton === null) return 1;
    if (b.ton === null) return -1;
    return a.ton - b.ton || a.modelName.localeCompare(b.modelName);
  });
}

/**
 * Featured machines for the home page, balanced across categories.
 *
 * Each category contributes its own picks so the row never becomes six
 * final drives, and the same machine is never listed twice when it has pages
 * in both categories.
 */
export function featuredAcrossCategories(count = 8): ModelPage[] {
  const live = CATEGORY_CONFIGS.filter(cat => pagesInCategory(cat.slug).length > 0);
  if (live.length === 0) return [];
  const perCategory = Math.ceil(count / live.length);
  const out: ModelPage[] = [];
  const seenPage = new Set<string>();
  const seenBrand = new Set<string>();

  const push = (page: ModelPage): void => {
    const key = `${page.make_slug}:${page.model_slug}`;
    if (out.length >= count || seenPage.has(key)) return;
    seenPage.add(key);
    seenBrand.add(page.make_slug);
    out.push(page);
  };

  // Pass 1: one machine per brand per category, so the row reads as a spread of
  // makes instead of six Caterpillars.
  for (const cat of live) {
    let taken = 0;
    for (const page of featuredModels(pagesInCategory(cat.slug), perCategory * 4)) {
      if (taken >= perCategory || out.length >= count) break;
      if (seenBrand.has(page.make_slug)) continue;
      push(page);
      taken += 1;
    }
  }
  // Pass 2: fill any remaining slots; repeating a brand is fine here.
  for (const cat of live) {
    for (const page of featuredModels(pagesInCategory(cat.slug), perCategory * 4)) {
      if (out.length >= count) break;
      push(page);
    }
  }
  return out.slice(0, count);
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
    ...BRAND_PAGE_MAKES.filter(slug => Boolean(getMake(slug))).map(brandPagePath),
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
