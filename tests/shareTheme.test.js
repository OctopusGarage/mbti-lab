import { describe, it, expect } from 'vitest'
import { getShareTheme, COLORS, ACCENT_COLORS, FALLBACK_GRADIENT, FALLBACK_ACCENT } from '../src/utils/shareTheme.js'

const ALL_16_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

describe('getShareTheme', () => {
  describe('all 16 MBTI types', () => {
    ALL_16_TYPES.forEach(type => {
      it(`returns valid theme for ${type}`, () => {
        const theme = getShareTheme(type)
        expect(theme).toHaveProperty('bgStyle')
        expect(theme).toHaveProperty('accent')
        expect(theme.bgStyle).toHaveProperty('background')
        expect(typeof theme.bgStyle.background).toBe('string')
        expect(theme.bgStyle.background).toContain('linear-gradient(145deg')
        expect(typeof theme.accent).toBe('string')
        expect(theme.accent).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  describe('gradient and accent match COLORS and ACCENT_COLORS', () => {
    ALL_16_TYPES.forEach(type => {
      it(`${type}`, () => {
        const theme = getShareTheme(type)
        const expectedGradient = `linear-gradient(145deg, ${COLORS[type][0]}, ${COLORS[type][1]}, ${COLORS[type][2]})`
        expect(theme.bgStyle.background).toBe(expectedGradient)
        expect(theme.accent).toBe(ACCENT_COLORS[type])
      })
    })
  })

  describe('fallback behavior', () => {
    it('returns fallback gradient for unknown type', () => {
      const theme = getShareTheme('XXXX')
      const expectedGradient = `linear-gradient(145deg, ${FALLBACK_GRADIENT[0]}, ${FALLBACK_GRADIENT[1]}, ${FALLBACK_GRADIENT[2]})`
      expect(theme.bgStyle.background).toBe(expectedGradient)
    })

    it('returns fallback accent for unknown type', () => {
      const theme = getShareTheme('XXXX')
      expect(theme.accent).toBe(FALLBACK_ACCENT)
    })

    it('returns fallback for empty string', () => {
      const theme = getShareTheme('')
      expect(theme.bgStyle.background).toContain('linear-gradient(145deg')
      expect(theme.accent).toBe(FALLBACK_ACCENT)
    })

    it('returns fallback for null/undefined', () => {
      // @ts-ignore - intentionally passing invalid values
      const themeNull = getShareTheme(null)
      expect(themeNull.bgStyle.background).toContain('linear-gradient(145deg')
      expect(themeNull.accent).toBe(FALLBACK_ACCENT)

      // @ts-ignore
      const themeUndefined = getShareTheme(undefined)
      expect(themeUndefined.bgStyle.background).toContain('linear-gradient(145deg')
      expect(themeUndefined.accent).toBe(FALLBACK_ACCENT)
    })
  })

  describe('exports', () => {
    it('exports COLORS with all 16 types', () => {
      expect(Object.keys(COLORS).sort()).toEqual(ALL_16_TYPES.sort())
    })

    it('exports ACCENT_COLORS with all 16 types', () => {
      expect(Object.keys(ACCENT_COLORS).sort()).toEqual(ALL_16_TYPES.sort())
    })

    it('FALLBACK_GRADIENT has 3 color stops', () => {
      expect(FALLBACK_GRADIENT).toHaveLength(3)
      FALLBACK_GRADIENT.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('FALLBACK_ACCENT is a valid hex color', () => {
      expect(FALLBACK_ACCENT).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })
})
