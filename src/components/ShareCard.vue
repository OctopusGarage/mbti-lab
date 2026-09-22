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
          <span class="sc-url-label">{{ $t('share.scanLabel') }}</span>
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
import { APP_URL } from '../config.js'
import { getShareTheme } from '../utils/shareTheme.js'

const props = defineProps({ type: String })
const { locale } = useI18n()
const cardEl = ref(null)
const qrDataUrl = ref('')

let qrReady = null

onMounted(async () => {
  qrReady = QRCode.toDataURL(APP_URL, { width: 88, margin: 1, color: { dark: '#ffffff', light: '#00000000' } })
  qrDataUrl.value = await qrReady
})

const typeData = computed(() => types[props.type] ?? {
  nickname: { zh: '', en: '' }, rarity: '', description: { zh: '', en: '' },
  strengths: { zh: [], en: [] }, cognitiveStack: '', bestMatch: [],
})

const theme = computed(() => getShareTheme(props.type))
const bgStyle = computed(() => theme.value.bgStyle)
const accent = computed(() => theme.value.accent)

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
.sc-site-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sc-site {
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  font-weight: 600;
}
.sc-brand {
  font-size: 9px;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.25);
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
