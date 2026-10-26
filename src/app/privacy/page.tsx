import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE_NAME } from '@/config/site';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ConsentSettings } from '@/components/consent-settings';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `Privacy policy for ${SITE_NAME}: what we collect through the RFQ form, analytics consent, and your choices.`,
  path: '/privacy/',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <p className="mt-2">
            When you submit an RFQ, we receive the details you enter: name, company, email,
            phone, country, part numbers, machine make/model, serial number, message, and
            any photos you attach (typically nameplate and mounting-face photos). This
            information is used solely to identify and source the part you requested and
            to communicate with you about that request.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Form processing</h2>
          <p className="mt-2">
            RFQ submissions are delivered to our sourcing mailbox via the Web3Forms form
            endpoint. Do not submit information you are not allowed to share. We do not
            sell or rent submitted data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Analytics &amp; consent</h2>
          <p className="mt-2">
            Google Analytics 4 is used on this site only after you explicitly accept
            analytics in the consent banner. By default — and if you decline — no
            analytics script is loaded and no analytics data is collected. Your choice is
            stored in your browser&apos;s local storage on this device only.
          </p>
          <div className="mt-4">
            <ConsentSettings />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Trademark notice</h2>
          <p className="mt-2">
            All manufacturer names, model designations and part numbers referenced on this
            site are trademarks of their respective owners, used for identification
            purposes only. {SITE_NAME} is not an authorized dealer of, and is not
            affiliated with or endorsed by, any of these manufacturers.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            For privacy questions or data removal requests, contact us via the RFQ page or
            by email.
          </p>
        </section>
      </div>
    </div>
  );
}
