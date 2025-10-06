<template>
  <div>
    <!-- Folder Row -->
    <div 
      class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-surface-100 transition-colors"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="toggleExpanded"
    >
      <!-- Expand/Collapse Icon -->
      <i 
        :class="hasChildren ? (isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right') : 'pi pi-minus'"
        class="text-xs text-surface-500"
      ></i>
      
      <!-- Folder Icon -->
      <i class="pi pi-folder text-primary-500"></i>
      
      <!-- Folder Name -->
      <span class="text-sm text-surface-700 flex-1">{{ folder.name }}</span>
      
      <!-- Actions -->
      <Button
        icon="pi pi-plus"
        text
        rounded
        size="small"
        @click.stop="createNote"
        v-tooltip.top="'New Note'"
      />
      <Button
        icon="pi pi-trash"
        text
        rounded
        size="small"
        severity="danger"
        @click.stop="confirmDeleteFolder"
        v-tooltip.top="'Delete Folder'"
      />
    </div>

    <!-- Child Folders (Recursive) -->
    <div v-if="isExpanded && hasChildren">
      <FolderTree 
        :folders="childFolders" 
        :depth="depth + 1"
      />
    </div>

    <!-- Notes in this Folder -->
    <div v-if="isExpanded" class="ml-6">
      <div
        v-for="note in folderNotes"
        :key="note.id"
        class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-surface-100 transition-colors group"
        :class="{ 'bg-primary-50': isSelected(note.id) }"
        @click="selectNote(note)"
      >
        <i class="pi pi-file text-xs text-surface-400"></i>
        <span class="text-sm text-surface-600 flex-1">{{ note.title }}</span>
        <Button
          icon="pi pi-trash"
          text
          rounded
          size="small"
          severity="danger"
          @click.stop="confirmDeleteNote(note.id)"
          v-tooltip.top="'Delete Note'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
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
const confirm = useConfirm()
const isExpanded = ref(false)

const hasChildren = computed(() => {
  return notesStore.folders.some(f => f.parent_id === props.folder.id)
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
}

function selectNote(note) {
  notesStore.selectNote(note.id)
}

function isSelected(noteId) {
  return notesStore.currentNote?.id === noteId
}

function confirmDeleteFolder() {
  confirm.require({
    message: `Delete "${props.folder.name}" and all its contents?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await notesStore.deleteFolder(props.folder.id)
    }
  })
}

function confirmDeleteNote(noteId) {
  confirm.require({
    message: 'Delete this note?',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await notesStore.deleteNote(noteId)
    }
  })
}
</script>