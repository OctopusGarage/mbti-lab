<template>
  <div ref="cardEl" class="share-card">
    <div class="sc-inner">
      <div class="sc-top">
        <div class="sc-site">MBTI Lab</div>
        <div class="sc-rarity">{{ typeData.rarity }}</div>
      </div>
      <div class="sc-type">{{ type }}</div>
      <div class="sc-nickname">{{ typeData.nickname[locale] }}</div>
      <div class="sc-desc">{{ typeData.description[locale] }}</div>
      <div class="sc-url">mbti-lab.github.io</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import { types } from '../data/types.js'

const props = defineProps({ type: String })
const { locale } = useI18n()
const cardEl = ref(null)

const typeData = computed(() => types[props.type] ?? {
  nickname: { zh: '', en: '' }, rarity: '', description: { zh: '', en: '' },
})

async function capture() {
  const canvas = await html2canvas(cardEl.value, { scale: 2, useCORS: true })
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
  position: absolute;
  left: -9999px;
  top: 0;
  width: 540px;
}
.sc-inner {
  width: 540px;
  height: 540px;
  background: linear-gradient(135deg, #1a1a2e, #2d3a8c);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: white;
}
.sc-top { display: flex; justify-content: space-between; align-items: center; }
.sc-site { font-size: 13px; letter-spacing: 2px; color: rgba(255,255,255,0.5); }
.sc-rarity { font-size: 12px; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; color: rgba(255,255,255,0.7); }
.sc-type { font-size: 72px; font-weight: 900; letter-spacing: 6px; color: #e2c96e; line-height: 1; }
.sc-nickname { font-size: 20px; color: rgba(255,255,255,0.8); margin-top: 6px; }
.sc-desc { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.6); margin-top: 16px; }
.sc-url { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
</style>
