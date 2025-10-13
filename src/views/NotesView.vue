<template>
  <AppLayout>
    <div class="flex gap-4 h-[calc(100vh-200px)]">
      <!-- Sidebar -->
      <NoteSidebar class="w-64" />

      <!-- Editor -->
      <NoteEditor class="flex-1" />

      <!-- Connection Panel -->
      <ConnectionPanel
        v-if="showConnectionPanel && currentNote"
        class="w-80"
        @close="showConnectionPanel = false"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import AppLayout from '@/components/common/AppLayout.vue'
import NoteSidebar from '@/components/notes/NoteSidebar.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'
import ConnectionPanel from '@/components/notes/ConnectionPanel.vue'

const notesStore = useNotesStore()
const showConnectionPanel = ref(true)

const currentNote = computed(() => notesStore.currentNote)

onMounted(() => {
  notesStore.loadFolders()
})
</script>