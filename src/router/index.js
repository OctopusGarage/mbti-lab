import { i18n } from '../i18n/index.js'
import { localeLoader, languageNavigation } from '../i18n/resources.js'
import { resolveLocale, saveLocalePreference } from '../i18n/locales.js'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/test', component: () => import('../views/TestView.vue') },
  { path: '/result', component: () => import('../views/ResultView.vue') },
  { path: '/types', component: () => import('../views/TypesView.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

const preparedLanguages = new WeakMap()
router.beforeEach(async (to, from) => {
  const current = ++languageNavigation.revision
  const code = resolveLocale(to.query.lang) ?? resolveLocale(i18n.global.locale.value) ?? 'zh'
  try {
    await localeLoader.prepare(i18n.global, code, to.path)
    if (current !== languageNavigation.revision) return false
    preparedLanguages.set(to, code)
    return true
  } catch {
    if (current !== languageNavigation.revision) return false
    languageNavigation.failedRoute = to.fullPath
    return from.matched.length ? false : { path: '/', replace: true }
  }
})

router.afterEach((to, from, failure) => {
  if (failure) return
  const code = preparedLanguages.get(to)
  if (!code) return
  i18n.global.locale.value = code
  if (resolveLocale(to.query.lang)) saveLocalePreference(code)
  if (languageNavigation.failedRoute === to.fullPath) languageNavigation.failedRoute = ''
})
