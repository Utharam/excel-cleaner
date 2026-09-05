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
        'relative group rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-all duration-200 text-center bg-white dark:bg-stone-900 shadow-sm',
        isDragging
          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 scale-[1.01] shadow-md shadow-amber-500/10'
          : 'border-stone-300 dark:border-stone-700 hover:border-amber-500 hover:bg-stone-50/80 dark:hover:bg-stone-850'
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx, .xls, .csv"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="space-y-4 flex flex-col items-center">
        <!-- Mascot/Upload Icon Pill -->
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform"
        >
          <Upload v-if="!props.isLoading" class="w-7 h-7 stroke-[2.2]" />
          <div
            v-else
            class="w-6 h-6 border-3 border-stone-950 border-t-transparent rounded-full animate-spin"
          />
        </div>

        <div class="space-y-1">
          <h3 class="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Drop your bank statement or ledger here
          </h3>
          <p class="text-xs text-stone-500 dark:text-stone-400">
            Supports <strong class="text-stone-700 dark:text-stone-300">.xlsx</strong>, <strong class="text-stone-700 dark:text-stone-300">.xls</strong>, or <strong class="text-stone-700 dark:text-stone-300">.csv</strong>
          </p>
        </div>

        <!-- Buttons Row -->
        <div class="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            @click="openFileBrowser"
            :disabled="props.isLoading"
            class="px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet class="w-4 h-4 text-amber-400" />
            <span>Choose an Excel File</span>
          </button>

          <button
            type="button"
            @click="emit('loadDemo')"
            :disabled="props.isLoading"
            class="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
            title="Load a messy sample statement with mixed dates and numbers to test instantly"
          >
            <Sparkles class="w-4 h-4 text-amber-600" />
            <span>Load Sample Statement</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Security & Offline Subtext -->
    <div class="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 text-[11px] font-medium font-mono">
      <ShieldCheck class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>100% In-Browser Memory • Zero Server Uploads • Safe for Client Data</span>
    </div>
  </div>
</template>
