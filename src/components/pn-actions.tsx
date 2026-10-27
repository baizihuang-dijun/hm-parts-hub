'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Copy-to-clipboard button for a single part number.
 * Shows a "Copied" confirmation state; falls back to a hidden textarea +
 * execCommand('copy') for browsers without the async clipboard API
 * (e.g. non-secure contexts).
 */
export function CopyPnButton({ pn }: { pn: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function onCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pn);
      } else {
        const ta = document.createElement('textarea');
        ta.value = pn;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={`v6-mini cp${copied ? ' copied' : ''}`}
      data-copy={pn}
      onClick={onCopy}
      aria-live="polite"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * "Quote this" link for a part-number row. The SSR href points at the RFQ
 * page with make/model/pn prefilled (works without JS). When the on-page
 * sticky RFQ form is present, the click is enhanced instead: prefill the
 * form's part-number field and scroll to it, staying on the model page.
 */
export function QuoteThisLink({
  pn,
  href,
}: {
  pn: string;
  href: string;
}) {
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const field = document.getElementById('mrfq-pn') as HTMLInputElement | null;
    const panel = document.getElementById('rfq');
    if (!field || !panel) return; // no on-page form — follow the SSR href
    e.preventDefault();
    field.value = pn;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    field.focus({ preventScroll: true });
  }

  return (
    <a className="v6-mini q" href={href} data-pn={pn} onClick={onClick}>
      Quote this
    </a>
  );
}
