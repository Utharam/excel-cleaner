<script setup>
import { 
  FileText, 
  Layers, 
  Binary, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-vue-next'

const emit = defineEmits(['openSandbox'])
</script>

<template>
  <section id="cleaning-matrix" class="py-16 bg-[#FBFBFA] dark:bg-stone-950 border-b border-[#E5E5E0] dark:border-stone-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <!-- Section Header -->
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-[#E5E5E0] dark:border-stone-700 text-xs font-mono text-stone-600 dark:text-stone-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>THE ACCOUNTANT'S HYGIENE MATRIX</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-[#111827] dark:text-stone-100 tracking-tight">
          What SheetMonkey fixes that native Excel breaks
        </h2>
        <p class="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
          Standard Excel scripts guess data types or corrupt leading zeros. SheetMonkey applies forensic accounting sanitization to ensure workbooks are immediately calculation-ready.
        </p>
      </div>

      <!-- 3-Pillar Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Pillar 1: Text & Character Hygiene -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border border-[#E5E5E0] dark:border-stone-800 p-6 space-y-5 shadow-2xs hover:shadow-xs transition">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Pillar 01</span>
              <h3 class="text-base font-bold text-stone-900 dark:text-stone-100">Text &amp; Character Hygiene</h3>
            </div>
          </div>

          <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Eliminates invisible character corruption from ERP web tables that break <code class="font-mono text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">=VLOOKUP()</code> and pivot tables.
          </p>

          <ul class="space-y-3 text-xs font-mono">
            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Purge ASCII 160 Web Spaces</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">STRICT</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Strips non-breaking spaces (<code class="bg-white dark:bg-stone-800 px-1 rounded">&amp;nbsp; / \u00A0</code>) injected by NetSuite, SAP, or QuickBooks table copy-pastes.
              </p>
            </li>

            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Trim Excess &amp; Trailing Spaces</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">CLEAN</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Collapses multiple consecutive spaces and trims accidental lead/trail whitespace across all alphanumeric cells.
              </p>
            </li>

            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Normalize Line Breaks</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">UNIFORM</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Flattens accidental carriage returns and tab markers that cause row wrapping errors.
              </p>
            </li>
          </ul>
        </div>

        <!-- Pillar 2: Structural & Layout Hygiene -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border border-[#E5E5E0] dark:border-stone-800 p-6 space-y-5 shadow-2xs hover:shadow-xs transition">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Pillar 02</span>
              <h3 class="text-base font-bold text-stone-900 dark:text-stone-100">Structural &amp; Layout Hygiene</h3>
            </div>
          </div>

          <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Prevents data distortion by preserving honest empty cells while stripping layout bloat.
          </p>

          <ul class="space-y-3 text-xs font-mono">
            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Safe Nulls vs False Zeros</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">AUDIT SAFE</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Blank cells stay honest <code class="bg-white dark:bg-stone-800 px-1 rounded">null</code>. Never converts missing data into misleading <code class="bg-white dark:bg-stone-800 px-1 rounded">0.00</code> accounting balances.
              </p>
            </li>

            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Purge Ghost Blank Rows</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">AUTO-CROP</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Removes phantom empty lines that disrupt contiguous data regions and stop automated pipelines.
              </p>
            </li>

            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Explicit Column Mapping</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">USER GUIDED</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Allows practitioners to confirm Date, Text, and Amount columns rather than relying on flawed auto-inference.
              </p>
            </li>
          </ul>
        </div>

        <!-- Pillar 3: Numbers & Accounting Logic -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border border-[#E5E5E0] dark:border-stone-800 p-6 space-y-5 shadow-2xs hover:shadow-xs transition">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Binary class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Pillar 03</span>
              <h3 class="text-base font-bold text-stone-900 dark:text-stone-100">Numbers &amp; Accounting Logic</h3>
            </div>
          </div>

          <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Eliminates green Excel warning triangles and coerces text-stored numbers into true mathematical floats.
          </p>

          <ul class="space-y-3 text-xs font-mono">
            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Coerce Text Numbers to Floats</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">=SUM() READY</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Strips currency prefixes (<code class="bg-white dark:bg-stone-800 px-1 rounded">$ / AED / €</code>) and commas from <code class="bg-white dark:bg-stone-800 px-1 rounded">'12,500.00</code>, outputting pure floats.
              </p>
            </li>

            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Preserve GL &amp; Tax Code Zeros</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">PROTECTED</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Text columns retain leading zeros (<code class="bg-white dark:bg-stone-800 px-1 rounded">004012</code>) without Excel stripping them into truncated integers (<code class="bg-white dark:bg-stone-800 px-1 rounded">4012</code>).
              </p>
            </li>

            <li class="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-750 space-y-1">
              <div class="flex items-center justify-between text-stone-800 dark:text-stone-200 font-semibold">
                <span>Standardize to DD-MMM-YYYY</span>
                <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">ISO SAFE</span>
              </div>
              <p class="text-[11px] text-stone-500 leading-snug">
                Normalizes mixed date formats (<code class="bg-white dark:bg-stone-800 px-1 rounded">2026/01/15</code>, <code class="bg-white dark:bg-stone-800 px-1 rounded">14-Jan-2026</code>) with US/INTL order resolution.
              </p>
            </li>
          </ul>
        </div>

      </div>

      <!-- Advanced Add-On: Multi-Condition Sideways Rules -->
      <div class="rounded-2xl border border-emerald-900/10 dark:border-emerald-700/30 bg-gradient-to-r from-emerald-50/70 via-stone-50 to-emerald-50/40 dark:from-emerald-950/20 dark:to-stone-900/40 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
        <div class="space-y-2 max-w-2xl">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-emerald-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider">Add-On Superpower</span>
            <span class="text-xs font-mono text-emerald-900 dark:text-emerald-300 font-semibold">⚡ Clean &amp; Categorize Mode</span>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
            Compound Multi-Condition Rules &amp; Dynamic Sideways Remarks
          </h3>
          <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Need more than cleaning? Match multiple criteria across single or separate columns (e.g. <code class="font-mono bg-white dark:bg-stone-800 px-1 py-0.5 rounded">Particulars contains 'Uber'</code> AND <code class="font-mono bg-white dark:bg-stone-800 px-1 py-0.5 rounded">Debit &gt; 100</code>) and populate multiple remark columns (<code class="font-mono bg-white dark:bg-stone-800 px-1 py-0.5 rounded">Remark 1</code>, <code class="font-mono bg-white dark:bg-stone-800 px-1 py-0.5 rounded">Remark 2</code>) simultaneously.
          </p>
        </div>

        <button
          type="button"
          @click="emit('openSandbox')"
          class="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-mono font-semibold transition cursor-pointer shadow-xs active:scale-95"
        >
          <span>Test in Rule Sandbox</span>
          <ArrowRight class="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

    </div>
  </section>
</template>
