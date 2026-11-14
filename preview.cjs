const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const delivery = import('./netlify/lib/delivery.mjs');
const port = Number(process.env.PORT || 8184);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2'
};
const receipts = new Map();
const journal = {
  set(key, value, options) {
    if (options?.onlyIfNew && receipts.has(key)) return { modified: false };
    receipts.set(key, value);
    return { modified: true };
  },
  get: key => receipts.get(key),
  delete: key => receipts.delete(key)
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + req.headers.host);
    if (url.pathname === '/api/contact') {
      let length = 0;
      const chunks = [];
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 8192) { res.writeHead(413); return res.end(); }
        chunks.push(chunk);
      }
      const request = new Request(url, { method: req.method, headers: req.headers,
        body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
      const reply = await (await delivery).handleContact(request, process.env, journal);
      res.writeHead(reply.status, Object.fromEntries(reply.headers));
      return res.end(await reply.text());
    }
    const pathname = decodeURIComponent(url.pathname);
    const segments = pathname.split(/[\\/]/);
    const file = path.resolve(__dirname, '.' + (pathname === '/' ? '/index.html' : pathname));
    const type = types[path.extname(file).toLowerCase()];
    if (!file.startsWith(__dirname + path.sep) || !type || segments.some(part => part.startsWith('.')) ||
      ['netlify', 'node_modules', 'dist', 'package.json', 'package-lock.json'].includes(segments[1])) {
      res.writeHead(404); return res.end();
    }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Page not found.');
  }
});
server.listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port));
