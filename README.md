# Mobile Parts Platform — Batch 1 (Excavator Final Drives)

English B2B static site for mobile machinery aftermarket parts sourcing (RFQ platform).
Category-neutral shell; the first published category is **excavator final drives**.

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- `output: 'export'` — the whole site is exported to `out/` as static files
- All machine/brand content is driven by a single JSON snapshot: `src/content/public_batch1.json`

## Commands

```bash
pnpm install        # dependencies
pnpm dev            # dev server (hot reload)
pnpm check          # pre-build data & compliance assertions only
pnpm build          # check(pre) → static export → check(post) → bundle static server
pnpm start          # serve out/ on $DEPLOY_RUN_PORT
```

## Environment variables

Copy `.env.example` to `.env.local` for development, and set the same variables in your
hosting environment for builds. All are `NEXT_PUBLIC_*` (inlined at build time):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin; drives canonical URLs, OG tags, sitemap.xml |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Web3Forms access key for the RFQ form. **If unset, the RFQ page shows a "being configured / please email us" placeholder and never crashes.** |
| `NEXT_PUBLIC_RFQ_EMAIL` | Fallback contact mailbox shown when the form is not configured |
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement ID. GA4 is injected **only after the visitor accepts** analytics consent; `generate_lead` fires on successful RFQ submit only under consent |

## Content model: how to add pages (new batch)

Only two inputs are needed to publish more pages — **no code changes**:

1. **Replace/extend `src/content/public_batch1.json`** with the new batch file:
   - `pages[]` — one object per machine model. `url_path` must be exactly
     `/equipment/{make_slug}/{model_slug}/final-drives/`; routes are derived verbatim
     from it. Each page carries `images` (`tag: "main"` is the hero image),
     `reported_numbers` (may be empty), and a **`copy`** object with the commercial
     page copy: `intro` (must mention make + model), `sourcing`, `fit_check`,
     `pn_heading` (`"Part numbers for this model"` or `"Need the right part number?"`),
     `pn_note`, `generation_note`, plus optional `application` / `ton_class_approx`
     (used for brand-hub sorting) / `band`.
   - `makes[]` — every make listed gets a brand hub at `/parts/final-drives/for/{make}/`.
2. **Drop the product photos into `public/images/products/`** using the exact `file`
   names referenced by the JSON, and regenerate `src/lib/image-sizes.ts` with the
   intrinsic width/height of each JPEG (the pre-build check fails if any referenced
   file is missing from the map).
3. If new JSON uses a new Chinese `part_type` value, extend the `PART_TYPE_EN` map in
   `src/lib/data.ts` (public output must stay English-only).

Then run `pnpm build`. `scripts/check-data.mjs` re-validates everything (route count =
JSON page count, verbatim `url_path`, image existence, per-page copy modules,
differentiated intros, SEO uniqueness, brand-hub linkage, sitemap exactness,
banned-token/compliance scan) and blocks the build on any failure.

## Compliance guardrails (enforced by `scripts/check-data.mjs`)

- Never publish: `guaranteed fit`, `direct replacement`, `drop-in`, `fully
  interchangeable`, `in stock`, `48-hour shipping`, prices/cart/core-charge, the old
  academic disclaimers (`reported for reference`, `not independently verified`,
  `do not order by it/these alone`), internal identifiers (`LB-`, `SKU-`, UUIDs,
  S1/S2/S3 tier labels), supplier names/costs, or any CJK text in public output.
- Part numbers are presented as catalog numbers to cross-check against the nameplate;
  pages with numbers close with the commercial `pn_note`, pages without numbers show
  a "Send my nameplate" CTA. Numbers never get their own pages or external links.
- OEM brand names are used for identification only (trademark notice in the footer,
  Privacy and Terms).
- Machines absent from the JSON never get routes, links or mentions.

## Deployment

Any static host can serve `out/` directly (e.g. object storage + CDN, nginx, Netlify,
Cloudflare Pages). In this sandbox, `pnpm build && pnpm start` serves `out/` through the
bundled static server on `$DEPLOY_RUN_PORT`. `sitemap.xml` and `robots.txt` are generated
from the JSON route list; the 404 page is excluded and marked `noindex`.
