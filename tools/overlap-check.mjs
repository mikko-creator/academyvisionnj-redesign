// overlap-check.mjs — proves new copy does not reproduce Eye Trends prose.
// Builds the set of N-word sequences (shingles) in the visible text of the Eye Trends crawl and reports every span of
// a checked file that is made of shared shingles. Node builtins only.
//
//   node tools/overlap-check.mjs --dir src/content/adopted [--files a.json,b.html] [--n 6] [--fail 8]
//        [--et <eye trends audit/raw dir>] [--json out.json] [--control]
//
// --et    default: ~/site-reforge/eyetrendsclearlake-com/audit/raw
// --n     shingle size used to find shared spans (default 6 words: "review" level)
// --fail  a shared span this many words or longer fails the run (default 8)
// --control  inserts one real Eye Trends sentence into the first checked file IN MEMORY and requires that the run
//            reports it; exits 3 if the instrument cannot see it (a blind checker must not read as "no overlap").
// JSON inputs: every string value is checked (keys are not). HTML inputs: visible text (scripts/styles removed).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const k = argv[i].slice(2);
  const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  args[k] = v;
}
const N = Number(args.n || 6);
const FAIL = Number(args.fail || 8);
const ET_DIR = path.resolve(String(args.et || path.join(os.homedir(), 'site-reforge', 'eyetrendsclearlake-com', 'audit', 'raw')));

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', mdash: ' ', ndash: ' ', hellip: ' ', copy: ' ', reg: ' ', trade: ' ' };
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : ' '));
}
function htmlText(h) {
  return decode(String(h)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' '));
}
function jsonText(v, out = []) {
  if (typeof v === 'string') out.push(/<[a-z][^>]*>/i.test(v) ? htmlText(v) : decode(v));
  else if (Array.isArray(v)) v.forEach((x) => jsonText(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => jsonText(x, out));
  return out;
}
// One token stream per text; sentence and block boundaries do not stop a span (a copied passage stays a span).
function tokens(text) {
  return String(text).toLowerCase()
    .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
    .match(/[a-z0-9]+(?:'[a-z0-9]+)*/g) || [];
}

if (!fs.existsSync(ET_DIR)) { console.error('no Eye Trends crawl at ' + ET_DIR); process.exit(2); }
const etFiles = fs.readdirSync(ET_DIR).filter((f) => f.endsWith('.html')).sort();
const etSet = new Map(); // shingle -> first ET file
const etSentences = [];
for (const f of etFiles) {
  const raw = fs.readFileSync(path.join(ET_DIR, f), 'utf8');
  const main = (raw.match(/<main[\s\S]*?<\/main>/i) || [raw])[0];
  const t = tokens(htmlText(raw));
  for (let i = 0; i + N <= t.length; i++) { const k = t.slice(i, i + N).join(' '); if (!etSet.has(k)) etSet.set(k, f); }
  for (const s of htmlText(main).split(/(?<=[.!?])\s+/)) if (tokens(s).length >= 12) etSentences.push(s.trim());
}

let files = [];
if (args.dir) {
  const d = path.resolve(String(args.dir));
  const walk = (p) => { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const q = path.join(p, e.name); if (e.isDirectory()) walk(q); else if (/\.(json|html?)$/i.test(e.name)) files.push(q); } };
  walk(d);
}
if (args.files) files.push(...String(args.files).split(',').map((f) => path.resolve(f.trim())));
files = [...new Set(files)].sort();
if (!files.length) { console.error('nothing to check (use --dir or --files)'); process.exit(2); }

const control = !!args.control;
const controlSentence = control ? etSentences[Math.floor(etSentences.length / 2)] : null;
const report = { schema: 'academyvision/overlap@1', n: N, fail: FAIL, etDir: ET_DIR, etFiles: etFiles.length, etShingles: etSet.size, control: control ? controlSentence : null, files: [] };
let worst = 0, controlSeen = false;

files.forEach((file, idx) => {
  const raw = fs.readFileSync(file, 'utf8');
  let text = /\.json$/i.test(file) ? jsonText(JSON.parse(raw)).join(' \n ') : htmlText(raw);
  if (control && idx === 0) text += ' ' + controlSentence;
  const t = tokens(text);
  const hit = new Array(t.length).fill(false);
  const src = {};
  for (let i = 0; i + N <= t.length; i++) {
    const k = t.slice(i, i + N).join(' ');
    if (etSet.has(k)) { for (let j = i; j < i + N; j++) hit[j] = true; src[i] = etSet.get(k); }
  }
  const spans = [];
  for (let i = 0; i < t.length;) {
    if (!hit[i]) { i++; continue; }
    let j = i; while (j < t.length && hit[j]) j++;
    const etf = Object.keys(src).map(Number).filter((s) => s >= i && s < j).map((s) => src[s]);
    spans.push({ words: j - i, text: t.slice(i, j).join(' '), etFiles: [...new Set(etf)] });
    i = j;
  }
  spans.sort((a, b) => b.words - a.words);
  const max = spans.length ? spans[0].words : 0;
  worst = Math.max(worst, max);
  if (control && idx === 0) controlSeen = spans.some((s) => s.words >= Math.min(FAIL, tokens(controlSentence).length));
  report.files.push({ file: path.relative(process.cwd(), file).split(path.sep).join('/'), words: t.length, sharedSpans: spans.length, longest: max, spans: spans.slice(0, 25) });
});

if (args.json) fs.writeFileSync(path.resolve(String(args.json)), JSON.stringify(report, null, 1) + '\n');
for (const f of report.files) {
  const flag = f.longest >= FAIL ? 'FAIL' : (f.longest >= N ? 'review' : 'ok');
  console.log(`${flag.padEnd(6)} ${f.file}  words ${f.words}  shared spans ${f.sharedSpans}  longest ${f.longest}`);
  for (const s of f.spans.filter((x) => x.words >= N).slice(0, 6)) console.log(`         ${s.words}w  "${s.text}"  <- ${s.etFiles.join(', ')}`);
}
console.log(`Eye Trends: ${etFiles.length} pages, ${etSet.size} ${N}-word shingles; checked ${files.length} file(s); longest shared span ${worst} words (fail at ${FAIL})`);
if (control) {
  console.log(`control: inserted ${tokens(controlSentence).length}-word Eye Trends sentence -> ${controlSeen ? 'DETECTED' : 'MISSED'}`);
  process.exitCode = controlSeen ? 0 : 3; // a control run proves the instrument; it never grades the files
} else process.exitCode = worst >= FAIL ? 1 : 0;
