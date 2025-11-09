<template>
  <div class="notion-bg border overflow-hidden flex flex-col h-full" style="border-color: var(--notion-border); border-radius: var(--radius-md);">
    <!-- Header with Action Button -->
    <div class="px-3 py-3 border-b flex-shrink-0" style="border-color: var(--notion-border);">
      <!-- New Folder - PRIMARY action -->
      <button
        @click="showNewFolderDialog = true"
        v-tooltip.top="'Create new folder'"
        class="primary-button w-full text-xs py-2.5 px-3 justify-center font-medium rounded transition-all duration-150"
        title="Create a new folder"
      >
        <i class="pi pi-folder-plus" style="font-size: 13px;"></i>
        <span class="ml-1.5">New Folder</span>
      </button>
    </div>

    <!-- Main Content Area - Two independent scrollable sections -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <!-- Recent Notes Section - Fixed Height container with its own scroll -->
      <div v-if="recentNotes.length > 0" class="flex-shrink-0 border-b overflow-hidden" style="border-color: var(--notion-border); height: 200px;">
        <div class="h-full overflow-y-auto">
          <div class="px-2 py-3">
            <div class="flex items-center justify-between px-2 mb-2">
              <span class="text-xs font-medium notion-text-secondary">Recent</span>
            </div>
            <div
              v-for="note in recentNotes"
              :key="note.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer notion-bg-hover transition-all duration-200 min-w-0 w-full"
              :class="{ 'notion-bg-selected': isSelected(note.id) }"
              @click="selectNote(note)"
              @dragstart="handleNoteDragStart($event, note)"
              @dragend="handleNoteDragEnd"
            >
              <i class="pi pi-clock notion-text-tertiary flex-shrink-0" style="font-size: 10px; width: 14px; min-width: 14px; display: inline-flex; align-items: center; justify-content: center;"></i>
              <span class="text-xs notion-text-primary truncate min-w-0 flex-1">{{ note.title }}</span>
              <span class="text-xs notion-text-tertiary flex-shrink-0 whitespace-nowrap">{{ formatTimeAgo(note.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Folders - Flexing to fill remaining space with its own scroll -->
      <div class="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <!-- All Folders Section -->
        <div class="px-2 py-3">
          <div class="px-2 mb-2">
            <span class="text-xs font-medium notion-text-secondary">All Folders</span>
          </div>

          <TreeFolderView
            v-if="notesStore.folders.length > 0"
          />

          <!-- Empty State -->
          <div v-if="notesStore.folders.length === 0" class="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div class="w-16 h-16 rounded-lg flex items-center justify-center mb-3" style="background-color: var(--notion-bg-secondary);">
              <i class="pi pi-folder-open notion-text-tertiary" style="font-size: 24px;"></i>
            </div>
            <h4 class="text-xs font-medium notion-text-primary mb-1">No folders yet</h4>
            <p class="text-xs notion-text-secondary mb-4" style="line-height: 1.4;">
              Create your first folder to organize notes
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- New Folder Dialog -->
    <Dialog
      v-model:visible="showNewFolderDialog"
      header="Create New Folder"
      :style="{ width: '400px', zIndex: 9999 }"
      :contentStyle="{ zIndex: 9999 }"
      modal
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
          <InputText 
            v-model="newFolderName" 
            placeholder="e.g., Work Projects"
            class="w-full"
            @keyup.enter="createFolder"
            autofocus
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="showNewFolderDialog = false" />
        <Button label="Create" @click="createFolder" :disabled="!newFolderName.trim()" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import TreeFolderView from './TreeFolderView.vue'

const notesStore = useNotesStore()
const showNewFolderDialog = ref(false)
const newFolderName = ref('')


const recentNotes = computed(() => {
  return notesStore.notes
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
})

async function createFolder() {
  if (!newFolderName.value.trim()) return

  await notesStore.createFolder(newFolderName.value)
  newFolderName.value = ''
  showNewFolderDialog.value = false
}

async function selectNote(note) {
  await notesStore.selectNote(note.id)
}

function isSelected(noteId) {
  return notesStore.currentNote?.id === noteId
}

function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

// Drag and Drop handlers for recent notes
function handleNoteDragStart(event, note) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('noteId', note.id)
  event.dataTransfer.setData('noteTitle', note.title)
  event.target.style.opacity = '0.5'
}

function handleNoteDragEnd(event) {
  event.target.style.opacity = '1'
}

onMounted(() => {
  console.log('📝 NoteSidebar mounted')
})

onUnmounted(() => {
  console.log('📝 NoteSidebar unmounted')
})
</script>

<style scoped>
/* Primary button styling */
.primary-button {
  display: flex;
  align-items: center;
  border: none;
  background-color: var(--notion-accent, #0066cc);
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 150ms ease;
}

.primary-button:hover {
  background-color: var(--notion-accent-dark, #0052a3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.primary-button:active {
  background-color: var(--notion-accent-darker, #003d7a);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Clock icon visibility in recent notes */
.pi-clock {
  visibility: visible;
  opacity: 1;
  display: inline-block;
}

/* Drag cursor feedback */
[draggable="true"] {
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>