// pages.mjs - one page object per source page and per adopted page (PIPELINE role, BUILD-CONTRACT 3.2).
// page = { kind, path, sourcePath, slug, title, metaDescription, canonical, og, jsonLd, h1, breadcrumbs, section,
//          model, adopted, related, generated }   (+ additive: h1InModel, robots, verification)
// The model handed to the theme is src/content/pages/<slug>.json with EVERY internal href remapped (node href keys,
// a[href] inside every html string, list items, child pages, the sitemap, team links, card data-link targets), plus
// the declared edits below. Nothing else in the model changes.
import fs from 'node:fs';
import path from 'node:path';
import { remapHtmlHrefs } from './remap.mjs';
import { ownPath, servedPath } from './util.mjs';

/* ---------------------------------------------------------------------------------------------- declared edits */
/** BUILD-CONTRACT 4.7: the comic-book illustration is removed (third-party character, rights unverified). */
export const REMOVED_IMAGE_MASTERS = ['practice-35053-c2274987'];
/** BUILD-CONTRACT 4.3: visible text and JSON-LD use (732) 978-9306; the source prints (732) 736-1700 on two buttons of
    /eye-care-services/ and in the /sitemap/ meta description (C1, open with the practice). */
export const PHONE_EDIT = { from: '(732) 736-1700', to: '(732) 978-9306', hrefFrom: 'tel:+17327361700', hrefTo: 'tel:+17329789306' };
/** expected phone edits in page models (slug -> string replacements); a different count fails the build */
export const EXPECTED_MODEL_PHONE_EDITS = { 'eye-care-services': 4 };
/** BUILD-CONTRACT 4.5 / 4.7: forms post nowhere; the platform endpoint, captcha and platform hidden inputs are dropped */
export const FORM_KEEP_HIDDEN = new Set(['identifier']);

