// The /components gallery: documented specimens for links, buttons, fields,
// switches, status cards, layout primitives and loading patterns.
import { css } from '../../styled-system/css/index.mjs'
import { flex, vstack, hstack, stack, grid } from '../../styled-system/patterns/index.mjs'
import { card, fieldInput, switchTrack, spinner, skeleton } from '../../styled-system/recipes/index.mjs'
import { escapeHtml } from '../lib/html.mjs'
import {
  btnPrimary, btnSecondary, codeCss, compTitleCss, ledeCss, proseLinkCss,
  tokenCode, wrapCss,
} from '../styles.mjs'


const compMainCss = css({ paddingBlock: { base: '8', md: '12' } })
const compSectionCss = css({ marginTop: '12' })
const compH2Css = css({ fontSize: 'displayMd', lineHeight: 'displayMd', fontWeight: '700', margin: '0' })
const gridCss = grid({ minChildWidth: '240px' })
const cardCss = card()
const cardHeadingCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', margin: '0 0 4px' })
const cardBodyCss = css({ color: 'ink.muted', margin: '0', fontSize: 'bodySm', lineHeight: 'bodySm' })
const statusCss = hstack({ gap: '1', fontSize: 'label', lineHeight: 'label', fontWeight: '600', marginTop: '3' })
const statusPositiveCss = css({ color: 'positive' })
const statusInfoCss = css({ color: 'info' })
const statusWarningCss = css({ color: 'warning' })
const statusCriticalCss = css({ color: 'critical' })
const rowCss = flex({ gap: '3', align: 'center', wrap: 'wrap' })
const captionCss = css({ fontSize: 'label', color: 'ink.muted', margin: '0' })
const formCss = vstack({ gap: '3', alignItems: 'stretch', width: '100%', maxWidth: '360px' })
// stretch: hints and errors match the input's width, even on narrow screens
const fieldCss = vstack({ gap: '1', alignItems: 'stretch', width: '100%' })
const labelCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600' })
const hintCss = css({ fontSize: 'bodySm', color: 'ink.muted', margin: '0' })
const inputCss = fieldInput()
const switchRowCss = flex({ align: 'center', gap: '3' })
export const switchOffCss = switchTrack()
export const switchOnCss = switchTrack({ on: true })
const noteCss = css({ marginTop: '3', fontSize: 'label', color: 'ink.muted', maxWidth: '60ch' })
const motionRowCss = flex({ align: 'center', gap: '6', wrap: 'wrap' })
const motionGroupCss = vstack({ gap: '2', alignItems: 'flex-start' })
export const spinnerCss = spinner()
export const spinnerPreviewCss = spinner({ preview: true })
// Widths live in classes, not style="" — the CSP's style-src 'self' blocks
// inline style attributes, which silently collapsed these bars before.
export const skeletonWideCss = `${skeleton()} ${css({ width: '160px', height: '14px' })}`
export const skeletonWidePreviewCss = `${skeleton({ preview: true })} ${css({ width: '160px', height: '14px' })}`
export const skeletonNarrowCss = `${skeleton()} ${css({ width: '110px', height: '14px' })}`
export const skeletonNarrowPreviewCss = `${skeleton({ preview: true })} ${css({ width: '110px', height: '14px' })}`
const motionIntroCss = css({ color: 'ink.muted', maxWidth: '62ch', margin: '0 0 16px' })
const motionControlsCss = flex({ align: 'center', gap: '3', wrap: 'wrap', marginTop: '4' })
const specimenGridCss = grid({ columns: 1, gap: '6' })
const specimenCss = css({ background: 'surface.200', border: '1px solid', borderColor: 'border', borderRadius: 'lg', padding: { base: '4', md: '6' }, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '4' })
const specimenHeaderCss = vstack({ gap: '2', alignItems: 'flex-start' })
const specimenLabelCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', letterSpacing: '0.02em', color: 'accent', margin: '0' })
const specimenBlockCss = vstack({ gap: '2', alignItems: 'stretch' })
const specimenPreviewCss = css({ border: '1px solid', borderColor: 'border', borderRadius: 'md', background: 'surface.100', padding: '4' })
const layoutFrameCss = css({ border: '1px dashed', borderColor: 'border.control', borderRadius: 'md', padding: '3' })
const layoutLabelCss = css({ fontFamily: 'mono', fontSize: 'label', lineHeight: 'label', color: 'ink.muted', margin: '0' })
const layoutStackCss = stack({ gap: '3', marginTop: '2' })
const layoutStackSmallCss = stack({ gap: '2' })
const layoutGridCss = grid({ minChildWidth: '120px', gap: '2' })
const layoutColumnsCss = grid({ columns: 2, gap: '2' })
const layoutAutoCss = grid({ minChildWidth: '64px', gap: '2' })
const layoutBarCss = css({ background: 'surface.200', border: '1px solid', borderColor: 'border', borderRadius: 'sm', paddingBlock: '2', paddingInline: '3', fontSize: 'label', lineHeight: 'label', fontWeight: '600' })
const layoutBoxCss = css({ background: 'surface.200', border: '1px solid', borderColor: 'border', borderRadius: 'sm', padding: '2', fontFamily: 'mono', fontSize: 'label', lineHeight: 'label', color: 'ink.muted', textAlign: 'center', overflowWrap: 'anywhere' })
const specimenStateGridCss = grid({ minChildWidth: '160px', gap: '3' })
const specimenStateCss = css({ border: '1px dashed', borderColor: 'border', borderRadius: 'md', padding: '3', display: 'grid', gap: '2', alignContent: 'start' })
const specimenStateTitleCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', margin: '0' })
const specimenStateBodyCss = css({ display: 'grid', gap: '2' })
const specimenListCss = css({ margin: '0', paddingInlineStart: '20px', color: 'ink.muted', display: 'grid', gap: '1' })
const specimenCodeStackCss = css({ display: 'grid', gap: '2' })
const specimenDetailsCss = css({ border: '1px solid', borderColor: 'border', borderRadius: 'md', background: 'surface.100' })
const specimenSummaryCss = css({ cursor: 'pointer', paddingInline: '3', paddingBlock: '2', fontSize: 'label', lineHeight: 'label', fontWeight: '600' })
const specimenPreCss = css({ margin: '0', paddingInline: '3', paddingBottom: '3', overflowX: 'auto', fontFamily: 'mono', fontSize: 'label', lineHeight: 'label', whiteSpace: 'pre-wrap' })
const prosePreviewCss = css({ margin: '0', maxWidth: '48ch' })
const demoVisitedCss = css({ color: 'accent.strong' })
const demoFocusCss = css({ outline: '2px solid', outlineColor: 'focusRing', outlineOffset: '2px' })
const demoPrimaryHoverCss = css({ background: 'accent.strong' })
const inputErrorCss = css({ borderColor: 'critical' })
const inputSuccessCss = css({ borderColor: 'positive' })
const successTextCss = css({ fontSize: 'bodySm', color: 'positive', margin: '0' })
const errorTextCss = css({ fontSize: 'bodySm', color: 'critical', margin: '0' })
const previewStackCss = vstack({ gap: '4', alignItems: 'stretch' })
const loadingFrameCss = css({ border: '1px dashed', borderColor: 'border', borderRadius: 'md', padding: '4', display: 'grid', gap: '3', maxWidth: '300px' })
const switchDisabledCss = css({ opacity: '0.55', cursor: 'not-allowed' })

