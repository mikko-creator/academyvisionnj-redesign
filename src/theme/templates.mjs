// templates.mjs - <main> content for every interior page kind (THEME-TEMPLATES role, docs/BUILD-CONTRACT.md 2;
// THEME-CORE <-> THEME-TEMPLATES contract A in src/theme/parts.mjs).
//   export function renderMain(page, ctx, kit) -> inner HTML of <main> for every page.kind except 'home'
//   export function render404Main(ctx, kit)    -> inner HTML of <main> for the 404 body (root-absolute URLs)
//   export function bodyClass(page, ctx)        -> extra <body> classes (template name)
// DESIGN-SPEC 10.5-10.6 (title band, lede card: kit.titleBand / kit.ledeCard) and 11 (page templates). kit.titleBand
// prints the page's only <h1>. Every model node of a page is rendered (build-verify (a)); adopted pages render their
// JSON verbatim (a3); buttons on adopted pages are Academy Vision's own ctx CTAs (BUILD-CONTRACT 3.3).
import {
  esc, plain, listClass, liCount, rich, pageContext, masterOf, positionOf, flagOf, slotExists, headingNode, textNodes,
  locationCard, visitBand, teamSection, childCards, logoChips, lensProducts, reviewsCarousel, practicePhotos, form,
  renderNode, splitSection, listSplitSection, optionsSection, statementSection, readingSection, ctaBand, accentOpts, texturePlane,
} from './blocks.mjs';

/* ============================================================================================ constants */
/** DESIGN-SPEC 13.6: one title-band cut-out per page (none on legal, sitemap, forms, bios, about, doctors) */
const CUTOUT_BY_PATH = {
  '/services/': 'cut-trial-lens', '/services/comprehensive-eye-exams/': 'cut-trial-lens', '/services/adult-eye-exams/': 'cut-trial-lens',
  '/services/senior-eye-exams/': 'cut-trial-lens', '/services/pediatric-eye-exams/': 'cut-trial-lens', '/services/back-to-school-eye-exams/': 'cut-trial-lens',
  '/services/medical-eye-care/': 'cut-lens-blank', '/services/dry-eye-treatment/': 'cut-lens-blank', '/services/glaucoma-management/': 'cut-lens-blank',
  '/services/diabetic-eye-exams/': 'cut-lens-blank', '/services/macular-degeneration/': 'cut-lens-blank', '/services/cataract-co-management/': 'cut-lens-blank',
  '/services/lasik-co-management/': 'cut-lens-blank', '/services/emergency-eye-care/': 'cut-lens-blank', '/services/pink-eye-conjunctivitis/': 'cut-lens-blank',
  '/services/foreign-body-removal/': 'cut-lens-blank', '/services/red-eye-treatment/': 'cut-lens-blank', '/services/flashes-floaters/': 'cut-lens-blank',
  '/services/contact-lens-exams/': 'cut-contact-lens', '/services/specialty-contacts/': 'cut-contact-lens', '/products/contact-lenses/orthokeratology-ortho-k/': 'cut-contact-lens',
  '/services/toric-contacts/': 'cut-contact-lens', '/services/gas-permeable-contacts/': 'cut-contact-lens', '/services/multifocal-contacts/': 'cut-contact-lens',
  '/services/same-day-contacts/': 'cut-contact-lens', '/services/childrens-contact-lenses/': 'cut-contact-lens', '/products/contact-lenses/': 'cut-contact-lens',
  '/products/': 'cut-eyeglasses-navy', '/products/varilux-lenses/': 'cut-eyeglasses-navy', '/products/avulux-migraine-lenses/': 'cut-eyeglasses-navy',
  '/products/stellest-lenses/': 'cut-eyeglasses-navy', '/products/kids-eyewear/': 'cut-eyeglasses-navy', '/products/sunglasses/': 'cut-sunglasses-aviator',
};
const NO_CUTOUT_KINDS = new Set(['legal', 'sitemap', 'form', 'bio', 'about', 'doctors', '404']);
/** kinds whose plain image blocks are all half-bleed Splits (DESIGN-SPEC 11.3-11.5, 11.8, 11.10); service and product
    pages alternate Split / Arch and give their first two list-bearing blocks the List split and Options (10.7, 10.10) */
const SPLIT_ONLY = new Set(['service-hub', 'product-hub', 'insurance', 'about', 'location']);
/** headings of people (bio H1s) take no accent: an italic break inside a name reads as a typo (deviation, BUILD-NOTES) */
const NO_ACCENT_KINDS = new Set(['bio', 'reviews', 'sitemap']);
/**
 * DESIGN-SPEC 13.4 object positions of the generated heroes ("70% 45%" by default). x = IMAGERY's focal point
 * (audit/generated-images.json images[].focal, read 2026-10-09). y: every hero with a person has the face in the top
 * 15-55 % of the frame (contact sheet tmp/theme-templates/shots/heroes-sheet.png); at the short operator windows the
 * full-bleed photo is cropped vertically and the floating header covers its top 74 px, so "45%" put the eyes at the
 * header edge (children's contact lenses at 1280x585). y 0% keeps the whole crop below the faces; object heroes keep
 * their focal y.
 */
