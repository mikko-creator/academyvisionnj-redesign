# Revision 1 - 2026-10-09

Change log of the Academy Vision redesign. A later revision goes in its own `# Revision N - <date>` section.

## The request, in brief

This section follows the orchestrator's brief and `docs/BUILD-CONTRACT.md`.

The operator asked for a **total redesign** of https://www.academyvisionnj.com/, the site of Academy Vision, an
optometry practice in Pine Beach, NJ.
- **Structure:** the site was to be **restructured onto Eye Trends' site structure**: 54 pages, made of Academy
  Vision's 31 pages (24 of them moved) and 23 newly written pages.
- **Design:** the chosen design is "Bayside Daylight Glass": light glassmorphism, layered depth, cut-outs that cross
  section edges, scroll reveals and hover effects.
- **Content rules:**
  - every visible word on a source page stays Academy Vision's own text;
  - the new pages are new writing in Academy Vision's voice;
  - nothing is invented: no fact, review, credential, statistic or service;
  - no Eye Trends prose is copied.
- **Target screens:** the operator's 1280x585 at DPR 1.5 and 1600x662 at DPR 1.2 (BUILD-CONTRACT 4.12), and phones at
  390x844.

## What was built (2026-10-08 to 2026-10-09)

| stage | result | record |
|---|---|---|
| Crawl and content model | 31 pages crawled, 0 failed, and 1,131 of 1,131 assets saved. Lossless page models in `src/content/pages/` and the source header and footer in `src/content/source-chrome.json` | `project.json`, `docs/PORT-NOTES.md` |
| Facts | Every fact the live site states, with quotes (`facts/client-facts.json`), plus the service evidence with conflicts C1-C10 and gaps G1-G22 | `docs/FACTS-EVIDENCE.md` |
| Information architecture | `src/content/restructure.json`: 7 pages kept, 24 moved, 23 new pages, the menus, the footer and 24 redirects | `docs/SITE-ARCHITECTURE.md` |
| Brand and design | The brand measured from the crawl; a design panel; the chosen design "Bayside Daylight Glass" (with grafts), specified with requirements R-1 to R-32 | `docs/BRAND-SYSTEM.md`, `docs/DESIGN-SPEC.md`, `tmp/panel/winner/` |
| Pipeline | `src/build.mjs` and `src/lib/`: path remapping, WebP variants through cwebp, one consolidated JSON-LD business entity per page, redirect files, `sitemap.xml` and `robots.txt`. Checkers `tools/link-check.mjs` and `tools/build-verify.mjs` | BUILD-NOTES §1 |
| Theme | Core: header, mega menu, drawer, home page, glass, depth and motion systems (`src/theme/`, `src/styles/`, `src/scripts/site.js`). Templates: interior page kinds, blocks, forms, 404 (`features.js`) | BUILD-NOTES §2, §3 |
| New pages | 23 adopted pages written by five writer groups and checked by five checkers (`src/content/adopted/`) | BUILD-NOTES writer and checker sections |
| Imagery | Generated stills (35, labelled as AI-generated) and two motion loops. An image refuter replaced 5 slots. Every generated file is recorded in `audit/generated-images.json` | BUILD-NOTES IMAGERY, IMAGE REFUTER |
| Integration | Merged the theme notes. The glaucoma hero became Academy Vision's own stock photo. Video provenance comments, the 404 composition, the fix for "»" alone on a line, and the R-18 cut-out fix. `dist/` = `4441ab00…` | BUILD-NOTES §4 |
| QA round 1 | Three reviewers (visual; interaction and accessibility; content, SEO and performance) on the snapshot `4441ab00…`. The fixer's results: 26 FIXED (V8 only in part), 6 REFUTED, 3 DEFERRED, 4 OPERATOR and 1 OPEN (FIXER:R1). `dist/` = `41df3b61…` | BUILD-NOTES §5 |
| Review preview | A `noindex` GitHub Pages copy is built from `preview/` (`tools/make-preview.mjs` + `tools/make-redirect-stubs.mjs`). Its local `gh-pages` commits are `049fad2` (09:25, build `4441ab00…`) and `47c64f4` (11:52, "QA round 1 fixes, build 41df3b61"); `origin/gh-pages` = `47c64f4`. The workspace repository's `main` = `af581c3` (09:26), so the QA-round source changes are not committed. These were read from local refs; the remote was not fetched | `README.md` "Git state" |
| Handoff docs | `README.md`, `docs/DEPLOY.md`, this log, BUILD-NOTES §6 and OPEN-DECISIONS section F | this stage |

