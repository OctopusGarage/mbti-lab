<template>
  <div class="home">
    <header class="home-header">
      <button
        class="btn-share-icon"
        @click="showPanel = true"
        :title="$t('share.shareApp')"
        :aria-label="$t('share.shareApp')"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
      <LangToggle />
    </header>

    <SharePanel v-if="showPanel" @close="showPanel = false" />

    <main class="home-main">
      <h1 class="title">{{ $t('app.title') }}</h1>
      <p class="subtitle">{{ $t('app.subtitle') }}</p>

      <p v-if="invalid" role="status">{{ $t('test.invalidDraft') }}</p>
      <p v-if="!available" role="status">{{ $t('test.storageWarning') }}</p>
      <button v-if="draft" class="start-card" @click="resume">
        {{
          $t('home.resume', {
            current: draft.currentIndex + 1,
            total: draft.answers.length,
          })
        }}
      </button>
      <div class="cards">
        <button class="start-card" @click="start(true)">
          <span class="card-label">{{ $t('home.startShort') }}</span>
          <span class="card-desc">{{ $t('home.shortDesc') }}</span>
        </button>
        <button class="start-card" @click="start(false)">
          <span class="card-label">{{ $t('home.startFull') }}</span>
          <span class="card-desc">{{ $t('home.fullDesc') }}</span>
        </button>
      </div>

      <div v-if="lastResult" class="last-result">
        <div class="last-result-heading">
          <span class="last-label">{{ $t('home.lastResultLabel') }}</span>
          <router-link to="/result" class="last-type">
            {{ lastResult.type }} · {{ $t('home.viewLastResult') }}
          </router-link>
        </div>
        <p class="result-completed">
          <template v-if="completedDate"
            >{{ $t('home.completedAt') }}
            <time :datetime="completedDate.toISOString()">{{
              formattedDate
            }}</time></template
          >
          <span v-else>{{ $t('home.unknownDate') }}</span>
        </p>
        <p class="result-save-state" role="status">
          {{ $t(resultSaved ? 'home.resultSaved' : 'result.unsaved') }}
        </p>
      </div>

      <router-link to="/types" class="types-link">
        {{ $t('home.browseTypes') }}
      </router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LangToggle from '../components/LangToggle.vue'
import SharePanel from '../components/SharePanel.vue'
import { useResultStore } from '../composables/useResultStore.js'
import { useDraftStore } from '../composables/useDraftStore.js'
import { useI18n } from 'vue-i18n'
import { dateLocale } from '../i18n/locales.js'

const router = useRouter()
const { peek, isPersisted } = useResultStore()
const drafts = useDraftStore()
const { t, locale } = useI18n()
const draft = ref(null)
const invalid = ref(false)
const available = ref(true)
const lastResult = ref(null)
const resultSaved = ref(false)
const completedDate = computed(() => {
  const timestamp = lastResult.value?.completedAt
  if (!Number.isFinite(timestamp) || timestamp < 0) return null
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
})
const formattedDate = computed(() =>
  completedDate.value
    ? new Intl.DateTimeFormat(dateLocale(locale.value), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(completedDate.value)
    : '',
)
const showPanel = ref(false)

onMounted(() => {
  lastResult.value = peek()
  resultSaved.value = isPersisted(lastResult.value)
  const state = drafts.load()
  draft.value = state.draft
  invalid.value = state.invalid
  available.value = state.available
})
function resume() {
  router.push({ path: '/test', query: { mode: draft.value.mode } })
}

function start(isShort) {
  if (draft.value && !window.confirm(t('home.restartConfirm'))) return
  drafts.clear()
  router.push({ path: '/test', query: { mode: isShort ? 'short' : 'full' } })
}
</script>

<style scoped>
.home {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fef9ec 0%, #f0eaf8 100%);
}
.home-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
}
.btn-share-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-share-icon:hover {
  background: white;
}
.btn-share-icon:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 64px;
  text-align: center;
  gap: 12px;
}
.title {
  font-size: 42px;
  font-weight: 900;
  color: var(--blue);
  letter-spacing: 2px;
}
.subtitle {
  font-size: 14px;
  color: var(--ink-light);
  margin-bottom: 20px;
}
.cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}
.start-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 32px;
  background: white;
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s;
  min-width: 160px;
}
.start-card:hover {
  border-color: var(--blue-mid);
  transform: translateY(-2px);
}
.card-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--blue);
}
.card-desc {
  font-size: 12px;
  color: var(--ink-light);
}
.last-result-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px;
}
.result-completed,
.result-save-state {
  font-size: 12px;
  line-height: 1.7;
}
.last-result {
  flex-direction: column;
  max-width: 100%;
  margin-top: 32px;
  font-size: 13px;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  gap: 6px;
}
.last-label {
  color: var(--ink-light);
}
.last-type {
  color: var(--blue-mid);
  font-weight: 600;
  text-decoration: none;
}
.last-type:hover {
  text-decoration: underline;
}
.types-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--ink-light);
  text-decoration: none;
}
.types-link:hover {
  color: var(--blue);
}
</style>