const HERO_POS = {
  'hero-adult-eye-exams': '60% 0%', 'hero-senior-eye-exams': '65% 0%', 'hero-back-to-school-eye-exams': '63% 0%',
  'hero-childrens-contact-lenses': '66% 0%', 'hero-diabetic-eye-exams': '72% 0%', 'hero-macular-degeneration': '66% 0%',
  'hero-cataract-co-management': '58% 0%', 'hero-emergency-eye-care': '68% 0%', 'hero-pink-eye-conjunctivitis': '65% 0%',
  'hero-foreign-body-removal': '75% 0%', 'hero-red-eye-treatment': '70% 0%', 'hero-flashes-floaters': '62% 0%',
  'hero-multifocal-contacts': '47% 0%', 'hero-childrens-eye-care': '65% 0%',
  'hero-same-day-contacts': '66% 55%', 'hero-toric-contacts': '68% 55%', 'hero-gas-permeable-contacts': '70% 45%',
  'hero-designer-frames': '70% 45%', 'hero-sunglasses': '52% 55%', 'hero-kids-eyewear': '75% 50%', 'hero-eye-health': '72% 45%',
  'hero-glaucoma-management': '50% 0%',
};
const heroPosition = (slot) => HERO_POS[slot] || '70% 45%';
/**
 * A hero whose person is not in the right third (IMAGERY composition flag, BUILD-NOTES IMAGERY item 5): the multifocal
 * woman's face (about 47 % x, top quarter) sat under the glass panel and the floating header in the full variant
 * (captures at 1265x585, 1440x900, 1585x662). It uses the half variant (10.5: photo on the right 58vw, lens edge), which
 * puts the face right of the panel and below the header at every desktop size; DESIGN-SPEC 13.4 (no face covered)
 * outranks the 11.16 default. The centred sunglasses (an object, also flagged) stay full: the half crop cut the frame.
 * Glaucoma (INTEGRATOR 2026-10-09): the slot reuses Academy Vision's own stock photo photo-as-293097203 (image-plan
 * "reuse", OPEN-DECISIONS A7; a real photo, no AI label). Its patient fills the photo's left third and the instrument
 * screen showing the eye sits at 37-50 % x; in the full variant both sat under the glass panel at 1280x585 and
 * 1600x662 (captures tmp/integrate/shots/glaucoma-full/). The half variant shows the instrument, the eye on its screen
 * and the clinician's face (73-88 % x) right of the panel and below the header at 1280x585, 1600x662 and 390x844.
 */
const HALF_HEROES = new Set(['hero-multifocal-contacts', 'hero-glaucoma-management']);

/* ============================================================================================ title band + lede */
function titleCutout(page) {
  if (!page || NO_CUTOUT_KINDS.has(page.kind)) return null;
  const slot = CUTOUT_BY_PATH[page.path];
  if (!slot) return null;
  if (page.adopted && (page.adopted.sections || []).some((s) => s.layout === 'split' && s.imageSlot === slot)) return null;   /* 13.6: never the same object twice */
  return slot;
}
/** object-box aspect ratios of the cut-out slots (DESIGN-SPEC 6.3) */
const CUT_AR = { 'cut-eyeglasses-tortoise': 2.67, 'cut-eyeglasses-navy': 2.91, 'cut-sunglasses-navy': 2.41, 'cut-sunglasses-aviator': 2.43, 'cut-reading-glasses': 2.85, 'cut-contact-lens': 0.97, 'cut-trial-lens': 0.87, 'cut-lens-blank': 0.90 };
/**
 * DESIGN-SPEC 10.6 lede card (kit.ledeCard) in a wrapper of this role. When the title band carries a cut-out, a float
 * (.tpl-notch) at the card's top-right keeps the copy clear of the object that crosses the seam on tablets and phones
 * (R-18: no protrusion touches running text), so the card can keep straddling the seam.
 */
/** the object-box aspect kit.cutout measured (its inline --cut-ar), else the table value */
const arOf = (html, slot) => { const m = String(html || '').match(/--cut-ar:([0-9.]+)/); return m ? Number(m[1]) : CUT_AR[slot] || 1; };
const ledeCard = (pc, htmls, bandHtml = '') => {
  const list = (htmls || []).filter((h) => plain(h));
  if (!list.length) return '';
  const slot = titleCutout(pc.page);
  const notch = slot ? '<span class="tpl-notch" aria-hidden="true" style="--ar:' + arOf(bandHtml, slot) + '"></span>' : '';
  return '<div class="tpl-lede' + (slot ? ' tpl-lede--cut' : '') + '">' + pc.kit.ledeCard(notch + list.map((h) => rich(listClass(h, null), 'rich rich--lede')).join('')) + '</div>';
};
const bandCls = (page, cls) => [cls, titleCutout(page) ? 'tpl-cut' : ''].filter(Boolean).join(' ');

