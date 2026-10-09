// blocks.mjs - block and node renderers for the interior pages (THEME-TEMPLATES role, docs/BUILD-CONTRACT.md 2).
// DESIGN-SPEC 10.4-10.29. Every function returns an HTML string built on THEME-CORE's kit (src/theme/parts.mjs,
// CONTRACT B/C): shared pieces (title band, lede card, CTA strip, buttons, cards, chips, doctor / post / review cards,
// photo frames, cut-outs, textures, loops, bands) come from the kit and keep THEME-CORE's classes; this file adds the
// interior layouts, whose classes THEME-TEMPLATES styles (interior / blocks / forms / special .css).
// Copy rule (DESIGN-SPEC 2.4): every visible word comes from page.model, page.adopted or ctx. Model text is printed
// verbatim (html nodes as given, text fields escaped), model images keep their source alt, empty slots render nothing.
import { esc, attrs, plain, unwrapP, createKit } from './parts.mjs';

export { esc, attrs, plain, unwrapP };

/* ============================================================================================ html helpers */
export const liCount = (h) => (String(h).match(/<li>/g) || []).length;
export const paraCount = (h) => (String(h).match(/<p>/g) || []).length;
export const hasList = (h) => /<(ul|ol)>/.test(String(h));
/** add a class to every bare <ul>/<ol> of an html string (model and adopted lists carry no attributes) */
export const listClass = (h, cls) => (cls ? String(h ?? '').replace(/<(ul|ol)>/g, '<$1 class="' + cls + '">') : String(h ?? ''));
/** split an html string around its first list: { before, list, after, tag } (lists are never nested in the data) */
export function splitList(h) {
  const s = String(h ?? '');
  const m = s.match(/<(ul|ol)>[\s\S]*?<\/\1>/);
  if (!m) return { before: s, list: '', after: '', tag: null };
  return { before: s.slice(0, m.index), list: m[0], after: s.slice(m.index + m[0].length), tag: m[1] };
}
export const rich = (html, cls = 'rich') => '<div class="' + cls + '">' + html + '</div>';

/* ============================================================================================ page context */
/** one per renderMain call: the kit (created when the caller passes none), deterministic ids */
export function pageContext(page, ctx, kit) {
  let n = 0;
  return { page, ctx, kit: kit || createKit(ctx, page), uid: (p) => (p || 'x') + '-' + (++n) };
}

/* ============================================================================================ images */
const MASTER_CACHE = new WeakMap();
/** image-masters entry for a file path (ctx.imageMasters), or null */
export function masterOf(ctx, file) {
  if (!MASTER_CACHE.has(ctx)) {
    const m = new Map();
    for (const x of ctx.imageMasters || []) if (x.file) m.set(x.file, x);
    MASTER_CACHE.set(ctx, m);
  }
  return MASTER_CACHE.get(ctx).get(file) || null;
}
/** DESIGN-SPEC 13.4 object positions (image-masters id) */
const POSITION = {
  'photo-as-569060589': '58% 32%', 'photo-as-1343078337': '50% 40%', 'photo-as-485352260': '64% 36%', 'photo-as-522927551': '50% 28%',
  'photo-as-1899226050': '60% 30%', 'photo-ss-1395168776': '60% 50%', 'photo-as-528233245-1': '50% 30%', 'photo-family-sitting-on-bed': '50% 62%',
};
/**
 * DESIGN-SPEC 13.5 flagged photos: a frame + crop that keeps the flagged detail out of view (crops chosen by viewing
 * the files; see docs/BUILD-NOTES.md section 3).
 */
const FLAGGED = {
  /* "FLU" poster lettering in the top 9 % (x 41-52 %): a 16:9 frame anchored at the bottom cuts the top 13 % */
  'photo-as-527484728': { frame: 'wide', pos: '50% 100%' },
  /* glucose meter showing "4.8" at x 65-74 %: a 4:5 arch anchored at 20 % shows x 9-63 % of the photo */
  'photo-as-558091528': { frame: 'arch', pos: '20% 30%' },
  /* roadside sign printing the second phone number (digits at x 83.5-100 %): a 1:1 frame anchored at 12 % shows
     x 3-78 %, so the sign's digits stay out of frame (the spec's 30 % would show up to x 82.5 %) */
  'practice-35051-15ef8052': { frame: 'square', pos: '12% 50%' },
};
export function flagOf(ctx, file) { const m = masterOf(ctx, file); return m && FLAGGED[m.id] ? FLAGGED[m.id] : null; }
/** object-position of a model image: flag crop, spec table, the source focal point, else the fallback */
export function positionOf(ctx, node, fallback = '50% 40%') {
  const m = masterOf(ctx, node.file);
  if (m && FLAGGED[m.id]) return FLAGGED[m.id].pos;
  if (m && POSITION[m.id]) return POSITION[m.id];
  if (node.focal && !/^50(\.0)?% 50(\.0)?%$/.test(node.focal)) return node.focal;
  return fallback;
}
export const slotExists = (ctx, id) => !!(id && ctx.generatedSlots && ctx.generatedSlots[id] && ctx.generatedSlots[id].exists);

