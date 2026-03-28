<template>
  <RouterView />
  <div class="og-brand">🐙 OctopusGarage</div>
</template>

<script setup>
import { RouterView } from 'vue-router'
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
  bottom: 10px;
  right: 14px;
  font-size: 11px;
  color: rgba(45, 58, 140, 0.3);
  letter-spacing: 0.3px;
  pointer-events: none;
  z-index: 50;
}
</style>
