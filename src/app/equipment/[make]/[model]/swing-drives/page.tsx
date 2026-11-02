import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  categoryOf,
  getModelPage,
  modelDescription,
  makes,
  pagesByMake,
  swingRedirectParams,
  swingRedirectTarget,
} from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { ModelCategoryPageView } from '@/components/model-category-page';
import { MetaRedirect } from '@/components/meta-redirect';

const CATEGORY = 'swing-drives';

type RouteParams = Promise<{ make: string; model: string }>;

export function generateStaticParams(): { make: string; model: string }[] {
  const live = makes.flatMap(m =>
    pagesByMake(m.slug, CATEGORY).map(p => ({ make: p.make_slug, model: p.model_slug })),
  );
  // Retired URLs stay in the build so the published address never 404s; they render a
  // redirect stub instead of a product page.
  return [...live, ...swingRedirectParams()];
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { make, model } = await params;
  const page = getModelPage(make, model, CATEGORY);
  if (!page) return { robots: { index: false, follow: true } };
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
  if (!page) {
    const to = swingRedirectTarget(`/equipment/${make}/${model}/swing-drives/`);
    if (to) return <MetaRedirect to={to} />;
    notFound();
  }
  return <ModelCategoryPageView page={page} category={categoryOf(CATEGORY)} />;
}
