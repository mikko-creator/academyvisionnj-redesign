# Academy Vision redesign: "Bayside Daylight Glass"

This workspace holds a static rebuild of https://www.academyvisionnj.com/. Academy Vision is an optometry practice at
90 Atlantic City Blvd, Pine Beach, NJ. The rebuild moves the site onto the Eye Trends site structure and gives it a new
design called "Bayside Daylight Glass": light glassmorphism, layered depth, cut-outs that cross section edges, scroll
reveals and hover effects.

- **54 pages plus a 404 page.**
  - 31 pages are Academy Vision's own. 7 keep their path and 24 moved to a new path. Each old URL gets a 301 redirect
    (`dist/_redirects`, `dist/.htaccess`).
  - 23 pages are new. They are written in Academy Vision's voice to fill the Eye Trends structure, and none uses Eye
    Trends text. Their copy lives in `src/content/adopted/*.json`.
- **Every visible word on the 31 source pages is Academy Vision's own text.** `tools/build-verify.mjs` (a)/(a2) checks
  this, and (a3) checks that each new page shows its JSON.
- **No runtime dependencies.** The build uses Node builtins only. The browser gets vanilla JS and CSS, with fonts and
  images self-hosted. The only third-party request a page makes is the lazy Google Maps embed. "Book Appointment"
  links out to the external scheduler.
- **Output:** `dist/`, a plain static site of 1,067 files (47 MB).

Status on 2026-10-09: built and checked in headless Chrome only. No deployment to the live domain is recorded. A
`noindex` review preview was pushed to GitHub Pages; see "Git state" below. To deploy, read
[docs/DEPLOY.md](docs/DEPLOY.md). Everything waiting on the operator or the practice is in
[docs/OPEN-DECISIONS.md](docs/OPEN-DECISIONS.md). [docs/CHANGE-LOG.md](docs/CHANGE-LOG.md) says what was built, and
[docs/BUILD-NOTES.md](docs/BUILD-NOTES.md) §6 holds the final check numbers.

**Repository and preview.** The operator decided this on 2026-10-09 (OPEN-DECISIONS A3).

| what | where |
|---|---|
| source + `dist/` | PUBLIC https://github.com/mikko-creator/academyvisionnj-redesign, branch `main` (the default). `.gitignore` keeps the raw crawl (it holds the old site's keyed Maps embed and analytics ids), the stock originals in `assets/source/`, the image cache, `tmp/`, `preview/` and the handoff zip out of the repository |
| review preview | https://mikko-creator.github.io/academyvisionnj-redesign/, branch `gh-pages`, pushed from `preview/` (its own git repository inside this workspace). Every page is `noindex, nofollow` and `robots.txt` disallows all |
| handoff zip | `academyvisionnj-com-handoff-v20261009.zip` in the workspace root, not in git. It holds `dist/ src/ docs/ facts/ assets/ audit/` but not `tools/`, which `node src/build.mjs` imports, so rebuilding from the zip needs `tools/` copied in from the repository |

Republish the preview after a rebuild:
1. `MSYS_NO_PATHCONV=1 node tools/make-preview.mjs --dist dist --out preview --prefix /academyvisionnj-redesign`
2. `node tools/make-redirect-stubs.mjs --out preview` and then the same command with `--check`.
3. `node tools/secret-scan.mjs --dir preview --keys <fal.key> --keys <hf.key>`
4. Commit inside `preview/` and `git push origin gh-pages`.
5. Wait until `gh api repos/mikko-creator/academyvisionnj-redesign/pages/builds/latest` reports built, then run
   `MSYS_NO_PATHCONV=1 node tools/noindex-live-check.mjs --base https://mikko-creator.github.io/academyvisionnj-redesign/ --from preview`.

Live-checked on 2026-10-09 after the QA round: the home page, its stylesheet and a bio page served byte-identical to
`preview/`, 79/79 served pages (55 pages + 24 redirect pages) carried exactly one `noindex, nofollow`, and a nested
missing path returned the styled 404. `git log` in each repository gives the current commits.

