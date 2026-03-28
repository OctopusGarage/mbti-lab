<template>
  <div class="result-page">
    <header class="result-header">
      <LangToggle />
    </header>

    <template v-if="result">
      <ResultCard :type="result.type" :percents="result.percents" />

      <div class="actions">
        <button class="btn-share" @click="onShare">{{ $t('result.shareBtn') }}</button>
        <router-link to="/" class="btn-retake">{{ $t('result.retake') }}</router-link>
      </div>

      <ShareCard ref="shareCardRef" :type="result.type" />
    </template>

    <div v-else class="no-result">
      <p>No result found.</p>
      <router-link to="/">← Back to home</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LangToggle from '../components/LangToggle.vue'
import ResultCard from '../components/ResultCard.vue'
import ShareCard from '../components/ShareCard.vue'
import { useHistory } from '../composables/useHistory.js'

const { loadResult } = useHistory()
const result = ref(null)
const shareCardRef = ref(null)

onMounted(() => {
  // prefer fresh result from sessionStorage; fall back to localStorage
  const fresh = sessionStorage.getItem('mbti_result')
  if (fresh) {
    try { result.value = JSON.parse(fresh) } catch { /* ignore */ }
  }
  if (!result.value) result.value = loadResult()
})

async function onShare() {
  await shareCardRef.value?.capture()
}
</script>

<style scoped>
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
.btn-share:hover { background: var(--blue-mid); }
.btn-retake {
  font-size: 13px;
  color: var(--ink-light);
  text-decoration: none;
}
.btn-retake:hover { color: var(--blue); }
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
