import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ExpensesView from '@/views/ExpensesView.vue'

const routes = [
  {
    path: '/',
    redirect: '/notes'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/views/NotesView.vue')
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpensesView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Add navigation guard for authentication (you'll implement this later)
router.beforeEach((to, from, next) => {
  // Check if route requires auth
  // For now, allow all routes
  next()
})

export default router
