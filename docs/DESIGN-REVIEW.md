# Verdant design and sustainability review

Reviewed 22 September 2026.

Verdant looks good and has a strong lightweight technical foundation. It is a promising small design system and demonstration site. Its present implementation does not substantiate the claim that every default satisfies WSG. The immediate priorities are accurate claims, accessible links and form text, controlled animation, and more complete component behavior.

## Scope and evidence

Reviewed `panda.config.ts`, all five build/development scripts, public configuration, generated production output, and the homepage and component gallery in the browser. Built successfully with `npm run build`. Visually inspected the homepage and gallery at desktop size, checked mobile layouts at 390px and 320px, inspected the gallery's manual dark theme, used the keyboard skip link, and measured DOM styles and control dimensions. The skip link correctly advanced subsequent keyboard navigation into main content. Both pages avoided horizontal document overflow at the tested narrow widths; the code sample has its own horizontal scroller.

Read-only requests to the public Netlify deployment confirmed compression negotiation (gzip and Brotli), CSP and other configured security headers, immutable year-long caching for the current CSS asset, and a missing URL returning HTTP 404. The deployed homepage rewrites component links to `/components`, whereas local HTML uses `/components.html`; the rest of the compared homepage content matches. Local byte measurements below are explicitly build measurements, not a production network trace.

This is a source, visual, and targeted behavior review. It is not a complete WCAG audit, a fresh wsg-check score, a carbon/energy measurement, a full browser/device compatibility certification, or an end-to-end offline/update test. The development server deliberately substitutes a different service worker; production service-worker findings below come from source inspection. OS preference changes, forced colors, screen-reader announcements, text-only zoom, low-end-device performance, and offline updates still need dedicated validation. The original Claude artifact and promotional PNGs were not treated as the implemented design system.

## Overall assessment

| Dimension | Assessment |
| --- | --- |
| Visual identity | Strong: warm, coherent, memorable, and appropriately restrained. |
| Layout and typography | Good hierarchy and readable body text; gallery presentation is sparse and small labels dominate controls. |
| Component maturity | Starter kit: core recipes exist, but important states and usage documentation are missing. |
| Front-end efficiency | Strong: static HTML, small scripts, system fonts, no third-party runtime dependencies. |
| Accessibility | Good foundations with specific fixable defects; conformance is not established. |
| WSG alignment | Substantial implementation evidence in selected areas; full or section-level conformance is not established. |
| Sustainability reporting | Needs correction: broad promises and static pass labels overstate the available evidence. |

## WSG scope

