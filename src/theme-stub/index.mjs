// theme-stub/index.mjs - plain semantic HTML for every node type and page kind (PIPELINE role).
// The build renders with src/theme/index.mjs once it exists; until then (or with --theme stub) it uses this file, so the
// text, links and images can be verified before the real theme lands. Same signature as BUILD-CONTRACT 3.2:
//   export const styles, scripts; export function renderPage(page, ctx); export function render404(ctx)
// It writes root-absolute URLs; the build makes every page except 404.html page-relative.

/** the build reads `styles` / `scripts` from this directory (the real theme uses src/styles and src/scripts) */
export const assetDir = new URL('./', import.meta.url);
export const styles = ['stub.css'];
export const scripts = ['stub.js'];

const e = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (l) => (l.newTab ? ' target="_blank" rel="noopener"' : '');
const link = (l, cls = '') => '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + e(l.href) + '"' + ext(l) + '>' + e(l.label) + '</a>';

/* ---------------------------------------------------------------------------------------------- document */
function doc(page, ctx, main, { title, head } = {}) {
  const c = ctx.chrome;
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + (head || (title ? '<title>' + e(title) + '</title>' : ctx.seoHead(page))) + '\n'
    + '<link rel="icon" type="image/png" href="' + e(ctx.asset('favicon.png')) + '">\n'
    + '<link rel="stylesheet" href="' + e(ctx.asset('site.css')) + '">\n'
    + '<script src="' + e(ctx.asset('site.js')) + '" defer></script>\n'
    + '</head>\n<body class="kind-' + e(page ? page.kind : '404') + ' section-' + e(page ? page.section : 'none') + '">\n'
    + '<a class="skip-link" href="' + e(c.skipLink.href) + '">' + e(c.skipLink.label) + '</a>\n'
    + header(page, ctx) + '\n'
    + '<main id="main-content" tabindex="-1">\n' + main + '\n</main>\n'
    + footer(ctx) + '\n</body>\n</html>\n';
}

function header(page, ctx) {
  const current = page ? page.path : null;
  const l = ctx.site.logo;
  const w = Math.min(l.maxCssWidth, l.w);
  const logo = '<img src="' + e(ctx.asset('logo-master.png')) + '" width="' + w + '" height="' + Math.round((l.h * w) / l.w) + '" alt="' + e(l.alt) + '">';
  const navList = (items, top) => '<ul>' + items.map((it) => '<li' + (it.group === true ? ' class="nav-group"' : typeof it.group === 'string' ? ' data-group="' + e(it.group) + '"' : '') + '>'
    + '<a href="' + e(it.href) + '"' + (it.href === current ? ' aria-current="page"' : '') + ext(it) + '>' + e(it.label) + '</a>'
    + (it.children && it.children.length ? navList(it.children.concat(it.allLabel ? [{ label: it.allLabel, href: it.href }] : []), false) : '') + '</li>').join('') + '</ul>';
  return '<header class="site-header">\n<div class="topbar">' + link(ctx.topbar) + ' ' + ctx.headerButtons.map((b) => link(b, 'button')).join(' ') + '</div>\n'
    + '<a class="logo" href="/" aria-label="' + e(ctx.chrome.homeAriaLabel) + '">' + logo + '</a>\n'
    + '<nav class="main-nav" aria-label="Main">' + navList(ctx.nav, true) + '</nav>\n</header>';
}

function hoursDl(hours) {
  return '<dl class="hours">' + hours.map((h) => '<div><dt>' + e(h.label) + '</dt><dd>' + e(h.text) + '</dd></div>').join('') + '</dl>';
}
function mapFrame(ctx, title) {
  return '<iframe class="map" src="' + e(ctx.site.mapEmbedSrc) + '" title="' + e(title || ctx.site.mapTitle) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
}

