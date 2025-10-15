/**
 * TF-IDF Search Composable
 *
 * Implements Term Frequency-Inverse Document Frequency algorithm
 * for relevance-ranked search across notes and expenses.
 *
 * Algorithm Overview:
 * 1. TF (Term Frequency): How often a term appears in a document
 * 2. IDF (Inverse Document Frequency): How rare/common a term is
 * 3. Score = TF × IDF (higher = more relevant)
 * 4. Temporal weighting: Recent items get slight boost
 *
 * Performance: Target <200ms for 1000+ documents
 */

import { ref } from 'vue'

export function useSearch() {
  const isSearching = ref(false)
  const searchResults = ref([])

  /**
   * Main search function
   * @param {string} query - Search query
   * @param {Array} notes - All notes to search
   * @param {Array} expenses - All expenses to search
   * @returns {Array} - Top 20 ranked results
   */
  function search(query, notes, expenses) {
    const startTime = performance.now()
    isSearching.value = true

    try {
      if (!query || query.trim().length === 0) {
        searchResults.value = []
        return []
      }

      // Normalize query (lowercase, split into terms)
      const searchTerms = query.toLowerCase().trim().split(/\s+/)

      // Convert notes and expenses into searchable documents
      const documents = [
        ...notes.map(note => ({
          id: note.id,
          type: 'note',
          title: note.title,
          content: note.content,
          created_at: note.created_at,
          folder_id: note.folder_id,
          // Create searchable text (HTML stripped)
          text: `${note.title} ${stripHtml(note.content)}`.toLowerCase()
        })),
        ...expenses.map(expense => ({
          id: expense.id,
          type: 'expense',
          title: `$${expense.amount} - ${expense.description}`,
          content: `${expense.description} ${expense.category || ''}`,
          created_at: expense.date,
          category: expense.category,
          amount: expense.amount,
          // Create searchable text
          text: `${expense.description} ${expense.category || ''} ${expense.notes || ''}`.toLowerCase()
        }))
      ]

      if (documents.length === 0) {
        searchResults.value = []
        return []
      }

      // Calculate IDF for each search term
      const idfScores = calculateIDF(searchTerms, documents)

      // Calculate TF-IDF score for each document
      const scoredDocuments = documents.map(doc => {
        const tfIdfScore = calculateTFIDF(searchTerms, doc, idfScores)
        const temporalScore = calculateTemporalWeight(doc.created_at)
        const finalScore = tfIdfScore * temporalScore

        return {
          ...doc,
          score: finalScore,
          matchedTerms: getMatchedTerms(searchTerms, doc.text)
        }
      })

      // Filter out zero-score results and sort by score (descending)
      const rankedResults = scoredDocuments
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20) // Top 20 results

      searchResults.value = rankedResults

      const endTime = performance.now()
      console.log(`🔍 Search completed in ${(endTime - startTime).toFixed(2)}ms`)
      console.log(`📊 Found ${rankedResults.length} results for "${query}"`)

      return rankedResults

    } finally {
      isSearching.value = false
    }
  }

  /**
   * Calculate Inverse Document Frequency (IDF)
   * IDF = log(Total documents / Documents containing term)
   *
   * Higher IDF = term is rare (more valuable for ranking)
   * Lower IDF = term is common (less valuable)
   */
  function calculateIDF(searchTerms, documents) {
    const totalDocs = documents.length
    const idfScores = {}

    for (const term of searchTerms) {
      // Count how many documents contain this term
      const docsWithTerm = documents.filter(doc => doc.text.includes(term)).length

      if (docsWithTerm > 0) {
        // IDF formula: log(N / df)
        // Add 1 to avoid log(0) and division by zero
        idfScores[term] = Math.log((totalDocs + 1) / (docsWithTerm + 1))
      } else {
        idfScores[term] = 0
      }
    }

    return idfScores
  }

  /**
   * Calculate Term Frequency - Inverse Document Frequency
   * TF = (Term count in doc) / (Total terms in doc)
   * TF-IDF = TF × IDF (for each search term, then sum)
   */
  function calculateTFIDF(searchTerms, document, idfScores) {
    const docText = document.text
    const docTerms = docText.split(/\s+/)
    const totalTermsInDoc = docTerms.length

    if (totalTermsInDoc === 0) return 0

    let tfIdfScore = 0

    for (const term of searchTerms) {
      // Count occurrences of this search term in document
      const termCount = (docText.match(new RegExp(term, 'g')) || []).length

      if (termCount > 0) {
        // Calculate TF (Term Frequency)
        const tf = termCount / totalTermsInDoc

        // Get IDF for this term
        const idf = idfScores[term] || 0

        // Add to total score
        tfIdfScore += tf * idf

        // Title match bonus (if term appears in title, boost score)
        if (document.title.toLowerCase().includes(term)) {
          tfIdfScore += 0.5 // Bonus for title match
        }
      }
    }

    return tfIdfScore
  }

  /**
   * Calculate temporal weight (recency boost)
   * Recent documents get slight score boost
   * Decay factor: 0.95 per 30 days
   */
  function calculateTemporalWeight(createdAt) {
    if (!createdAt) return 1.0

    const now = new Date()
    const created = new Date(createdAt)
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24)

    // Decay: 0.95^(days/30)
    // 30 days old = 0.95, 60 days = 0.90, etc.
    const decayFactor = Math.pow(0.95, daysDiff / 30)

    return Math.max(0.5, decayFactor) // Min weight 0.5
  }

  /**
   * Get which search terms matched in the document
   */
  function getMatchedTerms(searchTerms, docText) {
    return searchTerms.filter(term => docText.includes(term))
  }

  /**
   * Strip HTML tags from content
   * Used to convert note HTML content to plain text for searching
   */
  function stripHtml(html) {
    if (!html) return ''
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  /**
   * Highlight search terms in text
   * Used for displaying results with matched terms highlighted
   */
  function highlightTerms(text, searchTerms) {
    if (!text || !searchTerms || searchTerms.length === 0) return text

    let highlighted = text
    for (const term of searchTerms) {
      const regex = new RegExp(`(${term})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
    }
    return highlighted
  }

  /**
   * Get excerpt from text around matched terms
   * Shows context (50 chars before/after match)
   */
  function getExcerpt(text, searchTerms, maxLength = 150) {
    if (!text) return ''

    const plainText = stripHtml(text)

    // Find first match position
    let matchIndex = -1
    for (const term of searchTerms) {
      matchIndex = plainText.toLowerCase().indexOf(term)
      if (matchIndex !== -1) break
    }

    if (matchIndex === -1) {
      // No match found, return start of text
      return plainText.slice(0, maxLength) + (plainText.length > maxLength ? '...' : '')
    }

    // Get context around match
    const start = Math.max(0, matchIndex - 50)
    const end = Math.min(plainText.length, matchIndex + 100)

    let excerpt = plainText.slice(start, end)
    if (start > 0) excerpt = '...' + excerpt
    if (end < plainText.length) excerpt = excerpt + '...'

    return excerpt
  }

  return {
    search,
    isSearching,
    searchResults,
    highlightTerms,
    getExcerpt,
    stripHtml
  }
}

export default useSearch
