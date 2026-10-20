<template>
  <div class="types-page" :class="{ 'has-report': selected }">
    <header class="types-header">
      <router-link to="/" class="back-btn"
        ><AppIcon icon="arrow-left" :size="17" /> {{ $t('types.backHome') }}</router-link
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
            :style="{ '--family-color': groupColor(group.label) }"
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
        <AppIcon icon="arrow-left" :size="17" /> {{ $t('types.backToList') }}
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
import AppIcon from '../components/AppIcon.vue'
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
  Analysts: '#7765a3',
  Diplomats: '#37856f',
  Sentinels: '#527ba5',
  Explorers: '#a88138',
}

function groupColor(label) {
  return GROUP_COLORS[label] ?? '#5c6bc0'
}
</script>

<style scoped>
.types-page { min-height: 100dvh; background: var(--canvas); display: flex; flex-direction: column; }
.has-report { padding-bottom: calc(116px + env(safe-area-inset-bottom)); }
.types-header { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 24px; padding: 20px 32px 24px; width: 100%; max-width: 1104px; margin-inline: auto; }
.back-btn { display: inline-flex; align-items: center; gap: 8px; justify-self: start; min-height: 44px; font-size: 13px; color: var(--text-secondary); text-decoration: none; }
.back-btn:hover { color: var(--accent); }
.page-title { grid-column: 1 / -1; grid-row: 2; font-size: clamp(32px, 5vw, 48px); font-weight: 650; line-height: 1.2; letter-spacing: -.055em; color: var(--text); overflow-wrap: anywhere; padding-top: 16px; }
.types-header > :last-child { grid-column: 2; grid-row: 1; justify-self: end; }
.grid-wrap { padding: 12px 32px 64px; display: flex; flex-direction: column; gap: 38px; max-width: 1104px; margin: 0 auto; width: 100%; }
.search-label { display: grid; gap: 10px; font-size: 13px; color: var(--text-secondary); max-width: 440px; }
.search-label input { appearance: none; width: 100%; min-height: 52px; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 14px 18px; font: inherit; font-size: 15px; color: var(--text); background: var(--surface); transition: box-shadow var(--duration-fast), border-color var(--duration-fast); }
.search-label input::placeholder { color: var(--text-tertiary); }
.search-label input:focus-visible { border-color: var(--accent); outline: 3px solid var(--accent-soft); outline-offset: 2px; }
.group-label { font-size: 16px; letter-spacing: -.02em; color: var(--text-secondary); margin-bottom: 14px; font-weight: 550; }
.type-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.type-chip { position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 26px; min-width: 0; min-height: 156px; padding: 24px; background: var(--surface); border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; text-align: left; transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal), border-color var(--duration-normal); }
.type-chip::after { content: ''; position: absolute; right: 22px; top: 28px; width: 7px; height: 7px; border-top: 1.5px solid var(--family-color); border-right: 1.5px solid var(--family-color); transform: rotate(45deg); opacity: .5; }
.chip-code { font-size: clamp(26px, 3vw, 32px); font-weight: 650; color: var(--family-color); letter-spacing: -.055em; line-height: 1.1; }
.chip-nick { font-size: 14px; line-height: 1.5; color: var(--text-secondary); font-weight: 450; overflow-wrap: anywhere; }
.type-chip:active { transform: scale(.97); }
@media (hover: hover) { .type-chip:hover { border-color: color-mix(in srgb, var(--family-color), transparent 70%); transform: translateY(-3px); box-shadow: var(--shadow-soft); } }
.detail-wrap { display: flex; flex-direction: column; padding: 0 24px; }
.detail-back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; padding: 12px 0; margin-inline: auto; width: 100%; max-width: 840px; min-height: 44px; font: inherit; font-size: 13px; color: var(--text-secondary); cursor: pointer; text-align: left; }
.detail-back:hover { color: var(--accent); }
.types-page:has(.detail-wrap) .page-title { display: none; }
.types-page:has(.detail-wrap) .types-header { padding-bottom: 8px; }
[role='status'] { color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
@media (max-width: 700px) { .types-header { padding: 16px 24px 20px; gap: 18px; } .grid-wrap { padding: 12px 24px 48px; gap: 30px; } .type-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } .type-chip { min-height: 148px; padding: 22px; gap: 22px; } }
@media (max-width: 400px) { .types-header { padding-inline: 16px; } .grid-wrap { padding-inline: 16px; } .type-chip { padding: 18px 16px; min-height: 140px; } .type-chip::after { top: 22px; right: 18px; } .chip-nick { font-size: 13px; } .detail-wrap { padding-inline: 16px; } }
@media (prefers-reduced-motion: reduce) { .type-chip, .search-label input { transition: none; } }
</style>
