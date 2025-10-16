<template>
  <div>
    <!-- Folder Row -->
    <div
      class="group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer notion-bg-hover transition-all duration-200"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="toggleExpanded"
    >
      <!-- Expand Icon -->
      <i
        v-if="hasChildren"
        :class="isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
        class="notion-text-tertiary transition-transform duration-200"
        style="font-size: 10px;"
      ></i>
      <div v-else style="width: 10px;"></div>

      <!-- Folder Icon -->
      <i
        :class="isExpanded ? 'pi pi-folder-open' : 'pi pi-folder'"
        class="notion-text-secondary"
        style="font-size: 13px;"
      ></i>

      <!-- Folder Name -->
      <span class="text-sm font-medium notion-text-primary flex-1 truncate">{{ folder.name }}</span>

      <!-- Action Buttons -->
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          @click.stop="createNote"
          v-tooltip.top="'New Note'"
          class="notion-button p-1 border-0"
        >
          <i class="pi pi-plus" style="font-size: 11px;"></i>
        </button>
        <button
          @click.stop="confirmDeleteFolder"
          v-tooltip.top="'Delete Folder'"
          class="notion-button p-1 border-0 hover:bg-red-50"
        >
          <i class="pi pi-trash notion-text-secondary" style="font-size: 11px;"></i>
        </button>
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
        class="group/note flex items-center gap-2 px-2 py-2 mb-0.5 rounded cursor-pointer notion-bg-hover transition-all duration-200"
        :class="{
          'notion-bg-selected': isSelected(note.id)
        }"
        :style="{ paddingLeft: `${(depth + 1) * 12 + 8}px` }"
        @click="selectNote(note)"
      >
        <i class="pi pi-file notion-text-tertiary" style="font-size: 11px;"></i>
        <div class="flex-1 min-w-0">
          <div class="text-sm notion-text-primary truncate">{{ note.title }}</div>

          <!-- Connection Badges - Colored Pills for Vibrancy -->
          <div v-if="noteConnections(note.id).expenses > 0 || noteConnections(note.id).links > 0"
               class="flex gap-1.5 mt-1">
            <span v-if="noteConnections(note.id).expenses > 0" class="notion-pill notion-pill-green">
              <i class="pi pi-dollar" style="font-size: 9px;"></i>
              <span>{{ noteConnections(note.id).expenses }}</span>
            </span>
            <span v-if="noteConnections(note.id).links > 0" class="notion-pill notion-pill-purple">
              <i class="pi pi-link" style="font-size: 9px;"></i>
              <span>{{ noteConnections(note.id).links }}</span>
            </span>
          </div>
        </div>

        <!-- Delete Note Button -->
        <button
          @click.stop="confirmDeleteNote(note.id)"
          v-tooltip.top="'Delete Note'"
          class="opacity-0 group-hover/note:opacity-100 notion-button p-1 border-0 hover:bg-red-50 transition-all duration-200"
        >
          <i class="pi pi-trash notion-text-secondary" style="font-size: 11px;"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useConfirm } from 'primevue/useconfirm'
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
