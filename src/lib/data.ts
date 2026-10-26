import rawData from '@/content/public_batch1.json';

export interface ReportedNumber {
  pn: string;
  status: string;
  part_type: string;
}

export interface PageImage {
  slug: string;
  tag: string;
  file: string;
}

export interface ModelPage {
  url_path: string;
  title: string;
  h1: string;
  publish_tier: string;
  meta_description: string | null;
  reported_numbers: ReportedNumber[];
  verification_note: string;
  make_slug: string;
  make_name: string;
  model_slug: string;
  model_name: string;
  model_aliases: string[];
  serial_note: string | null;
  images: PageImage[];
}

export interface Make {
  slug: string;
  name: string;
}

export interface BatchData {
  category: { slug: string; name: string; intro: string };
  makes: Make[];
  pages: ModelPage[];
}

export const data = rawData as unknown as BatchData;

/** All published model pages (batch 1). These are the ONLY equipment routes. */
export const modelPages: ModelPage[] = data.pages;

/** All 13 makes listed in the batch file. */
export const makes: Make[] = data.makes;

export function getModelPage(make: string, model: string): ModelPage | undefined {
  return modelPages.find(p => p.make_slug === make && p.model_slug === model);
}

export function getMake(slug: string): Make | undefined {
  return makes.find(m => m.slug === slug);
}

export function pagesByMake(makeSlug: string): ModelPage[] {
  return modelPages.filter(p => p.make_slug === makeSlug);
}

export function mainImage(page: ModelPage): PageImage | undefined {
  return page.images.find(i => i.tag === 'main') ?? page.images[0];
}

export function extraImages(page: ModelPage): PageImage[] {
  const main = mainImage(page);
  return page.images.filter(i => i !== main);
}

/** Reported numbers deduplicated by part number (source data may repeat rows). */
export function dedupedReportedNumbers(page: ModelPage): ReportedNumber[] {
  const seen = new Set<string>();
  const out: ReportedNumber[] = [];
  for (const r of page.reported_numbers) {
    if (seen.has(r.pn)) continue;
    seen.add(r.pn);
    out.push(r);
  }
  return out;
}

/**
 * Source data records part_type in Chinese. The public site is English-only,
 * so render a fixed English label instead of the raw value.
 */
const PART_TYPE_EN: Record<string, string> = {
  '终传动（总成范围未确认）': 'Final drive (assembly scope unconfirmed)',
  行走马达: 'Travel motor',
  完整行走总成: 'Complete travel assembly',
  行走减速箱: 'Travel reduction gearbox',
  驱动齿圈: 'Drive ring gear',
  行走维修件: 'Travel service parts',
  行走液压马达: 'Travel hydraulic motor',
};

export function partTypeEn(partType: string): string {
  return PART_TYPE_EN[partType] ?? 'Reported part (type unconfirmed)';
}

export function modelDescription(page: ModelPage): string {
  return (
    page.meta_description ??
    `Sourcing support for the ${page.make_name} ${page.model_name} final drive. ` +
      `Reported OEM cross-reference numbers for reference, technical confirmation by part number, ` +
      `serial number and nameplate before ordering. Request a quote.`
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
