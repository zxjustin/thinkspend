import { ref } from 'vue'

export function useAutoSave(saveFn, delay = 2000) {
  let saveTimeout = null
  const isSaving = ref(false)

  function triggerSave() {
    clearTimeout(saveTimeout)
    
    saveTimeout = setTimeout(async () => {
      isSaving.value = true
      try {
        await saveFn()
      } finally {
        isSaving.value = false
      }
    }, delay)
  }

  function cancelSave() {
    clearTimeout(saveTimeout)
  }

  return {
    triggerSave,
    cancelSave,
    isSaving
  }
}