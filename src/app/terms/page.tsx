import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/config/site';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Use',
  description: `Terms of use for ${SITE_NAME}: sourcing-support service scope, cross-reference data, and identification-only trademark use.`,
  path: '/terms/',
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Use' }]} />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Terms of Use
      </h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Service scope</h2>
          <p className="mt-2">
            {SITE_NAME} provides identification and sourcing support for mobile machinery
            aftermarket parts. This website is not an online store: it does not list
            prices, does not take payment and does not process orders. Submitting an RFQ
            creates no obligation on either side.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Part number information</h2>
          <p className="mt-2">
            Part numbers shown on this site are catalog numbers commonly associated with
            the listed machines. Because the same model name can cover multiple build
            configurations, numbers should be checked against the tag on your unit rather
            than used as the sole basis for ordering. Every sourcing request is confirmed
            by OEM part number, machine serial number and nameplate before an order is
            placed.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">No affiliation</h2>
          <p className="mt-2">
            All manufacturer names, model designations and part numbers are trademarks of
            their respective owners and are used for identification purposes only.{' '}
            {SITE_NAME} is not an authorized dealer of, and is not affiliated with or
            endorsed by, any of these manufacturers. References to OEM parts describe
            compatibility information only.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Content accuracy</h2>
          <p className="mt-2">
            We work to keep machine coverage and part-number listings accurate, but all
            content is provided as-is without warranty. Fitment decisions are made only
            through the confirmation process described above.
          </p>
        </section>
      </div>
    </div>
  );
}
