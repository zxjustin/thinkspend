import { ref } from 'vue'

export function useExpenseParser() {
  const detectedExpenses = ref([])

  // Valid categories (matches your database design)
  const VALID_CATEGORIES = [
    'Food', 'Transport', 'Software', 'Marketing', 'Services',
    'Entertainment', 'Health', 'Education', 'Utilities', 'Other'
  ]

  /**
   * Strip HTML tags from text
   */
  function stripHtml(html) {
    if (!html) return ''
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  /**
   * Parses expenses from text (supports HTML from Quill)
   *
   * Explicit format using square brackets:
   * - $amount Description [Category]   (e.g., $250 Adobe License [Software])
   * - $amount Description [Other]      (e.g., $25 Lunch [Other])
   *
   * Normal text with $ is ignored unless bracketed
   */
  function parseExpenses(text) {
    if (!text) return []

    // Strip HTML tags (Quill returns HTML)
    const plainText = stripHtml(text)

    const expenses = []

    // Only pattern: $amount Description [Category]
    // This is explicit - only track when brackets are present
    const bracketPattern = /\$(\d+(?:\.\d{1,2})?)\s+([^\[\n$]+?)\s*\[([^\]]+)\]/g
    let match

    while ((match = bracketPattern.exec(plainText)) !== null) {
      const amount = parseFloat(match[1])
      const description = match[2].trim()
      const category = match[3].trim()

      if (amount > 0 && description) {
        const isValidCategory = VALID_CATEGORIES.some(
          cat => cat.toLowerCase() === category.toLowerCase()
        )

        expenses.push({
          amount,
          description,
          category: isValidCategory ? category : 'Other',
          position: match.index,
          valid: isValidCategory,
          format: 'bracket'
        })
      }
    }

    detectedExpenses.value = expenses
    return expenses
  }

  /**
   * Highlights detected expenses in text
   * Wraps them in <span> tags for visual highlighting
   */
  function highlightExpenses(text) {
    if (!text) return text

    const expenses = parseExpenses(text)
    if (expenses.length === 0) return text

    let highlightedText = text
    let offset = 0

    expenses.forEach(expense => {
      const expenseText = `$${expense.amount} - ${expense.description} - ${expense.category}`
      const startPos = expense.position + offset
      const endPos = startPos + expenseText.length

      const highlightClass = expense.valid 
        ? 'bg-yellow-200 px-1 rounded' 
        : 'bg-red-200 px-1 rounded'

      const highlighted = `<span class="${highlightClass}" data-expense="true">${expenseText}</span>`

      highlightedText = 
        highlightedText.slice(0, startPos) +
        highlighted +
        highlightedText.slice(endPos)

      offset += highlighted.length - expenseText.length
    })

    return highlightedText
  }

  return {
    parseExpenses,
    highlightExpenses,
    detectedExpenses,
    VALID_CATEGORIES
  }
}