<template>
  <div class="home">
    <header class="home-header">
      <LangToggle />
    </header>

    <main class="home-main">
      <h1 class="title">{{ $t('app.title') }}</h1>
      <p class="subtitle">{{ $t('app.subtitle') }}</p>

      <div class="cards">
        <button class="start-card" @click="start(true)">
          <span class="card-label">{{ $t('home.startShort') }}</span>
          <span class="card-desc">{{ $t('home.shortDesc') }}</span>
        </button>
        <button class="start-card" @click="start(false)">
          <span class="card-label">{{ $t('home.startFull') }}</span>
          <span class="card-desc">{{ $t('home.fullDesc') }}</span>
        </button>
      </div>

      <div v-if="lastResult" class="last-result">
        <span class="last-label">{{ $t('home.lastResultLabel') }}</span>
        <router-link to="/result" class="last-type">
          {{ lastResult.type }} · {{ $t('home.viewLastResult') }}
        </router-link>
      </div>

      <router-link to="/types" class="types-link">
        {{ locale === 'zh' ? '📖 查看 16 种人格附录' : '📖 Browse 16 Types' }}
      </router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LangToggle from '../components/LangToggle.vue'
import { useHistory } from '../composables/useHistory.js'

const router = useRouter()
const { locale } = useI18n()
const { loadResult } = useHistory()
const lastResult = ref(null)

onMounted(() => { lastResult.value = loadResult() })

function start(isShort) {
  sessionStorage.setItem('mbti_short', isShort ? '1' : '0')
  router.push('/test')
}
</script>

<style scoped>
.home {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fef9ec 0%, #f0eaf8 100%);
}
.home-header {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
}
.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 64px;
  text-align: center;
  gap: 12px;
}
.title {
  font-size: 42px;
  font-weight: 900;
  color: var(--blue);
  letter-spacing: 2px;
}
.subtitle {
  font-size: 14px;
  color: var(--ink-light);
  margin-bottom: 20px;
}
.cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}
.start-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 32px;
  background: white;
  border: 2px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s;
  min-width: 160px;
}
.start-card:hover { border-color: var(--blue-mid); transform: translateY(-2px); }
.card-label { font-size: 16px; font-weight: 700; color: var(--blue); }
.card-desc { font-size: 12px; color: var(--ink-light); }
.last-result {
  margin-top: 32px;
  font-size: 13px;
  color: var(--ink-light);
  display: flex;
  align-items: center;
  gap: 6px;
}
.last-label { color: var(--ink-light); }
.last-type { color: var(--blue-mid); font-weight: 600; text-decoration: none; }
.last-type:hover { text-decoration: underline; }
.types-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--ink-light);
  text-decoration: none;
}
.types-link:hover { color: var(--blue); }
</style>
