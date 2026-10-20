import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, it } from 'vitest'
import DimensionBars from '../src/components/DimensionBars.vue'
import ResultCard from '../src/components/ResultCard.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'
const percents = {
  EI: { E: 45, I: 55 },
  NS: { N: 55, S: 45 },
  FT: { F: 44, T: 56 },
  JP: { J: 56, P: 44 },
}
it('labels 45 and 55 as close alongside the matching bars, leaving 44 and 56 unlabelled', async () => {
  const wrapper = mount(DimensionBars, {
    props: { percents },
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', messages: { zh, en } }),
      ],
    },
  })
  try {
    const rows = wrapper.findAll('.dim-row')
    expect(rows.map((row) => row.find('.close-label').exists())).toEqual([
      true,
      true,
      false,
      false,
    ])
    expect(rows[0].find('.close-label').text()).toBe('Both sides close')
    await wrapper.setProps({ percents: { ...percents, JP: { J: 51, P: 50 } } })
    expect(wrapper.findAll('.dim-row')[3].text()).toContain('51%')
    expect(wrapper.findAll('.dim-row')[3].text()).toContain('50%')
    expect(wrapper.findAll('.dim-row')[3].find('.close-label').exists()).toBe(
      true,
    )
  } finally {
    wrapper.unmount()
  }
})
it('keeps one common explanation and removes the repeated per-dimension list', () => {
  const wrapper = mount(ResultCard, {
    props: { type: 'INFJ', percents },
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'zh', messages: { zh, en } }),
      ],
    },
  })
  try {
    expect(wrapper.find('.dimension-notes').exists()).toBe(false)
    expect(wrapper.text().split(zh.report.closeNote)).toHaveLength(2)
    expect(wrapper.find('.close-label').text()).toBe('两侧接近')
  } finally {
    wrapper.unmount()
  }
})
