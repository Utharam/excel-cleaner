<script setup>
import { ref, reactive, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useDataStore } from '../stores/useDataStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useRulesStore } from '../stores/useRulesStore'
import { cleanParticulars, cleanAmount, normalizeDate } from '../utils/cleaners'
import { applyRulesToRow } from '../utils/engine'

const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const rulesStore = useRulesStore()

// ─── Local UI State ───────────────────────────────────────
const isDragging = ref(false)
const fileInput = ref(null)

// ─── Import Modal State ──────────────────────────────────
const isMappingModalOpen = ref(false)
const rawGrid = ref([])
const selectedHeaderIndex = ref(0)
const columnTypes = reactive({})  // keyed by column index → 'Text' | 'Date' | 'Amount'
const pendingFileName = ref('')

const standardDataTypes = ['Text', 'Date', 'Amount']

// ─── Drag-and-Drop Handlers ──────────────────────────────
const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    parseFile(files[0])
  }
}

// ─── Click-to-Browse ─────────────────────────────────────
const openFileBrowser = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    parseFile(files[0])
  }
  e.target.value = ''
}

// ─── SheetJS Parsing Logic ───────────────────────────────
const parseFile = (file) => {
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Read as raw 2D array (header: 1) instead of array of objects
      const grid = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

      if (grid.length === 0) {
        alert('The selected file appears to be empty or has no rows.')
        return
      }

      // Store in modal state and open the mapping modal
      rawGrid.value = grid
      pendingFileName.value = file.name
      selectedHeaderIndex.value = 0
      initializeColumnTypes(0)
      isMappingModalOpen.value = true
    } catch (err) {
      console.error('[Parse Error]', err)
      alert('Failed to parse the file. Please ensure it is a valid .xlsx, .xls, or .csv file.')
    }
  }

  reader.onerror = (err) => {
    console.error('[FileReader Error]', err)
    alert('Failed to read the file from disk.')
  }

  reader.readAsArrayBuffer(file)
}

// ─── Smart Default Guessing for Column Types ─────────────
const guessColumnType = (header) => {
  const h = String(header || '').toLowerCase().trim()
  if (h.includes('date') || h.includes('time')) return 'Date'
  if (h.includes('amount') || h.includes('debit') || h.includes('credit') ||
      h.includes('balance') || h.includes('value') || h.includes('withdrawal') ||
      h.includes('deposit'))
  {
    return 'Amount'
  }
  return 'Text'
}

const initializeColumnTypes = (rowIndex) => {
  const row = rawGrid.value[rowIndex] || []
  // Clear all existing keys from the reactive object
  Object.keys(columnTypes).forEach(k => delete columnTypes[k])
  // Pre-fill with smart guesses based on header names
  for (let i = 0; i < row.length; i++) {
    columnTypes[i] = guessColumnType(row[i])
  }
}

// ─── Modal Interaction Handlers ──────────────────────────
const selectHeaderRow = (index) => {
  selectedHeaderIndex.value = index
  initializeColumnTypes(index)
}

const cancelImport = () => {
  isMappingModalOpen.value = false
  rawGrid.value = []
  pendingFileName.value = ''
  Object.keys(columnTypes).forEach(k => delete columnTypes[k])
}

const confirmImport = () => {
  const rawHeaders = rawGrid.value[selectedHeaderIndex.value] || []
  const dataRows = rawGrid.value.slice(selectedHeaderIndex.value + 1)

  if (dataRows.length === 0) {
    alert('No data rows found after the selected header row. Please choose a different row.')
    return
  }

  // Build clean, unique header names from the selected row
  const headers = []
  const seenNames = new Set()
  rawHeaders.forEach((h, i) => {
    let name = (h !== undefined && h !== null && String(h).trim() !== '')
      ? String(h).trim()
      : `Column ${i + 1}`
    // Deduplicate: if the name is already seen, append the index
    if (seenNames.has(name)) {
      name = `${name} (${i + 1})`
    }
    seenNames.add(name)
    headers.push(name)
  })

  // Build array of objects using the finalized headers
  const finalData = dataRows.map(row => {
    const obj = {}
    headers.forEach((header, i) => {
      obj[header] = row[i] !== undefined ? row[i] : ''
    })
    return obj
  })

  // Build columnTypes mapping keyed by header name (for the data store)
  const typesByHeader = {}
  headers.forEach((header, i) => {
    typesByHeader[header] = columnTypes[i] || 'Text'
  })

  // Push to store — assumes setRawData accepts an optional third arg
  // for column types. The store should save this as dataStore.columnTypes.
  dataStore.setRawData(finalData, pendingFileName.value, typesByHeader)

  // Reset modal state
  isMappingModalOpen.value = false
  rawGrid.value = []
  pendingFileName.value = ''
  Object.keys(columnTypes).forEach(k => delete columnTypes[k])
}

