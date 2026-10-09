# Site architecture: Academy Vision on the Eye Trends structure

IA lane, generated 2026-10-08 by `tmp/ia/build-restructure.mjs`, which also writes `src/content/restructure.json`. The doc and the JSON come from the same data. Inputs: the 31-page crawl of https://www.academyvisionnj.com/ (`audit/content-inventory.json`, `audit/seo-inventory.json`, `audit/site-inventory.json`, `audit/link-graph.json`, `audit/architecture.json`, the header, footer and main links of `audit/raw/*.html`); the 43-page Eye Trends crawl (`~/site-reforge/eyetrendsclearlake-com/audit/content-inventory.json` and the menus in its `audit/raw/index.html`); and Riverside's restructure (`~/riversidefamilyeyecare-reforge/src/lib/restructure.mjs`, `src/content/chrome.json`) as the worked example. No request went to either live site.

**Evidence rule.** Every Academy Vision quote below is verbatim text from the cited page (whitespace collapsed), pulled by `q()` in the generator and re-checked by `tmp/ia/verify-restructure.mjs`. Eye Trends belongs to Eye Trends, so its pages are described by purpose in this lane's own words, and no Eye Trends sentence or heading is reproduced. The verifier checks this file and the JSON for any run of 6 or more words that also appears in Eye Trends' text. Anything the files cannot settle is marked UNVERIFIED.

**Path convention.** In `restructure.json`, paths are own paths (no leading or trailing slash, `""` = home), as in Riverside's `MOVES`. In this doc they are written as served (`/services/`).

## 1. At a glance

| | |
|---|---|
| Academy Vision pages | **31**: 24 MOVE, 7 KEEP. None dropped, no two on one path |
| Eye Trends paths | **43**: 20 filled by an Academy Vision page (4 at the same path, 16 moved onto), 23 ADOPT |
| Restructured site | **54 pages** (31 Academy Vision + 23 adopted) |
| Redirects | **24** (301, one per moved page, no chains). Crawl aliases: 0 |
| Path deviations from Eye Trends | `/our-doctors/` (plural), `/eye-doctor-pine-beach/` (town); full list in section 9 |

## 2. Eye Trends path -> what fills it

Each Eye Trends path is either filled by an Academy Vision page (which keeps all of its own text at the new path) or ADOPTED (written later, in Academy Vision's voice, following that page's purpose and outline; section 5).

| # | Eye Trends path | New path | Filled by (Academy Vision) | Eye Trends purpose (own words) | Academy Vision evidence | Why |
|---|---|---|---|---|---|---|
| 1 | `/` | `/` | `/` (same path) | Practice home: introduction, service overview, booking | `/` "Your Eye Doctors in Pine Beach, NJ" | The practice home fills the Eye Trends home at the same path. |
| 2 | `/accessibility/` | `/accessibility/` | `/website-accessibility-policy/` | Website accessibility statement (footer legal link) | `/website-accessibility-policy/` "Our website strives to conform with the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, as practicable." | Same purpose as the accessibility page, and both footers label it "Accessibility". Riverside made the same move. |
| 3 | `/disclaimer/` | `/disclaimer/` | `/disclaimer/` (same path) | Disclaimer about the site's health information (footer legal link) | `/disclaimer/` "The information on this site is not presented as a substitute for informed professional advice and does not substitute for consultation with optometrist or any other health and/or medical professional." | Legal disclaimer. Eye Trends has the same path. |
| 4 | `/eye-doctor-clear-lake/` | `/eye-doctor-pine-beach/` | `/hours-location/` | Town landing page: local care, services, visit details, directions, hours, map ("Visit Us") | `/hours-location/` "Local Eye Doctors in Pine Beach, New Jersey" | The Hours & Location page (local intro, directions, parking, ramp, services, emergency care) fills the town page. The top-bar link and the insurance page's Contact Us button point to it. |
| 5 | `/eye-health/` | `/eye-health/` | **ADOPT** | Hub of plain-language eye health guides that route readers to services | `/` "Get Expert Eye Care Tips From Our Doctors" | Adopted (section 5.22). What Academy Vision has: One article, plus the home page's article list. Evidence: DIRECT. |
| 6 | `/insurance/` | `/insurance/` | `/insurance/` (same path) | Plans accepted and how vision and medical coverage differ | `/insurance/` "Insurance Plans We Accept" | Insurance and payment. Eye Trends has the same path. |
| 7 | `/our-doctor/` | `/our-doctors/` | `/our-eye-doctor/` | Doctor profile and practice story (the About Us menu target) | `/our-eye-doctor/` "Your Trusted Pine Beach Eye Doctors" | The doctors page fills the doctor page. Academy Vision has three optometrists, so the path is plural. |
| 8 | `/patient-forms/` | `/patient-forms/` | `/patient-registration-form/` | New-patient paperwork to complete before the first visit | `/patient-registration-form/` "For your convenience, patients can now register online by submitting our HIPAA compliant form here." | Academy Vision's only patient form, the online new-patient registration, fills the patient forms page. |
| 9 | `/privacy-policy/` | `/privacy-policy/` | `/privacy-policy/` (same path) | Privacy policy (footer legal link) | `/privacy-policy/` "This Notice describes how medical information about you may be used and disclosed and how you can get access to this information." | Privacy notice. Eye Trends has the same path. |
| 10 | `/products/` | `/products/` | `/eyeglasses/` | Eyewear hub with cards for frames, sunwear, kids' eyewear and contacts | `/eyeglasses/` "Eyeglass Frames & Lenses in Pine Beach" | The optical hub (frames, kids' frames, lens options, same-day lab, links to three lens products) fills the Eyewear hub. |
| 11 | `/products/contact-lenses/` | `/products/contact-lenses/` | `/contact-lenses/` | Contact lens product page under Eyewear: lens types fitted | `/contact-lenses/` "Type of Contact Lenses We Offer" | The contact-lens overview (lens types, the Alcon brand list, links to exams, ortho-k and scleral lenses) fills the Eyewear contact-lens page. The exam page moves to Services on its own. |
| 12 | `/products/designer-frames/` | `/products/designer-frames/` | **ADOPT** | Brand-name frame range, with in-office fitting and adjustment | `/eyeglasses/` "Designer Frames for All" | Adopted (section 5.19). What Academy Vision has: A section of the eyeglasses page (26 brands). Evidence: DIRECT. |
| 13 | `/products/kids-eyewear/` | `/products/kids-eyewear/` | **ADOPT** | Frames for children | `/eyeglasses/` "Kids’ Frames That Fit Their Life" | Adopted (section 5.21). What Academy Vision has: Sections of the eyeglasses and pediatric pages. Evidence: DIRECT. |
| 14 | `/products/sunglasses/` | `/products/sunglasses/` | **ADOPT** | Sunglasses and prescription sunwear |  | Adopted (section 5.20). What Academy Vision has: No product claim. Only a polarized-lens option, plus two intake-form items. Evidence: NO EVIDENCE. |
| 15 | `/reviews/` | `/reviews/` | `/location/academy-vision/` | Patient testimonials, then links into services | `/location/academy-vision/` "Top notch! Great doctor and staff! We felt extremely important and very well cared for." | The platform's location record. Nothing links to it (an orphan with 0 inbound links), and its distinctive content is 20 patient reviews plus 4 practice photos. It is the only Academy Vision page with reviews, so it fills Reviews. Its address and hours block duplicates the town page. |
| 16 | `/services/` | `/services/` | `/eye-care-services/` | Services hub grouping every service | `/eye-care-services/` "Our Services at Academy Vision" | The services hub fills the Services hub. |
| 17 | `/services/adult-eye-exams/` | `/services/adult-eye-exams/` | **ADOPT** | Adult exam page | `/eye-care-services/comprehensive-eye-exams/` "We see patients of all ages, from young kids coming in for their first exam to adults staying on top of changes in their vision." | Adopted (section 5.4). What Academy Vision has: A section of the comprehensive exams page ("Eye Exams for Kids, Adults, and Seniors"). Evidence: DIRECT. |
| 18 | `/services/back-to-school-eye-exams/` | `/services/back-to-school-eye-exams/` | **ADOPT** | Pre-school-year exam for children | `/article/pediatric-eye-exams-beyond-school-screenings/` "Back-to-school season is a practical time to schedule, particularly if a child has not had a recent comprehensive exam, has a changing prescription, or shows possible symptoms." | Adopted (section 5.3). What Academy Vision has: The article covers the topic; there is no service page. Evidence: DIRECT. |
| 19 | `/services/cataract-co-management/` | `/services/cataract-co-management/` | **ADOPT** | Cataract evaluation, then surgery coordination and local follow-up | `/eye-care-services/eye-disease-management/` "We monitor their progression and, when the time is right, coordinate with New Jersey eye surgeons to make sure you receive expert care before and after surgery." | Adopted (section 5.9). What Academy Vision has: A section of the eye disease page (coordination with surgeons). Evidence: DIRECT. |
| 20 | `/services/childrens-contact-lenses/` | `/services/childrens-contact-lenses/` | **ADOPT** | Contact lenses for children and teens | `/eye-care-services/myopia-management/` "Soft contact lenses designed specifically for kids to help control how light enters the eye and slow prescription changes." | Adopted (section 5.2). What Academy Vision has: Kids' myopia-control lenses are mentioned on the myopia page and Dr. Lesko's bio; no page of its own. Evidence: PARTIAL. |
| 21 | `/services/childrens-eye-care/` | `/services/childrens-eye-care/` | **ADOPT** | Children's care hub linking four kids' services | `/eye-care-services/pediatric-eye-care/` "At Academy Vision, we take a gentle approach that helps kids feel comfortable from the moment they walk in." | Adopted (section 5.1). What Academy Vision has: No hub page. Children's content sits on the pediatric, myopia, ortho-k, Stellest and eyeglasses pages and in the article. Evidence: DIRECT. |
| 22 | `/services/comprehensive-eye-exams/` | `/services/comprehensive-eye-exams/` | `/eye-care-services/comprehensive-eye-exams/` | Exams group head covering every age | `/eye-care-services/comprehensive-eye-exams/` "Comprehensive Eye Exams in Pine Beach" | Same service and slug. Fills the head page of the Comprehensive Exams group. |
| 23 | `/services/contact-lens-exams/` | `/services/contact-lens-exams/` | `/contact-lenses/contact-lenses-exams/` | Contact lens fitting group head | `/contact-lenses/contact-lenses-exams/` "Contact Lens Exams in Pine Beach" | The contact lens exam page fills the head page of the Contact Lens Exams group. |
| 24 | `/services/diabetic-eye-exams/` | `/services/diabetic-eye-exams/` | **ADOPT** | Yearly retina check for diabetic patients | `/eye-care-services/eye-disease-management/` "If you have diabetes, your eyes need a little extra attention." | Adopted (section 5.7). What Academy Vision has: A section of the eye disease page. Evidence: DIRECT. |
| 25 | `/services/dry-eye-treatment/` | `/services/dry-eye-treatment/` | `/eye-care-services/dry-eye-treatment/` | Dry eye diagnosis and treatment | `/eye-care-services/dry-eye-treatment/` "Treatment for Dry Eyes in Pine Beach" | Same service and slug. |
| 26 | `/services/emergency-eye-care/` | `/services/emergency-eye-care/` | **ADOPT** | Urgent care hub linking four urgent conditions | `/hours-location/` "Eye issues don’t always happen at a convenient time, and when something feels wrong, it’s important to get it checked sooner rather than later." | Adopted (section 5.10). What Academy Vision has: A section of the hours page ("Emergency Eye Care"). Evidence: DIRECT. |
| 27 | `/services/flashes-floaters/` | `/services/flashes-floaters/` | **ADOPT** | Prompt retina check for new floaters or light flashes |  | Adopted (section 5.14). What Academy Vision has: No service claim. "Floaters" appears only as a listed symptom in structured data and as an intake checkbox. Evidence: NO EVIDENCE. |
| 28 | `/services/foreign-body-removal/` | `/services/foreign-body-removal/` | **ADOPT** | Removing an object from the eye | `/hours-location/` "Whether you’re dealing with sudden vision changes, an eye injury, redness, or discomfort that won’t go away, we offer emergency eye care in Pine Beach whenever possible." | Adopted (section 5.12). What Academy Vision has: Not named. Only "an eye injury" and "ocular injuries". Evidence: PARTIAL. |
| 29 | `/services/gas-permeable-contacts/` | `/services/gas-permeable-contacts/` | **ADOPT** | Rigid lens fittings |  | Adopted (section 5.17). What Academy Vision has: Not mentioned. Evidence: NO EVIDENCE. |
| 30 | `/services/glaucoma-management/` | `/services/glaucoma-management/` | **ADOPT** | Glaucoma testing and long-term monitoring | `/eye-care-services/eye-disease-management/` "Glaucoma affects the optic nerve, often due to increased pressure in the eye." | Adopted (section 5.6). What Academy Vision has: A section of the eye disease page. Evidence: DIRECT. |
| 31 | `/services/lasik-co-management/` | `/services/lasik-co-management/` | `/eye-care-services/lasik-co-management/` | LASIK candidacy, then pre- and post-op co-management | `/eye-care-services/lasik-co-management/` "Co-Management at Academy Vision" | Same service and slug. |
| 32 | `/services/macular-degeneration/` | `/services/macular-degeneration/` | **ADOPT** | Monitoring of macular degeneration | `/eye-care-services/eye-disease-management/` "Macular degeneration affects your central vision, which is what you rely on for reading, driving, and recognizing faces." | Adopted (section 5.8). What Academy Vision has: A section of the eye disease page. Evidence: DIRECT. |
| 33 | `/services/medical-eye-care/` | `/services/medical-eye-care/` | `/eye-care-services/eye-disease-management/` | Medical care hub listing the conditions managed | `/eye-care-services/eye-disease-management/` "Ocular Diseases We Manage" | Covers glaucoma, macular degeneration, diabetic eye disease and cataracts, the same set of conditions as the Medical Eye Care hub. The four Eye Trends condition pages are adopted, using this page as evidence. |
| 34 | `/services/multifocal-contacts/` | `/services/multifocal-contacts/` | **ADOPT** | Contacts for near and far vision | `/contact-lenses/` "DAILIES TOTAL1® Multifocal" | Adopted (section 5.18). What Academy Vision has: Two multifocal lenses on the contact-lens page's brand list. Evidence: DIRECT. |
| 35 | `/services/myopia-management/` | `/services/myopia-management/` | `/eye-care-services/myopia-management/` | Program to slow children's nearsightedness | `/eye-care-services/myopia-management/` "Myopia Control for Children in Pine Beach" | Same service and slug, in the Children's Eye Care group. |
| 36 | `/services/pediatric-eye-exams/` | `/services/pediatric-eye-exams/` | `/eye-care-services/pediatric-eye-care/` | Exam page for young children: what it checks, how the visit goes | `/eye-care-services/pediatric-eye-care/` "What Your Child’s Eye Exam Includes" | The page is built around the child's exam: why it matters, warning signs, what it includes, booking. That matches the Eye Trends exam page, not the Children's Eye Care hub, so the hub is adopted. |
| 37 | `/services/pink-eye-conjunctivitis/` | `/services/pink-eye-conjunctivitis/` | **ADOPT** | Prompt care for conjunctivitis | `/insurance/` "This can include things like infections, dry eye, eye disease, or sudden changes in your vision." | Adopted (section 5.11). What Academy Vision has: Not named. Only "infections", "red eyes" and "Allergies". Evidence: PARTIAL. |
| 38 | `/services/red-eye-treatment/` | `/services/red-eye-treatment/` | **ADOPT** | Finding the cause of a red, sore eye | `/team/dr-marc-ullman-od/` "Dr. Ullman is the practice’s primary resource for patients seeking relief from chronic dry eye, red eyes, and ocular injuries." | Adopted (section 5.13). What Academy Vision has: Named on Dr. Ullman's bio ("red eyes") and the hours page ("redness"). Evidence: DIRECT. |
| 39 | `/services/same-day-contacts/` | `/services/same-day-contacts/` | **ADOPT** | Fit and wear trial lenses the same day |  | Adopted (section 5.15). What Academy Vision has: Not mentioned (the same-day claim is for glasses). Evidence: NO EVIDENCE. |
| 40 | `/services/senior-eye-exams/` | `/services/senior-eye-exams/` | **ADOPT** | Senior exam page (Medicare) | `/` "From kids’ first eye exams to ongoing care for adults and seniors, we’re here for every stage of life." | Adopted (section 5.5). What Academy Vision has: A section of the comprehensive exams page; Medicare is on the plans list. Evidence: DIRECT. |
| 41 | `/services/specialty-contacts/` | `/services/specialty-contacts/` | `/contact-lenses/scleral-lenses/` | Specialty lenses for eyes that standard soft lenses do not suit | `/contact-lenses/scleral-lenses/` "Custom scleral lenses in Pine Beach for keratoconus and hard-to-fit eyes." | Both pages serve hard-to-fit eyes, so the scleral page takes the specialty-contacts path. The page keeps all of its scleral text. |
| 42 | `/services/toric-contacts/` | `/services/toric-contacts/` | **ADOPT** | Contacts for astigmatism | `/contact-lenses/` "PRECISION1® for Astigmatism" | Adopted (section 5.16). What Academy Vision has: Three astigmatism lenses on the contact-lens page's brand list. Evidence: DIRECT. |
| 43 | `/terms/` | `/terms/` | **ADOPT** | Terms governing use of the site (footer legal link) |  | Adopted (section 5.23). What Academy Vision has: No terms page. Evidence: NO EVIDENCE. |