const snippet = (label, code) => `
<details class="${specimenDetailsCss}">
  <summary class="${specimenSummaryCss}">${label}</summary>
  <pre class="${specimenPreCss}"><code>${escapeHtml(code.trim())}</code></pre>
</details>`

const stateTile = (title, body, note = '') => `
<div class="${specimenStateCss}">
  <p class="${specimenStateTitleCss}">${title}</p>
  <div class="${specimenStateBodyCss}">${body}</div>
  ${note ? `<p class="${captionCss}">${note}</p>` : ''}
</div>`

const specimen = ({ id, title, blurb, preview, states, guidance, htmlCode, pandaCode }) => `
<section class="${specimenCss}" aria-labelledby="${id}-title">
  <header class="${specimenHeaderCss}">
    <h2 id="${id}-title" class="${compH2Css}">${title}</h2>
    <p class="${cardBodyCss}">${blurb}</p>
  </header>
  <div class="${specimenBlockCss}">
    <p class="${specimenLabelCss}">Preview</p>
    <div class="${specimenPreviewCss}">${preview}</div>
  </div>
  <div class="${specimenBlockCss}">
    <p class="${specimenLabelCss}">State examples</p>
    <div class="${specimenStateGridCss}">${states}</div>
  </div>
  <div class="${specimenBlockCss}">
    <p class="${specimenLabelCss}">Usage guidance</p>
    <ul class="${specimenListCss}">
      ${guidance.map((item) => `<li>${item}</li>`).join('')}
    </ul>
  </div>
  <div class="${specimenBlockCss}">
    <p class="${specimenLabelCss}">Copyable examples</p>
    <div class="${specimenCodeStackCss}">
      ${snippet('HTML', htmlCode)}
      ${snippet('Panda', pandaCode)}
    </div>
  </div>
</section>`

