// extract.mjs - the platform-free content model of the Academy Vision source pages (EyeCarePro "PatientEngage").
//
//   node src/lib/extract.mjs            read audit/raw/*.html (never edited) + tmp/extract/rendered/*.html, write
//                                       src/content/pages/<slug>.json and src/content/source-chrome.json
//   node src/lib/extract.mjs --render   capture the rendered snapshots first: serve audit/raw on 127.0.0.1:8814
//                                       in-process, load every page in ONE headless Chrome (tools/cdp.mjs launch(),
//                                       1440x900), scroll to the bottom, save tmp/extract/rendered/<slug>.html,
//                                       <slug>.main.txt, <slug>.chrome.txt and <slug>.net.json
//
// Node builtins only. Deterministic: the default run reads only files and writes JSON with a fixed key order and
// no timestamps, so the same inputs give byte-identical outputs (tools/hashdir.mjs proves it). docs/PORT-NOTES.md
// documents every component type and every decision taken here.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ORIGIN = 'https://www.academyvisionnj.com';
export const RAW_DIR = path.join(ROOT, 'audit', 'raw');
export const RENDERED_DIR = path.join(ROOT, 'tmp', 'extract', 'rendered');
const PAGES_OUT = path.join(ROOT, 'src', 'content', 'pages');
const CHROME_OUT = path.join(ROOT, 'src', 'content', 'source-chrome.json');
export const RENDER_PORT = 8814;

/* ------------------------------------------------------------------------------------------------------------
 * 1. HTML parser (tokenizer + tree builder). Enough of the WHATWG rules for this generator's markup: void
 *    elements, raw-text elements, the implied end tags of p / li / dt / dd / option / tr / td, foreign (svg)
 *    self-closing tags. Every element keeps its source offset so a node can cite its origin.
 * ---------------------------------------------------------------------------------------------------------- */
export const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'keygen']);
const RAW_TEXT = new Set(['script', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']);
const RCDATA = new Set(['textarea', 'title']);
const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', sbquo: '‚', bdquo: '„', ndash: '–', mdash: '—',
  hellip: '…', bull: '•', middot: '·', laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›',
  deg: '°', plusmn: '±', times: '×', divide: '÷', frac12: '½', frac14: '¼', frac34: '¾',
  sup1: '¹', sup2: '²', sup3: '³', micro: 'µ', para: '¶', sect: '§', cent: '¢', pound: '£', euro: '€', yen: '¥',
  iexcl: '¡', iquest: '¿', shy: '­', ensp: ' ', emsp: ' ', thinsp: ' ', zwnj: '‌', zwj: '‍', lrm: '‎', rlm: '‏',
  dagger: '†', Dagger: '‡', permil: '‰', prime: '′', Prime: '″', larr: '←', rarr: '→', uarr: '↑', darr: '↓',
  le: '≤', ge: '≥', ne: '≠', asymp: '≈', infin: '∞', check: '✓', hearts: '♥', star: '☆', ordm: 'º', ordf: 'ª',
  aacute: 'á', Aacute: 'Á', agrave: 'à', Agrave: 'À', acirc: 'â', Acirc: 'Â', auml: 'ä', Auml: 'Ä', atilde: 'ã', aring: 'å',
  eacute: 'é', Eacute: 'É', egrave: 'è', Egrave: 'È', ecirc: 'ê', euml: 'ë', iacute: 'í', Iacute: 'Í', igrave: 'ì', icirc: 'î', iuml: 'ï',
  oacute: 'ó', Oacute: 'Ó', ograve: 'ò', ocirc: 'ô', ouml: 'ö', Ouml: 'Ö', otilde: 'õ', oslash: 'ø',
  uacute: 'ú', Uacute: 'Ú', ugrave: 'ù', ucirc: 'û', uuml: 'ü', Uuml: 'Ü', ntilde: 'ñ', Ntilde: 'Ñ',
  ccedil: 'ç', Ccedil: 'Ç', szlig: 'ß', yuml: 'ÿ', aelig: 'æ', oelig: 'œ',
};
export function decodeEntities(s) {
  if (!s || s.indexOf('&') === -1) return s || '';
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);?/g, (m, b) => {
    if (b[0] === '#') {
      const cp = b[1] === 'x' || b[1] === 'X' ? parseInt(b.slice(2), 16) : parseInt(b.slice(1), 10);
      if (!Number.isFinite(cp) || cp <= 0 || cp > 0x10ffff) return m;
      return String.fromCodePoint(cp);
    }
    if (Object.prototype.hasOwnProperty.call(NAMED, b)) return NAMED[b];
    return m;
  });
}
const CLOSES_P = new Set(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dialog', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'ul', 'li', 'dd', 'dt', 'search']);
const P_SCOPE_STOP = new Set(['button', 'table', 'td', 'th', 'caption', 'html', 'template', 'marquee', 'object', 'applet', 'svg', 'math']);
const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const LIST_STOP = new Set(['ul', 'ol', 'menu', ...P_SCOPE_STOP]);

export function parseHTML(src) {
  const root = { type: 'root', tag: '#root', attrs: {}, children: [], parent: null, start: 0 };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let foreignDepth = 0;
  const popTo = (idx) => { while (stack.length > idx) { const e = stack.pop(); if (e.tag === 'svg' || e.tag === 'math') foreignDepth--; } };
  const findOpen = (tag, stops) => {
    for (let k = stack.length - 1; k > 0; k--) {
      if (stack[k].tag === tag) return k;
      if (stops && stops.has(stack[k].tag)) return -1;
    }
    return -1;
  };
  const addText = (t, at) => {
    if (!t) return;
    const p = top();
    const last = p.children[p.children.length - 1];
    if (last && last.type === 'text' && !last.raw) last.text += t; else p.children.push({ type: 'text', text: t, parent: p, start: at });
  };
  let i = 0;
  const n = src.length;
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) { addText(decodeEntities(src.slice(i)), i); break; }
    if (lt > i) addText(decodeEntities(src.slice(i, lt)), i);
    i = lt;
    if (src.startsWith('<!--', i)) {
      const e = src.indexOf('-->', i + 4);
      top().children.push({ type: 'comment', text: src.slice(i + 4, e === -1 ? n : e), parent: top(), start: i });
      i = e === -1 ? n : e + 3;
      continue;
    }
    const c1 = src[i + 1];
    if (c1 === '!' || c1 === '?') { const e = src.indexOf('>', i); i = e === -1 ? n : e + 1; continue; }
    if (c1 === '/') {
      const m = /^<\/([A-Za-z][A-Za-z0-9:-]*)[^>]*>/.exec(src.slice(i, i + 300));
      if (!m) { addText('<', i); i += 1; continue; }
      const tag = m[1].toLowerCase();
      i += m[0].length;
      if (tag === 'br') { top().children.push({ type: 'el', tag: 'br', attrs: {}, children: [], parent: top(), start: i - m[0].length }); continue; }
      const k = findOpen(tag);
      if (k > 0) popTo(k);
      continue;
    }
    if (!/[A-Za-z]/.test(c1 || '')) { addText('<', i); i += 1; continue; }
    const tagStart = i;
    let j = i + 1;
    while (j < n && /[A-Za-z0-9:-]/.test(src[j])) j++;
    const tag = src.slice(i + 1, j).toLowerCase();
    const attrs = {};
    let selfClose = false;
    for (;;) {
      while (j < n && /\s/.test(src[j])) j++;
      if (j >= n) break;
      if (src[j] === '>') { j++; break; }
      if (src[j] === '/' && src[j + 1] === '>') { selfClose = true; j += 2; break; }
      if (src[j] === '/') { j++; continue; }
      let k = j;
      while (k < n && !/[\s=>]/.test(src[k]) && !(src[k] === '/' && src[k + 1] === '>')) k++;
      const name = src.slice(j, k).toLowerCase();
      j = k;
      while (j < n && /\s/.test(src[j])) j++;
      let val = '';
      if (src[j] === '=') {
        j++;
        while (j < n && /\s/.test(src[j])) j++;
        const q = src[j];
        if (q === '"' || q === "'") {
          const e = src.indexOf(q, j + 1);
          val = src.slice(j + 1, e === -1 ? n : e);
          j = e === -1 ? n : e + 1;
        } else {
          let e = j;
          while (e < n && !/[\s>]/.test(src[e])) e++;
          val = src.slice(j, e);
          j = e;
        }
      }
      if (name && !Object.prototype.hasOwnProperty.call(attrs, name)) attrs[name] = decodeEntities(val);
    }
    i = j;
    if (foreignDepth === 0) {
      if (CLOSES_P.has(tag)) { const k = findOpen('p', P_SCOPE_STOP); if (k > 0) popTo(k); }
      if (tag === 'li') { const k = findOpen('li', LIST_STOP); if (k > 0) popTo(k); }
      if (tag === 'dt' || tag === 'dd') {
        for (let k = stack.length - 1; k > 0; k--) {
          if (stack[k].tag === 'dl' || P_SCOPE_STOP.has(stack[k].tag)) break;
          if (stack[k].tag === 'dt' || stack[k].tag === 'dd') { popTo(k); break; }
        }
      }
      if (tag === 'option' && top().tag === 'option') popTo(stack.length - 1);
      if (tag === 'optgroup') { if (top().tag === 'option') popTo(stack.length - 1); if (top().tag === 'optgroup') popTo(stack.length - 1); }
      if (HEADINGS.has(tag) && HEADINGS.has(top().tag)) popTo(stack.length - 1);
      if (tag === 'tr') { const k = findOpen('tr', new Set(['table'])); if (k > 0) popTo(k); }
      if (tag === 'td' || tag === 'th') {
        for (let k = stack.length - 1; k > 0; k--) {
          if (stack[k].tag === 'tr' || stack[k].tag === 'table') break;
          if (stack[k].tag === 'td' || stack[k].tag === 'th') { popTo(k); break; }
        }
      }
    }
    const el = { type: 'el', tag, attrs, children: [], parent: top(), start: tagStart };
    top().children.push(el);
    if (VOID.has(tag) && foreignDepth === 0) continue;
    if (selfClose && (foreignDepth > 0 || tag === 'svg' || tag === 'math')) continue;
    if (foreignDepth === 0 && (RAW_TEXT.has(tag) || RCDATA.has(tag))) {
      const re = new RegExp('</' + tag + '\\s*>', 'ig');
      re.lastIndex = i;
      const m = re.exec(src);
      const end = m ? m.index : n;
      const body = src.slice(i, end);
      if (body) el.children.push({ type: 'text', text: RCDATA.has(tag) ? decodeEntities(body) : body, raw: true, parent: el, start: i });
      i = m ? m.index + m[0].length : n;
      continue;
    }
    if (tag === 'svg' || tag === 'math') foreignDepth++;
    stack.push(el);
  }
  return root;
}

export const cls = (el) => (el && el.attrs && el.attrs.class ? el.attrs.class.split(/\s+/).filter(Boolean) : []);
export const hasClass = (el, c) => cls(el).includes(c);
export function* walk(node) { yield node; if (node.children) for (const c of node.children) yield* walk(c); }
export const find = (node, pred) => { for (const x of walk(node)) if (x !== node && x.type === 'el' && pred(x)) return x; return null; };
export const findAll = (node, pred) => { const out = []; for (const x of walk(node)) if (x !== node && x.type === 'el' && pred(x)) out.push(x); return out; };
export const childEls = (node) => (node.children || []).filter((c) => c.type === 'el');
const SKIP_TEXT = new Set(['script', 'style', 'noscript', 'template', 'svg', 'iframe']);
export const textOf = (node) => {
  if (node.type === 'text') return node.text;
  if (node.type !== 'el' && node.type !== 'root') return '';
  if (SKIP_TEXT.has(node.tag)) return '';
  if (node.tag === 'br') return '\n';
  return node.children.map(textOf).join('');
};
export const squash = (s) => String(s || '').replace(/[\s ]+/g, ' ').trim();
export const cptType = (el) => { const t = cls(el).find((c) => c.startsWith('cpt--type-')); return t ? t.slice(10) : null; };
export const cptTypes = (el) => cls(el).filter((c) => c.startsWith('cpt--type-')).map((c) => c.slice(10));
export const cptId = (el) => { const t = cls(el).find((c) => c.startsWith('cpt--id-')); return t ? t.slice(8) : null; };
export const closest = (el, pred) => { let p = el; while (p) { if (p.type === 'el' && pred(p)) return p; p = p.parent; } return null; };
export const lineOf = (src, offset) => { let n = 1; for (let k = 0; k < offset && k < src.length; k++) if (src.charCodeAt(k) === 10) n++; return n; };

