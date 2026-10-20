<template>
  <div v-if="languageNavigation.failedRoute" class="language-navigation-error" role="alert">
    {{ $t('app.languageError') }}
    <button @click="retryLanguage">{{ $t('app.languageRetry') }}</button>
    <button @click="languageNavigation.failedRoute = ''">{{ $t('share.close') }}</button>
  </div>
  <RouterView />
  <div class="og-brand">🐙 OctopusGarage</div>
</template>

<script setup>
import { RouterView, useRouter } from 'vue-router'
import { languageNavigation } from './i18n/resources.js'
const router = useRouter()
function retryLanguage() { router.push(languageNavigation.failedRoute) }
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #fef9ec;
  --cream-border: #f0e0c0;
  --gold: #c09060;
  --ink: #3a2a1a;
  --ink-light: #8a6a4a;
  --blue: #2d3a8c;
  --blue-mid: #5c6bc0;
  --blue-light: #e0e4f5;
  --white: #ffffff;
  --bg: #f5f6fa;
  --radius: 16px;
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: 100dvh;
}

.og-brand {
  position: fixed;
  bottom: calc(10px + env(safe-area-inset-bottom));
  right: 14px;
  font-size: 11px;
  color: rgba(45, 58, 140, 0.3);
  letter-spacing: 0.3px;
  pointer-events: none;
  z-index: 50;
}

:where(button, a, textarea, input, select, summary):focus-visible {
  outline: 3px solid var(--blue-mid);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>

<style>
.language-navigation-error { position: relative; z-index: 150; background: var(--cream); color: var(--ink); padding: 16px 24px; font-size: 14px; line-height: 1.6; }
.language-navigation-error button { min-height: 44px; margin: 4px; padding: 8px 12px; font: inherit; cursor: pointer; }
</style>
