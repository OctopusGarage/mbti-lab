<template>
  <div class="language-picker">
    <AppIcon class="language-globe" icon="globe" :size="15" />
    <select ref="selectEl" class="lang-toggle" :value="locale" :disabled="loading" :aria-label="t('app.language')" @change="choose($event.target.value)">
      <option v-for="language in LOCALES" :key="language.code" :value="language.code" :lang="language.code">{{ language.label }}</option>
    </select>
    <AppIcon class="language-chevron" icon="chevron-down" :size="13" />
    <p v-if="loading" class="language-message" role="status">{{ t('app.languageLoading') }}</p>
    <p v-else-if="failed" class="language-message" role="alert">
      {{ t('app.languageError') }}
      <button @click="choose(requested)">{{ t('app.languageRetry') }}</button>
    </p>
    <p v-else-if="unsaved" class="language-message" role="status">{{ t('app.languageUnsaved') }}</p>
  </div>
</template>

<script setup>
import { ref, inject, onUnmounted, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useI18n } from 'vue-i18n'
import { routerKey, routeLocationKey, matchedRouteKey, onBeforeRouteLeave } from 'vue-router'
import { LOCALES, resolveLocale, saveLocalePreference } from '../i18n/locales.js'
import { localeLoader, languageNavigation } from '../i18n/resources.js'

const composer = useI18n()
const { t, locale } = composer
const router = inject(routerKey, null), route = inject(routeLocationKey, null)
const selectEl = ref(null), loading = ref(false), failed = ref(false), unsaved = ref(false)
let generation = 0, requested = ''
onUnmounted(() => { generation++ })
function cancelPendingSelection() {
  generation++
  loading.value = false
  if (selectEl.value) selectEl.value.value = locale.value
}
watch(() => languageNavigation.revision, cancelPendingSelection, { flush: 'sync' })
if (inject(matchedRouteKey, null)?.value) onBeforeRouteLeave(cancelPendingSelection)
async function choose(value) {
  const code = resolveLocale(value)
  if (!code || loading.value) return
  const current = ++generation
  requested = code
  loading.value = true
  failed.value = false
  unsaved.value = false
  try {
    await localeLoader.prepare(composer, code, route?.path ?? '/')
    if (current !== generation) return
    locale.value = code
    unsaved.value = !saveLocalePreference(code)
    if (router) await router.replace({ query: { ...route.query, lang: code } })
  } catch {
    if (current === generation) failed.value = true
  } finally {
    if (current === generation) {
      loading.value = false
      if (selectEl.value) selectEl.value.value = locale.value
    }
  }
}
</script>

<style scoped>
.language-picker { position: relative; flex: 0 0 auto; }
.language-globe, .language-chevron { position: absolute; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
.language-globe { left: 13px; }
.language-chevron { right: 12px; }
.lang-toggle {
  appearance: none;
  -webkit-appearance: none;
  width: min(148px, 39vw);
  min-width: 108px;
  min-height: 44px;
  padding: 10px 28px 10px 35px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}
.lang-toggle:disabled { cursor: progress; opacity: .65; }
@media (hover: hover) { .lang-toggle:hover { border-color: #b5b7bd; } }
.language-message {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 100;
  width: min(320px, calc(100vw - 40px));
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--line);
  padding: 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.7;
  box-shadow: 0 12px 36px rgba(25,35,55,.12);
}
.language-message button { min-height: 44px; padding: 8px 16px; margin-top: 8px; font: inherit; border: 0; border-radius: 12px; background: var(--accent-soft); color: var(--accent); }
</style>
