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
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <!-- TipTap Editor -->
        <EditorContent
          :editor="editor"
          class="min-h-[400px] border border-gray-200 rounded-lg p-6 text-base leading-relaxed bg-white transition-all duration-200 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] outline-none tiptap-editor"
        />

        <!-- Tips & Help - PrimeVue Accordion -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-4 notion-text-primary">💡 Tips & Help</h3>
          <Accordion class="notion-accordion">
            <!-- Expense Tracking Tip -->
            <AccordionPanel value="0">
              <AccordionHeader>
                <div class="flex items-center gap-2">
                  <i class="pi pi-dollar" style="font-size: 14px; color: var(--accent-green);"></i>
                  <span class="font-medium" style="color: var(--accent-green);">Expense Tracking</span>
                </div>
              </AccordionHeader>
              <AccordionContent>
                <div class="space-y-3 text-sm notion-text-secondary">
                  <div>
                    <span class="font-medium">Basic Format:</span>
                    <code class="px-2 py-0.5 rounded ml-1 text-xs" style="background-color: var(--notion-bg-selected);">$25 Lunch [Food]</code>
                  </div>

                  <!-- Date Support Info -->
                  <div class="pt-2 border-t" style="border-color: var(--accent-green);">
                    <p class="text-xs font-medium notion-text-secondary mb-2">Add dates with @date syntax (optional):</p>
                    <div class="text-xs notion-text-tertiary space-y-1 ml-2">
                      <div><code style="background-color: var(--notion-bg-selected); padding: 2px 4px; border-radius: 2px;">@yesterday</code> - Previous day</div>
                      <div><code style="background-color: var(--notion-bg-selected); padding: 2px 4px; border-radius: 2px;">@today</code> - Current day (default)</div>
                      <div><code style="background-color: var(--notion-bg-selected); padding: 2px 4px; border-radius: 2px;">@2025-11-10</code> - Specific date</div>
                      <div><code style="background-color: var(--notion-bg-selected); padding: 2px 4px; border-radius: 2px;">@11/10</code> - MM/DD format</div>
                      <div><code style="background-color: var(--notion-bg-selected); padding: 2px 4px; border-radius: 2px;">@5 days ago</code> - Relative date</div>
                    </div>
                    <p class="text-xs notion-text-tertiary mt-2">Example: <code style="background-color: var(--notion-bg-selected); padding: 2px 4px; border-radius: 2px;">$25 Lunch [Food] @yesterday</code></p>
                  </div>

                  <!-- Legacy Date Override Option -->
                  <div class="pt-2 border-t" style="border-color: var(--accent-green);">
                    <label class="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        v-model="useCustomExpenseDate"
                        class="rounded border-gray-300"
                        style="color: var(--accent-green);"
                      />
                      <span class="text-xs font-medium">Use custom date for all expenses in this note</span>
                    </label>
                    <div v-if="useCustomExpenseDate" class="flex items-center gap-2">
                      <input
                        type="date"
                        v-model="customExpenseDate"
                        class="px-2 py-1 text-xs rounded border notion-bg notion-text-primary"
                        style="border-color: var(--accent-green);"
                      />
                      <button
                        @click="customExpenseDate = new Date().toISOString().split('T')[0]"
                        class="px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors notion-text-secondary"
                        title="Set to today"
                      >
                        Today
                      </button>
                    </div>
                    <p class="text-xs notion-text-tertiary mt-1">
                      {{ useCustomExpenseDate ? 'Default date will be: ' + formatExpenseDate(customExpenseDate) : 'Uses @date syntax or note creation date' }}
                    </p>
                  </div>

                  <p class="text-xs notion-text-tertiary pt-2 border-t" style="border-color: var(--accent-green);">
                    <span class="font-medium">Categories:</span> {{ VALID_CATEGORIES.join(', ') }}
                  </p>
                </div>
              </AccordionContent>
            </AccordionPanel>

            <!-- Org-Mode Headers Tip -->
            <AccordionPanel value="1">
              <AccordionHeader>
                <div class="flex items-center gap-2">
                  <i class="pi pi-align-left" style="font-size: 14px; color: var(--accent-purple);"></i>
                  <span class="font-medium" style="color: var(--accent-purple);">Org-Mode Headers</span>
                </div>
              </AccordionHeader>
              <AccordionContent>
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
                <div class="mt-3 pt-3 border-t" style="border-color: var(--accent-purple);">
                  <p class="text-xs font-medium notion-text-secondary mb-2">Hierarchical Organization:</p>
                  <div class="text-xs notion-text-tertiary space-y-1">
                    <div>🎯 <strong>Visual Hierarchy:</strong> Headers are color-coded by level</div>
                    <div>📂 H2s nest under H1s, H3s under H2s (shown by indentation)</div>
                    <div>⌨️ Keyboard-first: Type * + Space to create headers</div>
                    <div>✨ Organize your notes with structured sections!</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
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
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

