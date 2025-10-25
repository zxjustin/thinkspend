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

  async function moveNote(noteId, targetFolderId) {
    const { data, error } = await supabase
      .from('notes')
      .update({ folder_id: targetFolderId })
      .eq('id', noteId)
      .select()
      .single()

    if (error) throw error

    // Update in array
    const index = notes.value.findIndex(n => n.id === noteId)
    if (index !== -1) {
      notes.value[index] = data
    }

    // Update current note if it's the one being moved
    if (currentNote.value?.id === noteId) {
      currentNote.value = data
    }

    return data
  }

  function selectNote(id) {
    currentNote.value = notes.value.find(n => n.id === id)
  }

  // NOTE LINKS (Bidirectional Wiki-style links)

  /**
   * Create a link between two notes
   * @param {string} sourceNoteId - Note containing the [[link]]
   * @param {string} targetNoteId - Note being linked to
   * @param {string} linkText - The text inside [[brackets]]
   */
  async function createNoteLink(sourceNoteId, targetNoteId, linkText) {
    const { data, error } = await supabase
      .from('note_links')
      .insert({
        source_note_id: sourceNoteId,
        target_note_id: targetNoteId,
        link_text: linkText,
        strength: 1.0
      })
      .select()
      .single()

    if (error) {
      // Ignore duplicate key errors (link already exists)
      if (error.code === '23505') {
        console.log('🔗 Link already exists:', linkText)
        return null
      }
      throw error
    }

    console.log('✅ Created note link:', linkText)
    return data
  }

  /**
   * Fetch all outgoing links FROM a note (notes this note links TO)
   * @param {string} noteId
   * @returns {Array} Links with target note details
   */
  async function fetchNoteLinks(noteId) {
    const { data, error } = await supabase
      .from('note_links')
      .select(`
        *,
        target:notes!note_links_target_note_id_fkey(id, title)
      `)
      .eq('source_note_id', noteId)

    if (error) throw error
    return data || []
  }

  /**
   * Fetch all incoming links TO a note (notes that link to this note)
   * This creates the "backlinks" feature
   * @param {string} noteId
   * @returns {Array} Links with source note details
   */
  async function fetchBacklinks(noteId) {
    const { data, error } = await supabase
      .from('note_links')
      .select(`
        *,
        source:notes!note_links_source_note_id_fkey(id, title)
      `)
      .eq('target_note_id', noteId)

    if (error) throw error
    return data || []
  }

  /**
   * Find a note by its title (for link resolution)
   * @param {string} title - Note title to search for
   * @returns {Object|null} Found note or null
   */
  async function findNoteByTitle(title) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .ilike('title', title) // Case-insensitive match
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error
    }

    return data || null
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
    moveNote,
    selectNote,
    // Link functions
    createNoteLink,
    fetchNoteLinks,
    fetchBacklinks,
    findNoteByTitle
  }
})