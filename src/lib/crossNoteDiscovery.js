/**
 * Cross-Note Discovery Algorithm
 *
 * Automatically discovers relationships between expenses and notes
 * based on keyword matching and contextual relevance.
 *
 * Core algorithm for ThinkSpend's unique contribution.
 *
 * Algorithm Steps:
 * 1. Extract search terms from expense (description + category)
 * 2. Search all user's notes for keyword matches
 * 3. Calculate relevance score (0.0 - 1.0)
 * 4. Create weak links if relevance > threshold (default 0.3)
 *
 * Complexity: O(n * m * k) where:
 *   n = number of notes
 *   m = average note length
 *   k = number of search terms
 */

import { supabase } from './supabase'

/**
 * Extract meaningful search terms from expense
 *
 * Filters out:
 * - Common words (the, and, or, etc.)
 * - Short words (<3 chars)
 * - Numbers
 *
 * @param {string} description - Expense description
 * @param {string} category - Expense category
 * @returns {Array<string>} - Array of search terms
 */
function extractSearchTerms(description, category) {
  // Common stop words to ignore
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'a', 'an', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can'
  ])

  // Split description into words
  const words = description.toLowerCase().split(/\s+/)

  // Filter out stop words, short words, and numbers
  const filteredWords = words.filter(word => {
    return (
      word.length >= 3 &&                    // Min 3 chars
      !stopWords.has(word) &&                // Not a stop word
      !/^\d+$/.test(word)                    // Not just a number
    )
  })

  // Add category as a search term (high weight)
  const searchTerms = [...filteredWords, category.toLowerCase()]

  // Remove duplicates
  return [...new Set(searchTerms)]
}

/**
 * Calculate relevance score between expense and note
 *
 * Scoring factors:
 * - Keyword matches in content (base score)
 * - Title matches (2x weight)
 * - Category matches (1.5x weight)
 * - Term frequency bonus
 *
 * @param {Object} note - Note object with title and content
 * @param {Array<string>} searchTerms - Search terms from expense
 * @param {string} category - Expense category
 * @returns {number} - Relevance score (0.0 - 1.0)
 */
function calculateRelevance(note, searchTerms, category) {
  const title = (note.title || '').toLowerCase()
  const content = (note.content || '').toLowerCase()

  // Strip HTML from content
  const temp = typeof document !== 'undefined'
    ? document.createElement('div')
    : { textContent: content }
  if (typeof document !== 'undefined') {
    temp.innerHTML = content
  }
  const plainContent = temp.textContent || temp.innerText || content

  const contentWords = plainContent.toLowerCase().split(/\s+/)
  const titleWords = title.split(/\s+/)

  let score = 0
  let matchedTerms = 0

  for (const term of searchTerms) {
    let termScore = 0

    // Check title matches (2x weight)
    const titleMatches = titleWords.filter(word => word.includes(term)).length
    if (titleMatches > 0) {
      termScore += titleMatches * 2.0
      matchedTerms++
    }

    // Check content matches (1x weight)
    const contentMatches = contentWords.filter(word => word.includes(term)).length
    if (contentMatches > 0) {
      termScore += contentMatches * 1.0
      matchedTerms++
    }

    // Category exact match bonus (1.5x weight)
    if (term === category.toLowerCase()) {
      if (plainContent.includes(category.toLowerCase()) || title.includes(category.toLowerCase())) {
        termScore += 1.5
      }
    }

    score += termScore
  }

  // Normalize score by number of search terms and note length
  // This prevents long notes from always scoring higher
  const normalizedScore = matchedTerms / searchTerms.length

  // Apply diminishing returns to avoid over-weighting long notes
  const finalScore = Math.min(normalizedScore, 1.0)

  return finalScore
}

/**
 * Discover related notes for an expense
 *
 * Main algorithm entry point.
 *
 * @param {Object} expense - Expense object with id, description, category
 * @param {number} threshold - Minimum relevance score (default 0.3)
 * @param {number} maxLinks - Maximum links to create (default 5)
 * @returns {Promise<Array>} - Array of created links with metadata
 */
