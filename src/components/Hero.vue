<script setup>
import { ShieldCheck, ArrowDown, Cpu, Lock, CheckCircle2 } from 'lucide-vue-next'
import DropZone from './DropZone.vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['fileSelected', 'loadDemo', 'learnMore'])
</script>

<template>
  <div class="relative overflow-hidden pt-10 pb-16 bg-[#FBFBFA] dark:bg-stone-950 border-b border-[#E5E5E0] dark:border-stone-800 transition-colors">
    <!-- Subtle architectural background grid -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-10"
    />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
      
      <!-- Persona & Status Pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 shadow-2xs text-xs font-mono text-stone-700 dark:text-stone-300">
        <span class="text-sm select-none">🐒</span>
        <span class="font-bold text-stone-900 dark:text-stone-100">SheetMonkey</span>
        <span class="text-stone-300 dark:text-stone-700">•</span>
        <span class="text-stone-500">the spreadsheet cleaner</span>
        <span class="text-stone-300 dark:text-stone-700">•</span>
        <span class="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          [0 CLOUD UPLOADS]
        </span>
      </div>

      <!-- Main Headline & Subtitle -->
      <div class="space-y-3 max-w-3xl mx-auto">
        <h1 class="text-3xl sm:text-5xl font-black text-[#111827] dark:text-stone-100 tracking-tight leading-[1.15]">
          Sanitize messy ERP exports and unformatted workbooks in seconds.
        </h1>
        <p class="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Engineered for accountants and financial modelers. Strips invisible ASCII 160 web spaces, coerces text-stored numbers to true mathematical floats, and standardizes dates—100% in your browser.
        </p>
      </div>

      <!-- 3 Architectural Trust Pillars -->
      <div class="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
        <span class="px-2.5 py-1 rounded-md bg-white dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 flex items-center gap-1.5 shadow-2xs">
          <Cpu class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>In-Browser Client Execution (WASM/JS)</span>
        </span>
        <span class="px-2.5 py-1 rounded-md bg-white dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 flex items-center gap-1.5 shadow-2xs">
          <Lock class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Zero External Network Calls</span>
        </span>
        <span class="px-2.5 py-1 rounded-md bg-white dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>True Numeric Floats Ready for =SUM()</span>
        </span>
      </div>

      <!-- Embedded Centered DropZone -->
      <div class="pt-2">
        <DropZone
          :is-loading="props.isLoading"
          @file-selected="(file) => emit('fileSelected', file)"
          @load-demo="() => emit('loadDemo')"
        />
      </div>

      <!-- Quick Link to Forensic Matrix -->
      <div class="pt-2">
        <button
          type="button"
          @click="emit('learnMore')"
          class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-stone-500 hover:text-emerald-800 dark:hover:text-emerald-400 transition cursor-pointer group"
        >
          <span>VIEW 3-PILLAR CLEANING MATRIX</span>
          <ArrowDown class="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

    </div>
  </div>
</template>