/* ============================================================================================ accents */
const STOP = new Set(['for', 'of', 'the', 'a', 'an', 'to', 'in', 'at', 'and', 'your', 'our', '&']);
/**
 * DESIGN-SPEC 10.1 accent guard for the practice name. kit.accent's default rule takes the last two words (three after a
 * stop word); on "Terms of Use for the Academy Vision Website" or "Visit Academy Vision for Eyeglasses" that italicises
 * "Vision ..." and splits the name "Academy Vision". This replays the kit's selection and, when it would start on
 * "Vision" right after "Academy", returns the phrase extended to include "Academy" (kit `phrase` override); false
 * when that phrase would be the whole heading (no accent); null when the kit's own choice is fine.
 */
export function brandPhrase(html) {
  const src = String(html ?? '');
  if (!src.trim() || /<[a-zA-Z!/]/.test(src) || /Pine Beach/.test(src)) return null;
  const toks = [...src.matchAll(/\S+/g)].map((m) => ({ t: m[0], i: m.index }));
  if (toks.filter((t) => /[\p{L}\p{N}]/u.test(plain(t.t))).length <= 2) return null;
  const n = toks.length;
  let k = n - 2;
  if (STOP.has(plain(toks[k].t).toLowerCase()) && k - 1 >= 1) k -= 1;
  if (k >= 1 && plain(toks[k].t) === 'Vision' && plain(toks[k - 1].t) === 'Academy') {
    if (k - 1 === 0) return false;
    return src.slice(toks[k - 1].i, toks[n - 1].i + toks[n - 1].t.length);
  }
  return null;
}
/** kit.heading / kit.titleBand accent options for a heading's html (brand guard applied) */
export function accentOpts(html, accent = true) {
  if (!accent) return { accent: false };
  const p = brandPhrase(html);
  return p === false ? { accent: false } : p ? { accent: true, phrase: p } : { accent: true };
}

/* ============================================================================================ text nodes */
/** a model heading node through kit.heading (accent rule 10.1 + the brand guard; level null -> <p>) */
export function headingNode(pc, n, { cls = 'h2', id, swoosh = false, accent = true } = {}) {
  return pc.kit.heading(n.html, { level: n.level || null, cls, id, swoosh, ...accentOpts(n.html, accent) });
}
/** text nodes of a block in model order (eyebrow, heading, html); the buttons become one R-11 group at the end */
export function textNodes(pc, nodes, { headingId, headingCls = 'h2', surface = 'light', htmlCls = 'rich', listCls = null, markLast = false } = {}) {
  const { kit } = pc;
  let out = '';
  let idUsed = false;
  const buttons = [];
  const htmls = nodes.filter((n) => n.t === 'html' && n.hint !== 'kicker');
  for (const n of nodes) {
    if (n.t === 'html' && n.hint === 'kicker') out += kit.eyebrow(n.html);
    else if (n.t === 'heading') { out += headingNode(pc, n, { cls: headingCls, id: !idUsed ? headingId : undefined }); idUsed = idUsed || !!headingId; }
    else if (n.t === 'html') out += rich(listClass(markLast && n === htmls[htmls.length - 1] ? kit.mark(n.html) : n.html, listCls), htmlCls);
    else if (n.t === 'button') buttons.push(n);
  }
  return out + kit.buttonGroup(buttons, { surface });
}

/* ============================================================================================ location (model nodes) */
/**
 * DESIGN-SPEC 10.16 location card from a model location node, in THEME-CORE's .loc-card look: the label (a heading
 * node's html or the record's name when `show` has it), then phone and address in the order the model printed them.
 */
export function locationCard(pc, node, { labelHtml = null, cls = '' } = {}) {
  const { kit } = pc;
  const show = new Set(node.show || []);
  const label = labelHtml || (show.has('name') ? esc(node.name) : '');
  const rows = [];
  for (const k of node.show || []) {
    if (k === 'phone') rows.push('<li><a class="loc-card__link" href="' + esc(node.phoneHref) + '">' + kit.icon('phone') + '<span>' + esc(node.phone) + '</span></a></li>');
    if (k === 'address') rows.push('<li><a' + attrs({ class: 'loc-card__link', href: node.mapsUrl, target: node.mapsNewTab ? '_blank' : null, rel: node.mapsNewTab ? 'noopener' : null }) + '>' + kit.icon('pin') + '<span>' + esc(node.address) + (show.has('chevron') ? '&nbsp;<span class="arrow" aria-hidden="true">»</span>' : '') + '</span></a></li>');
  }
  return '<div class="loc-card glass glass--navy' + (cls ? ' ' + cls : '') + '">'
    + (label ? '<p class="loc-card__head"><span class="loc-card__pin">' + kit.icon('pin') + '</span><span class="loc-card__title">' + label + '</span></p>' : '')
    + (rows.length ? '<ul class="loc-card__rows">' + rows.join('') + '</ul>' : '') + '</div>';
}
/** hours (glass card) and map (glass frame) from model location nodes; headings are Academy Vision's own footer labels */
export function visitBand(pc, { summary = null, labelHtml = null, hours = null, map = null, cls = '' } = {}) {
  const { kit, ctx } = pc;
  const fh = ctx.chrome.footerHeadings || {};
  if (!summary && !hours && !map) return '';
  const hid = pc.uid('h-visit');
  const parts = [];
  if (summary) parts.push('<div class="visit-band__loc"' + kit.reveal('up') + '>' + locationCard(pc, summary, { labelHtml }) + '</div>');
  if (hours) parts.push('<div class="visit-band__hours glass"' + kit.reveal('up') + '><h2 class="visit-band__h" id="' + hid + '">' + kit.icon('clock') + '<span>' + esc(fh.hours) + '</span></h2>' + kit.hoursList(hours.hours) + '</div>');
  if (map) parts.push('<div class="visit-band__map"' + kit.reveal('up') + '><h2 class="visit-band__h"' + (hours ? '' : ' id="' + hid + '"') + '>' + kit.icon('pin') + '<span>' + esc(fh.locate) + '</span></h2>' + kit.mapFrame(map.mapTitle) + '</div>');
  return kit.section({ cls: 'visit-band tpl-pool' + (cls ? ' ' + cls : ''), labelledby: hours || map ? hid : null }, '<div class="visit-band__grid visit-band__grid--' + parts.length + '">' + parts.join('') + '</div>');
}

