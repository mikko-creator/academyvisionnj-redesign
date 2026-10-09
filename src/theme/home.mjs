// src/theme/home.mjs - the home page <main> (THEME-CORE; DESIGN-SPEC §12, grafts G1-G6, R-1 R-2 R-3 R-5 R-10 R-17 R-18).
// All 15 home model blocks render, in order, plus sections quoted from other page models through ctx.pagesByPath
// (services cards, doctors, insurance, reviews, visit). Every visible word is Academy Vision's: model text, ctx labels,
// or text quoted from another page's model. Fail-safe: any home-model node the composition below did not consume is
// rendered at the end of <main> (and named in a build warning) so build-verify (a) can never lose a sentence silently.
import { esc } from './parts.mjs';

/* ------------------------------------------------------------------------------------------------ model access */
function modelAccess(model) {
  const used = new Set();
  const block = (id) => model.blocks.find((b) => b.id === id) || null;
  const pick = (b, pred) => { if (!b) return null; const n = b.nodes.find((x) => !used.has(x) && pred(x)); if (n) used.add(n); return n || null; };
  const all = (b, pred) => { if (!b) return []; const ns = b.nodes.filter((x) => !used.has(x) && pred(x)); ns.forEach((n) => used.add(n)); return ns; };
  const kicker = (b) => pick(b, (n) => n.t === 'html' && n.hint === 'kicker');
  const heading = (b) => pick(b, (n) => n.t === 'heading');
  const html = (b) => all(b, (n) => n.t === 'html' && n.hint !== 'kicker');
  const buttons = (b) => all(b, (n) => n.t === 'button');
  const image = (b) => pick(b, (n) => n.t === 'image');
  const list = (b, kind) => pick(b, (n) => n.t === 'list' && n.kind === kind);
  const leftovers = () => model.blocks.flatMap((b) => b.nodes.filter((n) => !used.has(n) && b.cpt !== 'section-divider').map((n) => ({ b, n })));
  return { block, pick, all, kicker, heading, html, buttons, image, list, leftovers };
}
/** a cross-page model (read-only), or null */
const other = (ctx, p) => { const pg = ctx.pagesByPath[p]; return pg && pg.model ? pg.model : null; };
const nodesOf = (model) => (model ? model.blocks.flatMap((b) => b.nodes.map((n) => ({ b, n }))) : []);
const masterAlt = (ctx, id) => { const m = (ctx.imageMasters || []).find((x) => x.id === id); return m ? (Array.isArray(m.alt) ? m.alt[0] : m.alt) || '' : ''; };
/** the first <p> of an html string whose text starts with `start` (verbatim slice), else null */
const paragraphStarting = (html, start) => { for (const m of String(html || '').matchAll(/<p>[\s\S]*?<\/p>/g)) if (m[0].slice(3).startsWith(start)) return m[0]; return null; };
/** <p> -> <p class="lead"> on the first paragraph only (presentation) */
const leadFirst = (html) => String(html).replace(/^(\s*)<p>/, '$1<p class="lead">');

