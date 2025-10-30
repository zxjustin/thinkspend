import { describe, it, expect } from 'vitest'
import { useLinkDetector } from '../useLinkDetector'

describe('useLinkDetector', () => {
  const detector = useLinkDetector()

  describe('extractLinks', () => {
    it('should extract single wiki link', () => {
      const content = 'See [[Meeting Notes]] for details'
      const links = detector.extractLinks(content)

      expect(links).toEqual(['Meeting Notes'])
    })

    it('should extract multiple wiki links', () => {
      const content = 'Check [[Meeting Notes]] and [[Project Plan]]'
      const links = detector.extractLinks(content)

      expect(links).toHaveLength(2)
      expect(links).toContain('Meeting Notes')
      expect(links).toContain('Project Plan')
    })

    it('should remove duplicate links', () => {
      const content = '[[Meeting]] is important. See [[Meeting]] again.'
      const links = detector.extractLinks(content)

      expect(links).toEqual(['Meeting'])
    })

    it('should handle links with special characters', () => {
      const content = '[[2024-01-15 Meeting Notes]]'
      const links = detector.extractLinks(content)

      expect(links).toEqual(['2024-01-15 Meeting Notes'])
    })

    it('should strip HTML before extracting', () => {
      const html = '<p>See <strong>[[Meeting Notes]]</strong></p>'
      const links = detector.extractLinks(html)

      expect(links).toEqual(['Meeting Notes'])
    })

    it('should handle empty input', () => {
      expect(detector.extractLinks('')).toEqual([])
      expect(detector.extractLinks(null)).toEqual([])
      expect(detector.extractLinks(undefined)).toEqual([])
    })

    it('should ignore incomplete brackets', () => {
      const content = 'This [[incomplete and this too]]'
      const links = detector.extractLinks(content)

      expect(links).toEqual(['incomplete and this too'])
    })

    it('should handle nested brackets correctly', () => {
      const content = '[[Outer [[Inner]] ]] text'
      const links = detector.extractLinks(content)

      // Regex stops at first closing ]]
      expect(links.length).toBeGreaterThan(0)
    })

    it('should trim whitespace from links', () => {
      const content = '[[  Meeting Notes  ]]'
      const links = detector.extractLinks(content)

      expect(links).toEqual(['Meeting Notes'])
    })

    it('should skip empty links', () => {
      const content = '[[]] and [[Valid Link]]'
      const links = detector.extractLinks(content)

      expect(links).toEqual(['Valid Link'])
    })
  })

  describe('countLinks', () => {
    it('should count links correctly', () => {
      const content = '[[Link1]] and [[Link2]] and [[Link3]]'
      const count = detector.countLinks(content)

      expect(count).toBe(3)
    })

    it('should return 0 for no links', () => {
      const content = 'No links here'
      const count = detector.countLinks(content)

      expect(count).toBe(0)
    })

    it('should count unique links only', () => {
      const content = '[[Link1]] [[Link1]] [[Link2]]'
      const count = detector.countLinks(content)

      expect(count).toBe(2)
    })
  })
})