const notesStore = useNotesStore()
const expensesStore = useExpensesStore()
const { parseExpenses, VALID_CATEGORIES } = useExpenseParser()
const { extractLinks } = useLinkDetector()

const title = ref('')
const content = ref('')
const saveStatus = ref('saved')
const detectedExpenses = ref([])
const processedExpenses = ref(new Set())
const processedLinks = ref(new Set())
const useCustomExpenseDate = ref(false)
const customExpenseDate = ref(new Date().toISOString().split('T')[0])

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

        const textBefore = $from.parent.textContent
        console.log('🔍 Space pressed, line text:', JSON.stringify(textBefore))

        const match = textBefore.match(/^(\*{1,6})$/)

        if (match) {
          const level = match[1].length
          console.log('✅ Converting to H' + level)

          editor
            .chain()
            .deleteRange({ from: $from.pos - level, to: $from.pos })
            .setHeading({ level })
            .run()

          return true
        }

        return false
      },

      'Enter': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        if ($from.parent.type.name.startsWith('heading')) {
          console.log('↩️ Enter pressed in header, creating indented content')

          editor.chain().insertContentAt($from.pos + 1, '<p></p>').run()

          const newPos = $from.pos + 2
          editor.commands.setTextSelection(newPos)

          return true
        }

        return false
      }
    }
  }
})

