<script setup>
import { ref, computed } from 'vue'
import { GitFork, Sparkles, Check, ArrowRight, Play, RefreshCw } from 'lucide-vue-next'
import { evaluateCondition } from '../utils/engine.js'

const testDescription = ref('UBER TRIP GBP uber.uk GBP 63.36')
const testAmount = ref('125.50')

const condition1Field = ref('Particulars')
const condition1Op = ref('Contains')
const condition1Val = ref('UBER')

const condition2Field = ref('Amount')
const condition2Op = ref('>')
const condition2Val = ref('100')

const gate = ref('AND') // 'AND' | 'OR'

const output1Col = ref('Remark 1')
const output1Val = ref('Foreign Conveyance Expenses')

const output2Col = ref('Remark 2')
const output2Val = ref('High Value Ride')

const presets = [
  {
    name: 'Uber Trip > $100',
    desc: 'UBER TRIP GBP uber.uk GBP 63.36',
    amount: '125.50',
    c1: { field: 'Particulars', op: 'Contains', val: 'UBER' },
    c2: { field: 'Amount', op: '>', val: '100' },
    gate: 'AND',
    out1: { col: 'Remark 1', val: 'Foreign Conveyance Expenses' },
    out2: { col: 'Remark 2', val: 'High Value Ride' }
  },
  {
    name: 'Etihad + Passenger Alex',
    desc: 'Etihad Airways, passenger Alex',
    amount: '450.00',
    c1: { field: 'Particulars', op: 'Contains', val: 'Etihad' },
    c2: { field: 'Particulars', op: 'Contains', val: 'Alex' },
    gate: 'AND',
    out1: { col: 'Remark 1', val: 'Travelling Expense' },
    out2: { col: 'Remark 2', val: 'Direct Billing' }
  },
  {
    name: 'Uber UAE (Under AED 50)',
    desc: 'UBER TRIP uber.com AED 33.67',
    amount: '33.67',
    c1: { field: 'Particulars', op: 'Contains', val: 'AED' },
    c2: { field: 'Amount', op: '<', val: '50' },
    gate: 'AND',
    out1: { col: 'Remark 1', val: 'Conveyance Expense - UAE' },
    out2: { col: 'Remark 2', val: 'Local Petty Cash' }
  }
]

const loadPreset = (p) => {
  testDescription.value = p.desc
  testAmount.value = p.amount
  condition1Field.value = p.c1.field
  condition1Op.value = p.c1.op
  condition1Val.value = p.c1.val
  condition2Field.value = p.c2.field
  condition2Op.value = p.c2.op
  condition2Val.value = p.c2.val
  gate.value = p.gate
  output1Col.value = p.out1.col
  output1Val.value = p.out1.val
  output2Col.value = p.out2.col
  output2Val.value = p.out2.val
}

const isCond1Match = computed(() => {
  const val = condition1Field.value === 'Amount' ? parseFloat(testAmount.value) : testDescription.value
  return evaluateCondition(val, condition1Op.value, condition1Val.value)
})

const isCond2Match = computed(() => {
  const val = condition2Field.value === 'Amount' ? parseFloat(testAmount.value) : testDescription.value
  return evaluateCondition(val, condition2Op.value, condition2Val.value)
})

const isRuleMatch = computed(() => {
  if (gate.value === 'OR') {
    return isCond1Match.value || isCond2Match.value
  }
  return isCond1Match.value && isCond2Match.value
})
</script>

