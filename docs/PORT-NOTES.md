# PORT-NOTES: Academy Vision content model (extractor lane)

Source: the 31-page crawl of www.academyvisionnj.com in `audit/raw/*.html` (EyeCarePro "PatientEngage",
`<meta name="platform" content="sitebuilder-v4">` in every page head). This lane turns those pages into a
platform-free content model that the build renders. The Eye Trends restructure (MOVES + path remap) is a
build-time step. This model keeps the **source** paths.

Every factual statement below cites the file it was read from. A short verbatim quote is given in backticks
where it helps. **UNVERIFIED** marks what could not be checked this run.

---

## 0. Run it

| command | what it does |
|---|---|
| `node src/lib/extract.mjs --render` | Serves `audit/raw` in-process on `127.0.0.1:8814` and drives ONE headless Chrome (`tools/cdp.mjs` `launch()`, fresh temp profile, site isolation off) at 1440x900 through all 31 pages. It scrolls each page to the bottom in 700px steps and writes `tmp/extract/rendered/<slug>.html` (rendered DOM), `.main.txt` (innerText of `<main>`), `.chrome.txt` (innerText of header + footer) and `.net.json` (every request, plus what was blocked). Takes about 3 min. |
| `node src/lib/extract.mjs` | Reads only files and is deterministic. Writes `src/content/pages/<slug>.json` (31) and `src/content/source-chrome.json`. Exits 1 when any text in `<main>`/header/footer is left unconverted, a component type is unknown, an image is not in the inventory or missing on disk, platform residue gets into an html node, a form's validation copy cannot be read from its runtime script (`form-validation-message-unparsed`), or the header/footer varies between pages. It refuses to run without the rendered snapshots unless `--static-only` is passed. |
| `node src/lib/extract.mjs --control` | Positive control for the fail-closed check above. In memory, it puts a stray `<p>` and an unknown component into `index.html`, and both must be reported, with nothing else. |
| `node tools/text-parity.mjs` | Completeness check (section 9). Exits 1 on any miss. |
| `node tools/text-parity.mjs --control` | Two positive controls (section 9). Exits 0 only when both fire exactly. |
| `node tools/hashdir.mjs src/content/pages <copy>` | Byte-identity of two runs (section 10). |

Inputs read by the extractor: `audit/raw/*.html`, `audit/content-inventory.json` (slug -> URL), `audit/image-inventory.json`
(1131 records), `tmp/extract/rendered/*.html`. Nothing else, no network.

## 1. Results at a glance (this run, 2026-10-08)

- 31 pages -> 142 blocks, 494 nodes. Node origin: 494 `static`, 0 `rendered` (section 7).
- 0 extractor problems. The extractor control fired.
- Text parity: **1614/1614** `<main>` sentence units found, 0 missing, 0 occurrence shortfalls, 0 whitespace-only matches.
  Chrome: **47/47** (1 found only after ignoring whitespace: the footer legal links, which innerText prints on one line).
  Both parity controls fired.
- Determinism: run A and run B (B started from an empty output dir) give aggregate sha256 `a4ada18c969c1667e3640caa54a7dc33beb530485f7b1f01672ea90954c316de`
  over 31 files: IDENTICAL. `source-chrome.json` sha256 `eeb4372d665fbb12522673ed6e230556bee20335562dca1539019d4e2968db93` in both runs.
  The hashdir control fired. (These are the values after the verifier's extractor fix, see the Verification record. The lane's own
  run gave `33c0d509…c47bc488` / `b3f4872f…26417754`, which the verifier reproduced byte for byte before the fix.)
- 173 image references in the model (pages + chrome) all point at the largest local variant of their master. 0 unresolved. All 147 page image records carry an alt.
- 30 distinct internal hrefs. All 30 are crawled pages (`/` + 29 others).

## 2. Source anatomy

- Skeleton, the same on all pages (`audit/raw/index.html`): `<body>` -> GTM `<noscript><iframe>` -> `div.site` ->
  `a.skip-to-content` (`Skip to content`, `href="#main-content"`) -> `header[role=banner]` -> `<main>` (first child
  `<div id="main-content" tabindex="-1">`, then the blocks) -> `footer[role=contentinfo]`.
- Head: 4 `<style>` blocks. One holds @font-face (Libre Baskerville, Montserrat from `cdn.patientengage.cloud/global/fonts/google-fonts/...`), one is `id="site-css"`, and two hold per-component rules keyed by `.cpt--id-<id>`.
  The CSS is desktop-first: base rules, then `@media (max-width:1500px)`, `(max-width:1200px)`, `(max-width:768px)` and `(max-width:460px)`.
  A few rules use min-width instead (`index.html`: `(min-width:1200px)` x2, `(min-width:769px)`, `(min-width:768px)`, `(min-width:461px)`), and one
  block is `(prefers-reduced-motion:reduce)`, which the extractor treats as not matching.
  The extractor parses this CSS and reads a fact as the cascade at 1440px (desktop) or 390px (mobile).
- Component markup: every component is an element with `class="cpt cpt--id-<10 chars> cpt--type-<type> ..."`. The id is
  greppable in the raw file, and every model node carries it as `id`. `cpt--visible-<bp>` marks a breakpoint-only copy.
- Header: identical on all 31 pages except the menu's current-state classes (`menu--current`, `menu--ancestor-is-current`).
  Footer: byte-identical on all 31. The extractor re-verifies both on every run (`evidence` in `source-chrome.json`).

## 3. Component catalogue

Counts are over all 31 raw pages (header / main / footer). The selectors are the source's. "->" gives the model mapping.

### 3.1 Blocks (direct children of `<main>`, header and footer)

| type | count | markup and selectors | variants | -> model |
|---|---|---|---|---|
| `section` | 31/102/31 | `section.cpt--type-section > div.cpt--type-background + div.section__container > div.cpt--type-column-group > div.site-grid > div.cpt--type-column > div.components > (leaves)` | 1..n column groups. Column width comes from CSS `.cpt--id-<col>{grid-column:span N}` (12-col grid), with mobile overrides at 768px | block `cpt:'section'`. `layout.columns[] = {group, span, spanMobile}` and each node has `col` (index into columns). `layout.imageSides[]` when a 2-column group has an image-only column |
| `section-callout-1` | 0/23/0 (17 pages) | `section > div.section__container > div.site-grid > div.text-column + div.imagery-column` | image side set by CSS `order` on `.text-column` (`order:2` = image left). On mobile the image comes first (e.g. `eye-care-services`: `.imagery-column{order:1}` at 768px). The image bleeds to the viewport edge: `.imagery-column .cpt{position:absolute; left:0}` or `right:0` | `layout.columns = [{role:'text'...},{role:'imagery', bleed}]`, `layout.imageSide:'left'|'right'` |
| `hero-1` / `hero-2` | 0/2/0, 0/1/0 | `section > div.section__container > div.hero__contents > (div.cpt--type-image.mobile-image) + div.components-position > div.components > (leaves)` | the hero photo is the CSS background of `-background .cpt-background__image`. The same photo repeats as an `<img>` `.mobile-image` that shows only on mobile (`.mobile-image{display:none}` on desktop, background hidden at 768px). hero-2 puts the text in a white box (`.components{max-width:600px;background-color:#fff}`). about-us and our-eye-doctor heroes have a dark overlay (`.cpt-background__overlay{background:#2e2e2ecf}` / `#2e2e2ed1`) | `layout.minHeight / contentBackground / contentMaxWidth / contentAlign`. `background.image` (desktop), `background.overlay`. The mobile copy is an image node with `variant:'mobile-only'` |
| `section-divider` | 31/14/31 | empty `section` whose background is `Blue-Divider_light.jpg` (1600x18) | none | block with `layout.minHeight:'15px'`, `background.image`, `nodes:[]` |
| `background` | 62/142/62 | `div.cpt--id-<block>-background.cpt--type-background > div.cpt-background > (div.cpt-background__image) (div.cpt-background__overlay)` | everything visual is in CSS: `background-color`, `background-image:url(...)` (+ `image-set` 1x/2x), `background-position`, overlay colour | `block.background = {color, image:{master,file,w,h,position,mobile:'hidden'?}, imageMobile?, overlay?, textColor}`. `textColor` comes from `.cpt--id-<block>{color}` |
| `column-group` / `column` | 31/108/31, 62/166/93 | wrappers (above) | spans per breakpoint | `layout.columns[]` + node `col` |