/* ============================================================================================ team */
/** DESIGN-SPEC 10.13 team section: navy intro zone (kicker, H2, statement on navy, tracked label) + P-row doctor cards */
export function teamSection(pc, block) {
  const { kit } = pc;
  const nodes = block.nodes;
  const list = nodes.find((n) => n.t === 'team' && n.kind === 'list');
  const idx = nodes.indexOf(list);
  const intro = nodes.slice(0, idx);
  const headings = intro.filter((n) => n.t === 'heading');
  const sub = headings.length > 1 ? headings[headings.length - 1] : null;   // "Meet our Optometrists": a tracked label, level kept
  const hid = 'h-' + block.id;
  let head = '';
  let idUsed = false;
  const buttons = [];
  for (const n of intro) {
    if (n === sub) continue;
    if (n.t === 'html' && n.hint === 'kicker') head += kit.eyebrow(n.html);
    else if (n.t === 'heading') { head += headingNode(pc, n, { cls: 'h2 team-band__title', id: idUsed ? undefined : hid }); idUsed = true; }
    else if (n.t === 'html') head += '<div class="designed team-band__statement">' + kit.mark(n.html) + '</div>';
    else if (n.t === 'button') buttons.push(n);
  }
  head += kit.buttonGroup(buttons, { surface: 'navy' });
  const after = nodes.slice(idx + 1).map((n) => renderNode(pc, n)).join('');
  return '<section class="section team-band" aria-labelledby="' + hid + '">'
    + '<div class="team-band__top band--navy">' + kit.texture('tex-navy-glass', { cls: 'team-band__tex', opacity: 0.25 })
    + '<div class="container team-band__head"' + kit.reveal('up') + '>' + head + '</div>'
    + (sub ? '<div class="container team-band__subwrap">' + headingNode(pc, sub, { cls: 'team-band__sub', accent: false }) + '</div>' : '') + '</div>'
    + '<div class="container team-band__cards"><ul class="doc-grid"' + kit.stagger() + '>' + list.items.map((it) => kit.docCard(it)).join('') + '</ul></div>' + after + '</section>';
}

/* ============================================================================================ lists */
const CARD_SIZES = '(min-width: 1024px) 380px, (min-width: 768px) 46vw, 96px';
/** DESIGN-SPEC 10.17 child-page cards through kit.cardGrid (model titles, excerpts, images and alts as given) */
export const childCards = (pc, node, { cls = '', level = 3 } = {}) => pc.kit.cardGrid(node.items.map((it) => ({ href: it.href, title: it.title, excerpt: it.excerpt, image: it.image ? { file: it.image.file, alt: it.image.alt } : null })), { cls, level, sizes: CARD_SIZES });
/** DESIGN-SPEC 10.18 logo chips; frames: the first 12 show once features.js wires the model's "Show All" (all 26 without JS) */
export function logoChips(pc, node) {
  const { kit } = pc;
  const showAll = node.ui && node.ui.showAll;
  const chips = kit.chips(node.items, { cls: 'chips--' + node.kind });
  if (!showAll) return chips;
  const id = pc.uid('show-all');
  return '<div class="show-all" id="' + id + '" data-show-all-root data-show-all-count="12">' + chips
    + '<p class="show-all__row"><button type="button" class="btn btn--outline btn--sm" data-show-all aria-controls="' + id + '" aria-expanded="false" hidden>' + esc(showAll) + '</button></p></div>';
}
/** DESIGN-SPEC 10.18 contact-lens products: glass cards, packshot contained in 120 px, serif name */
export function lensProducts(pc, node) {
  const { kit, ctx } = pc;
  return '<ul class="lens-grid"' + kit.stagger() + '>' + node.items.map((it) => '<li class="lens-card glass glass--strong"' + kit.reveal('up') + '>'
    + (it.logo ? '<div class="lens-card__pack">' + ctx.img(it.logo.file, { alt: it.logo.alt, widths: [240, 480], sizes: '120px', cls: 'lens-card__img' }) + '</div>' : '')
    + '<p class="lens-card__name">' + esc(it.name) + '</p></li>').join('') + '</ul>';
}
/** DESIGN-SPEC 10.25 sitemap: one glass card per regenerated group, items indented by depth */
export function sitemapGroups(pc, node) {
  const groups = node.groups && node.groups.length ? node.groups : [{ id: 'all', label: null, href: null, items: node.items }];
  return '<div class="sitemap-grid">' + groups.map((g) => {
    const head = g.href ? (g.items.find((it) => it.href === g.href) || { label: g.label, href: g.href }) : null;
    const items = head ? g.items.filter((it) => it !== head) : g.items;
    const base = head ? Math.min(...g.items.map((it) => it.depth)) + (g.items.includes(head) ? 1 : 0) : 0;
    const hid = 'sm-' + esc(g.id);
    return '<div class="sitemap-card glass">'
      + (head ? '<h2 class="sitemap-card__head" id="' + hid + '"><a href="' + esc(head.href) + '">' + esc(head.label) + '</a></h2>' : '')
      + (items.length ? '<ul class="sitemap-list">' + items.map((it) => '<li class="sitemap-list__item" style="--depth:' + Math.max(0, it.depth - base) + '"><a href="' + esc(it.href) + '">' + esc(it.label) + '</a></li>').join('') + '</ul>' : '')
      + '</div>';
  }).join('') + '</div>';
}

