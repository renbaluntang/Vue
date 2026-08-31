<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import brightureLogo from "@/assets/logo-black.svg";

const props = defineProps({
  /** Built by the plan page — see `checkoutSummary` in PointsPurchase.vue. */
  summary: { type: Object, required: true },
});

const emit = defineEmits(["back", "confirm"]);

const paymentMethod = ref("card"); // 'card' or 'paypal'
const isProcessing = ref(false);

const money = (value) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const onKeydown = (event) => {
  if (event.key === "Escape") emit("back");
};

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});

const handleConfirm = () => {
  isProcessing.value = true;
  setTimeout(() => {
    isProcessing.value = false;
    emit("confirm");
  }, 600);
};
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs transition-opacity duration-300"
    @click="emit('back')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-plan-name"
      class="max-h-[92vh] sm:max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] sm:rounded-3xl bg-white text-slate-800 shadow-2xl transition-all"
      @click.stop
    >
      <!-- Mobile Drag Handle Bar -->
      <div class="flex sm:hidden justify-center pt-3 pb-1">
        <div class="h-1.5 w-12 rounded-full bg-slate-300"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div class="flex items-center gap-2">
          <img :src="brightureLogo" alt="Brighture" class="h-6 w-auto" />
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Checkout</span>
        </div>
        <button
          type="button"
          @click="emit('back')"
          class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="px-6 py-5 space-y-6">
        <!-- Item Overview Card -->
        <div class="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 border border-slate-200/80">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-xs border border-slate-100">
                <i class="fa-solid fa-bolt text-2xl text-amber-500"></i>
              </span>
              <div>
                <h2 id="checkout-plan-name" class="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  {{ summary.name }}
                </h2>
                <p class="text-xs font-semibold text-slate-500">Brighture 1-on-1 Lesson Points</p>
              </div>
            </div>
          </div>

          <!-- Price Row -->
          <div class="mt-4 pt-3 border-t border-slate-200/70 flex items-baseline justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {{ summary.recurring ? "Monthly Rate" : "Amount Due" }}
            </span>
            <div class="text-2xl font-black text-slate-900">
              {{ money(summary.total) }}
              <span v-if="summary.recurring" class="text-xs font-bold text-slate-500">/ month</span>
            </div>
          </div>

          <!-- Schedule or Expiry info -->
          <div v-if="summary.schedule" class="mt-2 flex items-center justify-between text-xs text-slate-600 bg-white/70 px-3 py-1.5 rounded-lg">
            <span class="flex items-center gap-1.5 font-medium">
              <i class="fa-solid fa-calendar-days text-slate-400 text-xs"></i>
              {{ summary.schedule.label }}
            </span>
            <span class="font-bold text-slate-900">{{ summary.schedule.date }}</span>
          </div>
        </div>

        <!-- Payment Method Tabs -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Payment Method
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="paymentMethod = 'card'"
              :class="`flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`"
            >
              <i class="fa-solid fa-credit-card text-sm"></i>
              <span>Credit / Debit Card</span>
            </button>

            <button
              type="button"
              @click="paymentMethod = 'paypal'"
              :class="`flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'paypal'
                  ? 'border-[#003087] bg-[#003087] text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`"
            >
              <i class="fa-brands fa-paypal text-base text-[#0079C1]"></i>
              <span class="font-black italic text-sm tracking-tighter">PayPal</span>
            </button>
          </div>
        </div>

        <!-- What's included checklist -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Included in this plan
          </h3>
          <ul class="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <li
              v-for="feature in summary.features"
              :key="feature.text"
              class="flex items-start gap-2.5"
            >
              <i :class="feature.iconClass || 'fa-solid fa-circle-check text-emerald-600'" class="text-sm shrink-0 mt-0.5"></i>
              <span>{{ feature.text }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer & Confirm Button -->
      <div class="border-t border-slate-100 bg-slate-50/50 px-6 py-5 space-y-4">
        <p class="text-[11px] leading-relaxed text-slate-500">
          <template v-if="summary.recurring">
            By clicking "Confirm Subscription", you authorize monthly charges of {{ money(summary.total) }} until cancelled. You can pause or cancel anytime from Settings.
          </template>
          <template v-else>
            By clicking "Complete Purchase", you authorize a one-time payment of {{ money(summary.total) }}. Points will be credited immediately.
          </template>
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <i class="fa-solid fa-lock text-emerald-600 text-xs"></i>
            <span>Secure 256-bit SSL</span>
          </div>

          <button
            type="button"
            :disabled="isProcessing"
            @click="handleConfirm"
            class="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#FFCD00] px-8 py-3.5 text-sm font-extrabold text-slate-950 shadow-md transition-all hover:bg-[#FFD700] hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span v-if="isProcessing">
              <i class="fa-solid fa-circle-notch fa-spin text-sm mr-1.5"></i>
              Processing...
            </span>
            <template v-else>
              <span>{{ summary.recurring ? "Confirm Subscription" : "Complete Purchase" }}</span>
              <i class="fa-solid fa-arrow-right text-xs"></i>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
