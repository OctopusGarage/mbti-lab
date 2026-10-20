<template>
  <div ref="chartEl" class="radar-chart" role="img" :aria-label="$t('result.radarNote')" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps({ percents: Object })
const chartEl = ref(null)
let chart = null
let observer = null

function buildOption(percents) {
  const p = percents
  return {
    animation: !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    animationDuration: 360,
    animationDurationUpdate: 260,
    animationEasing: 'cubicOut',
    radar: {
      indicator: [
        { name: 'E', max: 100 },
        { name: 'N', max: 100 },
        { name: 'F', max: 100 },
        { name: 'J', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 3,
      axisName: { color: '#0071e3', fontSize: 11, fontWeight: 600 },
      splitLine: { lineStyle: { color: '#e3e5e9' } },
      splitArea: { areaStyle: { color: ['#fafbfc', '#f1f5fa'] } },
      axisLine: { lineStyle: { color: '#e3e5e9' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          p.EI.E,
          p.NS.N,
          p.FT.F,
          p.JP.J,
        ],
        areaStyle: { color: 'rgba(0,113,227,0.12)' },
        lineStyle: { color: '#0071e3', width: 2 },
        itemStyle: { color: '#0071e3' },
      }],
    }],
  }
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => chart?.resize())
    observer.observe(chartEl.value)
  }
  if (props.percents) chart.setOption(buildOption(props.percents))
})

watch(() => props.percents, (val) => {
  if (chart && val) chart.setOption(buildOption(val))
})
onUnmounted(() => { observer?.disconnect(); chart?.dispose(); chart = null })
</script>

<style scoped>
.radar-chart { width: 260px; max-width: 100%; height: 240px; margin-inline: auto; }
</style>
