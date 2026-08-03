<script setup>
import { useSettingsStore } from '../stores/useSettingsStore'

const settingsStore = useSettingsStore()
</script>

<template>
  <header
    class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700
           px-6 py-3 flex items-center justify-between shadow-sm shrink-0"
  >
    <!-- App Identity -->
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
        X
      </div>
      <div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Excel Cleanup for Accountants
          </h1>
          <span class="text-xs text-slate-400 dark:text-slate-500 italic">
            by Utharam
          </span>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 leading-tight">
          Client-side data transformation
        </p>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-2">
      <!-- Help Button -->
      <button
        @click="settingsStore.toggleHelp"
        class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300
               hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-2"
        title="Help & Quick Start Guide"
        aria-label="Help"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-2.91 2.904-.616.15-.99.699-.99 1.332v.764M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Help
      </button>

      <!-- Dark Mode Toggle -->
      <button
        @click="settingsStore.toggleDarkMode"
        class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300
               hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 5.646 9.003 9.003 0 0012 15a9 9 0 008.354.354z" />
        </svg>
        {{ settingsStore.isDark ? 'Light' : 'Dark' }} Mode
      </button>
    </div>
  </header>
</template>