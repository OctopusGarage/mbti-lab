<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path v-for="(path, index) in paths" :key="index" :d="path" />
  </svg>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ icon: { type: String, default: 'arrow-right' }, size: { type: [Number, String], default: 20 } })
const shapes = {
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  check: ['m5 12 4 4L19 6'],
  share: ['M12 15V3', 'm8 7 4-4 4 4', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7'],
  globe: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M3 12h18', 'M12 3c4 5 4 13 0 18-4-5-4-13 0-18Z'],
  sparkle: ['m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z'],
  grid: ['M4 4h6v6H4Z', 'M14 4h6v6h-6Z', 'M4 14h6v6H4Z', 'M14 14h6v6h-6Z'],
  close: ['m6 6 12 12', 'M18 6 6 18'],
  copy: ['M9 9h11v11H9Z', 'M15 5V3H3v12h2'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M4 16v5h16v-5'],
  external: ['M14 3h7v7', 'M10 14 21 3', 'M10 3H3v18h18v-7'],
  'chevron-down': ['m6 9 6 6 6-6'],
  book: ['M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z', 'M12 5v15'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M12 7v5l3 2'],
  shield: ['m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3Z', 'm8 12 3 3 5-5'],
  sliders: ['M4 7h16', 'M4 17h16', 'M8 4v6', 'M16 14v6'],
}
const paths = computed(() => shapes[props.icon] ?? shapes['arrow-right'])
</script>
<style scoped>svg { flex: 0 0 auto; vertical-align: middle; }</style>
