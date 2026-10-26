import Link from 'next/link';
import { SITE_NAME } from '@/config/site';
import { CATEGORY_PATH, GUIDE_PATH, RFQ_PATH } from '@/lib/data';

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 bg-primary" aria-hidden="true" />
          <span className="text-base font-bold tracking-tight text-foreground">
            {SITE_NAME}
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
          <Link href={CATEGORY_PATH} className="text-foreground/80 transition-colors hover:text-foreground">
            Final Drives
          </Link>
          <Link href={GUIDE_PATH} className="text-foreground/80 transition-colors hover:text-foreground">
            Nameplate Guide
          </Link>
          <Link href="/about/" className="text-foreground/80 transition-colors hover:text-foreground">
            About
          </Link>
          <Link
            href={RFQ_PATH}
            className="inline-flex items-center bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Request a Quote
          </Link>
        </nav>
        <Link
          href={RFQ_PATH}
          className="inline-flex items-center bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground md:hidden"
        >
          RFQ
        </Link>
      </div>
    </header>
  );
}
