<template>
  <div class="test-page">
    <header class="test-header">
      <ProgressBar
        :current="currentIndex"
        :total="questions.length"
      /><LangToggle />
    </header>
    <main class="test-main">
      <div class="question-stage">
        <h1 class="test-title">{{ $t('report.cardLabel') }}</h1>
        <p v-if="invalid" role="status">{{ $t('test.invalidDraft') }}</p>
        <p v-if="!available" role="status">{{ $t('test.storageWarning') }}</p>
        <QuestionCard
          v-if="currentQuestion"
          :question="currentQuestion"
          :selected="answers[currentIndex]"
          :disabled="busy"
          @answer="onAnswer"
        />
        <p v-if="available" class="saved-note" role="status">
          <AppIcon icon="check" :size="14" /><span>{{ $t('test.saved') }}</span>
        </p>
        <p v-if="failure" role="alert">
          {{ $t('test.finishError') }}
          <button @click="finish">{{ $t('share.retry') }}</button>
        </p>
      </div>
    </main>
    <footer class="test-footer">
      <router-link to="/" class="btn-exit"><AppIcon icon="arrow-left" :size="17" />{{ $t('test.exit') }}</router-link>
      <button
        v-if="currentIndex > 0"
        class="btn-prev"
        :disabled="busy"
        @click="back"
      >
        {{ $t('test.prev') }}
      </button>
    </footer>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  useRouter,
  useRoute,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  isNavigationFailure,
} from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import ProgressBar from '../components/ProgressBar.vue'
import QuestionCard from '../components/QuestionCard.vue'
import LangToggle from '../components/LangToggle.vue'
import { useTest } from '../composables/useTest.js'
import { useResultStore } from '../composables/useResultStore.js'
import { useDraftStore } from '../composables/useDraftStore.js'
import { questions as allQuestions } from '../data/questions.js'
const router = useRouter()
const route = useRoute()
const drafts = useDraftStore()
const {
  questions,
  currentIndex,
  answers,
  loadQuestions,
  answer,
  goBack,
  isComplete,
  result,
} = useTest()
const mode = ref('short')
const busy = ref(false)
const available = ref(true)
const invalid = ref(false)
const failure = ref(false)
const currentQuestion = computed(
  () => questions.value[currentIndex.value] ?? null,
)
let timer = null
let finishing = false
function persist() {
  available.value = drafts.save(mode.value, answers.value, currentIndex.value)
}
async function finish() {
  if (finishing) return
  finishing = true
  busy.value = true
  try {
    failure.value = false
    const saved = useResultStore().submit(result.value)
    const navigation = await router.replace({ path: '/result', query: saved ? {} : { unsaved: '1' } })
    if (isNavigationFailure(navigation)) throw new Error('Report navigation failed')
    drafts.clear()
  } catch {
    failure.value = true
    busy.value = false
  } finally {
    finishing = false
  }
}
function advance() {
  timer = null
  if (currentIndex.value === questions.value.length - 1 && isComplete.value)
    finish()
  else {
    currentIndex.value++
    busy.value = false
    persist()
    window.scrollTo?.({ top: 0 })
  }
}
function cancel() {
  clearTimeout(timer)
  timer = null
  busy.value = finishing
}
function onAnswer(choice) {
  if (busy.value || finishing || !['a', 'b'].includes(choice)) return
  busy.value = true
  answer(choice, false)
  persist()
  timer = setTimeout(advance, 280)
}
function back() {
  if (!busy.value) {
    goBack()
    persist()
    window.scrollTo?.({ top: 0 })
  }
}
onMounted(() => {
  const state = drafts.load()
  invalid.value = state.invalid
  available.value = state.available
  let legacyShort = true
  try {
    legacyShort = sessionStorage.getItem('mbti_short') !== '0'
  } catch {
    /* query/default works without storage */
  }
  mode.value =
    state.draft?.mode ||
    (route.query.mode === 'full'
      ? 'full'
      : route.query.mode === 'short'
        ? 'short'
        : legacyShort
          ? 'short'
          : 'full')
  loadQuestions(allQuestions, mode.value === 'short')
  if (state.draft) {
    answers.value = [...state.draft.answers]
    currentIndex.value = state.draft.currentIndex
  }
  if (isComplete.value) finish()
  else persist()
})
// A query-only navigation reuses this instance: settle feedback without losing
// the saved questionnaire or leaving its controls disabled. Mode changes require
// the home page restart confirmation, so an existing draft keeps its mode.
onBeforeRouteUpdate(() => {
  if (timer !== null) {
    clearTimeout(timer)
    advance()
  }
})
onBeforeRouteLeave(cancel)
onUnmounted(cancel)
</script>
<style scoped>
.test-page { min-height: 100dvh; display: flex; flex-direction: column; background: var(--canvas); }
.test-header { width: 100%; max-width: 1080px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 28px 40px; gap: 40px; }
.test-header > :first-child { flex: 1; max-width: 600px; }
.test-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 50px 24px 40px; }
.question-stage { max-width: 600px; width: 100%; }
.test-title { color: var(--text-secondary); font-size: 14px; line-height: 1.5; font-weight: 500; margin: 0 0 24px; letter-spacing: -.01em; }
.test-footer { width: 100%; max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 40px calc(28px + env(safe-area-inset-bottom)); min-height: 76px; }
.btn-exit, .btn-prev { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; color: var(--text-secondary); font-size: 13px; text-decoration: none; padding: 10px 0; line-height: 1.5; }
.btn-exit svg { flex-shrink: 0; }
.btn-prev { cursor: pointer; background: var(--surface); border: 1px solid var(--line); border-radius: 100px; padding-inline: 20px; }
.btn-prev:disabled { opacity: .45; cursor: default; }
.btn-exit:hover, .btn-prev:hover:not(:disabled) { color: var(--accent); }
.saved-note { display: flex; align-items: flex-start; justify-content: center; gap: 7px; max-width: 440px; margin: 26px auto 0; color: var(--text-tertiary); font-size: 11px; line-height: 1.7; text-align: center; }
.saved-note svg { margin-top: 2px; flex-shrink: 0; }
.question-stage > p:not(.saved-note) { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px; }
.question-stage > [role='alert'] button { display: inline-flex; align-items: center; min-height: 44px; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 8px 16px; color: var(--accent); background: var(--surface); cursor: pointer; }
@media (max-width: 600px) { .test-header { padding: 22px 24px; gap: 22px; } .test-main { align-items: flex-start; padding: 46px 24px 36px; } .test-footer { padding-inline: 24px; padding-bottom: calc(22px + env(safe-area-inset-bottom)); } .test-title { margin-bottom: 20px; font-size: 13px; } }
@media (max-width: 360px) { .test-header { padding-inline: 18px; gap: 15px; } .test-main, .test-footer { padding-inline: 18px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
