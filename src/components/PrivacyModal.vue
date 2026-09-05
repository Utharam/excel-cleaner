<script setup>
import { ref } from 'vue'
import { ShieldCheck, Copy, Check, X, Sparkles, WifiOff, Lock } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const copiedPrompt = ref(false)

const llmVerificationPrompt = `I am using an in-browser bank statement and ledger cleaner called SheetMonkey (by Utharam). The creator claims that it is 100% private because all Excel file reading, date normalization, rule categorization, and Excel exports happen strictly client-side in my web browser's memory (using FileReader, SheetJS, and in-memory JavaScript), with zero server uploads and zero backend APIs.

Can you explain in plain English to an accountant/finance professional:
1. Is it technically possible for a web page to clean, normalize, and export an Excel file without uploading it to a server?
2. If I turn off my internet/Wi-Fi and the tool still works, does that prove no data is leaving my computer?
3. How does local browser memory guarantee that the website owner cannot see my company's confidential bank transactions, amounts, or vendor names?`

const handleCopy = () => {
  navigator.clipboard.writeText(llmVerificationPrompt)
  copiedPrompt.value = true
  setTimeout(() => {
    copiedPrompt.value = false
  }, 2000)
}
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto font-sans"
  >
    <div
      class="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-left"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white dark:from-stone-900 dark:to-stone-950"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/20 text-xl font-bold"
          >
            🛡️
          </div>
          <div>
            <h3 class="text-base font-black text-stone-900 dark:text-stone-100 tracking-tight font-mono">
              Your Financial Data Never Leaves Your Computer
            </h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Plain-English privacy guarantee for accountants and auditors
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-5 text-xs text-stone-600 dark:text-stone-300">
        
        <!-- 3 Plain English Promises -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
            <div
              class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm"
            >
              <Lock class="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            </div>
            <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs font-mono">We Can't See It</h4>
            <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              No human, cloud server, database, or API ever receives your file or transactions.
            </p>
          </div>

          <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
            <div
              class="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold text-sm"
            >
              💻
            </div>
            <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs font-mono">Stays In Your RAM</h4>
            <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              Parsed and calculated strictly inside your local browser tab memory.
            </p>
          </div>

          <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1">
            <div
              class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold text-sm"
            >
              <WifiOff class="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            </div>
            <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs font-mono">Works 100% Offline</h4>
            <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              Turn off your Wi-Fi and drop a statement. It still cleans and exports with 0 issues!
            </p>
          </div>
        </div>

        <!-- Ask your LLM Section -->
        <div class="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5 font-mono">
              <Sparkles class="w-3.5 h-3.5 text-amber-600" />
              Still skeptical? Ask ChatGPT, Claude, or Gemini
            </span>
            <button
              type="button"
              @click="handleCopy"
              class="flex items-center gap-1 text-[11px] font-bold font-mono text-stone-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition cursor-pointer shadow-2xs"
            >
              <Check v-if="copiedPrompt" class="w-3 h-3 text-emerald-800" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copiedPrompt ? 'Copied to Clipboard!' : 'Copy Audit Prompt' }}</span>
            </button>
          </div>

          <div
            class="p-3 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/60 dark:border-stone-800 font-mono text-[11px] text-stone-700 dark:text-stone-300 line-clamp-3 select-all"
          >
            {{ llmVerificationPrompt }}
          </div>

          <p class="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
            Copy the prompt above and paste it into any AI of your choice to get an independent technical explanation of why this client-side architecture is safe for corporate NDAs.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between font-mono">
        <span class="text-[11px] text-stone-400">SheetMonkey • Spreadsheet Zoo</span>
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-stone-950 text-xs font-bold transition cursor-pointer"
        >
          Got It, Thanks!
        </button>
      </div>

    </div>
  </div>
</template>
