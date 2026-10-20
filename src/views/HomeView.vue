<template>
  <div class="home">
    <header class="home-header">
      <router-link to="/" class="wordmark" aria-label="MBTI Lab"><span class="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>MBTI Lab</router-link>
      <div class="header-actions">
        <button class="btn-share-icon" @click="showPanel = true" :title="$t('share.shareApp')" :aria-label="$t('share.shareApp')"><AppIcon icon="share" :size="19" /></button>
        <LangToggle />
      </div>
    </header>
    <SharePanel v-if="showPanel" @close="showPanel = false" />
    <main class="home-main">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span />{{ $t('report.cardLabel') }}</p>
          <h1 class="title">{{ $t('app.title') }}</h1>
          <p class="subtitle">{{ $t('app.subtitle') }}</p>
        </div>
        <div class="personality-lens" aria-hidden="true">
          <div class="lens-orbit orbit-one" /><div class="lens-orbit orbit-two" />
          <div class="lens-grid">
            <div v-for="(pair, index) in ['EI', 'NS', 'FT', 'JP']" :key="pair" class="lens-cell" :class="'lens-cell-' + index"><span>{{ pair[0] }}</span><span>{{ pair[1] }}</span><i /></div>
          </div>
          <span class="lens-center" />
        </div>
      </section>
      <p v-if="invalid" class="home-notice" role="status">{{ $t('test.invalidDraft') }}</p>
      <p v-if="!available" class="home-notice" role="status">{{ $t('test.storageWarning') }}</p>
      <button v-if="draft" class="start-card resume-card" @click="resume">
        <span class="resume-symbol"><AppIcon icon="arrow-right" :size="20" /></span>
        <span>{{ $t('home.resume', { current: draft.currentIndex + 1, total: draft.answers.length }) }}</span>
        <AppIcon icon="arrow-right" :size="18" />
      </button>
      <div class="cards">
        <button class="start-card assessment-card short-card" @click="start(true)">
          <span class="card-top"><span class="card-count" aria-hidden="true">60</span><span class="card-arrow"><AppIcon icon="arrow-right" :size="20" /></span></span>
          <span class="card-label">{{ $t('home.startShort') }}</span>
          <span class="card-desc"><AppIcon icon="clock" :size="15" />{{ $t('home.shortDesc') }}</span>
        </button>
        <button class="start-card assessment-card full-card" @click="start(false)">
          <span class="card-top"><span class="card-count" aria-hidden="true">93</span><span class="card-arrow"><AppIcon icon="arrow-right" :size="20" /></span></span>
          <span class="card-label">{{ $t('home.startFull') }}</span>
          <span class="card-desc"><AppIcon icon="clock" :size="15" />{{ $t('home.fullDesc') }}</span>
        </button>
      </div>
      <div v-if="lastResult" class="last-result">
        <div class="result-history-mark" aria-hidden="true">{{ lastResult.type }}</div>
        <div class="result-history-copy">
          <div class="last-result-heading"><span class="last-label">{{ $t('home.lastResultLabel') }}</span><router-link to="/result" class="last-type">{{ lastResult.type }} · {{ $t('home.viewLastResult') }}</router-link></div>
          <p class="result-completed"><template v-if="completedDate">{{ $t('home.completedAt') }} <time :datetime="completedDate.toISOString()">{{ formattedDate }}</time></template><span v-else>{{ $t('home.unknownDate') }}</span></p>
          <p class="result-save-state" role="status">{{ $t(resultSaved ? 'home.resultSaved' : 'result.unsaved') }}</p>
        </div>
      </div>
      <router-link to="/types" class="types-link"><span><AppIcon icon="book" :size="17" />{{ $t('home.browseTypes').replace(/^📖\s*/u, '') }}</span><AppIcon icon="arrow-right" :size="17" /></router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
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
.home { min-height: 100dvh; background: var(--canvas); }
.home-header { max-width: 1120px; margin: 0 auto; min-height: 88px; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.wordmark { min-height: 44px; display: inline-flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-size: 17px; font-weight: 650; letter-spacing: -.6px; white-space: nowrap; }
.brand-mark { display: grid; grid-template-columns: repeat(2, 7px); gap: 3px; transform: rotate(-9deg); }
.brand-mark i { width: 7px; height: 7px; background: var(--accent); border-radius: 2px; }
.brand-mark i:nth-child(2), .brand-mark i:nth-child(3) { opacity: .4; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.btn-share-icon { width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 50%; background: var(--surface); color: var(--text-secondary); cursor: pointer; transition: background var(--duration-fast), color var(--duration-fast); }
.btn-share-icon:hover { color: var(--accent); background: var(--accent-soft); }
.home-main { max-width: 1000px; margin: 0 auto; padding: 30px 40px 64px; }
.hero { min-height: 355px; display: grid; grid-template-columns: 1fr 340px; align-items: center; gap: 34px; margin-bottom: 38px; }
.eyebrow { display: flex; align-items: center; gap: 9px; color: var(--text-secondary); font-size: 12px; font-weight: 600; letter-spacing: .04em; margin: 0 0 22px; }
.eyebrow > span { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.title { margin: 0; font-size: clamp(48px, 6.5vw, 76px); line-height: 1.06; color: var(--text); font-weight: 700; letter-spacing: -.065em; text-wrap: balance; }
.subtitle { max-width: 410px; margin: 24px 0 0; font-size: 20px; line-height: 1.55; letter-spacing: -.035em; color: var(--text-secondary); text-wrap: balance; }
.personality-lens { position: relative; width: 320px; height: 320px; display: grid; place-items: center; isolation: isolate; }
.lens-orbit { position: absolute; border: 1px solid rgba(0,113,227,.09); border-radius: 50%; width: 310px; height: 310px; }
.orbit-two { width: 242px; height: 242px; }
.lens-grid { width: 240px; height: 240px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; transform: rotate(-12deg); }
.lens-cell { position: relative; display: flex; justify-content: space-between; padding: 17px; overflow: hidden; border-radius: 32px; background: #e4effc; border: 1px solid rgba(255,255,255,.9); box-shadow: 0 12px 28px rgba(43,72,116,.06), inset 0 1px 1px white; font-size: 15px; font-weight: 500; color: #54739a; }
.lens-cell span { position: relative; z-index: 1; }
.lens-cell span + span { align-self: flex-end; opacity: .65; }
.lens-cell i { position: absolute; width: 76px; height: 76px; border: 1px solid rgba(255,255,255,.8); border-radius: 50%; top: 19px; left: 19px; box-shadow: 0 0 0 16px rgba(255,255,255,.16); }
.lens-cell-1 { background: #ebe7f7; color: #7a7199; }
.lens-cell-2 { background: #e2eeec; color: #62847c; }
.lens-cell-3 { background: #f4eadd; color: #9b8260; }
.lens-center { position: absolute; width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.7); backdrop-filter: blur(12px); border: 1px solid white; box-shadow: 0 3px 18px rgba(49,63,81,.08); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.start-card { cursor: pointer; text-align: left; font-family: inherit; }
.assessment-card { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; padding: 30px 32px 28px; border-radius: var(--radius-lg); border: 1px solid var(--line); background: var(--surface); color: var(--text); transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal), border-color var(--duration-normal); }
.card-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 30px; }
.card-count { font-size: 44px; font-weight: 600; line-height: 1; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
.card-count > span { font-size: 15px; font-weight: 400; color: var(--text-tertiary); letter-spacing: -.02em; }
.card-arrow { display: grid; place-items: center; width: 38px; height: 38px; background: var(--accent-soft); border-radius: 50%; color: var(--accent); transition: transform var(--duration-normal) var(--ease-out); }
.short-card { border-color: rgba(0,113,227,.18); box-shadow: 0 4px 20px rgba(0,113,227,.025); }
.short-card .card-arrow { background: var(--accent); color: white; }
.card-label { font-size: 20px; line-height: 1.4; letter-spacing: -.035em; font-weight: 600; overflow-wrap: anywhere; }
.card-desc { display: flex; align-items: center; gap: 7px; margin-top: 10px; color: var(--text-secondary); font-size: 13px; line-height: 1.5; }
.card-desc svg { flex-shrink: 0; }
.resume-card { width: 100%; display: flex; align-items: center; gap: 14px; background: var(--accent-soft); border: 1px solid rgba(0,113,227,.12); border-radius: var(--radius-md); padding: 14px 20px; margin-bottom: 20px; color: var(--accent); font-size: 14px; font-weight: 600; }
.resume-card > span:nth-child(2) { flex: 1; }
.resume-symbol { width: 32px; height: 32px; background: var(--surface); display: grid; place-items: center; border-radius: 50%; flex-shrink: 0; }
.last-result { display: flex; align-items: center; gap: 18px; padding: 24px 4px; margin-top: 20px; border-bottom: 1px solid var(--line); }
.result-history-mark { flex-shrink: 0; font-size: 12px; font-weight: 600; letter-spacing: -.02em; width: 56px; height: 56px; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 16px; background: var(--surface); color: var(--text-secondary); }
.result-history-copy { min-width: 0; }
.last-result-heading { display: flex; flex-wrap: wrap; gap: 5px 10px; align-items: center; font-size: 13px; line-height: 1.7; }
.last-label { color: var(--text-secondary); }
.last-type { color: var(--accent); text-decoration: none; font-weight: 500; }
.result-completed, .result-save-state { margin: 4px 0 0; font-size: 11px; line-height: 1.6; color: var(--text-tertiary); }
.types-link { display: flex; width: fit-content; min-height: 44px; align-items: center; justify-content: center; gap: 10px; margin: 24px auto 0; font-size: 14px; color: var(--text-secondary); text-decoration: none; }
.types-link:hover, .last-type:hover { color: var(--accent); text-decoration: underline; text-underline-offset: 4px; }
.home-notice { font-size: 13px; line-height: 1.7; padding: 14px 18px; border: 1px solid var(--line); background: var(--surface); border-radius: var(--radius-sm); margin-bottom: 16px; color: var(--text-secondary); }
@media (hover: hover) { .assessment-card:hover { transform: translateY(-3px); border-color: rgba(0,113,227,.3); box-shadow: var(--shadow-soft); } .assessment-card:hover .card-arrow { transform: translateX(3px); } }
@media (max-width: 700px) {
  .home-header { min-height: 76px; padding: 12px 22px; gap: 10px; }
  .header-actions { gap: 6px; }
  .home-main { padding: 12px 24px 40px; }
  .hero { grid-template-columns: 1fr; gap: 0; margin-bottom: 22px; min-height: auto; text-align: center; }
  .hero-copy { padding-top: 25px; }
  .eyebrow { justify-content: center; margin-bottom: 18px; }
  .title { font-size: clamp(48px, 10vw, 66px); }
  .subtitle { margin: 18px auto 0; font-size: 18px; max-width: 360px; }
  .personality-lens { width: 260px; height: 260px; margin: 6px auto 0; transform: scale(.84); margin-bottom: -25px; }
  .cards { gap: 12px; }
  .assessment-card { padding: 23px 20px; border-radius: 22px; }
  .card-top { margin-bottom: 26px; gap: 4px; }
  .card-count { font-size: 36px; }
  .card-count > span { display: none; }
  .card-arrow { width: 32px; height: 32px; }
  .card-label { font-size: 17px; }
  .card-desc { align-items: flex-start; font-size: 12px; gap: 5px; }
  .card-desc svg { margin-top: 2px; }
}
@media (max-width: 380px) { .home-header { padding-inline: 16px; } .wordmark { font-size: 15px; gap: 7px; } .home-main { padding-inline: 18px; } .assessment-card { padding: 20px 15px; } .card-count { font-size: 32px; } .card-label { font-size: 15px; } .card-desc { font-size: 11px; } .result-history-mark { display: none; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
</style>
