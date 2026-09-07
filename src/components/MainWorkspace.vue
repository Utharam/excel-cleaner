<script setup>
import { ref, reactive, computed, watch } from 'vue'
import * as XLSX from 'xlsx'
import { useDataStore } from '../stores/useDataStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useRulesStore } from '../stores/useRulesStore'
import { cleanParticulars, cleanAmount, normalizeDate } from '../utils/cleaners'
import { applyRulesToRow, getActiveOutputColumns } from '../utils/engine'
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  X,
  Eye,
  PlusCircle,
  Calendar,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardCheck
} from 'lucide-vue-next'

const emit = defineEmits(['createRuleFromRow'])

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

// ─── Workbench Interactive Controls ───────────────────────
const searchQuery = ref('')
const activeTab = ref('all') // 'all' | 'matched' | 'unmatched' | 'date_errors'
const pageSize = ref(25)
const currentPage = ref(1)
const density = ref('comfortable') // 'compact' | 'comfortable'

// ─── Slide-Over Row Inspector ─────────────────────────────
const selectedRow = ref(null)
const selectedRowRaw = ref(null)
const selectedRowIndex = ref(null)
const isInspectorOpen = ref(false)

const openInspector = (row, index) => {
  selectedRow.value = row
  selectedRowIndex.value = index
  selectedRowRaw.value = dataStore.rawData[index] || null
  isInspectorOpen.value = true
}

const closeInspector = () => {
  isInspectorOpen.value = false
  selectedRow.value = null
  selectedRowIndex.value = null
  selectedRowRaw.value = null
}

const handleCreateRule = () => {
  if (!selectedRow.value) return
  // Find primary particulars and amount fields
  const particularsHeader = dataStore.headers.find(h => !h.toLowerCase().includes('date') && !h.toLowerCase().includes('amount') && !h.toLowerCase().includes('balance')) || dataStore.headers[0] || 'Particulars'
  const amountHeader = dataStore.headers.find(h => h.toLowerCase().includes('amount') || h.toLowerCase().includes('debit') || h.toLowerCase().includes('credit'))

  const data = {
    field: particularsHeader,
    value: selectedRow.value[particularsHeader] || '',
    amountField: amountHeader || null,
    amountValue: amountHeader ? selectedRow.value[amountHeader] : null
  }

  emit('createRuleFromRow', data)
  closeInspector()
}

// ─── Drag-and-Drop Handlers ──────────────────────────────
const handleDragOver = () => { isDragging.value = true }
const handleDragLeave = () => { isDragging.value = false }
const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files && files.length > 0) parseFile(files[0])
}

const openFileBrowser = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files && files.length > 0) parseFile(files[0])
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
      const grid = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

      if (grid.length === 0) {
        alert('The selected file appears to be empty or has no rows.')
        return
      }

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

const guessColumnType = (header) => {
  const h = String(header || '').toLowerCase().trim()
  if (h.includes('date') || h.includes('time')) return 'Date'
  if (h.includes('amount') || h.includes('debit') || h.includes('credit') ||
      h.includes('balance') || h.includes('value') || h.includes('withdrawal') ||
      h.includes('deposit')) {
    return 'Amount'
  }
  return 'Text'
}

const initializeColumnTypes = (rowIndex) => {
  const row = rawGrid.value[rowIndex] || []
  Object.keys(columnTypes).forEach(k => delete columnTypes[k])
  for (let i = 0; i < row.length; i++) {
    columnTypes[i] = guessColumnType(row[i])
  }
}

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

  const headers = []
  const seenNames = new Set()
  rawHeaders.forEach((h, i) => {
    let name = (h !== undefined && h !== null && String(h).trim() !== '')
      ? String(h).trim()
      : `Column ${i + 1}`
    if (seenNames.has(name)) {
      name = `${name} (${i + 1})`
    }
    seenNames.add(name)
    headers.push(name)
  })

  const finalData = dataRows.map(row => {
    const obj = {}
    headers.forEach((header, i) => {
      obj[header] = row[i] !== undefined ? row[i] : ''
    })
    return obj
  })

  const typesByHeader = {}
  headers.forEach((header, i) => {
    typesByHeader[header] = columnTypes[i] || 'Text'
  })

  dataStore.setRawData(finalData, pendingFileName.value, typesByHeader)
  isMappingModalOpen.value = false
  rawGrid.value = []
  pendingFileName.value = ''
  Object.keys(columnTypes).forEach(k => delete columnTypes[k])
  currentPage.value = 1
  searchQuery.value = ''
}

