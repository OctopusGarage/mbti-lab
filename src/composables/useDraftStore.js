import { questions } from '../data/questions.js'
export const DRAFT_KEY = 'personality_explorer_draft'
export const QUESTIONNAIRE_VERSION = 'original-93-v1'
export const questionsForMode = (mode) =>
  mode === 'short' ? questions.filter((q) => q.short) : questions
let memory = null
let cleared = false
function valid(d) {
  if (
    !d ||
    d.version !== QUESTIONNAIRE_VERSION ||
    !['short', 'full'].includes(d.mode)
  )
    return false
  const count = questionsForMode(d.mode).length
  return (
    Array.isArray(d.answers) &&
    d.answers.length === count &&
    Number.isInteger(d.currentIndex) &&
    d.currentIndex >= 0 &&
    d.currentIndex < count &&
    d.answers.every((a) => a === null || a === 'a' || a === 'b') &&
    d.answers.slice(0, d.currentIndex).every((a) => a !== null)
  )
}
export function useDraftStore() {
  function clear() {
    memory = null
    try {
      localStorage.removeItem(DRAFT_KEY)
      cleared = false
      return true
    } catch {
      // Ignore an undeletable draft for this session after an explicit restart.
      cleared = true
      return false
    }
  }
  function load() {
    if (memory)
      return {
        draft: structuredClone(memory),
        available: false,
        invalid: false
      }
    if (cleared) return { draft: null, available: false, invalid: false }
    let raw
    try {
      raw = localStorage.getItem(DRAFT_KEY)
    } catch {
      return { draft: null, available: false, invalid: false }
    }
    if (raw === null) return { draft: null, available: true, invalid: false }
    try {
      const draft = JSON.parse(raw)
      if (valid(draft)) return { draft, available: true, invalid: false }
    } catch {
      /* reject malformed drafts */
    }
    return { draft: null, available: clear(), invalid: true }
  }
  function save(mode, answers, currentIndex) {
    const draft = {
      version: QUESTIONNAIRE_VERSION,
      mode,
      answers: [...answers],
      currentIndex
    }
    if (!valid(draft)) throw new Error('Invalid assessment draft')
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      memory = null
      cleared = false
      return true
    } catch {
      memory = draft
      return false
    }
  }
  return { load, save, clear }
}
