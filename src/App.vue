<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from './stores/useSettingsStore'
import { useRulesStore } from './stores/useRulesStore'
import { useDataStore } from './stores/useDataStore'

import Navbar from './components/Navbar.vue'
import Hero from './components/Hero.vue'
import CleaningMatrix from './components/CleaningMatrix.vue'
import RuleSandbox from './components/RuleSandbox.vue'
import HelpReadme from './components/HelpReadme.vue'
import PrivacyModal from './components/PrivacyModal.vue'
import MainWorkspace from './components/MainWorkspace.vue'
import RulesSidebar from './components/RulesSidebar.vue'
import HelpModal from './components/HelpModal.vue'
import { generateDemoStatementFile } from './utils/demoStatement'
import { ShieldCheck } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const rulesStore = useRulesStore()
const dataStore = useDataStore()

const isPrivacyModalOpen = ref(false)
const isLoading = ref(false)
const workspaceRef = ref(null)
const rulesSidebarRef = ref(null)

// Hydrate persisted state on app open
onMounted(() => {
  settingsStore.initializeTheme()
  rulesStore.loadRules()
})

const scrollToUpload = () => {
  if (dataStore.rawData.length > 0) {
    dataStore.clearData()
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToCleaningMatrix = () => {
  const el = document.getElementById('cleaning-matrix')
  el?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToSandbox = () => {
  const el = document.getElementById('rule-sandbox')
  el?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToDocs = () => {
  const el = document.getElementById('docs-faq')
  el?.scrollIntoView({ behavior: 'smooth' })
}

const handleFileSelected = (file) => {
  workspaceRef.value?.parseFile(file)
}

const handleLoadDemo = () => {
  isLoading.value = true
  try {
    const demoFile = generateDemoStatementFile()
    workspaceRef.value?.parseFile(demoFile)
  } catch (err) {
    console.error('Demo generation failed:', err)
    alert('Failed to generate sample statement.')
  } finally {
    isLoading.value = false
  }
}

const handleHome = () => {
  dataStore.clearData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleResetFile = () => {
  workspaceRef.value?.openFileBrowser()
}

const handleExport = () => {
  workspaceRef.value?.handleExport()
}

const handleCreateRuleFromRow = (data) => {
  if (settingsStore.workflowMode !== 'rules') {
    settingsStore.setWorkflowMode('rules')
  }
  rulesSidebarRef.value?.prefillFromRow(data)
}
</script>

<template>
  <div class="min-h-screen bg-[#FBFBFA] dark:bg-stone-950 flex flex-col selection:bg-emerald-800 selection:text-white font-sans transition-colors">
    
    <!-- Unified Sticky Workshop Navigation -->
    <Navbar
      :has-data="dataStore.rawData.length > 0"
      :file-name="dataStore.fileName || ''"
      :row-count="dataStore.rawData.length"
      :col-count="dataStore.headers.length"
      @go-to-upload="scrollToUpload"
      @go-to-docs="scrollToDocs"
      @go-to-bento="scrollToCleaningMatrix"
      @go-to-sandbox="scrollToSandbox"
      @open-privacy-modal="isPrivacyModalOpen = true"
      @back-to-home="handleHome"
      @reset-file="handleResetFile"
      @trigger-export="handleExport"
    />

    <!-- Main Content Area -->
    <main class="flex-1 w-full flex flex-col">
      
      <!-- State 1: Landing Page (When no file is loaded) -->
      <div v-if="dataStore.rawData.length === 0">
        <!-- Hero with Centered Ingestion Zone -->
        <Hero
          :is-loading="isLoading"
          @file-selected="handleFileSelected"
          @load-demo="handleLoadDemo"
          @learn-more="scrollToCleaningMatrix"
        />

        <!-- 3-Pillar Forensic Cleaning Matrix -->
        <CleaningMatrix @open-sandbox="scrollToSandbox" />

        <!-- Live Interactive Rule Sandbox -->
        <RuleSandbox />

        <!-- Readme, Handbook & FAQs -->
        <HelpReadme />
      </div>

      <!-- State 2: Active Audit Reconciliation Workspace -->
      <div
        v-show="dataStore.rawData.length > 0"
        class="flex flex-1 overflow-hidden"
      >
        <MainWorkspace
          ref="workspaceRef"
          @create-rule-from-row="handleCreateRuleFromRow"
        />
        <RulesSidebar
          ref="rulesSidebarRef"
          v-show="settingsStore.workflowMode === 'rules'"
        />
      </div>

    </main>

    <!-- Unified Workshop Footer -->
    <footer class="border-t border-[#E5E5E0] dark:border-stone-800 bg-white dark:bg-stone-900 py-6 text-xs text-stone-500 font-mono">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div class="space-y-1">
          <div class="flex items-center justify-center sm:justify-start gap-2 font-bold text-stone-800 dark:text-stone-200">
            <span class="text-base select-none">🐒</span>
            <span>SheetMonkey</span>
            <span class="text-stone-300 dark:text-stone-700">•</span>
            <span class="font-normal text-stone-500">the spreadsheet cleaner</span>
          </div>
          <p class="text-stone-400 text-[11px] flex items-center justify-center sm:justify-start gap-1 font-sans">
            <span>Created with care by</span>
            <a
              href="https://utharam.in/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 underline underline-offset-2 transition cursor-pointer"
              title="Utharam — Simple Solutions for Complex Problems"
            >
              Utharam
            </a>
            <span class="text-stone-400">— Part of the Spreadsheet Zoo (</span>
            <a
              href="https://utharam.github.io/LedgerDuck/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 underline underline-offset-2 transition cursor-pointer"
              title="LedgerDuck - Balance & Ledger Reconciliation"
            >
              LedgerDuck 🦆
            </a>
            <span class="text-stone-400">, </span>
            <a
              href="https://sheethound.utharam.workers.dev/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 underline underline-offset-2 transition cursor-pointer"
              title="SheetHound - Excel Workbook Auditor & Formula Detective"
            >
              SheetHound 🐕
            </a>
            <span class="text-stone-400">, </span>
            <span class="font-bold text-emerald-800 dark:text-emerald-400">SheetMonkey 🐒</span>
            <span class="text-stone-400">)</span>
          </p>
        </div>

        <div class="flex items-center gap-3 text-stone-400 text-[11px] justify-center sm:justify-end font-mono">
          <button
            type="button"
            @click="isPrivacyModalOpen = true"
            class="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Safe &amp; Private (Verify with AI)</span>
          </button>
          <span>•</span>
          <span>Zero Server Storage</span>
        </div>
      </div>
    </footer>

    <!-- Privacy Modal -->
    <PrivacyModal
      :is-open="isPrivacyModalOpen"
      @close="isPrivacyModalOpen = false"
    />

    <!-- Help Modal -->
    <HelpModal v-if="settingsStore.isHelpOpen" />

  </div>
</template>