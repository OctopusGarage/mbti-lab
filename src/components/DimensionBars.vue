<template>
  <div class="dim-bars">
    <div v-for="(dim, key) in percents" :key="key" class="dim-row">
      <div class="dim-labels">
        <span class="dim-label">{{ labels[key][0] }}</span>
        <span class="dim-label right">{{ labels[key][1] }}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: firstPct(key, dim) + '%' }" />
        <div class="bar-divider" />
      </div>
      <div class="dim-pcts">
        <span>{{ firstPct(key, dim) }}%</span>
        <span v-if="closeDimensions[key]" class="close-label">{{
          $t('report.closeLabel')
        }}</span>
        <span>{{ secondPct(key, dim) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { interpretDimensions } from '../utils/dimensions.js'

const props = defineProps({ percents: Object })
const { tm } = useI18n()

const labels = computed(() => tm('result.dimLabel'))
const closeDimensions = computed(() =>
  Object.fromEntries(
    interpretDimensions(props.percents).map((note) => [note.key, note.close]),
  ),
)

const FIRST = { EI: 'E', NS: 'N', FT: 'F', JP: 'J' }
const SECOND = { EI: 'I', NS: 'S', FT: 'T', JP: 'P' }

function firstPct(key, dim) {
  return dim[FIRST[key]]
}
function secondPct(key, dim) {
  return dim[SECOND[key]]
}
</script>

<style scoped>
.dim-bars { display: flex; min-width: 0; flex-direction: column; gap: 25px; }
.dim-row { display: flex; flex-direction: column; gap: 9px; }
.dim-labels { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.dim-label.right { text-align: right; }
.bar-track { height: 7px; background: #dbe9f8; border-radius: 8px; overflow: hidden; position: relative; }
.bar-fill { height: 100%; background: var(--accent); border-radius: 8px; }
.bar-divider { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: var(--surface); transform: translateX(-50%); }
.close-label { color: var(--text-secondary); background: var(--surface-secondary); padding: 3px 9px; border-radius: 12px; text-align: center; font-size: 11px; font-weight: 400; }
.dim-pcts { align-items: center; gap: 8px; display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); font-weight: 550; font-variant-numeric: tabular-nums; }
.dim-pcts > span:first-child { color: var(--accent); }
</style>
