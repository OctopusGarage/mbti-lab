const POSITIONS = [
  ['E', 'I'], // energy
  ['N', 'S'], // information
  ['T', 'F'], // decisions
  ['J', 'P'], // lifestyle
]

/**
 * Normalize an MBTI type string.
 *
 * Accepts a four-letter type in any case, optionally surrounded by
 * whitespace, and returns the canonical uppercase form (e.g. 'INFP').
 * Returns an empty string when the value is not a string or any letter
 * is invalid for its position.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function formatMbtiType(value) {
  if (typeof value !== 'string') return ''

  const letters = value.trim().toUpperCase().split('')
  if (letters.length !== POSITIONS.length) return ''

  return POSITIONS.every((options, i) => options.includes(letters[i]))
    ? letters.join('')
    : ''
}