export async function discoverRelatedNotes(expense, threshold = 0.3, maxLinks = 5) {
  console.log('🔍 Starting cross-note discovery for:', expense.description)

  // 1. Extract search terms
  const searchTerms = extractSearchTerms(expense.description, expense.category)
  console.log('📝 Search terms:', searchTerms)

  if (searchTerms.length === 0) {
    console.log('⚠️ No search terms extracted')
    return []
  }

  // 2. Fetch all user's notes
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notes, error } = await supabase
    .from('notes')
    .select('id, title, content')
    .eq('user_id', user.id)

  if (error) {
    console.error('❌ Error fetching notes:', error)
    throw error
  }

  if (!notes || notes.length === 0) {
    console.log('⚠️ No notes found')
    return []
  }

  console.log(`📚 Analyzing ${notes.length} notes...`)

  // 3. Calculate relevance for each note
  const scoredNotes = notes.map(note => ({
    note,
    score: calculateRelevance(note, searchTerms, expense.category)
  }))

  // 4. Filter by threshold and sort by score (highest first)
  const relevantNotes = scoredNotes
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLinks) // Limit to maxLinks

  console.log(`✅ Found ${relevantNotes.length} relevant notes (threshold: ${threshold})`)

  // 5. Create links in database
  const createdLinks = []

  for (const { note, score } of relevantNotes) {
    try {
      const { data, error } = await supabase
        .from('note_expense_links')
        .insert({
          note_id: note.id,
          expense_id: expense.id,
          link_type: 'context',    // Auto-discovered link
          strength: score           // Relevance score as strength
        })
        .select()
        .single()

      if (error) {
        // Skip duplicates
        if (error.code === '23505') {
          console.log(`⏭️ Link already exists: ${note.title}`)
          continue
        }
        throw error
      }

      createdLinks.push({
        ...data,
        note_title: note.title,
        score: score
      })

      console.log(`🔗 Created link: "${note.title}" (score: ${score.toFixed(2)})`)
    } catch (err) {
      console.error(`❌ Error creating link for note ${note.id}:`, err)
    }
  }

  console.log(`✨ Discovery complete: ${createdLinks.length} links created`)

  return createdLinks
}

/**
 * Re-discover links for an existing expense
 * Useful when notes have been updated
 *
 * @param {string} expenseId - Expense ID
 * @param {boolean} removeOldLinks - Remove existing auto-discovered links (default true)
 * @returns {Promise<Array>} - Array of created links
 */
export async function rediscoverLinks(expenseId, removeOldLinks = true) {
  // Fetch expense
  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .single()

  if (error) throw error

  // Remove old auto-discovered links
  if (removeOldLinks) {
    await supabase
      .from('note_expense_links')
      .delete()
      .eq('expense_id', expenseId)
      .eq('link_type', 'context')

    console.log('🗑️ Removed old auto-discovered links')
  }

  // Run discovery
  return await discoverRelatedNotes(expense)
}

/**
 * Get discovery statistics for reporting/evaluation
 *
 * @returns {Promise<Object>} - Statistics object
 */
export async function getDiscoveryStats() {
  const { data: { user } } = await supabase.auth.getUser()

  // Count total auto-discovered links
  const { data: links, error } = await supabase
    .from('note_expense_links')
    .select('strength')
    .eq('link_type', 'context')

  if (error) throw error

  // Calculate statistics
  const totalLinks = links.length
  const avgStrength = totalLinks > 0
    ? links.reduce((sum, link) => sum + link.strength, 0) / totalLinks
    : 0
  const strongLinks = links.filter(link => link.strength >= 0.5).length
  const weakLinks = links.filter(link => link.strength < 0.5).length

  return {
    totalAutoDiscovered: totalLinks,
    averageStrength: avgStrength,
    strongLinks,   // >= 0.5
    weakLinks,     // < 0.5
    strongLinkPercentage: totalLinks > 0 ? (strongLinks / totalLinks) * 100 : 0
  }
}

// Export helper functions for testing
export { extractSearchTerms, calculateRelevance }
