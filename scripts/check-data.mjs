#!/usr/bin/env node
/**
 * Build-time data & compliance assertions.
 *
 *   node scripts/check-data.mjs pre    # runs before `next build` (source + JSON checks)
 *   node scripts/check-data.mjs post   # runs after  `next build` (checks the exported out/)
 *
 * Any failed assertion exits non-zero and blocks the build.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, 'src/content/public_batch1.json');
const OUT_DIR = path.join(ROOT, 'out');
const RAW_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.COZE_PROJECT_DOMAIN_DEFAULT ||
  ''
).trim();
const ORIGIN_HOST = RAW_ORIGIN.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
const SITE_URL = ORIGIN_HOST ? `https://${ORIGIN_HOST}` : '';
const EXPECTED_MAKE_COUNT = 13;

const mode = process.argv[2] || 'pre';
let failures = 0;

function fail(msg) {
  failures += 1;
  console.error(`  ✗ ${msg}`);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

/* ---------- shared data ---------- */
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const pages = data.pages;
const makes = data.makes;
const PAGE_COUNT = pages.length;

const FIXED_ROUTES = [
  '/',
  '/parts/final-drives/',
  '/request-quote/',
  '/about/',
  '/privacy/',
  '/terms/',
  '/guides/how-to-check-excavator-final-drive-nameplate/',
];
const BRAND_ROUTES = makes.map(m => `/parts/final-drives/for/${m.slug}/`);
const MODEL_ROUTES = pages.map(p => p.url_path);
const ALL_ROUTES = [...FIXED_ROUTES, ...BRAND_ROUTES, ...MODEL_ROUTES];

/* ---------- banned patterns ---------- */
// Internal identifiers that must never reach public output.
const BANNED_TOKENS = [
  { re: /LB-/i, label: 'internal prefix LB-' },
  { re: /SKU-[A-Z]{0,3}-?/i, label: 'internal SKU prefix' },
  { re: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, label: 'UUID' },
  { re: /\bS[123]\b/, label: 'internal tier label S1/S2/S3' },
  { re: /verification_note/i, label: 'removed field name verification_note' },
  { re: /example\.com/i, label: 'placeholder domain example.com' },
  { re: /TerraDrive/i, label: 'internal name TerraDrive' },
  { re: /Sanger/i, label: 'internal name Sanger' },
  { re: /力霸/, label: 'internal name 力霸' },
];
// Compliance red lines for public copy.
const BANNED_PHRASES = [
  { re: /guaranteed fit/i, label: '"guaranteed fit"' },
  { re: /direct replacement/i, label: '"direct replacement"' },
  { re: /drop-in/i, label: '"drop-in"' },
  { re: /fully interchangeable/i, label: '"fully interchangeable"' },
  { re: /in stock/i, label: '"in stock"' },
  { re: /48-hour shipping/i, label: '"48-hour shipping"' },
  { re: /core charge/i, label: '"core charge"' },
  { re: /add to cart/i, label: '"add to cart"' },
  // Prices: require thousands separators, decimals or >=3 digits so that RSC
  // payload references like "$1"/"$10" do not false-positive.
  { re: /\$\s?(?:\d{1,3}(?:,\d{3})+|\d+\.\d{2}|\d{3,})/, label: 'dollar price' },
  { re: /\bUSD\s?\d+/i, label: 'USD price' },
  { re: /￥\s?\d+/, label: 'RMB price' },
  { re: /成本/, label: 'supplier cost (成本)' },
  // Old "academic" caution phrasing must not linger on the commercial pages.
  { re: /\breported\b/i, label: 'legacy wording "reported"' },
  { re: /not independently verified/i, label: 'legacy wording "not independently verified"' },
  { re: /do not order by (these|it) alone/i, label: 'legacy wording "do not order by ... alone"' },
];
const CJK_RE = /[一-鿿]/;

function walk(dir, filter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, filter));
    else if (!filter || filter(full)) out.push(full);
  }
  return out;
}

function scanFiles(files, { tokens = true, phrases = true, cjk = false } = {}) {
  for (const file of files) {
    // Mask the configured public origin before scanning: the deployment domain
    // itself may legitimately contain UUID-like segments (sandbox hostnames).
    let text = fs.readFileSync(file, 'utf8');
    if (SITE_URL) text = text.split(SITE_URL).join('');
    if (ORIGIN_HOST) text = text.split(ORIGIN_HOST).join('');
    const rel = path.relative(ROOT, file);
    if (tokens) {
      for (const { re, label } of BANNED_TOKENS) {
        if (re.test(text)) fail(`${rel}: banned token (${label})`);
      }
    }
    if (phrases) {
      for (const { re, label } of BANNED_PHRASES) {
        if (re.test(text)) fail(`${rel}: banned compliance phrase ${label}`);
      }
    }
    if (cjk && CJK_RE.test(text)) {
      fail(`${rel}: CJK characters in public output (site must be English-only)`);
    }
  }
}

