<template>
  <div class="tree-node-wrapper">
    <!-- FOLDER NODE -->
    <div
      v-if="node.data.type === 'folder'"
      class="folder-node group flex items-center gap-2 px-2 py-1.5 rounded notion-bg-hover transition-all duration-200 w-full justify-between"
      :class="{ 'notion-bg-selected': dragOverFolderId === node.data.id }"
      :style="{ paddingLeft: `calc(2px + ${depth * 20}px)` }"
      @dragover.prevent="$emit('folder-drag-over', $event, node.data.id)"
      @dragleave="$emit('folder-drag-leave')"
      @drop.prevent="$emit('folder-drop', $event, node.data.id)"
    >
      <!-- Left: Chevron + Name + Badge - Clickable for expand/collapse -->
      <div
        class="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
        @click.stop="$emit('toggle-expand', node)"
      >
        <!-- Expand/Collapse Chevron -->
        <i
          v-if="hasChildren"
          :class="expandedKeys[node.key] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
          class="chevron-icon transition-transform duration-200"
          style="font-size: 12px; width: 14px; min-width: 14px; flex-shrink: 0; color: var(--notion-text-tertiary); display: inline-flex; align-items: center; justify-content: center;"
        ></i>
        <div v-else style="width: 14px; min-width: 14px; flex-shrink: 0;"></div>

        <!-- Folder Name -->
        <span class="text-sm font-medium notion-text-primary truncate min-w-0">
          {{ node.label }}
        </span>
      </div>

      <!-- Right: Action Buttons - Always visible -->
      <div class="action-buttons-group flex gap-0.5 flex-shrink-0 ml-2">
        <Button
          @click.stop="$emit('create-note', node.data.id)"
          v-tooltip.top="'New Note'"
          icon="pi pi-plus"
          text
          rounded
          size="small"
          class="p-button-sm action-button-prime"
          title="Add new note"
        />
        <Button
          @click.stop="$emit('delete-folder', node.data.id, node.label)"
          v-tooltip.top="'Delete Folder'"
          icon="pi pi-trash"
          text
          rounded
          size="small"
          class="p-button-sm action-button-prime"
          title="Delete this folder"
        />
      </div>
    </div>

    <!-- Child notes and folders wrapper - Only renders when expanded -->
    <div v-if="expandedKeys[node.key]" class="children-container">
      <!-- Child notes -->
      <div
        v-for="note in childNotes"
        :key="note.key"
        draggable="true"
        class="note-node group/note flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer notion-bg-hover transition-all duration-200 min-w-0 w-full justify-between"
        :class="{
          'notion-bg-selected': isSelected(note.data.id),
          'dragging': draggedNoteId === note.data.id
        }"
        :style="{ paddingLeft: `calc(2px + ${(depth + 1) * 20 + 10}px)` }"
        @click="$emit('select-note', note.data.id)"
        @dragstart="$emit('drag-start', $event, note.data)"
        @dragend="$emit('drag-end')"
      >
        <!-- Note Content -->
        <div class="flex-1 min-w-0">
          <div class="text-sm notion-text-primary truncate min-w-0">
            {{ note.label }}
          </div>
        </div>

        <!-- Delete Note Button -->
        <button
          @click.stop="$emit('delete-note', note.data.id, note.label)"
          v-tooltip.top="'Delete Note'"
          class="note-delete-button action-button flex items-center justify-center rounded transition-opacity duration-200 flex-shrink-0 ml-auto"
          title="Delete this note"
        >
          <i class="pi pi-trash text-red-600" style="font-size: 12px;"></i>
        </button>
      </div>

      <!-- Child folders (recursive) -->
      <TreeNodeComponent
        v-for="childFolder in childFolders"
        :key="childFolder.key"
        :node="childFolder"
        :depth="depth + 1"
        :expanded-keys="expandedKeys"
        :drag-over-folder-id="dragOverFolderId"
        :dragged-note-id="draggedNoteId"
        @toggle-expand="(node) => $emit('toggle-expand', node)"
        @create-note="(folderId) => $emit('create-note', folderId)"
        @delete-folder="(folderId, folderName) => $emit('delete-folder', folderId, folderName)"
        @select-note="(noteId) => $emit('select-note', noteId)"
        @delete-note="(noteId, noteTitle) => $emit('delete-note', noteId, noteTitle)"
        @drag-start="(event, note) => $emit('drag-start', event, note)"
        @drag-end="() => $emit('drag-end')"
        @folder-drag-over="(event, folderId) => $emit('folder-drag-over', event, folderId)"
        @folder-drag-leave="() => $emit('folder-drag-leave')"
        @folder-drop="(event, folderId) => $emit('folder-drop', event, folderId)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Button from 'primevue/button'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  expandedKeys: {
    type: Object,
    required: true
  },
  dragOverFolderId: {
    type: [String, Number, null],
    default: null
  },
  draggedNoteId: {
    type: [String, Number, null],
    default: null
  }
})

defineEmits([
  'toggle-expand',
  'create-note',
  'delete-folder',
  'select-note',
  'delete-note',
  'drag-start',
  'drag-end',
  'folder-drag-over',
  'folder-drag-leave',
  'folder-drop'
])

const notesStore = useNotesStore()

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const childNotes = computed(() => {
  return props.node.children?.filter(n => n.data.type === 'note') || []
})

const childFolders = computed(() => {
  return props.node.children?.filter(n => n.data.type === 'folder') || []
})

function isSelected(noteId) {
  return notesStore.currentNote?.id === noteId
}
</script>

<style scoped>
.tree-node-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
}

.children-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
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

/* Chevron icon visibility - always visible */
.chevron-icon {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

/* Action buttons always visible */
.action-buttons-group {
  opacity: 1 !important;
  visibility: visible;
  pointer-events: auto;
  transition: none;
}

/* Note delete button always visible */
.note-delete-button {
  opacity: 1 !important;
  visibility: visible;
  transition: none;
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
