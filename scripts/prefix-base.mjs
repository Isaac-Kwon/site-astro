// Astro integration: when the site is built under a sub-path (preview deploy),
// prefix every root-relative URL in the generated HTML with that base.
// Sources keep plain "/assets/..." and "/posts/..." links, exactly as on the
// production site; with base "/" this integration does nothing.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTR = /\b(href|src|data-file|poster|action)="\/(?!\/)([^"]*)"/g;

async function* htmlFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

export default function prefixBase(base) {
  const prefix = base.replace(/\/+$/, '');
  return {
    name: 'prefix-base',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!prefix) return;
        let count = 0;
        for await (const file of htmlFiles(fileURLToPath(dir))) {
          const html = await fs.readFile(file, 'utf8');
          const out = html.replace(ATTR, (whole, attr, rest) => {
            if (`/${rest}`.startsWith(`${prefix}/`)) return whole; // already prefixed (Astro assets)
            count++;
            return `${attr}="${prefix}/${rest}"`;
          });
          if (out !== html) await fs.writeFile(file, out);
        }
        logger.info(`prefixed ${count} root-relative URLs with ${prefix}/`);
      },
    },
  };
}
