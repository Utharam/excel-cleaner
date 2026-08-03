<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from './stores/useSettingsStore'
import { useRulesStore } from './stores/useRulesStore'
import LayoutHeader from './components/LayoutHeader.vue'
import MainWorkspace from './components/MainWorkspace.vue'
import RulesSidebar from './components/RulesSidebar.vue'
import HelpModal from './components/HelpModal.vue'

const settingsStore = useSettingsStore()
const rulesStore = useRulesStore()

// Hydrate persisted state on app open
onMounted(() => {
  settingsStore.initializeTheme()
  rulesStore.loadRules()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
    <LayoutHeader />

    <div class="flex flex-1 overflow-hidden">
      <MainWorkspace />
      <RulesSidebar />
    </div>

    <!-- Minimalist Footer -->
    <footer
        class="shrink-0 py-3 px-6 text-center text-xs text-slate-400 dark:text-slate-500
              border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
              flex flex-col gap-1"
      >
        <div>
          Created by
          <a
            href="https://utharam.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-[#1877F2] hover:opacity-80 transition"
          >
            Utharam
          </a>
        </div>
        <div>
          Built for accountants, by an accountant. Runs entirely in your browser. No data leaves your device.
        </div>
      </footer>

    <!-- Help Modal (renders on top of everything when active) -->
    <HelpModal v-if="settingsStore.isHelpOpen" />
  </div>
</template>