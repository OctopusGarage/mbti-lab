<template>
    <div class="question-card" :key="question.id">
      <div class="options">
        <button
          class="option"
          :class="{ selected: selected === 'a' }"
          :disabled="disabled" :aria-pressed="selected === 'a'"
          @click="$emit('answer', 'a')"
        >
          <span class="option-letter"><AppIcon v-if="selected === 'a'" icon="check" :size="18" /><span v-else>A</span></span>
          <span class="option-text">{{ questionText.a }}</span>
        </button>
        <div class="divider">{{ $t('test.or') }}</div>
        <button
          class="option"
          :class="{ selected: selected === 'b' }"
          :disabled="disabled" :aria-pressed="selected === 'b'"
          @click="$emit('answer', 'b')"
        >
          <span class="option-letter"><AppIcon v-if="selected === 'b'" icon="check" :size="18" /><span v-else>B</span></span>
          <span class="option-text">{{ questionText.b }}</span>
        </button>
      </div>
    </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { getQuestionText } from '../data/localizedContent.js'
const { locale } = useI18n()
const props = defineProps({ question: Object, selected: String, disabled: Boolean })
const questionText = computed(() => getQuestionText(props.question, locale.value))
defineEmits(['answer'])
</script>

<style scoped>
.question-card { width: 100%; animation: question-enter 220ms var(--ease-out) both; }
.options { display: flex; flex-direction: column; }
.option { min-height: 124px; width: 100%; display: flex; align-items: center; gap: 22px; padding: 28px 30px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); cursor: pointer; text-align: left; color: var(--text); transition: border-color var(--duration-fast), background var(--duration-fast), transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast); -webkit-tap-highlight-color: transparent; }
.option-letter { flex-shrink: 0; width: 36px; height: 36px; border: 1px solid var(--line); border-radius: 50%; color: var(--text-secondary); font-weight: 500; font-size: 13px; display: grid; place-items: center; transition: color var(--duration-fast), background var(--duration-fast), border-color var(--duration-fast); }
.option-text { min-width: 0; font-size: 19px; font-weight: 450; line-height: 1.65; letter-spacing: -.02em; overflow-wrap: anywhere; }
.option.selected { border-color: var(--accent); background: var(--accent-soft); box-shadow: 0 0 0 1px var(--accent); }
.option.selected .option-letter { background: var(--accent); border-color: var(--accent); color: white; }
.option:disabled { cursor: default; opacity: 1; }
.option:disabled:not(.selected) { color: var(--text-secondary); }
.option:active:not(:disabled) { transform: scale(.99); }
.divider { display: flex; align-items: center; justify-content: center; gap: 14px; color: var(--text-tertiary); font-size: 12px; line-height: 1.5; padding: 18px 20px; }
.divider::before, .divider::after { content: ''; width: 32px; height: 1px; background: var(--line); }
@media (hover: hover) { .option:hover:not(:disabled) { border-color: rgba(0,113,227,.4); box-shadow: var(--shadow-soft); } .option:hover:not(:disabled) .option-letter { border-color: rgba(0,113,227,.3); color: var(--accent); } .option.selected:hover:not(:disabled) .option-letter { color: white; } }
@keyframes question-enter { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 600px) { .option { min-height: 132px; padding: 24px 22px; gap: 16px; border-radius: 22px; } .option-text { font-size: 17px; } .option-letter { width: 32px; height: 32px; } .divider { padding-block: 16px; } }
@media (max-width: 360px) { .option { padding-inline: 18px; gap: 12px; } .option-text { font-size: 16px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
