<template>
  <div class="types-page">
    <header class="types-header">
      <router-link to="/" class="back-btn">← {{ locale === 'zh' ? '返回首页' : 'Home' }}</router-link>
      <h1 class="page-title">{{ locale === 'zh' ? '16 种人格类型' : '16 Personality Types' }}</h1>
      <LangToggle />
    </header>

    <!-- type grid -->
    <div v-if="!selected" class="grid-wrap">
      <div
        v-for="group in groups"
        :key="group.label"
        class="group"
      >
        <div class="group-label">{{ group.label }}</div>
        <div class="type-grid">
          <button
            v-for="t in group.types"
            :key="t"
            class="type-chip"
            :style="{ '--accent': groupColor(group.label) }"
            @click="selected = t"
          >
            <span class="chip-code">{{ t }}</span>
            <span class="chip-nick">{{ types[t].nickname[locale] }}</span>
            <span class="chip-rarity">{{ types[t].rarity }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- detail view -->
    <div v-else class="detail-wrap">
      <button class="detail-back" @click="selected = null">
        ← {{ locale === 'zh' ? '返回列表' : 'All types' }}
      </button>
      <ResultCard :type="selected" :percents="mockPercents(selected)" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LangToggle from '../components/LangToggle.vue'
import ResultCard from '../components/ResultCard.vue'
import { types } from '../data/types.js'

const { locale } = useI18n()
const selected = ref(null)

const groups = [
  { label: 'Analysts',   types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { label: 'Diplomats',  types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { label: 'Sentinels',  types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { label: 'Explorers',  types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] },
]

const GROUP_COLORS = {
  Analysts:  '#5c6bc0',
  Diplomats: '#4caf90',
  Sentinels: '#e08000',
  Explorers: '#c0405c',
}

function groupColor(label) { return GROUP_COLORS[label] ?? '#5c6bc0' }

// Generate representative percents so the bars/radar look sensible
function mockPercents(type) {
  const map = {
    E: 65, I: 65, N: 65, S: 65, F: 65, T: 65, J: 65, P: 65,
  }
  const opp = { E:'I', I:'E', N:'S', S:'N', F:'T', T:'F', J:'P', P:'J' }
  const dims = { EI: ['E','I'], NS: ['N','S'], FT: ['F','T'], JP: ['J','P'] }
  const result = {}
  for (const [dim, [a, b]] of Object.entries(dims)) {
    const dominant = type.includes(a) ? a : b
    const other = opp[dominant]
    result[dim] = {
      [dominant]: map[dominant],
      [other]: 100 - map[dominant],
    }
  }
  return result
}
</script>

<style scoped>
.types-page {
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.types-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 1px 0 var(--blue-light);
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  font-size: 13px;
  color: var(--ink-light);
  text-decoration: none;
  white-space: nowrap;
}
.back-btn:hover { color: var(--blue); }
.page-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

/* Grid */
.grid-wrap {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}
.group-label {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ink-light);
  margin-bottom: 10px;
  font-weight: 600;
}
.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.type-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px 18px;
  background: white;
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  box-shadow: var(--shadow);
  transition: all 0.15s;
}
.type-chip:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.chip-code {
  font-size: 22px;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 2px;
}
.chip-nick {
  font-size: 13px;
  color: var(--ink);
  font-weight: 500;
}
.chip-rarity {
  font-size: 11px;
  color: var(--ink-light);
}

/* Detail */
.detail-wrap {
  display: flex;
  flex-direction: column;
}
.detail-back {
  background: none;
  border: none;
  padding: 16px 24px;
  font-size: 14px;
  color: var(--ink-light);
  cursor: pointer;
  text-align: left;
}
.detail-back:hover { color: var(--blue); }
</style>
