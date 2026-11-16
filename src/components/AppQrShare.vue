<template>
  <section class="qr-share" :aria-label="t('share.qrTitle')">
    <button v-if="nativeAvailable" class="qr-action" data-action="native-link" :disabled="sharing" @click="share(false)">{{ t('share.nativeShare') }}</button>
    <h3>{{ t('share.qrTitle') }}</h3>
    <p v-if="loading" role="status">{{ t('share.generating') }}</p>
    <template v-else-if="failed">
      <p role="status">{{ t('share.imageError') }}</p>
      <button class="qr-action" data-action="retry-qr" @click="prepare">{{ t('share.retry') }}</button>
    </template>
    <template v-else-if="source">
      <img :src="source" width="720" height="920" :alt="t('share.scanLabel')" />
      <div class="qr-actions">
        <a class="qr-action" :href="source" download="mbti-lab-share.png">{{ t('share.download') }}</a>
        <button v-if="fileSupported" class="qr-action" :disabled="sharing" @click="share(true)">{{ t('share.shareCard') }}</button>
      </div>
      <p>{{ t('share.qrHelp') }}</p>
    </template>
    <p v-if="shareError" data-share-error role="status">{{ t('share.nativeError') }}</p>
  </section>
</template>
<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import shareMessages from '../i18n/shareMessages.js'
import { APP_URL } from '../config.js'
const { t, locale } = useI18n({ useScope: 'local', messages: shareMessages, missingWarn: false, fallbackWarn: false })
const source = ref(''), loading = ref(false), failed = ref(false), sharing = ref(false), shareError = ref(false), fileSupported = ref(false)
const nativeAvailable = typeof navigator.share === 'function'
let file, revision = 0, alive = true
async function prepare() {
  const current = ++revision
  source.value = ''; file = null; fileSupported.value = false
  loading.value = true; failed.value = false; shareError.value = false
  const label = t('share.scanLabel')
  try {
    const { renderAppCard } = await import('../utils/appShareCard.js')
    const data = await renderAppCard({ url: APP_URL, label })
    if (!alive || current !== revision) return
    source.value = data
    const bytes = Uint8Array.from(atob(data.split(',')[1]), c => c.charCodeAt(0))
    file = new File([bytes], 'mbti-lab-share.png', { type: 'image/png' })
    try { fileSupported.value = nativeAvailable && !!navigator.canShare?.({ files: [file] }) } catch { fileSupported.value = false }
  } catch {
    if (alive && current === revision) failed.value = true
  } finally {
    if (alive && current === revision) loading.value = false
  }
}
async function share(image) {
  if (sharing.value) return
  sharing.value = true; shareError.value = false
  try {
    // Pre-generated files preserve the browser's click activation requirement.
    await navigator.share(image ? { title: 'MBTI Lab', files: [file] } : { title: 'MBTI Lab', url: APP_URL })
  } catch (error) {
    if (alive && error?.name !== 'AbortError') shareError.value = true
  } finally { if (alive) sharing.value = false }
}
watch(locale, prepare, { immediate: true })
onUnmounted(() => { alive = false; revision++ })
</script>
<style scoped>
.qr-share { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--line); }
h3 { font-size: 17px; margin: 20px 0 14px; }
img { display: block; width: 100%; max-width: 280px; height: auto; margin: 0 auto 16px; border: 1px solid var(--line); border-radius: 18px; }
.qr-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.qr-action { display: flex; justify-content: center; align-items: center; flex: 1; min-height: 48px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); color: var(--accent); font: inherit; font-size: 14px; text-align: center; text-decoration: none; cursor: pointer; }
.qr-action:disabled { opacity: .5; cursor: wait; }
p { margin-top: 12px; color: var(--text-secondary); font-size: 13px; line-height: 1.65; }
</style>