// ─── Clear Data ──────────────────────────────────────────
const handleClearData = () => {
  dataStore.clearData()
}

// ─── Date Column Detection ───────────────────────────────
// Uses explicit column types from the import modal if available,
// falls back to header-name heuristic for backward compatibility.
const dateHeaders = computed(() => {
  if (dataStore.columnTypes) {
    return dataStore.headers.filter(h => dataStore.columnTypes[h] === 'Date')
  }
  return dataStore.headers.filter(h =>
    h.toLowerCase().includes('date')
  )
})

// ─── Display Headers (original + Remark columns) ─────────
const displayHeaders = computed(() => {
  const headers = [...dataStore.headers]
  if (!headers.includes('Remark 1')) headers.push('Remark 1')
  if (!headers.includes('Remark 2')) headers.push('Remark 2')
  return headers
})

// ─── Full Processing Pipeline ────────────────────────────
const processedData = computed(() => {
  const dateFormat = settingsStore.defaultDateFormat
  const activeProfile = rulesStore.activeProfile

  return dataStore.rawData.map(row => {
    const cleanedRow = {}
    const dateErrors = {}

    for (const header of dataStore.headers) {
      const rawValue = row[header]
      const colType = dataStore.columnTypes ? (dataStore.columnTypes[header] || 'Text') : 'Text'

      if (colType === 'Date' || dateHeaders.value.includes(header)) {
        const result = normalizeDate(rawValue, dateFormat)
        if (result.isValid) {
          cleanedRow[header] = result.value
        } else {
          cleanedRow[header] = String(rawValue)
          dateErrors[header] = result.error
        }
      } else if (colType === 'Amount') {
        cleanedRow[header] = cleanAmount(rawValue)
      } else {
        cleanedRow[header] = cleanParticulars(rawValue)
      }
    }

    const processedRow = applyRulesToRow(cleanedRow, rulesStore.rules, activeProfile)
    processedRow._dateErrors = dateErrors

    return processedRow
  })
})

// ─── Dashboard Computeds ─────────────────────────────────
const totalRows = computed(() => processedData.value.length)

const matchedRows = computed(() =>
  processedData.value.filter(row => row['Remark 1'] !== 'no rule given')
)

const unmatchedRows = computed(() =>
  processedData.value.filter(row => row['Remark 1'] === 'no rule given')
)

const sampleMatched = computed(() => matchedRows.value.slice(0, 5))
const sampleUnmatched = computed(() => unmatchedRows.value.slice(0, 5))

const categorizedPercentage = computed(() => {
  if (totalRows.value === 0) return 0
  return Math.round((matchedRows.value.length / totalRows.value) * 100)
})

// ─── Excel Export Logic ──────────────────────────────────
const handleExport = () => {
  if (processedData.value.length === 0) {
    alert('No data to export.')
    return
  }

  // 1. Deep copy to avoid mutating reactive UI state
  const exportData = JSON.parse(JSON.stringify(processedData.value))

  // 2. Strip internal _dateErrors property from every row
  for (const row of exportData) {
    delete row._dateErrors
  }

  // 3. Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // 4. Create a new workbook
  const workbook = XLSX.utils.book_new()

  // 5. Append the worksheet
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data')

  // 6. Generate dynamic filename with today's date (YYYY-MM-DD)
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const fileName = `cleaned-statement-${year}-${month}-${day}.xlsx`

  // 7. Trigger the browser download
  XLSX.writeFile(workbook, fileName)
}
</script>