The result is `dist/`: 1,067 files.
- **Pages:** 54 pages plus `404.html`. By kind: home 1, about 1, doctors 1, bios 3, location 1, reviews 1, insurance 1,
  forms 2, legal 3, sitemap 1, article 1, eye-health 1, service hub 1, services 8, product hub 1, products 5, other
  adopted 22.
- **Images and redirects:** 986 WebP image variants, 290 of them AI-labelled. The redirect files hold 48 rules.

### Main changes in QA round 1

These are listed in BUILD-NOTES 5.1.
- **Doctor bios, town page, about page:** the bios use the half title band with the doctors page's exam-room photo,
  the town page's location card sits beside the hero panel, and the about page's print sits beside the panel.
- **Utility bands:** the forms, legal pages, sitemap, `/terms/` and 404 get bands sized to their panel. The 404 keeps
  Book and Call in its band.
- **Header:** the mega-menu columns wrap under WCAG 1.4.12 text spacing, and the header breakpoints are in `em`.
- **Headings:** line-break control (no-break spaces in "Pine Beach", "Dry Eye(s)" and "Eye Care").
- **Images:** `srcset` `sizes` are scaled for cover-cropped frames and cut-outs.
- **Focus:** the lightbox closes when focus leaves it, and a reveal finishes as soon as focus enters it.
- **Related bands** no longer repeat the page's own cards.
- **SEO and host files:**
  - `og:image` on all 54 pages, plus `twitter:card`;
  - JSON-LD strings decoded;
  - `.htaccess` compression and caching.

## Decisions taken

These come from BUILD-CONTRACT §4 and the defaults in `docs/OPEN-DECISIONS.md`. Every default stays open to the
operator or the practice.

1. **Full Eye Trends structure.** All 23 new pages are built and linked from the menus and the footer. The IA lane's
   `hold` flags are not applied (4.1, A1).
2. **New copy is new writing.** No span of 8 or more words is shared with the Eye Trends crawl. Practice facts come
   only from `facts/client-facts.json` (4.2).
3. **Phone:** (732) 978-9306 everywhere. The second number, (732) 736-1700, appears nowhere (4.3, B1).
4. **Booking:** "Book Appointment" opens the external scheduler in a new tab. The on-site request form stays
   (4.4, B3).
5. **Forms unwired:** the fields and copy are faithful, but nothing is sent. The backend is launch work (4.5, D1).
6. **Canonicals** point to the page itself, at the new path on the live origin (4.6).
7. **Removed:**
   - the platform runtime (GTM, Clarity, CallRail, reCAPTCHA, PatientEngage scripts and form endpoint, the keyed map);
   - the "Powered by EyeCarePro" credit;
   - the comic-book illustration, whose rights are unverified.

   The disclaimer is kept verbatim (4.7, D3, D5).
8. **Map:** a keyless embed queried by name and address, loaded lazily (4.8).
9. **Reviews:** the 20 reviews verbatim, with author and date; no platform is named (4.9, B7).
10. **Real people:** headshots are shown at about 150 CSS px, with no AI upscaling, and no generated image stands in
    for staff or patients (4.10, A6).
11. **Logo:** the master PNG is unaltered, at no more than 228 CSS px. A reversed knockout for dark grounds awaits the
    practice's approval (4.11, D6).
12. **Images:** the local 2000 px variants are used; the CDN originals were not downloaded (4.12, A5).
13. **No runtime dependencies** (4.13).
14. **Brand departures accepted** as part of the redesign: mixed-case headings, a drawn swoosh, pill buttons and a
    measured glass-contrast gate (A2).
15. The pediatric page stays at `/services/pediatric-eye-exams/`, with a new Children's Eye Care hub (A4).
16. **Glaucoma hero:** Academy Vision's own stock photo `photo-as-293097203` is used, unlabelled, after all three
    generated attempts failed review (A7).
17. **Source alt texts** are kept verbatim, including the questionable ones (A9; QA4).
18. **JSON-LD:** one consolidated `Optometrist` + `Optician` entity per page, replacing the source's competing business
    blocks (BUILD-NOTES 1.3 item 4).
19. **QA round 1:**
    - No new copy was written for a 404 explanation, a no-JS note or the in-page map titles; these are operator items
      QA1-QA6.
    - The art direction of two heroes and the image weights are deferred (QA7-QA9).

## Verification (final tree, 2026-10-09)

Every number below was measured in this stage; the commands are in BUILD-NOTES §6.

