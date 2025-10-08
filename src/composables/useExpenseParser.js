import { ref } from 'vue'

export function useExpenseParser() {
  const detectedExpenses = ref([])

  // Valid categories (matches your database design)
  const VALID_CATEGORIES = [
    'Food', 'Transport', 'Software', 'Marketing', 'Services',
    'Entertainment', 'Health', 'Education', 'Utilities', 'Other'
  ]

  /**
   * Parses expenses from text
   * Format: $amount - description - category
   * Example: $250 - Adobe License - Software
   */
  function parseExpenses(text) {
    if (!text) return []

    // Regex pattern: $amount - description - category
    const expensePattern = /\$(\d+(?:\.\d{2})?)\s*-\s*([^-]+?)\s*-\s*([^-\n]+)/g
    const expenses = []
    let match

    while ((match = expensePattern.exec(text)) !== null) {
      const amount = parseFloat(match[1])
      const description = match[2].trim()
      const category = match[3].trim()

      // Validate
      if (amount > 0 && description && category) {
        // Check if category is valid (case-insensitive)
        const isValidCategory = VALID_CATEGORIES.some(
          cat => cat.toLowerCase() === category.toLowerCase()
        )

        expenses.push({
          amount,
          description,
          category: isValidCategory ? category : 'Other',
          position: match.index,
          valid: isValidCategory
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