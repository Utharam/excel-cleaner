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
  conditionGate: 'AND',
  conditions: [
    { field: dataStore.headers.length > 0 ? dataStore.headers[0] : 'Particulars', operator: 'Contains', value: '' }
  ],
  outputs: [
    { column: 'Remark 1', value: '' }
  ],
})

const ruleForm = reactive(defaultFormState())

// ─── Dropdown Options ────────────────────────────────────
const matchFieldOptions = computed(() => {
  const headers = dataStore.headers.length > 0 ? dataStore.headers : ['Particulars']
  return headers
})

const operatorOptions = [
  { value: 'Contains', label: 'Contains (text)' },
  { value: 'Does not contain', label: 'Does not contain (text)' },
  { value: 'Equals', label: 'Equals (exact text)' },
  { value: 'Starts with', label: 'Starts with' },
  { value: 'Ends with', label: 'Ends with' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '>=', label: 'Greater or equal (>=)' },
  { value: '<=', label: 'Less or equal (<=)' },
  { value: '==', label: 'Numeric equals (==)' },
  { value: 'Regex', label: 'Regex pattern' },
]

const outputColumnOptions = ['Remark 1', 'Remark 2', 'Remark 3', 'Remark 4', 'Category', 'Sub-Category', 'Status']

// ─── Computed ─────────────────────────────────────────────
const formTitle = computed(() => editingRuleId.value ? 'Edit Rule' : 'New Rule')

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

const addCondition = () => {
  const defaultField = dataStore.headers.length > 0 ? dataStore.headers[0] : 'Particulars'
  ruleForm.conditions.push({ field: defaultField, operator: 'Contains', value: '' })
}

const removeCondition = (index) => {
  if (ruleForm.conditions.length > 1) {
    ruleForm.conditions.splice(index, 1)
  }
}

const addOutput = () => {
  const nextNum = ruleForm.outputs.length + 1
  ruleForm.outputs.push({ column: `Remark ${nextNum}`, value: '' })
}

const removeOutput = (index) => {
  if (ruleForm.outputs.length > 1) {
    ruleForm.outputs.splice(index, 1)
  }
}

const saveRule = () => {
  if (!ruleForm.name.trim()) {
    alert('Rule name is required.')
    return
  }

  const validConditions = ruleForm.conditions.filter(c => c.value && String(c.value).trim())
  if (validConditions.length === 0) {
    alert('At least one condition with a match value is required.')
    return
  }

  const validOutputs = ruleForm.outputs.filter(o => o.value && String(o.value).trim())
  if (validOutputs.length === 0) {
    alert('At least one output remark is required.')
    return
  }

  const payload = {
    name: ruleForm.name.trim(),
    conditionGate: ruleForm.conditionGate || 'AND',
    conditions: validConditions.map(c => ({
      field: c.field,
      operator: c.operator,
      value: String(c.value).trim(),
    })),
    outputs: validOutputs.map(o => ({
      column: o.column ? o.column.trim() : 'Remark 1',
      value: String(o.value).trim(),
    })),
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
  const conditions = Array.isArray(rule.conditions) && rule.conditions.length > 0
    ? rule.conditions.map(c => ({ ...c }))
    : [{ field: rule.matchField || 'Particulars', operator: rule.matchType || 'Contains', value: rule.matchValue || '' }]

  const outputs = Array.isArray(rule.outputs) && rule.outputs.length > 0
    ? rule.outputs.map(o => ({ ...o }))
    : [{ column: rule.outputColumn || 'Remark 1', value: rule.outputValue || '' }]

  Object.assign(ruleForm, {
    name: rule.name,
    conditionGate: rule.conditionGate || 'AND',
    conditions,
    outputs,
  })
  isFormOpen.value = true
}

const deleteRule = (id) => {
  if (confirm('Delete this rule? This cannot be undone.')) {
    rulesStore.deleteRule(id)
  }
}

// ─── Helpers for Display ──────────────────────────────────
const getRuleConditions = (rule) => {
  if (Array.isArray(rule.conditions) && rule.conditions.length > 0) {
    return rule.conditions
  }
  return [{ field: rule.matchField || 'Particulars', operator: rule.matchType || 'Contains', value: rule.matchValue || '' }]
}

const getRuleOutputs = (rule) => {
  if (Array.isArray(rule.outputs) && rule.outputs.length > 0) {
    return rule.outputs
  }
  return [{ column: rule.outputColumn || 'Remark 1', value: rule.outputValue || '' }]
}

// ─── Drag-and-Drop Reordering ────────────────────────────
const handleDragStart = (visualIndex, event) => {
  draggedRuleIndex.value = visualIndex
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragEnter = (visualIndex) => {
  dragOverIndex.value = visualIndex
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const handleDrop = (targetVisualIndex) => {
  const fromVisual = draggedRuleIndex.value
  const toVisual = targetVisualIndex

  if (fromVisual === null || fromVisual === toVisual) {
    draggedRuleIndex.value = null
    dragOverIndex.value = null
    return
  }

  const fromRule = visibleRules.value[fromVisual]
  const toRule = visibleRules.value[toVisual]

  if (!fromRule || !toRule) {
    draggedRuleIndex.value = null
    dragOverIndex.value = null
    return
  }

  const masterList = [...rulesStore.rules]
  const fromMasterIndex = masterList.findIndex(r => r.id === fromRule.id)
  const toMasterIndex = masterList.findIndex(r => r.id === toRule.id)

  if (fromMasterIndex !== -1 && toMasterIndex !== -1) {
    const [moved] = masterList.splice(fromMasterIndex, 1)
    masterList.splice(toMasterIndex, 0, moved)
    rulesStore.setRules(masterList)
  }

  draggedRuleIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggedRuleIndex.value = null
  dragOverIndex.value = null
}

// ─── Export / Import Rules ─────────────────────────────────
const handleExportRules = () => {
  const profileRules = visibleRules.value
  if (profileRules.length === 0) {
    alert('No rules in this profile to export.')
    return
  }

  const jsonString = JSON.stringify(profileRules, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const activeName = rulesStore.activeProfile.toLowerCase().replace(/\s+/g, '-')
  const today = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `rules-${activeName}-${today}.json`
  a.click()

  URL.revokeObjectURL(url)
}

const triggerImportFile = () => {
  importFileInput.value?.click()
}

const handleImportRules = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)
      if (!Array.isArray(parsed)) {
        alert('Invalid rules file. Expected a JSON array of rules.')
        return
      }

      const count = rulesStore.importRules(parsed)
      alert(`Successfully imported ${count} rule${count === 1 ? '' : 's'}.`)
    } catch (err) {
      console.error('[Import Rules Error]', err)
      alert('Failed to parse rules file. Please ensure it is valid JSON.')
    }
  }

  reader.readAsText(file)
  event.target.value = ''
}

