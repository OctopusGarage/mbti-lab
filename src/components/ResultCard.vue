<template>
  <div v-if="typeData && report" class="result-card">
    <!-- Type reveal -->
    <div class="type-hero">
      <h1 class="type-letters" tabindex="-1">
        <span
          v-for="(letter, i) in typeLetters"
          :key="i"
          class="type-letter"
          :style="{ animationDelay: i * 0.15 + 's' }"
          >{{ letter }}</span
        >
      </h1>
      <div class="type-nickname">{{ typeData.nickname[locale] }}</div>
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
        <summary>{{ $t('report.showChart') }}</summary>
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
            {{ neighbor.type }} · {{ types[neighbor.type].nickname[locale] }}
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
import DimensionBars from './DimensionBars.vue'
import ReportReader from './ReportReader.vue'
import { getReport, getNeighbors } from '../utils/report.js'
import { types } from '../data/types.js'

const RadarChart = defineAsyncComponent(() => import('./RadarChart.vue'))

defineEmits(['neighbor'])
const reader = ref(null)
defineExpose({ contents: () => reader.value?.contents() })
const props = defineProps({ type: String, percents: Object })
const { locale } = useI18n()

const typeData = computed(() => types[props.type])
const typeLetters = computed(() => props.type?.split('') ?? [])
const report = computed(() => getReport(props.type, locale.value))
const chartOpen = ref(false)
const neighbors = computed(() => getNeighbors(props.type))
</script>

<style scoped>
.result-card {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Hero */
.type-hero {
  text-align: center;
  padding: 48px 24px 40px;
  background: linear-gradient(160deg, #1a1a2e, #2d3a8c);
  color: white;
}
.type-letters {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}
.type-letter {
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #e2c96e;
  opacity: 0;
  animation: letterReveal 0.4s forwards;
}
@keyframes letterReveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.type-nickname {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
}

/* Sections */
.section {
  padding: 28px 24px;
}
.cream-section {
  background: var(--cream);
}

.section-title {
  font-size: 14px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 12px;
}
.viz-section {
  background: white;
}

.report-highlights {
  padding-left: 22px;
  line-height: 1.8;
}
.report-highlights li + li {
  margin-top: 8px;
}
.editorial-note,
.percent-note {
  color: var(--ink-light);
  font-size: 13px;
  line-height: 1.8;
  margin-top: 16px;
}
.chart-details {
  margin-top: 20px;
}
.chart-details summary {
  min-height: 44px;
  padding: 12px 0;
  cursor: pointer;
  color: var(--blue);
  font-weight: 600;
}
.chart-details .radar-chart {
  margin: auto;
}
.neighbors ul {
  display: grid;
  gap: 20px;
  list-style: none;
  margin-top: 20px;
}
.neighbors li p {
  font-size: 14px;
  line-height: 1.8;
  margin-top: 6px;
}
.neighbor-type {
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--cream-border);
  background: white;
  color: var(--blue);
  border-radius: 12px;
  font: inherit;
  cursor: pointer;
  text-align: left;
}
</style>
