<template>
  <Teleport to="body">
    <div class="sp-overlay" @click.self="$emit('close')">
      <div
        ref="sheet"
        class="sp-sheet"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('share.shareApp')"
      >
        <button
          class="sp-close"
          :aria-label="$t('share.close')"
          @click="$emit('close')"
        >
          ×
        </button>
        <div class="sp-handle" />
        <div v-if="failedText">
          <p role="status">{{ $t('share.copyFallback') }}</p>
          <textarea
            ref="manualLink"
            :value="failedText"
            readonly
            :aria-label="$t('share.copyFallback')"
            @focus="$event.target.select()"
          />
        </div>

        <template v-if="type">
          <div class="sp-label" data-section="result">
            {{ $t(personal ? 'share.shareResult' : 'share.shareType') }}
          </div>
          <section
            class="caption-preview"
            :aria-label="$t('share.captionPreview')"
          >
            <p class="share-text-preview">{{ resultText }}</p>
            <button
              class="sp-btn"
              data-action="copy-result"
              @click="copyResult"
            >
              {{
                copied === 'result'
                  ? $t('share.copied')
                  : $t('share.copyResult')
              }}
            </button>
          </section>
          <div class="sp-row">
            <button
              class="sp-btn"
              data-action="share-result-x"
              @click="shareResultToX"
            >
              <span class="sp-icon-x">𝕏</span>
              {{ $t('share.shareToX') }}
            </button>
            <button
              v-if="onSaveImage"
              class="sp-btn"
              data-action="save-image"
              @click="saveImage"
            >
              <span class="sp-icon-save">↓</span>
              {{ $t('share.saveImage') }}
            </button>
          </div>
          <div class="sp-divider" />
        </template>

        <div class="sp-label" data-section="app">
          {{ $t('share.shareApp') }}
        </div>
        <div class="sp-row">
          <button class="sp-btn" data-action="share-app-x" @click="shareAppToX">
            <span class="sp-icon-x">𝕏</span>
            {{ $t('share.shareToX') }}
          </button>
          <button class="sp-btn" data-action="copy-link" @click="copyLink">
            <span class="sp-icon-link">🔗</span>
            {{ copied === 'link' ? $t('share.copied') : $t('share.copyLink') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { APP_URL, typeShareUrl } from '../config.js'

const props = defineProps({
  type: { type: String, default: null },
  personal: { type: Boolean, default: true },
  onSaveImage: { type: Function, default: null },
})
const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const copied = ref('')
const failedText = ref('')
const manualLink = ref(null)
const sheet = ref(null)
const resultText = computed(() =>
  props.type
    ? t(props.personal ? 'share.xTextResult' : 'share.xTextType', {
        type: props.type,
        url: typeShareUrl(props.type),
      })
    : '',
)
let revision = 0
let previousFocus, previousOverflow
const backgroundState = new Map()

let copyTimer = null

function shareResultToX() {
  const text = resultText.value
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    '_blank',
  )
}

function shareAppToX() {
  const text = t('share.xTextApp', { url: APP_URL })
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    '_blank',
  )
}

function resetCopy() {
  revision++
  clearTimeout(copyTimer)
  copied.value = ''
  failedText.value = ''
}
watch([() => props.type, () => props.personal, locale], resetCopy)
async function copyText(text, action) {
  resetCopy()
  const currentRevision = revision
  try {
    await navigator.clipboard.writeText(text)
    if (revision !== currentRevision) return
    copied.value = action
    copyTimer = setTimeout(() => {
      copied.value = ''
    }, 2000)
  } catch {
    if (revision !== currentRevision) return
    failedText.value = text
    await nextTick()
    manualLink.value?.focus()
    manualLink.value?.select()
  }
}
function copyLink() {
  return copyText(APP_URL, 'link')
}
function copyResult() {
  return copyText(resultText.value, 'result')
}

function handleKeydown(e) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'Tab') {
    const controls = [
      ...sheet.value.querySelectorAll('button, textarea'),
    ].filter((element) => !element.disabled)
    const first = controls[0],
      last = controls.at(-1)
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }
}

onMounted(() => {
  previousFocus = document.activeElement
  previousOverflow = document.body.style.overflow
  for (const element of document.body.children) {
    if (!element.contains(sheet.value)) {
      backgroundState.set(element, element.inert)
      element.inert = true
    }
  }
  document.body.style.overflow = 'hidden'
  sheet.value.querySelector('button')?.focus()
  document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  resetCopy()
  document.body.style.overflow = previousOverflow
  for (const [element, inert] of backgroundState) element.inert = inert
  backgroundState.clear()
  previousFocus?.focus?.()
})

function saveImage() {
  props.onSaveImage?.()
  emit('close')
}
</script>

<style scoped>
.caption-preview {
  display: grid;
  gap: 12px;
  margin: 12px 0;
}
.share-text-preview {
  padding: 12px;
  border-radius: 12px;
  background: var(--cream);
  color: var(--ink);
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.sp-sheet {
  position: relative;
  max-height: 90dvh;
  overflow-y: auto;
}
.sp-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: white;
  font-size: 26px;
  cursor: pointer;
}
textarea {
  width: 100%;
  min-height: 70px;
  margin: 12px 0;
  font: inherit;
}

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
  padding: 16px 20px calc(40px + env(safe-area-inset-bottom));
  animation: slide-up 0.25s ease;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
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
.sp-btn:hover {
  background: #ebebeb;
}

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
