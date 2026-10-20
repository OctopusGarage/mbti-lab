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
.has-report {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
.export-preview {
  display: grid;
  gap: 16px;
  padding: 24px;
  text-align: center;
}
.export-preview img {
  max-width: 100%;
  height: auto;
  margin: auto;
}
[role='status'],
[role='alert'] {
  padding: 16px 24px;
  text-align: center;
}

.result-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  overflow-x: hidden;
}
.result-header {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}
.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 24px 48px;
  background: var(--cream);
}
.btn-share {
  padding: 14px 36px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-share:hover {
  background: var(--blue-mid);
}
.btn-retake {
  font-size: 13px;
  color: var(--ink-light);
  text-decoration: none;
}
.btn-retake:hover {
  color: var(--blue);
}
.no-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--ink-light);
}
</style>
