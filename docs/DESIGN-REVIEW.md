# Verdant design and sustainability review

Updated 23 September 2026 against commit `1d0a5fa`.

Verdant now has a reusable PandaCSS preset, a documented component gallery, and automated checks for the principal defects identified in the 22 September review. The original blanket sustainability claim, inaccessible prose-link treatment, weak placeholder contrast, continuous gallery motion, incomplete theme preference, and forced service-worker reload behavior have been addressed in the implementation. The remaining priorities are accurate maintenance documentation, broader human validation, and an explicit offline policy for the newer content route.

## Scope and evidence

This update reviews the current source, package and installation documentation, saved evidence records, generated output, and local automated verification. Relevant implementation now lives in `packages/verdant-design/src/`, `scripts/pages/`, `scripts/client/`, and `scripts/shell.mjs`; the original review's line references into a monolithic `scripts/build.mjs` are obsolete.

The 22 September review included desktop and narrow-screen visual inspection and read-only checks of the public deployment. Those observations are historical: this update does not repeat a manual visual review or production header/compression checks. It does not establish full WCAG or WSG conformance, measured energy savings, real-device compatibility, or successful multi-deployment offline updates. Automated Chromium checks supplement, rather than complete, the manual work in [VALIDATION.md](../VALIDATION.md).

## Overall assessment

| Dimension | Current assessment |
| --- | --- |
| Visual identity | Retain the warm botanical direction praised in the original review; no wholesale redesign is indicated. |
| Layout and typography | Source now separates decorative and control borders, provides larger controls, and uses structured specimen panels. Fresh manual visual validation remains outstanding. |
| Component maturity | Documented starter preset with native-markup examples and substantially more states; still a 0.1.0 API, not a complete application component library. |
| Front-end efficiency | Static HTML, extracted CSS, system fonts, small same-origin scripts, finalized measurements, and enforced byte budgets. |
| Accessibility | Original link, placeholder, hint, motion, and theme defects have implementation fixes and targeted automated coverage. Human and assistive-technology validation remain open. |
| WSG reporting | Dated implementation evidence replaces live-audit claims. Operational evidence and full conformance remain unestablished. |
| Documentation | Useful installation and validation material exists, but several records lag behind the extracted package and expanded site. |

## Disposition of the original findings

| Original finding | Current implementation and evidence | Status / remaining work |
| --- | --- | --- |
| 1. Blanket conformance claim and static pass labels | Homepage evidence is rendered from `public/wsg-evidence.json`, which records dates, scope, sources, and open items and explicitly disclaims a live audit or full conformance. See `scripts/pages/home.mjs` and `scripts/shell.mjs`. | Original claim corrected. Refresh stale runtime versions and source pointers in the saved record; do not imply the dated snapshot was reverified merely because a build passes. |
| 2. Prose links distinguished only by color | The package preset underlines links; page styles make deliberate navigation/button exceptions. `tests/site.spec.mjs` checks prose underlines. | Addressed in source and regression coverage. |
| 3. Low-contrast placeholder and unassociated hints | `fieldInput` uses `ink.placeholder` at full opacity. Gallery fields associate help and error text with `aria-describedby`; the error specimen sets `aria-invalid`. | Addressed. Browser checks cover placeholder contrast and hint wiring; screen-reader verification remains open. |
| 4. Indefinite gallery animation | Loading specimens are static until Preview is activated. Recipe iterations are finite, the controller resets after 4.2 seconds, and a reduced-motion preference change stops the preview. See `scripts/client/gallery.mjs`. | Addressed. The finite hero entrance remains separate from the user-triggered gallery preview. |
| 5. Incomplete page-weight reporting | Measurements run after fingerprinting, include distinct render/offline/transfer totals, and publish `dist/measurements.json` with a schema. CI enforces budgets. | Addressed for local reporting. Production transfer remains unmeasured in this update. |
| 6. Unsupported reduced-data savings claim | Current evidence explicitly acknowledges that inline artwork is already delivered and does not claim a reduced-data saving. | Reporting corrected. There is no demonstrated data-saving delivery mode. |
| 7. Incomplete theme behavior | System/Light/Dark controls persist explicit choices, follow live OS changes in System mode, and set theme attributes and native `color-scheme`. Switch styling follows `aria-checked`. Site and packaged theme-runtime tests exist. | Addressed. The package's static runtime still mirrors theme constants, guarded by contract tests; it is not generated from a single source. |
| 8. Forced reloads, broad cache deletion, and route mismatch | Cache deletion is scoped to `verdant-`; `/components.html` normalizes to `/components`; unknown offline navigation gets a dedicated fallback. Updates present an apply/dismiss prompt and reload only after acceptance. See `scripts/client/sw.mjs` and `scripts/client/sw-register.mjs`. | Original defects addressed in source. A legacy `verdant-vN` migration can activate immediately without forcing page reload. Real deployment transitions and the newer route need further validation. |