/* ============================================================================================ reviews + photos */
/**
 * DESIGN-SPEC 10.19 carousel: kit.reviewCard per review inside a scroll-snap track, prev / next and one dot per review
 * (labels from the model's ui), no autoplay. The full quote is static markup; the excerpt rides in data-excerpt and
 * features.js swaps it in with the model's "Show More" button. Without JS: a scrollable list of full quotes.
 */
export function reviewsCarousel(pc, node, { label = null } = {}) {
  const { kit } = pc;
  const ui = node.ui || {};
  const tid = pc.uid('reviews');
  const slides = node.items.map((r, i) => '<li class="carousel__slide" id="' + tid + '-' + (i + 1) + '"' + attrs({ 'data-excerpt': r.excerpt || null }) + '>' + kit.reviewCard(r, { cls: 'glass' }).replace('</cite><time', '</cite> <time') + '</li>').join('');
  const dots = node.items.map((_, i) => '<button type="button" class="carousel__dot" data-dot="' + i + '"' + attrs({ 'aria-label': String(ui.dot || '').replace('{n}', String(i + 1)), 'aria-controls': tid + '-track', 'aria-current': i === 0 ? 'true' : null, tabindex: i === 0 ? null : '-1' }) + '></button>').join('');
  return '<div class="carousel" data-carousel' + attrs({ 'data-show-more': ui.showMore || null }) + '>'
    + '<div class="carousel__viewport" id="' + tid + '-track" tabindex="0" role="region"' + attrs({ 'aria-label': label }) + '><ul class="carousel__track">' + slides + '</ul></div>'
    + '<div class="carousel__controls" hidden>'
    + '<button type="button" class="carousel__btn carousel__btn--prev" data-prev' + attrs({ 'aria-label': ui.previous, 'aria-controls': tid + '-track' }) + '>' + kit.icon('chev', 'carousel__chev') + '</button>'
    + '<div class="carousel__dots">' + dots + '</div>'
    + '<button type="button" class="carousel__btn carousel__btn--next" data-next' + attrs({ 'aria-label': ui.next, 'aria-controls': tid + '-track' }) + '>' + kit.icon('chev', 'carousel__chev') + '</button>'
    + '</div></div>';
}
/** DESIGN-SPEC 10.20 practice photos as print postcards in a loose fan; features.js makes each a lightbox toggle */
export function practicePhotos(pc, node) {
  const { kit, ctx } = pc;
  const label = node.ui && node.ui.lightbox;
  return '<ul class="photo-fan"' + attrs({ 'data-lightbox-label': label || null }) + '>' + node.items.map((it, i) => {
    const flag = flagOf(ctx, it.file);
    const lead = !!it.highlight;
    const size = ctx.imgSize(it.file);
    const w = Math.min(lead ? 480 : 360, size ? Math.round(size.w / 1.5) : 400);
    return '<li class="photo-fan__item' + (lead ? ' photo-fan__item--lead' : '') + (flag && flag.frame === 'square' ? ' photo-fan__item--square' : '') + '"' + (flag ? ' style="--pos:' + flag.pos + '"' : '') + ' data-lightbox-item>'
      + kit.postcard(it.file, { alt: it.alt, tilt: [3, -4, 2][i % 3], width: w, sizes: '(min-width: 1024px) ' + w + 'px, 80vw' }) + '</li>';
  }).join('') + '</ul>';
}

/* ============================================================================================ forms */
/**
 * DESIGN-SPEC 10.23 form: the 15 field kinds of PORT-NOTES 3.3, every label paired with its control (for/id),
 * fieldsets for groups, showIf rules as data, the source's validation copy as data. Unwired (BUILD-CONTRACT 4.5): no
 * action, the submit button ships disabled and features.js stops submission with an honest notice (never success).
 */