/* ============================================================================================ block analysis */
function analyse(block) {
  const nodes = block.nodes || [];
  const images = nodes.filter((n) => n.t === 'image' && n.variant !== 'mobile-only');
  const text = nodes.filter((n) => ['heading', 'html', 'button'].includes(n.t));
  const html = nodes.filter((n) => n.t === 'html' && n.hint !== 'kicker').map((n) => n.html).join('');
  const others = nodes.filter((n) => !['heading', 'html', 'button', 'image'].includes(n.t));
  const live = others.filter((n) => !(n.empty || ((n.t === 'list' || n.t === 'team') && Array.isArray(n.items) && !n.items.length && n.kind !== 'biography' && n.kind !== 'photo')));
  const lay = block.layout || {};
  let side = lay.imageSide || (lay.imageSides && lay.imageSides[0] && lay.imageSides[0].imageSide) || null;
  if (!side && images.length) side = nodes.indexOf(images[0]) < nodes.indexOf(text[0] || images[0]) ? 'left' : 'right';
  return {
    nodes, images, text, html, others, live, side: side || 'right',
    navy: !!(block.background && /^#0f2a4a$/i.test(block.background.color || '')),
    headingOnly: text.length > 0 && text.every((n) => n.t === 'heading' || (n.t === 'html' && n.hint === 'kicker')) && !images.length && !live.length,
    headings: text.filter((n) => n.t === 'heading').length,
    textLen: plain(html).length, paras: (html.match(/<p>/g) || []).length, lis: liCount(html), hasList: /<(ul|ol)>/.test(html),
    buttons: nodes.filter((n) => n.t === 'button'),
  };
}
const isCtaButton = (ctx, b) => b.href === ctx.site.booking.href || /^tel:/i.test(b.href);
const h1Index = (blocks) => blocks.findIndex((b) => (b.nodes || []).some((n) => n.t === 'heading' && n.level === 1));

/** title band (kit) + lede card from a model H1 block (DESIGN-SPEC 10.5 variant rules) */
function modelTitle(pc, block, { variant = null, aside = '', cta, compact = false, accent = true, after = '', cls = '' } = {}) {
  const { page, kit } = pc;
  const nodes = block ? block.nodes : [];
  const kick = nodes.filter((n) => n.t === 'html' && n.hint === 'kicker');
  const h1 = nodes.find((n) => n.t === 'heading' && n.level === 1);
  const htmls = nodes.filter((n) => n.t === 'html' && n.hint !== 'kicker');
  const btns = nodes.filter((n) => n.t === 'button');
  const img = nodes.find((n) => n.t === 'image');
  const v = variant || (img ? (img.w >= 1000 ? 'half' : 'postcard') : 'texture');
  const image = img && (v === 'half' || v === 'full') ? { ref: img.file, alt: img.alt, position: '50% 40%' }
    : img && v === 'postcard' ? { ref: img.file, alt: img.alt, width: Math.min(400, Math.round(img.w / 1.5)) } : undefined;
  const h1Html = h1 ? h1.html : esc(page.h1);
  const band = kit.titleBand(page, {
    variant: v, image, kicker: kick.map((k) => kit.unwrapP(k.html)).join(' ') || undefined, h1: h1Html,
    ...accentOpts(h1Html, accent && !NO_ACCENT_KINDS.has(page.kind)), cta: cta !== undefined ? cta : (btns.length ? btns : 'pair'), cutout: titleCutout(page),
    aside, after, compact, cls: bandCls(page, [cls, 'tpl-' + v, compact ? 'tpl-compact' : ''].filter(Boolean).join(' ')),
  });
  return { band, lede: ledeCard(pc, htmls.map((n) => n.html), band), used: new Set([...kick, ...(h1 ? [h1] : []), ...htmls, ...btns, ...(img ? [img] : [])]) };
}

/* ============================================================================================ the block resolver */
/**
 * DESIGN-SPEC 10.7-10.12 for every block after the title band: seam bands for dividers, heading-only blocks attach to
 * the next block, list / team blocks, image blocks (navy split, lens split, postcard split, List split, Options,
 * Split / Arch alternation), the closing CTA band, Statement or Reading. Returns { html, endsWithCta }.
 */
function renderBlocks(pc, blocks, from, { skipLeadingDivider = true } = {}) {
  const { page, ctx, kit } = pc;
  const plan = [];
  let lastContent = -1;
  for (let i = from; i < blocks.length; i++) if (blocks[i].cpt !== 'section-divider') lastContent = i;
  let carry = null;
  let lists = 0;
  for (let i = from; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.cpt === 'section-divider') { if (!(skipLeadingDivider && i === from)) plan.push({ i, kind: 'seam' }); continue; }
    const a = analyse(b);
    const extraHead = carry || [];
    carry = null;
    if (a.headingOnly && i < lastContent) { carry = a.text; continue; }
    const teamList = a.live.find((n) => n.t === 'team' && n.kind === 'list');
    const listNode = a.live.find((n) => n.t === 'list');
    if (teamList) { plan.push({ i, kind: 'team', a, extraHead }); continue; }
    if (listNode && !a.images.length) { plan.push({ i, kind: 'list', a, extraHead, listNode }); continue; }
    if (a.images.length) {
      const img = a.images[0];
      const flag = flagOf(ctx, img.file);
      if (a.navy) { plan.push({ i, kind: 'split', navy: true, a, img, extraHead }); continue; }
      if (img.w < 1000) { plan.push({ i, kind: Math.abs(img.w - img.h) / img.w < 0.1 ? 'lens' : 'postcard', a, img, extraHead }); continue; }
      if (a.lis >= 4 && !SPLIT_ONLY.has(page.kind) && lists < 2 && !(flag && flag.frame)) { plan.push({ i, kind: lists++ === 0 ? 'list-split' : 'options', a, img, extraHead }); continue; }
      plan.push({ i, kind: 'plain', force: flag && flag.frame === 'arch' ? 'arch' : flag && flag.frame === 'wide' ? 'split' : null, a, img, extraHead });
      continue;
    }
    if (i === lastContent && a.buttons.some((x) => isCtaButton(ctx, x)) && !a.live.length) { plan.push({ i, kind: 'cta', a, extraHead }); continue; }
    if (a.navy) { plan.push({ i, kind: 'navy-text', a, extraHead }); continue; }
    plan.push({ i, kind: a.textLen <= 700 && a.paras <= 2 && !a.hasList && a.headings <= 1 ? 'statement' : 'reading', a, extraHead });
  }
  /* Split / Arch alternation; a forced frame (flagged photo) fixes the parity of the whole sequence */
  const plains = plan.filter((p) => p.kind === 'plain');
  if (SPLIT_ONLY.has(page.kind)) plains.forEach((p) => { p.layout = p.force === 'arch' ? 'arch' : 'split'; });
  else {
    const k = plains.findIndex((p) => p.force === 'arch');
    let cur = k >= 0 ? (k % 2 === 0 ? 'arch' : 'split') : 'split';
    for (const p of plains) { p.layout = p.force || cur; cur = p.layout === 'split' ? 'arch' : 'split'; }
  }
  let out = '';
  let endsWithCta = false;
  for (const p of plan) {
    endsWithCta = false;
    const b = blocks[p.i];
    const a = p.a;
    const head = p.extraHead || [];
    const textList = [...head, ...(a ? a.text : [])];
    const rest = a ? a.live.filter((n) => !(n.t === 'team' && n.kind === 'list') && n !== p.listNode).map((n) => renderNode(pc, n)).join('') : '';
    const restHtml = rest ? kit.section({ cls: 'section--tight' }, rest) : '';
    switch (p.kind) {
      case 'seam': out += kit.seam(); break;
      case 'team': out += teamSection(pc, { ...b, nodes: [...head, ...b.nodes] }); break;
      case 'split': case 'lens': case 'postcard':
        out += splitSection(pc, b, { layout: p.kind, side: a.side, image: p.img, textNodesList: a.text, navy: !!p.navy, extraHead: head }) + restHtml; break;
      case 'plain': out += splitSection(pc, b, { layout: p.layout, side: a.side, image: p.img, textNodesList: a.text, extraHead: head }) + restHtml; break;
      case 'list-split': out += listSplitSection(pc, b, { image: p.img, textNodesList: textList }) + restHtml; break;
      case 'options': out += optionsSection(pc, b, { image: p.img, textNodesList: textList }) + restHtml; break;
      case 'cta': out += ctaBand(pc, { id: b.id, nodes: textList }); endsWithCta = true; break;
      case 'statement': out += statementSection(pc, { id: b.id, nodes: textList }) + restHtml; break;
      case 'reading': out += readingSection(pc, { id: b.id, nodes: textList }) + restHtml; break;
      case 'navy-text': out += navyText(pc, b, textList) + restHtml; break;
      case 'list': out += listSection(pc, b, p, textList) + restHtml; break;
      default: throw new Error('templates: unplanned block kind ' + p.kind);
    }
  }
  return { html: out, endsWithCta };
}
/** a text-only navy block: copy on a navy band */
function navyText(pc, b, textList) {
  const hid = 'h-' + b.id;
  const body = textNodes(pc, textList, { headingId: hid, surface: 'navy', htmlCls: 'rich rich--inv', listCls: null });
  return '<section class="section band--navy navy-text"' + (body.includes('id="' + hid + '"') ? ' aria-labelledby="' + hid + '"' : '') + '><div class="container"><div class="navy-text__inner"' + pc.kit.reveal('up') + '>' + body + '</div></div></section>';
}
/** list blocks: child pages (cards), insurance / frames (chips), contact-lens products */
function listSection(pc, b, p, textList) {
  const { kit } = pc;
  const n = p.listNode;
  const a = p.a;
  const hid = textList.some((x) => x.t === 'heading') ? 'h-' + b.id : null;
  const navy = a.navy && n.kind === 'childpages';
  const head = textList.length ? textNodes(pc, textList, { headingId: hid, surface: navy ? 'navy' : 'light' }) : '';
  const headBox = (cls) => (head ? '<div class="' + cls + '"' + kit.reveal('up') + '>' + head + '</div>' : '');
  const lab = hid ? ' aria-labelledby="' + hid + '"' : '';
  if (n.kind === 'childpages') {
    return '<section class="section cards-band ' + (navy ? 'band--navy cards-band--navy tpl-pool' : 'band--seaglass') + '"' + lab + '><div class="container">' + headBox('cards-band__head') + childCards(pc, n) + '</div></section>';
  }
  if (n.kind === 'insurance') {
    return '<section class="section ins-band"' + lab + '>' + kit.texture('tex-cream-light', { cls: 'ins-band__tex' })
      + '<div class="container"><div class="ins-band__panel glass glass--tint"' + kit.reveal('up') + '>' + headBox('ins-band__head') + logoChips(pc, n) + '</div></div></section>';
  }
  if (n.kind === 'frames') return '<section class="section chips-band band--seaglass"' + lab + '><div class="container">' + headBox('chips-band__head') + logoChips(pc, n) + '</div></section>';
  if (n.kind === 'contact-lenses') return '<section class="section lens-band tpl-pool"' + lab + '>' + texturePlane(pc) + '<div class="container">' + headBox('lens-band__head') + lensProducts(pc, n) + '</div></section>';
  return '<section class="section"' + lab + '><div class="container">' + head + renderNode(pc, n) + '</div></section>';
}

