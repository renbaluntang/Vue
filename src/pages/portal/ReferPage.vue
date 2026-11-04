<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
    <!-- Page Header with Points Balance pill -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Refer a Friend
          </h1>
        </div>
        <p class="mt-1 text-sm text-slate-500 font-medium">
          Give {{ terms.friendDiscountLabel }} USD off for friends, earn {{ terms.referrerPoints }} points for every referral.
        </p>
      </div>

      <!-- Quick balance indicator linking to point history -->
      <RouterLink
        to="/points"
        class="inline-flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-2.5 transition hover:bg-amber-100 hover:border-amber-300 active:scale-[0.98] shadow-2xs group"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/30 text-amber-900">
          <img :src="coinsImage" alt="Coins" class="h-5 w-auto" />
        </div>
        <div>
          <span class="block text-[10px] font-bold uppercase tracking-wider text-amber-800">Your points balance</span>
          <span class="block text-sm font-black text-slate-950">
            {{ user.profile.pointsBalance }} pts
            <span class="text-xs font-semibold text-brighture-bronze group-hover:translate-x-0.5 transition-transform inline-block ml-0.5">→</span>
          </span>
        </div>
      </RouterLink>
    </div>

    <!-- 1. Hero Promo Banner: cohesive with dashboard aesthetic -->
    <section class="relative overflow-hidden rounded-3xl border border-slate-900/40 bg-gradient-to-br from-[#0B0F19] via-[#1A1A3A] to-[#2A184A] text-white shadow-sm">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent"></div>
      <span aria-hidden="true" class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#FFCD00]/10 blur-3xl"></span>
      <span aria-hidden="true" class="pointer-events-none absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl"></span>

      <div class="relative z-10 grid grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:p-10">
        <div class="space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-2xs">
              <i class="fa-solid fa-gift text-[11px]" aria-hidden="true"></i>
              Referral Program
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-200/90">
              <i class="fa-solid fa-sparkles text-[10px] text-amber-300"></i> No referral limits
            </span>
          </div>

          <div>
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Give {{ terms.friendDiscountLabel }}, get {{ terms.referrerPoints }} points
            </h2>
            <p class="mt-2.5 max-w-lg text-sm sm:text-base leading-relaxed text-indigo-100/85">
              Invite friends to learn 1-on-1 English with Brighture. They save on their first plan, and you earn points to book your next classes.
            </p>
          </div>

          <!-- Dual Perks Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div class="rounded-2xl border border-indigo-300/30 bg-indigo-500/15 p-3.5 backdrop-blur-xs">
              <div class="flex items-center gap-1.5 text-indigo-200">
                <i class="fa-solid fa-tag text-xs" aria-hidden="true"></i>
                <span class="text-[10px] font-extrabold uppercase tracking-wide">Friend receives</span>
              </div>
              <p class="mt-1 text-2xl font-black leading-none tracking-tight text-white">
                {{ terms.friendDiscountLabel }} <span class="text-xs font-bold text-indigo-200">OFF</span>
              </p>
              <p class="mt-1 text-[11px] text-indigo-100/75">
                their first plan purchase (valid for {{ terms.windowDays }} days)
              </p>
            </div>

            <div class="rounded-2xl border border-amber-300/35 bg-amber-400/15 p-3.5 backdrop-blur-xs">
              <div class="flex items-center gap-1.5 text-amber-300">
                <i class="fa-solid fa-coins text-xs" aria-hidden="true"></i>
                <span class="text-[10px] font-extrabold uppercase tracking-wide">You receive</span>
              </div>
              <p class="mt-1 text-2xl font-black leading-none tracking-tight text-white">
                +{{ terms.referrerPoints }} <span class="text-xs font-bold text-amber-300">POINTS</span>
              </p>
              <p class="mt-1 text-[11px] text-amber-100/75">
                credited to your balance to book online classes
              </p>
            </div>
          </div>

          <!-- Quick Hero Action row -->
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              @click="shareOrCopy"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-brighture-gold px-5 py-3 text-sm font-extrabold text-slate-950 shadow-md transition hover:bg-[#FFD933] active:scale-[0.98] cursor-pointer"
            >
              <i :class="linkCopied ? 'fa-solid fa-check' : canShare ? 'fa-solid fa-share-nodes' : 'fa-regular fa-copy'" aria-hidden="true"></i>
              <span>{{ linkCopied ? 'Invite link copied!' : canShare ? 'Share invite' : 'Copy invite link' }}</span>
            </button>
            <button
              type="button"
              @click="showQrModal = true"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] cursor-pointer"
            >
              <i class="fa-solid fa-qrcode text-amber-300" aria-hidden="true"></i>
              <span>Show QR code</span>
            </button>
          </div>
        </div>

        <!-- Illustration with badge -->
        <div class="relative mx-auto flex items-center justify-center w-full max-w-sm lg:max-w-none">
          <div class="relative">
            <img
              :src="referralIllustration"
              alt="Friends sharing referral code"
              class="h-auto max-h-56 sm:max-h-64 w-full object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.02]"
            />
            <div class="absolute -bottom-2 right-4 flex items-center gap-2 rounded-full bg-slate-950/90 border border-amber-400/40 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xl backdrop-blur-md">
              <img :src="coinsImage" alt="" class="h-4 w-4 shrink-0" />
              <span class="text-amber-300 font-black">+{{ terms.referrerPoints }} pts each</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Your Referral Performance (KPI Cards) -->
    <!-- Compact tiles: the numbers are the point, so each is one short row
         with an icon, the figure and its label. -->
    <section class="grid grid-cols-3 gap-2 sm:gap-3">
      <div class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 sm:flex">
          <i class="fa-solid fa-user-group text-sm" aria-hidden="true"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xl font-black leading-none tracking-tight text-slate-900">{{ referralStats.invited }}</p>
          <p class="mt-1 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500"><span class="sm:hidden">Invited</span><span class="hidden sm:inline">Friends invited</span></p>
        </div>
      </div>

      <div
        class="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm"
        :title="`${referralStats.pending === 1 ? '1 friend has' : `${referralStats.pending} friends have`} signed up; your bonus arrives when they buy a plan`"
      >
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-900 sm:flex">
          <i class="fa-solid fa-hourglass-half text-sm" aria-hidden="true"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xl font-black leading-none tracking-tight text-brighture-bronze">{{ referralStats.pending }}</p>
          <p class="mt-1 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800"><span class="sm:hidden">Pending</span><span class="hidden sm:inline">Pending bonus</span></p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-200/70 text-emerald-900 sm:flex">
          <i class="fa-solid fa-coins text-sm" aria-hidden="true"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xl font-black leading-none tracking-tight text-emerald-700">+{{ referralStats.pointsEarned }} <span class="text-xs font-bold">pts</span></p>
          <p class="mt-1 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800"><span class="sm:hidden">Earned</span><span class="hidden sm:inline">Points earned</span></p>
        </div>
      </div>
    </section>

    <!-- 3. Main Workspace: Share Toolkit (Left) & Activity / How It Works (Right) -->
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <!-- Left Column: Share Toolkit (7 cols) -->
      <div class="space-y-6 lg:col-span-7">
        <!-- The Toolkit Card -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h2 class="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-share-nodes text-brighture-bronze text-base"></i> Share your referral
            </h2>
            <p class="mt-1 text-xs text-slate-500">
              Share your link or code with friends. When they register and purchase their first plan, both of you are rewarded.
            </p>
          </div>

          <!-- Code Box -->
          <div class="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-ticket text-amber-500"></i> Your personal referral code
              </span>
              <span v-if="codeCopied" class="text-emerald-600 font-extrabold text-xs flex items-center gap-1">
                <i class="fa-solid fa-check text-[10px]"></i> Copied to clipboard!
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2.5 shadow-2xs font-mono text-base sm:text-lg font-black tracking-widest text-slate-900 select-all">
                {{ code }}
              </div>
              <button
                type="button"
                @click="copyCode"
                :class="codeCopied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-brighture-ink text-white hover:bg-slate-800 border-brighture-ink'"
                class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <i :class="codeCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="text-xs"></i>
                <span>{{ codeCopied ? 'Copied' : 'Copy code' }}</span>
              </button>
            </div>
            <p class="mt-2 text-[11px] text-slate-500">
              Friends can type this code manually into the referral code field during registration.
            </p>
          </div>

          <!-- Invite Link Box -->
          <div>
            <label for="referral-link" class="text-xs font-bold text-slate-700 block mb-1.5">
              Personal invite link (code automatically applied)
            </label>
            <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3.5 pr-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200/50">
              <i class="fa-solid fa-link shrink-0 text-xs text-slate-400" aria-hidden="true"></i>
              <input
                id="referral-link"
                :value="link"
                readonly
                class="min-w-0 flex-1 truncate bg-transparent font-mono text-xs text-slate-800 outline-none select-all"
                @focus="$event.target.select()"
              />
              <button
                type="button"
                @click="copyLink"
                :class="linkCopied ? 'bg-emerald-600 text-white' : 'bg-brighture-gold text-slate-950 hover:bg-[#FFD933]'"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-extrabold transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <i :class="linkCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" aria-hidden="true"></i>
                <span>{{ linkCopied ? 'Copied!' : 'Copy' }}</span>
              </button>
              <button
                type="button"
                @click="showQrModal = true"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 text-xs font-bold transition active:scale-95 cursor-pointer"
                title="Show QR Code"
              >
                <i class="fa-solid fa-qrcode text-amber-600"></i>
                <span class="hidden sm:inline">QR</span>
              </button>
            </div>
          </div>

          <!-- One-Click Sharing Channels -->
          <div>
            <p class="text-xs font-bold text-slate-700 mb-2">Send directly via</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                v-for="channel in channels"
                :key="channel.key"
                type="button"
                @click="shareVia(channel.key)"
                :class="channel.bg"
                class="flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <i :class="channel.icon" class="text-base" aria-hidden="true"></i>
                <span>{{ channel.label }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Ideas for sharing -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
          <h3 class="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-lightbulb text-amber-500"></i> Helpful ideas for sharing
          </h3>
          <ul class="mt-3.5 space-y-2">
            <li v-for="way in howTo" :key="way" class="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-brighture-bronze text-[10px] font-black mt-0.5">
                ✓
              </span>
              <span>{{ way }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Right Column: Activity, How it works & Details (5 cols) -->
      <div class="space-y-6 lg:col-span-5">
        <!-- 2. How it works (Timeline) -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h3 class="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-brighture-bronze text-sm"></i> How it works
          </h3>
          <ol class="space-y-3">
            <li
              v-for="(step, index) in steps"
              :key="step.title"
              class="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
            >
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brighture-gold text-brighture-ink text-xs font-black">
                {{ index + 1 }}
              </span>
              <div class="min-w-0">
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ step.title }}</p>
                <p class="mt-0.5 text-xs leading-relaxed text-slate-500">{{ step.detail }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- 3. Program Rules & Terms -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-3">
          <h3 class="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-circle-info text-slate-500 text-sm"></i> Program rules
          </h3>
          <ul class="space-y-2.5 text-xs text-slate-600">
            <li v-for="rule in rules" :key="rule.title" class="flex items-start gap-2.5">
              <i :class="rule.icon" class="mt-1 text-slate-400 text-xs shrink-0"></i>
              <div>
                <strong class="text-slate-800">{{ rule.title }}:</strong>
                <span class="text-slate-500 ml-1">{{ rule.detail }}</span>
              </div>
            </li>
          </ul>
          <p class="border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400">
            Points are credited to your balance as soon as your friend's initial payment clears. Brighture may update or modify terms at any time.
          </p>
        </section>
      </div>
    </div>

    <!-- QR Code Modal Dialog -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showQrModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          @click.self="showQrModal = false"
        >
          <div class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center">
            <!-- Close button -->
            <button
              type="button"
              @click="showQrModal = false"
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              aria-label="Close QR Modal"
            >
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>

            <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brighture-bronze">
              <i class="fa-solid fa-qrcode"></i> Instant Scan
            </span>
            <h4 class="mt-2 text-lg font-black text-slate-900">Scan to Register</h4>
            <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Have your friend scan this QR code with their phone camera to open registration with your referral code.
            </p>

            <!-- SVG QR Code Visualization -->
            <div class="mt-5 mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 border-2 border-slate-900 shadow-sm">
              <svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor">
                <!-- Outer corners -->
                <rect x="0" y="0" width="30" height="30" rx="4" />
                <rect x="6" y="6" width="18" height="18" fill="white" rx="2" />
                <rect x="10" y="10" width="10" height="10" />

                <rect x="70" y="0" width="30" height="30" rx="4" />
                <rect x="76" y="6" width="18" height="18" fill="white" rx="2" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" rx="4" />
                <rect x="6" y="76" width="18" height="18" fill="white" rx="2" />
                <rect x="10" y="80" width="10" height="10" />

                <!-- Data pixels matrix pattern -->
                <rect x="36" y="6" width="6" height="6" />
                <rect x="46" y="6" width="6" height="6" />
                <rect x="56" y="6" width="6" height="6" />
                <rect x="36" y="18" width="6" height="6" />
                <rect x="56" y="18" width="6" height="6" />
                <rect x="46" y="26" width="6" height="6" />

                <rect x="6" y="36" width="6" height="6" />
                <rect x="16" y="36" width="6" height="6" />
                <rect x="26" y="46" width="6" height="6" />
                <rect x="16" y="56" width="6" height="6" />

                <rect x="36" y="36" width="10" height="10" rx="2" />
                <rect x="54" y="36" width="8" height="8" />
                <rect x="44" y="52" width="12" height="12" rx="2" />
                <rect x="64" y="54" width="6" height="6" />
                <rect x="36" y="70" width="6" height="6" />
                <rect x="50" y="72" width="8" height="8" />

                <rect x="74" y="36" width="6" height="6" />
                <rect x="86" y="36" width="8" height="8" />
                <rect x="74" y="48" width="10" height="10" />
                <rect x="76" y="68" width="6" height="6" />
                <rect x="88" y="70" width="6" height="6" />
                <rect x="74" y="84" width="8" height="8" />
                <rect x="88" y="86" width="6" height="6" />
              </svg>
            </div>

            <!-- Code display pill -->
            <div class="mt-4 rounded-xl bg-slate-100 p-2 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Referral Code</span>
              <span class="font-mono text-base font-black tracking-widest text-slate-900">{{ code }}</span>
            </div>

            <div class="mt-4 flex gap-2">
              <button
                type="button"
                @click="copyLink"
                class="flex-1 rounded-xl bg-brighture-gold py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-[#FFD933] cursor-pointer"
              >
                {{ linkCopied ? 'Link copied!' : 'Copy invite link' }}
              </button>
              <button
                type="button"
                @click="showQrModal = false"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import {
  REFERRAL_CODE,
  REFERRAL_TERMS,
  REFERRAL_RULES,
  REFERRAL_HOW_TO,
  referralUrl,
  referralShareMessage,
} from '@/lib/referral';
import referralIllustration from '@/assets/referral-illustration.svg';
import coinsImage from '@/assets/coins.svg';

const user = useUserStore();
const terms = REFERRAL_TERMS;
const rules = REFERRAL_RULES;
const howTo = REFERRAL_HOW_TO;
const code = REFERRAL_CODE;
const link = referralUrl(code);
const sampleMessage = computed(() => referralShareMessage(code));

const codeCopied = ref(false);
const linkCopied = ref(false);
const canShare = ref(false);
const showQrModal = ref(false);

const steps = [
  {
    icon: 'fa-solid fa-share-nodes',
    title: 'Share your link or code',
    detail: 'Send your referral code or personal link to a friend via message, email, or social media.',
  },
  {
    icon: 'fa-solid fa-user-plus',
    title: 'Your friend signs up & saves',
    detail: `They get ${terms.friendDiscountLabel} USD off their first plan when purchasing within ${terms.windowDays} days of registration.`,
  },
  {
    icon: 'fa-solid fa-coins',
    title: `You get ${terms.referrerPoints} bonus points`,
    detail: 'Once their plan purchase completes, 5 points are immediately credited to your wallet to book classes.',
  },
];

const channels = [
  {
    key: 'line',
    label: 'LINE',
    icon: 'fa-brands fa-line',
    bg: 'bg-[#06C755] hover:bg-[#05b34c] text-white',
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    icon: 'fa-brands fa-x-twitter',
    bg: 'bg-black hover:bg-slate-800 text-white',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: 'fa-brands fa-facebook',
    bg: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'fa-solid fa-envelope',
    bg: 'bg-slate-800 hover:bg-slate-700 text-white',
  },
];

const referralStats = {
  invited: 3,
  pending: 1,
  pointsEarned: 10,
};

onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
});

const copy = async (text, flagRef) => {
  try {
    await navigator.clipboard.writeText(text);
    flagRef.value = true;
    setTimeout(() => { flagRef.value = false; }, 2500);
  } catch {
    /* clipboard unavailable */
  }
};

const copyCode = () => copy(code, codeCopied);
const copyLink = () => copy(link, linkCopied);

const shareOrCopy = async () => {
  if (canShare.value) {
    try {
      await navigator.share({
        title: 'Brighture English Referral',
        text: sampleMessage.value,
        url: link,
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  await copyLink();
};

const shareVia = (channel) => {
  const msg = encodeURIComponent(sampleMessage.value);
  const linkEncoded = encodeURIComponent(link);
  const urls = {
    line: `https://line.me/R/msg/text/?${msg}`,
    twitter: `https://twitter.com/intent/tweet?text=${msg}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${linkEncoded}`,
    email: `mailto:?subject=${encodeURIComponent('Join me on Brighture for 1-on-1 English lessons!')}&body=${msg}`,
  };
  if (urls[channel]) {
    window.open(urls[channel], '_blank', 'noopener,noreferrer');
  }
};
</script>