export function form(pc, n) {
  const { kit } = pc;
  const m = n.messages || {};
  const v = m.validation || {};
  const fid = 'form-' + n.id;
  const control = (i, f, describedby) => {
    const name = i.name || f.submitName || f.id;
    const a = {
      class: 'field__control', id: i.id, name: i.type === 'checkbox' && (f.inputs || []).length > 1 ? name + '[]' : name, required: !!i.required,
      placeholder: i.placeholder, autocomplete: i.autocomplete, inputmode: i.inputmode, min: i.min, max: i.max, step: i.step,
      'aria-label': i.ariaLabel, 'aria-describedby': describedby || null, 'data-phone-format': i.phoneFormat ? '1' : null, 'data-required-group': i.requiredGroup ? '1' : null,
    };
    if (i.el === 'select') return '<select' + attrs(a) + '>' + (i.options || []).map((o) => '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>').join('') + '</select>';
    if (i.el === 'textarea') return '<textarea' + attrs({ ...a, rows: i.rows }) + '></textarea>';
    return '<input' + attrs({ type: i.type || 'text', ...a, value: ['hidden', 'radio', 'checkbox'].includes(i.type) ? i.value : null }) + '>';
  };
  const reqMark = (f) => (f.requiredMark ? ' <span class="req" aria-hidden="true">' + esc(f.requiredMark) + '</span>' : '');
  const field = (f) => {
    const box = { class: 'field field--' + f.type + (f.presentation === 'chips' ? ' field--chips' : ''), 'data-field': f.id, 'data-show-if': f.showIf ? JSON.stringify(f.showIf) : null, hidden: !!f.showIf };
    if (f.type === 'html' || f.type === 'content') return '<div' + attrs(box) + '>' + (f.label ? '<p class="field__label field__label--plain">' + esc(f.label) + '</p>' : '') + (f.html ? '<div class="field__content rich">' + f.html + '</div>' : (f.text ? '<p>' + esc(f.text) + '</p>' : '')) + '</div>';
    if (f.type === 'heading') { const lv = f.level || 2; return '<div' + attrs(box) + '><h' + lv + ' class="form__heading">' + esc(f.text || f.label) + '</h' + lv + '></div>'; }
    const ins = f.inputs || [];
    const descId = f.description ? f.id + '-desc' : null;
    const errId = f.id + '-err';
    const desc = f.description ? '<p class="field__desc" id="' + descId + '">' + esc(f.description) + '</p>' : '';
    /* DESIGN-SPEC 10.23: errors under the field with role="alert" (as the source runtime wrote them); features.js fills
       them with messages.validation and links them to the control with aria-describedby */
    const err = '<p class="field__error" id="' + errId + '" role="alert" hidden></p>';
    const choice = ins.length && ins.every((i) => i.type === 'radio' || i.type === 'checkbox');
    if (choice) {
      return '<fieldset' + attrs({ ...box, 'data-choice': ins[0].type, 'data-required': f.required || ins.some((i) => i.required || i.requiredGroup) ? '1' : null, 'aria-describedby': descId }) + '>'
        + '<legend class="field__label">' + esc(f.label) + reqMark(f) + '</legend>' + desc
        + '<div class="choices' + (f.presentation === 'chips' ? ' choices--chips' : '') + '">'
        + ins.map((i) => '<label class="choice" for="' + esc(i.id) + '">' + control(i, f) + '<span class="choice__text">' + (i.labelHtml || esc(i.label)) + '</span></label>').join('') + '</div>' + err + '</fieldset>';
    }
    if (ins.length !== 1 || f.legend) {
      /* name / address / date / time: a fieldset whose parts carry their own visible labels */
      return '<fieldset' + attrs({ ...box, 'aria-describedby': descId }) + '><legend class="field__label">' + esc(f.label) + reqMark(f) + '</legend>' + desc
        + '<div class="field__parts field__parts--' + Math.min(ins.length, 4) + '">' + ins.map((i) => '<div class="field__part"><label class="field__sublabel" for="' + esc(i.id) + '">' + esc(i.label) + '</label>' + control(i, f) + '</div>').join('') + '</div>' + err + '</fieldset>';
    }
    const i = ins[0];
    const own = i.label && i.label !== f.label ? '<span class="field__sublabel">' + esc(i.label) + '</span>' : '';
    return '<div' + attrs(box) + '><label class="field__label" for="' + esc(f.labelFor || i.id) + '">' + esc(f.label) + reqMark(f) + '</label>' + own + desc + control(i, f, descId) + err + '</div>';
  };
  return '<form class="form" id="' + esc(fid) + '" data-sr-unwired="1" novalidate'
    + attrs({ 'data-msg-required': v.valueMissing, 'data-msg-radio': v.radioGroup, 'data-msg-checkbox': v.checkboxGroup, 'data-msg-error': m.error, 'data-msg-submitting': m.submitting, 'data-msg-success': m.success ? plain(m.success) : null }) + '>'
    + (n.hidden || []).map((h) => '<input type="hidden" name="' + esc(h.name) + '" value="' + esc(h.value) + '">').join('')
    + '<div class="form__fields">' + n.fields.map(field).join('') + '</div>'
    /* disabled until features.js runs: without JS an unwired form would GET its fields into a URL (BUILD-NOTES 1.3.3) */
    + '<div class="form__submit"><button type="submit" class="btn btn--primary" disabled data-unwired-submit>' + esc((n.submit && n.submit.label) || '') + kit.icon('arrow', 'btn__arrow') + '</button></div>'
    /* the honest notice: the source's own error copy plus the practice's scheduler and phone (never a success claim) */
    + '<div class="form__notice" role="alert" tabindex="-1" hidden><p class="form__notice-text"></p>' + kit.ctaPair({ size: 'sm', cls: 'form__notice-actions' }) + '</div>'
    + '</form>';
}

