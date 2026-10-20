import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'
const result = {
  type: 'INFJ',
  percents: {
    EI: { E: 30, I: 70 },
    NS: { N: 60, S: 40 },
    FT: { F: 60, T: 40 },
    JP: { J: 55, P: 45 },
  },
}
let wrapper
beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  sessionStorage.clear()
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.unstubAllGlobals()
})
async function open(path = '/') {
  const { default: HomeView } = await import('../src/views/HomeView.vue')
  const { default: TestView } = await import('../src/views/TestView.vue')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/test', component: TestView },
      { path: '/types', component: { template: '<div/>' } },
      { path: '/result', component: { template: '<div/>' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [
          router,
          createI18n({ legacy: false, locale: 'en', messages: { zh, en } }),
        ],
      },
    },
  )
  await flushPromises()
  return router
}
it('shows a real completion time and saved status, translating the date without changing data', async () => {
  const completedAt = Date.UTC(2026, 9, 20, 0, 0)
  const entry = { ...result, completedAt }
  localStorage.setItem('mbti_lab_result', JSON.stringify(entry))
  await open()
  expect(wrapper.find('.result-completed time').attributes('datetime')).toBe(
    new Date(completedAt).toISOString(),
  )
  expect(wrapper.find('.result-completed').text()).toContain('Oct')
  expect(wrapper.find('.result-save-state').text()).toBe(
    'Saved in this browser',
  )
  await wrapper.find('.lang-toggle').trigger('click')
  expect(wrapper.find('.result-completed').text()).toContain('年')
  expect(JSON.parse(localStorage.getItem('mbti_lab_result'))).toEqual(entry)
})
it.each([undefined, null, 'bad', 1e20])(
  'shows unknown time for legacy or invalid timestamp %s',
  async (completedAt) => {
    localStorage.setItem(
      'mbti_lab_result',
      JSON.stringify({ ...result, completedAt }),
    )
    await open()
    expect(wrapper.find('.result-completed time').exists()).toBe(false)
    expect(wrapper.find('.result-completed').text()).toContain(
      'Completion time unknown',
    )
  },
)
it('marks a fresh failed-write result as unsaved instead of marking old history as saved', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  const real = localStorage
  real.setItem('mbti_lab_result', JSON.stringify({ ...result, type: 'ESTJ' }))
  vi.stubGlobal('localStorage', {
    getItem: (key) => real.getItem(key),
    removeItem: (key) => real.removeItem(key),
    setItem() {
      throw Error('denied')
    },
  })
  expect(useResultStore().submit(result)).toBe(false)
  await open()
  expect(wrapper.find('.last-type').text()).toContain('INFJ')
  expect(wrapper.find('.result-save-state').text()).toContain(en.result.unsaved)
  expect(sessionStorage.getItem('mbti_result')).not.toBeNull()
})
it('does not show saved progress when draft writes are denied', async () => {
  const real = localStorage
  vi.stubGlobal('localStorage', {
    getItem: (key) => real.getItem(key),
    removeItem: (key) => real.removeItem(key),
    setItem() {
      throw Error('denied')
    },
  })
  await open('/test?mode=short')
  expect(wrapper.find('.saved-note').exists()).toBe(false)
  expect(wrapper.find('[role="status"]').text()).toContain(
    en.test.storageWarning,
  )
  expect(wrapper.find('.btn-exit').attributes('href')).toBe('/')
})
