<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto py-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Search</h1>
        <p class="text-gray-600">Find notes and expenses using intelligent TF-IDF ranking</p>
      </div>

      <!-- Search Bar -->
      <SearchBar
        v-model="searchQuery"
        :is-searching="isSearching"
        @search="handleSearch"
        class="mb-6"
      />

      <!-- Performance Stats (optional, for debugging) -->
      <div v-if="searchQuery && searchDuration > 0" class="mb-4 text-xs text-gray-500">
        <i class="pi pi-clock"></i>
        Search completed in {{ searchDuration.toFixed(2) }}ms
        ({{ notesStore.notes.length }} notes + {{ expensesStore.expenses.length }} expenses = {{ totalDocuments }} documents)
      </div>

      <!-- Search Results -->
      <SearchResults
        :results="searchResults"
        :query="searchQuery"
        :is-searching="isSearching"
        :show-scores="showDebugScores"
        @result-click="handleResultClick"
      />

      <!-- Debug Toggle (can remove in production) -->
      <div class="mt-8 text-center">
        <Button
          :label="showDebugScores ? 'Hide Scores' : 'Show Scores'"
          text
          size="small"
          @click="showDebugScores = !showDebugScores"
          class="text-xs"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useSearch } from '@/composables/useSearch'
import AppLayout from '@/components/common/AppLayout.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import SearchResults from '@/components/search/SearchResults.vue'
import Button from 'primevue/button'

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

  // Load folders and notes if not already loaded
  if (notesStore.folders.length === 0) {
    await notesStore.loadFolders()
  }

  // Load expenses if not already loaded
  if (expensesStore.expenses.length === 0) {
    await expensesStore.loadExpenses()
  }

  console.log(`📊 Loaded ${notesStore.notes.length} notes and ${expensesStore.expenses.length} expenses for search`)
})
</script>

<style scoped>
/* Optional: Add any page-specific styles here */
</style>