/* ============================================================================================ generic node */
/** any model node outside the composed layouts, so every node stays renderable */
export function renderNode(pc, n) {
  const { kit, ctx } = pc;
  switch (n.t) {
    case 'heading': return headingNode(pc, n, { cls: 'h3' });
    case 'html': return n.hint === 'kicker' ? kit.eyebrow(n.html) : rich(listClass(n.html, null));
    case 'image': return kit.picture(n.file, { alt: n.alt, sizes: '(min-width: 900px) 50vw, 100vw', frame: 'plain', position: positionOf(ctx, n) });
    case 'button': return kit.buttonGroup([n]);
    case 'form': return form(pc, n);
    case 'legal': return '<div class="legal rich rich--legal">' + listClass(n.html, null) + '</div>';
    case 'divider': return '<hr class="divider">';
    case 'reviews': return reviewsCarousel(pc, n);
    case 'location': {
      const show = new Set(n.show || []);
      let out = '';
      if (show.has('name') || show.has('phone') || show.has('address')) out += locationCard(pc, n);
      if (show.has('hours')) out += '<div class="visit-band__hours glass">' + kit.hoursList(n.hours) + '</div>';
      if (show.has('map')) out += kit.mapFrame(n.mapTitle);
      return out;
    }
    case 'team':
      if (n.empty || (Array.isArray(n.items) && !n.items.length && n.kind !== 'biography' && n.kind !== 'photo')) return '';   /* empty platform slots */
      if (n.kind === 'list') return '<ul class="doc-grid"' + kit.stagger() + '>' + n.items.map((it) => kit.docCard(it)).join('') + '</ul>';
      if (n.kind === 'biography') return rich(listClass(n.html, 'chip-list'), 'rich rich--bio');
      if (n.kind === 'photo') return kit.picture(n.image.file, { alt: n.image.alt, frame: 'portrait', widths: [150, 300], sizes: '150px', width: 150 });
      return '<ul>' + n.items.map((x) => '<li>' + esc(typeof x === 'string' ? x : x.text || x.label || '') + '</li>').join('') + '</ul>';
    case 'list':
      if (n.empty || !n.items || !n.items.length) return '';
      if (n.kind === 'insurance' || n.kind === 'frames') return logoChips(pc, n);
      if (n.kind === 'contact-lenses') return lensProducts(pc, n);
      if (n.kind === 'childpages') return childCards(pc, n);
      if (n.kind === 'articles') return n.items.map((it) => kit.postCard(it)).join('');
      if (n.kind === 'sitemap') return sitemapGroups(pc, n);
      if (n.kind === 'photos') return practicePhotos(pc, n);
      if (n.kind === 'equipment') return '<ul>' + n.items.map((x) => '<li>' + esc(typeof x === 'string' ? x : x.name || '') + '</li>').join('') + '</ul>';
      throw new Error('blocks: unknown list kind ' + n.kind);
    default: throw new Error('blocks: unknown node type ' + n.t);
  }
}

/* ============================================================================================ composed sections */
const firstHeading = (nodes) => nodes.find((n) => n.t === 'heading') || null;
const sectionOpen = (cls, hid, extra = '') => '<section class="section ' + cls + '"' + (hid ? ' aria-labelledby="' + hid + '"' : '') + extra + '>';

/**
 * DESIGN-SPEC 10.7 image + text blocks. layout:
 *   split    half-bleed lens-edged photo (64 %) with a glass panel overlapping from the other side
 *   arch     copy beside the photo in an arch window
 *   postcard the photo as a real-place print breaking out of the glass panel (small real-place photos, 10.21)
 *   lens     the photo in the circular lens frame (small square photos, capped at intrinsic width / 1.5)
 * side = the model's image side; navy = a navy band with a smoked-glass panel (10.12).
 */
