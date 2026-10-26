'use client';

import { useMemo, useState } from 'react';
import { RFQ_PATH } from '@/lib/data';

export interface SearchEntry {
  make: string;
  model: string;
  ton: number | null;
  leadPn: string;
  url: string;
  /** pre-normalized haystack: make + model + aliases + all part numbers + ton variants */
  hay: string;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function HomeSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const tokens = query.split(/\s+/).map(norm).filter(Boolean);
    if (tokens.length === 0) return [];
    const out: SearchEntry[] = [];
    for (const e of entries) {
      if (tokens.every((t) => e.hay.includes(t))) {
        out.push(e);
        if (out.length >= 8) break;
      }
    }
    return out;
  }, [query, entries]);

  const showDropdown = open && query.trim().length > 0;

  const go = (url: string) => {
    window.location.href = url;
  };

  const submit = () => {
    if (results.length > 0) go(results[Math.min(active, results.length - 1)].url);
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (ev.key === 'Enter') {
      if (results.length > 0) {
        ev.preventDefault();
        submit();
      }
    } else if (ev.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="v6-search">
      <svg
        className="v6-ico"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // delay so a click on a result link still fires
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search by part number, model or make — e.g. 20Y-27-00300, PC200, Komatsu 22t"
        aria-label="Search final drives by part number, model or make"
        autoComplete="off"
        spellCheck={false}
      />
      <button type="button" className="v6-btn v6-btn-primary v6-go" onClick={submit}>
        Search
      </button>
      {showDropdown && (
        <div className="v6-sresult" role="listbox" aria-label="Matching models">
          {results.length === 0 ? (
            <div className="v6-sr-none">
              No match for &ldquo;{query.trim()}&rdquo; —{' '}
              <a href={RFQ_PATH}>send us the part number or a nameplate photo</a>{' '}
              and we will identify the unit for you.
            </div>
          ) : (
            <>
              <div className="v6-sr-head">{`${results.length} match${results.length === 1 ? '' : 'es'} — Enter to open`}</div>
              {results.map((r, i) => (
                <a
                  key={r.url}
                  href={r.url}
                  role="option"
                  aria-selected={i === active}
                  data-active={i === active ? 'true' : undefined}
                  className="v6-sr-item"
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="si-model">
                    {r.model}
                    <span>{r.make}</span>
                  </span>
                  {r.leadPn ? <span className="si-pn">{r.leadPn}</span> : <span />}
                  {typeof r.ton === 'number' ? (
                    <span className="si-ton">{`~${r.ton} T`}</span>
                  ) : (
                    <span />
                  )}
                </a>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
