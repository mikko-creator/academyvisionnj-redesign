// src/theme/chrome.mjs - site chrome: ambient light layer, header bar, desktop menus (About / Services mega / Eyewear /
// Visit), the modal phone drawer, the footer (THEME-CORE; DESIGN-SPEC §9, grafts G7 G8, R-4 R-6 R-7 R-8 R-14 R-15).
// Every label and href comes from ctx (nav, footer, topbar, headerButtons, ctas, chrome, site) or is quoted from a page
// model through ctx.pagesByPath (the Emergency sentence in the mega menu). The theme types no copy. All 54 nav and
// footer targets are linked from the desktop menus, the drawer and the footer of every page (build-verify e).
import { esc, attrs, icon } from './parts.mjs';

const derivedByCtx = new WeakMap();
/** data derived once per build from ctx: doctor portraits by bio path, the mega-menu Emergency sentence, hub labels */
function derived(ctx) {
  if (derivedByCtx.has(ctx)) return derivedByCtx.get(ctx);
  const doctors = new Map();
  const docs = ctx.pagesByPath['/our-doctors/'];
  if (docs && docs.model) for (const b of docs.model.blocks) for (const n of b.nodes) if (n.t === 'team' && n.kind === 'list') for (const it of n.items) if (it.photo && it.photo.file) doctors.set(it.href, it.photo.file);
  /* DESIGN-SPEC 9.3: the Emergency sentence quoted verbatim from the town page (its "Emergency Eye Care" paragraph) */
  let emergency = null;
  const town = ctx.pagesByPath[ctx.site.contactPage];
  if (town && town.model) for (const b of town.model.blocks) for (const n of b.nodes) {
    if (emergency || n.t !== 'html') continue;
    const m = String(n.html).match(/<h3>[^<]*Emergency[^<]*<\/h3>\s*<p>([^<]*?[.!?])(?=\s|<)/);
    if (m) emergency = m[1];
  }
  const footerLabel = new Map();
  for (const c of ctx.footer) for (const l of c.links) if (!footerLabel.has(l.href)) footerLabel.set(l.href, l.label);
  const ctaLabel = (href, label) => { const c = ctx.ctas.find((x) => x.href === href && x.label === label); return c ? c.label : null; };
  const d = { doctors, emergency, footerLabel, ctaLabel };
  derivedByCtx.set(ctx, d);
  return d;
}

const sectionOf = (ctx, href) => { const p = ctx.pagesByPath[href]; return p ? p.section : null; };
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** the hub link that opens each disclosure panel: Academy Vision's own CTA label (DESIGN-SPEC 9.2) */
function hubOf(ctx, it) {
  const d = derived(ctx);
  const sec = sectionOf(ctx, it.href);
  let label = null;
  if (it.allLabel) label = it.allLabel;
  else if (sec === 'about') label = d.ctaLabel(it.href, 'About Our Practice');
  else if (sec === 'eyewear') label = d.ctaLabel(it.href, 'Explore Our Eyewear');
  else if (sec === 'visit') label = d.footerLabel.get(it.href) || it.sourceLabel || null;
  return { label: label || it.label, href: it.href };
}

function makeChrome(page, ctx, kit) {
  const cur = page && page.path ? page.path : null;
  const isCur = (href) => !!cur && href === cur;
  const inBranch = (it) => isCur(it.href) || (it.children || []).some(inBranch);
  const ac = (href) => (isCur(href) ? ' aria-current="page"' : '');
  const ext = (l) => (l.newTab || (l.href === ctx.site.mapsUrl && ctx.site.mapsNewTab) ? ' target="_blank" rel="noopener"' : '');
  const a = (l, cls = '', inner = null) => '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(l.href) + '"' + ac(l.href) + ext(l) + '>' + (inner !== null ? inner : esc(l.label)) + '</a>';
  return { cur, isCur, inBranch, ac, ext, a };
}

/* ================================================================================================ ambient (plane 1) */
export function ambient() {
  return '<div class="ambient" aria-hidden="true"><span class="pool pool--a"></span><span class="pool pool--b"></span><span class="pool pool--c"></span><span class="pool pool--d"></span></div>';
}

