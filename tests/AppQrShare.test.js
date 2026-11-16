import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { afterEach, expect, it, vi } from 'vitest'
import AppQrShare from '../src/components/AppQrShare.vue'
import en from '../src/locales/en.json'
import { renderAppCard } from '../src/utils/appShareCard.js'
vi.mock('../src/utils/appShareCard.js', () => ({ renderAppCard: vi.fn() }))
let wrapper
const start = () => wrapper = mount(AppQrShare, { global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en } })] } })
afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks(); delete navigator.share; delete navigator.canShare })
it('prepares a downloadable card pointing at the public app', async () => {
  renderAppCard.mockResolvedValue('data:image/png;base64,YQ==')
  start(); await flushPromises()
  expect(renderAppCard).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://octopusgarage.github.io/mbti-lab' }))
  expect(wrapper.find('a[download]').attributes('href')).toContain('data:image/png')
  expect(wrapper.find('img').exists()).toBe(true)
})
it('allows retry after generation fails', async () => {
  renderAppCard.mockRejectedValueOnce(Error('failed')).mockResolvedValue('data:image/png;base64,YQ==')
  start(); await flushPromises()
  await wrapper.get('[data-action="retry-qr"]').trigger('click'); await flushPromises()
  expect(wrapper.find('img').exists()).toBe(true)
})
it('treats native share cancellation as normal', async () => {
  navigator.share = vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError'))
  renderAppCard.mockResolvedValue('data:image/png;base64,YQ==')
  start(); await flushPromises()
  await wrapper.get('[data-action="native-link"]').trigger('click'); await flushPromises()
  expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://octopusgarage.github.io/mbti-lab' }))
  expect(wrapper.find('[data-share-error]').exists()).toBe(false)
})
it('shares a prepared PNG and falls back visibly on native failure', async () => {
  navigator.share = vi.fn().mockRejectedValue(Error('unavailable'))
  navigator.canShare = vi.fn().mockReturnValue(true)
  renderAppCard.mockResolvedValue('data:image/png;base64,YQ==')
  start(); await flushPromises()
  await wrapper.get('.qr-actions button').trigger('click'); await flushPromises()
  const payload = navigator.share.mock.calls[0][0]
  expect(payload.files[0].type).toBe('image/png')
  expect(wrapper.find('[data-share-error]').exists()).toBe(true)
  expect(wrapper.find('a[download]').exists()).toBe(true)
})
