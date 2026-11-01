import Link from 'next/link';
import {
  brandHubPath,
  categoryPath,
  RFQ_PATH,
  type CategoryConfig,
  type Make,
  type ModelPage,
} from '@/lib/data';
import { breadcrumbLd, graphLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ModelCard } from '@/components/model-card';

export function BrandHubView({
  makeInfo,
  pages,
  category: cat,
}: {
  makeInfo: Make;
  pages: ModelPage[];
  category: CategoryConfig;
}) {
  const hubPath = brandHubPath(makeInfo.slug, cat.slug);
  const hubPathRoot = categoryPath(cat.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graphLd([
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: cat.name, path: hubPathRoot },
                { name: makeInfo.name, path: hubPath },
              ]),
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: cat.name, href: hubPathRoot },
          { label: makeInfo.name },
        ]}
      />

      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
        {makeInfo.name} excavator {cat.name.toLowerCase()}
      </h1>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
        {`Replacement ${cat.unitNameSentence} and travel motor assemblies for ${pages.length} ${
          pages.length === 1 ? 'excavator model' : 'excavator models'
        } in the ${makeInfo.name} range. Each listing links to a sourcing page with the associated OEM numbers for that model. We confirm every unit against the part number, machine serial number and nameplate before quoting.`}
      </p>

      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map(page => (
          <li key={page.url_path}>
            <ModelCard page={page} />
          </li>
        ))}
      </ul>

      <section className="mt-12 rounded-lg border border-border bg-muted/40 p-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Sourcing for a {makeInfo.name} not listed here?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Send the model, machine serial number and the part number stamped on your travel motor
          or gearbox — or a photo of the nameplate — and we will confirm and quote the matching
          unit.
        </p>
        <Link
          href={`${RFQ_PATH}?make=${encodeURIComponent(makeInfo.name)}`}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-amber-700"
        >
          Request a quote
        </Link>
      </section>
    </div>
  );
}
