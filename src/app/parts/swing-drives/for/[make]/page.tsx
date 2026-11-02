import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  categoryOf,
  makesInCategory,
  getMake,
  pagesByMake,
  sortPagesByTonnage,
  brandHubPath,
} from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { BrandHubView } from '@/components/brand-hub-view';

const CATEGORY = 'swing-drives';

type RouteParams = Promise<{ make: string }>;

export function generateStaticParams(): { make: string }[] {
  return makesInCategory(CATEGORY).map(m => ({ make: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { make } = await params;
  const makeInfo = getMake(make);
  if (!makeInfo) return {};
  const pages = pagesByMake(makeInfo.slug, CATEGORY);
  const models = pages.map(p => p.model_name).join(', ');
  return buildMetadata({
    title: `${makeInfo.name} Excavator Swing Drives & Swing Motors — Sourcing & RFQ`,
    description:
      `Replacement swing drives and swing motors for ${makeInfo.name} excavators (${models}). ` +
      `Vetted China aftermarket and OEM-equivalent supply, fitment confirmed by part number, serial number and nameplate before quoting.`,
    path: brandHubPath(makeInfo.slug, CATEGORY),
  });
}

export default async function Page({ params }: { params: RouteParams }) {
  const { make } = await params;
  const makeInfo = getMake(make);
  if (!makeInfo) notFound();
  const pages = sortPagesByTonnage(pagesByMake(makeInfo.slug, CATEGORY));
  return <BrandHubView makeInfo={makeInfo} pages={pages} category={categoryOf(CATEGORY)} />;
}