<template>
  <main class="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="max-w-5xl mx-auto">

      <!-- Heading -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Workspace
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Upload an Excel file to begin cleanup and transformation.
        </p>
      </div>

      <!-- ────────────────────────────────────────────────────── -->
      <!-- EMPTY STATE: Dropzone                                  -->
      <!-- ────────────────────────────────────────────────────── -->
      <div
        v-if="dataStore.rawData.length === 0"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="openFileBrowser"
        :class="[
          'border-2 border-dashed rounded-xl p-12 text-center bg-white dark:bg-slate-800 transition cursor-pointer',
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-slate-700 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-brand-500'
        ]"
      >
        <svg class="w-12 h-12 mx-auto mb-3"
             :class="isDragging ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600'"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.9 5 5 0 019.9-1A5.002 5.002 0 0117 16M9 13l3-3m0 0l3 3m-3-3v8" />
        </svg>
        <p class="text-slate-600 dark:text-slate-300 font-medium">
          Drop your <code class="text-brand-600">.xlsx</code>, <code class="text-brand-600">.xls</code>, or <code class="text-brand-600">.csv</code> file here
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
          or click to browse
        </p>

        <input
          ref="fileInput"
          type="file"
          accept=".xlsx, .xls, .csv"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- ────────────────────────────────────────────────────── -->
      <!-- DASHBOARD STATE                                        -->
      <!-- ────────────────────────────────────────────────────── -->
      <div v-else class="space-y-5">

        <!-- File Info Bar -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {{ dataStore.fileName }}
              </p>
              <p class="text-xs text-slate-400 dark:text-slate-500">
                {{ dataStore.rawData.length }} rows • {{ dataStore.headers.length }} columns
              </p>
            </div>
          </div>
          <button
            @click="handleClearData"
            class="px-4 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400
                   border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Clear Data
          </button>
        </div>

        <!-- Date Format Control Bar -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                Input Date Format
              </span>
              <div class="flex rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                  @click="settingsStore.setDateFormat('US')"
                  :class="[
                    'px-3 py-1.5 text-sm font-medium transition',
                    settingsStore.defaultDateFormat === 'US'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  ]"
                >
                  US (MM/DD/YYYY)
                </button>
                <button
                  @click="settingsStore.setDateFormat('INTL')"
                  :class="[
                    'px-3 py-1.5 text-sm font-medium transition border-l border-slate-200 dark:border-slate-700',
                    settingsStore.defaultDateFormat === 'INTL'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  ]"
                >
                  INTL (DD/MM/YYYY)
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span v-if="dateHeaders.length > 0">
                Date columns: {{ dateHeaders.join(', ') }}
              </span>
              <span v-else>
                No date columns detected
              </span>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════ -->
        <!-- SUMMARY DASHBOARD                                     -->
        <!-- ═══════════════════════════════════════════════════ -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Processing Summary
            <span class="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2.5 py-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              Profile: {{ rulesStore.activeProfile }}
            </span>
          </h3>

          <!-- Stat Cards -->
          <div class="grid grid-cols-3 gap-4 mb-5">
            <!-- Total Rows -->
            <div class="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {{ totalRows.toLocaleString() }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium uppercase tracking-wider">
                Total Rows
              </p>
            </div>

            <!-- Categorized -->
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                {{ matchedRows.length.toLocaleString() }}
              </p>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1 font-medium uppercase tracking-wider">
                Categorized
              </p>
            </div>

            <!-- Needs Review -->
            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {{ unmatchedRows.length.toLocaleString() }}
              </p>
              <p class="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium uppercase tracking-wider">
                Needs Review
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-5">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
                Categorization Rate
              </span>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {{ categorizedPercentage }}%
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full transition-all duration-500"
                :style="{ width: categorizedPercentage + '%' }"
              ></div>
            </div>
          </div>

          <!-- Massive Download Button -->
          <button
            @click="handleExport"
            class="w-full px-6 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white
                   font-semibold text-base transition flex items-center justify-center gap-3
                   shadow-md hover:shadow-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Cleaned Excel
          </button>
        </div>

        <!-- ═══════════════════════════════════════════════════ -->
        <!-- SAMPLE TABLES                                         -->
        <!-- ═══════════════════════════════════════════════════ -->
        <div class="grid grid-cols-1 gap-5">

          <!-- ─── Sample Categorized (Green) ─────────────────── -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800/50 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                Sample Categorized
              </h3>
              <span class="text-xs text-green-600 dark:text-green-400 font-medium">
                First {{ sampleMatched.length }} of {{ matchedRows.length.toLocaleString() }}
              </span>
            </div>

            <div v-if="sampleMatched.length > 0" class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap">#</th>
                    <th
                      v-for="header in displayHeaders"
                      :key="header"
                      class="px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr
                    v-for="(row, index) in sampleMatched"
                    :key="index"
                    class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                  >
                    <td class="px-3 py-2 text-slate-400 dark:text-slate-500 text-xs tabular-nums">{{ index + 1 }}</td>
                    <td
                      v-for="header in displayHeaders"
                      :key="header"
                      :class="[
                        'px-3 py-2 whitespace-nowrap',
                        header === 'Remark 1' || header === 'Remark 2'
                          ? 'text-green-600 dark:text-green-400 font-medium'
                          : row._dateErrors && row._dateErrors[header]
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-700 dark:text-slate-200'
                      ]"
                      :title="row._dateErrors && row._dateErrors[header] ? row._dateErrors[header] : ''"
                    >
                      {{ row[header] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No categorized rows yet. Add rules in the sidebar to categorize your data.
            </div>
          </div>

          <!-- ─── Needs Review / Unmatched (Amber) ───────────── -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Needs Review / Unmatched
              </h3>
              <span class="text-xs text-amber-600 dark:text-amber-400 font-medium">
                First {{ sampleUnmatched.length }} of {{ unmatchedRows.length.toLocaleString() }}
              </span>
            </div>

            <div v-if="sampleUnmatched.length > 0" class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap">#</th>
                    <th
                      v-for="header in displayHeaders"
                      :key="header"
                      class="px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr
                    v-for="(row, index) in sampleUnmatched"
                    :key="index"
                    class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                  >
                    <td class="px-3 py-2 text-slate-400 dark:text-slate-500 text-xs tabular-nums">{{ index + 1 }}</td>
                    <td
                      v-for="header in displayHeaders"
                      :key="header"
                      :class="[
                        'px-3 py-2 whitespace-nowrap',
                        header === 'Remark 1'
                          ? 'text-amber-600 dark:text-amber-400 font-medium italic'
                          : row._dateErrors && row._dateErrors[header]
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-700 dark:text-slate-200'
                      ]"
                      :title="row._dateErrors && row._dateErrors[header] ? row._dateErrors[header] : ''"
                    >
                      {{ row[header] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              <svg class="w-8 h-8 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All rows categorized — nothing to review!
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- ════════════════════════════════════════════════════════ -->
    <!-- IMPORT MAPPING MODAL                                    -->
    <!-- ════════════════════════════════════════════════════════ -->
    <div
      v-if="isMappingModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="cancelImport"
      ></div>

      <!-- Modal Container -->
      <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Import Data
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select the header row and assign data types to each column.
          </p>
        </div>

        <!-- Modal Body (scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <!-- ─── Section 1: Select Header Row ─────────────────── -->
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Select Header Row
              </h3>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mb-3 ml-8">
              Click the row that contains your column headers. Rows before this will be skipped.
            </p>

            <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div class="overflow-auto max-h-64">
                <table class="w-full text-sm text-left">
                  <thead class="sticky top-0 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 z-10">
                    <tr>
                      <th class="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider whitespace-nowrap w-16">Row</th>
                      <th class="px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Preview</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                    <tr
                      v-for="(row, index) in rawGrid.slice(0, 10)"
                      :key="index"
                      @click="selectHeaderRow(index)"
                      :class="[
                        'cursor-pointer transition',
                        index === selectedHeaderIndex
                          ? 'bg-brand-50 dark:bg-brand-900/20 ring-2 ring-inset ring-brand-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      ]"
                    >
                      <td class="px-3 py-2 text-xs tabular-nums whitespace-nowrap">
                        <span
                          :class="index === selectedHeaderIndex
                            ? 'text-brand-600 dark:text-brand-400 font-bold'
                            : 'text-slate-400 dark:text-slate-500'"
                        >
                          <span v-if="index === selectedHeaderIndex">✓ </span>{{ index }}
                        </span>
                      </td>
                      <td class="px-3 py-2">
                        <div class="flex gap-4 overflow-hidden">
                          <span
                            v-for="(cell, ci) in row.slice(0, 8)"
                            :key="ci"
                            class="text-xs whitespace-nowrap truncate max-w-[140px]"
                            :class="index === selectedHeaderIndex
                              ? 'text-slate-700 dark:text-slate-200 font-medium'
                              : 'text-slate-500 dark:text-slate-400'"
                          >
                            {{ cell }}
                          </span>
                          <span v-if="row.length > 8" class="text-xs text-slate-400 dark:text-slate-500 italic shrink-0">
                            +{{ row.length - 8 }} more
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ─── Section 2: Assign Data Types ────────────────── -->
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Assign Data Types
              </h3>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mb-3 ml-8">
              Tell the engine how to interpret each column. Types are pre-guessed from header names — adjust as needed.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(header, index) in (rawGrid[selectedHeaderIndex] || [])"
                :key="index"
                class="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3 border border-slate-200 dark:border-slate-600"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {{ (header !== undefined && header !== null && String(header).trim() !== '') ? header : `Column ${index + 1}` }}
                  </p>
                </div>
                <select
                  v-model="columnTypes[index]"
                  class="shrink-0 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option v-for="type in standardDataTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 flex justify-end gap-3">
          <button
            @click="cancelImport"
            class="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   text-slate-600 dark:text-slate-300 text-sm font-medium
                   hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmImport"
            class="px-6 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold
                   hover:bg-brand-700 transition shadow-sm flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 13l4 4L19 7" />
            </svg>
            Import Data
          </button>
        </div>

      </div>
    </div>

  </main>
</template>