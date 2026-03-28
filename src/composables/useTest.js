import { ref, computed } from 'vue'

const OPPOSITE = { E: 'I', I: 'E', N: 'S', S: 'N', F: 'T', T: 'F', J: 'P', P: 'J' }

export function useTest() {
  const questions = ref([])
  const currentIndex = ref(0)
  const answers = ref([]) // 'a' | 'b' | null per question

  function loadQuestions(allQuestions, shortVersion) {
    questions.value = shortVersion ? allQuestions.filter(q => q.short) : allQuestions
    answers.value = new Array(questions.value.length).fill(null)
    currentIndex.value = 0
  }

  function answer(choice) {
    answers.value[currentIndex.value] = choice
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
    }
  }

  function goBack() {
    if (currentIndex.value > 0) currentIndex.value--
  }

  const isComplete = computed(() =>
    answers.value.length > 0 && answers.value.every(a => a !== null)
  )

  const scores = computed(() => {
    const s = { E: 0, I: 0, N: 0, S: 0, F: 0, T: 0, J: 0, P: 0 }
    questions.value.forEach((q, i) => {
      const a = answers.value[i]
      if (!a) return
      const letterA = q.direction
      const letterB = OPPOSITE[letterA]
      if (a === 'a') s[letterA]++
      else s[letterB]++
    })
    return s
  })

  const dimensionPercents = computed(() => {
    const s = scores.value
    const pct = (a, b) => (a + b === 0 ? 50 : Math.round((a / (a + b)) * 100))
    return {
      EI: { E: pct(s.E, s.I), I: pct(s.I, s.E) },
      NS: { N: pct(s.N, s.S), S: pct(s.S, s.N) },
      FT: { F: pct(s.F, s.T), T: pct(s.T, s.F) },
      JP: { J: pct(s.J, s.P), P: pct(s.P, s.J) },
    }
  })

  const mbtiType = computed(() => {
    const p = dimensionPercents.value
    return (
      (p.EI.E >= 50 ? 'E' : 'I') +
      (p.NS.N >= 50 ? 'N' : 'S') +
      (p.FT.F >= 50 ? 'F' : 'T') +
      (p.JP.J >= 50 ? 'J' : 'P')
    )
  })

  const result = computed(() => {
    if (!isComplete.value) return null
    return {
      type: mbtiType.value,
      percents: dimensionPercents.value,
    }
  })

  function reset() {
    questions.value = []
    answers.value = []
    currentIndex.value = 0
  }

  return {
    questions,
    currentIndex,
    answers,
    loadQuestions,
    answer,
    goBack,
    isComplete,
    scores,
    dimensionPercents,
    mbtiType,
    result,
    reset,
  }
}
