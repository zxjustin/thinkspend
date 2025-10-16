<template>
  <div class="search-bar">
    <!-- Large Professional Search Bar -->
    <div class="flex items-center gap-3 notion-bg border rounded-lg px-6 py-4" style="border-color: var(--notion-border); box-shadow: var(--shadow-sm);">
      <!-- Search Icon -->
      <i class="pi pi-search notion-text-tertiary" style="font-size: 20px;"></i>

      <!-- Search Input -->
      <input
        v-model="localQuery"
        type="text"
        placeholder="Search across all notes and expenses..."
        class="flex-1 outline-none notion-text-primary"
        style="font-size: 18px; background: transparent;"
        @input="handleInput"
        @keydown.enter="handleEnter"
      />

      <!-- Clear Button (only show when there's text) -->
      <button
        v-if="localQuery"
        class="notion-button p-2 border-0"
        @click="clearSearch"
      >
        <i class="pi pi-times" style="font-size: 14px;"></i>
      </button>

      <!-- Loading Indicator -->
      <i v-if="isSearching" class="pi pi-spin pi-spinner" style="font-size: 16px; color: var(--accent-blue);"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
