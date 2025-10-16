<template>
  <div class="notion-bg border overflow-hidden flex flex-col h-full" style="border-color: var(--notion-border); border-radius: var(--radius-md);">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: var(--notion-border);">
      <h3 class="text-sm font-medium notion-text-primary">Connections</h3>
      <button
        class="notion-button p-1.5 border-0"
        @click="$emit('close')"
      >
        <i class="pi pi-times" style="font-size: 13px;"></i>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Live Detection -->
      <div class="mb-6">
        <h4 class="text-sm font-medium notion-text-primary mb-2 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full animate-pulse" style="background-color: var(--accent-green);"></div>
          Live Detection
        </h4>
        <p class="text-[10px] notion-text-tertiary mb-3 italic">Real-time scanning as you type</p>

        <!-- Detected Expenses -->
        <div class="mb-4">
          <div class="text-xs notion-text-secondary mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <i class="pi pi-dollar" style="font-size: 10px;"></i>
              Expenses found
            </span>
            <span class="notion-pill notion-pill-green text-[9px]">{{ detectedExpenses.length }}</span>
          </div>

          <div v-if="detectedExpenses.length > 0" class="space-y-2">
            <div
              v-for="(exp, idx) in detectedExpenses"
              :key="idx"
              class="border rounded p-3"
              style="background-color: var(--accent-green-bg); border-color: var(--accent-green);"
            >
              <div class="font-semibold text-sm" style="color: var(--accent-green);">${{ exp.amount }}</div>
              <div class="notion-text-primary text-xs mt-1">{{ exp.description }}</div>
              <div class="notion-text-tertiary text-[10px] mt-1">{{ exp.category }}</div>
            </div>
          </div>
          <div v-else class="text-xs notion-text-tertiary italic">None detected</div>
        </div>

        <!-- Detected Links -->
        <div>
          <div class="text-xs notion-text-secondary mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <i class="pi pi-link" style="font-size: 10px;"></i>
              Links found
            </span>
            <span class="notion-pill notion-pill-purple text-[9px]">{{ detectedLinks.length }}</span>
          </div>

          <div v-if="detectedLinks.length > 0" class="space-y-1">
            <div
              v-for="(link, idx) in detectedLinks"
              :key="idx"
              class="border rounded p-2"
              style="background-color: var(--accent-purple-bg); border-color: var(--accent-purple);"
            >
              <div class="font-medium text-xs" style="color: var(--accent-purple);">→ {{ link }}</div>
              <div class="text-[10px] notion-text-tertiary mt-0.5">Bidirectional link</div>
            </div>
          </div>
          <div v-else class="text-xs notion-text-tertiary italic">None detected</div>
        </div>
      </div>

      <!-- Connected Items for THIS NOTE ONLY -->
      <div class="pt-4 border-t" style="border-color: var(--notion-border);">
        <h4 class="text-sm font-medium notion-text-primary mb-2">Connected to This Note</h4>
        <p class="text-[10px] notion-text-tertiary mb-3 italic">Items linked to "{{ currentNote?.title || 'this note' }}" only</p>

        <!-- Connected Expenses -->
        <div class="mb-4">
          <div class="text-xs font-medium notion-text-secondary mb-2 flex items-center justify-between">
            <span>Expenses in this note</span>
            <span class="notion-pill text-[9px]">{{ connectedExpenses.length }}</span>
          </div>

          <div v-if="connectedExpenses.length > 0" class="space-y-2">
            <div
              v-for="exp in connectedExpenses"
              :key="exp.id"
              class="notion-bg-hover border rounded p-3"
              style="border-color: var(--notion-border);"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="text-xs font-semibold notion-text-primary">${{ exp.amount }}</div>
                <span class="notion-pill text-[10px]">{{ exp.detection_method }}</span>
              </div>
              <div class="text-xs notion-text-primary">{{ exp.description }}</div>
              <div class="text-[10px] notion-text-tertiary mt-1">
                {{ exp.category }} • {{ formatDate(exp.date) }}
              </div>
            </div>
          </div>
          <div v-else class="text-xs notion-text-tertiary italic">No expenses linked</div>
        </div>

        <!-- Backlinks (Bidirectional) -->
        <div class="mb-4">
          <div class="text-xs font-medium notion-text-secondary mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <i class="pi pi-arrow-left" style="font-size: 10px;"></i>
              Notes linking here
            </span>
            <span class="notion-pill text-[9px]">{{ backlinks.length }}</span>
          </div>

          <div v-if="backlinks.length > 0" class="space-y-1">
            <div
              v-for="link in backlinks"
              :key="link.id"
              class="border rounded p-2 cursor-pointer transition-colors"
              style="background-color: var(--accent-blue-bg); border-color: var(--accent-blue);"
              @click="navigateToNote(link.source.id)"
            >
              <div class="flex items-center gap-2">
                <i class="pi pi-file" style="font-size: 10px; color: var(--accent-blue);"></i>
                <div class="font-medium text-xs" style="color: var(--accent-blue);">{{ link.source.title }}</div>
              </div>
              <div class="text-[10px] notion-text-tertiary mt-0.5">
                ← Links to this note
              </div>
            </div>
          </div>
          <div v-else class="text-xs notion-text-tertiary italic">No notes link here</div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-4 p-3 notion-bg-hover border rounded" style="border-color: var(--notion-border);">
        <div class="font-medium notion-text-primary text-xs mb-1">Auto-Linking</div>
        <div class="notion-text-secondary text-[11px]" style="line-height: 1.5;">
          Expenses typed in notes are automatically detected and linked. This preserves context!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'

defineEmits(['close'])

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()

const currentNote = computed(() => notesStore.currentNote)
const backlinks = ref([]) // Stores notes that link TO this note

// Fetch backlinks when note changes
watch(currentNote, async (note) => {
  if (note) {
    backlinks.value = await notesStore.fetchBacklinks(note.id)
    console.log('🔗 Loaded backlinks:', backlinks.value)
  } else {
    backlinks.value = []
  }
}, { immediate: true })

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

// Navigate to a linked note
function navigateToNote(noteId) {
  notesStore.selectNote(noteId)
  console.log('📍 Navigated to note:', noteId)
}
</script>