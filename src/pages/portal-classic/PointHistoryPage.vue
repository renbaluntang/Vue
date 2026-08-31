<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Point History</h1>
        <p class="text-sm text-slate-500 font-medium">
          Your lesson bookings, refunds and point grants.
        </p>
      </div>
      <RouterLink
        to="/purchase"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
      >
        <i class="fa-solid fa-coins"></i> Purchase Points
      </RouterLink>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
    <!-- Snapshot Bar -->
    <div class="p-4 sm:p-6 bg-amber-50/70 border-b border-amber-200/60 grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div class="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Remaining Balance</span>
        <div class="text-xl sm:text-2xl font-black text-amber-900 mt-0.5 flex items-baseline gap-1">
          {{ user.profile.pointsBalance }} <span class="text-xs font-bold text-amber-700">pts</span>
        </div>
      </div>

      <div class="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Points Expiration</span>
        <div class="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">
          {{ user.profile.pointsExpiry }}
        </div>
      </div>

      <div class="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Plan</span>
        <div class="text-xs sm:text-sm font-bold text-indigo-600 mt-0.5 truncate">
          {{ user.planName }}
        </div>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="p-4 sm:p-6">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Transaction History</h3>
      
      <div class="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
        <div
          v-for="tx in user.pointLedger"
          :key="tx.id"
          class="p-3.5 sm:p-4 hover:bg-slate-50 flex items-center justify-between gap-4 transition"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5"
              :class="tx.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'"
            >
              {{ tx.points > 0 ? '+' : '−' }}
            </div>
            <div class="min-w-0">
              <div class="text-xs sm:text-sm font-bold text-slate-900 truncate">{{ tx.reason }}</div>
              <div class="text-[11px] text-slate-500 truncate">{{ tx.detail }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5 font-medium">{{ tx.date }} • {{ tx.time }}</div>
            </div>
          </div>

          <div class="text-right flex-shrink-0">
            <div
              class="text-sm sm:text-base font-black"
              :class="tx.points > 0 ? 'text-emerald-600' : 'text-slate-800'"
            >
              {{ tx.points > 0 ? `+${tx.points}` : tx.points }} pts
            </div>
            <div class="text-[10px] font-bold text-slate-400">
              Bal: {{ tx.balanceAfter }} pts
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
