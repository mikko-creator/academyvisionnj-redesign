// seo.mjs - title, description, canonical, Open Graph and JSON-LD per page (PIPELINE role).
// Source pages: title and description from model.meta; adopted pages: from their JSON. Canonical = the live origin +
// the NEW path (self, BUILD-CONTRACT 4.6). og:url is the canonical; og:image is kept only when it resolves to an image
// this site serves, rewritten to our variant URL. JSON-LD keeps the source's blocks EXCEPT the business-entity blocks
// (Optician / Optometrist / LocalBusiness / MedicalClinic / MedicalBusiness, and the invalid "MedicalSpecialty ::
// Optometric" business block), which are replaced by ONE consolidated block built only from facts on the live site;
// the reviews page keeps the source location block's review[] and aggregateRating on it; a BreadcrumbList is added;
// every URL is remapped. Nested business entities inside kept blocks become a reference to the consolidated block.
import { ORIGIN, PRACTICE_ID } from './site.mjs';
import { esc, jsonForScript } from './util.mjs';

export const BUSINESS_TYPES = new Set(['LocalBusiness', 'MedicalBusiness', 'Optician', 'Optometrist', 'MedicalClinic', 'MedicalSpecialty :: Optometric']);
const NESTED_BUSINESS_TYPES = new Set([...BUSINESS_TYPES, 'MedicalOrganization']);
export const CONSOLIDATED_TYPE = ['Optometrist', 'Optician'];
const IMAGE_KEYS = new Set(['image', 'logo', 'thumbnailUrl', 'contentUrl']);
const ORIGIN_URL_RE = /^https?:\/\/(?:www\.)?academyvisionnj\.com(?=[/?#]|$)/i;
/* QA round 1 (CSP-8): the source's JSON-LD strings carried HTML entities ("practice&rsquo;s", "Specialties &amp;
   Interests"), which JSON consumers read literally; strings are decoded to the characters they stand for */
const ENT = { amp: '&', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', quot: '"', apos: "'", reg: '®', trade: '™', copy: '©' };
export const decodeEntities = (s) => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => (ENT[n.toLowerCase()] !== undefined ? ENT[n.toLowerCase()] : m));

export const typesOf = (o) => [].concat((o && o['@type']) || []);
const hasType = (o, set) => typesOf(o).some((t) => set.has(t));

/** The ONE business block (facts only: name, url, logo, image, telephone, address, geo when the source has it, hours). */
export function businessBlock(site, logoUrl, extra = {}) {
  const b = {
    '@context': 'https://schema.org',
    '@type': CONSOLIDATED_TYPE,
    '@id': PRACTICE_ID,
    name: site.name,
    url: ORIGIN + '/',
    logo: logoUrl,
    image: logoUrl,
    telephone: site.phone.jsonLd,
    address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.locality, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: site.address.country },
  };
  if (site.geo) b.geo = { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude };
  b.openingHoursSpecification = site.hoursSpec.map((s) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: s.days.length === 1 ? s.days[0] : s.days, opens: s.opens, closes: s.closes }));
  if (extra.aggregateRating) b.aggregateRating = extra.aggregateRating;
  if (extra.review) b.review = extra.review;
  return b;
}

export function breadcrumbBlock(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: ORIGIN + c.href })),
  };
}

/**
 * page: { path, canonical, h1, breadcrumbs, kind } ; raw: source model (or null) ; adopted: adopted JSON (or null)
 * deps: { site, absolute(p), resolveImageUrl(u, width), logoUrl, editText(s, where) }
 */
