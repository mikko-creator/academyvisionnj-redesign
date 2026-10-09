# OPEN DECISIONS — Academy Vision redesign

Consolidated 2026-10-08 by the orchestrator from every lane's open questions and flags:
- `facts/service-evidence.json` (conflicts C1-C10, gaps G1-G22);
- `src/content/restructure.json` (Q1-Q9, deviations V1-V5);
- the adopted pages' `flags`;
- `docs/DESIGN-SPEC.md` §18 (O1-O12);
- `docs/BUILD-CONTRACT.md` §4;
- the imagery and brand reports.

Each item names its evidence. **Status** is one of three values:
- `OPEN`: nobody has decided it yet;
- `DEFAULTED`: the build applies the stated default until someone decides;
- `INFO`: recorded only.

---

## A. For the operator (design and build)

| id | decision | default in this build | evidence |
|---|---|---|---|
| A1 | Show all 23 adopted pages in the menus as Eye Trends does? | DEFAULTED: yes. The IA lane's `hold` flags are not applied (operator asked for the full Eye Trends structure). The 8 partial/no-evidence pages are listed in C below | BUILD-CONTRACT 4.1; restructure.json nav holds |
| A2 | Departures from the brand doc: mixed-case display headings (source CSS forces UPPERCASE), a drawn swoosh instead of the 100×5 px rule, pill buttons, and a measured glass-contrast gate instead of the 0.88-alpha veil | DEFAULTED: accepted as part of the total redesign; words unchanged | DESIGN-SPEC O9; BRAND-SYSTEM §7 |
| A3 | Publish a preview (public GitHub repo + noindex GitHub Pages, like the other reforge projects)? | DECIDED (operator, 2026-10-09): "Public repo + Pages preview". Published to https://github.com/mikko-creator/academyvisionnj-redesign (`main` = source + dist; raw crawl and stock originals excluded) and https://mikko-creator.github.io/academyvisionnj-redesign/ (`gh-pages`). Every page is noindex, nofollow and robots.txt disallows all. Live-checked: the home page and CSS are byte-identical to the build, 79/79 pages are noindex, and the 404 is styled | operator answer in session 33d21252 |
| A4 | Children's Eye Care group head: keep Academy Vision's pediatric page at `/services/pediatric-eye-exams/` with a new hub page, or swap them (Q8)? | DEFAULTED: keep (IA decision D1, upheld by the IA verifier) | restructure.json decisions D1, Q8 |
| A5 | Download the full-resolution Adobe Stock originals from the CDN (57 files, 453.6 MB) for sharper full-bleed photos on DPR-2 screens? | DEFAULTED: no. The local 2000 px files cover 1280×585 @1.5 and 1600×662 @1.2 | IMAGE-INVENTORY §2; BUILD-CONTRACT 4.12 |
| A6 | AI-upscale the three doctors' headshots (223-300 px)? | DEFAULTED: no. Shown at no more than about 150-196 CSS px. Any upscale needs the practice's approval plus a fidelity check | BUILD-CONTRACT 4.10 |
| A7 | Glaucoma page hero: all three generated attempts failed review | DEFAULTED and applied (INTEGRATOR 2026-10-09): Academy Vision's own stock photo `photo-as-293097203` (older patient at an eye-imaging instrument) in the half title band, with an accurate alt and no AI label (image-plan `reuse`; BUILD-NOTES 4.1 row 2) | image-plan.json hero-glaucoma-management; DESIGN-SPEC O7 |
| A8 | Import the design panel's reviewed kids'-frames cut-out (generated during the panel) for the home page? | DEFAULTED: no; the spec falls back to `cut-eyeglasses-navy` | DESIGN-SPEC O5 |
| A9 | Correct obviously wrong source alt texts (a lensmeter called "microscope", an eye-drop photo called "thermometer", "nose swabbed", "brushing her teeth")? | DEFAULTED: kept verbatim. Correcting them is a declared accessibility edit | DESIGN-SPEC O3 |
| A10 | Safari and Firefox testing (backdrop-filter, mask-composite, `:has()`, scroll timelines) | OPEN: only Chrome is tested; fallbacks are coded | DESIGN-SPEC O11 |

## B. For the practice: facts on the live site that disagree or are missing

