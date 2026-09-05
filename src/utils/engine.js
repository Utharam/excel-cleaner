import { cleanAmount } from './cleaners.js'

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
export const normalizeForMatch = (text) => {
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
 * Evaluates a single condition against a cell value.
 *
 * @param {*} cellValue - Cell value from row
 * @param {string} operator - Match operator
 * @param {*} matchValue - Value to compare against
 * @returns {boolean}
 */
export const evaluateCondition = (cellValue, operator = 'Contains', matchValue) => {
  const opStr = String(operator || '').trim().toLowerCase()

  // Numeric operators: >, <, >=, <=, ==, =, greater than, less than
  const isNumeric = ['>', '<', '>=', '<=', '==', '=', 'greaterthan', 'greater than', 'lessthan', 'less than', 'greaterorequal', 'lessorequal'].includes(opStr)
  if (isNumeric) {
    const numCell = typeof cellValue === 'number' ? cellValue : cleanAmount(cellValue)
    if (numCell === null || isNaN(numCell)) return false

    let cleanMatchStr = String(matchValue).replace(/[^0-9.\-]/g, '')
    const numMatch = parseFloat(cleanMatchStr)
    if (isNaN(numMatch)) return false

    if (opStr === '>' || opStr === 'greaterthan' || opStr === 'greater than') return numCell > numMatch
    if (opStr === '<' || opStr === 'lessthan' || opStr === 'less than') return numCell < numMatch
    if (opStr === '>=' || opStr === 'greaterorequal') return numCell >= numMatch
    if (opStr === '<=' || opStr === 'lessorequal') return numCell <= numMatch
    if (opStr === '==' || opStr === '=' || opStr === 'equals') return numCell === numMatch
    return false
  }

  // Text operators
  const cellStr = cellValue === null || cellValue === undefined ? '' : String(cellValue)
  const matchStr = matchValue === null || matchValue === undefined ? '' : String(matchValue)

  // Empty match value cannot match anything
  if (matchStr === '') return false

  if (opStr === 'does not contain' || opStr === 'doesnotcontain' || opStr === 'notcontains' || opStr === 'not contains') {
    return !normalizeForMatch(cellStr).includes(normalizeForMatch(matchStr))
  }
  if (opStr === 'equals' || opStr === 'exact') {
    return normalizeForMatch(cellStr) === normalizeForMatch(matchStr)
  }
  if (opStr === 'starts with' || opStr === 'startswith') {
    return normalizeForMatch(cellStr).startsWith(normalizeForMatch(matchStr))
  }
  if (opStr === 'ends with' || opStr === 'endswith') {
    return normalizeForMatch(cellStr).endsWith(normalizeForMatch(matchStr))
  }
  if (opStr === 'regex') {
    try {
      const regex = new RegExp(matchStr, 'i')
      return regex.test(cellStr)
    } catch (e) {
      console.warn(`[Engine] Invalid regex pattern: ${matchStr}`)
      return false
    }
  }

  // Default: Contains
  return normalizeForMatch(cellStr).includes(normalizeForMatch(matchStr))
}

/**
 * Normalizes any rule (legacy or compound) into a standard multi-condition & multi-output format.
 *
 * @param {Object} rule
 * @returns {{ id: string, name: string, profile: string, conditionGate: string, conditions: Array, outputs: Array }}
 */
export const normalizeRule = (rule) => {
  const rawConditions = Array.isArray(rule.conditions) && rule.conditions.length > 0
    ? rule.conditions
    : [{
        field: rule.matchField || rule.column || rule.field || 'Particulars',
        operator: rule.matchType || rule.operator || 'Contains',
        value: rule.matchValue !== undefined ? rule.matchValue : (rule.value !== undefined ? rule.value : '')
      }]

  const conditions = rawConditions.map(c => ({
    field: c.field || c.column || c.matchField || 'Particulars',
    operator: c.operator || c.matchType || 'Contains',
    value: c.value !== undefined ? String(c.value) : (c.matchValue !== undefined ? String(c.matchValue) : '')
  }))

  const rawOutputs = Array.isArray(rule.outputs) && rule.outputs.length > 0
    ? rule.outputs
    : [{
        column: rule.outputColumn || rule.column || 'Remark 1',
        value: rule.outputValue !== undefined ? rule.outputValue : (rule.value !== undefined ? rule.value : '')
      }]

  const outputs = rawOutputs.map(o => ({
    column: o.column || o.field || 'Remark 1',
    value: o.value !== undefined ? String(o.value) : (o.outputValue !== undefined ? String(o.outputValue) : '')
  }))

  return {
    id: rule.id,
    name: rule.name || 'Untitled Rule',
    profile: rule.profile || 'Default',
    conditionGate: (rule.conditionGate === 'OR' || rule.matchType === 'any') ? 'OR' : 'AND',
    conditions,
    outputs,
  }
}

/**
 * Applies an array of rules to a single cleaned data row.
 * Supports:
 * - Compound multi-conditions with AND / OR gates
 * - Cross-column matching (Particulars, Amount, Debit, Credit, etc.)
 * - Numeric operators (>, <, >=, <=, ==)
 * - Negative matching ("Does not contain")
 * - Multi-output remark columns ("going sideways": Remark 1, Remark 2, Remark 3, etc.)
 * - Bypassing rule application if enableRules is false ("Just Clean Up" mode)
 *
 * @param {Object} row - Cleaned row object
 * @param {Array} rules - Array of rule objects from rulesStore
 * @param {string} [activeProfile='Default'] - Currently active rule profile
 * @param {boolean} [enableRules=true] - Whether to apply rules (false for "Just Clean Up" mode)
 * @returns {Object} Processed row object
 */
export const applyRulesToRow = (row, rules, activeProfile = 'Default', enableRules = true) => {
  // In "Just Clean Up" mode, return row without evaluating rules or appending remark columns
  if (!enableRules) {
    return { ...row }
  }

  const result = { ...row }
  const filledColumns = new Set()

  // Ensure default Remark 1 exists
  if (!('Remark 1' in result)) result['Remark 1'] = ''

  for (const rawRule of rules) {
    const rule = normalizeRule(rawRule)

    // Profile filtering
    if (rule.profile !== activeProfile && rule.profile !== 'Global') {
      continue
    }

    // Evaluate conditions based on gate (AND vs OR)
    let isMatch = false
    if (rule.conditionGate === 'OR') {
      isMatch = rule.conditions.some(cond => evaluateCondition(result[cond.field], cond.operator, cond.value))
    } else {
      // AND gate: every condition must evaluate to true
      isMatch = rule.conditions.every(cond => evaluateCondition(result[cond.field], cond.operator, cond.value))
    }

    if (isMatch) {
      // Apply each output column (first-match-wins per output column)
      for (const output of rule.outputs) {
        if (!output.column) continue
        if (!filledColumns.has(output.column)) {
          result[output.column] = output.value
          filledColumns.add(output.column)
        }
      }
    }
  }

  // If Remark 1 is still empty after all rules, mark as unflagged
  if (!result['Remark 1'] || String(result['Remark 1']).trim() === '') {
    result['Remark 1'] = 'no rule given'
  }

  return result
}

/**
 * Extracts all unique output column names configured across active rules.
 * E.g. ['Remark 1', 'Remark 2', 'Category']
 *
 * @param {Array} rules
 * @param {string} activeProfile
 * @returns {string[]}
 */
export const getActiveOutputColumns = (rules, activeProfile = 'Default') => {
  const columns = new Set(['Remark 1'])
  for (const rawRule of rules) {
    const rule = normalizeRule(rawRule)
    if (rule.profile === activeProfile || rule.profile === 'Global') {
      for (const out of rule.outputs) {
        if (out.column && out.column.trim()) {
          columns.add(out.column.trim())
        }
      }
    }
  }
  return Array.from(columns)
}