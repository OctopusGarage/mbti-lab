<template>
  <div v-if="languageNavigation.failedRoute" class="language-navigation-error" role="alert">
    {{ $t('app.languageError') }}
    <button @click="retryLanguage">{{ $t('app.languageRetry') }}</button>
    <button @click="languageNavigation.failedRoute = ''">{{ $t('share.close') }}</button>
  </div>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" class="page-view" />
  </RouterView>
  <div class="og-brand">OctopusGarage</div>
</template>
<script setup>
import { RouterView, useRouter } from 'vue-router'
import { languageNavigation } from './i18n/resources.js'
const router = useRouter()
function retryLanguage() { router.push(languageNavigation.failedRoute) }
</script>
