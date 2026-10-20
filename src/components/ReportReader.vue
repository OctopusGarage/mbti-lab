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
      <summary>{{ $t('report.sections.' + section.id) }}</summary>
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
.section {
  padding: 24px;
}
.cream-section {
  background: var(--cream);
}
.section-title {
  color: var(--gold);
  font-size: 15px;
  margin-bottom: 12px;
}
.contents-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.contents-links button {
  min-height: 44px;
  border: 1px solid var(--cream-border);
  border-radius: 12px;
  padding: 8px 12px;
  background: white;
  color: var(--blue);
  font: inherit;
  cursor: pointer;
}
.report-contents {
  scroll-margin-top: 80px;
}
.report-section {
  border-top: 1px solid var(--cream-border);
  scroll-margin-top: 80px;
}
summary {
  min-height: 44px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  color: var(--blue);
  padding: 8px 0;
}
.report-section p {
  line-height: 1.85;
  margin-top: 14px;
  overflow-wrap: anywhere;
}
.growth-actions {
  display: grid;
  gap: 20px;
  margin-top: 24px;
}
.growth-action {
  padding-top: 20px;
  border-top: 1px solid var(--cream-border);
}
.growth-action h3 {
  font-size: 16px;
}
blockquote {
  border-left: 3px solid var(--gold);
  padding: 12px 16px;
  margin-top: 12px;
  background: white;
  line-height: 1.7;
}
</style>
