# Academy Vision: brand system for the redesign

This is the brand a total redesign must keep, measured from the crawled Academy Vision site (31 pages, PatientEngage platform). It was written by the BRAND lane on 2026-10-08.

Scope: the logo, computed styles, palette, type, imagery, voice, and guardrails with a contrast-checked token set. It does not copy anything from Eye Trends. Pages that come over from the Eye Trends structure must be written in the Academy Vision voice described in section 6.

**How to read the evidence.** Each claim carries one or more pairs written as a backticked path, then the › sign, then a backticked verbatim quote. The path is relative to the workspace root (`C:/Users/Dell/academyvisionnj-reforge`). A path ending `#<page>.html` means the quote sits in that page's record of `audit/content-inventory.json`. Measured numbers come from the lane's scripts and their outputs in `tmp/brand/`, listed in the Appendix. Statements marked "verifier" come from the independent re-measurement in `tmp/verify-brand/`, described in the Verification record at the end. **UNVERIFIED** marks anything not proven this run.

---

## 0. The brand on one screen

1. **Logo.** An eye symbol plus a two-line wordmark ("ACADEMY" in a bold serif over "VISION" in a tracked sans). It uses exactly three inks: `#0f2a49`, `#082240` and `#4488bb`. The background is transparent, with no white plate. The master is now `assets/brand/logo.png` (457×98). It cannot be used on navy as it stands; a reversed version is needed (§1.7).
2. **Navy `#0f2a4a` is the anchor surface.** It is the footer on every page, the full-width CTA band, the hover fill of every button but one (189 of the 190 `.button:hover` rules; the white-outline button on the home page's navy band hovers maroon) and the wordmark ink. Headings are split: component headings (the large majority) render **black**, while rich-text headings render **navy** (15 headings on 5 pages, §2.2). Unifying all headings on navy is allowed (§7.2).
3. **Light surfaces alternate cream `#f9f4f0` and white.** The header is always cream.
4. **The blue family.**
   - `#3974a0` is the action colour: filled CTA and button borders.
   - `#4489bc` (the logo's blue) is the accent: links and a 100×5 px rule under headings.
   - As link text, `#4489bc` fails AA (3.78:1 on white).
5. **Type.** Libre Baskerville 400, uppercase, line-height 1, for every heading. Montserrat (a variable font, 100–900) for everything else. The root size is 20 px and the body is 20/32.
6. **A 15 px segmented navy, blue and white divider band** separates sections across the site. It is a signature motif.
7. **UI vocabulary.** Square buttons (radius 0) with 1 px borders, 10 px-radius tiles, 50 px round icons and almost no shadows.
8. **Imagery.** Bright, daylight stock photos of smiling, diverse patients, families and clinical moments (74 stock-style images, 67 of them named AdobeStock or Shutterstock). Alongside them, a small set of real photos: team headshots, plus a quirky local building with murals and a sculptural eye.
9. **Voice.** Second person, conversational and reassuring, with heavy use of local place names. History is stated plainly ("founded in 1984"). There are no hype superlatives.

---

## 1. Logo

### 1.1 Every logo variant in the crawl

| # | File (local) | Pixels, format | Where the site uses it | Evidence |
|---|---|---|---|---|
| A | `assets/brand/logo.png` (copied by this lane from the master, see 1.6) | 457×98 PNG, 8-bit RGBA | The platform master behind the header `srcset`. The `<img>` declares its size. | `audit/raw/index.html` › `alt="Academy Vision Logo with Eye Design" width="457" height="98"` |
| B | `assets/source/f7e5ab0f-Academy-Vision-Logo.png-w_400.webp` | 400×86 WebP (alpha) | Header logo. This variant is the one Chrome picked at 1440 px. | `tmp/brand/computed.json` › `Academy-Vision-Logo.png@w_400.webp` |
| C | `assets/source/044684cd-Academy-Vision-Logo.png-w_300.webp` | 300×64 WebP (alpha) | Header `src` fallback | `audit/image-inventory.json` › `Academy-Vision-Logo.png@w_300.webp` |
| D | `assets/source/b66f47f7-d387ecd85d714da182b1b678a6cc7efd.png` | 1200×267. Despite the `.png` name it is a **WebP** (VP8X + ALPH + lossy VP8). | JSON-LD `logo` / `image` on all 31 pages. It is never shown on screen. | `audit/raw/index.html` › `"logo": "https://cdn.patientengage.cloud/external/storage.googleapis.com/ecp-samurai/41019/d387ecd85d714da182b1b678a6cc7efd.png"` |
| E | `assets/source/4213283b-Academy-Vision--Favicon.png` | 200×200 PNG (alpha), eye symbol only | Favicon | `audit/raw/index.html` › `Academy-Vision--Favicon.png` |
| F | `assets/source/9c9a2a7e-Logo-trans.png-w_400.webp` | 400×80 WebP (VP8X + ALPH + lossy VP8) | The **legacy red mark** as a transparent file: a red eye with a white sunburst iris and "Academy Vision" in a red mixed-case serif (dominant ink about `#cf3a43`). It is declared as `logo` and `image` in the home page's second JSON-LD block (`"@type": "Optician"`), on the home page only, and is never shown on screen. Added by the verifier (see §1.8). | `audit/raw/index.html` › `"logo": "https://cdn.patientengage.cloud/sites/e752392a-0da3-46cc-8c49-9c11718cae49/live/media/019d2b22-137c-7264-9a92-ea4574dc4f75/Logo-trans.png@w_400.webp"` |

- **Footer.** The footer has no logo. The only image there is an award badge: `audit/raw/index.html` › `alt="Who's Who Honorees 2023 Marquis 125 Years Logo"`.
- **Social image.** The home page has no `og:image` meta (0 matches). A check of all 31 pages found it on 13 service and lens pages. Each points at that page's own stock photo, and none uses a logo: `audit/raw/eye-care-services-dry-eye-treatment.html` › `property="og:image" content="https://cdn.patientengage.cloud/sites/e752392a-0da3-46cc-8c49-9c11718cae49/live/media/019d4a9a-d89c-7164-ad65-5727a68d818c/AdobeStock_119858990.jpeg"`. The other 17 pages have none.

### 1.2 The mark (looked at with Read: files A, B, D and E)

**The symbol is a stylised eye, drawn left of the wordmark:**
- A thick navy brush-like arc forms the upper lid and tapers at both ends.
- A mid-blue crescent forms the lower lid and the inner corner, curving up around the iris.
- The iris is a solid navy disc with a small round catchlight at its upper right.
- The catchlight is a **transparent knock-out**, not white paint. The flood fill found one enclosed transparent region inside the symbol, 8×9 px when alpha < 128 counts as clear (6×8 px if only alpha ≤ 8 counts): `tmp/brand/logo-holes.json` › `"region": "symbol"`.

**The wordmark has two stacked lines:**
- "ACADEMY" is set in a high-contrast bold serif in navy.
- "VISION" is set in a smaller, widely tracked geometric sans in the logo blue.

The typefaces inside the logo are **UNVERIFIED**. "ACADEMY" resembles the Baskerville family used for headings, but the site only ships Libre Baskerville Regular (§4.1), so the logo serif is not a site font.

### 1.3 Measured inks (lossless master A)

Method: every pixel with alpha ≥ 250 was counted by exact sRGB value. The lane read the pixels through canvas `getImageData` in headless Chrome. The verifier re-counted them from the decoded PNG bytes, without a canvas, and found exactly three distinct solid colours. The image was split at the measured gaps: symbol x < 150, wordmark x > 175, and the ACADEMY/VISION row gap at y 52–63.

| Ink | Hex | Where | Share of solid ink pixels (6,397) | Evidence |
|---|---|---|---|---|
| Wordmark navy | `#0f2a49` | "ACADEMY" (100% of that region) | **44.40%** | `tmp/brand/logo-inks.json` › `"colourRegion": "#0f2a49 ACADEMY"` |
| Symbol navy | `#082240` | Upper lid and iris | **28.14%** (1,800 px). A canvas read shows 6 of these, the alpha-253 edge pixels, as `#08223f`. That is premultiplied-alpha rounding, not a fourth ink. | `tmp/brand/logo-inks.json` › `"colourRegion": "#082240 symbol"` |
| Logo blue | `#4488bb` | Lower-lid crescent (1,163 px) and "VISION" (594 px) | **27.47%** | `tmp/brand/logo-inks.json` › `"colour": "#4488bb"` |

- **Two navies.** The symbol navy `#082240` is darker than the wordmark navy `#0f2a49`. The favicon uses the symbol navy: `tmp/brand/logo-inks.json` › `"colourRegion": "#082240 symbol"` (61.04% of the favicon's solid ink, 2,903 px; the rest is `#4488bb`).
- **The site CSS reuses the logo inks.** The CSS navy `#0f2a4a` is the wordmark ink plus one blue step. The CSS link blue `#4489bc` is the logo blue plus one step on green and blue: `tmp/brand/navy-split.json` › `"#0f2a49 100.0%"`.
- **Lossy derivatives shift the colours.** The 400w WebP reads the navy as `#08213f` and adds a light-blue fringe that is absent from the master (`#6aaddf`, 4.32%): `tmp/brand/logo-pixels.json` › `"modeHex": "#6aaddf"`. Take colours from the PNG master, never from the WebPs.

### 1.4 Geometry

- **Canvas.** 457×98, aspect **4.663:1**: `tmp/brand/logo-pixels.json` › `"aspect": 4.663`.
- **Ink box and padding.** The ink box is 430×77 (aspect 5.584), with about 10–15 px of transparent padding built into the file: `tmp/brand/logo-1200.json` › `"aspect": 5.584`.
- **Symbol and wordmark.** The symbol takes 32% of the ink width: `tmp/brand/logo-1200.json` › `"symbolShareOfInkWidth": 0.321`.
  - Symbol: x 12–149. Wordmark: x 176–441.
  - Vertical gap between "ACADEMY" and "VISION": rows 52–63. "VISION" occupies rows 64–84 (alpha ≥ 16), which is 21 px, about 21% of the logo height. Row 86 is the bottom of the whole ink box, set by the symbol.

### 1.5 Background: transparent, no white plate

- **Master.** All four corners have alpha 0. 79.12% of pixels are fully transparent, 6.85% are anti-aliased partial alpha, and 0% are opaque white:
  - `tmp/brand/logo-pixels.json` › `"pctTransparent": 79.12`
  - `tmp/brand/logo-pixels.json` › `"whiteOpaquePct": 0`
- **Other files.** The 400w, 300w, 1200 and favicon files are also transparent at the corners: `tmp/brand/logo-pixels.json` › `"tl": [`. Every corner has alpha 0. A canvas reads them as `0,0,0,0`; the PNG bytes of the master and the favicon store transparent white (`255,255,255,0`).

### 1.6 Master chosen and copied: `assets/brand/logo.png`

- **The largest local file is not the best master.** File D (1200×267) is the biggest, but it is soft and lossy.
  - Its alpha edge ramps average **4.89 px** against **1.35 px** for the 457×98 PNG. That is consistent with an upscale (UNVERIFIED as to how it was made).
  - It has no hard edges at all, and its ink-box proportions differ (5.36 against 5.584), so it is a different export.
  - Evidence: `tmp/brand/logo-1200.json` › `"mean": 4.89` and `tmp/brand/logo-1200.json` › `"mean": 1.35`.
- **The lossless master was fetched.** It is the master of the header variants (the inventory's rule: "the master is the URL before `@w_`"). One GET to the CDN, not the origin: `https://cdn.patientengage.cloud/sites/e752392a-0da3-46cc-8c49-9c11718cae49/live/media/01a05d7b-479a-753f-b0c6-20d467274b21/Academy-Vision-Logo.png`. The response was 200 `image/png`, 10,388 bytes, 457×98, colour type 6 (RGBA).
- **It was copied, not moved,** to `assets/brand/logo.png`. sha256 `1f0e11d26fd0d05b4b90c8963d3439fd03299bc18ff1a3879340f1c82c040c5f` matches the scratch copy `tmp/brand/cdn-master-Academy-Vision-Logo.png`.
  - Another process had already placed a byte-identical `assets/brand/logo-master.png` (same sha256, written 09:23, before this lane's fetch). This lane did not create or touch it.
- **Fallback.** If a local-crawl-only provenance is required, use B (400w WebP). It is visually identical but lossy.
- **Wanted from the client.** A vector (SVG) master does not exist in the crawl. UNVERIFIED that one exists at all.

### 1.7 Dark backgrounds: a reversed version is needed

- **The navy inks disappear on navy.** `#0f2a49` on `#0f2a4a` is **1.0:1** and `#082240` on navy is **1.1:1**. Only the blue survives, at 3.78:1:
  - `tmp/brand/tokens.json` › `"use": "logo ACADEMY ink on navy (dark surface)"`
  - `tmp/brand/tokens.json` › `"ratio": 1.1`
- **The catchlight takes the background colour.** On a navy or glass surface it turns navy or tinted (§1.2).
- **The source site never places the logo on dark.** The header is cream and the footer has no logo (§1.1, §2.1).
- **What is needed.** For a dark header, navy footer or dark glass, a **reversed** version is needed: white or cream wordmark and symbol, with the blue kept or lightened. No transparent variant is needed, because the master already is one.
- **Status.** No reversed file exists in the crawl. Ask the practice for an official one. A single-colour white knockout derived from the master is technically trivial, but it changes the approved artwork, so it needs client sign-off (UNVERIFIED approval).

### 1.8 A legacy red mark exists, but it is not the current brand

Photos show an older identity: a **red** circle or rectangle holding a white eye with a sunburst iris, and "Academy Vision" in a white mixed-case serif.
- The event backdrop: `audit/image-inventory.json` › `Three women in front of a red and white Academy Vision backdrop smiling with 2020 glasses`.
- The roadside sign (Read: `assets/source/5d1c89e6-15ef8052-7fea-4029-84c4-493f523216ba-responsive.webp`, inventory alt `Practice Image`). The sign also shows "732-736-1700" (see §8).
- Comic-style artwork (Read: `assets/source/f3f92503-c2274987-a6f1-47bf-8d4c-a1aed76f6878-responsive.webp`).
- A mural of a face wearing a red mask that carries the sunburst eye (Read by the verifier: `assets/source/0c2d78f3-2020-09-03.jpg-w_400.webp`). The same photo is the About hero background, under the dark scrim.
- **A transparent file of the red mark is still in the site's structured data** (file F, §1.1): the home page's second JSON-LD block names it as `logo` and `image`. Its wordmark is red on transparent, not white. `audit/raw/index.html` › `"@type": "Optician"`.

Every logo shown on screen is the navy and blue eye. The red mark survives only in documentary photos and in that one JSON-LD block. Treat it as heritage, never as a palette or logo source, and point the redesign's structured data at the navy and blue master. The maroon `#650705` hover colour (§3.1) may echo the red mark, but that link is UNVERIFIED. The two reds differ: the legacy file's dominant ink is about `#cf3a43`, much lighter than `#650705`.

---

## 2. Computed style (headless Chrome, 1440×900)

**Method.**
- Setup: `tools/serve.mjs --root audit/raw --port 8811` (PID 17640, stopped after use), with one headless Chrome from `tools/cdp.mjs`.
- Pages: `index.html`, `eye-care-services-dry-eye-treatment.html`, `about-us.html` and `insurance.html`. Each was scrolled through and then read with `getComputedStyle`.
- Raw output: **`tmp/brand/computed.json`**, which holds roles, sections, a text-on-background census, fonts and network hosts.
- Blocked: the origin, GTM, Clarity and Maps.
- Requests that went out: `127.0.0.1:8811`, `cdn.patientengage.cloud` (96 requests: `tmp/brand/computed.json` › `"cdn.patientengage.cloud": 96`) and `www.google.com` (4 requests).
  - The `www.google.com` requests are the lazy footer map iframe, which the block pattern did not catch. The verifier's run logged them: every one was a `Document` request for `https://www.google.com/maps/embed/v1/place`, and that is the only auto-loading `www.google.com` URL in the page source. A `Network.setBlockedURLs` pattern for `www.google.com` did not stop this cross-origin iframe document in the verifier's run either.
  - **No request went to www.academyvisionnj.com.** That host is absent from the logged hosts. Positive control: the blocked hosts were logged: `tmp/brand/computed.json` › `"www.googletagmanager.com": 5`.
- Fonts loaded: `tmp/brand/computed.json` › `"Libre Baskerville 400 normal loaded"` and `tmp/brand/computed.json` › `"Montserrat 700 normal loaded"`.

### 2.1 Page skeleton (identical on all 4 pages)

From top to bottom:
1. **Top bar.** White, 94 px tall. A "Located at Pine Beach" link on the left; an outline "Call" button and a filled "Book Appointment" button on the right.
2. **Header.** Cream, 106 px tall. Logo rendered at 270×58 CSS px, plus the menu.
3. **Divider band** (15 px).
4. **Content sections.** White and cream alternate, with an occasional navy band. Divider bands appear between many sections.
5. **Divider band.**
6. **Footer.** Navy, 561 px tall, three columns: Contact Us (with the Marquis badge), Locate Us (a map) and Hours.
7. **EyeCarePro platform footer.** White, 82 px tall.

Evidence: `tmp/brand/computed.json` › `"type": "header-1"` and `audit/raw/index.html` › `theme-background-color{position:absolute;top:0;right:0;bottom:0;left:0;background-color:#f9f4f0}`.

Section surfaces counted over the 4 pages (35 content surfaces, plus 16 divider bands and 4 platform footers):

| Page | white | cream | navy | photo | divider bands |
|---|---|---|---|---|---|
| index | 7 (top bar + 6 callouts) | 2 (header + blog teaser) | 2 (kids' CTA band + footer) | 1 (hero) | 8 |
| dry-eye treatment | 4 | 4 | 1 (footer) | 0 | 2 |
| about-us | 2 | 2 | 1 (footer) | 1 (hero) | 3 |
| insurance | 3 | 4 | 1 (footer) | 0 | 3 |

Evidence: `tmp/brand/computed.json` › `"kind": "navy"`, `tmp/brand/computed.json` › `"kind": "cream"` and `tmp/brand/computed.json` › `"kind": "photo"`.

- **Home hero.** A full-bleed photo with a **white text card** (max-width 600 px) floating over it: `audit/raw/index.html` › `.components{max-width:600px;background-color:#fff}`.
- **About hero.** A photo under a dark overlay, `rgba(46,46,46,0.81)`, with white text: `audit/raw/about-us.html` › `-background__overlay{position:absolute;top:0;bottom:0;left:0;right:0;background:#2e2e2ecf`.
- **Callouts.** A 50/50 image-and-text split, with the image bleeding to the viewport edge and sides alternating (seen in `tmp/brand/shots/index-01.png`).

### 2.2 Role table (computed values at 1440 px)

| Role | Font | Size / line-height | Weight | Transform, spacing | Colour on surface | Evidence |
|---|---|---|---|---|---|---|
| Root | – | 20 px root | – | – | – | `audit/raw/index.html` › `:root{font-size:20px}` |
| body | Montserrat | 20 / 32 px | 400 | none, normal | `#000` on `#fff` | `audit/raw/index.html` › `body{line-height:1.6}`; `tmp/brand/computed.json` › `"lineHeight": "32px"` |
| p (white sections) | Montserrat | 20 / 32 | 400 | none | `#202020` on white (16.29:1) | `tmp/brand/computed.json` › `"color": "rgb(32, 32, 32)"` |
| p (cream sections) | Montserrat | 20 / 32 | 400 | none | `#000` on cream (19.23:1) | `tmp/brand/pairs.json` › `"pair": "#000000 on #f9f4f0"` |
| Eyebrow (kicker above a heading) | Montserrat | 20 / 32 | 400 | **uppercase via CSS**; the source text is Title Case | body colour | `audit/raw/index.html` › ` .content{text-transform:uppercase}`; `audit/raw/index.html` › `<p>You&rsquo;re Not Just Another Appointment Here</p>` |
| h1 | Libre Baskerville | **44 / 44 px** (2.2em, lh 1) | 400 | uppercase, normal spacing | **`#000`** on light; `#fff` on photo or navy | `tmp/brand/computed.json` › `"fontSize": "44px"`; `audit/raw/index.html` › ` .heading{font-family:'Libre Baskerville';text-transform:uppercase;margin:0}` |
| h2 | Libre Baskerville | 44 / 44 | 400 | uppercase | `#000` / `#fff`; rich-text h2 renders **navy** `#0f2a4a` | as h1; `tmp/brand/plain-headings.json` › `"tag": "h2"` |
| h3 | Libre Baskerville | 44/44 on home and about; **40/40** on dry eye and for rich-text h3; **30/30** on the blog-teaser title | 400 | uppercase | `#000` / `#fff`; rich-text h3 renders **navy** | `tmp/brand/computed.json` › `"fontSize": "40px"`; `tmp/brand/computed.json` › `"fontSize": "30px"`; `tmp/brand/plain-headings.json` › `"fontSize": "40px"` |
| Heading rule (motif) | – | 100 × 5 px bar, 10 px below the heading text | – | – | `#4489bc` | `audit/raw/index.html` › `.heading__text:after{content:'';display:block;font-size:0;margin-top:10px;width:100px;height:0;border-top:5px solid #4489bc}` |
| Content link | Montserrat | 20 / 32 | 400 | underline | `#4489bc` on white (**3.78:1, fails AA**). In cream sections, content links render `#000`, underlined (verifier probe: "Academy Vision" on dry-eye and about-us, "eye care in Pine Beach" on insurance). | `audit/raw/index.html` › ` a{color:#4489bc}`; `tmp/brand/pairs.json` › `"ratio": 3.78` |
| Primary button (filled: "Book Appointment") | Montserrat | 20 / 22 px | 400 | none | `#f9f4f0` on `#3974a0` (4.6:1). 1 px `#3974a0` border, radius 0, padding 15/30 px. Hover: `#0f2a4a` fill, cream text. | `audit/raw/index.html` › `.button{background-color:#3974a0;background-image:none;color:#f9f4f0;`; `audit/raw/index.html` › `.button:hover{background-color:#0f2a4a;background-image:none;color:#f9f4f0;` |
| Secondary button (outline) | Montserrat | 20 / 22 | 400 | none | `#000` text, transparent fill, 1 px `#3974a0` border, radius 0. Hover: navy fill, cream text. | `audit/raw/index.html` › `.button{background-color:#faf4f000;background-image:none;color:#000;border-top-color:#3974a0;`; `tmp/brand/computed.json` › `"borderRadius": "0px"` |
| Outline button on navy band ("Pediatric Eye Care") | Montserrat | 20 / 22 | 400 | none | `#fff` text and 1 px white border. Hover: **maroon `#650705`** fill. | `tmp/brand/computed.json` › `"Pediatric Eye Care"`; `tmp/brand/computed.json` › `background-color: rgb(101, 7, 5)` |
| Button padding | – | 0.75em / 1.5em = 15 / 30 px | – | – | – | `audit/raw/index.html` › `padding-top:.75em;padding-bottom:.75em;padding-left:1.5em;padding-right:1.5em` |
| Nav link | Montserrat | **17 / 20.4 px** | 400; **700 for the current page** | none | `#000` on cream (19.23:1) | `audit/raw/index.html` › `.menu{font-size:17px}`; `audit/raw/index.html` › `menu--current>a{font-weight:700}` |
| Submenu | Montserrat | 17 | 400 | none | `#000` on a white panel. Shadow `0 0 5px rgba(0,0,0,.1)`, 1 px `#efefef` separators. | `audit/raw/index.html` › `ul li ul{opacity:1;visibility:visible;display:block;position:absolute;top:100%;left:0;background-color:#fff;box-shadow:0 0 5px rgba(0,0,0,.1)` |
| Top bar | Montserrat | 20 | 400 | link underlined | White background; "Located at Pine Beach" link in `#4489bc` | `tmp/brand/computed.json` › `"text": "Located at Pine Beach"` |
| Header background | – | – | – | – | `#f9f4f0` (cream) | `audit/raw/index.html` › `theme-background-color{position:absolute;top:0;right:0;bottom:0;left:0;background-color:#f9f4f0}` |
| Footer | Libre Baskerville headings at 40 px ("CONTACT US"); 25 px practice name; Montserrat 20 px body; hours labels in 700, capitalised | – | – | uppercase headings | White on **`#0f2a4a`** (14.48:1). Icons: 50 px circles in `#3974a0` with a cream glyph, maroon on hover. | `tmp/brand/computed.json` › `"bgHex": "#0f2a4a"`; `audit/raw/index.html` › `.icon{color:#f9f4f0;background-color:#3974a0}` |
| Platform footer (EyeCarePro) | Montserrat | 13 px | 400 | – | `#757575` on white (4.61:1) | `tmp/brand/computed.json` › `"fontSize": "13px"`; `tmp/brand/pairs.json` › `"ratio": 4.61` |

**Two key facts from the computed pass:**
1. **Heading colour depends on how the heading was authored.** The theme declares navy for `h1–h3` 440 times each across the 31 pages: 408 component-scoped rules, 31 header-menu rules and 1 blog-section rule. `audit/raw/index.html` › `h1:not(.heading){color:#0f2a4a}`.
   - **Component headings** (`<hN class="heading">`, every heading on the 4 measured pages) take the per-component `.heading{color:#000}` and render **black**: `tmp/brand/computed.json` › `"color": "rgb(0, 0, 0)"`. The text census found no navy text at all on those 4 pages (`tmp/brand/pairs.json`).
   - **Rich-text headings** (plain `<h2>`/`<h3>` inside content blocks) render **navy**, uppercase, at 44 px (h2) or 40 px (h3). There are 15 of them on 5 pages: the pediatric article, contact lenses, eye disease management, eyeglasses and hours-location. A second single-Chrome run confirmed this: `tmp/brand/plain-headings.json` › `"color": "rgb(15, 42, 74)"`.
   - So the source is inconsistent. Navy headings are an existing usage, not an invention.
2. **Letter-spacing is `normal` on every role measured** (`tmp/brand/computed.json` › `"letterSpacing": "normal"`). The tracked look of "VISION" exists only inside the logo.

---

## 3. Palette

### 3.1 Role table

- **CSS declarations** were counted in the inline `<style>` blocks of all 31 pages (`tmp/brand/css-census.json`).
- **Rendered text** comes from the census of every visible text node on the 4 measured pages, keyed by text colour and effective background (`tmp/brand/pairs.json`).

| Token (source) | Hex | Role, where used | CSS declarations, 31 pages | Rendered text (4 pages) | Evidence |
|---|---|---|---|---|---|
| Navy | `#0f2a4a` | Footer background (every page), full-width CTA band, base colour under the About photo, the hover fill of 189 of the 190 `.button:hover` rules (the exception is the home navy band's white-outline button, which hovers maroon), icon colour. Matches the logo wordmark ink. | 2,384 on 31/31 pages: color 1,400 (mostly `:not(.heading)` heading rules, which apply only to the 15 rich-text headings), background 228, borders 189×4 | Background only: white on navy, 1,138 chars | `tmp/brand/css-census.json` › `"total": 2384`; `tmp/brand/pairs.json` › `"pair": "#ffffff on #0f2a4a"` |
| Black | `#000000` | Headings, nav, cream-section body, outline-button labels | 2,150 | `#000` on cream 3,441 chars; on white 877 chars | `tmp/brand/css-census.json` › `"total": 2150` |
| White | `#ffffff` | Page background, top bar, most sections, hero card, text on navy and photo | 1,552 | – | `tmp/brand/css-census.json` › `"total": 1552` |
| Action blue | `#3974a0` | Filled CTA, all button borders, footer icon circles | 975 | Cream on action blue, 144 chars (CTA labels) | `tmp/brand/css-census.json` › `"total": 975` |
| Cream | `#f9f4f0` | Header (always), alternating sections (12 of 35 surfaces), CTA and hover label colour | 666: color 584, background 82 | – | `tmp/brand/css-census.json` › `"total": 666` |
| Accent blue | `#4489bc` | Content links and the 100×5 heading rule: 121 `border-top` declarations; the rule's `:after` CSS is on 27 of 31 pages (grep count this run). Matches the logo blue. | 398 | `#4489bc` on white, 188 chars (links) | `tmp/brand/css-census.json` › `"total": 398`; `tmp/brand/css-census.json` › `"border-top": 121` |
| Ink | `#202020` | Body copy in white sections. The most-read pair on the site (4,518 chars). | 261 | `#202020` on white, 4,518 chars | `tmp/brand/pairs.json` › `"pair": "#202020 on #ffffff"` |
| Maroon | `#650705` | **Hover only**: footer and header icons, carousel arrows, one button on a navy band. Never at rest. | 135 | 0 at rest | `tmp/brand/css-census.json` › `"total": 135`; `audit/raw/index.html` › `.icon:hover{background-color:#650705}` |
| Grey | `#757575` | EyeCarePro platform footer: 13 px text and a 1 px rule | 124 | 216 chars | `tmp/brand/css-census.json` › `"total": 124` |
| Hairline | `#efefef` | Menu separators | 62 | – | `tmp/brand/css-census.json` › `"total": 62` |
| Tile border | `#dee4e6` | Insurance, frames, lens and equipment tiles: white, 10 px radius, 1 px border | 4 | – | `audit/raw/insurance.html` › `background:#fff;border-radius:10px;color:#000;padding:1em;border:1px solid #dee4e6`; the same rule appears for `.frames__item` (`eyeglasses.html`), `.lenses__item` (`contact-lenses.html`) and `.equipment__item` (`eye-care-services.html`): `audit/raw/eyeglasses.html` › `.frames__item{display:flex;flex-direction:column;gap:var(--space_3);text-align:center;background:#fff;border-radius:10px;color:#000;padding:1em;border:1px solid #dee4e6}` |
| Photo overlay | `rgba(46,46,46,.81)` | About hero scrim. The doctors page uses an almost identical `#2e2e2ed1` (α .82) twice. | 1 page (plus 1 page at α .82) | – | `tmp/brand/computed.json` › `"bg": "rgba(46, 46, 46, 0.81)"`; `audit/raw/our-eye-doctor.html` › `-background__overlay{position:absolute;top:0;bottom:0;left:0;right:0;background:#2e2e2ed1` |
| Divider band | `#183351` / `#4a8dbf` / white | `Blue-Divider_light.jpg`, 1600×18, used at 15 px. Lossy approximations of navy and blue, in blocks. | 31 pages | – | `tmp/brand/logo-pixels.json` › `"modeHex": "#183351"`; `audit/raw/index.html` › `id-7zXenubtUP{min-height:15px}` |
| Form validation | `#dc2626`, `#eb0000` | Form validation only, on the 2 form pages: `#dc2626` for error text and invalid-field borders, `#eb0000` for the required asterisk | 4 / 2 | – | `audit/raw/appointment-request-form.html` › `.field__error{color:#dc2626;font-size:.875em;margin-top:6px}`; `audit/raw/appointment-request-form.html` › `.field__required{color:#eb0000;margin:0 0 0 5px}` |

### 3.2 WCAG contrast of every text/background pair the source uses

Ratios use WCAG 2.x relative luminance in sRGB. The thresholds are AA 4.5:1 for body text, and 3:1 for large text (≥24 px, or ≥18.66 px bold) and for UI.

| Pair (text on background) | Ratio | Where | Verdict | Evidence |
|---|---|---|---|---|
| `#202020` on `#ffffff` | 16.29 | body in white sections | AA | `tmp/brand/pairs.json` › `"ratio": 16.29` |
| `#000000` on `#f9f4f0` | 19.23 | nav, cream sections, headings | AA | `tmp/brand/pairs.json` › `"ratio": 19.23` |
| `#000000` on `#ffffff` | 21 | headings, outline buttons | AA | `tmp/brand/pairs.json` › `"ratio": 21` |
| `#ffffff` on `#0f2a4a` | 14.48 | footer, navy band | AA | `tmp/brand/pairs.json` › `"ratio": 14.48` |
| `#ffffff` on photo with the `rgba(46,46,46,.81)` overlay | ≥ 7.34 (worst case, over a white photo pixel) | About hero | AA | `tmp/brand/pairs.json` › `"whiteTextWorst": 7.34` |
| `#f9f4f0` on `#3974a0` | 4.6 | filled CTA label, footer icon glyph | AA (narrow) | `tmp/brand/pairs.json` › `"ratio": 4.6` |
| `#f9f4f0` on `#0f2a4a` | 13.26 | button hover | AA | `tmp/brand/tokens.json` › `"use": "button hover: cream text on navy fill"` |
| `#ffffff` on `#650705` | 13.24 | outline-on-navy hover | AA | `tmp/brand/tokens.json` › `"ratio": 13.24` |
| `#757575` on `#ffffff` | 4.61 | 13 px platform footer | AA (narrow); 4.22 if placed on cream | `tmp/brand/tokens.json` › `"ratio": 4.22` |
| **`#4489bc` on `#ffffff`** | **3.78** | 20 px regular content links, top-bar link | **Fails AA** (passes only the 3:1 large/UI bar) | `tmp/brand/pairs.json` › `"pair": "#4489bc on #ffffff"` |
| `#4489bc` on `#f9f4f0` | 3.46 | (if a link sat on cream) | fails AA | `tmp/brand/tokens.json` › `"ratio": 3.46` |
| `#3974a0` border on white / cream | 5.02 / 4.6 | outline-button boundary | UI 3:1 passes | `tmp/brand/tokens.json` › `"ratio": 5.02` |
| **`#3974a0` icon circle on `#0f2a4a`** | **2.88** | footer icons | UI 3:1 **fails** for the circle (the cream glyph itself passes) | `tmp/brand/tokens.json` › `"ratio": 2.88` |
| `#4489bc` rule on white / cream / navy | 3.78 / 3.46 / 3.83 | heading rule | graphic 3:1 passes | `tmp/brand/tokens.json` › `"ratio": 3.83` |

---

## 4. Type

### 4.1 Font files → family, weight, subset

- **Mapping.** Taken from the `@font-face` rules in the raw HTML: `audit/raw/index.html` › `@font-face{font-family:'Libre Baskerville';font-style:normal;font-weight:400;` and `audit/raw/index.html` › `@font-face{font-family:Montserrat;font-style:normal;font-weight:700;`.
- **Variable-font check.** Read from each file's WOFF2 table directory and its name, OS/2 and fvar tables (`tmp/brand/woff2-tables.json`).
- **Subset names** are inferred from each `unicode-range` (standard Google Fonts subsets). That labelling is an inference.

| File (`assets/fonts/`) | Family | Declared weight(s) | unicode-range starts | Subset | File type |
|---|---|---|---|---|---|
| `kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4iDgNP.woff2` | Libre Baskerville | 400 | `U+0000-00FF` | latin | **static Regular** (no fvar, usWeightClass 400) |
| `kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4iAANPjuM.woff2` | Libre Baskerville | 400 | `U+0100-02BA` | latin-ext | static Regular |
| `JTUSjIg1_i6t8kCHKm459Wlhyw.woff2` | Montserrat | 400 and 700 (same file) | `U+0000-00FF` | latin | **variable, wght 100–900** |
| `JTUSjIg1_i6t8kCHKm459Wdhyzbi.woff2` | Montserrat | 400 and 700 | `U+0100-02BA` | latin-ext | variable, wght 100–900 |
| `JTUSjIg1_i6t8kCHKm459WZhyzbi.woff2` | Montserrat | 400 and 700 | `U+0102-0103` | vietnamese | variable, wght 100–900 |
| `JTUSjIg1_i6t8kCHKm459W1hyzbi.woff2` | Montserrat | 400 and 700 | `U+0301,U+0400-045F` | cyrillic | variable, wght 100–900 |
| `JTUSjIg1_i6t8kCHKm459WRhyzbi.woff2` | Montserrat | 400 and 700 | `U+0460-052F` | cyrillic-ext | variable, wght 100–900 |

Evidence:
- `audit/raw/index.html` › `kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4iDgNP.woff2) format('woff2');unicode-range:U+0000-00FF`
- `audit/raw/index.html` › `JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');unicode-range:U+0000-00FF`
- `tmp/brand/woff2-tables.json` › `"tag": "wght"`
- `tmp/brand/woff2-tables.json` › `"hasFvar": false`

What follows from this:
- **Montserrat** at 400 and 700 is real: both rules point at one variable file, and the browser sets the `wght` axis. The redesign may declare it as `font-weight: 100 900` to use 500 or 600 for UI. That is safe because the axis is in the file.
- **Libre Baskerville has no bold or italic file.** Any `font-weight: 700` on it is browser-synthesised. `document.fonts.check('700 …')` returns true only because the single loaded 400 face would be used and faux-bolded, so that check is no proof of a bold face. Keep headings at 400, as the source does. Adding a real Bold requires a new font file; none is in the crawl.
- **Subsets.** The **latin** subset alone covers every character of the 31 pages' copy, including "®" (U+00AE, inside `U+0000-00FF`). The only characters outside it are the ⭐ emoji and its variation selector in patient reviews on the location page, which render from the system emoji font anyway. latin-ext is optional insurance; cyrillic and vietnamese can be dropped. The copy language is English (`audit/content-inventory.json` › `"lang": "en"`).

### 4.2 Scale per role (desktop, measured)

| Role | Family | px (rem at the 20 px root) | Line-height | Weight | Case |
|---|---|---|---|---|---|
| Display / h1 / h2 / most h3 | Libre Baskerville | 44 (2.2) | 1.0 | 400 | UPPERCASE (CSS) |
| Section h3 / footer headings | Libre Baskerville | 40 (2.0) | 1.0 | 400 | UPPERCASE |
| Card title (blog teaser h3) | Libre Baskerville | 30 (1.5) | 1.0 | 400 | UPPERCASE |
| Small serif label (footer practice name) | Libre Baskerville | 25 (1.25) | 1.0 | 400 | UPPERCASE |
| Body, eyebrow, button, link | Montserrat | 20 (1.0) | 1.6 (body), 1.1 (buttons) | 400 (700 for strong text and hours labels) | Eyebrows UPPERCASE (CSS); everything else sentence or Title Case |
| Nav | Montserrat | 17 (0.85) | 1.2 | 400; 700 for the current page | as written |
| Fine print | Montserrat | 13 (0.65) | 1.6 | 400 | as written |

- **Source copy is Title Case.** Uppercase is applied by CSS: `audit/content-inventory.json#index.html` › `Your Eye Doctors in Pine Beach, NJ`. New copy should be typed in Title Case or sentence case and uppercased by style, never typed in capitals.
- **Mobile sizes were not measured** (this lane measured at 1440 only), so they are UNVERIFIED.

---

## 5. Imagery style

**Inventory split** (`audit/image-inventory.json`, 126 content and background masters, deduplicated by name). Counts are in `tmp/brand/image-census.json`: `tmp/brand/image-census.json` › `"mastersContentBackground": 126` and `tmp/brand/image-census.json` › `"stockStyleTotal": 74`.

| Group | Count | Notes |
|---|---|---|
| Stock-style | 74 | 60 `AdobeStock_*` and 7 `shutterstock_*`. 7 more are descriptively named and look like stock: `glow-woman-wearing-designer-frames`, `family-sitting-on-bed`, `woman-wearing-orange-sweater`, `woman-blue-eye-closeup-640`, `pediatric-optometrist-eye-exam`, `customer-shoosing-spectacles…` and `essilor`. Their provenance is UNVERIFIED. |
| Real team headshots | 3 | Dr. Marc Ullman, Dr. Tyler Lesko, Dr. Anthony Giallombardo: `audit/image-inventory.json` › `"Tyler Lesko"` |
| Real practice photos | 4 (location page) + 3 (`2020-*`) files = 6 distinct images | `audit/image-inventory.json` › `"Practice Image"`. The location page's `f516a054-…` is the same photograph as `2020-04-06.jpg` (verifier thumbnail difference 1.13/255, against 48.8 for a different photo). `c2274987-…` is a comic-style illustration, not a photo. That leaves 5 distinct photographs plus 1 illustration. The illustration shows a well-known comic-book superhero (Spider-Man, seen by the verifier), so reusing it needs a rights check. |
| Product and partner art | 7 contact-lens packshots, plus frame-brand and insurer logos | Not lifestyle imagery |

**Looked at with Read.** 14 content images were opened individually, plus the logo files. The first 3 rows below and about 8 more images (eye drops, myopia teen, lab, contact lenses, family on bed, dry-eye man, insurance consult, About mural) were seen in the page captures `tmp/brand/shots/*.png`.

| File | What it shows (my observation) | Inventory alt (verbatim) |
|---|---|---|
| `assets/source/2da160bc-glow-woman-wearing-designer-frames.jpg-w_800.webp` (home hero; seen in `tmp/brand/shots/index-00.png`) | Laughing young woman in glasses, outdoors, bright backlight, warm tones | `audit/image-inventory.json` › `A woman with curly red hair and glasses smiles on a street with blurred backgrou` |
| `assets/source/d8256287-AdobeStock_1343078337.jpeg-w_800.webp` (seen in `tmp/brand/shots/index-01.png`) | Family of three on a sofa at home, all in glasses, soft daylight | `audit/image-inventory.json` › `A family of three, including a man, a woman, and a young girl, are sitting on a ` |
| `assets/source/4a8a0ede-AdobeStock_569060589.jpeg-w_800.webp` (seen in `tmp/brand/shots/index-00.png`) | Older woman during an eye exam, clinical close-up, clean white light | `audit/image-inventory.json` › `An older woman having her eye examined by a male doctor in a white coat` |
| `assets/source/b608fdde-AdobeStock_114077855.jpeg-w_800.webp` | Child at an autorefractor, white seamless background, very high key | `audit/image-inventory.json` › `A young girl with black hair wearing a blue polka dot dress is looking into an e` |
| `assets/source/7b008cbb-AdobeStock_502173011.jpeg-w_800.webp` | Doctor with mother and daughter in a bright consulting room | `audit/image-inventory.json` › `A doctor is talking to a mother and daughter inside a room.` |
| `assets/source/ceb2ae1c-shutterstock_2627315263.jpg-w_800.webp` | Woman trying frames in front of a frame wall, white retail light | `audit/image-inventory.json` › `A woman is standing in front of a wall with eyeglasses on display, smiling and l` |
| `assets/source/9c0ec94e-AdobeStock_1227180789.jpeg-w_800.webp` | Empty exam room: phoropter, chart, black chair, neutral grey walls | `audit/image-inventory.json` › `An eye exam room with an eye chart on the wall and a microscope on a table.` |
| `assets/source/4adbfc81-AdobeStock_472045717.jpeg-w_800.webp` | Macro close-up of a red, irritated eye (condition pages) | `audit/image-inventory.json` › `Close-up view of a person's eye with a red vein, possibly a subconjunctival hemo` |
| `assets/source/0880ffbf-a13c7433-6788-4012-bc37-105722d1a5dc.jpeg` | Real headshot: doctor in a white coat, cut out on white | `audit/image-inventory.json` › `"Marc Ullman"` |
| `assets/source/ba75953f-a16c6b98-de22-4441-9064-dbc2f9cb7f66.png` | Real headshot: suit on a grey studio backdrop | `audit/image-inventory.json` › `"Tyler Lesko"` |
| `assets/source/0b6612e5-a16c6c1f-6ed9-4b4b-9bc8-2390b661770c.png` | Real headshot: suit and tie on a grey studio backdrop | `audit/image-inventory.json` › `"Anthony Giallombardo"` |
| `assets/source/1496771e-2020-04-06.jpg-w_600.webp` | Real building: gabled cottage with a black "WELCOME TO 2020" mural (owl, gears) and a pencil-style eyes mural, deep blue sky | `audit/image-inventory.json` › `A house with a black wall featuring a mural reading 'Welcome 192020' and a bicyc` |
| `assets/source/5d1c89e6-15ef8052-7fea-4029-84c4-493f523216ba-responsive.webp` | Real street view: white gabled office with a sculptural eye over the door, ramp, mural; legacy red roadside sign | `audit/image-inventory.json` › `"Practice Image"` |
| `assets/source/860fec98-53784670-2cdf-4268-a6b9-d0b9a8538918-responsive.webp` | Night shot: the metal eye sculpture lit red and green | `audit/image-inventory.json` › `"Practice Image"` |
| `assets/source/793c7181-2020-04-06-2.jpg-w_600.webp` | Real staff event in 2020 novelty glasses in front of the legacy red backdrop | `audit/image-inventory.json` › `Three women in front of a red and white Academy Vision backdrop smiling with 2020 glasses` |
| `assets/source/f3f92503-c2274987-a6f1-47bf-8d4c-a1aed76f6878-responsive.webp` | Comic-book illustration featuring the legacy red Academy Vision sign | `audit/image-inventory.json` › `"Practice Image"` |

**The style, summarised:**
- **Stock (most of the site).** High-key, natural daylight. Clean white or warm-neutral interiors with shallow depth of field. Genuine smiles and diverse ages and ethnicities: children, parents, seniors. Eyewear is on faces, or the moment is clinical (autorefractor, phoropter, consult). Colour is warm skin tones against white, denim and soft blue accents. Nothing dark or moody, except macro "symptom" eyes.
- **Real practice (few, but distinctive).** A standalone cottage-style building that patients recognise by its artwork. The copy says so: `audit/content-inventory.json#hours-location.html` › `the building with the artwork right by the Mizzen Avenue light`. Murals, a sculptural steampunk eye and playful community events give the practice a quirky, local, artsy personality. The stock library does not show this.

**Guidance for new (fal or Higgsfield) images:**
- Match the stock look: bright daylight, true-to-life skin, eyewear visible, warm-neutral rooms, gentle blue accents that echo `#4489bc` and `#3974a0`.
- People must not be presented as the real team or real patients.
- Keep the real headshots and practice photos as the "proof of place" layer.
- Never AI-generate the building, the team, the sign or the murals. Those must stay authentic.

---

## 6. Voice and tone

### 6.1 How Academy Vision talks (20 verbatim phrases)

| # | Phrase (verbatim) | Page | Shows |
|---|---|---|---|
| 1 | `audit/content-inventory.json#index.html` › `For over 40 years, families in and around Pine Beach have trusted us with their vision.` | home | history, place, family |
| 2 | `audit/content-inventory.json#index.html` › `You’re Not Just Another Appointment Here` | home | personal, reassuring kicker |
| 3 | `audit/content-inventory.json#index.html` › `We take the time to listen, explain what’s going on, and make sure you feel comfortable every step of the way.` | home | unhurried care |
| 4 | `audit/content-inventory.json#index.html` › `It’s one of the reasons families throughout Pine Beach, Beachwood, and Toms River continue to come back year after year.` | home | local towns, loyalty |
| 5 | `audit/content-inventory.json#index.html` › `Are your Eyes Always Irritated? There’s a Reason` | home | question kicker |
| 6 | `audit/content-inventory.json#index.html` › `Need Glasses Today? We’ve Got You` | home | casual warmth |
| 7 | `audit/content-inventory.json#index.html` › `We make kids' eye care easy and stress-free!` | home | the only exclamation in body copy |
| 8 | `audit/content-inventory.json#about-us.html` › `You’ve Known Us for Years, Or You Will Soon` | about | confident and friendly |
| 9 | `audit/content-inventory.json#about-us.html` › `For decades, we’ve been taking care of families throughout the Jersey Shore, building relationships that last far beyond a single visit.` | about | regional rootedness |
| 10 | `audit/content-inventory.json#about-us.html` › `Academy Vision was founded in 1984 by Dr. Robert Ullman, who built the practice with a simple goal: to take care of people the right way.` | about | plain history claim |
| 11 | `audit/content-inventory.json#about-us.html` › `treat patients like people, not appointments` | about | core promise |
| 12 | `audit/content-inventory.json#about-us.html` › `without losing the personal, familiar feel our patients value` | about | modern but familiar |
| 13 | `audit/content-inventory.json#hours-location.html` › `If you’ve driven down Route 9, there’s a good chance you’ve seen us—the building with the artwork right by the Mizzen Avenue light.` | hours | hyper-local landmark |
| 14 | `audit/content-inventory.json#hours-location.html` › `It’s a standalone building with its own parking lot, so you won’t have to search for a spot or deal with crowded plazas.` | hours | practical reassurance |
| 15 | `audit/content-inventory.json#eyeglasses.html` › `No pressure, no guesswork—just help that makes sense.` | eyeglasses | plain-spoken |
| 16 | `audit/content-inventory.json#eye-care-services-pediatric-eye-care.html` › `we make the experience easy and even a little fun for children in Pine Beach` | pediatric | gentle, playful |
| 17 | `audit/content-inventory.json#insurance.html` › `Insurance can feel confusing, but it doesn’t have to be.` | insurance | reassurance pattern |
| 18 | `audit/content-inventory.json#insurance.html` › `just let us know—we’re happy to help` | insurance | helpful, informal |
| 19 | `audit/content-inventory.json#our-eye-doctor.html` › `You won’t find a rushed, impersonal experience here.` | doctors | anti-corporate |
| 20 | `audit/content-inventory.json#our-eye-doctor.html` › `Dr. Marc Ullman has been a pillar of the eye care community since 1998.` | doctors | credential stated plainly |

### 6.2 Measured habits (31 pages, 16,252 words, including reviews and forms)

Source: `tmp/brand/voice-stats.json`.

| Habit | Count | Evidence |
|---|---|---|
| "you / your / yours / you’re / you’ll / you’ve" (not "yourself") | 651 | `tmp/brand/voice-stats.json` › `"secondPerson_you_forms": 651` |
| "we / our / us…" forms | 372 | `tmp/brand/voice-stats.json` › `"firstPersonPlural_we_our_us_forms": 372` |
| Contractions (curly ’) | 322 | `tmp/brand/voice-stats.json` › `"contractions_curly_apostrophe": 322` |
| "Pine Beach" | 63 | `tmp/brand/voice-stats.json` › `"place_PineBeach": 63` |
| "Toms River" / "Beachwood" / "Route 9" / "Lacey" / "Jersey Shore" | 8 / 4 / 3 / 2 / 1 | `tmp/brand/voice-stats.json` › `"place_TomsRiver": 8` |
| comfort, comfortable, comfortably / simple, easy, easier / family, families / "take(s) the time" | 49 / 37 / 35 / 17 | `tmp/brand/voice-stats.json` › `"theme_comfort": 49` |
| state-of-the-art / cutting-edge / #1 / world-class | 0 / 0 / 0 / 0 | `tmp/brand/voice-stats.json` › `"hype_stateOfTheArt": 0` |
| "best" | 12, all practical ("best possible fit", "best next step") or in patient reviews | `tmp/brand/voice-stats.json` › `"word_best": 12` |
| Em dashes, unspaced | 15 | `tmp/brand/voice-stats.json` › `"emDash": 15` |

The zero counts for hype terms are trustworthy because the same counter returns hits for "best" (12) and "advanced" (8).

### 6.3 Seven adjectives

**Neighbourly** (local, names its streets and towns) · **Warm** · **Reassuring** · **Plain-spoken** · **Family-centred** · **Unhurried** · **Established** (stated history, not boasting)

### 6.4 Rules for new copy in this voice

**Do:**
- Talk to "you" and speak as "we". Use contractions.
- Lead with a short, human kicker: a question or a reassurance. Follow it with a plain keyword heading. For example, kicker #5 sits above "Relief for Dry Eyes": `audit/content-inventory.json#index.html` › `Relief for Dry Eyes`.
- Name the place: Pine Beach first, then the nearby towns already used (Toms River, Beachwood, Lacey, the Jersey Shore, Route 9).
- Use the reassurance pattern "X can feel Y, but it doesn’t have to be", and promise time, listening, comfort and simplicity.
- Keep history claims to the verified facts:
  - founded in 1984 by Dr. Robert Ullman
  - Dr. Marc Ullman graduated from the Pennsylvania College of Optometry in 1998, and the doctors page calls him a pillar of the community "since 1998": `audit/content-inventory.json#about-us.html` › `after graduating from the Pennsylvania College of Optometry in 1998`. When he joined the practice is not stated, so do not write a joining year.
  - "over 40 years"
- Name the three doctors exactly as listed (§5).
- Use typographic apostrophes (’) and unspaced em dashes (—). Write headings in Title Case; CSS uppercases them.
- On pages carried over from the Eye Trends structure, change only what is needed: write fresh copy in this voice, say "Academy Vision", and add a Pine Beach reference.

**Don't:**
- Use hype superlatives (state-of-the-art, cutting-edge, #1, world-class, "the best"). Superlatives belong to patient reviews only.
- Stack exclamation marks. At most one, in a playful kids' context.
- Invent services, equipment, credentials, awards, insurance plans, prices, hours or years.
  - The only award in the crawl is the Marquis Who's Who 2023 badge, an image alt with no award wording anywhere in the copy: `audit/image-inventory.json` › `Who's Who Honorees 2023 Marquis 125 Years Logo`.
  - The insurance list is the 12 plans on `insurance.html`: Medicare, United Healthcare, Aetna, Cigna, Blue Cross Blue Shield, EyeMed, UMR, AARP, Meritain Health, Mutual Of Omaha, Clover and Braven Health. Each name is its own element under the heading: `audit/content-inventory.json#insurance.html` › `Insurance Plans We Accept` … `audit/raw/insurance.html` › `Braven Health`.
- Type headings in capitals, or write corporate "patients are our priority" filler where the source is concrete.
- Reuse Eye Trends sentences or headings.

---

## 7. Guardrails for the redesign

### 7.1 Must stay

1. **The logo, untouched.**
   - Use `assets/brand/logo.png` as is: 4.663:1, inks `#082240` / `#0f2a49` / `#4488bb`. No recolouring, stretching, effects, glass blur or shadow over it.
   - Clear space (proposed): at least the height of the "VISION" line (about 21% of the logo height, 21 px at the 98 px master) on all sides.
   - Minimum width (proposed): 160 px on mobile, 200 px on desktop. The source renders it at 270×58 CSS px.
   - Place it on white, cream or the light glass surfaces. Use it on navy or dark glass only once a reversed version is approved (§1.7).
2. **The navy anchor.** `#0f2a4a` (with `#082240` as its deeper partner) carries the footer, the dark CTA band(s) and every hover or pressed state.
3. **The serif / sans pairing and its roles.**
   - Libre Baskerville 400 in uppercase for headings, at tight line-height (≤ 1.1).
   - Montserrat for body and UI, with a 20 px body at 1.6.
4. **The blue family and its jobs.** `#3974a0` for action (filled CTA, borders) and `#4489bc` as the accent (heading rule, icons, highlights).
5. **The 100×5 px accent rule under headings**, in `#4489bc` on light surfaces and `--av-blue-soft` on dark ones.
6. **Cream and white as the light rhythm,** with the header on cream or cream glass.
7. **The segmented divider-band motif** (navy, blue and white blocks). Rebuild it as CSS or SVG in the exact palette rather than the lossy 1600×18 JPEG.
8. **Real people and place.** Team headshots, building, murals and the eye sculpture are kept as the authentic layer.
9. **The voice** (§6).

### 7.2 May evolve

- **Glass surfaces.** Frosted panels in white, cream or navy tints, using the minimum alphas in §7.4: `backdrop-filter: blur(16–24px) saturate(140%)`, a 1 px light inner border and navy-tinted shadows. Panel radius 16–24 px is fine. Tiles can keep the source's 10 px.
- **Light fields and gradients, derived only from the palette:**
  - deep-navy → navy → action-blue linear gradients for dark bands
  - soft radial blue glows on cream or white, ≤ 18% alpha
  - navy or blue tints mixed into cream or white for alternate surfaces (`--av-mist`, `--av-sky`)
- **All headings may unify on navy** `#0f2a4a`. That is the theme's declared intent and is already how the source's rich-text headings render (§2.2). It holds 14.48:1 on white and 13.26:1 on cream. Black remains acceptable.
- **Links must change.** `#4489bc` text fails AA, so use `--av-blue-ink` `#2f638e` on light surfaces and `--av-blue-soft` `#abcae1` on dark.
- **Buttons** may gain a small radius (≤ 6 px) and glass or gradient fills. Labels must keep ≥ 4.5:1. The filled CTA stays action-blue, and its hover stays navy.
- **The maroon `#650705` hover** is hover-only, absent from the logo, and clashes with the blue system. The recommendation is to retire it in favour of navy, but confirm with the practice (§8).
- **Eyebrows** may become smaller, tracked labels (for example 14–16 px, 600 weight, 0.08–0.12em). Montserrat's variable axis makes 600 real. Colour: `--av-blue-strong` at ≥ 24 px; at smaller sizes use `--av-navy` or `--av-blue-ink`, so they pass 4.5:1.
- **Depth.** Layered images may break section edges (overlapping cards, images protruding over the divider band), provided text never sits on an un-scrimmed photo.

### 7.3 Must not

- Recolour the logo or introduce the legacy red as a brand colour.
- Put `#4489bc` text under 24 px on any light surface.
- Put the logo's navy on navy.
- Synthesise Libre Baskerville bold or italic.
- Set text on light glass that floats over photography unless it is `--av-glass-veil` (α ≥ 0.88).

### 7.4 Proposed token set

Every derived value is a stated sRGB mix of two measured colours (`tmp/brand/tokens.mjs`).

```css
:root {
  /* measured source colours */
  --av-navy:        #0f2a4a;  /* anchor: footer, bands, hovers; = logo wordmark ink */
  --av-navy-deep:   #082240;  /* logo symbol ink: deepest surfaces, gradient start */
  --av-blue:        #4489bc;  /* accent = logo blue: rules, icons, focus on light (UI only) */
  --av-blue-strong: #3974a0;  /* action: filled CTA, outline borders, large eyebrow text */
  --av-cream:       #f9f4f0;
  --av-white:       #ffffff;
  --av-ink:         #202020;  /* body text */

  /* derived (mix of two measured colours) */
  --av-blue-ink:    #2f638e;  /* links on light   = --av-blue 60% + --av-navy 40% */
  --av-blue-soft:   #abcae1;  /* links/rules on dark = --av-blue 45% + white 55% */
  --av-slate:       #4b5f77;  /* secondary text  = --av-navy 75% + white 25% */
  --av-mist:        #f0ece9;  /* alt light surface = --av-navy 4% into --av-cream */
  --av-sky:         #f0f6fa;  /* alt light surface = --av-blue 8% into white */

  /* glass (alpha chosen so every allowed pair in 7.5 stays AA; computed minimums are in the table below) */
  --av-glass-light: rgba(255,255,255,0.72);  /* over light brand surfaces only */
  --av-glass-cream: rgba(249,244,240,0.76);  /* over light brand surfaces only */
  --av-glass-veil:  rgba(255,255,255,0.88);  /* over photography / anything */
  --av-glass-navy:  rgba(15,42,74,0.84);     /* dark glass, over anything */
  --av-glass-edge:  rgba(255,255,255,0.55);  /* 1px inner border on light glass */
  --av-shadow:      0 24px 48px -16px rgba(8,34,64,0.28), 0 2px 6px rgba(8,34,64,0.08); /* navy-deep tinted */

  /* fields and gradients (palette-derived) */
  --av-grad-deep:   linear-gradient(135deg, var(--av-navy-deep) 0%, var(--av-navy) 55%, var(--av-blue-strong) 100%);
  --av-grad-light:  linear-gradient(180deg, var(--av-white) 0%, var(--av-cream) 100%);
  --av-glow:        radial-gradient(closest-side, rgba(68,137,188,0.18), rgba(68,137,188,0));

  /* type */
  --av-font-serif:  'Libre Baskerville', Georgia, 'Times New Roman', serif; /* 400 only */
  --av-font-sans:   Montserrat, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; /* variable 100-900 */
  --av-root:        20px;   /* source root size */
  --av-body-lh:     1.6;
  --av-h-lh:        1.0;    /* source; may relax to 1.05-1.1 for 3+ line headings */
  --av-rule:        100px 5px; /* accent rule under headings, 10px gap */
}
```

**Minimum glass alpha**, computed against the worst underlay: pure black under light glass, pure white under navy glass. Source: `tmp/brand/tokens.json`.

| Glass | Text | Minimum α | Evidence |
|---|---|---|---|
| white | navy | 0.57 | `tmp/brand/tokens.json` › `"white glass, navy text, over black": 0.57` |
| white | ink | 0.53 | `tmp/brand/tokens.json` › `"white glass, ink #202020 text, over black": 0.53` |
| cream | navy | 0.59 | `tmp/brand/tokens.json` › `"cream glass, navy text, over black": 0.59` |
| navy | white | 0.64 | `tmp/brand/tokens.json` › `"navy glass, white text, over white": 0.64` |

The token alphas sit above these minimums so that the secondary and link colours also pass on every glass. The accent `--av-blue` does not: it fails on the veil (2.87) and on navy glass (2.33). §7.5 marks both and names the substitute.

### 7.5 Every token pair, contrast-checked (`tmp/brand/tokens.json`)

**Method.**
- Glass on light surfaces is judged at its worst composite over white, cream, mist, sky and the 18% blue-glow peaks.
- Veil and navy glass are judged at their worst composite over black, white, navy and cream.
- AA thresholds: 4.5 for text; 3 for large text (≥ 24 px) and for UI.

| Text / UI | white | cream | mist | sky | glass-light | glass-cream | glass-veil |
|---|---|---|---|---|---|---|---|
| `--av-ink` body | 16.29 | 14.92 | 13.87 | 14.95 | 15.13 | 14.21 | 12.34 |
| `--av-navy` headings | 14.48 | 13.26 | 12.33 | 13.28 | 13.45 | 12.63 | 10.97 |
| `--av-slate` secondary | 6.56 | 6.00 | 5.58 | 6.02 | 6.09 | 5.72 | 4.97 |
| `--av-blue-ink` links | 6.37 | 5.83 | 5.42 | 5.85 | 5.92 | 5.56 | 4.83 |
| `--av-blue-strong` large / eyebrow ≥ 24 px (3:1) | 5.02 | 4.60 | 4.28 | 4.61 | 4.67 | 4.38 | 3.81 |
| `--av-blue` rule / icon (UI 3:1) | 3.78 | 3.46 | 3.22 | 3.47 | 3.51 | 3.30 | **2.87 ✗** → use `--av-blue-strong` |

| Text / UI on dark | navy | navy-deep | glass-navy |
|---|---|---|---|
| `--av-white` body and headings | 14.48 | 15.99 | 8.82 |
| `--av-cream` body | 13.26 | 14.64 | 8.07 |
| `--av-blue-soft` links / eyebrows | 8.46 | 9.34 | 5.15 |
| `--av-blue` rule / icon (UI 3:1) | 3.83 | 4.23 | **2.33 ✗** → use `--av-blue-soft` (5.15) |

| Component pair | Ratio | Verdict |
|---|---|---|
| white label on `--av-blue-strong` (filled CTA) | 5.02 | AA |
| cream label on `--av-blue-strong` (source CTA) | 4.60 | AA |
| cream label on `--av-navy` (CTA hover) | 13.26 | AA |
| `--av-blue-strong` outline border on white / cream | 5.02 / 4.60 | UI AA |
| `--av-blue-strong` fill edge on a navy band | **2.88 ✗** | Add a 1 px `--av-blue-soft` border there (8.46), or use the white-outline button |
| White text on every `--av-grad-deep` stop (`#082240`, `#0f2a4a`, `#3974a0`) | 15.99 / 14.48 / 5.02 | AA at the worst stop |

Evidence for the tables:
- `tmp/brand/tokens.json` › `"fg": "--av-blue-ink #2f638e"`
- `tmp/brand/tokens.json` › `"ratio": 4.83`
- `tmp/brand/tokens.json` › `"ratio": 2.87`
- `tmp/brand/tokens.json` › `"ratio": 5.15`
- `tmp/brand/tokens.json` › `"ratio": 15.99`

---

## 8. Open questions and unverified items

1. **Two phone numbers.** The visible number everywhere is **(732) 978-9306**: `audit/raw/index.html` › `href="tel:+17329789306"`. But the header "Call Us" icon on all 31 pages dials **(732) 736-1700**: `audit/raw/index.html` › `href="tel:+17327361700" target="_self" aria-label="Call Us"`. The JSON-LD `telephone` also uses 736-1700: `audit/raw/about-us.html` › `"telephone": "(732) 736-1700"`, and the roadside sign shows it. Which one is canonical is UNVERIFIED. The task brief uses 978-9306.
2. **Reversed or SVG logo.** No reversed, white or vector logo is in the crawl. Ask the practice; otherwise approve a derived white knockout (§1.7).
3. **Maroon `#650705`.** Retire it or keep it as a heritage hover? UNVERIFIED intent. It may echo the legacy red mark.
4. **Logo typefaces** are UNVERIFIED (§1.2).
5. **The 7 descriptively named "stock-like" images** have unverified provenance and licensing (§5).
6. **Mobile computed sizes** were not measured (§4.2).
7. **`www.google.com` requests.** 4 such requests went out despite the block pattern (§2). The verifier's run identified them as the footer Google Maps embed iframe (`https://www.google.com/maps/embed/v1/place`, a `Document` request), so this item is resolved. The origin was never requested.
8. **Structured-data logo.** The home page's second JSON-LD block (`"@type": "Optician"`) still names the legacy red mark (file F, §1.1) as `logo` and `image`, while every page's other JSON-LD names file D. Which mark should structured data carry? The recommendation is the navy and blue master.

---

## Appendix: files this lane produced (scratch, `tmp/brand/`)

| File | What |
|---|---|
| `tmp/brand/computed.json` | Raw computed-style capture: 4 pages, roles, sections, text census, fonts, network hosts |
| `tmp/brand/measure.mjs` | The single-Chrome probe that wrote `computed.json` and `logo-pixels.json` |
| `tmp/brand/logo-pixels.json`, `logo-inks.json`, `navy-split.json`, `logo-holes.json`, `logo-1200.json` | Logo and favicon pixel measurements (canvas `getImageData`) |
| `tmp/brand/css-census.json` | Every colour literal in the inline CSS of the 31 raw pages, by property |
| `tmp/brand/pairs.json` | Text-on-background pairs from the 4-page census, with WCAG ratios |
| `tmp/brand/tokens.json` | Source UI and hover pairs, candidate exploration, the token set and every token pair |
| `tmp/brand/woff2-tables.json` | WOFF2 table directory, name and fvar for the 7 font files |
| `tmp/brand/voice-stats.json` | Voice habit counts over the 31 pages |
| `tmp/brand/plain-headings.json` | Computed style of the 15 rich-text headings on 5 more pages (second single-Chrome run) |
| `tmp/brand/image-census.json` | Deduplicated image groups (stock-style, team, practice, packshots) behind §5 |
| `tmp/brand/check-evidence.mjs`, `tmp/brand/check-tables.mjs` | Re-verify every evidence pair, the contrast tables, the section counts, the logo hash, the font mapping, and that there is no 8-word overlap with the Eye Trends crawl |
| `tmp/brand/shots/*.png` | 1440-wide page slices at half scale (14 files) |
| `tmp/brand/cdn-master-Academy-Vision-Logo.png` | The fetched 457×98 logo master; copied to `assets/brand/logo.png` |

---

## Verification record

**Date:** 2026-10-08. **By:** the independent BRAND verifier. It re-ran the evidence with its own scripts in `tmp/verify-brand/` and did not reuse the lane's measurement scripts.

**What was checked, and how**
- **Logo bytes.** `png.mjs` is a zlib-only PNG decoder, used by `logo.mjs` and `logo-check2.mjs`. It checked:
  - the sha256 of `assets/brand/logo.png`, `logo-master.png` and the scratch copy (all `1f0e11d2…c5f`);
  - the IHDR (457×98, 8-bit, colour type 6) and the alpha split (79.12 / 6.85 / 14.04%);
  - the corners, the ink box (430×77) and the gaps (x 150–175, rows 52–63);
  - the inks, the holes and the alpha ramps (mean 1.347 px, 69 hard edges).
- **WebP files.** The WebP files were decoded with libwebp's `dwebp` (`webp-check.mjs`), and their containers were read with `riff.mjs`.
  - File D: ramps 4.89 px with 0 hard edges, ink box 1131×211 (5.36).
  - 400w: navy mode `#08213f`. The light-blue fringe is 4.27% of solid pixels within 28 RGB units of `#6aaddf`; the lane's cluster gives 4.32%, and the master has none.
- **Computed styles.** There were two headless Chrome runs (`probe.mjs`, `probe2.mjs`), one at a time, at 1440×900 on port 8821. They covered the same 4 pages plus the 5 rich-text pages, and confirmed:
  - root 20 px; body Montserrat 20/32, weight 400, letter-spacing normal;
  - component headings black, Libre Baskerville 400, uppercase, 44/44 (40 on dry eye, 30 on the blog teaser);
  - the 15 rich-text headings navy `rgb(15, 42, 74)`, h2 at 44 and h3 at 40;
  - the heading rule: 100×5, `#4489bc`, 10 px gap;
  - the logo at 270×58 using the `@w_400` file (src `@w_300`);
  - nav 17/20.4, 700 for the current page;
  - buttons: 20/22, radius 0, 15/30 padding, 1 px `#3974a0` border, filled `#3974a0`/`#f9f4f0`, hover `#0f2a4a` (forced by real mouse moves); the navy-band button hovers `#650705`;
  - footer icons: 50 px, 50% radius, `#3974a0`, maroon on hover;
  - submenu: white, `0 0 5px rgba(0,0,0,.1)`, 1 px `#efefef`;
  - surfaces: top bar 94 px white, header 106 px cream, divider 15 px, navy footer 561 px with three 357 px columns, platform footer 82 px with 13 px `#757575` text;
  - the section-surface table, exactly (16 / 12 / 5 / 2 / 16);
  - the text census: 0 navy text nodes; 188, 144, 216 and 421 chars exact for the link, CTA, platform-footer and scrim pairs.
- **Contrast.** `contrast.mjs` is its own WCAG 2.x implementation, with controls 21, 1 and 4.54 for `#767676` on white. It recomputed all 22 source pairs, all 54 cells of the §7.5 tables, the 5 derived token mixes, the 4 worst composites, the 4 minimum alphas and the component pairs. There were 0 mismatches.
- **CSS and markup.** `css-check.mjs` and `headings-static.mjs` found:
  - every colour count in §3.1 matches exactly (2,384 / 2,150 / 1,552 / 975 / 666 / 398 / 261 / 135 / 124 / 62 / 4 / 4 / 2);
  - footer navy, the Call Us icon, `tel:+17329789306`, the JSON-LD 736-1700, the divider band and the `:root`, body and menu rules are on 31 of 31 pages; the heading rule is on 27 of 31;
  - all 135 maroon declarations sit in `:hover`, `:focus` or `:active` rules;
  - there are 15 plain headings against 149 component headings.
- **Fonts.** `woff2.mjs` is its own WOFF2 reader, with Brotli decompression and a cmap read. It confirmed:
  - 5 variable Montserrat files (wght 100–900) and 2 static Libre Baskerville Regular files (usWeightClass 400);
  - 12 `@font-face` rules, mapped as in §4.1;
  - the only copy characters outside the latin range are U+2B50 and U+FE0F.
- **Voice.** `voice.mjs` found all 20 phrases of §6.1 verbatim in their stated `audit/raw` page after entity decoding, and a negative control fails as it should. Every §6.2 count reproduces under the lane's definitions, and the hype counters fire on a synthetic positive control.
- **Imagery.** `images.mjs` reproduced 126 masters, 60 + 7 + 7 = 74 stock-style, 3 headshots and 4 + 3 practice-image files. I viewed 11 image files directly, plus one of the lane's page captures. All 7 of the §5 descriptions I checked match.
- **Evidence pairs.** `evidence.mjs` found all 184 pairs in the corrected doc (179 before), with 3 negative controls.
- **Eye Trends overlap.** `overlap.mjs` found 0 eight-word overlaps with the 43-page crawl, and its positive control fires. The only shared heading, "eye care services", is Academy Vision's own nav label.
- **Key leaks.** `keyscan.mjs` found 0 key fragments in 89 files (the doc, `tmp/brand`, `assets/brand` and `tmp/verify-brand`), and its positive control detects both key files.

**Corrections made in place**

| # | Where | Before | After | Evidence |
|---|---|---|---|---|
| 1 | §1.3, `tmp/brand/logo-inks.json` | `#082240` 28.04% (1,794 px) plus `#08223f` 0.09% (6 px) | `#082240` 28.14% (1,800 px); `#08223f` 0 | The PNG bytes hold exactly 3 solid colours. The 6 px are `#082240` at alpha 253, which a canvas premultiply round-trip reads as `#08223f`. The verifier's canvas read reproduces 1,794 + 6; the byte decode gives 1,800 + 0. |
| 2 | §1.3, `logo-inks.json` (favicon) | 60.79% (2,891 px) plus `#08223f` 12 px | 61.04% (2,903 px); `#08223f` 0 | The same mechanism (12 px at alpha 253). |
| 3 | `navy-split.json`, `logo-1200.json` (master symbol) | `#082240 60.5%`, `#08223f 0.2%` | `#082240 60.7%`, `#08223f 0.0%` | 1,800 of 2,963 px. |
| 4 | §1.4, §7.1 | "VISION" rows 64–86, 23 px, about 23% | rows 64–84, 21 px, about 21% | The VISION region box (alpha ≥ 16) is y 64–84; row 86 belongs to the symbol. |
| 5 | §1.1, §1.8, §8 | 5 logo variants; "The website uses only the navy and blue eye" | Adds file F, the legacy red mark `Logo-trans.png@w_400.webp`, declared as `logo` and `image` in the home page's Optician JSON-LD; new open question 8 | `audit/raw/index.html` (2 hits on 1 page); the dwebp decode was viewed; dominant ink about `#cf3a43`. |
| 6 | §1.1 | og:image UNVERIFIED for 30 pages | 13 pages carry an og:image (their own stock photo), 18 have none, and none uses a logo | A grep over all 31 pages. |
| 7 | §0.2, §3.1 | navy is "every button's hover fill" | 189 of the 190 `.button:hover` rules; the home navy band's button hovers maroon | `.cpt--id-DTmI6hT5nG .button:hover{background-color:#650705`; the forced hover was measured. |
| 8 | §2.2 | navy h1–h3 declared "408 times each" | 440 each (408 component + 31 header-menu + 1 blog-section) | A grouped selector count. |
| 9 | §3.1 | photo overlay on 1 page | Adds `#2e2e2ed1` (α .82) on `our-eye-doctor.html` | The CSS census. |
| 10 | §5 | 7 practice photos | 7 files = 6 distinct images, one of them an illustration (with a rights note: it shows Spider-Man) | f516a054 = `2020-04-06.jpg`: thumbnail difference 1.13/255, against 48.8 for a control (`samephoto.mjs`). The illustration was viewed. |
| 11 | §6.4 | the insurance list quoted with collapsed whitespace (not verbatim) | the 12 names in prose plus 2 verbatim quotes | Each name is a separate element. |
| 12 | §6.2 | labels "you / your…", "comfort*", "simple, easy" | the exact word forms counted | The lane's regexes were re-run; the 37 includes 6 "easier". |
| 13 | §7.4 | the accent "also passes" on glass | the accent fails on the veil (2.87) and on navy glass (2.33) | The §7.5 table already marks both. |
| 14 | §2, §8.7 | `www.google.com` requests UNVERIFIED | the Maps embed iframe (`/maps/embed/v1/place`, a Document request) | Logged in `tmp/verify-brand/probe2.json`. |
| 15 | §1.2, §1.5, §2.2 | (precision) | the catchlight is 8×9 at alpha < 128; the corner bytes store transparent white; links render `#000` in cream sections | Measured. |
| 16 | `tmp/brand/pairs.json` | `smallestIsLarge: true` for `#202020 on #ffffff` and `#ffffff on #0f2a4a` | `false` | Both pairs contain 20 px weight-400 text. The old test paired the smallest size with any bold weight in the pair. |
| 17 | `tmp/brand/check-evidence.mjs` | The key check passed while reading 0 files (`BRAND_KEY_FILES` unset), and whitespace-collapsed matches counted as verbatim | It fails closed with no key files, and reports matches that need whitespace collapsing | Run without and with `BRAND_KEY_FILES` (exit 1, then 0); a synthetic non-verbatim quote is reported. Node needs `C:/…` paths in `BRAND_KEY_FILES`. |

**Checked, not changed** (definition-dependent, within tolerance)
- **Census characters.** Mine against the doc: `#202020` on white 4,511 / 4,518, `#000` on cream 3,438 / 3,441, `#000` on white 817 / 877, white on navy 1,066 / 1,138. The node counts match; the remaining gap comes from text-node and whitespace rules.
- **Word count.** 16,252 words is the whitespace-token count, and equals the sum of the inventory's `wordCount` fields.
- **Platform footer.** It measured 83 px on index and 82 px elsewhere.

**Not verifiable by the verifier**
- The lane's HTTP fetch (status and content type). The file bytes, hash and IHDR were checked instead.
- The lane's process claims: PIDs, the number of Chrome launches, the 96 CDN requests in its run, and the history of the key-fragment incident (the current files are clean).
- Mobile sizes, the logo typefaces, stock licensing, and the client's intent on the phone number, the maroon hover and the structured-data logo.

**Run hygiene**
- Two headless Chrome runs, one at a time, in the foreground and closed in `finally` (PIDs 13640 and 30484).
- The servers on port 8821 ran as child processes and were killed by PID (1176 and 12960).
- 0 requests reached `www.academyvisionnj.com`. The footer Maps iframe still reached `www.google.com`, and from inside the iframe `maps.gstatic.com`, despite the block list: 10 `www.google.com` requests across both runs. The 4 logged by URL were all `maps/embed/v1/place` documents.
- No headless Chrome and no listener on 8811 or 8821 remained afterwards.
