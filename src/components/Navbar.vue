<script setup>
import { ShieldCheck, HelpCircle, FileSpreadsheet, Download, RefreshCw, Cpu, GitFork } from 'lucide-vue-next'

const props = defineProps({
  hasData: {
    type: Boolean,
    default: false,
  },
  fileName: {
    type: String,
    default: '',
  },
  rowCount: {
    type: Number,
    default: 0,
  },
  colCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'goToUpload',
  'goToDocs',
  'goToBento',
  'goToSandbox',
  'openPrivacyModal',
  'backToHome',
  'resetFile',
  'triggerExport',
])
</script>

<template>
  <nav class="bg-[#FBFBFA]/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-[#E5E5E0] dark:border-stone-800 sticky top-0 z-40 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('backToHome')"
          class="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center border border-stone-800 text-lg hover:bg-stone-800 transition cursor-pointer select-none"
          title="SheetMonkey - Home"
        >
          🐒
        </button>
        <div>
          <div class="flex items-center gap-2">
            <span
              @click="emit('backToHome')"
              class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight cursor-pointer hover:text-emerald-800 transition"
            >
              SheetMonkey
            </span>
            <span class="text-xs text-stone-400 font-mono hidden sm:inline">the spreadsheet cleaner</span>
            <a
              href="https://utharam.in/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition cursor-pointer font-mono"
              title="Utharam — Simple Solutions for Complex Problems"
            >
              by Utharam
            </a>
          </div>
          <p class="text-[11px] text-stone-500 font-mono hidden md:flex items-center gap-1.5">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>In-Browser Client-Side Engine • Zero External Server Calls</span>
          </p>
        </div>
      </div>

      <!-- Mode A: Landing Page Nav Controls -->
      <div v-if="!props.hasData" class="flex items-center gap-3 sm:gap-5">
        <div class="hidden md:flex items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-300 font-mono">
          <button
            type="button"
            @click="emit('goToBento')"
            class="hover:text-emerald-800 dark:hover:text-emerald-400 transition cursor-pointer"
          >
            Cleaning Matrix
          </button>
          <button
            type="button"
            @click="emit('goToSandbox')"
            class="hover:text-emerald-800 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
          >
            <GitFork class="w-3 h-3 text-stone-500" />
            <span>Rule Engine</span>
          </button>
          <button
            type="button"
            @click="emit('goToDocs')"
            class="hover:text-emerald-800 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
          >
            <HelpCircle class="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>

          <!-- Plain English Privacy Pill -->
          <button
            type="button"
            @click="emit('openPrivacyModal')"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[11px] font-semibold transition cursor-pointer font-mono"
            title="Click to see why your financial data never leaves your device"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>100% Private (0 Uploads)</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <a
            href="https://github.com/Utharam/excel-cleaner"
            target="_blank"
            rel="noreferrer"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E0] dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-semibold transition font-mono"
            title="Open Source on GitHub"
          >
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>

      <!-- Mode B: Active Workspace Top Bar -->
      <div v-else class="flex items-center gap-3 flex-wrap justify-end">
        
        <!-- File Info Badge -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 text-xs font-mono">
          <FileSpreadsheet class="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <div class="text-left leading-tight">
            <span class="font-bold text-stone-900 dark:text-stone-100 block truncate max-w-[220px]" :title="props.fileName">
              {{ props.fileName }}
            </span>
            <span class="text-[10px] text-stone-500 font-medium">
              {{ props.rowCount.toLocaleString() }} rows • {{ props.colCount }} cols
            </span>
          </div>
        </div>

        <!-- Safe & Private Pill -->
        <button
          type="button"
          @click="emit('openPrivacyModal')"
          class="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-semibold transition cursor-pointer"
          title="Safe & Private"
        >
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Private Memory</span>
        </button>

        <!-- Export Action Button -->
        <button
          type="button"
          @click="emit('triggerExport')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 font-mono"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>

        <!-- Change File Button -->
        <button
          type="button"
          @click="emit('resetFile')"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer font-mono"
          title="Inspect another statement"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Change File</span>
        </button>

        <!-- Back to Home Button -->
        <button
          type="button"
          @click="emit('backToHome')"
          class="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition cursor-pointer font-mono"
          title="Return to Landing Page"
        >
          Home
        </button>

      </div>

    </div>
  </nav>
</template>
