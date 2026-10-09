// site.mjs - site constants and ctx.site / ctx.chrome (PIPELINE role, docs/BUILD-CONTRACT.md 3.2 and 4.3/4.4/4.8).
// Every value is read from src/content/source-chrome.json, facts/client-facts.json or src/content/restructure.json and
// cross-checked; nothing about the practice is typed in here except the constants the contract fixes.
export const ORIGIN = 'https://www.academyvisionnj.com';
/** Constant build date (BUILD-CONTRACT 3.1: no clock in the build; two builds must be byte-identical). */
export const BUILD_DATE = '2026-10-08';
/** @id of the ONE consolidated business JSON-LD block on every page (src/lib/seo.mjs). */
export const PRACTICE_ID = ORIGIN + '/#practice';
/** The header logo is shown at no more than 228 CSS px wide (BUILD-CONTRACT 4.11). */
export const LOGO_MAX_CSS_WIDTH = 228;

const fail = (msg) => { throw new Error('site.mjs: ' + msg); };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Drop the IA lane's `hold` flags (BUILD-CONTRACT 4.1: the full Eye Trends structure is built and linked). */
export function withoutHolds(v) {
  if (Array.isArray(v)) return v.map(withoutHolds);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) if (k !== 'hold') o[k] = withoutHolds(x);
    return o;
  }
  return v;
}

const isExternal = (href) => /^https?:\/\//i.test(href) && !href.startsWith(ORIGIN);

/** Add external/newTab to the decided CTA links: the scheduler opens in a new tab, as on the live site (4.4). */
function decorateLink(l, bookingHref) {
  const o = { ...l };
  if (isExternal(o.href)) { o.external = true; if (o.href === bookingHref) o.newTab = true; }
  return o;
}

export function buildSite({ sourceChrome: sc, facts, restructure, url }) {
  const p = facts.practice;
  if (p.name !== sc.brandName) fail('practice name ' + p.name + ' != chrome brandName ' + sc.brandName);
  /* 4.3: (732) 978-9306 everywhere */
  if (p.phone !== '(732) 978-9306' || sc.nap.phone !== p.phone || sc.nap.phoneHref !== 'tel:' + p.phoneTel) fail('phone facts disagree');
  /* 4.4: the source's scheduler, new tab */
  const bookingHref = p.booking.online;
  const topBook = sc.topbar.items.find((i) => i.label === 'Book Appointment');
  if (!topBook || topBook.href !== bookingHref || topBook.newTab !== true) fail('booking link in source chrome differs from facts');
  const hb = restructure.headerButtons.find((b) => b.label === 'Book Appointment');
  if (!hb || hb.href !== bookingHref) fail('restructure headerButtons booking link differs');
  const a = p.address;
  if (sc.nap.addressText !== a.display) fail('address text differs: ' + sc.nap.addressText + ' / ' + a.display);
  for (const k of ['street', 'locality', 'region', 'postalCode']) if (sc.nap.address[k] !== a[k]) fail('address.' + k + ' differs');
  if (JSON.stringify(sc.hours.map((h) => h.text)) !== JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => p.hours[d]))) fail('hours differ between chrome and facts');
  /* 4.8: keyless embed by name + address, never by place_id */
  const mapQuery = sc.nap.mapQuery;
  if (/place_id/i.test(mapQuery) || !mapQuery.includes(a.street)) fail('mapQuery must be name + address: ' + mapQuery);
  const mapEmbedSrc = 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&output=embed';
  const legalRow = restructure.footer.find((c) => c.role === 'legal');
  if (!legalRow) fail('restructure footer has no legal row');
  const site = {
    name: p.name,
    origin: ORIGIN,
    phone: { display: p.phone, href: 'tel:' + p.phoneTel, e164: p.phoneTel, jsonLd: '+1-' + p.phoneTel.slice(2, 5) + '-' + p.phoneTel.slice(5, 8) + '-' + p.phoneTel.slice(8) },
    address: { street: a.street, locality: a.locality, region: a.region, postalCode: a.postalCode, country: a.country, text: a.display },
    geo: a.geo ? { latitude: a.geo.lat, longitude: a.geo.lng } : null,
    hours: sc.hours.map((h) => ({ label: h.label, text: h.text, day: cap(h.label.replace(/:$/, '')) })),
    hoursSpec: p.hoursSpec,
    mapQuery,
    mapEmbedSrc,
    mapTitle: 'Google Map',
    mapsUrl: sc.nap.mapsUrl,
    mapsNewTab: sc.nap.mapsNewTab === true,
    booking: { label: 'Book Appointment', href: bookingHref, newTab: true, external: true },
    requestForm: url(p.booking.requestForm),
    registrationForm: url(p.booking.registrationForm),
    contactPage: url(p.booking.contactPage),
    badges: sc.badges.map((b) => ({ file: b.file, alt: b.alt, w: b.w, h: b.h })),
    legalLinks: withoutHolds(legalRow.links).map((l) => ({ label: l.label, href: l.href })),
    copyright: sc.copyright,
    social: sc.social,
    logo: { file: 'assets/brand/logo-master.png', alt: sc.header.logo.alt, w: 457, h: 98, maxCssWidth: LOGO_MAX_CSS_WIDTH },
  };
  if (site.phone.jsonLd !== '+1-732-978-9306') fail('jsonLd phone format: ' + site.phone.jsonLd);
  return site;
}

/** Source chrome labels the theme needs (verbatim; no source hrefs, which belong to the old structure). */
export function buildChrome(sc) {
  const heads = sc.footer.columns.map((c) => (c.nodes.find((n) => n.t === 'heading') || {}).text).filter(Boolean);
  return {
    brandName: sc.brandName,
    skipLink: sc.skipLink,
    homeAriaLabel: sc.header.homeAriaLabel,
    logoAlt: sc.header.logo.alt,
    menuUi: { open: sc.menu.ui.open, close: sc.menu.ui.close, toggle: sc.menu.ui.toggle, focusClose: sc.menu.ui.focusClose.label },
    footerHeadings: { contact: heads[0], locate: heads[1], hours: heads[2] },
  };
}

/** ctx.nav / footer / topbar / headerButtons / ctas from restructure.json with the holds removed (4.1). */
export function buildMenus(restructure, site) {
  const deco = (l) => decorateLink(l, site.booking.href);
  const navWalk = (items) => items.map((i) => { const o = deco(i); if (i.children) o.children = navWalk(i.children); return o; });
  return {
    nav: navWalk(withoutHolds(restructure.nav)),
    footer: withoutHolds(restructure.footer).map((c) => ({ ...c, links: c.links.map(deco) })),
    topbar: { label: restructure.topbar.label, href: restructure.topbar.href },
    headerButtons: restructure.headerButtons.map(deco),
    ctas: restructure.ctas.map((c) => deco({ role: c.role, label: c.label, href: c.href })),
  };
}
