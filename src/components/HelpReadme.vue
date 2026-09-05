<script setup>
import { ref } from 'vue'
import { ChevronDown, Sparkles, ShieldCheck, HelpCircle, GitFork } from 'lucide-vue-next'

const openIndex = ref(0) // Default first item open

const toggleItem = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index
}

const faqs = [
  {
    title: 'How do Compound Multi-Condition Rules and Sideways Remarks work?',
    badge: 'Multi-Condition Engine',
    content: `
      <p class="mb-2">
        SheetMonkey allows you to combine multiple criteria with <strong>AND</strong> or <strong>OR</strong> gates across single or different columns:
      </p>
      <ul class="list-disc list-inside space-y-1 mb-3 text-stone-600 dark:text-stone-300">
        <li><strong>Cross-Column Numeric Comparison:</strong> <code>Particulars Contains "Uber"</code> AND <code>Debit > 100</code></li>
        <li><strong>Negative Matching:</strong> <code>Particulars Contains "Uber"</code> AND <code>Particulars Does not contain "AED"</code></li>
        <li><strong>Multi-Keyword Matching:</strong> <code>Particulars Contains "Etihad"</code> AND <code>Particulars Contains "Alex"</code></li>
      </ul>
      <p class="mb-2">
        <strong>Going Sideways:</strong> A single rule can populate multiple remark columns at once (e.g. <code>Remark 1: Foreign Travel</code> and <code>Remark 2: High Value Ride</code>). First-match-wins per output column ensures later rules can still populate <code>Remark 2</code> if an earlier rule only set <code>Remark 1</code>.
      </p>
    `,
  },
  {
    title: 'Why does order matter in rule evaluation?',
    badge: 'Rule Precedence',
    content: `
      <p class="mb-2">
        SheetMonkey uses a deterministic <strong>first-match-wins</strong> evaluation order. Rules run top-to-bottom. 
        Once a transaction matches a rule and sets a remark (e.g. <code>Remark 1</code>), no later rule in the list can overwrite that column.
      </p>
      <div class="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs mb-2">
        <strong>The Classic "Uber" Scenario:</strong><br/>
        If you have a specific rule for <code>"Uber Eats" → Meals</code> and a general rule for <code>"Uber" → Travel</code>, 
        make sure <strong>"Uber Eats"</strong> is placed HIGHER in your list! Otherwise, the general "Uber" rule will match first and categorize your dinner as travel.
      </div>
      <p class="text-stone-500">You can reorder rules anytime using the drag handles in the Rules Sidebar.</p>
    `,
  },
  {
    title: 'What is the 3-step statement cleanup workflow?',
    badge: 'Quick Start',
    content: `
      <ol class="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-300">
        <li><strong>Step 1: Upload or Drop Statement:</strong> Drop your raw <code>.xlsx</code>, <code>.xls</code>, or <code>.csv</code> export into the upload zone (or click "Load Sample Statement" to test immediately).</li>
        <li><strong>Step 2: Map Header &amp; Column Types:</strong> In the quick Import modal, pick the header row and designate each column as <code>Text</code>, <code>Date</code>, or <code>Amount</code>.</li>
        <li><strong>Step 3: Auto-Clean &amp; Export:</strong> The engine normalizes dates, converts text amounts to mathematical numbers, matches remarks via your rule profile, and gives you a one-click clean Excel download.</li>
      </ol>
    `,
  },
  {
    title: 'How does Date Normalization work (US vs International)?',
    badge: 'Date Engine',
    content: `
      <p class="mb-2">
        Dates in raw bank statements can be chaotic: some export as Excel serial numbers (e.g. <code>45293</code>), some as ISO strings (<code>2026-01-15</code>), and some as words (<code>"Jan 22, 2026"</code>).
      </p>
      <p>
        SheetMonkey parses all these into clean, standardized <code>DD-MMM-YYYY</code> dates (e.g. <code>15-Jan-2026</code>). 
        You can toggle between <strong>US (MM/DD/YYYY)</strong> and <strong>International (DD/MM/YYYY)</strong> mode at any time with a single click in the workspace toolbar.
      </p>
    `,
  },
  {
    title: 'Why does SheetMonkey treat blanks as Null instead of 0.00?',
    badge: 'Accounting Precision',
    content: `
      <p class="mb-2">
        In accounting, a missing value is <strong>not</strong> zero. If a row has an empty Credit column, filling it with <code>0.00</code> can distort average transaction calculations, break IF formulas, and clutter ledger sheets.
      </p>
      <p>
        SheetMonkey strictly treats unparseable or blank amounts as <code>null</code>, exporting them as genuine empty cells in Excel.
      </p>
    `,
  },
  {
    title: 'Can I verify that no financial data ever leaves my computer?',
    badge: 'Security & Privacy',
    content: `
      <p class="mb-2">
        <strong>Yes, 100%!</strong> SheetMonkey is completely static and client-side. There is no remote backend, no database, and no telemetry tracking your transactions.
      </p>
      <p class="mb-2">
        <strong>The Ultimate Offline Test:</strong> Load the web page, turn off your Wi-Fi, and drop an Excel file. Everything will process and export completely normally because all calculations run inside your browser's local memory.
      </p>
      <p>
        You can also click <strong>"Safe &amp; Private"</strong> in the top navigation to copy a ready-made prompt and have ChatGPT, Claude, or Gemini audit the open-source repository!
      </p>
    `,
  },
]
</script>

<template>
  <section id="docs-faq" class="py-16 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 transition-colors">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <!-- Section Header -->
      <div class="text-center space-y-3">
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold uppercase tracking-wider"
        >
          <HelpCircle class="w-3.5 h-3.5 text-amber-500" />
          <span>HANDBOOK &amp; FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          Everything You Need to Know
        </h2>
        <p class="text-stone-500 text-xs sm:text-sm max-w-xl mx-auto font-sans">
          Clear documentation on compound rule logic, date standards, mathematical number formatting, and client-side security.
        </p>
      </div>

      <!-- Accordion List -->
      <div class="space-y-3 font-sans">
        <div
          v-for="(item, idx) in faqs"
          :key="idx"
          class="rounded-2xl border transition-all overflow-hidden"
          :class="openIndex === idx ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/20 dark:bg-stone-900 shadow-xs' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300'"
        >
          <button
            type="button"
            @click="toggleItem(idx)"
            class="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <span
                class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                :class="openIndex === idx ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'"
              >
                {{ item.badge }}
              </span>
              <span class="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                {{ item.title }}
              </span>
            </div>
            <ChevronDown
              class="w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0"
              :class="{ 'rotate-180 text-amber-500': openIndex === idx }"
            />
          </button>

          <div
            v-if="openIndex === idx"
            class="px-5 pb-5 pt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 font-sans"
            v-html="item.content"
          />
        </div>
      </div>

    </div>
  </section>
</template>
