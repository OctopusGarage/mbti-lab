<template>
  <div ref="cardEl" class="share-card">
    <div class="sc-bg" :style="bgStyle">
      <!-- decorative circles -->
      <div class="circle c1" :style="{ background: accent }" />
      <div class="circle c2" />
      <div class="circle c3" :style="{ background: accent }" />

      <div class="sc-body">
        <!-- top bar -->
        <div class="sc-topbar">
          <div class="sc-site-group">
            <span class="sc-site">MBTI Lab</span>
            <span class="sc-brand">🐙 OctopusGarage</span>
          </div>
        </div>

        <!-- type + nickname -->
        <div class="sc-hero">
          <div class="sc-type" :style="{ color: accent }">{{ type }}</div>
          <div class="sc-nickname">{{ typeData.nickname[locale] }}</div>
        </div>

        <!-- description -->
        <div class="sc-desc">{{ highlights.join(' · ') }}</div>

        <!-- strengths -->
        <div class="sc-strengths">
          <span
            v-for="s in typeData.strengths[locale].slice(0, 4)"
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
import { types } from '../data/types.js'
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
      width: 160,
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
    types[props.type] ?? {
      nickname: { zh: '', en: '' },
      strengths: { zh: [], en: [] },
    },
)

const highlights = computed(
  () => getReport(props.type, locale.value)?.highlights ?? [],
)

const theme = computed(() => getShareTheme(props.type))
const bgStyle = computed(() => theme.value.bgStyle)
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
    '.sc-body, .sc-desc, .sc-nickname, .sc-strengths, .sc-editorial-note',
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
.share-card {
  position: fixed;
  left: 0;
  top: 0;
  width: 540px;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
}

.sc-bg {
  width: 540px;
  height: 540px;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}
.c1 {
  width: 320px;
  height: 320px;
  top: -80px;
  right: -80px;
}
.c2 {
  width: 200px;
  height: 200px;
  background: white;
  bottom: -60px;
  left: -40px;
}
.c3 {
  width: 100px;
  height: 100px;
  bottom: 120px;
  right: 60px;
  opacity: 0.08;
}

.sc-body {
  position: relative;
  z-index: 1;
  padding: 36px 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  color: white;
  box-sizing: border-box;
}

.sc-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.sc-site-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sc-site {
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
}
.sc-brand {
  font-size: 9px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.25);
}
.sc-hero {
  margin-bottom: 16px;
}
.sc-type {
  font-size: 80px;
  font-weight: 900;
  letter-spacing: 6px;
  line-height: 1;
}
.sc-nickname {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.sc-desc {
  font-size: 12.5px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.sc-strengths {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.sc-tag {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.3px;
}

.sc-editorial-note {
  font-size: 11px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 18px;
  overflow-wrap: anywhere;
}
.sc-note-label {
  display: block;
  color: #e2c96e;
  font-weight: 700;
  margin-bottom: 4px;
}

.sc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sc-url-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 1px;
}
.sc-qr {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}
</style>
