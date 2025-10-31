<template>
  <div class="notion-bg border overflow-hidden flex flex-col h-full" style="border-color: var(--notion-border); border-radius: var(--radius-md);">
    <!-- Zero-Click Header (Fitts' Law Optimized) -->
    <div class="px-3 py-2.5 border-b" style="border-color: var(--notion-border);">
      <!-- Row 1: Search (Always Visible) -->
      <div class="mb-2">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search" style="font-size: 11px;"></i>
          <InputText
            v-model="searchQuery"
            placeholder="Search notes..."
            class="w-full text-xs"
            style="padding-left: 2.25rem;"
          />
        </span>
      </div>

      <!-- Row 2: Direct Action Buttons -->
      <div class="flex gap-2">
        <!-- Quick Note - PRIMARY action, biggest target -->
        <button
          @click="quickCapture"
          v-tooltip.top="'Quick note → goes to inbox'"
          class="flex-1 notion-button text-xs py-2 justify-center font-medium"
        >
          <i class="pi pi-bolt" style="font-size: 12px;"></i>
          <span>Quick Note</span>
        </button>

        <!-- New Folder - SECONDARY action -->
        <button
          @click="showNewFolderDialog = true"
          v-tooltip.top="'Create new folder'"
          class="notion-button text-xs py-2 px-3 justify-center"
        >
          <i class="pi pi-folder-plus" style="font-size: 12px;"></i>
        </button>
      </div>

      <!-- Quick Note Destination Hint -->
      <div v-if="quickNotesFolder" class="mt-2 px-2 py-1.5 rounded text-xs notion-text-tertiary" style="background-color: var(--notion-bg-secondary);">
        <i class="pi pi-info-circle" style="font-size: 10px;"></i>
        Quick notes go to: <span class="font-medium">📥 {{ quickNotesFolder.name }}</span>
      </div>
    </div>

    <!-- Recent Notes Section -->
    <div v-if="recentNotes.length > 0 && !searchQuery" class="px-2 py-2 border-b" style="border-color: var(--notion-border);">
      <div class="flex items-center justify-between px-2 mb-1">
        <span class="text-xs font-medium notion-text-secondary">Recent</span>
      </div>
      <div
        v-for="note in recentNotes"
        :key="note.id"
        draggable="true"
        class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer notion-bg-hover transition-all duration-200"
        :class="{ 'notion-bg-selected': isSelected(note.id) }"
        @click="selectNote(note)"
        @dragstart="handleNoteDragStart($event, note)"
        @dragend="handleNoteDragEnd"
      >
        <i class="pi pi-clock notion-text-tertiary" style="font-size: 10px;"></i>
        <span class="text-xs notion-text-primary truncate flex-1">{{ note.title }}</span>
        <span class="text-xs notion-text-tertiary">{{ formatTimeAgo(note.updated_at) }}</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto">
      <!-- All Folders Section (when not searching) -->
      <div v-if="!searchQuery" class="px-2 py-2">
        <div class="px-2 mb-2">
          <span class="text-xs font-medium notion-text-secondary">All Folders</span>
        </div>

        <FolderTree
          v-if="rootFolders.length > 0"
          :folders="rootFolders"
          :expand-signal="expandSignal"
          :collapse-signal="collapseSignal"
        />

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div class="w-16 h-16 rounded-lg flex items-center justify-center mb-3" style="background-color: var(--notion-bg-secondary);">
            <i class="pi pi-folder-open notion-text-tertiary" style="font-size: 24px;"></i>
          </div>
          <h4 class="text-xs font-medium notion-text-primary mb-1">No folders yet</h4>
          <p class="text-xs notion-text-secondary mb-4" style="line-height: 1.4;">
            Create your first folder to organize notes
          </p>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else class="px-2 py-2">
        <div class="px-2 mb-2">
          <span class="text-xs font-medium notion-text-secondary">Search Results</span>
          <span class="text-xs notion-text-tertiary ml-1">({{ filteredNotes.length }})</span>
        </div>
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer notion-bg-hover transition-all duration-200"
          :class="{ 'notion-bg-selected': isSelected(note.id) }"
          @click="selectNote(note)"
        >
          <i class="pi pi-file notion-text-tertiary" style="font-size: 10px;"></i>
          <div class="flex-1 min-w-0">
            <div class="text-xs notion-text-primary truncate">{{ note.title }}</div>
            <div class="text-xs notion-text-tertiary">{{ getFolderName(note.folder_id) }}</div>
          </div>
        </div>
        <div v-if="filteredNotes.length === 0" class="px-2 py-4 text-center">
          <i class="pi pi-search notion-text-tertiary mb-2" style="font-size: 20px; display: block;"></i>
          <p class="text-xs notion-text-secondary">No notes found</p>
        </div>
      </div>
    </div>

    <!-- New Folder Dialog -->
    <Dialog 
      v-model:visible="showNewFolderDialog" 
      header="Create New Folder"
      :style="{ width: '400px' }"
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
import FolderTree from './FolderTree.vue'

const notesStore = useNotesStore()
const showNewFolderDialog = ref(false)
const newFolderName = ref('')
const searchQuery = ref('')
const expandSignal = ref(0)
const collapseSignal = ref(0)

const rootFolders = computed(() => {
  return notesStore.folders.filter(f => !f.parent_id)
})

const quickNotesFolder = computed(() => {
  return notesStore.folders.find(f => f.name === 'Quick Notes')
})

const recentNotes = computed(() => {
  return notesStore.notes
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
})

const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase()
  return notesStore.notes.filter(note =>
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query)
  )
})

async function createFolder() {
  if (!newFolderName.value.trim()) return

  await notesStore.createFolder(newFolderName.value)
  newFolderName.value = ''
  showNewFolderDialog.value = false
}

async function quickCapture() {
  // Always create in dedicated "Quick Notes" inbox folder
  let inboxFolder = notesStore.folders.find(f => f.name === 'Quick Notes')

  if (!inboxFolder) {
    // Create inbox folder if it doesn't exist
    inboxFolder = await notesStore.createFolder('Quick Notes')
    console.log('📥 Created Quick Notes inbox folder')
  }

  const newNote = await notesStore.createNote(inboxFolder.id, 'Quick Note')
  notesStore.selectNote(newNote.id)
  console.log('⚡ Quick note created in inbox')
}

function selectNote(note) {
  notesStore.selectNote(note.id)
  searchQuery.value = '' // Clear search after selecting
}

function isSelected(noteId) {
  return notesStore.currentNote?.id === noteId
}

function getFolderName(folderId) {
  const folder = notesStore.folders.find(f => f.id === folderId)
  return folder ? folder.name : 'Unknown'
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

// Keyboard shortcut for quick capture (Ctrl+N / Cmd+N)
function handleKeyPress(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    quickCapture()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
/* Drag cursor feedback */
[draggable="true"] {
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>