<template>
  <div class="progress-wrap">
    <div class="progress-label">
      {{ $t('test.progress', { current: current + 1, total }) }}
    </div>
    <div
      v-if="total > 0"
      class="progress-track"
      role="progressbar"
      :aria-label="$t('test.progressLabel')"
      :aria-valuenow="current + 1"
      :aria-valuemin="1"
      :aria-valuemax="total"
      :aria-valuetext="$t('test.progress', { current: current + 1, total })"
    >
      <div class="progress-fill" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ current: Number, total: Number })
const pct = computed(() =>
  props.total > 0 ? Math.min(100, Math.max(0, Math.round(((props.current + 1) / props.total) * 100))) : 0,
)
</script>

<style scoped>
.progress-wrap { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.progress-label { font-size: 12px; font-weight: 500; line-height: 1.5; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.progress-track { height: 4px; background: rgba(29,29,31,.08); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 280ms var(--ease-out); }
@media (prefers-reduced-motion: reduce) { .progress-fill { transition: none; } }
</style>
