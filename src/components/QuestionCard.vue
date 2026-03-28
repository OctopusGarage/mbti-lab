<template>
  <Transition name="fade" mode="out-in">
    <div class="question-card" :key="question.id">
      <div class="options">
        <button
          class="option"
          :class="{ selected: selected === 'a' }"
          @click="$emit('answer', 'a')"
        >
          <span class="option-letter">A</span>
          <span class="option-text">{{ question[locale].a }}</span>
        </button>
        <div class="divider">{{ locale === 'zh' ? '或' : 'or' }}</div>
        <button
          class="option"
          :class="{ selected: selected === 'b' }"
          @click="$emit('answer', 'b')"
        >
          <span class="option-letter">B</span>
          <span class="option-text">{{ question[locale].b }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
defineProps({ question: Object, selected: String })
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
.option:hover { border-color: var(--blue-mid); transform: translateY(-1px); }
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

/* transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from { opacity: 0; transform: translateX(20px); }
.fade-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
