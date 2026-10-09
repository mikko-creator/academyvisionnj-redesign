# DESIGN SPEC: Academy Vision redesign ("Bayside Daylight Glass", with grafts)

Design lead, 2026-10-08. This is the build spec for the THEME roles (BUILD-CONTRACT §2: `src/theme/**`, `src/styles/**`,
`src/scripts/**`). It covers every page kind the pipeline produces (54 pages + 404). A builder must be able to implement
it from this file, the page/ctx data (BUILD-CONTRACT §3, BUILD-NOTES §1.2) and the assets, without opening the prototype.
The prototype copy in `tmp/panel/winner/` is the reference implementation (§17); where it and this file disagree, this
file wins. Where this file and `docs/BUILD-CONTRACT.md` disagree, the contract wins (record the conflict in BUILD-NOTES).

Words: **MUST** = a requirement that is verified (§16); **SHOULD** = the default, deviate only with a recorded reason.
`R-nn` = a numbered build requirement (§15). Values marked *(judge-measured)* come from the three judges' reports and
were not re-measured by the design lead. Everything else in this file was read from the files named next to it.

---

## 0. Decision record

### 0.1 Winner and vote

| judge | weighting (theirs) | a-bayside | b-navy | c-iris | vote |
|---|---|---|---|---|---|
| brand | 30 % brand | **8.00** | 7.85 | 7.93 | a-bayside |
| ux | 35 % ux | 8.10 | 7.10 | **8.40** | c-iris |
| craft | 25 % glass, 25 % depth | **8.10** | 8.05 | 8.00 | a-bayside |
| mean total | | 8.07 | 7.67 | 8.11 | |

**Winner: `a-bayside` ("Bayside Daylight Glass"), by majority, 2 votes to 1.** The task rule is the majority of judges, so
no tie-break was needed. c-iris has the highest mean total (8.11 vs 8.07); its two strongest ideas (the eye window and the
modal phone drawer) are grafted in, and the UX judge's c-iris findings are turned into general requirements (§15).

Why a-bayside carries the build: it is the direction the owners would recognise first (live hero photo, eyebrow, H1 and
section order on a cream and white daylight canvas, untouched logo on a light header), it has the cleanest glass
(frost on `.bar::before`, real Libre Baskerville Italic, 0 synthesised faces) and the best pure UX of the three
(complete keyboard model, six-card services grid, compact mega menu). Its measured weaknesses are all fixable inside its
own system: missing real-place layer, missing reviews, navy underweighted, small logo, glass that turns into white cards
in the lower half, protrusions that cross soft dissolves, and menu/drawer state bugs. §15 makes each one a requirement.

### 0.2 Grafts adopted (detail in §14)

| id | from | idea | where it goes |
|---|---|---|---|
| G1 | b-navy | Real-place layer: the practice's mural photo and night eye-sculpture photo as tilted postcards rising out of the navy footer beside "Local Eye Doctors in Pine Beach, New Jersey" | home Visit section (§12, H13) |
| G2 | b-navy | Smoked navy-glass "Located at Pine Beach" card straddling the hero seam | home hero (H1) |
| G3 | c-iris | The logo-derived **eye window** (almond photo mask, upper-lid arc, light-blue swoosh crescent, frosted iris disc) + iris-bullet eyebrows | home Services (H3); eyebrows site-wide |
| G4 | b-navy | One smoked navy-glass band over full-bleed photography (navy back as a surface) | home kids statement band (H5) |
| G5 | b-navy + craft | Hard seams that foreground pieces straddle; a card row straddling a light-to-navy edge with photos popping out of the card tops | home services cards (H3), doctors (H9), every protrusion (§6.4) |
| G6 | c-iris | Designed-type body copy: a key paragraph set large in Libre Baskerville with one marked phrase | "Statement" component (§10.9), team intro, interior intros |
| G7 | b-navy | "Book Appointment" pill in the phone header, with a rule below 380 px | header (§9.6) |
| G8 | c-iris | True modal phone drawer (focus moved in, trap, scrim, scroll lock, Esc returns focus) | drawer (§9.5) |
| G9 | a-bayside (kept) | Six-card services grid on the home, compact mega layout, `prefers-reduced-transparency` solids, `forced-colors` outlines | kept and extended |

Declined: b-navy's dark canvas and inverted palette (brand judge: 51 % navy vs 18.5 % live), b-navy's red-to-blue
gradient underline (off-palette), b-navy's insurance marquee (auto-moving, no pause), c-iris's focus lens with 1.09x
magnification seam, orbit rings, floating spheres and 172 px circle photos (judges: gimmicky, "tech optics", small
framed photos), c-iris's sticky heading.

---

## 1. Concept

**Bayside Daylight Glass.** Early-morning cream that brightens into pale bay sky. The canvas is the brand cream
`#f9f4f0` with slow pools of the logo's light blue and a white sun-pool; every block of copy sits on frosted white
"sea-glass"; navy returns as a real surface in a few deliberate bands (the smoked kids band, the doctors band, the
footer) instead of a dark site. Photography is large (full-bleed or half-bleed) and is shaped by the brand mark itself:
lens edges, an arch window, a circular lens and, once on the home page, the **eye window** drawn from the logo's
upper lid and lower swoosh. Eyewear cut-outs float in front of everything and cross hard section seams. The practice's
own building, murals and eye sculpture are the "proof of place" layer. Warmth comes from Academy Vision's own words,
which are never edited.

Principles (each is testable somewhere in §16):
1. The logo is never altered, never blurred, never placed on navy in its own inks.
2. Glass is the only container language: no flat opaque cards anywhere, and every glass panel has something to frost.
3. At least four depth planes: ambient light, photo, glass, foreground; protrusions cross hard edges, never fades.
4. Display type carries the expression (serif, one italic accent, a drawn swoosh or a highlighter mark); body text stays
   quiet, large and legible.
5. Motion reveals and responds to scroll; nothing moves on its own for more than 5 seconds; nothing is ever left hidden.
6. Every visible word comes from the data (page model, adopted JSON, ctx); the theme writes no copy (§2.4).

---

## 2. Inputs, ownership and hard rules for the theme

### 2.1 Files the theme writes (BUILD-CONTRACT §2)
THEME core: `src/theme/{index,chrome,home,parts}.mjs`, `src/styles/{tokens,base,glass,depth,motion,chrome,home}.css`,
`src/scripts/site.js`, `assets/brand/logo-reversed.png` (not needed by this spec, see §9.7).
THEME templates: `src/theme/{templates,blocks}.mjs`, `src/styles/{interior,blocks,forms,special}.css`,
`src/scripts/features.js`.
Added by THEME core with a BUILD-NOTES entry: `assets/fonts/libre-baskerville-italic-400-latin.woff2`, copied from
`tmp/panel/winner/fonts/` (§3.3). The build fingerprints any font file in `assets/fonts/` and rewrites CSS `url()`s that
name it by base name (`src/build.mjs` lines 93-124), so no pipeline change is needed.

### 2.2 Data the theme reads
- `page` and `ctx` exactly as BUILD-CONTRACT §3.2 and BUILD-NOTES §1.2 describe (`page.model` blocks and nodes with
  remapped hrefs, `page.adopted`, `page.breadcrumbs`, `page.related`, `page.generated.hero`, `ctx.nav`, `ctx.footer`,
  `ctx.topbar`, `ctx.headerButtons`, `ctx.ctas`, `ctx.chrome`, `ctx.site`, `ctx.pagesByPath`, `ctx.img`, `ctx.imgSrc`,
  `ctx.asset`, `ctx.seoHead`). ctx and page objects are frozen: copy before sorting.
- Image refs only through `ctx.img` / `ctx.imgSrc`: model files (`assets/source/...`), image-master ids, image-plan slot
  ids, `assets/generated/...`. **Never** a file from `tmp/panel/**` (R-25).

### 2.3 Build checks the theme must keep green (BUILD-NOTES §1.2, `tools/build-verify.mjs`)
- (a) every model text unit of a page is in that page's `<main>`; alts, aria-labels, placeholders, map titles and rating
  labels may be attributes inside `<main>`; runtime UI strings (`ui.*`, form `messages.*`) may sit in `<main>` markup or
  the shipped JS. Consequence: **every model node is rendered, every model image is rendered with its source alt
  verbatim** (R-22, R-23). Units are a set, so a repeated alt ("Practice Image") is satisfied once.
- (b) exactly one `<h1>` per page. (e) every page links all 54 nav and footer targets, menu grandchildren included.
- (h) print `page.jsonLd` as given (`ctx.seoHead(page)`).

### 2.4 Copy rule (task hard rule 1)
The theme prints only: model text, adopted JSON text, ctx labels (nav and footer labels, `ctx.chrome` UI labels, CTA
labels in `ctx.ctas` / `ctx.headerButtons` / `ctx.topbar`, hours, NAP, copyright), and Academy Vision text quoted from
another page's model (cross-page sections, §12). Declared exceptions: the target-structure menu labels (already in
`ctx.nav`), and the 404 heading (§11.17, open item O10). Aria-labels for pure UI (e.g. the drawer `aria-label`) are not
shown text and may be added. Formatting a non-text field (a review `date`) is presentation, not copy.

---

## 3. Tokens (`src/styles/tokens.css`)

### 3.1 Colour roles

| token | hex | role | contrast (WCAG, computed this run) |
|---|---|---|---|
| `--navy` | `#0f2a4a` | anchor surface (navy bands, footer), display headings, hover/pressed fill of action buttons | 14.48 on white, 13.26 on cream |
| `--navy-deep` | `#082240` | deepest gradient stop; the eye window's lid stroke (= logo symbol ink) | |
| `--navy-2` | `#17395f` | top stop of navy gradients | |
| `--blue` | `#3974a0` | ACTION: primary button fill, outline borders; accent words (large text only) | white on it 5.02; on white 5.02, on cream 4.60 |
| `--blue-ink` | `#2b5d86` | small blue text on light: eyebrows, inline links, menu links, crumbs links | 6.97 on white, 6.38 on cream, 6.10 on mist |
| `--sky` | `#4489bc` | logo blue: swoosh strokes, eye-window crescent, dots, icons, stars. **Graphics only; never text under 24 px on light** | 3.78 on white (graphic 3:1) |
| `--cream` | `#f9f4f0` | page canvas (`html` background) | |
| `--mist` | `#e8f1f8` | pale-sky band tint | |
| `--white` | `#ffffff` | glass base | |
| `--red` | `#650705` | accent only: focus ring, current-page dot, inline-link hover underline | 13.24 on white, 12.12 on cream |
| `--ink` | `#13233a` | body text on light | 15.80 on white, 14.46 on cream |
| `--ink-2` | `#3a4c63` | secondary text on light | 8.77 on white, 8.03 on cream |
| `--ink-inv` | `#f9f4f0` | body text on navy and smoked glass | 13.26 on navy |
| `--ink-inv-2` | `#c9d6e4` | secondary text on navy | 9.81 on navy |
| `--label-inv` | `#9cc3e3` | eyebrows, labels, icons on navy | 7.81 on navy |
| `--link-inv` | `#bfe0f7` | links on navy | 10.49 on navy |
| `--focus-inv` | `#f2b8b5` | focus ring on navy | 8.48 on navy |
| `--error` | `#dc2626` | form error text and invalid border (source value) | 4.83 on white |
| `--required` | `#eb0000` | required asterisk (decorative, `aria-hidden`) | |

Rules: `--blue` on navy fails as a UI edge (2.88); on navy surfaces the primary button is white (`.btn--light`) or blue
with a 1 px `#abcae1` border. `--sky` on navy is 3.83 (graphics ok). Accent gradient on light: `#295d8a -> #3974a0 ->
#275783` (lightest stop `#3974a0` measured p05 3.29 on hero glass, *judge-measured*; large text only). Accent gradient
on navy: `#bfe0f7 -> #8fc3ea -> #d6ebf9`.

Seam band colours (rebuilt from the source divider, §6.5): `--navy`, `--sky`, `--white`.

### 3.2 Type

| role | token | family | size | line-height | weight / case | notes |
|---|---|---|---|---|---|---|
| display (home H1) | `--fs-display` | Libre Baskerville | `clamp(2.3rem, 1.2rem + 3.1vw, 4.4rem)`, capped `4.05rem` in the hero | 1.08, tracking -0.012em | 400, as typed (Title Case) | short-height override §4.3 |
| interior H1 (title band) | `--fs-title`, `--fs-title-long` | Libre Baskerville | `clamp(2.1rem, 1.2rem + 2.6vw, 3.9rem)`; titles over 40 chars `clamp(1.9rem, 1.05rem + 2.1vw, 3.1rem)` | 1.08 | 400 | longest H1 is 65 chars (`/services/childrens-contact-lenses/`) |
| H2 | `--fs-h2` | Libre Baskerville | `clamp(1.85rem, 1.2rem + 2.05vw, 3.2rem)` | 1.14 | 400 | |
| H2 xl (section openers) | `--fs-h2-xl` | Libre Baskerville | `clamp(2.2rem, 1.25rem + 2.9vw, 4.1rem)` | 1.08 | 400 | |
| statement (designed line) | `--fs-statement` | Libre Baskerville | `clamp(2.05rem, 1.15rem + 3.5vw, 4.7rem)` | 1.12 | 400 | the kids line |
| H3 | `--fs-h3` | Libre Baskerville | `clamp(1.4rem, 1.1rem + 1vw, 2.05rem)` | 1.24 | 400 | |
| card / menu group title | `--fs-card` | Libre Baskerville | 1.22rem cards, 1.0625rem menu heads | 1.3 | 400 | |
| designed paragraph | `--fs-designed` | Libre Baskerville | `clamp(1.25rem, 1rem + .9vw, 1.75rem)` | 1.55 | 400 | §10.9 |
| lead | `--fs-lead` | Montserrat | `clamp(1.03rem, .98rem + .25vw, 1.19rem)` | 1.68 | 400 | |
| body | `--fs-body` | Montserrat | 1.0625rem (17 px) desktop, 1rem phone | 1.7 | 400; `strong` 650 | **paragraph text never below 16 px (R-12)** |
| UI (nav, menu links, buttons) | `--fs-ui` | Montserrat | .875rem (14 px) min; buttons .9375rem | 1 to 1.3 | 600 to 650 | |
| meta (crumbs, chip names, dates) | `--fs-meta` | Montserrat | .8125rem (13 px) min | 1.3 to 1.5 | 600 | |
| eyebrow | `--fs-eyebrow` | Montserrat | .8125rem desktop, .75rem (12 px) min | 1.4 | 650, UPPERCASE via CSS, tracking .17em | iris bullet (§10.1) |

