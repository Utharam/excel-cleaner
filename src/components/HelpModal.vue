<script setup>
import { useSettingsStore } from '../stores/useSettingsStore'

const settingsStore = useSettingsStore()

const closeHelp = () => {
  settingsStore.toggleHelp()
}
</script>

<template>
  <div
    v-if="settingsStore.isHelpOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      @click="closeHelp"
    ></div>

    <!-- Modal Container -->
    <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-2.91 2.904-.616.15-.99.699-.99 1.332v.764M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Quick Start Guide
          </h2>
        </div>
        <button
          @click="closeHelp"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Close help"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body (scrollable) -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        <!-- ─── Section 1: The Basics ─────────────────────── -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            The Basics
          </h3>
          <ol class="space-y-2.5 ml-8">
            <li class="text-sm text-slate-600 dark:text-slate-400 flex gap-2.5">
              <span class="text-brand-600 font-semibold shrink-0">01</span>
              <span>Drop your <code class="text-brand-600 text-xs bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">.xlsx</code>, <code class="text-brand-600 text-xs bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">.xls</code>, or <code class="text-brand-600 text-xs bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">.csv</code> file into the upload zone.</span>
            </li>
            <li class="text-sm text-slate-600 dark:text-slate-400 flex gap-2.5">
              <span class="text-brand-600 font-semibold shrink-0">02</span>
              <span>In the Import modal, select your header row and assign a data type (Text, Date, or Amount) to each column.</span>
            </li>
            <li class="text-sm text-slate-600 dark:text-slate-400 flex gap-2.5">
              <span class="text-brand-600 font-semibold shrink-0">03</span>
              <span>The engine instantly cleans your data — normalizing dates, formatting amounts as true numbers, and applying your categorization rules.</span>
            </li>
          </ol>
        </div>

        <!-- ─── Section 2: How Rules Work ───────────────── -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            How Rules Work
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 ml-8 mb-3">
            Rules run top-to-bottom. The first rule to match a row wins, and no later rule can overwrite that column.
          </p>

          <!-- Uber Example Callout -->
          <div class="ml-8 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-lg p-4">
            <div class="flex gap-2.5">
              <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="space-y-1.5">
                <p class="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  Order matters — specific rules go first.
                </p>
                <p class="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                  If you have a rule for <strong>"Uber Eats"</strong> → Meals and a rule for <strong>"Uber"</strong> → Travel, make sure <strong>"Uber Eats"</strong> is higher in your list! Otherwise, the engine will see "Uber" inside "Uber Eats" and categorize it as Travel.
                </p>
              </div>
            </div>
          </div>

          <p class="text-sm text-slate-600 dark:text-slate-400 ml-8 mt-3 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 8V4m0 0H8M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            You can drag and drop rules in the sidebar to reorder them at any time.
          </p>
        </div>

        <!-- ─── Section 3: Profiles ──────────────────────── -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
            Profiles
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 ml-8 leading-relaxed">
            Create separate Profiles (e.g., <strong>Amex</strong>, <strong>HDFC</strong>) using the dropdown at the top of the sidebar. Each profile keeps its own set of rules, so you can maintain different categorization logic for different bank statements or credit cards. Switch profiles anytime — the dashboard updates instantly.
          </p>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 flex justify-end">
        <button
          @click="closeHelp"
          class="px-6 py-2 rounded-md bg-brand-600 text-white text-sm font-semibold
                 hover:bg-brand-700 transition shadow-sm"
        >
          Got it
        </button>
      </div>

    </div>
  </div>
</template>