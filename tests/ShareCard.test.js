import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, it, expect, vi } from 'vitest'
import ShareCard from '../src/components/ShareCard.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

// qrcode generates a data URL — mock it to return a stable string
vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,MOCK') }
}))

function mountCard(type = 'INFJ') {
  const i18n = createI18n({ legacy: false, locale: 'zh', messages: { zh, en } })
  return mount(ShareCard, {
    props: { type },
    global: { plugins: [i18n] },
  })
}

describe('ShareCard', () => {
  it('renders a QR code image after mount', async () => {
    const wrapper = mountCard()
    // wait for the async QRCode.toDataURL to resolve
    await flushPromises()
    const img = wrapper.find('img.sc-qr')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/png;base64,MOCK')
  })

  it('does not render the old plain text URL', async () => {
    const wrapper = mountCard()
    expect(wrapper.text()).not.toContain('octopusgarage.github.io/mbti-lab')
  })
})
