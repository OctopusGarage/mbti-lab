<template>
  <button class="lang-toggle" @click="toggle">
    {{ locale === 'zh' ? 'EN' : '中' }}
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
function toggle() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
}
</script>

<style scoped>
.lang-toggle {
  background: rgba(255,255,255,0.9);
  border: 1px solid var(--cream-border);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: background 0.2s;
}
.lang-toggle:hover { background: var(--white); }
</style>
