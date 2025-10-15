<template>
  <AppLayout>
    <!-- Toggle Graph Button -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex gap-2">
        <Button
          :icon="showGraphView ? 'pi pi-times' : 'pi pi-sitemap'"
          :label="showGraphView ? 'Close Graph' : 'Show Knowledge Graph'"
          @click="showGraphView = !showGraphView"
          :severity="showGraphView ? 'secondary' : 'info'"
          size="small"
        />
      </div>
    </div>

    <div class="flex gap-4 h-[calc(100vh-250px)]">
      <!-- Sidebar -->
      <NoteSidebar class="w-64" />

      <!-- Editor or Graph View -->
      <GraphView
        v-if="showGraphView"
        class="flex-1"
        @close="showGraphView = false"
      />
      <NoteEditor
        v-else
        class="flex-1"
      />

      <!-- Connection Panel (only show when not in graph view) -->
      <ConnectionPanel
        v-if="!showGraphView && showConnectionPanel && currentNote"
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
import GraphView from '@/components/notes/GraphView.vue'
import Button from 'primevue/button'

const notesStore = useNotesStore()
const showConnectionPanel = ref(true)
const showGraphView = ref(false)

const currentNote = computed(() => notesStore.currentNote)

onMounted(() => {
  notesStore.loadFolders()
})
</script>