const prefillFromRow = ({ field, value, amountField, amountValue }) => {
  resetForm()
  const cleanVal = String(value || '').trim()
  ruleForm.name = `Rule: ${cleanVal.slice(0, 25)}`
  ruleForm.conditions = [
    { field: field || 'Particulars', operator: 'Contains', value: cleanVal }
  ]
  if (amountField && amountValue !== null && amountValue !== undefined && amountValue !== '') {
    ruleForm.conditions.push({
      field: amountField,
      operator: '>',
      value: String(amountValue).trim()
    })
  }
  isFormOpen.value = true
}

defineExpose({
  openForm,
  prefillFromRow,
})
</script>

<template>
  <aside
    class="w-96 shrink-0 border-l border-stone-200 dark:border-stone-800
           bg-white dark:bg-stone-900 flex flex-col h-full overflow-hidden shadow-xs font-sans"
  >
    <!-- ─── Header ────────────────────────────────────────── -->
    <div class="p-5 border-b border-stone-200 dark:border-stone-800 shrink-0">
      <h2 class="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-mono">
        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Multi-Condition Rules
      </h2>
      <p class="text-xs text-stone-400 dark:text-stone-500 mt-1 font-mono">
        {{ visibleRules.length }} rule{{ visibleRules.length === 1 ? '' : 's' }} in profile • First match wins
      </p>
    </div>

    <!-- ─── Profile Selector ─────────────────────────────── -->
    <div class="px-5 py-3 border-b border-stone-200 dark:border-stone-800 shrink-0 bg-stone-50/60 dark:bg-stone-900/60">
      <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5 font-mono">
        Active Profile
      </label>
      <div class="flex gap-2">
        <select
          v-model="rulesStore.activeProfile"
          class="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700
                 bg-white dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200
                 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
        >
          <option v-for="profile in rulesStore.profiles" :key="profile" :value="profile">
            {{ profile }}
          </option>
        </select>
        <button
          @click="handleAddProfile"
          class="shrink-0 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700
                 text-stone-600 dark:text-stone-300 text-xs font-bold font-mono
                 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          title="Create new profile"
        >
          + New
        </button>
      </div>
    </div>

    <!-- ─── Content Area (scrollable) ─────────────────────── -->
    <div class="flex-1 overflow-y-auto">

      <!-- ═══════════════════════════════════════════════════ -->
      <!-- FORM MODE (Rule Builder)                               -->
      <!-- ═══════════════════════════════════════════════════ -->
      <div v-if="isFormOpen" class="p-5 space-y-4">

        <!-- Form Header -->
        <div class="flex items-center justify-between border-b pb-2 border-stone-100 dark:border-stone-800">
          <h3 class="text-sm font-bold text-stone-800 dark:text-stone-100 font-mono">
            {{ formTitle }}
          </h3>
          <button
            @click="closeForm"
            class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition p-1 rounded cursor-pointer"
            title="Cancel"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Rule Name -->
        <div>
          <label class="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1 font-mono">
            Rule Name
          </label>
          <input
            v-model="ruleForm.name"
            type="text"
            placeholder="e.g., Etihad Passenger Alex"
            class="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700
                   bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-100
                   focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
          />
        </div>

        <!-- Logic Gate (AND vs OR) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-stone-600 dark:text-stone-400 font-mono">
              Conditions Logic
            </label>
            <span class="text-[10px] text-stone-400 font-mono">
              {{ ruleForm.conditions.length }} condition{{ ruleForm.conditions.length === 1 ? '' : 's' }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-xl font-mono text-xs">
            <button
              type="button"
              @click="ruleForm.conditionGate = 'AND'"
              :class="[
                'px-2 py-1 text-xs font-bold rounded-lg transition text-center cursor-pointer',
                ruleForm.conditionGate === 'AND'
                  ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              ]"
            >
              ALL match (AND)
            </button>
            <button
              type="button"
              @click="ruleForm.conditionGate = 'OR'"
              :class="[
                'px-2 py-1 text-xs font-bold rounded-lg transition text-center cursor-pointer',
                ruleForm.conditionGate === 'OR'
                  ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              ]"
            >
              ANY matches (OR)
            </button>
          </div>
        </div>

        <!-- Conditions Rows -->
        <div class="space-y-2.5">
          <div
            v-for="(cond, index) in ruleForm.conditions"
            :key="index"
            class="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-2 relative font-mono"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Condition #{{ index + 1 }}
              </span>
              <button
                v-if="ruleForm.conditions.length > 1"
                type="button"
                @click="removeCondition(index)"
                class="text-rose-500 hover:text-rose-700 text-xs font-bold transition cursor-pointer"
                title="Remove condition"
              >
                ✕ Remove
              </button>
            </div>

            <!-- Field + Operator -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] text-stone-400 mb-0.5">Field</label>
                <select
                  v-model="cond.field"
                  class="w-full px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700
                         bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200"
                >
                  <option v-for="f in matchFieldOptions" :key="f" :value="f">{{ f }}</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] text-stone-400 mb-0.5">Operator</label>
                <select
                  v-model="cond.operator"
                  class="w-full px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700
                         bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200"
                >
                  <option v-for="op in operatorOptions" :key="op.value" :value="op.value">
                    {{ op.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Value -->
            <div>
              <label class="block text-[10px] text-stone-400 mb-0.5">Match Value</label>
              <input
                v-model="cond.value"
                type="text"
                placeholder="e.g. Etihad, or 100"
                class="w-full px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700
                       bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            @click="addCondition"
            class="w-full py-1.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-50/50 transition flex items-center justify-center gap-1 cursor-pointer font-mono"
          >
            + Add Another Condition ({{ ruleForm.conditionGate }})
          </button>
        </div>

        <!-- Outputs ("Going Sideways") -->
        <div class="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-stone-600 dark:text-stone-400 font-mono">
              Output Remarks (Sideways)
            </label>
            <span class="text-[10px] text-stone-400 font-mono">
              Populate columns
            </span>
          </div>

          <div
            v-for="(out, index) in ruleForm.outputs"
            :key="index"
            class="p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-800/60 bg-amber-50/30 dark:bg-stone-800/40 space-y-2 font-mono"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                Output Column #{{ index + 1 }}
              </span>
              <button
                v-if="ruleForm.outputs.length > 1"
                type="button"
                @click="removeOutput(index)"
                class="text-rose-500 hover:text-rose-700 text-xs font-bold transition cursor-pointer"
              >
                ✕ Remove
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] text-stone-400 mb-0.5">Column</label>
                <input
                  v-model="out.column"
                  type="text"
                  placeholder="e.g., Remark 1"
                  list="output-columns-list"
                  class="w-full px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700
                         bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 font-bold"
                />
                <datalist id="output-columns-list">
                  <option v-for="c in outputColumnOptions" :key="c" :value="c" />
                </datalist>
              </div>

              <div>
                <label class="block text-[10px] text-stone-400 mb-0.5">Value</label>
                <input
                  v-model="out.value"
                  type="text"
                  placeholder="e.g., Traveling Expense"
                  class="w-full px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700
                         bg-white dark:bg-stone-800 text-xs text-stone-800 dark:text-stone-200"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="addOutput"
            class="w-full py-1.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition flex items-center justify-center gap-1 cursor-pointer font-mono"
          >
            + Add Another Output Remark
          </button>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-2 pt-2">
          <button
            type="button"
            @click="saveRule"
            class="flex-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black
                   transition shadow-xs cursor-pointer font-mono"
          >
            Save Rule
          </button>
          <button
            type="button"
            @click="closeForm"
            class="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700
                   text-stone-600 dark:text-stone-300 text-xs font-medium font-mono
                   hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
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
          class="text-center text-sm text-stone-400 dark:text-stone-500 py-10 font-mono"
        >
          <p class="font-medium">No rules in this profile.</p>
          <p class="mt-1 text-xs">Click "Add Rule" or inspect a row to create one.</p>
        </div>

        <!-- Rule Cards -->
        <div v-else class="space-y-3 font-mono">
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
              'bg-stone-50/70 dark:bg-stone-800/40 rounded-2xl border p-3.5 group transition cursor-move',
              dragOverIndex === index && draggedRuleIndex !== null && draggedRuleIndex !== index
                ? 'border-amber-500 ring-2 ring-amber-300/40 scale-[1.01]'
                : 'border-stone-200 dark:border-stone-700 hover:border-amber-400',
              draggedRuleIndex === index ? 'opacity-50' : ''
            ]"
          >
            <!-- Top Row: Drag Handle + Name + Actions -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-start gap-2 flex-1 min-w-0">
                <div class="shrink-0 pt-0.5 text-stone-300 dark:text-stone-600 group-hover:text-stone-400 transition">
                  ⋮⋮
                </div>
                <h3 class="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight flex-1 min-w-0 truncate">
                  {{ rule.name }}
                </h3>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  @click="editRule(rule)"
                  class="p-1 rounded text-stone-400 hover:text-amber-600 transition cursor-pointer"
                  title="Edit rule"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828M11.828 15H9m0 0V12.172l6-6m-6 6l6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="deleteRule(rule.id)"
                  class="p-1 rounded text-stone-400 hover:text-rose-600 transition cursor-pointer"
                  title="Delete rule"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Conditions Pills -->
            <div class="mb-2 ml-4 space-y-1">
              <div class="flex items-center gap-1 flex-wrap">
                <template v-for="(cond, cIdx) in getRuleConditions(rule)" :key="cIdx">
                  <span
                    v-if="cIdx > 0"
                    class="text-[9px] font-black px-1 py-0.2 rounded bg-amber-200 text-stone-900 uppercase"
                  >
                    {{ rule.conditionGate || 'AND' }}
                  </span>
                  <span
                    class="inline-block text-[10px] bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5"
                  >
                    [{{ cond.field }}] {{ cond.operator }} "{{ cond.value }}"
                  </span>
                </template>
              </div>
            </div>

            <!-- Output Remarks -->
            <div class="ml-4 space-y-1 pt-1 border-t border-stone-200/60 dark:border-stone-700">
              <div
                v-for="(out, oIdx) in getRuleOutputs(rule)"
                :key="oIdx"
                class="flex items-center gap-1.5 text-[11px]"
              >
                <span class="font-bold text-stone-400">{{ out.column }}:</span>
                <span class="font-bold text-amber-700 dark:text-amber-400 truncate">
                  {{ out.value || '(empty)' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ─── Footer / Actions ──────────────────────────────── -->
    <div class="p-4 border-t border-stone-200 dark:border-stone-800 shrink-0 space-y-2 bg-stone-50/50 dark:bg-stone-900">
      <button
        v-if="!isFormOpen"
        @click="openForm"
        class="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs font-mono"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add New Rule
      </button>

      <div v-if="!isFormOpen" class="flex gap-2 font-mono">
        <button
          @click="handleExportRules"
          class="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          Export Rules
        </button>
        <button
          @click="triggerImportFile"
          class="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          Import Rules
        </button>
      </div>

      <input
        ref="importFileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleImportRules"
      />
    </div>
  </aside>
</template>