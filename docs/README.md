# Docs: Academy Vision redesign

This folder documents the rebuild of https://www.academyvisionnj.com/ onto the Eye Trends site structure, with the
"Bayside Daylight Glass" design. To build, serve or verify the site, use the commands in the workspace
[README](../README.md).

## Start here

| if you need to… | read |
|---|---|
| deploy `dist/` to a host (paths, the 24 redirects, the 404 page, caching, launch work, what is unverified) | [DEPLOY.md](DEPLOY.md) |
| see what is waiting on the operator or the practice (phone number, unconfirmed services, forms backend, terms, licences) | [OPEN-DECISIONS.md](OPEN-DECISIONS.md) |
| know what was built and with which verification numbers | [CHANGE-LOG.md](CHANGE-LOG.md) |
| change the build: file ownership, the pipeline/theme interface, the decisions already taken | [BUILD-CONTRACT.md](BUILD-CONTRACT.md) |
| check a measured result, or see how a role reached it | [BUILD-NOTES.md](BUILD-NOTES.md): 1 Pipeline, 2 Theme core, 3 Theme templates, 4 Integration, 5 QA round 1, 6 Verification record |

## Reference

| file | contents |
|---|---|
| [DESIGN-SPEC.md](DESIGN-SPEC.md) | The design spec: tokens, glass, depth, motion, hover/focus, chrome, components, page templates, requirements R-1 to R-32 with their acceptance tests |
| [BRAND-SYSTEM.md](BRAND-SYSTEM.md) | Academy Vision's brand, measured from the crawl: the logo, palette, type, imagery, voice, and the guardrails for the redesign |
| [SITE-ARCHITECTURE.md](SITE-ARCHITECTURE.md) | The restructure onto Eye Trends' 43-page structure: moves, kept paths, the 23 new pages, menus, footer, redirects |
| [FACTS-EVIDENCE.md](FACTS-EVIDENCE.md) | Every fact the live site states, with verbatim quotes, conflicts, gaps and the service-evidence matrix (data in `../facts/`) |
| [IMAGE-INVENTORY.md](IMAGE-INVENTORY.md) | The 139 image masters, their quality and roles, and the plan for generated images |
| [PORT-NOTES.md](PORT-NOTES.md) | The content model of the 31 source pages, built from the EyeCarePro PatientEngage markup |

## Rules these docs follow

- The 31 source pages keep Academy Vision's own words. The 23 new pages are new writing in Academy Vision's voice,
  checked against the Eye Trends crawl for shared wording.
- Every number in these docs was measured with the command named next to it. Anything not measured is marked
  UNVERIFIED.