- Fonts: Libre Baskerville 400 roman (`assets/fonts/kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4iDgNP.woff2` latin,
  `...Q4iAANPjuM.woff2` latin-ext), **Libre Baskerville Italic 400** (added file, §3.3), Montserrat variable 100-900
  (`JTUSjIg1_i6t8kCHKm459Wlhyw.woff2` latin, `...Wdhyzbi.woff2` latin-ext; declare `font-weight: 100 900`). The
  cyrillic and vietnamese Montserrat files are not declared (BRAND §4.1: latin covers all copy).
- `font-synthesis: none` on every serif element (BRAND §7.3: never synthesise bold or italic). No `font-weight` above
  400 on Libre Baskerville. `font-display: swap`; preload Montserrat latin, Libre Baskerville latin and italic.
- Case: display and section headings are set as typed (the source types Title Case) with one italic accent; eyebrows,
  menu group labels and footer headings are uppercase via CSS. This deliberately departs from BRAND §7.1.3 (all
  headings uppercase); all three judges scored the mixed-case serif at brand 8 to 9 (open item O9).
- `text-wrap: balance` on headings; `hyphens: manual`.

### 3.3 The italic font file
`tmp/panel/winner/fonts/libre-baskerville-italic-400-latin.woff2` (21,564 bytes). Its name table, read this run:
family "Libre Baskerville", subfamily "Italic", "Version 2.005", copyright "2012 The Libre Baskerville Project
Authors", licence URL `https://openfontlicense.org` (SIL OFL). Copy it (do not move) to `assets/fonts/` and declare it
with the latin `unicode-range` used in `tmp/panel/winner/styles.css` lines 15-17. Without it Chrome synthesises an
oblique, which BRAND §7.3 forbids.

### 3.4 Radii, blur, shadows, spacing, z-index, motion

```css
:root {
  /* radii */
  --r-xs: 8px; --r-sm: 14px; --r-md: 22px; --r-lg: 30px; --r-xl: 44px; --r-pill: 999px;
  --r-arch: 50% 50% var(--r-lg) var(--r-lg) / 40% 40% var(--r-lg) var(--r-lg);   /* arch window */
  --r-lens-edge: 34% 50%;                                                       /* inner edge of half-bleed photos */
  --band-arch: 50% 90px;                                                        /* sea-glass band top corners; 50% 40px on phones */
  /* blur + saturate */
  --blur-chip: 12px; --blur-sm: 16px; --blur: 18px; --blur-bar: 20px; --blur-lg: 26px; --blur-menu: 28px;
  --sat: 165%; --sat-hero: 170%; --sat-menu: 175%; --sat-dark: 160%;
  /* edges */
  --glass-line: rgba(255,255,255,.78);
  --inner: inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(255,255,255,.22);
  --inner-dark: inset 0 1px 0 rgba(255,255,255,.16);
  --line-dark: rgba(196,222,242,.20);
  /* shadows: navy-tinted, layered (contact + key + ambient) */
  --sh-1: 0 1px 2px rgba(15,42,74,.06), 0 6px 16px -6px rgba(15,42,74,.14);
  --sh-2: 0 2px 4px rgba(15,42,74,.05), 0 22px 44px -18px rgba(15,42,74,.30);
  --sh-3: 0 4px 10px rgba(15,42,74,.06), 0 44px 80px -28px rgba(15,42,74,.40);
  --sh-dark: 0 2px 8px rgba(2,9,20,.30), 0 22px 44px -18px rgba(2,9,20,.62), 0 48px 90px -40px rgba(2,9,20,.70);
  --sh-cut: drop-shadow(0 26px 22px rgba(15,42,74,.22)) drop-shadow(0 6px 6px rgba(15,42,74,.12));
  /* space */
  --gutter: clamp(16px, 4vw, 48px);
  --max: 1240px;          /* content container */
  --max-wide: 1320px;     /* header bar and mega menu */
  --section: clamp(72px, 9vw, 136px);
  --seam-h: 8px;          /* 6px below 768 */
  --bar-h: 64px;          /* 60px below 768 */
  --header-top: 10px;     /* 8px below 768 */
  --header-h: calc(var(--header-top) + var(--bar-h));
  /* depth ladder */
  --z-photo: 0; --z-wash: 1; --z-glass: 2; --z-lift: 3; --z-cutout: 4;
  --z-header: 50; --z-menu: 60; --z-scrim: 70; --z-drawer: 71; --z-lightbox: 80; --z-skip: 100;
  /* motion */
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-io: cubic-bezier(.65, 0, .35, 1);
  --dur-xs: .2s; --dur-s: .3s; --dur-m: .5s; --dur-l: .9s; --dur-xl: 1.3s;
}
```

The `body` background is transparent over `html { background: var(--cream) }` so the fixed ambient layer (§6.1) shows.

---

## 4. Grid, breakpoints and viewports

### 4.1 Layout primitives
- `.container { width: min(100% - 2 * var(--gutter), var(--max)); margin-inline: auto }`. Header bar and mega menu use
  `--max-wide`. Inside containers a 12-column grid (`gap: clamp(16px, 2.6vw, 36px)`) is used for splits and statements.
- Section padding `--section` (top and bottom), reduced to `calc(var(--section) * .55)` between closely related bands.
- Every section: `position: relative; overflow-x: clip` (clips x only, leaves vertical protrusions visible; does not
  create a scroll container, so the sticky header keeps working). **Sections are never stacking contexts**: no
  `transform`, `filter`, `opacity < 1`, `isolation`, `z-index` on `.section` itself, so a cut-out (z 4) in one section
  paints over the next section's photo (z 0) and glass (z 2).
- `html { scroll-padding-top: calc(var(--header-h) + 16px) }` (R-13).

### 4.2 Breakpoints (media queries are evaluated against `innerWidth`, which includes the scrollbar)

| name | range | changes |
|---|---|---|
| xs | < 380 | logo 140 px, compact Book pill (§9.6) |
| sm | 380-767 | phone layout: single column, photos on top with glass overlapping, compact cards, drawer |
| md | 768-1023 | 2-column grids, drawer, splits stacked below 900 |
| lg | 1024-1239 | 3-column grids, splits side by side (from 900), drawer still on |
| xl | 1240-1439 | **desktop bar with full nav**; phone number icon-only in the bar |
| xxl | >= 1440 | phone number visible in the bar |
| short | `(min-width: 1024px) and (max-height: 700px)` | smaller display/H1 sizes, tighter hero/title padding (§4.3) |