export const componentsBody = `
<div class="${wrapCss} ${compMainCss}">
  <h1 class="${compTitleCss}">Components</h1>
  <p class="${ledeCss}">Seven documented specimens pair preview states, concise guidance, and copyable snippets without implying a live backend. The site-wide System/Light/Dark preference lives in the header.</p>

  <div class="${specimenGridCss} ${compSectionCss}">
    ${specimen({
      id: 'link-specimen',
      title: 'Links',
      blurb: 'Use anchors for navigation in prose. The gallery keeps a deliberate visited style and leaves keyboard focus to the browser.',
      preview: `
        <p class="${prosePreviewCss}">
          Read the <a class="${proseLinkCss}" href="#field-specimen-title">field guidance</a>,
          revisit the <a class="${proseLinkCss}" href="#status-specimen-title">sample scan findings</a>,
          or inspect the <a class="${proseLinkCss} ${demoFocusCss}" href="#loading-specimen-title">loading specimen</a>.
        </p>
        <p class="${noteCss}">Visited styling appears after your browser records a destination, so the sample above uses real anchors instead of a fake disabled link.</p>`,
      states: [
        stateTile('Default', `<a class="${proseLinkCss}" href="#button-specimen-title">Browse button guidance</a>`),
        stateTile('Visited tone', `<a class="${proseLinkCss} ${demoVisitedCss}" href="#status-specimen-title">Revisit sample results</a>`, 'Browser-controlled once followed.'),
        stateTile('Focus-visible', `<a class="${proseLinkCss} ${demoFocusCss}" href="#switch-specimen-title">Move to the switch specimen</a>`, 'Tab to links; Enter follows them.'),
      ].join(''),
      guidance: [
        'Keep link text specific to the destination instead of repeating “click here.”',
        'Visited styling is intentional for prose links so readers can tell which references they have opened.',
        'Never present navigation as disabled; if an action is unavailable, use a button or explanatory text instead.',
      ],
      htmlCode: `
<p>
  Read the <a href="#field-specimen-title">field guidance</a>.
</p>`,
      pandaCode: `
