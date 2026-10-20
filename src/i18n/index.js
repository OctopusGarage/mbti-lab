import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import zh from '../locales/zh.json'
import en from '../locales/en.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: { zh, en },
})

watch(
  i18n.global.locale,
  (locale) => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh'
  },
  { immediate: true },
)