// Handle wiki link clicks
async function handleWikiLinkClick(linkTitle) {
  console.log('🔗 Wiki link clicked:', linkTitle)

  const targetNote = await notesStore.findNoteByTitle(linkTitle)

  if (targetNote) {
    notesStore.selectNote(targetNote.id)
    console.log('📍 Navigated to:', targetNote.title)
  } else {
    console.warn('⚠️ Note not found:', linkTitle)
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

    await processDetectedExpenses()
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

// Load note when selected
watch(currentNote, (note) => {
  if (note && editor.value) {
    title.value = note.title || ''
    content.value = note.content || ''

    editor.value.commands.setContent(note.content || '')

    saveStatus.value = 'saved'
    processedExpenses.value.clear()
    processedLinks.value.clear()
  }
})

onMounted(() => {
  console.log('🚀 NoteEditor mounted')
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// Process detected expenses after save
async function processDetectedExpenses() {
  if (!currentNote.value) return

  const { data: existingExpenses } = await supabase
    .from('expenses')
    .select('id, amount, description, category')
    .eq('source_note_id', currentNote.value.id)

  const existingExpenseMap = new Map(
    (existingExpenses || []).map(e => [
      `${e.amount}-${e.description}-${e.category}`,
      e.id
    ])
  )

  // Get current expenses detected in the note
  const currentExpenseKeys = new Set(
    detectedExpenses.value.map(e => `${e.amount}-${e.description}-${e.category}`)
  )

  // Delete expenses that are no longer in the note
  for (const [expenseKey, expenseId] of existingExpenseMap) {
    if (!currentExpenseKeys.has(expenseKey) && !processedExpenses.value.has(expenseKey)) {
      try {
        await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId)

        console.log('🗑️ Deleted removed expense:', expenseKey)
      } catch (error) {
        console.error('❌ Failed to delete expense:', error)
      }
    }
  }

  // Add new expenses
  for (const expense of detectedExpenses.value) {
    const expenseKey = `${expense.amount}-${expense.description}-${expense.category}`

    if (existingExpenseMap.has(expenseKey) || processedExpenses.value.has(expenseKey)) {
      console.log('⏭️ Skipping duplicate expense:', expenseKey)
      continue
    }

    try {
      // Use parsed date from expense if available, otherwise fall back to custom or today's date
      let expenseDate
      if (expense.date) {
        // Date was parsed from @date syntax in the expense format
        expenseDate = expense.date
      } else if (useCustomExpenseDate.value) {
        expenseDate = customExpenseDate.value
      } else {
        // Default to today's date (standard expense app behavior)
        expenseDate = new Date().toISOString().split('T')[0]
      }

      const createdExpense = await expensesStore.createExpense({
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expenseDate,
        source_note_id: currentNote.value.id,
        detection_method: 'inline'
      })

      await expensesStore.createNoteExpenseLink(
        currentNote.value.id,
        createdExpense.id,
        'mentioned',
        1.0
      )

      processedExpenses.value.add(expenseKey)
      existingExpenseMap.set(expenseKey, createdExpense.id)

      console.log('✅ Created expense:', createdExpense)
    } catch (error) {
      console.error('❌ Failed to create expense:', error)
    }
  }
}

// Process detected wiki-links after save
async function processDetectedLinks() {
  if (!currentNote.value) return

  const detectedLinkTitles = extractLinks(content.value)

  const existingLinks = await notesStore.fetchNoteLinks(currentNote.value.id)
  const existingLinkTitles = new Set(existingLinks.map(link => link.link_text))

  console.log('🔗 Detected links:', detectedLinkTitles)
  console.log('📚 Existing links:', [...existingLinkTitles])

  for (const linkTitle of detectedLinkTitles) {
    if (processedLinks.value.has(linkTitle) || existingLinkTitles.has(linkTitle)) {
      console.log('⏭️ Skipping existing link:', linkTitle)
      continue
    }

    try {
      const targetNote = await notesStore.findNoteByTitle(linkTitle)

      if (targetNote) {
        await notesStore.createNoteLink(
          currentNote.value.id,
          targetNote.id,
          linkTitle
        )

        processedLinks.value.add(linkTitle)
        console.log('✅ Created link to existing note:', linkTitle)
      } else {
        console.log('⚠️ Target note not found:', linkTitle, '(link not created)')
      }
    } catch (error) {
      console.error('❌ Failed to create link:', linkTitle, error)
    }
  }

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

// Format expense date for display
function formatExpenseDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

</script>

<style>
/* TipTap Editor - Org-Mode Style Collapsible Headers */

/* H1 - Blue - Top level */
.tiptap-editor h1 {
  color: #81A2BE;
  font-size: 26px;
  font-weight: 600;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.375;
  letter-spacing: -0.02em;
}

/* H2 - Green - Nested under H1 */
.tiptap-editor h2 {
  color: #B5BD68;
  font-size: 22px;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.625rem;
  margin-left: 0.75rem;
  line-height: 1.375;
}

/* H3 - Pink - Nested under H2 */
.tiptap-editor h3 {
  color: #DE935F;
  font-size: 19px;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  margin-left: 1.5rem;
  line-height: 1.375;
}

/* H4, H5, H6 - Additional levels without collapse */
.tiptap-editor h4 {
  color: #B294BB;
  font-size: 17px;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.375rem;
  margin-left: 2.25rem;
  line-height: 1.375;
}

.tiptap-editor h5 {
  color: #8ABEB7;
  font-size: 16px;
  font-weight: 600;
  margin-top: 0.875rem;
  margin-bottom: 0.375rem;
  margin-left: 3rem;
  line-height: 1.375;
}

.tiptap-editor h6 {
  color: #CC6666;
  font-size: 15px;
  font-weight: 500;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  margin-left: 3.75rem;
  line-height: 1.375;
}

/* PrimeVue Accordion Styling */
.notion-accordion {
  border: 1px solid var(--notion-border);
  border-radius: 8px;
  overflow: hidden;
}

.notion-accordion :deep(.p-accordionpanel) {
  border-bottom: 1px solid var(--notion-border);
}

.notion-accordion :deep(.p-accordionpanel:last-child) {
  border-bottom: none;
}

.notion-accordion :deep(.p-accordionheader-content) {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--notion-bg);
}

.notion-accordion :deep(.p-accordionheader-content:hover) {
  background-color: var(--notion-bg-hover);
}

.notion-accordion :deep(.p-accordionpanel-content) {
  padding: 16px;
  background-color: var(--notion-bg);
  border-top: 1px solid var(--notion-border);
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

/* Wiki Link Styling */
.wiki-link-text {
  color: #7c3aed !important;
  background-color: #f3e8ff !important;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer !important;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 2px solid #a78bfa;
  user-select: none;
  pointer-events: auto;
  display: inline;
}

.wiki-link-text:hover {
  background-color: #e9d5ff !important;
  border-bottom-color: #7c3aed;
  transform: translateY(-1px);
}

.wiki-link-text:active {
  transform: translateY(0);
  background-color: #ddd6fe !important;
}

.tiptap-editor .wiki-link-text {
  pointer-events: auto !important;
}
</style>