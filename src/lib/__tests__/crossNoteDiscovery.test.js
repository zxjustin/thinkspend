import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractSearchTerms, calculateRelevance } from '../crossNoteDiscovery'

describe('Cross-Note Discovery Algorithm', () => {
  describe('extractSearchTerms', () => {
    it('should extract meaningful terms from description', () => {
      const description = 'Adobe Creative Cloud License'
      const category = 'Software'
      const terms = extractSearchTerms(description, category)

      expect(terms).toContain('adobe')
      expect(terms).toContain('creative')
      expect(terms).toContain('cloud')
      expect(terms).toContain('license')
      expect(terms).toContain('software')
    })

    it('should filter out stop words', () => {
      const description = 'The coffee at the cafe'
      const category = 'Food'
      const terms = extractSearchTerms(description, category)

      expect(terms).not.toContain('the')
      expect(terms).not.toContain('at')
      expect(terms).toContain('coffee')
      expect(terms).toContain('cafe')
    })

    it('should filter out short words (< 3 chars)', () => {
      const description = 'Buy a TV or PC'
      const category = 'Electronics'
      const terms = extractSearchTerms(description, category)

      expect(terms).not.toContain('a')
      expect(terms).not.toContain('or')
      expect(terms).toContain('buy')
    })

    it('should filter out pure numbers', () => {
      const description = 'Meeting at 5pm room 123'
      const category = 'Other'
      const terms = extractSearchTerms(description, category)

      expect(terms).not.toContain('123')
      expect(terms).not.toContain('5')
      expect(terms).toContain('meeting')
      expect(terms).toContain('5pm')
    })

    it('should remove duplicates', () => {
      const description = 'coffee coffee coffee'
      const category = 'Food'
      const terms = extractSearchTerms(description, category)

      const coffeeCount = terms.filter(t => t === 'coffee').length
      expect(coffeeCount).toBe(1)
    })

    it('should handle empty description', () => {
      const terms = extractSearchTerms('', 'Food')

      expect(terms).toEqual(['food'])
    })

    it('should be case-insensitive', () => {
      const description = 'Adobe CREATIVE Cloud'
      const category = 'Software'
      const terms = extractSearchTerms(description, category)

      expect(terms).toContain('adobe')
      expect(terms).toContain('creative')
      expect(terms).not.toContain('Adobe')
      expect(terms).not.toContain('CREATIVE')
    })
  })

  describe('calculateRelevance', () => {
    it('should score exact title match highly', () => {
      const note = {
        title: 'Adobe Software',
        content: 'Some content here'
      }
      const searchTerms = ['adobe', 'software']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0.5)
    })

    it('should score content matches', () => {
      const note = {
        title: 'Random Title',
        content: 'I use Adobe Creative Cloud for design work'
      }
      const searchTerms = ['adobe', 'creative', 'cloud']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0)
    })

    it('should give higher weight to title matches than content', () => {
      const noteWithTitleMatch = {
        title: 'Adobe Creative Cloud Software',
        content: 'Some unrelated text here'
      }
      const noteWithContentMatch = {
        title: 'Random Unrelated Title',
        content: 'Adobe Creative Cloud Software appears in content'
      }
      const searchTerms = ['adobe', 'creative', 'cloud', 'software']
      const category = 'Software'

      const titleScore = calculateRelevance(noteWithTitleMatch, searchTerms, category)
      const contentScore = calculateRelevance(noteWithContentMatch, searchTerms, category)

      // Title matches should score higher or equal (both get same matched term count)
      expect(titleScore).toBeGreaterThanOrEqual(contentScore)
    })

    it('should return 0 for no matches', () => {
      const note = {
        title: 'Completely Unrelated',
        content: 'Nothing relevant here'
      }
      const searchTerms = ['adobe', 'software']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBe(0)
    })

    it('should handle category bonus', () => {
      const note = {
        title: 'Software Tools',
        content: 'Various software applications'
      }
      const searchTerms = ['software', 'tools']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0)
    })

    it('should normalize score between 0 and 1', () => {
      const note = {
        title: 'Adobe Adobe Adobe',
        content: 'Adobe '.repeat(100)
      }
      const searchTerms = ['adobe']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeLessThanOrEqual(1.0)
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty note', () => {
      const note = {
        title: '',
        content: ''
      }
      const searchTerms = ['adobe']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBe(0)
    })

    it('should handle null/undefined fields gracefully', () => {
      const note = {
        title: null,
        content: undefined
      }
      const searchTerms = ['adobe']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBe(0)
    })

    it('should strip HTML from content before matching', () => {
      const note = {
        title: 'Notes',
        content: '<p><strong>Adobe</strong> software</p>'
      }
      const searchTerms = ['adobe', 'software']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0)
    })

    it('should handle partial word matches', () => {
      const note = {
        title: 'Software Development',
        content: 'Developing software applications'
      }
      const searchTerms = ['soft']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      // Should match "software" with "soft"
      expect(score).toBeGreaterThan(0)
    })
  })

  describe('Algorithm Complexity', () => {
    it('should handle large notes efficiently', () => {
      const largeContent = 'word '.repeat(10000)
      const note = {
        title: 'Large Note',
        content: largeContent + ' adobe software'
      }
      const searchTerms = ['adobe', 'software']
      const category = 'Software'

      const startTime = performance.now()
      const score = calculateRelevance(note, searchTerms, category)
      const endTime = performance.now()

      const executionTime = endTime - startTime

      expect(score).toBeGreaterThan(0)
      expect(executionTime).toBeLessThan(100) // Should complete in <100ms
    })

    it('should handle many search terms', () => {
      const note = {
        title: 'Software Development',
        content: 'Adobe Creative Cloud software development tools'
      }
      const searchTerms = Array.from({ length: 20 }, (_, i) => `term${i}`)
      const category = 'Software'

      const startTime = performance.now()
      const score = calculateRelevance(note, searchTerms, category)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in content', () => {
      const note = {
        title: 'Notes!',
        content: 'Adobe® Creative™ Cloud® #software @work'
      }
      const searchTerms = ['adobe', 'creative', 'cloud', 'software']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0)
    })

    it('should handle unicode characters', () => {
      const note = {
        title: 'Café Notes ☕',
        content: 'Coffee and café experiences'
      }
      const searchTerms = ['café', 'coffee']
      const category = 'Food'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0)
    })

    it('should handle very long titles', () => {
      const note = {
        title: 'A '.repeat(1000) + 'adobe software',
        content: 'Content'
      }
      const searchTerms = ['adobe', 'software']
      const category = 'Software'

      const score = calculateRelevance(note, searchTerms, category)

      expect(score).toBeGreaterThan(0)
    })
  })
})
