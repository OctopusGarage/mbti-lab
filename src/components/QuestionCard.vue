<template>
    <div class="question-card" :key="question.id">
      <div class="options">
        <button
          class="option"
          :class="{ selected: selected === 'a' }"
          :disabled="disabled" :aria-pressed="selected === 'a'"
          @click="$emit('answer', 'a')"
        >
          <span class="option-letter">A</span>
          <span class="option-text">{{ questionText.a }}</span>
        </button>
        <div class="divider">{{ $t('test.or') }}</div>
        <button
          class="option"
          :class="{ selected: selected === 'b' }"
          :disabled="disabled" :aria-pressed="selected === 'b'"
          @click="$emit('answer', 'b')"
        >
          <span class="option-letter">B</span>
          <span class="option-text">{{ questionText.b }}</span>
        </button>
      </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { getQuestionText } from '../data/localizedContent.js'
const { locale } = useI18n()
const props = defineProps({ question: Object, selected: String, disabled: Boolean })
const questionText = computed(() => getQuestionText(props.question, locale.value))
defineEmits(['answer'])
</script>

<style scoped>
.question-card { width: 100%; }

.options {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: var(--white);
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  box-shadow: var(--shadow);
}
@media (hover: hover) {
  .option:hover { border-color: var(--blue-mid); transform: translateY(-1px); }
}
.option.selected { border-color: var(--blue-mid); background: var(--blue-light); }

.option-letter {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--blue-light);
  color: var(--blue);
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.option.selected .option-letter {
  background: var(--blue-mid);
  color: white;
}
.option-text { font-size: 15px; line-height: 1.6; color: var(--ink); }

.divider {
  text-align: center;
  font-size: 12px;
  color: var(--ink-light);
  padding: 10px 0;
  letter-spacing: 1px;
}

</style>