/* ================================================================================================ header */
export function header(page, ctx, kit) {
  const c = makeChrome(page, ctx, kit);
  const d = derived(ctx);
  const L = ctx.site.logo;
  const logo = '<a class="brand" href="/" aria-label="' + esc(ctx.chrome.homeAriaLabel) + '"><img src="' + esc(ctx.asset('logo-master.png')) + '" width="' + L.w + '" height="' + L.h + '" alt="' + esc(L.alt) + '" decoding="async"></a>';

  /* ---------------- desktop panels */
  const chev = icon('chev', 'chev');
  const groupHead = (g) => '<a class="mega-group__title" href="' + esc(g.href) + '"' + c.ac(g.href) + '><span class="mega-group__dot" aria-hidden="true"></span>' + esc(g.label) + '</a>';
  function megaPanel(it, id) {
    const groups = (it.children || []).filter((g) => g.group === true);
    const hub = hubOf(ctx, it);
    const cols = groups.map((g) => '<div class="mega-group">' + groupHead(g) + '<ul class="mega-links">' + (g.children || []).map((x) => '<li>' + c.a(x) + '</li>').join('') + '</ul></div>').join('');
    const strip = '<div class="mega__strip">' + (d.emergency ? '<p class="mega__note">' + esc(d.emergency) + '</p>' : '')
      + '<div class="mega__actions"><a class="mega__phone" href="' + esc(kit.call.href) + '">' + icon('phone') + esc(kit.call.label) + '</a>'
      + kit.button(kit.book, { variant: 'primary', size: 'sm', icon: null })
      + '<a class="mega__all" href="' + esc(hub.href) + '"' + c.ac(hub.href) + '>' + esc(hub.label) + icon('arrow', 'mega__arrow') + '</a></div></div>';
    return '<div class="mega" id="' + id + '"><div class="mega__panel"><div class="mega__cols">' + cols + '</div>' + strip + '</div></div>';
  }
  function aboutPanel(it, id) {
    const hub = hubOf(ctx, it);
    const rows = ['<li>' + c.a(hub, 'drop__link drop__link--hub') + '</li>'];
    for (const ch of it.children || []) {
      rows.push('<li>' + c.a(ch, 'drop__link') + (ch.children && ch.children.length ? '<ul class="drop__sub">' + ch.children.map((g) => {
        const photo = d.doctors.get(g.href);
        const thumb = photo ? '<span class="drop__face">' + ctx.img(photo, { alt: '', widths: [150], sizes: '32px', width: 32, loading: 'lazy' }) + '</span>' : '';
        return '<li>' + c.a(g, 'drop__sublink' + (photo ? ' drop__sublink--face' : ''), thumb + '<span>' + esc(g.label) + '</span>') + '</li>';
      }).join('') + '</ul>' : '') + '</li>');
    }
    return '<div class="drop drop--about" id="' + id + '"><div class="drop__panel"><ul class="drop__list">' + rows.join('') + '</ul></div></div>';
  }
  const EYEWEAR_THUMB = { '/products/designer-frames/': 'cut-eyeglasses-tortoise', '/products/sunglasses/': 'cut-sunglasses-navy', '/products/kids-eyewear/': 'cut-eyeglasses-navy', '/products/contact-lenses/': 'cut-contact-lens' };
  function eyewearPanel(it, id) {
    const hub = hubOf(ctx, it);
    const main = (it.children || []).filter((x) => typeof x.group !== 'string');
    const lensItems = (it.children || []).filter((x) => typeof x.group === 'string');
    const groupLabel = lensItems.length ? lensItems[0].group : null;
    const tiles = main.map((x) => {
      const slot = EYEWEAR_THUMB[x.href];
      /* width set in chrome.css by the object's aspect (54 px wide, at most 38 px tall), not inline */
      const cut = slot ? kit.cutout(slot, { cls: 'drop__cut', depth: null, sizes: '80px' }) : '';
      return '<li>' + c.a(x, 'drop__tile', '<div class="drop__thumb" aria-hidden="true">' + cut + '</div><span>' + esc(x.label) + '</span>') + '</li>';
    }).join('');
    const lenses = lensItems.length ? '<div class="drop__group"><p class="drop__label">' + esc(groupLabel) + '</p><ul class="drop__list">' + lensItems.map((x) => '<li>' + c.a(x, 'drop__link') + '</li>').join('') + '</ul></div>' : '';
    return '<div class="drop drop--eyewear" id="' + id + '"><div class="drop__panel"><div class="drop__cols"><ul class="drop__tiles">' + tiles + '</ul>' + lenses + '</div>'
      + '<a class="drop__foot" href="' + esc(hub.href) + '"' + c.ac(hub.href) + '>' + esc(hub.label) + icon('arrow', 'drop__arrow') + '</a></div></div>';
  }
  function visitPanel(it, id) {
    const hub = hubOf(ctx, it);
    const contact = ctx.footer.find((col) => col.title === ctx.chrome.footerHeadings.contact) || { links: [] };
    const maps = contact.links.find((l) => l.href === ctx.site.mapsUrl) || { label: ctx.site.address.text, href: ctx.site.mapsUrl };
    const rows = ['<li>' + c.a(hub, 'drop__link drop__link--hub') + '</li>', ...(it.children || []).map((x) => '<li>' + c.a(x, 'drop__link') + '</li>')];
    const nap = '<div class="drop__nap"><a href="' + esc(ctx.site.phone.href) + '">' + icon('phone') + esc(ctx.site.phone.display) + '</a>'
      + '<a href="' + esc(maps.href) + '"' + c.ext(maps) + '>' + icon('pin') + esc(maps.label) + '</a></div>';
    return '<div class="drop drop--visit" id="' + id + '"><div class="drop__panel"><ul class="drop__list">' + rows.join('') + '</ul>' + nap + '</div></div>';
  }
  function genericPanel(it, id) {
    const hub = hubOf(ctx, it);
    return '<div class="drop" id="' + id + '"><div class="drop__panel"><ul class="drop__list"><li>' + c.a(hub, 'drop__link drop__link--hub') + '</li>' + (it.children || []).map((x) => '<li>' + c.a(x, 'drop__link') + '</li>').join('') + '</ul></div></div>';
  }
  const navItems = ctx.nav.map((it) => {
    if (!it.children || !it.children.length) return '<li class="nav-item"><a class="nav-link" href="' + esc(it.href) + '"' + c.ac(it.href) + c.ext(it) + '>' + esc(it.label) + '</a></li>';
    const id = 'menu-' + slug(it.label);
    const sec = sectionOf(ctx, it.href);
    const isMega = (it.children || []).some((g) => g.group === true);
    const panel = isMega ? megaPanel(it, id) : sec === 'about' ? aboutPanel(it, id) : sec === 'eyewear' ? eyewearPanel(it, id) : sec === 'visit' ? visitPanel(it, id) : genericPanel(it, id);
    return '<li class="nav-item ' + (isMega ? 'has-mega' : 'has-drop') + '" data-menu><button class="nav-link nav-link--menu' + (c.inBranch(it) ? ' is-current' : '') + '" type="button" aria-controls="' + id + '">' + esc(it.label) + chev + '</button>' + panel + '</li>';
  }).join('');
  const desktopNav = '<nav class="site-nav" aria-label="Main"><ul class="nav-list">' + navItems + '</ul></nav>';

  /* ---------------- actions: phone (icon + number at >= 1440, icon only below) and the Book pill */
  const actions = '<div class="bar__actions">'
    + '<a class="phone-link" href="' + esc(kit.call.href) + '" aria-label="' + esc(kit.call.label) + '">' + icon('phone') + '<span class="phone-link__num">' + esc(ctx.site.phone.display) + '</span></a>'
    + kit.button(kit.book, { variant: 'primary', size: 'sm', icon: null, cls: 'bar__book' })
    + '</div>';

  /* ---------------- phone / tablet drawer: a <details> (works without JS); site.js makes it modal (G8) */
  const ui = ctx.chrome.menuUi;
  const mLink = (l, cls = '') => c.a(l, cls);
  const mItem = (it) => {
    if (!it.children || !it.children.length) return '<li>' + mLink(it, 'm-link') + '</li>';
    const hub = hubOf(ctx, it);
    const isMega = it.children.some((g) => g.group === true);
    let body = '';
    if (isMega) {
      body = '<ul class="m-sub__list">' + it.children.map((g) => '<li class="m-group">' + mLink(g, 'm-group__head') + (g.children && g.children.length ? '<ul class="m-group__list">' + g.children.map((x) => '<li>' + mLink(x, 'm-sublink') + '</li>').join('') + '</ul>' : '') + '</li>').join('') + '<li>' + mLink(hub, 'm-sublink m-sublink--hub') + '</li></ul>';
    } else {
      const rows = ['<li>' + mLink(hub, 'm-sublink m-sublink--hub') + '</li>'];
      let lastGroup = null;
      for (const x of it.children) {
        if (typeof x.group === 'string' && x.group !== lastGroup) { rows.push('<li class="m-sub__title" aria-hidden="true">' + esc(x.group) + '</li>'); lastGroup = x.group; }
        rows.push('<li>' + mLink(x, 'm-sublink') + (x.children && x.children.length ? '<ul class="m-sub__deep">' + x.children.map((g) => '<li>' + mLink(g, 'm-sublink m-sublink--deep') + '</li>').join('') + '</ul>' : '') + '</li>');
      }
      body = '<ul class="m-sub__list">' + rows.join('') + '</ul>';
    }
    return '<li><details class="m-sub"><summary class="m-sub__sum' + (c.inBranch(it) ? ' is-current' : '') + '">' + esc(it.label) + chev + '</summary>' + body + '</details></li>';
  };
  const drawer = '<details class="m-nav" data-mnav>'
    + '<summary class="m-nav__toggle" aria-label="' + esc(ui.toggle) + '" data-label-open="' + esc(ui.open) + '" data-label-close="' + esc(ui.close) + '"><span class="burger" aria-hidden="true"><i></i><i></i><i></i></span></summary>'
    + '<div class="m-nav__scrim" data-mnav-scrim></div>'
    + '<div class="m-nav__panel" id="m-nav-panel" data-dialog-label="Menu">'
    + '<nav aria-label="Mobile"><ul class="m-list">' + ctx.nav.map(mItem).join('') + '</ul></nav>'
    + '<div class="m-nav__cta">' + kit.button(kit.book, { variant: 'primary' }) + kit.button(kit.call, { variant: 'glass' })
    + '<a class="m-nav__loc" href="' + esc(kit.located.href) + '"' + c.ac(kit.located.href) + '>' + icon('pin') + esc(kit.located.label) + '</a></div>'
    + '</div></details>';

  return '<header class="site-header" data-header><div class="bar">' + logo + desktopNav + actions + drawer + '</div></header>';
}