function footer(ctx) {
  const h = ctx.chrome.footerHeadings;
  const cols = ctx.footer.filter((c) => c.role !== 'legal').map((c) => '<section class="footer-col"><h2>' + e(c.title) + '</h2>'
    + (c.title === h.contact ? '<p><strong>' + e(ctx.site.name) + '</strong></p>' : '')
    + '<ul>' + c.links.map((l) => '<li>' + (/^https:\/\/www\.google\.com\/maps\//.test(l.href) ? '<a href="' + e(l.href) + '" target="_blank" rel="noopener">' + e(l.label) + '</a>' : link(l)) + '</li>').join('') + '</ul>'
    + (c.title === h.contact ? ctx.site.badges.map((b) => ctx.img(b.file, { alt: b.alt, widths: [150, 300], sizes: '150px', width: 150 })).join('') : '')
    + '</section>').join('\n');
  return '<footer class="site-footer">\n' + cols + '\n'
    + '<section class="footer-col"><h2>' + e(h.locate) + '</h2>' + mapFrame(ctx) + '</section>\n'
    + '<section class="footer-col"><h2>' + e(h.hours) + '</h2>' + hoursDl(ctx.site.hours) + '</section>\n'
    + '<nav class="legal-links" aria-label="Legal"><ul>' + ctx.site.legalLinks.map((l) => '<li>' + link(l) + '</li>').join('') + '</ul></nav>\n'
    + '<p class="copyright">' + e(ctx.site.copyright) + '</p>\n</footer>';
}

/* ---------------------------------------------------------------------------------------------- main */
function crumbs(page) {
  if (!page.breadcrumbs || page.breadcrumbs.length < 2) return '';
  const n = page.breadcrumbs.length;
  return '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>' + page.breadcrumbs.map((c, i) => '<li>' + (i === n - 1 ? '<span aria-current="page">' + e(c.label) + '</span>' : '<a href="' + e(c.href) + '">' + e(c.label) + '</a>') + '</li>').join('') + '</ol></nav>';
}
function related(page) {
  if (!page.related || !page.related.length) return '';
  return '<nav class="related" aria-label="Related pages"><ul>' + page.related.map((r) => '<li><a href="' + e(r.href) + '">' + e(r.label) + '</a>' + (r.excerpt ? '<p>' + e(r.excerpt) + '</p>' : '') + '</li>').join('') + '</ul></nav>';
}
function ctaButtons(ctx) {
  return '<p class="button-row">' + ctx.headerButtons.map((b) => link(b, 'button')).join(' ') + '</p>';
}

const node = {
  heading(n) {
    const inner = n.href ? '<a href="' + e(n.href) + '">' + n.html + (n.chevron ? ' <span aria-hidden="true">»</span>' : '') + '</a>' : n.html;
    const cls = 'heading' + (n.align ? ' align-' + e(n.align) : '');
    return n.level ? '<h' + n.level + ' class="' + cls + '">' + inner + '</h' + n.level + '>' : '<p class="' + cls + ' heading--plain">' + inner + '</p>';
  },
  html(n) {
    return '<div class="rich' + (n.hint === 'kicker' ? ' kicker' : '') + (n.transform === 'uppercase' ? ' upper' : '') + (n.align ? ' align-' + e(n.align) : '') + '">' + n.html + '</div>';
  },
  image(n, page, ctx) {
    const im = ctx.img(n.file, { alt: n.alt, sizes: '(min-width: 900px) 50vw, 100vw', cls: n.variant === 'mobile-only' ? 'mobile-only' : '' });
    return '<figure class="image">' + (n.href ? '<a href="' + e(n.href) + '">' + im + '</a>' : im) + '</figure>';
  },
  button(n) {
    const rel = [n.rel, n.newTab ? 'noopener' : null].filter(Boolean).join(' ');
    return '<p class="button-row"><a class="button' + (n.variant ? ' button--' + e(n.variant) : '') + '" href="' + e(n.href) + '"' + (n.newTab ? ' target="_blank"' : '') + (rel ? ' rel="' + e(rel) + '"' : '') + (n.ariaLabel ? ' aria-label="' + e(n.ariaLabel) + '"' : '') + '>' + e(n.label) + '</a></p>';
  },
  form(n) { return form(n); },
  team(n, page, ctx) {
    const photo = (im, alt) => ctx.img(im.file, { alt, widths: [150, 300], sizes: '150px', width: 150, cls: 'person-photo' });
    if (n.kind === 'list') {
      return '<ul class="team">' + n.items.map((it) => '<li class="team-card" data-link="' + e(it.href) + '">'
        + (it.photo ? '<a href="' + e(it.photo.href || it.href) + '" tabindex="-1">' + photo(it.photo, it.photo.alt) + '</a>' : '')
        + '<h' + (it.title.level || 3) + '><a href="' + e(it.href) + '">' + it.title.html + (it.title.chevron ? ' <span aria-hidden="true">»</span>' : '') + '</a></h' + (it.title.level || 3) + '>'
        + '<div class="bio">' + (it.bio || '') + '</div>'
        + (it.cta ? '<p><a class="button" href="' + e(it.cta.href) + '"' + (it.cta.ariaLabel ? ' aria-label="' + e(it.cta.ariaLabel) + '"' : '') + '>' + e(it.cta.label) + '</a></p>' : '')
        + '</li>').join('') + '</ul>';
    }
    if (n.kind === 'biography') return '<div class="bio">' + n.html + '</div>';
    if (n.kind === 'photo') return '<figure class="person">' + photo(n.image, n.image.alt) + '</figure>';
    return n.items && n.items.length ? '<ul class="team-' + e(n.kind) + '">' + n.items.map((x) => '<li>' + e(typeof x === 'string' ? x : x.text || x.label || '') + '</li>').join('') + '</ul>' : '';
  },
  location(n, page, ctx) {
    const show = new Set(n.show || []);
    let out = '<div class="location">';
    if (show.has('name')) out += '<p class="location__name"><strong>' + e(n.name) + '</strong></p>';
    if (show.has('phone')) out += '<p><a href="' + e(n.phoneHref) + '">' + e(n.phone) + '</a></p>';
    if (show.has('address')) out += '<p><a href="' + e(n.mapsUrl) + '"' + (n.mapsNewTab ? ' target="_blank" rel="noopener"' : '') + '>' + e(n.address) + (show.has('chevron') ? ' <span aria-hidden="true">»</span>' : '') + '</a></p>';
    if (show.has('hours')) out += hoursDl(n.hours);
    if (show.has('map')) out += mapFrame(ctx, n.mapTitle);
    return out + '</div>';
  },
  reviews(n) {
    const ui = n.ui || {};
    return '<div class="reviews" data-show-more="' + e(ui.showMore) + '" data-prev="' + e(ui.previous) + '" data-next="' + e(ui.next) + '" data-dot="' + e(ui.dot) + '"><ul>'
      + n.items.map((r) => '<li class="review"><figure><blockquote><p>' + e(r.quote) + '</p></blockquote><figcaption>'
        + '<span class="stars" role="img" aria-label="' + e(r.ratingLabel) + '">' + e(r.stars) + '</span> '
        + (r.author ? '<cite>' + e(r.author) + '</cite> ' : '') + (r.date ? '<time datetime="' + e(r.date) + '">' + e(r.date) + '</time>' : '')
        + '</figcaption></figure></li>').join('') + '</ul></div>';
  },
  list(n, page, ctx) {
    const k = n.kind;
    if (k === 'insurance' || k === 'frames' || k === 'contact-lenses') {
      return '<ul class="logo-grid logo-grid--' + e(k) + '">' + n.items.map((it) => '<li>' + (it.logo ? ctx.img(it.logo.file, { alt: it.logo.alt, widths: [200, 400], sizes: '200px' }) : '') + '<span>' + e(it.name) + '</span></li>').join('') + '</ul>'
        + (n.ui && n.ui.showAll ? '<p><button type="button" class="show-all" data-show-all hidden>' + e(n.ui.showAll) + '</button></p>' : '');
    }
    if (k === 'equipment') return n.items && n.items.length ? '<ul>' + n.items.map((x) => '<li>' + e(typeof x === 'string' ? x : x.name || '') + '</li>').join('') + '</ul>' : '';
    if (k === 'articles') {
      return '<ul class="cards">' + n.items.map((it) => '<li class="card" data-link="' + e(it.href) + '"><h3><a href="' + e(it.href) + '"' + (it.ariaLabel ? ' aria-label="' + e(it.ariaLabel) + '"' : '') + '>' + e(it.title) + (it.chevron ? ' <span aria-hidden="true">»</span>' : '') + '</a></h3>'
        + '<div class="excerpt">' + (it.excerpt || '') + '</div>'
        + (it.cta ? '<p><a class="button" href="' + e(it.cta.href) + '"' + (it.cta.ariaLabel ? ' aria-label="' + e(it.cta.ariaLabel) + '"' : '') + '>' + e(it.cta.label) + '</a></p>' : '') + '</li>').join('') + '</ul>';
    }
    if (k === 'childpages') {
      return '<ul class="cards">' + n.items.map((it) => '<li class="card" data-link="' + e(it.href) + '">'
        + (it.image ? '<a href="' + e(it.image.href || it.href) + '" tabindex="-1">' + ctx.img(it.image.file, { alt: it.image.alt, sizes: '(min-width: 900px) 33vw, 100vw' }) + '</a>' : '')
        + '<h3><a href="' + e(it.href) + '">' + e(it.title) + (it.chevron ? ' <span aria-hidden="true">»</span>' : '') + '</a></h3>'
        + '<div class="excerpt">' + e(it.excerpt) + '</div></li>').join('') + '</ul>';
    }
    if (k === 'sitemap') {
      let out = '', depth = -1;
      for (const it of n.items) {
        if (it.depth > depth) out += '<ul>'.repeat(it.depth - depth);
        else { out += '</li>'; if (it.depth < depth) out += '</ul></li>'.repeat(depth - it.depth); }
        out += '<li><a href="' + e(it.href) + '">' + e(it.label) + '</a>';
        depth = it.depth;
      }
      if (depth >= 0) out += '</li>' + '</ul></li>'.repeat(depth) + '</ul>';
      return '<div class="sitemap">' + out + '</div>';
    }
    if (k === 'photos') {
      return '<ul class="photos" data-lightbox="' + e(n.ui && n.ui.lightbox) + '">' + n.items.map((it) => '<li' + (it.highlight ? ' class="highlight"' : '') + '>' + ctx.img(it.file, { alt: it.alt, sizes: it.highlight ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 25vw, 50vw' }) + '</li>').join('') + '</ul>';
    }
    throw new Error('theme-stub: unknown list kind ' + k);
  },
  legal(n) { return '<div class="legal">' + n.html + '</div>'; },
  divider() { return '<hr>'; },
};

function form(n) {
  const m = n.messages || {};
  const v = m.validation || {};
  const attrs = (o) => Object.entries(o).filter(([, x]) => x !== undefined && x !== null && x !== false).map(([k, x]) => (x === true ? ' ' + k : ' ' + k + '="' + e(x) + '"')).join('');
  const input = (i, f) => {
    const name = i.name || f.submitName || f.id;
    const common = { id: i.id, name: i.type === 'checkbox' && f.inputs.length > 1 ? name + '[]' : name, required: !!i.required, placeholder: i.placeholder, autocomplete: i.autocomplete, inputmode: i.inputmode, min: i.min, max: i.max, step: i.step, 'aria-label': i.ariaLabel, 'data-phone-format': i.phoneFormat, 'data-required-group': i.requiredGroup ? '1' : undefined };
    if (i.el === 'select') return (i.label ? '<label for="' + e(i.id) + '">' + e(i.label) + '</label>' : '') + '<select' + attrs(common) + '>' + (i.options || []).map((o) => '<option value="' + e(o.value) + '">' + e(o.label) + '</option>').join('') + '</select>';
    if (i.el === 'textarea') return (i.label ? '<label for="' + e(i.id) + '">' + e(i.label) + '</label>' : '') + '<textarea' + attrs({ ...common, rows: i.rows }) + '></textarea>';
    if (i.type === 'checkbox' || i.type === 'radio') return '<label class="choice"><input' + attrs({ type: i.type, ...common, value: i.value }) + '> ' + (i.labelHtml || e(i.label)) + '</label>';
    return (i.label ? '<label for="' + e(i.id) + '">' + e(i.label) + '</label>' : '') + '<input' + attrs({ type: i.type || 'text', ...common, value: i.type === 'hidden' ? i.value : undefined }) + '>';
  };
  const field = (f) => {
    const a = attrs({ class: 'field field--' + f.type, 'data-field': f.id, 'data-show-if': f.showIf ? JSON.stringify(f.showIf) : undefined, hidden: !!f.showIf });
    /* the source prints a platform label on some content fields (e.g. "Content"); kept as plain text, not a <label>
       pointing at a non-control */
    if (f.type === 'html' || f.type === 'content') return '<div' + a + '>' + (f.label ? '<p class="field__label">' + e(f.label) + '</p>' : '') + (f.html || (f.text ? '<p>' + e(f.text) + '</p>' : '')) + '</div>';
    if (f.type === 'heading') return '<div' + a + '><h' + (f.level || 2) + '>' + e(f.text || f.label) + '</h' + (f.level || 2) + '></div>';
    const lab = e(f.label) + (f.requiredMark ? ' <span class="req" aria-hidden="true">' + e(f.requiredMark) + '</span>' : '');
    const desc = f.description ? '<p class="field__desc">' + e(f.description) + '</p>' : '';
    const ins = f.inputs || [];
    if (f.legend || ins.length !== 1 || ['radio', 'checkbox'].includes(ins[0].type)) return '<fieldset' + a + '><legend>' + lab + '</legend>' + desc + ins.map((i) => input(i, f)).join('') + '</fieldset>';
    const i = ins[0];
    return '<div' + a + '><label for="' + e(f.labelFor || i.id) + '">' + lab + '</label>' + desc + input({ ...i, label: i.label && i.label !== f.label ? i.label : null }, f) + '</div>';
  };
  return '<form class="form" id="form-' + e(n.id) + '" data-sr-unwired="1" novalidate'
    + attrs({ 'data-msg-required': v.valueMissing, 'data-msg-radio': v.radioGroup, 'data-msg-checkbox': v.checkboxGroup, 'data-msg-error': m.error, 'data-msg-submitting': m.submitting }) + '>'
    + (n.hidden || []).map((h) => '<input type="hidden" name="' + e(h.name) + '" value="' + e(h.value) + '">').join('')
    + n.fields.map(field).join('\n')
    /* disabled until the script runs: without JS an unwired form would GET its fields (SSN digits, history) into a URL;
       a disabled default button also blocks implicit submission */
    + '<p><button type="submit" disabled data-unwired-submit>' + e((n.submit && n.submit.label) || '') + '</button></p>'
    + '<div class="form__success" role="status" hidden>' + (m.success || '') + '</div>'
    + '</form>';
}

function renderModel(page, ctx) {
  let out = page.h1InModel ? '' : '<h1>' + e(page.h1) + '</h1>';
  page.model.blocks.forEach((b, bi) => {
    if (b.cpt === 'section-divider') return;
    const bgFile = b.background && b.background.image && b.background.image.file;
    const bg = bgFile && !b.nodes.some((n) => n.file === bgFile) ? ctx.img(bgFile, { alt: '', cls: 'block-bg', sizes: '100vw', loading: bi === 0 ? 'eager' : 'lazy' }) : '';
    out += '<section class="block block--' + e(b.cpt) + '" data-block="' + e(b.id) + '">' + bg + b.nodes.map((n) => {
      const fn = node[n.t];
      if (!fn) throw new Error('theme-stub: unknown node type ' + n.t + ' on ' + page.path);
      return fn(n, page, ctx);
    }).join('\n') + '</section>\n';
  });
  return out;
}

function renderAdopted(page, ctx) {
  const a = page.adopted;
  let out = (a.kicker ? '<p class="kicker">' + e(a.kicker) + '</p>' : '') + '<h1>' + e(a.h1) + '</h1>';
  if (page.generated.hero) out += '<figure class="hero">' + ctx.img(page.generated.hero, { sizes: '100vw', loading: 'eager', fetchpriority: 'high' }) + '</figure>';
  if (a.lede) out += '<div class="lede">' + a.lede + '</div>';
  for (const s of a.sections || []) out += '<section' + (s.id ? ' id="' + e(s.id) + '"' : '') + ' class="adopted-section layout-' + e(s.layout || 'text') + '"><h2>' + e(s.heading) + '</h2>' + (s.imageSlot ? ctx.img(s.imageSlot, { sizes: '(min-width: 900px) 50vw, 100vw' }) : '') + s.html + '</section>\n';
  if (a.faq && a.faq.length) out += '<section class="faq">' + a.faq.map((f) => '<details><summary>' + e(f.q) + '</summary>' + f.a + '</details>').join('') + '</section>\n';
  if (a.cta) out += '<section class="cta"><h2>' + e(a.cta.heading) + '</h2>' + a.cta.html + ctaButtons(ctx) + '</section>\n';
  return out;
}

export function renderPage(page, ctx) {
  const main = crumbs(page) + '\n' + (page.model ? renderModel(page, ctx) : renderAdopted(page, ctx)) + related(page);
  return doc(page, ctx, main);
}

export function render404(ctx) {
  const main = '<h1>Page not found</h1>\n<p><a href="/">' + e(ctx.chrome.brandName) + '</a></p>';
  return doc(null, ctx, main, { head: '<title>Page not found | ' + e(ctx.site.name) + '</title>\n<meta name="robots" content="noindex">' });
}
