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
      <div v-if="image" ref="preview" class="export-preview" tabindex="-1" :aria-label="$t('share.shareResult')">
        <h2>{{ $t('share.shareResult') }}</h2>
        <p>{{ $t('share.imageHint') }}</p>
        <img :src="image" :alt="result.type" />
        <button v-if="canShareImage" class="native-result" :disabled="sharing" @click="shareImage">{{ t('share.shareCard') }}</button>
        <p v-if="shareFailed" role="status">{{ t('share.nativeError') }}</p>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import LangToggle from '../components/LangToggle.vue'
import ResultCard from '../components/ResultCard.vue'
import ShareCard from '../components/ShareCard.vue'
import SharePanel from '../components/SharePanel.vue'
import { useResultStore } from '../composables/useResultStore.js'
import ReportDock from '../components/ReportDock.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import shareMessages from '../i18n/shareMessages.js'

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
const preview = ref(null)
const canShareImage = ref(false), sharing = ref(false), shareFailed = ref(false)
let imageFile = null
async function shareImage() {
  if (sharing.value || !imageFile) return
  sharing.value = true; shareFailed.value = false
  try { await navigator.share({ title: `MBTI · ${result.value.type}`, files: [imageFile] }) }
  catch (error) { if (error?.name !== 'AbortError') shareFailed.value = true }
  finally { sharing.value = false }
}
const { t, locale } = useI18n({ useScope: 'local', messages: shareMessages, missingWarn: false, fallbackWarn: false })
const unsaved = ref(false)
let revision = 0
watch(locale, () => {
  revision++
  image.value = ''
  imageFile = null; canShareImage.value = false; shareFailed.value = false
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
  imageFile = null; canShareImage.value = false; shareFailed.value = false
  const currentRevision = revision
  try {
    const output = await shareCardRef.value.capture()
    if (revision === currentRevision) {
      image.value = output
      try {
        const bytes = Uint8Array.from(atob(output.split(',')[1]), c => c.charCodeAt(0))
        imageFile = new File([bytes], `mbti-${result.value.type}.png`, { type: 'image/png' })
        canShareImage.value = typeof navigator.share === 'function' && !!navigator.canShare?.({ files: [imageFile] })
      } catch { canShareImage.value = false }
      await nextTick()
      preview.value?.focus({ preventScroll: true })
      preview.value?.scrollIntoView?.({ behavior: 'instant', block: 'start' })
    }
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
.result-page { min-height: var(--page-min-height); padding: 0 24px; display: flex; flex-direction: column; background: var(--canvas); position: relative; }
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
.export-preview { scroll-margin-top: 24px; }
.export-preview h2 { font-size: 22px; letter-spacing: -.5px; }
.native-result { min-height: 48px; padding: 12px 20px; border: 0; border-radius: 16px; background: var(--accent); color: white; font: inherit; cursor: pointer; }
.native-result:disabled { opacity: .5; cursor: wait; }
</style>