## Requirements

- **Node 24.** Builtins only, with no `npm install`. The browser drivers use Node 24's global `WebSocket`.
- **`cwebp` and `webpmux`** on PATH for the image variants. This build used cwebp 1.6.0. The cwebp version is part of
  the image cache key, so another version re-encodes every variant under new file names.
- **`ffmpeg` and `ffprobe`**, only for the loop and video tools.
- **Chrome**, only for the browser probes, which run it headless through `tools/cdp.mjs`. The build itself needs no
  browser.

## Build

Run every command from the workspace root. The commands below come from `docs/BUILD-NOTES.md` §1.1.

| command | what it does |
|---|---|
| `node src/build.mjs` | Full build into `dist/`, which is wiped first. Uses `src/theme/index.mjs`. On any failure it exits 1 and lists each failure. Writes the report `tmp/pipeline/build-report.json`, which build-verify (f)/(g) read. |
| `--theme auto\|theme\|stub\|<module path>` | Forces a theme. The stub at `src/theme-stub/` is a plain fallback used in tests. |
| `--out tmp/... --report <file>` | Builds somewhere else, for a determinism check. `--out` must be `dist` or a folder under `tmp/`. |
| `--allow-missing-adopted`, `--adopted-dir`, `--pages-dir`, `--concurrency 8`, `--quiet` | Test options. All 23 adopted pages exist, so `--allow-missing-adopted` is no longer needed. |

**Timing.** With the image cache warm, a build takes about 2 s: this run measured 1.6 s, with all 986 variants taken
from the cache. On an empty cache every variant is encoded: in the pipeline run, 797 variants took 324.7 s.

**Inputs that git does not hold.** `.gitignore` excludes these folders:
- `assets/source/`: the images saved from the live site, whose stock originals are licensed to the practice;
- `assets/optimized/`: the WebP cache;
- `audit/raw/` and the other raw crawl folders;
- `tools/sr-local/`;
- `tmp/` and `preview/`.

`src/lib/images.mjs` throws `image file missing` for any source image that is absent (line 161). So a fresh clone that
lacks `assets/source/` should fail to build. This was read from the code, not tested. build-verify (a2) and the
parity tools also read `audit/raw/`. Keep those folders with the workspace.

## Serve locally

```sh
node tools/serve.mjs --root dist --port 8787 --not-found 404.html --no-open
```

Then open http://127.0.0.1:8787/. Notes:
- `--not-found 404.html` answers every miss with the 404 page and status 404, as a static host would.
- Without `--no-open`, the server opens a browser.
- A directory request is served from its `index.html`.
- Do not open `dist/` over `file://`: directory links such as `about-us/` need a server to resolve to `index.html`.
- Stop the server by its PID.

## Verify

These are the final checks, in the order the record in `docs/BUILD-NOTES.md` §6 uses. Each exits non-zero on a
failure or when its positive control does not fire.

| check | command |
|---|---|
| byte identity of two builds | `node src/build.mjs --out tmp/<you>/distB --report tmp/<you>/report-B.json` then `node tools/hashdir.mjs dist tmp/<you>/distB --control` |
| every internal reference resolves (6 planted controls) | `node tools/link-check.mjs [--dir dist] [--json <file>]` |
| text, h1, residue, redirects, chrome links, comic, AI labels, SEO, sitemap: checks (a)-(i) | `node tools/build-verify.mjs --control` |
| no Eye Trends prose (8-word spans) | `node tools/overlap-check.mjs --dir dist --fail 8 --json tmp/<you>/overlap-dist.json --control`, then `node tmp/integrate/overlap-classify.mjs --dist dist --json tmp/<you>/overlap-classified.json` |
| no platform traces | `node ~/.claude/skills/site-reforge/scripts/sr-decontaminate.mjs --dir dist --strict` |
| no invented claims | `node ~/.claude/skills/site-reforge/scripts/sr-fabrication.mjs --project .` and `node tmp/integrate/numbers-check.mjs` |
| no credentials | `node tools/secret-scan.mjs --dir dist`, then `node tools/secret-scan.mjs --control` |
| no reference-practice strings | `node tools/residue-grep.mjs` |

