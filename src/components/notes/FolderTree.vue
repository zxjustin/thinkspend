<template>
  <div class="folder-tree">
    <FolderItem 
      v-for="folder in folders" 
      :key="folder.id"
      :folder="folder"
      :depth="depth"
    />
  </div>
</template>

<script setup>
import FolderItem from './FolderItem.vue'

defineProps({
  folders: Array,
  depth: {
    type: Number,
    default: 0
  }
})
</script>