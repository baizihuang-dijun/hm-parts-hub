import Link from 'next/link';
import { SITE_NAME } from '@/config/site';
import { CATEGORY_PATH, GUIDE_PATH, RFQ_PATH } from '@/lib/data';

export function SiteHeader() {
  return (
    <header className="v6-topbar">
      <div className="v6-wrap">
        <Link href="/" className="v6-brand" aria-label={`${SITE_NAME} — home`}>
          <b>{SITE_NAME}</b>
          <span>Mobile machinery · aftermarket sourcing</span>
        </Link>
        <nav className="v6-mainnav" aria-label="Primary">
          <Link href={CATEGORY_PATH}>Final Drives</Link>
          <Link href="/#makes">By Make</Link>
          <Link href={GUIDE_PATH}>Nameplate Guide</Link>
        </nav>
        <Link href={RFQ_PATH} className="v6-btn v6-btn-primary">
          Request a quote
        </Link>
      </div>
    </header>
  );
}