Some of these tools have side effects or outside dependencies:
- **overlap-check** needs the Eye Trends crawl. Its location is the tool's `--et` default; that folder sits outside
  this workspace.
- **`overlap-classify.mjs` and `numbers-check.mjs`** live in `tmp/integrate/`, which git ignores.
- **The two `sr-*` gates** come from the site-reforge skill on this machine. With `--project .` the decontamination
  gate rewrites `audit/decontamination.json` and `project.json`; with `--dir` alone it writes nothing. The fabrication
  gate always rewrites `audit/fabrication-report.json` and `project.json` in its `--project` folder.
- **residue-grep** currently reports 3 known false positives. All three are one US state name in the State list of
  Academy Vision's own registration form; the reference practice's state is one of the tool's needles
  (`docs/BUILD-NOTES.md` §6 row 12).

### Browser tools

Run one headless Chrome at a time, in the foreground. Some usage lines inside these files still say `src/tools/`, but
the files are in `tools/`.

| tool | use |
|---|---|
| `tools/cdp.mjs`, `tools/cdp-realsb.mjs` | Minimal CDP drivers. `cdp-realsb` keeps a real 15 px scrollbar, so `innerWidth` 1280 gives `clientWidth` 1265, as on the operator's screens. |
| `node tools/shoot.mjs --url <u> --widths 1440,390 --out <prefix> [--full] [--scroll-steps N]` | Full-page screenshots at exact widths. |
| `node tools/scrollshots.mjs --url <u> --width 1440 --height 900 --out <prefix>` | Viewport-sized shots taken while scrolling. |
| `node tools/jserrors.mjs --base <url> --paths /,/reviews/` | Uncaught exceptions and console errors. |
| `node tools/overflow.mjs --url <u> --width 390` | Elements wider than the viewport. |
| `tools/contrast.mjs` | WCAG contrast of every colour pair the CSS declares. Writes `audit/contrast.json`. |

### Content and image tools

| tool | use |
|---|---|
| `node src/lib/extract.mjs [--render]` | Regenerates the page models in `src/content/pages/` from `audit/raw/`. Never hand-edit the models. |
| `tools/text-parity.mjs`, `tools/sentence-parity.mjs` | Check the content model against the crawl. |
| `tools/fal-gen.mjs`, `tools/fal-one.mjs`, `tools/fal-upscale.mjs`, `tools/hf-run.mjs`, `tools/make-loop.mjs` | Generate the images and loops. They need API keys passed with `--key-file` from outside the project, and they cost money. The build does not need them. |
| `node tools/make-preview.mjs --out preview` | Makes a GitHub Pages review copy: every page set to `noindex, nofollow`, plus `.nojekyll`. Pass `--prefix /academyvisionnj-redesign` for the project Pages site. See "Repository and preview" above for the full republish recipe. |
| `node tools/make-redirect-stubs.mjs --out preview [--check]` | Writes meta-refresh pages at the old URLs for hosts without server redirects. Use it only on a preview copy, never on `dist/`. |
| `node tools/crawl-preview.mjs --base <url>`, `node tools/noindex-live-check.mjs --base <url>` | Check a deployed preview. They make network requests. |

## Folder structure