/* ------------------------------------------------------------------------------------------------------------
 * 2. Render mode: one headless Chrome, every page, rendered DOM + visible <main> text saved for the parity check.
 * ---------------------------------------------------------------------------------------------------------- */
export const listSlugs = () => fs.readdirSync(RAW_DIR).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5)).sort();

/* Hosts the capture never lets the browser reach: analytics / tag manager / session recording / call tracking
   (a localhost visit must not land in the client's analytics), reCAPTCHA, the Maps embed (it bills the
   platform's API key) and the client's own origin (rule: the crawl is done). cdn.patientengage.cloud and
   storage.googleapis.com (the page's own images, fonts) stay allowed. */
export const BLOCKED_URL_PATTERNS = [
  '*googletagmanager.com*', '*google-analytics.com*', '*analytics.google.com*', '*clarity.ms*', '*doubleclick.net*',
  '*google.com/recaptcha*', '*gstatic.com/recaptcha*', '*recaptcha.net*', '*google.com/maps*', '*maps.googleapis.com*',
  '*callrail.com*', '*connect.facebook.net*', '*bat.bing.com*', '*academyvisionnj.com*',
];

async function render(only = null) {
  const { launch, sleep } = await import(pathToFileURL(path.join(ROOT, 'tools', 'cdp.mjs')).href);
  fs.mkdirSync(RENDERED_DIR, { recursive: true });
  const slugs = only ? listSlugs().filter((s) => only.includes(s)) : listSlugs();
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent((req.url || '/').split('?')[0]);
    const m = /^\/([a-z0-9-]+)\.html$/.exec(p);
    const f = m ? path.join(RAW_DIR, m[1] + '.html') : null;
    if (f && fs.existsSync(f)) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); fs.createReadStream(f).pipe(res); return; }
    res.writeHead(404, { 'content-type': 'text/plain' }).end('404');
  });
  await new Promise((res, rej) => { server.once('error', rej); server.listen(RENDER_PORT, '127.0.0.1', res); });
  let b;
  try {
    // site isolation off: cross-origin iframes (the Maps embed) then load in the page's own process, so the page
    // session's Network.setBlockedURLs covers their navigation too (with it on, the first capture let 33 Maps
    // embed documents through)
    b = await launch({ extraArgs: ['--disable-features=IsolateOrigins,site-per-process', '--disable-site-isolation-trials'] });
    const page = await b.newPage({ width: 1440, height: 900 });
    await page.send('Network.setBlockedURLs', { urls: BLOCKED_URL_PATTERNS });
    // Network.setBlockedURLs does not stop frame navigations (the second capture still loaded the Maps embed
    // document); Fetch interception does: every request matching a pattern is failed as BlockedByClient
    await page.send('Fetch.enable', { patterns: BLOCKED_URL_PATTERNS.map((urlPattern) => ({ urlPattern })) });
    let current = null;
    b.on((msg) => {
      if (msg.method === 'Fetch.requestPaused' && msg.sessionId === page.sessionId) {
        page.send('Fetch.failRequest', { requestId: msg.params.requestId, errorReason: 'BlockedByClient' }).catch(() => {});
        if (current) current.fetchBlocked.push(msg.params.request.url.slice(0, 160));
        return;
      }
      if (!current || msg.sessionId !== page.sessionId) return;
      if (msg.method === 'Network.requestWillBeSent') current.requests.set(msg.params.requestId, { url: msg.params.request.url, type: msg.params.type || '', blocked: null, failed: null });
      if (msg.method === 'Network.loadingFailed') { const r = current.requests.get(msg.params.requestId); if (r) { r.blocked = msg.params.blockedReason || null; r.failed = msg.params.errorText || null; } }
      if (msg.method === 'Runtime.exceptionThrown') current.errors.push(String((msg.params.exceptionDetails && (msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description || msg.params.exceptionDetails.text)) || '').slice(0, 300));
    });
    for (const slug of slugs) {
      current = { requests: new Map(), errors: [], fetchBlocked: [] };
      const url = `http://127.0.0.1:${RENDER_PORT}/${slug}.html`;
      await page.goto(url, { settle: 1200 });
      // scroll to the bottom in viewport steps so lazy images, IntersectionObserver reveals and late widgets run
      let y = 0;
      for (let k = 0; k < 80; k++) {
        const h = await page.eval('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)');
        if (y >= h) break;
        y += 700;
        await page.eval(`window.scrollTo(0, ${y})`);
        await sleep(160);
      }
      await sleep(1500);
      const snap = await page.eval(`(() => {
        const t = (sel) => { const e = document.querySelector(sel); return e ? e.innerText : ''; };
        return { html: '<!DOCTYPE html>\\n' + document.documentElement.outerHTML, main: t('main'),
                 chrome: [t('header'), t('footer')].join('\\n\\u0000\\n'), height: document.documentElement.scrollHeight,
                 title: document.title };
      })()`);
      fs.writeFileSync(path.join(RENDERED_DIR, slug + '.html'), snap.html);
      fs.writeFileSync(path.join(RENDERED_DIR, slug + '.main.txt'), snap.main);
      fs.writeFileSync(path.join(RENDERED_DIR, slug + '.chrome.txt'), snap.chrome);
      const reqs = [...current.requests.values()].map((r) => ({ host: hostOf(r.url), url: r.url.length > 300 ? r.url.slice(0, 300) + '…' : r.url, type: r.type, blocked: r.blocked, failed: r.failed }));
      fs.writeFileSync(path.join(RENDERED_DIR, slug + '.net.json'), JSON.stringify({ url, viewport: '1440x900', scrollHeight: snap.height, title: snap.title, blockedPatterns: BLOCKED_URL_PATTERNS, requests: reqs, fetchBlocked: current.fetchBlocked, errors: current.errors }, null, 1) + '\n');
      console.log('rendered', slug.padEnd(58), String(snap.main.length).padStart(6), 'chars main,', String(reqs.length).padStart(4), 'requests');
    }
  } finally {
    if (b) await b.close();
    await new Promise((res) => server.close(res));
  }
}
export const hostOf = (u) => { try { return new URL(u).host; } catch { return ''; } };

/* ------------------------------------------------------------------------------------------------------------
 * 3. CSS: the generator inlines every component's styles in <head>. Only a handful of facts are read from them
 *    (backgrounds, overlay, text colour, column spans, callout image side, focal points, min-height), each as the
 *    cascade at a 1440px (desktop) and a 390px (mobile) viewport, by exact selector, in source order.
 * ---------------------------------------------------------------------------------------------------------- */