/* ============================================================================================ related (10.29) */
const RELATED_CACHE = new WeakMap();
/** href -> {excerpt, image} from every page's pipeline-built related items (the pipeline's visible-copy excerpts) */
function relatedIndex(ctx) {
  if (RELATED_CACHE.has(ctx)) return RELATED_CACHE.get(ctx);
  const m = new Map();
  for (const pg of Object.values(ctx.pagesByPath || {})) for (const r of pg.related || []) if (!m.has(r.href)) m.set(r.href, r);
  RELATED_CACHE.set(ctx, m);
  return m;
}
export function navLabel(ctx, href) {
  let found = null;
  const walk = (items) => { for (const it of items || []) { if (found) return; if (it.href === href) { found = it.label; return; } walk(it.children); } };
  walk(ctx.nav);
  if (found) return found;
  for (const c of ctx.footer || []) for (const l of c.links || []) if (l.href === href) return l.label;
  const pg = (ctx.pagesByPath || {})[href];
  return pg ? pg.h1 : href;
}
/** page.related (nav siblings), led on adopted pages by the page's own related list (DESIGN-SPEC 11.16 item 5) */
function relatedItems(page, ctx) {
  const idx = relatedIndex(ctx);
  const out = [];
  const seen = new Set([page.path]);
  const add = (href, base) => {
    if (seen.has(href) || !(ctx.pagesByPath || {})[href]) return;
    seen.add(href);
    const known = base || idx.get(href) || {};
    out.push({ label: base ? base.label : navLabel(ctx, href), href, excerpt: known.excerpt || null, image: known.image || null });
  };
  if (page.adopted && Array.isArray(page.adopted.related)) for (const r of page.adopted.related) add('/' + String(r).replace(/^\/+|\/+$/g, '') + '/', null);
  for (const r of page.related || []) add(r.href, r);
  return out.slice(0, 6);
}
function relatedHead(pc, hid) {
  const { page, ctx, kit } = pc;
  const fromModel = (path) => {
    const pg = (ctx.pagesByPath || {})[path];
    const blk = pg && pg.model ? pg.model.blocks.find((b) => b.nodes.some((n) => n.t === 'list' && n.kind === 'childpages')) : null;
    return blk ? { kicker: blk.nodes.find((n) => n.t === 'html' && n.hint === 'kicker'), heading: blk.nodes.find((n) => n.t === 'heading') } : null;
  };
  let src = null;
  if (page.section === 'services' && page.path !== '/services/') src = fromModel('/services/');
  if (page.section === 'eyewear' && page.path !== '/products/') src = fromModel('/products/');
  if (src && src.heading) return (src.kicker ? kit.eyebrow(src.kicker.html) : '') + kit.heading(src.heading.html, { level: 2, cls: 'h2', id: hid, ...accentOpts(src.heading.html) });
  const top = { services: '/services/', eyewear: '/products/', about: '/about-us/', visit: '/eye-doctor-pine-beach/', reviews: '/reviews/', insurance: '/insurance/' }[page.section];
  return top ? kit.heading(esc(navLabel(ctx, top)), { level: 2, cls: 'h2', id: hid, accent: false }) : '';
}
function relatedSection(pc) {
  const { page, ctx, kit } = pc;
  const items = relatedItems(page, ctx);
  if (!items.length) return '';
  const hid = 'h-related';
  const head = relatedHead(pc, hid);
  const cards = items.map((r) => {
    const isSlot = r.image && !/[/.]/.test(r.image);
    const m = r.image && !isSlot ? masterOf(ctx, r.image) : null;
    const sz = r.image && !isSlot ? ctx.imgSize(r.image) : null;
    if (r.image && !isSlot && ((m && m.realPerson) || (sz && sz.w < 600))) {
      /* doctor portraits (223-300 px sources) stay small (BUILD-CONTRACT 4.10): a portrait card in the kit's card look */
      return '<li class="card glass glass--strong card--portrait"' + kit.reveal('up') + '><div class="card__media card__media--portrait">' + kit.picture(r.image, { alt: '', frame: 'portrait', widths: [150, 300], sizes: '150px', width: 150 }) + '</div>'
        + '<div class="card__body"><h3 class="card__title"><a class="stretched" href="' + esc(r.href) + '">' + esc(r.label) + '&nbsp;<span class="arrow" aria-hidden="true">»</span></a></h3>' + (r.excerpt ? '<p class="card__text">' + esc(r.excerpt) + '</p>' : '') + '</div></li>';
    }
    const image = r.image && (!isSlot || slotExists(ctx, r.image)) ? r.image : null;
    return kit.card({ href: r.href, title: r.label, excerpt: r.excerpt || undefined, image, alt: '' }, { level: 3 });
  }).join('');
  return '<section class="section related band--seaglass"' + (head ? ' aria-labelledby="' + hid + '"' : '') + '><div class="container">'
    + (head ? '<div class="related__head"' + kit.reveal('up') + '>' + head + '</div>' : '') + '<ul class="card-grid card-grid--related"' + kit.stagger() + '>' + cards + '</ul></div></section>';
}

