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
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brighture-gold text-brighture-ink font-bold text-sm shadow-md hover:bg-brighture-gold-deep hover:shadow-lg transition-all"
      >
        <i class="fa-solid fa-coins"></i> Purchase Points
      </RouterLink>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
      <!-- Snapshot Bar -->
      <div class="p-4 sm:p-6 bg-amber-50/70 border-b border-amber-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
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

        <div class="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Plan</span>
          <div class="text-xs sm:text-sm font-bold text-brighture-bronze mt-0.5 truncate">
            {{ user.planName }}
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Spent</span>
          <div class="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">
            {{ money(user.totalSpent, 'USD') }}
          </div>
        </div>
      </div>

      <!-- Segmented switch — same control as the Purchase Points plan switcher. -->
      <div class="px-4 sm:px-6 pt-4 sm:pt-5">
        <div
          role="tablist"
          aria-label="History type"
          class="flex rounded-2xl bg-slate-200/80 p-1.5 shadow-inner"
          @keydown="onTabKeydown"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            ref="tabButtons"
            type="button"
            role="tab"
            :id="`tab-${tab.key}`"
            :aria-selected="activeTab === tab.key"
            :aria-controls="`panel-${tab.key}`"
            :tabindex="activeTab === tab.key ? 0 : -1"
            @click="selectTab(tab.key)"
            :class="[
              'flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2.5 sm:py-3 px-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            <i :class="[tab.icon, activeTab === tab.key ? tab.color : 'text-slate-400']" class="text-sm"></i>
            <span class="truncate">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- ===== TAB: Transactions ===== -->
      <div v-if="activeTab === 'transactions'" id="panel-transactions" role="tabpanel" aria-labelledby="tab-transactions">
        <!-- Filter chips -->
        <div class="px-4 sm:px-6 pt-4 pb-2 flex flex-wrap gap-1.5">
          <button
            v-for="f in txFilters"
            :key="f.key"
            type="button"
            @click="txFilter = f.key"
            :class="[
              'rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer',
              txFilter === f.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            ]"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Transaction list -->
        <div class="px-4 sm:px-6 pb-5">
          <div
            v-if="filteredLedger.length"
            class="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100"
          >
            <div
              v-for="tx in filteredLedger"
              :key="tx.id"
              class="p-3.5 sm:p-4 hover:bg-slate-50/80 flex items-center justify-between gap-4 transition group"
            >
              <div class="flex items-start gap-3 min-w-0">
                <!-- Type icon -->
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                  :class="txIconStyle(tx)"
                >
                  <i :class="txIcon(tx)"></i>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs sm:text-sm font-bold text-slate-900 truncate">{{ tx.reason }}</span>
                    <span
                      :class="[
                        'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                        txTypeBadge(tx)
                      ]"
                    >
                      {{ txTypeLabel(tx) }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate mt-0.5">{{ tx.detail }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                    <i class="fa-regular fa-clock text-[9px]"></i>
                    {{ tx.date }} • {{ tx.time }}
                  </div>
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <div
                  class="text-sm sm:text-base font-black tabular-nums"
                  :class="tx.points > 0 ? 'text-emerald-600' : 'text-slate-800'"
                >
                  {{ tx.points > 0 ? `+${tx.points}` : tx.points }} pts
                </div>
                <div class="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Balance: {{ tx.balanceAfter }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty filter state -->
          <div v-else class="py-12 text-center">
            <i class="fa-solid fa-filter-circle-xmark text-2xl text-slate-300"></i>
            <p class="mt-2 text-sm font-bold text-slate-600">No matching transactions</p>
            <button
              type="button"
              @click="txFilter = 'all'"
              class="mt-2 text-xs font-bold text-brighture-bronze hover:underline cursor-pointer"
            >
              Show all transactions
            </button>
          </div>
        </div>
      </div>

      <!-- ===== TAB: Purchases ===== -->
      <div v-if="activeTab === 'purchases'" id="panel-purchases" role="tabpanel" aria-labelledby="tab-purchases">
        <div v-if="user.purchaseHistory.length" class="divide-y divide-slate-100">
          <div
            v-for="row in user.purchaseHistory"
            :key="row.id"
            class="p-4 sm:px-6 sm:py-5 hover:bg-slate-50/70 transition group"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Left: icon + details -->
              <div class="flex items-center gap-3.5 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="row.status === 'refunded'
                    ? 'bg-slate-100 text-slate-400'
                    : row.type === 'subscription'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-sky-100 text-sky-600'"
                >
                  <i :class="row.status === 'refunded'
                    ? 'fa-solid fa-rotate-left'
                    : row.type === 'subscription'
                      ? 'fa-solid fa-arrows-rotate'
                      : 'fa-solid fa-bag-shopping'"
                    class="text-sm"
                  ></i>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="text-sm font-bold truncate"
                      :class="row.status === 'refunded' ? 'text-slate-400 line-through' : 'text-slate-900'"
                    >
                      {{ row.planName }}
                    </span>
                    <span
                      :class="[
                        'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                        row.type === 'subscription' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                      ]"
                    >
                      {{ row.type === 'subscription' ? 'Subscription' : 'One-time' }}
                    </span>
                    <span
                      v-if="row.status === 'refunded'"
                      class="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-600 uppercase tracking-wider"
                    >
                      Refunded
                    </span>
                  </div>
                  <!-- date on its own line, payment method stacked beneath it -->
                  <div class="mt-1.5 space-y-0.5">
                    <div class="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <i class="fa-regular fa-calendar text-[10px] text-slate-400"></i>
                      {{ row.date }} · {{ row.time }}
                    </div>
                    <div class="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <i :class="row.method === 'PayPal' ? 'fa-brands fa-paypal text-blue-500' : 'fa-brands fa-stripe text-violet-500'" class="text-[10px]"></i>
                      {{ row.method }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: amount + points -->
              <div class="text-right flex-shrink-0">
                <div
                  class="text-base font-black tabular-nums"
                  :class="row.status === 'refunded' ? 'text-slate-400 line-through' : 'text-slate-900'"
                >
                  {{ money(row.amount, row.currency) }}
                </div>
                <div class="text-[11px] font-bold text-emerald-600 mt-0.5">
                  +{{ row.points }} pts
                </div>
                <div class="text-[10px] font-mono text-slate-400 mt-1 hidden sm:block">
                  {{ row.receiptId }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="p-10 text-center">
          <i class="fa-solid fa-receipt text-3xl text-slate-300"></i>
          <p class="mt-3 text-sm font-bold text-slate-700">No purchases yet</p>
          <p class="text-xs text-slate-500 mt-1">Your receipts will appear here after your first points purchase.</p>
          <RouterLink
            to="/purchase"
            class="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brighture-gold text-brighture-ink font-bold text-xs shadow-sm hover:bg-brighture-gold-deep transition"
          >
            <i class="fa-solid fa-coins"></i> Purchase Points
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';

const user = useUserStore();
const route = useRoute();
const router = useRouter();

// --- Tabs ---
const tabs = [
  { key: 'transactions', label: 'Transactions', icon: 'fa-solid fa-arrow-right-arrow-left', color: 'text-sky-600' },
  { key: 'purchases', label: 'Purchases', icon: 'fa-solid fa-receipt', color: 'text-violet-600' },
];
const tabKeys = tabs.map((tab) => tab.key);
const tabButtons = ref([]);

// The tab lives in the URL so /points?tab=purchases can be linked to directly
// and survives a refresh. The default tab stays out of the query string.
const validTab = (value) => (tabKeys.includes(value) ? value : 'transactions');
const activeTab = ref(validTab(route.query.tab));

watch(() => route.query.tab, (value) => { activeTab.value = validTab(value); });

const selectTab = (key) => {
  activeTab.value = key;
  // replace, not push — flipping tabs shouldn't fill up the back button.
  router.replace({ query: { ...route.query, tab: key === 'transactions' ? undefined : key } });
};

// Arrow keys move between tabs, as expected of a tablist.
const onTabKeydown = (event) => {
  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  const next = (tabKeys.indexOf(activeTab.value) + step + tabKeys.length) % tabKeys.length;
  selectTab(tabKeys[next]);
  nextTick(() => { tabButtons.value[next]?.focus(); });
};

// --- Transaction filters ---
const txFilter = ref('all');
const txFilters = [
  { key: 'all', label: 'All' },
  { key: 'debit', label: 'Lessons Used' },
  { key: 'credit', label: 'Points Added' },
  { key: 'refund', label: 'Refunds' },
];

const filteredLedger = computed(() => {
  if (txFilter.value === 'all') return user.pointLedger;
  return user.pointLedger.filter(tx => tx.type === txFilter.value);
});

// --- Transaction display helpers ---
const txIcon = (tx) => {
  if (tx.type === 'refund') return 'fa-solid fa-rotate-left';
  if (tx.type === 'credit') {
    if (tx.reason.toLowerCase().includes('referral')) return 'fa-solid fa-user-plus';
    if (tx.reason.toLowerCase().includes('subscription')) return 'fa-solid fa-arrows-rotate';
    if (tx.reason.toLowerCase().includes('bonus') || tx.reason.toLowerCase().includes('welcome')) return 'fa-solid fa-gift';
    return 'fa-solid fa-plus';
  }
  // debit
  if (tx.reason.toLowerCase().includes('writing')) return 'fa-solid fa-pen-nib';
  return 'fa-solid fa-chalkboard-user';
};

const txIconStyle = (tx) => {
  if (tx.type === 'refund') return 'bg-amber-100 text-amber-600';
  if (tx.type === 'credit') return 'bg-emerald-100 text-emerald-600';
  return 'bg-slate-100 text-slate-600';
};

const txTypeBadge = (tx) => {
  if (tx.type === 'refund') return 'bg-amber-50 text-amber-700';
  if (tx.type === 'credit') return 'bg-emerald-50 text-emerald-700';
  return 'bg-slate-100 text-slate-600';
};

const txTypeLabel = (tx) => {
  if (tx.type === 'refund') return 'Refund';
  if (tx.type === 'credit') return 'Credit';
  return 'Used';
};

// --- Money formatter ---
const money = (amount, currency = 'USD') =>
  new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
</script>
