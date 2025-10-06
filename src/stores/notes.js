import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useNotesStore = defineStore('notes', () => {
  const folders = ref([])
  const notes = ref([])
  const currentNote = ref(null)

  // FOLDERS
  async function loadFolders() {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name')
    
    if (error) throw error
    folders.value = data
  }

  async function createFolder(name, parentId = null) {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        parent_id: parentId,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    folders.value.push(data)
    return data
  }

  async function deleteFolder(id) {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    folders.value = folders.value.filter(f => f.id !== id)
  }

  // NOTES
  async function loadNotes(folderId) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('folder_id', folderId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    
    // Merge with existing notes (don't replace all)
    const existingIds = new Set(notes.value.map(n => n.id))
    const newNotes = data.filter(n => !existingIds.has(n.id))
    notes.value.push(...newNotes)
  }

  async function createNote(folderId, title = 'Untitled') {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('notes')
      .insert({
        folder_id: folderId,
        title,
        content: '',
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    notes.value.unshift(data)
    currentNote.value = data
    return data
  }

  async function updateNote(id, updates) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Update in array
    const index = notes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notes.value[index] = data
    }
    
    // Update current note if it's the one being edited
    if (currentNote.value?.id === id) {
      currentNote.value = data
    }
  }

  async function deleteNote(id) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    notes.value = notes.value.filter(n => n.id !== id)
    
    if (currentNote.value?.id === id) {
      currentNote.value = null
    }
  }

  function selectNote(id) {
    currentNote.value = notes.value.find(n => n.id === id)
  }

  return {
    folders,
    notes,
    currentNote,
    loadFolders,
    createFolder,
    deleteFolder,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    selectNote
  }
})