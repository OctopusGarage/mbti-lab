import { beforeEach, afterEach, it, expect, vi } from 'vitest'
let store, key
beforeEach(async () => {
  vi.resetModules()
  localStorage.clear()
  const m = await import('../src/composables/useDraftStore.js')
  store = m.useDraftStore()
  key = m.DRAFT_KEY
})
afterEach(() => vi.unstubAllGlobals())
it('rejects damaged, obsolete and impossible drafts', () => {
  for (const raw of [
    'broken',
    JSON.stringify({ version: 'old' }),
    JSON.stringify({
      version: 'original-93-v1',
      mode: 'short',
      answers: Array(60).fill(null),
      currentIndex: 3
    })
  ]) {
    localStorage.setItem(key, raw)
    expect(store.load().invalid).toBe(true)
    expect(localStorage.getItem(key)).toBeNull()
  }
})
it('retains failed writes in memory but clears the fallback after successful persistence', () => {
  const real = localStorage
  vi.stubGlobal('localStorage', {
    setItem() {
      throw Error('denied')
    },
    getItem() {
      throw Error('denied')
    },
    removeItem() {
      throw Error('denied')
    }
  })
  expect(store.save('short', Array(60).fill(null), 0)).toBe(false)
  expect(store.load().draft.currentIndex).toBe(0)
  vi.stubGlobal('localStorage', real)
  expect(store.save('short', Array(60).fill('a'), 1)).toBe(true)
  localStorage.removeItem(key)
  expect(store.load().draft).toBeNull()
})
it('does not resurrect a cleared draft when removal is denied', () => {
  store.save('short', Array(60).fill('a'), 2)
  const real = localStorage
  vi.stubGlobal('localStorage', {
    getItem: (key) => real.getItem(key),
    setItem() {
      throw Error('denied')
    },
    removeItem() {
      throw Error('denied')
    }
  })
  expect(store.clear()).toBe(false)
  expect(store.load()).toMatchObject({ draft: null, available: false })
  store.save('full', Array(93).fill(null), 0)
  expect(store.load().draft.mode).toBe('full')
})
