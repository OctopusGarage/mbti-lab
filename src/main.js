import './styles.css'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js'
import { i18n, initializeLanguage } from './i18n/index.js'

initializeLanguage().then(() => createApp(App).use(router).use(i18n).mount('#app'))
