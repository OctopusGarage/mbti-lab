import { types } from './types.js'
import { resolveLocale } from '../i18n/locales.js'

const content = {}
export function registerLocaleData(locale, kind, value) {
  content[`${locale}:${kind}`] = kind === 'questions'
    ? Object.fromEntries(value.map(({ id, a, b }) => [id, { a, b }]))
    : value
}
export function getQuestionText(question, locale) {
  const code = resolveLocale(locale) ?? 'en'
  const text = code === 'en' || code === 'zh' ? question[code] : content[`${code}:questions`]?.[question.id]
  if (!text) throw new Error(`Question translation not loaded: ${code}:${question.id}`)
  return text
}
export function getTypePresentation(type, locale) {
  const original = types[type]
  if (!original) return null
  const code = resolveLocale(locale) ?? 'en'
  if (code === 'en' || code === 'zh') return { nickname: original.nickname[code], strengths: original.strengths[code] }
  return content[`${code}:types`]?.[type] ?? null
}
export function getTranslatedReport(type, locale) {
  return content[`${resolveLocale(locale)}:reports`]?.[type] ?? null
}
