import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
const destination = path.resolve('dist');
await mkdir(destination, { recursive: true });
const privateEntries = new Set(['dist', 'netlify', 'node_modules', 'package.json', 'package-lock.json', 'netlify.toml', 'preview.cjs', 'CONTACT-SETUP.md']);
for (const entry of await readdir('.', { withFileTypes: true })) {
  if (entry.name.startsWith('.') || privateEntries.has(entry.name)) continue;
  await cp(entry.name, path.join(destination, entry.name), { recursive: true });
}
