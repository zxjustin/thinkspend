<template>
  <AppLayout>
    <!-- Toggle Graph Button -->
    <div class="mb-6 flex items-center gap-2">
      <button
        @click="showGraphView = !showGraphView"
        :class="[
          'notion-button text-sm',
          showGraphView ? 'notion-bg-selected' : ''
        ]"
      >
        <i :class="showGraphView ? 'pi pi-times' : 'pi pi-sitemap'" style="font-size: 13px;"></i>
        <span>{{ showGraphView ? 'Close Graph' : 'Knowledge Graph' }}</span>
      </button>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
      <!-- Sidebar -->
      <NoteSidebar class="w-full lg:w-64 lg:flex-shrink-0" />

      <!-- Editor or Graph View -->
      <GraphView
        v-if="showGraphView"
        class="flex-1 min-h-[400px] lg:min-h-0"
        @close="showGraphView = false"
      />
      <NoteEditor
        v-else
        class="flex-1 min-h-[400px] lg:min-h-0"
      />

      <!-- Connection Panel (only show when not in graph view) -->
      <ConnectionPanel
        v-if="!showGraphView && showConnectionPanel && currentNote"
        class="w-full lg:w-80 lg:flex-shrink-0"
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

const notesStore = useNotesStore()
const showConnectionPanel = ref(true)
const showGraphView = ref(false)

const currentNote = computed(() => notesStore.currentNote)

onMounted(() => {
  notesStore.loadFolders()
})
</script>