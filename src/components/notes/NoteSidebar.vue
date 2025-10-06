<template>
  <div class="flex flex-col h-full bg-surface-50">
    <!-- Toolbar -->
    <div class="p-4 border-b border-surface-200">
      <Button 
        label="New Folder" 
        icon="pi pi-folder-plus" 
        @click="showNewFolderDialog = true"
        class="w-full"
        severity="secondary"
      />
    </div>

    <!-- Folder Tree -->
    <div class="flex-1 overflow-y-auto p-4">
      <FolderTree :folders="rootFolders" />
    </div>

    <!-- New Folder Dialog -->
    <Dialog 
      v-model:visible="showNewFolderDialog" 
      header="Create New Folder"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col gap-4">
        <InputText 
          v-model="newFolderName" 
          placeholder="Folder name"
          @keyup.enter="createFolder"
        />
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="showNewFolderDialog = false" />
          <Button label="Create" @click="createFolder" />
        </div>
      </div>
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
</script>