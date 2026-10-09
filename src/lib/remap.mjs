// remap.mjs - old Academy Vision paths -> the restructured site's paths (PIPELINE role).
// remap(p) = moves[p], else the longest moved prefix (its target + the rest), else p itself (identity for paths that
// are already new). docs/SITE-ARCHITECTURE.md section 4 and src/content/restructure.json `moves` / `conventions.moves`.
import { ORIGIN } from './site.mjs';
import { ownPath, servedPath } from './util.mjs';

const ORIGIN_RE = /^https?:\/\/(?:www\.)?academyvisionnj\.com(?=[/?#]|$)/i;
const FILE_RE = /\.[a-z0-9]{2,5}$/i;

export function createRemap(restructure) {
  const moves = restructure.moves;
  const keys = Object.keys(moves).sort((a, b) => b.length - a.length || (a < b ? -1 : 1));

  /** own path -> own path */
  function remapOwn(own) {
    const p = ownPath(own);
    if (Object.hasOwn(moves, p)) return moves[p];
    for (const k of keys) if (p.startsWith(k + '/')) return moves[k] + p.slice(k.length);
    return p;
  }
  /** the longest-prefix rule alone (without the explicit entry for p itself), for the consistency check */
  function prefixOnly(own) {
    const p = ownPath(own);
    for (const k of keys) if (p !== k && p.startsWith(k + '/')) return moves[k] + p.slice(k.length);
    return null;
  }

  const unknown = new Map();   // internal targets that are not pages of the new site -> count
  let knownPaths = null;       // Set of served paths, set by setPages()

  /**
   * ctx.url: any source or new path (own '' / 'a/b', served '/a/b/', absolute on the live origin, with ?query#hash)
   * -> the NEW served path. External URLs, tel:, mailto:, data:, javascript: and '#...' are returned unchanged.
   */
  function url(input) {
    if (input === null || input === undefined) return input;
    let s = String(input).trim();
    if (s === '') return '/';
    if (/^(tel:|mailto:|sms:|data:|javascript:|#)/i.test(s)) return s;
    if (ORIGIN_RE.test(s)) s = s.replace(ORIGIN_RE, '') || '/';
    else if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//')) return s;
    const m = s.match(/^([^?#]*)(.*)$/s);
    const own = ownPath(m[1]);
    const rest = m[2] || '';
    if (FILE_RE.test(own)) return '/' + own + rest;   // a file (asset) path keeps its form
    const served = servedPath(remapOwn(own));
    if (knownPaths && !knownPaths.has(served)) unknown.set(served, (unknown.get(served) || 0) + 1);
    return served + rest;
  }
  /** absolute URL on the live origin for a served path or any remappable path */
  const absolute = (p) => ORIGIN + url(p);

  function setPages(paths) { knownPaths = new Set(paths); }

  /**
   * Structural assertions (fail closed): explicit moves agree with the longest-prefix rule where restructure.json
   * says the move is "longest-prefix"; every new path maps to itself; no two pages share a path; no page sits on a
   * path that a moved page left; every redirect target is a page; counts match restructure.counts.
   */
  function assertPlan({ sourceOwnPaths, adoptedOwnPaths }) {
    const errs = [];
    for (const [k, kind] of Object.entries(restructure.moveKind || {})) {
      if (/^longest-prefix/.test(kind)) {
        const d = prefixOnly(k);
        if (d !== moves[k]) errs.push('moves[' + k + '] = ' + moves[k] + ' but the longest-prefix rule gives ' + d);
      }
    }
    const src = new Set(sourceOwnPaths);
    for (const k of Object.keys(moves)) if (!src.has(k)) errs.push('moves key is not a crawled page: ' + k);
    const newOf = sourceOwnPaths.map(remapOwn);
    const all = [...newOf, ...adoptedOwnPaths];
    const seen = new Map();
    for (const p of all) seen.set(p, (seen.get(p) || 0) + 1);
    for (const [p, n] of seen) if (n > 1) errs.push('collision: ' + n + ' pages on /' + p + '/');
    for (const p of all) if (remapOwn(p) !== p) errs.push('new path is not a fixed point of remap: ' + p + ' -> ' + remapOwn(p));
    for (const k of Object.keys(moves)) if (seen.has(k)) errs.push('a page sits on the moved-away path ' + k);
    const c = restructure.counts || {};
    if (c.avPages !== undefined && c.avPages !== sourceOwnPaths.length) errs.push('counts.avPages ' + c.avPages + ' != ' + sourceOwnPaths.length);
    if (c.moves !== undefined && c.moves !== Object.keys(moves).length) errs.push('counts.moves mismatch');
    if (c.adopt !== undefined && c.adopt !== adoptedOwnPaths.length) errs.push('counts.adopt ' + c.adopt + ' != ' + adoptedOwnPaths.length);
    if (c.newSitePages !== undefined && c.newSitePages !== all.length) errs.push('counts.newSitePages ' + c.newSitePages + ' != ' + all.length);
    const moved = sourceOwnPaths.filter((p) => remapOwn(p) !== p);
    if (moved.length !== Object.keys(moves).length) errs.push('moved pages ' + moved.length + ' != moves ' + Object.keys(moves).length);
    return { errors: errs, pages: all.length, moved: moved.length, kept: sourceOwnPaths.length - moved.length };
  }

  return { moves, remapOwn, url, absolute, setPages, unknown, assertPlan, ORIGIN };
}

/** Rewrite every href="..." inside an html string with `url` (internal targets only change). */
export function remapHtmlHrefs(html, url, counter) {
  return String(html).replace(/(\shref\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi, (all, pre, dq, sq) => {
    const v = dq !== undefined ? dq : sq;
    const nv = url(v.replace(/&amp;/g, '&')).replace(/&/g, '&amp;');
    if (counter && nv !== v) counter.n++;
    return pre + '"' + nv + '"';
  });
}
