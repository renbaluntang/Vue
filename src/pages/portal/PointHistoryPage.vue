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
        <!-- Filter Controls Container -->
        <div class="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100 space-y-3.5">
          <!-- Top Controls: Date Presets & Search & Sort -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <!-- Date Preset Chips -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
                <i class="fa-regular fa-calendar text-slate-400"></i> Date:
              </span>
              <button
                v-for="preset in purchaseDatePresets"
                :key="preset.key"
                type="button"
                @click="purchaseDatePreset = preset.key"
                :class="[
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1',
                  purchaseDatePreset === preset.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/70'
                ]"
              >
                <i v-if="preset.key === 'custom'" class="fa-regular fa-calendar-days text-[10px]"></i>
                {{ preset.label }}
              </button>
            </div>

            <!-- Search & Sort Controls -->
            <div class="flex items-center gap-2">
              <!-- Search Bar -->
              <div class="relative flex-1 sm:w-60">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  v-model="purchaseSearchQuery"
                  type="text"
                  placeholder="Search plan or receipt ID..."
                  class="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brighture-gold focus:border-transparent transition"
                />
                <button
                  v-if="purchaseSearchQuery"
                  type="button"
                  @click="purchaseSearchQuery = ''"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  title="Clear search"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <!-- Sort Order Toggle -->
              <button
                type="button"
                @click="purchaseSortOrder = purchaseSortOrder === 'desc' ? 'asc' : 'desc'"
                :title="purchaseSortOrder === 'desc' ? 'Sorted newest first' : 'Sorted oldest first'"
                class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100/70 text-xs font-semibold cursor-pointer transition"
              >
                <i :class="purchaseSortOrder === 'desc' ? 'fa-solid fa-arrow-down-wide-short' : 'fa-solid fa-arrow-up-wide-short'" class="text-brighture-bronze"></i>
                <span class="hidden sm:inline">{{ purchaseSortOrder === 'desc' ? 'Newest' : 'Oldest' }}</span>
              </button>
            </div>
          </div>

          <!-- Secondary Row: Custom Date Inputs & Type Filter Pills -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/50">
            <!-- Type Filters -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-slate-500 mr-1">Type:</span>
              <button
                v-for="tf in purchaseTypeFilters"
                :key="tf.key"
                type="button"
                @click="purchaseTypeFilter = tf.key"
                :class="[
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                  purchaseTypeFilter === tf.key
                    ? 'bg-violet-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                {{ tf.label }}
              </button>
            </div>

            <!-- Custom Date Inputs (expanded if preset is custom) -->
            <div
              v-if="purchaseDatePreset === 'custom'"
              class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs animate-in fade-in duration-200 flex-wrap"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-bold text-slate-500">From:</span>
                <input
                  v-model="customStartDate"
                  type="date"
                  class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brighture-gold text-slate-700"
                />
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-bold text-slate-500">To:</span>
                <input
                  v-model="customEndDate"
                  type="date"
                  class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brighture-gold text-slate-700"
                />
              </div>
              <button
                v-if="customStartDate || customEndDate"
                type="button"
                @click="customStartDate = ''; customEndDate = ''"
                class="text-[11px] font-bold text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                title="Reset custom dates"
              >
                Clear
              </button>
            </div>

            <!-- Clear All Filters Link -->
            <div v-if="hasActivePurchaseFilters" class="shrink-0">
              <button
                type="button"
                @click="clearPurchaseFilters"
                class="text-xs font-bold text-brighture-bronze hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <i class="fa-solid fa-rotate-left text-[10px]"></i> Reset filters
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic Period Summary Card -->
        <div class="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/40 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-medium text-slate-600">
              Filtered Summary ({{ purchaseSummary.count }} {{ purchaseSummary.count === 1 ? 'record' : 'records' }}):
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs font-bold">
            <div class="text-slate-700">
              Total Spent: <span class="text-slate-900 font-extrabold">{{ money(purchaseSummary.totalSpent, 'USD') }}</span>
            </div>
            <div class="text-emerald-700">
              Points Gained: <span class="font-extrabold">+{{ purchaseSummary.totalPoints }} pts</span>
            </div>
            <div v-if="purchaseSummary.refundedCount > 0" class="text-amber-700">
              Refunded: <span class="font-extrabold">{{ purchaseSummary.refundedCount }}</span>
            </div>
          </div>
        </div>

        <!-- Purchases List -->
        <div v-if="filteredPurchases.length" class="divide-y divide-slate-100">
          <div
            v-for="row in filteredPurchases"
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

              <!-- Right: amount + points + copyable receipt -->
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
                <button
                  type="button"
                  @click="copyReceipt(row.receiptId)"
                  :title="copiedReceiptId === row.receiptId ? 'Copied!' : 'Click to copy receipt ID'"
                  class="text-[10px] font-mono text-slate-400 hover:text-slate-700 mt-1 hidden sm:inline-flex items-center gap-1 cursor-pointer group-hover:text-slate-600 transition"
                >
                  <span>{{ row.receiptId }}</span>
                  <i :class="copiedReceiptId === row.receiptId ? 'fa-solid fa-check text-emerald-600' : 'fa-regular fa-copy text-[9px] opacity-60'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Empty State (when user has purchases but none match the filter) -->
        <div v-else-if="user.purchaseHistory.length" class="p-12 text-center">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg mb-3">
            <i class="fa-solid fa-calendar-xmark"></i>
          </div>
          <p class="text-sm font-bold text-slate-800">No purchases found</p>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No transaction receipts match your selected date range or filter criteria.
          </p>
          <button
            type="button"
            @click="clearPurchaseFilters"
            class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <i class="fa-solid fa-rotate-left"></i> Reset Filters
          </button>
        </div>

        <!-- Full Empty state (user has zero purchases total) -->
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

