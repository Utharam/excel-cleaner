<script setup>
import { ref, reactive, computed } from 'vue'
import { useRulesStore } from '../stores/useRulesStore'
import { useDataStore } from '../stores/useDataStore'

const rulesStore = useRulesStore()
const dataStore = useDataStore()

// ─── Local UI State ───────────────────────────────────────
const isFormOpen = ref(false)
const editingRuleId = ref(null)

// Drag-and-drop reordering state
const draggedRuleIndex = ref(null)
const dragOverIndex = ref(null)

// Import file input ref
const importFileInput = ref(null)

const defaultFormState = () => ({
  name: '',
  matchField: 'Particulars',
  matchType: 'Contains',
  matchValue: '',
  outputColumn: 'Remark 1',
  outputValue: '',
})

const ruleForm = reactive(defaultFormState())

// ─── Dropdown Options ────────────────────────────────────
const matchFieldOptions = computed(() => {
  const headers = dataStore.headers.length > 0 ? dataStore.headers : ['Particulars']
  if (ruleForm.matchField && !headers.includes(ruleForm.matchField)) {
    return [ruleForm.matchField, ...headers]
  }
  return headers
})

const matchTypeOptions = ['Contains', 'Equals', 'Starts with', 'Ends with', 'Regex']
const outputColumnOptions = ['Remark 1', 'Remark 2']

// ─── Computed ─────────────────────────────────────────────
const formTitle = computed(() => editingRuleId.value ? 'Edit Rule' : 'New Rule')

// Filter rules to only show those belonging to the active profile.
// Also includes 'Global' rules (they run across all profiles, so they
// should be visible and manageable from any profile view).
// Backward compat: rules with undefined profile are treated as 'Default'.
const visibleRules = computed(() => {
  return rulesStore.rules.filter(rule => {
    if (rule.profile === rulesStore.activeProfile) return true
    if (rule.profile === undefined && rulesStore.activeProfile === 'Default') return true
    if (rule.profile === 'Global') return true
    return false
  })
})

// ─── Profile Actions ─────────────────────────────────────
const handleAddProfile = () => {
  const name = prompt('New Profile Name')
  if (name && name.trim()) {
    rulesStore.addProfile(name.trim(), true)
  }
}

// ─── Form Actions ─────────────────────────────────────────
const resetForm = () => {
  Object.assign(ruleForm, defaultFormState())
  editingRuleId.value = null
}

const openForm = () => {
  resetForm()
  isFormOpen.value = true
}

const closeForm = () => {
  resetForm()
  isFormOpen.value = false
}

const saveRule = () => {
  if (!ruleForm.name.trim()) {
    alert('Rule name is required.')
    return
  }
  if (!ruleForm.matchValue.trim()) {
    alert('Match value is required.')
    return
  }

  const payload = {
    name: ruleForm.name.trim(),
    matchField: ruleForm.matchField,
    matchType: ruleForm.matchType,
    matchValue: ruleForm.matchValue.trim(),
    outputColumn: ruleForm.outputColumn,
    outputValue: ruleForm.outputValue.trim(),
  }

  if (editingRuleId.value) {
    rulesStore.updateRule(editingRuleId.value, payload)
  } else {
    rulesStore.addRule(payload)
  }

  closeForm()
}

const editRule = (rule) => {
  editingRuleId.value = rule.id
  Object.assign(ruleForm, {
    name: rule.name,
    matchField: rule.matchField,
    matchType: rule.matchType,
    matchValue: rule.matchValue,
    outputColumn: rule.outputColumn,
    outputValue: rule.outputValue,
  })
  isFormOpen.value = true
}

const deleteRule = (id) => {
  if (confirm('Delete this rule? This cannot be undone.')) {
    rulesStore.deleteRule(id)
  }
}

// ─── Summary Badge Builder ───────────────────────────────
const getRuleSummary = (rule) => {
  return `[${rule.matchField}] ${rule.matchType} "${rule.matchValue}"`
}

// ─── Drag-and-Drop Reordering ────────────────────────────
// NOTE: draggedRuleIndex and dragOverIndex hold VISUAL indices
// (i.e., indices within the visibleRules filtered array).
// On drop, we map these back to actual indices in rulesStore.rules
// using rule IDs, so reordering a filtered subset doesn't scramble
// the main array.
const handleDragStart = (index, event) => {
  draggedRuleIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(index))
}

