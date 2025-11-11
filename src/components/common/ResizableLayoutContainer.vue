<template>
  <div class="resizable-container flex">
    <!-- Left Sidebar -->
    <div
      class="sidebar-left notion-bg border-r flex flex-col transition-all duration-200 overflow-hidden"
      :style="{ width: leftWidth + 'px', borderColor: 'var(--notion-border)' }"
    >
      <slot name="left"></slot>
    </div>

    <!-- Left Divider (resizable) -->
    <div
      class="divider cursor-col-resize hover:bg-blue-500/10 transition-colors w-1 active:bg-blue-500/20"
      @mousedown="startResize('left')"
      @touchstart="startResize('left')"
      style="background-color: var(--notion-border);"
    ></div>

    <!-- Main Content -->
    <div class="main-content flex-1 flex flex-col overflow-y-auto transition-all duration-200">
      <slot name="main"></slot>
    </div>

    <!-- Right Divider (resizable) -->
    <div
      v-if="showRightPanel"
      class="divider cursor-col-resize hover:bg-blue-500/10 transition-colors w-1 active:bg-blue-500/20"
      @mousedown="startResize('right')"
      @touchstart="startResize('right')"
      style="background-color: var(--notion-border);"
    ></div>

    <!-- Right Panel -->
    <div
      v-if="showRightPanel"
      class="sidebar-right notion-bg border-l flex flex-col transition-all duration-200 overflow-hidden"
      :style="{ width: rightWidth + 'px', borderColor: 'var(--notion-border)' }"
    >
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  initialLeftWidth: {
    type: Number,
    default: 280 // w-64 = 256px, increased to 280px for better sidebar content
  },
  initialRightWidth: {
    type: Number,
    default: 320 // w-80 = 320px
  },
  minLeftWidth: {
    type: Number,
    default: 260 // Increased from 200 to prevent overlap
  },
  maxLeftWidth: {
    type: Number,
    default: 500
  },
  minRightWidth: {
    type: Number,
    default: 240
  },
  maxRightWidth: {
    type: Number,
    default: 500
  },
  showRightPanel: {
    type: Boolean,
    default: true
  },
  storageKey: {
    type: String,
    default: 'resizable-layout'
  }
})

const leftWidth = ref(props.initialLeftWidth)
const rightWidth = ref(props.initialRightWidth)
const isResizing = ref(false)
const resizeDirection = ref(null)
const startX = ref(0)

// Load saved widths from localStorage
onMounted(() => {
  const saved = localStorage.getItem(props.storageKey)
  if (saved) {
    try {
      const { left, right } = JSON.parse(saved)
      if (left) leftWidth.value = left
      if (right) rightWidth.value = right
    } catch (e) {
      console.warn('Failed to load saved layout widths:', e)
    }
  }
})

// Mouse/Touch handlers
function startResize(direction) {
  isResizing.value = true
  resizeDirection.value = direction
  startX.value = event.clientX || event.touches?.[0]?.clientX || 0

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('touchmove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchend', stopResize)
}

function handleResize(event) {
  if (!isResizing.value) return

  const currentX = event.clientX || event.touches?.[0]?.clientX || 0
  const deltaX = currentX - startX.value

  if (resizeDirection.value === 'left') {
    const newLeftWidth = leftWidth.value + deltaX
    if (newLeftWidth >= props.minLeftWidth && newLeftWidth <= props.maxLeftWidth) {
      leftWidth.value = newLeftWidth
      startX.value = currentX
    }
  } else if (resizeDirection.value === 'right') {
    const newRightWidth = rightWidth.value - deltaX
    if (newRightWidth >= props.minRightWidth && newRightWidth <= props.maxRightWidth) {
      rightWidth.value = newRightWidth
      startX.value = currentX
    }
  }
}

function stopResize() {
  if (isResizing.value) {
    isResizing.value = false

    // Save widths to localStorage
    localStorage.setItem(props.storageKey, JSON.stringify({
      left: leftWidth.value,
      right: rightWidth.value
    }))
  }

  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchend', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchend', stopResize)
})
</script>

<style scoped>
.resizable-container {
  width: 100%;
  height: 100%;
  user-select: none;
}

.sidebar-left,
.sidebar-right {
  min-width: 0;
  max-width: 100%;
  flex-shrink: 0;
}

.main-content {
  min-width: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.divider {
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
}

.divider:hover {
  background-color: var(--notion-border) !important;
  opacity: 0.5;
}

.divider:active {
  opacity: 1;
}
</style>