## 3. One-to-many decisions

### D1. /eye-care-services/pediatric-eye-care/ vs /services/childrens-eye-care/ and /services/pediatric-eye-exams/

**Decision:** MOVE to /services/pediatric-eye-exams/. ADOPT /services/childrens-eye-care/ as the group hub.

- The Academy Vision page centres on the child's exam (its sections: why kids' exams matter, warning signs, a kid-friendly visit, the exam's contents, kids' frames, booking). That is the same order of purposes as the Eye Trends exam page: the problem, the calm visit, the contents of the exam, booking.
- The Eye Trends hub mostly links four services. Academy Vision's children's content is spread over six pages (pediatric care, myopia management, ortho-k, Stellest, the eyeglasses page with its kids' frames section, the article), and a new hub can link them all.
- Riverside made the same call (its pediatric exam page went to /services/pediatric-eye-exams/ and the hub was adopted).
- Cost: the group head that most visitors reach first is a newly written page, not Academy Vision's own. The alternative (this page as the hub, the exam page adopted) is recorded in OPEN Q8.
- Evidence: `/eye-care-services/pediatric-eye-care/` "The Importance of Eye Exams for Children" (audit/raw/eye-care-services-pediatric-eye-care.html, body)
- Evidence: `/eye-care-services/pediatric-eye-care/` "Visit Academy Vision for kids' exams." (audit/raw/eye-care-services-pediatric-eye-care.html, meta)

### D2. /contact-lenses/scleral-lenses/ vs /services/specialty-contacts/

**Decision:** MOVE to /services/specialty-contacts/ (menu label "Scleral Lenses"). Ortho-k stays a child of the contact-lens page by the longest-prefix rule.

- Both pages exist for eyes that are difficult to fit with ordinary lenses; Academy Vision's meta line names keratoconus.
- Adopting a separate specialty page would put a second page on the same patients and duplicate the scleral page.
- The Eye Trends specialty page fits toric, GP and multifocal lenses and refers irregular corneas elsewhere. Those three are separate adopted pages here, so the moved scleral page does not conflict with them.
- Riverside made the same call (its hard-to-fit page went to /services/specialty-contacts/).
- Evidence: `/contact-lenses/scleral-lenses/` "Custom scleral lenses in Pine Beach for keratoconus and hard-to-fit eyes." (audit/raw/contact-lenses-scleral-lenses.html, meta)
- Evidence: `/contact-lenses/scleral-lenses/` "Struggle to wear standard contact lenses" (audit/raw/contact-lenses-scleral-lenses.html, body)

### D3. /hours-location/ and /location/academy-vision/ vs /eye-doctor-pine-beach/

**Decision:** MOVE /hours-location/ to /eye-doctor-pine-beach/. MOVE /location/academy-vision/ to /reviews/.

- /hours-location/ is the page visitors use: it is in the main menu on all 31 pages ("Hours & Location"), the top bar links it ("Located at Pine Beach"), 18 in-content links on other pages (19 counting /sitemap/) point to it (the insurance page's "Contact Us" button among them), and its content (directions, parking, ramp, services, emergency care) is the town page's job.
- /location/academy-vision/ is an orphan (0 inbound links in audit/link-graph.json; audit/architecture.json lists it under orphanPages). Apart from the shared address and hours block, its content is 20 patient reviews and 4 practice photos. It is the only Academy Vision page with reviews, so it fills /reviews/, and the town page no longer has a near-duplicate.
- Its meta description repeats the hours page's opening sentence, another sign it is a platform record and not a page in its own right.
- Evidence: `/hours-location/` "If you’ve driven down Route 9, there’s a good chance you’ve seen us—the building with the artwork right by the Mizzen Avenue light." (audit/raw/hours-location.html, body)
- Evidence: `/location/academy-vision/` "If you’ve driven down Route 9, there’s a good chance you’ve seen us, the building with the artwork right by the Mizzen Avenue light." (audit/raw/location-academy-vision.html, meta)

### D4. /about-us/ and /our-eye-doctor/ vs the About Us menu item

**Decision:** KEEP /about-us/ and make it the About Us menu target. MOVE /our-eye-doctor/ to /our-doctors/ as the first About Us child, with the three bios under it.

- Eye Trends has no about page: its About Us item opens the doctor page, which tells the practice story and the doctor's background in one. Academy Vision splits that into two pages and has both in its own menu ("About Us", "Our Eye Doctors").
- Pointing About Us at the doctors page would bury the founding-history page (1984, Toms River to Pine Beach, new leadership).
- The doctors page is the counterpart of the doctor page, so it takes that path, made plural for three optometrists (deviation V1).
- Evidence: `/about-us/` "From Toms River to Pine Beach—A Family Legacy" (audit/raw/about-us.html, body)
- Evidence: `/our-eye-doctor/` "The Academy Vision Eye Care Team" (audit/raw/our-eye-doctor.html, body)

### D5. /contact-lenses/ vs /products/contact-lenses/

**Decision:** MOVE /contact-lenses/ to /products/contact-lenses/. Its exam child goes to /services/contact-lens-exams/, scleral to /services/specialty-contacts/, and ortho-k follows the parent (longest prefix).

- The page is a lens overview: why contacts, personalised fittings, the Alcon brand list, lens types, links to the three lens pages. That is the Eyewear contact-lens page's purpose. The exam itself has its own page, which takes the Services path.
- Riverside made the same call (/contact-lenses/ went to /products/contact-lenses/).
- Evidence: `/contact-lenses/` "Contact Lenses in Pine Beach, NJ" (audit/raw/contact-lenses.html, title)
- Evidence: `/contact-lenses/` "Personalized Contact Lens Fittings" (audit/raw/contact-lenses.html, body)

### D6. /patient-registration-form/ vs /patient-forms/

**Decision:** MOVE /patient-registration-form/ to /patient-forms/.

- It is the only Academy Vision patient form, and the new-patient registration is the main thing the Eye Trends forms page asks patients to complete.
- An adopted hub would be a thin page with one link. The cost, losing the Eye Trends checklist of documents for the first appointment, is small: the content lane can add one in Academy Vision's voice if the practice wants it.
- The page also says patients may print it and bring it to the office, which fits the forms page's purpose.
- Evidence: `/patient-registration-form/` "Please complete the information below and submit the form online, or if you prefer print out the form after full or partial completion, and bring it when you come to our office." (audit/raw/patient-registration-form.html, body)

### D7. /website-accessibility-policy/ vs /accessibility/

**Decision:** MOVE /website-accessibility-policy/ to /accessibility/.

- Same purpose, and both footers label the link "Accessibility". Riverside made the same move.
- Evidence: `/` "Accessibility" (audit/raw/index.html, footer)
- Evidence: `/website-accessibility-policy/` "Our commitment and approach to maintaining an accessible website" (audit/raw/website-accessibility-policy.html, body)

### Placement of the 11 Academy Vision-only pages

- **Lens products** (Varilux, Avulux, Stellest) follow their parent `/eyeglasses/` -> `/products/` by the longest-prefix rule and sit in a "Lenses" group of the Eyewear menu.
- **Ortho-k** follows its parent `/contact-lenses/` -> `/products/contact-lenses/` by the same rule. It is listed in the menu with the contact-lens services (Services > Contact Lens Exams, next to Scleral Lenses), where a visitor looking for a lens fitting would look. The URL and menu disagree (V7); the alternative, `/services/specialty-contacts/orthokeratology-ortho-k/`, would read as a kind of scleral lens.
- **Bios** nest under `/our-doctors/` (justified nesting: the doctors page links each one with "Read More", `/team/` is not a page, and Eye Trends has no bio pages because it has one doctor).
- **The article** nests under the adopted `/eye-health/` hub (justified nesting: `/article/` is not a page; the structure keeps guides in Eye Health). Same slug.
- **About Us, Appointment Request Form, Sitemap** keep their paths: no counterpart, no moved ancestor.

## 4. Every Academy Vision page -> new path

| # | Old path | New path | Action | Rule | Pages linking to it (crawl, self included) | Reason | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | `/` | `/` | KEEP | same path as its Eye Trends counterpart (home) | 31 | The practice home fills the Eye Trends home at the same path. | `/` "Your Eye Doctors in Pine Beach, NJ" |
| 2 | `/about-us/` | `/about-us/` | KEEP | no Eye Trends counterpart page | 31 | The practice-history page. Eye Trends has no /about-us/ (its About Us menu item opens the doctor page), so the page keeps its path and becomes the About Us menu target. | `/about-us/` "Academy Vision was founded in 1984 by Dr. Robert Ullman, who built the practice with a simple goal: to take care of people the right way." |
| 3 | `/appointment-request-form/` | `/appointment-request-form/` | KEEP | no Eye Trends counterpart page | 1 | Eye Trends books through an on-page form and has no appointment page. The request form keeps its path and is linked under Visit Us and in the footer. In the crawl, only /sitemap/ links to it. | `/appointment-request-form/` "Please fill in the form below to setup an appointment." |
| 4 | `/article/pediatric-eye-exams-beyond-school-screenings/` | `/eye-health/pediatric-eye-exams-beyond-school-screenings/` | MOVE | justified nesting | 1 | Academy Vision's only article. /article/ is a platform post-type prefix with no page of its own (it is not one of the 31 crawled pages), so the article nests under the adopted Eye Health hub, the structure's home for guides. Same slug. | `/` "Get Expert Eye Care Tips From Our Doctors"<br>`/article/pediatric-eye-exams-beyond-school-screenings/` "Pediatric Eye Exams: Beyond School Screenings" |
| 5 | `/contact-lenses/` | `/products/contact-lenses/` | MOVE | Eye Trends counterpart | 31 | The contact-lens overview (lens types, the Alcon brand list, links to exams, ortho-k and scleral lenses) fills the Eyewear contact-lens page. The exam page moves to Services on its own. | `/contact-lenses/` "Type of Contact Lenses We Offer"<br>`/contact-lenses/` "Explore our Contact Lens Options in Pine Beach" |
| 6 | `/contact-lenses/contact-lenses-exams/` | `/services/contact-lens-exams/` | MOVE | Eye Trends counterpart | 31 | The contact lens exam page fills the head page of the Contact Lens Exams group. | `/contact-lenses/contact-lenses-exams/` "Contact Lens Exams in Pine Beach"<br>`/contact-lenses/contact-lenses-exams/` "Why is a Contact Lens Exam Different?" |
| 7 | `/contact-lenses/orthokeratology-ortho-k/` | `/products/contact-lenses/orthokeratology-ortho-k/` | MOVE | longest-prefix (parent contact-lenses moved) | 31 | No Eye Trends counterpart. Its parent /contact-lenses/ moved, so it moves with it (Riverside's remap rule) and stays a child of the contact-lens page, as it is today. The menu lists it in the Contact Lens Exams group, next to the scleral page. | `/contact-lenses/` "Ortho-k lenses are worn overnight and gently reshape your eyes while you sleep."<br>`/contact-lenses/orthokeratology-ortho-k/` "Ortho-K Myopia Lenses in Pine Beach" |
| 8 | `/contact-lenses/scleral-lenses/` | `/services/specialty-contacts/` | MOVE | Eye Trends counterpart | 31 | Both pages serve hard-to-fit eyes, so the scleral page takes the specialty-contacts path. The page keeps all of its scleral text. | `/contact-lenses/scleral-lenses/` "Custom scleral lenses in Pine Beach for keratoconus and hard-to-fit eyes."<br>`/contact-lenses/scleral-lenses/` "Scleral Lenses for Complex Needs" |
| 9 | `/disclaimer/` | `/disclaimer/` | KEEP | same path as its Eye Trends counterpart | 31 | Legal disclaimer. Eye Trends has the same path. | `/disclaimer/` "The information on this site is not presented as a substitute for informed professional advice and does not substitute for consultation with optometrist or any other health and/or medical professional." |
| 10 | `/eye-care-services/` | `/services/` | MOVE | Eye Trends counterpart | 31 | The services hub fills the Services hub. | `/eye-care-services/` "Our Services at Academy Vision"<br>`/eye-care-services/` "Family-Friendly Eye Care in Pine Beach" |
| 11 | `/eye-care-services/comprehensive-eye-exams/` | `/services/comprehensive-eye-exams/` | MOVE | Eye Trends counterpart | 31 | Same service and slug. Fills the head page of the Comprehensive Exams group. | `/eye-care-services/comprehensive-eye-exams/` "Comprehensive Eye Exams in Pine Beach"<br>`/eye-care-services/comprehensive-eye-exams/` "Eye Exams for Kids, Adults, and Seniors" |
| 12 | `/eye-care-services/dry-eye-treatment/` | `/services/dry-eye-treatment/` | MOVE | Eye Trends counterpart | 31 | Same service and slug. | `/eye-care-services/dry-eye-treatment/` "Treatment for Dry Eyes in Pine Beach" |
| 13 | `/eye-care-services/eye-disease-management/` | `/services/medical-eye-care/` | MOVE | Eye Trends counterpart | 31 | Covers glaucoma, macular degeneration, diabetic eye disease and cataracts, the same set of conditions as the Medical Eye Care hub. The four Eye Trends condition pages are adopted, using this page as evidence. | `/eye-care-services/eye-disease-management/` "Ocular Diseases We Manage"<br>`/eye-care-services/eye-disease-management/` "Manage glaucoma, cataracts, and macular degeneration." |
| 14 | `/eye-care-services/lasik-co-management/` | `/services/lasik-co-management/` | MOVE | Eye Trends counterpart | 31 | Same service and slug. | `/eye-care-services/lasik-co-management/` "Co-Management at Academy Vision" |
| 15 | `/eye-care-services/myopia-management/` | `/services/myopia-management/` | MOVE | Eye Trends counterpart | 31 | Same service and slug, in the Children's Eye Care group. | `/eye-care-services/myopia-management/` "Myopia Control for Children in Pine Beach" |
| 16 | `/eye-care-services/pediatric-eye-care/` | `/services/pediatric-eye-exams/` | MOVE | Eye Trends counterpart (one-to-many decision D1) | 31 | The page is built around the child's exam: why it matters, warning signs, what it includes, booking. That matches the Eye Trends exam page, not the Children's Eye Care hub, so the hub is adopted. | `/eye-care-services/pediatric-eye-care/` "What Your Child’s Eye Exam Includes"<br>`/eye-care-services/pediatric-eye-care/` "Book Your Child’s Eye Exam" |
| 17 | `/eyeglasses/` | `/products/` | MOVE | Eye Trends counterpart | 31 | The optical hub (frames, kids' frames, lens options, same-day lab, links to three lens products) fills the Eyewear hub. | `/eyeglasses/` "Eyeglass Frames & Lenses in Pine Beach"<br>`/eyeglasses/` "Explore Our Range" |
| 18 | `/eyeglasses/avulux-migraine-lenses/` | `/products/avulux-migraine-lenses/` | MOVE | longest-prefix (parent eyeglasses moved) | 31 | No Eye Trends counterpart. A lens product, so it follows its parent into /products/. Listed under Eyewear. | `/eyeglasses/avulux-migraine-lenses/` "Avulux® Migraine Lenses in Pine Beach" |
| 19 | `/eyeglasses/stellest-lenses/` | `/products/stellest-lenses/` | MOVE | longest-prefix (parent eyeglasses moved) | 31 | No Eye Trends counterpart. A lens product, so it follows its parent into /products/. Listed under Eyewear. | `/eyeglasses/stellest-lenses/` "Essilor® Stellest® lenses for Myopia" |
| 20 | `/eyeglasses/varilux-lenses/` | `/products/varilux-lenses/` | MOVE | longest-prefix (parent eyeglasses moved) | 31 | No Eye Trends counterpart. A lens product, so it follows its parent into /products/. Listed under Eyewear. | `/eyeglasses/varilux-lenses/` "Varilux® Eyeglass Lenses in Pine Beach" |
| 21 | `/hours-location/` | `/eye-doctor-pine-beach/` | MOVE | Eye Trends counterpart (one-to-many decision D3) | 31 | The Hours & Location page (local intro, directions, parking, ramp, services, emergency care) fills the town page. The top-bar link and the insurance page's Contact Us button point to it. | `/hours-location/` "Local Eye Doctors in Pine Beach, New Jersey"<br>`/hours-location/` "It’s a standalone building with its own parking lot, so you won’t have to search for a spot or deal with crowded plazas." |
| 22 | `/insurance/` | `/insurance/` | KEEP | same path as its Eye Trends counterpart | 31 | Insurance and payment. Eye Trends has the same path. | `/insurance/` "Insurance Plans We Accept" |
| 23 | `/location/academy-vision/` | `/reviews/` | MOVE | Eye Trends counterpart (one-to-many decision D3) | 0 | The platform's location record. Nothing links to it (an orphan with 0 inbound links), and its distinctive content is 20 patient reviews plus 4 practice photos. It is the only Academy Vision page with reviews, so it fills Reviews. Its address and hours block duplicates the town page. | `/location/academy-vision/` "Top notch! Great doctor and staff! We felt extremely important and very well cared for."<br>`/location/academy-vision/` "Excellent service and eye care!" |
| 24 | `/our-eye-doctor/` | `/our-doctors/` | MOVE | Eye Trends counterpart (path made plural, deliberate deviation V1) | 31 | The doctors page fills the doctor page. Academy Vision has three optometrists, so the path is plural. | `/our-eye-doctor/` "Your Trusted Pine Beach Eye Doctors"<br>`/our-eye-doctor/` "Meet our Optometrists" |
| 25 | `/patient-registration-form/` | `/patient-forms/` | MOVE | Eye Trends counterpart (one-to-many decision D6) | 1 | Academy Vision's only patient form, the online new-patient registration, fills the patient forms page. | `/patient-registration-form/` "For your convenience, patients can now register online by submitting our HIPAA compliant form here." |
| 26 | `/privacy-policy/` | `/privacy-policy/` | KEEP | same path as its Eye Trends counterpart | 31 | Privacy notice. Eye Trends has the same path. | `/privacy-policy/` "This Notice describes how medical information about you may be used and disclosed and how you can get access to this information." |
| 27 | `/sitemap/` | `/sitemap/` | KEEP | no Eye Trends counterpart page | 31 | Eye Trends has no HTML sitemap. Academy Vision's footer links one, so it keeps its path. Its page list must be regenerated for the new tree. | `/sitemap/` "Sitemap" |
| 28 | `/team/dr-anthony-giallombardo-od/` | `/our-doctors/dr-anthony-giallombardo-od/` | MOVE | justified nesting | 1 | A doctor bio, reached from the doctors page's Read More link. /team/ is not a page. Nested under /our-doctors/ (Eye Trends has a single doctor, so no bio pages). | `/team/dr-anthony-giallombardo-od/` "Dr. Anthony Giallombardo is an optometrist and the owner of the practice." |
| 29 | `/team/dr-marc-ullman-od/` | `/our-doctors/dr-marc-ullman-od/` | MOVE | justified nesting | 1 | A doctor bio, nested under /our-doctors/ (see above). | `/team/dr-marc-ullman-od/` "Dr. Marc Ullman has been a pillar of the eye care community since 1998." |
| 30 | `/team/dr-tyler-lesko-od/` | `/our-doctors/dr-tyler-lesko-od/` | MOVE | justified nesting | 1 | A doctor bio, nested under /our-doctors/ (see above). | `/team/dr-tyler-lesko-od/` "Dr. Tyler Lesko is a local eye care professional born and raised in Lacey Township, NJ." |
| 31 | `/website-accessibility-policy/` | `/accessibility/` | MOVE | Eye Trends counterpart | 31 | Same purpose as the accessibility page, and both footers label it "Accessibility". Riverside made the same move. | `/website-accessibility-policy/` "Our website strives to conform with the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, as practicable." |

## 5. Adopted pages (23)

These are new pages, to be written later in Academy Vision's voice. This lane writes no copy. Each entry gives a proposed title and h1 (this lane's own words, following Academy Vision's own title pattern `[Service] in Pine Beach, NJ | Academy Vision`), the Eye Trends source, that page's section purposes in order (own words; the site-wide booking band and search overlay are chrome and left out), the Academy Vision evidence, and the risk. **Evidence status**: DIRECT = Academy Vision names the service. PARTIAL / NO EVIDENCE = the practice must confirm before the page is published or indexed.

### 5.1 `/services/childrens-eye-care/`

- **Title:** Children's Eye Care in Pine Beach, NJ | Academy Vision
- **H1:** Vision Care for Children of Every Age in Pine Beach
- **Eye Trends source:** `/services/childrens-eye-care/` (`audit/content-inventory.json` there; 5 main sections)
- **Menu:** Services > Children's Eye Care (group head)
- **Section purposes, in order:**
  1. Opening: all of a child's eye care at one practice, with booking
  2. Cards linking to each children's service page
  3. Why one practice should follow a child's vision through school
  4. Local track record that reassures parents
  5. Insurance note, then booking and phone prompt
- **What Academy Vision has:** No hub page. Children's content sits on the pediatric, myopia, ortho-k, Stellest and eyeglasses pages and in the article
- **Academy Vision evidence:**
  - `/eye-care-services/pediatric-eye-care/` "At Academy Vision, we take a gentle approach that helps kids feel comfortable from the moment they walk in." (body)
  - `/` "We make kids' eye care easy and stress-free!" (body)
  - `/eye-care-services/myopia-management/` "At Academy Vision, we focus on more than just helping your child see clearly—we work to protect their vision for the future." (body)
  - `/article/pediatric-eye-exams-beyond-school-screenings/` "Families in Pine Beach can turn to Academy Vision for friendly pediatric care that supports visual development throughout the school years." (body)
- **Evidence status:** DIRECT
- **Risk:** low. A hub. Link only to real Academy Vision children's pages: pediatric exams, myopia management, ortho-k, Stellest lenses, kids' eyewear, the article. Do not carry over the Eye Trends age band or its Saturday hours (Academy Vision lists "saturday: Closed").

### 5.2 `/services/childrens-contact-lenses/`

- **Title:** Contact Lenses for Kids in Pine Beach, NJ | Academy Vision
- **H1:** First Contact Lenses for Kids and Teens in Pine Beach
- **Eye Trends source:** `/services/childrens-contact-lenses/` (`audit/content-inventory.json` there; 10 main sections)
- **Menu:** Services > Children's Eye Care
- **Section purposes, in order:**
  1. Opening: starting a child in contact lenses, with lessons included
  2. Name the parent's worries about safety and handling
  3. What families get: readiness check, suitable lens, handling practice
  4. Practice experience fitting young first-time wearers
  5. Step-by-step contents of a first fitting visit
  6. Follow-up visits as the child grows
  7. Contrast with a quick retail fitting
  8. Links to related children's services
  9. Common parent questions answered
  10. Closing booking prompt for when the child is ready
- **What Academy Vision has:** Kids' myopia-control lenses are mentioned on the myopia page and Dr. Lesko's bio; no page of its own
- **Academy Vision evidence:**
  - `/eye-care-services/myopia-management/` "Soft contact lenses designed specifically for kids to help control how light enters the eye and slow prescription changes." (body)
  - `/team/dr-tyler-lesko-od/` "Pediatrics & Myopia Management: Utilizing orthokeratology and MiSight to change the trajectory of children's lives." (body)
  - `/contact-lenses/orthokeratology-ortho-k/` "It’s a simple, non-surgical option that works for both kids and adults." (body)
  - `/contact-lenses/contact-lenses-exams/` "Most people get the hang of it quickly, and we’ll make sure you feel comfortable before you leave." (body)
- **Evidence status:** PARTIAL - practice must confirm a general first-contacts program for children and any minimum age (the evidence covers kids' lenses for myopia control and new-wearer training)
- **Risk:** medium. Do not carry over the Eye Trends age range or its Saturday hours.

### 5.3 `/services/back-to-school-eye-exams/`

- **Title:** Back-to-School Eye Exams for Pine Beach Kids | Academy Vision
- **H1:** Start the School Year with a Complete Eye Exam in Pine Beach
- **Eye Trends source:** `/services/back-to-school-eye-exams/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Children's Eye Care
- **Section purposes, in order:**
  1. Opening: a full exam before classes begin
  2. Limits of school vision screenings
  3. Benefits for child and parent: timing, comfort, answers
  4. What the exam checks: acuity, focusing, teaming, eye health
  5. Why local families trust the practice with children
  6. One-off screening versus yearly follow-up
  7. Links to related children's care
  8. Parent questions about screenings and exams
  9. Closing prompt to book before school starts
- **What Academy Vision has:** The article covers the topic; there is no service page
- **Academy Vision evidence:**
  - `/article/pediatric-eye-exams-beyond-school-screenings/` "Back-to-school season is a practical time to schedule, particularly if a child has not had a recent comprehensive exam, has a changing prescription, or shows possible symptoms." (body)
  - `/article/pediatric-eye-exams-beyond-school-screenings/` "School screenings are useful basic checks, but they are not a substitute for a comprehensive pediatric eye exam." (body)
  - `/` "Learn what pediatric eye exams assess, which vision warning signs parents should watch for, and why back-to-school is an ideal time to schedule." (body)
- **Evidence status:** DIRECT
- **Risk:** medium. Overlaps the Academy Vision article (now /eye-health/pediatric-eye-exams-beyond-school-screenings/). Keep this service page short and link to the article. Eye Trends sells its exam on Saturday slots; Academy Vision is closed Saturdays, so that angle must not carry over.

### 5.4 `/services/adult-eye-exams/`

- **Title:** Adult Eye Exams in Pine Beach, NJ | Academy Vision
- **H1:** Eye Exams for Adults in Pine Beach, Without the Rush
- **Eye Trends source:** `/services/adult-eye-exams/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Comprehensive Exams
- **Section purposes, in order:**
  1. Opening: an unrushed adult exam with time for questions
  2. Busy adults postpone exams; quick screenings fall short
  3. Three gains: full exam, prescription plus health check, continuity
  4. Exam steps explained in order
  5. Practice history and long-term patient relationships
  6. Contrast with fast retail prescription checks
  7. Links to other exam types for family members
  8. Questions on exam frequency, what to bring, coverage
  9. Closing booking prompt with insurance reassurance
- **What Academy Vision has:** A section of the comprehensive exams page ("Eye Exams for Kids, Adults, and Seniors")
- **Academy Vision evidence:**
  - `/eye-care-services/comprehensive-eye-exams/` "We see patients of all ages, from young kids coming in for their first exam to adults staying on top of changes in their vision." (body)
  - `/eye-care-services/comprehensive-eye-exams/` "When you come into our Pine Beach eye clinic, you won’t feel rushed or pushed through your appointment." (body)
  - `/eye-care-services/comprehensive-eye-exams/` "Check your prescription to make sure you’re seeing clearly" (body)
- **Evidence status:** DIRECT
- **Risk:** low. Overlaps /services/comprehensive-eye-exams/, so keep it adult-specific. Do not import an exam length or an exam-frequency rule the practice has not stated.

### 5.5 `/services/senior-eye-exams/`

- **Title:** Senior Eye Exams in Pine Beach, NJ | Academy Vision
- **H1:** Thorough Eye Exams for Seniors in Pine Beach
- **Eye Trends source:** `/services/senior-eye-exams/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Comprehensive Exams
- **Section purposes, in order:**
  1. Opening: thorough exams for older adults, Medicare accepted
  2. Age-related conditions progress without noticeable symptoms
  3. Three assurances: time, ongoing monitoring, plain explanations
  4. What a senior exam screens for, step by step
  5. Practice history with long-time older patients
  6. Ongoing tracking versus one-time retail checks
  7. Links to the medical care seniors often need next
  8. Questions on Medicare and visit frequency
  9. Closing booking prompt with coverage help
- **What Academy Vision has:** A section of the comprehensive exams page; Medicare is on the plans list
- **Academy Vision evidence:**
  - `/` "From kids’ first eye exams to ongoing care for adults and seniors, we’re here for every stage of life." (body)
  - `/eye-care-services/` "We See Kids, Parents, and Grandparents" (body)
  - `/insurance/` "Medicare" (body)
  - `/eye-care-services/eye-disease-management/` "It’s more common as we get older, but with regular eye exams, we can detect early signs and help you maintain your quality of life." (body)
- **Evidence status:** DIRECT
- **Risk:** low. Medicare is on the accepted-plans list, but coverage of any one exam depends on the plan, so state no coverage outcome. Dilation and named tests are not in Academy Vision's visible text; they appear only in the comprehensive-exams page's structured data ("Includes visual acuity, eye movement, refraction, slit lamp exam, pupil dilation, and retinal assessment."). Confirm before the page states them.

### 5.6 `/services/glaucoma-management/`

- **Title:** Glaucoma Management in Pine Beach, NJ | Academy Vision
- **H1:** Glaucoma Monitoring and Management in Pine Beach
- **Eye Trends source:** `/services/glaucoma-management/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Medical Eye Care
- **Section purposes, in order:**
  1. Opening: a long-term watch over a slow, silent disease
  2. How glaucoma harms the optic nerve before symptoms
  3. Three gains: routine detection, personal baseline, adaptable plan
  4. Visit steps: eye pressure, nerve evaluation, related tests
  5. Comparing this year's readings with last year's
  6. Why readings scattered across providers lose meaning
  7. Links to related medical eye services
  8. Questions on symptoms, risk, treatment and visit frequency
  9. Closing prompt to schedule a glaucoma check
- **What Academy Vision has:** A section of the eye disease page
- **Academy Vision evidence:**
  - `/eye-care-services/eye-disease-management/` "Glaucoma affects the optic nerve, often due to increased pressure in the eye." (body)
  - `/eye-care-services/eye-disease-management/` "We keep a close watch and help manage the condition to protect your vision." (body)
  - `/team/dr-tyler-lesko-od/` "Ocular Disease: Early detection and monitoring of glaucoma, macular degeneration, and cataracts." (body)
  - `/location/academy-vision/` "Grateful for the in depth tools they use to check eye health (an eye scan vs the puff of air for glaucoma test)." (body)
- **Evidence status:** DIRECT
- **Risk:** low. Named tests or instruments, and whether the practice prescribes glaucoma drops or refers, are not stated. The scan-instead-of-air-puff point is a patient review, not a practice claim.

### 5.7 `/services/diabetic-eye-exams/`

- **Title:** Diabetic Eye Exams in Pine Beach, NJ | Academy Vision
- **H1:** Eye Exams for People Living with Diabetes in Pine Beach
- **Eye Trends source:** `/services/diabetic-eye-exams/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Medical Eye Care
- **Section purposes, in order:**
  1. Opening: guarding vision for patients who have diabetes
  2. Retinopathy can progress without warning signs
  3. Three gains: clear retina view, coordinated care, yearly record
  4. Visit walkthrough: dilation, retina exam, findings shared
  5. Continuity with the same practice year to year
  6. Screenings only help when results are followed up
  7. Links to related medical eye services
  8. Questions including insurance billing for diabetic exams
  9. Closing booking prompt
- **What Academy Vision has:** A section of the eye disease page
- **Academy Vision evidence:**
  - `/eye-care-services/eye-disease-management/` "If you have diabetes, your eyes need a little extra attention." (body)
  - `/eye-care-services/eye-disease-management/` "Routine diabetic eye exams help us monitor those changes and step in if needed." (body)
- **Evidence status:** DIRECT
- **Risk:** low. Dilation is not in Academy Vision's visible text; it appears only in the comprehensive-exams page's structured data ("pupil dilation, and retinal assessment"). Sending reports to the patient's physician is not stated anywhere. Confirm before the page says either.

### 5.8 `/services/macular-degeneration/`

- **Title:** Macular Degeneration Care in Pine Beach, NJ | Academy Vision
- **H1:** Monitoring Macular Degeneration in Pine Beach
- **Eye Trends source:** `/services/macular-degeneration/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Medical Eye Care
- **Section purposes, in order:**
  1. Opening: an ongoing watch over central vision
  2. Early macular degeneration usually has no symptoms
  3. Three gains: careful macula exam, yearly baseline, clear plan
  4. What the check involves, and next steps if found
  5. Continuity of records for a lasting condition
  6. Why retail optical visits do not track the macula
  7. Links to related medical eye services
  8. Questions on cure, progression and monitoring
  9. Closing booking prompt
- **What Academy Vision has:** A section of the eye disease page
- **Academy Vision evidence:**
  - `/eye-care-services/eye-disease-management/` "Macular degeneration affects your central vision, which is what you rely on for reading, driving, and recognizing faces." (body)
  - `/eye-care-services/eye-disease-management/` "It’s more common as we get older, but with regular eye exams, we can detect early signs and help you maintain your quality of life." (body)
- **Evidence status:** DIRECT
- **Risk:** low. Imaging, home monitoring, supplement advice and the referral path for wet macular degeneration are not in Academy Vision's visible text. The eye disease page's structured data lists generic condition facts (typical tests "Visual acuity test", "Dilated eye exam" and "Amsler grid"; therapies including "Anti-VEGF Therapy" and "AREDS Supplements"); they describe the condition, not services the practice says it offers.

### 5.9 `/services/cataract-co-management/`

- **Title:** Cataract Co-Management in Pine Beach, NJ | Academy Vision
- **H1:** Cataract Care Before and After Surgery in Pine Beach
- **Eye Trends source:** `/services/cataract-co-management/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Medical Eye Care
- **Section purposes, in order:**
  1. Opening: cataract care from first symptoms to post-surgery follow-up
  2. Cataracts cloud vision gradually, then a referral comes
  3. Three gains: confirmed diagnosis, explained options, local follow-up
  4. The practice's role before and after the operation
  5. The practice stays involved throughout surgery
  6. Contrast with a referral that ends local involvement
  7. Links to related care
  8. Questions on who operates, timing and coverage
  9. Closing prompt to book an evaluation
- **What Academy Vision has:** A section of the eye disease page (coordination with surgeons)
- **Academy Vision evidence:**
  - `/eye-care-services/eye-disease-management/` "We monitor their progression and, when the time is right, coordinate with New Jersey eye surgeons to make sure you receive expert care before and after surgery." (body)
  - `/team/dr-tyler-lesko-od/` "Advanced Certifications: He is certified in Light Adjustable Lens technology and Orthokeratology." (body)
  - `/team/dr-marc-ullman-od/` "Providing honest second opinions and surgical consultations." (body)
- **Evidence status:** DIRECT
- **Risk:** low. Partner surgeons are not named and the post-op visit schedule is not stated.

### 5.10 `/services/emergency-eye-care/`

- **Title:** Emergency Eye Care in Pine Beach, NJ | Academy Vision
- **H1:** Urgent Eye Care in Pine Beach When Something Feels Wrong
- **Eye Trends source:** `/services/emergency-eye-care/` (`audit/content-inventory.json` there; 6 main sections)
- **Menu:** Services > Emergency Eye Care (group head)
- **Section purposes, in order:**
  1. Opening: what to do when an eye problem cannot wait
  2. Cards for four common urgent conditions
  3. Why an eyewear retailer cannot treat an urgent problem
  4. Practice track record as a reason to call
  5. Phone-first route to the soonest available visit
  6. Insurance reassurance for urgent visits
- **What Academy Vision has:** A section of the hours page ("Emergency Eye Care")
- **Academy Vision evidence:**
  - `/hours-location/` "Eye issues don’t always happen at a convenient time, and when something feels wrong, it’s important to get it checked sooner rather than later." (body)
  - `/hours-location/` "Whether you’re dealing with sudden vision changes, an eye injury, redness, or discomfort that won’t go away, we offer emergency eye care in Pine Beach whenever possible." (body)
  - `/team/dr-marc-ullman-od/` "Dr. Ullman is the practice’s primary resource for patients seeking relief from chronic dry eye, red eyes, and ocular injuries." (meta)
- **Evidence status:** DIRECT
- **Risk:** medium. Academy Vision says "whenever possible", so the page must not promise same-day or guaranteed visits. The Eye Trends section that names a competing chain must not carry over.

### 5.11 `/services/pink-eye-conjunctivitis/`

- **Title:** Pink Eye Treatment in Pine Beach, NJ | Academy Vision
- **H1:** Pink Eye and Conjunctivitis Care in Pine Beach
- **Eye Trends source:** `/services/pink-eye-conjunctivitis/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Emergency Eye Care
- **Section purposes, in order:**
  1. Opening: quick care for an irritated, weepy, contagious-looking eye
  2. The usual overnight onset and the worry it brings
  3. Three gains: a prompt visit, the cause found, a clear plan
  4. Step-by-step account of the appointment
  5. A known local doctor who is easy to reach
  6. Why retail counters or waiting it out do not fit
  7. Links to related urgent care pages
  8. Questions on contagion, school or work, and timing
  9. Closing call-now prompt
- **What Academy Vision has:** Not named. Only "infections", "red eyes" and "Allergies"
- **Academy Vision evidence:**
  - `/insurance/` "This can include things like infections, dry eye, eye disease, or sudden changes in your vision." (body)
  - `/team/dr-marc-ullman-od/` "Dr. Ullman is the practice’s primary resource for patients seeking relief from chronic dry eye, red eyes, and ocular injuries." (meta)
  - `/` "Eye Clinic & Contact Lens supplier, Eye Exams and Treatment of Dry Eye & Allergies, in Pine Beach, New Jersey, 08741." (jsonld:description)
- **Evidence status:** PARTIAL - practice must confirm that it diagnoses and treats pink eye / conjunctivitis (no Academy Vision page names either; the evidence is "infections", "red eyes" and "Allergies")
- **Risk:** high. Do not promise same-day visits.

### 5.12 `/services/foreign-body-removal/`

- **Title:** Foreign Body Removal in Pine Beach, NJ | Academy Vision
- **H1:** Eye Injury and Foreign Object Care in Pine Beach
- **Eye Trends source:** `/services/foreign-body-removal/` (`audit/content-inventory.json` there; 10 main sections)
- **Menu:** Services > Emergency Eye Care
- **Section purposes, in order:**
  1. Opening: careful removal of something stuck in the eye
  2. First-aid warning: avoid rubbing, do not delay
  3. Three gains: prompt visit, comfortable removal, damage check
  4. The visit described step by step
  5. Practice history in the community
  6. Emergency rooms and optical shops compared with an eye doctor
  7. Eye injuries as everyday work for the practice
  8. Questions: emergency room or eye doctor, follow-up
  9. Links to the urgent-care hub and related symptoms
  10. Closing call-now prompt
- **What Academy Vision has:** Not named. Only "an eye injury" and "ocular injuries"
- **Academy Vision evidence:**
  - `/hours-location/` "Whether you’re dealing with sudden vision changes, an eye injury, redness, or discomfort that won’t go away, we offer emergency eye care in Pine Beach whenever possible." (body)
  - `/team/dr-marc-ullman-od/` "Dr. Ullman is the practice’s primary resource for patients seeking relief from chronic dry eye, red eyes, and ocular injuries." (meta)
- **Evidence status:** PARTIAL - practice must confirm foreign-body removal as a procedure (the evidence is "an eye injury" and "ocular injuries" in general)
- **Risk:** medium. The registration form's "Foreign Body Sensation" is an intake checkbox, not a service claim. Do not promise same-day visits.

### 5.13 `/services/red-eye-treatment/`

- **Title:** Red Eye Treatment in Pine Beach, NJ | Academy Vision
- **H1:** Getting to the Cause of a Red, Irritated Eye in Pine Beach
- **Eye Trends source:** `/services/red-eye-treatment/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Emergency Eye Care
- **Section purposes, in order:**
  1. Opening: diagnosing the reason behind a red eye
  2. Three gains: the cause found, relief, urgency judged
  3. Contents of a red-eye examination
  4. Telling a mild irritation from one needing prompt care
  5. Practice history as a reason to trust it
  6. Why retail counters and emergency rooms both fall short
  7. Questions: emergency room or eye doctor, lens wearers
  8. Links to related urgent care pages
  9. Closing call-now prompt
- **What Academy Vision has:** Named on Dr. Ullman's bio ("red eyes") and the hours page ("redness")
- **Academy Vision evidence:**
  - `/team/dr-marc-ullman-od/` "Dr. Ullman is the practice’s primary resource for patients seeking relief from chronic dry eye, red eyes, and ocular injuries." (meta)
  - `/hours-location/` "Whether you’re dealing with sudden vision changes, an eye injury, redness, or discomfort that won’t go away, we offer emergency eye care in Pine Beach whenever possible." (body)
  - `/eye-care-services/dry-eye-treatment/` "Redness that doesn’t seem to go away" (body)
- **Evidence status:** DIRECT
- **Risk:** low. Do not promise same-day visits; Academy Vision says "whenever possible".

### 5.14 `/services/flashes-floaters/`

- **Title:** Flashes and Floaters in Pine Beach, NJ | Academy Vision
- **H1:** Light Flashes and New Floaters: Retina Checks in Pine Beach
- **Eye Trends source:** `/services/flashes-floaters/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Emergency Eye Care
- **Section purposes, in order:**
  1. Opening: new floaters or light flashes warrant a prompt retina check
  2. Harmless floaters versus warning-sign changes
  3. Three gains: prompt visit, clear answer, referral if needed
  4. What the visit covers, including a dilated retina exam
  5. Value of earlier records when vision changes suddenly
  6. Eye doctor versus retail optical or emergency room for sudden symptoms
  7. Links to related urgent care pages
  8. Questions about floaters and when to worry
  9. Closing call-now prompt
- **What Academy Vision has:** No service claim. "Floaters" appears only as a listed symptom in structured data and as an intake checkbox
- **Academy Vision evidence:** NO EVIDENCE - practice must confirm
- **Nearest Academy Vision text (this does not show the service is offered):**
  - `/hours-location/` "Whether you’re dealing with sudden vision changes, an eye injury, redness, or discomfort that won’t go away, we offer emergency eye care in Pine Beach whenever possible." (body)
- **Evidence status:** NO EVIDENCE - practice must confirm (no Academy Vision page offers a visit for new flashes or floaters or mentions retinal tears; the nearest service text is emergency care for "sudden vision changes" in general. "Floaters" appears only as a diabetic-retinopathy symptom in the eye disease page's structured data and as the registration form's "Floaters or Spots" intake checkbox, and the retina only in structured data and the form's "Retinal detachment" history item; none of these is a service claim)
- **Risk:** high. Hold the page (noindex, out of the menu) until the practice confirms it evaluates these symptoms and how quickly.

### 5.15 `/services/same-day-contacts/`

- **Title:** Same-Day Contacts in Pine Beach, NJ | Academy Vision
- **H1:** Same-Day Contact Lens Fittings in Pine Beach
- **Eye Trends source:** `/services/same-day-contacts/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Contact Lens Exams
- **Section purposes, in order:**
  1. Opening: fitted and wearing lenses the same day
  2. The usual wait for ordered lenses
  3. Fitting steps: corneal measurements, tear film, trial lens, check
  4. Three gains of a fitting done properly
  5. Contrast with boxes handed over without a fitting
  6. Continuity that makes repeat fittings quicker
  7. Links to other contact lens services
  8. Questions, including stock and prescription conditions
  9. Closing prompt to call ahead and book
- **What Academy Vision has:** Not mentioned (the same-day claim is for glasses)
- **Academy Vision evidence:** NO EVIDENCE - practice must confirm
- **Nearest Academy Vision text (this does not show the service is offered):**
  - `/contact-lenses/contact-lenses-exams/` "We fit you with trial lenses so you can experience how they feel" (body)
  - `/eyeglasses/` "With our in-office finishing lab in Pine Beach, many prescriptions can be made the very same day." (body)
- **Evidence status:** NO EVIDENCE - practice must confirm (Academy Vision's same-day claim is for glasses from its finishing lab; nothing says patients leave wearing contact lenses the same day. Trial lenses at the fitting are stated)
- **Risk:** high. Do not move the same-day glasses claim over to contacts.

### 5.16 `/services/toric-contacts/`

- **Title:** Toric Contact Lenses in Pine Beach, NJ | Academy Vision
- **H1:** Astigmatism-Correcting Contact Lenses in Pine Beach
- **Eye Trends source:** `/services/toric-contacts/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Contact Lens Exams
- **Section purposes, in order:**
  1. Opening: contact lenses that correct astigmatism
  2. Correct the belief that astigmatism rules out contacts
  3. Three gains: precise axis, stable lens, refined fit
  4. Toric fitting steps
  5. Benefit of a fitter who has your history
  6. Contrast with lenses nobody checks on the eye
  7. Links to other contact lens services
  8. Questions about astigmatism and contacts
  9. Closing booking prompt
- **What Academy Vision has:** Three astigmatism lenses on the contact-lens page's brand list
- **Academy Vision evidence:**
  - `/contact-lenses/` "PRECISION1® for Astigmatism" (body)
  - `/contact-lenses/` "TOTAL30® for Astigmatism" (body)
  - `/contact-lenses/` "DAILIES TOTAL1® for Astigmatism" (body)
- **Evidence status:** DIRECT
- **Risk:** low. Name only the lenses on the Academy Vision list.

### 5.17 `/services/gas-permeable-contacts/`

- **Title:** Rigid Gas Permeable Contacts in Pine Beach, NJ | Academy Vision
- **H1:** Rigid Gas Permeable Lens Fittings in Pine Beach
- **Eye Trends source:** `/services/gas-permeable-contacts/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Contact Lens Exams
- **Section purposes, in order:**
  1. Opening: rigid lenses for crisp, stable vision
  2. When soft lenses fail demanding prescriptions
  3. Three gains: sharper vision, durable lens, refined fit
  4. Fitting steps for rigid lenses
  5. An ongoing relationship through adjustments
  6. Contrast with retail soft-lens handoffs
  7. Links to other contact lens services
  8. Questions on comfort, adaptation and care
  9. Closing booking prompt
- **What Academy Vision has:** Not mentioned
- **Academy Vision evidence:** NO EVIDENCE - practice must confirm
- **Nearest Academy Vision text (this does not show the service is offered):**
  - `/team/dr-marc-ullman-od/` "Managing difficult contact lens fittings and chronic ocular disease." (body)
  - `/team/dr-tyler-lesko-od/` "Specialty Contact Lenses: Providing life-changing vision for patients through complex lens fittings." (body)
- **Evidence status:** NO EVIDENCE - practice must confirm (no Academy Vision page mentions gas permeable, GP or rigid lenses; only difficult or complex fittings in general)
- **Risk:** high. Hold the page until the practice confirms it fits gas permeable lenses.

### 5.18 `/services/multifocal-contacts/`

- **Title:** Multifocal Contact Lenses in Pine Beach, NJ | Academy Vision
- **H1:** Multifocal Contacts for Near and Far in Pine Beach
- **Eye Trends source:** `/services/multifocal-contacts/` (`audit/content-inventory.json` there; 9 main sections)
- **Menu:** Services > Contact Lens Exams
- **Section purposes, in order:**
  1. Opening: one contact lens for both reading and distance
  2. Near vision starts changing around the forties
  3. Multifocal fitting steps
  4. Three gains of a careful multifocal fitting
  5. Continuity with the fitting doctor
  6. Contrast with trial-box handoffs at chains
  7. Questions on who does well with multifocals
  8. Links to other contact lens services
  9. Closing booking prompt
- **What Academy Vision has:** Two multifocal lenses on the contact-lens page's brand list
- **Academy Vision evidence:**
  - `/contact-lenses/` "DAILIES TOTAL1® Multifocal" (body)
  - `/contact-lenses/` "TOTAL30® Multifocal" (body)
- **Evidence status:** DIRECT
- **Risk:** low. Academy Vision lists multifocal contacts only, so do not claim bifocal contacts.

### 5.19 `/products/designer-frames/`

- **Title:** Designer Frames in Pine Beach, NJ | Academy Vision
- **H1:** Find Your Designer Frames at Our Pine Beach Optical
- **Eye Trends source:** `/products/designer-frames/` (`audit/content-inventory.json` there; 5 main sections)
- **Menu:** Eyewear
- **Section purposes, in order:**
  1. Opening: designer frames, selected and fitted at the optical
  2. Frames grouped by material, weight and fit
  3. Common style directions customers ask for
  4. Brand list and links to other eyewear
  5. Final fitting in person, booking prompt
- **What Academy Vision has:** A section of the eyeglasses page (26 brands)
- **Academy Vision evidence:**
  - `/eyeglasses/` "Designer Frames for All" (body)
  - `/eyeglasses/` "Ray-Ban" (body)
  - `/` "With a wide selection of designer frames for adults and kids, plus our in-office finishing lab, many patients can walk out with their new glasses the very same day." (body)
  - `/location/academy-vision/` "The office is modern and well stocked with a large supply of frames." (body)
- **Evidence status:** DIRECT
- **Risk:** low. Use only the 26 brands on /eyeglasses/ (now /products/). Brand availability changes.

### 5.20 `/products/sunglasses/`

- **Title:** Sunglasses in Pine Beach, NJ | Academy Vision
- **H1:** Sunglasses and Glare Protection from Our Pine Beach Optical
- **Eye Trends source:** `/products/sunglasses/` (`audit/content-inventory.json` there; 5 main sections)
- **Menu:** Eyewear
- **Section purposes, in order:**
  1. Opening: sunglasses and prescription sunwear, with lens options
  2. Lens choices matched to outdoor activities
  3. Style directions
  4. Links to other eyewear categories
  5. Fitting and booking prompt
- **What Academy Vision has:** No product claim. Only a polarized-lens option, plus two intake-form items
- **Academy Vision evidence:** NO EVIDENCE - practice must confirm
- **Nearest Academy Vision text (this does not show the service is offered):**
  - `/eyeglasses/` "Polarized lenses for clearer vision outdoors" (body)
- **Evidence status:** NO EVIDENCE - practice must confirm (Academy Vision never says it sells sunglasses or prescription sunglasses; the only related service text is the polarized-lens option. The registration form's "Sunglasses" checkbox and "My sunglasses are missing UV (ultra-violet) protection" are intake items, not a product claim)
- **Risk:** high. Some brands on the frame list also make sunwear, but the list is headed "Designer Frames for All", so it does not show sunglasses are stocked.

### 5.21 `/products/kids-eyewear/`

- **Title:** Kids' Glasses and Frames in Pine Beach, NJ | Academy Vision
- **H1:** Durable, Comfortable Glasses for Kids in Pine Beach
- **Eye Trends source:** `/products/kids-eyewear/` (`audit/content-inventory.json` there; 5 main sections)
- **Menu:** Eyewear
- **Section purposes, in order:**
  1. Opening: frames that suit a child's face and activities
  2. Fit and durability points reviewed for each child
  3. Style directions a child can choose from
  4. The exam completes the job (link to pediatric exams)
  5. In-office fitting together, then a booking prompt
- **What Academy Vision has:** Sections of the eyeglasses and pediatric pages
- **Academy Vision evidence:**
  - `/eyeglasses/` "Kids’ Frames That Fit Their Life" (body)
  - `/eyeglasses/` "We offer frames that are lightweight, flexible, and designed to stay comfortable throughout the day." (body)
  - `/eye-care-services/pediatric-eye-care/` "Our Pine Beach optical carries a range of kid-friendly frames that are durable, comfortable, and designed to fit their style, so they actually want to wear them." (body)
  - `/article/pediatric-eye-exams-beyond-school-screenings/` "Academy Vision offers lightweight, durable children’s frames suited to school, play, and everyday wear." (body)
- **Evidence status:** DIRECT
- **Risk:** low

### 5.22 `/eye-health/`

- **Title:** Eye Health Tips in Pine Beach, NJ | Academy Vision
- **H1:** Eye Care Tips From Our Pine Beach Eye Doctors
- **Eye Trends source:** `/eye-health/` (`audit/content-inventory.json` there; 5 main sections)
- **Menu:** About Us > Eye Health (parent of the article)
- **Section purposes, in order:**
  1. Opening: plain-language eye health guidance, topic tags, booking
  2. A featured guide on children's vision warning signs
  3. Library of guides (list only real Academy Vision articles)
  4. Route each symptom to the matching service page
  5. Closing prompt: book a visit when symptoms persist
- **What Academy Vision has:** One article, plus the home page's article list
- **Academy Vision evidence:**
  - `/` "Get Expert Eye Care Tips From Our Doctors" (body)
  - `/` "Pediatric Eye Exams: Beyond School Screenings" (body)
  - `/` "Learn what pediatric eye exams assess, which vision warning signs parents should watch for, and why back-to-school is an ideal time to schedule." (body)
- **Evidence status:** DIRECT
- **Risk:** medium. Academy Vision has one article, so the hub will be thin. The library must list only real articles; do not invent guides. The featured slot is the moved article.

### 5.23 `/terms/`

- **Title:** Terms of Use | Academy Vision
- **H1:** Terms of Use for the Academy Vision Website
- **Eye Trends source:** `/terms/` (`audit/content-inventory.json` there; 11 main sections)
- **Menu:** Footer legal row
- **Section purposes, in order:**
  1. Opening: whose website this is and what the terms govern
  2. Scope of the terms
  3. Acceptable use of the website
  4. Online booking requests need confirmation; urgent problems need a call
  5. Who owns the site content
  6. Third-party links
  7. Disclaimer of warranties
  8. Liability limits
  9. How the terms may change
  10. Which state's law applies
  11. Who to contact about the terms
- **What Academy Vision has:** No terms page
- **Academy Vision evidence:** NO EVIDENCE - practice must confirm
- **Nearest Academy Vision text (this does not show the service is offered):**
  - `/disclaimer/` "The information on this site is not presented as a substitute for informed professional advice and does not substitute for consultation with optometrist or any other health and/or medical professional." (body)
  - `/appointment-request-form/` "Details are stored securely and not sent by email." (body)
- **Evidence status:** NO EVIDENCE - practice must confirm (Academy Vision has no terms page; legal text needs the practice's or its attorney's approval)
- **Risk:** high. The Eye Trends terms page itself is marked as unreviewed placeholder wording. Governing law for Academy Vision would be New Jersey (UNVERIFIED).

## 6. Header menu

Top bar: "Located at Pine Beach" -> `/eye-doctor-pine-beach/` (Academy Vision's top-bar link, previously `/hours-location/`). Header buttons: "Call: (732) 978-9306" -> `tel:+17329789306`, "Book Appointment" -> `https://scheduleyourexam.com/v3/index.php/3197`.

- Home -> `/`
- About Us -> `/about-us/`
  - Our Eye Doctors -> `/our-doctors/`
    - Marc Ullman, O.D. -> `/our-doctors/dr-marc-ullman-od/`
    - Tyler Lesko, O.D. -> `/our-doctors/dr-tyler-lesko-od/`
    - Anthony Giallombardo, O.D. -> `/our-doctors/dr-anthony-giallombardo-od/`
  - Eye Health -> `/eye-health/` [adopted]
    - Pediatric Eye Exams: Beyond School Screenings -> `/eye-health/pediatric-eye-exams-beyond-school-screenings/`
- Services -> `/services/` [Academy Vision label: "Eye Care Services"] [hub link label: "View All Services"]
  - Comprehensive Exams -> `/services/comprehensive-eye-exams/` (column head) [Academy Vision label: "Comprehensive Eye Exams"]
    - Adult Eye Exams -> `/services/adult-eye-exams/` [adopted]
    - Senior Eye Exams -> `/services/senior-eye-exams/` [adopted]
  - Children's Eye Care -> `/services/childrens-eye-care/` (column head) [adopted]
    - Pediatric Eye Exams -> `/services/pediatric-eye-exams/` [Academy Vision label: "Pediatric Eye care"]
    - Children's Contact Lenses -> `/services/childrens-contact-lenses/` [adopted] [hold until the practice confirms (evidence PARTIAL)]
    - Back-to-School Eye Exams -> `/services/back-to-school-eye-exams/` [adopted]
    - Myopia Management -> `/services/myopia-management/`
  - Medical Eye Care -> `/services/medical-eye-care/` (column head) [Academy Vision label: "Eye Disease Management"]
    - Dry Eye Treatment -> `/services/dry-eye-treatment/`
    - Glaucoma Management -> `/services/glaucoma-management/` [adopted]
    - Diabetic Eye Exams -> `/services/diabetic-eye-exams/` [adopted]
    - Macular Degeneration -> `/services/macular-degeneration/` [adopted]
    - Cataract Co-Management -> `/services/cataract-co-management/` [adopted]
    - LASIK Co-Management -> `/services/lasik-co-management/`
  - Emergency Eye Care -> `/services/emergency-eye-care/` (column head) [adopted]
    - Pink Eye Treatment -> `/services/pink-eye-conjunctivitis/` [adopted] [hold until the practice confirms (adopt risk high, evidence PARTIAL)]
    - Foreign Body Removal -> `/services/foreign-body-removal/` [adopted] [hold until the practice confirms (evidence PARTIAL)]
    - Red Eye Treatment -> `/services/red-eye-treatment/` [adopted]
    - Flashes & Floaters -> `/services/flashes-floaters/` [adopted] [hold until the practice confirms (adopt risk high)]
  - Contact Lens Exams -> `/services/contact-lens-exams/` (column head) [Academy Vision label: "Contact Lenses Exams"]
    - Same-Day Contacts -> `/services/same-day-contacts/` [adopted] [hold until the practice confirms (adopt risk high)]
    - Scleral Lenses -> `/services/specialty-contacts/` [slot: Specialty Contacts]
    - Orthokeratology (Ortho-K) -> `/products/contact-lenses/orthokeratology-ortho-k/`
    - Toric Contacts -> `/services/toric-contacts/` [adopted]
    - Gas Permeable Contacts -> `/services/gas-permeable-contacts/` [adopted] [hold until the practice confirms (adopt risk high)]
    - Multifocal Contacts -> `/services/multifocal-contacts/` [adopted]
- Eyewear -> `/products/` [Academy Vision label: "Eyeglasses"]
  - Designer Frames -> `/products/designer-frames/` [adopted]
  - Sunglasses -> `/products/sunglasses/` [adopted] [hold until the practice confirms (adopt risk high)]
  - Kids' Eyewear -> `/products/kids-eyewear/` [adopted]
  - Contact Lenses -> `/products/contact-lenses/`
  - Varilux® Lenses -> `/products/varilux-lenses/` (group: Lenses)
  - Avulux® Migraine Lenses -> `/products/avulux-migraine-lenses/` (group: Lenses)
  - Stellest® Lenses -> `/products/stellest-lenses/` (group: Lenses)
- Insurance -> `/insurance/`
- Reviews -> `/reviews/`
- Visit Us -> `/eye-doctor-pine-beach/` [Academy Vision label: "Hours & Location"]
  - Patient Registration Form -> `/patient-forms/`
  - Appointment Request Form -> `/appointment-request-form/`

Labels: the 7 top-level items and the 5 Services column heads are the decided Eye Trends menu. A link that opens an Academy Vision page carries Academy Vision's own label where it has one (shown when it differs). Adopted pages carry a plain service name matching the slug. Links marked [hold] (every link to an adopted page whose evidence is PARTIAL or NO EVIDENCE, here and in the footer) stay out of the live menu and footer until the practice confirms the service.

### Academy Vision CTA labels (kept)

| Label | Where | New href | Old href | Evidence |
|---|---|---|---|---|
| "Book Appointment" | header primary button (all pages) and every in-page booking button | `https://scheduleyourexam.com/v3/index.php/3197` | `https://scheduleyourexam.com/v3/index.php/3197` | `/` "Book Appointment" |
| "Call: (732) 978-9306" | header call button (all pages) | `tel:+17329789306` | `tel:+17329789306` | `/` "Call: (732) 978-9306" |
| "Located at Pine Beach" | top bar location link | `/eye-doctor-pine-beach/` | `/hours-location/` | audit/raw/index.html header: `<a href="/hours-location/">Located at Pine Beach</a>` (read with tmp/ia/menu-tree.mjs) |
| "Contact Us" | insurance page button | `/eye-doctor-pine-beach/` | `/hours-location/` | `/insurance/` "Contact Us" |
| "View All Services" | Services mega-menu hub link; home services button | `/services/` | `/eye-care-services/` | `/` "View All Services" |
| "About Our Practice" | home about button | `/about-us/` | `/about-us/` | `/` "About Our Practice" |
| "Explore Our Eyewear" | home eyewear button | `/products/` | `/eyeglasses/` | `/` "Explore Our Eyewear" |
| "Browse Our Eyewear" | pediatric page eyewear button | `/products/` | `/eyeglasses/` | `/eye-care-services/pediatric-eye-care/` "Browse Our Eyewear" |
| "Contact Lens Options" | home contact-lens button | `/products/contact-lenses/` | `/contact-lenses/` | `/` "Contact Lens Options" |
| "More About Contact Lens Exams" | contact-lens page button | `/services/contact-lens-exams/` | `/contact-lenses/contact-lenses-exams/` | `/contact-lenses/` "More About Contact Lens Exams" |
| "Schedule a visit" | article booking link | `https://scheduleyourexam.com/v3/index.php/3197` | `https://scheduleyourexam.com/v3/index.php/3197` | `/article/pediatric-eye-exams-beyond-school-screenings/` "Schedule a visit" |
| "Read More" | cards: home article, doctors page bios | per card | per card | `/` "Read More" |

## 7. Footer

**Eye Care Services**

- Comprehensive Exams -> `/services/comprehensive-eye-exams/`
- Children's Eye Care -> `/services/childrens-eye-care/`
- Medical Eye Care -> `/services/medical-eye-care/`
- Emergency Eye Care -> `/services/emergency-eye-care/`
- Contact Lens Exams -> `/services/contact-lens-exams/`
- View All Services -> `/services/`

**Eyewear**

- Designer Frames -> `/products/designer-frames/`
- Sunglasses -> `/products/sunglasses/` [hold until the practice confirms (adopt risk high)]
- Kids' Eyewear -> `/products/kids-eyewear/`
- Contact Lenses -> `/products/contact-lenses/`
- Varilux® Lenses -> `/products/varilux-lenses/`
- Avulux® Migraine Lenses -> `/products/avulux-migraine-lenses/`
- Stellest® Lenses -> `/products/stellest-lenses/`

**Our Practice**

- About Us -> `/about-us/`
- Our Eye Doctors -> `/our-doctors/`
- Insurance -> `/insurance/`
- Reviews -> `/reviews/`
- Eye Health -> `/eye-health/`
- Patient Registration Form -> `/patient-forms/`

**Contact Us** (Academy Vision's own footer headings are "Contact Us", "Locate Us" (map) and "Hours"; the map and hours blocks stay in this column.)

- (732) 978-9306 -> `tel:+17329789306`
- 90 Atlantic City Blvd, Pine Beach, NJ 08741 » -> `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJY_IBgmWewYkR5dH3MXBDmeE`
- Hours & Location -> `/eye-doctor-pine-beach/`
- Book Appointment -> `https://scheduleyourexam.com/v3/index.php/3197`
- Appointment Request Form -> `/appointment-request-form/`

**Legal row**

- Accessibility -> `/accessibility/`
- Sitemap -> `/sitemap/`
- Privacy -> `/privacy-policy/`
- Disclaimer -> `/disclaimer/`
- Terms of Use -> `/terms/` [adopted] [hold until the practice or its attorney approves the text (adopt risk high)]

Academy Vision's current footer (on all 31 pages): a "Contact Us" block (name, phone, address), a "Locate Us" map, an "Hours" table, and the row Accessibility, Sitemap, Privacy, Disclaimer. The Eye Trends footer has four link columns and a legal row. The columns above follow Eye Trends; titles and labels are Academy Vision's where it has them.

## 8. Redirects

Each moved page gets one 301 straight to its final URL. Both served forms (`/old` and `/old/`) are matched directly: the source host 301s the slashless form to the slashed one, so matching only `/old/` would make `/old` take two hops. No target is itself redirected, and the 7 KEEP pages need no rule. The crawl recorded **no aliases** (every page has `aliases: []`; `counts.aliasesCollapsed` is 0); its only redirects are those slashless-to-slashed hops, on 30 of 31 pages.

| # | From | To | Status |
|---|---|---|---|
| 1 | `/article/pediatric-eye-exams-beyond-school-screenings` or `/article/pediatric-eye-exams-beyond-school-screenings/` | `/eye-health/pediatric-eye-exams-beyond-school-screenings/` | 301 |
| 2 | `/contact-lenses` or `/contact-lenses/` | `/products/contact-lenses/` | 301 |
| 3 | `/contact-lenses/contact-lenses-exams` or `/contact-lenses/contact-lenses-exams/` | `/services/contact-lens-exams/` | 301 |
| 4 | `/contact-lenses/orthokeratology-ortho-k` or `/contact-lenses/orthokeratology-ortho-k/` | `/products/contact-lenses/orthokeratology-ortho-k/` | 301 |
| 5 | `/contact-lenses/scleral-lenses` or `/contact-lenses/scleral-lenses/` | `/services/specialty-contacts/` | 301 |
| 6 | `/eye-care-services` or `/eye-care-services/` | `/services/` | 301 |
| 7 | `/eye-care-services/comprehensive-eye-exams` or `/eye-care-services/comprehensive-eye-exams/` | `/services/comprehensive-eye-exams/` | 301 |
| 8 | `/eye-care-services/dry-eye-treatment` or `/eye-care-services/dry-eye-treatment/` | `/services/dry-eye-treatment/` | 301 |
| 9 | `/eye-care-services/eye-disease-management` or `/eye-care-services/eye-disease-management/` | `/services/medical-eye-care/` | 301 |
| 10 | `/eye-care-services/lasik-co-management` or `/eye-care-services/lasik-co-management/` | `/services/lasik-co-management/` | 301 |
| 11 | `/eye-care-services/myopia-management` or `/eye-care-services/myopia-management/` | `/services/myopia-management/` | 301 |
| 12 | `/eye-care-services/pediatric-eye-care` or `/eye-care-services/pediatric-eye-care/` | `/services/pediatric-eye-exams/` | 301 |
| 13 | `/eyeglasses` or `/eyeglasses/` | `/products/` | 301 |
| 14 | `/eyeglasses/avulux-migraine-lenses` or `/eyeglasses/avulux-migraine-lenses/` | `/products/avulux-migraine-lenses/` | 301 |
| 15 | `/eyeglasses/stellest-lenses` or `/eyeglasses/stellest-lenses/` | `/products/stellest-lenses/` | 301 |
| 16 | `/eyeglasses/varilux-lenses` or `/eyeglasses/varilux-lenses/` | `/products/varilux-lenses/` | 301 |
| 17 | `/hours-location` or `/hours-location/` | `/eye-doctor-pine-beach/` | 301 |
| 18 | `/location/academy-vision` or `/location/academy-vision/` | `/reviews/` | 301 |
| 19 | `/our-eye-doctor` or `/our-eye-doctor/` | `/our-doctors/` | 301 |
| 20 | `/patient-registration-form` or `/patient-registration-form/` | `/patient-forms/` | 301 |
| 21 | `/team/dr-anthony-giallombardo-od` or `/team/dr-anthony-giallombardo-od/` | `/our-doctors/dr-anthony-giallombardo-od/` | 301 |
| 22 | `/team/dr-marc-ullman-od` or `/team/dr-marc-ullman-od/` | `/our-doctors/dr-marc-ullman-od/` | 301 |
| 23 | `/team/dr-tyler-lesko-od` or `/team/dr-tyler-lesko-od/` | `/our-doctors/dr-tyler-lesko-od/` | 301 |
| 24 | `/website-accessibility-policy` or `/website-accessibility-policy/` | `/accessibility/` | 301 |

In-content links that `remap()` changes (main content of the 30 pages other than /sitemap/, which is regenerated): `/eye-care-services/comprehensive-eye-exams/` 21, `/hours-location/` 18, `/eye-care-services/myopia-management/` 6, `/eye-care-services/pediatric-eye-care/` 5, `/eye-care-services/dry-eye-treatment/` 4, `/eyeglasses/` 3, `/contact-lenses/contact-lenses-exams/` 3, `/eye-care-services/eye-disease-management/` 3, `/eyeglasses/stellest-lenses/` 3, `/team/dr-marc-ullman-od/` 3, `/team/dr-tyler-lesko-od/` 3, `/team/dr-anthony-giallombardo-od/` 3, `/article/pediatric-eye-exams-beyond-school-screenings/` 2, `/contact-lenses/orthokeratology-ortho-k/` 2, `/contact-lenses/scleral-lenses/` 2, `/eye-care-services/lasik-co-management/` 2, `/eyeglasses/varilux-lenses/` 2, `/eyeglasses/avulux-migraine-lenses/` 2, `/our-eye-doctor/` 1, `/eye-care-services/` 1, `/contact-lenses/` 1.

## 9. Deliberate deviations from the Eye Trends structure

- **V1.** Doctors page at /our-doctors/ (plural). Eye Trends uses /our-doctor/ because it has one doctor; Academy Vision has three optometrists.
- **V2.** The town page is /eye-doctor-pine-beach/ (Eye Trends: /eye-doctor-clear-lake/).
- **V3.** About Us opens Academy Vision's own /about-us/, not the doctor page, and gets a dropdown: Our Eye Doctors (with the three bios) and Eye Health (with the article). Eye Trends' About Us has no dropdown.
- **V4.** Visit Us gets a dropdown with Academy Vision's two forms (Patient Registration Form at /patient-forms/, Appointment Request Form). Eye Trends' Visit Us has none.
- **V5.** 11 Academy Vision pages have no Eye Trends slot and are added to the structure: /about-us/, /appointment-request-form/, /sitemap/, three bios under /our-doctors/, three lens products under /products/, ortho-k under /products/contact-lenses/, the article under /eye-health/. That makes 54 pages (31 + 23 adopted).
- **V6.** The Specialty Contacts slot holds the scleral page and is labelled "Scleral Lenses". The Eye Trends specialty page is about toric, GP and multifocal fittings and refers irregular corneas elsewhere.
- **V7.** Ortho-k is listed in the Services > Contact Lens Exams group, but its URL is under /products/contact-lenses/ (longest-prefix rule). Its breadcrumb will read Eyewear > Contact Lenses.
- **V8.** The Eyewear menu gains a "Lenses" group with Varilux, Avulux and Stellest.
- **V9.** The booking CTA goes to Academy Vision's external scheduler (scheduleyourexam.com) with its own label "Book Appointment". Eye Trends opens an on-page booking form.
- **V10.** The legal row keeps Academy Vision's labels and links (Accessibility, Sitemap, Privacy, Disclaimer) and adds a Terms of Use link (Eye Trends has no sitemap page).
- **V11.** URLs end in a slash, as Academy Vision's host serves them (30 of 31 pages record a 301 from the slashless form). Eye Trends' hrefs are slashless.
- **V12.** The Services group labels follow the decided Eye Trends menu, so two Academy Vision pages sit under labels that are not their own: "Medical Eye Care" (page titled Eye Disease Management) and "Contact Lens Exams" (Academy Vision's label: "Contact Lenses Exams").

## 10. Open questions and UNVERIFIED

- **Q1.** Two phone numbers. The visible NAP everywhere is (732) 978-9306, but every page's mobile-header icon dials tel:+17327361700, /eye-care-services/ prints "(732) 736-1700" twice, and the JSON-LD LocalBusiness/MedicalBusiness/Optician blocks give "(732) 736-1700". This is for the facts lane and the practice to settle; the menus and CTAs here use (732) 978-9306. Evidence: `/eye-care-services/` "(732) 736-1700".
- **Q2.** Adopted pages with no or partial evidence (flashes-floaters, same-day-contacts, gas-permeable-contacts, sunglasses, terms; partial: pink-eye, foreign-body-removal, childrens-contact-lenses) need the practice to confirm the service before they are indexed or added to the menu.
- **Q3.** The 20 reviews on /reviews/ (from /location/academy-vision/) come from the platform's review carousel. Where they come from (for example a Google sync) and whether they may be frozen into a static page is UNVERIFIED.
- **Q4.** The article page has no `<h1>` in the saved markup. Its JSON-LD headline "Pediatric Eye Exams: Beyond School Screenings" (Academy Vision's own text) should become the h1. Evidence: `/article/pediatric-eye-exams-beyond-school-screenings/` "Pediatric Eye Exams: Beyond School Screenings".
- **Q5.** The LASIK page links the words "comprehensive eye evaluation" to /eye-care-services/pediatric-eye-care/. That looks like a mislink in the source. remap() keeps it, now pointing at /services/pediatric-eye-exams/, unless the content lane and the practice change it. Evidence: `/eye-care-services/lasik-co-management/` "We start with a comprehensive eye evaluation to determine if LASIK is right for you".
- **Q6.** /eye-care-services/ contains an account-equipment-1 component that is empty in the saved HTML. Whether it renders an equipment list client-side is UNVERIFIED (not captured in a browser this run).
- **Q7.** Seven pages carry a medium render-risk flag (appointment-request-form, hours-location, our-eye-doctor, sitemap, the three bios). Their static bodyText reads complete, but no browser capture confirmed it this run (UNVERIFIED).
- **Q8.** D1 alternative: if the operator wants Academy Vision's own text on the Children's Eye Care group head, swap it: /eye-care-services/pediatric-eye-care/ goes to /services/childrens-eye-care/ and /services/pediatric-eye-exams/ is adopted. Only moves[], adopt[] and the nav labels change.
- **Q9.** The crawl counted 35 sitemap `<loc>` entries but 31 unique pages. The counter in tools/sr-local/sr-crawl.mjs counts every same-site `<loc>`, while the seeds are a Set. sitemap.xml was not saved, so which entries repeat is UNVERIFIED.

## 11. Verification record

`node tmp/ia/verify-restructure.mjs` ran at 2026-10-08T03:16:07.345Z against `src/content/restructure.json` and this file (this section excluded). Result: **35 of 35 checks passed**.

| Check | Result | Detail |
|---|---|---|
| schema | pass | academyvision/restructure@1 |
| all 31 crawled pages placed (moves + keep), none twice | pass | crawled 31, moves 24, keep 7, missing [], extra [], in both [] |
| no two pages on one path (31 Academy Vision + 23 adopted = 54 distinct) | pass | distinct 54; dup AV []; dup adopt []; AV/adopt clash [] |
| own-path convention (no leading/trailing slash) | pass | all own paths |
| all 43 Eye Trends paths mapped once (filled or ADOPT), each lands where stated | pass | ET 43, filled 20, adopt 23 |
| no Academy Vision page fills two Eye Trends paths | pass | 20 fillers, 20 distinct |
| decided paths: /our-doctors/ and /eye-doctor-pine-beach/ exist; /our-doctor/ and /eye-doctor-clear-lake/ do not | pass | our-eye-doctor -> our-doctors; hours-location -> eye-doctor-pine-beach |
| redirects: one 301 per moved page, both URL forms, no chains, no live page shadowed | pass | 24 rules for 24 moves |
| crawl aliases recorded (site-inventory) | pass | aliases 0, pages with slash-hop redirectChain 30 |
| longest-prefix moves equal what remap() derives; remap() gives every crawled page its new path | pass | 4 longest-prefix entries |
| every internal nav/footer/CTA href is a page of the restructured site (slashed form) | pass | 84 internal hrefs |
| every page of the restructured site is reachable from the header, footer or a CTA | pass | all 54 linked |
| external hrefs are Academy Vision's own (scheduler, tel, map) | pass | 6 external |
| AV source CTAs exist in audit/raw/index.html (scheduler, tel, Located at Pine Beach) | pass | checked three hrefs in the saved home page |
| decided menu: 7 top items, 5 Services column heads, 4 Eyewear cards | pass | 7 top items and 5 column heads equal the decided lists, in order; Eyewear cards present: true |
| every Eye Trends header-menu target has its slot in the new header | pass | 37 Eye Trends menu targets |
| decided footer pages present (privacy, terms, accessibility, disclaimer, patient-forms, eye-health) | pass | all present |
| every Academy Vision quote in restructure.json is verbatim on its cited page | pass | 129 quotes |
| every Academy Vision quote in SITE-ARCHITECTURE.md is verbatim on its cited page | pass | 173 quotes |
| no 6-word run from Eye Trends text in restructure.json (unless Academy Vision says it too) | pass | 0 hits across 1657 strings |
| no 6-word run from Eye Trends text in SITE-ARCHITECTURE.md, whole file (unless Academy Vision says it too) | pass | 0 hits across 942 lines (645 space-free code spans, i.e. paths, blanked first) |
| no 6-word run from Eye Trends text in any tmp/ia scratch file | pass | 44 files scanned (verify-result.json is this run's own output) |
| no authored title, h1, purpose or description equals an Eye Trends heading or title | pass | 289 strings compared |
| INFO: nav labels that equal an Eye Trends heading (the decided menu names) | pass | 7 of 49 labels (decided menu names and generic eyewear categories) |
| no Eye Trends name, town, doctor or phone in adopted titles, h1s, purposes, ET-purpose lines or menu labels | pass | clean (326 strings) |
| adopted pages: required fields, evidence status (NO EVIDENCE = empty evidence + related text; else evidence quotes), purposes at most 12 words, Pine Beach in each h1 (terms excepted) | pass | 23 adopted; 188 purposes |
| each adopted page has one purpose per Eye Trends main section (hero + h2 sections, chrome excluded) | pass | all 23 match |
| INFO: adopted evidence status | pass | {"DIRECT":15,"PARTIAL":3,"NO EVIDENCE":5} |
| SITE-ARCHITECTURE.md lists every move, keep, adopted page and redirect of the JSON | pass | moves 24/24, keep 7/7, adopt 23/23, redirects 24/24 |
| crawl facts the decisions rely on: location page orphan (0 inbound), 20 reviews, 4 photos; Hours & Location in nav on 31 pages | pass | inbound 0, reviews 20, photos 4, nav onPages 31 |
| second phone number (Q1): tel:+17327361700 present on every saved page | pass | 31 of 31 pages |
| SITE-ARCHITECTURE.md has no raw HTML tags outside code spans (<br> in table cells allowed) | pass | clean |
| no API-key-shaped string in either output | pass | pattern uuid:hex scanned |
| positive control: the shingle detector flags a planted Eye Trends phrase | pass | planted 12 words, hits 7 |
| positive control: the quote checker rejects a quote moved to the wrong page | pass | scleral text checked against /insurance/ |

## Verification record (independent IA verifier, 2026-10-08)

An independent re-check of this file and `src/content/restructure.json` against the crawls. It used scripts written for this check (`tmp/verify-ia/*.mjs`), and none of the lane's code decided a verdict. Every number below was re-measured. Eye Trends text was read on the console only and is not reproduced here.

**What was checked**

| Check | Result |
|---|---|
| Coverage of the 31 crawled pages (`audit/site-inventory.json`) | 24 MOVE + 7 KEEP; none in both, none missing, none extra |
| No two pages on one path | 54 distinct paths (31 + 23 adopted), no clash |
| The 43 Eye Trends paths (its `site-inventory.json`) | each mapped once: 4 same path, 16 moved onto, 23 ADOPT; every filler lands where stated; 11 Academy Vision pages have no slot (V5) |
| Redirects | 24 rules for 24 moves, all 301, each matching `/old` and `/old/`; every target is a page of the new site, no target is redirected again (no chains), and no rule captures a live URL |
| `remap()`, own implementation | the 4 longest-prefix moves derive exactly; every crawled page lands on its stated path |
| Menu, footer and CTA links | 84 internal hrefs resolve (slashed form); 8 external hrefs (3 distinct URLs) appear verbatim in `audit/raw/index.html`; all 37 Eye Trends header-menu targets have a slot; the 7 top items and 5 Services column heads match the Eye Trends header |
| Holds | before correction, 5 links to PARTIAL or NO EVIDENCE adopted pages were live (3 in the menu, 2 in the footer); after correction, 0. The check fired before the fix, which serves as its positive control |
| Academy Vision quotes | 129 of 129 in the JSON and 173 of 173 in this file are verbatim on the cited page, in the cited field, in the rendered raw HTML. 4 positive controls pass: wrong page, one-letter mutation and wrong field are each rejected |
| Every other double-quoted string | 167 distinct: 164 are Academy Vision text, 3 are the lane's own move-kind terms, 0 are Eye Trends text (1 before correction) |
| 6-word runs against the full Eye Trends crawl (43 raw pages: visible text, metas, JSON-LD and attributes, plus its content and SEO inventories) | JSON and this file: no run comes from prose. The only shared run is the decided URL path `/services/back-to-school-eye-exams/`, which equals an Eye Trends URL in its JSON-LD. Controls: a planted 12-word Eye Trends run gives 7 hits, and a 5-word run alone gives 0 |
| Echoes of Eye Trends headings (token overlap of 0.6 or more with an Eye Trends heading or title) | 5 lines before correction, 0 after; the generic legal title of `/terms/` remains at 0.60. 7 menu labels equal Eye Trends headings; these are the decided menu |
| Adopted outlines | each of the 23 adopted pages has one purpose per Eye Trends main section (the hero plus non-chrome h2 sections), none longer than 12 words; the evidence tally is 15 DIRECT, 3 PARTIAL, 5 NO EVIDENCE |
| Crawl facts behind the decisions | The location record has 0 inbound links, 20 review items each rated "5 out of 5 stars", 4 "Practice Image" photos and an h1 of "Academy Vision". Hours & Location is in the menu on 31 pages, and there are 18 in-content links to `/hours-location/` (19 with `/sitemap/`). There are 90 in-content links to moved pages across the 30 non-sitemap pages (20 pages carry them), with every per-target count equal to `contentLinksToRemap`. The article has no h1, and its JSON-LD headline and description both read "Pediatric Eye Exams: Beyond School Screenings". The LASIK page's "comprehensive eye evaluation" link goes to the pediatric page. The `account-equipment-1` block is empty, and 7 pages are medium render-risk |
| Other statements re-checked | the 26 frame brands; 3 astigmatism and 2 multifocal lenses; Medicare on the plans list; the founding history and new leadership on `/about-us/`; the footer blocks on all 31 pages; the title pattern; the "Read More" links to the three bios; every CTA label with its source href; the content of the hours page (Route 9 directions, its own parking lot, ramp, services, emergency care); the Riverside precedents for D1, D2, D5 and D7; and the purposes of the Eye Trends pages cited in the risk notes (age bands and Saturday hours on its children's pages, a named competing chain on its emergency page, the placeholder status of its terms page, the forms checklist, and the specialty page's referral of irregular corneas) |
| Rebuild | `tmp/ia/build-restructure.mjs`, run in a sandbox copy, reproduces the shipped JSON and sections 1 to 10 of this file byte for byte, both before and after the corrections. After the corrections it also reproduces section 11 byte for byte |
| Lane verifier | `tmp/ia/verify-restructure.mjs` on the corrected files: 35 of 35 (section 11) |

**Corrections made (each one in this file, the JSON and the generator)**

1. Holds. `hold` was added to Children's Contact Lenses, Pink Eye Treatment and Foreign Body Removal in the menu, and to Sunglasses and Terms of Use in the footer. The footer list now prints holds. The hold rule in the JSON conventions and in section 6 now covers every PARTIAL or NO EVIDENCE page, in the menu and the footer alike. Reason: Q2 requires the practice's confirmation before these pages enter the menu, yet three were live in it (Pink Eye is also risk high), and the footer linked Sunglasses and Terms with no hold.
2. Flashes and floaters (5.14). "No Academy Vision page mentions ... floaters, the retina" was false. "Floaters" is a listed symptom of diabetic retinopathy in the structured data of `/eye-care-services/eye-disease-management/`, and the retina appears in structured data and in the registration form's "Retinal detachment" item. The status stays NO EVIDENCE, and the text now says what exists.
3. Sunglasses (5.20). "The only related text is the polarized-lens option" was false. The registration form has a "Sunglasses" checkbox and the line "My sunglasses are missing UV (ultra-violet) protection". The status stays NO EVIDENCE.
4. The risk notes of 5.5, 5.7 and 5.8. "Dilation and named tests are not stated" was false. The structured data of `/eye-care-services/comprehensive-eye-exams/` lists "visual acuity, eye movement, refraction, slit lamp exam, pupil dilation, and retinal assessment", and the eye disease page's structured data lists typical tests and therapies. The notes now say these appear only in structured data, not in visible text, and must be confirmed before use.
5. The quote in 5.1. "At Academy Vision , we focus ..." carried a space left by a tag boundary; the rendered page reads "At Academy Vision, we focus ...".
6. The quote in 5.2. The Academy Vision sentence about putting lenses in and taking them out shares a 6-word run with Eye Trends text. It is Academy Vision's own wording, but it was replaced with another sentence from the same section of the same page, so no 6-word run is shared.
7. Five lines that closely restated Eye Trends headings were reworded: 5.9 item 4, 5.11 item 4, 5.14 item 6, 5.23 item 4, and the Eye Trends purpose of `/products/designer-frames/` in section 2. For 5.23 item 4 the purpose was also corrected: that section covers booking requests and urgent messages, not medical advice.
8. The D6 reason. A quoted Eye Trends fragment was replaced by a description in own words.
9. The redirect table (section 8). The 24 rows now read "`/old` or `/old/`" instead of "`/old` and `/old/`", because a path followed by "and" formed a 6-word run found in Eye Trends text.
10. Section 11 printed an earlier verifier run (904 lines, 41 files) than the `tmp/ia/verify-result.json` on disk (942 lines, 44 files). It was regenerated from a fresh run on the corrected files.
11. `tmp/ia/verify-restructure.mjs`. Its quote normaliser now drops a space before punctuation on both sides, because it was comparing against the inventory's tag-boundary text. Its redirect-row pattern now matches the "or" rows. Both of its positive controls still fire.

**Decisions challenged (all upheld; no mapping changed)**

- D3, the location record to `/reviews/`. The record holds only the address and hours block, 20 reviews and 4 photos, and nothing links to it. `/hours-location/` holds the town-page content and every inbound link. Keeping the orphan would leave a duplicate page, and folding it into the town page would drop a page.
- D1, the pediatric page to `/services/pediatric-eye-exams/`. Its outline is built around the exam: why exams matter, the signs, a kid-friendly visit, what the exam includes, frames, and booking the exam. The Eye Trends children's hub is a card page for four services. Q8 stays open.
- D2, the scleral page to `/services/specialty-contacts/`. Both pages serve hard-to-fit eyes. The Eye Trends page fits three lens types, which are separate adopted pages here, and refers irregular corneas elsewhere; those are the scleral page's own patients. So the slot keeps all of the scleral text under its own label.
- V7, the ortho-k URL under `/products/contact-lenses/`. The URL is what the decided longest-prefix rule gives. The menu keeps Academy Vision's own grouping of exams, ortho-k and scleral lenses in one column.
- D6, the registration form to `/patient-forms/`. It is Academy Vision's only patient form, only `/sitemap/` links to it, and it invites patients to print it and bring it. A hub with one link would be a thinner page.

**Lane claims that did not reproduce as stated**

- "0 hits" for 6-word runs held only against the lane's own corpus (five fields of the Eye Trends content inventory, with code spans blanked). Against the full crawl it missed the runs behind corrections 6 and 9. In `tmp/ia` it also missed the decided menu labels hard-coded in sequence in `verify-restructure.mjs` (lines 134, 137 and 139) and the decided URL path in the generator. These are labels and paths, not prose.
- "A stricter 5-word pass leaves one overlap": the full crawl gave five distinct 5-word runs before correction, all slug sequences or generic phrases.
- "The 4 high-risk adopted pages that would be in the menu are held": Pink Eye (risk high) was not held, and the footer held nothing (correction 1).
- "'flash' and 'floater' appear only on the registration form": see correction 2.
- "6 external hrefs": there are 8, because the two header buttons were not counted; they use the same 3 URLs.

**Not checked (UNVERIFIED)**

- The lane's process claims: no network requests, no browser, other lanes' files untouched, and the heredoc incident. The repository has no commits, which agrees with "no commits".
- Whether the empty equipment block and the seven medium render-risk pages render more content client-side; no browser was run for this check.
- The pixel breakpoints of the two header phone links. The second number's call icon carries `cpt--visible-lg`, `cpt--visible-md` and `cpt--visible-sm`, and the (732) 978-9306 button sits in a section with `cpt--visible-xl` and `cpt--visible-lg`. So at md and sm widths the only header call action dials (732) 736-1700 (Q1).
- Where the 20 reviews come from (Q3), which sitemap entries repeat (Q9), and the governing law for the terms page.

**Rebuilding.** `node tmp/ia/build-restructure.mjs --verification tmp/ia/verify-result.json` rewrites this file without this section, so append this section again after any rebuild. Hashes before this section was appended: `src/content/restructure.json` sha256 941cfe9b...140c3; this file 6a4bb1d3...2f25.
