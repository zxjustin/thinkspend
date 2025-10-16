<template>
  <div class="search-results">
    <!-- Results Header -->
    <div v-if="results.length > 0" class="mb-6">
      <h2 class="text-2xl font-bold notion-text-primary mb-1">Search Results</h2>
      <p class="text-sm notion-text-secondary">Found {{ results.length }} result{{ results.length !== 1 ? 's' : '' }} for "{{ query }}"</p>
    </div>

    <!-- No Results -->
    <div v-if="!isSearching && query && results.length === 0" class="text-center py-16">
      <div class="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: var(--notion-bg-secondary);">
        <i class="pi pi-search notion-text-tertiary" style="font-size: 40px;"></i>
      </div>
      <p class="text-base font-medium notion-text-primary mb-2">No results found</p>
      <p class="text-sm notion-text-secondary">Try different keywords or check spelling</p>
    </div>

    <!-- Empty State (no search yet) -->
    <div v-if="!query && results.length === 0" class="text-center py-16">
      <div class="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: var(--notion-bg-secondary);">
        <i class="pi pi-search notion-text-tertiary" style="font-size: 40px;"></i>
      </div>
      <p class="text-base font-medium notion-text-primary mb-2">Start searching</p>
      <p class="text-sm notion-text-secondary">Search across all your notes and expenses</p>
    </div>

    <!-- Results List - Professional Cards -->
    <div v-if="results.length > 0" class="space-y-3">
      <div
        v-for="result in results"
        :key="`${result.type}-${result.id}`"
        class="notion-bg border rounded-lg p-5 hover:notion-bg-hover transition-all cursor-pointer"
        style="border-color: var(--notion-border);"
        @click="handleResultClick(result)"
      >
        <!-- Result Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3 flex-1">
            <!-- Type Icon -->
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 :style="{ backgroundColor: result.type === 'note' ? 'var(--accent-blue-bg)' : 'var(--accent-green-bg)' }">
              <i
                :class="result.type === 'note' ? 'pi pi-file' : 'pi pi-dollar'"
                :style="{ fontSize: '18px', color: result.type === 'note' ? 'var(--accent-blue)' : 'var(--accent-green)' }"
              ></i>
            </div>

            <!-- Title with highlighting -->
            <div class="flex-1 min-w-0">
              <h3
                class="text-lg font-semibold notion-text-primary mb-1"
                v-html="highlightTerms(result.title, searchTerms)"
              ></h3>
              <span
                :class="result.type === 'note' ? 'notion-pill-blue' : 'notion-pill-green'"
                class="notion-pill text-xs"
              >
                {{ result.type === 'note' ? 'Note' : 'Expense' }}
              </span>
            </div>
          </div>

          <!-- Expense Amount -->
          <div v-if="result.type === 'expense'" class="text-right">
            <div class="text-2xl font-bold" style="color: var(--accent-green);">${{ result.amount.toFixed(2) }}</div>
          </div>
        </div>

        <!-- Excerpt with highlighting -->
        <p
          class="text-sm notion-text-secondary mb-3 line-clamp-2"
          v-html="highlightTerms(getExcerpt(result.content, searchTerms), searchTerms)"
        ></p>

        <!-- Metadata Row -->
        <div class="flex items-center gap-4 text-xs notion-text-tertiary">
          <!-- Date -->
          <span class="flex items-center gap-1.5">
            <i class="pi pi-calendar" style="font-size: 10px;"></i>
            {{ formatDate(result.created_at) }}
          </span>

          <!-- Matched Terms -->
          <span class="flex items-center gap-1.5">
            <i class="pi pi-check-circle" style="font-size: 10px;"></i>
            {{ result.matchedTerms.length }} match{{ result.matchedTerms.length !== 1 ? 'es' : '' }}
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
