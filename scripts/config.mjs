// Site-wide constants and the saved WSG evidence record.
import { readFileSync } from 'node:fs'

export const REPO = 'https://github.com/ivanoats/verdant-wsg-demo'
export const WSG_CHECK = 'https://github.com/ivanoats/wsg-check'
export const WSG = 'https://w3c.github.io/sustainableweb-wsg/'
export const COMPONENTS_ROUTE = '/components'
export const COMPONENTS_FILE = '/components.html'
export const GREEN_WEB_ROUTE = '/green-web'
export const evidenceRecord = JSON.parse(readFileSync('public/wsg-evidence.json', 'utf8'))
