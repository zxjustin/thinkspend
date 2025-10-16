<template>
  <div class="notion-bg border overflow-hidden flex flex-col h-full" style="border-color: var(--notion-border); border-radius: var(--radius-md);">
    <!-- Header -->
    <div class="px-4 py-3 border-b" style="border-color: var(--notion-border);">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="pi pi-folder notion-text-secondary" style="font-size: 14px;"></i>
          <h3 class="text-sm font-medium notion-text-primary">Notes</h3>
        </div>
        <button
          @click="showNewFolderDialog = true"
          v-tooltip.top="'New Folder'"
          class="notion-button p-1.5 border-0"
        >
          <i class="pi pi-plus" style="font-size: 13px;"></i>
        </button>
      </div>
    </div>

    <!-- Folder Tree -->
    <div class="flex-1 overflow-y-auto px-2 py-3">
      <FolderTree v-if="rootFolders.length > 0" :folders="rootFolders" />

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div class="w-20 h-20 rounded-lg flex items-center justify-center mb-4" style="background-color: var(--notion-bg-secondary);">
          <i class="pi pi-folder-open notion-text-tertiary" style="font-size: 32px;"></i>
        </div>
        <h4 class="text-sm font-medium notion-text-primary mb-2">No folders yet</h4>
        <p class="text-xs notion-text-secondary mb-6" style="line-height: 1.5;">
          Create your first folder to organize your notes
        </p>
        <button
          @click="showNewFolderDialog = true"
          class="notion-button text-sm"
        >
          <i class="pi pi-plus" style="font-size: 12px;"></i>
          <span>New Folder</span>
        </button>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-2 py-2 border-t" style="border-color: var(--notion-border);">
      <button
        @click="showStats"
        class="notion-button border-0 w-full justify-start text-sm"
      >
        <i class="pi pi-chart-bar" style="font-size: 13px;"></i>
        <span>Statistics</span>
      </button>
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
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import FolderTree from './FolderTree.vue'

const notesStore = useNotesStore()
const showNewFolderDialog = ref(false)
const newFolderName = ref('')

const rootFolders = computed(() => {
  return notesStore.folders.filter(f => !f.parent_id)
})

async function createFolder() {
  if (!newFolderName.value.trim()) return
  
  await notesStore.createFolder(newFolderName.value)
  newFolderName.value = ''
  showNewFolderDialog.value = false
}

function showStats() {
  // Implement statistics modal
  console.log('Show statistics')
}
</script>