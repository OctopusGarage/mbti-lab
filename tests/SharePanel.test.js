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
      '_blank',
    )
    const url = window.open.mock.calls[0][0]
    expect(decodeURIComponent(url)).toContain('INFJ')
  })

  it('opens X with app text when sharing app', async () => {
    mountPanel()
    await document.querySelector('[data-action="share-app-x"]').click()
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
    )
    const url = window.open.mock.calls[0][0]
    expect(decodeURIComponent(url)).toContain(
      'octopusgarage.github.io/mbti-lab',
    )
  })

  it('copies app URL to clipboard and shows copied feedback', async () => {
    mountPanel()
    const copyBtn = document.querySelector('[data-action="copy-link"]')
    expect(copyBtn.textContent.trim()).toContain('复制链接')
    copyBtn.click()
    await flushPromises()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://octopusgarage.github.io/mbti-lab',
    )
    expect(
      document.querySelector('[data-action="copy-link"]').textContent.trim(),
    ).toContain('已复制 ✓')
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

it('offers a manually selectable URL when clipboard permission is denied', async () => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockRejectedValue(Error('denied')) },
  })
  mountPanel()
  document.querySelector('[data-action="copy-link"]').click()
  await flushPromises()
  expect(document.querySelector('textarea').value).toBe(
    'https://octopusgarage.github.io/mbti-lab',
  )
  expect(document.querySelector('[role="status"]').textContent).toContain(
    '复制失败',
  )
})
it('traps keyboard focus, isolates the background and restores focus on close', async () => {
  const background = document.createElement('main')
  const trigger = document.createElement('button')
  background.append(trigger)
  document.body.append(background)
  trigger.focus()
  document.body.style.overflow = 'scroll'
  try {
    mountPanel()
    expect(background.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    const first = document.querySelector('.sp-close')
    const last = document.querySelector('[data-action="copy-link"]')
    expect(document.activeElement).toBe(first)
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        cancelable: true,
      }),
    )
    expect(document.activeElement).toBe(last)
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }),
    )
    expect(document.activeElement).toBe(first)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
    wrapper = null
    expect(background.inert).toBeFalsy()
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('scroll')
  } finally {
    background.remove()
    document.body.style.overflow = ''
  }
})
it('previews and copies a type-only caption with one canonical deep link', async () => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
  mountPanel({ type: 'INFJ', onSaveImage: vi.fn() })
  const preview = document.querySelector('.share-text-preview')
  expect(preview).not.toBeNull()
  const text = preview.textContent
  expect(text).toContain(
    'https://octopusgarage.github.io/mbti-lab/#/types?type=INFJ',
  )
  expect(text.match(/https:\/\//g)).toHaveLength(1)
  expect(text).not.toMatch(/answers|percents|\d+%/)
  document.querySelector('[data-action="copy-result"]').click()
  await flushPromises()
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text)
  expect(
    document.querySelector('[data-action="copy-result"]').textContent,
  ).toContain('已复制')
  expect(
    document.querySelector('[data-action="copy-link"]').textContent,
  ).toContain('复制链接')
})
it('offers the full result caption when copying fails, and hides unavailable image capture', async () => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockRejectedValue(Error('denied')) },
  })
  mountPanel({ type: 'INFJ' })
  expect(document.querySelector('[data-action="save-image"]')).toBeNull()
  document.querySelector('[data-action="copy-result"]').click()
  await flushPromises()
  expect(document.querySelector('textarea').value).toBe(
    document.querySelector('.share-text-preview').textContent,
  )
  expect(document.activeElement).toBe(document.querySelector('textarea'))
})
it('discards stale copy feedback when the selected type changes during a pending copy', async () => {
  let resolve
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(
        () =>
          new Promise((done) => {
            resolve = done
          }),
      ),
    },
  })
  mountPanel({ type: 'INFJ' })
  document.querySelector('[data-action="copy-result"]').click()
  await wrapper.setProps({ type: 'ENFJ' })
  resolve()
  await flushPromises()
  expect(
    document.querySelector('[data-action="copy-result"]').textContent,
  ).toContain('复制结果文案')
  expect(document.querySelector('.share-text-preview').textContent).toContain(
    'ENFJ',
  )
  expect(document.querySelector('textarea')).toBeNull()
})
