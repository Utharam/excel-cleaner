<script setup>
import { ref } from 'vue'
import { Calendar, Hash, ShieldAlert, GitFork, Lock, Sparkles, Check, ArrowRight } from 'lucide-vue-next'

const activeStation = ref(1)

const stations = [
  {
    id: 1,
    num: '01',
    title: 'Universal Date Calibrator',
    subtitle: 'Resolves the US vs INTL Date Ambiguity Crisis',
    icon: Calendar,
    accent: 'from-amber-500 to-yellow-500',
    borderAccent: 'hover:border-amber-500',
    description: 'Bank exports love mixing dates: "08/01/2026", "2026.01.08", or "Jan 8, 2026". SheetMonkey normalizes every timestamp into standard DD-MMM-YYYY format with instant US (MM/DD) vs INTL (DD/MM) switching.',
    interactivePill: {
      raw: '08/01/2026',
      clean: '08-Jan-2026',
      type: 'Date Standardized'
    }
  },
  {
    id: 2,
    num: '02',
    title: 'True Number Forge',
    subtitle: 'Destroys Excel’s "Number Stored as Text" Bug',
    icon: Hash,
    accent: 'from-orange-500 to-amber-600',
    borderAccent: 'hover:border-orange-500',
    description: 'Excel green error triangles occur when amounts have hidden spaces, currency symbols ($ / AED / €), or commas. SheetMonkey parses them into clean JavaScript floats, making =SUM() and Pivot Tables work instantly.',
    interactivePill: {
      raw: '" $1,240.50 "',
      clean: '1240.50',
      type: 'True Float Number'
    }
  },
  {
    id: 3,
    num: '03',
    title: 'Safe Null Sorter',
    subtitle: 'Preserves Genuine Blanks vs Toxic 0.00 Balances',
    icon: ShieldAlert,
    accent: 'from-purple-500 to-indigo-600',
    borderAccent: 'hover:border-purple-500',
    description: 'In financial auditing, an unbilled fee or blank reference cell is NOT zero dollars. SheetMonkey preserves missing cells as honest null rather than coercing them into 0.00, keeping financial statements compliant.',
    interactivePill: {
      raw: '"" (Blank Cell)',
      clean: 'null',
      type: 'Audit Compliant'
    }
  },
  {
    id: 4,
    num: '04',
    title: 'Multi-Condition Rule Brain',
    subtitle: 'Compound AND/OR Logic + Sideways Remark Columns',
    icon: GitFork,
    accent: 'from-amber-600 to-yellow-600',
    borderAccent: 'hover:border-amber-600',
    description: 'Match complex transaction patterns across single or multiple fields. Target "Etihad" + "Alex" to Travel Expense, or "Uber" + Amount > 100 to generate both Remark 1 and Remark 2 going sideways simultaneously.',
    interactivePill: {
      raw: 'Uber + > 100',
      clean: 'Remark 1 & 2',
      type: 'Compound Categorization'
    }
  },
  {
    id: 5,
    num: '05',
    title: 'Offline Privacy Vault',
    subtitle: 'Zero Cloud Storage • 100% In-Browser Cryptography',
    icon: Lock,
    accent: 'from-emerald-500 to-teal-600',
    borderAccent: 'hover:border-emerald-500',
    description: 'Your sensitive client ledgers and bank statements never touch an external server or database. SheetMonkey runs entirely in local RAM and works seamlessly even when your machine is offline in airplane mode.',
    interactivePill: {
      raw: '0 B Sent to Cloud',
      clean: '100% Offline Safe',
      type: 'Total Client Privacy'
    }
  }
]
</script>

<template>
  <section id="assembly-line" class="py-20 bg-stone-100/70 dark:bg-stone-900/50 border-y border-stone-200 dark:border-stone-800 transition-colors">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <span>🐒 THE GRUNT WORK ASSEMBLY LINE</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          5 Mechanical Stations.<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-400">
            Zero Manual Grunt Work.
          </span>
        </h2>
        <p class="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
          From unpeeled bank statement dumps to audit-ready spreadsheets. Here is how SheetMonkey transforms your numbers stage by stage.
        </p>
      </div>

      <!-- Station Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div
          v-for="station in stations"
          :key="station.id"
          :class="[
            'group relative rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between border bg-white dark:bg-stone-950 shadow-xs hover:shadow-xl',
            station.id === 4 ? 'md:col-span-2 lg:col-span-2' : '',
            'border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500'
          ]"
        >
          <!-- Top Tag & Number -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <component :is="station.icon" class="w-5 h-5" />
              </div>
              <div>
                <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                  STATION {{ station.num }}
                </span>
                <h3 class="text-base font-bold text-stone-900 dark:text-stone-100">
                  {{ station.title }}
                </h3>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-5">
            {{ station.description }}
          </p>

          <!-- Interactive Transformation Pill -->
          <div class="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <div class="flex items-center gap-1.5">
              <span class="bg-stone-100 dark:bg-stone-900 text-stone-500 px-2 py-1 rounded-md text-[11px] line-through decoration-rose-400">
                {{ station.interactivePill.raw }}
              </span>
              <ArrowRight class="w-3.5 h-3.5 text-stone-400" />
              <span class="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold px-2 py-1 rounded-md text-[11px] border border-amber-300/40 dark:border-amber-700/40">
                {{ station.interactivePill.clean }}
              </span>
            </div>
            <span class="text-[10px] font-sans font-medium text-stone-400">
              {{ station.interactivePill.type }}
            </span>
          </div>

        </div>

      </div>

    </div>
  </section>
</template>
