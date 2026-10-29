/**
 * Ping IndexNow with every URL in the sitemap.
 *
 * IndexNow is a shared push protocol used by Bing, Yandex, Seznam and Naver:
 * instead of waiting for a crawler to come back, we tell them exactly which
 * URLs exist or changed. The endpoint needs no auth - ownership is proven by
 * the key file served at /<key>.txt on the live site.
 *
 * Runs in the deploy job, AFTER deploy-pages. The build artifacts (out/) are
 * not shared between jobs, so the sitemap is read from the live site; the
 * local export is only a fallback for manual runs.
 */
import { readFileSync } from 'node:fs';

const HOST = 'www.hmpartshub.com';
const KEY = process.env.INDEXNOW_KEY;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

if (!KEY) {
  console.log('[indexnow] INDEXNOW_KEY not set - skipping');
  process.exit(0);
}

async function loadSitemap() {
  try {
    const res = await fetch(SITEMAP_URL, { headers: { 'User-Agent': 'hm-parts-hub-indexnow/1.0' } });
    if (res.ok) {
      console.log(`[indexnow] sitemap fetched live (HTTP ${res.status})`);
      return await res.text();
    }
    console.log(`[indexnow] live sitemap HTTP ${res.status}`);
  } catch (err) {
    console.log('[indexnow] live sitemap fetch failed:', err.message);
  }
  try {
    console.log('[indexnow] falling back to local out/sitemap.xml');
    return readFileSync('out/sitemap.xml', 'utf8');
  } catch {
    return null;
  }
}

const xml = await loadSitemap();
if (!xml) {
  console.log('[indexnow] no sitemap available - skipping');
  process.exit(0);
}

const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (urls.length === 0) {
  console.log('[indexnow] sitemap has no <loc> entries - skipping');
  process.exit(0);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urls,
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

// 200 = accepted, 202 = accepted but key validation pending. Anything else is
// worth surfacing in the log, but must never fail the deployment.
console.log(`[indexnow] submitted ${urls.length} urls -> HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) {
  console.log('[indexnow] unexpected response:', (await res.text()).slice(0, 300));
}
