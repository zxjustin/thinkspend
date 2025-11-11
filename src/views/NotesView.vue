<template>
  <AppLayout>
    <div class="flex flex-col h-full overflow-hidden">
      <!-- Toggle Graph Button - Fixed height, no vertical margin -->
      <div class="flex-shrink-0 flex items-center gap-2 px-1 py-2">
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

      <!-- Main Content - Flexes to fill remaining space -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <ResizableLayoutContainer
          storage-key="notes-view-layout"
          :show-right-panel="!showGraphView && showConnectionPanel && currentNote"
        >
          <template #left>
            <NoteSidebar />
          </template>

          <template #main>
            <GraphView
              v-if="showGraphView"
              @close="showGraphView = false"
            />
            <NoteEditor v-else />
          </template>

          <template #right>
            <ConnectionPanel
              v-if="!showGraphView && showConnectionPanel && currentNote"
              @close="showConnectionPanel = false"
            />
          </template>
        </ResizableLayoutContainer>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import AppLayout from '@/components/common/AppLayout.vue'
import ResizableLayoutContainer from '@/components/common/ResizableLayoutContainer.vue'
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