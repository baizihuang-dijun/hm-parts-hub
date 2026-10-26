import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORY_PATH, RFQ_PATH } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The page you requested does not exist or is not published yet. If you were looking
        for a specific machine, send an RFQ — coverage beyond published pages is handled
        on request.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Home
        </Link>
        <Link
          href={CATEGORY_PATH}
          className="border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Final Drives
        </Link>
        <Link
          href={RFQ_PATH}
          className="bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Request a Quote
        </Link>
      </div>
    </div>
  );
}
