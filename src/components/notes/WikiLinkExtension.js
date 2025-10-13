/**
 * TipTap Extension for Wiki-style [[links]]
 *
 * Features:
 * - Detects [[Note Title]] patterns
 * - Styles them as clickable links (blue, underlined)
 * - Click to navigate to linked note
 * - Shows purple if link exists, gray if not
 */

import { Mark } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const WikiLink = Mark.create({
  name: 'wikiLink',

  // This mark doesn't have storage in the HTML
  // We detect it dynamically from the text content
  parseHTML() {
    return []
  },

  renderHTML() {
    return ['span', { class: 'wiki-link' }, 0]
  },

  addProseMirrorPlugins() {
    const { onLinkClick } = this.options

    return [
      new Plugin({
        key: new PluginKey('wikiLink'),

        props: {
          handleDOMEvents: {
            click: (view, event) => {
              console.log('👆 Click detected in editor')

              // Check if clicked element has wiki-link class
              const target = event.target

              if (target && target.classList && target.classList.contains('wiki-link-text')) {
                const linkTitle = target.getAttribute('data-link-title')

                if (linkTitle && onLinkClick) {
                  console.log('🔗 Clicked wiki link (DOM):', linkTitle)
                  onLinkClick(linkTitle)
                  event.preventDefault()
                  event.stopPropagation()
                  return true
                }
              }

              return false
            }
          },

          decorations(state) {
            const decorations = []
            const { doc } = state

            // Regex to find [[links]]
            const linkPattern = /\[\[([^\]]+)\]\]/g

            // Iterate through all text nodes
            doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text
              let match

              // Find all [[links]] in this text node
              while ((match = linkPattern.exec(text)) !== null) {
                const from = pos + match.index
                const to = from + match[0].length
                const linkTitle = match[1]

                // Create decoration (visual styling)
                const decoration = Decoration.inline(from, to, {
                  class: 'wiki-link-text',
                  'data-link-title': linkTitle,
                  style: 'cursor: pointer;' // Inline style as backup
                })

                decorations.push(decoration)
                console.log('🎨 Created decoration for link:', linkTitle)
              }
            })

            if (decorations.length > 0) {
              console.log(`📝 Total decorations created: ${decorations.length}`)
            }

            return DecorationSet.create(doc, decorations)
          }
        },
      }),
    ]
  },

  addOptions() {
    return {
      onLinkClick: null, // Callback function when link is clicked
    }
  },
})

export default WikiLink
