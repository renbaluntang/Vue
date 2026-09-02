<script setup>
import { ref, computed } from "vue";
import PlanCheckout from "./points-purchase/PlanCheckout.vue";
import brightureLogo from "@/assets/logo-black.svg";
import { REFERRAL_CODE, referralUrl, referralShareMessage } from "@/lib/referral";
import { SUBSCRIPTION_PLANS, ONE_TIME_PLANS, TOP_UP_RATE, TOP_UP_PRESETS } from "@/lib/plans";

const props = defineProps({
  embedded: { type: Boolean, default: false },
});


const planTotal = (plan) => Number(plan.price.replace(/[^0-9.]/g, ""));
const validityDays = (plan) => Number(plan.validity.replace(/[^0-9]/g, ""));

const formatDate = (date) =>
  date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const addOneMonth = () => {
  const date = new Date();
  const dayOfMonth = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  const lastDayOfTarget = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(dayOfMonth, lastDayOfTarget));
  return date;
};

const unitPrice = (plan) => planTotal(plan) / plan.points;
const formatUnitPrice = (plan) => `$${unitPrice(plan).toFixed(2)} / pt`;

const SUBSCRIPTION_HIGHLIGHTS = [
  "Points refresh automatically every cycle",
  "Extended 45-day validity window",
  "Lowest per-point cost (from $3.75/pt)",
  "Cancel or pause anytime in Settings",
];

const ONE_TIME_HIGHLIGHTS = [
  "Pay once — no recurring charges",
  "Starts at just $25 for 5 points",
  "Validity up to 90 days",
  "No commitments or subscriptions",
];

const ADDITIONAL_POINTS_HIGHLIGHTS = [
  "Add 1–10 points whenever you run low",
  `$${TOP_UP_RATE}.00 per point flat rate`,
  "Inherits your active plan's expiry date",
  "Instantly added to your point balance",
];

const planType = ref("subscription");
const selectedPlanId = ref("sub-40");
const additionalPointsCount = ref(3);
const agreedToTerms = ref(false);
const showCheckout = ref(false);

const activePlans = computed(() => {
  if (planType.value === "subscription") return SUBSCRIPTION_PLANS;
  if (planType.value === "one-time") return ONE_TIME_PLANS;
  return [];
});

const selectedPlan = computed(() => {
  if (planType.value === "additional-points") return null;
  return activePlans.value.find((p) => p.id === selectedPlanId.value) || null;
});

const selectPlanType = (type) => {
  planType.value = type;
  if (type === "subscription") {
    selectedPlanId.value = "sub-40";
  } else if (type === "one-time") {
    selectedPlanId.value = "one-20";
  } else {
    selectedPlanId.value = null;
  }
};

const checkoutSummary = computed(() => {
  if (planType.value === "additional-points") {
    const count = additionalPointsCount.value;
    return {
      name: `${count} Additional ${count === 1 ? "Point" : "Points"}`,
      total: count * TOP_UP_RATE,
      recurring: false,
      schedule: null,
      features: [
        { iconClass: "fa-solid fa-bolt text-amber-500", text: `${count} ${count === 1 ? "point" : "points"} added to your balance immediately` },
        { iconClass: "fa-solid fa-wallet text-indigo-500", text: `$${TOP_UP_RATE}.00 per point, flat pricing` },
        { iconClass: "fa-solid fa-clock text-slate-400", text: "Inherits your active expiry date" },
        { iconClass: "fa-solid fa-user-group text-blue-500", text: "Book any teacher across all available subjects" },
      ],
    };
  }

  const plan = selectedPlan.value;
  if (!plan) return null;

  const isSubscription = planType.value === "subscription";
  return {
    name: `${plan.name} plan`,
    total: planTotal(plan),
    recurring: isSubscription,
    schedule: isSubscription
      ? { label: "Renews on", date: formatDate(addOneMonth()) }
      : { label: "Points valid until", date: formatDate(addDays(validityDays(plan))) },
    features: [
      {
        iconClass: isSubscription ? "fa-solid fa-arrows-rotate text-sky-500" : "fa-solid fa-bolt text-emerald-500",
        text: isSubscription
          ? `${plan.points} points automatically refreshed each month`
          : `${plan.points} points loaded instantly`,
      },
      { iconClass: "fa-solid fa-clock text-slate-400", text: `Points valid for ${plan.validity}` },
      { iconClass: "fa-solid fa-wallet text-indigo-500", text: `${formatUnitPrice(plan)} value` },
      { iconClass: "fa-solid fa-user-group text-blue-500", text: "Access all instructors and lesson subjects" },
      isSubscription
        ? { iconClass: "fa-solid fa-calendar-days text-sky-500", text: "Cancel or modify anytime in Student Settings" }
        : { iconClass: "fa-solid fa-circle-check text-emerald-500", text: "Single one-time payment, no recurring charge" },
    ],
  };
});

