<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Empty State -->
    <div v-if="!currentNote" class="flex-1 flex items-center justify-center">
      <div class="text-center text-surface-400">
        <i class="pi pi-file text-6xl mb-4"></i>
        <p class="text-lg">Select a note to start editing</p>
      </div>
    </div>

    <!-- Note Editor -->
    <div v-else class="flex-1 flex flex-col">
      <!-- Title Bar -->
      <div class="border-b px-8 py-6" style="border-color: var(--notion-border);">
        <InputText
          v-model="title"
          placeholder="Untitled"
          class="w-full border-0 p-0 focus:ring-0 notion-text-primary"
          style="font-size: 40px; font-weight: 700; line-height: 1.2;"
          unstyled
        />

        <!-- Status Bar - Minimal & Readable -->
        <div class="mt-3 flex items-center gap-4 text-xs">
          <!-- Save Status -->
          <div class="flex items-center gap-1.5">
            <i :class="[
              'pi',
              saveStatus === 'saved' ? 'pi-check-circle' : '',
              saveStatus === 'saving' ? 'pi-spin pi-spinner' : '',
              saveStatus === 'error' ? 'pi-times-circle' : ''
            ]"
            :style="{
              fontSize: '11px',
              color: saveStatus === 'saved' ? 'var(--accent-green)' : saveStatus === 'error' ? 'var(--accent-red)' : 'var(--notion-text-tertiary)'
            }"></i>
            <span class="notion-text-tertiary">{{ saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Error' }}</span>
          </div>

          <!-- Expense Detection -->
          <div v-if="detectedExpenses.length > 0" class="flex items-center gap-1.5">
            <span class="notion-pill notion-pill-green text-[10px]">
              <i class="pi pi-dollar" style="font-size: 8px;"></i>
              <span>{{ detectedExpenses.length }}</span>
            </span>
            <span class="notion-text-tertiary">expense{{ detectedExpenses.length > 1 ? 's' : '' }}</span>
          </div>

          <!-- Last Edited -->
          <div class="flex items-center gap-1.5 ml-auto">
            <i class="pi pi-clock notion-text-tertiary" style="font-size: 10px;"></i>
            <span class="notion-text-tertiary">{{ formatDateTime(currentNote.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Content Editor -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- TipTap Editor - Clean, No Toolbar -->
        <EditorContent :editor="editor" class="tiptap-editor" />

        <!-- Syntax Help - Collapsible -->
        <div class="mt-4 space-y-2">
          <!-- Expense Detection - Collapsible -->
          <div class="border rounded" style="border-color: var(--accent-green);">
            <button
              @click="showExpenseHelp = !showExpenseHelp"
              class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style="background-color: var(--accent-green-bg);"
            >
              <div class="flex items-center gap-2">
                <i class="pi pi-dollar" style="font-size: 12px; color: var(--accent-green);"></i>
                <span class="text-sm font-medium" style="color: var(--accent-green);">Expense Tracking</span>
              </div>
              <i :class="showExpenseHelp ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" style="font-size: 10px; color: var(--accent-green);"></i>
            </button>
            <div v-if="showExpenseHelp" class="px-4 py-3 border-t" style="border-color: var(--accent-green); background-color: var(--accent-green-bg);">
              <div class="space-y-2 text-sm notion-text-secondary">
                <div>
                  <span class="font-medium">Format:</span>
                  <code class="px-2 py-0.5 rounded ml-1 text-xs" style="background-color: var(--notion-bg-selected);">$25 Lunch [Food]</code>
                </div>
              </div>
              <p class="text-xs notion-text-tertiary mt-2">
                Categories: {{ VALID_CATEGORIES.join(', ') }}
              </p>
            </div>
          </div>

          <!-- Org-Mode Headers - Collapsible -->
          <div class="border rounded" style="border-color: var(--accent-purple);">
            <button
              @click="showOrgModeHelp = !showOrgModeHelp"
              class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style="background-color: var(--accent-purple-bg);"
            >
              <div class="flex items-center gap-2">
                <i class="pi pi-align-left" style="font-size: 12px; color: var(--accent-purple);"></i>
                <span class="text-sm font-medium" style="color: var(--accent-purple);">Org-Mode Headers (Click or Ctrl+Enter)</span>
              </div>
              <i :class="showOrgModeHelp ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" style="font-size: 10px; color: var(--accent-purple);"></i>
            </button>
            <div v-if="showOrgModeHelp" class="px-4 py-3 border-t" style="border-color: var(--accent-purple); background-color: var(--accent-purple-bg);">
              <div class="space-y-1 text-xs notion-text-secondary">
                <div class="flex items-center gap-2">
                  <code class="px-2 py-0.5 rounded font-mono text-xs" style="background-color: var(--notion-bg-selected);">*</code>
                  <span>+ <kbd class="bg-white px-1 rounded border text-xs">Space</kbd> → H1 Blue</span>
                </div>
                <div class="flex items-center gap-2">
                  <code class="px-2 py-0.5 rounded font-mono text-xs" style="background-color: var(--notion-bg-selected);">**</code>
                  <span>+ <kbd class="bg-white px-1 rounded border text-xs">Space</kbd> → H2 Green</span>
                </div>
                <div class="flex items-center gap-2">
                  <code class="px-2 py-0.5 rounded font-mono text-xs" style="background-color: var(--notion-bg-selected);">***</code>
                  <span>+ <kbd class="bg-white px-1 rounded border text-xs">Space</kbd> → H3 Pink</span>
                </div>
              </div>
              <p class="text-xs notion-text-tertiary mt-2">
                💡 Click headers or press <kbd class="bg-white px-1 rounded border text-xs">Ctrl+Enter</kbd> to collapse/expand
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Extension } from '@tiptap/core'
import { supabase } from '@/lib/supabase'
import { useNotesStore } from '@/stores/notes'
import { useExpensesStore } from '@/stores/expenses'
import { useAutoSave } from '@/composables/useAutoSave'
import { useExpenseParser } from '@/composables/useExpenseParser'
import { useLinkDetector } from '@/composables/useLinkDetector'
import WikiLink from './WikiLinkExtension'
import InputText from 'primevue/inputtext'

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()
const { parseExpenses, VALID_CATEGORIES } = useExpenseParser()
const { extractLinks } = useLinkDetector()

const title = ref('')
const content = ref('')
const saveStatus = ref('saved')
const detectedExpenses = ref([])
const processedExpenses = ref(new Set())
const processedLinks = ref(new Set()) // Track which links we've already stored
const showExpenseHelp = ref(false) // Collapsible help section
const showOrgModeHelp = ref(false) // Collapsible help section

const currentNote = computed(() => notesStore.currentNote)

// Custom Org-Mode Extension for TipTap with Folding Support
const OrgMode = Extension.create({
  name: 'orgMode',

  addKeyboardShortcuts() {
    return {
      ' ': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // Get current line text
        const textBefore = $from.parent.textContent

        console.log('🔍 Space pressed, line text:', JSON.stringify(textBefore))

        // Count asterisks at start
        const match = textBefore.match(/^(\*{1,6})$/)

        if (match) {
          const level = match[1].length
          console.log('✅ Converting to H' + level)

          // Delete the asterisks
          editor
            .chain()
            .deleteRange({ from: $from.pos - level, to: $from.pos })
            .setHeading({ level })
            .run()

          return true // Prevent default space
        }

        return false // Allow default space
      },

      // Ctrl+Enter to fold/unfold headers (org-mode style, avoids Windows Tab conflict)
      'Mod-Enter': ({ editor }) => {
        const { state, view } = editor
        const { selection } = state
        const { $from } = selection

        // Check if we're in a heading
        if ($from.parent.type.name.startsWith('heading')) {
          const headingEl = view.domAtPos($from.pos).node
          if (headingEl && headingEl.nodeName.match(/^H[1-6]$/)) {
            // Toggle collapsed class
            const header = headingEl.closest('h1, h2, h3, h4, h5, h6')
            if (header) {
              header.classList.toggle('org-folded')
              console.log('📂 Toggled fold on header with Ctrl+Enter')
              return true
            }
          }
        }

        return false // Allow default behavior if not on a header
      }
    }
  }
})

// Handle wiki link clicks
async function handleWikiLinkClick(linkTitle) {
  console.log('🔗 Wiki link clicked:', linkTitle)

  // Find note by title
  const targetNote = await notesStore.findNoteByTitle(linkTitle)

  if (targetNote) {
    // Navigate to the note
    notesStore.selectNote(targetNote.id)
    console.log('📍 Navigated to:', targetNote.title)
  } else {
    console.warn('⚠️ Note not found:', linkTitle)
    // Optionally: show a toast notification or create the note
  }
}

// Initialize TipTap Editor
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      }
    }),
    Underline,
    Link,
    OrgMode,
    WikiLink.configure({
      onLinkClick: handleWikiLinkClick
    })
  ],
  content: '',
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML()
  }
})

