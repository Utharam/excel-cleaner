<script setup>
import { ref } from 'vue'
import { Upload, FileSpreadsheet, ShieldCheck, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['fileSelected', 'loadDemo'])

const isDragging = ref(false)
const fileInput = ref(null)

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    emit('fileSelected', files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    emit('fileSelected', files[0])
  }
  e.target.value = ''
}

const openFileBrowser = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-4">
    <!-- Drag & Drop Card -->
    <div
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="[
        'relative group rounded-2xl border-2 border-dashed p-7 sm:p-10 transition-all duration-200 text-center bg-white dark:bg-stone-900 shadow-xs',
        isDragging
          ? 'border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01] shadow-md shadow-emerald-700/10'
          : 'border-[#D1D5DB] dark:border-stone-700 hover:border-emerald-700 hover:bg-stone-50/50 dark:hover:bg-stone-850'
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx, .xls, .csv, .tsv"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="space-y-4 flex flex-col items-center">
        <!-- File Icon -->
        <div
          class="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-emerald-800 dark:text-emerald-400 flex items-center justify-center border border-[#E5E5E0] dark:border-stone-700 group-hover:scale-105 transition-transform"
        >
          <Upload v-if="!props.isLoading" class="w-6 h-6 stroke-[2]" />
          <div
            v-else
            class="w-5 h-5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"
          />
        </div>

        <div class="space-y-1">
          <h3 class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Drag and drop .xlsx, .csv, or .tsv here
          </h3>
          <p class="text-xs text-stone-500 font-mono">
            Files are processed 100% in local memory. Zero bytes leave your machine.
          </p>
        </div>

        <!-- Buttons Row -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            @click="openFileBrowser"
            :disabled="props.isLoading"
            class="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 font-mono"
          >
            <FileSpreadsheet class="w-4 h-4" />
            <span>Browse Local File</span>
          </button>

          <button
            type="button"
            @click="emit('loadDemo')"
            :disabled="props.isLoading"
            class="px-4 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-[#E5E5E0] dark:border-stone-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 font-mono"
            title="Load simulated dirty QuickBooks/SAP ledger with ASCII 160 web spaces, text numbers, and irregular dates"
          >
            <Sparkles class="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Load Sample Dirty ERP Ledger</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Security & Offline Subtext -->
    <div class="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 text-[11px] font-mono">
      <ShieldCheck class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
      <span>Forensic Client-Side Engine • Zero Server Storage • Safe for Sensitive Client GLs</span>
    </div>
  </div>
</template>
