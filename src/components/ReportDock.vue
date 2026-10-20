<template>
  <nav class="report-dock" :aria-label="$t('report.actions')">
    <button class="dock-contents" @click="$emit('contents')">
      <AppIcon icon="book" :size="18" />
      <span>{{ $t('report.contents') }}</span>
    </button>
    <button class="dock-share btn-share" @click="$emit('share')">
      <AppIcon icon="share" :size="18" />
      <span>{{ $t('result.shareBtn') }}</span>
    </button>
  </nav>
</template>
<script setup>
import AppIcon from './AppIcon.vue'
defineEmits(['contents', 'share'])
</script>
<style scoped>
.report-dock { position: fixed; z-index: 60; bottom: calc(16px + env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; width: min(400px, calc(100% - 32px)); padding: 7px; border: 1px solid rgba(255, 255, 255, .8); border-radius: 32px; background: rgba(255, 255, 255, .96); box-shadow: 0 8px 40px rgba(29, 29, 31, .13), 0 1px 4px rgba(29, 29, 31, .05); }
@supports (backdrop-filter: blur(20px)) { .report-dock { background: rgba(255, 255, 255, .78); backdrop-filter: blur(20px) saturate(1.6); } }
button { display: flex; align-items: center; justify-content: center; gap: 9px; flex: 1; min-width: 0; min-height: 46px; border: 0; border-radius: 25px; padding: 10px 14px; background: transparent; color: var(--text); font: inherit; font-size: 14px; font-weight: 550; line-height: 1.4; cursor: pointer; transition: background var(--duration-fast), transform var(--duration-fast); }
button svg { flex-shrink: 0; }
button:active { transform: scale(.96); }
.dock-share { background: var(--accent); color: white; }
@media (hover: hover) { .dock-contents:hover { background: var(--surface-secondary); } .dock-share:hover { background: #0077ed; } }
@media (max-width: 360px) { button { font-size: 13px; padding-inline: 10px; gap: 7px; } }
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
</style>