/* ============================================================================================ page templates */
function modelPage(pc) {
  const { page, kit } = pc;
  const blocks = page.model.blocks;
  const hi = Math.max(0, h1Index(blocks));
  const t = modelTitle(pc, blocks[hi]);
  const leftovers = blocks[hi].nodes.filter((n) => !t.used.has(n)).map((n) => renderNode(pc, n)).join('');
  const before = hi > 0 ? renderBlocks(pc, blocks.slice(0, hi), 0, { skipLeadingDivider: false }).html : '';
  const body = renderBlocks(pc, blocks, hi + 1);
  const strip = body.endsWithCta || page.kind === 'service-hub' ? '' : kit.ctaStrip();
  return t.band + t.lede + before + (leftovers ? kit.section({ cls: 'section--tight' }, leftovers) : '') + body.html + strip + relatedSection(pc);
}

/** DESIGN-SPEC 10.15 doctor bio: texture band with the portrait breaking out of the panel; biography in a veil panel */
function bioPage(pc) {
  const { page, kit } = pc;
  const blocks = page.model.blocks;
  const b = blocks[Math.max(0, h1Index(blocks))];
  const photo = b.nodes.find((n) => n.t === 'team' && n.kind === 'photo');
  const aside = photo ? '<div class="tb-portrait">' + kit.picture(photo.image.file, { alt: photo.image.alt, frame: 'portrait', widths: [150, 300], sizes: '150px', width: 150, loading: 'eager' }) + '</div>' : '';
  const t = modelTitle(pc, b, { variant: 'texture', after: aside, cls: 'title-band--bio' });
  let body = '';
  for (const n of b.nodes) {
    if (t.used.has(n) || n === photo) continue;
    if (n.t === 'team' && n.kind === 'biography') body += readingSection(pc, { id: b.id + '-bio', htmlList: [n.html], listCls: 'chip-list', cls: 'reading--bio' });
    else body += renderNode(pc, n);   /* empty positions / languages / highlights render nothing */
  }
  for (const other of blocks) if (other !== b) body += renderBlocks(pc, [other], 0, { skipLeadingDivider: false }).html;
  return t.band + t.lede + body + kit.ctaStrip() + relatedSection(pc);
}

