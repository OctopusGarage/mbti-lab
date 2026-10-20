import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/test', component: () => import('../views/TestView.vue') },
  { path: '/result', component: () => import('../views/ResultView.vue') },
  { path: '/types', component: () => import('../views/TypesView.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
