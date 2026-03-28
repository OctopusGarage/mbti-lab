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
          <span class="sc-site">MBTI Lab</span>
          <span class="sc-rarity-pill">全球占比 {{ typeData.rarity }}</span>
        </div>

        <!-- type + nickname -->
        <div class="sc-hero">
          <div class="sc-type" :style="{ color: accent }">{{ type }}</div>
          <div class="sc-nickname">{{ typeData.nickname[locale] }}</div>
        </div>

        <!-- description -->
        <div class="sc-desc">{{ typeData.description[locale] }}</div>

        <!-- strengths -->
        <div class="sc-strengths">
          <span
            v-for="s in typeData.strengths[locale].slice(0, 4)"
            :key="s"
            class="sc-tag"
          >{{ s }}</span>
        </div>

        <!-- bottom row -->
        <div class="sc-bottom">
          <div class="sc-stack">
            <span class="sc-stack-label">Cognitive Stack</span>
            <span class="sc-stack-value" :style="{ color: accent }">{{ typeData.cognitiveStack }}</span>
          </div>
          <div class="sc-match">
            <span class="sc-stack-label">Best Match</span>
            <span class="sc-stack-value" :style="{ color: accent }">{{ typeData.bestMatch.join(' · ') }}</span>
          </div>
        </div>

        <!-- footer with QR code -->
        <div class="sc-footer">
          <span class="sc-url-label">扫码测测你的</span>
          <img v-if="qrDataUrl" class="sc-qr" :src="qrDataUrl" alt="QR" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { types } from '../data/types.js'

const props = defineProps({ type: String })
const { locale } = useI18n()
const cardEl = ref(null)
const qrDataUrl = ref('')

const APP_URL = 'https://octopusgarage.github.io/mbti-lab'

let qrReady = null

onMounted(async () => {
  qrReady = QRCode.toDataURL(APP_URL, { width: 88, margin: 1, color: { dark: '#ffffff', light: '#00000000' } })
  qrDataUrl.value = await qrReady
})

const typeData = computed(() => types[props.type] ?? {
  nickname: { zh: '', en: '' }, rarity: '', description: { zh: '', en: '' },
  strengths: { zh: [], en: [] }, cognitiveStack: '', bestMatch: [],
})

const bgStyle = computed(() => {
  const c = COLORS[props.type] ?? ['#1a1a2e', '#302b63', '#24243e']
  return { background: `linear-gradient(145deg, ${c[0]}, ${c[1]}, ${c[2]})` }
})
const accent = computed(() => accentColors[props.type] ?? '#e2c96e')

const COLORS = {
  INTJ: ['#0f0c29', '#302b63', '#24243e'],
  INTP: ['#141e30', '#243b55', '#1a2a3a'],
  ENTJ: ['#1a0533', '#3b0066', '#5c1080'],
  ENTP: ['#0f2027', '#203a43', '#2c5364'],
  INFJ: ['#1a1a2e', '#16213e', '#0f3460'],
  INFP: ['#1e0038', '#3a0068', '#240050'],
  ENFJ: ['#0d2137', '#1a3a5c', '#2a5a8c'],
  ENFP: ['#1a0030', '#3d0060', '#6a0090'],
  ISTJ: ['#0a1628', '#162540', '#1e3a5a'],
  ISFJ: ['#1a0a28', '#3d1a50', '#5a2870'],
  ESTJ: ['#0a1e0a', '#1a3a1a', '#2a5a2a'],
  ESFJ: ['#1e0a1a', '#40183a', '#5a2050'],
  ISTP: ['#0a0a1e', '#1a1a40', '#2a2a60'],
  ISFP: ['#1e0a12', '#3a1228', '#5a1e3e'],
  ESTP: ['#1e0a00', '#3a1800', '#5a2800'],
  ESFP: ['#1e0012', '#3a0025', '#5a003a'],
}

const accentColors = {
  INTJ: '#c8a8ff', INTP: '#88ccff', ENTJ: '#e0a0ff', ENTP: '#80e8ff',
  INFJ: '#e2c96e', INFP: '#d4a8ff', ENFJ: '#88d8ff', ENFP: '#e0a8ff',
  ISTJ: '#88d8a0', ISFJ: '#d8a8e0', ESTJ: '#a8e0a8', ESFJ: '#e0a8d0',
  ISTP: '#a8c8ff', ISFP: '#ffa8c8', ESTP: '#ffc888', ESFP: '#ffa8e0',
}

async function capture() {
  if (qrReady) await qrReady  // ensure QR is rendered before capture
  const canvas = await html2canvas(cardEl.value, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  })
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `mbti-${props.type}.png`
  a.click()
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
  width: 320px; height: 320px;
  top: -80px; right: -80px;
}
.c2 {
  width: 200px; height: 200px;
  background: white;
  bottom: -60px; left: -40px;
}
.c3 {
  width: 100px; height: 100px;
  bottom: 120px; right: 60px;
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
.sc-site {
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  font-weight: 600;
}
.sc-rarity-pill {
  font-size: 11px;
  padding: 4px 14px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.5px;
}

.sc-hero { margin-bottom: 16px; }
.sc-type {
  font-size: 80px;
  font-weight: 900;
  letter-spacing: 6px;
  line-height: 1;
}
.sc-nickname {
  font-size: 18px;
  color: rgba(255,255,255,0.75);
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.sc-desc {
  font-size: 12.5px;
  line-height: 1.7;
  color: rgba(255,255,255,0.55);
  margin-bottom: 20px;
  flex: 1;
}

.sc-strengths {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.sc-tag {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.3px;
}

.sc-bottom {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}
.sc-stack, .sc-match { display: flex; flex-direction: column; gap: 3px; }
.sc-stack-label {
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.sc-stack-value {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
}

.sc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sc-url-label {
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 1px;
}
.sc-qr {
  width: 44px;
  height: 44px;
  border-radius: 4px;
}
</style>
