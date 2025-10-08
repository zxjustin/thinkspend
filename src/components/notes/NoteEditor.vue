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
        
        <!-- Save Status & Expense Detection -->
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-surface-500">
            <i :class="saveIcon"></i>
            <span>{{ saveStatus }}</span>
          </div>
          
          <!-- Expense Detection Badge -->
          <div v-if="detectedExpenses.length > 0" class="flex items-center gap-2">
            <Badge 
              :value="detectedExpenses.length" 
              severity="warning"
            />
            <span class="text-sm text-surface-600">
              {{ detectedExpenses.length }} expense{{ detectedExpenses.length > 1 ? 's' : '' }} detected
            </span>
          </div>
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

        <!-- Expense Detection Help -->
        <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-600 mt-1"></i>
            <div class="flex-1">
              <p class="text-sm font-semibold text-blue-900 mb-1">
                Expense Detection Format
              </p>
              <p class="text-sm text-blue-700">
                Type expenses like: <code class="bg-blue-100 px-2 py-1 rounded">$250 - Adobe License - Software</code>
              </p>
              <p class="text-xs text-blue-600 mt-2">
                Valid categories: {{ VALID_CATEGORIES.join(', ') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useAutoSave } from '@/composables/useAutoSave'
import { useExpenseParser } from '@/composables/useExpenseParser'
import InputText from 'primevue/inputtext'
import Editor from 'primevue/editor'
import Badge from 'primevue/badge'

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()
const { parseExpenses, VALID_CATEGORIES } = useExpenseParser()

const title = ref('')
const content = ref('')
const saveStatus = ref('saved')
const detectedExpenses = ref([])
const processedExpenses = ref(new Set()) // Track already processed expenses

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
    
    // Process detected expenses
    await processDetectedExpenses()
    
    saveStatus.value = 'saved'
  } catch (error) {
    saveStatus.value = 'error'
    console.error('Save failed:', error)
  }
}, 2000)

// Watch content for expense detection
watch(content, (newContent) => {
  detectedExpenses.value = parseExpenses(newContent)
})

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
    processedExpenses.value.clear() // Reset processed expenses
  }
})

// Process detected expenses after save
async function processDetectedExpenses() {
  if (!currentNote.value) return
  
  for (const expense of detectedExpenses.value) {
    // Create unique identifier for this expense
    const expenseKey = `${expense.amount}-${expense.description}-${expense.category}`
    
    // Skip if already processed
    if (processedExpenses.value.has(expenseKey)) continue
    
    try {
      // Create expense in database
      const createdExpense = await expensesStore.createExpense({
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        source_note_id: currentNote.value.id,
        detection_method: 'inline'
      })
      
      // Create note-expense link
      await expensesStore.createNoteExpenseLink(
        currentNote.value.id,
        createdExpense.id,
        'mentioned',
        1.0
      )
      
      // Mark as processed
      processedExpenses.value.add(expenseKey)
      
      console.log('Created expense:', createdExpense)
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }
}
</script>

<style>
.custom-editor .ql-editor {
  font-size: 16px;
  line-height: 1.6;
}

code {
  font-family: 'Courier New', monospace;
}
</style>