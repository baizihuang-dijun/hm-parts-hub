import Link from 'next/link';
import { SITE_NAME } from '@/config/site';
import { CATEGORY_PATH, GUIDE_PATH, RFQ_PATH } from '@/lib/data';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-bold tracking-tight text-foreground">{SITE_NAME}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Independent sourcing support for mobile machinery aftermarket parts.
              Technical confirmation before ordering — by OEM part number, machine
              serial number and nameplate.
            </p>
          </div>
          <nav aria-label="Footer" className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Site</p>
            <ul className="mt-3 space-y-2">
              <li><Link className="text-foreground/80 hover:text-foreground" href={CATEGORY_PATH}>Final Drives</Link></li>
              <li><Link className="text-foreground/80 hover:text-foreground" href={GUIDE_PATH}>Nameplate Check Guide</Link></li>
              <li><Link className="text-foreground/80 hover:text-foreground" href={RFQ_PATH}>Request a Quote</Link></li>
              <li><Link className="text-foreground/80 hover:text-foreground" href="/about/">About</Link></li>
            </ul>
          </nav>
          <nav aria-label="Legal" className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
            <ul className="mt-3 space-y-2">
              <li><Link className="text-foreground/80 hover:text-foreground" href="/privacy/">Privacy Policy</Link></li>
              <li><Link className="text-foreground/80 hover:text-foreground" href="/terms/">Terms of Use</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Trademark notice: All manufacturer names, model designations and part numbers
            (e.g. Caterpillar, Komatsu, Hitachi, Volvo, Doosan, Hyundai, Kobelco, SANY, CASE,
            JCB, Kato, Sumitomo, XCMG) are the property of their respective owners. They are
            referenced on this site for identification purposes only. {SITE_NAME} is not an
            authorized dealer of, and is not affiliated with or endorsed by, any of these
            manufacturers.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