export const DESKTOP = 1440;
export const MOBILE = 390;
const normSel = (s) => s.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1').trim();
function splitTop(s, sep) {
  const out = []; let depth = 0, q = null, cur = '';
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (q) { cur += c; if (c === q && s[k - 1] !== '\\') q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(') depth++; else if (c === ')') depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
export function parseCSS(css) {
  const rules = [];
  const n = css.length;
  const skipString = (k) => { const q = css[k]; k++; while (k < n && css[k] !== q) { if (css[k] === '\\') k++; k++; } return k + 1; };
  const findClose = (k) => {
    let depth = 0;
    for (; k < n; k++) {
      const c = css[k];
      if (c === '"' || c === "'") { k = skipString(k) - 1; continue; }
      if (c === '/' && css[k + 1] === '*') { const e = css.indexOf('*/', k + 2); k = e === -1 ? n : e + 1; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return k; }
    }
    return n;
  };
  const parseDecls = (a, b) => splitTop(css.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, ''), ';').map((d) => {
    const c = d.indexOf(':');
    if (c === -1) return null;
    return [d.slice(0, c).trim().toLowerCase(), d.slice(c + 1).replace(/!important\s*$/i, '').trim()];
  }).filter(Boolean);
  const parseList = (start, end, media) => {
    let i = start;
    while (i < end) {
      while (i < end && /\s/.test(css[i])) i++;
      if (css.startsWith('/*', i)) { const e = css.indexOf('*/', i + 2); i = e === -1 ? end : e + 2; continue; }
      if (i >= end) break;
      let k = i, paren = 0;
      while (k < end) {
        const c = css[k];
        if (c === '"' || c === "'") { k = skipString(k); continue; }
        if (c === '(') paren++; else if (c === ')') paren--;
        else if (paren === 0 && (c === '{' || c === ';')) break;
        k++;
      }
      if (k >= end) break;
      const prelude = css.slice(i, k).trim();
      if (css[k] === ';') { i = k + 1; continue; }
      const close = findClose(k);
      if (prelude[0] === '@') {
        const name = (/^@([-\w]+)/.exec(prelude) || [, ''])[1].toLowerCase();
        const cond = prelude.slice(name.length + 1).trim();
        if (name === 'media') parseList(k + 1, close, media ? media + ' and ' + cond : cond);
        else if (name === 'supports' || name === 'layer') parseList(k + 1, close, media);
        else if (name === 'container') parseList(k + 1, close, '@container ' + cond);
      } else {
        const decls = parseDecls(k + 1, close);
        for (const sel of splitTop(prelude, ',')) rules.push({ media: media || null, sel: normSel(sel), decls });
      }
      i = close + 1;
    }
  };
  parseList(0, n, null);
  return rules;
}
export function mediaMatches(media, width) {
  if (!media) return true;
  if (media.startsWith('@container')) return false;
  return splitTop(media, ',').some((alt) => alt.split(/\band\b/).every((part) => {
    const p = part.trim().toLowerCase();
    if (!p || p === 'screen' || p === 'all' || p === 'only screen') return true;
    const m = /^\(\s*(min|max)-width\s*:\s*(\d+(?:\.\d+)?)px\s*\)$/.exec(p);
    if (!m) return false;
    return m[1] === 'min' ? width >= Number(m[2]) : width <= Number(m[2]);
  }));
}
export class CssIndex {
  constructor(rules) { this.by = new Map(); for (const r of rules) { if (!this.by.has(r.sel)) this.by.set(r.sel, []); this.by.get(r.sel).push(r); } }
  decls(sel, width) { const out = new Map(); for (const r of this.by.get(normSel(sel)) || []) if (mediaMatches(r.media, width)) for (const [p, v] of r.decls) out.set(p, v); return out; }
  get(sel, prop, width = DESKTOP) { const v = this.decls(sel, width).get(prop); return v === undefined ? null : v; }
  urls(sel, width) {
    const out = [];
    for (const r of this.by.get(normSel(sel)) || []) {
      if (!mediaMatches(r.media, width)) continue;
      for (const [p, v] of r.decls) if (p === 'background-image' || p === 'background') for (const m of v.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) out.push(m[2]);
    }
    return out;
  }
}
const cssOfDoc = (doc) => findAll(doc, (e) => e.tag === 'style').map((s) => (s.children[0] ? s.children[0].text : '')).join('\n');

/* ------------------------------------------------------------------------------------------------------------
 * 4. Images: master = the CDN URL before "@w_" (the whole URL when it has none); file = the largest local
 *    variant on disk (audit/image-inventory.json); ties prefer webp, then png, jpeg, svg, then the URL.
 * ---------------------------------------------------------------------------------------------------------- */
export const masterOf = (u) => String(u || '').split('@w_')[0];
const FORMAT_RANK = { webp: 0, png: 1, jpeg: 2, jpg: 2, gif: 3, svg: 4 };
let INV = null;
export function inventory() {
  if (INV) return INV;
  const recs = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit', 'image-inventory.json'), 'utf8')).images;
  const bySrc = new Map(), byMaster = new Map();
  for (const r of recs) {
    bySrc.set(r.src, r);
    const m = masterOf(r.src);
    if (!byMaster.has(m)) byMaster.set(m, []);
    byMaster.get(m).push(r);
  }
  INV = { bySrc, byMaster, count: recs.length };
  return INV;
}
const absUrl = (u) => { try { return new URL(String(u).trim(), ORIGIN + '/').href; } catch { return String(u).trim(); } };
const srcsetUrls = (s) => (s ? s.split(/,(?=\s*(?:https?:)?\/\/|\s*\/)/).map((x) => x.trim().split(/\s+/)[0]).filter(Boolean) : []);
export function resolveImage(cands, ctx, why) {
  const list = cands.filter(Boolean).map(absUrl);
  if (!list.length) return null;
  const master = masterOf(list[0]);
  const { bySrc, byMaster } = inventory();
  const pool = new Map();
  for (const c of list) { const r = bySrc.get(c); if (r) pool.set(r.src, r); }
  for (const c of list) for (const r of byMaster.get(masterOf(c)) || []) pool.set(r.src, r);
  const best = [...pool.values()].sort((a, b) => (b.intrinsicWidth || 0) - (a.intrinsicWidth || 0)
    || (FORMAT_RANK[a.format] ?? 9) - (FORMAT_RANK[b.format] ?? 9) || (a.src < b.src ? -1 : a.src > b.src ? 1 : 0))[0];
  if (!best) { if (ctx) ctx.problem('image-not-in-inventory', master + (why ? ' (' + why + ')' : '')); return { master, file: null, w: null, h: null }; }
  if (!fs.existsSync(path.join(ROOT, best.localFile))) { if (ctx) ctx.problem('image-file-missing', best.localFile); }
  return { master, file: best.localFile, w: best.intrinsicWidth || null, h: best.intrinsicHeight || null };
}
function imageFromImg(img, ctx) {
  if (!img) return null;
  const cands = [img.attrs.src, ...srcsetUrls(img.attrs.srcset)];
  const pic = img.parent && img.parent.tag === 'picture' ? img.parent : null;
  if (pic) for (const s of childEls(pic).filter((e) => e.tag === 'source')) cands.push(...srcsetUrls(s.attrs.srcset));
  const r = resolveImage(cands, ctx, 'img');
  if (!r) return null;
  return { master: r.master, file: r.file, alt: img.attrs.alt === undefined ? null : squash(img.attrs.alt), w: r.w, h: r.h };
}

/* ------------------------------------------------------------------------------------------------------------
 * 5. Links and the html sanitiser.
 * ---------------------------------------------------------------------------------------------------------- */
const OWN_HOSTS = new Set(['academyvisionnj.com', 'www.academyvisionnj.com']);
export function normHref(href, basePath = '/') {
  if (href === undefined || href === null) return null;
  const h = String(href).trim();
  if (!h) return null;
  if (/^(tel|mailto|sms|javascript|data):/i.test(h)) return h;
  if (h.startsWith('#')) return h;
  let u;
  try { u = new URL(h, ORIGIN + basePath); } catch { return h; }
  if (!/^https?:$/.test(u.protocol)) return h;
  if (!OWN_HOSTS.has(u.host)) return h;
  let p = u.pathname.replace(/\/{2,}/g, '/');
  if (!/\.[a-z0-9]{2,5}$/i.test(p) && !p.endsWith('/')) p += '/';
  return p + u.search + u.hash;
}
export const isExternal = (href) => { if (!href || !/^https?:/i.test(href)) return false; try { return !OWN_HOSTS.has(new URL(href).host); } catch { return false; } };
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'blockquote', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption']);
const INLINE_ALLOWED = new Set(['strong', 'b', 'em', 'i', 'a', 'br']);
const BLOCK_TAGS = ['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption'];
const BLOCKISH_UNWRAP = new Set(['div', 'section', 'article', 'header', 'footer', 'aside', 'figure', 'figcaption', 'address', 'dl', 'dt', 'dd', 'main', 'nav', 'fieldset', 'legend', 'label', 'form']);
const DROP = new Set(['script', 'style', 'svg', 'noscript', 'template', 'button', 'input', 'select', 'textarea', 'option']);
const MEDIA = new Set(['img', 'picture', 'iframe', 'video', 'audio', 'object', 'embed', 'canvas']);
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00a0/g, '&nbsp;');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const isChevron = (e) => e.type === 'el' && hasClass(e, 'link-chevron');
export function sanitize(el, ctx, { inline = false, basePath = '/' } = {}) {
  const ser = (node) => {
    if (node.type === 'text') { node.used = true; return escText(node.text.replace(/[ \t\n\r\f]+/g, ' ')); }
    if (node.type !== 'el') return '';
    if (isChevron(node)) { consume(node); return ''; }
    if (DROP.has(node.tag)) return '';
    if (MEDIA.has(node.tag)) { if (ctx) ctx.problem('media-inside-html', node.tag + ' ' + (node.attrs.src || '')); return ''; }
    const inner = node.children.map(ser).join('');
    const tag = node.tag === 'h1' ? 'h2' : node.tag;
    if (node.tag === 'h1' && ctx) ctx.problem('h1-inside-html', 'downgraded to h2');
    const allowed = inline ? INLINE_ALLOWED : ALLOWED;
    if (allowed.has(tag)) {
      if (tag === 'br') return '<br>';
      let attrs = '';
      if (tag === 'a') {
        const href = normHref(node.attrs.href, basePath);
        if (href) attrs += ' href="' + escAttr(href) + '"';
        if (node.attrs.target === '_blank') attrs += ' target="_blank"';
      }
      return '<' + tag + attrs + '>' + inner + '</' + tag + '>';
    }
    if (!inline && BLOCKISH_UNWRAP.has(node.tag)) {
      const hasBlock = new RegExp('<(' + BLOCK_TAGS.join('|') + ')\\b').test(inner);
      return hasBlock ? inner : (inner.trim() ? '<p>' + inner + '</p>' : '');
    }
    if (inline && (BLOCK_TAGS.includes(tag) || BLOCKISH_UNWRAP.has(node.tag))) return ' ' + inner + ' ';
    return inner;
  };
  let html = el.children.map(ser).join('');
  const blk = BLOCK_TAGS.join('|');
  html = html.replace(new RegExp('\\s*(</?(?:' + blk + ')\\b[^>]*>)\\s*', 'g'), '$1').replace(/<p>\s*<\/p>/g, '').replace(/ {2,}/g, ' ').trim();
  if (!inline && html && !new RegExp('^<(?:' + blk + ')\\b').test(html)) html = '<p>' + html + '</p>';
  if (/cpt--|ecp-|patientengage/i.test(html) && ctx) ctx.problem('platform-residue-in-html', html.slice(0, 120));
  return html;
}
export function consume(el) { for (const x of walk(el)) if (x.type === 'text') x.used = true; }
export function cleanText(el) {
  const rec = (n) => {
    if (n.type === 'text') return n.text;
    if (n.type !== 'el' && n.type !== 'root') return '';
    if (SKIP_TEXT.has(n.tag) || isChevron(n)) return '';
    if (n.tag === 'br') return ' ';
    return n.children.map(rec).join('');
  };
  return squash(rec(el));
}

/* ------------------------------------------------------------------------------------------------------------
 * 6. Component converters. Each returns model nodes and marks the DOM text it represents as used; whatever
 *    text in <main> stays unused is a loss and fails the run (see residualText).
 * ---------------------------------------------------------------------------------------------------------- */
const LEAF = new Set(['heading', 'content', 'image', 'button', 'button-group', 'team-list-1', 'team-biography-1', 'team-photo-1',
  'team-positions-1', 'team-languages-1', 'team-highlights-1', 'location-summary-1', 'location-hours-1', 'location-map-1',
  'location-review-carousel-1', 'location-photos-1', 'account-insurance-1', 'account-frames-1', 'account-contact-lenses-1',
  'account-equipment-1', 'article-list-1', 'childpages-2', 'sitemap-1', 'privacy-policy-1', 'disclaimer-1',
  'website-accessibility-policy-1', 'form-embed', 'form', 'divider', 'icon-group', 'icon', 'menu']);
const BLOCK_TYPES = new Set(['section', 'section-callout-1', 'section-divider', 'hero-1', 'hero-2']);

function headingNode(c, ctx) {
  const h = find(c, (e) => hasClass(e, 'heading')) || c;
  const level = /^h[1-6]$/.test(h.tag) ? Number(h.tag[1]) : null;
  const textEl = find(h, (e) => hasClass(e, 'heading__text')) || h;
  const link = find(h, (e) => e.tag === 'a');
  const node = { t: 'heading', level, text: cleanText(textEl), html: sanitize(textEl, ctx, { inline: true, basePath: ctx.path }) };
  if (link) node.href = normHref(link.attrs.href, ctx.path);
  if (find(h, isChevron)) node.chevron = true;
  if (link && link.attrs['aria-label']) node.ariaLabel = squash(link.attrs['aria-label']);
  const align = ctx.css.get(`.cpt--id-${cptId(c)} .heading`, 'text-align');
  if (align === 'center' || align === 'right') node.align = align;
  consume(c);
  return node;
}
function contentNode(c, ctx) {
  const tc = find(c, (e) => hasClass(e, 'text-container')) || c;
  const node = { t: 'html', html: sanitize(tc, ctx, { basePath: ctx.path }) };
  const tt = ctx.css.get(`.cpt--id-${cptId(c)} .content`, 'text-transform');
  if (tt === 'uppercase') node.transform = 'uppercase';
  const align = ctx.css.get(`.cpt--id-${cptId(c)} .content`, 'text-align');
  if (align === 'center' || align === 'right') node.align = align;
  consume(c);
  return node;
}
function imageNode(c, ctx) {
  const img = find(c, (e) => e.tag === 'img');
  const im = imageFromImg(img, ctx);
  if (!im) { ctx.problem('image-component-without-img', cptId(c)); return null; }
  const node = { t: 'image', ...im };
  const a = closest(img, (e) => e.tag === 'a' && e !== c) || find(c, (e) => e.tag === 'a');
  if (a && a.attrs.href && a.attrs.href !== '#') node.href = normHref(a.attrs.href, ctx.path);
  if (hasClass(c, 'mobile-image')) node.variant = 'mobile-only';
  const focal = ctx.css.get(`.cpt--id-${cptId(c)} img`, 'object-position', node.variant === 'mobile-only' ? MOBILE : DESKTOP);
  if (focal) node.focal = focal;
  consume(c);
  return node;
}
function buttonFrom(a, ctx, extra = {}) {
  const labelEl = find(a, (e) => hasClass(e, 'button__label')) || a;
  const href = a.tag === 'a' ? normHref(a.attrs.href, ctx.path) : null;
  const node = { t: 'button', label: cleanText(labelEl), href, external: isExternal(href) };
  if (a.attrs.target === '_blank') node.newTab = true;
  // rel is link metadata the SEO lane needs (3 "Book Appointment" buttons carry rel="nofollow"; the other 55 booking
  // links in <main> do not)
  if (a.attrs.rel) node.rel = squash(a.attrs.rel);
  const variant = cls(a).find((k) => k.startsWith('button--'));
  if (variant) node.variant = variant.slice(8);
  if (a.attrs['aria-label']) node.ariaLabel = squash(a.attrs['aria-label']);
  if (a.tag === 'button') node.element = 'button';
  Object.assign(node, extra);
  consume(a);
  return node;
}
function buttonNode(c, ctx) {
  const a = find(c, (e) => e.tag === 'a' || e.tag === 'button');
  if (!a) { ctx.problem('button-without-link', cptId(c)); return null; }
  const node = buttonFrom(a, ctx);
  if (c.attrs['aria-label'] && !node.ariaLabel) node.ariaLabel = squash(c.attrs['aria-label']);
  consume(c);
  return node;
}
function buttonGroupNodes(c, ctx) {
  const id = cptId(c);
  return findAll(c, (e) => cptType(e) === 'button-group-button').map((b) => {
    const a = find(b, (e) => e.tag === 'a' || e.tag === 'button');
    const node = buttonFrom(a, ctx, { group: id });
    node.id = cptId(b);
    consume(b);
    return node;
  });
}
const htmlOfComponent = (c, ctx) => { const tc = find(c, (e) => hasClass(e, 'text-container')) || c; return sanitize(tc, ctx, { basePath: ctx.path }); };