### 3.2 Leaf components

| type | count | markup | variants and notes | -> node |
|---|---|---|---|---|
| `heading` | 0/151/124 | `div.cpt--type-heading > (h1..h6 \| div).heading > span.text-container > span.heading__text` | (a) semantic h1-h3. (b) `div.heading` with no level: the footer headings, plus 2 in main (`hours-location` "Academy Vision", `index` the pediatric line, both `<strong>`). (c) a linked title `a.text-container` with a decorative `span.link-chevron` "»" (aria-hidden) in childpages / team / article lists. All headings are uppercased by CSS (`.heading{...text-transform:uppercase}`). The text is mixed case in the DOM | `{t:'heading', level (null for div), text, html (inline only), href?, chevron?, align?}` |
| `content` | 31/155/0 | `div.cpt--type-content > div.content > div.text-container > (p, ul/li, h2/h3, strong, em, a, br)` | tag vocabulary measured over all pages: p, ul, li, a, strong, em, br, h2 (article), h3 (4 pages), span (style only). An eyebrow line before a heading is its own content component (sometimes CSS `.content{text-transform:uppercase}`). The review excerpt/full pair is a special case (below) | `{t:'html', html}` (sanitised), `transform:'uppercase'?`, `align?`, `hint:'kicker'` (heuristic: one link-free `<p>` of 12 words or fewer directly followed by a heading in the same column. 20 hits, all eyebrow lines, listed in the run) |
| `image` | 62/98/31 | `div.cpt--type-image > (span.image \| a.image) > img[src][srcset][alt][width][height]` | `.mobile-image` (hero), `.childpage-image`, `.team-image__img`, `.team__img`, logos `.img--logo` / `.img--logo-responsive` (header, same file). Focal point from CSS `.cpt--id-<id> img{object-position}`. `width`/`height` attrs are the master's size (e.g. `width="7934" height="5292"`) | `{t:'image', master, file, alt, w, h, href?, variant?, focal?}` (section 5.3) |
| `button` | 0/51/0 | `div.cpt--type-button > a.button[href][target] > span.button__label` | `<button>` variants are UI: frames "Show All", form "Submit". 3 "Book Appointment" buttons (`contact-lenses`, `hours-location`, `insurance`) carry `rel="nofollow"`; the other 55 booking links in `<main>` (58 on 19 pages) do not | `{t:'button', label, href, external, newTab?, rel?, variant?, ariaLabel?}` |
| `button-group` (+ `-button`) | 31/39/0 (78 buttons in main) | `div.button-group > div.cpt--type-button-group-button > a.button.button--primary|button--secondary|button--button_secondary` | always Call + Book in main | one button node per item with `group:<group id>` |
| `icon-group` / `icon-group-icon` / `icon` | header 31/62, main 6, footer 62 | header quick icons: `a.icon[aria-label] > span.icon-svg-background` (the icon is a CSS background SVG). `icon` = inline SVG glyphs in location summaries and carousel arrows | header icons are `cpt--visible-lg cpt--visible-md cpt--visible-sm` (no `visible-xl` class) | header icons -> `source-chrome.json header.quickIcons`. Glyph icons are dropped (decoration) |
| `team-list-1` | 0/1/0 (our-eye-doctor) | `div.list-team > div.team-item[data-link] > (photo image, h3 title + chevron, team-biography-1 excerpt, "Read More" button)` | bios are truncated excerpts ending in `...`. The full bios are on the team pages | `{t:'team', kind:'list', items:[{name, href, title, photo, bio, cta}]}` |
| `team-biography-1` / `team-photo-1` | 0/6/0, 0/3/0 | biography = content component. photo = `div.team-photo.featured-image > image` | | `{t:'team', kind:'biography', html}`, `{t:'team', kind:'photo', image}` |
| `team-positions-1` / `team-languages-1` / `team-highlights-1` | 0/3/0 each | **empty** on all 3 team pages: `<div class="cpt cpt--id-BAspfYtJPk cpt--type-team-positions-1"> </div>` (`team-dr-marc-ullman-od.html`). Still empty after JS | | `{t:'team', kind, items:[], empty:true}` |
| `location-summary-1` | 0/2/31 | `div.location-summary[data-gsp-location-id="6999"] > (heading summary title)? + a[href^=tel] > span + a[href*="google.com/maps/search"] > span` | footer has the name heading. The location page / hours page summaries do not. The address ends with a "»" chevron, and the address link opens Google Maps in a new tab (`target="_blank"`) | `{t:'location', show:['name'?,'phone','address','chevron'], ...full record}`. The record includes `mapsNewTab` (true here) |
| `location-hours-1` | 0/2/31 | `div.hours > dl > div.hour > dt.hour__label ("monday:") + dd.hour__data ("9:00 am - 5:00 pm")` | labels are lower-case in the DOM and capitalised by CSS | `show:['hours']`, `hours:[{label, text}]` |
| `location-map-1` | 0/2/31 | `div.map > iframe#gmap_canvas[title="Google Map"][src="https://www.google.com/maps/embed/v1/place?key=…&q=place_id:ChIJY_IBgmWewYkR5dH3MXBDmeE"]` | keyed Maps Embed API, queried by place_id | `show:['map']`, `placeId`, `mapQuery` = name + address ("Academy Vision, 90 Atlantic City Blvd, Pine Beach, NJ 08741"), `mapTitle`. The rebuild must use a keyless embed queried by `mapQuery`, never by place_id |
| `location-review-carousel-1` | 0/1/0 (location page) | Embla carousel: `div.carousel__container > div.review__item > (content component) + div.review__stars[aria-label="5 out of 5 stars"]` ("⭐️⭐️⭐️⭐️⭐️"). 12 of 20 reviews show `div.content-excerpt` + `span.show-more-toggle` "Show More" and keep the full text in `div.content-full[style="display:none"]`. Controls: prev/next buttons, 20 dots `aria-label="Advance to slide N"` | no author, date or source is printed. The page's own JSON-LD (`@graph` LocalBusiness `review[]`, `aggregateRating` 5.0 / 20) carries `author.name` and `datePublished` for the same bodies | `{t:'reviews', items:[{quote (full), excerpt, rating, ratingOf, ratingLabel, stars, author, date, source:null, matchedFrom:'jsonLd'}], aggregate, ui:{showMore, previous, next, dot}}`. 20/20 matched to JSON-LD by normalised body text. `source` stays null: the platform is not named anywhere (UNVERIFIED) |
| `location-photos-1` | 0/1/0 | `div.location-photo-highlight > a.image-lightbox[href="#"] > img` + `div.location-photos > div.location-photo x3` | images on `storage.googleapis.com/ecp-samurai/.../conversions/*-responsive.webp` (no `@w_`). All 4 alts are "Practice Image" | `{t:'list', kind:'photos', items:[image + highlight?], ui:{lightbox}}` |
| `account-insurance-1` | 0/1/0 | `div.insurances > div.insurances__item > (div.insurances__logo > picture > source[webp] + img) + div.insurances__name` | 12 plans. Logos are platform-global (`cdn.patientengage.cloud/global/logos/insurances/`) | `{t:'list', kind:'insurance', items:[{name, logo}]}` |
| `account-frames-1` | 0/1/0 | same pattern (`frames__item / frames__logo / frames__name`) + `div.frames__show-all-wrapper > button "Show All"` | 26 brands. "Show All" is a JS reveal (inline script adds `frames--show-all`) | `kind:'frames'`, `ui:{showAll}` |
| `account-contact-lenses-1` | 0/1/0 | `div.lenses > div.lenses__item > (img) + div.lenses__name` | 7 products | `kind:'contact-lenses'` |
| `account-equipment-1` | 0/1/0 | **empty**: `<div class="cpt cpt--id-yQSo0lqd2Y cpt--type-account-equipment-1"> </div>` (`eye-care-services.html`), also empty after JS | | `kind:'equipment', items:[], empty:true` |
| `article-list-1` | 0/1/0 (home) | `div.article-item[data-link] > h3 title (link + chevron, aria-label) + content excerpt + "Read More" button` | 1 article | `kind:'articles', items:[{title, href, chevron, excerpt, ariaLabel, cta}]` |
| `childpages-2` | 0/3/0 | `div.childpage[data-link] > image link + h3 title (link + chevron) + div.childpage__excerpt` | services (6), eyeglasses (3), contact lenses (3) | `kind:'childpages', items:[{title, href, chevron, excerpt, image}]` |
| `sitemap-1` | 0/1/0 | `ul > li[style="margin-left:0|40px"] > a[href=absolute]` | 26 links. It omits the 3 team pages, the article and the location page | `kind:'sitemap', items:[{label, href, depth}]` (depth = margin-left / 40) |
| `privacy-policy-1`, `disclaimer-1`, `website-accessibility-policy-1` | 1 each | bare rich text inside the component (p, strong, em, ul, li, a) | the disclaimer names the platform vendor: `"...created by a Service provided by EyeCarePro and/or any affiliated companies..."` (`disclaimer.html`) | `{t:'legal', kind, html}` kept verbatim. Removing or rewording the vendor clauses is a decontamination decision, not taken here |
| `form-embed` > `form` | 0/2/0 | `div.cpt--type-form > div.form__success (hidden success text) + form.form[novalidate]` (no `action`) `> hidden inputs + div.fields > div.cpt--type-form-field-<kind> + div.form__submit > button[type=submit]` | 15 field kinds (3.3). Submission is by inline script: reCAPTCHA Enterprise token, then `fetch("https://app.patientengage.ai/api/lead/conversion",{method:"POST",body:i})` (`appointment-request-form.html`) | `{t:'form', id, identifier, fields[], submit, messages{success, error, submitting, validation{valueMissing?, radioGroup?, checkboxGroup?}}, action{attribute:null, method, novalidate, scriptEndpoint, scriptMethod, captcha}, hidden[]}`. `validation` = the copy the runtime writes into `div.field__error[role=alert]` on an empty Submit (`"This field is required"`, `"Please select an option"`, `"Please select at least one option"`), kept for the checks the form has fields for |
| `divider` | 0/1/0 (location page) | empty `section.cpt--type-divider` | | `{t:'divider'}` |
| `header-1`, `menu` | 31/0/0 | header bar, logo link, quick icons, `nav.menu > ul > li[.menu--has-children] > a + button.menu__accordion-toggle + ul.menu__submenu[hidden]` | `li.menu--mobile-only` "Home". Submenus are `hidden` until hover or toggle | `source-chrome.json` (section 6) |

