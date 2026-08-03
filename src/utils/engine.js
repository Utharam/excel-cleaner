/**
 * Normalizes text for "Smart Matching" by stripping punctuation
 * and special characters so that values like "*UBER *EAT*" match
 * against rules like "Uber Eat".
 *
 * Steps:
 * 1. Convert to string and lowercase
 * 2. Remove all characters except a-z, 0-9, and spaces
 * 3. Collapse multiple consecutive spaces into a single space
 * 4. Trim leading and trailing whitespace
 *
 * @param {*} text - The raw cell value or match value
 * @returns {string} The normalized string
 */
const normalizeForMatch = (text) => {
  if (text === null || text === undefined) return ''

  let str = String(text).toLowerCase()

  // Strip punctuation and special characters, keep only alphanumerics and spaces
  str = str.replace(/[^a-z0-9\s]/g, '')

  // Collapse multiple consecutive spaces into a single space
  str = str.replace(/\s+/g, ' ')

  // Trim leading and trailing whitespace
  return str.trim()
}

/**
 * Applies an array of rules to a single cleaned data row.
 * Pure function — does not mutate the input row.
 *
 * Matching logic:
 * - Contains, Equals, Starts with, Ends with → Smart Matching (case-insensitive
 *   AND punctuation-stripped via normalizeForMatch on both cell and match value)
 * - Regex → case-sensitive, raw values (no normalization, user controls pattern)
 * - First rule to match an output column wins (no overwrite)
 * - If Remark 1 is empty after all rules, set to 'no rule given'
 *
 * Profile filtering:
 * - Only rules whose `profile` matches `activeProfile` (or are 'Global') are evaluated.
 * - Rules without a `profile` property (legacy data) are treated as 'Default'
 *   for backward compatibility with previously saved rules.
 *
 * @param {Object} row - The cleaned row object
 * @param {Array} rules - Array of rule objects from rulesStore
 * @param {string} [activeProfile='Default'] - The currently active rule profile
 * @returns {Object} New row object with Remark columns populated
 */
export const applyRulesToRow = (row, rules, activeProfile = 'Default') => {
  // Shallow copy — don't mutate the original
  const result = { ...row }

  // Track which output columns have been filled by a rule (first wins)
  const filledColumns = new Set()

  // Ensure Remark columns exist as empty strings
  if (!('Remark 1' in result)) result['Remark 1'] = ''
  if (!('Remark 2' in result)) result['Remark 2'] = ''

  for (const rule of rules) {
    // ─── Profile filtering ──────────────────────────────────
    // Legacy rules (no profile property) are treated as 'Default' so existing
    // saved rules continue to match after this feature ships.
    const ruleProfile = rule.profile || 'Default'
    if (ruleProfile !== activeProfile && ruleProfile !== 'Global') {
      continue
    }

    const cellValue = result[rule.matchField]

    // Skip if the cell is empty or undefined
    if (cellValue === undefined || cellValue === null || cellValue === '') {
      continue
    }

    // Skip if this output column was already filled by a prior rule
    if (filledColumns.has(rule.outputColumn)) {
      continue
    }

    const cellStr = String(cellValue)
    const matchStr = String(rule.matchValue)

    // Skip if match value is empty
    if (matchStr === '') {
      continue
    }

    let isMatch = false

    switch (rule.matchType) {
      case 'Contains':
        isMatch = normalizeForMatch(cellStr).includes(normalizeForMatch(matchStr))
        break

      case 'Equals':
        isMatch = normalizeForMatch(cellStr) === normalizeForMatch(matchStr)
        break

      case 'Starts with':
        isMatch = normalizeForMatch(cellStr).startsWith(normalizeForMatch(matchStr))
        break

      case 'Ends with':
        isMatch = normalizeForMatch(cellStr).endsWith(normalizeForMatch(matchStr))
        break

      case 'Regex':
        try {
          const regex = new RegExp(matchStr)
          isMatch = regex.test(cellStr)
        } catch (e) {
          // Invalid regex pattern — skip this rule
          console.warn(`[Engine] Invalid regex in rule "${rule.name}": ${matchStr}`)
          isMatch = false
        }
        break
    }

    if (isMatch) {
      result[rule.outputColumn] = rule.outputValue
      filledColumns.add(rule.outputColumn)
    }
  }

  // If Remark 1 is still empty after all rules, flag it
  if (!result['Remark 1'] || result['Remark 1'].trim() === '') {
    result['Remark 1'] = 'no rule given'
  }

  return result
}