const handleDragEnter = (index) => {
  dragOverIndex.value = index
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const handleDrop = (index, event) => {
  event.preventDefault()

  if (draggedRuleIndex.value === null || draggedRuleIndex.value === index) {
    draggedRuleIndex.value = null
    dragOverIndex.value = null
    return
  }

  // Map visual indices to rule IDs, then to actual indices in the full array
  const draggedRuleId = visibleRules.value[draggedRuleIndex.value]?.id
  const targetRuleId = visibleRules.value[index]?.id

  if (!draggedRuleId || !targetRuleId) {
    draggedRuleIndex.value = null
    dragOverIndex.value = null
    return
  }

  const actualDraggedIndex = rulesStore.rules.findIndex(r => r.id === draggedRuleId)
  const actualTargetIndex = rulesStore.rules.findIndex(r => r.id === targetRuleId)

  if (actualDraggedIndex === -1 || actualTargetIndex === -1) {
    draggedRuleIndex.value = null
    dragOverIndex.value = null
    return
  }

  // Reorder the actual rules array using the mapped indices
  const newRules = [...rulesStore.rules]
  const [movedRule] = newRules.splice(actualDraggedIndex, 1)
  newRules.splice(actualTargetIndex, 0, movedRule)

  rulesStore.setRules(newRules)

  draggedRuleIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggedRuleIndex.value = null
  dragOverIndex.value = null
}

// ─── Export Rules to JSON ────────────────────────────────
const handleExportRules = () => {
  if (rulesStore.rules.length === 0) {
    alert('No rules to export.')
    return
  }

  const json = JSON.stringify(rulesStore.rules, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const fileName = `excel-cleanup-rules-${year}-${month}-${day}.json`

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// ─── Import Rules from JSON ─────────────────────────────
const handleImportClick = () => {
  importFileInput.value?.click()
}

const handleImportFile = (event) => {
  const file = event.target.files[0]
  event.target.value = ''

  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)

      if (!Array.isArray(parsed)) {
        alert('Invalid file: The JSON must be an array of rule objects.')
        return
      }

      if (parsed.length === 0) {
        alert('The imported file contains no rules.')
        return
      }

      const addedCount = rulesStore.importRules(parsed)
      alert(`Successfully imported ${addedCount} rule${addedCount === 1 ? '' : 's'}.`)
    } catch (err) {
      console.error('[Import Error]', err)
      alert('Failed to parse the file. Please ensure it is a valid JSON file exported from this app.')
    }
  }

  reader.onerror = () => {
    alert('Failed to read the file from disk.')
  }

  reader.readAsText(file)
}
</script>

