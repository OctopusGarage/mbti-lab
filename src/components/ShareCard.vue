<template>
  <div ref="cardEl" class="share-card" :class="{ 'is-visible': visible }">
    <div class="sc-bg" :style="bgStyle">
      <div class="sc-orbit" aria-hidden="true" />
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
          <img class="sc-portrait" :src="portraitUrl" alt="" />
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

        <!-- footer with QR code -->
        <div class="sc-footer">
          <div class="sc-footer-copy"><div class="sc-editorial-note">
          <span class="sc-note-label">{{ $t('report.cardLabel') }}</span>
          <p>{{ $t('report.cardNote') }}</p>
        </div><span class="sc-url-label">{{ $t('share.scanLabel') }}</span></div>
          <img v-if="qrDataUrl" class="sc-qr" :src="qrDataUrl" :alt="$t('share.scanLabel')" />
          <button v-else-if="visible && qrError" class="sc-retry" @click="retryQr">{{ $t('share.retry') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { brandedQr } from '../utils/brandedQr.js'
import { getTypePresentation } from '../data/localizedContent.js'
import { APP_URL } from '../config.js'
import { getShareTheme } from '../utils/shareTheme.js'
import { getReport } from '../utils/report.js'

const props = defineProps({ type: String, visible: Boolean })
const { locale } = useI18n()
const cardEl = ref(null)
const qrDataUrl = ref('')
const qrError = ref(false)
function retryQr() { qrReady = null; qrError.value = false; prepareQr() }

let qrReady = null

function prepareQr() {
  if (!qrReady) {
    qrReady = brandedQr(APP_URL, 224).then((url) => {
      qrDataUrl.value = url
      return url
    })
    // A failed prefetch is reported by capture, not as an unhandled mount error.
    qrReady.catch(() => { qrError.value = true })
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
const bgStyle = computed(() => theme.value.bgStyle)
const portraitUrl = computed(() => `${import.meta.env.BASE_URL}portraits/${props.type}.webp`)
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
      clone.classList.remove('is-visible')
      clone.style.transform = 'none'
      clone.querySelectorAll('*').forEach(el => { el.style.animation = 'none' })
    },
  })
  return canvas.toDataURL('image/png')
}

defineExpose({ capture })
</script>

<style scoped>
.share-card { position: fixed; left: 0; top: 0; width: 540px; visibility: hidden; pointer-events: none; z-index: -1; }
.sc-bg { width: 540px; height: auto; position: relative; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.sc-body { position: relative; padding: 32px 40px; display: flex; flex-direction: column; color: #263442; box-sizing: border-box; }
.sc-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.sc-site-group { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.sc-site { font-size: 13px; font-weight: 600; letter-spacing: -.2px; color: #263442; }
.sc-brand { font-size: 10px; color: #60707b; }
.sc-hero { margin-bottom: 14px; }
.sc-type { font-size: 88px; font-weight: 700; letter-spacing: -3px; line-height: 1.05; }
.sc-nickname { font-size: 20px; color: #263442; margin-top: 4px; letter-spacing: -.4px; line-height: 1.5; }
.sc-desc { font-size: 13px; line-height: 1.65; color: #435361; margin-bottom: 16px; min-height: 0; overflow: hidden; overflow-wrap: anywhere; }
.sc-strengths { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; }
.sc-tag { font-size: 11px; line-height: 1.2; padding: 5px 10px; border-radius: 8px; border: 1px solid rgba(70,85,105,.14); background: rgba(255,255,255,.65); color: #344654; }
.sc-editorial-note { font-size: 11px; line-height: 1.55; color: #526471; margin-bottom: 16px; overflow-wrap: anywhere; }
.sc-note-label { display: block; color: #263442; font-weight: 600; margin-bottom: 4px; }
.sc-footer { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-top: 8px; border-top: 1px solid rgba(70,85,105,.16); }
.sc-url-label { max-width: 280px; font-size: 11px; line-height: 1.6; color: #526471; }
.sc-qr { width: 112px; height: 112px; flex-shrink: 0; border-radius: 0; }
.sc-introduction { font-size: 14px; line-height: 1.75; color: #344654; margin: 0 0 18px; overflow-wrap: anywhere; }

.sc-highlight { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.sc-highlight span { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.share-card.is-visible { position: relative; visibility: visible; pointer-events: auto; z-index: 0; }
.sc-hero { position: relative; min-height: 150px; padding-top: 10px; padding-right: 170px; }
.sc-type { font-size: 68px; }
.sc-nickname { font-size: 18px; }
.sc-portrait { position: absolute; right: -8px; top: -12px; width: 164px; height: 164px; object-fit: cover; border-radius: 28%; border: 5px solid rgba(255,255,255,.8); box-shadow: 0 12px 30px rgba(49,57,82,.14); }
.is-visible .sc-portrait { animation: portrait-float 6s ease-in-out infinite; }
@keyframes portrait-float { 50% { transform: translateY(-5px) rotate(1deg); } }
@media (prefers-reduced-motion: reduce) { .is-visible .sc-portrait { animation: none; } }
.sc-retry { border: 1px solid #ffffff55; border-radius: 12px; padding: 12px 20px; background: transparent; color: white; cursor: pointer; font: inherit; }
.sc-orbit { position: absolute; top: -100px; right: -130px; width: 460px; height: 460px; border: 1px solid rgba(255,255,255,.75); border-radius: 50%; }
.sc-orbit::after { content: ''; position: absolute; inset: 28px; border: 1px solid rgba(255,255,255,.55); border-radius: 50%; }
.sc-desc { border-radius: 16px; background: rgba(255,255,255,.28); }
.sc-tag { border-radius: 20px; }
.sc-retry { border-color: #526471; color: #344654; }
/* Content determines card height; short translations no longer stretch a blank panel. */
.sc-bg { font-family: 'Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif; }
.sc-body { padding: 28px 34px; }
.sc-topbar { margin-bottom: 20px; }
.sc-site { font-size: 12px; font-weight: 700; letter-spacing: 1px; }
.sc-brand { font-size: 9px; letter-spacing: .3px; }
.sc-hero { min-height: 148px; padding-top: 8px; padding-right: 166px; margin-bottom: 18px; }
.sc-type { font-family: 'Avenir Next', 'Trebuchet MS', sans-serif; font-size: 72px; font-weight: 800; letter-spacing: -3.5px; line-height: 1; }
.sc-nickname { font-family: 'Songti SC', 'Noto Serif CJK SC', 'Georgia', serif; font-size: 25px; font-weight: 600; letter-spacing: 1px; line-height: 1.35; margin-top: 10px; }
.sc-introduction { font-size: 14px; line-height: 1.75; font-weight: 500; margin-bottom: 16px; }
.sc-desc { flex: none; padding: 12px 16px; margin-bottom: 14px; background: rgba(255,255,255,.48); font-size: 13px; line-height: 1.6; }
.sc-highlight { margin-bottom: 6px; }
.sc-highlight:last-child { margin-bottom: 0; }
.sc-tag { font-size: 11px; font-weight: 500; padding: 6px 10px; }
.sc-strengths { margin-bottom: 18px; }
.sc-footer { align-items: center; padding-top: 16px; gap: 18px; }
.sc-footer-copy { flex: 1; min-width: 0; }
.sc-editorial-note { font-size: 10px; line-height: 1.65; margin-bottom: 10px; }
.sc-note-label { font-weight: 650; letter-spacing: .5px; }
.sc-url-label { font-size: 11px; font-weight: 600; }
</style>
