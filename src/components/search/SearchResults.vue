<template>
  <div class="search-results">
    <!-- Results Header -->
    <div v-if="results.length > 0" class="mb-4 text-sm text-gray-600">
      Found <strong>{{ results.length }}</strong> result{{ results.length !== 1 ? 's' : '' }} for <strong>"{{ query }}"</strong>
    </div>

    <!-- No Results -->
    <div v-if="!isSearching && query && results.length === 0" class="text-center py-12">
      <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg">No results found</p>
      <p class="text-gray-400 text-sm mt-2">Try different keywords or check spelling</p>
    </div>

    <!-- Empty State (no search yet) -->
    <div v-if="!query && results.length === 0" class="text-center py-12">
      <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg">Start searching</p>
      <p class="text-gray-400 text-sm mt-2">Search across all your notes and expenses</p>
    </div>

    <!-- Results List -->
    <div v-if="results.length > 0" class="space-y-3">
      <div
        v-for="result in results"
        :key="`${result.type}-${result.id}`"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        @click="handleResultClick(result)"
      >
        <!-- Result Header -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2 flex-1">
            <!-- Type Icon -->
            <i
              :class="result.type === 'note' ? 'pi pi-file text-blue-500' : 'pi pi-dollar text-green-500'"
              class="text-sm"
            ></i>

            <!-- Title with highlighting -->
            <h3
              class="text-base font-semibold text-gray-800"
              v-html="highlightTerms(result.title, searchTerms)"
            ></h3>
          </div>

          <!-- Type Badge -->
          <span
            :class="result.type === 'note' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
            class="text-xs px-2 py-1 rounded-full font-medium"
          >
            {{ result.type === 'note' ? 'Note' : 'Expense' }}
          </span>
        </div>

        <!-- Excerpt with highlighting -->
        <p
          class="text-sm text-gray-600 mb-2 line-clamp-2"
          v-html="highlightTerms(getExcerpt(result.content, searchTerms), searchTerms)"
        ></p>

        <!-- Metadata Row -->
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <!-- Date -->
          <span class="flex items-center gap-1">
            <i class="pi pi-calendar text-[10px]"></i>
            {{ formatDate(result.created_at) }}
          </span>

          <!-- Matched Terms -->
          <span class="flex items-center gap-1">
            <i class="pi pi-check-circle text-[10px]"></i>
            {{ result.matchedTerms.length }} term{{ result.matchedTerms.length !== 1 ? 's' : '' }} matched
          </span>

          <!-- Score (for debugging/transparency) -->
          <span v-if="showScores" class="flex items-center gap-1 text-purple-600">
            <i class="pi pi-star-fill text-[10px]"></i>
            Score: {{ result.score.toFixed(3) }}
          </span>

          <!-- Expense Amount -->
          <span v-if="result.type === 'expense'" class="flex items-center gap-1 font-semibold text-green-600">
            ${{ result.amount.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSearch } from '@/composables/useSearch'

const props = defineProps({
  results: {
    type: Array,
    default: () => []
  },
  query: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  showScores: {
    type: Boolean,
    default: false // Set to true to see TF-IDF scores for debugging
  }
})

const emit = defineEmits(['result-click'])

const { highlightTerms, getExcerpt } = useSearch()

// Split query into terms for highlighting
const searchTerms = computed(() => {
  if (!props.query) return []
  return props.query.toLowerCase().trim().split(/\s+/)
})

/**
 * Handle clicking a result - emit event to parent
 */
function handleResultClick(result) {
  console.log('🔍 Result clicked:', result.type, result.id)
  emit('result-click', result)
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown date'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`

  return date.toLocaleDateString()
}
</script>

<style scoped>
/* Highlighting style for matched search terms */
:deep(mark) {
  background-color: #fef08a; /* Yellow-200 */
  padding: 2px 0;
  font-weight: 600;
}

/* Line clamp for excerpts */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