The review uses the [W3C WSG Group Note Draft dated 20 August 2026](https://www.w3.org/TR/web-sustainability-guidelines/). Its conformance framework distinguishes criterion, guideline, section, and full conformance. Claims require a date, the specification reference, and the criteria or sections met. A scanner score alone does not establish full conformance. The site's six scorecard categories are not WSG's four top-level sections. See [WSG conformance](https://www.w3.org/TR/web-sustainability-guidelines/#conformance).

The following is an evidence map, not a completed success-criterion certification:

| WSG area | Evidence in Verdant | Assessment / next evidence needed |
| --- | --- | --- |
| 2.7–2.8: reuse and design systems | Shared tokens, semantic colors, recipes, common navigation/footer, readable source. | Good foundation. Document ownership, versioning, supported states, usage, and migration expectations. |
| 2.9–2.11: media, animation, typography | SVG artwork, system fonts, explicit image dimensions, finite hero animation, reduced-motion CSS. | Font strategy is strong. Continuous gallery motion and ineffective data-saving claims need attention. |
| 2.14–2.17: research, testing, compatibility | Responsive layouts and native controls; limited browser checks completed here. | User research, usability findings, assistive-technology testing, and broader device evidence are absent from reviewed materials. |
| 3.1–3.4: performance and code efficiency | Build measurement, minified CSS, static HTML, tiny scripts. | Add enforced budgets, accurate transfer accounting, and remove duplicated theme data. |
| 3.6–3.10: semantics, loading, metadata, preferences, layout | Landmarks, headings, labelled input, deferred scripts, metadata, theme/motion queries, responsive grids. | Strong ingredients. Fix links and placeholder contrast; reduced-data behavior is not proven. |
| 3.11–3.14: runtime, dependencies, supporting files | No framework runtime; build-only Panda dependency; manifest, robots, sitemap, custom 404. | Keep maintenance evidence and document compatibility. A manifest or file's presence alone is not a complete assessment. |
| 4.1: hosting | Netlify deployment exists; the site itself acknowledges unverified green-hosting status. | No provider energy evidence independently established here. Absence of verification is not proof of fossil-powered hosting. |
| 4.2–4.4: caching, compression, errors | Hashed assets, actual cache headers, negotiated compression, service worker, HTTP 404. | Good delivery evidence. Revisit precaching, forced reloads, and offline fallback semantics. |
| Remaining infrastructure and section 5 | No operational or organizational evidence package in this repository. | Assess applicability and collect evidence for ownership, targets, procurement, maintenance, end of life, and impact reporting. Do not mark these passed or automatically failed. |

Guideline references follow the [current WSG index](https://www.w3.org/TR/web-sustainability-guidelines/). Some code comments use older numbers: media queries are currently 3.9, animation 2.10, and code efficiency 3.2/3.4. Pin the specification edition when publishing mappings.

## Findings, in priority order

### 1. Replace the blanket conformance claim and static audit labels

**High priority — confirmed in source and visible content.**

The hero says every default satisfies WSG. Metadata repeats that promise. `scripts/build.mjs:225` defines the scorecard as hard-coded booleans, while the rendered introduction calls it “Checked live” and says five categories pass outright. No current audit artifact, date, tool version, or success-criterion mapping feeds those statuses. An earlier audit might have occurred, but the implementation cannot keep these claims current or let a reader verify them.

Several supporting statements are too absolute:

- The shared stylesheet contains rules for multiple pages, including components unused on the homepage. Static extraction is useful; it is not proof of zero unused CSS per page.
- A normal head stylesheet is render-blocking. That is reasonable here; “nothing render-blocking” is inaccurate.
- The components page has two deferred external scripts, not one.
- `no-preference` is not an explicit user opt-in to animation.
- Compression is negotiated: Brotli is available, but not every response is necessarily Brotli.

Recommended hero copy: **“A lightweight design-system starter with defaults aligned to selected Web Sustainability Guidelines.”** Replace pass labels with dated evidence links and separate verified behavior, open issues, not assessed, and not applicable. Generate the summary from saved audit results if it is intended to represent an audit.

### 2. Underline links in prose

**High priority — confirmed browser styles and calculated contrast.**

The WSG, wsg-check, and PandaCSS links have no underline. Their light-theme green is only **1.17:1** against surrounding muted text; the corresponding dark token pair is **1.19:1**. They are readable against the page but insufficiently distinguishable from adjacent text by color alone.

Add persistent underlines for prose links, with deliberate exceptions for navigation and button-like links. Preserve focus styling. This addresses the distinction explained in [W3C technique G183](https://www.w3.org/WAI/WCAG22/Techniques/general/G183). Source: `panda.config.ts:150` and the generated reset/link styles.

### 3. Define accessible placeholder styling

**High priority — confirmed computed style; ratio calculated from alpha compositing.**

The URL field inherits a placeholder color equivalent to current text at 50% opacity. On its white light-theme input background, the calculated contrast is approximately **3.34:1**, below the normal-text 4.5:1 threshold. The label is present, which is good, but does not repair low-contrast placeholder text. Set an explicit placeholder token, such as the existing muted ink with full opacity, and test both themes. Source: `panda.config.ts:108`, `scripts/build.mjs:465`.

### 4. Make animation demonstrations user-controlled

**Medium priority — confirmed source and visible animation.**

The spinner and skeleton loop indefinitely whenever reduced motion is not requested. They represent a demonstration, not an actual blocking operation. Their default motion consumes resources and distracts while the visitor reads other content. The hero is better behaved: it animates once and settles.

Start gallery animations on an explicit “Preview animation” action, stop after a short demonstration, and provide pause/stop controls if continuous preview is offered. Keep reduced-motion handling. A static status label should remain understandable when animation is off. See [WSG animation guidance](https://www.w3.org/TR/web-sustainability-guidelines/#ensure-animation-is-proportionate-and-easy-to-control) and [WCAG pause/stop/hide guidance](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Source: `panda.config.ts:128`.

### 5. Correct the page-weight metric and measure offline costs

**Medium priority — confirmed build pipeline.**

The displayed **16.2 KB** is a local Brotli-quality-11 estimate of five files. It excludes `sw.js`, the component and 404 pages, the theme script fetched during precaching, and potential duplicate downloads. It also runs before final filename substitution and before replacing the metric placeholders.

The final local build contains:

| Resource | Raw bytes | Brotli-q11 bytes |
| --- | ---: | ---: |
| Homepage HTML, including SVG | 71,936 | 9,308 |
| Shared stylesheet | 30,369 | 6,741 |
| Components HTML | 7,327 | 1,954 |
| 404 HTML | 4,267 | 1,238 |
| Theme script | 1,655 | 612 |
| Service-worker registration | 140 | 92 |
| Service worker | 2,112 | 787 |
| Favicon | 356 | 212 |
| Manifest | 419 | 217 |

The unique offline shell plus worker totals **20.7 KiB compressed locally**, before transfer headers and any duplicate fetching. This is not a measured first-session network total. The installer explicitly requests shell resources with `cache: 'reload'`, so counting unique files can understate actual transfer. The underlying site is still small; the reporting needs precision.

Publish separate initial-render, first-session-with-offline-installation, and repeat-visit measurements. Identify encoding, cache conditions, date, and units. Consider caching pages when visited instead of fetching every route immediately. Sources: `scripts/stats.mjs:10`, `scripts/fingerprint.mjs:34`, `scripts/build.mjs:555`.

### 6. Reduced-data support currently proves very little

**Medium priority — confirmed implementation limits.**

The reduced-data rule hides only `.decor`, a 356-byte SVG already also used as the favicon and included in the offline shell. It does not omit the much larger inline hero/footer artwork from the HTML. Hiding content cannot undo bytes already delivered inside HTML, and the service worker explicitly precaches the favicon regardless.

Furthermore, `prefers-reduced-data` remains experimental and is not a dependable broadly supported delivery control; see [current compatibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-data).

Keep the default experience light for everyone. If a data-saving mode is important, demonstrate actual reduced transfer with a supported approach and avoid automatic optional precaching. Do not present a media-query string's existence as evidence that users save data. Source: `panda.config.ts:170`, `scripts/build.mjs:499`.

### 7. Complete the theme switch behavior

**Medium priority — partly browser-confirmed, partly source inspection.**

The switch changes page colors and exposes its checked state correctly. However, its track remains the neutral border color when checked: the recipe's `on` variant is never applied. The browser confirmed `aria-checked=true` with a neutral track. The knob position still conveys state, so this is an implementation inconsistency rather than a wholly unusable switch.

The implementation also duplicates all colors in JavaScript, does not persist a choice between pages, does not offer a return-to-system option, and does not update checked state when the OS preference changes after initial load. Its manual override does not update `color-scheme` for native UI. Navigation back to the homepage visibly resets the manually selected dark theme.

Use an explicit System/Light/Dark model if this is a site-wide preference. Generate values from the token source or use CSS selectors; derive checked styling directly from state. If it is only a component demo, label the scope and reset behavior clearly. Sources: `panda.config.ts:117`, `scripts/build.mjs:418`, `scripts/build.mjs:517`.

### 8. Reconsider service-worker update behavior

**Medium priority — source-based, not reproduced across deployments.**

On activation, the worker deletes every cache whose name differs from its own and navigates all controlled window clients when old caches exist. That can unexpectedly reload a reader's page or discard entered form text. Cache deletion should be scoped to Verdant's cache prefix.

On an uncached offline navigation, the fallback is the homepage. This can show homepage content under an unrelated URL rather than explaining the offline state. Use a clear offline fallback, retain meaningful navigation/error semantics, and avoid forced refresh unless the user accepts it or application state is preserved. Source: `scripts/build.mjs:563`.

There is also a concrete deployed URL mismatch: the public homepage links to `/components`, but the deployed worker precaches `/components.html` and uses exact request matching. After installing from the homepage, an offline first visit through that link is therefore expected to miss the prefetched component page and fall back to the homepage. This conclusion follows from the retrieved live HTML and worker source; it was not reproduced by switching the browser offline. Normalize navigation cache keys or precache the actual published canonical routes, then test this first-visit path.

## Visual design judgment

The visual direction is worth keeping. The cream canvas feels warmer than a generic white dashboard, forest-green actions stand out, and the leaf silhouette connects the logo, palette, illustration, and closing section. The large title, restrained body measure, and consistent spacing make the homepage easy to scan. The illustration gives a small static site personality without web fonts, a video, or a downloaded raster hero.

The dark component gallery is also coherent: warm near-black surfaces, off-white type, and a softer green action color avoid a harsh inverted appearance. Desktop hierarchy is clear. Mobile reading order remains sensible, and navigation wraps into a second row at 320px without a menu dependency.

The main aesthetic improvements are:

1. **Separate decorative borders from control borders.** The same strong brown-gray border appears around inputs, cards, and large section divisions. This makes the homepage somewhat box-heavy. Introduce a softer decorative divider token while preserving adequate control boundaries and focus contrast.
2. **Improve the component gallery's presentation.** Single controls occupy small corners of a wide column, leaving substantial empty space without explaining behavior. Use consistent specimen panels with preview, states, short usage notes, and a small copyable example. The current field is only about 201px wide, while its help text spans a wider measure; aligning their widths would look more intentional.
3. **Increase comfortable control sizing.** Buttons are 34px high, the input 42px, and the switch 44×24px. These dimensions are not automatically WCAG AA failures. A roughly 44px minimum interactive area would nevertheless make the default touch experience more forgiving. Increase button labels from 13px toward 14–16px where practical.
4. **Reduce repetitive explanation.** The homepage repeatedly describes extraction, defaults, and guideline alignment. Make the opening benefit brief, show one useful product example, and move implementation detail into documentation. Keep the botanical metaphor but simplify phrasing such as “From four seeds of tokens to a whole site.”
5. **Show both palette themes directly.** Each entry lists both hex values but displays only the current theme. Paired swatches and approved foreground/background combinations would make the palette substantially more useful to adopters.
6. **Tune illustration complexity before replacing its character.** The homepage contains 1,103 DOM elements, including 826 descendants of SVGs; SVG markup accounts for roughly 49.9 KB of the 71.9 KB uncompressed HTML. Compression makes transfer small, but rendering cost is a separate question. Simplify repeated grass/leaf geometry and profile on a low-end device before assuming SVG is cost-free. No rendering bottleneck was established in this review.

## Design-system completeness

The system has useful foundations: semantic color tokens, typography and spacing values, button/card/input/switch/loading recipes, and common page structure. It is not yet a sufficiently documented production library for other teams to use confidently.

Prioritize the following before adding many more components:

- Document approved color pairings. Measured primary button contrast is **6.32:1 light** and **8.81:1 dark**; positive and critical text on the light canvas are **4.88:1** and **4.83:1**. These results do not certify every possible token combination. Illustration colors should remain decorative.
- Add field error, disabled, read-only, required, success, and loading examples where applicable. Connect hint text with `aria-describedby`; demonstrate `aria-invalid` and actionable errors. A label alone is not a complete field pattern.
- Clarify that gallery buttons and scan cards are specimens; currently the copy suggests a real scan without providing a completed scan interaction.
- Supply link, button, input, and switch usage examples with native semantics and keyboard expectations. Add visited-link and active/pressed treatments where relevant.
- Consolidate theme values and palette metadata into a single source. The same colors appear in token configuration, palette content, and runtime maps.
- Document actual token scope. Panda defaults are extended, and layouts use values beyond the advertised tiny scale, such as `16` spacing and custom 56/88px headings. Decide which values are supported public tokens and which are page-specific choices.
- Define maintenance ownership, release notes, browser support, contribution expectations, and a license file consistent with the package's declared ISC license. The reviewed repository has source access but no dedicated license file.
- Add narrowly useful automated checks: a build size budget, link/field accessibility checks, and theme-state regression coverage. Complement them with manual usability and assistive-technology checks.

## Recommended order of work

1. Correct sustainability claims and label measured versus unverified evidence.
2. Fix prose links and placeholder contrast; connect form hints.
3. Bound or explicitly control motion previews.
4. Repair theme state and consolidate token data.
5. Rework first-session measurement and service-worker update/cache behavior.
6. Improve specimen documentation, control sizing, and decorative border hierarchy.
7. Collect hosting, user-testing, and maintenance evidence before publishing a scoped conformance statement.

The design does not need a wholesale redesign. It needs more precise reporting and a second pass on the behaviors that turn an attractive demonstration into a dependable reusable system.
