<template>
  <AppLayout>
    <ResizableLayoutContainer storage-key="search-view-layout" :show-right-panel="false">
      <template #left>
        <div class="px-3 py-2.5 border-b flex-shrink-0" style="border-color: var(--notion-border);">
          <div class="text-xs font-semibold notion-text-secondary uppercase tracking-wider">Search Stats</div>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <!-- Search Stats -->
          <div class="pt-0" style="border-color: var(--notion-border);">
            <p class="text-xs font-semibold notion-text-secondary mb-2 px-2">Index Stats</p>
            <div class="space-y-1.5 text-xs notion-text-secondary px-2">
              <div class="flex justify-between">
                <span>Indexed Notes</span>
                <span class="font-semibold notion-text-primary">{{ notesStore.notes.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Indexed Expenses</span>
                <span class="font-semibold notion-text-primary">{{ expensesStore.expenses.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Total Documents</span>
                <span class="font-semibold notion-text-primary">{{ totalDocuments }}</span>
              </div>
            </div>
          </div>

          <!-- Search Tips -->
          <div class="border-t pt-3 mt-3" style="border-color: var(--notion-border);">
            <p class="text-xs font-semibold notion-text-secondary mb-2 px-2">Tips</p>
            <ul class="text-xs notion-text-secondary space-y-1 px-2">
              <li class="flex gap-2">
                <span class="flex-shrink-0">•</span>
                <span>Use multiple words for better results</span>
              </li>
              <li class="flex gap-2">
                <span class="flex-shrink-0">•</span>
                <span>Search is case-insensitive</span>
              </li>
              <li class="flex gap-2">
                <span class="flex-shrink-0">•</span>
                <span>Results ranked by relevance</span>
              </li>
            </ul>
          </div>
        </div>
      </template>

      <template #main>
        <div class="flex-1 overflow-y-auto px-8 py-6">
          <!-- Search Bar -->
          <SearchBar
            v-model="searchQuery"
            :is-searching="isSearching"
            @search="handleSearch"
            class="mb-8"
          />

          <!-- Performance Stats -->
          <div v-if="searchQuery && searchDuration > 0" class="mb-4 text-xs notion-text-tertiary">
            <i class="pi pi-clock" style="font-size: 10px;"></i>
            {{ searchDuration.toFixed(2) }}ms • {{ totalDocuments }} documents
          </div>

          <!-- Search Results -->
          <SearchResults
            :results="searchResults"
            :query="searchQuery"
            :is-searching="isSearching"
            :show-scores="showDebugScores"
            @result-click="handleResultClick"
          />
        </div>
      </template>
    </ResizableLayoutContainer>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useSearch } from '@/composables/useSearch'
import AppLayout from '@/components/common/AppLayout.vue'
import ResizableLayoutContainer from '@/components/common/ResizableLayoutContainer.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import SearchResults from '@/components/search/SearchResults.vue'

const router = useRouter()
const notesStore = useNotesStore()
const expensesStore = useExpensesStore()
const { search, isSearching, searchResults } = useSearch()

const searchQuery = ref('')
const searchDuration = ref(0)
const showDebugScores = ref(false)

const totalDocuments = computed(() => {
  return notesStore.notes.length + expensesStore.expenses.length
})

/**
 * Handle search query
 * Calls TF-IDF algorithm to rank results
 */
function handleSearch(query) {
  console.log('🔍 Searching for:', query)

  if (!query || query.trim().length === 0) {
    searchResults.value = []
    searchDuration.value = 0
    return
  }

  const startTime = performance.now()

  // Call TF-IDF search
  search(query, notesStore.notes, expensesStore.expenses)

  const endTime = performance.now()
  searchDuration.value = endTime - startTime

  console.log(`✅ Search completed: ${searchResults.value.length} results in ${searchDuration.value.toFixed(2)}ms`)
}

/**
 * Handle clicking a search result
 * Navigate to the note or expense
 */
function handleResultClick(result) {
  if (result.type === 'note') {
    // Navigate to notes view and select the note
    notesStore.selectNote(result.id)
    router.push('/notes')
    console.log('📝 Navigating to note:', result.title)
  } else if (result.type === 'expense') {
    // Navigate to expenses view
    // Optionally could scroll to or highlight the expense
    router.push('/expenses')
    console.log('💰 Navigating to expenses:', result.title)
  }
}

/**
 * Load data on mount
 * Ensure we have notes and expenses loaded for searching
 */
onMounted(async () => {
  console.log('🔍 SearchView mounted')
  
  try {
    // Load folders and notes if not already loaded
    if (notesStore.folders.length === 0) {
      await notesStore.loadFolders()
    }
    
    // Load expenses if not already loaded
    if (expensesStore.expenses.length === 0) {
      await expensesStore.fetchExpenses()
    }
    
    console.log(`📊 Loaded ${notesStore.notes.length} notes and ${expensesStore.expenses.length} expenses for search`)
  } catch (error) {
    console.error('❌ Failed to load data for search:', error)
    // Could show a toast notification or error banner to user
  }
})
</script>

<style scoped>
/* Optional: Add any page-specific styles here */
</style>