/* ---------------------------------------------------------------------------------------------- kinds / sections */
export const KIND_BY_SLUG = {
  index: 'home',
  'about-us': 'about',
  'our-eye-doctor': 'doctors',
  'team-dr-anthony-giallombardo-od': 'bio',
  'team-dr-marc-ullman-od': 'bio',
  'team-dr-tyler-lesko-od': 'bio',
  'hours-location': 'location',
  'location-academy-vision': 'reviews',
  insurance: 'insurance',
  'appointment-request-form': 'form',
  'patient-registration-form': 'form',
  'privacy-policy': 'legal',
  disclaimer: 'legal',
  'website-accessibility-policy': 'legal',
  sitemap: 'sitemap',
  'article-pediatric-eye-exams-beyond-school-screenings': 'article',
  'eye-care-services': 'service-hub',
  'eye-care-services-comprehensive-eye-exams': 'service',
  'eye-care-services-dry-eye-treatment': 'service',
  'eye-care-services-eye-disease-management': 'service',
  'eye-care-services-lasik-co-management': 'service',
  'eye-care-services-myopia-management': 'service',
  'eye-care-services-pediatric-eye-care': 'service',
  'contact-lenses-contact-lenses-exams': 'service',
  'contact-lenses-scleral-lenses': 'service',
  eyeglasses: 'product-hub',
  'contact-lenses': 'product',
  'contact-lenses-orthokeratology-ortho-k': 'product',
  'eyeglasses-avulux-migraine-lenses': 'product',
  'eyeglasses-stellest-lenses': 'product',
  'eyeglasses-varilux-lenses': 'product',
};
export const SECTION_LANDING = { home: '/', about: '/about-us/', services: '/services/', eyewear: '/products/', insurance: '/insurance/', reviews: '/reviews/', visit: '/eye-doctor-pine-beach/', legal: null };
export function sectionOf(p) {
  if (p === '/') return 'home';
  if (p.startsWith('/services/')) return 'services';
  if (p.startsWith('/products/')) return 'eyewear';
  if (/^\/(about-us|our-doctors|eye-health)\//.test(p)) return 'about';
  if (p === '/insurance/') return 'insurance';
  if (p === '/reviews/') return 'reviews';
  if (/^\/(eye-doctor-pine-beach|patient-forms|appointment-request-form)\/$/.test(p)) return 'visit';
  if (/^\/(privacy-policy|disclaimer|accessibility|terms|sitemap)\/$/.test(p)) return 'legal';
  return null;
}

/* ---------------------------------------------------------------------------------------------- node types */
export const KNOWN_NODES = {
  heading: null, html: null, image: null, button: null, form: null, location: null, reviews: null, divider: null,
  team: new Set(['list', 'biography', 'photo', 'positions', 'languages', 'highlights']),
  list: new Set(['insurance', 'frames', 'contact-lenses', 'equipment', 'articles', 'childpages', 'sitemap', 'photos']),
  legal: new Set(['privacy-policy', 'disclaimer', 'website-accessibility-policy']),
};
export function unknownNodes(model) {
  const bad = [];
  for (const b of model.blocks || []) for (const n of b.nodes || []) {
    if (!Object.hasOwn(KNOWN_NODES, n.t)) bad.push(n.t + ' (' + n.id + ')');
    else if (KNOWN_NODES[n.t] && !KNOWN_NODES[n.t].has(n.kind)) bad.push(n.t + ':' + n.kind + ' (' + n.id + ')');
  }
  return bad;
}

/* ---------------------------------------------------------------------------------------------- adopted pages */
const ADOPTED_TAGS = new Set(['p', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a']);
export const adoptedFile = (own) => own.replace(/\//g, '__') + '.json';

function htmlProblems(html, where) {
  const out = [];
  for (const m of String(html).matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g)) {
    const tag = m[1].toLowerCase();
    if (!ADOPTED_TAGS.has(tag)) { out.push(where + ': tag <' + tag + '> not allowed'); continue; }
    const attrs = m[2].trim();
    if (m[0].startsWith('</')) continue;
    if (tag === 'a') { if (!/^href\s*=\s*"[^"]*"$/.test(attrs)) out.push(where + ': <a> must carry exactly one href attribute: ' + m[0]); }
    else if (attrs) out.push(where + ': <' + tag + '> must not carry attributes: ' + m[0]);
  }
  return out;
}
export const hrefsIn = (html) => [...String(html).matchAll(/\shref\s*=\s*"([^"]*)"/gi)].map((m) => m[1].replace(/&amp;/g, '&'));

/** validate one adopted JSON against BUILD-CONTRACT 3.3 (link targets are checked later, once every page exists) */
export function validateAdopted(j, own) {
  const errs = [];
  const at = 'adopted/' + adoptedFile(own);
  if (!j || typeof j !== 'object') return [at + ': not an object'];
  if (j.schema !== 'academyvision/adopted@1') errs.push(at + ': schema must be academyvision/adopted@1');
  if (j.path !== own) errs.push(at + ': path "' + j.path + '" != "' + own + '"');
  for (const k of ['title', 'metaDescription', 'h1']) if (typeof j[k] !== 'string' || !j[k].trim()) errs.push(at + ': ' + k + ' missing');
  if (!Array.isArray(j.sections)) errs.push(at + ': sections must be an array');
  const html = [];
  if (typeof j.lede === 'string') html.push(['lede', j.lede]);
  for (const [i, s] of (j.sections || []).entries()) {
    if (!s || typeof s !== 'object') { errs.push(at + ': sections[' + i + '] not an object'); continue; }
    if (typeof s.heading !== 'string' || !s.heading.trim()) errs.push(at + ': sections[' + i + '].heading missing');
    if (typeof s.html !== 'string') errs.push(at + ': sections[' + i + '].html missing');
    else html.push(['sections[' + i + '].html', s.html]);
    if (s.layout !== undefined && !['text', 'split', 'callout', 'list', 'faq'].includes(s.layout)) errs.push(at + ': sections[' + i + '].layout "' + s.layout + '"');
    if (s.imageSlot !== undefined && s.imageSlot !== null && typeof s.imageSlot !== 'string') errs.push(at + ': sections[' + i + '].imageSlot must be a string or null');
  }
  if (j.faq !== undefined && !Array.isArray(j.faq)) errs.push(at + ': faq must be an array');
  for (const [i, f] of (j.faq || []).entries()) {
    if (!f || typeof f.q !== 'string' || typeof f.a !== 'string') { errs.push(at + ': faq[' + i + '] needs q and a'); continue; }
    html.push(['faq[' + i + '].a', f.a]);
  }
  if (j.cta) { if (typeof j.cta.heading !== 'string' || typeof j.cta.html !== 'string') errs.push(at + ': cta needs heading and html'); else html.push(['cta.html', j.cta.html]); }
  if (j.related !== undefined && !Array.isArray(j.related)) errs.push(at + ': related must be an array');
  for (const [where, h] of html) errs.push(...htmlProblems(h, at + ' ' + where));
  return errs;
}

/* ---------------------------------------------------------------------------------------------- model edits */
function walkStrings(v, fn, key = null) {
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { if (typeof v[i] === 'string') v[i] = fn(v[i], key); else walkStrings(v[i], fn, key); } return; }
  if (v && typeof v === 'object') for (const k of Object.keys(v)) { if (typeof v[k] === 'string') v[k] = fn(v[k], k); else walkStrings(v[k], fn, k); }
}

/** remap every internal href of a model's blocks; returns the number of hrefs changed */
export function remapModelHrefs(blocks, url) {
  const counter = { n: 0 };
  walkStrings(blocks, (s, key) => {
    if (key === 'href' || key === 'dataLink' || key === 'link') { const n = url(s); if (n !== s) counter.n++; return n; }
    if (/\shref\s*=/i.test(s)) return remapHtmlHrefs(s, url, counter);
    return s;
  });
  return counter.n;
}

function applyPhoneEdit(blocks) {
  let n = 0;
  walkStrings(blocks, (s) => {
    let t = s;
    if (t.includes(PHONE_EDIT.from)) { n += t.split(PHONE_EDIT.from).length - 1; t = t.split(PHONE_EDIT.from).join(PHONE_EDIT.to); }
    if (t.includes(PHONE_EDIT.hrefFrom)) { n += t.split(PHONE_EDIT.hrefFrom).length - 1; t = t.split(PHONE_EDIT.hrefFrom).join(PHONE_EDIT.hrefTo); }
    return t;
  });
  return n;
}

/** drop every image reference to a removed file: list items, image nodes, block backgrounds */
function removeImages(blocks, removedFiles) {
  let n = 0;
  const isRemoved = (o) => o && typeof o === 'object' && typeof o.file === 'string' && removedFiles.has(o.file);
  const prune = (v) => {
    if (Array.isArray(v)) {
      for (let i = v.length - 1; i >= 0; i--) {
        const x = v[i];
        if (isRemoved(x) || (x && typeof x === 'object' && (isRemoved(x.image) || isRemoved(x.photo) || isRemoved(x.logo)))) { v.splice(i, 1); n++; } else prune(x);
      }
    } else if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) { if (isRemoved(v[k])) { delete v[k]; n++; } else prune(v[k]); }
    }
  };
  prune(blocks);
  return n;
}

function neutraliseForms(blocks) {
  let n = 0;
  for (const b of blocks) for (const node of b.nodes) {
    if (node.t !== 'form') continue;
    node.action = { attribute: null, method: 'post', novalidate: true, unwired: true };
    const before = (node.hidden || []).length;
    node.hidden = (node.hidden || []).filter((h) => FORM_KEEP_HIDDEN.has(h.name));
    n += before - node.hidden.length;
  }
  return n;
}

/* ---------------------------------------------------------------------------------------------- nav index */
function indexNav(nav) {
  const byHref = new Map();
  const walk = (items, parent, top, depth) => {
    for (const it of items) {
      const node = { label: it.label, href: it.href, sourceLabel: it.sourceLabel || null, parent, top: top || null, depth, children: [] };
      node.top = top || node;
      if (it.href && !byHref.has(it.href)) byHref.set(it.href, node);
      if (parent) parent.children.push(node);
      if (it.children) walk(it.children, node, node.top, depth + 1);
    }
  };
  const roots = [];
  for (const it of nav) { const before = byHref.size; walk([it], null, null, 0); roots.push(byHref.get(it.href)); void before; }
  return { byHref, roots };
}

/* ---------------------------------------------------------------------------------------------- build */
/**
 * deps: { root, restructure, models: [{slug, model}], adoptedDir, allowMissingAdopted, remap, menus, imagePlan,
 *         removedFiles: Set, sitemapSourceLabels }
 */
export function buildPages(deps) {
  const { restructure, models, remap, menus, imagePlan } = deps;
  const errors = [];
  const report = { hrefsRemapped: {}, phoneEdits: {}, removedImages: {}, formHiddenDropped: {}, adoptedMissing: [], adoptedPlaceholders: [], navSectionMismatches: [] };
  const pages = [];

  /* source pages */
  for (const { slug, model } of models) {
    const kind = KIND_BY_SLUG[slug];
    if (!kind) { errors.push('no kind for source page ' + slug); continue; }
    const unknown = unknownNodes(model);
    if (unknown.length) errors.push('unknown node type(s) in ' + slug + ': ' + unknown.join(', '));
    const own = ownPath(model.path);
    const p = servedPath(remap.remapOwn(own));
    const blocks = structuredClone(model.blocks);
    report.hrefsRemapped[slug] = remapModelHrefs(blocks, remap.url);
    const ph = applyPhoneEdit(blocks);
    if (ph) report.phoneEdits[slug] = ph;
    const rm = removeImages(blocks, deps.removedFiles);
    if (rm) report.removedImages[slug] = rm;
    const fh = neutraliseForms(blocks);
    if (fh) report.formHiddenDropped[slug] = fh;
    let h1 = model.h1;
    let h1InModel = blocks.some((b) => b.nodes.some((n) => n.t === 'heading' && n.level === 1));
    if (!h1) {
      /* BUILD-CONTRACT 4.6: the article's h1 is its BlogPosting headline */
      const bp = (model.meta.jsonLd || []).find((j) => [].concat(j['@type']).includes('BlogPosting'));
      if (bp && bp.headline) h1 = bp.headline; else errors.push('no h1 for ' + slug);
    }
    pages.push({
      kind, path: p, sourcePath: servedPath(own), slug, title: null, metaDescription: null, canonical: null, og: null, jsonLd: null,
      h1, h1InModel, breadcrumbs: null, section: sectionOf(p),
      model: { ...model, blocks }, adopted: null, related: [], generated: {},
      _raw: model,
    });
  }
  for (const [slug, n] of Object.entries(EXPECTED_MODEL_PHONE_EDITS)) if ((report.phoneEdits[slug] || 0) !== n) errors.push('phone edit count on ' + slug + ': ' + (report.phoneEdits[slug] || 0) + ' (expected ' + n + ')');
  for (const slug of Object.keys(report.phoneEdits)) if (!Object.hasOwn(EXPECTED_MODEL_PHONE_EDITS, slug)) errors.push('unexpected (732) 736-1700 in model ' + slug);
  const totalRemoved = Object.values(report.removedImages).reduce((a, b) => a + b, 0);
  if (totalRemoved !== 1 || report.removedImages['location-academy-vision'] !== 1) errors.push('expected exactly 1 removed image (the comic on location-academy-vision), got ' + JSON.stringify(report.removedImages));

  /* adopted pages */
  const planIds = new Set((imagePlan.images || []).map((i) => i.id));
  for (const a of restructure.adopt) {
    const own = a.path;
    const file = path.join(deps.adoptedDir, adoptedFile(own));
    let j = null;
    if (fs.existsSync(file)) {
      try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { errors.push('adopted/' + adoptedFile(own) + ': invalid JSON: ' + e.message); continue; }
      errors.push(...validateAdopted(j, own));
    } else if (deps.allowMissingAdopted) {
      report.adoptedPlaceholders.push(own);
      j = { schema: 'academyvision/adopted@1', path: own, etSource: a.etSource, title: a.title, metaDescription: '', h1: a.h1, sections: [], faq: [], cta: null, related: [], placeholder: true };
    } else { report.adoptedMissing.push(own); continue; }
    const p = servedPath(own);
    const seg = own.split('/').pop();
    const generated = {};
    if (planIds.has('hero-' + seg)) generated.hero = 'hero-' + seg;
    pages.push({
      kind: own === 'eye-health' ? 'eye-health' : 'adopted', path: p, sourcePath: null, slug: 'adopted/' + adoptedFile(own).replace(/\.json$/, ''),
      title: null, metaDescription: null, canonical: null, og: null, jsonLd: null,
      h1: j.h1, h1InModel: false, breadcrumbs: null, section: sectionOf(p), model: null, adopted: j, related: [], generated,
      _raw: null,
    });
  }
  if (report.adoptedMissing.length) errors.push('missing adopted page JSON (' + report.adoptedMissing.length + '): ' + report.adoptedMissing.join(', ') + ' - run with --allow-missing-adopted while the writers work');

  /* generated slots per page (image-plan usedOn), and sections */
  for (const pg of pages) {
    const slots = (imagePlan.images || []).filter((i) => [].concat(i.usedOn || []).includes(pg.path)).map((i) => i.id).filter((id) => id !== pg.generated.hero);
    if (slots.length) pg.generated.slots = slots;
    const motion = (imagePlan.motion || []).filter((m) => [].concat(m.usedOn || []).includes(pg.path)).map((m) => m.id);
    if (motion.length) pg.generated.motion = motion;
    if (!pg.section) errors.push('no section for ' + pg.path);
  }

  /* nav-derived labels, breadcrumbs and related */
  const byPath = new Map();
  for (const pg of pages) { if (byPath.has(pg.path)) errors.push('duplicate page path ' + pg.path); byPath.set(pg.path, pg); }
  const { byHref } = indexNav(menus.nav);
  const footerLabel = new Map();
  for (const col of menus.footer) for (const l of col.links) if (l.href && !footerLabel.has(l.href)) footerLabel.set(l.href, l.label);
  const labelFor = (p) => (byHref.get(p) || {}).label || footerLabel.get(p) || (byPath.get(p) || {}).h1 || p;
  for (const [href, node] of byHref) {
    const pg = byPath.get(href);
    if (!pg) { if (href.startsWith('/')) errors.push('nav href is not a page: ' + href); continue; }
    const navSection = sectionOf(node.top.href) === 'home' && node.top.href !== href ? null : sectionOf(node.top.href);
    if (navSection && navSection !== pg.section) report.navSectionMismatches.push(href + ' nav:' + navSection + ' url:' + pg.section);
  }
  for (const pg of pages) {
    const crumbs = [{ label: labelFor('/'), href: '/' }];
    if (pg.path !== '/') {
      const segs = ownPath(pg.path).split('/');
      const anc = [];
      for (let i = 1; i < segs.length; i++) { const a = '/' + segs.slice(0, i).join('/') + '/'; if (byPath.has(a)) anc.push(a); }
      const landing = SECTION_LANDING[pg.section];
      if (landing && landing !== '/' && landing !== pg.path && anc[0] !== landing) anc.unshift(landing);
      for (const a of anc) crumbs.push({ label: labelFor(a), href: a });
      crumbs.push({ label: labelFor(pg.path), href: pg.path });
    }
    pg.breadcrumbs = crumbs;
  }
  const legalRow = (menus.footer.find((c) => c.role === 'legal') || { links: [] }).links;
  for (const pg of pages) {
    const n = byHref.get(pg.path);
    let items = [];
    if (n && n.children.length) items = n.children;
    else if (n && n.parent) items = n.parent.children.filter((c) => c.href !== pg.path);
    else if (!n) items = legalRow.filter((l) => l.href !== pg.path);
    if (!items.length && n && n.parent) items = [n.parent];
    pg.related = items.filter((i) => i.href && byPath.has(i.href) && i.href !== pg.path).map((i) => ({ label: i.label, href: i.href }));
  }

  /* adopted internal links must be NEW paths that exist (BUILD-CONTRACT 3.3) */
  for (const pg of pages) {
    if (!pg.adopted) continue;
    const at = pg.slug;
    const all = [pg.adopted.lede, ...(pg.adopted.sections || []).map((s) => s.html), ...(pg.adopted.faq || []).map((f) => f.a), pg.adopted.cta && pg.adopted.cta.html].filter(Boolean);
    for (const h of all) for (const href of hrefsIn(h)) {
      if (!href.startsWith('/')) { if (!/^(https?:|tel:|mailto:|#)/.test(href)) errors.push(at + ': unsupported href ' + href); continue; }
      const clean = href.split(/[?#]/)[0];
      if (remap.url(clean) !== clean) errors.push(at + ': href ' + href + ' is an OLD path (use ' + remap.url(clean) + ')');
      else if (!byPath.has(clean)) errors.push(at + ': href ' + href + ' is not a page of the new site');
    }
    for (const r of pg.adopted.related || []) if (!byPath.has(servedPath(ownPath(r)))) errors.push(at + ': related "' + r + '" is not a page of the new site');
  }

  return { pages, byPath, errors, report, labelFor, byHref };
}

/* ---------------------------------------------------------------------------------------------- related details */
const plain = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
function leadSentences(text, max = 200) {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
  let out = '';
  for (const s of parts) { if (out && (out + s).trim().length > max) break; out += s; }
  return out.trim();
}
/**
 * A card excerpt for a page, from VISIBLE copy only (never meta or JSON-LD: claims found only there are
 * low-confidence, docs/FACTS-EVIDENCE.md C10). Order: Academy Vision's own card excerpt for that page (child-page and
 * article lists), else the page's first paragraph (lead sentences, about 200 characters), else none.
 */
export function cardExcerpts(pages) {
  const map = new Map();
  for (const pg of pages) {
    if (!pg.model) continue;
    for (const b of pg.model.blocks) for (const n of b.nodes) if (n.t === 'list' && (n.kind === 'childpages' || n.kind === 'articles')) for (const it of n.items) if (it.href && it.excerpt && !map.has(it.href)) map.set(it.href, plain(it.excerpt));
  }
  return map;
}
export function excerptFor(pg, cards) {
  if (cards.has(pg.path)) return cards.get(pg.path);
  if (pg.adopted) return pg.adopted.lede ? leadSentences(plain((String(pg.adopted.lede).match(/<p>[\s\S]*?<\/p>/) || [pg.adopted.lede])[0])) || null : null;
  let seenH1 = !pg.h1InModel;
  for (const b of pg.model.blocks) for (const n of b.nodes) {
    if (n.t === 'heading' && n.level === 1) { seenH1 = true; continue; }
    if (seenH1 && n.t === 'html' && n.hint !== 'kicker' && /<p>/.test(n.html)) { const t = leadSentences(plain(n.html.match(/<p>[\s\S]*?<\/p>/)[0])); if (t) return t; }
  }
  return null;
}
export function firstImageRef(pg, removedFiles) {
  if (pg.adopted) return pg.generated.hero || null;
  for (const b of pg.model.blocks) {
    if (/^hero-/.test(b.cpt) && b.background && b.background.image && b.background.image.file && !removedFiles.has(b.background.image.file)) return b.background.image.file;
    for (const n of b.nodes) {
      if (n.t === 'image' && n.file && !removedFiles.has(n.file)) return n.file;
      if (n.t === 'team' && n.kind === 'photo' && n.image && n.image.file) return n.image.file;
    }
  }
  return null;
}

/* ---------------------------------------------------------------------------------------------- sitemap */
/**
 * The /sitemap/ list regenerated for the new tree: every page once, grouped by section, labels = Academy Vision's own
 * where it has one (the source sitemap's label for that page, else the AV menu label), else the new menu or footer
 * label. Structure follows the decided menu; a page whose URL section differs from its menu column (V7: ortho-k) is
 * listed under its URL parent.
 */
export function regenerateSitemap({ pages, byPath, menus, byHref, sourceLabelByNewPath }) {
  const errors = [];
  const avLabel = (p) => sourceLabelByNewPath.get(p) || (byHref.get(p) || {}).sourceLabel || null;
  const footerLabel = new Map();
  for (const col of menus.footer) for (const l of col.links) if (l.href && !footerLabel.has(l.href)) footerLabel.set(l.href, l.label);
  const label = (p) => avLabel(p) || (byHref.get(p) || {}).label || footerLabel.get(p) || null;
  const listed = new Set();
  const groups = [];
  const groupOf = new Map();
  const ensureGroup = (section) => {
    if (!groupOf.has(section)) {
      const landing = SECTION_LANDING[section];
      const g = { id: section, label: landing ? label(landing) : null, href: landing, items: [] };
      groupOf.set(section, g); groups.push(g);
    }
    return groupOf.get(section);
  };
  const add = (p, depth) => {
    if (listed.has(p) || !byPath.has(p)) return;
    const pg = byPath.get(p);
    const g = ensureGroup(pg.section);
    g.items.push({ label: label(p) || pg.h1, href: p, depth, group: pg.section });
    listed.add(p);
  };
  const deferred = [];
  const walk = (items, depth, topSection) => {
    for (const it of items) {
      if (!it.href) continue;
      const pg = byPath.get(it.href);
      if (pg && pg.section !== topSection && depth > 0) { deferred.push(it.href); }
      else add(it.href, depth);
      if (it.children) walk(it.children, depth + 1, topSection);
    }
  };
  for (const top of menus.nav) {
    const pg = byPath.get(top.href);
    const sec = pg ? pg.section : null;
    add(top.href, 0);
    if (top.children) walk(top.children, 1, sec);
  }
  /* re-home deferred pages under their URL parent */
  for (const p of deferred) {
    if (listed.has(p)) continue;
    const pg = byPath.get(p);
    const g = ensureGroup(pg.section);
    const segs = ownPath(p).split('/');
    let parent = null;
    for (let i = segs.length - 1; i >= 1 && !parent; i--) { const a = '/' + segs.slice(0, i).join('/') + '/'; if (g.items.some((x) => x.href === a)) parent = a; }
    const at = parent ? g.items.findIndex((x) => x.href === parent) : g.items.length - 1;
    const pd = parent ? g.items[at].depth : 0;
    let ins = at + 1;
    while (ins < g.items.length && g.items[ins].depth > pd) ins++;
    g.items.splice(ins, 0, { label: label(p) || pg.h1, href: p, depth: pd + 1, group: pg.section });
    listed.add(p);
  }
  for (const col of menus.footer) for (const l of col.links) if (l.href && byPath.has(l.href) && !listed.has(l.href)) add(l.href, 0);
  for (const pg of pages) if (!listed.has(pg.path)) errors.push('sitemap: page not placed: ' + pg.path);
  const items = groups.flatMap((g) => g.items);
  return { items, groups, errors };
}
