<template>
  <div class="min-h-screen bg-gray-50">
    <RouterView />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ConfirmDialog from 'primevue/confirmdialog'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>