<template>
  <aside
    class="w-80 shrink-0 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700
           flex flex-col"
  >
    <!-- ─── Sidebar Header ────────────────────────────────── -->
    <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
      <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Rules Manager
      </h2>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
        {{ visibleRules.length }} rule{{ visibleRules.length === 1 ? '' : 's' }} in this profile • Drag to reorder
      </p>
    </div>

    <!-- ─── Profile Selector ─────────────────────────────── -->
    <div class="px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
      <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        Active Profile
      </label>
      <div class="flex gap-2">
        <select
          v-model="rulesStore.activeProfile"
          class="flex-1 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option v-for="profile in rulesStore.profiles" :key="profile" :value="profile">
            {{ profile }}
          </option>
        </select>
        <button
          @click="handleAddProfile"
          class="shrink-0 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                 text-slate-600 dark:text-slate-300 text-sm font-medium
                 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center"
          title="Create new profile"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ─── Content Area (scrollable) ─────────────────────── -->
    <div class="flex-1 overflow-y-auto">

      <!-- ═══════════════════════════════════════════════════ -->
      <!-- FORM MODE                                             -->
      <!-- ═══════════════════════════════════════════════════ -->
      <div v-if="isFormOpen" class="p-5 space-y-4">

        <!-- Form Title -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {{ formTitle }}
          </h3>
          <button
            @click="closeForm"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Rule Name -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Rule Name
          </label>
          <input
            v-model="ruleForm.name"
            type="text"
            placeholder="e.g., Uber Rides Remark"
            class="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                   placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <!-- Match Field -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Match Field
          </label>
          <select
            v-model="ruleForm.matchField"
            class="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option v-for="field in matchFieldOptions" :key="field" :value="field">
              {{ field }}
            </option>
          </select>
          <p v-if="dataStore.headers.length === 0" class="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Upload a file to populate fields dynamically
          </p>
        </div>

        <!-- Match Type -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Match Type
          </label>
          <select
            v-model="ruleForm.matchType"
            class="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option v-for="type in matchTypeOptions" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <!-- Match Value -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Match Value
          </label>
          <input
            v-model="ruleForm.matchValue"
            type="text"
            :placeholder="ruleForm.matchType === 'Regex' ? 'e.g., ^UBER\\d+' : 'e.g., UBER'"
            class="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                   placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
          />
        </div>

        <!-- Output Column -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Output Column
          </label>
          <select
            v-model="ruleForm.outputColumn"
            class="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option v-for="col in outputColumnOptions" :key="col" :value="col">
              {{ col }}
            </option>
          </select>
        </div>

        <!-- Output Value -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Output Value
          </label>
          <input
            v-model="ruleForm.outputValue"
            type="text"
            placeholder="e.g., Travel Expense - Ride"
            class="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                   placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <!-- Form Actions -->
        <div class="flex gap-2 pt-2">
          <button
            @click="saveRule"
            class="flex-1 px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium
                   hover:bg-brand-700 transition"
          >
            Save Rule
          </button>
          <button
            @click="closeForm"
            class="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-600
                   text-slate-600 dark:text-slate-300 text-sm font-medium
                   hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════ -->
      <!-- LIST MODE                                             -->
      <!-- ═══════════════════════════════════════════════════ -->
      <div v-else class="p-5">

        <!-- Empty State -->
        <div
          v-if="visibleRules.length === 0"
          class="text-center text-sm text-slate-400 dark:text-slate-500 py-10"
        >
          <svg class="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="font-medium">No rules in this profile.</p>
          <p class="mt-1 text-xs">Click "Add Rule" to create a cleanup rule for this profile.</p>
        </div>

        <!-- Rule Cards -->
        <div v-else class="space-y-3">

          <div
            v-for="(rule, index) in visibleRules"
            :key="rule.id"
            draggable="true"
            @dragstart="handleDragStart(index, $event)"
            @dragenter.prevent="handleDragEnter(index)"
            @dragover.prevent="handleDragOver"
            @drop.prevent="handleDrop(index, $event)"
            @dragend="handleDragEnd"
            :class="[
              'bg-slate-50 dark:bg-slate-700/40 rounded-lg border p-3.5 group transition cursor-move',
              dragOverIndex === index && draggedRuleIndex !== null && draggedRuleIndex !== index
                ? 'border-brand-500 ring-2 ring-brand-200 dark:ring-brand-500/30 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-500',
              draggedRuleIndex === index ? 'opacity-50' : ''
            ]"
          >
            <!-- Top Row: Drag Handle + Name + Actions -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-start gap-2 flex-1 min-w-0">
                <!-- Drag Handle (six dots) -->
                <div class="shrink-0 pt-0.5 text-slate-300 dark:text-slate-500 group-hover:text-slate-400 dark:group-hover:text-slate-300 transition">
                  <svg class="w-3.5 h-4" fill="currentColor" viewBox="0 0 6 12">
                    <circle cx="1" cy="1.5" r="1" />
                    <circle cx="5" cy="1.5" r="1" />
                    <circle cx="1" cy="6" r="1" />
                    <circle cx="5" cy="6" r="1" />
                    <circle cx="1" cy="10.5" r="1" />
                    <circle cx="5" cy="10.5" r="1" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight flex-1 min-w-0 truncate">
                  {{ rule.name }}
                </h3>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <!-- Edit Button -->
                <button
                  @click="editRule(rule)"
                  class="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition"
                  title="Edit rule"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828M11.828 15H9m0 0V12.172l6-6m-6 6l6-6" />
                  </svg>
                </button>
                <!-- Delete Button -->
                <button
                  @click="deleteRule(rule.id)"
                  class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Delete rule"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Summary Badge -->
            <div class="mb-2 ml-5.5">
              <span class="inline-block text-xs font-mono bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded px-2 py-0.5">
                {{ getRuleSummary(rule) }}
              </span>
            </div>

            <!-- Output -->
            <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-5.5">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span class="font-medium">{{ rule.outputColumn }}:</span>
              <span class="truncate">{{ rule.outputValue || '(empty)' }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ─── Footer (only in list mode) ─────────────────────── -->
    <div
      v-if="!isFormOpen"
      class="px-5 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0"
    >
      <!-- Action Buttons Row -->
      <div class="flex gap-2 mb-2">
        <button
          @click="openForm"
          class="flex-1 px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium
                 hover:bg-brand-700 transition flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Rule
        </button>
        <button
          @click="handleExportRules"
          :disabled="rulesStore.rules.length === 0"
          class="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                 text-slate-600 dark:text-slate-300 text-sm font-medium
                 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Export rules to JSON file"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button
          @click="handleImportClick"
          class="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600
                 text-slate-600 dark:text-slate-300 text-sm font-medium
                 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          title="Import rules from JSON file"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" transform="rotate(180 12 12)" />
          </svg>
        </button>
      </div>

      <!-- Hidden file input for import -->
      <input
        ref="importFileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleImportFile"
      />

      <!-- Helper text -->
      <p class="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
        Export to back up • Import to restore or share
      </p>
    </div>
  </aside>
</template>