<template>
  <div class="result-page" :class="{ 'has-report': result }">
    <header class="result-header">
      <LangToggle />
    </header>

    <template v-if="result">
      <ResultCard
        ref="reader"
        :type="result.type"
        :percents="result.percents"
        @neighbor="readNeighbor"
      />
      <ReportDock @contents="reader?.contents?.()" @share="showPanel = true" />

      <div class="actions">
        <router-link to="/" class="btn-retake">{{
          $t('result.retake')
        }}</router-link>
      </div>

      <SharePanel
        v-if="showPanel"
        :type="result.type"
        :onSaveImage="saveImage"
        @close="showPanel = false"
      />

      <p v-if="unsaved" role="status">{{ $t('result.unsaved') }}</p>
      <p v-if="generating" role="status">{{ $t('share.generating') }}</p>
      <div v-if="exportFailed" role="alert">
        {{ $t('share.imageError') }}
        <button class="retry-export" @click="saveImage">
          {{ $t('share.retry') }}
        </button>
      </div>
      <div v-if="image" class="export-preview">
        <p>{{ $t('share.imageHint') }}</p>
        <img :src="image" :alt="result.type" />
        <a :href="image" :download="`mbti-${result.type}.png`">{{
          $t('share.download')
        }}</a>
      </div>
      <ShareCard ref="shareCardRef" :type="result.type" />
    </template>

    <div v-else class="no-result">
      <p>{{ $t('result.notFound') }}</p>
      <router-link to="/">{{ $t('result.backHome') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import LangToggle from '../components/LangToggle.vue'
import ResultCard from '../components/ResultCard.vue'
import ShareCard from '../components/ShareCard.vue'
import SharePanel from '../components/SharePanel.vue'
import { useResultStore } from '../composables/useResultStore.js'
import ReportDock from '../components/ReportDock.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { load, isPersisted } = useResultStore()
const result = ref(null)
const reader = ref(null)
const router = useRouter()
function readNeighbor(type) {
  router.push({ path: '/types', query: { type } })
}
const shareCardRef = ref(null)
const showPanel = ref(false)
const generating = ref(false)
const exportFailed = ref(false)
const image = ref('')
const { locale } = useI18n()
const unsaved = ref(false)
let revision = 0
watch(locale, () => {
  revision++
  image.value = ''
  exportFailed.value = false
})
onUnmounted(() => {
  revision++
})
async function saveImage() {
  if (generating.value) return
  generating.value = true
  exportFailed.value = false
  image.value = ''
  const currentRevision = revision
  try {
    const output = await shareCardRef.value.capture()
    if (revision === currentRevision) image.value = output
  } catch {
    if (revision === currentRevision) exportFailed.value = true
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  result.value = load()
  unsaved.value = !isPersisted(result.value)
})
</script>

<style scoped>
.result-page { min-height: 100dvh; padding: 0 24px; display: flex; flex-direction: column; background: var(--canvas); position: relative; }
.has-report { padding-bottom: calc(116px + env(safe-area-inset-bottom)); }
.result-header { display: flex; justify-content: flex-end; width: 100%; max-width: 1040px; margin-inline: auto; padding: 20px 0 0; min-height: 64px; }
.actions { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 28px 16px 20px; }
.btn-retake { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 20px; font-size: 14px; color: var(--text-secondary); text-decoration: none; border-radius: 24px; transition: color var(--duration-fast), background var(--duration-fast); }
.btn-retake:hover { color: var(--accent); background: var(--accent-soft); }
.no-result { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: var(--text-secondary); padding-bottom: 80px; }
.no-result a { color: var(--accent); min-height: 44px; display: inline-flex; align-items: center; text-decoration: none; }
.export-preview { display: grid; gap: 16px; padding: 24px; text-align: center; width: 100%; max-width: 600px; margin-inline: auto; background: var(--surface); border-radius: var(--radius-lg); }
.export-preview img { max-width: 100%; height: auto; margin: auto; border-radius: var(--radius-sm); }
.export-preview a { color: var(--accent); padding: 10px; }
[role='status'], [role='alert'] { padding: 16px 24px; text-align: center; color: var(--text-secondary); font-size: 14px; }
.retry-export { border: 0; background: var(--accent-soft); color: var(--accent); min-height: 44px; padding: 10px 16px; margin: 8px; border-radius: 22px; font: inherit; cursor: pointer; }
@media (max-width: 540px) { .result-page { padding-inline: 16px; } .result-header { padding-top: 16px; min-height: 58px; } }
@media (prefers-reduced-motion: reduce) { .btn-retake { transition: none; } }
</style>
