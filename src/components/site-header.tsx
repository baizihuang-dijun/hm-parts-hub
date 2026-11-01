'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_NAME } from '@/config/site';
import { CATEGORY_CONFIGS, categoryPath, GUIDE_PATH, RFQ_PATH } from '@/lib/data';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Any navigation closes the drawer, including same-page hash links.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="v6-topbar">
      <div className="v6-wrap">
        <Link href="/" className="v6-brand" aria-label={`${SITE_NAME} — home`}>
          <b>{SITE_NAME}</b>
          <span>Mobile Equipment Aftermarket Parts</span>
        </Link>

        <nav
          id="primary-nav"
          className={`v6-mainnav${open ? ' is-open' : ''}`}
          aria-label="Primary"
        >
          <div className="v6-navgroup">
            <span className="v6-navgroup-label">Products</span>
            <div className="v6-navmenu">
              {CATEGORY_CONFIGS.map(cat => (
                <Link key={cat.slug} href={categoryPath(cat.slug)} className="v6-navsub">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/#makes">By Make</Link>
          <Link href={GUIDE_PATH}>Guides</Link>
        </nav>

        <Link href={RFQ_PATH} className="v6-btn v6-btn-primary">
          <span className="v6-btn-full">Request a quote</span>
          <span className="v6-btn-short">Quote</span>
        </Link>

        <button
          type="button"
          className="v6-burger"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(value => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true" className="v6-burger-bars" />
        </button>
      </div>
    </header>
  );
}
