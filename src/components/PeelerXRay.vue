<script setup>
import { ref, computed } from 'vue'
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Cpu, RefreshCw } from 'lucide-vue-next'

const activeFilter = ref('all') // 'all' | 'rules' | 'nulls'
const viewMode = ref('split') // 'split' | 'before' | 'after'

const sampleTransactions = [
  {
    id: 1,
    tag: 'rules',
    raw: {
      date: '08/01/2026',
      particulars: '  UBER TRIP uber.com AED 33.67  ',
      amount: ' 33.67 ',
      isTextNumber: true,
      hasDateIssue: true,
    },
    peeled: {
      date: '08-Jan-2026',
      particulars: 'UBER TRIP uber.com AED 33.67',
      amount: 33.67,
      remarks: [
        { col: 'Remark 1', val: 'Conveyance Expense - UAE', color: 'emerald' }
      ],
    }
  },
  {
    id: 2,
    tag: 'rules',
    raw: {
      date: 'Jan 12, 2026',
      particulars: 'Etihad Airways, passenger Alex',
      amount: ' $450.00 ',
      isTextNumber: true,
      hasDateIssue: true,
    },
    peeled: {
      date: '12-Jan-2026',
      particulars: 'Etihad Airways, passenger Alex',
      amount: 450.00,
      remarks: [
        { col: 'Remark 1', val: 'Travelling Expense', color: 'amber' }
      ],
    }
  },
  {
    id: 3,
    tag: 'rules',
    raw: {
      date: '2026.01.15',
      particulars: 'UBER TRIP GBP uber.uk GBP 63.36',
      amount: ' 125.50 ',
      isTextNumber: true,
      hasDateIssue: true,
    },
    peeled: {
      date: '15-Jan-2026',
      particulars: 'UBER TRIP GBP uber.uk GBP 63.36',
      amount: 125.50,
      remarks: [
        { col: 'Remark 1', val: 'Foreign Conveyance Expenses', color: 'blue' },
        { col: 'Remark 2', val: 'High Value Ride', color: 'purple' }
      ],
    }
  },
  {
    id: 4,
    tag: 'nulls',
    raw: {
      date: '18-01-2026',
      particulars: 'Client Wire Retainer (Uninvoiced)',
      amount: '',
      isTextNumber: false,
      isBlank: true,
    },
    peeled: {
      date: '18-Jan-2026',
      particulars: 'Client Wire Retainer (Uninvoiced)',
      amount: null,
      remarks: [
        { col: 'Remark 1', val: 'no rule given', color: 'slate' }
      ],
    }
  },
]

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') return sampleTransactions
  return sampleTransactions.filter(t => t.tag === activeFilter.value || activeFilter.value === 'all')
})
</script>