/* ================================================================================================ footer */
export function footer(page, ctx, kit, o = {}) {
  const c = makeChrome(page, ctx, kit);
  const h = ctx.chrome.footerHeadings;
  const cols = ctx.footer.filter((col) => col.role !== 'legal');
  const contact = cols.find((col) => col.title === h.contact) || { title: h.contact, links: [] };
  const linkCols = cols.filter((col) => col !== contact);
  const legal = ctx.footer.find((col) => col.role === 'legal') || { links: ctx.site.legalLinks };
  const L = ctx.site.logo;
  const badge = (ctx.site.badges || [])[0];

  const plate = '<div class="footer__brand"><div class="footer__plate">'
    + '<a class="footer__logo" href="/" aria-label="' + esc(ctx.chrome.homeAriaLabel) + '"><img src="' + esc(ctx.asset('logo-master.png')) + '" width="' + L.w + '" height="' + L.h + '" alt="' + esc(L.alt) + '" loading="lazy" decoding="async"></a>'
    + (badge ? '<span class="footer__badge">' + ctx.img(badge.file, { alt: badge.alt, widths: [150, 300], sizes: '88px', width: 88, loading: 'lazy' }) + '</span>' : '')
    + '</div></div>';
  const navCols = linkCols.map((col) => '<div class="footer__col"><h2 class="footer__h">' + esc(col.title) + '</h2><ul class="footer__nav">' + col.links.map((l) => '<li>' + c.a(l) + '</li>').join('') + '</ul></div>').join('');
  const iconFor = (l) => (/^tel:/.test(l.href) ? icon('phone') : l.href === ctx.site.mapsUrl ? icon('pin') : '');
  const contactCol = '<div class="footer__col footer__col--contact"><h2 class="footer__h">' + esc(contact.title) + '</h2>'
    + '<p class="footer__name">' + esc(ctx.site.name) + '</p><ul class="footer__list">'
    + contact.links.map((l) => '<li>' + c.a(l, iconFor(l) ? 'footer__icon-link' : '', iconFor(l) + '<span>' + esc(l.label) + '</span>') + '</li>').join('') + '</ul></div>';
  const locate = '<div class="footer__col footer__col--map"><h2 class="footer__h">' + esc(h.locate) + '</h2>' + kit.mapFrame() + '</div>';
  const hours = '<div class="footer__col footer__col--hours"><h2 class="footer__h">' + esc(h.hours) + '</h2>' + kit.hoursList() + '</div>';
  const plane = o.home ? kit.loop('loop-navy-glass', { cls: 'footer__loop' }) : kit.loop('loop-navy-glass', { cls: 'footer__loop', posterOnly: true });
  return '<footer class="site-footer' + (o.home ? ' site-footer--overlap' : '') + '">' + plane + '<div class="footer__pools" aria-hidden="true"></div>'
    + '<div class="container footer__grid">' + plate + '<nav class="footer__navs" aria-label="Footer">' + navCols + '</nav>' + contactCol + locate + hours + '</div>'
    + '<div class="container footer__legal"><p>' + esc(ctx.site.copyright) + '</p><nav aria-label="Legal"><ul class="footer__legal-list">' + legal.links.map((l) => '<li>' + c.a(l) + '</li>').join('') + '</ul></nav></div>'
    + '</footer>';
}