### 3.3 Form fields (`cpt--type-form-field-*`)

15 kinds seen: `html`, `content`, `heading`, `textfield`, `textarea`, `telephone` (`data-phone-format`), `email`, `name`
(first/last, plus prefix/suffix on the registration form), `address` (3 fields with different parts: `w9Hs2GaxJb` = street, city, state `<select>` of 50 states + blank, zip;
`D8wPrBXP3I` and `SBLHbavxuY` = street, line 2, city, with no state or zip. Each also has a hidden country input `value="United States"` and a hidden aggregate `name="address"`),
`date` (day / month / year selects: 32 / 13 / 102 options), `time` (hour, minute number inputs + AM/PM select), `radio`,
`checkboxes`, `select`, `patient-status` (radio). (`audit/raw/patient-registration-form.html`, `appointment-request-form.html`.) `chips` is a presentation class added to radio/checkbox groups
(-> `presentation:'chips'`).

Per field the model keeps: `id`, `type`, `label` (field__label or legend text, without the star), `requiredMark` ("*"),
`required`, `labelFor`, `legend`, `description`, `conditional` (`cpt--conditional` = hidden until its rule matches),
`submitName` (the hidden aggregate input the platform posts, e.g. `name="name"`), and `inputs[]` =
`{el, type, name, id, value, placeholder, autocomplete, inputmode, min, max, step, rows, phoneFormat, required, requiredGroup,
ariaLabel, label (paired by label[for]=id), labelHtml (when the label holds a link), options[{value,label}]}`.

Conditional logic is parsed from the form script's rule array (`[{action:"show",component_id:"tdu4MOGpRd",rules:[{...input_id:"m8rF5M22ag_input",operator:"is",value:"Yes"}]...}]`
in `patient-registration-form.html`) into `field.showIf = {action, logic, enabled, when:[{field, name, operator, value, mode}]}`.
21 of the 79 registration fields carry `showIf`. The appointment form's rule array is empty (`[].forEach`).

Sensitive fields on the registration form (by label): "Social Security Number" (`(last 4 digits only!)`), date of birth,
medical / eye / drug history, insurance ids. Whatever form backend replaces the platform must be HIPAA-appropriate.
That is an operator decision, not this lane's.

## 4. Visibility variants, hidden copies, duplicates

- Breakpoint-only copies exist only in the header: the top bar `section.cpt--visible-xl.cpt--visible-lg` (desktop only)
  and the quick-icon group `cpt--visible-lg/md/sm`. The survey of all regions found no `cpt--visible-*` in `<main>`.
- Hero mobile copies: 3 (`index`, `about-us`, `our-eye-doctor`). Same master as the CSS background. Kept as `variant:'mobile-only'`.
- Hidden full texts: 12 review `content-full` blocks (`display:none`). Kept as `quote`, with the visible truncation as `excerpt`.
- Hidden form fields: 21 conditional registration fields. Kept with `showIf` and `conditional:true`.
- Hidden submenus (`ul.menu__submenu[hidden]`): kept as `menu.items[].children`.
- No duplicated content blocks. The parity occurrence check (section 9) confirms every 3+-word sentence the source prints n
  times is in the model at least n times.

