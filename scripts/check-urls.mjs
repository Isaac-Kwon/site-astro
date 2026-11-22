#!/usr/bin/env node
// Verify that every URL the old Jekyll site served still exists in dist/.
//   npm run build && npm run check:urls            -> fail on any missing URL
//   npm run check:urls -- --allow-missing          -> report only (migration in progress)
import fs from 'node:fs';
import path from 'node:path';

const allowMissing = process.argv.includes('--allow-missing');
const dist = path.resolve('dist');
const urls = fs
  .readFileSync(new URL('./jekyll-urls.txt', import.meta.url), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

function exists(url) {
  const rel = decodeURIComponent(url).replace(/^\//, '');
  const file = url.endsWith('/') ? path.join(dist, rel, 'index.html') : path.join(dist, rel);
  return fs.existsSync(file);
}

const missing = urls.filter((u) => !exists(u));
console.log(`${urls.length - missing.length}/${urls.length} Jekyll URLs present in dist/`);
if (missing.length) {
  console.log('Missing:\n  ' + missing.join('\n  '));
  if (!allowMissing) process.exit(1);
}
