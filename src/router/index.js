import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },  
  {
  path: '/notes',
  name: 'notes',
  component: () => import('@/views/NotesView.vue')
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
