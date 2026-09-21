import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import ResultView from '../src/views/ResultView.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

let wrapper

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

async function mountView(locale = 'zh', { stubs } = {}) {
  const i18n = createI18n({ legacy: false, locale, messages: { zh, en } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/result', component: ResultView },
    ],
  })
  wrapper = mount(ResultView, {
    global: { plugins: [i18n, router], stubs },
  })
  // ResultView resolves the result in onMounted; let the re-render flush
  await nextTick()
  return wrapper
}

describe('ResultView empty state', () => {
  it('renders the empty state in Chinese by default', async () => {
    await mountView('zh')

    const empty = wrapper.find('.no-result')
    expect(empty.exists()).toBe(true)
    expect(empty.find('p').text()).toBe('暂无测试结果。')

    const link = empty.find('a')
    expect(link.text()).toBe('← 返回首页')
    expect(link.attributes('href')).toBe('/')
  })

  it('renders the empty state in English when the locale is English', async () => {
    await mountView('en')

    const empty = wrapper.find('.no-result')
    expect(empty.exists()).toBe(true)
    expect(empty.find('p').text()).toBe('No result found.')

    const link = empty.find('a')
    expect(link.text()).toBe('← Back to home')
    expect(link.attributes('href')).toBe('/')
  })

  it('updates both texts when switching language with the existing toggle, without remount', async () => {
    mountView('zh')
    const empty = wrapper.find('.no-result')
    expect(empty.text()).toContain('暂无测试结果。')

    // zh → en via the language control in the page header
    await wrapper.find('.lang-toggle').trigger('click')
    expect(empty.text()).toContain('No result found.')
    expect(empty.find('a').text()).toBe('← Back to home')
    expect(linkHref(wrapper)).toBe('/')

    // en → zh toggles back
    await wrapper.find('.lang-toggle').trigger('click')
    expect(empty.text()).toContain('暂无测试结果。')
    expect(empty.find('a').text()).toBe('← 返回首页')
  })

  it('does not render the empty state when a valid result exists', async () => {
    sessionStorage.setItem('mbti_result', JSON.stringify({
      type: 'INFJ',
      percents: { EI: { E: 30, I: 70 }, NS: { N: 65, S: 35 }, FT: { F: 60, T: 40 }, JP: { J: 55, P: 45 } },
    }))
    await mountView('zh', { stubs: { ResultCard: true, ShareCard: true } })

    expect(wrapper.find('.no-result').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'ResultCard' }).exists()).toBe(true)
  })
})

function linkHref(wrapper) {
  return wrapper.find('.no-result a').attributes('href')
}