```
src/
  build.mjs              the build (Node builtins)
  lib/                   pipeline: extract (crawl -> models), site, remap, pages, images, seo, redirects, util
  content/
    pages/*.json         31 lossless models of Academy Vision's pages (regenerate with src/lib/extract.mjs)
    source-chrome.json   the source header and footer
    adopted/*.json       the 23 new pages (schema academyvision/adopted@1)
    restructure.json     moves, keeps, new pages, nav, footer, redirects (docs/SITE-ARCHITECTURE.md)
    image-masters.json   the image masters; image-plan.json: generated-image slots and loops
  theme/                 index (renderPage, render404), chrome, home, parts, templates, blocks
  styles/                tokens, base, glass, depth, motion, chrome, home, interior, blocks, forms, special
  scripts/               site.js, features.js (vanilla JS)
  theme-stub/            plain semantic fallback theme (tests)
assets/
  brand/, fonts/         logo files, self-hosted fonts
  generated/             AI-generated stills and loops, with sidecars and the provider's raw files
  source/                Academy Vision's photos from the crawl (gitignored)
  optimized/             WebP variant cache (gitignored, regenerable)
audit/                   crawl evidence and inventories, generated-images.json (AI provenance), gate reports
facts/                   client-facts.json, service-evidence.json: every fact the live site states, with quotes
docs/                    see below
tools/                   checks, server, browser drivers, preview and generation tools
dist/                    the built site (generated; this is what gets deployed)
tmp/                     each role's scratch, probes, captures and the QA snapshots (gitignored)
preview/                 derived GitHub Pages review copy (gitignored)
project.json             site-reforge project state
```

## Docs

| file | contents |
|---|---|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploying `dist/`: paths, redirects, 404, launch work, what is verified and what is not |
| [docs/CHANGE-LOG.md](docs/CHANGE-LOG.md) | Revision log: the request, what was built, the decisions taken, the verification numbers |
| [docs/OPEN-DECISIONS.md](docs/OPEN-DECISIONS.md) | Everything waiting on the operator or the practice |
| [docs/BUILD-CONTRACT.md](docs/BUILD-CONTRACT.md) | File ownership, the pipeline/theme interface, and the decisions already taken (§4) |
| [docs/BUILD-NOTES.md](docs/BUILD-NOTES.md) | Each role's measured notes: 1 Pipeline, 2 Theme core, 3 Theme templates, 4 Integration, 5 QA round 1, 6 Verification record |
| [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md) | The design spec, with requirements R-1 to R-32 and their acceptance tests |
| [docs/SITE-ARCHITECTURE.md](docs/SITE-ARCHITECTURE.md) | The restructure onto the Eye Trends structure: moves, keeps, new pages, menus, redirects |
| [docs/BRAND-SYSTEM.md](docs/BRAND-SYSTEM.md) | Academy Vision's brand, measured from the crawl, and its guardrails |
| [docs/FACTS-EVIDENCE.md](docs/FACTS-EVIDENCE.md) | Every fact the live site states, with conflicts and gaps |
| [docs/IMAGE-INVENTORY.md](docs/IMAGE-INVENTORY.md) | The image masters and the generation plan |
| [docs/PORT-NOTES.md](docs/PORT-NOTES.md) | The content model, built from the crawl |

## Where the evidence lives

| what | where |
|---|---|
| Measured notes from every role | `docs/BUILD-NOTES.md`. §6 holds the final numbers and their commands. |
| The reviewed build | `tmp/qa/snapshot/` (`4441ab00…`; aggregate hash in `tmp/qa/snapshot.sha`) |
| The final build | `tmp/qa/snapshot-fixed/` (`41df3b61…`, equal to `dist/`; hash in `tmp/qa/snapshot-fixed.sha`) |
| Review probes, results and captures | `tmp/review-visual/`, `tmp/review-interaction-a11y/`, `tmp/review-content-seo-perf/` |
| Fixer probes, before/after captures and logs | `tmp/fix/` (`fs-a/`: 1280x585 and 1600x662; `fs-c/`: 390x844) |
| Integration probes, logs and captures | `tmp/integrate/` |
| Logs of the final verification run | `tmp/docs/` |
| Crawl of the live site | `audit/raw/` (untouched HTML) and the `audit/*.json` inventories |
| AI provenance of every generated image and loop | `audit/generated-images.json` |
| Gate reports | `audit/decontamination.json`, `audit/fabrication-report.json` (both from the integration run on `4441ab00…`; the final run's logs are in `tmp/docs/`) |
