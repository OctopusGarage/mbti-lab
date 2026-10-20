import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, it } from 'vitest'
import LangToggle from '../src/components/LangToggle.vue'
import ProgressBar from '../src/components/ProgressBar.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'
const global = {
  plugins: [createI18n({ legacy: false, locale: 'en', messages: { zh, en } })],
}
it('exposes the current question and total to assistive technology', async () => {
  const wrapper = mount(ProgressBar, {
    props: { current: 0, total: 60 },
    global,
  })
  try {
    expect(wrapper.find('[role="progressbar"]').attributes()).toMatchObject({
      'aria-valuemin': '1',
      'aria-valuemax': '60',
      'aria-valuenow': '1',
      'aria-label': 'Question progress',
    })
    await wrapper.setProps({ current: 59 })
    expect(
      wrapper.find('[role="progressbar"]').attributes('aria-valuenow'),
    ).toBe('60')
  } finally {
    wrapper.unmount()
  }
})
it('offers eight named languages and labels the selector in the active language', async () => {
  const wrapper = mount(LangToggle, { global })
  try {
    expect(wrapper.find('select').attributes('aria-label')).toBe(en.app.language)
    expect(wrapper.findAll('option')).toHaveLength(8)
    await wrapper.find('select').setValue('zh')
    await flushPromises()
    expect(wrapper.find('select').attributes('aria-label')).toBe(zh.app.language)
    expect(localStorage.getItem('mbti_lab_locale')).toBe('zh')
  } finally {
    wrapper.unmount()
  }
})
it('updates the document language for the application locale', async () => {
  const { nextTick } = await import('vue')
  const { i18n } = await import('../src/i18n/index.js')
  i18n.global.locale.value = 'en'
  await nextTick()
  expect(document.documentElement.lang).toBe('en')
  i18n.global.locale.value = 'zh'
  await nextTick()
  expect(document.documentElement.lang).toBe('zh')
})
