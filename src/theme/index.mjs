// src/theme/index.mjs - the Academy Vision theme entry (THEME-CORE; BUILD-CONTRACT 3.2, DESIGN-SPEC §2, §9, §11.17).
// Exports styles, scripts, renderPage(page, ctx), render404(ctx). The document shell: <head> (ctx.seoHead, font + LCP
// preloads, fingerprinted CSS, deferred JS), skip link, ambient light layer, header (chrome.mjs), <main> from home.mjs
// (kind 'home') or THEME-TEMPLATES' templates.mjs renderMain(page, ctx, kit) (every other kind; see parts.mjs
// CONTRACT A), footer (chrome.mjs). Until templates.mjs exists, or if it fails to import, <main> comes from the theme
// stub's markup so the build never breaks (a warning names the reason). Env THEME_MAIN=stub forces that fallback.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createKit, esc } from './parts.mjs';
import { ambient, header, footer } from './chrome.mjs';
import { renderHome } from './home.mjs';
import * as stub from '../theme-stub/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '..');
const has = (dir, f) => fs.existsSync(path.join(SRC, dir, f));

/* THEME-CORE files always; THEME-TEMPLATES' files only when they exist (the build fails on a listed missing file) */
export const styles = ['tokens.css', 'base.css', 'glass.css', 'depth.css', 'motion.css', 'chrome.css', 'home.css',
  ...['interior.css', 'blocks.css', 'forms.css', 'special.css'].filter((f) => has('styles', f))];
export const scripts = ['site.js', ...['features.js'].filter((f) => has('scripts', f))];

/* ------------------------------------------------------------------------------------------------ templates.mjs */
let templates = null;
let templatesNote = '';
const TPL = path.join(HERE, 'templates.mjs');
if (process.env.THEME_MAIN === 'stub') templatesNote = 'THEME_MAIN=stub';
else if (!fs.existsSync(TPL)) templatesNote = 'src/theme/templates.mjs does not exist yet';
else {
  try {
    const m = await import(pathToFileURL(TPL).href);
    if (typeof m.renderMain === 'function') templates = m;
    else templatesNote = 'templates.mjs does not export renderMain';
  } catch (e) { templatesNote = 'templates.mjs failed to import: ' + (e && e.message ? e.message.split('\n')[0] : String(e)); }
}
if (!templates) console.warn('[theme] non-home <main> uses the stub markup: ' + templatesNote);
/** for reports: which renderer produced <main> on non-home pages */
export const mainRenderer = templates ? 'templates.mjs' : 'theme-stub (' + templatesNote + ')';

const MAIN_OPEN = '<main id="main-content" tabindex="-1">';
function stubMain(page, ctx) {
  const html = stub.renderPage(page, ctx);
  const a = html.indexOf(MAIN_OPEN);
  const b = html.lastIndexOf('</main>');
  return a === -1 || b === -1 ? '' : html.slice(a + MAIN_OPEN.length, b).trim();
}

/* ------------------------------------------------------------------------------------------------ document */
/* DESIGN-SPEC 3.2: preload Montserrat latin, Libre Baskerville latin and italic (fingerprinted by the build) */
const FONT_PRELOADS = ['JTUSjIg1_i6t8kCHKm459Wlhyw.woff2', 'kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4iDgNP.woff2', 'libre-baskerville-italic-400-latin.woff2'];

function documentHtml({ ctx, kit, page, seo, main, bodyClass, home }) {
  const hdr = header(page, ctx, kit);
  const ftr = footer(page, ctx, kit, { home });
  const preload = [
    ...FONT_PRELOADS.map((f) => '<link rel="preload" href="' + esc(ctx.asset(f)) + '" as="font" type="font/woff2" crossorigin>'),
    ...kit._preloads().map((p) => '<link rel="preload" as="image" href="' + p.href + '"' + (p.imagesrcset ? ' imagesrcset="' + p.imagesrcset + '"' : '') + (p.imagesizes ? ' imagesizes="' + p.imagesizes + '"' : '') + ' fetchpriority="high">'),
  ];
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + seo + '\n'
    + '<meta name="theme-color" content="#f9f4f0">\n'
    + preload.join('\n') + '\n'
    + '<link rel="icon" type="image/png" href="' + esc(ctx.asset('favicon.png')) + '">\n'
    + '<link rel="stylesheet" href="' + esc(ctx.asset('site.css')) + '">\n'
    + '<script src="' + esc(ctx.asset('site.js')) + '" defer></script>\n'
    + '</head>\n<body class="' + esc(bodyClass) + '">\n'
    + '<a class="skip-link" href="' + esc(ctx.chrome.skipLink.href) + '">' + esc(ctx.chrome.skipLink.label) + '</a>\n'
    + ambient() + '\n' + hdr + '\n'
    + MAIN_OPEN + '\n' + main + '\n</main>\n'
    + ftr + '\n</body>\n</html>\n';
}

export function renderPage(page, ctx) {
  const kit = createKit(ctx, page);
  const home = page.kind === 'home';
  const main = home ? renderHome(page, ctx, kit) : templates ? templates.renderMain(page, ctx, kit) : stubMain(page, ctx);
  if (typeof main !== 'string') throw new Error('renderMain returned ' + typeof main + ' for ' + page.path);
  let extra = '';
  if (!home && templates && typeof templates.bodyClass === 'function') extra = String(templates.bodyClass(page, ctx) || '');
  const bodyClass = ['kind-' + page.kind, 'section-' + page.section, templates || home ? '' : 'main-stub', extra].filter(Boolean).join(' ');
  return documentHtml({ ctx, kit, page, seo: ctx.seoHead(page), main, bodyClass, home });
}

/* DESIGN-SPEC 11.17: texture title band with the declared UI heading "Page not found" (O10), the five Services group
   heads as glass link tiles, the CTA strip. Served at any depth, so every URL stays root-absolute (the build does not
   relativize 404.html). INTEGRATOR 2026-10-09: <main> comes from THEME-TEMPLATES' render404Main when templates.mjs is
   loaded (one owner for every non-home <main>; its tiles sit on the light pools, R-5 lowest backdrop range 0.190 vs
   0.141 at 1440x900 and 0.221 vs 0.152 at 390x844 for this file's own composition, kept below as the fallback). */
export function render404(ctx) {
  const pg = Object.freeze({ kind: '404', path: null, section: 'none', h1: 'Page not found', breadcrumbs: [], generated: {}, related: [] });
  const kit = createKit(ctx, pg);
  const services = ctx.nav.find((n) => (n.children || []).some((g) => g.group === true));
  const tiles = services ? services.children.filter((g) => g.group === true).map((g) => ({ href: g.href, title: g.label })) : [];
  const main = templates && typeof templates.render404Main === 'function' ? templates.render404Main(ctx, kit)
    : kit.titleBand(pg, { variant: 'texture', compact: true })
    + kit.section({ cls: 'nf-tiles', label: services ? services.label : null }, kit.cardGrid(tiles, { cls: 'card-grid--tiles', level: 2 }))
    + kit.ctaStrip();
  if (typeof main !== 'string') throw new Error('render404Main returned ' + typeof main);
  const seo = '<title>' + esc('Page not found | ' + ctx.site.name) + '</title>\n<meta name="robots" content="noindex">';
  return documentHtml({ ctx, kit, page: pg, seo, main, bodyClass: 'kind-404 section-none', home: false });
}