export function splitSection(pc, block, { layout = 'split', side = 'right', image, textNodesList, navy = false, extraHead = [] }) {
  const { kit, ctx } = pc;
  const nodes = [...extraHead, ...textNodesList];
  const hid = firstHeading(nodes) ? 'h-' + block.id : null;
  const body = textNodes(pc, nodes, { headingId: hid, surface: navy ? 'navy' : 'light', htmlCls: navy ? 'rich rich--inv' : 'rich', listCls: navy ? null : null });
  const pos = positionOf(ctx, image);
  const flag = flagOf(ctx, image.file);
  const from = side === 'right' ? 'left' : 'right';
  if (layout === 'arch') {
    return sectionOpen('arch-split arch-split--img-' + side, hid)
      + '<div class="container arch-split__grid"><div class="arch-split__copy"' + kit.reveal(from) + '>' + body + '</div>'
      + '<div class="arch-split__media">' + kit.picture(image.file, { alt: image.alt, sizes: '(min-width: 900px) 40vw, 90vw', frame: 'arch', position: pos, depth: flag ? null : 0.05, depthMax: 24, reveal: 'scale' }) + '</div></div></section>';
  }
  if (layout === 'postcard') {
    return sectionOpen('pc-split pc-split--img-' + side, hid)
      + '<div class="container pc-split__grid"><div class="pc-split__panel glass glass--strong"' + kit.reveal(from) + '>' + body + '</div>'
      + '<div class="pc-split__media">' + kit.postcard(image.file, { alt: image.alt, tilt: side === 'right' ? 3 : -4, width: Math.min(400, Math.round(image.w / 1.5)) }) + '</div></div></section>';
  }
  if (layout === 'lens') {
    const cap = image.w < 1000 ? Math.round(image.w / 1.5) : 520;
    return sectionOpen('lens-split lens-split--img-' + side, hid)
      + '<div class="container lens-split__grid"><div class="lens-split__copy"' + kit.reveal('up') + '>' + body + '</div>'
      + '<div class="lens-split__media" style="--lens-max:' + cap + 'px">' + kit.picture(image.file, { alt: image.alt, sizes: '(min-width: 1024px) ' + cap + 'px, 78vw', frame: 'lens', position: positionOf(ctx, image, '50% 50%'), reveal: 'scale' }) + '</div></div></section>';
  }
  const wide = !!(flag && flag.frame === 'wide');
  return sectionOpen('split split--img-' + side + (wide ? ' split--wide' : '') + (navy ? ' split--navy band--navy' : ''), hid)
    + '<div class="split__media">' + kit.picture(image.file, { alt: image.alt, sizes: '(min-width: 900px) 64vw, 100vw', frame: 'lens-edge', position: pos, depth: wide ? null : 0.05, depthMax: 28, reveal: 'mask', cls: 'split__pic' }) + '</div>'
    + '<div class="container split__inner"><div class="split__panel glass ' + (navy ? 'glass--navy' : 'glass--strong') + '"' + kit.reveal(from) + '>' + body + '</div></div></section>';
}
/**
 * The cream-light texture as a section plane under small glass cards (option cards, review cards, lens products, sitemap
 * cards): R-5 needs visible structure behind every text-bearing panel, and a card that landed between two of the
 * section's light pools measured a backdrop range of 0.06-0.09 (needs 0.10). Painted at z -1 (under the section's own
 * copy, over its pools), lazy, aria-hidden, hidden in forced colors (depth.css).
 */