<template>
  <div class="rounded-3xl border border-stone-800 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden font-sans">
    
    <!-- Top Terminal Bar -->
    <div class="px-5 py-3.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="flex gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
        </div>
        <div class="h-3.5 w-px bg-stone-700 mx-1"></div>
        <div class="flex items-center gap-1.5 text-xs font-mono font-bold tracking-tight text-amber-400">
          <Cpu class="w-3.5 h-3.5" />
          <span>PEELER X-RAY</span>
          <span class="text-stone-500">•</span>
          <span class="text-[11px] text-stone-400 font-normal">Real-Time Transformer</span>
        </div>
      </div>

      <!-- View Switcher -->
      <div class="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px] font-mono">
        <button
          type="button"
          @click="viewMode = 'before'"
          :class="[
            'px-2.5 py-1 rounded-lg transition font-medium',
            viewMode === 'before' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' : 'text-stone-400 hover:text-stone-200'
          ]"
        >
          Raw Ugly
        </button>
        <button
          type="button"
          @click="viewMode = 'split'"
          :class="[
            'px-2.5 py-1 rounded-lg transition font-medium',
            viewMode === 'split' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
          ]"
        >
          Split X-Ray
        </button>
        <button
          type="button"
          @click="viewMode = 'after'"
          :class="[
            'px-2.5 py-1 rounded-lg transition font-medium',
            viewMode === 'after' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'text-stone-400 hover:text-stone-200'
          ]"
        >
          Peeled Clean
        </button>
      </div>
    </div>

    <!-- Filter Pills Bar -->
    <div class="px-5 py-2.5 bg-stone-900/40 border-b border-stone-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
      <span class="text-[11px] font-mono text-stone-400">FOCUS INSPECTION:</span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          @click="activeFilter = 'all'"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-mono transition',
            activeFilter === 'all' ? 'bg-stone-800 text-amber-300 font-bold border border-amber-500/30' : 'text-stone-400 hover:text-stone-200'
          ]"
        >
          All 4 Scenarios
        </button>
        <button
          type="button"
          @click="activeFilter = 'rules'"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-mono transition',
            activeFilter === 'rules' ? 'bg-stone-800 text-amber-300 font-bold border border-amber-500/30' : 'text-stone-400 hover:text-stone-200'
          ]"
        >
          Multi-Rules &amp; Sideways
        </button>
        <button
          type="button"
          @click="activeFilter = 'nulls'"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-mono transition',
            activeFilter === 'nulls' ? 'bg-stone-800 text-amber-300 font-bold border border-amber-500/30' : 'text-stone-400 hover:text-stone-200'
          ]"
        >
          Safe Nulls vs 0.00
        </button>
      </div>
    </div>

    <!-- Interactive Card List / Grid -->
    <div class="p-4 sm:p-5 space-y-3 max-h-[380px] overflow-y-auto">
      
      <div
        v-for="item in filteredTransactions"
        :key="item.id"
        class="rounded-2xl border border-stone-800/90 bg-stone-900/50 hover:bg-stone-900/80 transition p-3.5 space-y-3 font-mono text-xs"
      >
        <!-- Header Info -->
        <div class="flex items-center justify-between text-[11px] text-stone-400">
          <span class="font-bold text-stone-300">TRANS_REF #{{ item.id }}</span>
          <span v-if="item.raw.isTextNumber" class="text-amber-400 flex items-center gap-1 font-sans">
            <AlertTriangle class="w-3 h-3 text-amber-400" />
            <span>Excel Text-as-Number Fixed</span>
          </span>
          <span v-else-if="item.raw.isBlank" class="text-indigo-400 flex items-center gap-1 font-sans">
            <CheckCircle2 class="w-3 h-3 text-indigo-400" />
            <span>Null Kept Genuine</span>
          </span>
        </div>

        <!-- Split Grid -->
        <div :class="[
          'grid gap-2.5',
          viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        ]">
          
          <!-- LEFT / RAW SIDE -->
          <div
            v-if="viewMode === 'split' || viewMode === 'before'"
            class="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2"
          >
            <div class="flex items-center justify-between text-[10px] text-rose-400 font-bold tracking-wider uppercase font-sans">
              <span>Raw Bank Export</span>
              <span class="bg-rose-900/40 text-rose-300 px-1.5 py-0.5 rounded text-[9px]">Unpeeled</span>
            </div>

            <div class="space-y-1 text-stone-300 text-[11px]">
              <div class="flex justify-between">
                <span class="text-stone-500">Date:</span>
                <span class="text-rose-200 line-through decoration-rose-500">{{ item.raw.date }}</span>
              </div>
              <div>
                <span class="text-stone-500 block text-[10px]">Particulars:</span>
                <span class="text-rose-100 bg-rose-950/60 px-1.5 py-0.5 rounded block truncate text-[11px] border border-rose-900/40">
                  "{{ item.raw.particulars }}"
                </span>
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-rose-900/30">
                <span class="text-stone-500">Amount:</span>
                <span class="text-rose-300 bg-rose-900/30 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <span class="text-rose-400">⚠️</span>
                  <span>{{ item.raw.amount === '' ? '[BLANK]' : `"${item.raw.amount}"` }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- RIGHT / PEELED SIDE -->
          <div
            v-if="viewMode === 'split' || viewMode === 'after'"
            class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2"
          >
            <div class="flex items-center justify-between text-[10px] text-emerald-400 font-bold tracking-wider uppercase font-sans">
              <span class="flex items-center gap-1 text-emerald-300">
                <Sparkles class="w-3 h-3 text-amber-400" />
                <span>SheetMonkey Peeled</span>
              </span>
              <span class="bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">100% Clean</span>
            </div>

            <div class="space-y-1 text-stone-200 text-[11px]">
              <div class="flex justify-between">
                <span class="text-stone-500">Date:</span>
                <span class="text-emerald-300 font-bold">{{ item.peeled.date }}</span>
              </div>
              <div>
                <span class="text-stone-500 block text-[10px]">Particulars:</span>
                <span class="text-stone-200 block truncate text-[11px]">
                  {{ item.peeled.particulars }}
                </span>
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-emerald-900/30">
                <span class="text-stone-500">Amount:</span>
                <span class="text-emerald-400 font-bold">
                  {{ item.peeled.amount === null ? 'null' : item.peeled.amount.toFixed(2) }}
                  <span class="text-[9px] text-emerald-600 font-normal font-sans ml-1">(float)</span>
                </span>
              </div>

              <!-- Output Remarks ("Going sideways") -->
              <div v-if="item.peeled.remarks?.length" class="pt-1.5 flex flex-wrap gap-1.5">
                <span
                  v-for="rem in item.peeled.remarks"
                  :key="rem.col"
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded-md font-medium font-sans flex items-center gap-1',
                    rem.color === 'emerald' ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700/40' :
                    rem.color === 'amber' ? 'bg-amber-900/50 text-amber-200 border border-amber-700/40' :
                    rem.color === 'blue' ? 'bg-sky-900/50 text-sky-200 border border-sky-700/40' :
                    rem.color === 'purple' ? 'bg-purple-900/50 text-purple-200 border border-purple-700/40' :
                    'bg-stone-800 text-stone-400'
                  ]"
                >
                  <span class="text-[9px] opacity-75">{{ rem.col }}:</span>
                  <span>{{ rem.val }}</span>
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- Bottom Telemetry Bar -->
    <div class="px-5 py-3 bg-stone-900/80 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-400">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-stone-300">Zero Server Uploads • Instant Browser Memory</span>
      </div>
      <span class="text-amber-400 font-semibold">Safe for Audit &amp; Tax</span>
    </div>

  </div>
</template>
