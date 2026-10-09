#!/usr/bin/env node
// build.mjs - the Academy Vision build (PIPELINE role, docs/BUILD-CONTRACT.md 3.1). Node builtins only.
//   node src/build.mjs [--allow-missing-adopted] [--theme auto|theme|stub] [--out dist] [--adopted-dir src/content/adopted]
//                      [--concurrency 8] [--report tmp/pipeline/build-report.json] [--quiet]
// Loads every input, builds one page object per source page and adopted page (src/lib/pages.mjs), renders each with
// src/theme/index.mjs when it exists (else src/theme-stub/index.mjs), writes dist/<path>index.html (page-relative
// URLs), dist/404.html (root-relative), fingerprinted CSS/JS, fonts, brand files, image variants, sitemap.xml,
// robots.txt, _redirects and .htaccess. Two consecutive builds are byte-identical: no clock, no randomness, sorted
// inputs, a content-keyed image cache. Exit 1 (process.exitCode) on: a missing adopted page (unless
// --allow-missing-adopted), a dead internal link or asset, an unknown node type, a duplicate output path, a moved path
// still present as a page, a page without exactly one <h1>, or any other failed assertion listed in the output.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ORIGIN, BUILD_DATE, PRACTICE_ID, buildSite, buildChrome, buildMenus } from './lib/site.mjs';
import { createRemap } from './lib/remap.mjs';
import { createImages, imageInfo, MAX_WIDTH } from './lib/images.mjs';
import { seoFor, seoHead } from './lib/seo.mjs';
import { buildPages, regenerateSitemap, firstImageRef, cardExcerpts, excerptFor, REMOVED_IMAGE_MASTERS, PHONE_EDIT } from './lib/pages.mjs';
import { buildRedirects } from './lib/redirects.mjs';
import { sha256, readJson, writeFile, listFiles, relativizeHtml, relUrl, servedPath, ownPath } from './lib/util.mjs';
import { checkDist } from '../tools/link-check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (k) => argv.includes(k);
const opt = (k, d) => { const i = argv.indexOf(k); return i === -1 ? d : argv[i + 1]; };
const QUIET = flag('--quiet');
const log = (...a) => { if (!QUIET) console.log(...a); };
const R = (...p) => path.join(ROOT, ...p);

