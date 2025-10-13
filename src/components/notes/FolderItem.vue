<template>
  <div>
    <!-- Folder Row -->
    <div 
      class="group flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
      :style="{ paddingLeft: `${depth * 16 + 12}px` }"
      @click="toggleExpanded"
    >
      <!-- Expand Icon -->
      <i 
        v-if="hasChildren"
        :class="isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
        class="text-xs text-gray-600"
      ></i>
      <div v-else class="w-3"></div>
      
      <!-- Folder Icon -->
      <i 
        :class="isExpanded ? 'pi pi-folder-open' : 'pi pi-folder'"
        class="text-blue-600"
      ></i>
      
      <!-- Folder Name -->
      <span class="text-sm font-medium text-gray-700 flex-1">{{ folder.name }}</span>

      <!-- Action Buttons -->
      <div class="flex gap-1 opacity-0 group-hover:opacity-100">
        <Button
          icon="pi pi-plus"
          text
          rounded
          size="small"
          @click.stop="createNote"
          v-tooltip.top="'New Note'"
          severity="success"
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          size="small"
          @click.stop="confirmDeleteFolder"
          v-tooltip.top="'Delete Folder'"
          severity="danger"
        />
      </div>
    </div>

    <!-- Child Folders (Recursive) -->
    <div v-if="isExpanded && hasChildren">
      <FolderTree 
        :folders="childFolders" 
        :depth="depth + 1"
      />
    </div>

    <!-- Notes in this Folder -->
    <div v-if="isExpanded">
      <div
        v-for="note in folderNotes"
        :key="note.id"
        class="group/note flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-blue-50 transition-colors"
        :class="{
          'bg-blue-100 border-l-2 border-blue-600': isSelected(note.id)
        }"
        :style="{ paddingLeft: `${(depth + 1) * 16 + 12}px` }"
        @click="selectNote(note)"
      >
        <i class="pi pi-file text-xs text-gray-500"></i>
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-800 truncate">{{ note.title }}</div>

          <!-- Connection Badges -->
          <div v-if="noteConnections(note.id).expenses > 0 || noteConnections(note.id).links > 0"
               class="flex gap-2 text-xs text-gray-500 mt-0.5">
            <span v-if="noteConnections(note.id).expenses > 0" class="flex items-center gap-0.5">
              <i class="pi pi-dollar text-[10px]"></i>
              {{ noteConnections(note.id).expenses }}
            </span>
            <span v-if="noteConnections(note.id).links > 0" class="flex items-center gap-0.5">
              <i class="pi pi-link text-[10px]"></i>
              {{ noteConnections(note.id).links }}
            </span>
          </div>
        </div>

        <!-- Delete Note Button -->
        <Button
          icon="pi pi-trash"
          text
          rounded
          size="small"
          class="opacity-0 group-hover/note:opacity-100"
          @click.stop="confirmDeleteNote(note.id)"
          v-tooltip.top="'Delete Note'"
          severity="danger"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import FolderTree from './FolderTree.vue'

const props = defineProps({
  folder: Object,
  depth: {
    type: Number,
    default: 0
  }
})

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()
const confirm = useConfirm()
const isExpanded = ref(false)

const hasChildren = computed(() => {
  return notesStore.folders.some(f => f.parent_id === props.folder.id) ||
         notesStore.notes.some(n => n.folder_id === props.folder.id)
})

const childFolders = computed(() => {
  return notesStore.folders.filter(f => f.parent_id === props.folder.id)
})

const folderNotes = computed(() => {
  return notesStore.notes.filter(n => n.folder_id === props.folder.id)
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    notesStore.loadNotes(props.folder.id)
  }
}

async function createNote() {
  await notesStore.createNote(props.folder.id)
  if (!isExpanded.value) {
    isExpanded.value = true
  }
}

function selectNote(note) {
  notesStore.selectNote(note.id)
}

function isSelected(noteId) {
  return notesStore.currentNote?.id === noteId
}

function noteConnections(noteId) {
  const expenses = expensesStore.expenses.filter(e => e.source_note_id === noteId).length

  // Count wiki-links
  const note = notesStore.notes.find(n => n.id === noteId)
  const linkPattern = /\[\[([^\]]+)\]\]/g
  const links = note ? (note.content.match(linkPattern) || []).length : 0

  return { expenses, links }
}

// Delete confirmation dialogs
function confirmDeleteFolder() {
  confirm.require({
    message: `Delete folder "${props.folder.name}"? This will also delete all notes inside.`,
    header: 'Delete Folder',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await notesStore.deleteFolder(props.folder.id)
        console.log('✅ Folder deleted:', props.folder.name)
      } catch (error) {
        console.error('❌ Failed to delete folder:', error)
        alert('Failed to delete folder. It may contain notes.')
      }
    }
  })
}

function confirmDeleteNote(noteId) {
  const note = notesStore.notes.find(n => n.id === noteId)
  if (!note) return

  confirm.require({
    message: `Delete note "${note.title}"? This action cannot be undone.`,
    header: 'Delete Note',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await notesStore.deleteNote(noteId)
        console.log('✅ Note deleted:', note.title)
      } catch (error) {
        console.error('❌ Failed to delete note:', error)
        alert('Failed to delete note.')
      }
    }
  })
}
</script>