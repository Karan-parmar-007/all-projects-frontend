/**
 * Lightweight verification for client CSV + app registry mapping.
 * Run: node --experimental-strip-types src/api/advanceScraper/verify.mjs
 * (or the .mjs sibling below)
 */
import assert from 'node:assert/strict'

function toCsv(rows) {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  const escape = (value) => {
    const text = value == null ? '' : String(value)
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }
  return [keys.join(','), ...rows.map((row) => keys.map((k) => escape(row[k])).join(','))].join(
    '\n',
  )
}

const csv = toCsv([
  { name: 'Acme, Inc', city: 'Austin' },
  { name: 'Quote "Co"', city: 'Dallas' },
])
assert.equal(
  csv,
  'name,city\n"Acme, Inc",Austin\n"Quote ""Co""",Dallas',
)

const APP_COMPONENTS = {
  advance_scraper: true,
}

function resolveAppState({ authenticated, bootstrap }) {
  if (!bootstrap) return 'not_found'
  if (!authenticated) return 'unauthenticated'
  if (!bootstrap.allowsAccess) return 'offline'
  if (!bootstrap.canAccess) return 'forbidden'
  if (!APP_COMPONENTS[bootstrap.appKey]) return 'unknown'
  return 'ready'
}

assert.equal(resolveAppState({ authenticated: false, bootstrap: { allowsAccess: true, canAccess: false, appKey: 'advance_scraper' } }), 'unauthenticated')
assert.equal(resolveAppState({ authenticated: true, bootstrap: { allowsAccess: false, canAccess: false, appKey: 'advance_scraper' } }), 'offline')
assert.equal(resolveAppState({ authenticated: true, bootstrap: { allowsAccess: true, canAccess: false, appKey: 'advance_scraper' } }), 'forbidden')
assert.equal(resolveAppState({ authenticated: true, bootstrap: { allowsAccess: true, canAccess: true, appKey: 'advance_scraper' } }), 'ready')
assert.equal(resolveAppState({ authenticated: true, bootstrap: { allowsAccess: true, canAccess: true, appKey: 'other' } }), 'unknown')
assert.equal(resolveAppState({ authenticated: true, bootstrap: null }), 'not_found')

console.log('frontend control checks ok')