/** DESIGN-SPEC 11.8 town page: block 2 (H1) first as the title band with the location card; hours + map; the mural */
function locationPage(pc) {
  const { page, ctx, kit } = pc;
  const blocks = page.model.blocks;
  const hi = h1Index(blocks);
  const infoIdx = blocks.findIndex((b) => b.nodes.some((n) => n.t === 'location'));
  const info = infoIdx >= 0 ? blocks[infoIdx] : null;
  const nameNode = info ? info.nodes.find((n) => n.t === 'heading') : null;
  const summary = info ? info.nodes.find((n) => n.t === 'location' && (n.show || []).some((s) => ['phone', 'address', 'name'].includes(s))) : null;
  const hours = info ? info.nodes.find((n) => n.t === 'location' && (n.show || []).includes('hours')) : null;
  const map = info ? info.nodes.find((n) => n.t === 'location' && (n.show || []).includes('map')) : null;
  const card = summary ? '<div class="container town-straddle__loc"><div class="tb-loc">' + locationCard(pc, summary, { labelHtml: nameNode ? nameNode.html : null }) + '</div></div>' : '';
  const t = modelTitle(pc, blocks[hi], { variant: 'texture', cls: 'title-band--town' });
  const used = new Set([nameNode, summary, hours, map].filter(Boolean));
  const extra = info ? info.nodes.filter((n) => !used.has(n)).map((n) => renderNode(pc, n)).join('') : '';
  let rest = '';
  blocks.forEach((b, i) => {
    if (i === hi || i === infoIdx || b.cpt === 'section-divider') return;
    const a = analyse(b);
    const img = a.images[0];
    if (img && img.w < 1000) {
      /* DESIGN-SPEC 13.5: photo-2020-04-06 is the 600 px copy of practice-35050-f516a054; render the 800 px master
         with this block's own alt */
      const m = masterOf(ctx, img.file);
      const better = m && m.id === 'photo-2020-04-06' ? (ctx.imageMasters || []).find((x) => x.id === 'practice-35050-f516a054') : null;
      const image = better ? { ...img, file: better.file, w: better.w, h: better.h } : img;
      rest += splitSection(pc, b, { layout: 'postcard', side: a.side, image, textNodesList: a.text });
    } else rest += renderBlocks(pc, [b], 0, { skipLeadingDivider: false }).html;
  });
  return t.band + '<div class="town-straddle">' + t.lede + card + '</div>' + visitBand(pc, { hours, map }) + (extra ? kit.section({ cls: 'section--tight' }, extra) : '') + rest + kit.ctaStrip() + relatedSection(pc);
}

/** DESIGN-SPEC 11.9 reviews: full band (lens still), stars, Book; the carousel; practice photos; map; CTA strip */
function reviewsPage(pc) {
  const { page, ctx, kit } = pc;
  const blocks = page.model.blocks;
  const b = blocks[Math.max(0, h1Index(blocks))];
  const h1 = b.nodes.find((n) => n.t === 'heading' && n.level === 1);
  const reviews = b.nodes.find((n) => n.t === 'reviews');
  const photos = b.nodes.find((n) => n.t === 'list' && n.kind === 'photos');
  const map = b.nodes.find((n) => n.t === 'location' && (n.show || []).includes('map'));
  const summary = b.nodes.find((n) => n.t === 'location' && (n.show || []).some((s) => ['phone', 'address', 'name'].includes(s)));
  const hours = b.nodes.find((n) => n.t === 'location' && (n.show || []).includes('hours'));
  const divider = b.nodes.find((n) => n.t === 'divider');
  const slot = 'still-loop-lens-light';
  const full = slotExists(ctx, slot);
  const band = kit.titleBand(page, {
    variant: full ? 'full' : 'texture', image: full ? { ref: slot, position: '66% 40%' } : undefined, h1: h1 ? h1.html : esc(page.h1), accent: false,
    cta: [kit.book], after: reviews && reviews.items[0] ? '<p class="tb-stars">' + kit.stars(reviews.items[0].ratingLabel) + '</p>' : '', cls: 'title-band--reviews',
  });
  const label = navLabel(ctx, '/reviews/');
  let out = band;
  if (reviews) out += kit.section({ cls: 'reviews-band tpl-pool' }, texturePlane(pc) + reviewsCarousel(pc, reviews, { label }));
  if (photos) out += kit.section({ cls: 'photos-band' }, practicePhotos(pc, photos));
  if (divider) out += '<div class="container">' + renderNode(pc, divider) + '</div>';
  out += visitBand(pc, { summary, labelHtml: null, hours, map });
  const used = new Set([h1, reviews, photos, map, summary, hours, divider].filter(Boolean));
  const extra = b.nodes.filter((n) => !used.has(n)).map((n) => renderNode(pc, n)).join('');
  if (extra) out += kit.section({ cls: 'section--tight' }, extra);
  for (const other of blocks) if (other !== b) out += renderBlocks(pc, [other], 0, { skipLeadingDivider: false }).html;
  return out + kit.ctaStrip() + relatedSection(pc);
}