/* ---------- PRE-BUILD CHECKS ---------- */
function pre() {
  console.log('\n[check-data:pre] JSON structure & routes');
  if (PAGE_COUNT < 1) {
    fail('JSON contains no model pages');
  } else {
    ok(`${PAGE_COUNT} model pages in JSON`);
  }
  if (makes.length !== EXPECTED_MAKE_COUNT) {
    fail(`expected ${EXPECTED_MAKE_COUNT} makes in JSON, found ${makes.length}`);
  } else {
    ok(`${EXPECTED_MAKE_COUNT} makes in JSON`);
  }

  // Every make used by a page exists in the makes list and vice versa.
  const makeSlugs = new Set(makes.map(m => m.slug));
  const usedMakeSlugs = new Set(pages.map(p => p.make_slug));
  for (const s of usedMakeSlugs) if (!makeSlugs.has(s)) fail(`page references undeclared make "${s}"`);
  for (const m of makes) {
    if (!usedMakeSlugs.has(m.slug)) fail(`make "${m.slug}" has zero pages`);
  }

  const seenRoutes = new Set();
  for (const p of pages) {
    const expected = `/equipment/${p.make_slug}/${p.model_slug}/final-drives/`;
    if (p.url_path !== expected) {
      fail(`url_path mismatch: "${p.url_path}" !== derived "${expected}"`);
    }
    if (seenRoutes.has(p.url_path)) fail(`duplicate url_path: ${p.url_path}`);
    seenRoutes.add(p.url_path);

    // Commercial copy fields must all be present and non-empty.
    const copy = p.copy || {};
    for (const field of ['intro', 'sourcing', 'fit_check', 'pn_heading', 'pn_note', 'generation_note', 'machine_kind']) {
      if (typeof copy[field] !== 'string' || copy[field].trim() === '') {
        fail(`${p.url_path}: copy.${field} missing or empty`);
      }
    }
    // Differentiated copy: intro must mention both make and model (case-insensitive).
    const intro = (copy.intro || '').toLowerCase();
    if (!intro.includes(p.make_name.toLowerCase()) || !intro.includes(p.model_name.toLowerCase())) {
      fail(`${p.url_path}: copy.intro does not contain both make "${p.make_name}" and model "${p.model_name}"`);
    }
    // Pn heading must be one of the two supported commercial variants.
    if (
      copy.pn_heading !== 'Part numbers for this model' &&
      copy.pn_heading !== 'Need the right part number?'
    ) {
      fail(`${p.url_path}: unexpected copy.pn_heading "${copy.pn_heading}"`);
    }
    // New schema: part_number_groups + lead_pn; legacy fields must be gone.
    if ('reported_numbers' in p) fail(`${p.url_path}: legacy field "reported_numbers" still present`);
    if ('verification_note' in p) fail(`${p.url_path}: legacy field "verification_note" still present`);
    const GROUP_KEYS = ['assembly', 'motor', 'service'];
    const groups = p.part_number_groups || {};
    for (const key of Object.keys(groups)) {
      if (!GROUP_KEYS.includes(key)) fail(`${p.url_path}: unknown part_number_groups key "${key}"`);
    }
    const groupNumbers = GROUP_KEYS.flatMap(k => (Array.isArray(groups[k]) ? groups[k] : []));
    for (const pn of groupNumbers) {
      if (typeof pn !== 'string' || !pn.trim()) fail(`${p.url_path}: empty part number in groups`);
    }
    if (typeof p.lead_pn !== 'string') fail(`${p.url_path}: lead_pn must be a string`);
    const hasNumbers = groupNumbers.length > 0;
    if (!hasNumbers && p.lead_pn !== '') {
      fail(`${p.url_path}: lead_pn must be empty when there are no part numbers`);
    }
    if (p.lead_pn && !groupNumbers.includes(p.lead_pn)) {
      fail(`${p.url_path}: lead_pn "${p.lead_pn}" not found in part_number_groups`);
    }
    if (!hasNumbers && copy.pn_heading !== 'Need the right part number?') {
      fail(`${p.url_path}: page without part numbers must use the "Need the right part number?" heading`);
    }
    if (hasNumbers && copy.pn_heading !== 'Part numbers for this model') {
      fail(`${p.url_path}: page with part numbers must use the "Part numbers for this model" heading`);
    }

    if (!p.title || !p.h1) fail(`${p.url_path}: missing title/h1`);

    // main image present + every referenced file exists on disk
    const main = p.images.find(i => i.tag === 'main') || p.images[0];
    if (!main) {
      fail(`${p.url_path}: no images in JSON`);
    }
    for (const img of p.images || []) {
      if (!fs.existsSync(path.join(ROOT, 'public/images/products', img.file))) {
        fail(`${p.url_path}: missing image file ${img.file}`);
      }
    }
  }
  ok('url_path verbatim, copy completeness & image existence done');

  console.log('\n[check-data:pre] image dimension map coverage (CLS width/height)');
  const sizesSrc = fs.readFileSync(path.join(ROOT, 'src/lib/image-sizes.ts'), 'utf8');
  for (const p of pages) {
    for (const img of p.images || []) {
      if (!sizesSrc.includes(`"${img.file}"`) && !sizesSrc.includes(`'${img.file}'`)) {
        fail(`${p.url_path}: ${img.file} missing from src/lib/image-sizes.ts (no width/height → CLS risk)`);
      }
    }
  }
  if (failures === 0) ok('every JSON image has intrinsic dimensions in image-sizes.ts');

  console.log('\n[check-data:pre] banned tokens & compliance phrases in src/');
  // The compliance word list itself lives in this file and uses phrasing in
  // RegExp literals, so the check script is excluded from the phrase scan.
  const srcFiles = walk(path.join(ROOT, 'src'), f => /\.(ts|tsx|js|jsx|css|mjs)$/.test(f)).filter(
    f => path.relative(ROOT, f) !== path.relative(ROOT, JSON_PATH),
  );
  scanFiles(srcFiles, { tokens: true, phrases: true, cjk: false });
  if (failures === 0) ok('no banned tokens/phrases in source');

  console.log('\n[check-data:pre] sitemap/robots source sanity');
  const sitemapSrc = fs.readFileSync(path.join(ROOT, 'src/app/sitemap.ts'), 'utf8');
  if (/['"]\/404/.test(sitemapSrc)) fail('sitemap.ts must not reference the 404 page');
  if (!sitemapSrc.includes('allPublicRoutes')) fail('sitemap.ts must be generated from allPublicRoutes()');
  if (failures === 0) ok('sitemap.ts derives routes from JSON, no 404');
}

/* ---------- POST-BUILD CHECKS ---------- */
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function post() {
  if (!fs.existsSync(OUT_DIR)) {
    fail('out/ directory not found — run next build first');
    return;
  }

  console.log('\n[check-data:post] route coverage in out/');
  for (const route of ALL_ROUTES) {
    const file = path.join(OUT_DIR, route, 'index.html');
    if (!fs.existsSync(file)) fail(`missing exported page: ${route}`);
  }
  if (!fs.existsSync(path.join(OUT_DIR, '404.html'))) fail('missing 404.html');
  if (failures === 0) ok(`all ${ALL_ROUTES.length} routes + 404 exported`);

  console.log('\n[check-data:post] unpublished machine isolation');
  const equipmentDir = path.join(OUT_DIR, 'equipment');
  const exportedModels = walk(equipmentDir, f => f.endsWith('index.html')).map(f =>
    `/${path.relative(OUT_DIR, path.dirname(f))}/`,
  );
  for (const r of exportedModels) {
    if (!MODEL_ROUTES.includes(r)) fail(`unexpected exported machine route: ${r}`);
  }
  if (exportedModels.length !== MODEL_ROUTES.length) {
    fail(`exported machine route count ${exportedModels.length} !== ${MODEL_ROUTES.length}`);
  } else {
    ok(`exactly the ${PAGE_COUNT} published machine routes exist, nothing else`);
  }

  // Brand hubs: each must link every model page of that make, and no other model.
  for (const make of makes) {
    const file = path.join(OUT_DIR, `/parts/final-drives/for/${make.slug}/`, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    for (const p of pages) {
      const should = p.make_slug === make.slug;
      const linked = html.includes(`href="${p.url_path}"`);
      if (should && !linked) fail(`brand hub ${make.slug} missing link to ${p.url_path}`);
      if (!should && linked) fail(`brand hub ${make.slug} unexpectedly links ${p.url_path}`);
    }
  }
  ok('brand hubs link exactly their own model pages');

  console.log('\n[check-data:post] list surfaces use thumbnail cards (no application blurbs)');
  // copy.application is duplicated low-value text for list surfaces: it must
  // never appear on the home page, category hub or any brand hub.
  const LIST_PAGES = ['/', '/parts/final-drives/', ...BRAND_ROUTES];
  for (const route of LIST_PAGES) {
    const file = path.join(OUT_DIR, route, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const visible = stripHtml(html);
    // Cards: tonnage tag omitted entirely when ton_class_approx is null; the
    // "Nameplate match" label never carries a "PN" prefix.
    if (/~\s*(null|0)\s*T/i.test(html) || /~\s*T</.test(html)) {
      fail(`${route}: broken/empty tonnage tag rendered on a card`);
    }
    if (/PN<\/span>\s*<span[^>]*>\s*Nameplate match/.test(html)) {
      fail(`${route}: "PN" prefix must not precede the "Nameplate match" label`);
    }
    // Adjacent text nodes must not be mashed together (JSX whitespace loss):
    // - card PN prefix must be followed by a real space before the part number
    // - brand tiles must read "{count} {Make} models in this batch"
    if (/PN<\/span><span/.test(html)) {
      fail(`${route}: "PN" prefix stuck to the part number (missing space text node)`);
    }
    if (/<\/span><span[^>]*>\d+ [A-Za-z]+ models? in this batch/.test(html)) {
      fail(`${route}: brand name stuck to model count (missing space text node)`);
    }
    const relevant =
      route === '/' || route === '/parts/final-drives/'
        ? pages
        : pages.filter(p => `/parts/final-drives/for/${p.make_slug}/` === route);
    for (const p of relevant) {
      const app = (p.copy.application || '').trim();
      if (app && visible.includes(app)) {
        fail(`${route}: application blurb "${app.slice(0, 40)}..." leaked into a list surface`);
      }
      // Every card must show the model main image thumbnail.
      const main = p.images.find(i => i.tag === 'main') || p.images[0];
      const isBrandHub = route.startsWith('/parts/final-drives/for/');
      if (main && (isBrandHub || html.includes(`href="${p.url_path}"`))) {
        if (isBrandHub && !html.includes(`/images/products/${main.file}`)) {
          fail(`${route}: card for ${p.model_name} missing main-image thumbnail ${main.file}`);
        }
      }
    }
  }
  // Home + hub must render product thumbnails as lazy <img> cards.
  for (const route of ['/', '/parts/final-drives/']) {
    const html = fs.readFileSync(path.join(OUT_DIR, route, 'index.html'), 'utf8');
    const imgTags = html.match(/<img[^>]*>/g) || [];
    const productImgs = imgTags.filter(t => t.includes('/images/products/'));
    if (productImgs.length === 0) fail(`${route}: no product-thumbnail card images rendered`);
    for (const t of productImgs) {
      if (!/loading="lazy"/.test(t)) fail(`${route}: card thumbnail must be lazy-loaded (${t.slice(0, 120)})`);
    }
  }
  if (failures === 0) ok('cards render thumbnails; no application blurbs on list surfaces');

  console.log('\n[check-data:post] banned tokens & compliance in exported output');
  const outFiles = walk(OUT_DIR, f => /\.(html|xml|txt)$/.test(f));
  scanFiles(outFiles, { tokens: true, phrases: true, cjk: true });
  if (failures === 0) ok('exported output is clean (tokens, phrases, English-only)');

  console.log('\n[check-data:post] sitemap.xml');
  const sitemapPath = path.join(OUT_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    fail('sitemap.xml not exported');
  } else {
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m =>
      m[1].replace(SITE_URL, ''),
    );
    const expected = new Set(ALL_ROUTES);
    for (const loc of locs) {
      if (!expected.has(loc)) fail(`sitemap contains unexpected URL: ${loc}`);
      if (/404/.test(loc)) fail('sitemap must not contain the 404 page');
    }
    for (const route of expected) {
      if (!locs.includes(route)) fail(`sitemap missing route: ${route}`);
    }
    if (locs.length !== expected.size) {
      fail(`sitemap URL count ${locs.length} !== expected ${expected.size}`);
    }
    if (failures === 0) {
      ok(`sitemap contains exactly the ${expected.size} real routes (${PAGE_COUNT} model pages)`);
    }
  }

  console.log('\n[check-data:post] per-page SEO uniqueness');
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  for (const route of ALL_ROUTES) {
    const file = path.join(OUT_DIR, route, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title || !title.trim()) fail(`${route}: missing <title>`);
    else if (seenTitles.has(title)) fail(`${route}: duplicate <title> with ${seenTitles.get(title)}`);
    else seenTitles.set(title, route);
    if ((title.match(/Mobile Parts Platform/g) || []).length > 1) {
      fail(`${route}: site name repeated in <title> ("${title}")`);
    }
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    if (!desc || !desc.trim()) fail(`${route}: missing meta description`);
    else if (seenDescriptions.has(desc)) fail(`${route}: duplicate meta description with ${seenDescriptions.get(desc)}`);
    else seenDescriptions.set(desc, route);
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canonical) fail(`${route}: missing canonical`);
    else if (!canonical.endsWith(route)) fail(`${route}: canonical "${canonical}" does not end with route`);
    if (!/<meta property="og:title"/.test(html)) fail(`${route}: missing OG tags`);
  }
  ok('unique title/description/canonical/OG check done');

  console.log('\n[check-data:post] per-model commercial modules');
  for (const p of pages) {
    const file = path.join(OUT_DIR, p.url_path, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const visible = stripHtml(html);
    const label = p.url_path;

    // H1
    if (!html.includes(`<h1`) || !visible.includes(p.h1)) fail(`${label}: H1 "${p.h1}" not rendered`);

    // Images
    const main = p.images.find(i => i.tag === 'main') || p.images[0];
    if (main && !html.includes(`/images/products/${main.file}`)) {
      fail(`${label}: main image ${main.file} not rendered`);
    }
    for (const img of p.images) {
      const tagMatch = html.match(
        new RegExp(`<img[^>]*${img.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`),
      );
      if (!tagMatch) {
        fail(`${label}: image ${img.file} not rendered as <img>`);
        continue;
      }
      const tag = tagMatch[0];
      if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) {
        fail(`${label}: ${img.file} missing width/height attributes`);
      }
      const isMain = main && img.file === main.file;
      if (isMain && /loading="lazy"/.test(tag)) {
        fail(`${label}: first-screen main image must not be lazy-loaded`);
      }
      if (!isMain && !/loading="lazy"/.test(tag)) {
        fail(`${label}: extra view ${img.file} must use loading="lazy"`);
      }
      if (!fs.existsSync(path.join(OUT_DIR, 'images/products', img.file))) {
        fail(`${label}: ${img.file} missing from exported out/images/products/`);
      }
    }
    if (!new RegExp(`Final drive assembly for ${p.make_name} ${p.model_name} excavator`).test(html)) {
      fail(`${label}: main image missing descriptive alt "Final drive assembly for {Make} {Model} excavator"`);
    }
    if (/-main\.jpg|-view\d\.jpg/.test(html)) {
      fail(`${label}: legacy image filename (-main/-view) still referenced`);
    }

    // Commercial copy modules actually rendered as visible text.
    const copy = p.copy;
    for (const snippet of [copy.intro, copy.sourcing, copy.fit_check, copy.generation_note]) {
      const probe = snippet.slice(0, 60);
      if (!visible.includes(probe)) fail(`${label}: copy module not rendered ("${probe.slice(0, 40)}...")`);
    }
    if (!visible.includes(copy.pn_heading)) fail(`${label}: pn_heading not rendered`);
    if (!visible.includes(copy.pn_note.slice(0, 50))) fail(`${label}: pn_note not rendered`);
    if (!/Why source this final drive through us/.test(visible)) {
      fail(`${label}: missing "Why source this final drive through us" section`);
    }
    if (!/Confirm the exact fit before you order/.test(visible)) {
      fail(`${label}: missing "Confirm the exact fit before you order" section`);
    }

    // Part numbers: non-empty groups rendered with headings; lead_pn visible.
    // No-number pages: no group tables, mandatory "Send my nameplate" CTA.
    const GROUP_LABELS = {
      assembly: 'Final drive assembly numbers',
      motor: 'Travel motor numbers',
      service: 'Service & repair kit numbers',
    };
    const groups = p.part_number_groups || {};
    const groupNumbers = ['assembly', 'motor', 'service'].flatMap(k =>
      Array.isArray(groups[k]) ? groups[k] : [],
    );
    if (groupNumbers.length > 0) {
      let renderedGroups = 0;
      for (const [key, label2] of Object.entries(GROUP_LABELS)) {
        const nums = Array.isArray(groups[key]) ? groups[key] : [];
        if (nums.length === 0) {
          if (visible.includes(label2)) fail(`${label}: empty group "${label2}" must not render`);
          continue;
        }
        if (!visible.includes(label2)) {
          fail(`${label}: group heading "${label2}" not rendered`);
          continue;
        }
        renderedGroups += 1;
        for (const pn of nums) {
          if (!visible.includes(pn)) fail(`${label}: part number ${pn} not rendered`);
        }
      }
      if (renderedGroups === 0) fail(`${label}: no part-number group rendered`);
      if (p.lead_pn && !visible.includes(p.lead_pn)) {
        fail(`${label}: lead_pn "${p.lead_pn}" not visible on page`);
      }
    } else {
      if (!/Send my nameplate/.test(html)) {
        fail(`${label}: no-number page missing "Send my nameplate" button`);
      }
      for (const label2 of Object.values(GROUP_LABELS)) {
        if (visible.includes(label2)) fail(`${label}: empty part-number group "${label2}" rendered`);
      }
    }

    // Tonnage tag: when copy.ton_class_approx is null the page must not show
    // any "~X T" tag at all (no ~null / ~0T / empty brackets). Match on
    // visible text so JSX comment separators do not break the probe.
    if (p.copy.ton_class_approx === null || p.copy.ton_class_approx === undefined) {
      if (/~\s*[\d.]+\s*T/.test(visible) || /~\s*null/i.test(visible) || /~\s*T\b/.test(visible)) {
        fail(`${label}: ton_class_approx is null — no "~X T" tag may be rendered`);
      }
    } else if (!new RegExp(`~\\s*${p.copy.ton_class_approx}\\s*T\\b`).test(visible)) {
      fail(`${label}: tonnage tag "~${p.copy.ton_class_approx} T" missing`);
    }

    // Subtitle machine kind comes from copy.machine_kind (excavator vs compact
    // track loader) — no front-end inference from the model name.
    if (!visible.includes(`${p.copy.machine_kind} undercarriage`)) {
      fail(`${label}: subtitle must render "${p.copy.machine_kind} undercarriage"`);
    }

    // Fit-check guide link + prefilling RFQ CTA.
    if (!html.includes('/guides/how-to-check-excavator-final-drive-nameplate/')) {
      fail(`${label}: missing fit-check guide link`);
    }
    const cta = html.match(/href="(\/request-quote\/\?[^"]*)"/);
    if (!cta) fail(`${label}: missing pre-filled RFQ CTA`);
    else {
      // Spaces encode as "+" in application/x-www-form-urlencoded query strings.
      const query = new URLSearchParams(cta[1].split('?')[1].replace(/&amp;/g, '&'));
      if (query.get('make') !== p.make_name) fail(`${label}: CTA make prefill mismatch ("${query.get('make')}")`);
      if (query.get('model') !== p.model_name) fail(`${label}: CTA model prefill mismatch ("${query.get('model')}")`);
    }

    // JSON-LD: BreadcrumbList + Product, no offers/price/aggregateRating.
    if (!html.includes('application/ld+json')) fail(`${label}: missing JSON-LD`);
    if (!/"BreadcrumbList"/.test(html)) fail(`${label}: JSON-LD missing BreadcrumbList`);
    if (!/"@type":"Product"/.test(html)) fail(`${label}: JSON-LD missing Product`);
    if (/"(offers|aggregateRating)"/.test(html)) {
      fail(`${label}: Product JSON-LD must not include offers/aggregateRating`);
    }
  }
  ok('commercial module check done for all model pages');

  console.log('\n[check-data:post] 404 noindex');
  const nf = fs.readFileSync(path.join(OUT_DIR, '404.html'), 'utf8');
  if (!/noindex/.test(nf)) fail('404 page must be noindex');
  else ok('404 is noindex');

  const robotsPath = path.join(OUT_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) fail('robots.txt not exported');
  else if (!/sitemap:/i.test(fs.readFileSync(robotsPath, 'utf8'))) fail('robots.txt missing sitemap reference');
}

console.log(`check-data (${mode}) — Mobile Parts Platform batch (${PAGE_COUNT} model pages)`);
if (mode === 'pre') pre();
else if (mode === 'post') post();
else {
  console.error(`unknown mode: ${mode}`);
  process.exit(2);
}

if (failures > 0) {
  console.error(`\ncheck-data FAILED with ${failures} assertion failure(s). Build blocked.`);
  process.exit(1);
}
console.log(`\ncheck-data (${mode}) PASSED`);
