// The published theme runtime (packages/verdant-design/src/theme-toggle.js) is a
// static file, so its constants are copies of the ones in src/theme.mjs. These
// tests fail if the two ever drift apart — which would silently break an
// explicit Light/Dark choice for anyone consuming the preset.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  themeOverrideAttr,
  themePreferenceAttr,
  themePreferenceControlName,
  themePreferenceStorageKey,
  themeResolvedAttr,
  themeTokens,
} from '../packages/verdant-design/src/theme.mjs'

const runtime = readFileSync('packages/verdant-design/src/theme-toggle.js', 'utf8')
const constant = (name) => {
  const match = runtime.match(new RegExp(`var ${name} = (.+);`))
  assert.ok(match, `${name} not found in the published theme runtime`)
  // The runtime is plain JS, so object literals use bare keys — quote them
  // before parsing rather than eval'ing the file.
  return JSON.parse(match[1].replace(/([{,]\s*)(\w+):/g, '$1"$2":'))
}

test('published theme runtime uses the theme module attribute names', () => {
  assert.equal(constant('STORAGE_KEY'), themePreferenceStorageKey)
  assert.equal(constant('OVERRIDE_ATTR'), themeOverrideAttr)
  assert.equal(constant('PREFERENCE_ATTR'), themePreferenceAttr)
  assert.equal(constant('RESOLVED_ATTR'), themeResolvedAttr)
  assert.equal(constant('CONTROL_NAME'), themePreferenceControlName)
})

test('published theme runtime uses the theme module surface colours', () => {
  assert.deepEqual(constant('THEME_COLOR'), {
    light: themeTokens['surface.100'].light,
    dark: themeTokens['surface.100'].dark,
  })
})
