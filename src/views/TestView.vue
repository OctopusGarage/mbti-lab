<template>
  <div class="test-page">
    <header class="test-header">
      <ProgressBar :current="currentIndex" :total="questions.length" />
      <LangToggle />
    </header>

    <main class="test-main">
      <QuestionCard
        v-if="currentQuestion"
        :question="currentQuestion"
        :selected="answers[currentIndex]"
        @answer="onAnswer"
      />
    </main>

    <footer class="test-footer">
      <button v-if="currentIndex > 0" class="btn-prev" @click="goBack">
        {{ $t('test.prev') }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProgressBar from '../components/ProgressBar.vue'
import QuestionCard from '../components/QuestionCard.vue'
import LangToggle from '../components/LangToggle.vue'
import { useTest } from '../composables/useTest.js'
import { useHistory } from '../composables/useHistory.js'
import { questions as allQuestions } from '../data/questions.js'

const router = useRouter()
const { saveResult } = useHistory()
const { questions, currentIndex, answers, loadQuestions, answer, goBack, isComplete, result } = useTest()

onMounted(() => {
  const isShort = sessionStorage.getItem('mbti_short') !== '0'
  loadQuestions(allQuestions, isShort)
})

const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)

function onAnswer(choice) {
  answer(choice)
}

watch(isComplete, (val) => {
  if (val && result.value) {
    saveResult(result.value)
    sessionStorage.setItem('mbti_result', JSON.stringify(result.value))
    router.push('/result')
  }
})
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
.test-header > :first-child { flex: 1; }
.test-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}
.test-main > * { max-width: 560px; width: 100%; }
.test-footer {
  padding: 16px 24px 32px;
  min-height: 56px;
}
.btn-prev {
  background: none;
  border: none;
  color: var(--ink-light);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
}
.btn-prev:hover { color: var(--blue); }
</style>
