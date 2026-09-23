# Validation record: cross-browser, accessibility, and usability

Last updated: 2026-09-22
Issue: [#13](https://github.com/ivanoats/verdant-wsg-demo/issues/13)

This record tracks what has been validated, what is blocked in this environment, and what still requires human participants or specific devices/assistive technologies.

## Status legend

- **Completed**: run and recorded in this repository workstream.
- **Blocked**: could not be run in this environment (missing device/AT/OS capability).
- **Human-required**: requires real participants; not simulated.
- **Not run**: planned but not yet executed.

## Reproducible manual validation matrix

| Area | Environment / version | Steps to reproduce | Expected outcome | Status | Notes / evidence |
| --- | --- | --- | --- | --- | --- |
| Browser baseline: Chromium desktop | Chromium (Playwright/runtime browser in this environment) | Open `/` and `/components`; verify layout, interactions, and theme behavior | Core pages render and remain usable | Not run | Needs manual browser pass in this issue follow-up |
| Browser baseline: Firefox desktop | Firefox (latest stable) | Same steps as Chromium baseline | Behavior/functionality equivalent to supported baseline | Blocked | Firefox not available in this execution environment |
| Browser baseline: Safari desktop | Safari (latest macOS stable) | Same steps as Chromium baseline | Behavior/functionality equivalent to supported baseline | Blocked | macOS/Safari device unavailable |
| Mobile narrow reflow (320px) | iOS Safari + Android Chrome (latest stable) | At 320px CSS px width, navigate homepage and components; no horizontal scroll for core content | Reflow remains readable/operable | Blocked | Real mobile devices unavailable |
| 390px narrow layout | iOS Safari/Android Chrome at 390px | Repeat primary journeys at 390px | Reflow remains readable/operable | Blocked | Real mobile devices unavailable |
| Theme parity: System/Light/Dark | Any supported browser with OS theme toggle | With the header preference on System, switch the OS between Light and Dark while the page is open; then choose Light and Dark explicitly, reload, and confirm the choice persists | System follows the OS; an explicit choice overrides it and survives reload, without content loss | Not run | Depends on issue #4 behavior contract |
| Reduced motion | Any supported browser with `prefers-reduced-motion: reduce` | Enable reduced motion, reload homepage/components | Non-essential animations are suppressed/bounded | Not run | Coordinate behavior details with issue #3 |
| Forced colors / high contrast | Windows + Edge with forced colors enabled | Enable forced colors, verify controls, text, focus indicator | Content remains readable with visible focus and state cues | Blocked | Windows forced-colors environment unavailable |
| Text-only zoom / text scaling | Desktop browser text zoom 200%; mobile text scaling | Increase text-only zoom, then test forms/nav/components | No clipped critical text; controls remain operable | Blocked | Browser/device support for text-only zoom not available here |
| Full page zoom 200% | Any desktop browser | Zoom to 200%, traverse key pages and form examples | Core tasks remain possible without loss of info/function | Not run | Pending manual run in supported desktop browsers |
| Keyboard and focus order | Any supported browser | Tab/Shift+Tab through skip link, nav, form fields, controls; activate with Enter/Space | Logical focus order, visible focus ring, keyboard operability | Not run | Requires manual interaction pass |
| Offline navigation | Browser with service worker enabled | Visit pages online, go offline, reload known routes | Offline shell/navigation works for canonical routes | Not run | Coordinate route expectations with issue #7 |

## Screen-reader verification log

Record actual browser + assistive technology pairings and outcomes **only when tested**.

| Check | Browser + version | Assistive tech + version | Route/context | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| Names / roles / states announced for major controls and landmarks | Not tested | Not tested | `/`, `/components` | Not run | Requires NVDA/JAWS/VoiceOver/TalkBack test pass |
| Error/help associations announced for field examples | Not tested | Not tested | Component field/state example | Not run | Coordinate with issue #2 if association defects are found |
| Status/loading announcements are meaningful and bounded | Not tested | Not tested | Any loading/animation demo state | Not run | Coordinate with issue #3 behavior fixes |

## Representative adopter tasks

Use these tasks for manual validation and usability sessions:

1. Understand core Verdant claims on the homepage without prior project context.
2. Choose approved tokens (including Light/Dark values) for a new UI element.
3. Find how to use a component from the gallery and identify expected states.
4. Operate a field/state example end-to-end (read hint text, enter data, interpret state).
5. Navigate key pages while offline after an initial online visit.

## Human usability research protocol (small-sample)

### Scope and constraints

- Goal: identify high-friction points for first-time adopters of the demo site.
- Method: moderated think-aloud sessions with real participants.
- Sample target: 3-5 participants matching likely adopters (design/dev practitioners).
- This repository issue does **not** simulate participants or fabricate findings.

### Consent and data minimization

- Obtain explicit consent before recording notes.
- Do not collect unnecessary personal/sensitive data.
- Store only task outcomes, observed friction points, and anonymized quotes.
- Avoid raw screen/audio retention unless explicitly needed and consented.

### Session script (template)

1. Introduction and consent confirmation.
2. Ask participant to complete the five representative tasks.
3. Prompt think-aloud narration during navigation.
4. Capture completion status, blockers, confusion points, and severity.
5. Debrief: what was easiest/hardest, what they expected to find.

## Findings template (fill only after real sessions)

| Session ID | Participant profile (non-identifying) | Tasks completed | Key friction points | Severity | Candidate follow-up issue |
| --- | --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD | TBD |

## Checks run for this issue

| Check | Command / method | Result | Status | Notes |
| --- | --- | --- | --- | --- |
| Build pipeline smoke check | `npm run build` | Pass | Completed | 2026-09-22: build generated `dist/index.html`, `dist/components.html`, `dist/404.html`, extracted PandaCSS, and fingerprinted assets successfully |
| Manual cross-browser/accessibility matrix rows | Manual | Pending | Blocked / Human-required / Not run | Requires environments and participants listed above |

## Failures and residual risks (current)

- No complete cross-browser + AT execution log is available yet in this branch.
- Forced-colors, mobile-device, and real screen-reader verification remain outstanding.
- Human usability findings are not yet collected; real-participant sessions are required.
- This record does **not** claim full WCAG/WSG conformance from automation alone.