## Component and visual improvements

The gallery now uses a consistent specimen structure with previews, states, usage guidance, and HTML/Panda examples. Required and invalid fields, read-only success, disabled and pressed buttons, switch states, status cards, and layout primitives replace the former isolated controls. These are demonstrations, not a working scan service. Field and hint widths share a constrained container.

Buttons and inputs have a 44px minimum height; the switch has a 44×44px interaction box around its smaller visual track. Buttons use the 14px `bodySm` token. The preset distinguishes `border.control` from decorative `border`, and includes stronger theme values and boundaries under `prefers-contrast: more`. That preference is not equivalent to testing Windows forced colors.

The homepage renders paired Light/Dark swatches and approved foreground/background combinations from package token data. Decorative illustration colors are separate from readable interface pairings. Installation documentation explains the supported spacing scale and the preset's extension of Panda defaults.

The README records an earlier SVG simplification and CPU-throttled profile. Those are historical measurements, not a fresh performance or energy result from this update. Preserve the artwork's character and use repeatable profiling to justify further complexity reductions.

## Current local measurements

The 23 September build reports the following. KiB means 1,024 bytes. Local compression estimates and observed browser transfer are different quantities and should remain separately labelled.

| Metric | Result | Enforced budget |
| --- | ---: | ---: |
| Initial-render estimate, Brotli quality 11 | 20.5 KiB | 21.5 KiB |
| Offline shell plus worker estimate, Brotli quality 11 | 31.7 KiB | 32.5 KiB |
| Cold first-session transfer, measured locally | 52.6 KiB | 54.5 KiB |
| Warm repeat-visit transfer, measured locally | 11.6 KiB | 12.0 KiB |
| Web-font files | 0.0 KiB | 0.0 KiB |

Sources: generated `dist/measurements.json`, `scripts/stats.mjs`, and `ci/budgets.json`. The worker still eagerly fetches its shell with `cache: 'reload'`; unique compressed file totals therefore should not be represented as complete first-session network costs. A synchronous head-loaded theme bootstrap is an intentional first-paint tradeoff. The shared stylesheet includes styles for multiple routes; extraction is not proof of zero unused CSS on each page.

## Remaining findings, in priority order

### 1. Bring evidence and adopter documentation up to date

**Medium priority — confirmed documentation drift.**

The evidence register still describes Node 20 for the site, one development dependency, missing license files, and source responsibilities inside the former monolithic build script. The site now targets Node 24, has additional build/test dependencies, and includes both root and package license files. The package separately declares Node 20 support; that is distinct from the demo site's runtime requirement. The register also predates the browser-support statement in `docs/INSTALL.md` and enforced byte budgets. These improvements do not settle broader governance or organizational sustainability targets.

`public/wsg-evidence.json` retains Node 20 tool labels and pointers to files whose responsibilities have moved. The README's theme-contract section refers to `scripts/theme.mjs`, although the authoritative module is now `packages/verdant-design/src/theme.mjs`.

