// src/theme/parts.mjs - shared building blocks of the Academy Vision theme ("Bayside Daylight Glass", DESIGN-SPEC.md).
// Owner: THEME-CORE (BUILD-CONTRACT §2). Used by src/theme/{index,chrome,home}.mjs and by THEME-TEMPLATES' templates.mjs.
//
// =====================================================================================================================
// CONTRACT  THEME-CORE <-> THEME-TEMPLATES  (fixed 2026-10-08). From now on it changes ADDITIVELY only: new helpers or
// new optional fields. No signature, class name or behaviour listed here is removed or changed.
// =====================================================================================================================
//
// A. ENTRY POINT
//    src/theme/templates.mjs (THEME-TEMPLATES) exports
//        renderMain(page, ctx, kit) -> string
//    = the inner HTML of <main> for EVERY page.kind except 'home' (the home is src/theme/home.mjs). index.mjs wraps it
//    in <main id="main-content" tabindex="-1"> and supplies everything outside <main>: <head> (ctx.seoHead, font and
//    LCP preloads, the fingerprinted CSS), the skip link, the fixed ambient light layer, the header with the desktop
//    menus and the phone drawer, the footer and the deferred script. renderMain must not print any of those. It prints
//    exactly ONE <h1> (kit.titleBand does it) and keeps every model text unit inside <main> (build-verify a).
//    Optional extra export, used when present:  bodyClass(page, ctx) -> string  (extra classes for <body>).
//    Until templates.mjs exists, or if it fails to import, index.mjs renders <main> with the theme stub's markup
//    (the build never breaks). Env THEME_MAIN=stub forces that fallback (THEME-CORE's isolated tests).
//
// B. kit = createKit(ctx, page): one object per page; every helper is bound to ctx and page. Helpers return HTML
//    strings with root-absolute URLs (the build makes them page-relative) unless noted. ctx and page are frozen and are
//    never mutated. Arguments named `html` are trusted model/adopted HTML and are printed as is; `text` is escaped.
//
//    text and attributes
//      kit.esc(text)                       HTML-escape (& < > ")
//      kit.attrs({k: v})                   ' k="v"' (null/undefined/false skipped, true -> bare attribute)
//      kit.plain(html)                     tags stripped, common entities decoded (for logic only, never printed)
//      kit.unwrapP(html)                   '<p>x</p>' -> 'x' when html is exactly one paragraph, else unchanged
//      kit.icon(name, cls?)                inline SVG, aria-hidden: arrow phone pin chev star clock play pause
//    type
//      kit.accent(html, {phrase?, swoosh?, none?})  html with ONE <em class="acc"> (DESIGN-SPEC 10.1): "Pine Beach"
//                                          (+ ", NJ" / ", New Jersey"), else the last two words, three when the first
//                                          is for/of/the/a/an/to/in/at/and/your/our/&; never on 1-2 word headings or
//                                          on html that holds markup; `phrase` overrides; the swoosh SVG is added only
//                                          when swoosh:true AND the accent ends the heading
//      kit.heading(html, {level=2, cls='h2', id?, accent=true, phrase?, swoosh=false, attrs?})
//                                          <hN class=cls> with kit.accent applied; level null -> <p class=cls>
//      kit.swoosh()                        the logo's lower-lid swoosh SVG (pathLength 1, draws on reveal)
//      kit.mark(html)                      a single <p> without inline markup: its final sentence wrapped in
//                                          <mark class="hl"> (needs >= 2 sentences, else unchanged)
//      kit.eyebrow(html, {tag='p', cls?})  <p class="eyebrow"> with the iris bullet (CSS); kicker html is unwrapped
//    actions (R-11)
//      kit.book, kit.call, kit.located     ctx link objects {label, href, newTab?}: "Book Appointment" (scheduler, new
//                                          tab), "Call: (732) 978-9306", "Located at Pine Beach"
//      kit.link(label)                     the ctx link (headerButtons, topbar, ctas) with that exact label, or null
//      kit.button(link, {variant?, size?, icon?, cls?, attrs?})
//                                          <a class="btn btn--{variant}">. link = a model button node or a ctx link
//                                          {label, href, newTab?, rel?, ariaLabel?}. variant: primary | glass | outline
//                                          | light | ghost-light (default: Book -> primary, tel: -> glass, else
//                                          outline). size: 'sm'. icon: 'arrow' | 'phone' | null (default: tel: ->
//                                          phone, else arrow). newTab -> target=_blank + rel noopener (node rel kept)
//      kit.buttonGroup(buttons, {surface='light'|'navy', size?, cls?})
//                                          <div class="actions">, R-11: Book first + primary (navy: light); Call glass
//                                          (navy: ghost-light); other buttons outline (navy: ghost-light), or primary
//                                          (navy: light) when alone in the group
//      kit.ctaPair({surface='light'|'navy', size?, cls?})   Book + Call from ctx, in R-11 order
//    glass, depth and motion
//      kit.glass(html, variant='', {tag='div', cls?, attrs?})
//                                          variant '' | strong | hero | tint | veil | navy | navy-soft (DESIGN-SPEC 5.2)
//      kit.reveal(kind='up')               ' data-reveal="kind"': up | left | right | fade | scale | mask (photo frames only)
//      kit.stagger()                       ' data-stagger' (on a list/grid: its children reveal 85 ms * index apart)
//      kit.depth(k, max)                   ' data-depth="k" data-depth-max="max"' (photo planes +0.04..+0.07 / 20-40,
//                                          foreground -0.12..-0.16 / 40-48; site.js applies `translate`)
//      kit.seam()                          the 8 px segmented seam band (aria-hidden): every model section-divider
//    images (always through ctx.img; a slot without a file renders nothing decorative, or the pipeline placeholder)
//      kit.picture(ref, {alt, sizes, widths, width, loading, fetchpriority, cls, imgCls, frame='plain', position,
//                        depth, depthMax, reveal, preload})
//                                          <div class="pic pic--{frame}" style="--pos:position"> [<div class="pic__in"
//                                          data-depth>] <img> </div>. frame: plain | fill (covers a positioned box) |
//                                          lens-edge | arch | lens | card | portrait. preload:true puts the image in a
//                                          <link rel=preload> (once per page: the LCP image)
//      kit.cutout(slot, {cls, width, depth=-0.14, depthMax=44, depthFrom, rotate=0, sizes, loading='lazy'})
//                                          <div class="cutout" aria-hidden> sized by the object's alpha box (the 2048
//                                          px canvases are untrimmed): the div IS the object box. width: any CSS length
//                                          (also settable in CSS via --cut-w). Position it with your own class.
//                                          Returns '' when the slot has no file. depthFrom (added 2026-10-09,
//                                          additive): a viewport width in px below which site.js applies no parallax
//                                          (data-depth-from); kit.titleBand's cut-out uses 1024.
//      kit.texture(slot, {cls, opacity, loading})   aria-hidden texture plane (cover); '' when the slot has no file
//      kit.loop(id, {cls, posterOnly, id})  decorative motion loop (DESIGN-SPEC 7.4): <video muted playsinline
//                                          preload="none" poster> with data-src sources, no autoplay/loop attributes;
//                                          site.js plays it when >= 30 % visible and pauses it after 5 s or out of view;
//                                          reduced motion and no-JS: the poster only. id: loop-lens-light | loop-navy-glass.
//                                          posterOnly: just the poster <img> (e.g. CTA bands on interior pages)
//      kit.postcard(ref, {alt, tilt=3, width=400, cls, sizes})   real-place print (10.21), widths [400, 800]
//    page furniture (styled by chrome.css)
//      kit.breadcrumbs(page?)              <nav class="crumbs" aria-label="Breadcrumb"><ol>, last item aria-current="page"
//      kit.titleBand(page, opts)           the band that holds the page's ONLY <h1>, plus the seam band under it (10.5):
//                                          variant 'full' | 'half' | 'postcard' | 'texture' (default: 'full' when
//                                          page.generated.hero has a file, else 'texture'); image {ref, alt?, position?}
//                                          = photo plane (full/half) or the print (postcard), default for full =
//                                          page.generated.hero; kicker html; h1 html (default esc(page.h1)); accent
//                                          (true); phrase (accent override); cta 'pair' (default) | false | [buttons];
//                                          cutout slot | null; aside html (right column: location card, portrait,
//                                          stars); after html (inside the panel after the CTA row); compact (legal,
//                                          sitemap, 404: shorter, no CTA); cls. Breadcrumbs are included; the band's
//                                          photo is eager + preloaded.
//      kit.ledeCard(html, {cls?})          .glass--strong lede card straddling the title-band seam (10.6)
//      kit.ctaStrip({cls?})                slim glass strip: Located at Pine Beach (pin link) + Book + Call (9.8)
//      kit.locationCard({cls?})            smoked-navy card: pin, "Located at Pine Beach", address » (new tab), phone
//      kit.hoursList(hours?)               <dl class="hours">, labels verbatim ("monday:"), capitalised by CSS
//      kit.mapFrame(title?)                keyless lazy map iframe in a glass frame
//      kit.stars(label, n=5)               SVG stars, role="img" aria-label=label
//      kit.section({cls, id, label, labelledby, container=true, tag='section', attrs}, html)
//                                          <section class="section cls"> [<div class="container">] html
//    shared cards (one look on home and interiors; styled by glass.css)
//      kit.card(item, {tag='li', level=3, sizes, reveal='up', cls})   10.17 glass card, photo popping above the top;
//                                          item {href, title | label, excerpt? (text), image? (ref | {file, alt}), alt?}
//      kit.cardGrid(items, {cls, level})   <ul class="card-grid" data-stagger> of kit.card
//      kit.docCard(item, {level})          10.13 doctor card from a team-list item (photo <= 150 CSS px, title, bio, cta)
//      kit.postCard(item, {image, alt, level=3, cls})   10.22 post card from an articles-list item
//      kit.chips(items, {cls})             10.18 logo chips from insurance/frames items {name, logo: {file, alt}}
//      kit.reviewCard(review, {featured, tag='figure', cls})  quote, stars (ratingLabel), cite, <time> (date formatted)
//    page state
//      kit.page, kit.ctx; kit.current(href) -> true when href is this page's path
//      kit.preloadImage(imgHtml)           register an <img> string from ctx.img for <link rel="preload"> in <head>
//
// C. CSS OWNERSHIP (src/styles, concatenated: tokens base glass depth motion chrome home | interior blocks forms special)
//    THEME-CORE styles every class the kit prints and: the DESIGN-SPEC §3 tokens (exact names), .container .section
//    .display .h2 .h2--xl .h3 .lead .designed, .glass*, .btn*, .actions, .eyebrow, .acc .swoosh .hl, .cutout*,
//    .seam-band, .ambient .pool, .pic*, .texture, .loop*, .band--seaglass .band--navy, .title-band*, .crumbs,
//    .lede-card, .cta-strip, .loc-card*, .postcard*, .stars, .card* .card-grid, .doc-card*, .post-card*, .chips .chip,
//    .review-card*, .hours, .map-frame, .stretched, .arrow, .sr-only, .img-slot, the header/menu/drawer/footer classes,
//    the home classes (.hm-*) and the motion states (.js .js-motion .rv .is-in .menu-open).
//    THEME-TEMPLATES owns every other block class (e.g. .split .feature .arch .lens-split .statement .reading .cta-band
//    .list-split .options .opt-card .symptom-list .faq .carousel .lightbox .form* .field* .legal .sitemap* .team-*) and
//    does not restyle the classes above except under its own parent selector.
//
// D. JS hooks (site.js, THEME-CORE): data-reveal data-stagger data-depth data-depth-max data-depth-from (2026-10-09,
//    additive: no parallax below that viewport width) data-loop data-loop-toggle data-header data-menu data-mnav.
//    features.js (THEME-TEMPLATES) is concatenated after site.js. Breakpoints are DESIGN-SPEC §4.2 (desktop nav >= 1240).
// =====================================================================================================================

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ------------------------------------------------------------------------------------------------ text helpers */
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function attrs(o) {
  if (!o) return '';
  return Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => (v === true ? ' ' + k : ' ' + k + '="' + esc(v) + '"')).join('');
}
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™', copy: '©', raquo: '»', laquo: '«' };
export const plain = (html) => String(html ?? '').replace(/<[^>]*>/g, ' ')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => (ENT[n.toLowerCase()] !== undefined ? ENT[n.toLowerCase()] : m))
  .replace(/\s+/g, ' ').trim();
