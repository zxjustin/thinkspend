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
   * Parse a date string in various formats
   * Supports:
   * - @today, @yesterday, @tomorrow
   * - @last friday, @next week, @5 days ago
   * - @2025-11-10 (ISO format)
   * - @11/10 (MM/DD, assumes current year)
   */
  function parseDate(dateStr) {
    if (!dateStr) return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Handle @today, @yesterday, @tomorrow
    if (dateStr === 'today') {
      return today
    }
    if (dateStr === 'yesterday') {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    }
    if (dateStr === 'tomorrow') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }

    // Handle ISO format: YYYY-MM-DD
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]))
    }

    // Handle shorthand: MM/DD (assumes current year)
    const shortMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/)
    if (shortMatch) {
      const month = parseInt(shortMatch[1]) - 1
      const day = parseInt(shortMatch[2])
      if (month >= 0 && month < 12 && day > 0 && day <= 31) {
        return new Date(now.getFullYear(), month, day)
      }
    }

    // Handle MM-DD format (assumes current year)
    const dashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})$/)
    if (dashMatch) {
      const month = parseInt(dashMatch[1]) - 1
      const day = parseInt(dashMatch[2])
      if (month >= 0 && month < 12 && day > 0 && day <= 31) {
        return new Date(now.getFullYear(), month, day)
      }
    }

    // Handle relative dates: "5 days ago", "last friday", etc.
    const relativeMatch = dateStr.match(/^(\d+)\s+days?\s+ago$/)
    if (relativeMatch) {
      const daysAgo = parseInt(relativeMatch[1])
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      return date
    }

    return null
  }

  /**
   * Convert Date object to YYYY-MM-DD string
   */
  function dateToString(date) {
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Parses expenses from text (supports HTML from Quill)
   *
   * Explicit format using square brackets with optional date:
   * - $amount Description [Category]                (e.g., $250 Adobe License [Software])
   * - $amount Description [Category] @date         (e.g., $25 Lunch [Food] @yesterday)
   * - $amount Description [Category] @2025-11-10   (e.g., $100 Software [Software] @2025-11-10)
   *
   * Normal text with $ is ignored unless bracketed
   */
  function parseExpenses(text) {
    if (!text) return []

    // Strip HTML tags (TipTap returns HTML)
    const plainText = stripHtml(text)

    const expenses = []

    // Pattern: $amount Description [Category] [optional @date]
    // Date can be @today, @yesterday, @2025-11-10, @11/10, @5 days ago, etc.
    // The date pattern captures text after @ until a boundary (space/newline that's not part of "days ago")
    const bracketPattern = /\$(\d+(?:\.\d{1,2})?)\s+([^\[\n$]+?)\s*\[([^\]]+)\](?:\s+@(today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}|\d+\s+days?\s+ago))?/g
    let match

    while ((match = bracketPattern.exec(plainText)) !== null) {
      const amount = parseFloat(match[1])
      const description = match[2].trim()
      const category = match[3].trim()
      const dateStr = match[4]

      if (amount > 0 && description) {
        const isValidCategory = VALID_CATEGORIES.some(
          cat => cat.toLowerCase() === category.toLowerCase()
        )

        let parsedDate = null
        if (dateStr) {
          parsedDate = parseDate(dateStr.trim())
        }

        expenses.push({
          amount,
          description,
          category: isValidCategory ? category : 'Other',
          date: parsedDate ? dateToString(parsedDate) : null,
          position: match.index,
          valid: isValidCategory,
          format: 'bracket',
          dateStr: dateStr || null
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