import { expect, it } from 'vitest'
import { types } from '../src/data/types.js'

it('provides complete, distinct editorial reports for all types in both languages', async () => {
  const { getReport } = await import('../src/utils/report.js')
  for (const language of ['zh', 'en']) {
    const cores = new Set()
    for (const type of Object.keys(types)) {
      const report = getReport(type, language)
      expect(report.highlights).toHaveLength(3)
      expect(report.sections.map((section) => section.id)).toEqual([
        'core',
        'daily',
        'friendship',
        'close',
        'work',
        'blindspots',
        'growth',
      ])
      for (const section of report.sections)
        expect(section.text.length).toBeGreaterThan(100)
      expect(report.actions).toHaveLength(3)
      for (const action of report.actions)
        for (const key of ['context', 'step', 'phrase'])
          expect(action[key].length).toBeGreaterThan(5)
      cores.add(report.sections[0].text)
    }
    expect(cores.size).toBe(16)
  }
  expect(getReport('BAD')).toBeNull()
})
it.each([
  [44, false],
  [45, true],
  [50, true],
  [55, true],
  [56, false],
])(
  'treats %i as close=%s without changing the displayed proportions',
  async (score, close) => {
    const { interpretDimensions } = await import('../src/utils/report.js')
    const p = {
      EI: { E: score, I: 100 - score },
      NS: { N: 51, S: 50 },
      FT: { F: 60, T: 40 },
      JP: { J: 30, P: 70 },
    }
    const notes = interpretDimensions(p)
    expect(notes[0]).toMatchObject({ key: 'EI', close })
    expect(notes[1].close).toBe(true)
    expect(p.NS).toEqual({ N: 51, S: 50 })
  },
)
it('does not invent personal interpretations for missing or malformed proportions', async () => {
  const { interpretDimensions } = await import('../src/utils/report.js')
  for (const value of [null, {}, { EI: { E: 101, I: -1 } }])
    expect(interpretDimensions(value)).toEqual([])
})
it('loads each route through a separate import boundary', async () => {
  const { router } = await import('../src/router/index.js')
  for (const path of ['/', '/test', '/result', '/types']) {
    expect(
      typeof router.getRoutes().find((route) => route.path === path).components
        .default,
    ).toBe('function')
  }
})
it('offers exactly four adjacent types differing in one position for every type', async () => {
  const { getNeighbors } = await import('../src/utils/report.js')
  for (const type of Object.keys(types)) {
    const neighbors = getNeighbors(type)
    expect(neighbors).toHaveLength(4)
    expect(new Set(neighbors.map((n) => n.type)).size).toBe(4)
    neighbors.forEach((neighbor, index) => {
      expect(types[neighbor.type]).toBeDefined()
      expect(
        [...type].filter((letter, i) => letter !== neighbor.type[i]),
      ).toHaveLength(1)
      expect(type[index]).not.toBe(neighbor.type[index])
      expect(getNeighbors(neighbor.type).some((n) => n.type === type)).toBe(
        true,
      )
    })
  }
  expect(getNeighbors('bad')).toEqual([])
})
