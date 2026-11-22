// Plain-text summary for meta description: first real paragraph of the
// Markdown body (Jekyll used excerpt_separator "\n\n" + strip_html + truncate 160).
export function excerpt(body: string | undefined, max = 160): string {
  if (!body) return '';
  const text = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^import .*$/gm, '');
  for (const block of text.split(/\n\s*\n/)) {
    const b = block.trim();
    if (!b || /^(#|>|<|\$\$|```|[-*] |\d+\. |\|)/.test(b)) continue;
    const plain = b
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_~`]+/g, '')
      .replace(/\$\$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!plain) continue;
    return plain.length > max ? plain.slice(0, max - 3) + '...' : plain;
  }
  return '';
}
