import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import {
  CATEGORY_PATH,
  GUIDE_PATH,
  RFQ_PATH,
  brandHubPath,
  data,
  makes,
  modelPages,
} from '@/lib/data';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: 'Excavator Final Drives — Sourcing & RFQ Hub',
  description:
    'Excavator final drives and travel motors: sourcing support across 13 brands with reported OEM cross-reference numbers and technical confirmation by part number, serial number and nameplate.',
  path: CATEGORY_PATH,
});

export default function FinalDrivesHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Final Drives' }]} />

      <div className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Category hub
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Excavator Final Drives &amp; Travel Motors
        </h1>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground/80 md:text-base">
          <p>
            The final drive is the last reduction stage between the travel motor and the
            track — and one of the most failure-exposed assemblies on any excavator. When
            it goes, the machine stops. This hub organizes our sourcing coverage for
            replacement final drives, travel motors and travel reduction gearboxes by
            machine brand and model.
          </p>
          <p>
            We do not sell from a catalog shelf. Each machine page lists OEM part numbers
            reported to fit that model as a starting reference, and every request is
            confirmed technically — by OEM part number, machine serial number and
            nameplate photos — before an order is placed. Units are sourced through a
            vetted OEM-equivalent aftermarket supply network in China.
          </p>
          <p>{data.category.intro}</p>
        </div>
      </div>

      {/* Brand navigation */}
      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Browse by brand</h2>
        <ul className="mt-5 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {makes.map(m => {
            const count = modelPages.filter(p => p.make_slug === m.slug).length;
            return (
              <li key={m.slug} className="bg-card">
                <Link
                  href={brandHubPath(m.slug)}
                  className="flex h-full flex-col justify-between px-4 py-4 transition-colors hover:bg-muted"
                >
                  <span className="text-sm font-semibold text-foreground">{m.name}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {count > 0
                      ? `${count} published model${count > 1 ? 's' : ''}`
                      : 'Sourcing on request'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Published model pages */}
      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Published machine model pages
        </h2>
        <div className="mt-5 overflow-x-auto border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Machine</th>
                <th className="px-4 py-3 font-semibold">Reported OEM numbers</th>
                <th className="px-4 py-3 font-semibold">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {modelPages.map(p => (
                <tr key={p.url_path}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.make_name} {p.model_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.reported_numbers.length} reported
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={p.url_path}
                      className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Final drive sourcing
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Guide + CTA */}
      <section className="mt-12 grid gap-6 border-t border-border pt-10 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Check before you request</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A clear photo of the final drive nameplate and the machine serial number is the
            fastest route to a confirmed match.
          </p>
          <Link
            href={GUIDE_PATH}
            className="mt-3 inline-block text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Read the nameplate check guide
          </Link>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Machine not listed?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Coverage beyond the published models is handled by RFQ. Send the machine
            make/model and any part numbers you have.
          </p>
          <Link
            href={RFQ_PATH}
            className="mt-3 inline-block bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Request a Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