## 5. Page model (`src/content/pages/<slug>.json`, `schema: 'avnj/page-model@1'`)

```
{ schema, path:"/eye-care-services/dry-eye-treatment/" (source own path), source:"audit/raw/<file>",
  rendered:"tmp/extract/rendered/<file>",
  meta:{ title, description, canonical (verbatim), robots (null on all 31), og:{...}, twitter?, verification?{google,bing},
         jsonLd:[ parsed objects, in source order ] },
  h1 (text of the first level-1 heading node, or null),
  counts:{ blocks, nodes, static, rendered },
  blocks:[ { cpt, id, at (UTF-16 offset of the block's start tag in the raw file), layout:{...}, background:{...},
             nodes:[ { t, ...fields, id (component id), col?, origin:'static'|'rendered' } ] } ] }
```

Node types: `heading`, `html`, `image`, `button`, `form`, `team` (kind list / biography / photo / positions / languages / highlights),
`location`, `reviews`, `list` (kind insurance / frames / contact-lenses / equipment / articles / childpages / sitemap / photos),
`legal` (kind privacy-policy / disclaimer / website-accessibility-policy), `divider`.

### 5.1 html sanitising
- Allowed: `p, h2-h6, ul, ol, li, strong, b, em, i, a[href,target=_blank], br, blockquote, table parts`. Every other tag is
  unwrapped (children kept). A `div`-like wrapper with only inline content becomes a `<p>`. A bare inline-only container is wrapped in one `<p>`.
  `h1` inside rich text would become `h2` and be reported. There were 0.
- Dropped with a report: media inside rich text (`img/iframe/video...`). There were 0. Scripts, styles, SVG and form controls are dropped silently.
  The decorative `span.link-chevron` "»" is dropped and recorded as `chevron:true`.
- Every attribute except `a[href]` and `a[target=_blank]` is removed (`class`, `style`, `data-start/end`, `data-post-id`,
  `aria-level`, `role`). Any surviving `cpt-- / ecp- / patientengage / class= / style= / data-` text is fatal. Audit: 148 html strings, 0 hits.
- Whitespace runs collapse to one space. Spaces next to block tags are removed. U+00A0 is written `&nbsp;`. All 148 strings are tag-balanced.
  Tags used: a, br, em, h2, h3, li, p, strong, ul.

### 5.2 Links
- Own-origin hrefs (`https://www.academyvisionnj.com/x`, `/x`, relative) -> own path with a trailing slash (`/x/`). Paths
  with a file extension keep their form. Query and hash are kept. `tel:`, `mailto:`, `#...` and other hosts stay as they are. `external` = http(s) to another host.
- `data-link` (clickable cards) is normalised the same way. The sitemap's absolute links become paths.
- Source paths are kept. The Eye Trends remap is applied by the build.

### 5.3 Images
- `master` = the CDN URL before `@w_`, or the whole URL when it has no `@w_` (team photos on `.../ecp-samurai/...`, location photos).
- Candidates = `img[src]` + `img[srcset]` + `picture > source[srcset]` (+ every inventory record with the same master). The
  winner is the record with the largest `intrinsicWidth`. Ties go to webp, then png, jpeg, svg, then the URL. `file` = its `localFile`
  (`assets/source/...`). `w`/`h` = that file's intrinsic size (not the master's declared `width`/`height`).
- CSS backgrounds go through the same rule, from the `url(...)` / `image-set(...)` values of `.cpt--id-<block>-background .cpt-background__image`.
- `alt` is verbatim, so some are weak (`"adobestock 383879247"`, `"woman blue eye closeup 640"`, 4x `"Practice Image"`).
  Improving them is a build/SEO decision.

### 5.4 Origin
`origin:'static'` = converted from `audit/raw`. `origin:'rendered'` = converted from the rendered snapshot, which happens when the static
component had no text or images and the rendered one does. Any component id present only in the rendered `<main>` is reported as
`rendered-only-component` (fatal). This run had 0 of either, so all 494 nodes are `static` (section 7).

## 6. Chrome model (`src/content/source-chrome.json`, `schema: 'avnj/source-chrome@1'`)

`evidence` (31 pages, 1 header variant ignoring current-state classes, 1 footer variant), `brandName` ("Academy Vision", from the
footer summary title), `skipLink`, `topbar` (desktop only: "Located at Pine Beach" -> `/hours-location/`, "Call: (732) 978-9306" ->
`tel:+17329789306`, "Book Appointment" -> `https://scheduleyourexam.com/v3/index.php/3197` new tab), `header` (logo + responsive
logo: the same 400px file, `alt="Academy Vision Logo with Eye Design"`, home aria-label "Link to homepage"; quick icons "Book
Appointment" / "Call Us" with their SVG icon files; the blue divider), `menu.items` (8 top items, 3 with children: 6 / 3 / 3;
"Home" is `mobileOnly`) and `menu.ui` (aria labels "Open menu" / "Close menu" / "Toggle Menu", plus `focusClose` "Close Nav", which the
menu script inserts at runtime, `origin:'rendered'`), `ctas`, `footer` (divider, dark section `#0f2a4a`, 3 columns: "Contact Us" + summary +
badge / "Locate Us" + map / "Hours" + hours; credit `© 2026 Powered by` + EyeCarePro logo link `rel="nofollow noopener"`, `target="_blank"` (`newTab:true`); legal links
Accessibility / Sitemap / Privacy / Disclaimer), `nap` (name, phone, phoneHref, addressText, address parts from the 7th JSON-LD block of `index.html`
(`Optician`, `"telephone": "+1-732-978-9306"`; street "90 Atlantic City Blvd", locality "Pine Beach", region "NJ", postalCode "08741", country
"US"), mapsUrl, mapsNewTab (true: the footer address link has `target="_blank"`), placeId, mapQuery, locationId "6999"), `hours` (7 rows), `social: []` (no social link on any page: a regex over all anchors
for facebook / instagram / twitter / x / youtube / linkedin / pinterest / tiktok / yelp found none), `badges` (1: `honoredlistee.png`,
`alt="Who's Who Honorees 2023 Marquis 125 Years Logo"`), `legalLinks`, `copyright` ("© 2026"), `phoneNumbers` (section 11).

## 7. JavaScript-rendered content

- Method: `node src/lib/extract.mjs --render`. One Chrome, 1440x900, each page scrolled to the bottom, then 1.5s settle. Snapshots in
  `tmp/extract/rendered/`. Blocked hosts: tag manager, analytics, session recording, call tracking, reCAPTCHA, the Maps embed and the
  client origin (`BLOCKED_URL_PATTERNS` in `src/lib/extract.mjs`). A localhost visit must not land in the client's analytics, and the crawl is done.
  Final capture traffic (`*.net.json`, 31 pages): allowed `cdn.patientengage.cloud` (249 images, 62 fonts, 1 other),
  `storage.googleapis.com` (7 images), 99 `data:` images. Blocked: 31 GTM, 31 Clarity, 2 reCAPTCHA, 33 Maps embed documents. 0 JS exceptions.
  - Deviation, reported: the first two captures let the 33 Maps embed documents load. `Network.setBlockedURLs` does not cover
    frame navigations, and with site isolation the iframe ran out of process. Fixed: site isolation is off for the capture, and Fetch
    interception now fails every matching request. Capture 3 is the one the model uses. (Only capture 1's `.main.txt` files were kept,
    in `tmp/extract/rendered-run1/`; the capture 1/2 network logs were not, so the "33 loaded" count is the lane's report and
    UNVERIFIED from files.)
