import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = resolve(__dirname, 'dist');
const indexPath = join(distDir, 'index.html');
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function sendFile(res, filePath, method = 'GET') {
  const type = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': filePath.includes('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  });

  if (method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
}

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

const server = createServer((req, res) => {
  if (!existsSync(distDir) || !existsSync(indexPath)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build not found. Run "npm run build" before starting the server.');
    return;
  }

  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const normalizedPath = normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, '');
  const requestedPath = resolve(distDir, `.${normalizedPath}`);

  if (requestedPath.startsWith(distDir) && existsSync(requestedPath)) {
    const stats = statSync(requestedPath);
    if (stats.isFile()) {
      sendFile(res, requestedPath, method);
      return;
    }
  }

  if (extname(requestUrl.pathname)) {
    sendNotFound(res);
    return;
  }

  sendFile(res, indexPath, method);
});

server.listen(port, host, () => {
  console.log(`Hostinger SPA server running at http://${host}:${port}`);
});
