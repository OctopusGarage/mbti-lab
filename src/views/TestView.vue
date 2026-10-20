<template>
  <div class="test-page">
    <header class="test-header">
      <ProgressBar
        :current="currentIndex"
        :total="questions.length"
      /><LangToggle />
    </header>
    <main class="test-main">
      <div>
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
          {{ $t('test.saved') }}
        </p>
        <p v-if="failure" role="alert">
          {{ $t('test.finishError') }}
          <button @click="finish">{{ $t('share.retry') }}</button>
        </p>
      </div>
    </main>
    <footer class="test-footer">
      <router-link to="/" class="btn-exit">{{ $t('test.exit') }}</router-link>
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
} from 'vue-router'
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
function persist() {
  available.value = drafts.save(mode.value, answers.value, currentIndex.value)
}
function finish() {
  try {
    failure.value = false
    const saved = useResultStore().submit(result.value)
    drafts.clear()
    router.replace({ path: '/result', query: saved ? {} : { unsaved: '1' } })
  } catch {
    failure.value = true
    busy.value = false
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
  busy.value = false
}
function onAnswer(choice) {
  if (busy.value || !['a', 'b'].includes(choice)) return
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
.test-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: white;
  box-shadow: 0 1px 0 var(--blue-light);
  gap: 16px;
}
.test-header > :first-child {
  flex: 1;
}
.test-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}
.test-main > * {
  max-width: 560px;
  width: 100%;
}
.test-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px calc(32px + env(safe-area-inset-bottom));
  min-height: 56px;
}
.btn-exit {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--blue);
  font-size: 14px;
  text-decoration: none;
  padding: 8px 0;
}
.saved-note {
  color: var(--ink-light);
  font-size: 13px;
  line-height: 1.7;
  margin-top: 20px;
}
.btn-prev {
  min-height: 44px;
  background: none;
  border: none;
  color: var(--ink-light);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
}
.btn-prev:hover {
  color: var(--blue);
}
</style>
