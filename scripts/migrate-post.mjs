#!/usr/bin/env node
// Convert a Jekyll (kramdown + Liquid) post into a Markdown file this Astro
// site can render, and copy the /assets/... files it references.
//
//   node scripts/migrate-post.mjs <jekyll-repo> <_posts/file.md> [...more]
//
// What it rewrites (anything else is reported for manual review):
//   - kramdown IAL {:target="_blank"}        -> removed (rehype-external-links)
//   - a paragraph that is only $$...$$        -> fenced display math block
//   - HTML block end followed by Markdown      -> blank line inserted
//   - JSROOT <iframe> wrapper                 -> <div class="root-plot" ...>
//   - {% capture %} + {% include expand %}    -> <details class="expand">
import fs from 'node:fs';
import path from 'node:path';

const [, , jekyllRoot, ...files] = process.argv;
if (!jekyllRoot || files.length === 0) {
  console.error('usage: migrate-post.mjs <jekyll-repo> <_posts/file.md> [...]');
  process.exit(1);
}

const outDir = path.resolve('src/content/posts');
const publicDir = path.resolve('public');

function splitFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? [m[0], src.slice(m[0].length)] : ['', src];
}

function convertExpand(body) {
  const captures = new Map();
  body = body.replace(/\{%\s*capture\s+(\S+)\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\}\n?/g, (_, name, content) => {
    captures.set(name, content.trim());
    return '';
  });
  body = body.replace(/\{%\s*include\s+expand\s+([^%]*)%\}/g, (whole, args) => {
    const title = args.match(/title="([^"]*)"/)?.[1] ?? 'Click to expand';
    const name = args.match(/content=(\S+)/)?.[1];
    if (!name || !captures.has(name)) return whole;
    return `<details class="expand">\n<summary>${title}</summary>\n\n${captures.get(name)}\n\n</details>`;
  });
  return body;
}

function convertJsroot(body) {
  return body.replace(
    /<div style="position:relative;padding-top:([\d.]+)%;?">\s*<iframe[^>]*src="\/assets\/jsroot\/\?([^"]*)"[^>]*>\s*<\/iframe>\s*<\/div>/g,
    (_, ratio, query) => {
      const params = new URLSearchParams(query.replace(/&amp;/g, '&'));
      const file = path.posix.normalize(path.posix.join('/assets/jsroot/', params.get('file') ?? ''));
      const item = params.get('item') ?? '';
      return `<div class="root-plot" data-file="${file}" data-item="${item}" style="--ratio:${parseFloat(ratio)}%"></div>\n`;
    },
  );
}

function convertDisplayMath(body) {
  // kramdown: a paragraph that consists only of $$...$$ is display math.
  // remark-math needs the $$ fences on their own lines for that.
  const lines = body.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\s*)\$\$(?!\$)(.+?)\$\$\s*$/);
    const blankBefore = i === 0 || lines[i - 1].trim() === '';
    const blankAfter = i === lines.length - 1 || lines[i + 1].trim() === '';
    if (m && blankBefore && blankAfter && !m[2].includes('$$')) {
      out.push(`${m[1]}$$`, `${m[1]}${m[2].trim()}`, `${m[1]}$$`);
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

function dropBodySeparators(body) {
  // kramdown: a separator row inside a table body starts a new <tbody>.
  // GFM would render it as a data row of dashes, so drop it.
  const sep = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/;
  const lines = body.split('\n');
  return lines
    .filter((l, i) => !(sep.test(l) && i >= 2 && lines[i - 2].trim().startsWith('|')))
    .join('\n');
}

function separateHtmlBlocks(body) {
  // CommonMark keeps an HTML block open until a blank line; kramdown did not.
  body = body.replace(/^(<\/(?:div|details|figure|table)>)[ \t]*\n(?=[^\n])/gm, '$1\n\n');
  // A line holding only <br> opens an HTML block in CommonMark and swallows
  // the Markdown after it; glue it to the next line instead.
  return body.replace(/^(<br\s*\/?>)[ \t]*\n(?=\S)/gm, '$1');
}

function copyAssets(text) {
  const refs = new Set(text.match(/\/assets\/[^\s)"'<>]+/g) ?? []);
  const copied = [];
  const missing = [];
  for (const ref of refs) {
    const rel = decodeURI(ref).replace(/^\//, '');
    const src = path.join(jekyllRoot, rel);
    const dst = path.join(publicDir, rel);
    if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
      missing.push(ref);
      continue;
    }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    copied.push(ref);
  }
  return { copied, missing };
}

fs.mkdirSync(outDir, { recursive: true });
for (const file of files) {
  const src = fs.readFileSync(path.join(jekyllRoot, file), 'utf8');
  let [fm, body] = splitFrontMatter(src);
  body = body.replace(/\{:\s*target="_blank"\s*\}/g, '');
  // ![alt](src){: .a .b}  ->  <img> with classes (kramdown IAL on images)
  body = body.replace(/!\[([^\]]*)\]\(([^)\s]+)\)\{:\s*((?:\.[\w-]+\s*)+)\}/g, (_, alt, src, cls) => {
    const classes = cls.trim().split(/\s+/).map((c) => c.slice(1)).join(' ');
    return `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" class="${classes}" loading="lazy" />`;
  });
  // MathJax-in-browser \require{...}: the build-time renderer preloads these packages.
  body = body.replace(/\\require\{[a-z]+\}/g, '');
  body = convertExpand(body);
  body = convertJsroot(body);
  body = convertDisplayMath(body);
  body = dropBodySeparators(body);
  body = separateHtmlBlocks(body);

  const out = path.join(outDir, path.basename(file));
  fs.writeFileSync(out, fm + body);

  const { copied, missing } = copyAssets(body);
  const leftovers = [...body.matchAll(/\{%[^%]*%\}|\{\{[^}]*\}\}|\{:[^}]*\}/g)].map((m) => m[0]);
  console.log(`\n${file} -> ${path.relative(process.cwd(), out)}`);
  console.log(`  assets copied: ${copied.length}`);
  if (missing.length) console.log(`  assets MISSING: ${missing.join(', ')}`);
  if (leftovers.length) console.log(`  NEEDS MANUAL REVIEW (Liquid/kramdown left):\n    ${leftovers.join('\n    ')}`);
}
