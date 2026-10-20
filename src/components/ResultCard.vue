<template>
  <div v-if="typeData && report" class="result-card">
    <!-- Type reveal -->
    <div class="type-hero">
      <h1 class="type-letters" tabindex="-1">
        <span
          v-for="(letter, i) in typeLetters"
          :key="i"
          class="type-letter"
          :style="{ animationDelay: i * 0.045 + 's' }"
          >{{ letter }}</span
        >
      </h1>
      <div class="type-nickname">{{ typeData.nickname }}</div>
    </div>

    <section class="section cream-section">
      <h2 class="section-title">{{ $t('report.overview') }}</h2>
      <ul class="report-highlights">
        <li v-for="line in report.highlights" :key="line">{{ line }}</li>
      </ul>
      <p class="editorial-note">{{ $t('report.editorialNote') }}</p>
    </section>

    <section v-if="percents" class="section viz-section">
      <h2 class="section-title">{{ $t('report.dimensions') }}</h2>
      <p class="percent-note">{{ $t('report.percentNote') }}</p>
      <DimensionBars :percents="percents" />
      <p class="percent-note">{{ $t('report.closeNote') }}</p>
      <details class="chart-details" @toggle="chartOpen = $event.target.open">
        <summary><span>{{ $t('report.showChart') }}</span><AppIcon icon="chevron-down" :size="18" /></summary>
        <RadarChart v-if="chartOpen" :percents="percents" />
        <p class="percent-note">{{ $t('result.radarNote') }}</p>
      </details>
    </section>
    <ReportReader ref="reader" :report="report" />
    <section class="section cream-section neighbors">
      <h2 class="section-title">{{ $t('report.neighbors') }}</h2>
      <p class="percent-note">{{ $t('report.neighborNote') }}</p>
      <ul>
        <li v-for="neighbor in neighbors" :key="neighbor.type">
          <button
            class="neighbor-type"
            @click="$emit('neighbor', neighbor.type)"
          >
            <span>{{ neighbor.type }} · {{ getTypePresentation(neighbor.type, locale)?.nickname }}</span>
            <AppIcon icon="arrow-right" :size="17" />
          </button>
          <p>{{ $t('report.neighborDimensions.' + neighbor.dimension) }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import DimensionBars from './DimensionBars.vue'
import ReportReader from './ReportReader.vue'
import { getReport, getNeighbors } from '../utils/report.js'
import { getTypePresentation } from '../data/localizedContent.js'

const RadarChart = defineAsyncComponent(() => import('./RadarChart.vue'))

defineEmits(['neighbor'])
const reader = ref(null)
defineExpose({ contents: () => reader.value?.contents() })
const props = defineProps({ type: String, percents: Object })
const { locale } = useI18n()

const typeData = computed(() => getTypePresentation(props.type, locale.value))
const typeLetters = computed(() => props.type?.split('') ?? [])
const report = computed(() => getReport(props.type, locale.value))
const chartOpen = ref(false)
const neighbors = computed(() => getNeighbors(props.type))
</script>

<style scoped>
.result-card { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 840px; margin: 0 auto; }
.type-hero { text-align: center; padding: 44px 24px 42px; }
.type-letters { display: flex; justify-content: center; gap: 1px; margin: 0 0 12px; line-height: 1; }
.type-letter { font-size: clamp(80px, 15vw, 136px); font-weight: 750; letter-spacing: -.065em; color: var(--text); animation: letterReveal 480ms var(--ease-out) both; }
.type-letter:last-child { margin-right: .065em; }
@keyframes letterReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.type-nickname { font-size: clamp(20px, 3vw, 27px); font-weight: 500; letter-spacing: -.035em; color: var(--text-secondary); }
.section { padding: 32px 36px; border-radius: var(--radius-lg); background: var(--surface); }
.section-title { font-size: 21px; font-weight: 650; letter-spacing: -.035em; color: var(--text); margin-bottom: 18px; line-height: 1.4; }
.report-highlights { padding-left: 21px; line-height: 1.9; color: var(--text); }
.report-highlights li { padding-left: 4px; }
.report-highlights li::marker { color: var(--accent); }
.report-highlights li + li { margin-top: 12px; }
.editorial-note, .percent-note { color: var(--text-secondary); font-size: 13px; line-height: 1.8; margin-top: 18px; }
.viz-section > .percent-note:first-of-type { margin: -5px 0 28px; }
.chart-details { margin-top: 24px; border-top: 1px solid var(--line); }
.chart-details summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; list-style: none; min-height: 52px; padding: 12px 0; cursor: pointer; color: var(--accent); font-size: 14px; font-weight: 550; }
.chart-details summary::-webkit-details-marker { display: none; }
.chart-details summary svg { flex-shrink: 0; transition: transform var(--duration-normal) var(--ease-out); }
.chart-details[open] summary svg { transform: rotate(180deg); }
.chart-details .radar-chart { margin: 12px auto; }
.neighbors ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; list-style: none; padding: 0; margin: 24px 0 0; }
.neighbors li p { font-size: 12px; color: var(--text-secondary); line-height: 1.7; margin: 8px 4px 0; }
.neighbor-type { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 50px; padding: 12px 14px; border: 1px solid var(--line); background: var(--surface); color: var(--text); border-radius: var(--radius-sm); font: inherit; font-size: 13px; font-weight: 550; cursor: pointer; text-align: left; transition: background var(--duration-fast), transform var(--duration-fast); }
.neighbor-type svg { flex-shrink: 0; color: var(--text-secondary); }
.neighbor-type:active { transform: scale(.98); }
@media (hover: hover) { .neighbor-type:hover { background: var(--surface-secondary); } }
@media (max-width: 540px) { .result-card { gap: 14px; } .section { padding: 26px 22px; border-radius: var(--radius-md); } .type-hero { padding: 32px 12px 30px; } .section-title { font-size: 20px; } .neighbors ul { grid-template-columns: 1fr; gap: 18px; } }
@media (prefers-reduced-motion: reduce) { .type-letter { animation: none; } .chart-details summary svg, .neighbor-type { transition: none; } }
</style>
