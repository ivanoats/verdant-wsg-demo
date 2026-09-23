# WSG applicability and evidence register

Verified: 2026-09-22

This document records what the repository can verify today for the Verdant demo, what depends on public third-party evidence, and what still needs a maintainer decision. It is an evidence register for issue #12, not a blanket WSG conformance claim.

## Method and status labels

- **Verified** — backed by repository contents or a cited public source reviewed on 2026-09-22.
- **Partial** — some implementation evidence exists, but the operational or organizational evidence is incomplete.
- **Gap** — no verifiable evidence was found in the repository for this topic.
- **Owner decision required** — the repository cannot supply this without maintainer confirmation.

## Sources reviewed on 2026-09-22

### Repository sources

Sources are cited by file and named section rather than line numbers, so they stay accurate as the files change.

- **R1** `README.md` — build instructions, "What's deliberately in here", offline cache strategy, theme contract
- **R2** `package.json` — scripts, dependencies, license field
- **R3** `package-lock.json` — locked dependency tree
- **R4** `netlify.toml` — build command, publish directory, Node version
- **R5** `public/_headers` — security and cache headers
- **R6** `panda.config.ts` — `conditions` (prefers-color-scheme), recipes (button, fieldInput, switchTrack, spinner, skeleton), `globalCss` (theme overrides, `_motionSafe` animation gating)
- **R7** `scripts/build.mjs` — page shell (`page`, `nav`: skip link, landmarks), homepage sections, components gallery (`componentsBody`: labelled fields with `aria-describedby`, bounded motion preview)
- **R8** `scripts/build.mjs` — service worker template (`swJs`: network-first navigations, scoped cache cleanup, offline fallback) and `swRegisterJs`
- **R9** `scripts/stats.mjs` and `public/measurements.schema.json` — finalized byte measurements written to `dist/measurements.json`
- **R10** `scripts/fingerprint.mjs` and `public/offline-cache.json` — hashed asset names and the published offline-cache contract
- **R11** Repository tree review on 2026-09-22: no `LICENSE`, `CONTRIBUTING.md` or Git tags were present in the checked-out repository.
- **R12** `public/sitemap.xml` and the canonical `<link>` emitted by `page()` in `scripts/build.mjs` — the site's published origin, `https://verdant-wsg-demo.netlify.app`
- **R13** `scripts/theme.mjs` and `scripts/tokens.mjs` — the single token source and the build-time contrast checks for every verified pairing

### Public sources

