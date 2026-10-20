<template>
  <div class="language-picker">
    <select ref="selectEl" class="lang-toggle" :value="locale" :disabled="loading" :aria-label="t('app.language')" @change="choose($event.target.value)">
      <option v-for="language in LOCALES" :key="language.code" :value="language.code" :lang="language.code">{{ language.label }}</option>
    </select>
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
.lang-toggle {
  min-width: 96px;
  width: min(140px, 36vw);
  min-height: 44px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--cream-border);
  border-radius: 20px;
  padding: 8px 10px;
  font: inherit;
  font-size: 13px;
  color: var(--ink);
  cursor: pointer;
}
.lang-toggle:disabled { cursor: progress; }
.language-message {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 100;
  width: min(300px, calc(100vw - 48px));
  background: var(--cream);
  color: var(--ink);
  border: 1px solid var(--cream-border);
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  box-shadow: var(--shadow);
}
.language-message button { min-height: 44px; padding: 8px; margin-top: 4px; font: inherit; cursor: pointer; }
</style>
