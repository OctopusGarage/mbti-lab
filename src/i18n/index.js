import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import zh from '../locales/zh.json'
import en from '../locales/en.json'
import { resolveLocale, readLocalePreference } from './locales.js'
import { localeLoader, languageNavigation } from './resources.js'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: { zh, en },
})

watch(
  i18n.global.locale,
  (locale) => {
    document.documentElement.lang = resolveLocale(locale) ?? 'en'
    document.documentElement.dir = 'ltr'
  },
  { immediate: true },
)

export async function initializeLanguage() {
  const query = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const code = resolveLocale(query.get('lang')) ?? readLocalePreference()
  try {
    await localeLoader.prepare(i18n.global, code, '/')
    i18n.global.locale.value = code
  } catch {
    languageNavigation.failedRoute = `/?lang=${code}`
  }
}