export function renderHome(page, ctx, kit) {
  const M = modelAccess(page.model);
  const H = (n, o) => (n ? kit.heading(n.html, o) : '');
  const K = (n, o) => (n ? kit.eyebrow(n.html, o) : '');
  const J = (ns) => ns.map((n) => n.html).join('');
  const out = [];

  /* ============================================================================ H1 hero [bblCWzB660] + seam */
  {
    const b = M.block('bblCWzB660');
    const img = M.image(b);
    const kick = M.kicker(b);
    const h1 = M.heading(b);
    const lead = M.html(b);
    const btns = M.buttons(b);
    const photo = img ? ctx.img(img.file, { alt: img.alt, sizes: '(min-width: 1600px) 1440px, 100vw', loading: 'eager', fetchpriority: 'high' }) : '';
    kit.preloadImage(photo);
    const loopHtml = kit.loop('loop-lens-light', { cls: 'hm-hero__loop', id: 'hero-loop', lcp: true });
    /* WCAG 2.2.2 control for the loop (aria-label only: pure UI, no shown text, DESIGN-SPEC 2.4); hidden until site.js
       can actually play the loop (no JS / reduced motion: the poster only, nothing moves, no control) */
    const toggle = loopHtml.includes('<video') ? '<button class="loop-toggle hm-hero__toggle" type="button" data-loop-toggle="hero-loop" data-state="playing" aria-label="Pause background video" data-label-pause="Pause background video" data-label-play="Play background video" hidden>' + kit.icon('pause', 'loop-toggle__pause') + kit.icon('play', 'loop-toggle__play') + '</button>' : '';
    out.push('<section class="hm-hero" aria-labelledby="hero-title">'
      + loopHtml
      + '<div class="hm-hero__media"><div class="hm-hero__media-in"' + kit.depth(0.06, 36) + '>' + photo + '</div></div>'
      + '<div class="hm-hero__wash" aria-hidden="true"></div>'
      + '<div class="container hm-hero__inner">'
      + '<div class="hm-hero__panel glass glass--hero">' + K(kick) + H(h1, { level: 1, cls: 'display hm-hero__title', id: 'hero-title', swoosh: true })
      + (lead.length ? '<div class="lead hm-hero__lead">' + J(lead) + '</div>' : '')
      + kit.buttonGroup([...btns, kit.call]) + '</div>'
      + '</div>'
      + '<div class="container hm-hero__locwrap">' + kit.locationCard({ cls: 'hm-hero__loc' }) + '</div>'
      /* lazy (QA round 1, CSP-13): on phones it starts below the fold (top 952 at 390x844); on desktop Chrome's lazy
         threshold still fetches it at once */
      + kit.cutout('cut-eyeglasses-tortoise', { cls: 'hm-hero__cutout', depth: -0.12, depthMax: 44, rotate: -7, sizes: '(min-width: 1024px) 39vw, 66vw', loading: 'lazy' })
      + toggle
      + '</section>');
    if (M.block('x5ehTikftR')) out.push(kit.seam());
  }

  /* ============================================================================ H2 about [GWjKxg2mVk] (divider HFHRMpqUA9 = the arch highlight) */
  {
    const b = M.block('GWjKxg2mVk');
    const img = M.image(b);
    const kick = M.kicker(b), h = M.heading(b), body = M.html(b), btns = M.buttons(b);
    out.push('<section class="section hm-about" aria-labelledby="about-title">'
      + '<div class="hm-about__band">' + (img ? kit.picture(img.file, { alt: img.alt, frame: 'fill', cls: 'hm-about__media', sizes: '(min-width: 768px) 70vw, 100vw', position: '58% 32%', depth: 0.05, depthMax: 30 }) : '') + '</div>'
      + '<div class="container hm-about__grid"><div class="hm-about__card glass glass--strong"' + kit.reveal('up') + '>'
      + K(kick) + H(h, { level: h ? h.level || 2 : 2, cls: 'h2', id: 'about-title', phrase: 'Different' }) + J(body) + kit.buttonGroup(btns)
      + '</div></div></section>');
  }

  /* ============================================================================ H3 services [NtZB3XNUK0] + /services/ cards, eye window (G3), navy floor (G5) */
  {
    const b = M.block('NtZB3XNUK0');
    const img = M.image(b);
    const kick = M.kicker(b), h = M.heading(b), body = M.html(b), btns = M.buttons(b);
    const hub = other(ctx, '/services/');
    const cp = nodesOf(hub).find((x) => x.n.t === 'list' && x.n.kind === 'childpages');
    const cards = cp ? cp.n.items.map((it) => ({ href: it.href, title: it.title, excerpt: it.excerpt, image: it.image ? { file: it.image.file, alt: it.image.alt } : null })) : [];
    const eyewin = img ? '<figure class="eyewin"' + kit.reveal('scale') + '>'
      + '<div class="eyewin__photo"><div class="eyewin__photo-in"' + kit.depth(0.05, 24) + '>' + ctx.img(img.file, { alt: img.alt, sizes: '(min-width: 1024px) 60vw, 100vw', loading: 'lazy' }) + '</div></div>'
      + '<svg class="eyewin__art" viewBox="0 0 100 62" preserveAspectRatio="none" overflow="visible" aria-hidden="true" focusable="false"><path class="eyewin__lid" d="M-1.5 31C18 -3.5 82 -3.5 101.5 31"/><path class="eyewin__crescent" d="M4 40C24 74 74 76 97 44C76 68 28 66 4 40Z"/></svg>'
      + '<span class="eyewin__iris" aria-hidden="true"' + kit.depth(-0.12, 30) + '></span>'
      + '</figure>' : '';
    out.push('<section class="section hm-services" aria-labelledby="services-title">'
      + '<div class="container hm-services__intro">'
      + '<div class="hm-services__copy"' + kit.reveal('up') + '>' + K(kick) + H(h, { level: h ? h.level || 2 : 2, cls: 'h2 h2--xl', id: 'services-title', swoosh: true }) + J(body) + kit.buttonGroup(btns) + '</div>'
      + eyewin + '</div>'
      + (cards.length ? '<div class="hm-services__floor">' + kit.texture('tex-navy-glass', { cls: 'hm-services__floortex', opacity: 0.6 }) + '<div class="container">' + kit.cardGrid(cards, { cls: 'hm-svc-grid' }) + '</div></div>' : '')
      + '</section>');
  }

  /* ============================================================================ H4 dry eye [iOIKo2TXey] feature + seam */
  {
    const b = M.block('iOIKo2TXey');
    const img = M.image(b);
    const kick = M.kicker(b), h = M.heading(b), body = M.html(b), btns = M.buttons(b);
    out.push('<section class="section hm-feature hm-feature--dry" aria-labelledby="dry-title">'
      + (img ? kit.picture(img.file, { alt: img.alt, frame: 'fill', cls: 'hm-feature__media', sizes: '100vw', position: '64% 36%', depth: 0.07, depthMax: 40 }) : '')
      + '<div class="container hm-feature__inner"><div class="hm-feature__panel glass glass--strong"' + kit.reveal('left') + '>'
      + K(kick) + H(h, { level: h ? h.level || 3 : 3, cls: 'h2', id: 'dry-title' }) + J(body) + kit.buttonGroup(btns) + '</div></div></section>');
    if (M.block('X6ZumXe6er')) out.push(kit.seam());
  }

  /* ============================================================================ H5 kids [7XCqjs9uq5] smoked navy glass over photography (G4) + seam */
  {
    const b = M.block('7XCqjs9uq5');
    const h = M.heading(b), btns = M.buttons(b);
    const titleHtml = h ? (/<[a-z]/i.test(h.html) ? esc(h.text) : h.html) : '';
    const photoId = 'photo-as-522927551';
    out.push('<section class="section hm-kids" aria-labelledby="kids-title">'
      + kit.picture(photoId, { alt: masterAlt(ctx, photoId), frame: 'fill', cls: 'hm-kids__media', sizes: '100vw', position: '50% 28%', depth: 0.05, depthMax: 28 })
      + '<div class="hm-kids__shade" aria-hidden="true"></div>'
      + kit.cutout('cut-eyeglasses-navy', { cls: 'hm-kids__cutout', depth: -0.14, depthMax: 40, rotate: 9, sizes: '(min-width: 1024px) 28vw, 52vw' })
      + '<div class="container hm-kids__inner"><div class="hm-kids__panel glass glass--navy"' + kit.reveal('up') + '>'
      + (h ? kit.heading(titleHtml, { level: 2, cls: 'hm-kids__title', id: 'kids-title', phrase: 'easy and stress-free!', swoosh: true }) : '')
      + kit.buttonGroup(btns, { surface: 'navy' }) + '</div></div></section>');
    if (M.block('SjXCFCaVul')) out.push(kit.seam());
  }

  /* ============================================================================ H6 myopia [9hpxlmAR5u] split */
  {
    const b = M.block('9hpxlmAR5u');
    const img = M.image(b);
    const kick = M.kicker(b), h = M.heading(b), body = M.html(b), btns = M.buttons(b);
    out.push('<section class="section hm-split" aria-labelledby="myopia-title">'
      + (img ? kit.picture(img.file, { alt: img.alt, frame: 'lens-edge', cls: 'hm-split__media', sizes: '(min-width: 900px) 64vw, 100vw', position: '60% 30%', depth: 0.05, depthMax: 28, reveal: 'mask' }) : '')
      + '<div class="container hm-split__inner"><div class="hm-split__panel glass glass--strong"' + kit.reveal('right') + '>'
      + K(kick) + H(h, { level: h ? h.level || 3 : 3, cls: 'h2', id: 'myopia-title' }) + J(body) + kit.buttonGroup(btns) + '</div></div></section>');
  }

  /* ============================================================================ H7 eyewear [7fRYcVCvhz] arch + sunglasses across the seam + seam */
  {
    const b = M.block('7fRYcVCvhz');
    const img = M.image(b);
    const kick = M.kicker(b), h = M.heading(b), body = M.html(b), btns = M.buttons(b);
    out.push('<section class="section hm-eyewear" aria-labelledby="eyewear-title">'
      + '<div class="container hm-eyewear__grid">'
      + '<div class="hm-eyewear__copy"' + kit.reveal('up') + '>' + K(kick) + H(h, { level: h ? h.level || 3 : 3, cls: 'h2', id: 'eyewear-title', phrase: 'Same-Day' }) + leadFirst(J(body)) + kit.buttonGroup(btns) + '</div>'
      + '<div class="hm-eyewear__media">' + (img ? kit.picture(img.file, { alt: img.alt, frame: 'arch', cls: 'hm-eyewear__arch', sizes: '(min-width: 768px) 40vw, 90vw', position: '60% 50%', depth: 0.05, depthMax: 26, reveal: 'mask' }) : '')
      + kit.cutout('cut-sunglasses-navy', { cls: 'hm-eyewear__cutout', depth: -0.16, depthMax: 48, rotate: -6, sizes: '(min-width: 1024px) 30vw, 50vw' })
      + '</div></div></section>');
    if (M.block('Pv9ZgSzHAP')) out.push(kit.seam());
  }

  /* ============================================================================ H8 contact lenses [S2rDVNy0FL] feature */
  {
    const b = M.block('S2rDVNy0FL');
    const img = M.image(b);
    const kick = M.kicker(b), h = M.heading(b), body = M.html(b), btns = M.buttons(b);
    out.push('<section class="section hm-feature hm-feature--contacts" aria-labelledby="contacts-title">'
      + (img ? kit.picture(img.file, { alt: img.alt, frame: 'fill', cls: 'hm-feature__media', sizes: '(min-width: 768px) 78vw, 100vw', position: '50% 30%', depth: 0.07, depthMax: 40 }) : '')
      + '<div class="container hm-feature__inner"><div class="hm-feature__panel glass glass--strong"' + kit.reveal('right') + '>'
      + K(kick) + H(h, { level: h ? h.level || 3 : 3, cls: 'h2', id: 'contacts-title' }) + J(body) + kit.buttonGroup(btns) + '</div></div></section>');
  }

  /* ============================================================================ H9 doctors (cross-page /our-doctors/ block 2): navy intro + P-row cards */
  {
    const docs = other(ctx, '/our-doctors/');
    const blk = docs ? docs.blocks.find((x) => x.nodes.some((n) => n.t === 'team' && n.kind === 'list')) : null;
    if (blk) {
      const ns = blk.nodes;
      const kick = ns.find((n) => n.t === 'html' && n.hint === 'kicker');
      const heads = ns.filter((n) => n.t === 'heading');
      const para = ns.find((n) => n.t === 'html' && n.hint !== 'kicker');
      const team = ns.find((n) => n.t === 'team' && n.kind === 'list');
      out.push('<section class="section hm-team" aria-labelledby="team-title">'
        + '<div class="hm-team__navy">' + kit.texture('tex-navy-glass', { cls: 'hm-team__tex', opacity: 0.25 })
        + '<div class="container hm-team__head"' + kit.reveal('up') + '>' + (kick ? kit.eyebrow(kick.html) : '')
        + (heads[0] ? kit.heading(heads[0].html, { level: 2, cls: 'h2 hm-team__title', id: 'team-title' }) : '')
        + (para ? '<div class="designed hm-team__statement">' + kit.mark(para.html) + '</div>' : '')
        + (heads[1] ? kit.heading(heads[1].html, { level: 2, cls: 'hm-team__sub', accent: false }) : '')
        + '</div></div>'
        + '<div class="container"><ul class="doc-grid hm-team__grid"' + kit.stagger() + '>' + team.items.map((it) => kit.docCard(it)).join('') + '</ul></div>'
        + '</section>');
    }
  }

  /* ============================================================================ H10 insurance (cross-page /insurance/): tint glass over the cream texture */
  {
    const ins = other(ctx, '/insurance/');
    const all = nodesOf(ins);
    const listN = all.find((x) => x.n.t === 'list' && x.n.kind === 'insurance');
    if (listN) {
      const head = listN.b.nodes.find((n) => n.t === 'heading');
      const intro = all.map((x) => (x.n.t === 'html' ? paragraphStarting(x.n.html, 'Insurance can feel confusing') : null)).find(Boolean);
      const contact = all.find((x) => x.n.t === 'button' && x.n.label === 'Contact Us');
      out.push('<section class="section hm-ins" aria-labelledby="ins-title">' + kit.texture('tex-cream-light', { cls: 'hm-ins__tex', opacity: 0.9 })
        + '<div class="container"><div class="hm-ins__wrap glass glass--tint"' + kit.reveal('up') + '>'
        + '<div class="hm-ins__head">' + (head ? kit.heading(head.html, { level: 2, cls: 'h2', id: 'ins-title' }) : '') + (intro || '') + (contact ? kit.buttonGroup([contact.n]) : '') + '</div>'
        + kit.chips(listN.n.items, { cls: 'hm-ins__chips' })
        + '</div></div></section>');
    }
  }

  /* ============================================================================ H11 reviews (cross-page /reviews/): featured quote + two cards */
  {
    const rv = nodesOf(other(ctx, '/reviews/')).find((x) => x.n.t === 'reviews');
    if (rv) {
      const by = (a) => rv.n.items.find((r) => r.author === a) || null;
      const featured = by('Lisa M.');
      const small = [by('Alfred J.'), by('Christine G.')].filter(Boolean);
      const reviewsNav = ctx.nav.find((n) => n.href === '/reviews/');
      if (featured || small.length) {
        out.push('<section class="section hm-reviews" aria-label="' + esc(reviewsNav ? reviewsNav.label : 'Reviews') + '">'
          + kit.picture('still-loop-lens-light', { alt: '', frame: 'fill', cls: 'hm-reviews__plane', sizes: '100vw', position: '66% 40%', depth: 0.05, depthMax: 30, attrs: { 'aria-hidden': 'true' } })
          + '<div class="container hm-reviews__grid">'
          + (featured ? '<div class="hm-reviews__feature glass glass--veil"' + kit.reveal('up') + '>' + kit.reviewCard(featured, { featured: true }) + '</div>' : '')
          + '<div class="hm-reviews__side">' + small.map((r) => '<div class="glass glass--strong hm-reviews__card"' + kit.reveal('up') + '>' + kit.reviewCard(r) + '</div>').join('')
          + (reviewsNav ? '<a class="arrow-link hm-reviews__more" href="' + esc(reviewsNav.href) + '">' + esc(reviewsNav.label) + kit.icon('arrow', 'arrow-link__icon') + '</a>' : '')
          + '</div></div></section>');
      }
    }
  }

  /* ============================================================================ H12 blog [blog-div seam] [blog-sec] post card */
  {
    if (M.block('blog-div')) out.push(kit.seam());
    const b = M.block('blog-sec');
    const h = M.heading(b);
    const articles = M.list(b, 'articles');
    const img = M.image(b);
    out.push('<section class="section hm-blog" aria-labelledby="blog-title"><div class="container">'
      + (h ? kit.heading(h.html, { level: h.level || 2, cls: 'h2 hm-blog__title', id: 'blog-title', attrs: { 'data-reveal': 'up' } }) : '')
      + (articles ? articles.items.map((it, i) => kit.postCard(it, { image: i === 0 && img ? img.file : null, alt: img ? img.alt : '', cls: 'hm-post' })).join('') : '')
      + (!articles && img ? kit.picture(img.file, { alt: img.alt }) : '')
      + '</div></section>');
  }

  /* ============================================================================ H13 visit (cross-page /eye-doctor-pine-beach/ block 2) + postcards (G1) */
  {
    const town = other(ctx, ctx.site.contactPage);
    const blk = town ? town.blocks.find((x) => x.nodes.some((n) => n.t === 'heading' && n.level === 1)) : null;
    if (blk) {
      const h = blk.nodes.find((n) => n.t === 'heading');
      const paras = blk.nodes.filter((n) => n.t === 'html' && n.hint !== 'kicker');
      const btns = blk.nodes.filter((n) => n.t === 'button');
      const mural = 'practice-35050-f516a054', night = 'practice-35052-53784670';
      out.push('<section class="hm-visit" aria-labelledby="visit-title">' + kit.texture('tex-cream-light', { cls: 'hm-visit__tex', opacity: 0.85 })
        + '<div class="container hm-visit__grid">'
        + '<div class="hm-visit__card glass glass--strong"' + kit.reveal('up') + '>' + kit.heading(h.html, { level: 2, cls: 'h2', id: 'visit-title' }) + paras.map((n) => n.html).join('') + kit.buttonGroup(btns) + '</div>'
        + '<div class="hm-visit__cards">'
        + kit.postcard(mural, { alt: masterAlt(ctx, 'photo-2020-04-06'), tilt: 3, width: 400, cls: 'hm-postcard hm-postcard--a', sizes: '(min-width: 1024px) 400px, 64vw' })
        + kit.postcard(night, { alt: masterAlt(ctx, night), tilt: -4, width: 360, cls: 'hm-postcard hm-postcard--b', sizes: '(min-width: 1024px) 360px, 60vw' })
        + '</div></div></section>');
    }
  }

  /* ============================================================================ fail-safe: unconsumed home-model nodes */
  const rest = M.leftovers();
  if (rest.length) {
    console.warn('[theme] home.mjs: ' + rest.length + ' home-model node(s) were not placed by the composition and render in the fallback section: ' + rest.map((x) => x.b.id + '/' + x.n.t + ':' + x.n.id).join(', '));
    out.push('<section class="section hm-rest"><div class="container">' + rest.map(({ n }) => (n.t === 'html' ? n.html : n.t === 'heading' ? kit.heading(n.html, { level: n.level || 2, accent: false }) : n.t === 'button' ? kit.buttonGroup([n]) : n.t === 'image' ? kit.picture(n.file, { alt: n.alt }) : '')).join('') + '</div></section>');
  }
  return out.join('\n');
}
