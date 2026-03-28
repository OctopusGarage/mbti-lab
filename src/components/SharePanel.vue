<template>
  <Teleport to="body">
  <div class="sp-overlay" @click.self="$emit('close')">
    <div class="sp-sheet" role="dialog" aria-modal="true">
      <div class="sp-handle" />

      <template v-if="type">
        <div class="sp-label" data-section="result">{{ $t('share.shareResult') }}</div>
        <div class="sp-row">
          <button class="sp-btn" data-action="share-result-x" @click="shareResultToX">
            <span class="sp-icon-x">𝕏</span>
            {{ $t('share.shareToX') }}
          </button>
          <button class="sp-btn" data-action="save-image" @click="saveImage">
            <span class="sp-icon-save">↓</span>
            {{ $t('share.saveImage') }}
          </button>
        </div>
        <div class="sp-divider" />
      </template>

      <div class="sp-label" data-section="app">{{ $t('share.shareApp') }}</div>
      <div class="sp-row">
        <button class="sp-btn" data-action="share-app-x" @click="shareAppToX">
          <span class="sp-icon-x">𝕏</span>
          {{ $t('share.shareToX') }}
        </button>
        <button class="sp-btn" data-action="copy-link" @click="copyLink">
          <span class="sp-icon-link">🔗</span>
          {{ copied ? $t('share.copied') : $t('share.copyLink') }}
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { APP_URL } from '../config.js'

const props = defineProps({
  type: { type: String, default: null },
  onSaveImage: { type: Function, default: null },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const copied = ref(false)

let copyTimer = null

function shareResultToX() {
  const text = t('share.xTextResult', { type: props.type })
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
}

function shareAppToX() {
  const text = t('share.xTextApp')
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(APP_URL)
    copied.value = true
    copyTimer = setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard permission denied or insecure context
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => { document.addEventListener('keydown', handleKeydown) })
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearTimeout(copyTimer)
})

function saveImage() {
  props.onSaveImage?.()
  emit('close')
}
</script>

<style scoped>
.sp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sp-sheet {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 16px 20px 40px;
  animation: slide-up 0.25s ease;
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sp-handle {
  width: 36px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 0 auto 20px;
}

.sp-label {
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 10px;
}

.sp-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0;
}

.sp-row {
  display: flex;
  gap: 10px;
}

.sp-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  cursor: pointer;
  transition: background 0.15s;
}
.sp-btn:hover { background: #ebebeb; }

.sp-icon-x {
  width: 28px;
  height: 28px;
  background: #000;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}

.sp-icon-save,
.sp-icon-link {
  width: 28px;
  height: 28px;
  background: #e0e8ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
</style>
