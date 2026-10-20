import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import TestView from '../src/views/TestView.vue'
import HomeView from '../src/views/HomeView.vue'
import DimensionBars from '../src/components/DimensionBars.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'
let wrapper
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.stubGlobal('scrollTo', vi.fn())
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
async function open(path = '/test?mode=short') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/test', component: TestView },
      { path: '/result', component: { template: '<div>result</div>' } },
      { path: '/types', component: { template: '<div/>' } },
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
it('locks feedback, survives query-only navigation, and restores an earlier choice', async () => {
  const router = await open()
  vi.useFakeTimers()
  await wrapper.findAll('.option')[0].trigger('click')
  expect(wrapper.findAll('.option').every((b) => b.element.disabled)).toBe(true)
  await router.push('/test?mode=short&source=history')
  await vi.advanceTimersByTimeAsync(300)
  expect(wrapper.findAll('.option').some((b) => !b.element.disabled)).toBe(true)
  await wrapper.find('.btn-prev').trigger('click')
  expect(wrapper.find('.option.selected').attributes('aria-pressed')).toBe(
    'true',
  )
})
it('persists answers and cursor across remounts', async () => {
  await open()
  vi.useFakeTimers()
  await wrapper.find('.option').trigger('click')
  await vi.advanceTimersByTimeAsync(300)
  wrapper.unmount()
  wrapper = null
  vi.useRealTimers()
  await open('/test')
  expect(wrapper.findComponent(TestView).text()).toContain('2 / 60')
})
it.each(['short', 'full'])(
  'completes %s with original fixed scoring and clears draft',
  async (mode) => {
    const router = await open('/test?mode=' + mode)
    vi.useFakeTimers()
    for (let i = 0; i < (mode === 'short' ? 60 : 93); i++) {
      await wrapper.find('.option').trigger('click')
      await vi.advanceTimersByTimeAsync(280)
      await nextTick()
    }
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/result')
    const entry = JSON.parse(localStorage.getItem('mbti_lab_result'))
    expect(entry.type).toBe('ENFJ')
    expect(entry.percents).toEqual(
      mode === 'short'
        ? {
            EI: { E: 53, I: 47 },
            NS: { N: 53, S: 47 },
            FT: { F: 53, T: 47 },
            JP: { J: 53, P: 47 },
          }
        : {
            EI: { E: 52, I: 48 },
            NS: { N: 50, S: 50 },
            FT: { F: 52, T: 48 },
            JP: { J: 52, P: 48 },
          },
    )
    expect(localStorage.getItem('personality_explorer_draft')).toBeNull()
  },
)
it('renders translated dimension labels', () => {
  wrapper = mount(DimensionBars, {
    props: {
      percents: {
        EI: { E: 50, I: 50 },
        NS: { N: 50, S: 50 },
        FT: { F: 50, T: 50 },
        JP: { J: 50, P: 50 },
      },
    },
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', messages: { zh, en } }),
      ],
    },
  })
  expect(wrapper.text()).toContain('Extraverted E')
  expect(wrapper.text()).toContain('Introverted I')
})
function seedDraft(mode = 'short', currentIndex = 2, complete = false) {
  const answers = Array(mode === 'short' ? 60 : 93).fill(complete ? 'a' : null)
  answers.fill('a', 0, currentIndex)
  localStorage.setItem(
    'personality_explorer_draft',
    JSON.stringify({
      version: 'original-93-v1',
      mode,
      answers,
      currentIndex,
    }),
  )
}
it('resumes the existing mode and requires confirmation before restarting', async () => {
  seedDraft()
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  try {
    const router = await open('/')
    await wrapper.findAll('.start-card')[2].trigger('click')
    expect(confirm).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.path).toBe('/')
    await wrapper.find('.start-card').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.mode).toBe('short')
    expect(wrapper.text()).toContain('3 / 60')
    await router.push('/')
    await flushPromises()
    confirm.mockReturnValue(true)
    await wrapper.findAll('.start-card')[2].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('1 / 93')
  } finally {
    confirm.mockRestore()
  }
})
it('delivers a completely answered draft after reload', async () => {
  seedDraft('short', 59, true)
  const router = await open('/test?mode=full')
  expect(router.currentRoute.value.path).toBe('/result')
  expect(JSON.parse(localStorage.getItem('mbti_lab_result')).type).toBe('ENFJ')
  expect(localStorage.getItem('personality_explorer_draft')).toBeNull()
})
it('cancels delayed feedback when leaving the assessment', async () => {
  const router = await open()
  vi.useFakeTimers()
  await wrapper.find('.option').trigger('click')
  await router.push('/')
  await vi.advanceTimersByTimeAsync(500)
  expect(router.currentRoute.value.path).toBe('/')
  expect(
    JSON.parse(localStorage.getItem('personality_explorer_draft')).currentIndex,
  ).toBe(0)
  expect(localStorage.getItem('mbti_lab_result')).toBeNull()
})
it('finishes the last answer during a mode query change without competing navigation', async () => {
  seedDraft('short', 59)
  const router = await open()
  vi.useFakeTimers()
  await wrapper.find('.option').trigger('click')
  await router.push('/test?mode=full')
  await flushPromises()
  await vi.advanceTimersByTimeAsync(500)
  expect(router.currentRoute.value.path).toBe('/result')
  expect(JSON.parse(localStorage.getItem('mbti_lab_result')).type).toBe('ENFJ')
})
it('exits during feedback without losing the selected answer and resumes the draft', async () => {
  const router = await open()
  expect(wrapper.find('.saved-note').text()).toContain('saved')
  vi.useFakeTimers()
  await wrapper.find('.option').trigger('click')
  await wrapper.find('.btn-exit').trigger('click')
  await flushPromises()
  await vi.advanceTimersByTimeAsync(500)
  expect(router.currentRoute.value.path).toBe('/')
  expect(
    JSON.parse(localStorage.getItem('personality_explorer_draft')).answers[0],
  ).toBe('a')
  await wrapper.find('.start-card').trigger('click')
  await flushPromises()
  expect(wrapper.find('.option.selected').attributes('aria-pressed')).toBe(
    'true',
  )
  expect(wrapper.find('.saved-note').exists()).toBe(true)
})