function teamListNode(c, ctx) {
  const items = findAll(c, (e) => hasClass(e, 'team-item')).map((it) => {
    const title = find(it, (e) => cptType(e) === 'heading');
    const photo = find(it, (e) => cptType(e) === 'image');
    const bio = find(it, (e) => cptType(e) === 'team-biography-1');
    const btn = find(it, (e) => cptType(e) === 'button');
    const t = title ? headingNode(title, ctx) : null;
    const item = { name: t ? t.text : null, href: normHref(it.attrs['data-link'], ctx.path) || (t && t.href) || null };
    if (t) { item.title = { level: t.level, text: t.text, html: t.html, chevron: !!t.chevron }; }
    if (photo) { const im = imageNode(photo, ctx); if (im) { delete im.t; item.photo = im; } }
    if (bio) { item.bio = htmlOfComponent(bio, ctx); consume(bio); }
    if (btn) { const b = buttonNode(btn, ctx); if (b) { delete b.t; item.cta = b; } }
    consume(it);
    return item;
  });
  consume(c);
  return { t: 'team', kind: 'list', items };
}
function teamPartNode(c, ctx) {
  const type = cptType(c);
  const kind = type.replace(/^team-/, '').replace(/-1$/, '');
  if (kind === 'photo') {
    const img = find(c, (e) => e.tag === 'img');
    const im = imageFromImg(img, ctx);
    consume(c);
    return { t: 'team', kind, image: im };
  }
  if (kind === 'biography') { const html = htmlOfComponent(c, ctx); consume(c); return { t: 'team', kind, html }; }
  // positions / languages / highlights: list items when present
  const items = findAll(c, (e) => e.tag === 'li').map((li) => cleanText(li)).filter(Boolean);
  const txt = cleanText(c);
  const node = { t: 'team', kind, items };
  if (!items.length && txt) node.html = htmlOfComponent(c, ctx);
  if (!items.length && !txt) node.empty = true;
  consume(c);
  return node;
}

/* Locations: every location component of the platform is bound to one GSP location record
   (data-gsp-location-id). The record is assembled from the visible summary/hours/map components of the page
   and the site footer; each node carries the whole record plus `show` = the facets that component prints. */
function locationRecord(ctx, gspId) {
  const rec = ctx.locations.get(gspId);
  if (rec) return rec;
  return { locationId: gspId, name: null, phone: null, phoneHref: null, address: null, mapsUrl: null, mapsNewTab: null, hours: [], mapQuery: null, placeId: null };
}
export function readLocations(doc, ctxLike) {
  const out = new Map();
  const get = (id) => { if (!out.has(id)) out.set(id, { locationId: id, name: null, phone: null, phoneHref: null, address: null, mapsUrl: null, mapsNewTab: null, hours: [], mapQuery: null, placeId: null }); return out.get(id); };
  for (const s of findAll(doc, (e) => cptType(e) === 'location-summary-1')) {
    const r = get(s.attrs['data-gsp-location-id'] || '');
    const title = find(s, (e) => cptType(e) === 'heading');
    if (title && !r.name) r.name = cleanText(title);
    for (const a of findAll(s, (e) => e.tag === 'a')) {
      const href = a.attrs.href || '';
      const label = cleanText(find(a, (e) => e.tag === 'span' && !hasClass(e, 'icon-svg')) || a);
      if (/^tel:/i.test(href)) { if (!r.phone) { r.phone = label; r.phoneHref = href; } }
      else if (/google\.[a-z.]+\/maps/i.test(href)) { if (!r.address) { r.address = label.replace(/\s*\u00bb\s*$/, ''); r.mapsUrl = href; r.mapsNewTab = a.attrs.target === '_blank'; } }
    }
  }
  for (const hEl of findAll(doc, (e) => cptType(e) === 'location-hours-1')) {
    const r = get(hEl.attrs['data-gsp-location-id'] || '');
    if (r.hours.length) continue;
    r.hours = findAll(hEl, (e) => hasClass(e, 'hour')).map((h) => ({ label: cleanText(find(h, (e) => e.tag === 'dt') || h), text: cleanText(find(h, (e) => e.tag === 'dd') || h) }));
  }
  for (const m of findAll(doc, (e) => cptType(e) === 'location-map-1')) {
    const r = get(m.attrs['data-gsp-location-id'] || '');
    const f = find(m, (e) => e.tag === 'iframe');
    const q = f ? (/[?&]q=([^&]+)/.exec(f.attrs.src || '') || [])[1] : null;
    if (q && !r.placeId) { const d = decodeURIComponent(q); r.placeId = d.startsWith('place_id:') ? d.slice(9) : null; if (!r.placeId) r.mapSourceQuery = d; }
  }
  for (const r of out.values()) if (r.name && r.address) r.mapQuery = r.name + ', ' + r.address;
  return out;
}
function locationNode(c, ctx) {
  const type = cptType(c);
  const gsp = c.attrs['data-gsp-location-id'] || '';
  const rec = locationRecord(ctx, gsp);
  const show = [];
  if (type === 'location-summary-1') {
    if (find(c, (e) => cptType(e) === 'heading')) show.push('name');
    for (const a of findAll(c, (e) => e.tag === 'a')) {
      if (/^tel:/i.test(a.attrs.href || '')) show.push('phone');
      else if (/google\.[a-z.]+\/maps/i.test(a.attrs.href || '')) show.push('address');
    }
    // the location record is read page-wide; a summary that prints a different value than the record must not hide it
    for (const a of findAll(c, (e) => e.tag === 'a')) {
      const label = cleanText(find(a, (e) => e.tag === 'span' && !hasClass(e, 'icon-svg')) || a);
      if (/^tel:/i.test(a.attrs.href || '') && label !== rec.phone) ctx.problem('location-summary-phone-differs', label + ' vs ' + rec.phone);
      if (/google\.[a-z.]+\/maps/i.test(a.attrs.href || '') && label.replace(/\s*\u00bb\s*$/, '') !== rec.address) ctx.problem('location-summary-address-differs', label);
    }
    if (find(c, (e) => cleanText(e) && /\u00bb\s*$/.test(cleanText(e)) && e.tag === 'span')) show.push('chevron');
  } else if (type === 'location-hours-1') {
    show.push('hours');
    const here = findAll(c, (e) => hasClass(e, 'hour')).map((h) => ({ label: cleanText(find(h, (e) => e.tag === 'dt') || h), text: cleanText(find(h, (e) => e.tag === 'dd') || h) }));
    if (JSON.stringify(here) !== JSON.stringify(rec.hours)) ctx.problem('location-hours-differ', JSON.stringify(here));
  } else if (type === 'location-map-1') show.push('map');
  consume(c);
  const node = { t: 'location', show, locationId: rec.locationId, name: rec.name, address: rec.address, phone: rec.phone, phoneHref: rec.phoneHref, mapsUrl: rec.mapsUrl, mapsNewTab: rec.mapsNewTab, hours: rec.hours, mapQuery: rec.mapQuery, placeId: rec.placeId };
  if (type === 'location-map-1') { const f = find(c, (e) => e.tag === 'iframe'); if (f && f.attrs.title) node.mapTitle = squash(f.attrs.title); }
  return node;
}
function reviewsNode(c, ctx) {
  const ld = (ctx.jsonLd || []).flatMap((j) => (j && j['@graph'] ? j['@graph'] : [j])).filter((j) => j && Array.isArray(j.review));
  const ldReviews = ld.flatMap((j) => j.review);
  const ldNorm = (s) => squash(String(s || '')).toLowerCase();
  const items = findAll(c, (e) => hasClass(e, 'review__item')).map((it) => {
    const content = find(it, (e) => cptType(e) === 'content');
    const full = content && find(content, (e) => hasClass(e, 'content-full'));
    const excerptEl = content && find(content, (e) => hasClass(e, 'content-excerpt'));
    let quote, excerpt = null;
    if (full) {
      quote = cleanText(full);
      const ex = excerptEl ? excerptEl.children.filter((x) => !(x.type === 'el' && (hasClass(x, 'show-more-toggle') || x.tag === 'br'))) : [];
      excerpt = squash(ex.map((x) => (x.type === 'text' ? x.text : cleanText(x))).join(''));
    } else quote = content ? cleanText(find(content, (e) => hasClass(e, 'text-container')) || content) : '';
    const stars = find(it, (e) => hasClass(e, 'review__stars'));
    const label = stars ? squash(stars.attrs['aria-label'] || '') : '';
    const rm = /(\d+(?:\.\d+)?)\s+out\s+of\s+(\d+)/i.exec(label);
    const item = { quote, excerpt, rating: rm ? Number(rm[1]) : null, ratingOf: rm ? Number(rm[2]) : null, ratingLabel: label || null, stars: stars ? squash(textOf(stars)) : null, author: null, date: null, source: null, matchedFrom: null };
    // author/date are not printed; the page's own JSON-LD carries them for the same review body
    const hit = ldReviews.find((r) => ldNorm(r.reviewBody) === ldNorm(quote));
    if (hit) { item.author = hit.author && hit.author.name ? hit.author.name : null; item.date = hit.datePublished || null; item.matchedFrom = 'jsonLd'; }
    consume(it);
    return item;
  });
  const agg = ld.find((j) => j.aggregateRating);
  const node = { t: 'reviews', items, aggregate: agg ? { ratingValue: agg.aggregateRating.ratingValue, reviewCount: agg.aggregateRating.reviewCount, bestRating: agg.aggregateRating.bestRating, worstRating: agg.aggregateRating.worstRating, from: 'jsonLd' } : null, ui: {} };
  const toggle = find(c, (e) => hasClass(e, 'show-more-toggle'));
  if (toggle) node.ui.showMore = cleanText(toggle);
  const prev = find(c, (e) => hasClass(e, 'carousel__previous')); if (prev) node.ui.previous = squash(prev.attrs['aria-label'] || '');
  const next = find(c, (e) => hasClass(e, 'carousel__next')); if (next) node.ui.next = squash(next.attrs['aria-label'] || '');
  const dot = find(c, (e) => e.tag === 'button' && e.attrs['data-index'] !== undefined); if (dot) node.ui.dot = squash((dot.attrs['aria-label'] || '').replace(/\d+$/, '{n}'));
  consume(c);
  return node;
}
function photosNode(c, ctx) {
  const items = findAll(c, (e) => e.tag === 'img').map((img) => {
    const im = imageFromImg(img, ctx);
    if (closest(img, (e) => hasClass(e, 'location-photo-highlight'))) im.highlight = true;
    return im;
  });
  const lb = find(c, (e) => hasClass(e, 'image-lightbox'));
  consume(c);
  return { t: 'list', kind: 'photos', items, ui: lb && lb.attrs['aria-label'] ? { lightbox: squash(lb.attrs['aria-label']) } : {} };
}
function logoListNode(c, ctx, kind, itemCls, nameCls) {
  const items = findAll(c, (e) => hasClass(e, itemCls)).map((it) => {
    const nameEl = find(it, (e) => hasClass(e, nameCls));
    const logo = imageFromImg(find(it, (e) => e.tag === 'img'), ctx);
    consume(it);
    return { name: nameEl ? cleanText(nameEl) : null, logo };
  });
  const node = { t: 'list', kind, items };
  const more = find(c, (e) => hasClass(e, 'frames__show-more-button') || hasClass(e, 'show-more-button'));
  if (more) node.ui = { showAll: cleanText(more) };
  if (!items.length) node.empty = true;
  consume(c);
  return node;
}
function articleListNode(c, ctx) {
  const items = findAll(c, (e) => hasClass(e, 'article-item')).map((it) => {
    const title = find(it, (e) => cptType(e) === 'heading');
    const t = title ? headingNode(title, ctx) : null;
    const ex = find(it, (e) => cptType(e) === 'content');
    const btn = find(it, (e) => cptType(e) === 'button');
    const img = find(it, (e) => cptType(e) === 'image');
    const item = { title: t ? t.text : null, href: normHref(it.attrs['data-link'], ctx.path) || (t && t.href) || null, chevron: !!(t && t.chevron), excerpt: ex ? htmlOfComponent(ex, ctx) : null };
    if (t && t.ariaLabel) item.ariaLabel = t.ariaLabel;
    if (img) { const im = imageNode(img, ctx); if (im) { delete im.t; item.image = im; } }
    if (btn) { const b = buttonNode(btn, ctx); if (b) { delete b.t; item.cta = b; } }
    consume(it);
    return item;
  });
  consume(c);
  return { t: 'list', kind: 'articles', items };
}
function childpagesNode(c, ctx) {
  const items = findAll(c, (e) => hasClass(e, 'childpage')).map((it) => {
    const title = find(it, (e) => cptType(e) === 'heading');
    const t = title ? headingNode(title, ctx) : null;
    const ex = find(it, (e) => hasClass(e, 'childpage__excerpt'));
    const img = find(it, (e) => cptType(e) === 'image');
    const item = { title: t ? t.text : null, href: normHref(it.attrs['data-link'], ctx.path) || (t && t.href) || null, chevron: !!(t && t.chevron), excerpt: ex ? cleanText(ex) : null };
    if (img) { const im = imageNode(img, ctx); if (im) { delete im.t; item.image = im; } }
    consume(it);
    return item;
  });
  consume(c);
  return { t: 'list', kind: 'childpages', items };
}
function sitemapNode(c, ctx) {
  const items = findAll(c, (e) => e.tag === 'li').map((li) => {
    const a = find(li, (e) => e.tag === 'a');
    const ml = /margin-left:\s*(\d+)px/.exec(li.attrs.style || '');
    return { label: cleanText(a || li), href: a ? normHref(a.attrs.href, ctx.path) : null, depth: ml ? Math.round(Number(ml[1]) / 40) : 0 };
  });
  consume(c);
  return { t: 'list', kind: 'sitemap', items };
}
function legalNode(c, ctx) {
  const kind = cptType(c).replace(/-1$/, '');
  const html = sanitize(c, ctx, { basePath: ctx.path });
  consume(c);
  return { t: 'legal', kind, html };
}