const proseLink = css({
  color: 'accent',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  _visited: { color: 'accent.strong' },
})`,
    })}

    ${specimen({
      id: 'button-specimen',
      title: 'Buttons',
      blurb: 'Buttons stay native for actions. Show a pressed state only on toggle buttons, and use the disabled attribute when the action truly cannot run.',
      preview: `
        <div class="${rowCss}">
          <button class="${btnPrimary}" type="button">Save changes</button>
          <button class="${btnSecondary}" type="button">Cancel</button>
          <button class="${btnPrimary}" type="button" aria-pressed="true">Updates enabled</button>
        </div>
        <p class="${noteCss}">The pressed example is a toggle button specimen only; ordinary submit buttons should not use <code class="${codeCss}">aria-pressed</code>.</p>`,
      states: [
        stateTile('Default', `<button class="${btnPrimary}" type="button">Run sample scan</button>`),
        stateTile('Hover', `<button class="${btnPrimary} ${demoPrimaryHoverCss}" type="button">Run sample scan</button>`, 'Hover should reinforce the action without changing the label.'),
        stateTile('Focus-visible', `<button class="${btnSecondary} ${demoFocusCss}" type="button">Review changes</button>`, 'Tab to buttons; Space or Enter activates them.'),
        stateTile('Pressed toggle', `<button class="${btnPrimary}" type="button" aria-pressed="true">Sample alerts on</button>`, 'Use only when the button keeps an on/off state.'),
        stateTile('Disabled', `<button class="${btnPrimary}" type="button" disabled>Scan unavailable</button>`, 'Disabled buttons are skipped by keyboard focus.'),
      ].join(''),
      guidance: [
        'Choose links for navigation and buttons for in-page actions or form submission.',
        `Only persistent toggles should use <code class="${codeCss}">aria-pressed</code>; one-off actions stay unpressed.`,
        'Disabled buttons should explain why elsewhere when the next step is not obvious.',
      ],
      htmlCode: `
<button type="button" aria-pressed="true">
  Sample alerts on
</button>`,
      pandaCode: `
