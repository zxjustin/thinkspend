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
      <div class="border-b border-surface-200 p-6">
        <InputText
          v-model="title"
          placeholder="Untitled"
          class="w-full text-3xl font-bold border-0 p-0 focus:ring-0"
          unstyled
        />

        <!-- Save Status & Expense Detection -->
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-surface-500">
            <i :class="saveIcon"></i>
            <span>{{ saveStatus }}</span>
          </div>

          <!-- Expense Detection Badge -->
          <div v-if="detectedExpenses.length > 0" class="flex items-center gap-2">
            <Badge
              :value="detectedExpenses.length"
              severity="warning"
            />
            <span class="text-sm text-surface-600">
              {{ detectedExpenses.length }} expense{{ detectedExpenses.length > 1 ? 's' : '' }} detected
            </span>
          </div>
        </div>

        <!-- Last Edited -->
        <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <i class="pi pi-calendar text-xs"></i>
          <span>Last edited: {{ formatDateTime(currentNote.updated_at) }}</span>
        </div>
      </div>

      <!-- Content Editor -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- TipTap Toolbar -->
        <div v-if="editor" class="tiptap-toolbar mb-4 p-2 bg-gray-50 border border-gray-200 rounded-lg flex gap-1">
          <button
            @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-gray-200': editor.isActive('bold') }"
            class="px-3 py-1 rounded hover:bg-gray-200"
          >
            <i class="pi pi-bold"></i>
          </button>
          <button
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200': editor.isActive('italic') }"
            class="px-3 py-1 rounded hover:bg-gray-200"
          >
            <i class="pi pi-italic"></i>
          </button>
          <button
            @click="editor.chain().focus().toggleUnderline().run()"
            :class="{ 'bg-gray-200': editor.isActive('underline') }"
            class="px-3 py-1 rounded hover:bg-gray-200"
          >
            <i class="pi pi-underline"></i>
          </button>
          <div class="w-px bg-gray-300 mx-2"></div>
          <button
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'bg-blue-200': editor.isActive('heading', { level: 1 }) }"
            class="px-3 py-1 rounded hover:bg-gray-200 font-bold"
          >
            H1
          </button>
          <button
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'bg-purple-200': editor.isActive('heading', { level: 2 }) }"
            class="px-3 py-1 rounded hover:bg-gray-200 font-bold"
          >
            H2
          </button>
          <button
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="{ 'bg-green-200': editor.isActive('heading', { level: 3 }) }"
            class="px-3 py-1 rounded hover:bg-gray-200 font-bold"
          >
            H3
          </button>
          <div class="w-px bg-gray-300 mx-2"></div>
          <button
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-gray-200': editor.isActive('bulletList') }"
            class="px-3 py-1 rounded hover:bg-gray-200"
          >
            <i class="pi pi-list"></i>
          </button>
          <button
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-200': editor.isActive('orderedList') }"
            class="px-3 py-1 rounded hover:bg-gray-200"
          >
            <i class="pi pi-list-check"></i>
          </button>
        </div>

        <!-- TipTap Editor -->
        <EditorContent :editor="editor" class="tiptap-editor" />

        <!-- Syntax Help -->
        <div class="mt-4 space-y-3">
          <!-- Expense Detection -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="pi pi-dollar text-blue-600 mt-1"></i>
              <div class="flex-1">
                <p class="text-sm font-semibold text-blue-900 mb-2">
                  💰 Expense Tracking
                </p>
                <div class="space-y-2 text-sm text-blue-700">
                  <div>
                    <span class="font-medium">Format:</span>
                    <code class="bg-blue-100 px-2 py-1 rounded ml-1">$25 Lunch [Food]</code>
                  </div>
                  <div>
                    <span class="font-medium">No category:</span>
                    <code class="bg-blue-100 px-2 py-1 rounded ml-1">$25 Coffee [Other]</code>
                  </div>
                </div>
                <p class="text-xs text-blue-600 mt-2">
                  Use <code class="bg-blue-100 px-1 rounded">[Category]</code> to track expenses explicitly
                </p>
                <p class="text-xs text-blue-600 mt-1">
                  Categories: {{ VALID_CATEGORIES.join(', ') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Org-Mode Headers -->
          <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="pi pi-align-left text-purple-600 mt-1"></i>
              <div class="flex-1">
                <p class="text-sm font-semibold text-purple-900 mb-2">
                  📝 Org-Mode Headers
                </p>
                <div class="space-y-1 text-xs text-purple-700">
                  <div class="flex items-center gap-2">
                    <code class="bg-purple-100 px-2 py-1 rounded font-mono">*</code>
                    <span>+ <kbd class="bg-white px-1 rounded border text-xs">Space</kbd></span>
                    <span>→ <span class="text-blue-600 font-bold">H1 Blue</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <code class="bg-purple-100 px-2 py-1 rounded font-mono">**</code>
                    <span>+ <kbd class="bg-white px-1 rounded border text-xs">Space</kbd></span>
                    <span>→ <span class="text-purple-600 font-bold">H2 Purple</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <code class="bg-purple-100 px-2 py-1 rounded font-mono">***</code>
                    <span>+ <kbd class="bg-white px-1 rounded border text-xs">Space</kbd></span>
                    <span>→ <span class="text-green-600 font-bold">H3 Green</span></span>
                  </div>
                </div>
                <p class="text-xs text-purple-600 mt-2">
                  💡 More asterisks = deeper level (supports up to 6 levels)
                </p>
              </div>
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
import Badge from 'primevue/badge'

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

const currentNote = computed(() => notesStore.currentNote)

const saveIcon = computed(() => {
  return {
    'pi pi-check-circle text-green-500': saveStatus.value === 'saved',
    'pi pi-spin pi-spinner': saveStatus.value === 'saving',
    'pi pi-times-circle text-red-500': saveStatus.value === 'error'
  }
})

// Custom Org-Mode Extension for TipTap
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
      const createdExpense = await expensesStore.createExpense({
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
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

/* Org-mode style headers with colors */
.tiptap-editor h1 {
  color: #2563eb;  /* Blue */
  font-size: 2em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.3em;
}

.tiptap-editor h2 {
  color: #9333ea;  /* Purple */
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  border-bottom: 2px solid #a855f7;
  padding-bottom: 0.2em;
}

.tiptap-editor h3 {
  color: #16a34a;  /* Green */
  font-size: 1.3em;
  font-weight: bold;
  margin-top: 0.6em;
  margin-bottom: 0.3em;
}

.tiptap-editor h4 {
  color: #ea580c;  /* Orange */
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 0.5em;
  margin-bottom: 0.3em;
}

.tiptap-editor h5 {
  color: #dc2626;  /* Red */
  font-size: 1.1em;
  font-weight: bold;
  margin-top: 0.5em;
  margin-bottom: 0.2em;
}

.tiptap-editor h6 {
  color: #7c3aed;  /* Violet */
  font-size: 1em;
  font-weight: bold;
  margin-top: 0.5em;
  margin-bottom: 0.2em;
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