import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseParser } from '../useExpenseParser'

describe('useExpenseParser', () => {
  let parser

  beforeEach(() => {
    parser = useExpenseParser()
  })

  describe('parseExpenses', () => {
    it('should parse single expense with bracket format', () => {
      const text = '$25 Lunch [Food]'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0]).toMatchObject({
        amount: 25,
        description: 'Lunch',
        category: 'Food',
        format: 'bracket'
      })
    })

    it('should parse multiple expenses', () => {
      const text = '$25 Lunch [Food] and $100 Software License [Software]'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(2)
      expect(expenses[0].amount).toBe(25)
      expect(expenses[1].amount).toBe(100)
    })

    it('should handle decimal amounts', () => {
      const text = '$12.50 Coffee [Food]'
      const expenses = parser.parseExpenses(text)

      expect(expenses[0].amount).toBe(12.50)
    })

    it('should categorize invalid categories as "Other"', () => {
      const text = '$50 Random Thing [InvalidCategory]'
      const expenses = parser.parseExpenses(text)

      expect(expenses[0].category).toBe('Other')
      expect(expenses[0].valid).toBe(false)
    })

    it('should handle valid categories case-insensitively', () => {
      const text = '$25 Lunch [FOOD]'
      const expenses = parser.parseExpenses(text)

      expect(expenses[0].category).toBe('FOOD')
      expect(expenses[0].valid).toBe(true)
    })

    it('should strip HTML tags from input', () => {
      const html = '<p>$25 Lunch [Food]</p>'
      const expenses = parser.parseExpenses(html)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].description).toBe('Lunch')
    })

    it('should ignore plain dollar amounts without brackets', () => {
      const text = 'I have $100 in my wallet and $250 Coffee [Food]'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].description).toBe('Coffee')
    })

    it('should handle empty or null input', () => {
      expect(parser.parseExpenses('')).toEqual([])
      expect(parser.parseExpenses(null)).toEqual([])
      expect(parser.parseExpenses(undefined)).toEqual([])
    })

    it('should handle expenses with multi-word descriptions', () => {
      const text = '$250 Adobe Creative Cloud License [Software]'
      const expenses = parser.parseExpenses(text)

      expect(expenses[0].description).toBe('Adobe Creative Cloud License')
    })

    it('should reject zero or negative amounts', () => {
      const text = '$0 Free Thing [Other]'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(0)
    })

    it('should handle all valid categories', () => {
      const categories = [
        'Food', 'Transport', 'Software', 'Marketing', 'Services',
        'Entertainment', 'Health', 'Education', 'Utilities', 'Other'
      ]

      categories.forEach(cat => {
        const text = `$10 Test [${cat}]`
        const expenses = parser.parseExpenses(text)
        expect(expenses[0].valid).toBe(true)
      })
    })
  })

  describe('VALID_CATEGORIES', () => {
    it('should contain 10 valid categories', () => {
      expect(parser.VALID_CATEGORIES).toHaveLength(10)
    })

    it('should include essential categories', () => {
      expect(parser.VALID_CATEGORIES).toContain('Food')
      expect(parser.VALID_CATEGORIES).toContain('Software')
      expect(parser.VALID_CATEGORIES).toContain('Transport')
    })
  })

  describe('detectedExpenses reactive', () => {
    it('should update detectedExpenses ref when parsing', () => {
      const text = '$25 Lunch [Food]'
      parser.parseExpenses(text)

      expect(parser.detectedExpenses.value).toHaveLength(1)
    })
  })

  describe('parseExpenses with date support', () => {
    it('should parse expense with @yesterday date', () => {
      const text = '$25 Lunch [Food] @yesterday'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].amount).toBe(25)
      expect(expenses[0].description).toBe('Lunch')
      expect(expenses[0].date).not.toBeNull()
      expect(expenses[0].dateStr).toBe('yesterday')
    })

    it('should parse expense with @today date', () => {
      const text = '$100 Software [Software] @today'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].amount).toBe(100)
      expect(expenses[0].date).not.toBeNull()
      expect(expenses[0].dateStr).toBe('today')
    })

    it('should parse expense with ISO format date @2025-11-10', () => {
      const text = '$50 Transport [Transport] @2025-11-10'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].date).toBe('2025-11-10')
      expect(expenses[0].dateStr).toBe('2025-11-10')
    })

    it('should parse expense with MM/DD shorthand date @11/10', () => {
      const text = '$45 Coffee [Food] @11/10'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].date).not.toBeNull()
      expect(expenses[0].dateStr).toBe('11/10')
    })

    it('should parse expense with relative date @5 days ago', () => {
      const text = '$75 Groceries [Food] @5 days ago'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].date).not.toBeNull()
      expect(expenses[0].dateStr).toBe('5 days ago')
    })

    it('should parse expense without date (returns null)', () => {
      const text = '$25 Lunch [Food]'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].date).toBeNull()
      expect(expenses[0].dateStr).toBeNull()
    })

    it('should parse multiple expenses with different dates', () => {
      const text = '$25 Lunch [Food] @yesterday and $100 Software [Software] @2025-10-15 and $50 Transport [Transport]'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(3)
      expect(expenses[0].dateStr).toBe('yesterday')
      expect(expenses[1].dateStr).toBe('2025-10-15')
      expect(expenses[2].dateStr).toBeNull()
    })

    it('should ignore invalid dates', () => {
      const text = '$25 Lunch [Food] @invalid-date'
      const expenses = parser.parseExpenses(text)

      expect(expenses).toHaveLength(1)
      expect(expenses[0].date).toBeNull()
    })
  })
})
