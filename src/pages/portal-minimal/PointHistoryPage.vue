<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500 pb-20">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">Point History</h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">
          Review your lesson deductions, refunds, and point grants.
        </p>
      </div>
      <RouterLink
        to="/purchase"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm shadow-xs hover:bg-zinc-800 transition active:scale-95 text-center"
      >
        <i class="fa-solid fa-coins"></i> Purchase Points
      </RouterLink>
    </div>

    <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <!-- Balance Snapshot Bar (Responsive 1/2/3 cols) -->
      <div class="p-3.5 sm:p-5 bg-zinc-50/60 border-b border-zinc-100 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/70">
          <span class="text-[10px] uppercase font-semibold text-zinc-400">Available Balance</span>
          <div class="text-lg sm:text-2xl font-extrabold text-zinc-900 mt-0.5 flex items-baseline gap-1">
            {{ user.profile.pointsBalance }} <span class="text-xs font-medium text-zinc-400">PTS</span>
          </div>
        </div>

        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/70">
          <span class="text-[10px] uppercase font-semibold text-zinc-400">Expiry Date</span>
          <div class="text-xs sm:text-base font-bold text-zinc-800 mt-1 truncate">
            {{ user.profile.pointsExpiry }}
          </div>
        </div>

        <div class="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/70">
          <span class="text-[10px] uppercase font-semibold text-zinc-400">Subscription Plan</span>
          <div class="text-xs sm:text-sm font-bold text-zinc-900 mt-1 truncate">
            {{ user.planName }}
          </div>
        </div>
      </div>

      <!-- Ledger Table -->
      <div class="p-3.5 sm:p-5">
        <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Transaction History</h3>
        
        <div class="border border-zinc-200/70 rounded-xl overflow-hidden divide-y divide-zinc-100">
          <div
            v-for="tx in user.pointLedger"
            :key="tx.id"
            class="p-3 sm:p-4 hover:bg-zinc-50/50 flex items-center justify-between gap-3 transition"
          >
            <div class="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                :class="tx.points > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-zinc-100 text-zinc-700'"
              >
                {{ tx.points > 0 ? '+' : '−' }}
              </div>
              <div class="min-w-0">
                <div class="text-xs sm:text-sm font-bold text-zinc-900 truncate">{{ tx.reason }}</div>
                <div class="text-[11px] text-zinc-500 truncate">{{ tx.detail }}</div>
                <div class="text-[10px] text-zinc-400 mt-0.5">{{ tx.date }} • {{ tx.time }}</div>
              </div>
            </div>

            <div class="text-right shrink-0">
              <div
                class="text-xs sm:text-sm font-extrabold"
                :class="tx.points > 0 ? 'text-emerald-600' : 'text-zinc-900'"
              >
                {{ tx.points > 0 ? `+${tx.points}` : tx.points }} pts
              </div>
              <div class="text-[10px] font-medium text-zinc-400">
                Bal: {{ tx.balanceAfter }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/useUserStore';
const user = useUserStore();
</script>
