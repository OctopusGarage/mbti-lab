import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import SharePanel from '../src/components/SharePanel.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

let wrapper
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

function mountPanel(props = {}) {
  const i18n = createI18n({ legacy: false, locale: 'zh', messages: { zh, en } })
  wrapper = mount(SharePanel, {
    props,
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
  return wrapper
}

describe('SharePanel', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn())
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('shows only Section B when type is not provided', () => {
    mountPanel()
    expect(!!document.querySelector('[data-section="result"]')).toBe(false)
    expect(!!document.querySelector('[data-section="app"]')).toBe(true)
  })

  it('shows both sections when type is provided', () => {
    mountPanel({ type: 'INFJ' })
    expect(!!document.querySelector('[data-section="result"]')).toBe(true)
    expect(!!document.querySelector('[data-section="app"]')).toBe(true)
  })

  it('opens X with type-specific text when sharing result', async () => {
    mountPanel({ type: 'INFJ', onSaveImage: vi.fn() })
    await document.querySelector('[data-action="share-result-x"]').click()
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
    const url = window.open.mock.calls[0][0]
    expect(decodeURIComponent(url)).toContain('INFJ')
  })

  it('opens X with app text when sharing app', async () => {
    mountPanel()
    await document.querySelector('[data-action="share-app-x"]').click()
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
    const url = window.open.mock.calls[0][0]
    expect(decodeURIComponent(url)).toContain('octopusgarage.github.io/mbti-lab')
  })

  it('copies app URL to clipboard and shows copied feedback', async () => {
    mountPanel()
    const copyBtn = document.querySelector('[data-action="copy-link"]')
    expect(copyBtn.textContent.trim()).toContain('复制链接')
    copyBtn.click()
    await flushPromises()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://octopusgarage.github.io/mbti-lab')
    expect(document.querySelector('[data-action="copy-link"]').textContent.trim()).toContain('已复制 ✓')
  })

  it('emits close when backdrop is clicked', async () => {
    mountPanel()
    await document.querySelector('.sp-overlay').click()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('calls onSaveImage and emits close when save image is clicked', async () => {
    const onSaveImage = vi.fn()
    mountPanel({ type: 'INFJ', onSaveImage })
    await document.querySelector('[data-action="save-image"]').click()
    expect(onSaveImage).toHaveBeenCalled()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