// Auto-save composable
const { triggerSave } = useAutoSave(async () => {
  if (!currentNote.value) return

  saveStatus.value = 'saving'

  try {
    await notesStore.updateNote(currentNote.value.id, {
      title: title.value,
      content: content.value
    })

    // Process detected expenses
    await processDetectedExpenses()

    // Process detected links
    await processDetectedLinks()

    saveStatus.value = 'saved'
  } catch (error) {
    saveStatus.value = 'error'
    console.error('Save failed:', error)
  }
}, 2000)

// Watch content for expense detection
watch(content, (newContent) => {
  detectedExpenses.value = parseExpenses(newContent)
  console.log('📊 Detected expenses:', detectedExpenses.value)
})

// Watch for changes to trigger auto-save
watch([title, content], () => {
  if (currentNote.value) {
    triggerSave()
  }
})

// Load note when selected - sync with TipTap
watch(currentNote, (note) => {
  if (note && editor.value) {
    title.value = note.title || ''
    content.value = note.content || ''

    // Update TipTap content
    editor.value.commands.setContent(note.content || '')

    saveStatus.value = 'saved'
    processedExpenses.value.clear()
    processedLinks.value.clear() // Reset link tracking for new note
  }
})

// Setup header click folding on mount
onMounted(() => {
  // Use MutationObserver to watch for header changes
  const observer = new MutationObserver(() => {
    setupHeaderFolding()
  })

  const editorEl = document.querySelector('.tiptap-editor')
  if (editorEl) {
    observer.observe(editorEl, { childList: true, subtree: true })
    setupHeaderFolding()
  }
})

