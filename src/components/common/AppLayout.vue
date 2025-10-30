<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="notion-bg border-b sticky top-0 z-50" style="border-color: var(--notion-border);">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo & Title - Pure Productivity Focus -->
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 flex items-center justify-center rounded" style="background-color: var(--notion-text);">
              <i class="pi pi-chart-line text-white" style="font-size: 14px;"></i>
            </div>
            <h1 class="text-base font-semibold notion-text-primary">
              ThinkSpend
            </h1>
          </div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            v-tooltip.bottom="'Sign Out'"
            class="notion-button text-sm border-0"
          >
            <i class="pi pi-sign-out notion-text-secondary" style="font-size: 13px;"></i>
            <span class="notion-text-secondary">Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs - Pill Style -->
    <nav class="notion-bg border-b" style="border-color: var(--notion-border);">
      <div class="max-w-7xl mx-auto px-8 py-3">
        <div class="flex gap-2">
          <!-- Notes Tab -->
          <button
            @click="$router.push('/notes')"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              $route.name === 'notes'
                ? 'notion-bg-selected notion-text-primary'
                : 'notion-text-secondary notion-bg-hover'
            ]"
          >
            <i class="pi pi-file" style="font-size: 13px;"></i>
            <span>Notes</span>
          </button>

          <!-- Expenses Tab -->
          <button
            @click="$router.push('/expenses')"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              $route.name === 'expenses'
                ? 'notion-bg-selected notion-text-primary'
                : 'notion-text-secondary notion-bg-hover'
            ]"
          >
            <i class="pi pi-dollar" style="font-size: 13px;"></i>
            <span>Expenses</span>
          </button>

          <!-- Search Tab -->
          <button
            @click="$router.push('/search')"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              $route.name === 'search'
                ? 'notion-bg-selected notion-text-primary'
                : 'notion-text-secondary notion-bg-hover'
            ]"
          >
            <i class="pi pi-search" style="font-size: 13px;"></i>
            <span>Search</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.signOut()
  router.push('/login')
}
</script>