| check | result |
|---|---|
| Determinism | A scratch rebuild from the current tree is IDENTICAL to `dist/`: `41df3b61771c9c4e…`, 1,067 files, control fired. The build itself: 0 warnings, 0 errors, 986 variants from cache, 0 slot placeholders |
| Links | 15,398 local references, 55 fragments, 0 broken, 6 of 6 controls |
| build-verify | 12 of 12 green. (a) 1,775/1,775, (a2) 1,614/1,614, (a3) 1,329/1,329 on 23 pages; the deletion control is exact |
| Eye Trends overlap | 335 spans of 8+ words: 0 in adopted copy, 1 in Academy Vision's own sentence, 334 menu and page labels of the chosen structure. All controls fired |
| Decontamination | CLEAN: 59 files, 0 blocker, 0 major, 0 minor. A planted generator meta is reported as a BLOCKER |
| Fabrication | 187 claims, 0 blockers, 6 majors: the six already read in BUILD-NOTES 4.4. The planted control is reported |
| Numbers in new copy | 177 numbers (17 distinct). 169 are on the live site; the other 8 are "911" (5), "65" (1) and "UV400" (2), none a practice statistic. The control is reported |
| Secrets | 0 hits in 1,067 files, and all 6 pattern controls fire |
| Reference residue | 3 hits, all one US state option in the State list of Academy Vision's own registration form. It matches the reference practice's state, so the hits are false positives; the option stays verbatim |

Browser checks were not re-run in this stage. The last ones are the QA round's, on headless Chrome (BUILD-NOTES 5.1,
5.2). What remains UNVERIFIED is listed in `docs/DEPLOY.md` §6: Safari and Firefox, a real host's redirects and 404,
the live map and the scheduler, real-network timings and a real screen reader.

## Revision 1 addendum: publishing, handoff docs, gate and zip (orchestrator, 2026-10-09)

| step | result (measured this session) |
|---|---|
| Operator decision | "Public repo + Pages preview" (OPEN-DECISIONS A3) |
| First preview | `gh-pages` `049fad2` from the integrated snapshot `4441ab00…` (09:25). Live: the home page and `site.cb7baaf8e4.css` byte-identical to `preview/`; 79/79 served pages (55 + 24 redirect pages) carry one `noindex, nofollow`; a nested missing path returns the styled 404 |
| QA preview | `gh-pages` `47c64f4` from `tmp/qa/snapshot-fixed` = `41df3b61…` (11:52). Re-checked live: the home page, `site.acab7a8c2e.css` and `/our-doctors/dr-tyler-lesko-od/` byte-identical; noindex 79/79; styled 404 |
| Overlap in page content only | `tools/overlap-check.mjs` over each page's `<main>` (the whole-page run is dominated by the Eye Trends menu labels the structure uses on purpose): 0 spans of 7+ words in the 23 new pages; the 10 spans of 7+ words are page-name lists (sitemap, 404 tiles, related cards) or Academy Vision's own wording; the control was detected |
| Gate C25 | `docs/HANDOFF.md` renamed to `docs/DEPLOY.md`; `docs/README.md` added as the docs index. `sr-gate`: 22 PASS · 5 FAIL · 2 UNPROVEN of 29 (C25 now PASS; C13, C17, C19, C20 and C23 FAIL, C12 and C22 UNPROVEN, each with its reason in the package manifest) |
| Handoff zip | `academyvisionnj-com-handoff-v20261009.zip` re-packaged with `--force --why` (reasons in `tmp/orch/package-why.txt` and the manifest): 3,483 entries, 285,975,892 bytes, decontamination CLEAN. Unpacked: secret scan 0 hits for both API keys and 8 other patterns (control fired for all 10); its `dist/` is IDENTICAL to the workspace `dist/` (`41df3b61…`). It does not hold `tools/` (see README) |
| Repository | `main` pushed with the final tree (this commit); the raw crawl, stock originals, image cache, `tmp/`, `preview/` and the zip stay out of git |

# Revision 2 - 2026-10-09: the home hero regenerated

**Operator:** "regenerate hero image, the girl looks blurry as fuck".

**Cause, measured:**
- The home hero was Academy Vision's stock photo `glow-woman-wearing-designer-frames`. Its largest file anywhere is
  1600x711.
- The hero frame paints it under `object-fit: cover`, so on the operator's windows the browser upscaled it.
- File px per painted device px was 0.65 at 1280x585@1.5, 0.79 at 1600x662@1.2 and 0.43 at 390x844@3
  (`tmp/hero-regen/probe.mjs` on the previous build).

**Change:**
- **Image:** 4 fal flux-pro v1.1-ultra candidates (2752x1536, $0.24). Candidate 3 was accepted after 100% and 200%
  crops of the eyes, glasses and background: no pseudo-text, natural anatomy. The others were rejected for a face under
  the panel, sign-like marks, or a centred face. A lossless crop to 2350x1536 moved her face from about 64% to about 74%
  across (rgb24 framemd5 identical to the cropped source).
