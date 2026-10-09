// images.mjs - ctx.img / ctx.imgSrc (PIPELINE role, docs/BUILD-CONTRACT.md 3.2).
// WebP variants with cwebp at widths 320-2400 (never wider than the source), quality 78, cached in assets/optimized/
// under a key of (source sha256, width, quality, AI label, cwebp version), so a rebuild re-encodes nothing and copies
// byte-identical files. Every variant made from a file under assets/generated/ gets an IPTC "trainedAlgorithmicMedia"
// XMP chunk (tools/ai-label.xmp) attached with webpmux. ctx.img is synchronous: it registers the variants it names
// and returns the <img> markup at once; flush() encodes what the cache does not hold yet and copies all of it to dist.
// A generated slot with no file yet renders a styled empty frame carrying data-slot (never a broken <img>).
import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { esc, sha256, pool } from './util.mjs';

const run = promisify(execFile);
/* temp-file sequence for flush(): shared by every createImages() in this process (see flush) */
let TEMP_SEQ = 0;
export const QUALITY = 78;
export const LADDER = [320, 480, 640, 800, 1024, 1280, 1600, 2000, 2400];
export const MAX_WIDTH = 2400;
const IMG_EXT = ['.webp', '.png', '.jpg', '.jpeg'];

/* ---------------------------------------------------------------- image headers (PNG, JPEG, WebP, GIF, SVG) */
export function imageInfo(buf, name = '') {
  const u16be = (o) => buf.readUInt16BE(o);
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { type: 'png', w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'GIF') return { type: 'gif', w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  if (buf.length > 30 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    const fourcc = buf.toString('latin1', 12, 16);
    if (fourcc === 'VP8 ') return { type: 'webp', w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (fourcc === 'VP8L') { const b = buf.readUInt32LE(21); return { type: 'webp', w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
    if (fourcc === 'VP8X') return { type: 'webp', w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
    throw new Error('unknown WebP chunk ' + fourcc + ' in ' + name);
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let o = 2, orientation = 1;
    while (o + 4 < buf.length) {
      if (buf[o] !== 0xff) { o++; continue; }
      const marker = buf[o + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { o += 2; continue; }
      const len = u16be(o + 2);
      if (marker === 0xe1 && buf.toString('latin1', o + 4, o + 10) === 'Exif\0\0') orientation = exifOrientation(buf, o + 10) || 1;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { type: 'jpeg', h: u16be(o + 5), w: u16be(o + 7), orientation };
      }
      o += 2 + len;
    }
    throw new Error('no JPEG frame header in ' + name);
  }
  const head = buf.toString('utf8', 0, Math.min(buf.length, 4096));
  if (/<svg\b/i.test(head)) {
    const tag = head.match(/<svg\b[^>]*>/i)[0];
    const num = (a) => { const m = tag.match(new RegExp('\\s' + a + '\\s*=\\s*["\']\\s*([\\d.]+)(px)?\\s*["\']', 'i')); return m ? Math.round(Number(m[1])) : null; };
    let w = num('width'), h = num('height');
    const vb = tag.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if ((!w || !h) && vb) { w = w || Math.round(Number(vb[1])); h = h || Math.round(Number(vb[2])); }
    return { type: 'svg', w: w || 0, h: h || 0 };
  }
  throw new Error('unrecognised image format: ' + name);
}
function exifOrientation(buf, t) {
  try {
    const le = buf.toString('latin1', t, t + 2) === 'II';
    const r16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
    const r32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
    const ifd = t + r32(t + 4);
    const n = r16(ifd);
    for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; if (r16(e) === 0x0112) return r16(e + 8); }
  } catch { /* malformed EXIF: treat as no orientation */ }
  return null;
}

/** "05da6128-AdobeStock_493468092.jpeg-w_2000.webp" -> "adobestock-493468092" (platform tokens stripped). */
export function baseName(rel) {
  let s = path.posix.basename(rel).replace(/^[0-9a-f]{8}-/, '');
  s = s.replace(/(\.(png|jpe?g|webp|gif|svg))?-w_\d+(\.(png|jpe?g|webp|gif|svg))?$/i, '').replace(/\.(png|jpe?g|webp|gif|svg)$/i, '');
  s = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^|-)(ecp|cpt|patientengage|eyecarepro|sitebuilder)(?=-|$)/g, '$1').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return (s || 'img').slice(0, 48).replace(/-$/, '');
}

export function createImages({ root, cacheDir, xmpPath, imagePlan, generatedRecord, imageMasters, removedFiles, quality = QUALITY }) {
  const cwebpVersion = execFileSync('cwebp', ['-version'], { encoding: 'utf8' }).trim().split(/\s+/)[0];
  const xmp = fs.readFileSync(xmpPath);
  const xmpSha = sha256(xmp);
  if (!xmp.includes('trainedAlgorithmicMedia')) throw new Error('images.mjs: ' + xmpPath + ' does not carry trainedAlgorithmicMedia');
  const removed = new Set(removedFiles);
  const planById = new Map();
  for (const it of imagePlan.images || []) planById.set(it.id, { ...it, list: 'images' });
  for (const it of imagePlan.optionalImages || []) planById.set(it.id, { ...it, list: 'optionalImages' });
  const masterById = new Map(imageMasters.map((m) => [m.id, m]));
  const recById = new Map(((generatedRecord && generatedRecord.images) || []).map((r) => [r.id, r]));

  const info = new Map();        // rel -> { sha, w, h, type, orientation, bytes }
  const jobs = new Map();        // cache key -> job
  const svgCopies = new Map();   // dist rel -> source rel
  const errors = [];
  const warnings = [];
  const placeholders = new Map();   // slot -> count
  const refsUsed = new Map();       // source rel -> count of img()/imgSrc() calls

  function fileInfo(rel) {
    if (info.has(rel)) return info.get(rel);
    const abs = path.join(root, rel);
    const buf = fs.readFileSync(abs);
    const i = { ...imageInfo(buf, rel), sha: sha256(buf), bytes: buf.length };
    if (i.type === 'jpeg' && i.orientation && i.orientation !== 1) throw new Error('EXIF orientation ' + i.orientation + ' on ' + rel + ' (cwebp ignores it; the variant would be rotated)');
    if (i.type === 'gif') throw new Error('GIF sources are not supported (cwebp cannot read them): ' + rel);
    info.set(rel, i);
    return i;
  }

  /* Reuse slots (INTEGRATOR 2026-10-09, OPEN-DECISIONS A7): a plan slot with "reuse": "<image-masters id>" resolves to
     that master's own file (a real photograph): no AI label, no data-ai-generated, never copied into assets/generated/,
     variants named after the master (so they are the same files the master's own pages use). Its alt is the plan's
     "reuseAlt". Fail closed: an unknown or removed master, a missing reuseAlt, or a slot that also has a delivered
     generated file is a build error. */
  const reuseOf = new Map();       // slot id -> master
  for (const [id, p] of planById) {
    if (p.reuse === undefined || p.reuse === null) continue;
    const m = masterById.get(p.reuse);
    if (!m || !m.file) { errors.push('image-plan slot ' + id + ' reuses unknown image-masters id ' + JSON.stringify(p.reuse)); continue; }
    if (removed.has(m.file)) { errors.push('image-plan slot ' + id + ' reuses a removed image (BUILD-CONTRACT 4.7): ' + m.file); continue; }
    if (!fs.existsSync(path.join(root, m.file))) { errors.push('image-plan slot ' + id + ' reuses ' + m.id + ', whose file is missing: ' + m.file); continue; }
    if (typeof p.reuseAlt !== 'string' || !p.reuseAlt.trim()) { errors.push('image-plan slot ' + id + ' reuses ' + m.id + ' without a reuseAlt'); continue; }
    const r = recById.get(id);
    if (r && r.file) { errors.push('image-plan slot ' + id + ' has both a reuse master (' + m.id + ') and a delivered generated file (' + r.file + '): pick one'); continue; }
    reuseOf.set(id, m);
  }

  /** The file a generated slot resolves to: a reuse master's file, else audit/generated-images.json, else
      assets/generated/<slot>.<webp|png|jpg|jpeg>. */
  function slotFile(id) {
    if (reuseOf.has(id)) return reuseOf.get(id).file;
    if (planById.has(id) && planById.get(id).reuse != null) return null;   /* an invalid reuse slot (error listed above) */
    const r = recById.get(id);
    if (r && r.file && fs.existsSync(path.join(root, r.file))) return r.file;
    for (const ext of IMG_EXT) { const rel = 'assets/generated/' + id + ext; if (fs.existsSync(path.join(root, rel))) return rel; }
    return null;
  }
  function slotAlt(id) {
    if (reuseOf.has(id)) return planById.get(id).reuseAlt;
    const r = recById.get(id);
    if (r && typeof r.alt === 'string') return r.alt;
    const f = slotFile(id);
    if (f && fs.existsSync(path.join(root, f + '.json'))) { try { const s = JSON.parse(fs.readFileSync(path.join(root, f + '.json'), 'utf8')); if (typeof s.alt === 'string') return s.alt; } catch { /* sidecar unreadable */ } }
    const p = planById.get(id);
    return p && typeof p.alt === 'string' && !/^\(decorative\)$/.test(p.alt) ? p.alt : '';
  }

  /** ref -> { rel, generated, slot? } | { missingSlot } */
  function resolve(ref) {
    if (typeof ref !== 'string' || !ref) throw new Error('image ref must be a non-empty string, got ' + JSON.stringify(ref));
    if (!/[/.]/.test(ref)) {
      if (reuseOf.has(ref)) { const m = reuseOf.get(ref); return { ...resolve(m.file), slot: ref, reuse: m.id }; }
      if (planById.has(ref)) { const f = slotFile(ref); return f ? { rel: f, generated: true, slot: ref } : { missingSlot: ref }; }
      if (masterById.has(ref)) return resolve(masterById.get(ref).file);
      throw new Error('unknown image ref (not a path, image-plan slot or image-masters id): ' + ref);
    }
    const rel = ref.replace(/\\/g, '/').replace(/^\.?\//, '');
    if (rel.includes('..') || !rel.startsWith('assets/')) throw new Error('image ref must be a workspace path under assets/: ' + ref);
    if (removed.has(rel)) throw new Error('removed image (BUILD-CONTRACT 4.7) requested: ' + rel);
    if (!fs.existsSync(path.join(root, rel))) throw new Error('image file missing: ' + rel);
    return { rel, generated: rel.startsWith('assets/generated/') };
  }

  function widthsFor(srcW, req) {
    let ws = (req && req.length ? req : LADDER).map((w) => Math.min(Math.round(w), srcW, MAX_WIDTH)).filter((w) => w > 0);
    if (!req || !req.length) {
      const top = ws.length ? Math.max(...ws) : 0;
      if (srcW <= MAX_WIDTH && srcW > top * 1.15) ws.push(srcW);
      if (!ws.length) ws.push(Math.min(srcW, MAX_WIDTH));
    }
    return [...new Set(ws)].sort((a, b) => a - b);
  }

  function variant(r, width) {
    const i = fileInfo(r.rel);
    const label = r.generated;
    const key = sha256(['avnj-img-v1', i.sha, width, quality, label ? 'ai:' + xmpSha : 'plain', 'cwebp-' + cwebpVersion].join('|'));
    if (!jobs.has(key)) {
      // the first ref that names these bytes at this width names the file (render order is fixed, so this is too)
      const name = ((!r.reuse && r.slot) || baseName(r.rel)) + '-' + width + '.' + key.slice(0, 10) + '.webp';
      jobs.set(key, { key, src: r.rel, srcSha: i.sha, width, srcW: i.w, label, cache: path.join(cacheDir, key + '.webp'), distRel: 'assets/img/' + name });
    }
    const job = jobs.get(key);
    const h = Math.max(1, Math.round((i.h * width) / i.w));
    return { url: '/' + job.distRel, w: width, h };
  }
  function svgUrl(r) {
    const i = fileInfo(r.rel);
    const distRel = 'assets/img/' + baseName(r.rel) + '.' + i.sha.slice(0, 10) + '.svg';
    svgCopies.set(distRel, r.rel);
    return '/' + distRel;
  }
  const count = (rel) => refsUsed.set(rel, (refsUsed.get(rel) || 0) + 1);

  /** ctx.img(ref, { alt, sizes, cls, loading, fetchpriority, decoding, widths, width, height }) -> '<img ...>' */
  function img(ref, opts = {}) {
    let r;
    try { r = resolve(ref); } catch (e) { errors.push(String(e.message)); return '<!-- image error -->'; }
    if (r.missingSlot) {
      const id = r.missingSlot;
      placeholders.set(id, (placeholders.get(id) || 0) + 1);
      const p = planById.get(id);
      const [aw, ah] = String((p && p.aspect) || '16:9').split(':').map(Number);
      const alt = opts.alt !== undefined ? opts.alt : slotAlt(id);
      const a11y = alt ? ' role="img" aria-label="' + esc(alt) + '"' : ' aria-hidden="true"';
      return '<span class="img-slot' + (opts.cls ? ' ' + esc(opts.cls) : '') + '" data-slot="' + esc(id) + '"' + a11y + ' style="aspect-ratio:' + (aw || 16) + '/' + (ah || 9) + '"></span>';
    }
    let i;
    try { i = fileInfo(r.rel); } catch (e) { errors.push(String(e.message)); return '<!-- image error -->'; }
    count(r.rel);
    let alt = opts.alt;
    if (alt === undefined) { alt = r.slot ? slotAlt(r.slot) : ''; if (!r.slot) warnings.push('img() without alt: ' + r.rel); }
    const attrs = [];
    let W = i.w, H = i.h;
    if (i.type === 'svg') {
      attrs.push('src="' + esc(svgUrl(r)) + '"');
    } else {
      const vs = widthsFor(i.w, opts.widths).map((w) => variant(r, w));
      const fallback = vs.filter((v) => v.w <= 1024).pop() || vs[0];
      attrs.push('src="' + esc(fallback.url) + '"');
      if (vs.length > 1) attrs.push('srcset="' + esc(vs.map((v) => v.url + ' ' + v.w + 'w').join(', ')) + '"', 'sizes="' + esc(opts.sizes || '100vw') + '"');
      const top = vs[vs.length - 1];
      W = top.w; H = top.h;
    }
    if (opts.width) { H = Math.max(1, Math.round((H * opts.width) / W)); W = opts.width; }
    if (opts.height && !opts.width) { W = Math.max(1, Math.round((W * opts.height) / H)); H = opts.height; }
    if (W && H) attrs.push('width="' + W + '"', 'height="' + H + '"');
    attrs.push('alt="' + esc(alt) + '"');
    if (opts.cls) attrs.push('class="' + esc(opts.cls) + '"');
    attrs.push('loading="' + esc(opts.loading || 'lazy') + '"', 'decoding="' + esc(opts.decoding || 'async') + '"');
    if (opts.fetchpriority) attrs.push('fetchpriority="' + esc(opts.fetchpriority) + '"');
    if (r.generated) attrs.push('data-ai-generated="1"');
    return '<img ' + attrs.join(' ') + '>';
  }

  /** ctx.imgSrc(ref, width) -> URL of one variant (the smallest ladder width >= width, capped at the source); null for a slot with no file yet */
  function imgSrc(ref, width = 1600) {
    let r;
    try { r = resolve(ref); } catch (e) { errors.push(String(e.message)); return null; }
    if (r.missingSlot) { placeholders.set(r.missingSlot, (placeholders.get(r.missingSlot) || 0) + 1); return null; }
    let i;
    try { i = fileInfo(r.rel); } catch (e) { errors.push(String(e.message)); return null; }
    count(r.rel);
    if (i.type === 'svg') return svgUrl(r);
    const w = Math.min(LADDER.find((x) => x >= width) || MAX_WIDTH, i.w, MAX_WIDTH);
    return variant(r, w).url;
  }

  /** Source dimensions of a ref (null for a missing slot). */
  function size(ref) {
    try { const r = resolve(ref); if (r.missingSlot) return null; const i = fileInfo(r.rel); return { w: i.w, h: i.h, type: i.type }; } catch (e) { errors.push(String(e.message)); return null; }
  }

  /** Encode every variant the cache lacks, then copy all variants and SVGs into distDir. */
  async function flush(distDir, { concurrency = 8, log = () => {} } = {}) {
    fs.mkdirSync(cacheDir, { recursive: true });
    const all = [...jobs.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
    const todo = all.filter((j) => !fs.existsSync(j.cache));
    let made = 0;
    /* Two builds may encode the same new variant at once (a theme build and an integrator build while IMAGERY adds
       images). Temp names are unique per process and job, so they never share a temp file, and the first finished
       rename wins: a later identical result is dropped (cwebp + webpmux are deterministic, so both are the same bytes;
       a cache entry only ever appears by an atomic rename of a complete file). Temp names never reach the output. */
    const settle = (tmp, dest) => {
      try { fs.renameSync(tmp, dest); } catch (e) { if (fs.existsSync(dest)) fs.rmSync(tmp, { force: true }); else throw e; }
    };
    await pool(todo, concurrency, async (j) => {
      const tag = '.' + process.pid + '-' + (++TEMP_SEQ);
      const tmp = j.cache + tag + '.tmp.webp';
      const src = path.join(root, j.src);
      const a = ['-quiet', '-q', String(quality), '-metadata', 'none'];
      if (j.width !== j.srcW) a.push('-resize', String(j.width), '0');
      await run('cwebp', [...a, src, '-o', tmp], { windowsHide: true });
      if (j.label) {
        const tmp2 = j.cache + tag + '.tmp2.webp';
        await run('webpmux', ['-set', 'xmp', xmpPath, tmp, '-o', tmp2], { windowsHide: true });
        fs.rmSync(tmp);
        settle(tmp2, j.cache);
      } else settle(tmp, j.cache);
      made++;
      if (made % 50 === 0) log('  encoded ' + made + '/' + todo.length);
    });
    for (const j of all) {
      const out = path.join(distDir, j.distRel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.copyFileSync(j.cache, out);
    }
    for (const [distRel, rel] of [...svgCopies].sort()) {
      const out = path.join(distDir, distRel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.copyFileSync(path.join(root, rel), out);
    }
    return { variants: all.length, encoded: made, cached: all.length - made, svgs: svgCopies.size };
  }

  /** dist rel -> provenance, for the build report and tools/build-verify.mjs (check f, AI labels) */
  function manifest() {
    const m = {};
    for (const j of [...jobs.values()].sort((a, b) => (a.distRel < b.distRel ? -1 : 1))) m[j.distRel] = { src: j.src, srcSha: j.srcSha, width: j.width, aiLabel: j.label };
    for (const [d, rel] of [...svgCopies].sort()) m[d] = { src: rel, srcSha: info.get(rel).sha, width: null, aiLabel: false };
    return m;
  }

  const generatedSlots = {};
  for (const [id, p] of [...planById].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const f = slotFile(id);
    generatedSlots[id] = { exists: !!f, file: f, alt: slotAlt(id), role: p.role || null, aspect: p.aspect || null, usedOn: p.usedOn || null, list: p.list };
    if (reuseOf.has(id)) Object.assign(generatedSlots[id], { reuse: reuseOf.get(id).id, generated: false });
  }

  return { img, imgSrc, size, flush, manifest, errors, warnings, placeholders, refsUsed, generatedSlots, cwebpVersion, slotFile };
}
