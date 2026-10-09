// make-redirect-stubs.mjs — redirect pages for hosts that cannot serve dist/_redirects or dist/.htaccess (the GitHub
// Pages preview). One small page per moved Academy Vision URL (src/content/restructure.json "moves"): noindex, a
// canonical to the new live URL, a meta refresh and location.replace to the new path, written page-relative so it
// works under a Pages project subpath. Never run this into dist/: on a host that honours _redirects a file at the old
// path would shadow the 301.
//   node tools/make-redirect-stubs.mjs --out preview [--check]
// --check: verify the stubs already in --out (each target exists in --out, no stub sits on a real page) and write nothing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(ROOT, arg('out', 'preview'));
const CHECK = process.argv.includes('--check');
if (path.relative(ROOT, OUT).split(path.sep)[0] === 'dist') throw new Error('refusing to write redirect stubs into dist/');
const r = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/restructure.json'), 'utf8'));
const ORIGIN = 'https://www.academyvisionnj.com';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function stub(fromOwn, toOwn) {
  const depth = fromOwn.split('/').filter(Boolean).length;
  const rel = '../'.repeat(depth) + (toOwn ? toOwn + '/' : '');
  const abs = ORIGIN + '/' + (toOwn ? toOwn + '/' : '');
  return '<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"><title>Moved | Academy Vision</title>'
    + '<meta name="robots" content="noindex, nofollow"><link rel="canonical" href="' + esc(abs) + '">'
    + '<meta http-equiv="refresh" content="0; url=' + esc(rel) + '">'
    + '<script>location.replace(' + JSON.stringify(rel) + ' + location.hash)</script></head>'
    + '<body><p>This page has moved to <a href="' + esc(rel) + '">' + esc(abs) + '</a>.</p></body></html>\n';
}

if (!fs.existsSync(path.join(OUT, 'index.html'))) throw new Error('no ' + path.join(OUT, 'index.html') + ' - run tools/make-preview.mjs first');
let written = 0;
const problems = [];
for (const [from, to] of Object.entries(r.moves).sort()) {
  const file = path.join(OUT, ...from.split('/'), 'index.html');
  const target = path.join(OUT, ...to.split('/').filter(Boolean), 'index.html');
  if (!fs.existsSync(target)) problems.push('target missing: /' + to + '/ (from /' + from + '/)');
  if (CHECK) {
    if (!fs.existsSync(file)) problems.push('stub missing: /' + from + '/');
    else if (!fs.readFileSync(file, 'utf8').includes('This page has moved to')) problems.push('a real page sits on the moved path /' + from + '/');
    continue;
  }
  if (fs.existsSync(file) && !fs.readFileSync(file, 'utf8').includes('This page has moved to')) { problems.push('a real page sits on the moved path /' + from + '/'); continue; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, stub(from, to));
  written++;
}
console.log((CHECK ? 'checked ' : 'wrote ') + (CHECK ? Object.keys(r.moves).length : written) + ' redirect stub(s) in ' + path.relative(ROOT, OUT) + '; problems ' + problems.length);
for (const p of problems) console.log('  ' + p);
process.exitCode = problems.length ? 1 : 0;
