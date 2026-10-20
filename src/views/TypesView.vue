<template>
  <div class="types-page" :class="{ 'has-report': selected }">
    <header class="types-header">
      <router-link to="/" class="back-btn"
        >← {{ $t('types.backHome') }}</router-link
      >
      <h1 class="page-title">{{ $t('types.title') }}</h1>
      <LangToggle />
    </header>

    <!-- type grid -->
    <div v-if="!selected" class="grid-wrap">
      <label class="search-label"
        >{{ $t('types.search') }}
        <input
          v-model="search"
          type="search"
          :placeholder="$t('types.searchHint')"
        />
      </label>
      <p v-if="invalidType" role="status">{{ $t('types.invalidType') }}</p>
      <p v-if="!filteredGroups.length" role="status">
        {{ $t('types.noMatches') }}
      </p>
      <div v-for="group in filteredGroups" :key="group.label" class="group">
        <div class="group-label">{{ $t('types.groups.' + group.label) }}</div>
        <div class="type-grid">
          <button
            v-for="t in group.types"
            :key="t"
            class="type-chip"
            :style="{ '--accent': groupColor(group.label) }"
            :data-type="t"
            @click="select(t)"
          >
            <span class="chip-code">{{ t }}</span>
            <span class="chip-nick">{{ presentation(t)?.nickname }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- detail view -->
    <div v-else class="detail-wrap">
      <button class="detail-back" @click="select(null)">
        ← {{ $t('types.backToList') }}
      </button>
      <ResultCard
        ref="reader"
        :key="selected"
        :type="selected"
        @neighbor="select"
      />
      <ReportDock @contents="reader?.contents?.()" @share="showPanel = true" />
      <SharePanel
        v-if="showPanel"
        :type="selected"
        :personal="false"
        @close="showPanel = false"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, nextTick, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LangToggle from '../components/LangToggle.vue'
import ReportDock from '../components/ReportDock.vue'
import SharePanel from '../components/SharePanel.vue'
import ResultCard from '../components/ResultCard.vue'
import { types } from '../data/types.js'
import { getTypePresentation } from '../data/localizedContent.js'

const { locale } = useI18n()
const presentation = type => getTypePresentation(type, locale.value)
const reader = ref(null)
const showPanel = ref(false)
const router = useRouter()
const route = useRoute()
const selected = computed(() => {
  const type =
    typeof route.query.type === 'string' ? route.query.type.toUpperCase() : ''
  return Object.hasOwn(types, type) ? type : null
})
const invalidType = computed(
  () => route.query.type !== undefined && !selected.value,
)
const search = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (q) => router.replace({ query: { ...route.query, q: q || undefined } }),
})
const filteredGroups = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return groups
    .map((group) => ({
      ...group,
      types: group.types.filter((code) =>
        [code, presentation(code)?.nickname, types[code].nickname.zh, types[code].nickname.en]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      ),
    }))
    .filter((group) => group.types.length)
})
function select(type) {
  router.push({
    path: '/types',
    query: { ...route.query, type: type || undefined },
  })
}
watch(selected, async (type, previous) => {
  showPanel.value = false
  await nextTick()
  window.scrollTo?.({ top: 0 })
  const target = type
    ? document.querySelector('.type-letters')
    : document.querySelector(`[data-type="${previous}"]`) ||
      document.querySelector('input[type="search"]')
  target?.focus({ preventScroll: true })
})

const groups = [
  { label: 'Analysts', types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { label: 'Diplomats', types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { label: 'Sentinels', types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { label: 'Explorers', types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] },
]

const GROUP_COLORS = {
  Analysts: '#5c6bc0',
  Diplomats: '#4caf90',
  Sentinels: '#e08000',
  Explorers: '#c0405c',
}

function groupColor(label) {
  return GROUP_COLORS[label] ?? '#5c6bc0'
}
</script>

<style scoped>
.has-report {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
.search-label {
  display: grid;
  gap: 8px;
  font-size: 14px;
}
.search-label input {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--blue-light);
  border-radius: 10px;
  padding: 12px;
  font: inherit;
}
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
.back-btn:hover {
  color: var(--blue);
}
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
.detail-back:hover {
  color: var(--blue);
}
</style>

<style scoped>
.types-header { display: grid; grid-template-columns: 1fr auto; }
.back-btn { grid-column: 1; grid-row: 1; }
.page-title { grid-column: 1 / -1; grid-row: 2; overflow-wrap: anywhere; }
.types-header > :last-child { grid-column: 2; grid-row: 1; justify-self: end; }
</style>
