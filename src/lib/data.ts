import rawData from '@/content/public_batch1.json';

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
 * groups; headings come from GROUP_LABELS below.
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

export const data = rawData as unknown as BatchData;

/** All published model pages. These are the ONLY equipment routes. */
export const modelPages: ModelPage[] = data.pages;

/** All makes listed in the batch file. */
export const makes: Make[] = data.makes;

export function getModelPage(make: string, model: string): ModelPage | undefined {
  return modelPages.find(p => p.make_slug === make && p.model_slug === model);
}

export function getMake(slug: string): Make | undefined {
  return makes.find(m => m.slug === slug);
}

export function pagesByMake(makeSlug: string): ModelPage[] {
  return sortPagesByTonnage(modelPages.filter(p => p.make_slug === makeSlug));
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

/** Group display order and headings for the part-number section. */
export const GROUP_ORDER = ['assembly', 'motor', 'service'] as const;
export type PartGroupKey = (typeof GROUP_ORDER)[number];

export const GROUP_LABELS: Record<PartGroupKey, string> = {
  assembly: 'Final drive assembly numbers',
  motor: 'Travel motor numbers',
  service: 'Service & repair kit numbers',
};

/** Non-empty part-number groups in display order. */
export function partGroups(page: ModelPage): { key: PartGroupKey; label: string; numbers: string[] }[] {
  const groups = page.part_number_groups ?? {};
  return GROUP_ORDER.map(key => ({ key, label: GROUP_LABELS[key], numbers: groups[key] ?? [] })).filter(
    g => g.numbers.length > 0,
  );
}

export function hasPartNumbers(page: ModelPage): boolean {
  return partGroups(page).length > 0;
}

export function modelDescription(page: ModelPage): string {
  if (page.meta_description) return page.meta_description;
  const ton =
    typeof page.copy.ton_class_approx === 'number'
      ? ` ~${page.copy.ton_class_approx} t class`
      : '';
  return (
    `Source a replacement final drive for the ${page.make_name} ${page.model_name} excavator${ton} ` +
    `from vetted China aftermarket and OEM-equivalent suppliers. We confirm the unit against ` +
    `the OEM part number, machine serial number and nameplate before quoting. Request a quote.`
  );
}

/** Brand hub path for a make. */
export function brandHubPath(makeSlug: string): string {
  return `/parts/final-drives/for/${makeSlug}/`;
}

/** Every public route, derived only from the JSON + fixed static pages. */
export function allPublicRoutes(): string[] {
  const routes: string[] = [
    '/',
    '/parts/final-drives/',
    ...makes.map(m => brandHubPath(m.slug)),
    ...modelPages.map(p => p.url_path),
    '/request-quote/',
    '/about/',
    '/privacy/',
    '/terms/',
    '/guides/how-to-check-excavator-final-drive-nameplate/',
  ];
  return routes;
}

export const GUIDE_PATH = '/guides/how-to-check-excavator-final-drive-nameplate/';
export const CATEGORY_PATH = '/parts/final-drives/';
export const RFQ_PATH = '/request-quote/';