const actionButton = button({ variant: 'primary' })
const quietButton = button({ variant: 'secondary' })`,
    })}

    ${specimen({
      id: 'field-specimen',
      title: 'Fields',
      blurb: 'Single-field forms still need associated hints, actionable errors, and room for read-only or success states.',
      preview: `
        <form class="${formCss}">
          <div class="${fieldCss}">
            <label class="${labelCss}" for="site-url">Website URL <span aria-hidden="true">*</span></label>
            <input class="${inputCss}" id="site-url" name="url" type="url" inputmode="url" autocomplete="url" placeholder="https://example.com" required aria-describedby="site-url-hint">
            <p class="${hintCss}" id="site-url-hint">Use a full <code class="${codeCss}">https://</code> URL for this static example.</p>
          </div>
        </form>`,
      states: [
        stateTile('Required', `
          <label class="${labelCss}" for="site-url-required">Website URL <span aria-hidden="true">*</span></label>
          <input class="${inputCss}" id="site-url-required" type="url" required aria-describedby="site-url-required-hint" placeholder="https://example.com">
          <p class="${hintCss}" id="site-url-required-hint">Hints match the input width on narrow screens.</p>`),
        stateTile('Error', `
          <label class="${labelCss}" for="site-url-error">Website URL <span aria-hidden="true">*</span></label>
          <input class="${inputCss} ${inputErrorCss}" id="site-url-error" type="url" aria-invalid="true" aria-describedby="site-url-error-hint site-url-error-note" value="verdant.example">
          <p class="${hintCss}" id="site-url-error-hint">Provide a reachable sample URL.</p>
          <p class="${errorTextCss}" id="site-url-error-note">&#9888; Add <code class="${codeCss}">https://</code> so the address is complete.</p>`),
        stateTile('Read-only success', `
          <label class="${labelCss}" for="site-url-readonly">Website URL</label>
          <input class="${inputCss} ${inputSuccessCss}" id="site-url-readonly" type="url" readonly aria-describedby="site-url-readonly-note" value="https://verdant.example">
          <p class="${successTextCss}" id="site-url-readonly-note">&#10003; Sample target saved for the next review.</p>`),
      ].join(''),
      guidance: [
        `Keep every hint and error associated with the field through <code class="${codeCss}">aria-describedby</code>.`,
        'Error text should explain the fix, not just restate that something is invalid.',
        'Read-only fields remain focusable and selectable, which helps people copy sample values.',
      ],
      htmlCode: `
<label for="site-url">Website URL</label>
<input id="site-url" type="url" aria-invalid="true"
  aria-describedby="site-url-hint site-url-error">
<p id="site-url-hint">Provide a reachable URL.</p>
<p id="site-url-error">Add https:// so the address is complete.</p>`,
      pandaCode: `
const field = fieldInput()
const invalidField = css({ borderColor: 'critical' })
const successField = css({ borderColor: 'positive' })`,
    })}

    ${specimen({
      id: 'switch-specimen',
      title: 'Switches',
      blurb: 'Switches represent an immediate on/off setting. The track and knob follow aria-checked, so visual and announced state cannot drift.',
      preview: `
        <div class="${previewStackCss}">
          <div>
            <p class="${captionCss}">Live specimen</p>
            <div class="${switchRowCss}">
              <button type="button" class="${switchOffCss}" role="switch" aria-checked="false" aria-labelledby="specimen-switch-label" id="theme-switch">
                <span class="knob"></span>
              </button>
              <span class="${labelCss}" id="specimen-switch-label">Email alerts</span>
            </div>
          </div>
          <p class="${noteCss}">Demonstration only: the site-wide System/Light/Dark preference lives in the header. This specimen keeps its track and knob in sync with its own state.</p>
        </div>`,
      states: [
        stateTile('Off', `
          <div class="${switchRowCss}">
            <button type="button" class="${switchOffCss}" role="switch" aria-checked="false" aria-labelledby="switch-state-off">
              <span class="knob"></span>
            </button>
            <span class="${captionCss}" id="switch-state-off">Motion follows system</span>
          </div>`),
        stateTile('On', `
          <div class="${switchRowCss}">
            <button type="button" class="${switchOnCss}" role="switch" aria-checked="true" aria-labelledby="switch-state-on">
              <span class="knob"></span>
            </button>
            <span class="${captionCss}" id="switch-state-on">Email alerts on</span>
          </div>`, `Use <code class="${codeCss}">aria-checked</code> to expose state.`),
        stateTile('Disabled', `
          <div class="${switchRowCss}">
            <button type="button" class="${switchOffCss} ${switchDisabledCss}" role="switch" aria-checked="false" aria-labelledby="switch-state-disabled" disabled>
              <span class="knob"></span>
            </button>
            <span class="${captionCss}" id="switch-state-disabled">Locked by policy</span>
          </div>`, 'Space toggles switches; disabled ones stay inert.'),
      ].join(''),
      guidance: [
        'Use switches for immediate preferences, not deferred form submissions.',
        `A switch needs a visible label plus <code class="${codeCss}">aria-checked</code> to announce its state.`,
        `Native buttons already support Space and Enter, so <code class="${codeCss}">role="switch"</code> can build on that behavior.`,
      ],
      htmlCode: `
<button type="button" role="switch" aria-checked="false"
  aria-labelledby="alerts-label">
  <span class="knob"></span>
</button>
<span id="alerts-label">Email alerts</span>`,
      pandaCode: `
const switchOff = switchTrack()
const switchOn = switchTrack({ on: true })`,
    })}

    ${specimen({
      id: 'status-specimen',
      title: 'Cards and status',
      blurb: 'Sample scan cards stay obviously static. Icons and text communicate state together so the specimen does not rely on color alone.',
      preview: `
        <p class="${captionCss}">Sample scan results</p>
        <div class="${gridCss}">
          <div class="${cardCss}">
            <p class="${captionCss}">Sample result</p>
            <h3 class="${cardHeadingCss}">Homepage scan</h3>
            <p class="${cardBodyCss}">18 checks passed, 2 warnings, 0 failures.</p>
            <div class="${statusCss} ${statusPositiveCss}"><span aria-hidden="true">&#10003;</span><span>Passing sample</span></div>
          </div>
          <div class="${cardCss}">
            <p class="${captionCss}">Sample result</p>
            <h3 class="${cardHeadingCss}">Checkout flow</h3>
            <p class="${cardBodyCss}">Render-blocking script appears on the payment step.</p>
            <div class="${statusCss} ${statusWarningCss}"><span aria-hidden="true">&#9888;</span><span>Needs attention</span></div>
          </div>
        </div>`,
      states: [
        stateTile('Passing', `
          <div class="${cardCss}">
            <h3 class="${cardHeadingCss}">Accessibility summary</h3>
            <p class="${cardBodyCss}">Keyboard checks passed in this sample.</p>
            <div class="${statusCss} ${statusPositiveCss}"><span aria-hidden="true">&#10003;</span><span>Passing sample</span></div>
          </div>`),
        stateTile('Informational', `
          <div class="${cardCss}">
            <h3 class="${cardHeadingCss}">Queue note</h3>
            <p class="${cardBodyCss}">This card shows static copy only; no network request has been sent.</p>
            <div class="${statusCss} ${statusInfoCss}"><span aria-hidden="true">&#9432;</span><span>Sample only</span></div>
          </div>`),
        stateTile('Warning', `
          <div class="${cardCss}">
            <h3 class="${cardHeadingCss}">Images review</h3>
            <p class="${cardBodyCss}">One decorative image still needs an empty alt attribute.</p>
            <div class="${statusCss} ${statusWarningCss}"><span aria-hidden="true">&#9888;</span><span>Review before publish</span></div>
          </div>`),
        stateTile('Critical', `
          <div class="${cardCss}">
            <h3 class="${cardHeadingCss}">Form submission</h3>
            <p class="${cardBodyCss}">The contact form posts to an endpoint that returns an error.</p>
            <div class="${statusCss} ${statusCriticalCss}"><span aria-hidden="true">&#10005;</span><span>Blocks publish</span></div>
          </div>`),
      ].join(''),
      guidance: [
        'Label examples as samples whenever the page is not showing live application data.',
        'Pair status color with an icon or word so the meaning survives monochrome and high-contrast modes.',
        `Match the token to the stakes: ${tokenCode('info')} for neutral notes, ${tokenCode('warning')} for cautions that do not block, ${tokenCode('critical')} only for errors and destructive actions.`,
        'Keep the card body focused on the next action or takeaway instead of reproducing raw scanner output.',
      ],
      htmlCode: `
<article class="card">
  <h3>Homepage scan</h3>
  <p>18 checks passed, 2 warnings, 0 failures.</p>
  <p>✓ Passing sample</p>
</article>`,
      pandaCode: `
const resultCard = card()
const passingStatus = css({ color: 'positive' })
const infoStatus = css({ color: 'info' })
const warningStatus = css({ color: 'warning' })
const criticalStatus = css({ color: 'critical' })`,
    })}

    ${specimen({
      id: 'loading-specimen',
      title: 'Loading patterns',
      blurb: 'Loading feedback is bounded, labelled, and explicitly demo-only. Nothing animates until you ask, and reduced motion keeps it still.',
      preview: `
        <p class="${motionIntroCss}">Static by default. The preview runs four spinner turns and three skeleton pulses (about four seconds), then stops. With reduced motion requested, the examples stay still.</p>
        <div class="${motionRowCss}">
          <div class="${loadingFrameCss}">
            <div class="${statusCss}">
              <div id="demo-spinner" class="${spinnerCss}" aria-hidden="true"></div>
              <span>Preparing sample scan results</span>
            </div>
            <p class="${captionCss}">Example only &mdash; this gallery does not start a backend scan.</p>
          </div>
          <div class="${loadingFrameCss}">
            <div class="${motionGroupCss}">
              <div id="demo-skeleton-wide" class="${skeletonWideCss}" aria-hidden="true"></div>
              <div id="demo-skeleton-narrow" class="${skeletonNarrowCss}" aria-hidden="true"></div>
            </div>
            <p class="${captionCss}">Use skeletons for known layout while content is on the way.</p>
          </div>
        </div>
        <div class="${motionControlsCss}">
          <button class="${btnSecondary}" type="button" id="motion-preview">Preview loading motion</button>
        </div>
        <p class="${noteCss}" id="motion-preview-status" role="status" aria-live="polite">Static by default. Preview runs once, then stops automatically.</p>`,
      states: [
        stateTile('Spinner', `<div class="${statusCss}"><div class="${spinnerCss}" aria-hidden="true"></div><span>Loading sample data</span></div>`, 'Pair any indicator with text; the text carries the meaning.'),
        stateTile('Skeleton', `<div class="${motionGroupCss}"><div class="${skeletonWideCss}" aria-hidden="true"></div><div class="${skeletonNarrowCss}" aria-hidden="true"></div></div>`, 'Decorative placeholders stay out of the accessibility tree.'),
        stateTile('Disabled while loading', `<button class="${btnPrimary}" type="button" disabled>Preparing report</button>`, 'Reserve disabled loading buttons for actions already in progress.'),
      ].join(''),
      guidance: [
        'Announce active work with text, not with motion alone.',
        'Keep loading indicators inside the region they describe so users can tell what is pending.',
        'If the layout is already known, skeletons can reduce surprise while content arrives.',
      ],
      htmlCode: `
<div role="status" aria-label="Loading sample results"></div>
<p>Preparing sample scan results</p>`,
      pandaCode: `
const busySpinner = spinner()
const loadingSkeleton = skeleton()`,
    })}

    ${specimen({
      id: 'layout-specimen',
      title: 'Layout primitives',
      blurb: 'Three token-driven patterns, container, stack and grid, cover page structure, so pages compose layouts instead of writing display: grid by hand. This page is built from them.',
      preview: `
        <div class="${layoutFrameCss}">
          <p class="${layoutLabelCss}">container()</p>
          <div class="${layoutStackCss}">
            <p class="${layoutLabelCss}">stack({ gap: '3' })</p>
            <div class="${layoutBarCss}">Section heading</div>
            <div class="${layoutGridCss}">
              <div class="${layoutBoxCss}">grid</div><div class="${layoutBoxCss}">minChildWidth</div><div class="${layoutBoxCss}">120px</div><div class="${layoutBoxCss}">wraps</div>
            </div>
          </div>
        </div>`,
      states: [
        stateTile('Stack', `<div class="${layoutStackSmallCss}"><div class="${layoutBoxCss}">1</div><div class="${layoutBoxCss}">2</div><div class="${layoutBoxCss}">3</div></div>`, 'Vertical flow, spacing-token gap.'),
        stateTile('Grid, fixed columns', `<div class="${layoutColumnsCss}"><div class="${layoutBoxCss}">1</div><div class="${layoutBoxCss}">2</div><div class="${layoutBoxCss}">3</div><div class="${layoutBoxCss}">4</div></div>`, 'columns: 2; tracks never overflow.'),
        stateTile('Grid, auto-fit', `<div class="${layoutAutoCss}"><div class="${layoutBoxCss}">a</div><div class="${layoutBoxCss}">b</div><div class="${layoutBoxCss}">c</div></div>`, 'minChildWidth: 64px; wraps on its own.'),
      ].join(''),
      guidance: [
        `Reach for ${tokenCode('container')}, ${tokenCode('stack')} and ${tokenCode('grid')} before hand-written layout CSS; shared patterns reuse the same atomic classes, so new pages add almost no bytes.`,
        'Gaps take spacing tokens (1&ndash;12), and the default is spacing 4 (16px), so layouts stay on the 4px rhythm.',
        `Use ${tokenCode('columns')} for a fixed count and ${tokenCode('minChildWidth')} (a CSS length) when items should wrap on their own. Both keep every track inside a 320px viewport.`,
      ],
      htmlCode: `
<main class="container">
  <section class="stack">
    <h2>Scan results</h2>
    <ul class="grid">…</ul>
  </section>
</main>`,
      pandaCode: `
import { container, stack, grid } from '../styled-system/patterns/index.mjs'

const page = container()                          // 1080px, token padding
const section = stack({ gap: '6' })               // column, 24px gap
const results = grid({ minChildWidth: '240px' })  // wraps, never overflows
const stats = grid({ columns: { base: 2, md: 4 } })`,
    })}

  </div>
</div>
`

