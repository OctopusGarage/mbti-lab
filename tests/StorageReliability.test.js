import { beforeEach, afterEach, expect, it, vi } from 'vitest'
const result = {
  type: 'INFP',
  percents: {
    EI: { E: 30, I: 70 },
    NS: { N: 60, S: 40 },
    FT: { F: 60, T: 40 },
    JP: { J: 30, P: 70 },
  },
}
beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  sessionStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())
it('still writes history when session writes fail and never displays stale session', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  vi.stubGlobal('sessionStorage', {
    getItem: () => JSON.stringify({ ...result, type: 'ESTJ' }),
    setItem() {
      throw Error('denied')
    },
    removeItem() {
      throw Error('denied')
    },
  })
  const store = useResultStore()
  expect(store.submit(result)).toBe(true)
  expect(store.load().type).toBe('INFP')
  expect(JSON.parse(localStorage.getItem('mbti_lab_result')).type).toBe('INFP')
})
it('keeps the current result when both stores are denied', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  const denied = {
    getItem() {
      throw Error('denied')
    },
    setItem() {
      throw Error('denied')
    },
    removeItem() {
      throw Error('denied')
    },
  }
  vi.stubGlobal('localStorage', denied)
  vi.stubGlobal('sessionStorage', denied)
  const store = useResultStore()
  expect(store.submit(result)).toBe(false)
  expect(store.load().type).toBe('INFP')
  expect(store.peek().type).toBe('INFP')
})
it('rejects out of range percentages', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  localStorage.setItem(
    'mbti_lab_result',
    JSON.stringify({
      ...result,
      percents: { ...result.percents, EI: { E: 101, I: -1 } },
    }),
  )
  expect(useResultStore().load()).toBeNull()
})
it('reads later history after a successful save with an unremovable stale session', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  vi.stubGlobal('sessionStorage', {
    getItem: () => JSON.stringify({ ...result, type: 'ESTJ' }),
    setItem() {
      throw Error('denied')
    },
    removeItem() {
      throw Error('denied')
    },
  })
  const store = useResultStore()
  store.submit(result)
  expect(store.load().type).toBe('INFP')
  localStorage.setItem(
    'mbti_lab_result',
    JSON.stringify({ ...result, type: 'ENTJ' }),
  )
  expect(store.load().type).toBe('ENTJ')
  expect(store.peek().type).toBe('ENTJ')
})
it('consumes a readable fresh session even when removal fails', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  vi.stubGlobal('sessionStorage', {
    getItem: () => JSON.stringify(result),
    removeItem() {
      throw Error('denied')
    },
  })
  const store = useResultStore()
  expect(store.load().type).toBe('INFP')
  localStorage.setItem(
    'mbti_lab_result',
    JSON.stringify({ ...result, type: 'ENTJ' }),
  )
  expect(store.peek().type).toBe('ENTJ')
})
it('drops unknown percentage dimensions before charts consume stored results', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  localStorage.setItem(
    'mbti_lab_result',
    JSON.stringify({
      ...result,
      percents: { ...result.percents, unknown: { X: 10, Y: 90 } },
    }),
  )
  expect(useResultStore().load().percents).toEqual(result.percents)
})