export const texturePlane = (pc) => pc.kit.texture('tex-cream-light', { cls: 'tpl-tex', opacity: 0.7 });
/** DESIGN-SPEC 10.10 List split: sea-glass band (arched top), copy + list items as glass chips, the photo in the lens */
export function listSplitSection(pc, block, { image, textNodesList }) {
  const { kit, ctx } = pc;
  const hid = firstHeading(textNodesList) ? 'h-' + block.id : null;
  const body = textNodes(pc, textNodesList, { headingId: hid, listCls: 'chip-list' });
  return sectionOpen('list-split band--seaglass', hid) + '<div class="container list-split__grid">'
    + '<div class="list-split__copy"' + kit.reveal('up') + '>' + body + '</div>'
    + '<div class="list-split__media">' + kit.picture(image.file, { alt: image.alt, sizes: '(min-width: 1024px) 520px, 78vw', frame: 'lens', position: positionOf(ctx, image, '50% 50%'), reveal: 'scale' }) + '</div></div></section>';
}
/** DESIGN-SPEC 10.10 Options: heading + lead beside an arch photo; the list items become glass option cards */
export function optionsSection(pc, block, { image, textNodesList }) {
  const { kit, ctx } = pc;
  const hid = firstHeading(textNodesList) ? 'h-' + block.id : null;
  let head = '', cards = '', tail = '';
  let idUsed = false;
  const buttons = [];
  for (const n of textNodesList) {
    if (n.t === 'html' && n.hint === 'kicker') head += kit.eyebrow(n.html);
    else if (n.t === 'heading') { head += headingNode(pc, n, { cls: 'h2', id: idUsed ? undefined : hid }); idUsed = true; }
    else if (n.t === 'html') {
      const p = splitList(n.html);
      if (p.list && !cards) {
        if (p.before) head += rich(p.before, 'rich rich--lead');
        const items = [...p.list.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1]);
        /* the grid cell (li) holds the card's two pools (interior.css .opt-cell); the glass card inside reveals with the
           stagger delay site.js would give the li (85 ms x index, capped at 6) */
        cards = '<' + p.tag + ' class="opt-grid opt-grid--' + items.length + '">' + items.map((x, i) => '<li class="opt-cell"><div class="opt-card glass"' + kit.reveal('up') + ' style="--d:' + Math.min(i, 6) * 85 + 'ms"><span class="iris-dot" aria-hidden="true"></span><p>' + x + '</p></div></li>').join('') + '</' + p.tag + '>';
        if (p.after) tail += rich(listClass(p.after, null));
      } else if (cards) tail += rich(listClass(n.html, null));
      else head += rich(listClass(n.html, null));
    } else if (n.t === 'button') buttons.push(n);
  }
  return sectionOpen('options tpl-pool', hid) + texturePlane(pc) + '<div class="container">'
    + '<div class="options__head"><div class="options__copy"' + kit.reveal('up') + '>' + head + '</div>'
    + '<div class="options__media">' + kit.picture(image.file, { alt: image.alt, sizes: '(min-width: 900px) 30vw, 80vw', frame: 'arch', position: positionOf(ctx, image), reveal: 'scale' }) + '</div></div>'
    + cards + tail + kit.buttonGroup(buttons, { cls: 'options__actions' }) + '</div></section>';
}
/** DESIGN-SPEC 10.9 Statement (<= 700 characters, <= 2 paragraphs): heading in columns 1-5, designed type in 6-12 */
export function statementSection(pc, { id, nodes = null, headingHtml = null, htmlList = [], domId = null }) {
  const { kit } = pc;
  const hid = 'h-' + id;
  let head = '', body = '';
  const buttons = [];
  if (nodes) {
    let idUsed = false;
    const htmls = nodes.filter((n) => n.t === 'html' && n.hint !== 'kicker');
    for (const n of nodes) {
      if (n.t === 'html' && n.hint === 'kicker') head += kit.eyebrow(n.html);
      else if (n.t === 'heading') { head += headingNode(pc, n, { cls: 'h2 statement__title', id: idUsed ? undefined : hid }); idUsed = true; }
      else if (n.t === 'html') body += n === htmls[htmls.length - 1] ? kit.mark(n.html) : n.html;
      else if (n.t === 'button') buttons.push(n);
    }
  } else {
    if (headingHtml) head = kit.heading(headingHtml, { level: 2, cls: 'h2 statement__title', id: hid, ...accentOpts(headingHtml) });
    body = htmlList.map((h, i) => (i === htmlList.length - 1 ? kit.mark(h) : h)).join('');
  }
  const labelled = /\sid="h-/.test(head);
  return '<section class="section statement tpl-pool"' + (domId ? ' id="' + esc(domId) + '"' : '') + (labelled ? ' aria-labelledby="' + hid + '"' : '') + '><div class="container statement__grid">'
    + '<div class="statement__head"' + kit.reveal('up') + '>' + head + '</div>'
    + '<div class="statement__body"' + kit.reveal('up') + '><div class="designed">' + body + '</div>' + kit.buttonGroup(buttons) + '</div></div></section>';
}
/** DESIGN-SPEC 10.9 Reading: a veil glass panel (72ch), first paragraph at lead size, iris-bullet lists, serif sub-heads */
export function readingSection(pc, { id, nodes = null, headingHtml = null, htmlList = [], listCls = null, cls = '', domId = null }) {
  const { kit } = pc;
  const hid = 'h-' + id;
  const inner = nodes ? textNodes(pc, nodes, { headingId: hid, htmlCls: 'rich rich--reading', listCls })
    : (headingHtml ? kit.heading(headingHtml, { level: 2, cls: 'h2', id: hid, ...accentOpts(headingHtml) }) : '') + htmlList.map((h) => rich(listClass(h, listCls), 'rich rich--reading')).join('');
  const labelled = inner.includes('id="' + hid + '"');
  return '<section class="section reading tpl-pool' + (cls ? ' ' + cls : '') + '"' + (domId ? ' id="' + esc(domId) + '"' : '') + (labelled ? ' aria-labelledby="' + hid + '"' : '') + '><div class="container">'
    + '<div class="reading__panel glass glass--veil"' + kit.reveal('up') + '>' + inner + '</div></div></section>';
}
/**
 * DESIGN-SPEC 10.9 CTA band: rounded navy panel with sky pools and the loop-navy-glass plane, a glass card, Book (light)
 * then Call (ghost-light). Deviation (BUILD-NOTES): the card is smoked .glass--navy, not .glass--navy-soft, and the loop
 * plane is at 60 % (spec 30 %). Measured: navy-soft over the 30 % plane gave a backdrop range of 0.04-0.05 (R-5 needs
 * 0.10); navy-soft over a 60 % plane reached 0.13 but its body text fell to p05 2.9 (R-19); smoked over 60 % gives 0.13
 * and p05 11.5. Both MUST rules hold only with the smoked card.
 */
export function ctaBand(pc, { id, nodes = null, headingHtml = null, htmlList = [], buttons = null }) {
  const { kit } = pc;
  const hid = 'h-' + id;
  let inner = '';
  let btns = buttons || [];
  if (nodes) {
    let idUsed = false;
    for (const n of nodes) {
      if (n.t === 'html' && n.hint === 'kicker') inner += kit.eyebrow(n.html);
      else if (n.t === 'heading') { inner += headingNode(pc, n, { cls: 'h2 cta-band__title', id: idUsed ? undefined : hid }); idUsed = true; }
      else if (n.t === 'html') inner += rich(n.html, 'rich rich--inv');
      else if (n.t === 'button') btns = [...btns, n];
    }
  } else inner = (headingHtml ? kit.heading(headingHtml, { level: 2, cls: 'h2 cta-band__title', id: hid, ...accentOpts(headingHtml) }) : '') + htmlList.map((h) => rich(h, 'rich rich--inv')).join('');
  if (!btns.length) btns = [kit.book, kit.call];
  const labelled = inner.includes('id="' + hid + '"');
  return '<section class="section cta-band-wrap"' + (labelled ? ' aria-labelledby="' + hid + '"' : '') + '><div class="container"><div class="cta-band"' + kit.reveal('up') + '>'
    + kit.loop('loop-navy-glass', { cls: 'cta-band__loop' })
    + '<div class="cta-band__card glass glass--navy">' + inner + kit.buttonGroup(btns, { surface: 'navy', cls: 'cta-band__actions' }) + '</div></div></div></section>';
}
