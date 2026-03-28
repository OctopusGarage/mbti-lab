import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TestView from '../views/TestView.vue'
import ResultView from '../views/ResultView.vue'
import TypesView from '../views/TypesView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/test', component: TestView },
  { path: '/result', component: ResultView },
  { path: '/types', component: TypesView },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
