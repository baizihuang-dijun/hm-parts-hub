import Link from 'next/link';
import { SITE_NAME } from '@/config/site';
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
        <p className="mt-3 w-full text-[11.5px] text-[#7e8a93]">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