- Result: **no visible text in `<main>` exists only after JavaScript.** All 31 pages give 0 rendered-only lines. On every page the
  normalised text of the rendered `<main>` DOM has the same length as the static `<main>` (e.g. `location-academy-vision` 7516 = 7516).
  The visible `<main>` text of capture 1 and capture 3 is byte-identical on all 31 pages.
  The 7 pages that `extract.log` flagged as render-risk ("script bytes Nx body text") are static. Their scripts are the shared
  platform runtime, not content renderers.
- Positive controls that JavaScript did run: the menu script's focus-trap link "Close Nav" is in the rendered header text
  (`tmp/extract/rendered/index.chrome.txt`), and Embla set `style="transform: translate3d(0px, 0px, 0px);"` on
  `.carousel__container` (`tmp/extract/rendered/location-academy-vision.html`, absent from the raw file).
- What JS changes is behaviour, not text: the carousel; review Show More (reveals `content-full`); frames Show All; form
  validation, phone formatting and conditional fields; menu hover/accordion/mobile portal; the data-animate reveal observer;
  smooth anchor scrolling; clickable `data-link` cards. The model records the text, and the build re-implements the behaviours.

## 8. Platform runtime inventory

### 8.1 What each script / embed does, and the rebuild decision

| item | pages | evidence | what it does | rebuild |
|---|---|---|---|---|
| JSON-LD | 31 (6-10 blocks each, 204 total) | `<script type="application/ld+json">` | 5 global blocks (Organization, WebPage, LocalBusiness, MedicalBusiness, Optician) + an invalid type `"MedicalSpecialty :: Optometric"` + page blocks (BlogPosting, Person/IndividualPhysician on team pages, `@graph` MedicalClinic / MedicalCondition / MedicalTest / ...) | **replace**: kept verbatim in `meta.jsonLd`. The SEO lane regenerates valid, consistent schema and drops the invalid type |
| `dataLayer=[...]` | 31 | `analytics_site_ga4:"G-Z85CLHN5BQ"` | GA4 property id for the tag manager | **drop** in the preview. Id recorded here for the operator |
| GTM loader + noscript iframe | 31 | `gtm.js?id=GTM-P6GSK34` | loads EyeCarePro's shared multi-client container (version 326, 254 tags, 237 predicates). It was fetched once from googletagmanager.com to `tmp/extract/gtm-GTM-P6GSK34.js` and never executed. The only rule tied to this host (predicate 233, `_cn` on the Page Hostname macro, `"arg1":"academyvisionnj.com"`, rule 223) adds a CallRail script `//cdn.callrail.com/companies/970875159/006ab7d4a920d7744885/12/swap.js` (dynamic phone-number swapping). 86 tags have at least one firing rule with no page-hostname predicate (a predicate on the Page Hostname macro `__u`/HOST, or a page-URL predicate that names a domain): GA4 events `__gaawe` 25, UA `__ua` 23, link-click listeners `__lcl` 14, custom HTML `__html` 6, Google tag `__googtag` 5, click listeners `__cl` 5, history listeners `__hl` 3, paused 2, Google Ads conversion `__awct` 1 (on `thank-you` paths), conversion linker `__gclidw` 1, element visibility `__evl` 1. The custom pixel template `__cvt_9845722_225` (`vtp_pixelId`) and Bing UET `__baut` are NOT container-wide: rule 48 fires them only where the hostname contains `seashorehouseoptical`. None of the 6 container-wide custom HTML tags writes visible text on a crawled path (tag 85, a DOM shortcode replacer, needs a `/campaign_landing` path). Whether the container-wide tags fire on this host depends on dataLayer values (**UNVERIFIED**) | **drop**. Re-adding analytics or call tracking is an operator decision at launch |
| Microsoft Clarity loader | 31 | `clarity.ms/tag/wu7lwlgea9` | session recording / heatmaps | **drop** |
| page runtime | 31 | `preferred_location`, `IntersectionObserver`, `[data-animate]`, `[data-link]` | sets a preferred-location cookie + localStorage from `meta[name=pe_location_id]` (that meta is only on `location-academy-vision`: `<meta name="pe_location_id" content="6999">`); reveal-on-scroll classes for `[data-animate]` (no element has the attribute); smooth `#` anchors; clickable cards; skip-link focus | **replace** with the rebuild's own JS (cards, skip link, reveal). The cookie is dropped |
| menu runtime | 31 | `.menu__accordion-toggle`, `responsive-menu-active` | desktop hover submenus (300ms close delay), keyboard toggle, mobile drawer portal at width <= 768, Escape to close, "Close Nav" focus trap | **replace** (build nav) |
| reCAPTCHA Enterprise | 2 (forms) | `recaptcha/enterprise.js?render=6LeJ…` | form bot check | **drop** with the platform form backend |
| form runtime | 2 | `fetch("https://app.patientengage.ai/api/lead/conversion",...)` | validation (inline `div.field__error[role=alert]`: `"This field is required"`, `"Please select an option"`, `"Please select at least one option"`; other invalid values get the browser's own `validationMessage`), conditional fields, phone mask, reCAPTCHA token, POST to PatientEngage, success/error UI (`"There was an error submitting your form. Please try again."`, `"Submitting..."`) | **replace**: the fields, rules and messages (including `messages.validation`) are in the model. A new backend is an open operator decision |
| phone formatter | 2 (5 instances) | `formatPhoneNumber` | `(###) ###-####` mask on `[data-phone-format]` | **replace** (small inline script) |
| frames Show All | 1 (eyeglasses) | `.frames__show-more-button` | reveals the full brand grid | **replace** or drop (build decides on the layout) |
| review Show More (x12) | 1 (location page) | `.show-more-toggle` | swaps excerpt for full text | **replace** |
| Embla carousel (library, inline) | 1 (location page) | `EmblaCarousel` | review slider | **replace** (any slider, or none) |
| photos lightbox | 1 (location page) | `image_lightbox_links` | opens practice photos in a lightbox | **replace** |
| Google Maps embed iframe | 31 (footer) + `hours-location`, `location-academy-vision` (33) | `maps/embed/v1/place?key=…&q=place_id:…` | keyed Maps Embed API by place_id | **replace** with a keyless embed queried by `nap.mapQuery` (name + address), never by place_id |
| `scheduleyourexam.com/v3/index.php/3197` | links in the `<main>` of 19 page models + the chrome (top bar, header icon) on all 31 | `href="https://scheduleyourexam.com/v3/index.php/3197"` | external online booking (link only, nothing embedded) | **keep** (link) |
| `www.eyecarepro.com` credit | footer | `© 2026 Powered by <img ... alt="EyeCarePro">` | vendor credit | **drop** (decontamination). The © year stays |
| `get.adobe.com/reader/otherversions/` | accessibility policy | `Download Adobe Acrobat Reader` | outbound link inside legal text | **keep** (part of the policy text) |
| fonts | 31 | `@font-face` Libre Baskerville 400, Montserrat 400/700 | brand fonts (7 woff2 in `assets/fonts/`) | **keep** (self-host) |
| head meta | 31 | `meta name="platform" / "site_id" / "post_id" / "pe_account_id" / "pe_website_id"`, `link rel="llms" href="/llms.txt"` | platform identifiers | **drop** (not in the model). Google/Bing verification tokens (home only) are kept in `meta.verification` for the operator |

No chat widget, video embed, social embed or third-party review widget exists on any page. Per page, every `<script>` matched
one of the purposes above (`unclassified: []` from `tmp/extract/runtime.mjs`).

### 8.2 Per page (from `audit/raw` + `tmp/extract/rendered/<slug>.net.json`, capture 3)

| page | inline/src scripts (by purpose) | iframes | rendered requests by host (1440x900 load) |
|---|---|---|---|
| about-us | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| appointment-request-form | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, reCAPTCHA enterprise.js, menu runtime, phone formatter, form runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 2, data: 3 |
| article-pediatric-eye-exams-beyond-school-screenings | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 7, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| contact-lenses | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 18, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| contact-lenses-contact-lenses-exams | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| contact-lenses-orthokeratology-ortho-k | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| contact-lenses-scleral-lenses | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| disclaimer | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 16, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services-comprehensive-eye-exams | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 11, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services-dry-eye-treatment | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services-eye-disease-management | ld+json x10, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 11, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services-lasik-co-management | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services-myopia-management | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 11, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eye-care-services-pediatric-eye-care | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 11, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eyeglasses | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime, frames show-all | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 25, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eyeglasses-avulux-migraine-lenses | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eyeglasses-stellest-lenses | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| eyeglasses-varilux-lenses | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 10, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| hours-location | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x2; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 7, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 2, data: 6 |
| index | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 14, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| insurance | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 21, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| location-academy-vision | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime, review show-more x12, Embla carousel, photos lightbox | www.google.com/maps/embed x2; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 2, storage.googleapis.com 4, data: 6 |
| our-eye-doctor | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 7, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, storage.googleapis.com 3, data: 3 |
| patient-registration-form | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, reCAPTCHA enterprise.js, menu runtime, phone formatter x4, form runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 2, data: 3 |
| privacy-policy | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| sitemap | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| team-dr-anthony-giallombardo-od | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 7, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| team-dr-marc-ullman-od | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 7, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| team-dr-tyler-lesko-od | ld+json x7, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 7, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |
| website-accessibility-policy | ld+json x6, dataLayer GA4 config, GTM loader, Clarity loader, page runtime, menu runtime | www.google.com/maps/embed x1; noscript: www.googletagmanager.com | 127.0.0.1:8814 1, cdn.patientengage.cloud 6, www.googletagmanager.com (blocked) 1, www.clarity.ms (blocked) 1, www.google.com (blocked) 1, data: 3 |

("www.google.com (blocked)" = the Maps embed document. On the form pages, the second one is reCAPTCHA enterprise.js.)

## 9. Text parity (`tools/text-parity.mjs`)

- Source units per page = the union of (a) **static**: the `<main>` region of `audit/raw/<slug>.html`, read with the tool's own regex
  pipeline (not the extractor's parser, so a parser bug cannot hide its own loss). The tag regex respects quoted attribute values,
  because the source prints `<option value="Select >">`. Comments and script/style/noscript/template/svg/iframe are removed, block tags
  become line breaks, inline tags become nothing, and entities are decoded. (b) **rendered**: `tmp/extract/rendered/<slug>.main.txt` (innerText).
- Lines are split on `. ! ?` + space. A unit needs a letter or digit, so the star emoji, the "»" chevron and lone asterisks are not sentences.
  Normalisation on both sides: entities, curly quotes, dashes, every space kind, zero-width/soft hyphen, `…` -> `...`, "»" removed, case
  folded (CSS uppercases headings and innerText applies it), no space before `, . ; : ! ? )`.
- Model text = every string under `blocks[].nodes`, with html tag-stripped by the same rules. Keys holding URLs, ids or enums are excluded.
  `meta`/`jsonLd` is NOT model text, so a sentence kept only in JSON-LD counts as lost. One composition rule: a form field prints `label + " " + requiredMark`.
- Found = the unit occurs on word boundaries, or (reported as "ws-only") after removing all whitespace.
- Occurrence check: a 3+-word unit printed n times in the static `<main>` must occur at least n times in the model. This is exempt for 2-word UI labels repeated per item ("Show More" x12 is stored once as `reviews.ui.showMore`).
- Chrome check: the header + footer of all 31 raw pages + `*.chrome.txt` against `source-chrome.json`.
- Result (this run): every page ok. `pages 31 | main units found 1614/1614 | ws-only 0 | missing 0 | occurrence shortfalls 0 | chrome 47/47 | pages without a rendered snapshot 0`.
  Per page found/total: about-us 19/19, appointment-request-form 30/30, article 67/67, contact-lenses 44/44, contact-lens-exams 32/32,
  ortho-k 29/29, scleral 30/30, disclaimer 15/15, eye-care-services 36/36, comprehensive-exams 40/40, dry-eye 37/37,
  eye-disease 40/40, lasik 32/32, myopia 36/36, pediatric 37/37, eyeglasses 75/75, avulux 32/32, stellest 27/27, varilux 28/28,
  hours-location 28/28, index 48/48, insurance 37/37, location 104/104, our-eye-doctor 22/22, patient-registration-form 414/414,
  privacy-policy 138/138, sitemap 26/26, team-giallombardo 11/11, team-ullman 17/17, team-lesko 18/18, accessibility 65/65.
- It failed first and the model was fixed: hours were stored under a key the tool treats as non-text (renamed `{label, text}`); the
  required "*" was not in the model (`requiredMark` added); the tool's own tag regex broke on `value="Select >"` (fixed).
- `--control`: (1) deletes "you've known us for years, or you will soon" from the about-us model in memory, and exactly that one miss is
  reported. (2) deletes one of the 2 copies of "i had my eye exam at academy." from the location model, and exactly that one shortfall is
  reported. Exit 0 = both fired.

## 10. Determinism

`node src/lib/extract.mjs` run A -> copy to `tmp/extract/det/A/` -> outputs deleted -> run B. `node tools/hashdir.mjs src/content/pages tmp/extract/det/A/pages`:
`33c0d5092cf0c94ca27ab6ac8320aec1bebd08f3cd9ed6c159b43024e47bc488 31 files` for both, IDENTICAL. `source-chrome.json` sha256
`b3f4872f…7754` for both. `node tools/hashdir.mjs src/content/pages --control` fired. After the verifier's extractor fix (Verification record) the
same A/B procedure gives `a4ada18c969c1667e3640caa54a7dc33beb530485f7b1f01672ea90954c316de` (31 files) and `source-chrome.json`
`eeb4372d665fbb12522673ed6e230556bee20335562dca1539019d4e2968db93`, IDENTICAL in both runs. What makes it deterministic: files are read in sorted order,
objects are built in a fixed key order, there is no clock or random input, and the rendered snapshots are inputs (re-capturing them can
change nothing in `<main>`, as capture 1 vs capture 3 showed).

## 11. Decisions, risks and open questions

Riskiest extraction decisions:
1. **No node comes from the rendered DOM.** This rests on the 0-line diff in section 7 and on the capture blocking GTM. GTM could inject content.
   The static container scan found no host rule for academyvisionnj.com other than the CallRail swap script, which rewrites phone numbers.
   An unblocked live visit is **UNVERIFIED**. If CallRail swaps numbers for some visitors, the printed number may not be the practice's main line.
2. **Location record merged page-wide.** Each `location` node carries the full GSP-6999 record (name from the footer summary title,
   address, phone, hours, mapQuery), and `show` lists what that component printed. A summary that prints a different value is reported. None did.
3. **Review authors and dates come from JSON-LD, not the page.** The page prints only stars + text. The `author`/`date` values are the
   page's own structured data, matched by normalised body (20/20). `source` is null.
4. **Kicker hint** is a structural heuristic (`hint:'kicker'`, 20 nodes). The text is unchanged.
5. **Images use the largest local variant**, not the variant the page used at a given width. `w`/`h` are the file's own size.
6. **html normalisation** is not byte-verbatim: attributes are stripped, whitespace is collapsed, and inline-only containers are wrapped in `<p>`. The text is preserved (parity 1614/1614).

Source inconsistencies for the operator (recorded, not resolved):
- **Two phone numbers.** (732) 978-9306 is printed in the NAP, the top bar, the footer and the buttons (`tel:+17329789306`). (732) 736-1700 appears in the header
  "Call Us" icon on all 31 pages (`<a href="tel:+17327361700" target="_self" aria-label="Call Us" class="icon">`), in two buttons on
  `eye-care-services` (`<span class="button__label">(732) 736-1700</span>`), in the `sitemap` meta description (`Call (732) 736-1700`), and in JSON-LD (`"telephone": "(732) 736-1700"`). In JSON-LD it sits in 4 blocks on every page (LocalBusiness, MedicalBusiness, Optician, `MedicalSpecialty :: Optometric`), in the MedicalClinic `@graph` blocks of 6 service pages, and in the `worksFor` organization of the 3 team Person blocks. The newer JSON-LD uses `+17329789306` / `+1-732-978-9306`. `source-chrome.json phoneNumbers` lists them.
  Which number is primary is **UNVERIFIED**.
- **Canonicals pointing elsewhere.** The 3 team pages declare `<link rel="canonical" href="https://www.academyvisionnj.com/our-eye-doctor/">`, and the location page declares
  `.../hours-location/`. The model keeps them verbatim in `meta.canonical`. The SEO lane decides (normally self-canonical).
- **No h1** on the article page (`audit/content-inventory.json` `"h1": []`). `h1: null`. The BlogPosting JSON-LD has `"headline":"Pediatric Eye Exams: Beyond School Screenings"`.
- **Empty platform slots:** team positions / languages / highlights (3 pages) and the equipment list (eye-care-services) are empty
  in the source and after JS. The model keeps them as `empty:true`. Do not fill them with invented facts.
- **Sitemap page** lists 26 links. It omits the team, article and location pages.
- **Platform vendor text** inside the disclaimer, and the "Powered by EyeCarePro" credit. Keep or remove is a decontamination decision.
- **Invalid JSON-LD type** `"MedicalSpecialty :: Optometric"` (31 pages).
- **Sensitive registration form** (SSN last 4, medical history). It needs a compliant backend before it goes live.
- Casing quirks are verbatim: menu "Pediatric Eye care", "Contact Lenses Exams", hours labels "monday:" (CSS capitalises them).
- (verifier) **Empty select.** The registration form's "Communication Preference" `<select name="communication-preference">` has no `<option>`
  at all (`audit/raw/patient-registration-form.html`: `name="communication-preference"></select>`). The model keeps `options: []`. Do not invent options.
- (verifier) **Inconsistent `rel="nofollow"`.** Of the 58 booking links (`scheduleyourexam.com/v3/index.php/3197`) in `<main>` on 19 pages, only 3
  "Book Appointment" buttons (`contact-lenses`, `hours-location`, `insurance`) carry `rel="nofollow"`. The model now keeps it as `button.rel`.

UNVERIFIED (not checked this run): which tags of the shared GTM container fire for this host. Whether CallRail swaps the printed
number. The review platform. Any change on the live site after the 2026-10-08 crawl.

## Verification record

Date: 2026-10-08. Independent verifier of the EXTRACT lane. Every number below was re-measured with the verifier's own scripts in
`tmp/verify-extract/` (each with a positive control that fired), not with the lane's scripts, except where the lane's tool was run on purpose
(its controls fired too). No network request reached www.academyvisionnj.com; the GTM container file was read as data and never executed.

**What was checked, with counts**

- **Determinism** (`vhash.mjs`, own sha256 tree hash, control fired). Before any change: run 1 and run 2 (run 2 from an empty output dir) were
  byte-identical, and an independent re-implementation of the hashdir format gave the lane's `33c0d509…c47bc488` (31 files) and
  `source-chrome.json` `b3f4872f…26417754`. After the fix below: run A and run B (from empty) are identical, `a4ada18c…0954c316de` /
  `eeb4372d…2968db93`; `tools/hashdir.mjs` prints the same aggregate. A structural JSON diff of before vs after shows exactly 16 changed paths, all intended.
- **Lane controls re-run**: `extract.mjs --control` fired; `text-parity.mjs` 1614/1614, chrome 47/47 (1 ws-only), 0 missing, 0 shortfalls, both before
  and after the fix, and all 31 per-page numbers in section 9 match; `text-parity.mjs --control` fired (both controls).
- **Own render probe** (`probe-capture.mjs` + `probe-compare.mjs`). In-process server on 127.0.0.1:8824, one headless Chrome (`tools/cdp.mjs`
  `launch()`), Fetch interception + `setBlockedURLs` on tag manager, analytics, Clarity, CallRail, Meta, Bing, reCAPTCHA, Maps, `patientengage.ai`,
  `scheduleyourexam.com`, `eyecarepro.com`, the client origin. Log: every GTM / Clarity / reCAPTCHA / Maps request blocked, 0 requests to the client
  origin or the form backend, 0 JS errors. 12 pages: the 6 required (index, location-academy-vision with the review carousel,
  patient-registration-form, team-dr-marc-ullman-od, insurance, eyeglasses) plus the other 6 render-risk pages. Each at 1440x900 and 390x844
  (mobile emulation, `innerWidth` asserted), in 3 states: initial, expanded (12 review "Show More" + frames "Show All" clicked), and validation
  (Submit clicked on the empty form). Own model-text walk, normalisation and matching. Before the fix: 641 visible units, **5 missing**, all
  form validation copy. After the fix: 641/641. Hidden-inclusive `<main>` text after JS: 0 missing. CSS `::before/::after` text in `<main>`: none.
  Visible placeholders and option labels: 243, all in the models. `<img alt>`: all in the models. Header and footer: 29 units, all in
  `source-chrome.json`. Control fired: a deleted review sentence and an injected sentinel line were both reported.
- **No invented text** (`reverse-check.mjs`): 3136 model strings checked against their own raw page (text, attributes, scripts, JSON-LD). 13 are
  not verbatim, and all 13 are disclosed compositions: 10 `mapQuery`, 2 provenance labels (`jsonLd`, `jsonLd (Optician)`), 1 templated
  `Advance to slide {n}`. Control fired.
- **Attribute text in raw `<main>`** (`attr-check.mjs`): alt 147/147, placeholder 5/5, title 2/2, aria-label 63/69. The 6 not kept are 3 labels on
  the non-interactive team button wrapper `<div>`s (the inner links' "Read More about Dr. …" labels are kept) and 3 on hidden country inputs
  (`type="hidden"`, `value="United States"`, no name). Control fired.
- **Model audit** (`audit-model.mjs`, control fired). 173 image references: 0 missing files, 0 not the largest variant, and w/h equal both the
  inventory and the real file header on 173/173. 147/147 page image records carry an alt. 148 html strings (147 pages + 1 chrome): 0 residue for
  `cpt--|ecp-|patientengage|class=|style=|data-|id=|role=|aria-`, 0 unbalanced; tags a, br, em, h2 (article only), h3 (4 pages), li, p, strong, ul.
  Per model for index, about-us, location-academy-vision, patient-registration-form and disclaimer: residue 0. Hrefs: 272 occurrences, 36 distinct,
  30 internal, all in `/a/b/` form, all crawled pages, 0 own-origin absolute URLs. Raw `<main>` links + `data-link`: 256 checked, 4 `href="#"`
  lightbox anchors, 0 not in the page model. Booking links: raw = model on every page (58 in `<main>` on 19 pages). Kicker hints: 20, all eyebrow
  lines. Reviews: 20/20 unique body matches with the page's JSON-LD; author 20/20 and date 20/20 equal; aggregate 5.0 / 20; source null.
- **Meta and structure** (`audit-meta.mjs`, control fired). On 31/31 pages, path, title, description, canonical, robots (null), og:title,
  JSON-LD block count and h1 all equal the raw page. 142/142 block `at` offsets point at that block's start tag. All 494 node ids exist in the raw
  file, and the counts add up (494 static, 0 rendered).
- **Raw anatomy** (`audit-raw.mjs`, regex, not the extractor's parser). These all reproduce: 59 component types, every count in the 3.1/3.2
  tables, 4 head `<style>` blocks, 1 header variant ignoring current classes (20 raw variants), 1 byte-identical footer, `cpt--visible-*` only in
  the header (155 tokens), 3 hero mobile copies, 20 reviews / 12 `content-full`, 79 registration fields / 21 conditional / 21 rules, the select
  option counts 51 / 32 / 13 / 102, 16 `form-field-*` tokens (15 kinds + `chips`), JSON-LD 204 blocks (16 pages with 6, 14 with 7, 1 with 10),
  `MedicalSpecialty :: Optometric` on 31, the phone facts of section 11, the 4 non-self canonicals, 0 robots meta, 0 article h1, verification tokens
  on home only, `pe_location_id` only on the location page, empty slots (raw and rendered), booking links in 19 page mains + 31 headers, 0 social
  links, footer images (badge + vendor logo), lists 12 / 26 / 7, childpages 6 / 3 / 3, sitemap 26 links missing the 5 pages named, the CSS facts
  quoted, 33 Maps iframes, GTM / GA4 / Clarity ids, the form endpoint and `<form novalidate>` without action, and no chat, video or review widget.
- **Capture 3 and JavaScript** (`net-verify.mjs`). These reproduce exactly: 249 Image / 62 Font / 1 Other from cdn.patientengage.cloud, 7
  storage.googleapis.com, 99 data:, 31 GTM + 31 Clarity + 2 reCAPTCHA + 33 Maps documents blocked, 0 exceptions, 33 fetch-blocked. Positive
  controls: "Close Nav" is in the rendered chrome and not in the raw; the Embla transform is in the rendered DOM and not in the raw.
  Capture 1 vs capture 3 `main.txt`: 31/31 byte-identical. Static vs rendered `<main>` text with the verifier's own pipeline: **identical** (not just
  equal length) on 31/31.
- **Runtime table** (`table-verify.mjs`, control fired). The 31 rows of section 8.2 equal `tmp/extract/runtime-table.md`. ld+json counts, script
  purposes, Maps iframe counts and per-host request counts match the raw pages and `*.net.json` on 31/31 rows.
- **GTM container** (`gtm-verify.mjs`, parsed as data). Version 326; 254 tags, 237 predicates, 227 rules, 74 macros. Predicate 233 (`_cn`, Page
  Hostname, `academyvisionnj.com`) is the only one naming the host. Its rule 223 adds tag 239 (`__html`, CallRail `swap.js`). The container-wide count
  is corrected below.

**Corrections made**

1. Extractor defect, fixed in `src/lib/extract.mjs`. The model lacked the form validation copy that the runtime prints on an empty Submit
   (`"This field is required"`, `"Please select an option"`, `"Please select at least one option"`), although the runtime row said "the
   messages are in the model". The verifier's render found 5 missing visible units (3 on patient-registration-form, 2 on appointment-request-form).
   Fix: `messages.validation{valueMissing?, radioGroup?, checkboxGroup?}`, read from the runtime script and kept for the checks the form has
   fields for. A needed string that cannot be read is the new fatal problem `form-validation-message-unparsed`. Its control
   (`extract-fix-control.mjs`) fired. Before: 641 visible units, 5 missing. After: 0 missing.
2. Extractor fidelity, fixed. Link attributes the model dropped are now kept: `button.rel` (3 buttons with `rel="nofollow"`); `mapsNewTab`
   on every location record (the address link has `target="_blank"`); `footer.credit.newTab`. All additive. The node, block and parity counts
   are unchanged.
3. Section 8.1 GTM row, and claim 9: the "117 container-wide tags" figure is wrong. It came from a text heuristic (`.com/.net/.org/.ca/.us"`) that
   misses 31 page-hostname predicates written as bare names or regexes (e.g. `_cn "seashorehouseoptical"`, `_re ".*scheduleyourexam.com.*"`). With
   hostname predicates identified by their macro (Page Hostname `__u`/HOST, or a page-URL predicate naming a domain), the count is **86**.
   The custom pixel template `__cvt_9845722_225` and Bing UET `__baut` were named as container-wide, but rule 48 gates them to hostnames
   containing `seashorehouseoptical`.
4. Sections 1 and 10: determinism hashes updated to the post-fix values; the lane's values are kept as history.
5. Section 2: the CSS also has 5 min-width rules and one `prefers-reduced-motion` block, which the text omitted.
6. Sections 3.2, 6, 8.1 and the run table: schema text updated for `validation`, `rel`, `mapsNewTab`, `credit.newTab` and the new fatal problem.
7. Section 11: added 2 source inconsistencies, the option-less "Communication Preference" select and `rel="nofollow"` on only 3 of the 58 booking links.
8. Section 7: noted that only capture 1's `main.txt` files were kept, so the "first two captures loaded 33 Maps documents" statement cannot be checked from files.
9. Section 3.3: the `address` kind was described as if every field had street, line 2, city, state and zip. In the raw there are 3 address fields
   with different parts: one has no line 2, and two have no state or zip. The model already matched the raw, so only the text was corrected.

**Could not check**

- An unblocked live visit: which container-wide GTM tags fire for this host, and whether CallRail swaps the printed number. This was not
  attempted, because it would send hits to the client's analytics.
- The capture 1/2 network logs, which were not retained.
- The lane's first-run parity numbers ("1592/1614 … missing 23"): no log was kept, and the pair is arithmetically inconsistent with the tool's
  scoring, where found + missing = total. The three failure modes it describes are real: the raw has 8 `<option value="Select >">`, and the
  verifier's own naive tag regex broke on them the same way.
- The review platform.
- The live site after the 2026-10-08 crawl.
- Runtime strings that cannot appear with this markup were not kept. The file-size and file-type alerts and "Please provide your signature" exist
  in the form runtime, but neither form has a file or signature field. The lightbox's JS-created aria labels ("Close lightbox", "Previous image",
  "Next image") are not visible text and belong to a behaviour the build re-implements.
