import { describe, it, expect } from 'vitest'
import { formatResultSummary } from '../src/utils/resultSummary'

const fullPercents = {
  EI: { E: 30, I: 70 },
  NS: { N: 65, S: 35 },
  FT: { F: 80, T: 20 },
  JP: { J: 90, P: 10 },
}

describe('formatResultSummary', () => {
  describe('invalid input', () => {
    it('returns empty string for missing result / type / percents', () => {
      expect(formatResultSummary(null)).toBe('')
      expect(formatResultSummary(undefined)).toBe('')
      expect(formatResultSummary({})).toBe('')
      expect(formatResultSummary({ type: 'INFJ' })).toBe('')
      expect(formatResultSummary({ percents: fullPercents })).toBe('')
    })

    it('returns empty string for malformed type', () => {
      expect(formatResultSummary({ type: 'XY', percents: fullPercents })).toBe('')
      expect(formatResultSummary({ type: 'INFJX', percents: fullPercents })).toBe('')
      expect(formatResultSummary({ type: 42, percents: fullPercents })).toBe('')
    })

    it('returns empty string for malformed dimension data without throwing', () => {
      const base = { type: 'INFJ' }
      expect(formatResultSummary({ ...base, percents: {} })).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, FT: undefined } })
      ).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, NS: { S: 35 } } })
      ).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, JP: { J: 'x', P: 10 } } })
      ).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, EI: { E: NaN, I: 70 } } })
      ).toBe('')
    })
    it('returns empty string for values below 0 or above 100', () => {
      const base = { type: 'INFJ' }
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, EI: { E: -1, I: 70 } } })
      ).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, NS: { N: 65, S: -0.5 } } })
      ).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, FT: { F: 80, T: 101 } } })
      ).toBe('')
      expect(
        formatResultSummary({ ...base, percents: { ...fullPercents, JP: { J: 90, P: 100.5 } } })
      ).toBe('')
    })

    it('rejects out-of-range values even when the type letter itself is valid', () => {
      // E is the used letter and in range, but I is out of range.
      expect(
        formatResultSummary({ type: 'ESTJ', percents: { ...fullPercents, EI: { E: 62, I: -38 } } })
      ).toBe('')
      // P is the used letter and in range, but J is out of range.
      expect(
        formatResultSummary({ type: 'ESTP', percents: { ...fullPercents, JP: { J: 115, P: 85 } } })
      ).toBe('')
    })
  })

  describe('english output', () => {
    it('defaults to a compact English summary with the four letters in type order', () => {
      expect(formatResultSummary({ type: 'INFJ', percents: fullPercents })).toBe(
        'INFJ - I 70%, N 65%, F 80%, J 90%'
      )
    })

    it('keeps boundary values 0 and 100 valid', () => {
      const boundaries = {
        EI: { E: 100, I: 0 },
        NS: { N: 100, S: 0 },
        FT: { F: 100, T: 0 },
        JP: { J: 100, P: 0 },
      }
      expect(formatResultSummary({ type: 'ENTJ', percents: boundaries }, 'en')).toBe(
        'ENTJ - E 100%, N 100%, T 0%, J 100%'
      )
    })

    it('picks the letters of the type for other types', () => {
      const estp = {
        EI: { E: 62, I: 38 },
        NS: { N: 25, S: 75 },
        FT: { F: 40, T: 60 },
        JP: { J: 15, P: 85 },
      }
      expect(formatResultSummary({ type: 'ESTP', percents: estp }, 'en')).toBe(
        'ESTP - E 62%, S 75%, T 60%, P 85%'
      )
    })
  })

  describe('chinese output', () => {
    it('keeps boundary values 0 and 100 valid', () => {
      const boundaries = {
        EI: { E: 100, I: 0 },
        NS: { N: 100, S: 0 },
        FT: { F: 100, T: 0 },
        JP: { J: 100, P: 0 },
      }
      expect(formatResultSummary({ type: 'ENTJ', percents: boundaries }, 'zh')).toBe(
        'ENTJ：外向 E 100%，直觉 N 100%，思维 T 0%，判断 J 100%'
      )
    })

    it('uses Chinese wording while keeping the type and the four percentages', () => {
      expect(formatResultSummary({ type: 'INFJ', percents: fullPercents }, 'zh')).toBe(
        'INFJ：内向 I 70%，直觉 N 65%，情感 F 80%，判断 J 90%'
      )
    })
  })
})