| id | question | default in this build | evidence |
|---|---|---|---|
| B1 | **Which phone number is current?** (732) 978-9306 is printed on all 31 pages. (732) 736-1700 is the header call icon on phones, older JSON-LD, two buttons on `/eye-care-services/` and the roadside sign | DEFAULTED: 978-9306 everywhere (visible and JSON-LD) | C1; BUILD-CONTRACT 4.3 |
| B2 | Ownership wording: Dr. Giallombardo alone (his bio, JSON-LD) or Dr. Lesko and Dr. Giallombardo jointly (Dr. Ullman's bio: ownership passed to both in early 2026)? And the doctors' order | DEFAULTED: each bio verbatim; source order | C2, C3 |
| B3 | Primary booking path: the external scheduler (scheduleyourexam.com) or the on-site Appointment Request Form? Who is the scheduler's vendor? | DEFAULTED: "Book Appointment" opens the scheduler (as live); the form stays at `/appointment-request-form/` | C7, G19; BUILD-CONTRACT 4.4 |
| B4 | The `/insurance/` meta says "most vision and medical insurance"; the page lists 12 plans. And the CareCredit sentence ends mid-thought ("…anything not fully.") | DEFAULTED: both kept verbatim | C8, C9 |
| B5 | Claims that appear only in structured data or meta, never in visible copy: low vision care, allergy treatment, LipiScan / InflammaDry, CRT and VST ortho-k, monthly lenses, and others | DEFAULTED: kept only where the source's page-level JSON-LD already had them; no new page states them | C10 |
| B6 | The LASIK page links "comprehensive eye evaluation" to the pediatric page (looks like a source mislink) | DEFAULTED: kept, remapped to `/services/pediatric-eye-exams/` | Q5 |
| B7 | The 20 reviews: which platform do they come from, and may they be shown as a static list (with author and date from the source JSON-LD)? One reviewer shares the owner's surname (relationship unknown) | DEFAULTED: all 20 shown verbatim on `/reviews/`; no platform named; that review is not featured on the home teaser | Q3, G11; DESIGN-SPEC O4 |
| B8 | Missing facts a modern site usually shows: email (G1), fax (G2), holiday hours (G3), an after-hours or urgent-visit policy (G4; the site says only "whenever possible"), languages (G5), Dr. Giallombardo's education and years (G6), Dr. Lesko's graduation year and certifying bodies (G7), licences and memberships (G8), equipment list (G9; that component is empty on the live site), staff (G10), the full insurance list (G12), prices (G13), cancellation policy (G14), social profiles (G15; only a Facebook URL in JSON-LD), legal entity name (G16), year of the move to Pine Beach (G17), who received the Who's Who honour (G18), surgeon partners (G22) | INFO: nothing invented; supply what you want shown | FACTS-EVIDENCE gaps |

## C. For the practice: services on the newly written pages

These 23 pages are new writing in Academy Vision's voice. They follow the purpose of each Eye Trends page; no Eye Trends
text was used. Measured 2026-10-08 with `tools/overlap-check.mjs` on the visible fields only (title, meta, h1, lede,
sections, FAQ, CTA): the longest span shared with the Eye Trends crawl is 6 words, in 6 of 23 pages. Every one is a
stock phrase ("go to the nearest emergency room", "at the back of the eye", "time to have it looked at"); the fail
threshold is 8, and the planted 21-word control sentence was detected (`tmp/orch/overlap-visible.json`). Practice facts
come only from Academy Vision's own site. Please confirm the services before launch.

**C1. Partial or no evidence that Academy Vision offers the service.** Each page explains the topic, invites a call
and makes no availability, timing or treatment promise. Where the topic is not evidenced, the h1 is informational.

| page | what the practice should confirm |
|---|---|
| `/services/childrens-contact-lenses/` | general first contact lenses for children and teens (the site shows kids' lenses only for myopia control); minimum age; follow-up schedule |
| `/services/pink-eye-conjunctivitis/` | that the doctors diagnose and treat pink eye; urgent-visit policy |
| `/services/foreign-body-removal/` | foreign-body removal, including metal and rust rings (Dr. Ullman's bio mentions "ocular injuries") |
| `/services/flashes-floaters/` | visits for new flashes or floaters; dilation; where retinal tears are referred |
| `/services/same-day-contacts/` | whether patients leave a fitting wearing lenses, and for which prescriptions (the site's same-day claim covers glasses only) |
| `/services/gas-permeable-contacts/` | corneal rigid gas permeable fittings (the site names scleral and ortho-k lenses only) |
| `/products/sunglasses/` | plano or prescription sunglasses, and which brands are sunwear (the page names only the polarized-lens option) |
| `/terms/` | **attorney review required.** These are new plain-language terms with no governing-law clause, no legal entity and no effective date; content ownership must be reconciled with the disclaimer's EyeCarePro clause |

**C2. Clinical wording for a doctor to review.** All of it is general patient education, checked by copy checkers
but not against a cited source:
- `/services/emergency-eye-care/`: the emergency-room list, and "skip the call, go straight to the ER, day or night";
- `/services/pink-eye-conjunctivitis/`: the virus/bacteria split by age, hygiene advice and the newborn sentence;
- `/services/red-eye-treatment/`: the visit steps, and mild / prompt / emergency triage;
- `/services/flashes-floaters/`: the symptom descriptions and the emergency list;
- `/services/foreign-body-removal/`: the first-aid and emergency lists;
- `/services/gas-permeable-contacts/`: the last FAQ;
- `/services/senior-eye-exams/`: the sudden-change answer;
- `/services/childrens-contact-lenses/`: the safety guidance;
- `/eye-health/`: everyday habits, exam intervals, urgent signs, first aid (the 15-minute rinse);
- `/products/sunglasses/`: sun-damage symptoms and eclipse viewing.

**C3. Page-specific questions:**
- **Glaucoma**
  - Which tests and instruments to name.
  - Whether the doctors prescribe drops or refer for laser or surgery.
  - Approve naming Dr. Lesko and Dr. Ullman.
- **Diabetic exams**
  - Dilation or retinal imaging.
  - Whether reports go to the patient's doctors.
  - Billing, and which of the 12 plans apply.
- **Macular degeneration**
  - Retinal imaging, and Amsler grids for home use.
  - The supplements wording.
  - The referral path for wet AMD.
  - Approve naming Dr. Lesko.
- **Cataract co-management**
  - Whether post-op visits happen at Academy Vision.
  - Whether the practice provides the Light Adjustable Lens light treatments.
  - Which surgeons to name.
  - Approve naming Dr. Ullman and Dr. Lesko.
- **Adult and senior exams:** whether to mention dilation and named tests, which appear only in structured data today.
- **Designer frames**
  - Whether the 26-brand list is current.
  - Whether the hedged same-day glasses sentence still holds.
- **Kids' eyewear:** which brands come in children's sizes.
- **Back-to-school:** any seasonal scheduling. Today none is stated, and weekends are closed.

## D. Before launch (not decisions, work)

| id | item | state |
|---|---|---|
| D1 | **Forms**: the appointment and registration forms are built but unwired. They post nowhere (`data-sr-unwired="1"`), and JS stops submission with a notice that never claims success; it reuses the source's own error copy with Book and Call buttons. The registration form collects SSN digits, date of birth and medical history, so it needs a HIPAA-appropriate backend. The appointment form also prints the source's own sentence "Details are stored securely and not sent by email." (kept verbatim). That sentence is only true once a secure backend is wired, so keep, reword or remove it at launch | OPEN |
| D2 | Analytics and call tracking (GA4 G-Z85CLHN5BQ, Clarity wu7lwlgea9, CallRail) were removed for the preview. Re-add them at launch? | OPEN |
| D3 | The disclaimer's own text keeps its EyeCarePro clauses verbatim. Update it once the site leaves EyeCarePro | OPEN |
| D4 | Licences: Adobe Stock and Shutterstock files for a new site; the Essilor-looking photo; consent for the people in the practice photos (three women; the woman in the illustration) | OPEN |
| D5 | The comic-book illustration on the location page shows a well-known copyrighted superhero. It is **removed** from the rebuild until rights are confirmed | DEFAULTED (removed) |
| D6 | Logo: supply a vector (SVG) master; confirm the legacy red eye-and-starburst mark is retired (the rebuild's JSON-LD uses the current navy/blue mark) | OPEN |
| D7 | Doctor headshots: supply higher-resolution photos | OPEN |
| D8 | The redirects (24 moves, both `/old` and `/old/`) were simulated from the rule tables. Test them on the real host | OPEN |
| D9 | AI provenance: generated stills and their WebP variants carry an IPTC `trainedAlgorithmicMedia` XMP label. The MP4 and WebM loops carry the comment tag "AI-generated with Higgsfield (Kling image-to-video); IPTC digital source type trainedAlgorithmicMedia" (BUILD-NOTES 4.1 row 3). The practice should know that these images are generated: none shows its staff, patients or office | INFO |

## E. Removed on purpose (recorded)

- Platform runtime: GTM, Clarity, CallRail, reCAPTCHA, the PatientEngage scripts and form endpoint, and the keyed Maps
  embed (replaced by a keyless embed queried by name and address).
- The "Powered by EyeCarePro" footer credit.
- The comic-book illustration `practice-35053-c2274987` (D5).

## F. From QA round 1 (appended 2026-10-09 by the DOCS role)

The QA round sent these items to the operator or left them deferred. Each **evidence** cell names the reviewer's
finding id, recorded in BUILD-NOTES 5.1. A number marked "DOCS measured" was measured on the final `dist/`
(`41df3b61…`) in the DOCS stage; every other number is the fixer's or a reviewer's. The ids QA1-QA10 are new and do
not reuse the reviewers' F/V/CSP ids.

| id | decision or item | default in this build | evidence |
|---|---|---|---|
| QA1 | **404 page:** add a sentence that explains the error (the page moved, or does not exist)? Any such sentence would be new copy | DEFAULTED: no sentence. The first screen shows "Page not found", Book Appointment, Call (732) 978-9306 and tiles to 5 service pages | V2 / CSP-6; DOCS measured the 404 `<main>` links |
| QA2 | **Unwired forms:** after a valid submit, the notice reads the source's own "There was an error submitting your form. Please try again.", which cannot succeed while the forms post nowhere. Keep it until the backend is wired (D1), or write new copy? | DEFAULTED: kept verbatim; 0 requests and no success claim (fixer's re-run) | F5; D1 |
| QA3 | **No-JS forms:** add a sentence beside the disabled Submit that explains why it is disabled? Academy Vision's Book and Call buttons already show in a `<noscript>` block | DEFAULTED: no sentence (it would be new copy) | F6 |
| QA4 | **Source alt texts** that the accessibility reviewer questioned on `/insurance/` and `/eye-doctor-pine-beach/` | DEFAULTED: kept verbatim (R-22), the same rule as A9 | F9; A9 |
| QA5 | **Meta description lengths** outside the usual range on 5 pages. Measured by DOCS on `dist/` in characters: the three bios 244, 198 and 186, and `/privacy-policy/` 54, all Academy Vision's own text. `/services/childrens-contact-lenses/` has 161, but it is new writing (adopted JSON), so it could be shortened without touching source text | DEFAULTED: unchanged | CSP-7 (the reviewer's `desc-length` findings in `tmp/review-content-seo-perf/static.json`) |
| QA6 | **In-page map titles:** the maps on `/eye-doctor-pine-beach/` and `/reviews/` keep the model's verbatim iframe title "Google Map". The footer map now has a descriptive title | DEFAULTED: verbatim | CSP-11 |
| QA7 | **Hero art direction:** on `/services/` the patient's back of head sits at the glass panel's edge, with about 20 px of crop room at 1600x662. The home hero has 0 px of horizontal crop room at 1280x585. Both need a different crop or a narrower panel | OPEN (DEFERRED by the fixer). `/insurance/` was shifted (x 0%), but its after-state was not re-captured | V8 |
| QA8 | **Home hero resolution:** the home hero photo's source file is 1600 px wide. A full-width hero at 1600x662@1.2 spans 1,920 device px (computed, not measured). The fixer kept the cap because there is no larger source and a person is never AI-upscaled. A sharper image would need a larger original (see A5); whether the CDN has one was not checked | OPEN (DEFERRED) | V4 |
| QA9 | **Image weight:** `/eye-health/`'s generated hero `hero-eye-health-2000` is 536,926 B, and the insurance logo `united-healthcare-400` is 95,308 B (DOCS measured both files in `dist/assets/img/`). The reviewer puts the insurance logos at 70-95 KB each. Re-encoding a generated image must keep its AI label (XMP) | OPEN (DEFERRED) | CSP-3, CSP-4 |
| QA10 | **Header under text spacing:** with WCAG 1.4.12 spacing at 1440 and 1600 px wide, the Book pill ends 12-15 px past the glass bar's right edge. The page does not scroll sideways and nothing is cut. Without JS, Esc cannot close a menu opened by CSS hover or focus | OPEN | FIXER:R1, BUILD-NOTES 5.3; F6 |
