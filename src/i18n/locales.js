export const LOCALES = [
  { code: 'zh', label: '简体中文', intl: 'zh-CN' },
  { code: 'en', label: 'English', intl: 'en-US' },
  { code: 'es', label: 'Español', intl: 'es-ES' },
  { code: 'fr', label: 'Français', intl: 'fr-FR' },
  { code: 'de', label: 'Deutsch', intl: 'de-DE' },
  { code: 'pt', label: 'Português', intl: 'pt-BR' },
  { code: 'ja', label: '日本語', intl: 'ja-JP' },
  { code: 'ko', label: '한국어', intl: 'ko-KR' },
]
export const LOCALE_STORAGE_KEY = 'mbti_lab_locale'
export function resolveLocale(value) {
  if (typeof value !== 'string' || !/^[a-z]{2}(?:-[a-z0-9]{2,8})*$/i.test(value)) return undefined
  const code = value.toLowerCase().split('-')[0]
  return LOCALES.find(locale => locale.code === code)?.code
}
export function dateLocale(value) {
  return LOCALES.find(locale => locale.code === resolveLocale(value))?.intl ?? 'en-US'
}
export function readLocalePreference() {
  try { return resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY)) ?? 'zh' } catch { return 'zh' }
}
export function saveLocalePreference(value) {
  const code = resolveLocale(value)
  if (!code) return false
  try { localStorage.setItem(LOCALE_STORAGE_KEY, code); return true } catch { return false }
}
