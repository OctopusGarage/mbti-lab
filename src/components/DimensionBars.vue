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
        <span>{{ secondPct(key, dim) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ percents: Object })
const { t } = useI18n()

const labels = computed(() => t('result.dimLabel'))

const FIRST = { EI: 'E', NS: 'N', FT: 'F', JP: 'J' }
const SECOND = { EI: 'I', NS: 'S', FT: 'T', JP: 'P' }

function firstPct(key, dim) { return dim[FIRST[key]] }
function secondPct(key, dim) { return dim[SECOND[key]] }
</script>

<style scoped>
.dim-bars { display: flex; flex-direction: column; gap: 18px; }

.dim-row { display: flex; flex-direction: column; gap: 6px; }

.dim-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ink-light);
  font-weight: 500;
}
.dim-label.right { text-align: right; }

.bar-track {
  height: 8px;
  background: var(--blue-light);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.bar-fill {
  height: 100%;
  background: var(--blue-mid);
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.bar-divider {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: white;
  transform: translateX(-50%);
}

.dim-pcts {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--blue-mid);
  font-weight: 600;
}
</style>
