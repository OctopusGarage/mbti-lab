<template>
  <div class="result-card">
    <!-- Type reveal -->
    <div class="type-hero">
      <div class="type-letters">
        <span
          v-for="(letter, i) in typeLetters"
          :key="i"
          class="type-letter"
          :style="{ animationDelay: i * 0.15 + 's' }"
        >{{ letter }}</span>
      </div>
      <div class="type-nickname">{{ typeData.nickname[locale] }}</div>
      <div class="type-rarity">{{ $t('result.rarity') }} {{ typeData.rarity }}</div>
    </div>

    <!-- Description -->
    <div class="section cream-section">
      <h3 class="section-title serif">{{ $t('result.description') }}</h3>
      <p class="description serif">{{ typeData.description[locale] }}</p>
    </div>

    <!-- Visualization -->
    <div class="section viz-section">
      <DimensionBars :percents="percents" />
      <RadarChart :percents="percents" />
    </div>

    <!-- Details -->
    <div class="section cream-section">
      <div class="detail-block">
        <h4 class="detail-title">{{ $t('result.strengths') }}</h4>
        <div class="tags">
          <span v-for="s in typeData.strengths[locale]" :key="s" class="tag">{{ s }}</span>
        </div>
      </div>
      <div class="detail-block">
        <h4 class="detail-title">{{ $t('result.careers') }}</h4>
        <div class="tags">
          <span v-for="c in typeData.careers[locale]" :key="c" class="tag">{{ c }}</span>
        </div>
      </div>
      <div class="detail-block">
        <h4 class="detail-title">{{ $t('result.famous') }}</h4>
        <div class="tags">
          <span v-for="f in typeData.famous" :key="f" class="tag tag-gold">{{ f }}</span>
        </div>
      </div>
      <div class="detail-row">
        <div class="detail-block half">
          <h4 class="detail-title">{{ $t('result.bestMatch') }}</h4>
          <div class="tags">
            <span v-for="m in typeData.bestMatch" :key="m" class="tag tag-blue">{{ m }}</span>
          </div>
        </div>
        <div class="detail-block half">
          <h4 class="detail-title">{{ $t('result.cognitiveStack') }}</h4>
          <div class="cognitive">{{ typeData.cognitiveStack }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DimensionBars from './DimensionBars.vue'
import RadarChart from './RadarChart.vue'
import { types } from '../data/types.js'

const props = defineProps({ type: String, percents: Object })
const { locale } = useI18n()

const typeData = computed(() => types[props.type])
const typeLetters = computed(() => props.type?.split('') ?? [])
</script>

<style scoped>
.result-card { display: flex; flex-direction: column; gap: 0; }

/* Hero */
.type-hero {
  text-align: center;
  padding: 48px 24px 40px;
  background: linear-gradient(160deg, #1a1a2e, #2d3a8c);
  color: white;
}
.type-letters {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}
.type-letter {
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #e2c96e;
  opacity: 0;
  animation: letterReveal 0.4s forwards;
}
@keyframes letterReveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.type-nickname { font-size: 18px; color: rgba(255,255,255,0.85); margin-bottom: 8px; }
.type-rarity { font-size: 13px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }

/* Sections */
.section { padding: 28px 24px; }
.cream-section { background: var(--cream); }

.section-title {
  font-size: 14px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 12px;
}
.description {
  font-size: 15px;
  line-height: 1.85;
  color: var(--ink);
}
.serif { font-family: Georgia, 'Times New Roman', serif; }

/* Viz */
.viz-section {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 24px;
}

/* Details */
.detail-block { margin-bottom: 20px; }
.detail-block:last-child { margin-bottom: 0; }
.detail-title { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  padding: 5px 12px;
  background: white;
  border: 1px solid var(--cream-border);
  border-radius: 20px;
  font-size: 12px;
  color: var(--ink);
}
.tag-gold { background: #fef3d8; border-color: #e8c96e; color: #8a6000; }
.tag-blue { background: var(--blue-light); border-color: var(--blue-mid); color: var(--blue); font-weight: 700; }

.detail-row { display: flex; gap: 16px; }
.detail-block.half { flex: 1; }

.cognitive {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--blue-mid);
  letter-spacing: 1px;
  font-weight: 600;
}
</style>
