<template>
  <div class="notion-bg border overflow-hidden flex flex-col h-full" style="border-color: var(--notion-border); border-radius: var(--radius-md);">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: var(--notion-border);">
      <h3 class="text-sm font-semibold notion-text-primary">Connections</h3>
      <button
        class="notion-button p-1.5 border-0"
        @click="$emit('close')"
        title="Close panel"
      >
        <i class="pi pi-times" style="font-size: 13px;"></i>
      </button>
    </div>

    <!-- Content - Simplified to only show useful info -->
    <div class="flex-1 overflow-y-auto">
      <!-- Expenses Section -->
      <div class="border-b" style="border-color: var(--notion-border);">
        <button
          @click="toggleSection('expenses')"
          class="w-full px-4 py-3 flex items-center justify-between hover:notion-bg-hover transition-colors text-left"
        >
          <div class="flex items-center gap-2">
            <i
              :class="sections.expenses ? 'pi-chevron-down' : 'pi-chevron-right'"
              class="pi text-[10px] notion-text-tertiary transition-transform"
            ></i>
            <div class="flex items-center gap-2">
              <i class="pi pi-dollar" style="font-size: 10px; color: var(--accent-green);"></i>
              <span class="text-xs font-medium notion-text-primary">Expenses</span>
            </div>
          </div>
          <span class="notion-pill notion-pill-green text-[9px]">{{ detectedExpenses.length }}</span>
        </button>

        <div v-if="sections.expenses" class="px-4 pb-3">
          <div v-if="detectedExpenses.length > 0" class="space-y-1.5">
            <div
              v-for="(exp, idx) in detectedExpenses"
              :key="idx"
              class="rounded p-2.5 hover:opacity-90 transition-opacity"
              style="background-color: var(--accent-green-bg);"
            >
              <div class="flex items-baseline justify-between mb-1">
                <div class="font-semibold text-sm" style="color: var(--accent-green);">${{ exp.amount }}</div>
                <div class="text-[9px] px-1.5 py-0.5 rounded font-medium" style="color: var(--accent-green);">{{ exp.category }}</div>
              </div>
              <div class="notion-text-primary text-xs">{{ exp.description }}</div>
            </div>
          </div>
          <div v-else class="text-xs notion-text-tertiary italic">Type expenses like: $25 Lunch [Food]</div>
        </div>
      </div>

      <!-- Links Section -->
      <div class="border-b" style="border-color: var(--notion-border);">
        <button
          @click="toggleSection('links')"
          class="w-full px-4 py-3 flex items-center justify-between hover:notion-bg-hover transition-colors text-left"
        >
          <div class="flex items-center gap-2">
            <i
              :class="sections.links ? 'pi-chevron-down' : 'pi-chevron-right'"
              class="pi text-[10px] notion-text-tertiary transition-transform"
            ></i>
            <div class="flex items-center gap-2">
              <i class="pi pi-link" style="font-size: 10px; color: var(--accent-purple);"></i>
              <span class="text-xs font-medium notion-text-primary">Links</span>
            </div>
          </div>
          <span class="notion-pill notion-pill-purple text-[9px]">{{ detectedLinks.length }}</span>
        </button>

        <div v-if="sections.links" class="px-4 pb-3">
          <div v-if="detectedLinks.length > 0" class="space-y-1.5">
            <div
              v-for="(link, idx) in detectedLinks"
              :key="idx"
              class="rounded p-2 cursor-pointer hover:opacity-90 transition-opacity"
              style="background-color: var(--accent-purple-bg);"
              @click="navigateToLinkedNote(link)"
            >
              <div class="font-medium text-xs flex items-center gap-1.5" style="color: var(--accent-purple);">
                <i class="pi pi-arrow-right" style="font-size: 8px;"></i>
                <span>{{ link }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-xs notion-text-tertiary italic">Link notes like: [[note name]]</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'

defineEmits(['close'])

const notesStore = useNotesStore()

const currentNote = computed(() => notesStore.currentNote)

// Collapsible sections state - both open by default
const sections = ref({
  expenses: true,
  links: true
})

function toggleSection(section) {
  sections.value[section] = !sections.value[section]
}

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

// Navigate to a linked note by title
async function navigateToLinkedNote(linkTitle) {
  console.log('🔗 Navigating to linked note:', linkTitle)

  // Find note by title
  const targetNote = await notesStore.findNoteByTitle(linkTitle)

  if (targetNote) {
    notesStore.selectNote(targetNote.id)
    console.log('📍 Navigated to:', targetNote.title)
  } else {
    console.warn('⚠️ Note not found:', linkTitle)
  }
}
</script>