`docs/INSTALL.md` says field error/required/success specimens and visited/active link treatments are absent, while the current gallery provides several of these examples. Distinguish site-local example styling from the exported preset's guarantees instead of listing all such examples as missing. Keep a clear boundary between an implementation checklist, automated test results, and maintainer-supplied evidence.

### 2. Finish human accessibility and compatibility validation

**Medium priority — evidence gap, not a confirmed rendering defect.**

The manual matrix and screen-reader log in `VALIDATION.md` remain largely unexecuted. Collect actual keyboard, screen-reader, full-page/text zoom, forced-colors, browser, and mobile-device results. Validate both the demo and an adopter fixture using the package's documented setup. Run the proposed usability sessions with real participants before claiming adopter usability evidence.

Automated theme emulation and axe scans do not close these rows. Historical environment-blocked labels should be reassessed when the relevant device or browser is available, rather than treated as permanent limitations.

### 3. Define offline behavior for the expanded site

**Medium priority — confirmed source limitation.**

The site now includes `/green-web`, but `public/offline-cache.json` and `normalizePage()` in `scripts/client/sw.mjs` still enumerate the original routes. The new page is neither precached nor stored by the worker's navigation branch, even after an online visit. With the network unavailable, the worker falls back to the offline page for that route.

Decide whether this informational route should be available offline, then align the cache contract, implementation, README, and tests. The README currently describes only two navigable pages. Retain explicit byte-budget accounting if the shell grows, and validate canonical routes, aliases, first-install navigation, update acceptance/dismissal, and open tabs across actual deployments. Current service-worker unit checks inspect generated source and markup; they do not prove those browser lifecycle behaviors.

### 4. Establish maintenance commitments for external adopters

**Medium priority — partially documented.**

The package has a version, license, installation guide, browser-support statement, and tested theme contract. Release notes, migration/deprecation expectations, dependency-update cadence, backup ownership, and end-of-life responsibilities still need a maintained record. A compatibility statement should be backed by execution evidence; package metadata alone does not verify that every supported consumer environment works.

Hosting energy provenance, organizational targets, supplier criteria, production data practices, and real user-research findings remain owner-supplied evidence. A missing verification record should stay unknown rather than become either a pass or proof of unsustainable hosting.

## Verification record

Ran `npm run verify:ci` on Node 24.21.0. The initial sandboxed attempt could not bind the local measurement server; the permitted rerun completed the build and tests with these results:

| Check | Result |
| --- | --- |
| Build and finalized measurements | Passed |
| All five byte budgets | Passed |
| Unit tests: measurements, worker source/contract, package theme constants | 8 passed |
| Chromium behavior, package runtime, and axe checks | 32 passed, including five routes in four color/contrast modes |
| Gallery screenshot comparisons | 3 failed: Light, Dark, and increased contrast |

The full verification command therefore **failed**. Screenshot baselines target the pinned Ubuntu CI runner, while this run was on macOS; platform rendering is a possible contributor, not an established explanation. Inspect the expected/actual/diff images in `test-results/` and reproduce on the baseline environment before classifying or accepting changes. Baselines were not updated. The screenshot gate accepts any nonempty `VISUAL` value, and this environment sets `VISUAL=code --wait` as its editor preference. Use an explicit `VISUAL === '1'` check or a test-specific variable to match the documented opt-in and avoid this collision.

## Recommended order of work

1. Resolve the screenshot comparison failures on the baseline environment and refresh the evidence register, saved metadata, and installation/README statements against the extracted package and current routes.
2. Decide and test the `/green-web` offline contract and real service-worker update lifecycle.
3. Complete manual accessibility, device/browser, and adopter usability validation.
4. Publish maintenance and release expectations, then update scoped sustainability evidence as actual operational records become available.

The implementation has progressed substantially beyond the original review. The next pass should concentrate on evidence freshness and validation of the reusable system in real use.
