<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Header -->
    <header class="flex-shrink-0 notion-bg border-b z-50" style="border-color: var(--notion-border);">
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
            class="logout-button text-sm flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-150"
            title="Sign out of your account"
          >
            <i class="pi pi-sign-out" style="font-size: 13px;"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs - Enhanced with better visual feedback -->
    <nav class="flex-shrink-0 notion-bg border-b" style="border-color: var(--notion-border);">
      <div class="max-w-7xl mx-auto px-8 py-2.5">
        <div class="flex gap-3">
          <!-- Notes Tab -->
          <button
            @click="$router.push('/notes')"
            :class="[
              'nav-button flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active-nav',
              $route.name === 'notes'
                ? 'nav-button-active'
                : 'nav-button-inactive'
            ]"
            title="View and manage notes"
          >
            <i class="pi pi-file" style="font-size: 14px;"></i>
            <span>Notes</span>
          </button>

          <!-- Expenses Tab -->
          <button
            @click="$router.push('/expenses')"
            :class="[
              'nav-button flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active-nav',
              $route.name === 'expenses'
                ? 'nav-button-active'
                : 'nav-button-inactive'
            ]"
            title="Manage expenses"
          >
            <i class="pi pi-dollar" style="font-size: 14px;"></i>
            <span>Expenses</span>
          </button>

          <!-- Search Tab -->
          <button
            @click="$router.push('/search')"
            :class="[
              'nav-button flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active-nav',
              $route.name === 'search'
                ? 'nav-button-active'
                : 'nav-button-inactive'
            ]"
            title="Search across all content"
          >
            <i class="pi pi-search" style="font-size: 14px;"></i>
            <span>Search</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content - Flexes to fill remaining space -->
    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-8 py-8">
        <slot />
      </div>
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

<style scoped>
/* Logout button styling */
.logout-button {
  border: 1px solid var(--notion-border);
  background-color: var(--notion-bg);
  color: var(--notion-text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}

.logout-button:hover {
  background-color: var(--notion-bg-hover);
  border-color: var(--notion-text-secondary);
}

.logout-button:active {
  background-color: var(--notion-bg-selected);
}

/* Enhanced Navigation Button Base */
.nav-button {
  border: none;
  cursor: pointer;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Inactive state - subtle and ready to click */
.nav-button-inactive {
  background-color: var(--notion-bg);
  color: var(--notion-text-secondary);
  border: 1px solid transparent;
}

.nav-button-inactive:hover {
  background-color: var(--notion-bg-hover);
  color: var(--notion-text);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
  border: 1px solid var(--notion-border);
}

.nav-button-inactive:active {
  background-color: var(--notion-bg-selected);
  transform: translateY(0);
}

/* Active state - prominent and highlighted */
.nav-button-active {
  background: linear-gradient(135deg, var(--notion-accent, #0066cc) 0%, var(--notion-accent-dark, #0052a3) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.25);
  border: 1px solid var(--notion-accent-dark, #0052a3);
}

.nav-button-active:hover {
  box-shadow: 0 6px 16px rgba(0, 102, 204, 0.35);
  transform: translateY(-2px);
}

.nav-button-active:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.25);
}

/* Focus states for accessibility */
.nav-button:focus-visible {
  outline: 2px solid var(--notion-accent, #0066cc);
  outline-offset: 2px;
}

/* Active nav indicator - smooth transition */
.active-nav {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>