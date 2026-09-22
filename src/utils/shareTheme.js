/**
 * Pure MBTI share card theme lookup.
 * Returns gradient colors and accent for each of the 16 MBTI types.
 */

const COLORS = {
  INTJ: ['#0f0c29', '#302b63', '#24243e'],
  INTP: ['#141e30', '#243b55', '#1a2a3a'],
  ENTJ: ['#1a0533', '#3b0066', '#5c1080'],
  ENTP: ['#0f2027', '#203a43', '#2c5364'],
  INFJ: ['#1a1a2e', '#16213e', '#0f3460'],
  INFP: ['#1e0038', '#3a0068', '#240050'],
  ENFJ: ['#0d2137', '#1a3a5c', '#2a5a8c'],
  ENFP: ['#1a0030', '#3d0060', '#6a0090'],
  ISTJ: ['#0a1628', '#162540', '#1e3a5a'],
  ISFJ: ['#1a0a28', '#3d1a50', '#5a2870'],
  ESTJ: ['#0a1e0a', '#1a3a1a', '#2a5a2a'],
  ESFJ: ['#1e0a1a', '#40183a', '#5a2050'],
  ISTP: ['#0a0a1e', '#1a1a40', '#2a2a60'],
  ISFP: ['#1e0a12', '#3a1228', '#5a1e3e'],
  ESTP: ['#1e0a00', '#3a1800', '#5a2800'],
  ESFP: ['#1e0012', '#3a0025', '#5a003a'],
}

const ACCENT_COLORS = {
  INTJ: '#c8a8ff',
  INTP: '#88ccff',
  ENTJ: '#e0a0ff',
  ENTP: '#80e8ff',
  INFJ: '#e2c96e',
  INFP: '#d4a8ff',
  ENFJ: '#88d8ff',
  ENFP: '#e0a8ff',
  ISTJ: '#88d8a0',
  ISFJ: '#d8a8e0',
  ESTJ: '#a8e0a8',
  ESFJ: '#e0a8d0',
  ISTP: '#a8c8ff',
  ISFP: '#ffa8c8',
  ESTP: '#ffc888',
  ESFP: '#ffa8e0',
}

const FALLBACK_GRADIENT = ['#1a1a2e', '#302b63', '#24243e']
const FALLBACK_ACCENT = '#e2c96e'

/**
 * Get share theme for an MBTI type.
 * @param {string} type - 4-letter MBTI type (e.g., 'INTJ')
 * @returns {{ bgStyle: { background: string }, accent: string }}
 */
export function getShareTheme(type) {
  const colors = COLORS[type] ?? FALLBACK_GRADIENT
  const accent = ACCENT_COLORS[type] ?? FALLBACK_ACCENT
  return {
    bgStyle: { background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]}, ${colors[2]})` },
    accent,
  }
}

export { COLORS, ACCENT_COLORS, FALLBACK_GRADIENT, FALLBACK_ACCENT }