export function seoFor(page, raw, adopted, deps) {
  const report = { removedBlocks: [], keptBlocks: [], nestedBusinessRefs: 0, droppedImages: [], rewrittenImages: 0, reviewsCarried: 0 };
  const canonical = ORIGIN + page.path;
  let title, metaDescription, og, robots = null, verification = null;
  const jsonLd = [];
  let reviewsExtra = {};

  if (raw) {
    title = deps.editText(String(raw.meta.title || '').trim(), 'title');
    metaDescription = deps.editText(String(raw.meta.description || '').trim(), 'description');
    robots = raw.meta.robots || null;
    verification = raw.meta.verification || null;
    og = {};
    for (const [k, v] of Object.entries(raw.meta.og || {})) og[k] = typeof v === 'string' ? v.trim() : v;
    og.url = canonical;
    if (og.description) og.description = deps.editText(og.description, 'og:description');
    if (og.title) og.title = deps.editText(og.title, 'og:title');
    if (og.image) {
      const u = deps.resolveImageUrl(og.image, 1200);
      if (u) { og.image = u; report.rewrittenImages++; } else { report.droppedImages.push('og:image ' + og.image); delete og.image; }
    }

    /* JSON-LD */
    const transform = (v, key, nested) => {
      if (typeof v === 'string') {
        if (ORIGIN_URL_RE.test(v)) return deps.absolute(v);
        if (IMAGE_KEYS.has(key) && /^https?:\/\//i.test(v)) {
          const u = deps.resolveImageUrl(v, 1200);
          if (u) { report.rewrittenImages++; return u; }
          report.droppedImages.push(key + ' ' + v);
          return undefined;
        }
        return decodeEntities(v);
      }
      if (Array.isArray(v)) return v.map((x) => transform(x, key, true)).filter((x) => x !== undefined);
      if (v && typeof v === 'object') {
        if (nested && hasType(v, NESTED_BUSINESS_TYPES)) { report.nestedBusinessRefs++; return { '@id': PRACTICE_ID }; }
        const isImageObject = typesOf(v).includes('ImageObject');
        const o = {};
        for (const [k, x] of Object.entries(v)) {
          const t = transform(x, isImageObject && k === 'url' ? 'image' : k, true);
          if (t !== undefined) o[k] = t;
        }
        if (isImageObject && o.url === undefined) return undefined;
        return o;
      }
      return v;
    };
    let insertAt = -1;
    for (const block of raw.meta.jsonLd || []) {
      if (Array.isArray(block['@graph'])) {
        const keep = [];
        for (const n of block['@graph']) {
          if (hasType(n, BUSINESS_TYPES)) {
            report.removedBlocks.push('@graph:' + typesOf(n).join('+'));
            if (n.review) { reviewsExtra.review = n.review; report.reviewsCarried = n.review.length; }
            if (n.aggregateRating) reviewsExtra.aggregateRating = n.aggregateRating;
            if (insertAt === -1) insertAt = jsonLd.length;
          } else keep.push(n);
        }
        if (keep.length) {
          const b = { ...block, '@graph': keep.map((n) => transform(n, '@graph', false)) };
          jsonLd.push(b);
          report.keptBlocks.push('@graph[' + keep.map((n) => typesOf(n).join('+')).join(',') + ']');
        }
      } else if (hasType(block, BUSINESS_TYPES)) {
        report.removedBlocks.push(typesOf(block).join('+'));
        if (block.review) { reviewsExtra.review = block.review; report.reviewsCarried = block.review.length; }
        if (block.aggregateRating) reviewsExtra.aggregateRating = block.aggregateRating;
        if (insertAt === -1) insertAt = jsonLd.length;
      } else {
        const b = transform(block, null, false);
        /* BlogPosting.mainEntityOfPage pointed at the site root on the source; the article's own canonical is meant */
        if (typesOf(b).includes('BlogPosting') && b.mainEntityOfPage && typeof b.mainEntityOfPage === 'object') b.mainEntityOfPage = { ...b.mainEntityOfPage, '@id': canonical };
        jsonLd.push(b);
        report.keptBlocks.push(typesOf(block).join('+'));
      }
    }
    if (page.kind !== 'reviews') reviewsExtra = {};
    const biz = businessBlock(deps.site, deps.logoUrl, reviewsExtra);
    if (insertAt === -1) jsonLd.push(biz); else jsonLd.splice(insertAt, 0, biz);
  } else {
    title = String(adopted.title || '').trim();
    metaDescription = String(adopted.metaDescription || '').trim();
    og = { url: canonical, type: 'website', title, description: metaDescription, site_name: deps.site.name, locale: 'en_US' };
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': canonical, url: canonical, name: title, ...(metaDescription ? { description: metaDescription } : {}) });
    jsonLd.push(businessBlock(deps.site, deps.logoUrl));
  }
  jsonLd.push(breadcrumbBlock(page.breadcrumbs));
  return { title, metaDescription, canonical, og, jsonLd, robots, verification, report };
}

const OG_ORDER = ['type', 'url', 'title', 'description', 'site_name', 'locale', 'image'];

/** The SEO part of <head> for a page (ctx.seoHead). The theme may use it or print the same fields itself. */
export function seoHead(page) {
  const out = [];
  out.push('<title>' + esc(page.title) + '</title>');
  if (page.metaDescription) out.push('<meta name="description" content="' + esc(page.metaDescription) + '">');
  out.push('<link rel="canonical" href="' + esc(page.canonical) + '">');
  if (page.robots) out.push('<meta name="robots" content="' + esc(page.robots) + '">');
  if (page.verification && page.verification.google) out.push('<meta name="google-site-verification" content="' + esc(page.verification.google) + '">');
  if (page.verification && page.verification.bing) out.push('<meta name="msvalidate.01" content="' + esc(page.verification.bing) + '">');
  const keys = [...OG_ORDER.filter((k) => page.og[k] !== undefined), ...Object.keys(page.og).filter((k) => !OG_ORDER.includes(k)).sort()];
  for (const k of keys) out.push('<meta property="og:' + esc(k) + '" content="' + esc(page.og[k]) + '">');
  /* QA round 1 (CSP-5): no page had a twitter:card; with an og:image the large-image card applies */
  if (page.og && page.og.image) out.push('<meta name="twitter:card" content="summary_large_image">');
  for (const b of page.jsonLd) out.push('<script type="application/ld+json">' + jsonForScript(b) + '</script>');
  return out.join('\n');
}
