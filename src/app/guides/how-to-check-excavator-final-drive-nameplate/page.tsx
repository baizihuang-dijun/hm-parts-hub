import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { GUIDE_PATH, RFQ_PATH } from '@/lib/data';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { breadcrumbLd, graphLd } from '@/lib/schema';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = buildMetadata({
  title: 'How to Check an Excavator Final Drive Nameplate',
  description:
    'Step-by-step guide: where to find the final drive nameplate on an excavator, what to photograph, and how part number, serial number and nameplate together confirm the correct replacement.',
  path: GUIDE_PATH,
});

export default function NameplateGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graphLd([
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: 'Final drive nameplate check', path: GUIDE_PATH },
              ]),
              {
                '@type': 'Article',
                headline: 'How to Check an Excavator Final Drive Nameplate',
                description:
                  'Where to find the final drive nameplate on an excavator, what to photograph, and how part number, serial number and nameplate together confirm the correct replacement.',
                mainEntityOfPage: `${SITE_URL}${GUIDE_PATH}`,
                inLanguage: 'en',
                publisher: { '@type': 'Organization', name: SITE_NAME },
              },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: GUIDE_PATH },
          { label: 'Final drive nameplate check' },
        ]}
      />
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Guide
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        How to Check an Excavator Final Drive Nameplate
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/80 md:text-base">
        Before sourcing a replacement final drive, five minutes with the nameplate saves
        days of back-and-forth. This guide shows what to look for and what to send us.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            1. Why the nameplate matters
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            The same excavator model can leave the factory with different final drive
            configurations across serial ranges and markets. A model name alone is not an
            identifier. The nameplate on the drive itself — together with the machine
            serial number — is what separates a confident match from an expensive guess.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            2. Where to find it
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/80">
            <li>
              On most excavators the final drive sits inside the track frame at the rear of
              each side, behind the drive sprocket.
            </li>
            <li>
              The nameplate is usually a small metal tag riveted or stuck to the drive
              housing — often on the outer face of the gearbox or on the travel motor
              casing.
            </li>
            <li>
              Expect grease and mud. Clean the area with a rag and degreaser; a wire brush
              helps on corroded tags. Do not sandblast or grind the plate.
            </li>
            <li>
              If the plate is missing or illegible, photograph the mounting face, the
              sprocket interface and the motor ports instead — bolt pattern and port
              layout still narrow the identification.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            3. What to record
          </h2>
          <div className="mt-3 overflow-x-auto border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Where</th>
                  <th className="px-4 py-3 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Part number on the plate</td>
                  <td className="px-4 py-3 text-muted-foreground">Drive nameplate</td>
                  <td className="px-4 py-3 text-muted-foreground">Anchors the cross-reference</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Drive serial / date code</td>
                  <td className="px-4 py-3 text-muted-foreground">Drive nameplate</td>
                  <td className="px-4 py-3 text-muted-foreground">Separates revisions of the same drive</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Machine serial number</td>
                  <td className="px-4 py-3 text-muted-foreground">Machine ID plate (cab / frame)</td>
                  <td className="px-4 py-3 text-muted-foreground">Serial breaks change the correct drive</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Photos of plate + mounting face</td>
                  <td className="px-4 py-3 text-muted-foreground">Your camera</td>
                  <td className="px-4 py-3 text-muted-foreground">Confirms the identification visually</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            4. Photo checklist
          </h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/80">
            <li>Whole machine from the side (shows model and configuration).</li>
            <li>The machine ID plate with the serial number, in focus.</li>
            <li>The final drive nameplate, close and sharp — wipe it first.</li>
            <li>The mounting face / sprocket side of the old drive.</li>
            <li>The travel motor port side, if visible.</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            Tip: shoot in daylight, tap to focus on the stamped characters, and take one
            angled shot — stamped text often reads better with shadows.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            5. Send it with your RFQ
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            Attach the photos to your quote request together with any part numbers you
            have. We confirm the match technically — catalog cross-references, serial
            breaks and the nameplate — before anything is ordered.
          </p>
          <Link
            href={RFQ_PATH}
            className="mt-4 inline-block bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Start an RFQ with your photos
          </Link>
        </section>
      </div>
    </div>
  );
}
