import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useExpenseParser } from '../../composables/useExpenseParser'
import { useLinkDetector } from '../../composables/useLinkDetector'
import { extractSearchTerms, calculateRelevance } from '../../lib/crossNoteDiscovery'

/**
 * Integration Tests for Note-Expense Flow
 *
 * These tests verify the complete user journey:
 * 1. User creates note with expenses
 * 2. Expenses are parsed
 * 3. Related notes are discovered
 * 4. Links are created
 */

describe('Note-Expense Integration Flow', () => {
  describe('End-to-End Expense Detection', () => {
    it('should parse expenses from note content', () => {
      const parser = useExpenseParser()
      const noteContent = `
        Meeting notes from today:
        - Bought lunch $25 Coffee and Sandwich [Food]
        - Paid for Uber $15 Ride to office [Transport]
        - Renewed Adobe license $250 Creative Cloud [Software]
      `

      const expenses = parser.parseExpenses(noteContent)

      expect(expenses).toHaveLength(3)
      expect(expenses[0].category).toBe('Food')
      expect(expenses[1].category).toBe('Transport')
      expect(expenses[2].category).toBe('Software')
    })

    it('should detect both expenses and wiki links in same note', () => {
      const parser = useExpenseParser()
      const detector = useLinkDetector()

      const noteContent = `
        See [[Project Meeting]] notes.
        Expenses: $25 Lunch [Food]
        Related: [[Budget Planning]]
      `

      const expenses = parser.parseExpenses(noteContent)
      const links = detector.extractLinks(noteContent)

      expect(expenses).toHaveLength(1)
      expect(links).toHaveLength(2)
      expect(links).toContain('Project Meeting')
      expect(links).toContain('Budget Planning')
    })
  })

  describe('Cross-Note Discovery Integration', () => {
    it('should discover related notes for software expense', () => {
      // Simulated expense
      const expense = {
        description: 'Adobe Creative Cloud License',
        category: 'Software'
      }

      // Simulated notes database
      const notes = [
        {
          id: '1',
          title: 'Design Tools',
          content: 'I use Adobe Creative Cloud for all my design work'
        },
        {
          id: '2',
          title: 'Software Subscriptions',
          content: 'Monthly software costs include Adobe and others'
        },
        {
          id: '3',
          title: 'Lunch Meeting',
          content: 'Had lunch with client today'
        }
      ]

      const searchTerms = extractSearchTerms(expense.description, expense.category)

      // Calculate relevance for each note
      const scoredNotes = notes.map(note => ({
        note,
        score: calculateRelevance(note, searchTerms, expense.category)
      }))

      const relevantNotes = scoredNotes.filter(({ score }) => score >= 0.3)

      expect(relevantNotes.length).toBeGreaterThan(0)
      expect(relevantNotes[0].note.title).toMatch(/Design Tools|Software/)
    })

    it('should rank notes by relevance', () => {
      const expense = {
        description: 'Coffee Meeting',
        category: 'Food'
      }

      const notes = [
        {
          id: '1',
          title: 'Coffee Shop Reviews',
          content: 'Best coffee places in the city, food and meeting spots'
        },
        {
          id: '2',
          title: 'Random Note',
          content: 'Nothing relevant in this note at all'
        },
        {
          id: '3',
          title: 'Meeting Notes',
          content: 'Had a meeting with client'
        }
      ]

      const searchTerms = extractSearchTerms(expense.description, expense.category)

      const scoredNotes = notes
        .map(note => ({
          note,
          score: calculateRelevance(note, searchTerms, expense.category)
        }))
        .sort((a, b) => b.score - a.score)

      // First note should be most relevant and have coffee in title
      expect(scoredNotes[0].score).toBeGreaterThan(0)
      expect(scoredNotes[0].score).toBeGreaterThan(scoredNotes[1].score)
      // The note with "Coffee" in title should rank higher
      const coffeeNote = scoredNotes.find(s => s.note.title.includes('Coffee'))
      expect(coffeeNote).toBeDefined()
      expect(coffeeNote.score).toBeGreaterThan(scoredNotes[scoredNotes.length - 1].score)
    })
  })

  describe('Multi-Expense Note', () => {
    it('should handle note with multiple expenses correctly', () => {
      const parser = useExpenseParser()

      const noteContent = `
        Business trip expenses:
        1. $150 Flight [Transport]
        2. $80 Hotel [Services]
        3. $25 Breakfast [Food]
        4. $30 Lunch [Food]
        5. $45 Dinner [Food]
      `

      const expenses = parser.parseExpenses(noteContent)

      expect(expenses).toHaveLength(5)

      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      expect(totalAmount).toBe(330)

      const foodExpenses = expenses.filter(exp => exp.category === 'Food')
      expect(foodExpenses).toHaveLength(3)
    })
  })

  describe('Realistic User Scenarios', () => {
    it('should handle project planning note', () => {
      const parser = useExpenseParser()
      const detector = useLinkDetector()

      const noteContent = `
        # Project Planning Meeting

        Discussed budget with [[Client Name]]

        Estimated costs:
        - $500 Development tools [Software]
        - $200 Marketing [Marketing]

        Next: Review [[Budget Spreadsheet]]
      `

      const expenses = parser.parseExpenses(noteContent)
      const links = detector.extractLinks(noteContent)

      expect(expenses).toHaveLength(2)
      expect(links).toHaveLength(2)
      expect(expenses[0].amount).toBe(500)
    })

    it('should handle daily journal entry', () => {
      const parser = useExpenseParser()

      const noteContent = `
        ## 2024-01-15 Daily Log

        Started the day with coffee ($5 Starbucks [Food])

        Took Uber to office ($12 Morning commute [Transport])

        Lunch meeting with team ($35 Restaurant [Food])

        Evening: Paid for Adobe subscription $250 Creative Cloud [Software]
      `

      const expenses = parser.parseExpenses(noteContent)

      expect(expenses).toHaveLength(4)

      const categories = expenses.map(e => e.category)
      expect(categories).toContain('Food')
      expect(categories).toContain('Transport')
      expect(categories).toContain('Software')
    })

    it('should handle mixed content with plain dollar mentions', () => {
      const parser = useExpenseParser()

      const noteContent = `
        The project is worth $10,000 total.

        I have $500 in my account.

        Actual expense: $25 Lunch [Food]
      `

      const expenses = parser.parseExpenses(noteContent)

      // Should only detect the bracketed expense
      expect(expenses).toHaveLength(1)
      expect(expenses[0].description).toBe('Lunch')
    })
  })

  describe('Performance with Real Data', () => {
    it('should handle large note efficiently', () => {
      const parser = useExpenseParser()

      // Create large note with many expenses
      const expenseLines = Array.from(
        { length: 100 },
        (_, i) => `$${10 + i} Item ${i} [Food]`
      )
      const noteContent = expenseLines.join('\n')

      const startTime = performance.now()
      const expenses = parser.parseExpenses(noteContent)
      const endTime = performance.now()

      expect(expenses).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(100) // <100ms for 100 expenses
    })

    it('should handle discovery for expense against many notes', () => {
      const expense = {
        description: 'Adobe Software',
        category: 'Software'
      }

      // Create 100 simulated notes
      const notes = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Note ${i}`,
        content: i % 10 === 0 ? 'Adobe software tools' : 'Random content here'
      }))

      const searchTerms = extractSearchTerms(expense.description, expense.category)

      const startTime = performance.now()

      const scoredNotes = notes.map(note => ({
        note,
        score: calculateRelevance(note, searchTerms, expense.category)
      }))

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200) // <200ms for 100 notes

      const relevantNotes = scoredNotes.filter(({ score }) => score >= 0.3)
      expect(relevantNotes.length).toBeGreaterThan(0)
    })
  })
})
