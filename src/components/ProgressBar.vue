<template>
  <div class="progress-wrap">
    <div class="progress-label">{{ $t('test.progress', { current: current + 1, total }) }}</div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ current: Number, total: Number })
const pct = computed(() => Math.round(((props.current + 1) / props.total) * 100))
</script>

<style scoped>
.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.progress-label {
  font-size: 13px;
  color: var(--ink-light);
  letter-spacing: 0.3px;
}
.progress-track {
  height: 4px;
  background: var(--blue-light);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--blue-mid);
  border-radius: 4px;
  transition: width 0.4s ease;
}
</style>
