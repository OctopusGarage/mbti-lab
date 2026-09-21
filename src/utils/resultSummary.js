// Maps each MBTI type position to its dimension key and the letters it may hold.
// Shape of `result.percents`: { EI: {E,I}, NS: {N,S}, FT: {F,T}, JP: {J,P} }
const DIMENSIONS = [
  { key: 'EI', letters: ['E', 'I'] },
  { key: 'NS', letters: ['N', 'S'] },
  { key: 'FT', letters: ['F', 'T'] },
  { key: 'JP', letters: ['J', 'P'] },
]

// Chinese wording matches src/locales/zh.json result.dimLabel
const ZH_LABELS = {
  E: '外向',
  I: '内向',
  N: '直觉',
  S: '感知',
  F: '情感',
  T: '思维',
  J: '判断',
  P: '随性',
}

// Both letters of a dimension must be finite numbers within 0-100 (inclusive)
// for the data to be well-formed.
function dimensionPercents(percents, dimKey, letters) {
  const dim = percents && typeof percents === 'object' ? percents[dimKey] : null
  if (!dim || typeof dim !== 'object') return null
  const values = letters.map((l) => dim[l])
  if (!values.every((v) => Number.isFinite(v) && v >= 0 && v <= 100)) return null
  const out = {}
  letters.forEach((l, i) => (out[l] = values[i]))
  return out
}

/**
 * Build a compact one-line summary of an MBTI test result.
 *
 * @param {{ type: string, percents: object }|null} result
 * @param {'en'|'zh'} locale defaults to 'en'
 * @returns {string} empty string when input is missing or malformed
 */
export function formatResultSummary(result, locale = 'en') {
  if (!result || !result.type || !result.percents) return ''
  if (typeof result.type !== 'string') return ''

  const type = result.type.toUpperCase()
  if (type.length !== DIMENSIONS.length) return ''
  const isZh = locale === 'zh'

  const parts = []
  for (let i = 0; i < DIMENSIONS.length; i++) {
    const { key, letters } = DIMENSIONS[i]
    const letter = type[i]
    if (!letters.includes(letter)) return ''
    const dim = dimensionPercents(result.percents, key, letters)
    if (!dim) return ''
    parts.push(isZh ? `${ZH_LABELS[letter]} ${letter} ${dim[letter]}%` : `${letter} ${dim[letter]}%`)
  }

  return isZh ? `${type}：${parts.join('，')}` : `${type} - ${parts.join(', ')}`
}
