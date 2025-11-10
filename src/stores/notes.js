import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useNotesStore = defineStore('notes', () => {
  const folders = ref([])
  const notes = ref([])
  const currentNote = ref(null)
  const loadingNotesMap = ref(new Map()) // Track loading state per folder
  const error = ref(null) // Track errors
  const loadedFolders = ref(new Set()) // Track which folders have been loaded

  // FOLDERS
  async function loadFolders() {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name')

    if (error) throw error
    folders.value = data

    // Load all notes for all folders
    await loadAllNotes()
  }

  // Load all notes across all folders
  async function loadAllNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      notes.value = data || []
      console.log(`✅ Loaded ${notes.value.length} notes`)
    } catch (err) {
      console.error('❌ Failed to load all notes:', err)
    }
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
    // Return early if already loaded
    if (loadedFolders.value.has(folderId)) {
      return
    }

    // Set loading state
    loadingNotesMap.value.set(folderId, true)
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('folder_id', folderId)
        .order('updated_at', { ascending: false })

      if (fetchError) {
        error.value = `Failed to load notes for folder: ${fetchError.message}`
        console.error('❌ Error loading notes:', error.value)
        throw fetchError
      }

      // Merge with existing notes (don't replace all)
      const existingIds = new Set(notes.value.map(n => n.id))
      const newNotes = data.filter(n => !existingIds.has(n.id))
      notes.value.push(...newNotes)

      // Mark folder as loaded
      loadedFolders.value.add(folderId)
      console.log(`✅ Loaded ${newNotes.length} notes for folder ${folderId}`)
    } catch (err) {
      console.error('❌ Failed to load notes:', err)
      throw err
    } finally {
      // Clear loading state
      loadingNotesMap.value.delete(folderId)
    }
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

  async function selectNote(id) {
    // First, try to find the note in already-loaded notes
    let note = notes.value.find(n => n.id === id)

    if (!note) {
      // If note not found, we need to load it from the database
      console.log(`⏳ Note ${id} not loaded, fetching from database...`)
      try {
        const { data, error: fetchError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) {
          error.value = `Failed to load note: ${fetchError.message}`
          console.error('❌ Error loading note:', error.value)
          return
        }

        if (data) {
          notes.value.push(data)
          note = data
          console.log(`✅ Loaded note ${id} from database`)
        }
      } catch (err) {
        console.error('❌ Failed to load note:', err)
        return
      }
    }

    currentNote.value = note || null
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

  // TREE TRANSFORMATION (For PrimeVue Tree component)
  /**
   * Transform flat folder/notes structure into hierarchical Tree format
   * Tree format: { key, label, icon, children: [...], data: {...} }
   */
  function transformFoldersToTree() {
    const folderMap = new Map()
    const rootFolders = []

    // Create tree nodes for each folder
    folders.value.forEach(folder => {
      const folderNotes = notes.value.filter(n => n.folder_id === folder.id)

      const treeNode = {
        key: `folder-${folder.id}`,
        label: folder.name,
        icon: 'pi pi-folder',
        data: { type: 'folder', id: folder.id, ...folder },
        children: [
          // Add note children
          ...folderNotes.map(note => {
            const expenses = 0 // Could count from expensesStore
            const linkPattern = /\[\[([^\]]+)\]\]/g
            const links = (note.content.match(linkPattern) || []).length

            return {
              key: `note-${note.id}`,
              label: note.title,
              icon: 'pi pi-file',
              data: { type: 'note', id: note.id, ...note, expenses, links },
              leaf: true // Notes are leaf nodes
            }
          })
        ]
      }

      folderMap.set(folder.id, treeNode)

      // If no parent, add to root
      if (!folder.parent_id) {
        rootFolders.push(treeNode)
      }
    })

    // Build hierarchical structure
    folderMap.forEach((treeNode, folderId) => {
      const folder = folders.value.find(f => f.id === folderId)
      if (folder?.parent_id) {
        const parentNode = folderMap.get(folder.parent_id)
        if (parentNode) {
          // Add folder as child of parent
          parentNode.children.unshift(treeNode)
        }
      }
    })

    return rootFolders
  }

  return {
    folders,
    notes,
    currentNote,
    loadingNotesMap,
    error,
    loadedFolders,
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
    findNoteByTitle,
    // Tree transformation
    transformFoldersToTree
  }
})