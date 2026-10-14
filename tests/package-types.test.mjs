import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const packageRoot = 'packages/verdant-design'
const { exports } = JSON.parse(readFileSync(`${packageRoot}/package.json`, 'utf8'))

test('package API exports resolve their TypeScript declarations', () => {
  for (const [entry, runtime, declaration] of [
    ['.', './src/preset.mjs', 'preset.d.ts'],
    ['./tokens', './src/tokens.mjs', 'tokens.d.ts'],
    ['./theme', './src/theme.mjs', 'theme.d.ts'],
  ]) {
    assert.equal(exports[entry].types, `./src/${declaration}`)
    assert.equal(exports[entry].import, runtime)
    assert.ok(existsSync(`${packageRoot}/${exports[entry].types}`))
  }
})

test('theme runtime remains exported unchanged', () => {
  assert.equal(exports['./theme-toggle.js'], './src/theme-toggle.js')
})
