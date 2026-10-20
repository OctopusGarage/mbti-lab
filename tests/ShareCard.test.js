import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, it, expect, vi } from 'vitest'
import ShareCard from '../src/components/ShareCard.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

// qrcode generates a data URL — mock it to return a stable string
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,MOCK'),
  },
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

vi.mock('html2canvas', () => ({
  default: vi
    .fn()
    .mockResolvedValue({ toDataURL: () => 'data:image/png;base64,EXPORT' }),
}))
it('returns a preview image with a visible clone and an opaque high contrast QR', async () => {
  const { default: html2canvas } = await import('html2canvas')
  const { default: QRCode } = await import('qrcode')
  const wrapper = mountCard()
  try {
    expect(await wrapper.vm.capture()).toBe('data:image/png;base64,EXPORT')
    expect(QRCode.toDataURL).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        margin: 4,
        color: { dark: '#111111', light: '#ffffff' },
      }),
    )
    const clone = document.createElement('div')
    const card = document.createElement('div')
    card.className = 'share-card'
    clone.append(card)
    html2canvas.mock.calls.at(-1)[1].onclone(clone, card)
    expect(card.style.visibility).toBe('visible')
  } finally {
    wrapper.unmount()
  }
})
it('allows retry after QR generation fails', async () => {
  const { default: QRCode } = await import('qrcode')
  QRCode.toDataURL.mockRejectedValueOnce(Error('QR unavailable'))
  const wrapper = mountCard()
  try {
    await flushPromises()
    await expect(wrapper.vm.capture()).rejects.toThrow('QR unavailable')
    await expect(wrapper.vm.capture()).resolves.toBe(
      'data:image/png;base64,EXPORT',
    )
  } finally {
    wrapper.unmount()
  }
})
it('translates card labels with the selected language', () => {
  const wrapper = mount(ShareCard, {
    props: { type: 'INFJ' },
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', messages: { zh, en } }),
      ],
    },
  })
  try {
    expect(wrapper.find('.sc-note-label').text()).toBe(en.report.cardLabel)
    expect(wrapper.find('.sc-editorial-note').text()).toContain(
      en.report.cardNote,
    )
  } finally {
    wrapper.unmount()
  }
})
it('reveals the exact capture clone when multiple cards are mounted', async () => {
  const { default: html2canvas } = await import('html2canvas')
  const wrapper = mountCard()
  try {
    await wrapper.vm.capture()
    const doc = document.implementation.createHTMLDocument()
    const first = doc.createElement('div')
    const target = doc.createElement('div')
    first.className = target.className = 'share-card'
    doc.body.append(first, target)
    html2canvas.mock.calls.at(-1)[1].onclone(doc, target)
    expect(target.style.visibility).toBe('visible')
    expect(first.style.visibility).toBe('')
  } finally {
    wrapper.unmount()
  }
})
it('rejects overflow before rendering a truncated image and allows retry', async () => {
  const { default: html2canvas } = await import('html2canvas')
  const wrapper = mountCard()
  try {
    const description = wrapper.find('.sc-desc').element
    Object.defineProperty(description, 'scrollHeight', {
      configurable: true,
      value: 500,
    })
    Object.defineProperty(description, 'clientHeight', {
      configurable: true,
      value: 100,
    })
    const previousCalls = html2canvas.mock.calls.length
    await expect(wrapper.vm.capture()).rejects.toThrow(
      'Card content does not fit',
    )
    expect(html2canvas.mock.calls).toHaveLength(previousCalls)
    Object.defineProperty(description, 'scrollHeight', {
      configurable: true,
      value: 100,
    })
    await expect(wrapper.vm.capture()).resolves.toBe(
      'data:image/png;base64,EXPORT',
    )
  } finally {
    wrapper.unmount()
  }
})
it('keeps exported content editorial and omits unsupported rarity and match claims', () => {
  const wrapper = mountCard()
  try {
    expect(wrapper.find('.sc-rarity-pill').exists()).toBe(false)
    expect(wrapper.find('.sc-match').exists()).toBe(false)
    expect(wrapper.find('.sc-editorial-note').exists()).toBe(true)
  } finally {
    wrapper.unmount()
  }
})
it('uses the same concise reflection highlights as the expanded report', async () => {
  const { getReport } = await import('../src/utils/report.js')
  const wrapper = mountCard('INTJ')
  try {
    for (const highlight of getReport('INTJ', 'zh').highlights) {
      expect(wrapper.find('.sc-desc').text()).toContain(highlight)
    }
  } finally {
    wrapper.unmount()
  }
})
