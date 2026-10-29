/**
 * Ping IndexNow with every URL in the exported sitemap.
 *
 * IndexNow is a shared push protocol used by Bing, Yandex, Seznam and Naver:
 * instead of waiting for a crawler to come back, we tell them exactly which
 * URLs changed. The endpoint needs no auth - ownership is proven by the key
 * file served at /<key>.txt (public/index/...) on the live site.
 *
 * Runs after deploy-pages so the URLs are already reachable.
 */
import { readFileSync } from 'node:fs';

const HOST = 'www.hmpartshub.com';
const KEY = process.env.INDEXNOW_KEY;

if (!KEY) {
  console.log('[indexnow] INDEXNOW_KEY not set - skipping');
  process.exit(0);
}

let xml = '';
try {
  xml = readFileSync('out/sitemap.xml', 'utf8');
} catch {
  console.log('[indexnow] out/sitemap.xml not found - skipping');
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
