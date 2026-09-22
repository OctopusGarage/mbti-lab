import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useResultStore } from '../src/composables/useResultStore.js'

const RESULT_A = {
  type: 'INFP',
  percents: { EI: { E: 30, I: 70 }, NS: { N: 65, S: 35 }, FT: { F: 60, T: 40 }, JP: { J: 45, P: 55 } },
}
const RESULT_B = {
  type: 'ESTJ',
  percents: { EI: { E: 72, I: 28 }, NS: { N: 40, S: 60 }, FT: { F: 35, T: 65 }, JP: { J: 70, P: 30 } },
}

const SESSION_KEY = 'mbti_result'
const HISTORY_KEY = 'mbti_lab_result'

function createStorage() {
  const stored = new Map()
  return {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, String(value)),
    removeItem: (key) => stored.delete(key),
    clear: () => stored.clear(),
    raw: (key) => stored.get(key) ?? null,
  }
}

let sessionStorage
let localStorage

beforeEach(() => {
  sessionStorage = createStorage()
  localStorage = createStorage()
  vi.stubGlobal('sessionStorage', sessionStorage)
  vi.stubGlobal('localStorage', localStorage)
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-22T12:00:00Z'))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function putSession(value) {
  sessionStorage.setItem(SESSION_KEY, typeof value === 'string' ? value : JSON.stringify(value))
}

function putHistory(value) {
  localStorage.setItem(HISTORY_KEY, typeof value === 'string' ? value : JSON.stringify(value))
}

describe('submit: round-trip and stamping', () => {
  it('writes one identically stamped entry to both storages', () => {
    useResultStore().submit(RESULT_A)

    const entry = JSON.parse(sessionStorage.raw(SESSION_KEY))
    expect(entry).toEqual({ ...RESULT_A, completedAt: Date.parse('2026-09-22T12:00:00Z') })
    expect(localStorage.raw(HISTORY_KEY)).toBe(sessionStorage.raw(SESSION_KEY))
  })

  it('load() returns the submitted result with its timestamp', () => {
    useResultStore().submit(RESULT_A)

    expect(useResultStore().load()).toEqual({
      ...RESULT_A,
      completedAt: Date.parse('2026-09-22T12:00:00Z'),
    })
  })
})

describe('load: fresh-then-history precedence', () => {
  it('prefers the fresh session entry over history', () => {
    putHistory(RESULT_A)
    putSession(RESULT_B)

    expect(useResultStore().load()).toEqual(RESULT_B)
  })

  it('consumes the session entry on read and falls back to history', () => {
    putHistory(RESULT_A)
    putSession(RESULT_B)

    useResultStore().load() // consumes the handoff

    expect(sessionStorage.raw(SESSION_KEY)).toBeNull()
    expect(useResultStore().load()).toEqual(RESULT_A)
  })

  it('falls back to history when there is no session entry', () => {
    putHistory(RESULT_A)

    expect(useResultStore().load()).toEqual(RESULT_A)
  })

  it('returns the same result on repeat loads after a submit', () => {
    const { submit, load } = useResultStore()
    submit(RESULT_A)

    expect(load()).toEqual(load())
  })
})

describe('load: stale session no longer shadows history', () => {
  it('shows the newer history result on a later visit (read-and-consume)', () => {
    const { submit, load } = useResultStore()

    // Tab 1: complete test A, land on /result -> handoff consumed there.
    submit(RESULT_A)
    expect(load()).toEqual({ ...RESULT_A, completedAt: Date.parse('2026-09-22T12:00:00Z') })

    // Meanwhile tab 2 completes test B: history is newer, tab 1's session
    // entry is already gone, so it cannot shadow B.
    putHistory({ ...RESULT_B, completedAt: Date.parse('2026-09-22T12:30:00Z') })

    // Tab 1 arrives via HomeView's "view last result" link.
    expect(load().type).toBe('ESTJ')
  })
})

describe('load: malformed entries return null', () => {
  it.each([
    ['non-JSON garbage', '{not json'],
    ['JSON but not an object', '"INFP"'],
    ['missing type', { percents: RESULT_A.percents }],
    ['non-string type', { type: 1234, percents: RESULT_A.percents }],
    ['wrong length', { type: 'INF', percents: RESULT_A.percents }],
    ['too long', { type: 'INFJJ', percents: RESULT_A.percents }],
    ['invalid letter at position 1', { type: 'XNFP', percents: RESULT_A.percents }],
    ['invalid letter at position 2', { type: 'IENP', percents: RESULT_A.percents }],
    ['invalid letter at position 3', { type: 'INJP', percents: RESULT_A.percents }],
    ['invalid letter at position 4', { type: 'INFX', percents: RESULT_A.percents }],
    ['missing percents', { type: 'INFP' }],
    ['percents missing a dimension', { type: 'INFP', percents: { EI: { E: 30, I: 70 } } }],
    ['dimension is not an object', { type: 'INFP', percents: { ...RESULT_A.percents, EI: 70 } }],
    ['non-finite percent (NaN)', { type: 'INFP', percents: { ...RESULT_A.percents, EI: { E: NaN, I: 70 } } }],
    ['non-finite percent (null)', { type: 'INFP', percents: { ...RESULT_A.percents, EI: { E: null, I: 70 } } }],
    ['non-finite percent (string)', { type: 'INFP', percents: { ...RESULT_A.percents, EI: { E: '70', I: 30 } } }],
  ])('rejects %s in the session entry', (_label, value) => {
    putSession(value)

    expect(useResultStore().load()).toBeNull()
  })

  it('rejects the same malformations in the history entry', () => {
    putSession(null) // no handoff
    putHistory({ type: 'XNFP', percents: RESULT_A.percents })

    expect(useResultStore().load()).toBeNull()
  })

  it('returns null when nothing is stored', () => {
    expect(useResultStore().load()).toBeNull()
  })

  it('normalizes a stored type to its canonical uppercase form', () => {
    putSession({ type: 'infp', percents: RESULT_A.percents })

    expect(useResultStore().load()).toEqual({ type: 'INFP', percents: RESULT_A.percents })
  })
})
