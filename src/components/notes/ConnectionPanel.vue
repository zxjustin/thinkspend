<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h3 class="font-semibold text-gray-800 text-sm">Connections</h3>
      <Button 
        icon="pi pi-times" 
        text 
        rounded
        size="small"
        @click="$emit('close')"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Live Detection -->
      <div class="mb-6">
        <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Detection
        </h4>
        
        <!-- Detected Expenses -->
        <div class="mb-4">
          <div class="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <i class="pi pi-dollar text-xs"></i>
            Expenses: {{ detectedExpenses.length }}
          </div>
          
          <div v-if="detectedExpenses.length > 0" class="space-y-2">
            <div 
              v-for="(exp, idx) in detectedExpenses" 
              :key="idx"
              class="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div class="font-semibold text-green-800 text-sm">${{ exp.amount }}</div>
              <div class="text-gray-700 text-xs mt-1">{{ exp.description }}</div>
              <div class="text-gray-500 text-[10px] mt-1">{{ exp.category }}</div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic">None detected</div>
        </div>

        <!-- Detected Links -->
        <div>
          <div class="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <i class="pi pi-link text-xs"></i>
            Links: {{ detectedLinks.length }}
          </div>
          
          <div v-if="detectedLinks.length > 0" class="space-y-1">
            <div 
              v-for="(link, idx) in detectedLinks" 
              :key="idx"
              class="bg-blue-50 border border-blue-200 rounded-lg p-2"
            >
              <div class="font-semibold text-blue-800 text-xs">→ {{ link }}</div>
              <div class="text-[10px] text-gray-500 mt-0.5">Bidirectional link</div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic">None detected</div>
        </div>
      </div>

      <!-- Connected Items -->
      <div class="pt-4 border-t border-gray-200">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Connected Items</h4>
        
        <!-- Connected Expenses -->
        <div class="mb-4">
          <div class="text-xs font-medium text-gray-600 mb-2">
            Expenses ({{ connectedExpenses.length }})
          </div>
          
          <div v-if="connectedExpenses.length > 0" class="space-y-2">
            <div 
              v-for="exp in connectedExpenses" 
              :key="exp.id"
              class="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="text-xs font-semibold text-gray-800">${{ exp.amount }}</div>
                <Tag 
                  :value="exp.detection_method" 
                  severity="info"
                  class="text-[10px] px-2 py-0.5"
                />
              </div>
              <div class="text-xs text-gray-700">{{ exp.description }}</div>
              <div class="text-[10px] text-gray-500 mt-1">
                {{ exp.category }} • {{ formatDate(exp.date) }}
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic">No expenses linked</div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div class="font-semibold text-purple-800 text-xs mb-1">🎯 Auto-Linking</div>
        <div class="text-purple-700 text-[11px] leading-relaxed">
          Expenses typed in notes are automatically detected and linked. This preserves context!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

defineEmits(['close'])

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()

const currentNote = computed(() => notesStore.currentNote)

const detectedExpenses = computed(() => {
  if (!currentNote.value?.content) return []

  // Strip HTML
  const temp = document.createElement('div')
  temp.innerHTML = currentNote.value.content
  const plainText = temp.textContent || temp.innerText || ''

  // New bracket pattern: $amount Description [Category]
  const expensePattern = /\$(\d+(?:\.\d{1,2})?)\s+([^\[\n$]+?)\s*\[([^\]]+)\]/g
  const expenses = []
  let match

  while ((match = expensePattern.exec(plainText)) !== null) {
    expenses.push({
      amount: parseFloat(match[1]),
      description: match[2].trim(),
      category: match[3].trim()
    })
  }

  return expenses
})

const detectedLinks = computed(() => {
  if (!currentNote.value?.content) return []
  
  const linkPattern = /\[\[([^\]]+)\]\]/g
  const links = []
  let match
  
  while ((match = linkPattern.exec(currentNote.value.content)) !== null) {
    links.push(match[1].trim())
  }
  
  return links
})

const connectedExpenses = computed(() => {
  if (!currentNote.value) return []
  return expensesStore.expenses.filter(e => e.source_note_id === currentNote.value.id)
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>