export function unwrapP(html) {
  const s = String(html ?? '');
  const m = s.match(/^\s*<p>([\s\S]*?)<\/p>\s*$/);
  return m && !/<\/?p[\s>]/i.test(m[1]) ? m[1] : s;
}

/* ------------------------------------------------------------------------------------------------ icons */
const ICONS = {
  arrow: ['0 0 20 12', '<path d="M1 6h17M13 1l5 5-5 5"/>'],
  phone: ['0 0 24 24', '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/>'],
  pin: ['0 0 24 24', '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>'],
  chev: ['0 0 12 8', '<path d="M1 1.5 6 6.5 11 1.5"/>'],
  star: ['0 0 24 24', '<path d="M12 2.6l2.85 6.08 6.65.78-4.92 4.56 1.3 6.58L12 17.3l-5.88 3.3 1.3-6.58L2.5 9.46l6.65-.78z"/>'],
  clock: ['0 0 24 24', '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 10.3V6.5h-1.8v6.5l5 3 .9-1.5z"/>'],
  play: ['0 0 24 24', '<path d="M8 5.5v13l10.5-6.5z"/>'],
  pause: ['0 0 24 24', '<path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/>'],
};
export function icon(name, cls = '') {
  const d = ICONS[name];
  if (!d) throw new Error('parts.icon: unknown icon ' + name);
  return '<svg class="ico ico--' + name + (cls ? ' ' + cls : '') + '" viewBox="' + d[0] + '" aria-hidden="true" focusable="false">' + d[1] + '</svg>';
}

