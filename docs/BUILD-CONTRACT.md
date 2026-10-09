# BUILD CONTRACT — Academy Vision redesign (orchestrator, 2026-10-08)

Every WF3 build agent reads this first. It fixes who owns which file, the interface between the data pipeline and
the theme, and the decisions already taken. When this file and another doc disagree, this file wins; report the
conflict in your structured output.

## 1. Inputs (frozen unless named as yours)

| input | what it is | who may change it |
|---|---|---|
| `audit/raw/*.html`, `audit/*.json` | the crawl (evidence) | nobody |
| `src/content/pages/*.json`, `src/content/source-chrome.json` | lossless page and chrome models (`docs/PORT-NOTES.md` §5-6) | regenerate only with `node src/lib/extract.mjs`; never hand-edit |
| `src/content/restructure.json` | moves, keeps, adopted pages, nav, footer, redirects (`docs/SITE-ARCHITECTURE.md`) | orchestrator only (decisions in §4 below override its `hold` flags) |
| `facts/client-facts.json`, `facts/service-evidence.json` | every fact the live site states, with quotes | nobody |
| `src/content/image-masters.json`, `src/content/image-plan.json` | 139 image masters; 34 planned generations + 2 motion loops | IMAGERY may add result fields to the plan |
| `docs/BRAND-SYSTEM.md`, `docs/DESIGN-SPEC.md`, `tmp/panel/winner/` | brand guardrails, the chosen design, its reference prototype | nobody (read) |

## 2. Ownership (one writer per file)

| owner | files |
|---|---|
| PIPELINE | `src/build.mjs`, `src/lib/*.mjs` except `extract.mjs`, `src/theme-stub/**`, `tools/link-check.mjs`, `tools/build-verify.mjs`, `dist/**` (generated only), `assets/optimized/**` (image cache) |
| THEME (core) | `src/theme/index.mjs`, `src/theme/chrome.mjs`, `src/theme/home.mjs`, `src/theme/parts.mjs`, `src/styles/{tokens,base,glass,depth,motion,chrome,home}.css`, `src/scripts/site.js`, `assets/brand/logo-reversed.png` |
| THEME (templates) | `src/theme/templates.mjs`, `src/theme/blocks.mjs`, `src/styles/{interior,blocks,forms,special}.css`, `src/scripts/features.js` |
| WRITERS | `src/content/adopted/*.json` |
| IMAGERY | `assets/generated/**`, `audit/generated-images.json` |
| INTEGRATOR (later) | may edit any of the above to make the whole build pass, recording each cross-owner edit |

Scratch work goes under `tmp/<your-role>/`. No git commits, no publishing, no network except what your role names.

## 3. Interfaces

### 3.1 Build
`node src/build.mjs` (from the workspace root) writes `dist/` and exits 0. Two consecutive builds are byte-identical
(no timestamps, no random ids; the build date is a constant in `src/lib/site.mjs`). The build fails (exit 1) on: a
missing adopted page JSON (unless `--allow-missing-adopted`), a dead internal link or asset, an unknown node type, a
duplicate output path, a moved path still present as a page, or a page without exactly one `<h1>`.

### 3.2 Theme module (`src/theme/index.mjs`)
```js
export const styles = ['tokens.css', 'base.css', /* ... */];  // src/styles files, concatenated in this order
export const scripts = ['site.js', 'features.js'];             // src/scripts files, concatenated in this order
export function renderPage(page, ctx) { /* -> complete HTML document string */ }
export function render404(ctx) { /* -> complete HTML document string */ }
```
Until `src/theme/index.mjs` exists the pipeline renders with `src/theme-stub/index.mjs` (plain semantic HTML, same
signature), so both tracks can work at once.

`page` (built by the pipeline):
```js
{
  kind: 'home'|'service'|'service-hub'|'product'|'product-hub'|'about'|'doctors'|'bio'|'location'|'reviews'
        |'insurance'|'form'|'legal'|'sitemap'|'article'|'eye-health'|'adopted',
  path: '/services/dry-eye-treatment/',            // NEW path, leading and trailing slash ('/' = home)
  sourcePath: '/eye-care-services/dry-eye-treatment/' | null,   // null for adopted pages
  slug: 'eye-care-services-dry-eye-treatment' | 'adopted/services__glaucoma-management',
  title, metaDescription, canonical,               // canonical = https://www.academyvisionnj.com + NEW path (self)
  og: { ... }, jsonLd: [ ... ],                    // URLs remapped; BreadcrumbList added
  h1,
  breadcrumbs: [{ label, href }],                  // Home » Section » Page
  section: 'home'|'about'|'services'|'eyewear'|'insurance'|'reviews'|'visit'|'legal',
  model,      // src/content/pages/<slug>.json with EVERY internal href already remapped to the new path; null for adopted
  adopted,    // src/content/adopted/<file>.json; null otherwise
  related: [{ label, href, excerpt?, image? }],    // siblings from the nav group
  generated: { hero?: 'hero-<slug>' }              // image-plan slot ids that apply to this page
}
```