// --- Purchases Filtering, Search & Sorting ---
const purchaseDatePreset = ref('all');
const purchaseDatePresets = [
  { key: 'all', label: 'All Time' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_30', label: 'Last 30 Days' },
  { key: 'last_90', label: 'Last 90 Days' },
  { key: 'this_year', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' },
];

const customStartDate = ref('');
const customEndDate = ref('');
const purchaseSearchQuery = ref('');
const purchaseTypeFilter = ref('all');
const purchaseTypeFilters = [
  { key: 'all', label: 'All Types' },
  { key: 'subscription', label: 'Subscriptions' },
  { key: 'one-time', label: 'One-time' },
  { key: 'refunded', label: 'Refunded' },
];
const purchaseSortOrder = ref('desc');

// Parse receipt date robustly from receipt ID (BR-YYYYMMDD) or date string
const parsePurchaseDate = (row) => {
  if (!row) return new Date();
  const m = row.receiptId?.match(/BR-(\d{4})(\d{2})(\d{2})/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(row.date);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Filtered purchases list
const filteredPurchases = computed(() => {
  let list = [...user.purchaseHistory];

  // 1. Date Filter
  const now = new Date();
  if (purchaseDatePreset.value === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    list = list.filter((r) => {
      const d = parsePurchaseDate(r);
      return d >= start && d <= end;
    });
  } else if (purchaseDatePreset.value === 'last_30') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getTime());
    end.setHours(23, 59, 59, 999);
    list = list.filter((r) => {
      const d = parsePurchaseDate(r);
      return d >= start && d <= end;
    });
  } else if (purchaseDatePreset.value === 'last_90') {
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getTime());
    end.setHours(23, 59, 59, 999);
    list = list.filter((r) => {
      const d = parsePurchaseDate(r);
      return d >= start && d <= end;
    });
  } else if (purchaseDatePreset.value === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    list = list.filter((r) => {
      const d = parsePurchaseDate(r);
      return d >= start && d <= end;
    });
  } else if (purchaseDatePreset.value === 'custom') {
    if (customStartDate.value) {
      const start = new Date(customStartDate.value + 'T00:00:00');
      list = list.filter((r) => parsePurchaseDate(r) >= start);
    }
    if (customEndDate.value) {
      const end = new Date(customEndDate.value + 'T23:59:59.999');
      list = list.filter((r) => parsePurchaseDate(r) <= end);
    }
  }

  // 2. Type / Status Filter
  if (purchaseTypeFilter.value === 'subscription') {
    list = list.filter((r) => r.type === 'subscription' && r.status !== 'refunded');
  } else if (purchaseTypeFilter.value === 'one-time') {
    list = list.filter((r) => r.type === 'one-time' && r.status !== 'refunded');
  } else if (purchaseTypeFilter.value === 'refunded') {
    list = list.filter((r) => r.status === 'refunded');
  }

  // 3. Search Query
  const q = purchaseSearchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.planName?.toLowerCase().includes(q) ||
        r.receiptId?.toLowerCase().includes(q) ||
        r.method?.toLowerCase().includes(q) ||
        r.date?.toLowerCase().includes(q)
    );
  }

  // 4. Sort Order
  list.sort((a, b) => {
    const tA = parsePurchaseDate(a).getTime();
    const tB = parsePurchaseDate(b).getTime();
    return purchaseSortOrder.value === 'desc' ? tB - tA : tA - tB;
  });

  return list;
});

// Summary Metrics for filtered view
const purchaseSummary = computed(() => {
  const list = filteredPurchases.value;
  const nonRefunded = list.filter((r) => r.status !== 'refunded');
  const totalSpent = nonRefunded.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalPoints = nonRefunded.reduce((sum, r) => sum + (r.points || 0), 0);
  return {
    count: list.length,
    totalSpent,
    totalPoints,
    refundedCount: list.filter((r) => r.status === 'refunded').length,
  };
});

const hasActivePurchaseFilters = computed(() => {
  return (
    purchaseDatePreset.value !== 'all' ||
    Boolean(customStartDate.value) ||
    Boolean(customEndDate.value) ||
    purchaseTypeFilter.value !== 'all' ||
    Boolean(purchaseSearchQuery.value.trim())
  );
});

const clearPurchaseFilters = () => {
  purchaseDatePreset.value = 'all';
  customStartDate.value = '';
  customEndDate.value = '';
  purchaseTypeFilter.value = 'all';
  purchaseSearchQuery.value = '';
};

// Clipboard copy feedback
const copiedReceiptId = ref(null);
let copyTimeout = null;
const copyReceipt = (receiptId) => {
  if (!receiptId) return;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(receiptId);
  }
  copiedReceiptId.value = receiptId;
  clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => {
    copiedReceiptId.value = null;
  }, 2000);
};
</script>
