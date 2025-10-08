<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-surface-0 border-b border-surface-200 px-6 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-surface-900">ThinkSpend</h1>
      <div class="flex gap-2">
        <Button
          label="Notes"
          icon="pi pi-file"
          @click="$router.push('/notes')"
        />
        <Button
          label="Expenses"
          icon="pi pi-wallet"
          outlined
          @click="$router.push('/expenses')"
        />
      </div>
    </div>

    <!-- Main Layout: Sidebar + Editor -->
    <div class="flex-1 flex overflow-hidden">
      <NoteSidebar class="w-64 border-r border-surface-200" />
      <NoteEditor class="flex-1" />
    </div>
  </div>
</template>

<script setup>
import NoteSidebar from '@/components/notes/NoteSidebar.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'
import Button from 'primevue/button'
import { useNotesStore } from '@/stores/notes'
import { onMounted } from 'vue'

const notesStore = useNotesStore()

onMounted(() => {
  notesStore.loadFolders()
})
</script>