- **P1** W3C, [Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/)
- **P2** Netlify Docs, [Understand domains](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/)
- **P3** Netlify Docs, [File-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/)
- **P4** Netlify Docs, [Custom headers](https://docs.netlify.com/manage/routing/headers/)
- **P5** Green Web Foundation, [How does the Green Web Check work?](https://www.thegreenwebfoundation.org/support/how-does-the-green-web-check-work/)
- **P6** Green Web Foundation, [What we accept as evidence of green power](https://www.thegreenwebfoundation.org/what-we-accept-as-evidence-of-green-power/)
- **P7** Green Web Foundation, [My hosting provider was green, but now it's not. What happened?](https://www.thegreenwebfoundation.org/support/my-hosting-provider-was-green-but-now-its-not-what-happened/)
- **P8** Netlify Support Forums, [Netlify no longer recognised as green hosting by Green Web Foundation / Website Carbon](https://answers.netlify.com/t/netlify-no-longer-recognised-as-green-hosting-by-green-web-foundation-website-carbon/168975)

## Applicability and evidence register

| Area | Topic | Current evidence | Source | Scope | Verified | Status | Unresolved owner decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UX | Accessible, low-bandwidth implementation patterns | The repo contains implementation evidence for skip links, landmarks, labelled form fields with associated hints, system fonts, a System/Light/Dark theme preference over one token set, build-verified contrast pairings, motion gated on `prefers-reduced-motion`, and a network-first offline shell. Reduced-data behaviour is intentionally not claimed: art is inline, so there is nothing optional to skip. | R1, R6, R7, R8, R13 | Repository implementation | 2026-09-22 | Verified | Keep this register updated if the site architecture changes. |
| UX | User research, usability testing, or accessibility validation evidence | No study reports, test logs, or user-research artifacts were found in the repository. Related validation work is tracked separately, so this repo should not imply that human testing has been completed. | R11, P1 | Product / research evidence | 2026-09-22 | Gap | Provide links to real research or validation records when issue #13 produces them, or keep the public claim at implementation-only scope. |
| Development | Static build architecture and shipped-weight evidence | The site is generated from `scripts/build.mjs`, styled via PandaCSS static extraction, and measured after fingerprinting by `scripts/stats.mjs`, which writes `dist/measurements.json`; Netlify build config pins `npm run build` on Node 20. | R1, R4, R6, R7, R9, R10 | Repository build process | 2026-09-22 | Verified | None beyond normal maintenance. |
| Development | Maintenance ownership | Public ownership signals point to the `ivanoats/verdant-wsg-demo` repository namespace and a footer that says the site is “built by Ivan,” but there is no separate maintainer or backup-owner policy in the repo. | R7, R8 | Public repository metadata | 2026-09-22 | Partial | Name the primary maintainer, backup owner, and review cadence if this should serve as an operational record. |
| Development | Dependency update practice | The project declares one direct dev dependency (`@pandacss/dev`) and commits `package-lock.json`, but no automated update workflow or written patching cadence was found. | R2, R3, R11 | Repository dependency management | 2026-09-22 | Partial | Decide whether updates are manual, scheduled, or automated, and document the cadence. |
| Development | Browser support statement | No `browserslist`, compatibility matrix, or support policy was found in the repository. The implementation uses modern platform features, but the supported-browser promise is not documented. | R2, R6, R11 | Public maintenance guidance | 2026-09-22 | Gap | Publish the minimum supported browsers/devices and how regressions will be tested. |
| Development | Releases and versioning | `package.json` is versioned at `1.0.0`, and the build fingerprints shipped assets plus the service-worker shell, but no Git tags, release notes, or semantic-versioning policy were present in the checked-out repository. | R2, R10, R11 | Repository release mechanics | 2026-09-22 | Partial | Decide whether version numbers, tags, or release notes are part of the maintenance commitment. |
| Development | Contribution guidance | The README explains local install/build commands, but no dedicated contribution guide or issue/PR process documentation was found. | R1, R11 | Contributor documentation | 2026-09-22 | Partial | Add contribution and review guidance if outside contributions are expected. |
| Development | Deprecation and migration expectations | Asset fingerprinting and network-first HTML reduce stale-client risk during deploys, but no policy describes how breaking design-system changes, removals, or migrations will be announced. | R8, R10 | Product maintenance | 2026-09-22 | Partial | Define whether consumers should expect changelogs, migration notes, or deprecation windows. |
| Hosting / infrastructure | Hosting provenance | The checked-in `netlify.toml` and `_headers` files match Netlify deployment features, and Netlify documents that `*.netlify.app` is the provider-assigned default domain for deployed sites. | R4, R5, R12, P2, P3, P4 | Hosting platform identification | 2026-09-22 | Verified | None for provider identification; revisit if hosting changes. |
| Hosting / infrastructure | Hosting energy provenance and third-party verification | Green Web Foundation verification depends on current public provider evidence mapped to IPs/ASNs. That methodology is documented publicly. A missing or grey result is therefore evidence of missing third-party verification, not proof that the site is unsustainably hosted. Public Netlify discussion indicates current verification can lapse when provider evidence is not current enough for GWF review. | P5, P6, P7, P8 | Provider-level sustainability evidence | 2026-09-22 | Partial | If energy provenance matters for public reporting, obtain a current third-party result or provider statement that satisfies GWF-style evidence requirements. |
| Hosting / infrastructure | Backups, continuity, and disaster recovery | No repository evidence describes backup ownership, restore testing, incident handling, or continuity expectations for the deployed site. | R11 | Operational resilience | 2026-09-22 | Gap | Record who owns backups, how content/build recovery works, and what service level is expected for a demo site. |
| Business / product | Data practices | The repo describes “no third-party scripts, no analytics” for the shipped front end, but it does not document CDN/server logs, contact channels, retention, or whether any production telemetry exists outside the repo. | R1 | Product and privacy posture | 2026-09-22 | Partial | Confirm whether any analytics, logs, forms, or personal-data processing exist and document the answer. |
| Business / product | Sustainability targets, budgets, and procurement | No repository evidence defines sustainability goals, budgets, procurement criteria, or supplier-review rules. These cannot be inferred from the theme or scanner score. | R11, P1 | Organizational governance | 2026-09-22 | Gap | Add owner-approved goals and procurement criteria if Verdant will make organizational sustainability claims. |
| Business / product | End-of-life responsibility and migration path | No public evidence describes who will archive the demo, how long it will stay available, or whether there is a successor URL or migration plan. | R11 | Product lifecycle | 2026-09-22 | Gap | Decide who owns retirement, redirection, archival, and user communication when the demo is replaced. |
| Licensing | ISC declaration vs repository license file | `package.json` and `package-lock.json` declare `ISC`, but the repository does not contain a dedicated `LICENSE` file or confirmed copyright holder text. | R2, R3, R11 | Repository legal metadata | 2026-09-22 | Gap | Confirm the intended license and copyright holder name, then add the matching license file; if `ISC` was accidental, change the package metadata instead. |

## Hosting provenance notes

1. **What is currently verifiable**
   - The repository publishes `https://verdant-wsg-demo.netlify.app` as the site's origin, in `public/sitemap.xml` and in every page's canonical URL. That is a `netlify.app` hostname, which Netlify documents as its default provider-managed subdomain for deployed sites, and `netlify.toml` and `public/_headers` match documented Netlify deployment features. This is enough to identify the hosting platform, but not its electricity source. (R4, R5, R12, P2, P3, P4)
2. **What is not currently verifiable from this repository**
   - The repo does not include a captured Green Web Foundation result, provider-issued renewable-energy evidence, or a hosting contract. The repository therefore cannot prove green hosting provenance on its own. (R11, P5, P6)
3. **How to describe missing third-party verification**
   - Per Green Web Foundation guidance, verification depends on current provider evidence mapped to IP/ASN infrastructure. If a site or provider is grey/unlisted, document that as “not independently verified by the cited directory at the review date,” not as “proved unsustainable.” (P5, P6, P7)

## Existing maintenance signals

- **Maintainer signal:** public repository namespace `ivanoats/verdant-wsg-demo`; generated footer copy says “built by Ivan.” (R7, R8)
- **Dependency surface:** one direct dev dependency, `@pandacss/dev`, with a committed npm lockfile. (R2, R3)
- **Build/deploy contract:** `npm run build` is the documented build step, with Netlify publish output set to `dist/` on Node 20. (R1, R4)
- **Versioning signal:** `package.json` is `1.0.0`; deploy fingerprints are content-based, but no public release policy is documented. (R2, R10, R11)
- **Contribution signal:** README includes local setup commands; no separate contributor guide or review workflow is documented. (R1, R11)

## Owner-review checklist: human evidence still needed

- [ ] Confirm the intended repository license and copyright holder, then add a matching `LICENSE` file or change the `ISC` package metadata.
- [ ] Name the primary maintainer, backup owner, and expected maintenance/review cadence.
- [ ] Publish a browser/device support baseline and the validation approach used to maintain it.
- [ ] Decide and document how dependency updates happen (manual, scheduled, or automated) and how security patches are prioritized.
- [ ] Capture real user-research, accessibility, and cross-browser validation evidence when available; do not convert “not yet tested” into a public pass claim.
- [ ] Record whether any production telemetry, analytics, contact forms, or personal-data processing exist outside the front-end bundle.
- [ ] Record backup, continuity, and incident-recovery expectations for the deployed demo.
- [ ] Define any sustainability targets, reporting cadence, procurement rules, or hosting-selection criteria that the maintainer wants to stand behind publicly.
- [ ] Define the end-of-life owner, retention period, and migration/redirection plan for replacing or retiring the demo.

## Maintenance note

When new evidence is added, update the relevant row with a new verification date and source rather than rewriting unknowns as facts. Unknowns should remain unknown until a maintainer or a cited public source resolves them.
