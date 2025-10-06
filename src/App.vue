<template>
  <div class="min-h-screen bg-gray-50">
    <RouterView />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import ConfirmDialog from 'primevue/confirmdialog'
</script>
