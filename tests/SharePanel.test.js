import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SharePanel from '../src/components/SharePanel.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

function mountPanel(props = {}) {
  const i18n = createI18n({ legacy: false, locale: 'zh', messages: { zh, en } })
  return mount(SharePanel, {
    props,
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
}

describe('SharePanel', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn())
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('shows only Section B when type is not provided', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('[data-section="result"]').exists()).toBe(false)
    expect(wrapper.find('[data-section="app"]').exists()).toBe(true)
  })

  it('shows both sections when type is provided', () => {
    const wrapper = mountPanel({ type: 'INFJ' })
    expect(wrapper.find('[data-section="result"]').exists()).toBe(true)
    expect(wrapper.find('[data-section="app"]').exists()).toBe(true)
  })

  it('opens X with type-specific text when sharing result', async () => {
    const wrapper = mountPanel({ type: 'INFJ', onSaveImage: vi.fn() })
    await wrapper.find('[data-action="share-result-x"]').trigger('click')
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
    const url = window.open.mock.calls[0][0]
    expect(decodeURIComponent(url)).toContain('INFJ')
  })

  it('opens X with app text when sharing app', async () => {
    const wrapper = mountPanel()
    await wrapper.find('[data-action="share-app-x"]').trigger('click')
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
    const url = window.open.mock.calls[0][0]
    expect(decodeURIComponent(url)).toContain('octopusgarage.github.io/mbti-lab')
  })

  it('copies app URL to clipboard and shows copied feedback', async () => {
    const wrapper = mountPanel()
    const copyBtn = wrapper.find('[data-action="copy-link"]')
    expect(copyBtn.text()).toBe('复制链接')
    await copyBtn.trigger('click')
    await wrapper.vm.$nextTick()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://octopusgarage.github.io/mbti-lab')
    expect(copyBtn.text()).toBe('已复制 ✓')
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mountPanel()
    await wrapper.find('.sp-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('calls onSaveImage and emits close when save image is clicked', async () => {
    const onSaveImage = vi.fn()
    const wrapper = mountPanel({ type: 'INFJ', onSaveImage })
    await wrapper.find('[data-action="save-image"]').trigger('click')
    expect(onSaveImage).toHaveBeenCalled()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
