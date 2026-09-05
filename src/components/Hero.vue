<script setup>
import { ShieldCheck, ArrowDown, Sparkles, Check, ArrowRight } from 'lucide-vue-next'
import DropZone from './DropZone.vue'
import PeelerXRay from './PeelerXRay.vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['fileSelected', 'loadDemo', 'learnMore'])
</script>

<template>
  <div class="relative overflow-hidden pt-8 pb-16 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition-colors">
    <!-- Ambient decorative warm amber glow -->
    <div
      class="absolute top-10 left-1/3 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-amber-400/10 via-yellow-400/15 to-orange-400/10 blur-3xl -z-10 pointer-events-none rounded-full"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <!-- Split-Screen Grid: Left Copy & DropZone, Right Interactive Peeler -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2">
        
        <!-- Left Column (5 cols): Pitch & DropZone -->
        <div class="lg:col-span-5 space-y-6 text-left">
          
          <!-- Workshop Persona Pill -->
          <div
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs text-xs font-bold text-stone-800 dark:text-stone-200"
          >
            <span class="text-base select-none">🐒</span>
            <span>SheetMonkey</span>
            <span class="text-stone-300 dark:text-stone-700">•</span>
            <a
              href="https://utharam.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-amber-700 dark:text-amber-400 hover:underline font-semibold transition cursor-pointer"
              title="Visit Utharam (utharam.github.io)"
            >
              by Utharam
            </a>
            <span class="text-stone-300 dark:text-stone-700">•</span>
            <span class="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-medium flex items-center gap-1">
              [0 CLOUD UPLOADS]
            </span>
          </div>

          <!-- Hero Headline & Value Prop -->
          <div class="space-y-3">
            <h1 class="text-3xl sm:text-4xl xl:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-[1.12]">
              Turn statement garbage into spreadsheet gold.
            </h1>
            <p class="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
              The tireless browser monkey for accountants. Standardizes messy dates, crushes Excel text-as-number error triangles, preserves safe nulls, and auto-categorizes transactions with multi-condition rules.
            </p>
          </div>

          <!-- Workflow Mode Preview Chips -->
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="text-stone-400 text-[11px] font-bold">TWO MODES:</span>
            <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1 shadow-2xs">
              <span>✨ Just Clean</span>
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1 shadow-2xs">
              <span>⚡ Clean &amp; Categorize</span>
            </span>
          </div>

          <!-- Embedded DropZone -->
          <div class="pt-1">
            <DropZone
              :is-loading="props.isLoading"
              @file-selected="(file) => emit('fileSelected', file)"
              @load-demo="() => emit('loadDemo')"
            />
          </div>

        </div>

        <!-- Right Column (7 cols): Interactive Live Peeler X-Ray -->
        <div class="lg:col-span-7">
          <PeelerXRay />
        </div>

      </div>

      <!-- Quick Anchor to Assembly Line -->
      <div class="text-center pt-2">
        <button
          type="button"
          @click="emit('learnMore')"
          class="inline-flex items-center gap-2 text-xs font-mono font-bold text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer group"
        >
          <span>HOW THE MONKEY PEELS</span>
          <ArrowDown class="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

    </div>
  </div>
</template>
