<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <!-- Header -->
    <header class="bg-white shadow-md border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!--Title -->
          <div class="flex items-center gap-3">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">ThinkSpend</h1>
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <Button 
              icon="pi pi-bell" 
              text 
              rounded
              severity="secondary"
            />
            <Button 
              icon="pi pi-cog" 
              text 
              rounded
              severity="secondary"
            />
            <Avatar 
              icon="pi pi-user" 
              class="bg-blue-600 text-white"
              shape="circle"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex gap-1">
          <button
            @click="$router.push('/notes')"
            :class="[
              'flex items-center gap-2 px-6 py-3 font-medium transition',
              $route.name === 'notes'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            <i class="pi pi-file text-lg"></i>
            Notes
          </button>

          <button
            @click="$router.push('/expenses')"
            :class="[
              'flex items-center gap-2 px-6 py-3 font-medium transition',
              $route.name === 'expenses'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            <i class="pi pi-dollar text-lg"></i>
            Expenses
          </button>

          <button
            @click="$router.push('/search')"
            :class="[
              'flex items-center gap-2 px-6 py-3 font-medium transition',
              $route.name === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            <i class="pi pi-search text-lg"></i>
            Search
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
</script>