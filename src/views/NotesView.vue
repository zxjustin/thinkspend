<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-surface-0 border-b border-surface-200 px-6 py-4">
      <h1 class="text-2xl font-semibold text-surface-900">ThinkSpend</h1>
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
import { useNotesStore } from '@/stores/notes'
import { onMounted } from 'vue'

const notesStore = useNotesStore()

onMounted(() => {
  notesStore.loadFolders()
})
</script>