const handleClearData = () => {
  dataStore.clearData()
  closeInspector()
  searchQuery.value = ''
  currentPage.value = 1
}

// ─── Date Column Detection ───────────────────────────────
const dateHeaders = computed(() => {
  if (dataStore.columnTypes) {
    return dataStore.headers.filter(h => dataStore.columnTypes[h] === 'Date')
  }
  return dataStore.headers.filter(h => h.toLowerCase().includes('date'))
})

// ─── Dynamic Output Columns & Display Headers ────────────
const activeRemarkColumns = computed(() => {
  return getActiveOutputColumns(rulesStore.rules, rulesStore.activeProfile)
})

const displayHeaders = computed(() => {
  const headers = [...dataStore.headers]
  if (settingsStore.workflowMode === 'rules') {
    for (const col of activeRemarkColumns.value) {
      if (!headers.includes(col)) headers.push(col)
    }
  }
  return headers
})

// ─── Full Processing Pipeline ────────────────────────────
const processedData = computed(() => {
  const dateFormat = settingsStore.defaultDateFormat
  const activeProfile = rulesStore.activeProfile
  const enableRules = settingsStore.workflowMode === 'rules'

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

    const processedRow = applyRulesToRow(cleanedRow, rulesStore.rules, activeProfile, enableRules)
    processedRow._dateErrors = dateErrors
    return processedRow
  })
})

// ─── Dashboard Metrics ───────────────────────────────────
const totalRows = computed(() => processedData.value.length)

const matchedRows = computed(() =>
  processedData.value.filter(row =>
    activeRemarkColumns.value.some(col => row[col] && row[col] !== 'no rule given')
  )
)

const unmatchedRows = computed(() =>
  processedData.value.filter(row =>
    !activeRemarkColumns.value.some(col => row[col] && row[col] !== 'no rule given')
  )
)

const dateErrorRows = computed(() =>
  processedData.value.filter(row => row._dateErrors && Object.keys(row._dateErrors).length > 0)
)

const categorizedPercentage = computed(() => {
  if (totalRows.value === 0) return 0
  return Math.round((matchedRows.value.length / totalRows.value) * 100)
})

// ─── Forensic Audit Telemetry ─────────────────────────────
const forensicAudit = computed(() => {
  let totalCells = 0
  let spacesTrimmed = 0
  let ascii160Purged = 0
  let numbersCoerced = 0
  let datesNormalized = 0
  let blanksPreserved = 0

  const dateFormat = settingsStore.defaultDateFormat

  for (let r = 0; r < dataStore.rawData.length; r++) {
    const rawRow = dataStore.rawData[r]
    for (const h of dataStore.headers) {
      totalCells++
      const rawVal = rawRow[h]
      const colType = dataStore.columnTypes ? (dataStore.columnTypes[h] || 'Text') : 'Text'

      if (rawVal === null || rawVal === undefined || String(rawVal).trim() === '') {
        blanksPreserved++
        continue
      }

      const strVal = String(rawVal)
      if (strVal.includes('\u00A0')) {
        ascii160Purged++
      }

      if (colType === 'Amount') {
        const cleaned = cleanAmount(rawVal)
        if (typeof rawVal !== 'number' && typeof cleaned === 'number') {
          numbersCoerced++
        }
      } else if (colType === 'Date' || dateHeaders.value.includes(h)) {
        const res = normalizeDate(rawVal, dateFormat)
        if (res.isValid && res.value !== String(rawVal)) {
          datesNormalized++
        }
      } else {
        const cleanedText = cleanParticulars(rawVal)
        if (cleanedText !== strVal) {
          spacesTrimmed++
        }
      }
    }
  }

  return {
    totalCells,
    spacesTrimmed,
    ascii160Purged,
    numbersCoerced,
    datesNormalized,
    blanksPreserved,
  }
})

