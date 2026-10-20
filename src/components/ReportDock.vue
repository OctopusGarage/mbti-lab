<template>
  <nav class="report-dock" :aria-label="$t('report.actions')">
    <button class="dock-contents" @click="$emit('contents')">
      {{ $t('report.contents') }}
    </button>
    <button class="dock-share btn-share" @click="$emit('share')">
      {{ $t('result.shareBtn') }}
    </button>
  </nav>
</template>
<script setup>
defineEmits(['contents', 'share'])
</script>
<style scoped>
.report-dock {
  position: fixed;
  z-index: 60;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px calc(12px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid var(--cream-border);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}
button {
  flex: 1;
  max-width: 260px;
  min-width: 0;
  min-height: 48px;
  border: 1px solid var(--blue-light);
  border-radius: 24px;
  padding: 10px 16px;
  background: white;
  color: var(--blue);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.dock-share {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
}
</style>
