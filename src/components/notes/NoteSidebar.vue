<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-gray-800 text-sm">Notes</h3>
        <Button 
          icon="pi pi-plus" 
          rounded
          text
          size="small"
          @click="showNewFolderDialog = true"
          v-tooltip.top="'New Folder'"
        />
      </div>
    </div>

    <!-- Folder Tree -->
    <div class="flex-1 overflow-y-auto p-4">
      <FolderTree :folders="rootFolders" />
    </div>

    <!-- Bottom Actions -->
    <div class="p-4 border-t border-gray-200 bg-gray-50">
      <Button 
        icon="pi pi-chart-bar"
        label="Statistics"
        text
        size="small"
        class="w-full justify-start"
        @click="showStats"
      />
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