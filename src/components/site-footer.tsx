import Link from 'next/link';
import { CookieSettingsButton } from './cookie-settings-button';
import { RFQ_EMAIL, SITE_NAME, WHATSAPP_NUMBER, whatsappUrl } from '@/config/site';
import { CATEGORY_PATH, GUIDE_PATH, RFQ_PATH } from '@/lib/data';

export function SiteFooter() {
  return (
    <footer className="v6-footer">
      <div className="v6-wrap">
        <div>
          <div className="fbrand">{SITE_NAME}</div>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#aeb9c0]">
            Independent sourcing support for mobile machinery aftermarket parts.
            Technical confirmation before ordering — by OEM part number, machine
            serial number and nameplate.
          </p>
          <div className="mt-4 space-y-1.5 text-[13px]">
            {WHATSAPP_NUMBER ? (
              <p>
                <a
                  href={whatsappUrl(
                    'Hi HM Parts Hub, I would like a quote for a final drive or travel motor.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d6d2c8] underline decoration-[#5a6268] underline-offset-4 hover:text-white"
                >
                  WhatsApp +{WHATSAPP_NUMBER}
                </a>
              </p>
            ) : null}
            {RFQ_EMAIL ? (
              <p>
                <a
                  href={`mailto:${RFQ_EMAIL}`}
                  className="text-[#d6d2c8] underline decoration-[#5a6268] underline-offset-4 hover:text-white"
                >
                  {RFQ_EMAIL}
                </a>
              </p>
            ) : null}
          </div>
        </div>
        <nav className="ftr-links" aria-label="Footer">
          <Link href={CATEGORY_PATH}>Final Drives</Link>
          <Link href={GUIDE_PATH}>Nameplate Guide</Link>
          <Link href={RFQ_PATH}>Request a Quote</Link>
          <Link href="/about/">About</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
        </nav>
        <p className="tm">
          Trademark notice: All manufacturer names, model designations and part
          numbers (e.g. Caterpillar, Komatsu, Hitachi, Volvo, Doosan, Hyundai,
          Kobelco, SANY, CASE, JCB, Kato, Sumitomo, XCMG) are the property of
          their respective owners and are referenced on this site for
          identification purposes only. {SITE_NAME} is an independent
          aftermarket sourcing service and is not an authorized dealer of, and
          is not affiliated with or endorsed by, any of these manufacturers.
        </p>
        <p className="mt-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#7e8a93]">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </span>
          <CookieSettingsButton className="underline decoration-[#5a6268] underline-offset-2 transition-colors hover:text-white" />
        </p>
      </div>
    </footer>
  );
}
