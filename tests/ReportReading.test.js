import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { afterEach, expect, it, vi } from 'vitest'
import ResultCard from '../src/components/ResultCard.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

const percents = {
  EI: { E: 45, I: 55 },
  NS: { N: 56, S: 44 },
  FT: { F: 50, T: 50 },
  JP: { J: 51, P: 50 },
}
let wrapper
function open(locale = 'en', withPercents = true) {
  wrapper = mount(ResultCard, {
    props: { type: 'INFJ', ...(withPercents ? { percents } : {}) },
    attachTo: document.body,
    global: {
      plugins: [createI18n({ legacy: false, locale, messages: { zh, en } })],
      stubs: {
        RadarChart: {
          name: 'RadarChart',
          template: '<div class="radar-test"/>',
        },
      },
    },
  })
}
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})
it('shows highlights, editorial context and independent chapters without unsupported claims', () => {
  open()
  expect(wrapper.findAll('.report-highlights li')).toHaveLength(3)
  expect(wrapper.findAll('.report-section')).toHaveLength(7)
  expect(wrapper.findAll('.growth-action')).toHaveLength(3)
  expect(wrapper.find('.editorial-note').text()).toContain('examples')
  expect(wrapper.find('.type-rarity').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('Best Match')
  expect(wrapper.text()).not.toContain('Famous People')
})
it('mounts the optional radar only after expansion and leaves dimension bars visible', async () => {
  open()
  expect(wrapper.find('.dim-bars').exists()).toBe(true)
  expect(wrapper.findComponent({ name: 'RadarChart' }).exists()).toBe(false)
  wrapper.find('.chart-details').element.open = true
  await wrapper.find('.chart-details').trigger('toggle')
  await flushPromises()
  expect(wrapper.findComponent({ name: 'RadarChart' }).exists()).toBe(true)
})
it('opens and focuses a contents target without closing other chapters', async () => {
  open()
  const target = wrapper.find('#report-growth')
  const scrollIntoView = vi.fn()
  target.element.scrollIntoView = scrollIntoView
  await wrapper.find('[data-section="growth"]').trigger('click')
  expect(target.element.open).toBe(true)
  expect(wrapper.find('#report-core').element.open).toBe(true)
  expect(document.activeElement).toBe(target.find('summary').element)
  expect(scrollIntoView).toHaveBeenCalledOnce()
})
it('keeps the appendix editorial without personal proportions', () => {
  open('zh', false)
  expect(wrapper.find('.viz-section').exists()).toBe(false)
  expect(wrapper.findAll('.report-section')).toHaveLength(7)
})
it('focuses the contents from the public reader action and emits adjacent-type navigation', async () => {
  open()
  const contents = wrapper.find('.report-contents')
  const scrollIntoView = vi.fn()
  contents.element.scrollIntoView = scrollIntoView
  expect(typeof wrapper.vm.contents).toBe('function')
  await wrapper.vm.contents()
  expect(scrollIntoView).toHaveBeenCalledOnce()
  expect(document.activeElement).toBe(contents.find('button').element)
  expect(wrapper.findAll('.neighbor-type')).toHaveLength(4)
  await wrapper.find('.neighbor-type').trigger('click')
  expect(wrapper.emitted('neighbor')[0]).toEqual(['ENFJ'])
})
