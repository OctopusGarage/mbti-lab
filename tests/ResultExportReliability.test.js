import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

const result = {
  type: 'INFJ',
  percents: {
    EI: { E: 30, I: 70 },
    NS: { N: 65, S: 35 },
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
async function open(capture = vi.fn()) {
  const { default: ResultView } = await import('../src/views/ResultView.vue')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/result', component: ResultView },
    ],
  })
  await router.push('/result')
  await router.isReady()
  wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [
          router,
          createI18n({ legacy: false, locale: 'en', messages: { zh, en } }),
        ],
        stubs: {
          ResultCard: true,
          SharePanel: {
            props: ['onSaveImage'],
            template:
              '<button class="capture" @click="onSaveImage()">save</button>',
          },
          ShareCard: { template: '<div/>', methods: { capture } },
        },
      },
    },
  )
  await flushPromises()
}
it('discards a pending capture after switching language and allows a fresh export', async () => {
  sessionStorage.setItem('mbti_result', JSON.stringify(result))
  let resolve
  const capture = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    .mockResolvedValue('data:image/png;base64,NEW')
  await open(capture)
  await wrapper.find('.btn-share').trigger('click')
  await wrapper.find('.capture').trigger('click')
  await wrapper.find('.lang-toggle').setValue('zh')
  await flushPromises()
  resolve('data:image/png;base64,OLD')
  await flushPromises()
  expect(wrapper.find('.export-preview').exists()).toBe(false)
  await wrapper.find('.capture').trigger('click')
  await flushPromises()
  expect(wrapper.find('.export-preview img').attributes('src')).toBe(
    'data:image/png;base64,NEW',
  )
})
it('warns about an unsaved result when revisiting without a query flag', async () => {
  const { useResultStore } =
    await import('../src/composables/useResultStore.js')
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem() {
      throw Error('denied')
    },
  })
  expect(useResultStore().submit(result)).toBe(false)
  useResultStore().load()
  await open()
  expect(wrapper.find('[role="status"]').text()).toContain(en.result.unsaved)
})
it('warns after reload when a session result has no persisted history', async () => {
  sessionStorage.setItem('mbti_result', JSON.stringify(result))
  await open()
  expect(wrapper.find('[role="status"]').text()).toContain(en.result.unsaved)
})
