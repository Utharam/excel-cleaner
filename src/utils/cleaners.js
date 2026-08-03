// ─── Month Abbreviations for DD-MMM-YYYY Output ──────────
const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

/**
 * Cleans and normalizes text/particulars fields.
 * - Converts input to string safely
 * - Replaces non-breaking spaces, tabs, and hidden unicode whitespace with standard spaces
 * - Collapses consecutive spaces into a single space
 * - Trims leading and trailing spaces
 *
 * @param {*} text - The raw cell value from SheetJS
 * @returns {string} The cleaned string
 */
export const cleanParticulars = (text) => {
  if (text === null || text === undefined) return ''

  let str = String(text)

  // Replace non-breaking spaces, tabs, and various unicode whitespace with standard spaces
  str = str.replace(
    /[\u00A0\u2000-\u200A\u202F\u205F\u3000\t\v\f\r]/g,
    ' '
  )

  // Collapse consecutive spaces into a single space
  str = str.replace(/\s+/g, ' ')

  // Trim leading and trailing spaces
  str = str.trim()

  return str
}

/**
 * Cleans and converts a raw cell value into a true JavaScript Number
 * for proper Excel numeric cell export.
 *
 * - Strips currency symbols, commas, spaces, and any non-numeric characters
 * - Preserves digits, decimal points, and minus signs only
 * - Returns null for empty or unparseable values (exports as empty cell, not text)
 *
 * @param {*} rawValue - The raw cell value from SheetJS
 * @returns {number|null} The parsed number, or null if unparseable
 */
export const cleanAmount = (rawValue) => {
  if (rawValue === null || rawValue === undefined || rawValue === '') return null

  // If already a number type, return it directly
  if (typeof rawValue === 'number') {
    return isNaN(rawValue) ? null : rawValue
  }

  let str = String(rawValue).trim()

  if (str === '') return null

  // FIXED REGEX: Strip everything EXCEPT digits (0-9), decimal points (.), and minus signs (-)
  str = str.replace(/[^0-9.\-]/g, '')

  // Guard: nothing left after stripping, or only symbols with no digits
  if (str === '' || str === '-' || str === '.' || str === '-.') return null

  const num = parseFloat(str)

  return isNaN(num) ? null : num
}

/**
 * Converts an Excel serial date number to a JavaScript Date object.
 * Accounts for Excel's 1900 leap year bug (serial 60 = phantom Feb 29, 1900).
 *
 * @param {number} serial - Excel serial date number
 * @returns {Date}
 */
const excelSerialToDate = (serial) => {
  // 25569 = Excel serial for 1970-01-01 (Unix epoch), accounting for the leap year bug
  const utcDays = serial - 25569
  const milliseconds = utcDays * 86400000
  return new Date(milliseconds)
}

/**
 * Formats a Date object to DD-MMM-YYYY format (e.g., 03-Aug-2026).
 * Uses UTC getters to avoid timezone shift issues.
 *
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = MONTH_ABBREVIATIONS[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Normalizes and validates a date value.
 *
 * Handles:
 * - Excel numeric serial numbers (number type or numeric strings)
 * - JavaScript Date objects (if SheetJS outputs them)
 * - String dates in MM/DD/YYYY (US) or DD/MM/YYYY (INTL) format
 * - ISO format YYYY-MM-DD (auto-detected regardless of mode)
 * - Natural language dates (e.g., "August 3, 2026") as fallback
 * - 2-digit years (00-49 → 2000s, 50-99 → 1900s)
 * - Time components (stripped before parsing)
 *
 * @param {*} value - The raw date value
 * @param {'US'|'INTL'} mode - 'US' = MM/DD/YYYY, 'INTL' = DD/MM/YYYY
 * @returns {{ value: string, isValid: boolean, error: string|null }}
 */
export const normalizeDate = (value, mode) => {
  const result = { value: '', isValid: false, error: null }

  // ─── Guard: Empty values ────────────────────────────────
  if (value === null || value === undefined || value === '') {
    result.error = 'Empty date value'
    return result
  }

  // ─── Handle JS Date objects ─────────────────────────────
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      result.value = formatDate(value)
      result.isValid = true
      return result
    }
    result.error = 'Invalid Date object'
    return result
  }

  // ─── Handle Excel numeric serial numbers ────────────────
  if (typeof value === 'number') {
    if (value < 1 || value > 2958465) {
      result.error = `Excel serial out of range: ${value}`
      return result
    }
    const date = excelSerialToDate(value)
    if (isNaN(date.getTime())) {
      result.error = `Could not convert serial ${value} to date`
      return result
    }
    result.value = formatDate(date)
    result.isValid = true
    return result
  }

  // ─── Parse string dates ─────────────────────────────────
  let str = String(value).trim()

  // Check if it's a pure number string (Excel serial as string)
  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str)
    if (serial >= 1 && serial <= 2958465) {
      const date = excelSerialToDate(serial)
      if (!isNaN(date.getTime())) {
        result.value = formatDate(date)
        result.isValid = true
        return result
      }
    }
  }

  // Strip time component if present (e.g., "08/03/2026 14:30:00")
  str = str.split(/\s+/)[0]

  // Try to extract date parts using common separators: / - .
  const dateMatch = str.match(/^(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{1,4})$/)

  if (!dateMatch) {
    // FIXED: Use the original full string for natural language parsing, 
    // not the 'str' variable which might have been chopped at the first space.
    const originalStr = String(value).trim()
    const parsed = new Date(originalStr)
    
    if (!isNaN(parsed.getTime())) {
      result.value = formatDate(parsed)
      result.isValid = true
      return result
    }
    result.error = `Unrecognized date format: "${value}"`
    return result
  }

  let [, part1, part2, part3] = dateMatch
  part1 = parseInt(part1, 10)
  part2 = parseInt(part2, 10)
  part3 = parseInt(part3, 10)

  let month, day, year

  // Auto-detect ISO format (YYYY-MM-DD) — first part is 4 digits
  if (part1 >= 1000) {
    year = part1
    month = part2
    day = part3
  } else if (mode === 'US') {
    // MM/DD/YYYY
    month = part1
    day = part2
    year = part3
  } else {
    // INTL: DD/MM/YYYY
    day = part1
    month = part2
    year = part3
  }

  // Handle 2-digit years
  if (year < 100) {
    year = year < 50 ? year + 2000 : year + 1900
  }

  // ─── Validation ─────────────────────────────────────────

  // Month must be 1-12
  if (month < 1 || month > 12) {
    result.error = mode === 'US'
      ? `Invalid month ${month} — US format expects MM/DD/YYYY`
      : `Invalid month ${month} — INTL format expects DD/MM/YYYY`
    return result
  }

  // Day must be 1-31
  if (day < 1 || day > 31) {
    result.error = `Invalid day ${day}`
    return result
  }

  // Create date and verify it didn't roll over (e.g., Feb 30 → Mar 2)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    result.error = `Impossible date: ${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year} — day out of range for this month`
    return result
  }

  // ─── Success ────────────────────────────────────────────
  result.value = formatDate(date)
  result.isValid = true
  return result
}