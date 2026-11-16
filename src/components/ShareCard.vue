<template>
  <div ref="cardEl" class="share-card">
    <div class="sc-bg" :style="bgStyle">
      <div class="sc-body">
        <!-- top bar -->
        <div class="sc-topbar">
          <div class="sc-site-group">
            <span class="sc-site">MBTI Lab</span>
            <span class="sc-brand">OctopusGarage</span>
          </div>
        </div>

        <!-- type + nickname -->
        <div class="sc-hero">
          <div class="sc-type" :style="{ color: accent }">{{ type }}</div>
          <div class="sc-nickname">{{ typeData.nickname }}</div>
        </div>

        <!-- description -->
        <p class="sc-introduction">{{ introduction }}</p>
        <div class="sc-desc"><div v-for="highlight in highlights" :key="highlight" class="sc-highlight"><span :style="{ background: accent }" />{{ highlight }}</div></div>

        <!-- strengths -->
        <div class="sc-strengths">
          <span
            v-for="s in typeData.strengths.slice(0, 4)"
            :key="s"
            class="sc-tag"
            >{{ s }}</span
          >
        </div>

        <div class="sc-editorial-note">
          <span class="sc-note-label">{{ $t('report.cardLabel') }}</span>
          <p>{{ $t('report.cardNote') }}</p>
        </div>

        <!-- footer with QR code -->
        <div class="sc-footer">
          <span class="sc-url-label">{{ $t('share.scanLabel') }}</span>
          <img v-if="qrDataUrl" class="sc-qr" :src="qrDataUrl" alt="QR" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { getTypePresentation } from '../data/localizedContent.js'
import { APP_URL } from '../config.js'
import { getShareTheme } from '../utils/shareTheme.js'
import { getReport } from '../utils/report.js'

const props = defineProps({ type: String })
const { locale } = useI18n()
const cardEl = ref(null)
const qrDataUrl = ref('')

let qrReady = null

function prepareQr() {
  if (!qrReady) {
    qrReady = QRCode.toDataURL(APP_URL, {
      width: 224,
      margin: 4,
      color: { dark: '#111111', light: '#ffffff' },
    }).then((url) => {
      qrDataUrl.value = url
      return url
    })
    // A failed prefetch is reported by capture, not as an unhandled mount error.
    qrReady.catch(() => {})
  }
  return qrReady
}
onMounted(() => {
  prepareQr()
})

const typeData = computed(
  () =>
    getTypePresentation(props.type, locale.value) ?? {
      nickname: '',
      strengths: [],
    },
)

const introduction = computed(() => {
  const core = getReport(props.type, locale.value)?.sections[0]?.text ?? ''
  return (core.match(/[^.!?。！？]+[.!?。！？]+(?:[”’"])?|[^.!?。！？]+$/gu) ?? [core]).slice(0, 1).join('').trim()
})
const highlights = computed(
  () => getReport(props.type, locale.value)?.highlights ?? [],
)

const theme = computed(() => getShareTheme(props.type))
const bgStyle = computed(() => ({ background: '#17191f' }))
const accent = computed(() => theme.value.accent)

async function capture() {
  try {
    await prepareQr()
  } catch (error) {
    qrReady = null
    throw error
  }
  await nextTick()
  await document.fonts?.ready
  await Promise.all(
    Array.from(cardEl.value.querySelectorAll('img')).map((img) =>
      img.decode?.(),
    ),
  )
  // Fonts and images can change layout. Reject overflow after they settle so
  // translations cannot silently produce clipped PNGs.
  const card = cardEl.value
  for (const element of card.querySelectorAll(
    '.sc-body, .sc-introduction, .sc-desc, .sc-nickname, .sc-strengths, .sc-editorial-note',
  )) {
    if (
      element.scrollHeight > element.clientHeight + 1 ||
      element.scrollWidth > element.clientWidth + 1
    ) {
      throw new Error('Card content does not fit')
    }
  }
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(cardEl.value, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    onclone(_doc, clone) {
      clone.style.visibility = 'visible'
      clone.style.zIndex = '0'
    },
  })
  return canvas.toDataURL('image/png')
}

defineExpose({ capture })
</script>

<style scoped>
.share-card { position: fixed; left: 0; top: 0; width: 540px; visibility: hidden; pointer-events: none; z-index: -1; }
.sc-bg { width: 540px; height: 720px; position: relative; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.sc-body { position: relative; padding: 32px 40px; height: 100%; display: flex; flex-direction: column; color: #f5f5f7; box-sizing: border-box; }
.sc-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.sc-site-group { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.sc-site { font-size: 13px; font-weight: 600; letter-spacing: -.2px; color: #f5f5f7; }
.sc-brand { font-size: 10px; color: #a5a8b2; }
.sc-hero { margin-bottom: 14px; }
.sc-type { font-size: 88px; font-weight: 700; letter-spacing: -3px; line-height: 1.05; }
.sc-nickname { font-size: 20px; color: #f5f5f7; margin-top: 4px; letter-spacing: -.4px; line-height: 1.5; }
.sc-desc { font-size: 13px; line-height: 1.65; color: #c5c7ce; margin-bottom: 16px; flex: 1; min-height: 0; overflow: hidden; overflow-wrap: anywhere; }
.sc-strengths { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; }
.sc-tag { font-size: 11px; line-height: 1.2; padding: 5px 10px; border-radius: 8px; border: 1px solid #41434b; background: #23252c; color: #e1e2e7; }
.sc-editorial-note { font-size: 11px; line-height: 1.55; color: #b5b8c2; margin-bottom: 16px; overflow-wrap: anywhere; }
.sc-note-label { display: block; color: #f5f5f7; font-weight: 600; margin-bottom: 4px; }
.sc-footer { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-top: 8px; border-top: 1px solid #363840; }
.sc-url-label { max-width: 280px; font-size: 11px; line-height: 1.6; color: #b5b8c2; }
.sc-qr { width: 112px; height: 112px; flex-shrink: 0; border-radius: 0; }
.sc-introduction { font-size: 14px; line-height: 1.75; color: #e1e2e7; margin: 0 0 18px; overflow-wrap: anywhere; }
.sc-desc { flex: 1; }
.sc-highlight { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.sc-highlight span { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
</style>
