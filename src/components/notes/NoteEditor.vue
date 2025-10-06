<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Empty State -->
    <div v-if="!currentNote" class="flex-1 flex items-center justify-center">
      <div class="text-center text-surface-400">
        <i class="pi pi-file text-6xl mb-4"></i>
        <p class="text-lg">Select a note to start editing</p>
      </div>
    </div>

    <!-- Note Editor -->
    <div v-else class="flex-1 flex flex-col">
      <!-- Title Bar -->
      <div class="border-b border-surface-200 p-6">
        <InputText 
          v-model="title"
          placeholder="Untitled"
          class="w-full text-3xl font-bold border-0 p-0 focus:ring-0"
          unstyled
        />
        
        <!-- Save Status -->
        <div class="mt-2 flex items-center gap-2 text-sm text-surface-500">
          <i :class="saveIcon"></i>
          <span>{{ saveStatus }}</span>
        </div>
      </div>

      <!-- Content Editor -->
      <div class="flex-1 overflow-y-auto p-6">
        <Editor 
          v-model="content"
          editorStyle="min-height: 300px; border: none;"
          class="custom-editor"
        >
          <template #toolbar>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-list" value="ordered"></button>
              <button class="ql-list" value="bullet"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-link"></button>
            </span>
          </template>
        </Editor>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useAutoSave } from '@/composables/useAutoSave'
import InputText from 'primevue/inputtext'
import Editor from 'primevue/editor'

const notesStore = useNotesStore()

const title = ref('')
const content = ref('')
const saveStatus = ref('saved')

const currentNote = computed(() => notesStore.currentNote)

const saveIcon = computed(() => {
  return {
    'pi pi-check-circle text-green-500': saveStatus.value === 'saved',
    'pi pi-spin pi-spinner': saveStatus.value === 'saving',
    'pi pi-times-circle text-red-500': saveStatus.value === 'error'
  }
})

// Auto-save composable
const { triggerSave } = useAutoSave(async () => {
  if (!currentNote.value) return
  
  saveStatus.value = 'saving'
  
  try {
    await notesStore.updateNote(currentNote.value.id, {
      title: title.value,
      content: content.value
    })
    saveStatus.value = 'saved'
  } catch (error) {
    saveStatus.value = 'error'
    console.error('Save failed:', error)
  }
}, 2000)

// Watch for changes to trigger auto-save
watch([title, content], () => {
  if (currentNote.value) {
    triggerSave()
  }
})

// Load note when selected
watch(currentNote, (note) => {
  if (note) {
    title.value = note.title || ''
    content.value = note.content || ''
    saveStatus.value = 'saved'
  }
})
</script>

<style>
.custom-editor .ql-editor {
  font-size: 16px;
  line-height: 1.6;
}
</style>