/**
 * Composable for detecting wiki-style [[links]] in note content
 *
 * Format: [[Note Title]]
 * Example: "See also [[Project Planning]] for details"
 *
 * This extracts bidirectional links from note content for:
 * 1. Live detection display in ConnectionPanel
 * 2. Storage in note_links table
 * 3. Navigation between notes
 */

export function useLinkDetector() {
  /**
   * Extract all [[links]] from text content
   *
   * @param {string} content - Raw HTML or plain text content
   * @returns {Array<string>} - Array of unique link titles
   *
   * Example:
   * Input: "Check [[Meeting Notes]] and [[Project Plan]]"
   * Output: ["Meeting Notes", "Project Plan"]
   */
  function extractLinks(content) {
    if (!content) return []

    // Strip HTML tags to get plain text
    // This prevents detecting [[links]] inside HTML attributes
    const temp = document.createElement('div')
    temp.innerHTML = content
    const plainText = temp.textContent || temp.innerText || ''

    // Regex pattern: [[any characters except brackets]]
    // Explanation:
    // \[\[        - Match literal [[
    // ([^\]]+)    - Capture group: one or more chars that are NOT ]
    // \]\]        - Match literal ]]
    // g           - Global flag (find all matches)
    const linkPattern = /\[\[([^\]]+)\]\]/g

    const links = []
    let match

    // Extract all matches
    while ((match = linkPattern.exec(plainText)) !== null) {
      const linkTitle = match[1].trim() // Get captured group, remove whitespace

      // Skip empty links
      if (linkTitle) {
        links.push(linkTitle)
      }
    }

    // Return unique links only (remove duplicates)
    // If someone writes [[Meeting]] twice, we only want to store one link
    return [...new Set(links)]
  }

  /**
   * Count total links in content
   * Useful for displaying badge counts in sidebar
   */
  function countLinks(content) {
    return extractLinks(content).length
  }

  return {
    extractLinks,
    countLinks
  }
}
