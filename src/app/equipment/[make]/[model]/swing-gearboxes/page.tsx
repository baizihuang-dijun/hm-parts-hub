import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  categoryOf,
  getModelPage,
  modelDescription,
  makes,
  pagesByMake,
} from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { ModelCategoryPageView } from '@/components/model-category-page';

const CATEGORY = 'swing-gearboxes';

type RouteParams = Promise<{ make: string; model: string }>;

export function generateStaticParams(): { make: string; model: string }[] {
  return makes.flatMap(m =>
    pagesByMake(m.slug, CATEGORY).map(p => ({ make: p.make_slug, model: p.model_slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { make, model } = await params;
  const page = getModelPage(make, model, CATEGORY);
  if (!page) return {};
  // The root layout applies a "%s | <site>" title template, so pass the bare title.
  return buildMetadata({
    title: page.title,
    description: modelDescription(page),
    path: page.url_path,
  });
}

export default async function Page({ params }: { params: RouteParams }) {
  const { make, model } = await params;
  const page = getModelPage(make, model, CATEGORY);
  if (!page) notFound();
  return <ModelCategoryPageView page={page} category={categoryOf(CATEGORY)} />;
}