/* ------------------------------------------------------------------------------------------------ type */
export const SWOOSH = '<svg class="swoosh" viewBox="0 0 300 26" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 19C70 6 190 2 297 13" pathLength="1"/></svg>';
const STOP = new Set(['for', 'of', 'the', 'a', 'an', 'to', 'in', 'at', 'and', 'your', 'our', '&']);

/** DESIGN-SPEC 10.1 accent selection; deterministic. Returns the html unchanged when no accent applies. */
export function accent(html, { phrase = null, swoosh = false, none = false } = {}) {
  const src = String(html ?? '');
  if (none || !src.trim() || /<[a-zA-Z!/]/.test(src)) return src;
  const toks = [...src.matchAll(/\S+/g)].map((m) => ({ t: m[0], i: m.index }));
  const words = toks.filter((t) => /[\p{L}\p{N}]/u.test(plain(t.t)));
  let s = -1, e = -1;
  if (phrase) {
    const i = src.indexOf(phrase);
    if (i === -1) return src;
    s = i; e = i + phrase.length;
  } else {
    if (words.length <= 2) return src;
    const m = src.match(/Pine Beach(?:, (?:NJ|New Jersey))?/);
    if (m) { s = m.index; e = m.index + m[0].length; }
    else {
      const n = toks.length;
      let k = n - 2;
      if (STOP.has(plain(toks[k].t).toLowerCase()) && k - 1 >= 1) k -= 1;   // never swallow the whole heading
      /* never start the accent inside a kept phrase ("Schedule Your Dry <em>Eye Consultation</em>" split "Dry Eye",
         QA round 1 V3): take the phrase's first word in too */
      if (k - 1 >= 1 && KEEP.some(([re]) => { re.lastIndex = 0; return re.test(plain(toks[k - 1].t) + ' ' + plain(toks[k].t)); })) k -= 1;
      s = toks[k].i; e = toks[n - 1].i + toks[n - 1].t.length;
    }
  }
  const after = src.slice(e);
  return src.slice(0, s) + '<em class="acc">' + src.slice(s, e) + (swoosh && !after.trim() ? SWOOSH : '') + '</em>' + after;
}

/**
 * QA round 1 (V3, V11): line-break control for headings, applied to text only (never inside a tag); the words are
 * unchanged (U+00A0 instead of U+0020; build-verify and text-parity normalise both to a space).
 *  - "Pine Beach", "Dry Eye(s)" and "Eye Care" never split across lines (measured: "Pine | Beach" in 9 headings at
 *    1280x585, 8 at 1600x662 and 12 at 390x844, where the mid-heading accent also lost its swoosh look);
 *  - a heading of 4+ words never ends on one word: its last two words are joined when the joined run is at most 16
 *    characters (a longer run could overflow a phone panel, e.g. "Giallombardo, O.D." is left alone).
 */
const KEEP = [[/\bPine Beach\b/g, 'Pine&nbsp;Beach'], [/\bDry (Eyes?)\b/g, 'Dry&nbsp;$1'], [/\bEye Care\b/g, 'Eye&nbsp;Care']];
export function keepLines(html) {
  const parts = String(html ?? '').split(/(<[^>]*>)/);   // even indexes: text; odd: tags (never touched)
  for (let i = 0; i < parts.length; i += 2) for (const [re, to] of KEEP) parts[i] = parts[i].replace(re, to);
  const text = parts.filter((_, i) => i % 2 === 0).join('').replace(/&nbsp;/g, ' ');
  const words = text.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (words.length < 4) return parts.join('');
  for (let i = parts.length - 1; i >= 0; i -= 2) {      /* the last plain space of the heading's text */
    const seg = parts[i];
    const k = seg.lastIndexOf(' ');
    if (k === -1) continue;
    const after = (seg.slice(k + 1) + parts.slice(i + 1).filter((_, j) => j % 2 === 1).join('')).replace(/&nbsp;/g, ' ').trim();
    const before = seg.slice(0, k).replace(/&nbsp;/g, ' ').split(' ').pop();
    if (before && after && (before + ' ' + after).length <= 16) parts[i] = seg.slice(0, k) + '&nbsp;' + seg.slice(k + 1);
    break;
  }
  return parts.join('');
}

