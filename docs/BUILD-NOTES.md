# Build notes

Conflicts and deviations recorded by build agents, one heading per role (BUILD-CONTRACT: "record it in docs/BUILD-NOTES.md under your role's heading").

## 1. Pipeline

PIPELINE role, 2026-10-08. Files: `src/build.mjs`, `src/lib/{util,site,remap,pages,images,seo,redirects}.mjs`,
`src/theme-stub/{index.mjs,stub.css,stub.js}`, `tools/link-check.mjs` (rewritten), `tools/build-verify.mjs`, `tools/ai-label.xmp`.
Generated: `dist/**`, `assets/optimized/**` (image cache). Scratch: `tmp/pipeline/`.

### 1.1 Run

| command | what it does |
|---|---|
| `node src/build.mjs` | Full build into `dist/` (wiped first). Uses `src/theme/index.mjs` when it exists, else the stub. Exit 1 (process.exitCode) on any failure, each listed. Report: `tmp/pipeline/build-report.json` (deterministic; holds the image manifest that build-verify (f)/(g) read). |
| `--allow-missing-adopted` | A missing adopted JSON becomes a placeholder page (its h1 and title from `restructure.json`) instead of a failure. Not needed any more: all 23 exist. |
| `--theme auto\|theme\|stub\|<module path>` | Force a theme; a module path under the workspace is for tests (`tmp/pipeline/fixture-theme/`). |
| `--out tmp/...`, `--report`, `--adopted-dir`, `--pages-dir`, `--concurrency 8`, `--quiet` | Test options; `--out` must be `dist` or a folder under `tmp/`. |
| `node tools/link-check.mjs [--dir dist] [--json f]` | Every internal reference resolves; external hosts with counts; 6 planted controls. |
| `node tools/build-verify.mjs [--control]` | Checks (a)-(i) below; `--control` adds the (a) deletion control. |
| `node tools/hashdir.mjs dist <copy> --control` | Byte identity of two builds. |

The first build on an empty cache encodes every variant (797 variants took 324.7 s); a cached build takes about 3 s.

### 1.2 What the theme receives (BUILD-CONTRACT 3.2, plus additive fields)

- **page**: every field of 3.2. Additive: `h1InModel` (true when the model has a level-1 heading node; false for adopted
  pages and the article, whose h1 is the BlogPosting headline per 4.6, so the theme prints `page.h1` itself), `robots`
  (null on all pages), `verification` (home only: the source's Google/Bing site-verification tokens, kept for the live
  domain). `generated.slots` / `generated.motion` list the other image-plan ids whose `usedOn` names the page (`/`:
  `still-loop-lens-light`, `loop-lens-light`; `/terms/`: `tex-cream-light`). `related[]` items carry `excerpt` and
  `image` (a ref for `ctx.img`).
- **page.model**: the source model with every internal href remapped and the declared edits of 1.3. `model.meta` is
  replaced by the cleaned SEO fields (the raw meta held CDN URLs and the second phone number). The `/sitemap/` list node
  is regenerated: `items[]` (`label, href, depth, group`) plus `groups[]` (`id, label, href, items`).
- **ctx**: every field of 3.2. Additive: `chrome` (skip link, home aria-label, logo alt, menu UI labels "Open menu" /
  "Close menu" / "Toggle Menu" / "Close Nav", footer headings "Contact Us" / "Locate Us" / "Hours"), `origin`,
  `seoHead(page)` (title, description, canonical, verification, og:*, JSON-LD scripts; the stub uses it), `hasAsset(name)`,
  `imgSize(ref)`. `site` also has `geo`, `hoursSpec`, `mapTitle`, `mapsNewTab`, `registrationForm` (`/patient-forms/`),
  `contactPage` (`/eye-doctor-pine-beach/`), `logo` (`assets/brand/logo-master.png`, 457x98, `maxCssWidth` 228) and
  `hours[].day` ("Monday"; `label` stays verbatim "monday:"). `nav` / `footer` / `headerButtons` / `ctas` have the
  `hold` flags removed (4.1); external links carry `external: true`, the scheduler `newTab: true` (4.4).
- **Frozen**: ctx data and every page object are deep-frozen; a theme must copy before sorting or mutating (keeps two
  builds byte-identical).
- **URLs**: write root-absolute URLs (`ctx.url`, `ctx.asset`, `ctx.img` all return them). The build rewrites every page
  except `404.html` to page-relative URLs (href, src, srcset, poster, action, data-* URL values, inline style and
  `<style>` url()), so `dist/` works at a domain root, under a Pages subpath and from any folder; `404.html` stays
  root-relative (it is served at any depth). link-check flags a root-absolute reference left in a page.
- **CSS**: the theme's `styles` are concatenated into `assets/site.<hash>.css`; a `url()` naming a font file or a brand
  file by its base name (any prefix: `../fonts/x.woff2`, `/assets/fonts/x.woff2`) is rewritten to the fingerprinted file;
  other root-absolute `url()` values are made relative to `/assets/`. Images in CSS: use an inline style with
  `ctx.imgSrc`. Scripts are concatenated into `assets/site.<hash>.js`; JS string URLs are not rewritten.
