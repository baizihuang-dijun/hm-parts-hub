/**
 * Production entry: serves the statically exported site from `out/`.
 * (`next dev` handles development; this file is only used for deploy.)
 */
import { createServer, type ServerResponse } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { join, extname, normalize } from 'path';

const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || process.env.DEPLOY_RUN_PORT || '5000', 10);
const outDir = join(process.cwd(), 'out');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res: ServerResponse, status: number, file: string) {
  res.writeHead(status, {
    'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    // Block path traversal.
    const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let file = join(outDir, safe);
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, 'index.html');
    } else if (!existsSync(file)) {
      file = join(outDir, safe, 'index.html');
    }
    if (existsSync(file) && statSync(file).isFile()) {
      send(res, 200, file);
      return;
    }
    const notFound = join(outDir, '404.html');
    if (existsSync(notFound)) {
      send(res, 404, notFound);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (err) {
    console.error('Error handling', req.url, err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(port, hostname, () => {
  console.log(`> Static server listening at http://${hostname}:${port}, serving ${outDir}`);
});