// ─── Filtered & Paginated Rows ───────────────────────────
const filteredRows = computed(() => {
  let list = processedData.value

  // Tab filter
  if (settingsStore.workflowMode === 'rules') {
    if (activeTab.value === 'matched') {
      list = matchedRows.value
    } else if (activeTab.value === 'unmatched') {
      list = unmatchedRows.value
    }
  }

  if (activeTab.value === 'date_errors') {
    list = dateErrorRows.value
  }

  // Text search
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(row => {
      return displayHeaders.value.some(h => {
        const val = row[h]
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(q)
      })
    })
  }

  return list
})

const totalPages = computed(() => {
  const size = Number(pageSize.value)
  if (isNaN(size) || size <= 0) return 1
  return Math.max(1, Math.ceil(filteredRows.value.length / size))
})

const paginatedRows = computed(() => {
  const size = Number(pageSize.value)
  if (isNaN(size) || size <= 0 || size > 5000) return filteredRows.value
  const start = (currentPage.value - 1) * size
  return filteredRows.value.slice(start, start + size)
})

watch([searchQuery, activeTab, pageSize], () => {
  currentPage.value = 1
})

// ─── Excel Export Logic ──────────────────────────────────
const handleExport = () => {
  if (processedData.value.length === 0) {
    alert('No data to export.')
    return
  }

  const exportData = JSON.parse(JSON.stringify(processedData.value))
  for (const row of exportData) {
    delete row._dateErrors
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  const sheetName = settingsStore.workflowMode === 'rules' ? 'Categorized Data' : 'Cleaned Data'
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const modePrefix = settingsStore.workflowMode === 'rules' ? 'categorized-statement' : 'cleaned-statement'
  const fileName = `${modePrefix}-${year}-${month}-${day}.xlsx`

  XLSX.writeFile(workbook, fileName)
}

// ─── CSV Audit Reconciliation Log Export ─────────────────
const handleExportAuditLog = () => {
  if (!dataStore.rawData.length) {
    alert('No data to export audit log for.')
    return
  }

  const logRows = [
    ['Row Index', 'Column', 'Original Raw Input', 'Sanitized Output', 'Forensic Transformation Applied']
  ]

  const dateFormat = settingsStore.defaultDateFormat

  for (let r = 0; r < dataStore.rawData.length; r++) {
    const rawRow = dataStore.rawData[r]
    const cleanRow = processedData.value[r] || {}
    const rowNum = r + 1

    for (const h of dataStore.headers) {
      const rawVal = rawRow[h]
      const cleanVal = cleanRow[h]
      const colType = dataStore.columnTypes ? (dataStore.columnTypes[h] || 'Text') : 'Text'

      if (rawVal === null || rawVal === undefined || String(rawVal).trim() === '') {
        logRows.push([rowNum, h, '', 'null', 'Preserved honest blank (safe null)'])
        continue
      }

      const strVal = String(rawVal)
      let actions = []

      if (strVal.includes('\u00A0')) {
        actions.push('Purged ASCII 160 web non-breaking spaces')
      }

      if (colType === 'Amount') {
        if (typeof rawVal !== 'number' && typeof cleanVal === 'number') {
          actions.push(`Coerced text currency string to numeric float (${cleanVal})`)
        }
      } else if (colType === 'Date' || dateHeaders.value.includes(h)) {
        if (cleanVal !== strVal) {
          actions.push(`Normalized mixed date stamp to DD-MMM-YYYY (${cleanVal})`)
        }
      } else {
        if (cleanVal !== strVal) {
          actions.push('Collapsed whitespace & trimmed excess spaces')
        }
      }

      if (actions.length > 0) {
        logRows.push([rowNum, h, strVal, cleanVal !== null && cleanVal !== undefined ? String(cleanVal) : '', actions.join('; ')])
      }
    }

    // Also log rule match remarks if in rules mode
    if (settingsStore.workflowMode === 'rules') {
      for (const col of activeRemarkColumns.value) {
        if (cleanRow[col] && cleanRow[col] !== 'no rule given') {
          logRows.push([rowNum, col, '—', cleanRow[col], 'Populated by Rule Match'])
        }
      }
    }
  }

  // Convert array of rows to CSV
  const csvContent = logRows.map(row => 
    row.map(cell => {
      const cellStr = cell === null || cell === undefined ? '' : String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(',')
  ).join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const baseName = (dataStore.fileName || 'statement').replace(/\.[^/.]+$/, '')
  link.setAttribute('href', url)
  link.setAttribute('download', `audit-log-${baseName}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

defineExpose({
  parseFile,
  handleExport,
  handleExportAuditLog,
  openFileBrowser,
  isMappingModalOpen,
})
</script>

<template>
  <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-stone-100/60 dark:bg-stone-950 font-sans transition-colors relative">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- ────────────────────────────────────────────────────── -->
      <!-- STATE 1: DROPZONE EMPTY STATE                          -->
      <!-- ────────────────────────────────────────────────────── -->
      <div
        v-if="dataStore.rawData.length === 0"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="openFileBrowser"
        :class="[
          'border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center bg-white dark:bg-stone-900 transition cursor-pointer shadow-sm',
          isDragging
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 scale-[1.01]'
            : 'border-stone-300 dark:border-stone-700 hover:border-amber-500'
        ]"
      >
        <svg class="w-14 h-14 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.9 5 5 0 019.9-1A5.002 5.002 0 0117 16M9 13l3-3m0 0l3 3m-3-3v8" />
        </svg>
        <p class="text-base font-bold text-stone-800 dark:text-stone-200 font-mono">
          Drop your .xlsx, .xls, or .csv file here
        </p>
        <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">
          or click anywhere to browse from your computer
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
      <!-- STATE 2: ACTIVE PEELER STUDIO WORKBENCH                -->
      <!-- ────────────────────────────────────────────────────── -->
      <div v-else class="space-y-6">

        <!-- ═══ TOP CONTROL DECK & HUD ═════════════════════════ -->
        <div class="rounded-2xl border border-[#E5E5E0] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4">
          
          <!-- Row 1: File Info & Workflow Mode & Main Actions -->
          <div class="flex items-center justify-between flex-wrap gap-4">
            
            <!-- File Badge & Name -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#E5E5E0] dark:border-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold text-base font-mono">
                XC
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-lg font-bold text-[#111827] dark:text-stone-100 tracking-tight font-mono">
                    {{ dataStore.fileName }}
                  </h2>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                    {{ totalRows.toLocaleString() }} ROWS
                  </span>
                </div>
                <p class="text-xs text-stone-500 font-mono">
                  Audit Reconciliation Ledger • Profile: <strong class="text-stone-700 dark:text-stone-300">{{ rulesStore.activeProfile }}</strong>
                </p>
              </div>
            </div>

            <!-- Workflow Mode Toggle -->
            <div class="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl border border-[#E5E5E0] dark:border-stone-700 font-mono text-xs">
              <button
                type="button"
                @click="settingsStore.setWorkflowMode('cleanOnly')"
                :class="[
                  'px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5',
                  settingsStore.workflowMode === 'cleanOnly'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                ]"
              >
                <span>✨ Just Clean Up</span>
              </button>
              <button
                type="button"
                @click="settingsStore.setWorkflowMode('rules')"
                :class="[
                  'px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5',
                  settingsStore.workflowMode === 'rules'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                ]"
              >
                <span>⚡ Clean &amp; Categorize</span>
              </button>
            </div>

            <!-- Action Buttons: Excel + Audit Log CSV + Clear -->
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                @click="handleExport"
                class="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 font-mono"
              >
                <Download class="w-4 h-4" />
                <span>{{ settingsStore.workflowMode === 'rules' ? 'Export Categorized Excel' : 'Export Sanitized Excel' }}</span>
              </button>

              <button
                type="button"
                @click="handleExportAuditLog"
                class="px-3.5 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-[#E5E5E0] dark:border-stone-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 font-mono"
                title="Download CSV log detailing every cell modified with forensic trace"
              >
                <FileText class="w-3.5 h-3.5 text-stone-500" />
                <span class="hidden sm:inline">Audit Log (.csv)</span>
              </button>

              <button
                type="button"
                @click="handleClearData"
                class="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-xs font-semibold transition cursor-pointer font-mono"
                title="Clear statement"
              >
                Clear
              </button>
            </div>

          </div>

          <!-- Row 2: Forensic Telemetry Metrics & Date Mode Switcher -->
          <div class="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between flex-wrap gap-3 text-xs">
            
            <!-- Quick Stat Badges -->
            <div class="flex items-center gap-2 flex-wrap font-mono text-[11px]">
              <div class="px-2.5 py-1 rounded-md bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                <span class="text-stone-400 mr-1">CELLS:</span>
                <strong class="text-stone-900 dark:text-stone-100">{{ forensicAudit.totalCells.toLocaleString() }}</strong>
              </div>

              <div class="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <span class="opacity-75 mr-1">SPACES &amp; ASCII 160:</span>
                <strong>{{ (forensicAudit.spacesTrimmed + forensicAudit.ascii160Purged).toLocaleString() }} purged</strong>
              </div>

              <div class="px-2.5 py-1 rounded-md bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                <span class="text-stone-400 mr-1">NUMBERS COERCED:</span>
                <strong class="text-stone-900 dark:text-stone-100">{{ forensicAudit.numbersCoerced }}</strong>
              </div>

              <div class="px-2.5 py-1 rounded-md bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                <span class="text-stone-400 mr-1">SAFE NULLS:</span>
                <strong class="text-stone-900 dark:text-stone-100">{{ forensicAudit.blanksPreserved }}</strong>
              </div>

              <div v-if="settingsStore.workflowMode === 'rules'" class="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200">
                <span class="opacity-75 mr-1">CATEGORIZED:</span>
                <strong>{{ matchedRows.length }} ({{ categorizedPercentage }}%)</strong>
              </div>

              <div v-if="settingsStore.workflowMode === 'rules' && unmatchedRows.length > 0" class="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <span class="opacity-75 mr-1">REVIEW:</span>
                <strong>{{ unmatchedRows.length }}</strong>
              </div>

              <div v-if="dateErrorRows.length > 0" class="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                <span class="opacity-75 mr-1">DATE WARNINGS:</span>
                <strong>{{ dateErrorRows.length }}</strong>
              </div>
            </div>

            <!-- Date Calibration Switch -->
            <div class="flex items-center gap-2 font-mono">
              <span class="text-stone-400 text-[11px]">DATE INPUT:</span>
              <div class="flex rounded-md overflow-hidden border border-stone-200 dark:border-stone-700 text-[11px]">
                <button
                  type="button"
                  @click="settingsStore.setDateFormat('US')"
                  :class="[
                    'px-2 py-0.5 transition cursor-pointer font-semibold',
                    settingsStore.defaultDateFormat === 'US' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-white dark:bg-stone-800 text-stone-500'
                  ]"
                >
                  US (MM/DD)
                </button>
                <button
                  type="button"
                  @click="settingsStore.setDateFormat('INTL')"
                  :class="[
                    'px-2 py-0.5 transition cursor-pointer font-semibold border-l border-stone-200 dark:border-stone-700',
                    settingsStore.defaultDateFormat === 'INTL' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'bg-white dark:bg-stone-800 text-stone-500'
                  ]"
                >
                  INTL (DD/MM)
                </button>
              </div>
            </div>

          </div>

        </div>

        <!-- ═══ COMMAND & FILTER BAR ═══════════════════════════ -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          
          <!-- Filter Tabs -->
          <div class="flex items-center gap-1.5 flex-wrap font-mono text-xs">
            <button
              type="button"
              @click="activeTab = 'all'"
              :class="[
                'px-3 py-1.5 rounded-xl transition font-bold cursor-pointer',
                activeTab === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
              ]"
            >
              All Rows ({{ totalRows.toLocaleString() }})
            </button>

            <button
              v-if="settingsStore.workflowMode === 'rules'"
              type="button"
              @click="activeTab = 'matched'"
              :class="[
                'px-3 py-1.5 rounded-xl transition font-bold cursor-pointer flex items-center gap-1.5',
                activeTab === 'matched'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50'
              ]"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Categorized ({{ matchedRows.length.toLocaleString() }})</span>
            </button>

            <button
              v-if="settingsStore.workflowMode === 'rules'"
              type="button"
              @click="activeTab = 'unmatched'"
              :class="[
                'px-3 py-1.5 rounded-xl transition font-bold cursor-pointer flex items-center gap-1.5',
                activeTab === 'unmatched'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-50'
              ]"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>Needs Review ({{ unmatchedRows.length.toLocaleString() }})</span>
            </button>

            <button
              v-if="dateErrorRows.length > 0"
              type="button"
              @click="activeTab = 'date_errors'"
              :class="[
                'px-3 py-1.5 rounded-xl transition font-bold cursor-pointer flex items-center gap-1.5',
                activeTab === 'date_errors'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50'
              ]"
            >
              <Calendar class="w-3.5 h-3.5" />
              <span>Date Attention ({{ dateErrorRows.length }})</span>
            </button>
          </div>

          <!-- Live Search & Density -->
          <div class="flex items-center gap-2">
            <div class="relative">
              <Search class="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search transactions..."
                class="pl-8 pr-3 py-1.5 rounded-xl text-xs font-mono bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-44 sm:w-60"
              />
            </div>

            <!-- Page Size -->
            <select
              v-model="pageSize"
              class="px-2 py-1.5 rounded-xl text-xs font-mono bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-hidden"
            >
              <option :value="25">25 / page</option>
              <option :value="50">50 / page</option>
              <option :value="100">100 / page</option>
              <option :value="999999">Show All</option>
            </select>
          </div>

        </div>

        <!-- ═══ UNIFIED PEELER DATA GRID ═══════════════════════ -->
        <div class="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
          
          <div class="overflow-x-auto max-h-[620px] overflow-y-auto">
            <table class="w-full text-left text-xs font-mono border-collapse">
              
              <!-- Sticky Table Header -->
              <thead class="sticky top-0 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-xs border-b border-stone-200 dark:border-stone-800 z-10">
                <tr>
                  <th class="px-3 py-3 w-12 text-stone-400 text-center font-bold">#</th>
                  
                  <th
                    v-for="header in displayHeaders"
                    :key="header"
                    class="px-3.5 py-3 whitespace-nowrap text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider text-[11px]"
                  >
                    <div class="flex items-center gap-1.5">
                      <span>{{ header }}</span>
                      <span v-if="activeRemarkColumns.includes(header)" class="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                        Rule Output
                      </span>
                      <span v-else-if="dateHeaders.includes(header)" class="px-1.5 py-0.5 rounded text-[9px] bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300">
                        Date
                      </span>
                    </div>
                  </th>

                  <th class="px-3 py-3 w-16 text-center text-stone-400 text-[11px] font-bold">Action</th>
                </tr>
              </thead>

              <!-- Table Body -->
              <tbody class="divide-y divide-stone-100 dark:divide-stone-800/80">
                <tr
                  v-for="(row, idx) in paginatedRows"
                  :key="idx"
                  @click="openInspector(row, (currentPage - 1) * pageSize + idx)"
                  class="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition cursor-pointer group"
                >
                  <!-- Row Number -->
                  <td class="px-3 py-2.5 text-stone-400 text-center text-[11px] select-none tabular-nums">
                    {{ (currentPage - 1) * pageSize + idx + 1 }}
                  </td>

                  <!-- Data Cells -->
                  <td
                    v-for="header in displayHeaders"
                    :key="header"
                    class="px-3.5 py-2.5 whitespace-nowrap max-w-xs truncate"
                  >
                    <!-- Null / Empty -->
                    <span v-if="row[header] === null || row[header] === undefined || row[header] === ''" class="text-stone-300 dark:text-stone-600 italic">
                      —
                    </span>

                    <!-- Numeric Float Amount -->
                    <span v-else-if="typeof row[header] === 'number'" class="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums inline-flex items-center gap-1">
                      <span>{{ row[header].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500/60" title="True Mathematical Float"></span>
                    </span>

                    <!-- Remark Columns -->
                    <span
                      v-else-if="activeRemarkColumns.includes(header)"
                      :class="[
                        'px-2 py-0.5 rounded-md text-[11px] font-sans font-medium inline-block',
                        row[header] === 'no rule given'
                          ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 italic'
                          : 'text-stone-900 dark:text-stone-100 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 font-bold'
                      ]"
                    >
                      {{ row[header] }}
                    </span>

                    <!-- Date with Error -->
                    <span
                      v-else-if="row._dateErrors && row._dateErrors[header]"
                      class="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded text-[11px] border border-rose-200"
                      :title="row._dateErrors[header]"
                    >
                      ⚠️ {{ row[header] }}
                    </span>

                    <!-- Normal Text -->
                    <span v-else class="text-stone-700 dark:text-stone-200">
                      {{ row[header] }}
                    </span>
                  </td>

                  <!-- Row Inspect Button -->
                  <td class="px-3 py-2.5 text-center" @click.stop="openInspector(row, (currentPage - 1) * pageSize + idx)">
                    <button
                      type="button"
                      class="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 group-hover:text-amber-600 transition cursor-pointer"
                      title="Inspect raw vs cleaned values"
                    >
                      <Eye class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                <!-- Empty State within Filter -->
                <tr v-if="paginatedRows.length === 0">
                  <td :colspan="displayHeaders.length + 2" class="p-10 text-center text-stone-400 text-xs">
                    No transactions match the selected filter or search query.
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

          <!-- Table Pagination Footer -->
          <div class="px-5 py-3 bg-stone-50/80 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-mono text-stone-500">
            <div>
              Showing
              <strong class="text-stone-800 dark:text-stone-200">
                {{ paginatedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }}
              </strong>
              to
              <strong class="text-stone-800 dark:text-stone-200">
                {{ Math.min(currentPage * pageSize, filteredRows.length) }}
              </strong>
              of
              <strong class="text-stone-800 dark:text-stone-200">
                {{ filteredRows.length.toLocaleString() }}
              </strong>
              transactions
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft class="w-3 h-3" />
                <span>Prev</span>
              </button>
              <span class="px-2">
                Page {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                type="button"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight class="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- ════════════════════════════════════════════════════════ -->
    <!-- SLIDE-OVER PEEL INSPECTOR DRAWER                         -->
    <!-- ════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="isInspectorOpen && selectedRow"
        class="fixed inset-0 z-50 overflow-hidden flex justify-end"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          @click="closeInspector"
        />

        <!-- Slide Drawer -->
        <div class="relative w-full max-w-xl bg-white dark:bg-stone-900 shadow-2xl flex flex-col z-10 border-l border-stone-200 dark:border-stone-800 overflow-hidden font-sans">
          
          <!-- Drawer Header -->
          <div class="px-6 py-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🐒</span>
              <div>
                <h3 class="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                  Transaction #{{ (selectedRowIndex !== null ? selectedRowIndex + 1 : 1) }} Inspector
                </h3>
                <p class="text-[11px] text-stone-500 font-mono">
                  Raw Input vs Standardized Cleaned Output
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="closeInspector"
              class="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Drawer Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            
            <!-- Quick Rule Creator Callout -->
            <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h4 class="font-bold text-amber-950 dark:text-amber-200 text-xs font-mono">
                  ⚡ Want to categorize similar rows?
                </h4>
                <p class="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Turn this transaction description into a rule in 1 click.
                </p>
              </div>
              <button
                type="button"
                @click="handleCreateRule"
                class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs font-mono transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <PlusCircle class="w-3.5 h-3.5" />
                <span>+ Create Rule</span>
              </button>
            </div>

            <!-- Field-by-field Comparison -->
            <div class="space-y-3">
              <h4 class="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                Column Transformations
              </h4>

              <div class="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                <div
                  v-for="header in displayHeaders"
                  :key="header"
                  class="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div class="sm:w-1/3">
                    <span class="font-bold text-stone-800 dark:text-stone-200 block text-xs font-mono">
                      {{ header }}
                    </span>
                    <span class="text-[10px] text-stone-400 font-mono">
                      {{ activeRemarkColumns.includes(header) ? 'Output Column' : (dataStore.columnTypes ? dataStore.columnTypes[header] : 'Text') }}
                    </span>
                  </div>

                  <div class="sm:w-2/3 flex items-center justify-between gap-3 text-xs font-mono">
                    <!-- Raw -->
                    <div class="flex-1 text-stone-400 text-[11px] truncate" :title="String(selectedRowRaw?.[header] ?? '—')">
                      <span class="text-[9px] uppercase tracking-wider block text-stone-400 font-sans">Raw:</span>
                      <span>{{ selectedRowRaw?.[header] !== undefined && selectedRowRaw?.[header] !== '' ? selectedRowRaw[header] : '[EMPTY]' }}</span>
                    </div>

                    <ArrowRight class="w-3.5 h-3.5 text-stone-300 shrink-0" />

                    <!-- Sanitized -->
                    <div class="flex-1 font-bold text-stone-900 dark:text-stone-100 truncate" :title="String(selectedRow[header] ?? '—')">
                      <span class="text-[9px] uppercase tracking-wider block text-emerald-700 dark:text-emerald-400 font-sans">Sanitized:</span>
                      <span v-if="selectedRow[header] === null" class="text-stone-400 italic">null</span>
                      <span v-else-if="typeof selectedRow[header] === 'number'" class="text-emerald-600 dark:text-emerald-400">
                        {{ selectedRow[header].toFixed(2) }}
                      </span>
                      <span v-else>{{ selectedRow[header] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Drawer Footer -->
          <div class="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end">
            <button
              type="button"
              @click="closeInspector"
              class="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs font-semibold hover:bg-stone-300 transition cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- ════════════════════════════════════════════════════════ -->
    <!-- IMPORT MAPPING MODAL                                    -->
    <!-- ════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="isMappingModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans"
      >
        <div class="absolute inset-0 bg-stone-950/70 backdrop-blur-xs" @click="cancelImport" />

        <div class="relative bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-stone-200 dark:border-stone-800 overflow-hidden">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-stone-200 dark:border-stone-800 shrink-0 flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-mono">
                Import Column Calibration
              </h2>
              <p class="text-xs text-stone-500 mt-0.5">
                Select your table header row and calibrate explicit data types.
              </p>
            </div>
            <button
              type="button"
              @click="cancelImport"
              class="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body (scrollable) -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs font-mono">
            
            <!-- Section 1: Header Row Selector -->
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <h3 class="font-bold text-stone-800 dark:text-stone-200">
                  Select Header Row
                </h3>
              </div>
              <p class="text-[11px] text-stone-400 mb-3 ml-7">
                Click the row containing your column titles. Rows prior to this will be skipped.
              </p>

              <div class="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 sticky top-0">
                    <tr>
                      <th class="px-3 py-2 w-16 text-stone-400 uppercase text-[10px]">Row</th>
                      <th class="px-3 py-2 text-stone-400 uppercase text-[10px]">Preview Data</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
                    <tr
                      v-for="(row, index) in rawGrid.slice(0, 10)"
                      :key="index"
                      @click="selectHeaderRow(index)"
                      :class="[
                        'transition cursor-pointer',
                        selectedHeaderIndex === index
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-bold'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                      ]"
                    >
                      <td class="px-3 py-2 text-center text-[11px]">
                        <span v-if="selectedHeaderIndex === index" class="text-amber-600 mr-1">▶</span>
                        {{ index + 1 }}
                      </td>
                      <td class="px-3 py-2 truncate max-w-xl text-[11px]">
                        {{ row.filter(c => c !== '').join('  |  ') || '[Empty Row]' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section 2: Assign Data Types -->
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <h3 class="font-bold text-stone-800 dark:text-stone-200">
                  Calibrate Column Data Types
                </h3>
              </div>
              <p class="text-[11px] text-stone-400 mb-3 ml-7">
                SheetMonkey pre-guessed types. Adjust any column to guarantee financial precision.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="(header, colIdx) in (rawGrid[selectedHeaderIndex] || [])"
                  :key="colIdx"
                  class="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 space-y-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[160px]" :title="String(header)">
                      {{ header || `Col ${colIdx + 1}` }}
                    </span>
                    <span class="text-[10px] text-stone-400">#{{ colIdx + 1 }}</span>
                  </div>

                  <select
                    v-model="columnTypes[colIdx]"
                    class="w-full px-2.5 py-1 rounded-lg text-xs font-mono bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden"
                  >
                    <option v-for="t in standardDataTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3 font-mono text-xs">
            <button
              type="button"
              @click="cancelImport"
              class="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmImport"
              class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              Confirm Calibration
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </main>
</template>