/* Forms: fields keep their platform order; every input is paired with its <label for=id>; options, required,
   types, placeholders and the conditional show/hide rules (parsed from the form's inline script) are kept. */
export function parseFormRules(scripts) {
  for (const s of scripts) {
    const m = /function e\(\)\{(\[[\s\S]*?\])\.forEach\(/.exec(s);
    if (!m) continue;
    const lit = m[1].replace(/!0\b/g, 'true').replace(/!1\b/g, 'false').replace(/([{,])\s*([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
    try { return JSON.parse(lit); } catch { return { unparsed: m[1].slice(0, 400) }; }
  }
  return [];
}
function formNode(c, ctx) {
  const form = cptType(c) === 'form' ? c : find(c, (e) => cptType(e) === 'form');
  const f = form ? find(form, (e) => e.tag === 'form') : null;
  if (!form || !f) { ctx.problem('form-embed-without-form', cptId(c)); consume(c); return { t: 'form', fields: [] }; }
  const labelFor = new Map(findAll(f, (e) => e.tag === 'label' && e.attrs.for).map((l) => [l.attrs.for, l]));
  const scripts = findAll(c, (e) => e.tag === 'script').map((s) => (s.children[0] ? s.children[0].text : ''));
  const pageScripts = ctx.inlineScripts;
  const rules = parseFormRules([...scripts, ...pageScripts].filter((s) => s.includes(cptId(form)) || s.includes('component_id')));
  const fields = [];
  const inputIdToField = new Map();
  for (const fc of findAll(f, (e) => cptTypes(e).some((t) => t.startsWith('form-field-')))) {
    const types = cptTypes(fc).filter((t) => t.startsWith('form-field-')).map((t) => t.slice(11));
    const type = types.find((t) => t !== 'chips') || types[0];
    const id = cptId(fc);
    const wrap = find(fc, (e) => hasClass(e, 'field')) || fc;
    const labelEl = childEls(wrap).find((e) => hasClass(e, 'field__label'));
    const required = !!(labelEl && find(labelEl, (e) => hasClass(e, 'field__required'))) || !!find(fc, (e) => ['input', 'select', 'textarea'].includes(e.tag) && e.attrs.required !== undefined && e.attrs.type !== 'hidden');
    const labelText = labelEl ? cleanText({ type: 'el', tag: 'div', attrs: {}, children: labelEl.children.filter((x) => !(x.type === 'el' && hasClass(x, 'field__required'))) }) : null;
    const field = { id, type };
    if (types.includes('chips')) field.presentation = 'chips';
    if (hasClass(fc, 'cpt--conditional')) field.conditional = true;
    if (labelText) field.label = labelText;
    const reqMark = labelEl ? find(labelEl, (e) => hasClass(e, 'field__required')) : null;
    if (reqMark && cleanText(reqMark)) field.requiredMark = cleanText(reqMark);
    const directLabel = labelEl ? find(labelEl, (e) => e.tag === 'label' && e.attrs.for) : null;
    if (directLabel) field.labelFor = directLabel.attrs.for;
    if (labelEl && labelEl.tag === 'legend') field.legend = true;
    field.required = required;
    if (wrap.attrs['data-field-label'] && wrap.attrs['data-field-label'] !== labelText) field.dataLabel = squash(wrap.attrs['data-field-label']);
    const desc = find(fc, (e) => hasClass(e, 'field__description'));
    if (desc) field.description = cleanText(desc);
    if (type === 'html' || type === 'content' || type === 'heading') {
      const body = find(fc, (e) => hasClass(e, 'field__content')) || (type === 'heading' ? find(fc, (e) => hasClass(e, 'heading')) : null) || wrap;
      if (type === 'heading') { const h = find(fc, (e) => cptType(e) === 'heading') || body; const hn = headingNode(h, ctx); field.text = hn.text; field.level = hn.level; }
      else field.html = sanitize(body, ctx, { basePath: ctx.path });
    }
    const inputs = [];
    for (const inp of findAll(fc, (e) => ['input', 'select', 'textarea'].includes(e.tag))) {
      const t = inp.tag === 'input' ? (inp.attrs.type || 'text').toLowerCase() : inp.tag;
      if (t === 'hidden') { if (inp.attrs.name) field.submitName = inp.attrs.name; continue; }
      const io = { el: inp.tag, type: t };
      for (const k of ['name', 'id', 'value', 'placeholder', 'autocomplete', 'inputmode', 'min', 'max', 'step', 'rows', 'maxlength', 'pattern']) if (inp.attrs[k] !== undefined && inp.attrs[k] !== '') io[k] = inp.attrs[k];
      if (inp.attrs['data-phone-format'] !== undefined) io.phoneFormat = true;
      if (inp.attrs.required !== undefined) io.required = true;
      if (inp.attrs['data-required-group'] === 'true') io.requiredGroup = true;
      if (inp.attrs['aria-label']) io.ariaLabel = squash(inp.attrs['aria-label']);
      const lab = inp.attrs.id ? labelFor.get(inp.attrs.id) : null;
      if (lab) {
        io.label = cleanText(lab);
        if (find(lab, (e) => e.tag === 'a' || e.tag === 'strong' || e.tag === 'em')) io.labelHtml = sanitize(lab, ctx, { inline: true, basePath: ctx.path });
        consume(lab);
      }
      if (inp.tag === 'select') io.options = findAll(inp, (e) => e.tag === 'option').map((o) => ({ value: o.attrs.value === undefined ? cleanText(o) : o.attrs.value, label: cleanText(o) }));
      if (inp.attrs['data-input-id']) inputIdToField.set(inp.attrs['data-input-id'], { field: id, name: inp.attrs.name || null });
      inputs.push(io);
    }
    if (inputs.length) field.inputs = inputs;
    consume(fc);
    fields.push(field);
  }
  if (Array.isArray(rules)) for (const r of rules) {
    const fld = fields.find((x) => x.id === r.component_id);
    if (!fld) { ctx.problem('form-rule-for-unknown-field', JSON.stringify(r).slice(0, 120)); continue; }
    fld.showIf = { action: r.action || 'show', logic: r.logic || 'all', enabled: r.enabled !== false, when: (r.rules || []).map((w) => ({ field: (inputIdToField.get(w.input_id) || {}).field || null, name: (inputIdToField.get(w.input_id) || {}).name || null, operator: w.operator, value: w.value, mode: w.action })) };
  } else if (rules && rules.unparsed) ctx.problem('form-rules-unparsed', rules.unparsed.slice(0, 120));
  const hidden = findAll(f, (e) => e.tag === 'input' && e.attrs.type === 'hidden' && !closest(e, (x) => cptTypes(x).some((t) => t.startsWith('form-field-')))).map((e) => ({ name: e.attrs.name || null, value: e.attrs.value === undefined ? null : e.attrs.value }));
  const success = find(form, (e) => hasClass(e, 'form__success-content'));
  const submit = find(form, (e) => hasClass(e, 'submit-button'));
  const allScripts = [...scripts, ...pageScripts];
  const endpoint = (allScripts.map((s) => (/fetch\("(https:\/\/[^"]+)"\s*,\s*\{method:"POST"/.exec(s) || [])[1]).find(Boolean)) || null;
  const errText = (allScripts.map((s) => (/innerHTML="(There was an error[^"]*)"/.exec(s) || [])[1]).find(Boolean)) || null;
  const submitting = (allScripts.map((s) => (/textContent="(Submitting[^"]*)"/.exec(s) || [])[1]).find(Boolean)) || null;
  /* validation copy: on Submit the form runtime writes one of these strings into a div.field__error[role=alert]
     under each empty required field (verifier render: an empty Submit shows them). Kept only for checks this form
     has a field for: a required checkbox group (data-required-group), a required radio group, any other required
     input/select/textarea. The browser's own validationMessage (bad formats) is not source copy and is not kept.
     A check the form needs but whose string cannot be read from the script is a loss (fatal). */
  const inputsAll = fields.flatMap((x) => x.inputs || []);
  const needs = {
    valueMissing: inputsAll.some((io) => io.required && io.type !== 'radio' && io.type !== 'checkbox'),
    radioGroup: inputsAll.some((io) => io.type === 'radio' && io.required),
    checkboxGroup: inputsAll.some((io) => io.type === 'checkbox' && io.requiredGroup),
  };
  const VALIDATION_RE = {
    valueMissing: /validity\.valueMissing\?"([^"]+)"/,
    radioGroup: /input\[type="radio"\]\[name="'\+\w+\+'"\]:checked'\)\|\|\(\w+="([^"]+)"/,
    checkboxGroup: /hasAttribute\("data-required-group"\)&&\(\w+\.querySelector\('input\[type="checkbox"\]:checked'\)\|\|\(\w+="([^"]+)"/,
  };
  const validation = {};
  for (const k of Object.keys(VALIDATION_RE)) {
    if (!needs[k]) continue;
    const v = allScripts.map((s) => (VALIDATION_RE[k].exec(s) || [])[1]).find(Boolean);
    if (v) validation[k] = v; else ctx.problem('form-validation-message-unparsed', k + ' #' + cptId(form));
  }
  const node = { t: 'form', id: cptId(form), identifier: (hidden.find((h) => h.name === 'identifier') || {}).value || null, fields,
    submit: submit ? { label: cleanText(submit) } : null,
    messages: { success: success ? sanitize(success, ctx, { basePath: ctx.path }) : null, error: errText, submitting, validation },
    action: { attribute: f.attrs.action === undefined ? null : f.attrs.action, method: (f.attrs.method || 'get').toLowerCase(), novalidate: f.attrs.novalidate !== undefined, scriptEndpoint: endpoint, scriptMethod: endpoint ? 'POST' : null,
      captcha: ctx.scriptSrcs.some((s) => /recaptcha/.test(s)) ? 'recaptcha-enterprise' : null },
    hidden };
  if (success) consume(success);
  if (submit) consume(submit);
  consume(c);
  return node;
}

/* ------------------------------------------------------------------------------------------------------------
 * 7. Blocks and pages.
 * ---------------------------------------------------------------------------------------------------------- */
function convertLeaf(c, ctx) {
  const t = cptType(c);
  switch (t) {
    case 'heading': return [headingNode(c, ctx)];
    case 'content': return [contentNode(c, ctx)];
    case 'image': return [imageNode(c, ctx)];
    case 'button': return [buttonNode(c, ctx)];
    case 'button-group': return buttonGroupNodes(c, ctx);
    case 'team-list-1': return [teamListNode(c, ctx)];
    case 'team-biography-1': case 'team-photo-1': case 'team-positions-1': case 'team-languages-1': case 'team-highlights-1': return [teamPartNode(c, ctx)];
    case 'location-summary-1': case 'location-hours-1': case 'location-map-1': return [locationNode(c, ctx)];
    case 'location-review-carousel-1': return [reviewsNode(c, ctx)];
    case 'location-photos-1': return [photosNode(c, ctx)];
    case 'account-insurance-1': return [logoListNode(c, ctx, 'insurance', 'insurances__item', 'insurances__name')];
    case 'account-frames-1': return [logoListNode(c, ctx, 'frames', 'frames__item', 'frames__name')];
    case 'account-contact-lenses-1': return [logoListNode(c, ctx, 'contact-lenses', 'lenses__item', 'lenses__name')];
    case 'account-equipment-1': return [logoListNode(c, ctx, 'equipment', 'equipment__item', 'equipment__name')];
    case 'article-list-1': return [articleListNode(c, ctx)];
    case 'childpages-2': return [childpagesNode(c, ctx)];
    case 'sitemap-1': return [sitemapNode(c, ctx)];
    case 'privacy-policy-1': case 'disclaimer-1': case 'website-accessibility-policy-1': return [legalNode(c, ctx)];
    case 'form-embed': case 'form': return [formNode(c, ctx)];
    case 'divider': consume(c); return [{ t: 'divider' }];
    default: {
      ctx.problem('unknown-component', t + ' #' + cptId(c));
      const html = sanitize(c, ctx, { basePath: ctx.path });
      consume(c);
      return html ? [{ t: 'html', html, unknownType: t }] : [];
    }
  }
}
function backgroundOf(blockId, ctx) {
  const sel = `.cpt--id-${blockId}-background`;
  const color = ctx.css.get(sel, 'background-color', DESKTOP);
  const bg = {};
  if (color && !/^(transparent|#0000|#00000000|rgba\(0,\s*0,\s*0,\s*0\))$/i.test(color)) bg.color = color;
  const desk = ctx.css.urls(`${sel} .cpt-background__image`, DESKTOP);
  if (desk.length) {
    const r = resolveImage([desk[desk.length - 1], ...desk], ctx, 'background');
    bg.image = { master: r.master, file: r.file, w: r.w, h: r.h };
    const pos = ctx.css.get(`${sel} .cpt-background__image`, 'background-position', DESKTOP);
    if (pos) bg.image.position = pos;
    const hidden = ctx.css.get(`.cpt--id-${blockId} .cpt-background__image`, 'display', MOBILE);
    if (hidden === 'none') bg.image.mobile = 'hidden';
  }
  const mob = ctx.css.urls(`${sel} .cpt-background__image`, MOBILE);
  if (mob.length && desk.length && masterOf(mob[mob.length - 1]) !== masterOf(desk[desk.length - 1])) {
    const r = resolveImage([mob[mob.length - 1], ...mob], ctx, 'background-mobile');
    bg.imageMobile = { master: r.master, file: r.file, w: r.w, h: r.h };
  }
  const ov = ctx.css.get(`${sel} .cpt-background__overlay`, 'background', DESKTOP) || ctx.css.get(`${sel} .cpt-background__overlay`, 'background-color', DESKTOP);
  if (ov) bg.overlay = ov;
  const tc = ctx.css.get(`.cpt--id-${blockId}`, 'color', DESKTOP);
  if (tc) bg.textColor = tc;
  return bg;
}
const spanOf = (v) => { const m = /span\s+(\d+)/.exec(v || ''); return m ? Number(m[1]) : null; };
function convertBlock(sec, ctx) {
  const type = cptType(sec);
  const id = cptId(sec);
  const block = { cpt: type, id, at: sec.start, layout: {}, background: backgroundOf(id, ctx), nodes: [] };
  const minH = ctx.css.get(`.cpt--id-${id}`, 'min-height', DESKTOP);
  if (minH && minH !== '0') block.layout.minHeight = minH;
  const columns = [];
  const walkIn = (el, col) => {
    for (const c of childEls(el)) {
      if (c.tag === 'script' || c.tag === 'style') continue;
      const t = cptType(c);
      if (!t) {
        let next = col;
        if (hasClass(c, 'text-column') || hasClass(c, 'imagery-column')) {
          const role = hasClass(c, 'text-column') ? 'text' : 'imagery';
          const sel = `.cpt--id-${id} .${role}-column`;
          const order = ctx.css.get(sel, 'order', DESKTOP);
          const width = ctx.css.get(sel, 'width', DESKTOP);
          const span = spanOf(ctx.css.get(sel, 'grid-column', DESKTOP));
          const orderMobile = ctx.css.get(sel, 'order', MOBILE);
          const colDesc = { role };
          if (span) colDesc.span = span;
          if (width && width !== 'auto') colDesc.width = width;
          if (order !== null) colDesc.order = Number(order);
          if (orderMobile !== null) colDesc.orderMobile = Number(orderMobile);
          if (role === 'imagery') {
            const pos = ctx.css.decls(`.cpt--id-${id} .imagery-column .cpt`, DESKTOP);
            if (pos.get('position') === 'absolute') colDesc.bleed = pos.get('left') === '0' ? 'left' : pos.get('right') === '0' ? 'right' : 'none';
          }
          columns.push(colDesc);
          next = columns.length - 1;
        }
        walkIn(c, next);
        continue;
      }
      if (t === 'background') continue;
      if (t === 'column-group') { ctx.group = (ctx.group ?? -1) + 1; walkIn(c, col); continue; }
      if (t === 'column') {
        const cid = cptId(c);
        const span = spanOf(ctx.css.get(`.cpt--id-${cid}`, 'grid-column', DESKTOP));
        const spanMobile = spanOf(ctx.css.get(`.cpt--id-${cid}`, 'grid-column', MOBILE));
        columns.push({ group: ctx.group, span, spanMobile });
        walkIn(c, columns.length - 1);
        continue;
      }
      if (LEAF.has(t) || !BLOCK_TYPES.has(t)) {
        for (const nd of convertLeaf(c, ctx)) {
          if (!nd) continue;
          const node = { ...nd };
          if (!node.id && t !== 'button-group') node.id = cptId(c);
          if (col !== null && col !== undefined) node.col = col;
          node.origin = ctx.originOf(c);
          block.nodes.push(node);
        }
        continue;
      }
      ctx.problem('nested-block', t + ' #' + cptId(c));
      walkIn(c, col);
    }
  };
  ctx.group = -1;
  walkIn(sec, null);
  if (columns.length) block.layout.columns = columns;
  if (type === 'section-callout-1') {
    const t = columns.find((c) => c.role === 'text'), im = columns.find((c) => c.role === 'imagery');
    if (t && im) {
      const tOrder = t.order ?? 0, iOrder = im.order ?? 0;
      const domTextFirst = columns.indexOf(t) < columns.indexOf(im);
      const textFirst = tOrder === iOrder ? domTextFirst : tOrder < iOrder;
      block.layout.imageSide = textFirst ? 'right' : 'left';
    }
  } else if (type === 'section') {
    // a two-column group whose one column holds only images: report which side the image sits on
    const groups = new Map();
    columns.forEach((c, k) => { if (c.group !== undefined) { if (!groups.has(c.group)) groups.set(c.group, []); groups.get(c.group).push(k); } });
    const sides = [];
    for (const [g, ks] of groups) {
      if (ks.length !== 2) continue;
      const only = (k) => { const ns = block.nodes.filter((n) => n.col === k); return ns.length > 0 && ns.every((n) => n.t === 'image'); };
      if (only(ks[0]) && !only(ks[1])) sides.push({ group: g, imageSide: 'left' });
      else if (only(ks[1]) && !only(ks[0])) sides.push({ group: g, imageSide: 'right' });
    }
    if (sides.length) block.layout.imageSides = sides;
  } else if (type === 'hero-1' || type === 'hero-2') {
    const box = ctx.css.decls(`.cpt--id-${id} .components`, DESKTOP);
    if (box.get('background-color')) block.layout.contentBackground = box.get('background-color');
    if (box.get('max-width')) block.layout.contentMaxWidth = box.get('max-width');
    const align = ctx.css.get(`.cpt--id-${id} .components-position`, 'align-items', DESKTOP);
    if (align) block.layout.contentAlign = align;
  }
  // kicker hint: a one-paragraph, link-free content node of <= 12 words directly followed by a heading in the same column
  for (let k = 0; k + 1 < block.nodes.length; k++) {
    const a = block.nodes[k], b = block.nodes[k + 1];
    if (a.t === 'html' && b.t === 'heading' && a.col === b.col && /^<p>[^<]*<\/p>$/.test(a.html) && a.html.replace(/<[^>]+>/g, '').split(/\s+/).length <= 12) a.hint = 'kicker';
  }
  return block;
}
export function residualText(region) {
  const out = [];
  for (const x of walk(region)) {
    if (x.type !== 'text' || x.used || !x.text.trim()) continue;
    if (closest(x.parent, (e) => SKIP_TEXT.has(e.tag))) continue;
    out.push(squash(x.text));
  }
  return out;
}
const metaOf = (doc) => {
  const metas = findAll(doc, (e) => e.tag === 'meta');
  const byName = (n) => { const m = metas.find((e) => (e.attrs.name || '').toLowerCase() === n); return m ? m.attrs.content : null; };
  const og = {}; const twitter = {};
  for (const m of metas) {
    const p = m.attrs.property || m.attrs.name || '';
    if (p.startsWith('og:')) og[p.slice(3)] = m.attrs.content || '';
    if (p.startsWith('twitter:')) twitter[p.slice(8)] = m.attrs.content || '';
  }
  const titleEl = find(doc, (e) => e.tag === 'title');
  const canon = find(doc, (e) => e.tag === 'link' && (e.attrs.rel || '').toLowerCase() === 'canonical');
  const jsonLd = findAll(doc, (e) => e.tag === 'script' && /ld\+json/i.test(e.attrs.type || '')).map((s) => {
    const raw = s.children[0] ? s.children[0].text : '';
    try { return JSON.parse(raw); } catch (err) { return { '@invalid': String(err.message), raw: raw.slice(0, 2000) }; }
  });
  const meta = { title: titleEl ? squash(textOf(titleEl)) : null, description: byName('description'), canonical: canon ? canon.attrs.href : null, robots: byName('robots'), og };
  if (Object.keys(twitter).length) meta.twitter = twitter;
  const ver = {};
  if (byName('google-site-verification')) ver.google = byName('google-site-verification');
  if (byName('msvalidate.01')) ver.bing = byName('msvalidate.01');
  if (Object.keys(ver).length) meta.verification = ver;
  meta.jsonLd = jsonLd;
  return meta;
};
function pageUrlMap() {
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit', 'content-inventory.json'), 'utf8'));
  return new Map(inv.pages.map((p) => [p.savedAs.replace(/\.html$/, ''), p.url]));
}
function makeCtx(slug, doc, rdoc, urlPath) {
  const problems = [];
  const css = new CssIndex(parseCSS(cssOfDoc(doc)));
  const scripts = findAll(doc, (e) => e.tag === 'script');
  const ctx = {
    slug, path: urlPath, css, problems,
    problem: (kind, detail) => problems.push({ kind, detail }),
    inlineScripts: scripts.filter((s) => !s.attrs.src).map((s) => (s.children[0] ? s.children[0].text : '')),
    scriptSrcs: scripts.filter((s) => s.attrs.src).map((s) => s.attrs.src),
    jsonLd: null, locations: null, rendered: rdoc,
    renderedIds: null,
    originOf: () => 'static',
  };
  return ctx;
}
/* static vs rendered: the component text of every cpt id in the rendered <main> is compared with the static one;
   a component that only has text after JavaScript is converted from the rendered DOM and marked 'rendered'. */
function renderedComponents(rdoc) {
  const out = new Map();
  if (!rdoc) return out;
  const rmain = find(rdoc, (e) => e.tag === 'main');
  if (!rmain) return out;
  for (const e of findAll(rmain, (x) => cptId(x) && cptType(x))) if (!out.has(cptId(e))) out.set(cptId(e), e);
  return out;
}
export function extractPage(slug, opts = {}) {
  const rawPath = path.join(RAW_DIR, slug + '.html');
  const raw = opts.rawOverride !== undefined ? opts.rawOverride : fs.readFileSync(rawPath, 'utf8');
  const doc = parseHTML(raw);
  const renderedFile = path.join(opts.renderedDir || RENDERED_DIR, slug + '.html');
  const rdoc = fs.existsSync(renderedFile) ? parseHTML(fs.readFileSync(renderedFile, 'utf8')) : null;
  const url = (opts.urls || pageUrlMap()).get(slug);
  if (!url) throw new Error('no URL for ' + slug + ' in audit/content-inventory.json');
  const urlPath = normHref(url) || '/';
  const ctx = makeCtx(slug, doc, rdoc, urlPath);
  const meta = metaOf(doc);
  ctx.jsonLd = meta.jsonLd;
  ctx.locations = readLocations(doc);
  const main = find(doc, (e) => e.tag === 'main');
  if (!main) throw new Error('no <main> in ' + slug);
  // rendered-vs-static component comparison
  const rcomp = renderedComponents(rdoc);
  const renderedOnly = [];
  const staticIds = new Set(findAll(main, (x) => cptId(x) && cptType(x)).map(cptId));
  for (const [id, e] of rcomp) if (!staticIds.has(id) && cleanText(e)) renderedOnly.push({ id, type: cptType(e), text: cleanText(e).slice(0, 200) });
  const swapped = new Map();
  for (const e of findAll(main, (x) => cptId(x) && LEAF.has(cptType(x)))) {
    const r = rcomp.get(cptId(e));
    if (!r) continue;
    const sText = cleanText(e), rText = cleanText(r);
    const sImg = findAll(e, (x) => x.tag === 'img').length, rImg = findAll(r, (x) => x.tag === 'img').length;
    if ((!sText && rText) || (sImg === 0 && rImg > 0)) swapped.set(cptId(e), r);
  }
  ctx.originOf = (c) => (swapped.has(cptId(c)) ? 'rendered' : 'static');
  // swap JS-only components in place so the converters read the rendered DOM for them
  for (const [id, r] of swapped) {
    const e = findAll(main, (x) => cptId(x) === id)[0];
    const parent = e.parent; const k = parent.children.indexOf(e);
    r.parent = parent; parent.children[k] = r;
  }
  const blocks = [];
  for (const el of childEls(main)) {
    const t = cptType(el);
    if (!t) {
      if (el.attrs.id === 'main-content' && !cleanText(el)) { consume(el); continue; }
      ctx.problem('non-component-in-main', el.tag + (el.attrs.class ? '.' + el.attrs.class : ''));
      continue;
    }
    blocks.push(convertBlock(el, ctx));
  }
  for (const ro of renderedOnly) ctx.problem('rendered-only-component', ro.type + ' #' + ro.id + ': ' + ro.text);
  const residual = residualText(main);
  for (const r of residual) ctx.problem('unconverted-text', r.slice(0, 160));
  const h1n = blocks.flatMap((b) => b.nodes).find((n) => n.t === 'heading' && n.level === 1);
  const counts = { blocks: blocks.length, nodes: blocks.reduce((a, b) => a + b.nodes.length, 0), static: 0, rendered: 0 };
  for (const b of blocks) for (const n of b.nodes) counts[n.origin === 'rendered' ? 'rendered' : 'static']++;
  const model = {
    schema: 'avnj/page-model@1',
    path: urlPath,
    source: 'audit/raw/' + slug + '.html',
    rendered: rdoc ? 'tmp/extract/rendered/' + slug + '.html' : null,
    meta,
    h1: h1n ? h1n.text : null,
    counts,
    blocks,
  };
  return { model, problems: ctx.problems };
}

/* ------------------------------------------------------------------------------------------------------------
 * 8. Site chrome (header, top bar, menus, CTAs, footer, NAP, hours, social, badges, legal, copyright). The header
 *    is identical on all 31 pages except the menu's current-page classes and the footer is byte-identical; the run
 *    verifies both and records the evidence.
 * ---------------------------------------------------------------------------------------------------------- */
function menuItems(ul, ctx) {
  return childEls(ul).filter((li) => li.tag === 'li').map((li) => {
    const a = childEls(li).find((e) => e.tag === 'a');
    const sub = childEls(li).find((e) => e.tag === 'ul');
    const item = { label: a ? cleanText(a) : cleanText(li), href: a ? normHref(a.attrs.href, '/') : null };
    if (a && a.attrs.target && a.attrs.target !== '_self') item.target = a.attrs.target;
    if (hasClass(li, 'menu--mobile-only')) item.mobileOnly = true;
    item.children = sub ? menuItems(sub, ctx) : [];
    consume(li);
    return item;
  });
}
export function extractChrome(slugs, opts = {}) {
  const problems = [];
  const ctxFor = (slug, doc) => { const c = makeCtx(slug, doc, null, '/'); c.locations = readLocations(doc); c.jsonLd = metaOf(doc).jsonLd; return c; };
  const norm = (h) => h.replace(/ ?menu--current/g, '').replace(/ ?menu--ancestor-is-current/g, '').replace(/class=" +/g, 'class="').replace(/ class=""/g, '');
  const headers = new Map(), footers = new Map();
  for (const s of slugs) {
    const raw = fs.readFileSync(path.join(RAW_DIR, s + '.html'), 'utf8');
    const hd = raw.slice(raw.indexOf('<header'), raw.indexOf('</header>') + 9);
    const ft = raw.slice(raw.indexOf('<footer'), raw.indexOf('</footer>') + 9);
    const pre = raw.slice(raw.indexOf('<body'), raw.indexOf('<header'));
    const key = norm(hd) + '\u0001' + ft + '\u0001' + pre;
    if (!headers.has(key)) headers.set(key, []);
    headers.get(key).push(s);
    footers.set(ft, (footers.get(ft) || 0) + 1);
  }
  if (headers.size !== 1) problems.push({ kind: 'chrome-varies', detail: [...headers.values()].map((v) => v.join(',')).join(' | ') });
  const base = opts.base || 'index';
  const raw = fs.readFileSync(path.join(RAW_DIR, base + '.html'), 'utf8');
  const doc = parseHTML(raw);
  const ctx = ctxFor(base, doc);
  const header = find(doc, (e) => e.tag === 'header');
  const footer = find(doc, (e) => e.tag === 'footer');
  const body = find(doc, (e) => e.tag === 'body');
  const skip = find(body, (e) => hasClass(e, 'skip-to-content'));
  if (skip) consume(skip);
  // top bar: the desktop-only section above the header
  const top = childEls(header).find((e) => cptType(e) === 'section');
  const topbar = top ? { id: cptId(top), visibleAt: cls(top).filter((c) => c.startsWith('cpt--visible-')).map((c) => c.slice(13)), background: backgroundOf(cptId(top), ctx), items: [] } : null;
  if (top) for (const c of findAll(top, (e) => cptType(e) === 'content' || cptType(e) === 'button-group')) {
    if (cptType(c) === 'content') {
      const a = find(c, (e) => e.tag === 'a');
      topbar.items.push({ t: 'link', label: cleanText(c), href: a ? normHref(a.attrs.href, '/') : null, html: htmlOfComponent(c, ctx) });
      consume(c);
    } else for (const b of buttonGroupNodes(c, ctx)) { delete b.id; topbar.items.push(b); }
  }
  const h1c = childEls(header).find((e) => cptType(e) === 'header-1');
  const logoEl = find(h1c, (e) => hasClass(e, 'img--logo'));
  const logoRespEl = find(h1c, (e) => hasClass(e, 'img--logo-responsive'));
  const logoLink = find(h1c, (e) => hasClass(e, 'header__logo'));
  const homeA = logoLink ? find(logoLink, (e) => e.tag === 'a') : null;
  const logo = logoEl ? imageFromImg(find(logoEl, (e) => e.tag === 'img'), ctx) : null;
  const logoResp = logoRespEl ? imageFromImg(find(logoRespEl, (e) => e.tag === 'img'), ctx) : null;
  const iconGroup = find(h1c, (e) => cptType(e) === 'icon-group');
  const quickIcons = iconGroup ? findAll(iconGroup, (e) => cptType(e) === 'icon-group-icon').map((ic) => {
    const a = find(ic, (e) => e.tag === 'a');
    const iconUrl = ctx.css.urls(`.cpt--id-${cptId(ic)} .icon-svg-background`, DESKTOP).concat(ctx.css.urls(`.cpt--id-${cptId(ic)} .icon .icon-svg-background`, DESKTOP));
    const mask = ctx.css.get(`.cpt--id-${cptId(ic)} .icon-svg-background`, 'mask-image', DESKTOP) || ctx.css.get(`.cpt--id-${cptId(ic)} .icon-svg-background`, '-webkit-mask-image', DESKTOP);
    const iconSrc = iconUrl[0] || (mask ? (/url\(\s*(['"]?)([^'")]+)\1\s*\)/.exec(mask) || [])[2] : null);
    consume(ic);
    return { label: a ? squash(a.attrs['aria-label'] || '') : null, href: a ? normHref(a.attrs.href, '/') : null, external: a ? isExternal(normHref(a.attrs.href, '/')) : false, target: a ? a.attrs.target || null : null, icon: iconSrc ? resolveImage([iconSrc], ctx, 'icon') : null };
  }) : [];
  const menuEl = find(h1c, (e) => cptType(e) === 'menu');
  const nav = menuEl ? find(menuEl, (e) => e.tag === 'nav') : null;
  const topUl = nav ? childEls(nav).find((e) => e.tag === 'ul') : null;
  const menu = topUl ? menuItems(topUl, ctx) : [];
  const openA = menuEl ? find(menuEl, (e) => hasClass(e, 'menu__responsive-menu-open')) : null;
  const closeA = menuEl ? find(menuEl, (e) => hasClass(e, 'menu__responsive-menu-close')) : null;
  const toggle = menuEl ? find(menuEl, (e) => hasClass(e, 'menu__accordion-toggle')) : null;
  const menuUi = { open: openA ? squash(openA.attrs['aria-label'] || '') : null, close: closeA ? squash(closeA.attrs['aria-label'] || '') : null, toggle: toggle ? squash(toggle.attrs['aria-label'] || '') : null };
  // the menu script appends a focus-trap link after the list at runtime (rendered only)
  const rendIndex = path.join(RENDERED_DIR, base + '.html');
  if (fs.existsSync(rendIndex)) {
    const rd = parseHTML(fs.readFileSync(rendIndex, 'utf8'));
    const fc = find(rd, (e) => hasClass(e, 'menu-focus-close-menu'));
    if (fc) menuUi.focusClose = { label: cleanText(fc), origin: 'rendered' };
  }
  const dividers = findAll(header, (e) => cptType(e) === 'section-divider').map((d) => ({ id: cptId(d), background: backgroundOf(cptId(d), ctx), minHeight: ctx.css.get(`.cpt--id-${cptId(d)}`, 'min-height', DESKTOP) }));
  // footer
  const fDividers = findAll(footer, (e) => cptType(e) === 'section-divider').map((d) => ({ id: cptId(d), background: backgroundOf(cptId(d), ctx), minHeight: ctx.css.get(`.cpt--id-${cptId(d)}`, 'min-height', DESKTOP) }));
  const fSection = findAll(footer, (e) => cptType(e) === 'section')[0];
  const columns = fSection ? findAll(fSection, (e) => cptType(e) === 'column').map((col) => {
    const nodes = [];
    for (const c of findAll(col, (e) => LEAF.has(cptType(e)) && !closest(e.parent, (x) => LEAF.has(cptType(x)) && x !== e))) {
      for (const n of convertLeaf(c, ctx)) if (n) { n.id = cptId(c); nodes.push(n); }
    }
    return { id: cptId(col), span: spanOf(ctx.css.get(`.cpt--id-${cptId(col)}`, 'grid-column', DESKTOP)), nodes };
  }) : [];
  const gf = find(footer, (e) => hasClass(e, 'ecp-global-footer'));
  const startA = gf ? find(gf, (e) => hasClass(e, 'ecp-global-footer__start')) : null;
  const pa = startA ? find(startA, (e) => e.tag === 'a') : null;
  const credit = pa ? { text: cleanText(pa), href: pa.attrs.href || null, rel: pa.attrs.rel || null, newTab: pa.attrs.target === '_blank', logo: imageFromImg(find(pa, (e) => e.tag === 'img'), ctx) } : null;
  if (pa) consume(pa);
  const legal = gf ? findAll(find(gf, (e) => hasClass(e, 'ecp-global-footer__end')) || gf, (e) => e.tag === 'a').map((a) => { consume(a); return { label: cleanText(a), href: normHref(a.attrs.href, '/') }; }) : [];
  const copyright = credit ? (/^(\u00a9\s*\d{4})/.exec(credit.text) || [])[1] || null : null;
  // NAP: the footer location summary (printed on every page) and the address parts of the newest JSON-LD
  const locs = [...ctx.locations.values()];
  const loc = locs[0] || null;
  const allLd = ctx.jsonLd.flatMap((j) => (j && j['@graph'] ? j['@graph'] : [j]));
  const withAddr = allLd.find((j) => j && j.address && j.address.streetAddress && j.telephone && /978/.test(String(j.telephone))) || allLd.find((j) => j && j.address && j.address.streetAddress);
  const badges = findAll(fSection || footer, (e) => cptType(e) === 'image').map((imC) => imageFromImg(find(imC, (e) => e.tag === 'img'), ctx));
  const anchors = findAll(doc, (e) => e.tag === 'a' && /facebook|instagram|twitter|x\.com|youtube|linkedin|pinterest|tiktok|yelp/i.test(e.attrs.href || ''));
  const ctas = [];
  for (const it of (topbar ? topbar.items : [])) if (it.t === 'button') ctas.push({ where: 'topbar', label: it.label, href: it.href, external: it.external, newTab: !!it.newTab });
  for (const q of quickIcons) ctas.push({ where: 'header-icons', label: q.label, href: q.href, external: q.external, newTab: q.target === '_blank' });
  const tels = [...new Set([...ctas.filter((c) => /^tel:/.test(c.href || '')).map((c) => c.href), loc && loc.phoneHref].filter(Boolean))];
  const ldPhones = [...new Set(allLd.map((j) => j && j.telephone).filter(Boolean))];
  const chrome = {
    schema: 'avnj/source-chrome@1',
    note: 'Source chrome of www.academyvisionnj.com as crawled (audit/raw, 2026-10-08). Values are the source\'s own strings; links are own-origin paths. The header is identical on every page except the menu\'s current-page classes; the footer is byte-identical (see evidence). The Eye Trends restructure is applied at build time, not here.',
    origin: ORIGIN,
    evidence: { pages: slugs.length, headerVariantsIgnoringCurrentClass: headers.size, footerVariants: footers.size, base: 'audit/raw/' + base + '.html' },
    brandName: loc && loc.name ? loc.name : null,
    skipLink: skip ? { label: cleanText(skip), href: skip.attrs.href } : null,
    topbar,
    header: {
      homeHref: homeA ? normHref(homeA.attrs.href, '/') : '/', homeAriaLabel: homeA ? squash(homeA.attrs['aria-label'] || '') : null,
      logo, logoResponsive: logoResp,
      quickIcons: { visibleAt: iconGroup ? cls(iconGroup).filter((c) => c.startsWith('cpt--visible-')).map((c) => c.slice(13)) : [], items: quickIcons },
      dividers,
    },
    menu: { items: menu, ui: menuUi },
    ctas,
    footer: { dividers: fDividers, sectionId: fSection ? cptId(fSection) : null, background: fSection ? backgroundOf(cptId(fSection), ctx) : null, columns, credit, legal },
    nap: loc ? {
      name: loc.name, phone: loc.phone, phoneHref: loc.phoneHref, addressText: loc.address,
      address: withAddr ? { street: withAddr.address.streetAddress, locality: withAddr.address.addressLocality, region: withAddr.address.addressRegion, postalCode: withAddr.address.postalCode, country: withAddr.address.addressCountry || null, from: 'jsonLd (' + [].concat(withAddr['@type']).join('/') + ')' } : null,
      mapsUrl: loc.mapsUrl, mapsNewTab: loc.mapsNewTab, placeId: loc.placeId, mapQuery: loc.mapQuery, locationId: loc.locationId,
    } : null,
    hours: loc ? loc.hours : [],
    social: anchors.map((a) => ({ href: a.attrs.href, label: cleanText(a) || a.attrs['aria-label'] || null })),
    badges,
    legalLinks: legal,
    copyright,
    phoneNumbers: { printedNap: loc ? loc.phone : null, telLinksInChrome: tels, jsonLdTelephones: ldPhones },
  };
  // anything printed in the chrome that the model did not take is a loss
  const residual = [...residualText(header), ...residualText(footer)];
  for (const r of residual) problems.push({ kind: 'unconverted-chrome-text', detail: r.slice(0, 160) });
  for (const p of ctx.problems) problems.push(p);
  return { chrome, problems };
}

/* ------------------------------------------------------------------------------------------------------------
 * 9. Writer.
 * ---------------------------------------------------------------------------------------------------------- */
export function extractAll(opts = {}) {
  const slugs = listSlugs();
  const urls = pageUrlMap();
  const pages = new Map();
  const problems = [];
  for (const slug of slugs) {
    const { model, problems: pr } = extractPage(slug, { urls, renderedDir: opts.renderedDir });
    pages.set(slug, model);
    for (const p of pr) problems.push({ page: slug, ...p });
  }
  const { chrome, problems: cp } = extractChrome(slugs);
  for (const p of cp) problems.push({ page: '(chrome)', ...p });
  return { pages, chrome, problems };
}
const stable = (o) => JSON.stringify(o, null, 2) + '\n';
const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes('--render')) {
    render(args.includes('--only') ? String(args[args.indexOf('--only') + 1] || '').split(',') : null).then(() => { process.exitCode = 0; }, (e) => { console.error(e && e.stack ? e.stack : e); process.exitCode = 1; });
  } else if (args.includes('--control')) {
    /* positive control for the fail-closed residual check: text the converters do not take must be reported.
       (1) a bare <p> injected between two components of index.html's first callout, (2) a component of an
       unknown type, both in memory; the run must report exactly these two losses and nothing else. */
    const raw = fs.readFileSync(path.join(RAW_DIR, 'index.html'), 'utf8');
    const anchor = '<div class="cpt cpt--id-FtY6FoCoyh cpt--type-heading">';
    if (!raw.includes(anchor)) { console.error('control anchor not found'); process.exitCode = 1; }
    else {
      const s1 = 'CONTROL SENTINEL ONE stray paragraph text';
      const s2 = 'CONTROL SENTINEL TWO unknown component text';
      const mutated = raw.replace(anchor, '<p>' + s1 + '</p><div class="cpt cpt--id-ZZcontrol01 cpt--type-mystery-widget-1"><span>' + s2 + '</span></div>' + anchor);
      const { problems } = extractPage('index', { rawOverride: mutated });
      const hits1 = problems.filter((p) => p.kind === 'unconverted-text' && p.detail.includes(s1));
      const hits2 = problems.filter((p) => p.kind === 'unknown-component' && p.detail.includes('mystery-widget-1'));
      const others = problems.filter((p) => !hits1.includes(p) && !hits2.includes(p));
      for (const p of problems) console.log('  reported:', p.kind, '|', p.detail);
      const ok = hits1.length === 1 && hits2.length === 1 && others.length === 0;
      console.log('control:', ok ? 'fired (stray text reported as unconverted-text, unknown component reported; nothing else)' : 'DID NOT FIRE as expected');
      process.exitCode = ok ? 0 : 1;
    }
  } else {
    const missing = listSlugs().filter((s) => !fs.existsSync(path.join(RENDERED_DIR, s + '.html')));
    if (missing.length && !args.includes('--static-only')) {
      console.error('missing rendered snapshots for ' + missing.length + ' page(s) (' + missing.slice(0, 5).join(', ') + '); run node src/lib/extract.mjs --render first, or pass --static-only');
      process.exitCode = 1;
    } else {
      const { pages, chrome, problems } = extractAll();
      fs.mkdirSync(PAGES_OUT, { recursive: true });
      for (const f of fs.readdirSync(PAGES_OUT)) if (f.endsWith('.json') && !pages.has(f.slice(0, -5))) fs.unlinkSync(path.join(PAGES_OUT, f));
      for (const [slug, model] of pages) fs.writeFileSync(path.join(PAGES_OUT, slug + '.json'), stable(model));
      fs.writeFileSync(CHROME_OUT, stable(chrome));
      let nodes = 0, rendered = 0;
      for (const m of pages.values()) { nodes += m.counts.nodes; rendered += m.counts.rendered; }
      console.log('pages', pages.size, '| blocks', [...pages.values()].reduce((a, m) => a + m.counts.blocks, 0), '| nodes', nodes, '(rendered-origin ' + rendered + ')', '| problems', problems.length);
      const byKind = new Map();
      for (const p of problems) byKind.set(p.kind, (byKind.get(p.kind) || 0) + 1);
      for (const [k, v] of byKind) console.log('  problem', k, v);
      for (const p of problems.slice(0, 40)) console.log('   -', p.page, p.kind, '|', String(p.detail).slice(0, 200));
      // fail closed: unconverted text or a missing image file is a loss
      const fatal = problems.filter((p) => ['unconverted-text', 'unconverted-chrome-text', 'unknown-component', 'image-not-in-inventory', 'image-file-missing', 'media-inside-html', 'platform-residue-in-html', 'non-component-in-main', 'chrome-varies', 'rendered-only-component', 'form-embed-without-form', 'form-validation-message-unparsed'].includes(p.kind));
      process.exitCode = fatal.length ? 1 : 0;
    }
  }
}
