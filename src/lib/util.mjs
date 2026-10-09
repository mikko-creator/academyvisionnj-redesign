// util.mjs - small shared helpers for the build pipeline (PIPELINE role). Node builtins only.
// Nothing here reads a clock or a random source: every helper is deterministic.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

/** HTML-escape text or an attribute value (double-quoted attributes). */
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

export function writeFile(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
}

/** Sorted (code-unit order) relative file list with forward slashes. */
export function listFiles(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const ents = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, base, out); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

/** own path ('' = home, 'services/x') -> served path ('/', '/services/x/') */
export const servedPath = (own) => (own ? '/' + own + '/' : '/');
/** served path or own path -> own path (no leading/trailing slash) */
export const ownPath = (p) => String(p ?? '').replace(/^\/+|\/+$/g, '');

/** JSON for a <script type="application/ld+json"> block: no "</" break-out, no raw U+2028/U+2029. */
export const jsonForScript = (v) => JSON.stringify(v)
  .replace(/<\//g, '<\\/').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');

/* ------------------------------------------------------------------------------------------------------------------
   Relative URLs. The theme writes root-absolute URLs ("/services/", "/assets/site.<h>.css"). Every page except
   404.html is rewritten to page-relative URLs when it is written, so dist/ works at a domain root, under a Pages
   project subpath (tools/make-preview.mjs refuses root-absolute references) and from any directory. Only URL-bearing
   attributes are touched: href, src, poster, action, formaction, cite, data-* (value starting with one "/"),
   srcset / imagesrcset / data-srcset candidates, url() in style attributes and in <style> blocks. Script bodies,
   comments, absolute URLs (https://...), protocol-relative URLs (//...), "#..." and other schemes are left alone.
   ------------------------------------------------------------------------------------------------------------------ */
const TAG_RE = /<[a-zA-Z](?:"[^"]*"|'[^']*'|[^'">])*>/g;
const ATTR_RE = /(\s)([^\s"'>/=]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)')/g;
const URL_ATTRS = new Set(['href', 'src', 'poster', 'action', 'formaction', 'cite']);
const SRCSET_ATTRS = new Set(['srcset', 'imagesrcset', 'data-srcset']);
const CSS_URL_RE = /url\(\s*(['"]?)(\/(?!\/)[^'")\s]*)\1\s*\)/g;

export function relUrl(fromDir, v) {
  if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//')) return v;
  const m = v.match(/^([^?#]*)(.*)$/s);
  const p = m[1];
  const rest = m[2] || '';
  let r = path.posix.relative(fromDir, p || '/');
  if (p.endsWith('/')) r = r ? r + '/' : './';
  else if (!r) r = path.posix.basename(p) || './';
  return r + rest;
}

function rewriteTag(tag, fromDir) {
  return tag.replace(ATTR_RE, (all, sp, name, eq, dq, sq) => {
    const val = dq !== undefined ? dq : sq;
    const q = dq !== undefined ? '"' : "'";
    const n = name.toLowerCase();
    let out = val;
    if (URL_ATTRS.has(n) || (n.startsWith('data-') && !SRCSET_ATTRS.has(n))) out = relUrl(fromDir, val);
    else if (SRCSET_ATTRS.has(n)) {
      out = val.split(',').map((part) => {
        const t = part.trim();
        if (!t) return part;
        const sp2 = t.search(/\s/);
        const u = sp2 === -1 ? t : t.slice(0, sp2);
        const d = sp2 === -1 ? '' : t.slice(sp2);
        return relUrl(fromDir, u) + d;
      }).join(', ');
    } else if (n === 'style') out = val.replace(CSS_URL_RE, (mm, qq, u) => 'url(' + qq + relUrl(fromDir, u) + qq + ')');
    return out === val ? all : sp + name + eq + q + out + q;
  });
}

/** Rewrite every root-absolute URL of an HTML document to be relative to the page at servedPath `pagePath`. */
export function relativizeHtml(html, pagePath) {
  const fromDir = pagePath === '/' ? '/' : pagePath.replace(/\/+$/, '');
  const parts = html.split(/(<script\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->)/gi);
  return parts.map((seg, i) => {
    if (i % 2 === 0) return seg.replace(TAG_RE, (t) => rewriteTag(t, fromDir));
    if (/^<!--/.test(seg)) return seg;
    if (/^<script/i.test(seg)) { const end = seg.indexOf('>') + 1; return rewriteTag(seg.slice(0, end), fromDir) + seg.slice(end); }
    const end = seg.indexOf('>') + 1;   // <style>
    return rewriteTag(seg.slice(0, end), fromDir) + seg.slice(end).replace(CSS_URL_RE, (mm, qq, u) => 'url(' + qq + relUrl(fromDir, u) + qq + ')');
  }).join('');
}

/** Run async tasks with a fixed concurrency; results keep input order. */
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}
