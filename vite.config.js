import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/mbti-lab/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