`ctx` (built once by the pipeline):
```js
{
  site: { name: 'Academy Vision', origin: 'https://www.academyvisionnj.com',
          phone: { display: '(732) 978-9306', href: 'tel:+17329789306' },
          address: { street: '90 Atlantic City Blvd', locality: 'Pine Beach', region: 'NJ', postalCode: '08741', text },
          hours: [{ label, text }], mapQuery, mapEmbedSrc /* keyless, by name + address */, mapsUrl,
          booking: { label: 'Book Appointment', href: 'https://scheduleyourexam.com/v3/index.php/3197', newTab: true },
          requestForm: '/appointment-request-form/', badges: [...], legalLinks: [...], copyright: '© 2026' },
  nav, footer, topbar, headerButtons, ctas,        // from restructure.json, holds removed (§4.1)
  url(path) -> new path,                           // remap any source or new path
  img(ref, { alt, sizes, cls, loading, fetchpriority, decoding, widths }) -> '<img ...>' with a webp srcset,
                                                   // width/height attributes; ref = a local file path
                                                   // (assets/source/..., assets/generated/..., assets/brand/...)
                                                   // or an image-plan slot id ('hero-glaucoma-management', 'cut-...')
  imgSrc(ref, width) -> URL of one variant (for CSS backgrounds and preloads),
  asset(name) -> fingerprinted URL (site.css, site.js, fonts, logo files),
  facts, buildDate, pagesByPath, imageMasters, generatedSlots
}
```
Image variants: WebP via `cwebp` (installed), widths from 320 to 2400 limited to the source width, cached in
`assets/optimized/`. Generated images that do not exist yet render as a styled empty frame with the slot id in a
`data-slot` attribute (never a broken `<img>`), so the theme can lay out before IMAGERY finishes.

### 3.3 Adopted page JSON (`src/content/adopted/<path with / replaced by __>.json`)
```json
{
  "schema": "academyvision/adopted@1",
  "path": "services/glaucoma-management",
  "etSource": "services/glaucoma-management",
  "title": "…", "metaDescription": "…", "h1": "…",
  "kicker": "optional short eyebrow",
  "lede": "<p>…</p>",
  "sections": [ { "id": "slug", "heading": "…", "html": "<p>…</p>", "layout": "text|split|callout|list|faq", "imageSlot": null } ],
  "faq": [ { "q": "…", "a": "<p>…</p>" } ],
  "cta": { "heading": "…", "html": "<p>…</p>" },
  "related": ["services/medical-eye-care"],
  "claims": [ { "text": "exact sentence in this file that states an Academy Vision fact", "factId": "…", "page": "…", "quote": "…" } ],
  "flags": [ "…" ],
  "review": { "overlapLongest": 0, "checkedBy": "…", "notes": "…" }
}
```
Allowed tags in html strings: `p, h3, ul, ol, li, strong, em, a[href]` (internal hrefs must be NEW paths that exist).
Buttons are not written in the JSON: the theme renders Academy Vision's own CTA labels from `ctx`.

## 4. Decisions already taken (orchestrator)

1. **Full Eye Trends structure.** The operator asked for Eye Trends' structure, so all 23 adopted pages are built and
   linked from the menus and footer. The `hold` flags in `restructure.json` are NOT applied. The 8 pages with partial or
   no evidence (children's contacts, pink eye, foreign body, flashes & floaters, same-day contacts, gas permeable,
   sunglasses, terms) are listed in `docs/OPEN-DECISIONS.md` for the practice. Their copy explains the topic and invites a
   call; it makes no operational promise (no "same day", "walk-in", "in stock", "guaranteed", durations or prices).
2. **Adopted copy is new writing.** It follows the page's purpose outline in `restructure.json` and Academy Vision's voice
   (`docs/BRAND-SYSTEM.md` §6). Writers never open the Eye Trends pages, and `tools/overlap-check.mjs` must show no shared
   span of 8 or more words with the Eye Trends crawl. Practice facts come only from `facts/client-facts.json`.
3. **Phone.** Visible text and JSON-LD use (732) 978-9306, the number printed on all 31 pages. The source's second number
   (732) 736-1700 (header call icon, older JSON-LD, roadside sign) is an open practice decision (C1).
4. **Booking.** "Book Appointment" goes to the source's scheduler (`scheduleyourexam.com`, new tab), as on the live site;
   the on-site appointment request form stays at `/appointment-request-form/`.
5. **Forms are unwired.** Fields, labels, conditional rules and validation copy render faithfully. The forms post
   nowhere (`data-sr-unwired="1"`), and submission is stopped in JS. The registration form holds sensitive fields
   (SSN digits, medical history), so the backend must be HIPAA-appropriate (open decision).
6. **Canonicals** are self-referencing at the new path on the live origin (the source pointed the bios and the
   location page at other pages). The article page's h1 is its BlogPosting headline.
7. **Removed, with reasons** (recorded in the change ledger): platform runtime (GTM, Clarity, CallRail, reCAPTCHA,
   PatientEngage scripts), the "Powered by EyeCarePro" footer credit, and the comic-book illustration
   `practice-35053-c2274987` (it shows a well-known copyrighted superhero character; rights unverified). The
   disclaimer's own text is kept verbatim, its EyeCarePro clauses included (flagged for the practice).
8. **Maps**: a keyless Google Maps embed queried by "Academy Vision, 90 Atlantic City Blvd, Pine Beach, NJ 08741"
   (never by place_id), lazy-loaded.
9. **Reviews**: the 20 verbatim reviews with author and date from the source JSON-LD; no platform is named (unknown).
10. **Real people**: the three doctors' headshots are 223-300 px. Show them no larger than they support (about 150 CSS px
    wide), with no AI upscaling or editing; generated imagery never shows a person standing in for Academy Vision
    staff or patients.
11. **Logo**: `assets/brand/logo-master.png` (457x98, transparent) unaltered on light grounds, shown at no more than 228
    CSS px wide. On dark grounds, a derived single-colour knockout (`assets/brand/logo-reversed.png`), flagged for the
    practice's approval. JSON-LD uses the current logo, not the legacy red mark.
12. **Images**: the local 2000 px variants cover the operator's screens (1280x585 at DPR 1.5, 1600x662 at DPR 1.2). The
    CDN originals are not downloaded.
13. **No runtime dependencies**: Node builtins at build time; vanilla JS and CSS in the browser; fonts and images
    self-hosted; the only third-party requests a page may make are the lazy map embed and the external scheduler link.
