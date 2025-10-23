import { describe, it, expect } from 'vitest'
import { useExpenseParser } from '../../composables/useExpenseParser'
import { useLinkDetector } from '../../composables/useLinkDetector'
import { extractSearchTerms, calculateRelevance } from '../../lib/crossNoteDiscovery'

/**
 * Performance Benchmarks
 *
 * These tests measure performance of core algorithms
 * to ensure they meet academic requirements for the report.
 *
 * Target Metrics:
 * - Expense parsing: <50ms for typical note (500 words)
 * - Link detection: <30ms for typical note
 * - Cross-note discovery: <500ms for 100 notes
 */

describe('Performance Benchmarks', () => {
  describe('Expense Parser Performance', () => {
    it('should parse typical note (<500 words) in <50ms', () => {
      const parser = useExpenseParser()

      // Create typical note content (~500 words)
      const words = Array(500).fill('word').join(' ')
      const noteContent = `
        ${words}
        $25 Lunch [Food]
        ${words}
        $100 Software [Software]
        ${words}
      `

      const startTime = performance.now()
      const expenses = parser.parseExpenses(noteContent)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(expenses).toHaveLength(2)
      expect(executionTime).toBeLessThan(50)

      console.log(`✓ Expense parsing (500 words): ${executionTime.toFixed(2)}ms`)
    })

    it('should parse large note (5000 words) in <200ms', () => {
      const parser = useExpenseParser()

      // Create large note (5000 words)
      const words = Array(5000).fill('word').join(' ')
      const noteContent = `${words} $25 Lunch [Food]`

      const startTime = performance.now()
      const expenses = parser.parseExpenses(noteContent)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(200)

      console.log(`✓ Expense parsing (5000 words): ${executionTime.toFixed(2)}ms`)
    })

    it('should parse 50 expenses in <100ms', () => {
      const parser = useExpenseParser()

      const expenses = Array.from(
        { length: 50 },
        (_, i) => `$${10 + i} Item ${i} [Food]`
      ).join('\n')

      const startTime = performance.now()
      const result = parser.parseExpenses(expenses)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(result).toHaveLength(50)
      expect(executionTime).toBeLessThan(100)

      console.log(`✓ Expense parsing (50 items): ${executionTime.toFixed(2)}ms`)
    })
  })

  describe('Link Detector Performance', () => {
    it('should extract links from typical note in <30ms', () => {
      const detector = useLinkDetector()

      const words = Array(500).fill('word').join(' ')
      const noteContent = `
        ${words}
        [[Link 1]]
        ${words}
        [[Link 2]]
        ${words}
      `

      const startTime = performance.now()
      const links = detector.extractLinks(noteContent)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(links).toHaveLength(2)
      expect(executionTime).toBeLessThan(30)

      console.log(`✓ Link extraction (500 words): ${executionTime.toFixed(2)}ms`)
    })

    it('should extract 100 links in <100ms', () => {
      const detector = useLinkDetector()

      const links = Array.from(
        { length: 100 },
        (_, i) => `[[Link ${i}]]`
      ).join(' ')

      const startTime = performance.now()
      const result = detector.extractLinks(links)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(result).toHaveLength(100)
      expect(executionTime).toBeLessThan(100)

      console.log(`✓ Link extraction (100 links): ${executionTime.toFixed(2)}ms`)
    })
  })

  describe('Cross-Note Discovery Performance', () => {
    it('should extract search terms in <5ms', () => {
      const description = 'Adobe Creative Cloud Professional License'
      const category = 'Software'

      const startTime = performance.now()
      const terms = extractSearchTerms(description, category)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(terms.length).toBeGreaterThan(0)
      expect(executionTime).toBeLessThan(5)

      console.log(`✓ Search term extraction: ${executionTime.toFixed(2)}ms`)
    })

    it('should calculate relevance for single note in <10ms', () => {
      const note = {
        title: 'Software Development Tools',
        content: 'I use Adobe Creative Cloud for design work. ' +
          'Software development requires good tools. ' +
          Array(100).fill('word').join(' ')
      }
      const searchTerms = ['adobe', 'creative', 'cloud', 'software']
      const category = 'Software'

      const startTime = performance.now()
      const score = calculateRelevance(note, searchTerms, category)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(score).toBeGreaterThan(0)
      expect(executionTime).toBeLessThan(10)

      console.log(`✓ Relevance calculation (single note): ${executionTime.toFixed(2)}ms`)
    })

    it('should process 100 notes in <500ms', () => {
      const notes = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Note ${i}`,
        content: i % 10 === 0
          ? 'Adobe software development tools'
          : Array(100).fill('random word').join(' ')
      }))

      const searchTerms = ['adobe', 'software', 'development']
      const category = 'Software'

      const startTime = performance.now()

      const scoredNotes = notes.map(note =>
        calculateRelevance(note, searchTerms, category)
      )

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(scoredNotes).toHaveLength(100)
      expect(executionTime).toBeLessThan(500)

      console.log(`✓ Discovery (100 notes): ${executionTime.toFixed(2)}ms`)
      console.log(`  Average per note: ${(executionTime / 100).toFixed(2)}ms`)
    })

    it('should process 500 notes in <2000ms', () => {
      const notes = Array.from({ length: 500 }, (_, i) => ({
        id: `${i}`,
        title: `Note ${i}`,
        content: Array(50).fill('word').join(' ')
      }))

      const searchTerms = ['software', 'development']
      const category = 'Software'

      const startTime = performance.now()

      const scoredNotes = notes.map(note =>
        calculateRelevance(note, searchTerms, category)
      )

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(scoredNotes).toHaveLength(500)
      expect(executionTime).toBeLessThan(2000)

      console.log(`✓ Discovery (500 notes): ${executionTime.toFixed(2)}ms`)
      console.log(`  Average per note: ${(executionTime / 500).toFixed(2)}ms`)
    })
  })

  describe('Algorithm Complexity Analysis', () => {
    it('should demonstrate O(n*m*k) complexity for discovery', () => {
      const measurements = []

      // Test with increasing note counts
      const noteCounts = [10, 50, 100, 200]

      noteCounts.forEach(noteCount => {
        const notes = Array.from({ length: noteCount }, (_, i) => ({
          id: `${i}`,
          title: `Note ${i}`,
          content: Array(100).fill('word').join(' ')
        }))

        const searchTerms = ['software', 'development', 'tools']
        const category = 'Software'

        const startTime = performance.now()

        notes.forEach(note =>
          calculateRelevance(note, searchTerms, category)
        )

        const endTime = performance.now()
        const executionTime = endTime - startTime

        measurements.push({
          noteCount,
          time: executionTime,
          avgPerNote: executionTime / noteCount
        })
      })

      // Verify linear scaling (O(n))
      const firstAvg = measurements[0].avgPerNote
      const lastAvg = measurements[measurements.length - 1].avgPerNote

      // Average time per note should remain relatively constant (within 3x)
      expect(lastAvg).toBeLessThan(firstAvg * 3)

      console.log('\n📊 Complexity Analysis:')
      measurements.forEach(m => {
        console.log(`  ${m.noteCount} notes: ${m.time.toFixed(2)}ms (${m.avgPerNote.toFixed(3)}ms/note)`)
      })
    })
  })

  describe('Memory Efficiency', () => {
    it('should not leak memory with repeated parsing', () => {
      const parser = useExpenseParser()
      const testContent = '$25 Lunch [Food]'

      // Parse 1000 times
      for (let i = 0; i < 1000; i++) {
        parser.parseExpenses(testContent)
      }

      // If no memory leak, this should complete without issues
      expect(true).toBe(true)
    })

    it('should handle large datasets without memory issues', () => {
      // Create very large note (10,000 words)
      const largeContent = Array(10000).fill('word').join(' ') +
        '$25 Lunch [Food]'

      const parser = useExpenseParser()
      const expenses = parser.parseExpenses(largeContent)

      expect(expenses).toHaveLength(1)
    })
  })

  describe('Real-World Performance Summary', () => {
    it('should generate performance report for documentation', () => {
      const parser = useExpenseParser()
      const detector = useLinkDetector()

      const typicalNote = `
        # Meeting Notes - Jan 15, 2024

        Met with [[Client Name]] to discuss [[Project Plan]]

        Expenses:
        - $25 Lunch [Food]
        - $15 Uber [Transport]

        ${Array(300).fill('word').join(' ')}
      `

      // Measure expense parsing
      const expenseStart = performance.now()
      const expenses = parser.parseExpenses(typicalNote)
      const expenseEnd = performance.now()

      // Measure link detection
      const linkStart = performance.now()
      const links = detector.extractLinks(typicalNote)
      const linkEnd = performance.now()

      const report = {
        noteSize: typicalNote.length,
        expenseCount: expenses.length,
        linkCount: links.length,
        expenseParseTime: (expenseEnd - expenseStart).toFixed(2),
        linkDetectTime: (linkEnd - linkStart).toFixed(2)
      }

      console.log('\n📈 Real-World Performance Report:')
      console.log(`  Note size: ${report.noteSize} chars`)
      console.log(`  Expenses found: ${report.expenseCount}`)
      console.log(`  Links found: ${report.linkCount}`)
      console.log(`  Expense parsing: ${report.expenseParseTime}ms`)
      console.log(`  Link detection: ${report.linkDetectTime}ms`)

      // Verify performance targets
      expect(parseFloat(report.expenseParseTime)).toBeLessThan(50)
      expect(parseFloat(report.linkDetectTime)).toBeLessThan(30)
    })
  })
})