// Setup click handlers for org-mode folding
function setupHeaderFolding() {
  const headers = document.querySelectorAll('.tiptap-editor h1, .tiptap-editor h2, .tiptap-editor h3, .tiptap-editor h4, .tiptap-editor h5, .tiptap-editor h6')

  headers.forEach(header => {
    // Remove existing listener to avoid duplicates
    header.removeEventListener('click', toggleFold)
    // Add click listener
    header.addEventListener('click', toggleFold)
  })
}

function toggleFold(event) {
  event.target.classList.toggle('org-folded')
  console.log('📂 Clicked header to toggle fold')
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// Process detected expenses after save
async function processDetectedExpenses() {
  if (!currentNote.value) return

  // Fetch existing expenses for this note from database
  const { data: existingExpenses } = await supabase
    .from('expenses')
    .select('amount, description, category')
    .eq('source_note_id', currentNote.value.id)

  // Create a Set of existing expense keys
  const existingKeys = new Set(
    (existingExpenses || []).map(e => `${e.amount}-${e.description}-${e.category}`)
  )

  for (const expense of detectedExpenses.value) {
    // Create unique identifier for this expense
    const expenseKey = `${expense.amount}-${expense.description}-${expense.category}`

    // Skip if already exists in database OR already processed in this session
    if (existingKeys.has(expenseKey) || processedExpenses.value.has(expenseKey)) {
      console.log('⏭️ Skipping duplicate expense:', expenseKey)
      continue
    }

    try {
      // Create expense in database
      // Use note's creation date (not today's date) to prevent duplicates on re-save
      const createdExpense = await expensesStore.createExpense({
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: currentNote.value.created_at.split('T')[0], // Use note's date, not today
        source_note_id: currentNote.value.id,
        detection_method: 'inline'
      })

      // Create note-expense link
      await expensesStore.createNoteExpenseLink(
        currentNote.value.id,
        createdExpense.id,
        'mentioned',
        1.0
      )

      // Mark as processed
      processedExpenses.value.add(expenseKey)
      existingKeys.add(expenseKey)

      console.log('✅ Created expense:', createdExpense)
    } catch (error) {
      console.error('❌ Failed to create expense:', error)
    }
  }
}

// Process detected wiki-links after save
async function processDetectedLinks() {
  if (!currentNote.value) return

  // Extract all [[links]] from content
  const detectedLinkTitles = extractLinks(content.value)

  // Fetch existing links from database to avoid duplicates
  const existingLinks = await notesStore.fetchNoteLinks(currentNote.value.id)
  const existingLinkTitles = new Set(existingLinks.map(link => link.link_text))

  console.log('🔗 Detected links:', detectedLinkTitles)
  console.log('📚 Existing links:', [...existingLinkTitles])

  for (const linkTitle of detectedLinkTitles) {
    // Skip if already processed in this session OR exists in database
    if (processedLinks.value.has(linkTitle) || existingLinkTitles.has(linkTitle)) {
      console.log('⏭️ Skipping existing link:', linkTitle)
      continue
    }

    try {
      // Try to find the target note by title
      const targetNote = await notesStore.findNoteByTitle(linkTitle)

      if (targetNote) {
        // Target note exists - create link
        await notesStore.createNoteLink(
          currentNote.value.id,  // source (this note)
          targetNote.id,          // target (the linked note)
          linkTitle
        )

        processedLinks.value.add(linkTitle)
        console.log('✅ Created link to existing note:', linkTitle)
      } else {
        // Target note doesn't exist yet
        console.log('⚠️ Target note not found:', linkTitle, '(link not created)')
        // Note: We could auto-create the note here, but for now we skip
        // This follows Obsidian's behavior where links can point to non-existent notes
      }
    } catch (error) {
      console.error('❌ Failed to create link:', linkTitle, error)
    }
  }

  // Clean up: Remove processed links that are no longer in the content
  // This handles the case where user deletes a [[link]]
  const currentLinkSet = new Set(detectedLinkTitles)
  for (const processedLink of processedLinks.value) {
    if (!currentLinkSet.has(processedLink)) {
      processedLinks.value.delete(processedLink)
      console.log('🗑️ Removed deleted link from tracking:', processedLink)
    }
  }
}

// Format date/time for display
function formatDateTime(dateString) {
  if (!dateString) return 'Just now'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>

<style>
/* TipTap Editor Styles */
.tiptap-editor {
  min-height: 300px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 16px;
  line-height: 1.6;
}

.tiptap-editor:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Doom Emacs Org-Mode Style Headers - Hierarchical Indentation with Colors */
/* Each level indents progressively with distinct colors, just like Doom Emacs */

.tiptap-editor h1 {
  color: #4F9FCF;  /* Doom Emacs org-level-1: Blue */
  font-size: 28px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 8px;
  margin-left: 0;  /* Level 1: No indent */
  line-height: 1.3;
}

.tiptap-editor h2 {
  color: #A7C080;  /* Doom Emacs org-level-2: Green */
  font-size: 22px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 6px;
  margin-left: 16px;  /* Level 2: Indent under H1 */
  line-height: 1.3;
}

.tiptap-editor h3 {
  color: #D699B6;  /* Doom Emacs org-level-3: Pink */
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 4px;
  margin-left: 32px;  /* Level 3: Indent under H2 */
  line-height: 1.3;
}

.tiptap-editor h4 {
  color: #DBBC7F;  /* Doom Emacs org-level-4: Yellow */
  font-size: 16px;
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 4px;
  margin-left: 48px;  /* Level 4: Indent under H3 */
  line-height: 1.3;
}

.tiptap-editor h5 {
  color: #E69875;  /* Doom Emacs org-level-5: Orange */
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 2px;
  margin-left: 64px;  /* Level 5: Indent under H4 */
  line-height: 1.3;
}

.tiptap-editor h6 {
  color: #A7C080;  /* Doom Emacs org-level-6: Teal */
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
  margin-bottom: 2px;
  margin-left: 80px;  /* Level 6: Indent under H5 */
  line-height: 1.3;
}

/* Org-Mode Folding - Clickable Headers */
.tiptap-editor h1,
.tiptap-editor h2,
.tiptap-editor h3,
.tiptap-editor h4,
.tiptap-editor h5,
.tiptap-editor h6 {
  cursor: pointer;
  position: relative;
  padding-left: 20px;
}

/* Folding indicator (arrow) */
.tiptap-editor h1::before,
.tiptap-editor h2::before,
.tiptap-editor h3::before,
.tiptap-editor h4::before,
.tiptap-editor h5::before,
.tiptap-editor h6::before {
  content: '▼';
  position: absolute;
  left: 0;
  font-size: 10px;
  color: var(--notion-text-tertiary);
  transition: transform 0.2s ease;
}

/* When folded, rotate arrow */
.tiptap-editor h1.org-folded::before,
.tiptap-editor h2.org-folded::before,
.tiptap-editor h3.org-folded::before,
.tiptap-editor h4.org-folded::before,
.tiptap-editor h5.org-folded::before,
.tiptap-editor h6.org-folded::before {
  transform: rotate(-90deg);
}

/* Hide content after folded headers */
.tiptap-editor h1.org-folded ~ *:not(h1),
.tiptap-editor h2.org-folded ~ *:not(h1):not(h2),
.tiptap-editor h3.org-folded ~ *:not(h1):not(h2):not(h3),
.tiptap-editor h4.org-folded ~ *:not(h1):not(h2):not(h3):not(h4),
.tiptap-editor h5.org-folded ~ *:not(h1):not(h2):not(h3):not(h4):not(h5),
.tiptap-editor h6.org-folded ~ * {
  display: none;
}

.tiptap-editor ul,
.tiptap-editor ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.tiptap-editor p {
  margin: 0.5rem 0;
}

.tiptap-editor strong {
  font-weight: bold;
}

.tiptap-editor em {
  font-style: italic;
}

.tiptap-editor u {
  text-decoration: underline;
}

.tiptap-editor a {
  color: #3b82f6;
  text-decoration: underline;
}

code {
  font-family: 'Courier New', monospace;
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

/* Toolbar button styles */
.tiptap-toolbar button {
  transition: all 0.2s;
}

.tiptap-toolbar button:hover {
  transform: translateY(-1px);
}

.tiptap-toolbar button:active {
  transform: translateY(0);
}

/* Wiki Link Styling */
.wiki-link-text {
  color: #7c3aed !important; /* Purple-600 */
  background-color: #f3e8ff !important; /* Purple-50 */
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer !important;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 2px solid #a78bfa; /* Purple-400 */
  user-select: none; /* Prevent text selection on click */
  pointer-events: auto; /* Ensure clicks are captured */
  display: inline; /* Ensure it's inline with text */
}

.wiki-link-text:hover {
  background-color: #e9d5ff !important; /* Purple-100 */
  border-bottom-color: #7c3aed; /* Purple-600 */
  transform: translateY(-1px);
}

/* Make it clear it's clickable */
.wiki-link-text:active {
  transform: translateY(0);
  background-color: #ddd6fe !important; /* Purple-200 */
}

/* Ensure TipTap editor allows pointer events */
.tiptap-editor .wiki-link-text {
  pointer-events: auto !important;
}
</style>