import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { expect, it, vi } from 'vitest'
import RadarChart from '../src/components/RadarChart.vue'
import ResultCard from '../src/components/ResultCard.vue'
import TypesView from '../src/views/TypesView.vue'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'
const chart = vi.hoisted(() => ({
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
}))
vi.mock('echarts/core', () => ({ use: vi.fn(), init: () => chart }))
const global = {
  plugins: [createI18n({ legacy: false, locale: 'en', messages: { zh, en } })],
}
it('labels actual plotted axes, resizes and disposes the chart', () => {
  let resized
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback) {
        resized = callback
      }
      observe() {}
      disconnect = disconnect
    },
  )
  const wrapper = mount(RadarChart, {
    props: {
      percents: {
        EI: { E: 40, I: 60 },
        NS: { N: 60, S: 40 },
        FT: { F: 70, T: 30 },
        JP: { J: 50, P: 50 },
      },
    },
    global,
  })
  expect(
    chart.setOption.mock.calls.at(-1)[0].radar.indicator.map((x) => x.name),
  ).toEqual(['E', 'N', 'F', 'J'])
  resized()
  expect(chart.resize).toHaveBeenCalled()
  wrapper.unmount()
  expect(chart.dispose).toHaveBeenCalled()
  expect(disconnect).toHaveBeenCalled()
  vi.unstubAllGlobals()
})
it('does not fabricate personal percentages in the type appendix', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/types', component: TypesView }],
  })
  await router.push('/types?type=INFJ')
  await router.isReady()
  const wrapper = mount(TypesView, {
    global: {
      plugins: [...global.plugins, router],
      stubs: { ResultCard: true },
    },
  })
  expect(wrapper.findComponent(ResultCard).props('percents')).toBeUndefined()
  wrapper.unmount()
})
it('omits personal charts without assessment data', () => {
  const wrapper = mount(ResultCard, {
    props: { type: 'INFJ' },
    global: { ...global, stubs: { RadarChart: true, DimensionBars: true } },
  })
  expect(wrapper.findComponent(RadarChart).exists()).toBe(false)
  wrapper.unmount()
})
