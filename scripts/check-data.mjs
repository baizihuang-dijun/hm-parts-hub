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
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com').replace(/\/+$/, '');

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
  { re: /SKU-FD-/i, label: 'internal SKU-FD-' },
  { re: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, label: 'UUID' },
  { re: /\bS[123]\b/, label: 'internal tier label S1/S2/S3' },
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
    const text = fs.readFileSync(file, 'utf8');
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
  if (pages.length !== 12) {
    fail(`expected exactly 12 model pages in JSON, found ${pages.length}`);
  } else {
    ok('12 model pages in JSON');
  }
  if (makes.length !== 13) {
    fail(`expected 13 makes in JSON, found ${makes.length}`);
  } else {
    ok('13 makes in JSON');
  }

  for (const p of pages) {
    const expected = `/equipment/${p.make_slug}/${p.model_slug}/final-drives/`;
    if (p.url_path !== expected) {
      fail(`url_path mismatch: "${p.url_path}" !== derived "${expected}"`);
    }
    // main image present + file exists
    const main = p.images.find(i => i.tag === 'main') || p.images[0];
    if (!main) {
      fail(`${p.url_path}: no images in JSON`);
    } else {
      const imgPath = path.join(ROOT, 'public/images/products', main.file);
      if (!fs.existsSync(imgPath)) fail(`${p.url_path}: missing image file ${main.file}`);
    }
    for (const img of p.images) {
      const imgPath = path.join(ROOT, 'public/images/products', img.file);
      if (!fs.existsSync(imgPath)) fail(`${p.url_path}: missing image file ${img.file}`);
    }
    // reported numbers OR explicit no-number handling
    if (!Array.isArray(p.reported_numbers)) {
      fail(`${p.url_path}: reported_numbers missing`);
    }
    if (!p.title || !p.h1) fail(`${p.url_path}: missing title/h1`);
  }
  ok('url_path verbatim check + image existence done');

  console.log('\n[check-data:pre] image dimension map coverage (CLS width/height)');
  const sizesSrc = fs.readFileSync(path.join(ROOT, 'src/lib/image-sizes.ts'), 'utf8');
  for (const p of pages) {
    for (const img of p.images) {
      if (!sizesSrc.includes(`'${img.file}'`)) {
        fail(`${p.url_path}: ${img.file} missing from src/lib/image-sizes.ts (no width/height → CLS risk)`);
      }
    }
  }
  if (failures === 0) ok('every JSON image has intrinsic dimensions in image-sizes.ts');

  console.log('\n[check-data:pre] banned tokens & compliance phrases in src/');
  const srcFiles = walk(path.join(ROOT, 'src'), f =>
    /\.(ts|tsx|js|jsx|css|mjs)$/.test(f),
  ).filter(f => path.relative(ROOT, f) !== path.relative(ROOT, JSON_PATH));
  scanFiles(srcFiles, { tokens: true, phrases: true, cjk: false });
  if (failures === 0) ok('no banned tokens/phrases in source');

  console.log('\n[check-data:pre] sitemap/robots source sanity');
  const sitemapSrc = fs.readFileSync(path.join(ROOT, 'src/app/sitemap.ts'), 'utf8');
  if (/['"]\/404/.test(sitemapSrc)) fail('sitemap.ts must not reference the 404 page');
  if (!sitemapSrc.includes('allPublicRoutes')) fail('sitemap.ts must be generated from allPublicRoutes()');
  if (failures === 0) ok('sitemap.ts derives routes from JSON, no 404');
}

/* ---------- POST-BUILD CHECKS ---------- */
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
    ok('exactly the 12 published machine routes exist, nothing else');
  }

  console.log('\n[check-data:post] banned tokens & compliance in exported HTML');
  const htmlFiles = walk(OUT_DIR, f => /\.(html|xml|txt)$/.test(f));
  scanFiles(htmlFiles, { tokens: true, phrases: true, cjk: true });
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
    if (failures === 0) ok(`sitemap contains exactly the ${expected.size} real routes`);
  }

  console.log('\n[check-data:post] per-page SEO & model-page modules');
  const seenTitles = new Map();
  for (const route of ALL_ROUTES) {
    const file = path.join(OUT_DIR, route, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title) fail(`${route}: missing <title>`);
    else if (seenTitles.has(title)) fail(`${route}: duplicate <title> with ${seenTitles.get(title)}`);
    else seenTitles.set(title, route);
    if (!/<meta name="description" content="[^"]+"/.test(html)) {
      fail(`${route}: missing meta description`);
    }
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canonical) fail(`${route}: missing canonical`);
    else if (!canonical.endsWith(route)) fail(`${route}: canonical "${canonical}" does not end with route`);
    if (!/<meta property="og:title"/.test(html)) fail(`${route}: missing OG tags`);
  }
  ok('unique title/description/canonical/OG check done');

  for (const p of pages) {
    const file = path.join(OUT_DIR, p.url_path, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const main = p.images.find(i => i.tag === 'main') || p.images[0];
    const label = p.url_path;
    if (main && !html.includes(`/images/products/${main.file}`)) {
      fail(`${label}: main image ${main.file} not rendered`);
    }
    // Every JSON image must render as an <img> with width/height (CLS guard);
    // the first-screen main image must NOT be lazy, extra views must be lazy.
    for (const img of p.images) {
      const tagMatch = html.match(new RegExp(`<img[^>]*${img.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`));
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
    if (!/Final drive assembly for [A-Za-z]+ [A-Za-z0-9-]+ excavator/.test(html)) {
      fail(`${label}: main image missing descriptive alt "Final drive assembly for {Make} {Model} excavator"`);
    }
    // Legacy naming must be gone everywhere.
    if (/-main\.jpg|-view\d\.jpg/.test(html)) {
      fail(`${label}: legacy image filename (-main/-view) still referenced`);
    }
    if (p.reported_numbers.length > 0) {
      if (!/reported for reference/i.test(html)) fail(`${label}: missing "reported for reference" heading`);
      if (!/not independently verified/i.test(html)) fail(`${label}: missing "not independently verified" note`);
      if (!/Do not order by these numbers alone/i.test(html)) fail(`${label}: missing "do not order by it alone" caution`);
    } else if (!/No OEM part numbers are reported/i.test(html)) {
      fail(`${label}: missing no-reported-numbers explanation`);
    }
    if (!html.includes('/guides/how-to-check-excavator-final-drive-nameplate/')) {
      fail(`${label}: missing fit-check guide link`);
    }
    const cta = html.match(/href="\/request-quote\/\?[^"]*"/);
    if (!cta) fail(`${label}: missing pre-filled RFQ CTA`);
    else {
      if (!cta[0].includes(`make=${encodeURIComponent(p.make_name)}`)) fail(`${label}: CTA missing make prefill`);
      if (!cta[0].includes(`model=${encodeURIComponent(p.model_name)}`)) fail(`${label}: CTA missing model prefill`);
    }
    if (!html.includes('application/ld+json')) fail(`${label}: missing JSON-LD`);
    if (/"@type":"Product"/.test(html) && /"(offers|aggregateRating)"/.test(html)) {
      fail(`${label}: Product JSON-LD must not include offers/aggregateRating`);
    }
  }
  ok('model-page module check done');

  console.log('\n[check-data:post] 404 noindex');
  const nf = fs.readFileSync(path.join(OUT_DIR, '404.html'), 'utf8');
  if (!/noindex/.test(nf)) fail('404 page must be noindex');
  else ok('404 is noindex');

  const robotsPath = path.join(OUT_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) fail('robots.txt not exported');
  else if (!/sitemap:/i.test(fs.readFileSync(robotsPath, 'utf8'))) fail('robots.txt missing sitemap reference');
}

console.log(`check-data (${mode}) — Mobile Parts Platform batch 1`);
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
