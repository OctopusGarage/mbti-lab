import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { afterEach, expect, it, vi } from 'vitest'
import TypesView from '../src/views/TypesView.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

let wrapper
async function open(path = '/types') {
  vi.stubGlobal('scrollTo', vi.fn())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/types', component: TypesView },
      { path: '/', component: { template: '<div/>' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  wrapper = mount(
    { template: '<RouterView />' },
    {
      attachTo: document.body,
      global: {
        plugins: [
          router,
          createI18n({ legacy: false, locale: 'en', messages: { zh, en } }),
        ],
        stubs: {
          ResultCard: {
            name: 'ResultCard',
            props: ['type'],
            template: '<div class="profile">{{ type }}</div>',
          },
        },
      },
    },
  )
  await flushPromises()
  return router
}
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.unstubAllGlobals()
})
it('opens a deep link and handles invalid or repeated type parameters safely', async () => {
  const router = await open('/types?type=INFJ')
  expect(wrapper.find('.profile').text()).toBe('INFJ')
  await router.push('/types?type=invalid')
  expect(wrapper.findAll('.type-chip')).toHaveLength(16)
  await router.push('/types?type=INFJ&type=ENFP')
  expect(wrapper.findAll('.type-chip')).toHaveLength(16)
})
it('searches both languages and type codes and preserves search across detail/back/reload', async () => {
  const router = await open('/types?q=infj')
  expect(wrapper.findAll('.type-chip')).toHaveLength(1)
  await wrapper.find('.type-chip').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({ q: 'infj', type: 'INFJ' })
  await wrapper.find('.detail-back').trigger('click')
  await flushPromises()
  expect(wrapper.find('input[type="search"]').element.value).toBe('infj')
  expect(document.activeElement.textContent).toContain('INFJ')
  await wrapper.find('input').setValue('倡导者')
  await flushPromises()
  expect(wrapper.findAll('.type-chip')).toHaveLength(1)
  await wrapper.find('input').setValue('advocate')
  await flushPromises()
  expect(wrapper.findAll('.type-chip')).toHaveLength(1)
  await wrapper.find('input').setValue('no such type')
  await flushPromises()
  expect(wrapper.find('[role="status"]').exists()).toBe(true)
})
it('offers a dock for a selected type and keeps search while reading an adjacent type', async () => {
  const router = await open('/types?q=infj&type=INFJ')
  expect(wrapper.find('.report-dock').exists()).toBe(true)
  wrapper.findComponent({ name: 'ResultCard' }).vm.$emit('neighbor', 'ENFJ')
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({ q: 'infj', type: 'ENFJ' })
  await wrapper.find('.dock-share').trigger('click')
  await flushPromises()
  expect(document.querySelector('.share-text-preview').textContent).toContain(
    'ENFJ',
  )
  await router.push('/types?q=infj')
  await flushPromises()
  expect(wrapper.find('.report-dock').exists()).toBe(false)
  expect(document.querySelector('.sp-overlay')).toBeNull()
})
