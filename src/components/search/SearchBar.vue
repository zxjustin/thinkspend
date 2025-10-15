<template>
  <div class="search-bar">
    <div class="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
      <!-- Search Icon -->
      <i class="pi pi-search text-gray-400"></i>

      <!-- Search Input -->
      <input
        v-model="localQuery"
        type="text"
        placeholder="Search notes and expenses..."
        class="flex-1 outline-none text-gray-700 placeholder-gray-400"
        @input="handleInput"
        @keydown.enter="handleEnter"
      />

      <!-- Clear Button (only show when there's text) -->
      <Button
        v-if="localQuery"
        icon="pi pi-times"
        text
        rounded
        size="small"
        @click="clearSearch"
        v-tooltip.top="'Clear search'"
      />

      <!-- Loading Indicator -->
      <i v-if="isSearching" class="pi pi-spin pi-spinner text-blue-500"></i>
    </div>

    <!-- Search Tips -->
    <div class="mt-2 text-xs text-gray-500 flex items-center gap-2">
      <i class="pi pi-info-circle"></i>
      <span>Tip: Search across notes and expenses. Multiple words = AND search.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  debounceMs: {
    type: Number,
    default: 300 // 300ms debounce
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const localQuery = ref(props.modelValue)
let debounceTimeout = null

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  localQuery.value = newVal
})

/**
 * Handle input with debouncing
 * Waits 300ms after user stops typing before triggering search
 */
function handleInput() {
  // Clear previous timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  // Update parent immediately (for v-model binding)
  emit('update:modelValue', localQuery.value)

  // Debounce the search event
  debounceTimeout = setTimeout(() => {
    emit('search', localQuery.value)
  }, props.debounceMs)
}

/**
 * Handle Enter key - trigger search immediately
 */
function handleEnter() {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  emit('search', localQuery.value)
}

/**
 * Clear search input
 */
function clearSearch() {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<style scoped>
input {
  font-size: 16px; /* Prevents zoom on iOS */
}

input::placeholder {
  font-size: 14px;
}
</style>