<template>
  <section id="rule-sandbox" class="py-16 bg-white dark:bg-stone-950 border-b border-[#E5E5E0] dark:border-stone-800">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-xl mx-auto mb-10 space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-mono font-semibold uppercase tracking-wider">
          <Sparkles class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>INTERACTIVE RULE SIMULATOR</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-[#111827] dark:text-stone-100 tracking-tight">
          Test Multi-Conditions Live
        </h2>
        <p class="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          Try typing in transaction particulars and amounts to see how compound gates trigger dynamic remark columns.
        </p>

        <!-- Presets -->
        <div class="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <span class="text-xs text-stone-400 font-mono">Presets:</span>
          <button
            v-for="p in presets"
            :key="p.name"
            type="button"
            @click="loadPreset(p)"
            class="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-emerald-300 transition cursor-pointer"
          >
            {{ p.name }}
          </button>
        </div>
      </div>

      <!-- Simulator Box -->
      <div class="rounded-2xl border border-[#E5E5E0] dark:border-stone-800 bg-[#FBFBFA] dark:bg-stone-900/40 p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left 7 cols: Inputs & Conditions -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Sample Row Input -->
          <div class="p-4 rounded-xl bg-white dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 shadow-2xs space-y-3">
            <h4 class="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Step 1: Input Transaction Row</span>
            </h4>
            <div class="space-y-2">
              <div>
                <label class="block text-[11px] font-mono text-stone-400 mb-1">Particulars / Description</label>
                <input
                  v-model="testDescription"
                  type="text"
                  class="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
              <div>
                <label class="block text-[11px] font-mono text-stone-400 mb-1">Amount ($ / AED / etc)</label>
                <input
                  v-model="testAmount"
                  type="text"
                  class="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <!-- Compound Rule Config -->
          <div class="p-4 rounded-xl bg-white dark:bg-stone-900 border border-[#E5E5E0] dark:border-stone-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                Step 2: Rule Logic
              </h4>
              <div class="flex rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 text-xs font-mono">
                <button
                  type="button"
                  @click="gate = 'AND'"
                  :class="[
                    'px-2.5 py-0.5 transition cursor-pointer font-bold',
                    gate === 'AND' ? 'bg-emerald-800 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  ]"
                >
                  AND
                </button>
                <button
                  type="button"
                  @click="gate = 'OR'"
                  :class="[
                    'px-2.5 py-0.5 transition cursor-pointer font-bold',
                    gate === 'OR' ? 'bg-emerald-800 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  ]"
                >
                  OR
                </button>
              </div>
            </div>

            <!-- Condition 1 -->
            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap text-xs font-mono">
              <span class="w-16 text-stone-400 shrink-0 font-bold">Cond 1:</span>
              <span class="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300 font-semibold">{{ condition1Field }}</span>
              <span class="text-amber-600 dark:text-amber-400 font-bold">{{ condition1Op }}</span>
              <input
                v-model="condition1Val"
                type="text"
                class="flex-1 min-w-[100px] px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
              />
              <span :class="['px-2 py-0.5 rounded text-[10px] font-bold', isCond1Match ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400']">
                {{ isCond1Match ? 'PASS' : 'FAIL' }}
              </span>
            </div>

            <!-- Gate Indicator -->
            <div class="text-center">
              <span class="inline-block px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                — Gate: {{ gate }} ({{ gate === 'AND' ? 'Both must pass' : 'Any can pass' }}) —
              </span>
            </div>

            <!-- Condition 2 -->
            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap text-xs font-mono">
              <span class="w-16 text-stone-400 shrink-0 font-bold">Cond 2:</span>
              <span class="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300 font-semibold">{{ condition2Field }}</span>
              <span class="text-amber-600 dark:text-amber-400 font-bold">{{ condition2Op }}</span>
              <input
                v-model="condition2Val"
                type="text"
                class="flex-1 min-w-[100px] px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
              />
              <span :class="['px-2 py-0.5 rounded text-[10px] font-bold', isCond2Match ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400']">
                {{ isCond2Match ? 'PASS' : 'FAIL' }}
              </span>
            </div>
          </div>

        </div>

        <!-- Right 5 cols: Live Result Output -->
        <div class="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-stone-950 text-stone-100 font-mono text-xs border border-stone-800">
          
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-stone-800 pb-3">
              <span class="text-stone-400 text-[11px] uppercase font-bold">Live Output Simulation</span>
              <span :class="[
                'px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase',
                isRuleMatch ? 'bg-emerald-500 text-stone-950' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
              ]">
                {{ isRuleMatch ? 'Rule Triggered ✅' : 'No Rule Match ❌' }}
              </span>
            </div>

            <!-- Sideways Output Preview -->
            <div class="space-y-3">
              <span class="text-stone-400 text-[10px] uppercase tracking-wider block">Generated Sideways Columns:</span>
              
              <div class="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-stone-400">{{ output1Col }}:</span>
                  <span :class="isRuleMatch ? 'text-amber-400 font-bold' : 'text-stone-500 italic'">
                    {{ isRuleMatch ? output1Val : 'no rule given' }}
                  </span>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <span class="text-stone-400">{{ output2Col }}:</span>
                  <span :class="isRuleMatch ? 'text-purple-400 font-bold' : 'text-stone-600 italic'">
                    {{ isRuleMatch ? output2Val : '—' }}
                  </span>
                </div>
              </div>

              <div class="text-[11px] text-stone-400 leading-relaxed font-sans">
                <p v-if="isRuleMatch">
                  ✨ The rule evaluated to <strong>TRUE</strong>. Both <code class="text-amber-400 font-mono">{{ output1Col }}</code> and <code class="text-purple-400 font-mono">{{ output2Col }}</code> were created simultaneously!
                </p>
                <p v-else class="text-stone-500">
                  ⚠️ Conditions not met. In Clean &amp; Categorize mode, Remark 1 defaults to <em>no rule given</em> for accountant review.
                </p>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
            <span>Deterministic First-Match Logic</span>
            <span class="text-amber-500 font-bold">100% In-Browser</span>
          </div>

        </div>

      </div>

    </div>
  </section>
</template>