/** a single-block page (form, legal, sitemap): texture band, then the block's own node in a panel */
function singleBlockPage(pc, { compact, cta, panel, sectionCls, strip = true, related = true, accent = true, bandCls: extraBand = '' }) {
  const { page, kit } = pc;
  const blocks = page.model.blocks;
  const b = blocks[Math.max(0, h1Index(blocks))];
  const t = modelTitle(pc, b, { variant: 'texture', compact, cta, accent, cls: extraBand });
  const body = b.nodes.filter((n) => !t.used.has(n)).map((n) => panel(n)).join('');
  let more = '';
  for (const other of blocks) if (other !== b) more += renderBlocks(pc, [other], 0, { skipLeadingDivider: false }).html;
  return t.band + t.lede + kit.section({ cls: sectionCls }, body) + more + (strip ? kit.ctaStrip() : '') + (related ? relatedSection(pc) : '');
}
/** DESIGN-SPEC 10.23 forms: texture band (with Book + Call), the form in a veil panel */
const formPage = (pc) => singleBlockPage(pc, { compact: false, cta: 'pair', bandCls: 'tpl-form', sectionCls: 'form-section tpl-pool', strip: false, panel: (n) => (n.t === 'form' ? '<div class="form-panel glass glass--veil">' + form(pc, n) + '</div>' : renderNode(pc, n)) });
/** DESIGN-SPEC 10.24 legal: compact texture band without a CTA row; the policy in a veil reading panel (76ch) */
const legalPage = (pc) => singleBlockPage(pc, { compact: true, cta: false, sectionCls: 'reading reading--legal tpl-pool', panel: (n) => (n.t === 'legal' ? '<div class="reading__panel reading__panel--legal glass glass--veil">' + renderNode(pc, n) + '</div>' : renderNode(pc, n)) });
/** DESIGN-SPEC 10.25 sitemap: compact texture band; one glass card per group */
const sitemapPage = (pc) => singleBlockPage(pc, { compact: true, cta: false, sectionCls: 'sitemap-section tpl-pool', related: false, panel: (n) => (n.t === 'list' && n.kind === 'sitemap' ? texturePlane(pc) : '') + renderNode(pc, n) });

/** DESIGN-SPEC 10.22 article: half band with the article photo, H1 = the BlogPosting headline, body in a veil panel */
function articlePage(pc) {
  const { page, kit } = pc;
  const blocks = page.model.blocks;
  const b = blocks[0];
  const img = b.nodes.find((n) => n.t === 'image');
  const band = kit.titleBand(page, { variant: img && img.w >= 1000 ? 'half' : 'texture', image: img ? { ref: img.file, alt: img.alt, position: '50% 40%' } : undefined, h1: esc(page.h1), ...accentOpts(esc(page.h1)), cta: 'pair' });
  let body = '';
  for (const n of b.nodes) {
    if (n === img) continue;
    if (n.t === 'html') body += '<section class="section reading reading--article tpl-pool"><div class="container"><article class="reading__panel glass glass--veil">' + rich(listClass(n.html, null), 'rich rich--reading rich--article') + '</article></div></section>';
    else body += kit.section({ cls: 'section--tight' }, renderNode(pc, n));
  }
  for (const other of blocks.slice(1)) body += renderBlocks(pc, [other], 0, { skipLeadingDivider: false }).html;
  return band + body + kit.ctaStrip() + relatedSection(pc);
}