/** A single <p> with no inline markup: wrap its final sentence in <mark class="hl"> (designed type, 10.9). */
export function mark(html) {
  const s = String(html ?? '');
  const m = s.match(/^(\s*<p>)([^<]*)(<\/p>\s*)$/);
  if (!m) return s;
  const text = m[2];
  let cut = -1;
  for (const b of text.matchAll(/[.!?][’”"')]*\s+(?=\S)/g)) cut = b.index + b[0].length;
  if (cut <= 0) return s;
  return m[1] + text.slice(0, cut) + '<mark class="hl">' + text.slice(cut) + '</mark>' + m[3];
}

/* ------------------------------------------------------------------------------------------------ cut-out object boxes */
/* Alpha bounding boxes (alpha >= 8) of the untrimmed 2048 px cut-out canvases, measured 2026-10-08 with
   tmp/theme-core/png-alpha-box.mjs, keyed by the file's sha256 prefix. A replaced file (another sha) is measured at
   build time with the decoder below, so a new cut-out from IMAGERY never mis-sizes or breaks the build. */
const BOXES = {
  'cut-contact-lens': { sha: 'b3831938855e9b76', cw: 2048, ch: 2048, x: 633, y: 616, w: 796, h: 821 },
  'cut-eyeglasses-navy': { sha: '80968d99632cb954', cw: 2048, ch: 2048, x: 291, y: 692, w: 1529, h: 526 },
  'cut-eyeglasses-tortoise': { sha: '595c5416420f7d9f', cw: 2048, ch: 2048, x: 269, y: 731, w: 1555, h: 584 },
  'cut-lens-blank': { sha: '2f166906f5ae2a3c', cw: 2048, ch: 2048, x: 504, y: 469, w: 1071, h: 1188 },
  'cut-reading-glasses': { sha: '248805c7697332da', cw: 2048, ch: 2048, x: 340, y: 860, w: 1407, h: 494 },
  'cut-sunglasses-aviator': { sha: 'de63e8c0f5fd569c', cw: 2048, ch: 2048, x: 246, y: 725, w: 1592, h: 655 },
  'cut-sunglasses-navy': { sha: 'b7f4cfdb895e9aff', cw: 2048, ch: 2048, x: 368, y: 765, w: 1370, h: 568 },
  'cut-trial-lens': { sha: '1536feb57f1b4b5f', cw: 2048, ch: 2048, x: 601, y: 483, w: 854, h: 985 },
};
const boxCache = new Map();
function pngAlphaBox(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  let o = 8, w = 0, h = 0, depthBits = 0, ctype = 0, inter = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('latin1', o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depthBits = data[8]; ctype = data[9]; inter = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (depthBits !== 8 || inter !== 0 || (ctype !== 6 && ctype !== 4)) return null;
  const bpp = ctype === 6 ? 4 : 2;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = y > 0 ? prev[x] : 0, c = x >= bpp && y > 0 ? prev[x - bpp] : 0;
      let v = raw[src + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[x] = v & 255;
    }
    for (let x = 0; x < w; x++) if (cur[x * bpp + bpp - 1] >= 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    cur.copy(prev);
  }
  return x1 < 0 ? null : { cw: w, ch: h, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
function objectBox(ctx, slot) {
  const g = ctx.generatedSlots && ctx.generatedSlots[slot];
  if (!g || !g.exists || !g.file) return null;
  if (boxCache.has(g.file)) return boxCache.get(g.file);
  let box = null;
  try {
    const buf = fs.readFileSync(path.join(ROOT, g.file));
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    const known = BOXES[slot];
    if (known && sha.startsWith(known.sha)) box = known;
    else if (/\.png$/i.test(g.file)) box = pngAlphaBox(buf);
    if (!box) { const sz = ctx.imgSize(slot); if (sz) box = { cw: sz.w, ch: sz.h, x: 0, y: 0, w: sz.w, h: sz.h }; }
  } catch { box = null; }
  boxCache.set(g.file, box);
  return box;
}

/* ------------------------------------------------------------------------------------------------ logo content boxes */
/* The insurance and frames logos are padded canvases (800 px wide, the mark often in the middle 20-60 % of the height).
   Content box per file (alpha > 40 and not near-white, + 3 % margin), measured 2026-10-08 with
   tmp/theme-core/logo-boxes.mjs (dwebp -pam): [sha256 prefix, inset top, right, bottom, left in %]. Used as
   object-view-box (progressive: browsers without it show the whole canvas). A changed file (other sha) gets no crop. */
const LOGO_BOXES = {
  "assets/source/059b2313-mutual-of-omaha.png-w_800.webp": ["9da5748c1a2cea64", 7.4, 20.9, 4.3, 21],
  "assets/source/0fc91a6c-cigna.png-w_800.webp": ["12da835422027f45", 32, 4.1, 7, 8],
  "assets/source/174f677a-tommyhilfiger.png-w_800.webp": ["46216289fd718612", 41.6, 5.8, 40.2, 6.3],
  "assets/source/2e6049a1-united-healthcare.png-w_800.webp": ["5084ceae3ae88ad8", 31.4, 5, 6.8, 2.5],
  "assets/source/3c382cbc-wA90iZInwW8dCEqF.png-w_800.webp": ["2da59e03abd07658", 36.7, 11, 36.6, 11],
  "assets/source/407fb90a-nike.png-w_800.webp": ["c8f023316e45d3bc", 28.1, 6.8, 28, 6.8],
  "assets/source/4a0cffba-H3s9JsQElepGYNXh.png-w_800.webp": ["d933971a663fd72a", 36.9, 4.1, 37.2, 4],
  "assets/source/525a4282-calvin-klein.png-w_800.webp": ["b61e14835c0958e1", 12.3, 20.3, 12.3, 20.3],
  "assets/source/613219a1-joan-collins.png-w_800.webp": ["7ab570d1af65873a", 18.9, 5, 18.9, 5.3],
  "assets/source/6434e116-LTHqXk5VpQJ9e7qx.png-w_800.webp": ["cebe4fe4a6912323", 40.7, 5.9, 40.5, 5.9],
  "assets/source/6913a97e-8pBEViY4gvyX8cBO.png-w_800.webp": ["feca0aadb18aad5b", 18.3, 6.4, 7, 5.3],
  "assets/source/6a301292-dragon.png-w_800.webp": ["00e07997d49f5256", 13.6, 7.9, 38.1, 7.4],
  "assets/source/6ca7da3a-meritain-health.png-w_800.webp": ["f5e75f0f9e28c06a", 10.4, 4.5, 20.4, 3.3],
  "assets/source/6cf327e1-aarp.png-w_800.webp": ["d16d264a0f713968", 37.8, 5.5, 17.4, 4.4],
  "assets/source/796d8418-costa.png-w_800.webp": ["2626dc2e8d2f3534", 37.6, 3.5, 17.5, 3],
  "assets/source/839e69b3-guess.png-w_800.webp": ["00781348cd4d79cb", 5.6, 1, 5.5, 1],
  "assets/source/87824d28-anne-klein.png-w_800.webp": ["8b62104437fb3023", 42.2, 2.4, 42.2, 2.3],
  "assets/source/8aa15eba-charmant.png-w_800.webp": ["85ae88e204667dfb", 29.9, 2.4, 20.3, 3.4],
  "assets/source/99b4ac1c-timberland.png-w_800.webp": ["85aa13c5b0400a6f", 37, 1.7, 19.1, 1.4],
  "assets/source/aeed05e3-medicare.png-w_800.webp": ["6c07e887e6f58085", 30.2, 3, 30.2, 3],
  "assets/source/afc84153-19pbh9sUgkYJPF6i.png-w_800.webp": ["f69a7f5be1cd1eb3", 41.4, 5.1, 41.4, 5.1],
  "assets/source/b22dacf0-ri36Gxmg37zLoPts.png-w_800.webp": ["3f88b2c301ddaccb", 35.2, 5.5, 12, 5.5],
  "assets/source/b86c99d3-adidas.png-w_800.webp": ["89af940493e40239", 7.9, 2.1, 12.9, 1.1],
  "assets/source/c96150ae-wSrVTHXua1YrjT37.png-w_800.webp": ["9df58dea531d840f", 35.5, 8.6, 34, 9],
  "assets/source/c9cb6d21-rayban-color.png-w_800.webp": ["017fb95ac85b1a56", 9.5, 1, 9.4, 1],
  "assets/source/d1d4b06c-liz-claiborne.png-w_800.webp": ["027492bdd398f957", 41, 3.6, 40.8, 4.5],
  "assets/source/d3e1fea3-emilio-pucci.png-w_800.webp": ["a78999fcfc7978c8", 26.9, 6.9, 19.2, 8.9],
  "assets/source/d72ed0f2-coGQrXrDqsfGCkVh.png-w_800.webp": ["6a2215bd239c9cda", 41.3, 3.4, 41.3, 3.8],
  "assets/source/d74f9aa8-marc-jacobs.png-w_800.webp": ["c79416b0439b0400", 42.2, 4.1, 42.3, 4.3],
  "assets/source/d98d697b-elle.png-w_800.webp": ["646072c6b3b00d89", 8.2, 1, 8.2, 1],
  "assets/source/db221fa6-Tejlyu4sqC8pURTO.png-w_800.webp": ["cb557944ae3e4101", 41.1, 3.3, 41.1, 2],
  "assets/source/dfd738c0-bebe.png-w_800.webp": ["78befb73b50d60df", 36.7, 5.9, 39.6, 5.6],
  "assets/source/e8cfa17c-umr.png-w_800.webp": ["ac203da2b8f3bf79", 29, 10.4, 19.1, 11.8],
  "assets/source/ebd492c6-4ON2tzqw5GNU7H4U.png-w_800.webp": ["f4bbdc58681cc1d0", 37.9, 9, 37.9, 9.5],
  "assets/source/fa4e81e1-joseph-abboud.png-w_800.webp": ["4ef8d11d05d0332d", 16.9, 4.4, 7.6, 4.4],
  "assets/source/fbb64e46-valerie-spencer.png-w_800.webp": ["06ebacc6f5c51779", 41.6, 3.6, 32.6, 3.3],
  "assets/source/fbbf0c5c-ijrBsBU0g1oPXU1R.png-w_800.webp": ["ef96388a5dc3bed5", 39.9, 8.5, 36.9, 8.4],
  "assets/source/fc4bc443-JIIKTYAC1TcGHhyE.png-w_800.webp": ["f4d1ee2027fd89be", 21.2, 5.1, 23.6, 5.3],
};
const logoCache = new Map();
function logoViewBox(file) {
  if (logoCache.has(file)) return logoCache.get(file);
  const box = LOGO_BOXES[file];
  let v = null;
  if (box) {
    try { if (crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex').startsWith(box[0])) v = 'inset(' + box.slice(1).map((x) => x + '%').join(' ') + ')'; } catch { v = null; }
  }
  logoCache.set(file, v);
  return v;
}

/* ------------------------------------------------------------------------------------------------ dates */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** '2026-10-01' -> 'October 1, 2026' (presentation of a non-text field, DESIGN-SPEC 2.4) */
export function formatDate(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? MONTHS[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1] : String(iso || '');
}

/* ------------------------------------------------------------------------------------------------ image size hints */
/** scale every length of a sizes hint: the conditioned entries by fCond, the final (unconditioned) one by fBase
    (factors below 1 leave the value as it is) */
export function scaleSizes(sizes, fCond, fBase = fCond) {
  return String(sizes || '').split(',').map((part) => {
    const p = part.trim();
    const f = Math.max(1, p.startsWith('(') ? fCond : fBase);
    return p.replace(/([0-9.]+)(vw|px)$/, (_, n, u) => String(Math.round(Number(n) * f)) + u);
  }).join(', ');
}
/** frame aspect ratios (width / height) of cover-cropped frames: [from the conditioned breakpoint, below it]. The
    lens-edge Split measured 824x700 to 824x995 at 1280-1600 (0.83-1.18; 0.85 covers the tall ones) and is 100% x 78vw
    below 900 px */
const FRAME_AR = { lens: [1, 1], arch: [0.8, 0.8], 'lens-edge': [0.85, 1 / 0.78] };
/** the title-band cut-out's object width (chrome.css + interior.css .tpl-cut rules): desktop max(clamp(150px, 16vw,
    250px), 72px x ar), 768-1023 max(17vw, 70px x ar), phones max(26vw, 40px x ar); each vw taken at its range's
    smallest width so the floor is covered */
const TB_CUT_SIZES = (ar) => '(min-width: 1563px) ' + Math.round(Math.max(250, 72 * ar)) + 'px, (min-width: 1024px) ' + +Math.max(16, 72 * ar / 10.24).toFixed(1)
  + 'vw, (min-width: 768px) ' + +Math.max(17, 70 * ar / 7.68).toFixed(1) + 'vw, ' + +Math.max(26, 40 * ar / 3.6).toFixed(1) + 'vw';

/* ------------------------------------------------------------------------------------------------ the kit */
export function createKit(ctx, page = null) {
  const preloads = [];
  const site = ctx.site;
  const bookHref = site.booking.href;
  const isBook = (l) => !!l && l.href === bookHref;
  const isTel = (l) => !!l && /^tel:/i.test(String(l.href));
  const allLinks = [...(ctx.headerButtons || []), ctx.topbar, ...(ctx.ctas || [])].filter(Boolean);
  const link = (label) => allLinks.find((l) => l.label === label && l.href) || null;
  const book = (ctx.headerButtons || []).find(isBook) || { label: site.booking.label, href: bookHref, newTab: true };
  const call = (ctx.headerButtons || []).find(isTel) || link('Call: (732) 978-9306');
  const located = ctx.topbar;
  const contactCol = (ctx.footer || []).find((c) => c.title === (ctx.chrome.footerHeadings || {}).contact) || { links: [] };
  const mapsLink = contactCol.links.find((l) => l.href === site.mapsUrl) || { label: site.address.text, href: site.mapsUrl };

  const reveal = (kind = 'up') => ' data-reveal="' + esc(kind) + '"';
  const stagger = () => ' data-stagger';
  const depth = (k, max) => ' data-depth="' + esc(k) + '" data-depth-max="' + esc(max) + '"';
  const seam = () => '<div class="seam-band" aria-hidden="true"></div>';

  function newTabOf(l) { return !!(l.newTab || (l.href === site.mapsUrl && site.mapsNewTab)); }
  function relOf(l) {
    const set = new Set(String(l.rel || '').split(/\s+/).filter(Boolean));
    if (newTabOf(l)) set.add('noopener');
    return [...set].join(' ');
  }
  function button(l, o = {}) {
    if (!l || !l.href) return '';
    const variant = o.variant || (isBook(l) ? 'primary' : isTel(l) ? 'glass' : 'outline');
    const ic = o.icon !== undefined ? o.icon : isTel(l) ? 'phone' : 'arrow';
    const rel = relOf(l);
    return '<a' + attrs({ class: 'btn btn--' + variant + (o.size ? ' btn--' + o.size : '') + (o.cls ? ' ' + o.cls : ''), href: l.href, target: newTabOf(l) ? '_blank' : null, rel: rel || null, 'aria-label': l.ariaLabel || null }) + attrs(o.attrs)
      + '>' + (ic === 'phone' ? icon('phone', 'btn__icon') : '') + esc(l.label) + (ic === 'arrow' ? icon('arrow', 'btn__arrow') : '') + '</a>';
  }
  function buttonGroup(buttons, o = {}) {
    const list = (buttons || []).filter((b) => b && b.href);
    if (!list.length) return '';
    const navy = o.surface === 'navy';
    const alone = list.length === 1;
    const ordered = [...list.filter(isBook), ...list.filter((b) => !isBook(b))];
    const v = (b) => (isBook(b) ? (navy ? 'light' : 'primary') : isTel(b) ? (navy ? 'ghost-light' : 'glass') : alone ? (navy ? 'light' : 'primary') : (navy ? 'ghost-light' : 'outline'));
    return '<div class="actions' + (o.cls ? ' ' + o.cls : '') + '">' + ordered.map((b) => button(b, { variant: v(b), size: o.size })).join('') + '</div>';
  }
  const ctaPair = (o = {}) => buttonGroup([book, call], o);

  function eyebrow(html, o = {}) {
    const inner = unwrapP(html);
    const tag = /<(p|div|ul|ol|h\d)[\s>]/i.test(inner) ? 'div' : o.tag || 'p';
    return '<' + tag + ' class="eyebrow' + (o.cls ? ' ' + o.cls : '') + '">' + inner + '</' + tag + '>';
  }
  function heading(html, o = {}) {
    const level = o.level === undefined ? 2 : o.level;
    const inner = keepLines(o.accent === false ? String(html ?? '') : accent(html, { phrase: o.phrase, swoosh: !!o.swoosh }));
    const tag = level ? 'h' + level : 'p';
    return '<' + tag + attrs({ class: o.cls === undefined ? 'h2' : o.cls || null, id: o.id }) + attrs(o.attrs) + '>' + inner + '</' + tag + '>';
  }
  function glass(html, variant = '', o = {}) {
    const tag = o.tag || 'div';
    return '<' + tag + attrs({ class: 'glass' + (variant ? ' glass--' + variant : '') + (o.cls ? ' ' + o.cls : '') }) + attrs(o.attrs) + '>' + html + '</' + tag + '>';
  }

  function preloadImage(imgHtml) {
    const s = String(imgHtml || '');
    if (!/^<img\b/.test(s)) return;
    const get = (a) => { const m = s.match(new RegExp('\\s' + a + '="([^"]*)"')); return m ? m[1] : null; };
    const href = get('src');
    if (!href || preloads.some((p) => p.href === href)) return;
    preloads.push({ href, imagesrcset: get('srcset'), imagesizes: get('sizes') });
  }
  function picture(ref, o = {}) {
    /* cover-cropped frames show the image wider than the frame when the frame is relatively taller than the photo
       (a 16:9 photo in a 4:5 arch is drawn at 2.2x the arch width); the sizes hint is scaled by that factor so the
       browser picks a file that covers the drawn width (QA round 1, V4: 1.4-1.9x upscales with 2000 px files unused) */
    let sizes = o.sizes;
    const fa = FRAME_AR[o.frame];
    if (sizes && fa) { const sz = ctx.imgSize(ref); if (sz && sz.w && sz.h) sizes = scaleSizes(sizes, (sz.w / sz.h) / fa[0], (sz.w / sz.h) / fa[1]); }
    const img = ctx.img(ref, { alt: o.alt, sizes, widths: o.widths, width: o.width, loading: o.loading, fetchpriority: o.fetchpriority, cls: o.imgCls });
    if (o.preload) preloadImage(img);
    let inner = o.depth ? '<div class="pic__in"' + depth(o.depth, o.depthMax || 28) + '>' + img + '</div>' : img;
    if (o.frame === 'lens') inner = '<div class="pic__circle">' + inner + '</div>';
    return '<div' + attrs({ class: 'pic pic--' + (o.frame || 'plain') + (o.cls ? ' ' + o.cls : ''), style: o.position ? '--pos:' + o.position : null }) + (o.reveal ? reveal(o.reveal) : '') + attrs(o.attrs) + '>' + inner + '</div>';
  }
  function cutout(slot, o = {}) {
    const box = objectBox(ctx, slot);
    if (!box) return '';
    const pct = (v) => +(v * 100).toFixed(3) + '%';
    const style = [
      '--cut-ar:' + +(box.w / box.h).toFixed(4),
      '--cut-l:' + pct(-box.x / box.w), '--cut-t:' + pct(-box.y / box.h), '--cut-iw:' + pct(box.cw / box.w),
      o.width ? '--cut-w:' + o.width : null,
      o.rotate ? '--rot:' + o.rotate + 'deg' : null,
    ].filter(Boolean).join(';');
    /* objSizes(ar): the OBJECT box width per breakpoint; the <img> is wider than the object box by box.cw / box.w (the
       transparent margin around the object), so the hint is scaled by that (QA round 1, V4: the title-band trial lens
       drew its 480 w file at 569 CSS px, 1.78x at 1280x585@1.5) */
    const hint = o.objSizes ? scaleSizes(o.objSizes(box.w / box.h), box.cw / box.w) : o.sizes || '(min-width: 1024px) 34vw, 60vw';
    const img = ctx.img(slot, { alt: '', sizes: hint, loading: o.loading || 'lazy', fetchpriority: o.fetchpriority });
    const d = o.depth === null ? '' : depth(o.depth === undefined ? -0.14 : o.depth, o.depthMax || 44) + (o.depthFrom ? ' data-depth-from="' + esc(o.depthFrom) + '"' : '');
    return '<div' + attrs({ class: 'cutout' + (o.cls ? ' ' + o.cls : ''), 'aria-hidden': 'true', style }) + d + '><div class="cutout__obj">' + img + '</div></div>';
  }
  function texture(slot, o = {}) {
    const g = ctx.generatedSlots && ctx.generatedSlots[slot];
    if (!g || !g.exists) return '';
    const img = ctx.img(slot, { alt: '', sizes: o.sizes || '100vw', loading: o.loading || 'lazy' });
    return '<div' + attrs({ class: 'texture' + (o.cls ? ' ' + o.cls : ''), 'aria-hidden': 'true', style: o.opacity !== undefined ? '--tex-o:' + o.opacity : null }) + '>' + img + '</div>';
  }
  function loop(id, o = {}) {
    const base = 'assets/generated/' + id;
    const has = (sfx) => ctx.hasAsset(base + sfx);
    const poster = has('-poster.webp') ? ctx.asset(base + '-poster.webp') : null;
    const sources = [];
    if (has('-phone.mp4')) sources.push(['-phone.mp4', 'video/mp4', '(max-width: 767px) and (orientation: portrait)']);
    if (has('-960.mp4')) sources.push(['-960.mp4', 'video/mp4', '(max-width: 1023px)']);
    if (has('.webm')) sources.push(['.webm', 'video/webm', null]);
    if (has('.mp4')) sources.push(['.mp4', 'video/mp4', null]);
    /* the poster is always an <img>; the <video> is displayed only under .js-motion (depth.css), i.e. when site.js can
       play it: with scripting disabled Chrome exposes native controls on any <video> (seen 2026-10-09 as a dead
       "0:00" bar across the hero), and under reduced motion it never plays */
    /* o.lcp: the home hero's poster is the largest element of the first screen at 1280x585 (QA round 1, CSP-2: it was
       loading="lazy" while the preload went to another image); it loads eagerly at high priority and is preloaded */
    const posterImg = poster ? '<img class="loop__poster" src="' + esc(poster) + '" alt=""' + (o.lcp ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' : '';
    if (poster && o.lcp && !preloads.some((p) => p.href === poster)) preloads.push({ href: poster, imagesrcset: null, imagesizes: null });
    if (o.posterOnly || !sources.length) return poster ? '<div class="loop' + (o.cls ? ' ' + o.cls : '') + '" aria-hidden="true">' + posterImg + '</div>' : '';
    return '<div class="loop' + (o.cls ? ' ' + o.cls : '') + '" aria-hidden="true">' + posterImg + '<video' + attrs({ class: 'loop__video', id: o.id || null, muted: true, playsinline: true, preload: 'none', poster, 'data-loop': id, width: 1920, height: 1068, disablepictureinpicture: true, disableremoteplayback: true, tabindex: '-1' }) + '>'
      + sources.map(([sfx, type, media]) => '<source' + attrs({ 'data-src': ctx.asset(base + sfx), type, 'data-media': media }) + '>').join('') + '</video></div>';
  }
  function postcard(ref, o = {}) {
    const img = ctx.img(ref, { alt: o.alt, widths: [400, 800], sizes: o.sizes || '(min-width: 1024px) ' + (o.width || 400) + 'px, 70vw', loading: o.loading || 'lazy' });
    return '<figure' + attrs({ class: 'postcard' + (o.cls ? ' ' + o.cls : ''), style: '--tilt:' + (o.tilt === undefined ? 3 : o.tilt) + 'deg;--pc-w:' + (o.width || 400) + 'px' }) + (o.depth ? depth(o.depth, o.depthMax || 24) : '') + '><div class="postcard__print">' + img + '</div></figure>';
  }

  function breadcrumbs(pg = page) {
    const c = pg && pg.breadcrumbs;
    if (!c || c.length < 2) return '';
    const n = c.length;
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + c.map((x, i) => '<li>' + (i === n - 1 ? '<span aria-current="page">' + esc(x.label) + '</span>' : '<a class="crumbs__link" href="' + esc(x.href) + '">' + esc(x.label) + '</a>') + '</li>').join('') + '</ol></nav>';
  }
  function titleBand(pg = page, o = {}) {
    const heroSlot = pg && pg.generated && pg.generated.hero;
    const heroOk = !!(heroSlot && ctx.generatedSlots[heroSlot] && ctx.generatedSlots[heroSlot].exists);
    const variant = o.variant || (heroOk ? 'full' : 'texture');
    const image = o.image || (variant === 'full' && heroOk ? { ref: heroSlot, position: '70% 45%' } : null);
    const id = o.id || 'page-title';
    const h1Html = o.h1 != null ? o.h1 : esc(pg ? pg.h1 : '');
    const long = plain(h1Html).length > 40;
    const h1 = '<h1 class="display title-band__h1' + (long ? ' title-band__h1--long' : '') + '" id="' + esc(id) + '">' + keepLines(o.accent === false ? h1Html : accent(h1Html, { phrase: o.phrase, swoosh: true })) + '</h1>';
    /* a compact band has no CTA row unless the caller asks for one (QA round 1: the 404 keeps Book + Call) */
    const cta = o.cta === false || (o.compact && o.cta === undefined) ? '' : Array.isArray(o.cta) ? buttonGroup(o.cta, {}) : ctaPair();
    let plane = '', aside = o.aside || '', bandStyle = null;
    if ((variant === 'full' || variant === 'half') && image) {
      const half = variant === 'half';
      const img = ctx.img(image.ref, { alt: image.alt, sizes: half ? '(min-width: 768px) 60vw, 100vw' : '100vw', loading: 'eager', fetchpriority: 'high' });
      preloadImage(img);
      if (half) {
        const sz = ctx.imgSize(image.ref);
        const ar = sz ? Math.min(16 / 9, Math.max(4 / 3, sz.w / sz.h)) : 1.5;
        bandStyle = '--ar:' + ar.toFixed(4);
        plane = '<div class="title-band__photo" style="--pos:' + esc(image.position || '50% 40%') + '"><div class="title-band__photo-in"' + depth(0.05, 28) + '>' + img + '</div></div>';
      } else {
        plane = '<div class="title-band__media" style="--pos:' + esc(image.position || '70% 45%') + '"><div class="title-band__media-in"' + depth(0.06, 36) + '>' + img + '</div></div><div class="title-band__wash" aria-hidden="true"></div>';
      }
    } else {
      plane = texture('tex-cream-light', { cls: 'title-band__texture', loading: 'eager', opacity: 0.7 });
      if (variant === 'postcard' && image) aside = postcard(image.ref, { alt: image.alt, tilt: 3, width: image.width || 400, cls: 'title-band__postcard', loading: 'eager', sizes: '(min-width: 1024px) ' + (image.width || 400) + 'px, 70vw' }) + aside;
    }
    /* depthFrom 1024: below 1024 px the lede card spans the container and THEME-TEMPLATES' notch reserves the cut-out's
       REST footprint, so the cut-out holds still there (R-18 rule 3 counts the full parallax range) */
    const cut = o.cutout ? cutout(o.cutout, { cls: 'title-band__cutout', depth: -0.14, depthMax: 40, depthFrom: 1024, rotate: -10, objSizes: TB_CUT_SIZES, loading: 'eager' }) : '';
    const panel = '<div class="title-band__panel glass glass--hero">' + breadcrumbs(pg) + (o.kicker ? eyebrow(o.kicker) : '') + h1 + cta + (o.after || '') + '</div>';
    return '<section' + attrs({ class: 'title-band title-band--' + variant + (o.compact ? ' title-band--compact' : '') + (aside ? ' title-band--aside' : '') + (cut ? ' title-band--cut' : '') + (o.cls ? ' ' + o.cls : ''), 'aria-labelledby': id, style: bandStyle }) + '>'
      + plane + '<div class="container title-band__inner">' + panel + (aside ? '<div class="title-band__aside">' + aside + '</div>' : '') + '</div>' + cut + '</section>' + seam();
  }
  const ledeCard = (html, o = {}) => '<div class="container lede-wrap' + (o.cls ? ' ' + o.cls : '') + '"><div class="lede-card glass glass--strong">' + html + '</div></div>';
  function ctaStrip(o = {}) {
    return '<div class="container cta-strip-wrap' + (o.cls ? ' ' + o.cls : '') + '"><div class="cta-strip glass">'
      + '<a class="cta-strip__loc" href="' + esc(located.href) + '">' + icon('pin') + esc(located.label) + '</a>'
      + ctaPair({ size: 'sm', cls: 'cta-strip__actions' }) + '</div></div>';
  }
  function locationCard(o = {}) {
    return '<div class="loc-card glass glass--navy' + (o.cls ? ' ' + o.cls : '') + '"' + attrs(o.attrs) + '>'
      + '<p class="loc-card__head"><span class="loc-card__pin">' + icon('pin') + '</span><a class="loc-card__title" href="' + esc(located.href) + '">' + esc(located.label) + '</a></p>'
      + '<ul class="loc-card__rows">'
      + '<li><a' + attrs({ class: 'loc-card__link', href: mapsLink.href, target: newTabOf(mapsLink) ? '_blank' : null, rel: relOf(mapsLink) || null }) + '>' + icon('pin') + '<span>' + esc(mapsLink.label) + '</span></a></li>'
      + '<li><a class="loc-card__link" href="' + esc(site.phone.href) + '">' + icon('phone') + '<span>' + esc(site.phone.display) + '</span></a></li>'
      + '</ul></div>';
  }
  const hoursList = (hours = site.hours) => '<dl class="hours">' + hours.map((h) => '<div class="hours__row"><dt>' + esc(h.label) + '</dt><dd>' + esc(h.text) + '</dd></div>').join('') + '</dl>';
  const mapFrame = (title) => '<div class="map-frame"><iframe' + attrs({ src: site.mapEmbedSrc, title: title || site.mapTitle, loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', allowfullscreen: true }) + '></iframe></div>';
  const stars = (label, n = 5) => '<span class="stars" role="img" aria-label="' + esc(label) + '">' + Array.from({ length: Math.max(1, Math.min(5, Number(n) || 5)) }, () => icon('star')).join('') + '</span>';
  function section(o = {}, html = '') {
    const tag = o.tag || 'section';
    const inner = o.container === false ? html : '<div class="container' + (o.wide ? ' container--wide' : '') + '">' + html + '</div>';
    return '<' + tag + attrs({ class: 'section' + (o.cls ? ' ' + o.cls : ''), id: o.id, 'aria-labelledby': o.labelledby, 'aria-label': o.label }) + attrs(o.attrs) + '>' + inner + '</' + tag + '>';
  }

  function imageOf(item) {
    const im = item.image;
    if (!im) return null;
    if (typeof im === 'string') return { ref: im, alt: item.alt !== undefined ? item.alt : '' };
    return { ref: im.file, alt: im.alt !== undefined ? im.alt : '' };
  }
  function card(item, o = {}) {
    const tag = o.tag || 'li';
    const title = item.title !== undefined ? item.title : item.label;
    const im = imageOf(item);
    const media = im ? '<div class="card__media">' + ctx.img(im.ref, { alt: im.alt, sizes: o.sizes || '(min-width: 1024px) 380px, (min-width: 768px) 46vw, 96px', loading: 'lazy' }) + '</div>'
      : '<div class="card__media card__media--tile" aria-hidden="true"><span class="card__iris"></span></div>';
    const lvl = o.level || 3;
    return '<' + tag + ' class="card glass glass--strong' + (o.cls ? ' ' + o.cls : '') + '"' + (o.reveal === false ? '' : reveal(o.reveal || 'up')) + '>' + media
      + '<div class="card__body"><h' + lvl + ' class="card__title"><a class="stretched" href="' + esc(item.href) + '"' + (item.ariaLabel ? ' aria-label="' + esc(item.ariaLabel) + '"' : '') + '>' + esc(title) + '&nbsp;<span class="arrow" aria-hidden="true">»</span></a></h' + lvl + '>'
      + (item.excerpt ? '<p class="card__text">' + esc(item.excerpt) + '</p>' : '') + '</div></' + tag + '>';
  }
  const cardGrid = (items, o = {}) => '<ul class="card-grid' + (o.cls ? ' ' + o.cls : '') + '"' + stagger() + '>' + (items || []).map((it) => card(it, { level: o.level, sizes: o.sizes })).join('') + '</ul>';
  function docCard(it, o = {}) {
    const lvl = o.level || (it.title && it.title.level) || 3;
    const photo = it.photo ? '<div class="doc-card__photo">' + ctx.img(it.photo.file, { alt: it.photo.alt, widths: [150, 300], sizes: '150px', width: 150, loading: 'lazy' }) + '</div>' : '';
    const name = it.title ? it.title.html : esc(it.name);
    return '<li class="doc-card glass glass--strong"' + reveal('up') + '>' + photo
      + '<h' + lvl + ' class="doc-card__name"><a href="' + esc(it.href) + '">' + name + (it.title && it.title.chevron ? '&nbsp;<span class="arrow" aria-hidden="true">»</span>' : '') + '</a></h' + lvl + '>'
      + (it.bio ? '<div class="doc-card__text">' + it.bio + '</div>' : '')
      + (it.cta ? '<a' + attrs({ class: 'link-more', href: it.cta.href, 'aria-label': it.cta.ariaLabel || null }) + '>' + esc(it.cta.label) + '</a>' : '')
      + '</li>';
  }
  function postCard(it, o = {}) {
    const lvl = o.level || 3;
    const photo = o.image ? '<div class="post-card__photo"' + depth(0.04, 20) + '>' + ctx.img(o.image, { alt: o.alt, sizes: '(min-width: 768px) 360px, 80vw', loading: 'lazy' }) + '</div>' : '';
    return '<article class="post-card glass' + (o.cls ? ' ' + o.cls : '') + '"' + reveal('up') + '>' + photo + '<div class="post-card__body">'
      + '<h' + lvl + ' class="h3 post-card__title"><a href="' + esc(it.href) + '"' + (it.ariaLabel ? ' aria-label="' + esc(it.ariaLabel) + '"' : '') + '>' + esc(it.title) + (it.chevron ? '&nbsp;<span class="arrow" aria-hidden="true">»</span>' : '') + '</a></h' + lvl + '>'
      + (it.excerpt ? '<div class="post-card__text">' + it.excerpt + '</div>' : '')
      + (it.cta ? '<div class="actions">' + button({ label: it.cta.label, href: it.cta.href, ariaLabel: it.cta.ariaLabel }, { variant: 'outline' }) + '</div>' : '')
      + '</div></article>';
  }
  const chips = (items, o = {}) => '<ul class="chips' + (o.cls ? ' ' + o.cls : '') + '"' + stagger() + '>' + (items || []).map((it) => {
    const vb = it.logo ? logoViewBox(it.logo.file) : null;
    return '<li class="chip"' + reveal('up') + '>'
      + (it.logo ? '<span class="chip__logo"' + (vb ? ' style="--ovb:' + vb + '"' : '') + '>' + ctx.img(it.logo.file, { alt: it.logo.alt, widths: [200, 400], sizes: '160px', loading: 'lazy' }) + '</span>' : '')
      + '<span class="chip__name">' + esc(it.name) + '</span></li>';
  }).join('') + '</ul>';
  function reviewCard(r, o = {}) {
    const tag = o.tag || 'figure';
    return '<' + tag + ' class="review-card' + (o.featured ? ' review-card--featured' : '') + (o.cls ? ' ' + o.cls : '') + '">'
      + stars(r.ratingLabel || '', r.rating)
      + '<blockquote class="review-card__quote"><p>' + esc(r.quote) + '</p></blockquote>'
      + '<figcaption class="review-card__by">' + (r.author ? '<cite>' + esc(r.author) + '</cite>' : '') + (r.date ? '<time datetime="' + esc(r.date) + '">' + esc(formatDate(r.date)) + '</time>' : '') + '</figcaption>'
      + '</' + tag + '>';
  }

  return Object.freeze({
    ctx, page,
    esc, attrs, plain, unwrapP, icon, formatDate,
    accent, heading, swoosh: () => SWOOSH, mark, eyebrow,
    book, call, located, link, button, buttonGroup, ctaPair,
    glass, reveal, stagger, depth, seam,
    picture, cutout, texture, loop, postcard,
    breadcrumbs, titleBand, ledeCard, ctaStrip, locationCard, hoursList, mapFrame, stars, section,
    card, cardGrid, docCard, postCard, chips, reviewCard,
    current: (href) => !!page && href === page.path,
    preloadImage,
    /** THEME-CORE internal: the preloads registered while rendering this page */
    _preloads: () => preloads.slice(),
  });
}
