import { describe, it, expect } from 'vitest'
import { formatMbtiType } from '../src/utils/formatMbtiType'

describe('formatMbtiType', () => {
  it('returns the canonical uppercase type for valid input', () => {
    expect(formatMbtiType('INFJ')).toBe('INFJ')
    expect(formatMbtiType('infp')).toBe('INFP')
    expect(formatMbtiType('IsFp')).toBe('ISFP')
  })

  it('trims surrounding whitespace', () => {
    expect(formatMbtiType('  enfp ')).toBe('ENFP')
    expect(formatMbtiType('\tistj\n')).toBe('ISTJ')
  })

  it('returns an empty string for invalid letters at each position', () => {
    // position 1 must be E/I
    expect(formatMbtiType('XNFP')).toBe('')
    // position 2 must be N/S
    expect(formatMbtiType('IENP')).toBe('')
    // position 3 must be T/F
    expect(formatMbtiType('INJP')).toBe('')
    // position 4 must be J/P
    expect(formatMbtiType('INFX')).toBe('')
  })

  it('returns an empty string for wrong-length or empty input', () => {
    expect(formatMbtiType('INF')).toBe('')
    expect(formatMbtiType('INFJJ')).toBe('')
    expect(formatMbtiType('')).toBe('')
    expect(formatMbtiType('   ')).toBe('')
  })

  it('returns an empty string for non-string values', () => {
    expect(formatMbtiType(null)).toBe('')
    expect(formatMbtiType(undefined)).toBe('')
    expect(formatMbtiType(1234)).toBe('')
    expect(formatMbtiType({ type: 'INFJ' })).toBe('')
  })
})