/* ---------------------------------------------------------------------------------------------- adopted */
/** DESIGN-SPEC 11.16: one adopted section by layout */
function adoptedSection(pc, s, i) {
  const { ctx, kit } = pc;
  const key = String(s.id || 's' + (i + 1));
  const id = 'a-' + key;
  const hid = 'h-' + id;
  const headingHtml = esc(s.heading);
  const len = plain(s.html).length, paras = (s.html.match(/<p>/g) || []).length, lis = liCount(s.html), list = /<(ul|ol)>/.test(s.html);
  const statementOK = len <= 700 && paras <= 2 && !list;
  const layout = s.layout || 'text';
  if (layout === 'list' && lis > 3) {
    return '<section class="section list-band band--seaglass" id="' + esc(key) + '" aria-labelledby="' + hid + '"><div class="container"><div class="list-band__inner"' + kit.reveal('up') + '>'
      + kit.heading(headingHtml, { level: 2, cls: 'h2', id: hid, ...accentOpts(headingHtml) }) + rich(listClass(s.html, 'chip-list' + (lis > 8 ? ' chip-list--3' : '')), 'rich rich--list') + '</div></div></section>';
  }
  if (layout === 'split' && s.imageSlot && slotExists(ctx, s.imageSlot)) {
    const cut = kit.cutout(s.imageSlot, { cls: 'ad-split__cutout', depth: -0.14, depthMax: 44, depthFrom: 900, rotate: 8, sizes: '(min-width: 1024px) 26vw, 46vw' });
    return '<section class="section ad-split" id="' + esc(key) + '" aria-labelledby="' + hid + '" style="--ar:' + arOf(cut, s.imageSlot) + '"><div class="ad-split__band" aria-hidden="true"></div><div class="container ad-split__inner">'
      + '<div class="ad-split__panel glass glass--strong"' + kit.reveal('up') + '>' + kit.heading(headingHtml, { level: 2, cls: 'h2', id: hid, ...accentOpts(headingHtml) }) + rich(listClass(s.html, null), 'rich') + '</div>'
      + cut + '</div></section>';
  }
  if (layout === 'callout') {
    return '<section class="section callout" id="' + esc(key) + '" aria-labelledby="' + hid + '"><div class="container"><div class="callout__wrap"' + kit.reveal('up') + '>'
      + kit.texture('tex-navy-glass', { cls: 'callout__tex' }) + '<div class="callout__panel glass glass--navy">' + kit.heading(headingHtml, { level: 2, cls: 'h2 callout__title', id: hid, ...accentOpts(headingHtml) })
      + rich(listClass(s.html, null), 'rich rich--inv') + '</div></div></div></section>';
  }
  if (statementOK) return statementSection(pc, { id, headingHtml, htmlList: [s.html], domId: key });
  return readingSection(pc, { id, headingHtml, htmlList: [s.html], listCls: layout === 'list' ? 'chip-list' : null, domId: key });
}
/** DESIGN-SPEC 11.16 FAQ accordion: native <details> (closed by default, answers stay in the DOM) */
function faqSection(pc, faq) {
  if (!faq || !faq.length) return '';
  const { kit } = pc;
  return '<div class="section faq tpl-pool"><div class="container"><div class="faq__list" data-accordion>' + faq.map((f, i) => '<details class="faq__item glass" id="faq-' + (i + 1) + '">'
    + '<summary class="faq__q"><span class="faq__q-text">' + esc(f.q) + '</span>' + kit.icon('chev', 'faq__chev') + '</summary>'
    + '<div class="faq__a rich">' + listClass(f.a, null) + '</div></details>').join('') + '</div></div></div>';
}
/** the eye-health hub's featured guide: the article teaser quoted from the home page's article list (DESIGN-SPEC 11.15) */
function featuredGuide(pc) {
  const { ctx, kit } = pc;
  const home = (ctx.pagesByPath || {})['/'];
  if (!home || !home.model) return '';
  for (const b of home.model.blocks) {
    const list = b.nodes.find((n) => n.t === 'list' && n.kind === 'articles' && n.items && n.items.length);
    if (!list) continue;
    const photo = b.nodes.find((n) => n.t === 'image');
    return kit.section({ cls: 'guide tpl-pool' }, texturePlane(pc) + kit.postCard(list.items[0], { image: photo ? photo.file : undefined, alt: photo ? photo.alt : undefined, level: 2 }));
  }
  return '';
}
function adoptedPage(pc) {
  const { page, ctx, kit } = pc;
  const a = page.adopted;
  const hero = page.generated && page.generated.hero;
  const full = slotExists(ctx, hero);
  const isTerms = page.path === '/terms/';
  const band = kit.titleBand(page, {
    variant: !full ? 'texture' : HALF_HEROES.has(hero) ? 'half' : 'full', image: full ? { ref: hero, position: heroPosition(hero) } : undefined, kicker: a.kicker ? esc(a.kicker) : undefined,
    h1: esc(a.h1), ...accentOpts(esc(a.h1)), cta: isTerms ? false : 'pair', cutout: titleCutout(page), cls: bandCls(page, ''),
  });
  let out = band + ledeCard(pc, [a.lede], band);
  if (page.kind === 'eye-health') out += featuredGuide(pc);
  (a.sections || []).forEach((s, i) => { out += adoptedSection(pc, s, i); });
  out += faqSection(pc, a.faq);
  out += a.cta ? ctaBand(pc, { id: 'cta', headingHtml: esc(a.cta.heading), htmlList: [a.cta.html], buttons: [kit.book, kit.call] }) : kit.ctaStrip();
  return out + relatedSection(pc);
}

/* ============================================================================================ exports */
export function renderMain(page, ctx, kit) {
  const pc = pageContext(page, ctx, kit);
  switch (page.kind) {
    case 'bio': return bioPage(pc);
    case 'location': return locationPage(pc);
    case 'reviews': return reviewsPage(pc);
    case 'form': return formPage(pc);
    case 'legal': return legalPage(pc);
    case 'sitemap': return sitemapPage(pc);
    case 'article': return articlePage(pc);
    case 'eye-health': case 'adopted': return adoptedPage(pc);
    default: return page.model ? modelPage(pc) : adoptedPage(pc);
  }
}

/** DESIGN-SPEC 11.17: texture band, H1 "Page not found" (declared UI string, O10; accent on "not found" by 10.1 rule 2,
    restored by the INTEGRATOR 2026-10-09: no reason for the earlier no-accent exception was recorded), the five Services group heads as
    glass link tiles, the CTA strip. Root-absolute URLs only (404.html is served at any depth). */
export function render404Main(ctx, kit) {
  const pg = Object.freeze({ kind: '404', path: null, section: 'none', h1: 'Page not found', breadcrumbs: [], generated: {}, related: [] });
  const pc = pageContext(pg, ctx, kit);
  const k = pc.kit;
  const svc = (ctx.nav || []).find((n) => (n.children || []).some((g) => g.group === true));
  const groups = svc ? svc.children.filter((g) => g.group === true) : [];
  return k.titleBand(pg, { variant: 'texture', compact: true })
    + (groups.length ? k.section({ cls: 'nf-tiles tpl-pool', label: svc.label }, k.cardGrid(groups.map((g) => ({ href: g.href, title: g.label })), { cls: 'card-grid--tiles', level: 2 })) : '')
    + k.ctaStrip();
}

/** extra <body> classes: the template name (contract A, optional) */
export function bodyClass(page) { return 'tpl-' + String(page.kind || 'page'); }