- **ctx.asset names**: `site.css`, `site.js`, the 7 font file names (fingerprinted under `assets/fonts/`),
  `logo-master.png`, `logo.png`, `logo-reversed.png` (once THEME adds it), `favicon.png` (the source favicon, 200x200),
  `logo-1200.webp` (the source's 1200x267 current logo, served unchanged), or any workspace path under `assets/`
  (copied fingerprinted, e.g. the loops in `assets/generated/`). An unknown name fails the build.
- **ctx.img(ref, opts)**: ref = a path under `assets/`, an image-plan slot id, or an image-masters id. Widths: 320, 480,
  640, 800, 1024, 1280, 1600, 2000, 2400 up to the source width, plus the source width itself when it is more than 15%
  above the last step; `opts.widths` overrides (the stub shows the doctors at `[150, 300]`, 4.10). `src` = the widest
  variant up to 1024; `width`/`height` = the widest variant (or `opts.width`). Generated images get
  `data-ai-generated="1"`. A slot with no file yet returns `<span class="img-slot" data-slot="<id>" role="img"
  aria-label="<alt>" style="aspect-ratio:16/9">` (aspect from the plan). `ctx.imgSrc` returns null for such a slot. A
  removed, missing or unknown ref fails the build (it is listed; the page gets an HTML comment).
- **Text the checks require**: build-verify (a) reads `<main>` only, so model text must be rendered inside `<main>`;
  verbatim strings such as the hours labels ("monday:") must stay as written (CSS may capitalise). Alts, aria-labels and
  placeholders must survive as attributes; runtime strings (review "Show More", carousel labels, form messages) may live
  in attributes or the JS bundle. build-verify (e) also requires every page to link all 54 nav and footer targets
  (menu grandchildren included: the three bios, the article, the column children), and (h) one consolidated business
  entity per page, so print `page.jsonLd` as given (or use `ctx.seoHead(page)`).

### 1.3 Decisions and declared edits (each counted in the build report)

1. **Phone (4.3).** The two `/services/` buttons the source prints as "(732) 736-1700" / `tel:+17327361700` now read
   (732) 978-9306 / `tel:+17329789306` (4 string replacements, asserted exactly); the `/sitemap/` meta description and
   og:description ("Call (732) 736-1700") get the same replacement. The header quick icon that dialled the second number
   is not passed to the theme. The number appears nowhere in dist (build-verify (c)). C1 stays open with the practice.
2. **Comic removed (4.7).** One item (the 4th "Practice Image") is dropped from the `/reviews/` photos list; the build
   asserts exactly one removal, and `ctx.img` refuses all 7 local files of that master.
3. **Forms unwired (4.5, 4.7).** `action` becomes `{attribute: null, method: 'post', novalidate: true, unwired: true}`;
   the platform endpoint, captcha and 6 of 7 hidden inputs per form are dropped (location id, source_url, tokens,
   g-recaptcha-response, action, and `admin-entries-url`, which pointed at the platform); `identifier` is kept. The
   stub's submit button ships `disabled` and its script enables it while stopping submission: without JS an unwired
   form would GET the registration fields (SSN digits, history) into a URL. **THEME should do the same.**
4. **JSON-LD.** Removed per page: LocalBusiness 31, MedicalBusiness 31, Optician 32, the invalid
   "MedicalSpecialty :: Optometric" 31 (a business block with the old phone), Optician+MedicalBusiness 1, and 10
   business nodes inside `@graph` blocks (MedicalClinic 9, the location LocalBusiness 1). Kept: Organization 31 (logo
   rewritten), WebPage 31, BlogPosting 1, Person+IndividualPhysician 3, and the non-business `@graph` nodes
   (MedicalCondition, MedicalTest, MedicalProcedure, MedicalWebPage, ItemList, AboutPage). Added on every page: ONE
   block `@type ["Optometrist","Optician"]` (Optician is the type the live site declares; Optometrist matches its visible
   "Pine Beach optometrists"), `@id` `https://www.academyvisionnj.com/#practice`, name, url, logo + image, telephone
   +1-732-978-9306, PostalAddress (NJ / US), geo 39.9535 / -74.1756 (asserted equal to the home page JSON-LD),
   openingHoursSpecification Mon-Thu 09:00-17:00 and Fri 08:00-15:00; on `/reviews/` also the source location block's
   20 `review` items and `aggregateRating` (5.0 / 20), verbatim; and a BreadcrumbList. Not carried (not in the brief's
   list, and JSON-LD-only on the source, FACTS C10 / G15): sameAs (Facebook), areaServed, priceRange, description.
   Nested business entities inside kept blocks (the doctors' `practicesAt`, which carried (732) 736-1700) become
   `{"@id": ".../#practice"}`. BlogPosting `mainEntityOfPage` pointed at the site root on the source; it now names the
   article's canonical. Logo/image URLs: any current or legacy logo master maps to `logo-1200.webp` (1200x267; the
   457x98 PNG is below Google's 112 px minimum height); photo URLs map to our variant of the same master (50 rewritten,
   0 dropped). Strings are otherwise verbatim (the Person description keeps the source's literal `&rsquo;`).
5. **Meta.** Title and description verbatim from `model.meta` (whitespace trimmed); canonical and og:url self at the
   live origin (4.6); og:image on the 13 pages that had one, rewritten to a 1280 px WebP variant; adopted pages get
   og/title/description from their JSON plus WebPage + business + BreadcrumbList JSON-LD.
6. **Visible excerpts never come from meta.** `related[].excerpt` is Academy Vision's own card excerpt for that page
   (child-page and article lists), else the page's first paragraph (lead sentences, about 200 characters), else none. A
   first draft used meta descriptions, which would have published meta-only claims (LipiScan / Inflammadry, FACTS C10)
   as visible copy.
7. **Sections** from the URL (`/services/`, `/products/` = eyewear, `/about-us/` `/our-doctors/` `/eye-health/` = about,
   visit = town page + both forms, legal = policies, terms, sitemap). One page sits in a different menu column than its
   URL section: ortho-k (menu: Services > Contact Lens Exams; URL and section: eyewear, deviation V7).
8. **Breadcrumbs**: Home, then the section landing page when the URL has no ancestor page there (About Us for
   `/our-doctors/` and `/eye-health/`, Visit Us for the forms), then the URL ancestor pages, then the page. Labels: the
   menu label, else the footer label, else the h1 (e.g. Home > Eyewear > Contact Lenses > Orthokeratology (Ortho-K)).
9. **Related**: a menu item's children; else its menu siblings; else (pages not in the menu) the other legal-row pages;
   the article falls back to its parent (Eye Health).
10. **Kinds**: home, about, doctors, bio x3, location (town page), reviews, insurance, form x2, legal x3, sitemap,
    article, service-hub, service x8 (incl. the moved contact-lens exam and scleral pages), product-hub, product x5 (incl.
    contact lenses and ortho-k), eye-health (the adopted hub), adopted x22 (incl. `/terms/`, section legal).
11. **Sitemap page**: all 54 pages, grouped by section in menu order, labels = the source sitemap's own label for the 26
    it listed, else the Academy Vision menu label, else the new menu or footer label. Group heads are the section
    landing pages; the legal pages stand at depth 0 as on the source. Ortho-k is listed under Eyewear > Contact Lenses.
12. **Images**: cwebp 1.6.0, `-q 78 -metadata none`, `-resize W 0` only when W differs from the source width. Cache key
    = sha256(source sha256, width, quality, AI label sha256 or "plain", cwebp version); file name =
    `<sanitised base>-<w>.<key10>.webp` (platform tokens such as `ecp` are stripped from names). Generated files get the
    `tools/ai-label.xmp` packet (IPTC DigitalSourceType trainedAlgorithmicMedia, a description, a creator-tool note)
    via `webpmux -set xmp`. A JPEG with an EXIF orientation other than 1 fails the build (cwebp ignores orientation);
    none occurs. SVGs are copied unchanged.
13. **Redirects**: `_redirects` has 48 lines (24 moves x `/old` and `/old/`); `.htaccess` uses `RedirectMatch 301
    ^/old/?$ /new/` (a plain `Redirect` would prefix-match deeper paths) and `ErrorDocument 404 /404.html`. Asserted: each
    target equals remap(), is a page, is never itself redirected, and no rule shadows a page.
14. **sitemap.xml** lists the 54 pages at the live origin, sorted, no lastmod; **robots.txt** is `User-agent: *` /
    `Allow: /` / the Sitemap line.
15. **Stub copy**: the stub's 404 says "Page not found" (placeholder copy; THEME's `render404` replaces it). The stub adds
    no other visible copy beyond the data.

### 1.4 Deviations from the brief or contract

- `page.model.meta` is replaced by the cleaned SEO fields (above), not passed raw.
- The additive page/ctx fields of 1.2.
- Brief point 6 said to run with `--allow-missing-adopted` until all 23 exist: all 23 existed before the proof, so the
  proof builds ran without the flag.

### 1.5 Proof (this run, inputs digest `7d78d0d3a59095acf12a4311ac8d38471741b83987a4cf57d75406cba4ba84c6`, stub theme)

- Two consecutive builds (`node src/build.mjs`, exit 0 both): `node tools/hashdir.mjs dist tmp/pipeline/distA --control`
  gives `55da3da902e7cfd8ba00b18801f959b01b6b4c5b8cc991ea3cdb45e080341209` for 932 files in both: IDENTICAL; control
  fired. Both reports carry the same inputs digest (adopted JSON and generated images were still changing during the
  session, so the digest is what makes the comparison valid).
- Pages written: 54 `index.html` + `404.html`; 860 image variants (0 encoded, 860 from cache); 10 slot placeholders.
- `node tools/link-check.mjs`: 6,375 local references, 55 fragments, 0 broken; external hosts scheduleyourexam.com 191,
  www.google.com 114 (map embeds and the maps link), www.academyvisionnj.com 54 (canonicals), get.adobe.com 1; 6 of 6
  planted controls reported.
- `node tools/build-verify.mjs --control`: 12 checks green. (a) 1,775/1,775 model units (116 via attribute, 16 via
  UI/JS, 12 review excerpts covered by their quotes); (a2) 1,614/1,614 source visible units; (a3) 1,329/1,329 adopted
  units; the (a) control (a sentence deleted from the built about-us page) reported exactly that sentence; (b) one h1 in
  55 files; (c) none of 17 residue strings in 61 text files, 871 binaries' metadata or any name, EyeCarePro 6x only in the
  disclaimer's legal text (model: 6), 57 map embeds keyless by name + address; (d) 24 moved paths absent and redirected;
  (e) 92 chrome links, 54 internal targets, every page links all of them; (f) comic absent (7 files, 860 manifest
  entries, 4 same-shape WebPs dHash-compared; its own smaller variant is flagged as the control); (g) 153 generated
  variants all carry the XMP, nothing else does; (h) SEO on 54 pages; (i) sitemap.xml / robots.txt / `/sitemap/`.
- Remap completeness: the models (sitemap excluded) hold 90 internal hrefs to moved pages, equal per target to the IA
  lane's `contentLinksToRemap`; the build remapped 90.
- Fail-closed (`node tmp/pipeline/failmodes.mjs`, planted copies, 7/7 as expected): unknown node type, dead internal link,
  second h1, duplicate page path and 23 missing adopted pages each exit 1 with that message; the control and
  `--allow-missing-adopted` (23 placeholders) exit 0.
- Cache not hiding nondeterminism (`node tmp/pipeline/cold-sample.mjs`): 41 variants (12 AI-labelled) re-encoded cold
  with the same arguments are byte-identical to dist. The AI chunk was read back with `webpmux -get xmp`
  (DigitalSourceType trainedAlgorithmicMedia) and the file decodes with dwebp.
- Fixture theme (`--theme tmp/pipeline/fixture-theme/index.mjs`): font/brand url() rewriting, data:/external url()
  untouched, slot, master id, SVG, missing slot, imgSrc, a media asset and imagesrcset all resolve; link-check 0 broken;
  build-verify green on that output.
- Behaviour (`node tmp/pipeline/browser-check.mjs`: one foreground headless Chrome via `tools/cdp.mjs`, in-process server
  on 127.0.0.1:8861, every other request failed by Fetch interception, 2 blocked: the map embeds): 0 JS exceptions and one
  h1 on `/`, `/reviews/`, `/products/`, `/services/glaucoma-management/`, `/patient-forms/`; on `/patient-forms/` the
  script enables the 1 submit button, the form has no action, `requestSubmit()` does not navigate, all 21 conditional
  fields start hidden, and answering "Yes" to field `m8rF5M22ag` shows `tdu4MOGpRd`.

### 1.6 Open and UNVERIFIED

- Built and verified with the **stub** only: `src/theme/` did not exist at the end of this run. The real theme is
  UNVERIFIED against these checks until it lands; rerun the four proof commands then.
- "A moved path still present as a page" is guarded twice (the plan assertion and a post-build file check) and build-verify
  (d) has a control, but no planted end-to-end build test was run for it (it needs a changed restructure.json).
- build-verify reads static DOM text: text inside `hidden` elements (21 conditional registration fields, form messages)
  counts as present. The browser check above covered behaviour on 5 pages only; computed visibility of every unit is
  UNVERIFIED.
- JSON-LD was checked structurally, not with Google's Rich Results test (no network).
- cwebp output is byte-stable on this machine (1.6.0); another cwebp version produces different bytes and, because the
  version is in the cache key, new file names.
- `assets/optimized/` (870 files, 36 MB) is regenerable cache; whether it is committed is the integrator's call
  (`.gitignore` is not this role's).
- The second phone number, the meta-only claims and the review provenance remain practice decisions (C1, C10, Q3).

## WRITER G1-exams-kids (2026-10-08)

Files: `src/content/adopted/services__{adult-eye-exams,senior-eye-exams,back-to-school-eye-exams,childrens-eye-care,childrens-contact-lenses}.json`.

1. **Conflict: verbatim claim quote vs the overlap gate (3.3 vs 4.2).** The Academy Vision fact quote `service-contact-lens-training` ("We’ll show you how to put them in, take them out, and care for them properly, step by step.", `/contact-lenses/contact-lenses-exams/`) itself shares a 9-word run with the Eye Trends crawl. `node tools/overlap-check.mjs --files src/content/adopted/services__childrens-contact-lenses.json --fail 8` reported `9w how to put them in take them out and` and exited 1 while that full quote sat in a claim, whatever the visible copy said. Resolution: that claim's `quote` is a verbatim sub-span of the same fact (`care for them properly, step by step.`), with the same `factId` and `page`; the file then reports longest 0 and exits 0. Any writer who cites this fact hits the same failure. A checker that requires `quote === fact.quote` will flag this one claim; one that requires a verbatim substring of the fact quote passes it.
2. **Non-prose 6-word runs (below the gate).** A claim `page` value of `/eye-care-services/comprehensive-eye-exams/` tokenizes to `eye care services comprehensive eye exams`, a run the Eye Trends crawl also contains. The fact quote `service-medical-eye-care` contains `medical eye care dry eye treatment`, another shared 6-word run. Both are required metadata, not prose; with them, the full files report longest 6, and the visible fields alone report 0.
3. **Adopted copy that needs the practice** (details in each file's `flags`): `services/childrens-contact-lenses` is PARTIAL evidence (kids' lenses evidenced only for myopia control; no general first-fit program or minimum age stated). No page states dilation, named tests, an exam length, an exam-frequency rule, ages, prices, weekend hours or same-day service.

## CHECKER G1-exams-kids (2026-10-08)

Checked the five WRITER G1-exams-kids files above; each change is recorded (before/after/why) in that file's `review.notes`. Scratch: `tmp/checker-G1-exams-kids/`.

1. **WRITER G1 item 1 re-tested and upheld.** With the full fact quote restored in a scratch copy (`tmp/checker-G1-exams-kids/deviation-test/`), `node tools/overlap-check.mjs --files <that copy> --fail 8` reports a 9-word shared run and exits 1. The sub-span quote (`care for them properly, step by step.`) is verbatim in the visible text of `audit/raw/contact-lenses-contact-lenses-exams.html` and keeps the fact's own `factId` and `page`, so it stays. An integration check on claims should accept a verbatim sub-span of the fact quote for this fact.
2. **Edits: 2 sentences, no claim text affected.** On adult exams, the screening sentence (accuracy and agreement). On senior exams, the visit-frequency FAQ ("often … more often" became "may need to come in more often").
3. **Final state (this run):** the overlap gate gives longest 6/6/6/6/0, exit 0, with every 6-word run in claim metadata; `--control` reported DETECTED. The visible fields alone share 0 six-word runs. All 157 claims are verified against `facts/client-facts.json` and `audit/raw`. The pipeline's own `buildPages`, run in memory, gives 0 errors on 54 pages.


## IMAGERY (2026-10-08)

Delivered 33 of 34 planned images and 2 of 2 loops: 52 files in `assets/generated/` (raw cut-out masters and loop
source clips under `raw/`), each listed in `audit/generated-images.json` `images[]` by slot id (the pipeline's
`slotFile()` reads that record). Plan entries carry additive `delivered` / `verdict` fields (stripping them restores the
plan's original sha256 de080bc7...). Review log, crop sheets and every attempt: `tmp/imagery-run/` (scratch).

- **Unaccepted: `hero-glaucoma-management`.** a1 glitter-speckled skin, a2 beaded CGI lower lid, a3 crackled skin and a
  double-exposure edge; per-slot retry limit reached; a local despeckle of a1 did not remove the texture. The page gets
  the pipeline's slot placeholder unless the theme uses the plan's `reuseCandidates`.
- **Spend:** 5.265 USD booked against the 12 USD cap (ultra 54 x 0.06, kontext 4 x 0.04, birefnet 8 x 0.01 booked at
  the plan allowance although fal reports 0.0008 USD per compute second, Higgsfield 3 x 0.595 from its /estimate).
  Stop rule respected: 54/55 ultra, 4/7 kontext, 8/16 birefnet, 3/3 Higgsfield.

Conflicts and impossible items:

1. **Loop output path.** The plan's `post` commands write `assets/media/loop-*`; BUILD-CONTRACT section 2 gives IMAGERY
   `assets/generated/**` only, so the loops are `assets/generated/loop-lens-light{.mp4,-960.mp4,-phone.mp4,.webm,-poster.webp,.json}`
   and `assets/generated/loop-navy-glass{.mp4,-960.mp4,.webm,-poster.webp,.json}`.
2. **Texture "mean saturation <= 0.35" cannot hold for navy or blue fields.** The brand navy #0f2a4a itself measures HSV
   S 0.797 and #3974a0 0.644 (Riverside's metric). Applied instead to the blue textures: neon share 0 (S and V > 0.85)
   and meanS <= 0.797; the 0.35 ceiling as written for `tex-cream-light` (0.153).
3. **Kling v3.0 turbo ignored "static camera".** The first lens clip trucked across about a quarter of the frame and
   both plain crossfade loops ghosted (two lenses, doubled bokeh). The fix was a locked-off retry prompt plus a ping-pong
   pre-pass (frames 0-120 + 119-1) before `tools/make-loop.mjs`, so the loops are 8.5 s instead of 3.5 s. Calmness:
   lens YDIF p95 0.985, max 1.577; navy p95 0.342, max 1.208; 0 frames over 20 in either. The Kling clips carry an AAC
   track; no delivered file has audio (checked with ffprobe).
4. **Count deviations, alts rewritten to match:** `hero-designer-frames` drew 2 frames in all 3 attempts (plan: 3).
   `hero-kids-eyewear` has 3 frames (plan: 4).
5. **Composition flags (subject not in the right third).** `hero-multifocal-contacts` face at about 47% x (last attempt;
   two earlier attempts drew glasses although the prompt said none); `hero-sunglasses` centred (the only clean attempt);
   `hero-eye-health` has a blank navy book filling 17-48% x. Focal points: `images[].focal` / plan `delivered.focal`.
6. **Local edits, recorded per audit entry:**
   - Kontext patches (fal) pasted inside masks at full resolution: senior temple mark; kids-contacts lens-flare orb,
     re-pasted with a difference mask to remove an arm-edge seam.
   - Non-AI ffmpeg/Node edits:
     - gas-permeable finger defocus;
     - cataract hero mirrored;
     - temple, lens and rim lettering removed by median or directional blur (tortoise, aviator, lens blank, contact
       lens, trial lens);
     - cut-out alpha repairs: clear lenses kept as grey by birefnet, a stray shadow sliver.
7. **fal safety filter.** Two fingertip macros came back as 1024x768 black frames at `safety_tolerance` "2" (billed).
   They were retried at "5".

## PIPELINE VERIFIER (2026-10-08)

I re-ran the pipeline's evidence with my own tools rather than reading its report. Scripts, logs and reports are in
`tmp/verify-pipeline/`; each script states its checks and controls in its header. I edited pipeline code only to fix the
five defects below. dist was never hand-edited. Final `dist/`: 1,014 files, aggregate `73e1b094…`, inputs digest
`24953f91…`, built with the stub theme. `src/theme/index.mjs` appeared at about 06:59Z, after that build, while THEME
was still working (its styles were 42-byte placeholders), so the next default `node src/build.mjs` will use the real
theme.

### What was measured (on the final dist unless stated)

| check | command | result |
|---|---|---|
| determinism | `node src/build.mjs` and a second build to `tmp/`, then `node tools/hashdir.mjs dist <copy> --control`; `node tmp/verify-pipeline/mutate.mjs --dir dist` | IDENTICAL, `73e1b094…`, 1,014 files, same digest; all 4 mutated copies on disk (HTML byte, WebP byte, rename, extra file) were reported DIFFERENT with the file named. Builds C and D differed by one font. Another role created it at 06:31:08Z, mid-run. After fix V3 the digests differ too, so this was an input change, not nondeterminism. |
| pipeline tools | `node tools/link-check.mjs`; `node tools/build-verify.mjs --control` | 6,465 refs, 0 broken, 6/6 controls; 12 checks green. |
| text, own probe | `node tmp/verify-pipeline/text-probe.mjs --dist dist --all --control` | Visible text is Chrome `innerText` of `<main>`, not static DOM. All 31 source pages pass, including the 8 named (home, Ullman bio, insurance, both forms, reviews, sitemap, varilux). 989 visible lines: 0 missing, 0 hidden-only. Also 186 attributes, 17 UI strings, 543 options and 12 review excerpts. 236 model links all point at the NEW path. 55 conditional-field lines are hidden at load (21/21 fields) and visible when shown. 0 unclassified model strings. 4/4 controls: deleted paragraph, hidden bio, old path 404, link pointed back at its old path. |
| redirects | `node tmp/verify-pipeline/redirect-check.mjs --dist dist` | All 24 rows of the SITE-ARCHITECTURE section 8 table match. 48 `_redirects` lines and 24 `RedirectMatch` patterns, each run as a regex. 155 URLs replayed: 48 take one 301, the rest are direct or the host's slash hop, 0 chains. 0 shadowed pages. 0 of 4,889 internal hrefs hit a redirect source. 5/5 controls. |
| JSON-LD | `node tmp/verify-pipeline/jsonld-check.mjs --dist dist --report tmp/pipeline/build-report.json` | 208 blocks parse. Every leaf traces to the live site (source JSON-LD read from `audit/raw`, or visible text) or to the adopted page's own title or description. Telephone is +1-732-978-9306 on all 54 pages, and no other phone-like string occurs. Every URL is on the live origin at a new path or is a dist asset. The BreadcrumbList names equal the visible trail on 53 pages, and the home page has a home-only list. The 20 reviews and the aggregateRating on `/reviews/` are deep-equal to the source. The consolidated block equals `facts/client-facts.json`, and its hours spec equals the visible hours. The `logo-1200` file is the current blue mark, checked visually; the legacy red `Logo-trans.png` that the source's newer block named is replaced. 5/5 controls. |
| head | `node tmp/verify-pipeline/head-check.mjs --dist dist --report tmp/pipeline/build-report.json` | 54 pages plus 404.html. Title and description equal the raw source `<head>` (31 pages) or the adopted JSON (23). Self canonical and og:url on every page; og title, description and type present. og:image is on 13 pages; on `/products/stellest-lenses/` it is 1000 px, which is the master's full width. 404.html is noindex. No duplicate titles or descriptions. One h1 per page. 5/5 controls. |
| images | `node tmp/verify-pipeline/image-check.mjs --dist dist --report tmp/pipeline/build-report.json`; `node tmp/verify-pipeline/cold-encode.mjs --report tmp/pipeline/build-report.json --dist dist` | 282 `<img>` with width, height and alt, ratios within 1.5%. Alts equal the model, chrome or image record; images are keyed by content because identical bytes sit under two paths. 1,182 srcset candidates exist, and each `w` descriptor equals the file's real width. 0 WebP wider than 2400. The 7952 px master `photo-as-540762318` caps at 2400. One placeholder frame (`hero-glaucoma-management`), with aspect-ratio and role, labelled `img`. `webpmux -get xmp`: 234/234 generated variants carry IPTC trainedAlgorithmicMedia, no other file carries XMP, and all 234 decode with dwebp. A cold re-encode of all 941 variants into an empty cache (316 s) is byte-identical to the warm cache and to dist. 6/6 controls. |
| render | `node tmp/verify-pipeline/render-check.mjs --dist dist` | 55 documents at 1280 and 390 px. 282 images forced to load: 0 broken, natural ratios match. The frame has a real box. One h1 in the DOM, 0 JS exceptions, no horizontal overflow (after fix V5). The 404 is served at a deep path with status 404. Control fired. Only local requests: Fetch interception plus host-resolver rules. |
| fail-closed | `node tmp/verify-pipeline/failclosed.mjs --fresh` (planted defects in a scratch COPY of the inputs) | 11/11 cases as expected. A missing adopted JSON, a dead internal link, an unknown node type, two pages on one path, a second h1, an unknown asset, a missing image and a moved path still present as a page each exit 1 with a matching message. The clean control and `--allow-missing-adopted` exit 0. The moved-path case had never been run end to end before. |
| misc | `node tmp/verify-pipeline/misc-check.mjs --dist dist` | All 170 related-card excerpts are visible copy (113 on the target page, 57 card excerpts printed on another page) and none comes from a meta description. The second phone number appears nowhere, while 978-9306 appears 486 times. No local paths or dev hosts. No duplicate ids. Both forms unwired: no action, only `identifier` hidden, submit disabled in markup. sitemap.xml has exactly 54 locs, and robots.txt is correct. |

### Defects found and fixed (before -> after)

- **V1. `ctx.asset()` shipped generated stills with no AI label.** Fixed in `src/build.mjs`, `asset()`.
  - Before: a fixture theme serving `assets/generated/loop-lens-light-poster.webp` through `ctx.asset` produced a verbatim copy with no XMP. The build exited 0 and build-verify (g) stayed green. Section 1.2 recommends `ctx.asset` for the loops, and IMAGERY delivers their posters.
  - After: a generated `.webp/.png/.jpg` asked for through `ctx.asset` is served as its full-width labelled WebP variant (`assets/img/loop-lens-light-poster-1920.<key>.webp`, at most 2400 px, q78, listed in the manifest).
  - **THEME:** the returned URL is a re-encoded WebP, not the original bytes. Videos are still copied verbatim.
- **V2. build-verify (g) could not see unlabelled copies made outside `ctx.img`.** Fixed in `tools/build-verify.mjs`.
  - Change: (g) now fails on any dist image that is byte-identical to a still under `assets/generated/`, with a control.
  - Before: a planted verbatim poster passed. After: `FAIL (g) … 1 verbatim copies` naming the file. Final dist: 0 of 35 stills.
- **V3. The build report's `inputsDigest` missed inputs.** Fixed in `src/build.mjs`.
  - Change: the digest now also covers `audit/image-inventory.json`, `tools/link-check.mjs`, every copied file (fonts, brand files, favicon, logo-1200, `ctx.asset` copies) and every image source in the manifest.
  - Before: one byte appended to a font changed dist but not the digest. After: the digest changes, and returns to its original value when the font is restored.
  - The pipeline's proof argued its inputs were stable from an equal digest, and that argument was weaker than stated.
- **V4. The image cache failed when two builds encoded the same new variant at once.** Fixed in `src/lib/images.mjs`, `flush()`.
  - Change: temp names are now unique per process and job, and the first finished rename wins. The encoder is deterministic, so a later identical result is dropped.
  - Before: `node tmp/verify-pipeline/race-test.mjs`, 3 rounds, 6/6 concurrent flushes failed (ENOENT on rename, webpmux errors) and left temp files.
  - After: 5 rounds, 0 failures, 24/24 cache entries byte-identical to the warm cache, 0 leftovers.
- **V5. The stub overflowed 13 px at 390 px** on `/insurance/`, `/products/` and `/products/contact-lenses/`. Fixed in `src/theme-stub/stub.css`.
  - Cause: `.logo-grid img { max-width: 200px }` outranks `img { max-width: 100% }`.
  - Change: `max-width: min(200px, 100%)`. After: no overflow on any of the 55 documents. My first attempt, `min-width: 0` on the grid items, had no effect and was reverted.

### Found, not changed (for the orchestrator or the practice)

- The article page prints a `target="_blank"` link to the scheduler with no `rel`. It is the source's own markup, kept verbatim in model html. The HTML standard makes `target=_blank` imply `noopener` in current browsers.
- 130 of the 153 kept non-business JSON-LD text leaves (20 or more characters) never appear in the live site's visible text. They are mostly MedicalCondition descriptions, treatments and symptoms, and the doctors' `knowsAbout`. They are the live site's own JSON-LD, so they pass "on the live site", but they are JSON-LD-only claims, the class that FACTS C10 rates low confidence and that the pipeline dropped from the business block. Whether to keep them is the practice's call.
- Inputs changed during this run: IMAGERY moved files in with their mtimes preserved, and another role added a font at 06:31:08Z. Rebuild after the last input change.

### Open / UNVERIFIED

- Everything above was measured with the stub. Once `src/theme/index.mjs` lands, rerun two builds plus `hashdir`, `link-check`, `build-verify --control` and the `tmp/verify-pipeline/` scripts. `render-check`, `text-probe` and `image-check` work with any theme. `text-probe` compares lines, so a theme that splits a model paragraph will be reported. The stub-specific parts are the related-nav selector in `misc-check` and the breadcrumb `aria-label` in `jsonld-check`.
- The generated videos (`.mp4`/`.webm`) carry no embedded AI label. webpmux does not apply to them, and their provenance is only in the IMAGERY record and sidecar.
- The redirect semantics were simulated (rule tables replayed, Apache patterns run as regexes), not served by Netlify or Apache.
- The V4 race was tested with two flushers in one process. The cross-process case relies on distinct PIDs and was not run separately.
- JSON-LD was checked structurally and for provenance, not with Google's Rich Results test (no network).

## IMAGE REFUTER (2026-10-08)

Independent re-review of the 52 files IMAGERY delivered in `assets/generated/` and of `audit/generated-images.json`.
Scripts and evidence: `tmp/verify-imagery/gen/` (no IMAGERY script imported; IMAGERY's review log was opened only after
each verdict was formed). Method: every still whole plus four 100% tiles, then 200-800% crops of temples, hinges, bridges,
lens edges, rims, hands and any print-capable surface; cut-outs composited on #0f2a4a and #f9f4f0 with alpha statistics;
loops at frames 0, 84 (turnaround), 102, 168-195 (crossfade) and 203 plus the seam, calmness re-measured over two plays
(a broken-seam control reads 11.785), every variant compared with its main loop on all frames.

**Verdicts: 45 PASS, 7 REJECT; all 7 fixed and re-reviewed (PASS).** Every audit entry now carries `review.refuter`
(verdict, reason, views). Fixed entries carry `review.refuter.fix`: attempts, final checks, and the replaced sha256 with
its backup under `tmp/verify-imagery/gen/replaced/`.

| file | why rejected | fix (attempts) |
|---|---|---|
| `hero-designer-frames.jpg` | two spiral G-like emblems on the clear frame's bridge (about 2252,674 and 2256,776); IMAGERY's 400% crops covered only the top hinges | local inpaint inside two ellipses, JPEG q1 (1) |
| `tex-blue-caustics.jpg` | fails the plan's "soft and low contrast": Ystd 0.261, Yp95 0.915, 59% of pixels fail AA for white text (IMAGERY rejected `tex-navy-glass` a1 for the same numbers) | r1 paid regeneration rejected (Ystd 0.240, Yp95 0.854, cream discs); r2 local brand gradient map of a1 (#0f2a4a, #3974a0, #7cacd0): Ystd 0.138, Yp95 0.603, neon 0, hues 203-213 deg (2) |
| `cut-eyeglasses-tortoise.png` | alpha defects inside both lenses at 100% on both grounds: speckled fringe on the left temple, ghosted right temple with a grey smear, transparent hinge block | paid birefnet/v2 "Matting" on the unchanged master (1) |
| `cut-reading-glasses.png` | IMAGERY's flood-fill alpha repair drew letter-like glyph specks on a temple shadow (absent in the master), a speckled fringe and a dashed double contour | paid birefnet/v2 "Matting" on the unchanged master (1) |
| `cut-lens-blank.png` + `raw/cut-lens-blank.jpg` | remnants of the a1 pseudo-lettering on the rim: white strokes, a black dash and dot on a white label patch, a small box, hatch strokes; IMAGERY's blur covered only the middle of the label band | local inpaint r1 (8 ellipses) + r2 (2 more); alpha unchanged, 0 px changed outside the masks; same edit on the master (2) |
| `loop-lens-light-phone.mp4` | make-loop's centred 9:16 crop cuts the lens in half on every frame; the plan meant a centred mobile crop to hold the subject | re-cropped on the lens (600x1068 at x 980 of the 1920 loop, make-loop's phone encode settings); calm p95 2.000, max 2.449, 0 frames over 20 (1) |

**Budget.** `tmp/imagery-run/ledger.jsonl` read first: 5.265 USD booked, 6.735 USD left under the 12 USD cap. Refuter
spend 0.08 USD (birefnet 2 x 0.01, ultra 1 x 0.06), each call booked in `tmp/verify-imagery/gen/ledger.jsonl` before its
result was used. Total 5.345 USD. Calls against the plan's stop rule: ultra 55/55, birefnet 10/16, kontext 4/7,
Higgsfield 3/3.

**Not changed, flagged:**
- `src/content/image-plan.json` `delivered.sha256` / `delivered.attempt` for hero-designer-frames, tex-blue-caustics,
  cut-eyeglasses-tortoise, cut-reading-glasses and cut-lens-blank still describe IMAGERY's replaced files. The plan is
  outside this role's brief. The pipeline reads `audit/generated-images.json`, which is current.
- `hero-glaucoma-management` stays UNACCEPTED (not a delivered file; nothing spent on it).
- Minor notes on PASS files:
  - Stylised dotted / scale-like fingertip skin on hero-same-day-contacts and hero-gas-permeable-contacts.
  - White flecks on the sweater in hero-foreign-body-removal.
  - The hero-sunglasses frame measures cobalt rather than navy.
  - Faint JPEG-block texture in the glass veils of cut-contact-lens and cut-trial-lens on navy at 100-200%.
  - Fine dust speckle in tex-navy-glass and its loop.
  - The composition flags IMAGERY recorded (sunglasses, multifocal, eye-health) hold.
- Embedded provenance: fal's C2PA manifest (digitalSourceType trainedAlgorithmicMedia) survives only in files nobody
  re-encoded. 18 files carry the AI label only in their sidecar, `loop-*.json` or the audit: the 14 locally re-encoded or
  derived files, both posters and both source clips. The pipeline stamps an IPTC trainedAlgorithmicMedia XMP into every
  variant it serves.
- The build was not run (its image cache `assets/optimized/` belongs to PIPELINE). Slot paths, names and alts are
  unchanged, and the variant cache key includes the source sha256, so the next build re-encodes the 7 changed files.
  UNVERIFIED in a build.

## 2. Theme core

_Merged verbatim by the INTEGRATOR on 2026-10-09 from `docs/BUILD-NOTES-theme-core.md` (title "Build notes: THEME-CORE (2026-10-09)"); its `##` headings are `###` here._

Role files (BUILD-CONTRACT §2): `src/theme/{index,chrome,home,parts}.mjs`, `src/styles/{tokens,base,glass,depth,motion,chrome,home}.css`,
`src/scripts/site.js`, `assets/brand/logo-reversed.png`; added per DESIGN-SPEC §2.1 / O2:
`assets/fonts/libre-baskerville-italic-400-latin.woff2`. Scratch, probes and evidence: `tmp/theme-core/`. Build output
used for every number below: `tmp/theme-core/dist` (built with `--report tmp/theme-core/build-report.json`, so the
pipeline's own report is never overwritten).

### 1. State found and how this run treated it

All owned files already existed from a THEME-CORE run on 2026-10-08 (last activity 17:36) that wrote no notes.
THEME-TEMPLATES had coded `templates.mjs` / `blocks.mjs` against the existing `parts.mjs` contract, so the contract was
kept and only extended additively. Every earlier measurement was treated as unverified and re-run on today's builds.

### 2. Contract changes (parts.mjs header, additive only)

- `kit.cutout(..., { depthFrom })` emits `data-depth-from="N"`; `site.js` applies no parallax below that viewport width.
  `kit.titleBand` passes 1024 for its cut-out (reason in 4.3). Hook list D gains `data-depth-from`.
- `kit.loop()` now always prints the poster as an `<img class="loop__poster">` next to the `<video>`; the video is
  displayed only under `.js-motion` (reason in 4.6). Signature unchanged.

### 3. Proof (this run; final build, two consecutive builds byte-identical)

| check | command (from the workspace root) | result |
|---|---|---|
| build x2 + identity | `node src/build.mjs --out tmp/theme-core/dist --report tmp/theme-core/build-report.json`, same to `distB`, `node tools/hashdir.mjs tmp/theme-core/dist tmp/theme-core/distB --control` | exit 0 both; IDENTICAL `acbb7f3a07d2d4cd…`, 1,067 files; control fired; inputs digest `bbcd9e85…` both; no `[theme]` warning (templates.mjs loaded, 0 unplaced home nodes) |
| links | `node tools/link-check.mjs --dir tmp/theme-core/dist` | 15,265 local refs, 0 broken, 6/6 planted controls |
| build-verify | `node tools/build-verify.mjs --dist tmp/theme-core/dist --report tmp/theme-core/build-report.json --control` | 12/12 green: (a) 1,775/1,775, (a2) 1,614/1,614, (a3) 1,329/1,329, deletion control reported exactly its sentence |
| stub fallback | `THEME_MAIN=stub node src/build.mjs --out tmp/theme-core/dist-stubmain ...` | exit 0; 53 non-home pages on the stub `<main>` (the build never breaks without templates.mjs) |
| verbatim (hard rule 1, R-22) | `node tmp/theme-core/probe-verbatim.mjs` | 13,453 visible text nodes (2,518 distinct) on 55 files: 0 outside the corpus (pages, adopted, restructure, source-chrome JSON); planted invented sentence reported. Theme-added strings are attributes only: landmark labels and the loop toggle's aria-labels (pure UI, spec 2.4) |
| tokens | node one-off against DESIGN-SPEC §3 | all §3 token names defined; 54/54 §3.4 values and 19/19 §3.1 colours identical |
| R-31 overflow | `node tmp/theme-core/probe-layout.mjs` (17 pages x 360/390/768/1024/1180/1240/1280/1366/1440/1600/1920, real scrollbars) | 0 cases; planted nowrap control fired at all 11 widths |
| R-9 first screen | same | 51/51 (17 pages x 1280x585, 1600x662, 390x844): H1 and Book below the bar and above the fold |
| R-10 | same | home 13,355 px at 390x844 (budget 13,500) |
| R-15, R-4 | same | phone header fits at 360 and 390 (logo 140/160, pill 135/140 x 44, toggle 44x44, no overlap, sw = cw); logo 200 px at 1240-1366, 208 at 1440-1600; header/footer logo is `logo-master.png` byte-identical (sha256 `1f0e11d2…`) |
| R-8 | same | mega bottom 474/585 at 1280x585, 450/600 at 1366x600; 22 links >= 14 px, 5 heads 17 px, 0 wraps at 1240-1600, aria-expanded true; control (panel +310 px) reported "does not fit" |
| R-14, R-24, R-16 | same | landmarks header, nav[Main], nav[Mobile], main, footer, nav[Footer], nav[Legal] (+ nav[Breadcrumb] inside interior pages); portraits 150/150/150; 6 home service cards |
| R-6, R-20, R-7 | `node tmp/theme-core/probe-behavior.mjs` | 4/4 disclosures: hover sets aria-expanded true + visible, leave closes, Enter opens, Tab enters, Esc closes and returns focus. Drawer: dialog + aria-modal, focus moved in, main and footer inert, scroll locked, 0 escapes in 40 Tabs, Esc / scrim / resize close, focus returns |
| R-26 | same | control: hero loop seen playing (t 1.87 s), toggle pauses (label "Play background video") and resumes, loop stops itself; after 6.5 s idle 0 of 16 animations running outside scroll timelines, all videos paused |
| R-32 | same | 0 hidden in the first screen, after a full scroll, after a mid-page jump (in view), with a dead observer (39 gated to 0 in 3.6 s), under reduced motion (no js-motion, 0 gated, 0 translated, 0 running, 0 videos) and without JS; planted control counted |
| R-27, R-13, R-11, R-3b | same | italic face loaded, font-synthesis none on h1 and .acc; only the header is sticky, scroll-padding-top 90 = 74 + 16; Book first + primary in every group on 9 pages; primary #3974a0, hover and focus #0f2a4a |
| R-12 | same | paragraphs >= 16, meta >= 13, eyebrows >= 12 everywhere; UI >= 14 except one THEME-TEMPLATES button (section 6) |
| touch targets (hard rule 6) | `node tmp/theme-core/probe-a11y.mjs --part touch` | 390x844: 331 controls on 5 pages + the open drawer, 0 below 44 px (box or 44x44 hit test); planted 20x20 link caught |
| visible focus (hard rule 6) | `... --part focus --pages ...` (two chunks) | 693 Tab stops (368 at 1440x900, 325 at 390x844) on 6 pages, every one a visible pixel change (> 24 px) and :focus-visible; ring-less planted link flagged; ringed planted link at the end of main registered |
| R-30 | `... --part parity` | 18/18 component samples: hover and keyboard focus give identical computed results |
| R-19 | `node tmp/theme-core/probe-pixels.mjs --part contrast --views <v>` | 37/37 groups at 1280x585, 37/37 at 1440x900, 35/35 at 390x844 (home sections, chrome, mega menu, interior title band, lede, Related cards, CTA strip); tightest blue-ink eyebrow on the dry-eye panel at 1280: p05 4.80, worst 4.71; light-grey control 2.17 caught |
| R-5, R-17 | `... --part glass` | 129 panels at 1280/1440/390: all pass except THEME-TEMPLATES' opt-card and CTA-band card (section 6); lowest other 0.111 |
| R-3 | `... --part navy` | dark-navy share 17.7 % of the 12,440 px home at 1440 (judges' method, L < 0.07 and b > r) |
| R-18, R-1 | `... --part protrude` (9 sizes, 5 pages) | home: 27/27 cut-out placements pass (crossing 32-40 px on phones, 40-106 px from 768, 0 text hits, inside x); both postcards cross the footer edge at all 9 sizes (e.g. 768: 114/55 and 40/62 px above/below; 1600: 237/59 and 108/66); location card 81 above / 122 below the hero seam from 768 (in flow on phones, spec H1). Title-band cut-out: 0 text hits at all sizes. 45/45 planted controls (same measurement code) fired |
| R-16 | `node tmp/theme-core/probe-media.mjs` | reduced transparency: glass rgba(255,255,255,.97), no blur, bar white, smoked glass #0c2341; forced colors: ambient, cut-outs, seam, loops hidden (block by default), glass border solid |
| R-2, R-25, R-28 | grep on dist; probe network logs | 0 `href="#"` in 55 files; Reviews -> `/reviews/` in nav, drawer, footer; 20 blockquotes on /reviews/, 3 on the home; 0 `tmp/` or `panel/` references; the only third-party request in any probe run was the lazy map embed (www.google.com) |
| reversed logo | `node tmp/theme-core/make-logo-reversed.mjs --check` | file on disk identical to a fresh regeneration (sha256 `9ebd5811…`); alpha equal to the master on every pixel; 0 non-cream visible pixels; not referenced anywhere in dist (spec 9.7 / O1: the footer shows the original logo on a light plate) |
| screenshots | `node tmp/theme-core/shots.mjs --pages /,/services/dry-eye-treatment/ --out tmp/theme-core/shots/final`, `node tmp/theme-core/shots-states.mjs` | 8 first screens at 1280x585, 1600x662, 1440x900, 390x844 (sw = cw, 0 exceptions, 0 console errors) and 10 state captures (mega, 3 dropdowns, drawer, reduced motion, no JS), all viewed |
| console | all probe runs | 0 exceptions; the only console entries are the deliberate 404 test URL's own 404 status |

### 4. Defects found and fixed this run (before -> after, all measured)

1. **Postcard sizing starved `auto` grid tracks** (`depth.css`). `width: min(var(--pc-w), 100%)` cannot resolve while a
   track is sized, so the print contributed its image's 800 px: THEME-TEMPLATES' `.pc-split` gave the text column 172 px
   at 1024 and the heading ran 30 px off-screen on `/eye-doctor-pine-beach/`. Now `width: var(--pc-w); max-width: 100%`:
   the track is the print (338 px at 1024), 0 overflow at 11 widths.
2. **Touch targets** (`base.css`, `chrome.css`, `glass.css`): skip link 41, logo link 42, phone Book pill 40 (the
   spec's 9.6 height; the brief's 44 px floor wins), location-card title 24, footer logo 36, breadcrumbs 32 px tall ->
   all >= 44 (breadcrumbs through a 7 px `::after` hit area, so the title band does not grow).
3. **Title-band cut-out touched text below 1024** (390: the band's Call button; 768: lede copy). THEME-TEMPLATES' lede
   notch reserves the cut-out's rest footprint; the probe adds the full parallax range. The cut-out now holds still below
   1024 (`data-depth-from`), 0 hits at all 9 sizes.
4. **Home eyewear cut-out missed its seam at 768** (crossing 0: it hung off the vertically centred arch). Anchored to the
   section on tablets and the contacts panel starts 32 px lower there: crossing 60, 0 hits.
5. **Postcard A did not rise out of the footer** (29 / 18 / 6 / 1 / 1 px at 1280 / 1366 / 1440 / 1600 / 1920) and postcard
   B missed the edge at 768. From 768 the prints use the graft reference's absolute layout (b-navy `styles.css`
   567-570); both now cross at all 9 sizes.
6. **No-JS hero showed a dead native video control bar** ("0:00", mute, fullscreen): Chrome exposes controls on any
   `<video>` when scripting is disabled. The poster is now an `<img>` and the video is displayed only under `.js-motion`.
7. **The map iframe had no visible keyboard focus.** Measured: when Tab enters the cross-origin map, Chrome sets
   `activeElement` to the iframe but matches neither `:focus` nor `:focus-within` on the frame. `site.js` now marks the
   frame `.is-kbd-focus` from the window blur (not when the pointer is over it); a rose/red ring shows.
8. **R-30 mismatches**: post card lifted on hover only; footer links nudged on hover only. Mirrored on focus (18/18).
9. **R-5**: Related card grids left the first-row middle card on flat cream (range 0.046-0.077). Pools re-laid one per
   column: lowest 0.138 at 1280/1440/390 on three pages; Related card text p05 >= 8.18.
10. **Eyewear dropdown**: the round contact-lens thumbnail was 56 px tall in its 42 px tile; thumbnails are now sized
    54 px wide or 38 px tall, whichever is smaller (width moved from `chrome.mjs` inline style to CSS).
11. `base.css` shipped a comment naming a `tmp/` path inside the CSS bundle; reworded (R-25 grep now 0).

### 5. Deviations from DESIGN-SPEC (contract or brief wins, or a measured conflict)

- **Lens loop in the hero, not the reviews band** (spec H11): the brief puts the Higgsfield loop in the hero with a pause
  control; the reviews band uses the loop's still (`still-loop-lens-light`). The loop plays at most 5 s per entry
  (R-26) and has a pause/play button (aria-labels only, no shown text).
- **Footer loop plane at 16 % opacity, not 35 %** (spec 9.7): at 35 % the bokeh took label-inv headings and hours to
  3.5:1 (2026-10-08 measurement); R-19 wins.
- **Phone Book pill 44 px tall, not 40** (spec 9.6), for the brief's 44 px touch-target rule; it still fits at 360.
- **Title-band cut-out without parallax below 1024** (spec 6.2 halves it below 768): see 4.3.
- **Postcards from 768 laid out absolutely** after the graft reference rather than in the 12-column sub-grid.
- `logo-reversed.png` is delivered but unused (spec 9.7 / O1); practice approval still needed before any use on navy.

### 6. Found, not mine (THEME-TEMPLATES files; for that role or the integrator)

- `ad-split__cutout` (adult exams, sunglasses splits): crosses no seam at any of the 9 sizes (R-18 rule 2) and touches
  text at 390 ("Pine Beach", "Finding a Style You'll") and 768 ("Keep On").
- `/products/` title-band cut-out at 768 crosses 32 px (< 40): flat navy eyeglasses at the `.tpl-cut` 17vw tablet size.
  My base minimum (150 px) would give about 37 px, so a fix needs a larger tablet cut-out and a matching notch: joint.
- R-5: `opt-card` 0.083-0.096 and the navy CTA-band card 0.039-0.047 (gate 0.10) on the dry-eye page.
- R-12: `.carousel__more` "Show More" is 13 px (`src/styles/blocks.css` line 79); UI floor 14 px.
- Process note: THEME-TEMPLATES' probe `tmp/theme-templates/rtests.mjs glass` (node PID 21436, started 2026-10-08 17:36)
  was still running with a headless Chrome this morning; it was gone by 02:12. My own probe's Chrome disappeared at about
  the same time mid-run (cause UNVERIFIED); I stopped my hung node process by PID and hardened the harness to fail fast.

### 7. Open and UNVERIFIED

- Only headless Chrome (one at a time, real scrollbars) was used. Safari and Firefox fallbacks (backdrop-filter,
  mask-composite, scroll timelines, `:has()`) are UNVERIFIED.
- Every probe blocked third-party requests, so the live Google map (its own focus styles inside the frame, its load)
  and the scheduler page were never loaded: UNVERIFIED.
- The map-frame keyboard ring relies on a window-blur heuristic; behaviour with a real map inside is UNVERIFIED.
- Pixel probes covered the home, the chrome and selected interior blocks; THEME-TEMPLATES' blocks on the other 50 pages
  are that role's to measure.

## 3. Theme templates

_Merged verbatim by the INTEGRATOR on 2026-10-09 from `docs/BUILD-NOTES-theme-templates.md` (title "Build notes: THEME-TEMPLATES (2026-10-09)"); its `##` headings are `###` here._

Role files (BUILD-CONTRACT §2): `src/theme/templates.mjs`, `src/theme/blocks.mjs`,
`src/styles/{interior,blocks,forms,special}.css`, `src/scripts/features.js`. Scratch, probes and evidence:
`tmp/theme-templates/`. Every number below was measured this run on `tmp/theme-templates/dist`, built with
`node src/build.mjs --out tmp/theme-templates/dist --report tmp/theme-templates/build-report.json` (the pipeline's own
report and `dist/` were never touched). Headless Chrome ran one at a time in the foreground on 127.0.0.1:8872 with every
request to another origin failed and recorded.

### 1. State found and how this run treated it

- All seven owned files already existed from a THEME-TEMPLATES run on 2026-10-08 (last edit 17:36) that wrote no notes.
  Its code was kept as the starting point, read in full, and every earlier measurement was treated as unverified: all
  numbers here come from this run's builds and probes.
- That run had left a probe hanging since 17:36: `timeout 590 node tmp/theme-templates/rtests.mjs glass` (node PID 21436,
  its headless Chrome PID 17212, `timeout.exe` PID 23500), holding this role's port 8872. Stopped by PID (01:1x).
  Lesson kept in the probes: `tools/cdp.mjs`'s `Page.eval` leaves a 60 s timer per call (every script lingered 60 s
  after its last eval) and its sends have no timeout (a dead Chrome hangs the script); `tmp/theme-templates/lib.mjs`
  uses its own clearable timeouts, fails fast when the Chrome process exits and relaunches. Headless Chrome exited with
  code 4294967295 twice mid-run this session (cause UNVERIFIED, not this role's processes); the probes re-measured the
  page in a fresh browser.
- THEME-CORE was active at the same time and extended `parts.mjs` additively (`kit.cutout({ depthFrom })`, poster
  `<img>` in `kit.loop`); its title-band cut-out holds still below 1024 because this role's lede notch reserves the
  cut-out's rest footprint (both roles' probes now agree: 0 text hits).

### 2. Interfaces

- `templates.mjs` exports `renderMain(page, ctx, kit)` for every kind except `home`, `render404Main(ctx, kit)` and
  `bodyClass(page)` (`tpl-<kind>`). `blocks.mjs` holds the node and block renderers.
- **`render404Main` is not called by `index.mjs`**: THEME-CORE's `render404` composes its own 404 `<main>` from the kit
  (same pieces). The export was proven with a test-only theme, `tmp/theme-templates/fixture-404/index.mjs`, which is the
  real theme with the 404 `<main>` swapped for `render404Main`: `node src/build.mjs --theme
  tmp/theme-templates/fixture-404/index.mjs --out tmp/theme-templates/dist-404 --report
  tmp/theme-templates/build-report-404.json` exits 0, link-check 0 broken (15,355 refs, 6/6 controls), one `<h1>`
  ("Page not found", no accent), 10 references in `<main>`, all root-absolute, five Services group tiles. Whether the
  404 uses it is the integrator's call.

### 3. Defects found and fixed this run (before -> after, measured)

1. **Bio title band**: the panel's padding reserved the portrait's width for every row, so Book and Call wrapped onto
   two rows at 1280. Only the crumbs and the H1 keep clear of the portrait now; the CTA row is one line (capture
   `tmp/theme-templates/shots/final-1280-c.png`).
2. **Faces under the floating header** (DESIGN-SPEC 13.4): every generated hero used `70% 45%`. At 1280x585 and
   1600x662 the full-bleed photo is cropped vertically and the header covers its top 74 px, so the eyes of the
   children's-contact-lenses girl sat at the header edge. Positions per hero now (`HERO_POS`, x = IMAGERY's focal x;
   y 0 % for the 14 heroes with a person, focal y for the 7 object heroes), read from a contact sheet of all heroes with
   10 % grid lines (`shots/heroes-sheet.png`). The multifocal hero's face (about 47 % x) stayed under the glass panel at
   every desktop size: that one hero uses the half variant (deviation 5.3). Checked at 1265x585, 1440x900, 1585x662 and
   390x844 (`shots/heroes-1.png`, `heroes-2.png`, `heroes-3.png`).
3. **Accent split the practice name** (10.1 rule 2): "Terms of Use for the Academy *Vision Website*" and "Visit Academy
   *Vision for Eyeglasses*". `brandPhrase()` replays the kit's rule and extends the accent over "Academy" when it would
   start on "Vision" (kit `phrase` override); the whole-heading case gets no accent.
4. **Compact band was not compact at 1280x585**: THEME-CORE's short-window rule (`.title-band`, 92svh) comes after
   `.title-band--compact` in the cascade and cancelled it, so legal and sitemap pages showed only the band in the first
   screen. Restated under this role's `.tpl-compact`: measured 400 px at 1280x585 (before, the short-window rule gave
   92svh, about 538 px by the rule, and the first capture showed nothing below the band); the policy and the sitemap
   cards now start in the first screen. Form pages get the same height under `.tpl-form` with their CTA row kept (400
   and 418 px at 1280x585; the form started below the fold before).
5. **About postcard band** (11.5, P-frame): the mural print floated at the top of the band. The aside now aligns to the
   row's bottom, so the print's own negative margin carries it across the seam (1440x900, 1280x585, 1024x768 viewed).
6. **Navy child-page cards were unreadable** (`/products/contact-lenses/`): `depth.css`'s `.band--navy :where(h3)`
   (later in the cascade than `glass.css`'s `.card__title`) turned the titles cream on white glass. Titles are navy
   again (p05 now measured in 4); the band was also reworked into the P-row the spec names (navy zone ending with a hard
   edge across the first card row, cards straddling it; later rows on the canvas pools): R-5 0.019-0.027 -> straddle.
7. **Lightbox showed the second phone number**: the flagged street view (`practice-35051-15ef8052`, 13.5) opened full
   frame, roadside sign and "732-736-1700" included. The enlarged view keeps the 1:1 crop (keyboard probe: 600x600,
   `object-fit: cover`, `12% 50%`).
8. **R-5 glass on flat backdrops**: option cards 0.06-0.09 and small cards between pools (reviews 0.089, lens products
   0.079, sitemap 0.072-0.083, post card 0.097) -> pools per option-grid cell, the cream-light texture as a plane under
   the small-card sections, stronger section pools; the navy CTA card (0.04-0.05) -> deviation 5.1.
9. **Adopted split cut-out** (R-18): below 900 it crossed no edge (-1 to -27 px) and its grown box touched the panel
   heading at 390 and 768 (THEME-CORE's notes saw the same). Below 900 it now stands in its own row above the panel with
   the band's top edge through its middle and holds still (`data-depth-from 900`); from 900 its object box is at least
   90 px tall and the panel keeps clear of its footprint.
10. **Title-band cut-out crossing at 768** (`/products/`, navy frame): 32 px -> 42 px with a width floor for wide
    eyeglasses (768-1023 `max(17vw, 60px x aspect)`, phones `max(26vw, 40px x aspect)`); the notch uses the same width
    and the aspect kit.cutout measured (`--cut-ar`), not a table.
11. **Small text and targets**: "Show More" 13 -> 14 px (a button: UI floor, R-12; THEME-CORE's notes flagged it);
    sitemap links 36/40 -> 44 px rows on touch layouts; doctor name links (23 px) get a 45 px hit area.
12. **Field errors** gained `role="alert"` (10.23 says so; filled from `messages.validation`, linked by
    `aria-describedby`).
13. **R-30**: chip and option-card lifts now also apply on `:focus-within`.

### 4. Proof (final build)

All rows below ran on one build, `tmp/theme-templates/dist` (aggregate `4ac1433a…`, 1,067 files, inputs digest
`3ac59f3d…`); no source file changed after it. Probes live in `tmp/theme-templates/` (`lib.mjs`, `tt-shots.mjs`,
`tt-kbd.mjs`, `tt-rtests.mjs`, `probe-verbatim.copy.mjs`), logs `final-*.log`. Every probe has a positive control that
fired in the same run.

| check | command | result |
|---|---|---|
| build x2 + identity | `node src/build.mjs --out tmp/theme-templates/dist --report tmp/theme-templates/build-report.json`, same to `distB`, `node tools/hashdir.mjs tmp/theme-templates/dist tmp/theme-templates/distB --control` | exit 0 both, BUILD OK; IDENTICAL `4ac1433afdbf325c…` 1,067 files; control fired; same inputs digest; theme `src/theme/index.mjs` with templates.mjs loaded |
| links | `node tools/link-check.mjs --dir tmp/theme-templates/dist` | 15,355 local refs, 55 fragments, 0 broken; 6/6 planted controls |
| build-verify | `node tools/build-verify.mjs --dist tmp/theme-templates/dist --report tmp/theme-templates/build-report.json --control` | 12/12 green: (a) 1,775/1,775 model units, (a2) 1,614/1,614, (a3) 1,329/1,329 adopted units, deletion control reported exactly its sentence; (b) one h1 in 55 files |
| verbatim (R-22) | `node tmp/theme-templates/probe-verbatim.copy.mjs --dist tmp/theme-templates/dist` (unchanged copy of THEME-CORE's probe) | 55 files, 13,453 visible text nodes, 0 outside the content corpus; planted invented sentence reported. Attribute-only UI strings: the model's "Advance to slide {n}" with n filled, "Breadcrumb", "Mobile", the loop toggle |
| keyboard + behaviour | `node tmp/theme-templates/tt-kbd.mjs` | 36/36: carousel (20 slides, 20 blockquotes, authors, dates; no auto-advance over 6.2 s; Next/Previous by Enter and Space; one dot tab stop, arrows/Home/End; Next/Previous aria-disabled at the ends), Show More (Tab-reachable, reveals the full quote, focus moves to it, 12 -> 11), lightbox (3 buttons from `ui.lightbox`, Enter opens, Esc and the same button close, focus returns, flagged photo stays a 600x600 crop), Show All (12 of 26, Tab-reachable, Enter shows 26 and focuses the 13th), FAQ (native details, closed, Enter opens, Space closes, Tab to the next), both forms (labels non-empty, `role=alert` error slots, source validation copy, first invalid control focused, conditional fields 21 hidden / revealed by Space / hidden by ArrowRight, hidden fields not validated, complete submit stopped with the source error copy and Book/Call, no navigation, nothing sent, phone mask), lazy map (all `loading=lazy`, keyless, by name + address; the farther map deferred until scrolled near), no JS (20 full quotes, 26 brands, both submits disabled, FAQ opens) |
| DOM R-tests | `node tmp/theme-templates/tt-rtests.mjs dom --pages all --part 1/2` and `2/2` | 108/108 (54 documents x 1440x900 and 390x844): one h1 and one main; R-11 in 288 button groups (Book first and `#3974a0` primary, white on navy; Call never primary); R-12 smallest rendered text: eyebrow 12, meta 13, UI 14, paragraph 16 px; R-24 portraits <= 140 px; R-13 0 sticky in main; R-14 every nav in main labelled; R-32 0 elements below opacity .05 after a scroll-through; 0 `href="#"`, 0 empty links; 0 console errors or exceptions |
| overflow (R-31) | `node tmp/theme-templates/tt-rtests.mjs overflow --pages all --widths <w>` (390, 768, 1024, 1280, 1440) and `--pages kinds --widths 360,1180,1240,1265,1366,1585,1920` | 54/54 documents at each of the five required widths, 24/24 at the seven others: scrollWidth == clientWidth, nothing outside the viewport hidden only by the body/main clip guard, no text line cut at the edge (controls: a planted 120vw block and a pushed text line both reported) |
| contrast (R-19) | `node tmp/theme-templates/tt-rtests.mjs contrast --sizes <s>` (1440x900, 1265x585, 390x844) | 168/168 (56 text targets on 20 pages x 3 sizes), measured per line box on painted pixels with the text transparent; lowest p05 5.02 (white on the `#3974a0` primary); control `#c9c4be` p05 1.72 reported |
| glass (R-5) | `node tmp/theme-templates/tt-rtests.mjs glass --sizes <s> --cap 6` (1440x900, 390x844) | 126/126 panel instances (27 selector/page pairs, up to 6 instances each): lowest light-glass range 0.104; the Stellest navy split on phones passes by straddling the photo edge (edge 0.185); control (flat plate) 0.000 reported |
| protrusions (R-18) | `node tmp/theme-templates/tt-rtests.mjs overlap --sizes <list>` (360x740, 390x844, 768x1024, 900x1000, 960x900, 1024x768, 1180x820, 1265x585, 1366x768, 1440x900, 1585x662, 1920x1080) | 156/156 cut-out placements on 12 pages: 0 text or button hits at the rest pose grown by the real parallax range + 8 px, all inside x, crossing >= 40 px from 768 (min 40) and >= 24 px on phones (min 28); control (cut-out moved onto the H1) reported |
| first screen (R-9) | `node tmp/theme-templates/tt-shots.mjs first --vp 1280x585,390x844 --sheet final`, `--vp 1585x662,1440x900` | 96/96 (24 kinds x 4 windows): H1 and Book fully below the bar and above the fold; lowest Book bottom 422/585, 585/844, 459/662, 586/900 (`/services/childrens-contact-lenses/`, longest H1); 0 overflow, 0 console errors, 0 broken images |
| motion (R-26, R-32) | `node tmp/theme-templates/tt-rtests.mjs motion` | 18/18: after a scroll-through and 6.5 s idle 0 time-based animations running and 0 videos playing on 6 pages; 0 hidden after a mid-page jump (1.3 s), with a dead observer (3.6 s), under reduced motion (no js-motion, 0 parallax) and without JS; planted opacity-0 paragraph counted |
| touch targets (rule 6) | `node tmp/theme-templates/tt-rtests.mjs touch --pages all --part 1/2`, `2/2` | 54/54 documents at 390x844: 1,024 controls, each >= 44x44 or hit by a centred 44 px square; 98 inline text links listed apart; planted 20x20 link reported |
| visible focus (rule 6, R-30) | `node tmp/theme-templates/tt-rtests.mjs focus` (8 pages at 1440x900) and `--sizes 390x844` (5 pages) | 359 Tab stops in `<main>`, every one `:focus-visible` (the map iframe: THEME-CORE's `.is-kbd-focus` ring) with a visible pixel change; ring-less planted link reported. Static: every `:hover` rule in this role's CSS has a `:focus-visible` / `:focus-within` twin, except the lens product cards (no control inside) and the form inputs' hover border (their focus state is the stronger blue ring) |
| 404 interface | fixture theme (section 2) | build exit 0, link-check 0 broken, one h1, root-absolute URLs |
| flagged crops (13.5, O12) | `tt-shots.mjs multi` captures `shots/zoom-a.png`, `zoom-b.png` (viewed, earlier build of this run), frame geometry re-read on the final build | insurance `photo-as-527484728`: 16:9 frame (938x528 at 1440, 397x223 at 390), cover, `50% 100%`, so the top 13 % of the photo (the "FLU" lettering sits in the top 9 %) is cut; medical `photo-as-558091528`: 4:5 arch (498x623, 343x428), `20% 30%`, showing x 9-63 % of the photo (the meter is at 65-74 %); street view: 1:1 print (367 px, 365 px), `12% 50%`, x 3-78 % (digits from 83.5 %), and the enlarged view keeps the crop (keyboard probe). No flagged detail visible in the captures |
| screenshots viewed | sheets `tmp/theme-templates/shots/final-1280-{a..f}.png`, `final-390-{a..c}.png`, `strip-{a..k}.png` (1440 full pages), `zoom-{a..f}.png`, `heroes-{1..3}.png`, `heroes-sheet.png` | one page of every kind (service, service-hub, product x2, product-hub, about, doctors, bio, location, reviews, insurance, both forms, legal, sitemap, article, eye-health, five adopted pages incl. /terms/, the 404) at 1280x585 and 390x844, read image by image |

### 5. Deviations from DESIGN-SPEC (a MUST, the contract or a measurement wins)

1. **CTA band card is smoked `.glass--navy`, not `.glass--navy-soft`, over the loop plane at 60 %, not 30 %** (10.9).
   Measured on `/services/dry-eye-treatment/` at 1440x900 and 390x844: navy-soft over 30 % gave a backdrop range of
   0.041-0.048 (R-5 needs 0.10); navy-soft over 60 % reached 0.134 but its body text fell to p05 2.9 (R-19); smoked over
   60 % gives 0.133 with body p05 11.5. Only the smoked card satisfies both measured rules.
2. **Street view at `12% 50%`, not `30% 50%`** (10.20, 13.5): the sign's digits start at x 83.5 % of the 800 px frame
   (viewed); a 1:1 crop at 30 % shows up to 82.5 % (1 % margin, less with the print's tilt); 12 % shows 3-78 %.
3. **Multifocal hero uses the half title band**, not full (11.16): DESIGN-SPEC 13.4 (no face covered) outranks the
   variant default; the face is right of the panel and below the header at 1265x585, 1440x900, 1585x662.
4. **Hero object positions** differ from the single `70% 45%` (13.4 says check faces at four sizes): section 3 item 2.
5. **No accent on bio H1s** (people's names), the reviews H1 ("Academy Vision", two words anyway), the sitemap and 404.
6. **Carousel dots hidden on touch layouts and below 1024**: 24 px dots cannot meet the 44 px touch rule (hard rule 6);
   prev / next (48 px) and swiping remain; all 20 dot buttons stay in the markup and work by keyboard on desktop.
7. **Review excerpts ride in `data-excerpt`** instead of a hidden element (10.19): the full quote is the static text
   (build-verify (a) reads it); `features.js` builds the excerpt and the Show More button.
8. **Crossing threshold 40 px from 768** (6.4 says "desktop sizes" and "phones"): tablets are held to the desktop
   number, as THEME-CORE's probe does; 24 px below 768.
9. **Feature layout (10.7, full-bleed) is unused on interior pages**: no interior block qualifies (every `fullBleedOK`
   master is a title-band photo; other block images are 2000 px or smaller).
10. **Doctor portraits in Related** use a small portrait card (120 px, 96 px on phones) instead of the 16:10 card photo
    (BUILD-CONTRACT 4.10: the 223-300 px sources are shown no larger than they support).

### 6. Found, not changed (for the practice, THEME-CORE or the integrator)

- `/appointment-request-form/` prints the source's own field description "Details are stored securely and not sent by
  email." (verbatim, hard rule 1). The rebuilt form is unwired and stores nothing; the sentence becomes true or must go
  when the practice picks a (HIPAA-appropriate) backend: practice decision.
- The honest notice after a complete submit is the source's own error copy ("There was an error submitting your form.
  Please try again.") with Book and Call: no success is ever claimed and no new words are written; better wording needs
  the practice.
- THEME-CORE's 404 tiles: on phones the "»" of "Comprehensive Exams" wraps onto its own line (THEME-CORE component).
- `index.mjs` does not use `render404Main` (section 2).

### 7. Open and UNVERIFIED

- Only headless Chrome was used (one at a time). Safari and Firefox (backdrop-filter, `:has()`, mask, scroll timelines)
  are UNVERIFIED.
- Third-party requests were blocked in every probe: the live Google map and the scheduler page never loaded
  (UNVERIFIED); the map's focus ring is THEME-CORE's heuristic.
- R-5 and R-19 sample the components named in `tt-rtests.mjs` (56 text targets, 27 panel selectors with up to 6
  instances each); other instances of the same components on the other pages are covered by the same CSS, not measured.
- The faces check of the generated heroes was visual (contact sheet with grid lines plus first screens at four sizes);
  a replaced hero image from IMAGERY would need its `HERO_POS` entry re-read.
- R-3, R-4, R-6, R-7, R-8, R-10, R-15, R-16, R-17, R-20, R-21, R-27 concern the home, the header, menus, drawer and footer
  (THEME-CORE); not measured by this role.
- The probe labels in `tt-rtests.mjs` still call the CTA card "navy-soft" in one row title; the card is smoked (5.1).

## 4. Integration

INTEGRATOR role, 2026-10-09 (owner of the whole tree for this stage). Scratch, probes, logs and captures:
`tmp/integrate/`. Headless Chrome one at a time, in the foreground, on 127.0.0.1:8881, through `tmp/integrate/lib.mjs`
(a copy of THEME-TEMPLATES' `lib.mjs` using `tools/cdp-realsb.mjs`: real 15 px scrollbar, every other origin failed and
recorded). Before this stage `dist/` was `4ac1433a…` (1,067 files, identical to THEME-TEMPLATES' final build); after it,
`4441ab00…` (1,067 files). Every number below was measured this run.

### 4.1 Changes (what, why, before -> after)

| # | change | files | before -> after (evidence) |
|---|---|---|---|
| 1 | Merged the two theme notes as sections 2 and 3 (verbatim; their `##` headings became `###`, a provenance line replaces each H1) and deleted `docs/BUILD-NOTES-theme-core.md` and `docs/BUILD-NOTES-theme-templates.md`. Two code comments that named the deleted files now name this file or the probe. | this file, `src/styles/base.css` (comment), `src/theme/blocks.mjs` (comment) | `node tmp/integrate/merge-notes.mjs`: each original rebuilt from the merged text is EXACT (13,767 and 19,197 chars); a one-character change in each section breaks the round trip (control fired twice). Originals kept in `tmp/integrate/notes-originals/` |
| 2 | **Glaucoma hero (OPEN-DECISIONS A7).** Plan slot `hero-glaucoma-management` gets additive fields `reuse: "photo-as-293097203"`, `reuseAlt` ("An older woman with white hair rests her face against an eye-imaging instrument while a clinician operates it; its screen shows an image of an eye.") and `reuseNote`; its original `alt` (the planned generated image) is untouched, so removing the three fields restores the plan text exactly (checked). `images.mjs`: a reuse slot resolves to the master's own file (`assets/source/2697f414-AdobeStock_293097203.jpeg-w_2000.webp`, 2000x1335), is never labelled, never gets `data-ai-generated`, is not copied into `assets/generated/`, and its variants keep the master's name (`adobestock-293097203-*`, the same files the comprehensive-exams page already used: 986 variants, 0 encoded). Fail closed: unknown or removed master, missing `reuseAlt`, or a slot that also has a delivered generated file is a build error. `templates.mjs`: `HERO_POS` `'50% 0%'` and the slot joins `HALF_HEROES`: in the full variant the patient (left third of the photo) and the instrument screen showing the eye sat under the glass panel at 1280x585 and 1600x662 (`tmp/integrate/shots/glaucoma-full/`); the half variant shows the instrument, the eye on its screen and the clinician's face right of the panel and below the header | `src/content/image-plan.json`, `src/lib/images.mjs`, `src/theme/templates.mjs` | Before: texture title band (no photo). After: half title band with the photo. `node tmp/integrate/xmp-check.mjs` (final dist): 8 glaucoma srcset variants, 0 with XMP (`webpmux -get xmp`), no `data-ai-generated`; adult-exams and macular heroes 9/9 and 9/9 with trainedAlgorithmicMedia (the reader's positive control); 0 `assets/generated/` entries naming glaucoma. `node tmp/integrate/reuse-failclosed.mjs`: 5/5 (clean control resolves to the master with no AI attribute; 4 planted defects give exactly one error each and no image). First screens (`tt-shots.mjs first`): H1 243-328 / Book 348-400 at 1280x585, 277-365 / 385-437 at 1600x662, 416-547 / 566-618 at 390x844, header 74/74/68, sw = cw, 0 errors; captures viewed (`tmp/integrate/shots/services_glaucoma_management.*.png`) |
| 3 | **Video provenance.** The 7 top-level `assets/generated/*.mp4|*.webm` were remuxed (`ffmpeg -map 0 -c copy -map_metadata 0 -metadata comment=… -fflags +bitexact`, `+faststart` kept on MP4) with comment "AI-generated with Higgsfield (Kling image-to-video); IPTC digital source type trainedAlgorithmicMedia". `raw/*.source.mp4` were left as delivered (their `providerSha256` must keep matching). `audit/generated-images.json` sha256 + bytes updated for the 7 records (each gets `provenanceRemux` with the old values); both `loop-*.json` sidecars record the remux; `image-plan.json` `delivered` synced from the audit for the 5 refuter-replaced slots (sha256, attempt = the refuter's delivered file, `syncedFromAudit` with the old values) | `assets/generated/*.mp4|webm`, `audit/generated-images.json`, `assets/generated/loop-*.json`, `src/content/image-plan.json` | `node tmp/integrate/video-provenance.mjs --write` then `node tmp/integrate/video-audit-sync.mjs --write`: per file, packet framemd5 (204 packets) and decoded-frame framemd5 (204 frames) identical before/after; MP4 box order `ftyp>moov>free>mdat` kept; every other format tag kept; a planted one-line framemd5 change reported (control fired 7/7); `ffprobe` shows the new comment on 7/7 (before: the older "AI-generated illustrative motion (Higgsfield kling-video/v3.0-turbo/image-to-video)…" comment, no IPTC term; the `description` tag with that text is kept). Bytes: e.g. `loop-lens-light.mp4` 727,378 -> 727,288, sha `b1e996d0…` -> `1f6d99a9…`. Side effects measured: `-fflags +bitexact` drops the MP4 `encoder` tag (Lavf63.1.102) and writes "Lavf" in WebM; the WebM container duration reads 8.499 s instead of 8.500 s (the stream-copy muxer's 1/1000 timebase on the last packet; every packet's pts and duration are unchanged). Re-check: 52/52 audit `images[]` sha256 equal the files on disk; 33/33 plan `delivered.sha256` equal the audit (a planted wrong sha is caught). Originals: `tmp/integrate/remux/orig/` |
| 4 | **404.** `render404` now uses THEME-TEMPLATES' `render404Main` when `templates.mjs` is loaded (index.mjs keeps its own composition as the fallback). Compared on two builds: the only differences were (a) the tiles section's `tpl-pool` light pools and (b) the H1 accent. R-5 on `.nf-tiles .card` (`tt-rtests.mjs glass --pairs`): lowest backdrop range 0.190 (templates) vs 0.141 (index) at 1440x900, 0.221 vs 0.152 at 390x844; both pass, the pooled one with more margin, so it was kept. Its `accent: false` had no recorded reason and DESIGN-SPEC 10.1 rule 2 gives "Page *not found*" (3 words: the last two) with the swoosh, so the accent is restored (`'404'` dropped from `NO_ACCENT_KINDS`, which no page kind used) | `src/theme/index.mjs`, `src/theme/templates.mjs` | Built 404 `<main>`: `nf-tiles tpl-pool` + `Page <em class="acc">not found…`; one h1; captures at 390x844 and 1280x585 viewed |
| 5 | **"»" alone on a line.** Every card arrow (`kit.cardGrid`, doc cards, post cards, Related cards in templates, the location-card address link) now follows its label with `&nbsp;`, and `.arrow` is an inline box (`position: relative; left` nudge on hover/focus instead of a transform). Cause measured: CSS Text 3 5.1 keeps a wrap opportunity before an inline-block even after U+00A0 (the `&nbsp;` alone changed nothing: 13 arrows still alone) | `src/theme/parts.mjs`, `src/theme/templates.mjs`, `src/theme/blocks.mjs`, `src/styles/glass.css` | `node tmp/integrate/arrow-wrap.mjs` on 7 pages (404, `/services/`, `/our-doctors/`, `/eye-health/`, `/eye-doctor-pine-beach/`, dry eye, `/products/`): before 19 of 129 arrows alone at 360/390/414 (404 at 390: "Comprehensive Exams »", as THEME-TEMPLATES reported); after 0 of 215 at 320/360/390/414/768; a planted title with an ordinary space reported in 35/35 runs |
| 6 | **R-18 title-band cut-out (wide navy frame).** Measured on the VISIBLE object (`tmp/integrate/r18-probe.mjs`: two clips of the cut-out area, shown / hidden, diffed in the page; rest pose, shadow filter off, page settled by a scroll-through, videos paused), the navy frame (aspect about 2.9, rotated 10 deg) crossed its seam by 37 px at 768 and 33-39 px at 1024-1180, while its rotated element rect (THEME-TEMPLATES' method) gave 42 and 40. Width floors are now 70 px x aspect below 1024 (cut-out and lede notch together) and 72 px x aspect from 1024; at 1024-1179 the cut-out sits 3vw from the edge instead of 7vw, because the wider frame grown by its 40 px parallax range reached the lede's first line at 1024x768 on 4 pages. Only objects wider than about 1.9:1 (tablets) / 2.3:1 (desktop) change size | `src/styles/interior.css` | After, on the final dist: 0 of 16 placements failing (`/products/`, adult exams, sunglasses, glaucoma at 390x844, 768x1024, 1280x585, 1600x662; navy frame 25 / 41 / 43 / 51 px, need 24 / 40); earlier sweeps: with the two floors, 26/30 navy-frame placements on 5 product pages at 768-1280 passed and the other 4 were the 1024x768 text hits; with the 3vw rule added, 24/24 placements on 12 pages (every cut-out kind) at 1024x768 and 1100x800. Controls in every run: the object shifted wholly above its edge reads -88/-89 px (fired), moved onto the H1 reports 1-2 hits (fired), pixel box inside the element rect |

### 4.2 Cross-role items re-measured on the current build (no change needed)

- **R-12 `.carousel__more`** (`tmp/integrate/r12-more.mjs`, runtime buttons): 36 measured on `/reviews/` at 1440x900, 1280x585 and
  390x844, all 14 px, 44 px tall; a planted 13 px button reported in 6/6 runs. THEME-TEMPLATES' fix holds.
- **R-5 dry eye** (`tt-rtests.mjs glass --pairs`): `.opt-card` backdrop range 0.258-0.345 (5 instances x 3 sizes), the
  CTA-band card 0.134-0.151 at 1440x900, 1280x585, 390x844 (gate 0.10); flat-plate control 0.000 reported.
- **R-18 ad-split cut-outs** (adult exams, sunglasses) settled with the visible-pixel probe: crossing 88 / 32 px at
  390x844 (need 24), 138 / 48 px at 768x1024 (need 40), 0 text hits. THEME-CORE's earlier "no crossing, touches text"
  predates THEME-TEMPLATES' fix 9. A first run reported a text hit on the sunglasses split at 768; it came from a reveal
  animation changing pixels between the two clips (the pixel box spilled outside the element rect, which the probe
  flags); with the page settled first the hit is gone.

### 4.3 Final checks (final dist `4441ab0098fa16b7…`, 1,067 files)

| check | command | result |
|---|---|---|
| determinism | `node src/build.mjs`, `node src/build.mjs --out tmp/integrate/distB --report tmp/integrate/build-final-B-report.json`, `node tools/hashdir.mjs dist tmp/integrate/distB --control` | exit 0 both; IDENTICAL `4441ab00…` 1,067 files; control fired; same inputs digest `6579b17d…`; 0 warnings, 0 errors, 0 slot placeholders, 986 variants from cache |
| links | `node tools/link-check.mjs` | 15,426 local refs (+71: the glaucoma photo's srcset and preload), 55 fragments, 0 broken; 6/6 planted controls |
| build-verify | `node tools/build-verify.mjs --control` | 12/12 green: (a) 1,775/1,775, (a2) 1,614/1,614, (a3) 1,329/1,329 on 23 pages, deletion control exact; (g) 290 generated variants all labelled, 290 labelled files in all, 0 verbatim copies (the glaucoma photo's variants are not labelled) |
| overlap | `node tools/overlap-check.mjs --dir dist --fail 8 --json tmp/integrate/overlap-dist.json --control`; `node tmp/integrate/overlap-classify.mjs` (every span, no 25-span cap) | 55/55 files hold a span of 8+ words; control DETECTED. All 335 spans classified: ADOPTED 0; AV-SOURCE 1 (`/services/contact-lens-exams/`, 9 words "how to put them in take them out and", Academy Vision's own sentence, recorded, unchanged); IA-LABELS 334 (menu and footer label runs of 63 / 17 / 8 words on all 55 pages, the `/sitemap/` list 26 / 17 / 10 words and the 404 tiles 14 words: page names of the Eye Trends structure the operator chose, BUILD-CONTRACT 4.1). Classifier controls: an Eye Trends sentence planted in an adopted page reads ADOPTED, one planted in a source model reads AV-SOURCE |
| decontamination | `sr-decontaminate.mjs --project . --strict` | CLEAN: 59 files, 0 blocker / 0 major / 0 minor (rewrote `audit/decontamination.json`, `project.json`). Control: a planted generator meta in a scratch copy is reported as a BLOCKER |
| fabrication | `sr-fabrication.mjs --project .` | FABRICATION: 187 claims, 0 blockers, 6 majors, each read (4.4). `facts/client-facts.json` unchanged: none of the six captures is a value on the live site |

### 4.4 Fabrication findings, one by one

| page | capture | verdict |
|---|---|---|
| `/reviews/` | "the BEST !!!! Don Albanese February 14, 2026 I absolute…" | A verbatim review (declared in `testimonials[]`); the detector's 50-character window runs into the author, date and next review. False positive; the text cannot change |
| `/services/cataract-co-management/` | "certified in Light Adjustable Lens technology, a type of lens implant" | Sourced: Dr. Lesko's bio on the live site says "He is certified in Light Adjustable Lens technology and Orthokeratology." The capture includes the adopted page's own explanation. Already a practice question (C3) |
| `/services/same-day-contacts/` | "the best possible fit An evaluation of your tear film, so" | The phrase is the live site's ("We take measurements to ensure the best possible fit", contact lens exams page); the window crosses into the next element. False positive |
| `/products/sunglasses/` | "certified eclipse viewers" | General safety advice, not a practice credential; not on the live site, so not declarable. Already listed for doctor review (C2, eclipse viewing) |
| `/services/macular-degeneration/` | "best when it starts early" | General clinical wording ("treatment works best when it starts early"), no practice claim; not on the live site. For the doctor (C3, wet AMD referral) |
| `/services/multifocal-contacts/` | "best after a tweak or two, once you've worn them…" | General wording, no practice claim; not on the live site |

**Gate weakness (measured):** a planted "Voted the number one optometry team in Ocean County by 98% of our 5,000+ patients
since 1987." in a scratch copy produced ONE finding (the superlative): the statistic, count and tenure passed, because a
number counts as traced when its digits occur anywhere in the corpus's digit string. Independent check
(`node tmp/integrate/numbers-check.mjs`): 177 numbers (17 distinct) in the 23 adopted pages' visible fields, 169 found as
whole numbers in the live site's visible text, 8 not: "911" (6x), "65" ("adults 65 and older", `/eye-health/`, already
in C2 for the doctor) and "400" ("UV400", 2x); none states a practice statistic; a planted "98%" / "5,000+" is reported.

### 4.5 Found, not changed

- **320 px**: every page measured (8 here, both before and after this stage) is 347 px wide at a 320 px viewport
  (`tt-rtests.mjs overflow`). 320 is outside R-31's widths (360 and up), where 0 overflow was measured (360, 390, 768,
  1280: 8/8 each). Not fixed; likely the phone header row (UNVERIFIED).
- **`/products/` at 768x1024**: the half title band's glass panel covers part of the model's face (capture
  `tmp/integrate/shots/m-products-768.768x1024.png`). DESIGN-SPEC 13.4 asks for no face under the panel; THEME-TEMPLATES
  checked faces at 1265, 1440, 1585 and 390 only. Other tablet widths UNVERIFIED.
- The navy frame's phone crossing is 25 px against the 24 px minimum (passes, 1 px margin).
- `assets/generated/raw/*.source.mp4` keep no IPTC comment (left as delivered, see 4.1 row 3).

### 4.6 Open and UNVERIFIED

- Only headless Chrome; Safari and Firefox UNVERIFIED (as before).
- The visible-pixel R-18 probe ran on 17 of the 34 pages with a title-band cut-out (all five navy-frame pages, every
  cut-out kind) and on the two ad-split pages; the other pages share the CSS but were not measured at every size.
- The 404 accent restoration follows DESIGN-SPEC 10.1; THEME-TEMPLATES' reason for removing it was not recorded, so if
  one existed it is lost here.