async function main() {
  const t0 = Date.now();
  const errors = [];
  const warnings = [];
  const OUT = path.resolve(ROOT, opt('--out', 'dist'));
  const relOut = path.relative(ROOT, OUT).split(path.sep).join('/');
  if (!(relOut === 'dist' || relOut.startsWith('tmp/'))) throw new Error('--out must be dist or a folder under tmp/: ' + OUT);
  const ADOPTED_DIR = path.resolve(ROOT, opt('--adopted-dir', 'src/content/adopted'));
  const REPORT = path.resolve(ROOT, opt('--report', 'tmp/pipeline/build-report.json'));
  const allowMissingAdopted = flag('--allow-missing-adopted');
  const concurrency = Number(opt('--concurrency', 8));

  /* ------------------------------------------------------------------ inputs */
  const restructure = readJson(R('src/content/restructure.json'));
  const sourceChrome = readJson(R('src/content/source-chrome.json'));
  const facts = readJson(R('facts/client-facts.json'));
  const imageMasters = readJson(R('src/content/image-masters.json'));
  const imagePlan = readJson(R('src/content/image-plan.json'));
  const generatedRecord = fs.existsSync(R('audit/generated-images.json')) ? readJson(R('audit/generated-images.json')) : null;
  const inventory = readJson(R('audit/image-inventory.json')).images;
  const PAGES_DIR = path.resolve(ROOT, opt('--pages-dir', 'src/content/pages'));   // tests may point at a planted copy
  const models = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json')).sort().map((f) => ({ slug: f.slice(0, -5), model: readJson(path.join(PAGES_DIR, f)) }));

  /* ------------------------------------------------------------------ theme */
  const themeMode = opt('--theme', 'auto');   // auto | theme | stub | <path to a theme module under the workspace (tests)>
  const realTheme = R('src/theme/index.mjs');
  const custom = !['auto', 'theme', 'stub'].includes(themeMode) ? path.resolve(ROOT, themeMode) : null;
  if (custom && (!custom.startsWith(ROOT + path.sep) || !fs.existsSync(custom))) throw new Error('--theme: no such theme module inside the workspace: ' + themeMode);
  const useReal = !custom && (themeMode === 'theme' || (themeMode === 'auto' && fs.existsSync(realTheme)));
  if (themeMode === 'theme' && !fs.existsSync(realTheme)) throw new Error('--theme theme but src/theme/index.mjs does not exist');
  const themeFile = custom || (useReal ? realTheme : R('src/theme-stub/index.mjs'));
  const theme = await import(pathToFileURL(themeFile).href);
  for (const k of ['renderPage', 'render404']) if (typeof theme[k] !== 'function') throw new Error(path.relative(ROOT, themeFile) + ' must export function ' + k);
  for (const k of ['styles', 'scripts']) if (!Array.isArray(theme[k])) throw new Error(path.relative(ROOT, themeFile) + ' must export array ' + k);
  const stylesDir = theme.assetDir ? fileURLToPath(theme.assetDir) : R('src/styles');
  const scriptsDir = theme.assetDir ? fileURLToPath(theme.assetDir) : R('src/scripts');
  log('theme: ' + path.relative(ROOT, themeFile).split(path.sep).join('/'));

  /* ------------------------------------------------------------------ remap + plan assertions */
  const remap = createRemap(restructure);
  const sourceOwn = models.map((m) => ownPath(m.model.path));
  const plan = remap.assertPlan({ sourceOwnPaths: sourceOwn, adoptedOwnPaths: restructure.adopt.map((a) => a.path) });
  errors.push(...plan.errors);
  remap.setPages([...sourceOwn.map((p) => servedPath(remap.remapOwn(p))), ...restructure.adopt.map((a) => servedPath(a.path))]);

  /* ------------------------------------------------------------------ site, chrome, menus */
  const site = buildSite({ sourceChrome, facts, restructure, url: remap.url });
  const chrome = buildChrome(sourceChrome);
  const menus = buildMenus(restructure, site);
  const homeGeo = ((models.find((m) => m.slug === 'index').model.meta.jsonLd || []).find((b) => b.geo) || {}).geo;
  if (!homeGeo || String(homeGeo.latitude) !== String(site.geo.latitude) || String(homeGeo.longitude) !== String(site.geo.longitude)) errors.push('geo in facts does not equal the source JSON-LD geo');

  /* ------------------------------------------------------------------ out dir */
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  /* ------------------------------------------------------------------ static assets: fonts, brand, css, js */
  const assetMap = new Map();      // name -> served URL
  const copies = new Map();        // dist rel -> source abs
  const fingerprint = (abs, dir, stem, ext) => { const h = sha256(fs.readFileSync(abs)).slice(0, 10); const rel = 'assets/' + dir + '/' + stem + '.' + h + ext; copies.set(rel, abs); return '/' + rel; };
  const fontUrl = new Map();       // font file name -> fingerprinted URL (CSS url() references are rewritten to it)
  for (const f of listFiles(R('assets/fonts'))) {
    if (!/\.(woff2?|ttf|otf)$/i.test(f) || f.includes('/')) continue;
    const ext = path.extname(f);
    const u = fingerprint(R('assets/fonts', f), 'fonts', f.slice(0, -ext.length), ext);
    assetMap.set(f, u);
    fontUrl.set(f, u);
  }
  const brandSrc = new Map();
  for (const f of listFiles(R('assets/brand'))) if (/\.(png|svg|webp|jpe?g|ico)$/i.test(f) && !f.includes('/')) brandSrc.set(f, R('assets/brand', f));
  const masterById = new Map(imageMasters.map((m) => [m.id, m]));
  const fav = masterById.get('icon-favicon');
  if (fav && fs.existsSync(R(fav.file))) brandSrc.set('favicon.png', R(fav.file)); else errors.push('favicon master file missing');
  const logo1200 = masterById.get('logo-academy-vision-1200');
  if (logo1200 && fs.existsSync(R(logo1200.file)) && imageInfo(fs.readFileSync(R(logo1200.file))).type === 'webp') brandSrc.set('logo-1200.webp', R(logo1200.file));
  else errors.push('logo-academy-vision-1200 is missing or not a WebP');
  const brandUrl = new Map();
  for (const [name, abs] of [...brandSrc].sort()) {
    const ext = path.extname(name);
    const u = fingerprint(abs, 'brand', name.slice(0, -ext.length), ext);
    assetMap.set(name, u);
    brandUrl.set(name, u);
  }
  if (!assetMap.has('logo-master.png')) errors.push('assets/brand/logo-master.png missing');
  const rewriteCss = (css) => css.replace(/url\(\s*(['"]?)([^'")]+?)\1\s*\)/g, (m, q, u) => {
    if (/^(data:|https?:|\/\/|#)/i.test(u)) return m;
    const base = u.split(/[?#]/)[0].split('/').pop();
    const tail = u.slice(u.split(/[?#]/)[0].length);   // keep ?#iefix-style suffixes
    if (fontUrl.has(base)) return 'url(' + q + fontUrl.get(base).replace(/^\/assets\//, '') + tail + q + ')';
    if (brandUrl.has(base)) return 'url(' + q + brandUrl.get(base).replace(/^\/assets\//, '') + tail + q + ')';
    if (u.startsWith('/')) return 'url(' + q + relUrl('/assets', u) + q + ')';
    return m;
  });
  const bundle = (list, dir, kind) => list.map((f) => {
    const abs = path.join(dir, f);
    if (!fs.existsSync(abs)) { errors.push(kind + ' file listed by the theme is missing: ' + path.relative(ROOT, abs)); return ''; }
    return '/* ' + f + ' */\n' + fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';
  }).join('\n');
  const css = rewriteCss(bundle(theme.styles, stylesDir, 'style'));
  const js = bundle(theme.scripts, scriptsDir, 'script');
  const cssRel = 'assets/site.' + sha256(css).slice(0, 10) + '.css';
  const jsRel = 'assets/site.' + sha256(js).slice(0, 10) + '.js';
  writeFile(path.join(OUT, cssRel), css);
  writeFile(path.join(OUT, jsRel), js);
  assetMap.set('site.css', '/' + cssRel);
  assetMap.set('site.js', '/' + jsRel);
  const assetErrors = [];
  function asset(name) {
    if (assetMap.has(name)) return assetMap.get(name);
    const rel = String(name).replace(/\\/g, '/').replace(/^\.?\//, '');
    if (rel.startsWith('assets/') && !rel.includes('..') && fs.existsSync(R(rel)) && fs.statSync(R(rel)).isFile()) {
      /* A generated STILL (e.g. a loop's poster frame) must carry the AI label like every ctx.img variant: it is served
         as its full-width labelled WebP variant (<= MAX_WIDTH, made by the image pipeline, listed in the manifest) and
         never as a verbatim, unlabelled copy (verifier fix V1). Videos and other files are still copied verbatim. */
      if (rel.startsWith('assets/generated/') && /\.(webp|png|jpe?g)$/i.test(rel)) {
        const u = images.imgSrc(rel, MAX_WIDTH);
        if (u) { assetMap.set(name, u); return u; }
        assetErrors.push('ctx.asset: generated image could not be served labelled: ' + name);
        return '/assets/missing-' + encodeURIComponent(String(name));
      }
      const ext = path.posix.extname(rel);
      const dir = rel.split('/')[1] === 'media' ? 'media' : 'files';
      const u = fingerprint(R(rel), dir, path.posix.basename(rel, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'file', ext);
      assetMap.set(name, u);
      return u;
    }
    assetErrors.push('ctx.asset: unknown asset ' + name);
    return '/assets/missing-' + encodeURIComponent(String(name));
  }
  const hasAsset = (name) => assetMap.has(name) || (/^assets\//.test(String(name)) && !String(name).includes('..') && fs.existsSync(R(String(name))));

  /* ------------------------------------------------------------------ images */
  const removedFiles = new Set();
  for (const id of REMOVED_IMAGE_MASTERS) {
    const m = masterById.get(id);
    if (!m) { errors.push('removed master not in image-masters.json: ' + id); continue; }
    removedFiles.add(m.file);
    const token = String(m.master).split('/').pop();
    for (const r of inventory) if (r.localFile && String(r.src).includes(token)) removedFiles.add(r.localFile);
  }
  const images = createImages({ root: ROOT, cacheDir: R('assets/optimized'), xmpPath: R('tools/ai-label.xmp'), imagePlan, generatedRecord, imageMasters, removedFiles: [...removedFiles] });
  const LOGO_URL = ORIGIN + assetMap.get('logo-1200.webp');
  const stripProto = (u) => String(u).replace(/^https?:\/\//, '');
  const masterByKey = new Map();
  for (const m of imageMasters) { masterByKey.set(m.master, m); for (const x of m.mergedMasters || []) masterByKey.set(typeof x === 'string' ? x : x.master, m); }
  const masterByFile = new Map(imageMasters.map((m) => [m.file, m]));
  const invBySrc = new Map(inventory.map((r) => [stripProto(r.src), r]));
  function resolveImageUrl(u, width) {
    const s = stripProto(u);
    let m = masterByKey.get(s.split('@w_')[0]) || null;
    const file = m ? m.file : (invBySrc.get(s) || {}).localFile;
    if (!file) return null;
    if (!m) m = masterByFile.get(file) || null;
    if (m && /^logo-academy-vision/.test(m.id)) return LOGO_URL;   // BUILD-CONTRACT 4.11: the current logo, never the legacy red mark
    if (removedFiles.has(file) || (m && REMOVED_IMAGE_MASTERS.includes(m.id))) return null;
    const v = images.imgSrc(file, width);
    return v ? ORIGIN + v : null;
  }

  /* ------------------------------------------------------------------ pages */
  const built = buildPages({ root: ROOT, restructure, models, adoptedDir: ADOPTED_DIR, allowMissingAdopted, remap, menus, imagePlan, removedFiles });
  errors.push(...built.errors);
  const { pages, byPath, byHref } = built;
  const sm = models.find((m) => m.slug === 'sitemap').model;
  const sourceLabelByNewPath = new Map();
  for (const b of sm.blocks) for (const n of b.nodes) if (n.t === 'list' && n.kind === 'sitemap') for (const it of n.items) sourceLabelByNewPath.set(remap.url(it.href), it.label);
  const regen = regenerateSitemap({ pages, byPath, menus, byHref, sourceLabelByNewPath });
  errors.push(...regen.errors);
  const smPage = byPath.get('/sitemap/');
  let smNodes = 0;
  if (smPage) for (const b of smPage.model.blocks) for (const n of b.nodes) if (n.t === 'list' && n.kind === 'sitemap') { n.items = regen.items; n.groups = regen.groups; n.regenerated = true; smNodes++; }
  if (smNodes !== 1) errors.push('expected one sitemap list node on /sitemap/, found ' + smNodes);

  const seoReport = {};
  const textEdits = [];
  for (const pg of pages.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
    const editText = (s, where) => {
      if (typeof s !== 'string' || !s.includes(PHONE_EDIT.from)) return s;
      textEdits.push(pg.path + ' ' + where);
      return s.split(PHONE_EDIT.from).join(PHONE_EDIT.to);
    };
    const seo = seoFor(pg, pg._raw, pg.adopted, { site, absolute: remap.absolute, resolveImageUrl, logoUrl: LOGO_URL, editText });
    Object.assign(pg, { title: seo.title, metaDescription: seo.metaDescription, canonical: seo.canonical, og: seo.og, jsonLd: seo.jsonLd, robots: seo.robots, verification: seo.verification });
    seoReport[pg.path] = seo.report;
    if (pg.model) pg.model.meta = { title: pg.title, description: pg.metaDescription, canonical: pg.canonical, robots: pg.robots, og: pg.og, jsonLd: pg.jsonLd, verification: pg.verification };
    delete pg._raw;
    const ld = JSON.stringify(pg.jsonLd);
    if (ld.includes('736-1700') || ld.includes('7327361700')) errors.push(pg.path + ': the second phone number is still in JSON-LD');
    const biz = pg.jsonLd.filter((b) => b['@id'] === PRACTICE_ID).length;
    if (biz !== 1) errors.push(pg.path + ': ' + biz + ' consolidated business blocks (expected 1)');
    if (!pg.title) errors.push(pg.path + ': no title');
  }
  const cards = cardExcerpts(pages);
  for (const pg of pages) {
    pg.related = pg.related.map((r) => {
      const t = byPath.get(r.href);
      const o = { label: r.label, href: r.href };
      const ex = t ? excerptFor(t, cards) : null;
      if (ex) o.excerpt = ex;
      const im = t ? firstImageRef(t, removedFiles) : null;
      if (im) o.image = im;
      return o;
    });
  }

  /* ------------------------------------------------------------------ ctx (frozen: a theme must not mutate shared data) */
  const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };
  const pagesByPath = Object.fromEntries([...byPath].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
  const ctx = {
    site, nav: menus.nav, footer: menus.footer, topbar: menus.topbar, headerButtons: menus.headerButtons, ctas: menus.ctas, chrome,
    origin: ORIGIN, buildDate: BUILD_DATE, facts, pagesByPath, imageMasters, generatedSlots: images.generatedSlots,
    url: remap.url, img: images.img, imgSrc: images.imgSrc, imgSize: images.size, asset, hasAsset, seoHead,
  };
  for (const k of ['site', 'nav', 'footer', 'topbar', 'headerButtons', 'ctas', 'chrome', 'facts', 'pagesByPath', 'imageMasters', 'generatedSlots']) deepFreeze(ctx[k]);
  Object.freeze(ctx);

  /* ------------------------------------------------------------------ render */
  const stripNonContent = (h) => h.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script\s*>/gi, '');
  const written = new Map();
  const renderErrors = [];
  for (const pg of [...pages].sort((a, b) => (a.path < b.path ? -1 : 1))) {
    let html;
    try { html = theme.renderPage(pg, ctx); } catch (e) { renderErrors.push('render ' + pg.path + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)); continue; }
    if (typeof html !== 'string' || !/^<!doctype html>/i.test(html.trimStart())) { renderErrors.push(pg.path + ': renderPage did not return an HTML document'); continue; }
    const h1 = (stripNonContent(html).match(/<h1[\s>]/gi) || []).length;
    if (h1 !== 1) errors.push(pg.path + ': ' + h1 + ' <h1> elements (expected exactly 1)');
    const rel = pg.path === '/' ? 'index.html' : ownPath(pg.path) + '/index.html';
    if (written.has(rel)) errors.push('duplicate output path ' + rel);
    written.set(rel, pg.path);
    writeFile(path.join(OUT, rel), relativizeHtml(html, pg.path));
  }
  let html404 = '';
  try { html404 = theme.render404(ctx); } catch (e) { renderErrors.push('render404: ' + (e && e.message)); }
  if (html404) {
    const h1 = (stripNonContent(html404).match(/<h1[\s>]/gi) || []).length;
    if (h1 !== 1) errors.push('404.html: ' + h1 + ' <h1> elements (expected exactly 1)');
    if (written.has('404.html')) errors.push('duplicate output path 404.html');
    writeFile(path.join(OUT, '404.html'), html404);
  }
  errors.push(...renderErrors);

  /* ------------------------------------------------------------------ sitemap.xml, robots.txt, redirects */
  const locs = [...byPath.keys()].sort();
  writeFile(path.join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + locs.map((p) => '  <url><loc>' + (ORIGIN + p).replace(/&/g, '&amp;') + '</loc></url>').join('\n') + '\n</urlset>\n');
  writeFile(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + ORIGIN + '/sitemap.xml\n');
  const red = buildRedirects(restructure, { pagePaths: locs, remapOwn: remap.remapOwn });
  errors.push(...red.errors);
  writeFile(path.join(OUT, '_redirects'), red.netlify);
  writeFile(path.join(OUT, '.htaccess'), red.htaccess);

  /* ------------------------------------------------------------------ images + copies */
  const imgStats = await images.flush(OUT, { concurrency, log });
  for (const [rel, abs] of [...copies].sort()) { fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true }); fs.copyFileSync(abs, path.join(OUT, rel)); }
  errors.push(...images.errors.map((e) => 'image: ' + e), ...assetErrors);
  warnings.push(...images.warnings);

  /* ------------------------------------------------------------------ post-build checks */
  for (const k of Object.keys(restructure.moves)) if (fs.existsSync(path.join(OUT, k, 'index.html'))) errors.push('moved path still present as a page: /' + k + '/');
  for (const [p, n] of [...remap.unknown].sort()) errors.push('dead internal link (not a page of the new site): ' + p + ' x' + n);
  const lc = checkDist(OUT);
  for (const b of lc.broken) errors.push('link-check: ' + b.file + ' ' + b.kind + ' ' + b.attr + '=' + b.value);
  if (!lc.control.fired) errors.push('link-check control did not fire: ' + JSON.stringify(lc.control));

  /* ------------------------------------------------------------------ report */
  const files = listFiles(OUT);
  const byKind = {}, bySection = {};
  for (const pg of pages) { byKind[pg.kind] = (byKind[pg.kind] || 0) + 1; bySection[pg.section] = (bySection[pg.section] || 0) + 1; }
  const inputFiles = [
    'src/content/restructure.json', 'src/content/source-chrome.json', 'facts/client-facts.json', 'src/content/image-masters.json', 'src/content/image-plan.json', 'tools/ai-label.xmp',
    ...(generatedRecord ? ['audit/generated-images.json'] : []),
    ...listFiles(PAGES_DIR).map((f) => path.relative(ROOT, path.join(PAGES_DIR, f)).split(path.sep).join('/')),
    ...listFiles(ADOPTED_DIR).map((f) => path.relative(ROOT, path.join(ADOPTED_DIR, f)).split(path.sep).join('/')),
    ...listFiles(R('assets/generated')).filter((f) => !f.includes('/')).map((f) => 'assets/generated/' + f),
    ...listFiles(R('src/lib')).map((f) => 'src/lib/' + f), 'src/build.mjs',
    ...listFiles(path.dirname(themeFile)).map((f) => path.relative(ROOT, path.join(path.dirname(themeFile), f)).split(path.sep).join('/')),
    ...(useReal ? [...listFiles(stylesDir).map((f) => path.relative(ROOT, path.join(stylesDir, f))), ...listFiles(scriptsDir).map((f) => path.relative(ROOT, path.join(scriptsDir, f)))] : []),
    /* every other file the build consumed (verifier fix V3: a changed font, brand file or source image used to change
       dist without changing this digest): the image inventory, the link checker the build gates on, every copied file
       (fonts, brand files, favicon, the 1200 px logo, ctx.asset copies) and every image a variant was made from */
    'audit/image-inventory.json', 'tools/link-check.mjs',
    ...[...copies.values()].map((abs) => path.relative(ROOT, abs)),
    ...Object.values(images.manifest()).map((m) => m.src),
  ].map((f) => f.split(path.sep).join('/'));
  const inputsDigest = sha256([...new Set(inputFiles)].sort().map((f) => f + '\0' + (fs.existsSync(R(f)) ? sha256(fs.readFileSync(R(f))) : '-')).join('\n'));
  const report = {
    schema: 'academyvision/build-report@1', buildDate: BUILD_DATE, out: relOut, theme: path.relative(ROOT, themeFile).split(path.sep).join('/'),
    allowMissingAdopted, inputsDigest,
    pages: pages.length, pagesWritten: written.size, page404: !!html404, byKind, bySection,
    plan: { pages: plan.pages, moved: plan.moved, kept: plan.kept },
    adopted: { found: pages.filter((p) => p.adopted && !p.adopted.placeholder).length, placeholders: built.report.adoptedPlaceholders, missing: built.report.adoptedMissing },
    hrefsRemapped: built.report.hrefsRemapped, phoneEdits: built.report.phoneEdits, metaTextEdits: textEdits, removedImages: built.report.removedImages, formHiddenDropped: built.report.formHiddenDropped,
    navSectionMismatches: built.report.navSectionMismatches,
    sitemap: { items: regen.items.length, groups: regen.groups.map((g) => g.id + ':' + g.items.length) },
    pageIndex: [...pages].sort((a, b) => (a.path < b.path ? -1 : 1)).map((p) => ({ path: p.path, kind: p.kind, section: p.section, slug: p.slug, sourcePath: p.sourcePath, h1: p.h1, title: p.title, breadcrumbs: p.breadcrumbs.map((c) => c.label).join(' > '), related: p.related.map((r) => r.href), generated: p.generated, ogImage: !!(p.og && p.og.image), jsonLd: p.jsonLd.map((b) => (b['@graph'] ? '@graph[' + b['@graph'].map((n) => [].concat(n['@type']).join('+')).join(',') + ']' : [].concat(b['@type']).join('+'))) })),
    images: { ...imgStats, placeholders: Object.fromEntries([...images.placeholders].sort()), sourcesUsed: images.refsUsed.size, cwebp: images.cwebpVersion },
    imageManifest: images.manifest(),
    removedImageFiles: [...removedFiles].sort(),
    seo: seoReport,
    redirects: red.rules.length,
    linkCheck: { files: lc.files, filesChecked: lc.filesChecked, localRefs: lc.localRefs, broken: lc.broken.length, externalHosts: lc.externalHosts, schemes: lc.schemes, control: lc.control.fired },
    distFiles: files.length,
    warnings: [...new Set(warnings)].sort(),
    errors,
  };
  writeFile(REPORT, JSON.stringify(report, null, 1) + '\n');

  log('pages ' + pages.length + ' (' + Object.entries(byKind).map(([k, n]) => k + ' ' + n).join(', ') + ') | written ' + written.size + ' + 404 ' + (html404 ? 1 : 0));
  log('adopted: ' + report.adopted.found + ' found, ' + report.adopted.placeholders.length + ' placeholders, ' + report.adopted.missing.length + ' missing');
  log('images: ' + imgStats.variants + ' variants (' + imgStats.encoded + ' encoded, ' + imgStats.cached + ' from cache), ' + imgStats.svgs + ' svg, slot placeholders ' + images.placeholders.size);
  log('link-check: ' + lc.localRefs + ' local refs, ' + lc.broken.length + ' broken, control ' + (lc.control.fired ? 'fired' : 'DID NOT FIRE') + ' | external: ' + Object.entries(lc.externalHosts).map(([h, n]) => h + ' ' + n).join(', '));
  log('dist files ' + files.length + ' | report ' + path.relative(ROOT, REPORT).split(path.sep).join('/') + ' | ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
  if (warnings.length) log('warnings: ' + [...new Set(warnings)].length + ' (see report)');
  if (errors.length) {
    console.error('BUILD FAILED: ' + errors.length + ' error(s)');
    for (const e of errors.slice(0, 60)) console.error('  - ' + e);
    if (errors.length > 60) console.error('  ... ' + (errors.length - 60) + ' more in the report');
    process.exitCode = 1;
  } else log('BUILD OK');
}

main().catch((e) => { console.error('BUILD CRASHED: ' + (e && e.stack ? e.stack : e)); process.exitCode = 1; });