const canProceed = computed(() => {
  if (!agreedToTerms.value) return false;
  if (planType.value === "additional-points") return additionalPointsCount.value > 0;
  return !!selectedPlanId.value;
});

const handlePurchase = () => {
  if (!canProceed.value) return;
  showCheckout.value = true;
};

const closeCheckout = () => {
  showCheckout.value = false;
};

const confirmPayment = () => {
  showCheckout.value = false;
  alert(`Order confirmed for ${checkoutSummary.value?.name}! Your points balance has been updated.`);
};

// ----- Refer a Friend -----
const showReferModal = ref(false);
const referralCode = ref(REFERRAL_CODE);
const referralLink = computed(() => referralUrl(referralCode.value));
const copied = ref(false);

const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2500);
  } catch {
    // fallback: select the input
  }
};

const shareVia = (channel) => {
  const msg = encodeURIComponent(referralShareMessage(referralCode.value));
  const urls = {
    whatsapp: `https://wa.me/?text=${msg}`,
    twitter:  `https://twitter.com/intent/tweet?text=${msg}`,
    email:    `mailto:?subject=${encodeURIComponent('Join me on Brighture!')}&body=${msg}`,
  };
  window.open(urls[channel], '_blank');
};
</script>

<template>
  <div
    :class="`w-full text-slate-800 antialiased ${
      props.embedded ? 'px-4 py-4 sm:px-6 sm:py-6 lg:px-10' : 'min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8'
    }`"
  >
    <div class="mx-auto max-w-5xl space-y-8 sm:space-y-10">
      
      <!-- Top Brand Header (Standalone view only) -->
      <div v-if="!props.embedded" class="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
        <a href="#" class="inline-flex items-center gap-2">
          <img :src="brightureLogo" alt="Brighture" class="h-8 w-auto" />
        </a>
        <div class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-sm backdrop-blur-sm">
          <i class="fa-solid fa-wand-magic-sparkles text-amber-500 text-xs"></i>
          <span>Flexible Points for All 1-on-1 Lessons</span>
        </div>
      </div>

      <!-- Page Title & Subtitle -->
      <div v-if="!props.embedded" class="text-center">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Purchase Points
        </h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
          Choose a recurring subscription for steady progress or purchase on-demand points with full flexibility.
        </p>
      </div>

      <!-- ===== Refer a Friend Banner ===== -->
      <div
        v-if="!props.embedded"
        class="mx-auto max-w-4xl relative overflow-hidden rounded-2xl cursor-pointer select-none"
        style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #0ea5e9 100%);"
        @click="showReferModal = true"
      >
        <!-- Decorative blobs -->
        <div class="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-2xl"></div>

        <div class="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <!-- Left: icon + text -->
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <i class="fa-solid fa-user-plus text-2xl text-white"></i>
            </div>
            <div>
                <h3 class="text-lg font-extrabold text-white leading-tight">
                Refer a Friend — Earn 5 Points
              </h3>
              <p class="mt-0.5 text-sm text-violet-100">
                Your friend gets <span class="font-bold text-white">$20 USD off</span> their plan &mdash; you earn <span class="font-bold text-white">5 points</span> once they buy a plan and start learning.
              </p>
            </div>
          </div>

          <!-- Right: CTA -->
          <button
            type="button"
            class="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-violet-700 shadow-lg shadow-violet-900/30 transition hover:bg-violet-50 hover:scale-105 active:scale-95"
            @click.stop="showReferModal = true"
          >
            <i class="fa-solid fa-share-nodes text-sm"></i>
            Share & Earn
          </button>
        </div>
      </div>
      <!-- ===== /Refer a Friend Banner ===== -->

      <!-- Mobile & Tablet Segmented Tab Switcher -->
      <div class="mx-auto max-w-xl">
        <div class="relative flex rounded-2xl bg-slate-200/80 p-1.5 shadow-inner backdrop-blur-md">
          <button
            type="button"
            @click="selectPlanType('subscription')"
            :class="`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-1.5 py-2.5 sm:py-3 text-[11px] sm:text-sm font-bold transition-all duration-200 ${
              planType === 'subscription'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900'
            }`"
          >
            <i class="fa-solid fa-calendar-days text-sky-600 shrink-0 text-xs sm:text-sm"></i>
            <span class="truncate">Subscription</span>
            <span class="hidden sm:inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
              Popular
            </span>
          </button>

          <button
            type="button"
            @click="selectPlanType('one-time')"
            :class="`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-1.5 py-2.5 sm:py-3 text-[11px] sm:text-sm font-bold transition-all duration-200 ${
              planType === 'one-time'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900'
            }`"
          >
            <i class="fa-solid fa-bolt text-emerald-600 shrink-0 text-xs sm:text-sm"></i>
            <span class="truncate">One-Time</span>
          </button>

          <button
            type="button"
            @click="selectPlanType('additional-points')"
            :class="`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-1.5 py-2.5 sm:py-3 text-[11px] sm:text-sm font-bold transition-all duration-200 ${
              planType === 'additional-points'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900'
            }`"
          >
            <i class="fa-solid fa-circle-plus text-purple-600 shrink-0 text-xs sm:text-sm"></i>
            <span class="truncate">Top-up</span>
          </button>
        </div>
      </div>

      <!-- Plan Category Feature Highlights Banner -->
      <div
        :class="`mx-auto max-w-4xl rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
          planType === 'subscription'
            ? 'border-sky-200 bg-gradient-to-r from-sky-50/90 to-blue-50/50 text-sky-950'
            : planType === 'one-time'
            ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 text-emerald-950'
            : 'border-purple-200 bg-gradient-to-r from-purple-50/90 to-indigo-50/50 text-purple-950'
        }`"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              :class="`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                planType === 'subscription'
                  ? 'bg-sky-600'
                  : planType === 'one-time'
                  ? 'bg-emerald-600'
                  : 'bg-purple-600'
              }`"
            >
              <i v-if="planType === 'subscription'" class="fa-solid fa-calendar-days text-lg"></i>
              <i v-else-if="planType === 'one-time'" class="fa-solid fa-bolt text-lg"></i>
              <i v-else class="fa-solid fa-circle-plus text-lg"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900">
                {{
                  planType === "subscription"
                    ? "Monthly Auto-Refreshed Subscriptions"
                    : planType === "one-time"
                    ? "Fixed One-Time Point Bundles"
                    : "Flexible Top-up Points"
                }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 mt-0.5">
                {{
                  planType === "subscription"
                    ? "Best value for steady progress. Points refresh each month with a 45-day validity."
                    : planType === "one-time"
                    ? "Purchase points once without any recurring fees. Ideal for flexible schedules."
                    : "Add 1 to 10 points to top-up your balance. Inherits your current expiry date."
                }}
              </p>
            </div>
          </div>

          <!-- Feature bullet chips -->
          <div class="flex flex-wrap gap-2 sm:justify-end">
            <span
              v-for="h in (planType === 'subscription' ? SUBSCRIPTION_HIGHLIGHTS : planType === 'one-time' ? ONE_TIME_HIGHLIGHTS : ADDITIONAL_POINTS_HIGHLIGHTS).slice(0, 2)"
              :key="h"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold shadow-xs backdrop-blur-xs text-slate-700"
            >
              <i class="fa-solid fa-check text-emerald-600 text-xs"></i>
              {{ h }}
            </span>
          </div>
        </div>
      </div>

      <!-- Step 2: Plan Selection Cards (Subscription & One-Time) -->
      <div v-if="planType !== 'additional-points'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              1
            </span>
            <h3 class="text-lg font-bold text-slate-900">
              Select Your Plan
            </h3>
          </div>
          <span class="text-xs text-slate-500 font-medium">
            Tap a card to select
          </span>
        </div>

        <!-- Responsive Card Grid: 1 col on mobile, 2 col on tablet, 3-4 col on desktop -->
        <div
          :class="`grid gap-4 sm:gap-6 ${
            activePlans.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`"
        >
          <div
            v-for="plan in activePlans"
            :key="plan.id"
            @click="selectedPlanId = plan.id"
            :class="`group relative flex flex-col justify-between rounded-2xl border-2 p-5 sm:p-6 transition-all duration-200 cursor-pointer ${
              selectedPlanId === plan.id
                ? planType === 'subscription'
                  ? 'border-sky-500 bg-sky-50/40 shadow-lg ring-4 ring-sky-500/10 -translate-y-0.5'
                  : 'border-emerald-500 bg-emerald-50/40 shadow-lg ring-4 ring-emerald-500/10 -translate-y-0.5'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }`"
          >
            <!-- Badge: Popular or Best Value -->
            <div
              v-if="plan.popular"
              class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 shadow-sm"
            >
              ★ Most Popular
            </div>
            <div
              v-else-if="plan.bestValue"
              class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-700 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm"
            >
              Best Value
            </div>

            <div>
              <!-- Card Header / Title + Radio Selector -->
              <div class="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h4 class="text-base font-bold text-slate-900 group-hover:text-slate-800">
                    {{ plan.name }}
                  </h4>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {{ plan.description }}
                  </p>
                </div>
                <div
                  :class="`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    selectedPlanId === plan.id
                      ? planType === 'subscription'
                        ? 'border-sky-500 bg-sky-500 text-white'
                        : 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`"
                >
                  <i v-if="selectedPlanId === plan.id" class="fa-solid fa-check text-xs"></i>
                </div>
              </div>

              <!-- Price & Unit Rate -->
              <div class="my-4 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100/80">
                <div class="flex items-baseline justify-between gap-2">
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                      {{ plan.price }}
                    </span>
                    <span v-if="planType === 'subscription'" class="text-xs font-semibold text-slate-500">
                      / month
                    </span>
                  </div>
                  <span class="rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {{ formatUnitPrice(plan) }}
                  </span>
                </div>

                <div v-if="plan.savings" class="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
                  {{ plan.savings }}
                </div>
              </div>

              <!-- Plan Details & Features -->
              <div class="space-y-2.5 pt-2 text-xs sm:text-sm">
                <div class="flex items-center justify-between text-slate-700">
                  <span class="flex items-center gap-2 text-slate-500">
                    <i class="fa-solid fa-bolt text-amber-500 text-sm"></i>
                    Points
                  </span>
                  <span class="font-bold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md">
                    {{ plan.points }} pts
                  </span>
                </div>

                <div class="flex items-center justify-between text-slate-700">
                  <span class="flex items-center gap-2 text-slate-500">
                    <i class="fa-solid fa-clock text-slate-400 text-sm"></i>
                    Validity
                  </span>
                  <span class="font-semibold text-slate-700">
                    {{ plan.validity }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Selection CTA -->
            <div class="mt-5 pt-3 border-t border-slate-100">
              <div
                :class="`w-full rounded-xl py-2 text-center text-xs font-bold transition-colors ${
                  selectedPlanId === plan.id
                    ? planType === 'subscription'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                }`"
              >
                {{ selectedPlanId === plan.id ? "Selected Plan" : "Choose Plan" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Points Top-Up Interactive Panel -->
      <div v-else class="mx-auto max-w-2xl rounded-3xl border-2 border-purple-200 bg-white p-6 sm:p-8 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              1
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Custom Top-Up Points</h3>
              <p class="text-xs text-slate-500">Choose between 1 and 10 points</p>
            </div>
          </div>
          <span class="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            ${{ TOP_UP_RATE }}.00 / pt
          </span>
        </div>

        <div class="flex flex-col items-center">
          <!-- Total Price Banner -->
          <div class="text-center mb-6">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Price</p>
            <div class="mt-1 text-5xl sm:text-6xl font-black text-slate-900">
              ${{ additionalPointsCount * TOP_UP_RATE }}
            </div>
            <p class="mt-1 text-xs text-slate-500 font-medium">
              {{ additionalPointsCount }} {{ additionalPointsCount === 1 ? 'point' : 'points' }} × ${{ TOP_UP_RATE }}.00
            </p>
          </div>

          <!-- Stepper Controller -->
          <div class="flex items-center justify-center gap-4 sm:gap-6 mb-6">
            <button
              type="button"
              @click="additionalPointsCount = Math.max(1, additionalPointsCount - 1)"
              :disabled="additionalPointsCount <= 1"
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Decrease points"
            >
              <i class="fa-solid fa-minus text-sm"></i>
            </button>

            <div class="min-w-[90px] sm:min-w-[120px] text-center">
              <span class="text-4xl font-extrabold text-purple-950">{{ additionalPointsCount }}</span>
              <span class="block text-xs font-bold uppercase tracking-wider text-purple-600">Points</span>
            </div>

            <button
              type="button"
              @click="additionalPointsCount = Math.min(10, additionalPointsCount + 1)"
              :disabled="additionalPointsCount >= 10"
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-600/20 cursor-pointer"
              aria-label="Increase points"
            >
              <i class="fa-solid fa-plus text-sm"></i>
            </button>
          </div>

          <!-- Preset Quick Pills -->
          <div class="mb-8 flex flex-wrap items-center justify-center gap-2">
            <button
              v-for="count in TOP_UP_PRESETS"
              :key="count"
              type="button"
              @click="additionalPointsCount = count"
              :class="`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                additionalPointsCount === count
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`"
            >
              {{ count }} pts
            </button>
          </div>

          <!-- Expiry Notice Box -->
          <div class="w-full rounded-2xl bg-purple-50/80 p-4 border border-purple-100 text-xs sm:text-sm text-purple-900">
            <div class="flex items-start gap-2.5">
              <i class="fa-solid fa-circle-info text-purple-600 text-base shrink-0 mt-0.5"></i>
              <div>
                <p class="font-bold text-purple-950">Expiry Date Rule</p>
                <p class="mt-0.5 text-purple-800 leading-relaxed">
                  Additional top-up points inherit the expiration date of your current active points balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Terms & Summary Action Section -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div class="flex items-center gap-2 mb-6">
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            2
          </span>
          <h3 class="text-lg font-bold text-slate-900">
            Terms & Confirmation
          </h3>
        </div>

        <div class="grid gap-6 md:grid-cols-2 md:items-center">
          <!-- Terms Agreement Checkbox -->
          <div class="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-100">
            <label class="flex items-start gap-3 cursor-pointer select-none">
              <div class="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  v-model="agreedToTerms"
                  class="peer sr-only"
                />
                <div class="h-6 w-6 rounded-lg border-2 border-slate-300 bg-white transition peer-checked:border-amber-400 peer-checked:bg-amber-400"></div>
                <i class="fa-solid fa-check absolute text-xs text-slate-900 opacity-0 transition peer-checked:opacity-100"></i>
              </div>
              <div class="text-xs sm:text-sm text-slate-700 leading-normal">
                <span class="font-semibold text-slate-900">I have read and agree to the </span>
                <a href="#" class="font-bold text-sky-600 underline underline-offset-2 hover:text-sky-800">
                  Terms of Service
                </a>
                <span> and understand the point validity policy.</span>
              </div>
            </label>
          </div>

          <!-- Summary & Action CTA Button -->
          <div class="flex flex-col items-center sm:items-end justify-center gap-3">
            <div v-if="checkoutSummary" class="text-center sm:text-right">
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Due Today</p>
              <div class="text-2xl sm:text-3xl font-black text-slate-900">
                ${{ checkoutSummary.total }}
                <span v-if="checkoutSummary.recurring" class="text-sm font-bold text-slate-500">/ month</span>
              </div>
              <p class="text-xs text-slate-500">
                {{ checkoutSummary.name }}
              </p>
            </div>

            <button
              type="button"
              :disabled="!canProceed"
              @click="handlePurchase"
              :class="`group relative flex w-full sm:w-auto items-center justify-center gap-2 whitespace-nowrap rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-extrabold shadow-md transition-all duration-200 active:scale-[0.98] ${
                canProceed
                  ? 'bg-[#FFCD00] text-slate-950 hover:bg-[#FFD700] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`"
            >
              <i class="fa-solid fa-credit-card text-slate-950/80 text-sm sm:text-base"></i>
              <span>Proceed to Checkout</span>
              <i :class="`fa-solid fa-arrow-right text-sm transition-transform ${canProceed ? 'group-hover:translate-x-1' : ''}`"></i>
            </button>

            <div class="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <i class="fa-solid fa-shield-halved text-emerald-600 text-xs"></i>
              <span>256-bit Encrypted & Secure Checkout via Stripe / PayPal</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Confirmation & Payment Modal -->
    <PlanCheckout
      v-if="showCheckout && checkoutSummary"
      :summary="checkoutSummary"
      @back="closeCheckout"
      @confirm="confirmPayment"
    />

    <!-- ===== Refer a Friend Modal ===== -->
    <Transition name="refer-fade">
      <div
        v-if="showReferModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-sm"
        @click.self="showReferModal = false"
      >
        <div
          class="relative w-full max-w-md overflow-y-auto max-h-[92vh] supports-[max-height:100dvh]:max-h-[92dvh] rounded-t-[28px] sm:rounded-3xl bg-white text-slate-800 shadow-2xl"
          @click.stop
        >
          <!-- Gradient header -->
          <div
            class="relative px-6 pt-8 pb-6 text-center"
            style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%);"
          >
            <!-- Close -->
            <button
              type="button"
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer"
              @click="showReferModal = false"
              aria-label="Close"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- Icon -->
            <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
              <i class="fa-solid fa-gift text-3xl text-white"></i>
            </div>
            <h2 class="text-xl font-black text-white">Refer a Friend</h2>
            <p class="mt-1 text-sm text-violet-100">Share your link. Both of you benefit.</p>
          </div>

          <div class="px-6 py-6 space-y-5">
            <!-- Reward cards -->
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-center">
                <i class="fa-solid fa-bolt text-2xl text-violet-500 mb-1"></i>
                <p class="text-xl font-black text-violet-900">+5 pts</p>
                <p class="text-xs text-violet-600 font-semibold">You earn</p>
                <p class="text-[10px] text-violet-400 mt-0.5">after friend's 1st purchase</p>
              </div>
              <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                <i class="fa-solid fa-tag text-2xl text-emerald-500 mb-1"></i>
                <p class="text-xl font-black text-emerald-900">$20 off</p>
                <p class="text-xs text-emerald-600 font-semibold">Friend gets</p>
                <p class="text-[10px] text-emerald-400 mt-0.5">on their first plan</p>
              </div>
            </div>

            <!-- Referral link copy box -->
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Referral Link</p>
              <div class="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5">
                <i class="fa-solid fa-link text-slate-400 text-xs shrink-0"></i>
                <span class="flex-1 truncate text-xs text-slate-700 font-mono select-all">{{ referralLink }}</span>
                <button
                  type="button"
                  @click="copyReferralLink"
                  :class="`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`"
                >
                  <i :class="copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>

            <!-- Code pill -->
            <div class="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-ticket text-amber-500"></i>
                <span class="text-xs font-semibold text-amber-700">Your code:</span>
                <span class="font-black text-sm tracking-widest text-amber-900">{{ referralCode }}</span>
              </div>
              <button
                type="button"
                @click="copyReferralLink"
                class="text-[10px] font-bold text-amber-600 hover:text-amber-800 cursor-pointer transition"
              >
                Copy link
              </button>
            </div>

            <!-- Share buttons -->
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Share via</p>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="shareVia('whatsapp')"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  <i class="fa-brands fa-whatsapp text-base"></i>
                  WhatsApp
                </button>
                <button
                  type="button"
                  @click="shareVia('twitter')"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  <i class="fa-brands fa-x-twitter text-base"></i>
                  X / Twitter
                </button>
                <button
                  type="button"
                  @click="shareVia('email')"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-700 py-2.5 text-xs font-bold text-white hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  <i class="fa-solid fa-envelope text-base"></i>
                  Email
                </button>
              </div>
            </div>

            <!-- T&C note -->
            <p class="text-center text-[10px] text-slate-400">
              Points awarded after friend completes their first purchase. See
              <a href="#" class="underline hover:text-slate-600">Referral Terms</a> for details.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
