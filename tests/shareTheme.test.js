import { describe, it, expect } from 'vitest'
import { getShareTheme } from '../src/utils/shareTheme.js'

const EXPECTED = {
  INTJ: {
    bgStyle: { background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)' },
    accent: '#c8a8ff',
  },
  INTP: {
    bgStyle: { background: 'linear-gradient(145deg, #141e30, #243b55, #1a2a3a)' },
    accent: '#88ccff',
  },
  ENTJ: {
    bgStyle: { background: 'linear-gradient(145deg, #1a0533, #3b0066, #5c1080)' },
    accent: '#e0a0ff',
  },
  ENTP: {
    bgStyle: { background: 'linear-gradient(145deg, #0f2027, #203a43, #2c5364)' },
    accent: '#80e8ff',
  },
  INFJ: {
    bgStyle: { background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)' },
    accent: '#e2c96e',
  },
  INFP: {
    bgStyle: { background: 'linear-gradient(145deg, #1e0038, #3a0068, #240050)' },
    accent: '#d4a8ff',
  },
  ENFJ: {
    bgStyle: { background: 'linear-gradient(145deg, #0d2137, #1a3a5c, #2a5a8c)' },
    accent: '#88d8ff',
  },
  ENFP: {
    bgStyle: { background: 'linear-gradient(145deg, #1a0030, #3d0060, #6a0090)' },
    accent: '#e0a8ff',
  },
  ISTJ: {
    bgStyle: { background: 'linear-gradient(145deg, #0a1628, #162540, #1e3a5a)' },
    accent: '#88d8a0',
  },
  ISFJ: {
    bgStyle: { background: 'linear-gradient(145deg, #1a0a28, #3d1a50, #5a2870)' },
    accent: '#d8a8e0',
  },
  ESTJ: {
    bgStyle: { background: 'linear-gradient(145deg, #0a1e0a, #1a3a1a, #2a5a2a)' },
    accent: '#a8e0a8',
  },
  ESFJ: {
    bgStyle: { background: 'linear-gradient(145deg, #1e0a1a, #40183a, #5a2050)' },
    accent: '#e0a8d0',
  },
  ISTP: {
    bgStyle: { background: 'linear-gradient(145deg, #0a0a1e, #1a1a40, #2a2a60)' },
    accent: '#a8c8ff',
  },
  ISFP: {
    bgStyle: { background: 'linear-gradient(145deg, #1e0a12, #3a1228, #5a1e3e)' },
    accent: '#ffa8c8',
  },
  ESTP: {
    bgStyle: { background: 'linear-gradient(145deg, #1e0a00, #3a1800, #5a2800)' },
    accent: '#ffc888',
  },
  ESFP: {
    bgStyle: { background: 'linear-gradient(145deg, #1e0012, #3a0025, #5a003a)' },
    accent: '#ffa8e0',
  },
}

const FALLBACK_BG_STYLE = {
  background: 'linear-gradient(145deg, #1a1a2e, #302b63, #24243e)',
}
const FALLBACK_ACCENT = '#e2c96e'

const ALL_16_TYPES = Object.keys(EXPECTED)

describe('getShareTheme', () => {
  describe('all 16 MBTI types', () => {
    ALL_16_TYPES.forEach(type => {
      it(`${type} returns correct bgStyle and accent`, () => {
        const theme = getShareTheme(type)
        expect(theme.bgStyle).toEqual(EXPECTED[type].bgStyle)
        expect(theme.accent).toBe(EXPECTED[type].accent)
      })
    })
  })

  describe('fallback for invalid inputs', () => {
    it('unknown type "XXXX"', () => {
      const theme = getShareTheme('XXXX')
      expect(theme.bgStyle).toEqual(FALLBACK_BG_STYLE)
      expect(theme.accent).toBe(FALLBACK_ACCENT)
    })

    it('empty string', () => {
      const theme = getShareTheme('')
      expect(theme.bgStyle).toEqual(FALLBACK_BG_STYLE)
      expect(theme.accent).toBe(FALLBACK_ACCENT)
    })

    it('null', () => {
      const theme = getShareTheme(null)
      expect(theme.bgStyle).toEqual(FALLBACK_BG_STYLE)
      expect(theme.accent).toBe(FALLBACK_ACCENT)
    })

    it('undefined', () => {
      const theme = getShareTheme(undefined)
      expect(theme.bgStyle).toEqual(FALLBACK_BG_STYLE)
      expect(theme.accent).toBe(FALLBACK_ACCENT)
    })
  })
})
