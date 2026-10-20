// Single module at the route seam for the result handoff.
//
// Two storage adapters sit behind this interface:
// - sessionStorage carries the fresh handoff from TestView to ResultView,
//   read-and-consume so a stale session entry can never shadow the
//   persisted history on later visits (e.g. arriving via HomeView's
//   "view last result" link).
// - localStorage persists the latest result as history.
//
// Keys, JSON encoding/decoding, completedAt stamping, entry validation
// (type letters and finite percents), and fresh-then-history precedence
// all live here; views never touch storage directly.

const SESSION_KEY = 'mbti_result'
const HISTORY_KEY = 'mbti_lab_result'

// Position-ordered valid letters for an MBTI type. Absorbs the validation
// the deleted src/utils/formatMbtiType.js used to encode (and test in isolation).
const TYPE_POSITIONS = [
  ['E', 'I'], // energy
  ['N', 'S'], // information
  ['T', 'F'], // decisions
  ['J', 'P'], // lifestyle
]

// Dimension keys of `result.percents` with the letters each may hold.
const DIMENSIONS = [
  { key: 'EI', letters: ['E', 'I'] },
  { key: 'NS', letters: ['N', 'S'] },
  { key: 'FT', letters: ['F', 'T'] },
  { key: 'JP', letters: ['J', 'P'] },
]

// Canonicalize a type string ('infp' -> 'INFP'); '' when any letter is
// invalid for its position, the length is wrong, or it is not a string.
function normalizeType(value) {
  if (typeof value !== 'string') return ''
  const letters = value.trim().toUpperCase().split('')
  if (letters.length !== TYPE_POSITIONS.length) return ''
  return TYPE_POSITIONS.every((options, i) => options.includes(letters[i]))
    ? letters.join('')
    : ''
}

// Every dimension must be present with finite numbers for both letters.
function hasFinitePercents(percents) {
  if (!percents || typeof percents !== 'object') return false
  return DIMENSIONS.every(({ key, letters }) => {
    const dim = percents[key]
    if (!dim || typeof dim !== 'object') return false
    return letters.every(
      (letter) =>
        Number.isFinite(dim[letter]) && dim[letter] >= 0 && dim[letter] <= 100,
    )
  })
}

// Decode one stored entry; null for anything malformed.
function parseEntry(raw) {
  if (!raw) return null
  let value
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }
  if (!value || typeof value !== 'object') return null
  const type = normalizeType(value.type)
  if (!type || !hasFinitePercents(value.percents)) return null
  const percents = Object.fromEntries(
    DIMENSIONS.map(({ key, letters }) => [
      key,
      Object.fromEntries(
        letters.map((letter) => [letter, value.percents[key][letter]]),
      ),
    ]),
  )
  return { ...value, type, percents }
}

// Memory is a fallback for denied writes, never a cache of successful history.
let handoff = null
let volatile = null
let ignoreSession = false
export function useResultStore() {
  function submit(result) {
    const entry = parseEntry(
      JSON.stringify({ ...result, completedAt: Date.now() }),
    )
    if (!entry) throw new Error('Invalid assessment result')
    handoff = null
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(entry))
      ignoreSession = false
    } catch {
      handoff = entry
      ignoreSession = true
    }
    let persisted = false
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entry))
      persisted = true
    } catch {
      /* retain this result in memory */
    }
    volatile = persisted ? null : entry
    return persisted
  }
  function peek() {
    if (handoff) return handoff
    try {
      const fresh = ignoreSession
        ? null
        : parseEntry(sessionStorage.getItem(SESSION_KEY))
      if (fresh) return fresh
    } catch {
      /* continue independently */
    }
    if (volatile) return volatile
    try {
      return parseEntry(localStorage.getItem(HISTORY_KEY))
    } catch {
      return null
    }
  }
  function load() {
    let fresh = handoff
    handoff = null
    try {
      if (!fresh && !ignoreSession)
        fresh = parseEntry(sessionStorage.getItem(SESSION_KEY))
    } catch {
      /* history or memory remains available */
    }
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // Consume once even when the physical entry cannot be removed.
      ignoreSession = true
    }
    if (fresh) return fresh
    if (volatile) return volatile
    try {
      return parseEntry(localStorage.getItem(HISTORY_KEY))
    } catch {
      return null
    }
  }
  function isPersisted(entry) {
    if (!entry) return false
    try {
      const saved = parseEntry(localStorage.getItem(HISTORY_KEY))
      return (
        !!saved &&
        saved.type === entry.type &&
        saved.completedAt === entry.completedAt &&
        DIMENSIONS.every(({ key, letters }) =>
          letters.every(
            (letter) =>
              saved.percents[key][letter] === entry.percents[key][letter],
          ),
        )
      )
    } catch {
      return false
    }
  }
  return { submit, load, peek, isPersisted }
}