The desktop nav threshold moves from the prototype's 1180 to **1240** because the bar now carries four disclosure
items, a 200-208 px logo and the phone cluster. The builder MUST measure the bar at 1240 (1225 px layout), 1265
(1280 window with scrollbar), 1366, 1440 and 1585: one line, no overlap, no label wrap. If it fits lower, the threshold
may go down; it may never go above 1265 (the operator's 1280 window must show the full nav).

### 4.3 Review viewports and first-screen rules
Operator windows: **1280x585** and **1600x662** with a real 15 px scrollbar (layout 1265 / 1585), plus 1440x900 and a
390x844 phone (mobile emulation). At every page that has a title-band CTA:
- the H1 and the primary CTA (Book Appointment) are fully inside the first screen and below the header bar
  (home measured H1 153-268, CTA 438-490 at 1280x585 in the prototype, *judge-measured*);
- nothing hides under the sticky header (anchors land below it; no sticky element under it);
- no horizontal overflow at 360, 390, 768, 1024, 1180, 1240, 1280 (1265), 1366, 1440, 1600 (1585), 1920 (R-31).
Short-height rule (`short` query): `--fs-display: clamp(2.3rem, 1rem + 2.9vw, 3.5rem)`; interior H1
`clamp(1.9rem, 1rem + 2.2vw, 2.9rem)`; hero/title-band padding-top `calc(var(--header-h) + 16px)`; hero lead 1rem/1.62.

---

## 5. Glass system (`src/styles/glass.css`)

### 5.1 Recipe (all light variants)
```css
.glass {
  position: relative; z-index: var(--z-glass);
  background: linear-gradient(135deg, var(--ga), var(--gb));
  -webkit-backdrop-filter: blur(var(--gblur, var(--blur))) saturate(var(--gsat, var(--sat)));
          backdrop-filter: blur(var(--gblur, var(--blur))) saturate(var(--gsat, var(--sat)));
  border: 1px solid var(--glass-line);
  border-radius: var(--r-lg);
  box-shadow: var(--inner), var(--sh-2);
}
.glass::after {           /* specular sheen along the top-left edge, under the content */
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(155deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 32%);
}
```

### 5.2 Variants

| class | `--ga` -> `--gb` | blur / sat | use | text allowed |
|---|---|---|---|---|
| `.glass` | white .74 -> .50 | 18 / 165 % | over the cream canvas, light pools, light textures, sea-glass bands | ink, ink-2, navy, blue-ink |
| `.glass--strong` | white .86 -> .78 | 18 / 165 % | text over photographs or over navy (cards straddling a navy edge) | all light-text tokens |
| `.glass--hero` | white .80 -> .60 | 26 / 170 % | home hero panel, title-band panels | ink, navy; inline links use `--navy` + `--blue` underline (R-19) |
| `.glass--tint` | `rgba(240,247,252,.82)` -> white .55 | 18 / 165 % | insurance panel, list bands | as `.glass` |
| `.glass--veil` | white .92 -> .88 | 18 / 165 % | long reading text (legal, forms, bio body), text over video | all |
| `.glass--navy` (smoked) | sheen `linear-gradient(140deg, rgba(255,255,255,.11), rgba(255,255,255,.025) 42%, rgba(140,192,230,.06))` over `rgba(9,27,50,.84)` | 18 / 160 % | location card, kids statement panel, text over photos on navy | ink-inv; ink-inv-2 and label-inv only at alpha >= .80 |
| `.glass--navy-soft` | white .10 -> .03 | 16 / 140 % | cards on a solid navy surface (CTA band card) | ink-inv, link-inv |
| chips | white .78 solid + border .95 + `--inner`, `--sh-1` (blur 12 only where a photo is behind) | | insurance, frames, symptom chips | ink-2, ink |

Dark variants: border `1px solid var(--line-dark)`, `box-shadow: var(--inner-dark), var(--sh-dark)`, and a light-catching
gradient ring on `::before` (b-navy `styles.css` lines 248-253: `inset:-1px; padding:1px;` gradient
`155deg, rgba(255,255,255,.5) -> transparent 38% -> transparent 62% -> rgba(140,192,230,.38)`, masked with
`mask-composite: exclude`).

Analytic floors behind these alphas (computed this run, worst underlay, no blur): on white glass over **navy**, ink needs
alpha >= .50 (5.17), ink-2 >= .74 (5.20), blue-ink >= .80 (4.68); on smoked glass over a **white** photo pixel, cream
needs >= .72 (6.34), ink-inv-2 >= .72 (4.69), label-inv >= .80 (4.96). Hence `.glass--strong` bottom stop .78 and the
smoked .84.

### 5.3 Contrast rule (R-19)
Every text run on glass, links included, is measured on painted pixels: text made transparent, the line boxes
screenshotted with blur active and reveals/parallax settled, each backdrop pixel composited with the text colour.
Pass: **p05 >= 4.5:1** (>= 3:1 for text >= 24 px or >= 18.66 px bold) **and worst pixel >= 4.0:1**, per text colour per
block, at 1280x585, 1440x900 and 390x844. This replaces BRAND §7.3's analytic "veil alpha >= .88 over photography"
with a measured gate (open item O9); the prototype passed 16 pairs at p05 *(designer-measured)*, but the craft judge
found the hero inline link at worst 4.69 / p05 5.32 when links were included *(judge-measured)*.

### 5.4 Glass must read as glass (R-5)
Behind every text-bearing glass panel there MUST be visible structure: with the panel hidden (`visibility:hidden`), the
luminance range p95 - p05 of the backdrop pixels inside the panel's box is **>= 0.10**, or the panel straddles a seam
(§6.4). The prototype's doctor, insurance and blog glass sat on 0.88-0.99 uniform cream *(judge-measured)* and read as
white cards. Allowed structure: a photo, a generated texture (`tex-cream-light`, `tex-navy-glass`, `tex-blue-caustics`),
a motion-loop poster, a navy/cream edge, the eye window, a light pool placed behind the panel on purpose.

### 5.5 Header and menu glass
- Header frost lives on `.bar::before` (never on the bar element: a `backdrop-filter` on the bar makes it the backdrop
  root and blinds the dropdowns' own blur). At rest: white .80 -> .60, blur 20, sat 170 %. Scrolled (`.is-scrolled`):
  **.92 -> .86** (raised from the prototype's .88/.72 so the bar stays crisp over navy bands: navy text 11.0:1 over navy).
- Mega menu, dropdowns: white **.92 -> .86**, blur 28, sat 175 %, border `rgba(255,255,255,.9)`, `--inner`, `--sh-3`.
  Raised from the prototype's .84/.66 because menus can open over a navy band (blue-ink on .66 over navy is 3.43:1;
  on .86 it is 5.31:1).
- Phone drawer panel: white .94 -> .88, blur 28, sat 175 %.

### 5.6 Fallbacks
```css
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .glass, .glass--strong, .glass--hero, .glass--tint, .glass--veil { background: rgba(255,255,255,.95); }
  .bar::before, .mega__panel, .drop__panel, .m-nav__panel { background: rgba(255,255,255,.97); }
  .glass--navy { background: rgba(10,29,54,.94); }
  .glass--navy-soft { background: rgba(15,42,74,.92); }
}
@media (prefers-reduced-transparency: reduce) {  /* solids, no blur */
  .glass, .glass--strong, .glass--hero, .glass--tint, .glass--veil { background: rgba(255,255,255,.97); backdrop-filter: none; }
  .bar::before, .mega__panel, .drop__panel, .m-nav__panel { background: #fff; backdrop-filter: none; }
  .glass--navy, .glass--navy-soft { background: #0c2341; backdrop-filter: none; }
}
@media (forced-colors: active) {
  .glass, .glass--navy, .bar::before, .mega__panel, .drop__panel, .m-nav__panel { border: 1px solid CanvasText; }
  .acc { color: CanvasText; background: none; }
  .swoosh, .ambient, .cutout, .seam-band, .eyewin__art, .loop { display: none; }
}
```

### 5.7 Performance budget
- At most **14 backdrop-filtered elements intersecting the viewport** at any scroll position (sample every 300 px at
  1440x900 and 390x844). The prototype had 25 on the home page in total *(designer-measured)*.
- Blur radius <= 28 px; below 768 px multiply blur radii by .75.
- Never nest a backdrop-filtered element inside another element that is a backdrop root (`backdrop-filter`, `filter`,
  `opacity < 1`, `mask`, `clip-path`, `mix-blend-mode`) unless the inner blur is meant to see only its parent's content
  (the eye-window iris disc). Consequence: the `mask` reveal (§7.1) is used only on photo containers.
- `will-change` only on the ambient pools.

---

## 6. Depth system (`src/styles/depth.css`)

### 6.1 Planes

| plane | content | z | parallax (`data-depth`, max px) |
|---|---|---|---|
| 1 ambient | fixed `.ambient` layer: pools (sky x2 at alpha .18-.24, white sun-pool .8, navy depth .10) + navy edge vignette; section band backgrounds (sea-glass bands, navy bands, textures) | -1 (fixed layer), bands 0 | pools: scroll-linked (§7.4); bands scroll with the page |
| 2 photo | full/half-bleed photos, eye-window photo, textures, loop videos | 0 (`--z-photo`) | +0.04 to +0.07, max 20-40 px (slower than the page) |
| 3 glass | panels, cards, chips, menus, lens/arch frames, postcards | 2 (`--z-glass`), 3 (`--z-lift`) when riding over the next band | none (reveal only) |
| 4 foreground | eyewear cut-outs, portraits breaking out, iris disc | 4 (`--z-cutout`); header 50, menus 60 | -0.12 to -0.16, max 40-48 px (faster than the page) |

Pool recipe: `tmp/panel/winner/styles.css` lines 192-205 (`.pool--a` ... `.pool--d`, `.ambient::after` vignette), minus
the infinite `drift-*` keyframes (§7.4).

### 6.2 Parallax
- `offset = -((elementCentre - scrollY) - innerHeight / 2) * depth`, clamped to `data-depth-max`; geometry from
  `offsetTop` chains (transform-free), re-measured on resize, load and `document.fonts.ready`; applied with the
  `translate` property (so it composes with reveal transforms). Reference: `tmp/panel/winner/site.js` lines 131-166.
- Range halved below 768 px. Off when `innerHeight > 1600` (full-page captures) and under reduced motion.
- Total travel per element <= 96 px (craft judge measured the prototype at <= 96 px and called it restrained; c-iris at
  244 px was not).

### 6.3 Containment
- Sizes and offsets of anything that protrudes use `clamp()`/`vw` so it stays inside `0 ... clientWidth` horizontally at
  every viewport (R-31). The overlap probe (§16) checks `insideX` for every cut-out and protruding card.
- Cut-out images are 2048x2048 canvases with the object in the middle (alpha bounding boxes measured this run below).
  Lay them out by their **object box**, not the canvas: either IMAGERY delivers trimmed copies (alpha bbox + 4 %
  padding) or the theme wraps each cut-out in a box with the object's aspect ratio and positions the image with the
  inset values below. Overlap probes use the object box.

| slot | object box (x, y, w x h in the 2048 canvas) | aspect |
|---|---|---|
| `cut-eyeglasses-tortoise` | 269, 731, 1555 x 583 | 2.67 |
| `cut-eyeglasses-navy` | 291, 692, 1529 x 526 | 2.91 |
| `cut-sunglasses-navy` | 369, 765, 1369 x 567 | 2.41 |
| `cut-sunglasses-aviator` | 246, 725, 1592 x 655 | 2.43 |
| `cut-reading-glasses` | 340, 860, 1407 x 494 | 2.85 |
| `cut-contact-lens` | 633, 616, 795 x 820 | 0.97 |
| `cut-trial-lens` | 601, 483, 854 x 985 | 0.87 |
| `cut-lens-blank` | 505, 470, 1069 x 1186 | 0.90 |

### 6.4 Protrusion patterns and rules
Patterns (each named in the page compositions):
- **P-cut**: a cut-out crossing a hard seam (hero bottom, kids band top, eyewear bottom, title-band bottom).
- **P-straddle**: a glass card straddling two bands (about card into the services band; location card across the hero
  seam; interior lede card across the title-band seam; visit card into the footer).
- **P-row**: a card row straddling a light-to-navy (or navy-to-cream) edge, each card's photo or portrait popping
  48-64 px out of its card top.
- **P-frame**: a photo breaking out of its own glass frame (blog photo taller than its card; eye-window lid and crescent
  drawn outside the almond; postcards rising out of the footer; the circular lens rising across a band's arched top).

Rules (R-18):
1. Every protrusion crosses a **hard edge**: the seam band (§6.5), a navy/cream edge, an arched band edge, a photo
   edge with no dissolve on that side, or (P-frame) the crisp edge of its own frame. Never a mask fade.
2. Crossing depth >= 40 px at desktop sizes and >= 24 px on phones (prototype: hero cut-out 91-103 px, but sunglasses
   only 5 px at 768, *designer-measured*).
3. No protrusion touches running text, a button, an eyebrow or a heading at its rest pose grown by its full parallax
   range and 8 px; probe at 390x844, 768x1024, 1024x768, 1180x820, 1280x585, 1366x768, 1440x900, 1600x662, 1920x1080,
   with a positive control that fires.
4. No cut-out or crescent lands on a face (check every photo it passes over at the nine sizes).
5. Phones get their own placements (smaller widths, moved to free padding), never a scaled desktop placement.

### 6.5 Seams and the seam band (BRAND §7.1.7 kept)
The source's segmented divider (`assets/source/65527996-Blue-Divider_light.jpg-w_1600.webp`, 1600x18, used at 15 px)
returns as an 8 px CSS **seam band** (6 px below 768) at straight hard seams. Segment stops, decoded from the source file
this run (lossy navy `#183351` and blue `#4a8dbf` mapped to the exact palette):
```css
.seam-band { height: var(--seam-h); background: linear-gradient(90deg,
  var(--navy) 0 1.56%, var(--white) 1.56% 8.5%, var(--navy) 8.5% 15%, var(--sky) 15% 26.06%,
  var(--white) 26.06% 28.75%, var(--navy) 28.75% 34.94%, var(--white) 34.94% 44.19%, var(--sky) 44.19% 55.81%,
  var(--navy) 55.81% 63.63%, var(--white) 63.63% 65.44%, var(--sky) 65.44% 76.63%, var(--white) 76.63% 88.5%,
  var(--sky) 88.5% 92.69%, var(--navy) 92.69% 100%); }
```
Placement: every model `section-divider` block renders as the seam band on the straight seam where it sits (the home
model has six: after the hero, after About, after Dry Eye, after the kids band, after Eyewear, before the blog). Where a
divider falls on an arched band edge, the arch's 1 px white highlight replaces it. Interior pages: one seam band under the
title band. `aria-hidden="true"`, full-bleed, z 1. Hard seams without a source divider (navy floor edges) get a 1 px
`rgba(255,255,255,.55)` highlight instead.

---

## 7. Motion system (`src/styles/motion.css`, `src/scripts/site.js`)

### 7.1 Reveals (IntersectionObserver, `threshold: 0`, `rootMargin: 0px`)
- Patterns (`data-reveal`): `up` (30 px), `left` / `right` (40 px), `fade`, `scale` (.94), `mask`
  (`clip-path: inset(10% 6% 10% 0 round 40px) -> inset(0)`, photo containers only).
- Timing: opacity `.9s`, transform `1.1s`, clip-path `1.3s`, all `--ease-out`; grids with `data-stagger` delay
  children `85ms * index` (index capped at 6).
- Gating: JS adds `.js-motion` to `<html>`; only elements whose box is entirely below the first screen at load get the
  hidden state (`.rv`). A second pass releases anything the hidden offset slid into view.
- Release: on intersect add `.is-in`; after the entrance (1300 ms, 2100 ms when a swoosh draws, plus the stagger) remove
  `rv`, `is-in` and `data-reveal` so the element's own hover transforms work.
- Fail-safes (all four required): 1 s interval sweep and a rAF sweep on scroll releasing anything with
  `top < innerHeight`; if the observer has delivered nothing within 3 s while the tab is visible, release everything;
  `beforeprint` releases everything; reduced motion and no-JS never gate.
- Reference: `tmp/panel/winner/site.js` lines 78-129, `styles.css` lines 877-895.

### 7.2 Load-in (first screen)
Hero/title-band panel rises 22 px over 1.2 s (transform only, never opacity); the photo settles from scale 1.07 over
2.6 s; cut-outs float in over 1.5 s (opacity + translate, decorative only); the H1 swoosh draws by keyframe
(`stroke-dashoffset 1 -> 0`, `pathLength="1"`, 1.6 s after .55 s). Section swooshes draw on reveal (1.4 s after .5 s).

### 7.3 Scroll-driven
```css
@supports (animation-timeline: view()) {
  .js-motion :is(.photo-plane, .split__media-inner, .feature__media, .eyewear__arch-inner, .band-photo) img {
    animation: scroll-settle linear both; animation-timeline: view(block 0px); animation-range: entry 0% cover 55%;
  }
  @keyframes scroll-settle { from { transform: scale(1.1) } to { transform: scale(1.01) } }
}
```
The explicit `view(block 0px)` inset keeps `scroll-padding` from shifting it.

### 7.4 No autonomous motion over 5 seconds (R-26, WCAG 2.2.2)
- Ambient pools: no infinite drift. They move only with scroll: `animation-timeline: scroll(root)` inside
  `@supports (animation-timeline: scroll())` (e.g. pool A translates `0 -> 14vw, 18vh` over the whole document),
  static otherwise.
- Cut-outs: float-in once (<= 1.5 s), then parallax only. The prototype's 7 s infinite bob is removed.
- Motion loops (`loop-lens-light`, `loop-navy-glass`): `<video muted playsinline preload="none" poster=...>` with **no**
  `autoplay` and **no** `loop` attributes; `site.js` starts playback when >= 30 % visible and pauses after 5 s or when it
  leaves view; it may replay on the next entry. Reduced motion: never plays (poster only). No JS: poster only.
  `aria-hidden="true"`, no controls (decorative). Files via `ctx.asset('assets/generated/loop-*.webm|mp4')`,
  posters `loop-*-poster.webp`; phone uses `loop-lens-light-phone.mp4` / `loop-*-960.mp4`.
- No marquees, no auto-advancing carousels.

### 7.5 Reduced motion and no-JS
- `prefers-reduced-motion: reduce`: `.js-motion` is never set; parallax off; all `animation-duration` and
  `transition-duration` `.001ms`; swooshes drawn; videos not played; layout identical. (Prototype measured 0 gated,
  0 translated, 0 running animations, *designer- and judge-measured*.)
- No JS: every element visible; desktop menus open on `:hover` / `:focus-within` (`html:not(.js)` only); the phone drawer
  is a `<details>` that opens on tap; carousels render as horizontally scrollable lists; forms keep the submit button
  disabled (pipeline decision, BUILD-NOTES 1.3.3).

---

## 8. Hover and focus system

Every hover effect has the same effect on `:focus-visible` (or `:focus-within` for cards), measured (R-30).

| element | hover / focus-visible | reference |
|---|---|---|
| buttons | lift -2 px; deeper shadow; white sheen sweep `.9s`; arrow nudges 4 px; primary fill -> `--navy`; glass -> white .82; outline -> navy fill, white label | `styles.css` 227-270 |
| focus ring (light) | `outline: 2px solid var(--red); outline-offset: 3px` + `box-shadow: 0 0 0 7px rgba(255,255,255,.92)` halo on buttons | `styles.css` 135, 269 |
| focus ring (navy) | `outline-color: var(--focus-inv)`; halo `rgba(15,42,74,.9)` | `styles.css` 745, 866-871 |
| nav links | gradient underline grows from centre (`.4s`), glass chip lights behind the label, chevron flips; current page: red dot + underline | `styles.css` 313-336 |
| menu links | slide 3 px, arrow fades in; group head lights up as glass | `styles.css` 361-373 |
| cards (service, doctor, post, related) | lift -7 / -6 / -5 px, `--sh-3`, glass brightens, image zooms 1.06, `»` nudges and turns red; ring drawn on the card with `:has(.stretched:focus-visible)`; doctor cards redraw the ring above the portrait with `::before` | `styles.css` 535-548, 632-655, 685-698 |
| photos in frames (arch, lens, eye window, postcards) | slow zoom 1.04-1.05 (`1s`); postcards straighten and lift 6 px | `styles.css` 617-618, 812-813; b-navy 572-573 |
| inline links | colour -> `--navy`, underline colour -> `--red` | `styles.css` 122-132 |
| chips (insurance, frames) | lift -4 px (decorative; not focusable because not links) | `styles.css` 680 |
| forms | inputs: border `--blue` 2 px + 3 px `rgba(57,116,160,.25)` halo on `:focus-visible` (blue, so focus is never mistaken for the red error state) | new |

Touch (`@media (hover: none)`): no hover transforms on cards (no sticky hover); `:active` scale .98 feedback on
buttons and cards. The skip link (`ctx.chrome.skipLink`) is the first focusable element.

---

## 9. Chrome (`src/theme/chrome.mjs`, `src/styles/chrome.css`)

### 9.1 Header bar
- Floating glass bar: sticky header (`top:0; height:var(--header-h); margin-bottom: calc(-1 * var(--header-h))`,
  `pointer-events:none` on the wrapper, `auto` on the bar), bar `max-width: var(--max-wide)`, radius 20 px, inset
  `var(--header-top)` from the top and `clamp(8px, 2vw, 24px)` from the sides. Frost on `.bar::before` (§5.5).
  A cream scrim (`::before` on the header, 40 px, fades in when scrolled) hides crisp content above the floating bar.
  Reference: `tmp/panel/winner/styles.css` lines 272-309.
- Order: logo | nav | phone link | Book Appointment (primary pill, `ctx.headerButtons`, opens the scheduler in a new tab
  with `rel="noopener"`).
- Logo: `ctx.asset('logo-master.png')`, alt `ctx.site.logo.alt`, home link `aria-label` `ctx.chrome.homeAriaLabel`.
  Width: **208 px at >= 1440, 200 px at 1240-1439, 180 px at 768-1239, 160 px at 380-767, 140 px below 380** (R-4;
  BUILD-CONTRACT max 228; BRAND minimums 200 desktop / 160 mobile, the 140 px step is a declared exception for xs).
  Clear space >= 10 px (BRAND §7.1.1: height of "VISION").
- Phone link: icon + `(732) 978-9306` at >= 1440; icon-only 44x44 with `aria-label` "Call: (732) 978-9306" below.
- `.is-scrolled` when `scrollY > 8` (`data-header`).

### 9.2 Desktop navigation (>= 1240)
Labels and structure come from `ctx.nav` (holds removed). Top level, in order: **Home** (link), **About Us** (disclosure),
**Services** (disclosure, mega), **Eyewear** (disclosure), **Insurance** (link), **Reviews** (link to `/reviews/`, never
`#`), **Visit Us** (disclosure). Each disclosure is a `<button aria-expanded aria-controls>` and its panel starts with
the hub link, labelled with Academy Vision's own CTA label from ctx: About Us -> "About Our Practice" (`/about-us/`),
Services -> "View All Services" (`/services/`), Eyewear -> "Explore Our Eyewear" (`/products/`), Visit Us ->
"Hours & Location" (`/eye-doctor-pine-beach/`, the footer label). A parent button shows the current-page dot when any
descendant is the current page.

Behaviour (R-6), reference `tmp/panel/c-iris/site.js` lines 18-54 for the intent timers and
`tmp/panel/winner/site.js` lines 19-61 for click/Esc/dismiss:
- Fine pointer hover intent: open 90 ms after `pointerenter`, close 260 ms after `pointerleave`; **opening by hover sets
  `aria-expanded="true"`**, closing sets `"false"`. CSS `:hover` opening exists only under `html:not(.js)`.
- Click / Enter / Space toggles; one panel open at a time; Tab walks the panel's links; focus leaving closes it;
  Esc closes and returns focus to the trigger if focus was inside, and suppresses hover-reopen until the pointer leaves;
  pointerdown outside closes.
- A 16 px invisible hover bridge between the bar and the panel.

### 9.3 Services mega menu (R-8)
- Panel `left:0; right:0` under the bar (`has-mega { position: static }`), radius 24, padding 12, glass per §5.5.
- **Five columns**, `grid-template-columns: repeat(5, minmax(max-content, 1fr))`, one per group in `ctx.nav` order:
  Comprehensive Exams, Children's Eye Care, Medical Eye Care, Emergency Eye Care, Contact Lens Exams. Each column:
  the group head as a link (serif 1.0625rem navy, 7 px sky dot with a 4 px halo) followed by its children (Montserrat
  600 .875rem `--blue-ink`, 34 px rows). Children per `ctx.nav`: 2 / 4 / 6 / 4 / 6 links.
- Bottom strip (full width, glass chip row): the Emergency sentence quoted from the town page ("Eye issues don’t always
  happen at a convenient time, and when something feels wrong, it’s important to get it checked sooner rather than
  later.") + "Call: (732) 978-9306" + "Book Appointment" (primary, small) + "View All Services" with an arrow.
- No group descriptions (the prototype's 13 px descriptors are dropped; the UX judge flagged their size).
- Fit: bottom edge <= `innerHeight - 24` at 1280x585 and 1366x600; **no link wraps to a second line** at 1240-1600
  (measure every link's height = one line). Estimated panel height ~350 px (5 x 6 links); the prototype's 3x2 panel
  ended at y 520 *(judge-measured)*.

### 9.4 Dropdowns
- **About Us** (340 px): About Our Practice; Our Eye Doctors with the three bios indented (each with a 32 px round
  portrait thumbnail from the team master files, `widths [150]`); Eye Health with the article indented.
- **Eyewear** (520 px, two columns): Designer Frames, Sunglasses, Kids' Eyewear, Contact Lenses, each with a cut-out
  thumbnail tile (64x42, `cut-eyeglasses-tortoise`, `cut-sunglasses-navy`, kids frames or `cut-eyeglasses-navy` (O5),
  `cut-contact-lens`); then the "Lenses" group label (from `ctx.nav` `group`) with Varilux, Avulux, Stellest; footer
  link "Explore Our Eyewear". Thumbnails scale 1.14 and tilt -5 deg on hover/focus. Reference `styles.css` 388-406.
- **Visit Us** (320 px): Hours & Location, Patient Registration Form, Appointment Request Form, then a NAP block: the
  phone and the address link "90 Atlantic City Blvd, Pine Beach, NJ 08741 »" (`ctx.site.mapsUrl`, new tab).

### 9.5 Phone and tablet drawer (< 1240) (R-7, G8)
- Markup: `<details class="m-nav" data-mnav>` with `<summary aria-label="Toggle Menu">` (`ctx.chrome` labels); the panel
  is a fixed glass sheet under the bar (`top: calc(var(--header-h) + 8px)`, `max-height: calc(100dvh - var(--header-h) - 18px)`,
  scrollable, `overscroll-behavior: contain`) plus a scrim (`rgba(10,29,52,.4)` + blur 6 px, z 70).
- Contents: Home; About Us, Services, Eyewear, Visit Us as nested `<details>` accordions (Services lists the five group
  heads as links, each followed by its children); Insurance; Reviews; then the CTA block: Book Appointment (primary),
  Call: (732) 978-9306 (glass), and "Located at Pine Beach" (`ctx.topbar`) with a pin icon. Rows >= 48 px tall.
- JS makes it modal: on open set `role="dialog"`, `aria-modal="true"`, an `aria-label`, move focus to the first link,
  trap Tab inside (0 of N Tab stops may escape), set `inert` on `<main>` and the footer, lock scroll
  (`html.menu-open { overflow:hidden; padding-right: var(--sbw) }`), toggle the summary label between "Open menu" and
  "Close menu" (`ctx.chrome`). Close on Esc, scrim click, link click, or resize to >= 1240; on close return focus to the
  summary. Verify closed state with `details.open === false` and `checkVisibility()` / bounding box, not computed
  `visibility` of the panel (open item O8).
- Distinct landmark labels: desktop `<nav aria-label="Main">`, drawer `<nav aria-label="Mobile">` (R-14).

### 9.6 Phone header (G7, R-15)
- 380-767: logo 160 | **Book Appointment pill** (12.5 px / 650, padding 0 12 px, height 40) | menu toggle 44x44;
  bar padding 12 px left / 6 px right, gaps 6 px. The call icon is hidden at this size (Call stays in the hero, the
  drawer and every CTA group).
- < 380: logo 140, pill 11.5 px with 10 px padding. Must fit at 360 (bar 346 px): measured `scrollWidth == clientWidth`
  and no overlap (b-navy's version overflowed to 373 px at 360, *judge-measured*).
- The row is tight: at 390 the pill has about 140 px (the label's width at 12.5 px Montserrat 650 is estimated at
  ~120 px, UNVERIFIED). If it does not fit when measured, step down in this order and record which step was needed:
  pill font 12 px, pill padding 9 px, bar side inset 8 -> 4 px, and only then logo 150 px (a declared exception).
- 768-1239: logo 180 | phone icon | Book pill | menu toggle.

### 9.7 Footer (all pages)
- Navy band: `linear-gradient(180deg, var(--navy), var(--navy-deep))`, top radius `clamp(28px, 4vw, 56px)`, two sky
  light pools, and the `loop-navy-glass` video (home) or its poster (other pages) at 35 % opacity, `mix-blend-mode:
  screen`, as the photo plane. Text `--ink-inv`, headings `--label-inv` (.75rem, 650, .18em, uppercase).
- Grid (>= 1024, 12 columns): brand plate (3) | Eye Care Services (2) | Eyewear (2) | Our Practice (2) | Contact Us (3);
  second row: Locate Us map (7) | Hours (5). 2 columns at 768-1023, 1 column below.
- **Brand plate**: a light glass plate (white .92, radius 22, padding 18) holding the logo in its own colours at 200 px
  and the Who's Who badge (`ctx.site.badges`, 88 px, white radius-14 plate). The logo is never shown in navy inks on
  navy and the derived reversed knockout is not needed (BRAND §7.1.1, §1.7; R-4).
- Columns and labels exactly from `ctx.footer` (SITE-ARCHITECTURE §7): Eye Care Services (5 group links + View All
  Services), Eyewear (7), Our Practice (6), Contact Us (name "Academy Vision" as a serif label, phone, address »
  (new tab), Hours & Location, Book Appointment, Appointment Request Form).
- Locate Us (`ctx.chrome.footerHeadings.locate`): the keyless map iframe (`ctx.site.mapEmbedSrc`, title
  `ctx.site.mapTitle`, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`) in a glass frame (radius 22,
  1 px `--line-dark`, aspect 16/10, max-height 260 px; 220 px on phones).
- Hours (`ctx.chrome.footerHeadings.hours`): rows from `ctx.site.hours`, labels printed verbatim ("monday:") and
  capitalised by CSS, hairline separators `rgba(255,255,255,.09)`.
- Legal row: `© 2026` (`ctx.site.copyright`) and the five legal links (Accessibility, Sitemap, Privacy, Disclaimer,
  Terms of Use). No "Powered by" credit.
- Home only: `site-footer--overlap` padding-top `calc(120px + clamp(48px, 6vw, 80px))` for the visit card and
  postcards (§12, H13).

### 9.8 Breadcrumbs, skip link, CTA strip
- Breadcrumbs (`page.breadcrumbs`, all pages except home) inside the title-band panel above the H1: `<nav
  aria-label="Breadcrumb"><ol>`, .78rem 600, links `--blue-ink`, chevron separators drawn in CSS, current item
  `aria-current="page"` in `--navy`. Reference `styles.css` 759-764.
- CTA strip (pages without a model closing CTA: bios, legal, sitemap, reviews, about, products hub tail): a slim glass
  strip in the container with "Located at Pine Beach" (pin, link), the phone, Book Appointment (primary) and Call (glass).
  No heading (no Academy Vision text exists for one).

---

## 10. Component catalogue (mapped to the source component types)

Each entry: source type and where it appears -> component -> anatomy -> responsive -> motion/hover -> protrusion ->
reference. Node fields are those of PORT-NOTES §3 and the stub (`src/theme-stub/index.mjs`).

### 10.1 Atoms
- **Eyebrow** (`html` node with `hint:'kicker'`, adopted `kicker`): `.eyebrow` (§3.2) with the **iris bullet**:
  `::before` 13x13 ring, 1.5 px `currentColor` border, 2.6 px pupil (`radial-gradient(circle, currentColor 0 2.6px,
  transparent 3.2px)`) (c-iris `styles.css` 140-152). Colour `--blue-ink` on light, `--label-inv` on navy.
- **Accent word** (`<em class="acc">` inside a heading, text unchanged): real italic, accent gradient clipped to text
  (§3.1), `font-synthesis: none`. Selection, deterministic, one per heading:
  1. the phrase "Pine Beach" plus a following ", NJ" or ", New Jersey" if present;
  2. else the last two words, extended to three when the first of them is one of: for, of, the, a, an, to, in, at, and,
     your, our (so "Your Life" becomes "Fit Your Life", "Our Doctors" becomes "From Our Doctors", while "We Accept"
     stays two words);
  3. never on headings of 1-2 words, card titles, menu/footer headings or headings inside rich text and legal text;
  4. home overrides to keep the prototype's choices: "A Different Kind of Eye Care Experience" -> "Different";
     "Eyeglasses & Same-Day Options" -> "Same-Day"; "We make kids' eye care easy and stress-free!" -> "easy and
     stress-free!".
- **Swoosh** (the logo's lower lid): inline SVG under the accent (`viewBox="0 0 300 26"`, path
  `M3 19C70 6 190 2 297 13`, `pathLength="1"`, stroke `--sky`, width 5, round caps, opacity .85, `aria-hidden`); only on
  the H1 and H2 xl, and only when the accent ends the heading (a mid-line swoosh collides with the next line, prototype
  lesson). Hidden on phones in statements. Reference `styles.css` 168-189.
- **Highlighter mark** (`<mark class="hl">`): `background: linear-gradient(transparent 58%, rgba(68,137,188,.26) 58%
  92%, transparent 92%)`, `box-decoration-break: clone` (c-iris `styles.css` 588).
- **Buttons** (`button` / `button-group` nodes, ctx CTAs): pill, 52 px (44 small), `font: 650 .9375rem/1.15`.
  `.btn--primary`: `--blue` fill, white label, hover/focus `--navy` (R-3). `.btn--glass`: white .58, blur 12, navy
  label. `.btn--outline`: white .35, 1 px `rgba(15,42,74,.28)`, navy label. On navy: `.btn--light` (white fill, navy
  label, hover cream) and `.btn--ghost-light` (white .08, 1 px white .45). Arrow icon on internal links.
  **Group rule (R-11):** a group containing Book Appointment renders it first and as the primary; Call is glass (light
  surfaces) or ghost-light (navy). Other internal-link buttons: outline, or primary when alone in the block.
  `rel`/`target` from the node (3 Book buttons carry `rel="nofollow"`; the scheduler opens in a new tab).
- **Arrow link** (`»` chevrons, `chevron:true`): `.arrow` span, `aria-hidden`, colour `--sky`, nudges on hover.

### 10.2 Header, mega menu, phone menu (`header-1`, `menu`)
§9.1-9.6.

### 10.3 Home hero (`hero-2`, home block 0)
Title-band "full" variant (10.5) specialised: photo plane = the model's background image
(`photo-glow-woman-wearing-designer-frames`, 1600x711, subject in the right third) rendered once as an `<img>` with the
model alt (it is also the model's `mobile-only` image node); `max-width: 1440px`, anchored right, `object-position:
62% 32%`; left edge dissolves into the cream (`mask-image` radial/linear, prototype `styles.css` 478-487) while the
**bottom edge stays hard** above the seam band. Panel `.glass--hero`, width `min(100%, 700px)`, radius 44: eyebrow (kicker),
H1 with accent "Pine Beach, NJ" and swoosh, lead (model html), actions Book Appointment (model button, primary) +
Call (ctx, glass). Lead inline links in `--navy` with a `--blue` underline (R-19). The hero is `min-height:
clamp(560px, 100svh, 940px)`; padding-bottom leaves room for the location card's upper part. Protrusions: P-cut
tortoise cut-out (right of the panel), P-straddle location card (left), §12 H1.

### 10.4 Interior hero (`hero-1`: `/about-us/`, `/our-doctors/`)
The source's dark-scrim hero becomes a light title band: `/our-doctors/` -> half variant with
`photo-as-1227180789` (exam room, never captioned as the practice's room); `/about-us/` -> postcard variant (its hero
image `photo-2020-09-03` is 600x284 and cannot go full-bleed).

### 10.5 Title band (first block holding the page's H1; adopted pages)
Four variants. All: breadcrumbs, eyebrow (kicker), H1 (accent + swoosh), CTA row; **the lede moves out of the panel**
into a **lede card** (10.6) so the H1 and CTA always fit the first screen (R-9). Panel `.glass--hero`, radius 44,
`width: min(100%, 640px)`, always on the **left** (the image side of every interior callout is "right"; every generated
hero puts its subject in the right third with a calm left half). One seam band under the band.

| variant | when | photo plane | panel |
|---|---|---|---|
| **full** | adopted pages with a generated hero (`page.generated.hero` resolves via `ctx.imgSrc`), `/reviews/` (still of the lens loop), the home (10.3) | full-bleed `<img>` 100vw, `object-position` per §13.4 | left, vertically centred below the bar |
| **half** | model pages whose H1 block has an image >= 1000 px wide | the image on the right, **at its own aspect ratio** (clamped 4:3 to 16:9), width 58vw (bleeds to the right viewport edge), inner (left) corners `border-radius: 34% 50%` lens edge, hard bottom edge on the seam | left, overlapping the photo by ~8vw |
| **postcard** | H1 block image < 1000 px (`/about-us/`) or a real-place photo | `tex-cream-light` texture plane (`ctx.imgSrc`, inline style) at 70 % opacity | left; the photo as a tilted print postcard (10.21) on the right, <= its intrinsic width / 1.5, crossing the band's bottom seam (P-frame) |
| **texture** | no image (forms, legal, sitemap, bios, town page) or a hero slot with no file (`hero-glaucoma-management`, O7) | `tex-cream-light` | left; bios add the portrait (10.15) |

Half variant keeps centred faces visible regardless of crop: most interior photos are "face centred" in
`image-masters.json` `crop`. Height: photo height + header; at 1280x585 the band ends near the fold. Mobile (< 768):
photo full-width on top (height = its aspect, max 92vw), panel overlapping its bottom by 16vw (prototype `styles.css`
982-985). Title-band cut-out (P-cut) per §13.6, crossing the bottom seam on the right, `translateY(46%)`.

### 10.6 Lede card
The H1 block's non-kicker `html` nodes (model pages) or `adopted.lede`, in a `.glass--strong` card,
`width: min(100%, 720px)`, aligned to the panel side, `margin-top: -clamp(56px, 7vw, 110px)` so it straddles the
title-band seam (P-straddle). Text at `--fs-lead`; inline links `--blue-ink`. The next section's top padding is
`>= card overhang + 32px`.

### 10.7 `section-callout-1` (image left/right) and `section` 6/6 image + text
Resolver (in order): a list-bearing block -> 10.10; navy background -> 10.12; otherwise alternate, per page, between:
- **Split** (half-bleed): photo on the model's image side (`imageSide` / node order), 64 % width, inner corners lens
  edge, `data-reveal="mask"` on the frame, inner wrapper `data-depth="0.05" data-depth-max="28"`, photo
  `object-position` from §13.4; `.glass--strong` panel (`min(100%, 560px)`) overlapping from the other side. Reference
  `styles.css` 590-603 (`.split`). Below 900: photo on top (78vw, bottom corners curved `0 0 50% 50% / 0 0 18% 18%`),
  panel overlapping by 16vw.
- **Feature** (full-bleed): only when the image is >= 2400 px wide or `fullBleedOK` and its crop leaves a text side;
  photo full-bleed with top/bottom hard edges (or dissolves where nothing crosses), `.glass--strong` panel on the text
  side. Reference `styles.css` 550-570.
- **Arch**: copy on one side, the photo in an arch window (`--r-arch`, aspect 4:5, inner highlight), used for the
  second split of a page and for the home eyewear block. Reference `styles.css` 605-621.
Text nodes keep their order inside the panel: eyebrow, heading, html, buttons.

### 10.8 `section-divider`
§6.5 seam band. Never rendered as an empty block.

### 10.9 `section` 12-column text: Statement, Reading, CTA band (G6)
- **CTA band**: the page's last block when it holds a Call or Book button and no image -> a rounded navy panel in the
  container (`--r-xl`, `linear-gradient(150deg, var(--navy-2), var(--navy) 55%, var(--navy-deep))`, two sky pools,
  `loop-navy-glass` video plane at 30 % opacity `screen`) with a `.glass--navy-soft` card: heading (accent in the navy
  gradient), html in `--ink-inv`, buttons `.btn--light` (Book) then `.btn--ghost-light` (Call). Reference
  `styles.css` 837-871.
- **Statement** (html <= 700 chars, <= 2 paragraphs): >= 1024 a 12-column grid, heading in columns 1-5 (H2 size, not
  sticky, R-13), paragraph in columns 6-12 as **designed type** (`--fs-designed`, Libre Baskerville, navy);
  the paragraph's final sentence is wrapped in `.hl` when it contains no inline markup; buttons below. Phones: stacked,
  paragraph 1.18rem. Sits on the canvas with a light pool placed behind it.
- **Reading** (longer): `.glass--veil` panel, `max-width: 72ch`, body 1.0625rem/1.75, first paragraph at `--fs-lead`,
  lists with iris bullets, `h2`-`h3` inside rich text in serif.

### 10.10 List-bearing sections (`section` with a `ul` of >= 4 items and an image)
- First on a page: **List split**: a sea-glass band (arched top, `--band-arch`, gradient
  `rgba(222,236,247,.88) -> rgba(232,241,248,.62) -> transparent`, inset highlight); copy + the `li`s as glass chips in
  2 columns (`.symptom-list`, iris bullet, 16 px text); the image in the circular **lens** frame
  (`width:min(100%,520px)`, glass ring 10-16 px, inner image scale 1.35, specular highlight) rising
  `clamp(110px, 12vw, 190px)` across the band's arched top (P-frame). Reference `styles.css` 779-814.
- Second: **Options**: the `li`s as glass option cards (3 + 2 grid, `.opt-grid`, iris bullet instead of hand-drawn icons
  so it scales to every page) with the image in an arch window beside the heading. Reference `styles.css` 819-835.
`strong` inside list items keeps its weight (serif `strong` line on option cards as in the prototype).

### 10.11 `column-group` / `column`
The model's `layout.columns` spans drive only the resolver (12 vs 6/6 vs 12/6/6 vs 12/8/4); the theme does not
reproduce the 12-column source grid literally.

### 10.12 Navy sections (`background.color #0f2a4a`: home kids band, Stellest 6/6, contact-lenses childpages)
Navy band (full-bleed, hard top and bottom edges with seam bands where the source has dividers): text `--ink-inv`,
eyebrows `--label-inv`, headings cream with the navy accent gradient. With an image: the photo half-bleed on its side
with a `.glass--navy` panel. With childpages: P-row cards (10.17) whose photos pop out of the card tops. The home kids
band is specified in §12 H5.

### 10.13 Team list (`team-list-1`: `/our-doctors/`, home)
**P-row doctor cards** on a navy-to-cream edge: the section's top zone is navy (`tex-navy-glass` at 25 %) holding the
intro (kicker, H2, paragraph as a Statement on navy, final sentence marked with a light highlight
`rgba(156,195,227,.28)`), then "Meet our Optometrists" (model H2, styled as a tracked label, heading level kept); cards
(`.glass--strong`) in 3 columns straddle the navy edge at 55 % of their height. Card: portrait (`ctx.img(photo, {
widths:[150,300], sizes:'150px' })`, **max 150 CSS px wide**, aspect 3:4, radius 26, 5 px white border) rising 60 px out
of the card top (P-frame); name (H3 from `title.html`, serif 1.3rem, `»`); bio excerpt (`bio`, ends in "..."); "Read
More" link (`cta`, `aria-label` kept). Hover: card -6 px, portrait -8 px and -1.5 deg. Phones: compact rows (portrait
96 px left, name + excerpt + Read More right), navy zone behind the first card only. Reference `styles.css` 623-664.

### 10.14 Team positions / languages / highlights (empty) and `account-equipment-1` (empty)
`empty:true` nodes render nothing (no empty containers, no headings).

### 10.15 Doctor bio (`team-biography-1`, `team-photo-1`: 3 pages)
Title band texture variant; the portrait (<= 150 px, 10.13 style) sits at the panel's top-right corner, breaking out of
the panel by 48 px (P-frame). Biography in a `.glass--veil` reading panel: first paragraph at `--fs-lead`; a paragraph
that opens with "Clinical Focus:" stays as written, and the list that follows becomes glass chips; then the CTA strip
and Related (the other two doctors).

### 10.16 Location summary, hours, map (`location-summary-1`, `location-hours-1`, `location-map-1`)
- Summary: name (serif label, only when `show` has `name`), phone (`tel:`), address with `»` (new tab when
  `mapsNewTab`). Rendered as a `.glass--navy` **location card** (b-navy `.loc-card__*`, `styles.css` 398-411): 38 px
  pin disc (gradient `--sky -> --blue`), rows with 16 px `--label-inv` icons and `rgba(196,222,242,.14)` separators,
  text .9375rem cream.
- Hours: definition list in glass, labels verbatim, capitalised by CSS, 2 columns label/time.
- Map: keyless iframe (`ctx.site.mapEmbedSrc`, `title` = node `mapTitle`), lazy, in a glass frame (radius 22,
  16:10 desktop, 4:5 phones). Only where the model has a map node or in the footer.

### 10.17 Childpages (`childpages-2`: services hub 6, eyeglasses 3, contact lenses 3) and home service cards
Glass cards in 3 columns (2 at 768-1023): photo (16:10, radius 20) popping 48 px above the card top (P-frame; b-navy
`styles.css` 486-488 uses 64 px), title (serif 1.22rem, `»`, stretched link over the card), excerpt (16 px `--ink-2`).
Image refs from the item; `sizes="(min-width:1024px) 380px, (min-width:768px) 46vw, 96px"`. Phones: compact rows
(96x96 thumb left). Reference `styles.css` 530-548.

### 10.18 Insurance, frames, contact-lens lists (`account-insurance-1`, `account-frames-1`, `account-contact-lenses-1`)
- Insurance (12): chips in 4 columns (3 on phones): logo 40 px high (`widths [200,400]`, `sizes 160px`), name 13 px 600
  `--ink-2`. Panel `.glass--tint` over `tex-cream-light` (R-5). Reference `styles.css` 667-680.
- Frames (26): same chips; first 12 visible, the rest hidden by JS until "Show All" (`ui.showAll`, the button the model
  provides) is pressed; without JS all 26 show and the button stays hidden.
- Contact lenses (7): product cards (white glass, packshot `object-fit: contain` 120 px, name in serif 1.05rem).

### 10.19 Review carousel (`location-review-carousel-1`: `/reviews/`; home teaser)
- `/reviews/`: all 20 reviews (R-2). Cards (`.glass`, radius 30): five SVG stars in `--sky` with
  `role="img" aria-label` = `ratingLabel` ("5 out of 5 stars"); quote in Libre Baskerville Italic 1.06rem/1.6; for the
  12 reviews with an `excerpt`, the static markup holds both the full `quote` (visible) and the `excerpt` (`hidden`);
  `features.js` then shows the excerpt plus a "Show More" button (`ui.showMore`) that swaps in the full quote and removes
  itself. build-verify (a) reads static markup, so the full quote must be in the HTML, never injected by JS. Author
  (`cite`, 600) and date (`<time datetime>`, formatted "October 1, 2026").
  Track: horizontal `scroll-snap` list (3 cards visible >= 1024, 2 at md, 1.15 on phones), prev/next buttons
  (`aria-label` `ui.previous` / `ui.next`), 20 dot buttons (`ui.dot` with `{n}`), no auto-advance. No-JS: a scrollable
  list with all full quotes visible.
- Home teaser (§12 H11): three reviews quoted verbatim with stars, author and date: "Top notch! Great doctor and
  staff! ..." (Lisa M.) as the featured designed-type quote, plus "Excellent service and eye care!" (Alfred J.) and
  "Kind, professional staff. Bright, clean office. ..." (Christine G.) as small cards; a "Reviews" arrow link
  (menu label) to `/reviews/`. Section `aria-label="Reviews"`; no invented heading.

### 10.20 Practice photos (`location-photos-1`: `/reviews/`)
Three photos after the pipeline removed the comic: print postcards (10.21) in a loose fan (one large, two small).
Each photo is a `<button aria-label="View image in lightbox">` (`ui.lightbox`) that toggles an in-place enlarged view
(fixed overlay, scrim, image at intrinsic size max 90vw/90vh); Esc, scrim click or the same button closes it; the button
carries `aria-expanded`. `practice-35051-15ef8052` (street view) is shown in a 1:1 frame with `object-position: 30% 50%`
so the roadside sign at the right edge, which prints the second phone number, is cropped out (§13.5).

### 10.21 Postcard (real-place prints) (G1)
Print frame: `rgba(255,255,255,.94)` padding 8/8/10 px, radius 14, `--sh-3`, image radius 8, tilt `rotate(3deg)` /
`rotate(-4deg)`; hover/focus straightens to 1 / -2 deg and lifts 6 px. Max CSS width = intrinsic width / 1.5 (sharp
at the operator's DPR 1.5): mural `practice-35050-f516a054` 400 px, night sculpture `practice-35052-53784670` 360 px,
600 px sources (`photo-2020-09-03`, `photo-2020-04-06-2`) 400 px. Alts: the source alt
of the same photograph (the mural's descriptive alt from `photo-2020-04-06`, the night photo's "Practice Image").

### 10.22 Article list (`article-list-1`: home blog) and the article page
- Post card: `.glass` card (max 1040 px, 2 columns), photo (4:5, 5 px white border, radius 30) **96 px taller than the
  card at top and bottom** (P-frame), title (H3 serif, `»`, link with the item's `ariaLabel`), excerpt, "Read More"
  (`cta`). Reference `styles.css` 682-698.
- Article page: title band half variant (`photo-pediatric-optometrist-eye-exam`), H1 = `page.h1` (BlogPosting
  headline); body in a `.glass--veil` reading panel (first paragraph `--fs-lead` with a 3.6em serif drop cap,
  `styles.css` 775-776); the inline "Schedule a visit" link kept; CTA strip; Related.

### 10.23 Forms (`form-embed`: `/appointment-request-form/`, `/patient-forms/`)
Title band texture variant; form in a `.glass--veil` panel (max 760 px). Fields: label 15 px 600 navy (+ red `*`
`aria-hidden`), description 14 px `--ink-2`; inputs/selects/textareas: white .92, 1 px `rgba(15,42,74,.22)`, radius 12,
min-height 48 px, 16 px text; focus per §8; fieldsets for radio/checkbox groups; `presentation:'chips'` groups as pill
chips (checked = navy fill, white label); conditional fields (`showIf`) hidden until their rule matches; errors in
`--error` under the field (`role="alert"`, messages from `messages.validation`); success/error/submitting copy from
`messages`. Submit: label from the model, `.btn--primary`, **disabled in the markup**, enabled by `features.js`, and
submission is stopped (forms are unwired, `data-sr-unwired="1"`, BUILD-CONTRACT §4.5). Phone formatter on
`data-phone-format`. The registration form's option-less "Communication Preference" select stays option-less.

### 10.24 Legal pages (`privacy-policy-1`, `disclaimer-1`, `website-accessibility-policy-1`; adopted `/terms/`)
Title band texture variant (compact, no CTA row); legal html in a `.glass--veil` reading panel (max 76ch, 1rem/1.75,
headings in serif, lists with iris bullets, links `--blue-ink`); CTA strip; Related = the other legal pages. The
disclaimer's EyeCarePro clauses stay verbatim (BUILD-CONTRACT §4.7).

### 10.25 Sitemap (`sitemap-1`, regenerated `groups[]`)
Title band texture variant (compact); one glass card per group in a masonry-like 3-column grid (1 on phones): group head
link (serif 1.2rem) + items (indented by `depth`), legal pages at depth 0 in their own card.

### 10.26 `divider` (reviews page)
A 1 px `rgba(15,42,74,.12)` hairline with 48 px vertical margin.

### 10.27 Eye window (home only) (G3)
- Box: `aspect-ratio: 100 / 62`; spans columns 6-12 and bleeds to the right viewport edge
  (`margin-right: calc(-1 * var(--gutter))`); phones: full width.
- Photo: `photo-as-1343078337` (family of three in glasses), `object-position: 50% 40%`, `scale: 1.16`, masked by
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 62' preserveAspectRatio='none'%3E%3Cpath d='M1 31C20 2 80 2 99 31C80 60 20 60 1 31Z'/%3E%3C/svg%3E") center / 100% 100% no-repeat`.
- Art (`<svg viewBox="0 0 100 62" preserveAspectRatio="none" overflow="visible" aria-hidden>`): upper lid
  `M-1.5 31C18 -3.5 82 -3.5 101.5 31`, `fill:none; stroke: var(--navy-deep); stroke-width: 7px; stroke-linecap: round;
  vector-effect: non-scaling-stroke`; crescent `M4 40C24 74 74 76 97 44C76 68 28 66 4 40Z`, `fill: var(--sky)`,
  `filter: drop-shadow(0 14px 18px rgba(15,42,74,.25))`. On the light band these are the logo's own inks
  (`#082240`, `#4488bb` ~ `--sky`).
- Iris disc: a frosted glass disc (`width:19%`, `left:-6%`, `top:30%`), blur 16, sat 170, `radial-gradient` highlight at
  32 % 26 %, a 3 px `--navy-deep` ring and a small white catchlight at upper right (the logo's iris), parallax
  `data-depth="-0.12" data-depth-max="30"`.
- Reveal `scale` on the box (no clip-path). Photo parallax `+0.05`, max 24.
- The crescent must not overlap faces or the cards below: the intro grid's `margin-bottom >= crescent overflow + 24px`.
- Reference `tmp/panel/c-iris/styles.css` lines 463-473 and `index.html` lines 194-201 (colours changed for the light band).

### 10.28 Cut-out (foreground)
`<div class="cutout" aria-hidden="true" data-depth="-0.12..-0.16" data-depth-max="40..48">` holding `ctx.img(slot)` (alt
"", `data-ai-generated` added by ctx.img) sized by its object box (§6.3), `filter: var(--sh-cut)`, a fixed `rotate`
(-10 to 9 deg). Float-in once on load or reveal. `pointer-events: none`.

### 10.29 Related (`page.related`)
After the CTA band or strip: heading by section: services -> eyebrow "We’re Right Here When You Need Us" + H2 "Our
Services at Academy Vision" (quoted from `/services/`); eyewear -> H2 "Explore Our Range" (quoted from `/products/`);
other sections -> H2 = the section's menu label. Cards per 10.17 (photo from `item.image` when present, else a
glass tile with the iris bullet), excerpt from `item.excerpt`.

---

## 11. Page templates (by `page.kind`)

Every page: header, `<main id="main-content" tabindex="-1">`, footer. The title band holds the only `<h1>`; cross-page
headings are demoted to `h2`. Order of blocks follows the model except where stated.

### 11.1 home -> §12.

### 11.2 service (8) and product (5) (the shared service pattern; 13 pages incl. contact-lens exams, scleral, ortho-k, lens products)
1. Title band **half** (H1 block = callout right) + lede card + title-band cut-out (§13.6).
2. Every following block through the resolver (§10.7-10.12). The common 6-block pattern renders as: Statement
   (block 1) -> List split with the lens (block 2) -> Split mirrored (block 3) -> Options with arch or Split (block 4,
   5) -> CTA band (last block).
3. Related.
Stellest's navy 6/6 block uses 10.12. Example (dry eye, `/services/dry-eye-treatment/`): "What Causes your Dry Eye?" =
Statement with the final sentence marked; "Common Dry Eye Symptoms" = List split, `photo-as-472045717` in the lens;
"A Better Way..." = Split, `photo-as-504084199` (not captioned or framed as a before/after, §13.5); "Our Dry Eye
Treatment Options" = Options with `photo-ss-2143953341` in the arch (the prototype dropped this photo; it MUST render,
R-23); "Schedule Your Dry Eye Consultation" = CTA band.

### 11.3 service-hub (`/services/`)
Title band half (`photo-as-195023420`) + lede card; block 2 Split; block 4 (600x600 `photo-woman-blue-eye-closeup-640`)
-> lens split (the 10.10 lens frame without chips, lens width capped at the image's intrinsic width / 1.5 = 400 px);
block 5 childpages (6) -> card grid on a sea-glass band (P-frame photos); block 6 (heading, html, the
phone button, image; empty equipment list) -> Split followed by nothing for the empty list; Related.

### 11.4 product-hub (`/products/`)
Title band half (`photo-as-210642677`) + lede card; block 2 (heading only) attaches to block 3 as its heading -> Split;
block 4 frames (26) with Show All -> chips on a sea-glass band; block 5 (600x600 image) -> lens split; block 6 Split;
block 7 childpages (3) -> card grid; block 8 -> Split; CTA strip; Related.

### 11.5 about (`/about-us/`)
Title band **postcard** (the mural `photo-2020-09-03` as a print, max 400 px, crossing the seam) + lede card; block 2
(history, Call button, staff photo `photo-2020-04-06-2` 600x450, real people: shown as supplied, max 400 px) -> Split
whose photo is a print postcard breaking out of the panel; block 3 -> Split mirrored (`photo-as-1850300419`);
CTA strip; Related (Our Eye Doctors, Eye Health).

### 11.6 doctors (`/our-doctors/`)
Title band half (`photo-as-1227180789`) + lede card; block 2 -> team section exactly as 10.13 (navy intro zone + P-row
cards); CTA strip; Related.

### 11.7 bio (3)
10.15.

### 11.8 location / town (`/eye-doctor-pine-beach/`)
Declared reorder: the H1 block (block 2) renders first as the title band (texture variant, CTA = its Call + Book buttons)
with the **location card** (block 0's summary: "Academy Vision" label, phone, address) on the right straddling the
seam, and block 2's paragraphs as the lede card; then block 0's hours (glass table) beside the map (glass frame) in one
band; then block 3 -> Split with its mural photo as a print postcard (`practice-35050-f516a054` file with block 3's
alt, §13.5); CTA strip.

### 11.9 reviews (`/reviews/`)
Title band **full** with `still-loop-lens-light` (lens on a sunny windowsill, subject right of centre), H1 "Academy
Vision" (model), five stars graphic (`aria-label` "5 out of 5 stars"), Book CTA; carousel (10.19) on the canvas;
practice photos (10.20); the map node (10.16); CTA strip. The JSON-LD reviews and aggregate are printed by
`ctx.seoHead` (build-verify h).

### 11.10 insurance (`/insurance/`)
Title band half (`photo-as-213609213`) + lede card; block 2 Split (`photo-as-313387543`); block 3 Split mirrored with
`photo-as-527484728` cropped so the in-frame "FLU" poster is out of frame (§13.5) and the "Contact Us" button; block 4
insurance chips on `.glass--tint` over `tex-cream-light`; block 5 ("Payment and Financing", Call + Book) -> CTA band.

### 11.11 form (2) -> 10.23. 11.12 legal (3 + terms) -> 10.24. 11.13 sitemap -> 10.25. 11.14 article -> 10.22.

### 11.15 eye-health (adopted hub, `/eye-health/`)
Adopted template (11.16) plus a featured-guide block after the lede card: the article as a post card (10.22) with
`photo-family-sitting-on-bed` breaking out of the card.

### 11.16 adopted (22: 21 services/products + `/terms/`)
1. Title band **full** with `page.generated.hero` (16:9 generated, subject in the right third; `object-position: 70%
   45%`); if `ctx.imgSrc(page.generated.hero)` is null use the **texture** variant (O7). Kicker -> eyebrow; `h1`.
2. Lede card (`adopted.lede`).
3. Sections by `layout`:
   - `text` -> Statement if <= 700 chars, else Reading;
   - `list` -> a sea-glass band with the heading, any lead paragraph, and the list items as glass chips in 2 columns
     (adopted list sections carry no image; lists of 3 or fewer items stay a Reading list);
   - `split` -> a `.glass--strong` panel with the section's cut-out slot (`imageSlot`: `cut-eyeglasses-tortoise`,
     `cut-sunglasses-aviator`, `cut-trial-lens`, `cut-contact-lens`, `cut-reading-glasses`) breaking out of the panel's
     top corner and crossing the band seam (P-cut); `imageSlot: null` -> Statement;
   - `callout` -> a highlighted notice: `.glass--navy` panel over `tex-navy-glass` (urgent "go to the ER" and booking
     notices read as important without new words);
   - `faq` (section layout) and `adopted.faq[]` -> accordion: `<details>` glass rows, question in serif 1.15rem,
     chevron, answer html; `<details>` toggles natively without JS (closed by default, answers stay in the DOM).
4. CTA band from `adopted.cta` (heading + html) with Book then Call from ctx (BUILD-CONTRACT §3.3: buttons come from ctx).
5. Related (`adopted.related` resolved into `page.related`).
`/terms/` uses the texture variant (`tex-cream-light`, per the image plan) and no CTA row in the title band.

### 11.17 404 (`render404`)
Title band texture variant: H1 "Page not found" (declared UI string, O10), then the five Services group heads as glass
link tiles, the CTA strip and the footer. Root-relative URLs (the 404 is served at any depth).

---

## 12. Home page composition (`/`, `src/theme/home.mjs`)

All 15 home model blocks render (block ids in brackets), plus cross-page sections quoted from other models via
`ctx.pagesByPath`. Desktop description first; phone notes after each. Navy appears in H2 (location card), H3 (cards
floor), H5, H9 and the footer: target dark-navy share 15-25 % (R-3).

**H1 Hero** [`bblCWzB660` hero-2] - 10.3. Protrusions: **tortoise cut-out** (`cut-eyeglasses-tortoise`, object width
`clamp(190px, 29vw, 470px)`, right `clamp(10px, 14vw, 250px)`, `translateY(44%)`, rotate -7 deg, crossing the hero's
hard bottom seam, right of the panel; prototype geometry measured 0 text hits at 9 sizes, *designer-measured*) and the
**"Located at Pine Beach" location card** (G2): `.glass--navy`, 300-332 px, aligned to the container's left edge,
straddling the seam with ~40 % above / 60 % below, top >= hero panel bottom + 24 px at every size; contents: pin disc +
"Located at Pine Beach" (serif 1.22rem link to `ctx.topbar.href`), address row "90 Atlantic City Blvd, Pine Beach, NJ
08741 »" (new tab), phone row. Seam band [`x5ehTikftR`] at the hero bottom.
Phone: photo top (`calc(var(--header-h) + 96vw)` tall, bottom fade), panel overlapping, buttons full width; cut-out 50vw
at right under the panel; the location card in flow under the panel.

**H2 About** [`GWjKxg2mVk` callout] - photo band (`photo-as-569060589`, `object-position: 58% 32%`) on the right 70 %
(`min(70%, 1040px)`, `clamp(380px, 40vw, 600px)` tall, radial mask from the right), `.glass--strong` card on the left
overlapping the band and running 120 px into the services band's arched top (P-straddle). Seam [`HFHRMpqUA9`] is the
arch highlight. Reference `styles.css` 494-507.

**H3 Services** [`NtZB3XNUK0` callout] + cards from `/services/` childpages (6) - sea-glass band with arched top:
intro left (eyebrow, H2 xl "Optometry Services for the *Whole Family*" + swoosh, both paragraphs, "View All Services"
primary) and the **eye window** right (10.27, family photo, the block's own image and alt). Below, the **six service
cards** (10.17) in 3x2, straddling a **light-to-navy edge** (G5): the band's lower zone is navy (hard top edge at 45 %
of the first card row, 1 px white highlight), the cards are `.glass--strong`, photos pop 48 px out of the card tops
(P-row + P-frame); the navy floor runs 120-160 px below the cards and meets the dry-eye photo with a hard edge.
Phone: eye window full width; cards as compact rows; the navy zone starts behind card 4.

**H4 Dry eye** [`iOIKo2TXey` callout] - Feature: `photo-as-485352260` full-bleed (`object-position: 64% 36%`, face in the
right half), hard top edge against the navy floor, `.glass--strong` panel left (`data-reveal="left"`). Seam band
[`X6ZumXe6er`] at its bottom.

**H5 Kids** [`7XCqjs9uq5` navy section] (G4) - smoked navy glass over full-bleed photography:
`photo-as-522927551` ("A girl in a white dress and glasses is smiling while a woman adjusts her glasses.", face centred on
the upper third) full-bleed, `object-position: 50% 28%`, a navy gradient over its lower half
(`linear-gradient(0deg, rgba(8,24,43,.72), rgba(8,24,43,0) 55%)`); a centred `.glass--navy` panel (max 920 px) in the
lower half holding the statement as display type ("We make kids' eye care *easy and stress-free!*", cream, navy accent
gradient; the source heading has no level, render it as `h2`) and the "Pediatric Eye Care" button (`.btn--light`). The
face stays above the panel at every size. **Kids' frames cut-out** crosses the band's top seam on the right (away from
the face): kids frames if imported (O5), else `cut-eyeglasses-navy`, `clamp(150px, 21vw, 330px)`, rotate 9 deg.
Seam band [`SjXCFCaVul`] at its bottom. Phone: photo on top (16:10), panel overlapping its bottom by 20vw.

**H6 Myopia** [`9hpxlmAR5u` callout] - Split: `photo-as-1899226050` half-bleed left (lens edge, `object-position:
60% 30%`, mask reveal), `.glass--strong` panel right. Reference `styles.css` 590-603.

**H7 Eyewear** [`7fRYcVCvhz` callout] - Arch: copy left (lead first paragraph), `photo-ss-1395168776` in the arch
(`object-position: 60% 50%`); **sunglasses cut-out** (`cut-sunglasses-navy`, `clamp(170px, 62%, 360px)` of the media
column, rotate -6 deg) overlapping the arch's lower-left corner and crossing the seam band [`Pv9ZgSzHAP`] into H8 by
>= 40 px at every desktop size (the prototype's 5 px at 768 is not acceptable). Reference `styles.css` 605-621.

**H8 Contact lenses** [`S2rDVNy0FL` callout] - Feature: `photo-as-528233245-1` on the left 78 % (radial mask from the
right, hard top edge on the seam), `.glass--strong` panel right. Reference `styles.css` 562-570.

**H9 Doctors** [cross-page `/our-doctors/` block 2: kicker, H2, paragraph, H2, team list] - 10.13 (navy intro zone with
the paragraph as a Statement on navy, P-row cards with 150 px portraits rising into the navy).

**H10 Insurance** [cross-page `/insurance/`: H2 "Insurance Plans We Accept", the block-0 paragraph "Insurance can feel
confusing...", the "Contact Us" button, the 12-plan list] - `.glass--tint` panel over a full-bleed `tex-cream-light`
band (R-5), chips 4 columns. Reference `styles.css` 665-680.

**H11 Reviews** [cross-page `/reviews/` reviews node] - band whose photo plane is the `loop-lens-light` video (poster
`loop-lens-light-poster.webp`, plays <= 5 s per entry, §7.4); a `.glass--veil` panel with the featured quote set as a
statement (Libre Baskerville Italic, `clamp(1.6rem, 1.1rem + 1.6vw, 2.6rem)`), stars, "Lisa M." and its date; two small
`.glass--strong` review cards; "Reviews" arrow link. Phone: featured quote, then the two cards stacked.

**H12 Blog** [`blog-sec` callout, cream; seam band `blog-div` at its top] - H2 "Get Expert Eye Care Tips *From Our
Doctors*" centred, then the post card (10.22) with `photo-family-sitting-on-bed` (people in the lower half:
`object-position: 50% 62%`) 96 px taller than the card (P-frame).

**H13 Visit** [cross-page `/eye-doctor-pine-beach/` block 2: H1 -> `h2` "Local Eye Doctors in *Pine Beach, New
Jersey*", both paragraphs, Call + Book (Book first)] (G1) - a `.glass--strong` visit card (left 7 columns) over
`tex-cream-light`, overlapping the navy footer by 120 px (P-straddle); on the right, the two **print postcards**
(10.21: mural 400 px, night sculpture 360 px, tilted 3 / -4 deg) rising out of the footer across its top edge
(P-frame; container `margin-top: calc(-1 * clamp(150px, 14vw, 210px))` relative to the footer top, b-navy
`styles.css` 567-574). Phone: card, then the postcards stacked and overlapping each other, rising into the footer.

Phone page length budget: **<= 13,500 px at 390x844** (R-10; prototype 14,988, b-navy 13,453, c-iris 11,990,
*designer captures*).

---

## 13. Image treatment

### 13.1 Sources and alts
- Model images: `ctx.img(node.file, { alt: node.alt, ... })`, alt verbatim (build-verify a). The prototype rewrote two
  alts ("microscope" -> lensmeter, "thermometer" -> contact lens); the build MUST NOT (O3).
- Cross-page images (home sections, postcards, kids band): the source alt of that master.
- Decorative (textures, loops, cut-outs, seam band): `alt=""`, wrapper `aria-hidden="true"`.
- Generated: only image-plan slots / `assets/generated/` files through ctx (they get `data-ai-generated="1"` and the
  XMP label from the pipeline). People in generated heroes are generic models and are never presented as staff or
  patients (no captions, alts as written in the plan).

### 13.2 Sizes and loading
| use | `sizes` | widths | loading |
|---|---|---|---|
| full-bleed photo plane | `100vw` | pipeline default up to the source width | first screen: `eager` + `fetchpriority="high"` + `<link rel=preload imagesrcset>`; else `lazy` |
| half-bleed / feature | `(min-width: 900px) 64vw, 100vw` | default | lazy |
| eye window | `(min-width: 1024px) 60vw, 100vw` | default | lazy |
| cards | `(min-width:1024px) 380px, (min-width:768px) 46vw, 96px` | default | lazy |
| portraits | `150px` | `[150, 300]` | lazy (contract §4.10) |
| postcards | `(min-width:1024px) 400px, 70vw` | `[400, 800]` | lazy |
| logos (insurance, frames) | `160px` | `[200, 400]` | lazy |
| cut-outs | by object width, e.g. `(min-width:1024px) 29vw, 50vw` | default | hero: eager; else lazy |

The home hero source is 1600 px wide: the photo plane is capped at `max-width: 1440px` (anchored right) so it is not
stretched past ~1.2x at the operator's 1600x662 (DPR 1.2) window. No AI upscaling of Academy Vision photos.

### 13.3 Masks and frames
Dissolve (mask fades) only on edges nothing crosses; lens edge (`--r-lens-edge` on the inner side); arch (`--r-arch`);
circular lens (glass ring + scaled image); eye window (SVG almond); print postcard; card photos (radius 20, popping
out). Every framed photo gets an inner 1 px white highlight (`inset 0 0 0 1px rgba(255,255,255,.75)`).

### 13.4 Object positions (from `image-masters.json` `crop` notes)
Hero glow woman `62% 32%`; exam (about) `58% 32%`; family (eye window) `50% 40%`; eye drops (dry eye) `64% 36%`;
kids band girl `50% 28%`; library (myopia) `60% 30%`; lensmeter (arch) `60% 50%`; sofa (contacts) `50% 30%`; family on
bed `50% 62%`; generated adopted heroes `70% 45%` (subject in the right third); `/reviews/` lens still `66% 40%`;
title-band half photos keep `50% 40%` (their own aspect, so little is cropped). Every placement is checked at
1280x585, 1440x900, 1600x662 and 390x844 for faces cut or covered.

### 13.5 Flagged source photos (from `image-masters.json` flags)
| master | flag | treatment |
|---|---|---|
| `practice-35051-15ef8052` | sign prints 732-736-1700 (second number, open decision C1) | 1:1 frame, `object-position: 30% 50%`; verify no digits legible |
| `photo-as-527484728` | in-frame "FLU ..." poster | crop the poster out (frame aspect + position); verify |
| `photo-as-558091528` (`/services/medical-eye-care/`) | glucose meter shows "4.8" | crop the meter out; verify |
| `photo-as-504084199` | implies a before/after result | render as the source does; never caption, label or pair it as before/after |
| `photo-2020-04-06` | duplicate of `practice-35050-f516a054` (800 px) | render the 800 px master with the model's alt |
| `practice-35053-c2274987` | comic, removed by the pipeline | never referenced (ctx.img refuses it) |
| alt mismatches (`photo-ss-2143953341`, `photo-as-467908372`, the two above) | wrong source alts | alts stay verbatim (O3) |

### 13.6 Generated asset assignment (all from `assets/generated/`, accepted by IMAGERY)
| asset | where |
|---|---|
| `cut-eyeglasses-tortoise` | home hero cut-out; Designer Frames thumbnail; designer-frames split. Check its lens interior on the real backdrop: this review saw an irregular veil with holes at 1:1 on a dark composite (O6) |
| `cut-sunglasses-navy` | home eyewear seam; Sunglasses thumbnail |
| `cut-eyeglasses-navy` | kids band fallback (O5); title bands of product pages (`/products/`, Varilux, Avulux, Stellest, kids' eyewear) |
| `cut-sunglasses-aviator` | sunglasses title band and split |
| `cut-contact-lens` | title bands of contact-lens pages (exams, scleral, ortho-k, toric, GP, multifocal, same-day, children's contacts, `/products/contact-lenses/`); Contact Lenses thumbnail |
| `cut-trial-lens` | title bands of exam pages (comprehensive, adult, senior, pediatric, back-to-school, `/services/`) |
| `cut-lens-blank` | title bands of medical pages (medical eye care, dry eye, glaucoma, diabetic, macular, cataract, LASIK, emergency group) |
| `cut-reading-glasses` | senior exams split |
| `tex-cream-light` | texture and postcard title bands, insurance band, visit band, `/terms/` |
| `tex-navy-glass` | doctors navy zone (25 %), adopted `callout` notices, Stellest navy block |
| `tex-blue-caustics` | available for navy/blue bands without a photo (at <= 35 % under a navy overlay); not on the home |
| `still-loop-lens-light` / `loop-lens-light` | `/reviews/` title band (still); home H11 (video) |
| `loop-navy-glass` | home footer and every CTA band (video <= 5 s); poster in other footers |
| `hero-<slug>` (21 accepted) | adopted title bands; `hero-glaucoma-management` missing -> texture variant |
No cut-out on legal, sitemap, form, bio, about or doctors pages (keep them calm). One title-band cut-out per page, and
none when the page's adopted `split` section already uses the same slot (adult exams, sunglasses and children's contact
lenses would otherwise show the same object twice).

---

## 14. Grafts: what to build, and the code to read

| id | build | reference code |
|---|---|---|
| G1 | §12 H13 + 10.21 | `tmp/panel/b-navy/styles.css` 563-576 (`.visit`, `.postcards`, `.postcard--a/b`), `index.html` 372-375 |
| G2 | §12 H1 + 10.16 | `tmp/panel/b-navy/styles.css` 398-411 (`.hero__card`, `.loc-card__*`), `index.html` 122-125 |
| G3 | 10.27 + 10.1 | `tmp/panel/c-iris/styles.css` 140-152 (eyebrow iris), 463-473 (`.eyewin*`), 211-221 (`.lens` disc); `index.html` 194-201 |
| G4 | §12 H5 | `tmp/panel/b-navy/styles.css` 437-444 (`.services-intro` photo + smoked panel), 238-254 (smoked glass) |
| G5 | §12 H3, H9 + §6.4 | `tmp/panel/b-navy/styles.css` 480-494 (`.cards-band` 46 % navy/cream stop, `.card__media` -64 px) |
| G6 | 10.9 | `tmp/panel/c-iris/styles.css` 581-588 (`.cause__body .lead`, `.mark`) |
| G7 | §9.6 | `tmp/panel/b-navy/styles.css` 740-769 (header below 1080) |
| G8 | §9.5 | `tmp/panel/c-iris/site.js` 56-94, `styles.css` 717-734 |
| G9 | §9.3, 10.17, §5.6 | `tmp/panel/winner/styles.css` 352-386, 530-548, 1016-1030 |

---

## 15. Build requirements from the judges' winner defects (and the brief)

| R | source | requirement | acceptance |
|---|---|---|---|
| R-1 | brand (high) | Real-place layer on the home: mural and night-sculpture postcards rising out of the footer; "Located at Pine Beach" card across the hero seam; "Located at Pine Beach" also in the drawer | both photos and the label present in `dist/index.html`; geometry probe shows both postcards and the card crossing their seams |
| R-2 | brand (high) | Reviews: nav "Reviews" -> `/reviews/`; `/reviews/` shows all 20 verbatim with author and date, Show More on 12, carousel UI labels from `ui`; home shows 3 verbatim reviews | no `href="#"` in any nav; 20 `blockquote`s on `/reviews/`; build-verify (a) green |
| R-3 | brand (medium) | Navy weight and action blue: dark-navy pixel share 15-25 % on the home full-page capture at 1440 (method of `tmp/judge-brand/palette-share.mjs`: L < 0.07 and b > r; prototype 8.7 %, live 18.5 %); `.btn--primary` `#3974a0`, hover/focus `#0f2a4a` | palette-share run; computed styles of the primary button |
| R-4 | brand (medium) | Logo widths per §9.1 (>= 200 at >= 1240, >= 160 at 380-1239, <= 228); footer logo in its own colours on a light plate | `getBoundingClientRect` at 1440, 1280, 390; pixel check of the logo inks vs `assets/brand/logo-master.png` |
| R-5 | brand + craft (medium) | Glass reads as glass: backdrop luminance range >= 0.10 behind every text-bearing panel, or the panel straddles a seam (§5.4) | panel-hidden captures, p95 - p05 per panel |
| R-6 | brand + craft (medium) | Hover-opened menus set `aria-expanded="true"`; CSS hover opening only without JS | pointer hover then read the attribute, all four disclosures |
| R-7 | ux + craft | Modal phone drawer (§9.5): focus in, trap (0 escapes in 40 Tabs), scrim, scroll lock, Esc and scrim close, focus returns, `inert` background | scripted keyboard run at 390x844 (adapt `tmp/judge-ux/drawer2.mjs`) |
| R-8 | ux | Mega menu: links >= 14 px, heads >= 16 px, panel bottom <= innerHeight - 24 at 1280x585 and 1366x600, no link wraps at 1240-1600 | adapt `tmp/judge-ux/megafit.mjs` |
| R-9 | ux (+ brief) | H1 and Book CTA inside the first screen below the header at 1280x585, 1600x662 and 390x844 on every template with a title-band CTA (prototype service CTA was 818-870 at 390, *judge-measured*) | bounding boxes per template, longest H1 page included |
| R-10 | ux + craft (low) | Home <= 13,500 px tall at 390x844 | `document.documentElement.scrollHeight` |
| R-11 | ux (c-iris finding, generalised) | Book Appointment is the filled primary and comes first in every group; Call is secondary | DOM order + computed background of each group |
| R-12 | ux (c-iris finding, generalised) | Paragraph text >= 16 px everywhere; UI text >= 14 px; meta >= 13 px; eyebrows >= 12 px | computed font-size histogram per page |
| R-13 | ux (c-iris finding, generalised) | Nothing sticky slides under the header; no sticky headings; `scroll-padding-top` = header + 16 | sample every 40 px of scroll at 1280x585 (adapt `tmp/judge-ux/sticky.mjs`) |
| R-14 | ux (lint) | Distinct landmark labels (Main / Mobile / Breadcrumb / Footer) | axe-style lint |
| R-15 | ux graft | Book pill in the phone header; fits at 360 with no overflow | 360x740 and 390x844 measurements |
| R-16 | ux graft (kept) | Six service cards on the home; compact mega; `prefers-reduced-transparency` and `forced-colors` rules present | DOM + emulation |
| R-17 | craft (medium) | Lower half not flat: doctors on a navy edge, team intro as designed type, insurance over texture, reviews over the loop, blog photo breaking out | R-5 measurements on H9-H13 |
| R-18 | craft (medium) | Protrusions cross hard edges, >= 40 px desktop / 24 px phone, off text at the 9 sizes, off faces (§6.4) | overlap probe with positive control (adapt `tmp/panel/b-navy/qa/overlap.mjs`) |
| R-19 | craft (low-medium) | Contrast measured per text colour including links: p05 >= 4.5 (3.0 large) and worst >= 4.0 (§5.3) | painted-pixel probe (adapt `tmp/panel/c-iris/qa/contrast.mjs`) |
| R-20 | craft (low-medium) | Esc closes open menus and the drawer | keyboard run |
| R-21 | craft (low) | Phone weight: compact cards and doctor rows on phones | R-10 |
| R-22 | brief + build-verify | Verbatim copy only (§2.4); source alts unchanged | build-verify (a)(a3); verbatim probe with a planted invented sentence as control |
| R-23 | build-verify | Every model node and image rendered inside `<main>` | build-verify (a) |
| R-24 | contract §4.10 | Doctor portraits <= 150 CSS px wide (supersedes the prototype's 196 px) | bounding boxes |
| R-25 | contract | Images only via ctx refs under `assets/`; no `tmp/` paths in dist | link-check; grep |
| R-26 | WCAG 2.2.2 | No autonomous motion over 5 s (pools scroll-linked, no bob, loops <= 5 s, no marquee) | after 6 s idle every entry of `document.getAnimations()` is finished, paused, or driven by a `ScrollTimeline`/`ViewTimeline`; every `<video>` is paused |
| R-27 | BRAND §7.3 | No synthesised serif bold/italic; the italic file ships | `document.fonts` shows the italic face loaded; `font-synthesis: none` |
| R-28 | contract §4.13 | Third-party requests: only the lazy map iframe and scheduler links | network log of 5 pages |
| R-29 | contract §4.5 | Forms unwired: submit disabled in markup, enabled by JS, submission stopped | browser check on both forms |
| R-30 | brief | Hover feedback mirrored on `:focus-visible` for buttons, nav, menu links, cards, images | Tab walk + computed styles |
| R-31 | brief | No horizontal overflow at the 11 widths of §4.3 (real scrollbar at 1280 and 1600) | `scrollWidth == clientWidth`, clip-aware rect scan |
| R-32 | brief | Reveals never leave content hidden: 0 elements at opacity < .05 after a full scroll, after a mid-page jump (1.3 s), with a dead observer (3.6 s), under reduced motion and without JS | adapt `tmp/judge-ux/reveal.mjs` |

---

## 16. Acceptance (how the builder proves it)

Run on `dist/` served by `node tools/serve.mjs --root dist --port <p> --no-open` (stop it by PID), one foreground
headless Chrome at a time (`tools/cdp.mjs`, `tools/cdp-realsb.mjs` for real-scrollbar runs, `tools/shoot.mjs` for
captures). Pages to cover at minimum: `/`, `/services/dry-eye-treatment/`, `/services/childrens-contact-lenses/`
(longest H1, adopted), `/services/glaucoma-management/` (missing hero slot), `/services/`, `/products/`, `/about-us/`,
`/our-doctors/`, `/our-doctors/dr-marc-ullman-od/`, `/eye-doctor-pine-beach/`, `/reviews/`, `/insurance/`,
`/patient-forms/`, `/privacy-policy/`, `/sitemap/`, `/eye-health/pediatric-eye-exams-beyond-school-screenings/`, 404.
Viewports: 1280x585 and 1600x662 (real scrollbar), 1440x900, 390x844 (mobile emulation), plus the overflow widths.
Every probe needs a positive control that fires (a planted overlap, a planted invented sentence, a planted low-contrast
colour, a planted hidden element). Keep the four pipeline proofs green: `node src/build.mjs` twice +
`node tools/hashdir.mjs`, `node tools/link-check.mjs`, `node tools/build-verify.mjs --control`.
Reusable probes (read-only references, copy into your own `tmp/<role>/`): `tmp/judge-ux/{megafit,drawer2,sticky,
phone,reveal,contrast,lint}.mjs`, `tmp/judge-brand/{palette-share,logo-check,verbatim}.mjs`,
`tmp/panel/b-navy/qa/{check,overlap,contrast,verbatim,details}.mjs`, `tmp/panel/c-iris/qa/{qa,contrast,verbatim}.mjs`.

---

## 17. Reference implementation: `tmp/panel/winner/`

An exact copy of `tmp/panel/a-bayside/` made by the design lead (86 files, 35 MB; tree hash of sorted per-file sha256
`f03663be38ae87d8f35b1a79945ba3b6b23eb0630068489d1f9b297cca248f97`, identical for both folders). Static, vanilla,
relative paths: serve the folder and open `index.html`.

| file | reference for | superseded by this spec |
|---|---|---|
| `styles.css` | fonts (lines 8-23), tokens (25-86), base and focus (88-135), type and accents (137-189), ambient pools (191-205), glass (207-224), buttons (226-270), header, mega, dropdowns, drawer (272-461), shared depth pieces (463-469), hero (471-492), about straddle (494-507), services band + cards (509-548), feature (550-570), statement (572-588), split (590-603), arch + cut-out (605-621), team (623-665), insurance (667-680), post card (682-698), visit (700-710), footer (712-745), title band + crumbs (747-765), rich text + drop cap (767-777), symptoms chips + lens (779-814), options (816-835), CTA band (837-871), related (873-875), motion (877-904), responsive (906-1009), fallbacks (1011-1035) | primary button colour (R-3), logo width (R-4), menu/bar alphas (§5.5), mega layout (§9.3), drawer (§9.5), nav threshold 1180 -> 1240 (§4.2), portrait 196 -> 150 px (R-24), infinite pool drift and cut-out bob (R-26), `--glass-strong-b` .70 -> .78, title-band lede in the panel (§10.5), red eyebrow hairline -> iris bullet |
| `site.js` | header state (13-17), menus (19-61), drawer details/scroll lock (63-76), reveals + fail-safes (78-129), parallax (131-166) | hover intent + `aria-expanded` (R-6), modal drawer (R-7), video loop control (§7.4) |
| `index.html` | home section order, classes, data attributes (`data-reveal`, `data-stagger`, `data-depth`, `data-depth-max`, `data-menu`, `data-mnav`, `data-header`) and verbatim copy placement | menu items and hrefs (`#` placeholders -> `ctx.nav`), Reviews `#`, added sections H1 card, H3 eye window, H5 photo band, H9 navy edge, H11 reviews, H13 postcards (§12); prototype alts for the lensmeter and sofa photos |
| `service.html` | interior template: title band, breadcrumbs, rich text, symptoms chips + lens, split, option cards, CTA band, related | lede moved to the lede card (§10.6), the omitted `photo-ss-2143953341` restored (R-23), button order (R-11), droplet band replaced by the Statement (§10.9) |
| `NOTES.md` | concept, token table, depth ladder, protrusion table, motion and hover systems, measured contrast, generation log | measurements are the prototype's own (*designer-measured*) |
| `fonts/libre-baskerville-italic-400-latin.woff2` | the italic face to ship (§3.3) | copy into `assets/fonts/` |
| `fonts/*` (other four) | subset copies of the brand fonts | use `assets/fonts/` originals |
| `img/*.webp`, `img/ins/*`, `img/logo*.png` | which source photo went where (masters in §13.4 and §12) | build from `assets/source` via ctx, never from here |
| `img/cut-*.webp`, `img/caustics.webp`, `img/droplet.webp`, `img/gen/*` (+ `.json` sidecars) | the prototype's fal generations | not build inputs; IMAGERY may import `img/gen/kids-frames.*` and `img/gen/glasses-tortoise.fixed.png` (O5, O6) |
| `shots/*.png` | baseline captures (first screens 1280x585 / 1600x662, full pages 1440 / 390, menu, hover, focus, protrusion details) | |

Graft references stay in their own folders (§14); they were not copied.

---

## 18. Open items and UNVERIFIED

- **O1** The reversed logo knockout is not needed by this spec (footer uses the original on a light plate); its practice
  approval is no longer blocking.
- **O2** `assets/fonts/libre-baskerville-italic-400-latin.woff2` must be added by THEME core (BUILD-NOTES entry). The
  roman files' version is not recorded; a small metric difference against the italic's 2.005 is possible (UNVERIFIED).
- **O3** Wrong source alts (lensmeter "microscope", eye-drop photo "thermometer", "nose swabbed", "brushing her teeth")
  are model text and stay verbatim; correcting them needs a declared pipeline edit and the practice.
- **O4** The first source review's author shares the owner's surname (relationship UNVERIFIED); it is not featured on
  the home teaser and stays on `/reviews/` as decision 9 requires.
- **O5** No kids' frames cut-out exists in `assets/generated/`; fallback `cut-eyeglasses-navy`. Importing the
  prototype's reviewed `img/gen/kids-frames.*` (sidecar with the fal request) is an orchestrator/IMAGERY decision.
- **O6** `cut-eyeglasses-tortoise`: this review saw an irregular lens veil with transparent holes at 1:1 on a dark
  composite (Read of `assets/generated/cut-eyeglasses-tortoise.png`). Verify on the actual hero backdrop; fallback is an
  IMAGERY import of `tmp/panel/winner/img/gen/glasses-tortoise.fixed.png`.
- **O7** `hero-glaucoma-management` has no accepted image (`audit/generated-images.json` `unacceptedImages`); the
  texture variant covers it.
- **O8** The craft judge's "drawer ignores Escape" result may be a measurement artefact (children of a closed `<details>`
  keep computed `visibility: visible`); moot because the drawer is rebuilt, but acceptance uses `checkVisibility()`.
- **O9** Deliberate departures from `docs/BRAND-SYSTEM.md`, all present in the prototype and scored brand 8-9 by the
  judges: mixed-case display headings (§7.1.3), the swoosh and seam band instead of the 100x5 px rule under headings
  (§7.1.5), pill buttons (§7.2 suggests <= 6 px), and the measured glass-contrast gate instead of the alpha >= .88 veil
  (§7.3). Orchestrator to confirm.
- **O10** The 404 heading "Page not found" is a declared non-Academy-Vision UI string.
- **O11** Only Chrome was tested in the prototype; Safari and Firefox `backdrop-filter`, `mask-composite`, scroll
  timelines and `:has()` fall back as specified but are UNVERIFIED.
- **O12** The crops in §13.5 (second phone number, "FLU" poster, glucose reading) need a visual check in the build.
