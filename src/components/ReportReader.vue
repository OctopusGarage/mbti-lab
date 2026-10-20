<template>
  <div class="report-reader">
    <nav
      ref="contentsEl"
      class="section cream-section report-contents"
      :aria-label="$t('report.contents')"
    >
      <h2 class="section-title">{{ $t('report.contents') }}</h2>
      <div class="contents-links">
        <button
          v-for="section in report.sections"
          :key="section.id"
          :data-section="section.id"
          @click="jump(section.id)"
        >
          {{ $t('report.sections.' + section.id) }}
        </button>
      </div>
    </nav>
    <details
      v-for="section in report.sections"
      :key="section.id"
      :ref="(element) => (sections[section.id] = element)"
      :id="'report-' + section.id"
      class="section cream-section report-section"
      :open="section.id === 'core'"
    >
      <summary><span>{{ $t('report.sections.' + section.id) }}</span><AppIcon icon="chevron-down" :size="20" /></summary>
      <p>{{ section.text }}</p>
      <div v-if="section.id === 'growth'" class="growth-actions">
        <article
          v-for="action in report.actions"
          :key="action.context"
          class="growth-action"
        >
          <h3>{{ action.context }}</h3>
          <p>{{ action.step }}</p>
          <blockquote>{{ action.phrase }}</blockquote>
        </article>
      </div>
    </details>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import AppIcon from './AppIcon.vue'
defineProps({ report: { type: Object, required: true } })
const sections = {}
const contentsEl = ref(null)
async function jump(id) {
  const section = sections[id]
  if (!section) return
  section.open = true
  await nextTick()
  section.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  section.querySelector('summary')?.focus({ preventScroll: true })
}
function contents() {
  contentsEl.value?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  contentsEl.value?.querySelector('button')?.focus({ preventScroll: true })
}
defineExpose({ contents })
</script>

<style scoped>
.report-reader { display: grid; gap: 12px; }
.section { background: var(--surface); border-radius: var(--radius-md); padding: 12px 36px; }
.report-contents { padding: 30px 36px 32px; margin-bottom: 8px; scroll-margin-top: 92px; }
.section-title { color: var(--text); font-size: 18px; font-weight: 600; letter-spacing: -.025em; margin-bottom: 18px; }
.contents-links { display: flex; flex-wrap: wrap; gap: 8px; }
.contents-links button { min-height: 44px; border: 1px solid transparent; border-radius: 22px; padding: 9px 15px; background: var(--surface-secondary); color: var(--text-secondary); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: color var(--duration-fast), background var(--duration-fast), transform var(--duration-fast); }
.contents-links button:active { transform: scale(.96); }
.report-section { scroll-margin-top: 92px; }
summary { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 64px; cursor: pointer; list-style: none; font-size: 19px; font-weight: 600; letter-spacing: -.025em; color: var(--text); padding: 14px 0; }
summary::-webkit-details-marker { display: none; }
summary svg { color: var(--text-secondary); flex-shrink: 0; transition: transform var(--duration-normal) var(--ease-out); }
.report-section[open] summary svg { transform: rotate(180deg); }
.report-section p { color: var(--text-secondary); line-height: 1.95; font-size: 15px; padding-bottom: 20px; margin-top: 8px; overflow-wrap: anywhere; }
.growth-actions { display: grid; gap: 20px; margin: 4px 0 20px; }
.growth-action { padding: 22px; background: var(--surface-secondary); border-radius: var(--radius-sm); }
.growth-action h3 { font-size: 15px; font-weight: 600; color: var(--text); }
.growth-action p { font-size: 14px; padding-bottom: 0; margin-top: 8px; }
blockquote { border-left: 2px solid var(--accent); padding: 2px 0 2px 16px; margin: 18px 0 0; color: var(--text); font-size: 14px; line-height: 1.85; }
@media (hover: hover) { .contents-links button:hover { background: var(--accent-soft); color: var(--accent); } summary:hover { color: var(--accent); } }
@media (max-width: 540px) { .section { padding: 8px 22px; } .report-contents { padding: 26px 22px; } summary { font-size: 18px; min-height: 60px; } .contents-links { gap: 7px; } .contents-links button { padding-inline: 13px; } .growth-action { padding: 18px; } }
@media (prefers-reduced-motion: reduce) { summary svg, .contents-links button { transition: none; } }
</style>