- **Records and alt:** `assets/generated/hero-home.png`, slot `hero-home` in `src/content/image-plan.json`, and a
  ledger entry with all 4 paid calls in `audit/generated-images.json`. The source's verbatim alt ("A woman with curly red
  hair and glasses smiles on a street with blurred background") still describes the image, so text parity is unchanged.
- **Code:**
  - `src/theme/home.mjs`: the hero uses the slot, with `sizes` that follow the painted cover width
    (Chrome honours `max()` in `sizes`: 1280x800@1 picked the 1600 variant).
  - `src/styles/home.css`: object-position from 1024 px, tablet portrait and phones, measured with
    `tmp/hero-regen/facegeo.mjs`.
  - `src/build.mjs`: the home page and the home-hero og:image fallback use the new image (14 pages).

**Re-verified:**
- **Sharpness:** file px per painted px is 1.04 at 1280x585@1.5, 1.15 at 1600x662@1.2, 1.15 at 390x844@3, 1.07 at
  1920x1080 and 0.82 at 1440x900@2 (the most a 2350 px source allows; it was 0.38). One image request per window.
- **Face against the glass panel:** clear by 42 px at 1280x585, 169 px at 1600x662 and 80-673 px from 1366 to 2560 px.
  On phones it sits fully inside the viewport, above the panel. At 1024x768 it is 13 px under the panel (the least
  intrusive position).
- **Contrast** on painted pixels, against the same-build control: h1, lead and location card unchanged; the eyebrow
  p05 is 4.93-5.13 (was 4.96-5.38). The planted control failed every time.
- **Build checks:** two builds byte-identical; link-check 0 broken; build-verify 12/12 (299 AI-labelled variants).
- **Live:** gh-pages `fd57da8` built; the home page and its 2000 w hero variant byte-identical to the build; noindex
  79/79.

# Revision 3 - 2026-10-09: the Services mega menu with image cards

**Operator:** "revise the service megamenu, I want it to contain kick ass imagery, generate amazing images to be used
there so it's not plain texts".

**Change:**
- **Images:** one cohesive set of five generated photographs (fal flux-pro v1.1-ultra, 16:9, in the navy, sky-blue
  and cream light of the design), one per group:
  - Comprehensive Exams: a silver-haired woman in thin navy glasses;
  - Children's Eye Care: a laughing girl in sky-blue glasses;
  - Medical Eye Care: a macro of a single drop at a plain glass dropper;
  - Emergency Eye Care: a woman calmly holding a soft compress to one eye;
  - Contact Lens Exams: a thin soft lens on a fingertip.
- **Selection:** 13 paid calls ($0.78). Each pick was reviewed at sheet size and in 100% crops (temples, hinges,
  hands, fingertip, dropper). Rejected: a fake engraved mark on a temple, rainbow lenses with fused hinges, a
  malformed dropper tip, a lens that read as a water bead, a lens that read as a marble, and one blank
  (safety-filtered) frame. Every call and verdict is in `audit/generated-images.json`; slots `menu-*` are in
  `src/content/image-plan.json`.
- **Code:**
  - `src/theme/chrome.mjs`: each group head is an image card, with the name in white over a navy scrim and the photo
    decorative (alt="", data-ai-generated, IPTC XMP on the 640 w variant).
  - `src/scripts/site.js`: the images carry `data-src` only and load on the first hover intent or open, then fade in.
    The closed menu downloads nothing.
  - `src/styles/chrome.css`: the cards, their hover zoom and lift, keyboard focus parity, reduced motion and forced
    colours.

**Re-verified:**
- **Loading and fit:** 0 menu images before opening and 5 after, at 1280x585@1.5 and 1600x662@1.2. The panel ends at
  540 px of a 561 px budget at 1280x585 (548/638 at 1600x662). Every group name sits on one line from 1240 to 1920 px;
  with a 20 px default font the names wrap inside their cards, with no sideways scroll.
- **Contrast:** names on painted pixels, glyph area only, have p05 6.64-11.76 and worst pixel 4.95-10.48 at three
  windows. The planted grey control failed on 12 of 15, and on the darkest card it passes because that backdrop
  measures 11.6:1 against white.
- **Keyboard:** Tab, Enter opens, and Tab lands on the first card with a :focus-visible red ring. Hover zooms the
  photo to 1.08.
- **Build checks:** two builds byte-identical; link-check 0 broken; build-verify 12/12 (304 AI-labelled variants).
- **Live:** gh-pages `0d5b46f` built; the home page and all five 640 w images byte-identical (6.7-15.8 KB each);
  noindex 79/79.
