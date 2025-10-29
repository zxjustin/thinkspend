<template>
  <div class="folder-tree">
    <FolderItem
      v-for="folder in folders"
      :key="folder.id"
      :folder="folder"
      :depth="depth"
      :expand-signal="expandSignal"
      :collapse-signal="collapseSignal"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import FolderItem from './FolderItem.vue'

const props = defineProps({
  folders: Array,
  depth: {
    type: Number,
    default: 0
  },
  expandSignal: Number,
  collapseSignal: Number
})
</script>