<template>
  <div class="tree-folder-view">
    <!-- Render tree nodes recursively -->
    <TreeNodeComponent
      v-for="node in treeData"
      :key="node.key"
      :node="node"
      :expanded-keys="expandedKeys"
      :drag-over-folder-id="dragOverFolderId"
      :dragged-note-id="draggedNoteId"
      @toggle-expand="toggleNodeExpand"
      @create-note="createNote"
      @delete-folder="confirmDeleteFolder"
      @select-note="selectNote"
      @delete-note="confirmDeleteNote"
      @drag-start="handleNoteDragStart"
      @drag-end="handleNoteDragEnd"
      @folder-drag-over="handleFolderDragOver"
      @folder-drag-leave="handleFolderDragLeave"
      @folder-drop="handleFolderDrop"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import TreeNodeComponent from './TreeNodeComponent.vue'

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()
const confirm = useConfirm()

const dragOverFolderId = ref(null)
const draggedNoteId = ref(null)
const expandedKeys = ref({}) // Track which folder nodes are expanded

// Transform folders to tree data
const treeData = computed(() => {
  return notesStore.transformFoldersToTree()
})

// Watch for tree data changes and initialize expanded state
watch(() => treeData.value, (newTreeData) => {
  if (newTreeData && newTreeData.length > 0) {
    // Initialize expandedKeys with all folder nodes
    const keys = {}
    function initializeKeys(nodes) {
      nodes.forEach(node => {
        if (node.data.type === 'folder') {
          keys[node.key] = true // All folders start expanded
          if (node.children) {
            initializeKeys(node.children)
          }
        }
      })
    }
    initializeKeys(newTreeData)
    expandedKeys.value = keys
  }
}, { immediate: true })

// Count notes in a folder (excluding sub-folders)
function countNotesInFolder(folderId) {
  return notesStore.notes.filter(n => n.folder_id === folderId).length
}

// Toggle node expand/collapse
async function toggleNodeExpand(node) {
  if (expandedKeys.value[node.key]) {
    // Collapse
    delete expandedKeys.value[node.key]
  } else {
    // Expand
    expandedKeys.value[node.key] = true
    // Load notes when expanding
    if (node.data.type === 'folder') {
      await notesStore.loadNotes(node.data.id)
    }
  }
  // Trigger update
  expandedKeys.value = { ...expandedKeys.value }
}

// Create new note in folder
async function createNote(folderId) {
  await notesStore.createNote(folderId)
}

// Select note
async function selectNote(noteId) {
  await notesStore.selectNote(noteId)
}

// Check if note is selected
function isSelected(noteId) {
  return notesStore.currentNote?.id === noteId
}

// Delete folder with confirmation
function confirmDeleteFolder(folderId, folderName) {
  confirm.require({
    message: `Delete folder "${folderName}"? This will also delete all notes inside.`,
    header: 'Delete Folder',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await notesStore.deleteFolder(folderId)
        console.log('✅ Folder deleted:', folderName)
      } catch (error) {
        console.error('❌ Failed to delete folder:', error)
        alert('Failed to delete folder. It may contain notes.')
      }
    }
  })
}

// Delete note with confirmation
function confirmDeleteNote(noteId, noteTitle) {
  confirm.require({
    message: `Delete note "${noteTitle}"? This action cannot be undone.`,
    header: 'Delete Note',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await notesStore.deleteNote(noteId)
        console.log('✅ Note deleted:', noteTitle)
      } catch (error) {
        console.error('❌ Failed to delete note:', error)
        alert('Failed to delete note.')
      }
    }
  })
}

// Drag and Drop handlers
function handleNoteDragStart(event, note) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('noteId', note.id)
  event.dataTransfer.setData('noteTitle', note.title)
  draggedNoteId.value = note.id
  console.log('🎯 Started dragging note:', note.title)
}

function handleNoteDragEnd() {
  draggedNoteId.value = null
  console.log('🎯 Drag ended')
}

function handleFolderDragOver(event, folderId) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverFolderId.value = folderId
}

function handleFolderDragLeave() {
  dragOverFolderId.value = null
}

async function handleFolderDrop(event, folderId) {
  event.preventDefault()
  dragOverFolderId.value = null

  const noteId = event.dataTransfer.getData('noteId')
  const noteTitle = event.dataTransfer.getData('noteTitle')

  if (!noteId) return

  try {
    await notesStore.moveNote(noteId, folderId)
    console.log(`✅ Moved note "${noteTitle}" to folder`)
  } catch (error) {
    console.error('❌ Failed to move note:', error)
    alert('Failed to move note.')
  }
}

onMounted(() => {
  console.log('🌳 TreeFolderView mounted')
})
</script>

<style scoped>
.tree-folder-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.tree-node-container {
  width: 100%;
}

/* PrimeVue Tree styling */
:deep(.p-tree) {
  background: transparent;
  border: none;
  padding: 0;
  width: 100%;
}

:deep(.p-tree .p-tree-container) {
  padding: 0;
  width: 100%;
}

:deep(.p-tree .p-treenode) {
  padding: 0;
  margin: 0;
}

:deep(.p-tree .p-treenode-content) {
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
}

:deep(.p-tree .p-treenode-label) {
  padding: 0;
  color: inherit;
}

:deep(.p-tree .p-treenode-toggle) {
  width: 14px;
  min-width: 14px;
  height: auto;
  margin: 0;
  padding: 0;
  color: var(--notion-text-tertiary);
}

/* Connection Pills */
.notion-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.notion-pill-green {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.notion-pill-purple {
  background-color: rgba(156, 39, 176, 0.15);
  color: #9c27b0;
}

/* PrimeVue Button styling for action buttons */
:deep(.action-button-prime.p-button-sm) {
  padding: 0.25rem 0.35rem;
  font-size: 0.75rem;
  background-color: transparent !important;
  color: inherit !important;
}

:deep(.action-button-prime.p-button-text:not(:disabled):hover) {
  background-color: transparent !important;
  color: var(--notion-text, #000) !important;
}

:deep(.action-button-prime.p-button-text .p-icon) {
  color: currentColor !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Action button for notes */
.action-button {
  padding: 0.4rem 0.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: var(--notion-text-secondary, #626262);
  font-weight: 500;
  font-size: 0.875rem;
  transition: opacity 300ms ease;
  visibility: visible;
}

.action-button:hover {
  background-color: transparent;
}

/* Drag cursor feedback */
[draggable='true'] {
  cursor: grab;
}

[draggable='true']:active {
  cursor: grabbing;
}

/* Dragging state */
.dragging {
  opacity: 0.5;
}
</style>
