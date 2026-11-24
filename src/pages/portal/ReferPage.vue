<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
    <!-- Page Header with Points Balance pill -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        class="inline-flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-2.5 transition hover:bg-amber-100 hover:border-amber-300 active:scale-[0.98] shadow-sm group"
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
    </header>

    <!-- 1. Hero Promo Banner: Value Proposition & Illustration -->
    <section class="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-sm">
      <div class="relative z-10 grid grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:p-10">
        <div class="space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800 shadow-sm">
              <i class="fa-solid fa-gift text-amber-600 text-[11px]" aria-hidden="true"></i>
              Referral Program
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500">
              <i class="fa-solid fa-sparkles text-[10px] text-amber-500" aria-hidden="true"></i> No referral limits
            </span>
          </div>

          <div>
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
              Give {{ terms.friendDiscountLabel }}, get {{ terms.referrerPoints }} points
            </h2>
            <p class="mt-2.5 max-w-lg text-sm sm:text-base leading-relaxed text-slate-600">
              Invite friends to learn 1-on-1 English with Brighture. They save on their first plan, and you earn points to book your next classes.
            </p>
          </div>

          <!-- Dual Perks Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div class="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 sm:p-4 transition-all hover:border-slate-300">
              <div class="flex items-center gap-1.5 text-slate-500">
                <i class="fa-solid fa-tag text-xs" aria-hidden="true"></i>
                <span class="text-[10px] font-extrabold uppercase tracking-wide">Friend receives</span>
              </div>
              <p class="mt-1.5 text-2xl sm:text-3xl font-black leading-none tracking-tight text-slate-900">
                {{ terms.friendDiscountLabel }} <span class="text-xs font-bold text-slate-500">OFF</span>
              </p>
              <p class="mt-1.5 text-xs text-slate-500 leading-normal">
                their first plan purchase (valid for {{ terms.windowDays }} days)
              </p>
            </div>

            <div class="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 sm:p-4 transition-all hover:border-amber-300">
              <div class="flex items-center gap-1.5 text-amber-800">
                <i class="fa-solid fa-coins text-xs" aria-hidden="true"></i>
                <span class="text-[10px] font-extrabold uppercase tracking-wide">You receive</span>
              </div>
              <p class="mt-1.5 text-2xl sm:text-3xl font-black leading-none tracking-tight text-slate-900">
                +{{ terms.referrerPoints }} <span class="text-xs font-black text-amber-700">POINTS</span>
              </p>
              <p class="mt-1.5 text-xs text-slate-500 leading-normal">
                credited to your balance to book online classes
              </p>
            </div>
          </div>
        </div>

        <!-- Illustration with badge -->
        <div class="relative mx-auto flex items-center justify-center w-full max-w-sm lg:max-w-none">
          <div class="relative w-full flex items-center justify-center">
            <img
              :src="referralIllustration"
              alt="Friends sharing referral code"
              class="h-auto max-h-56 sm:max-h-64 w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
            />
            <div class="absolute -bottom-3 right-4 flex items-center gap-2 rounded-full bg-white border border-slate-200/90 px-3.5 py-1.5 text-xs font-extrabold text-slate-900 shadow-md">
              <img :src="coinsImage" alt="" class="h-4 w-4 shrink-0" />
              <span class="text-amber-700 font-black">+{{ terms.referrerPoints }} pts each</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Your Referral Performance (KPI Cards) -->
    <section class="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Referral performance metrics">
      <div class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 sm:flex" aria-hidden="true">
          <i class="fa-solid fa-user-group text-sm"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xl font-black leading-none tracking-tight text-slate-900">{{ referralStats.invited }}</p>
          <p class="mt-1 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span class="sm:hidden">Invited</span>
            <span class="hidden sm:inline">Friends invited</span>
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm"
        :title="`${referralStats.pending === 1 ? '1 friend has' : `${referralStats.pending} friends have`} signed up; your bonus arrives when they buy a plan`"
      >
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-900 sm:flex" aria-hidden="true">
          <i class="fa-solid fa-hourglass-half text-sm"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xl font-black leading-none tracking-tight text-brighture-bronze">{{ referralStats.pending }}</p>
          <p class="mt-1 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800">
            <span class="sm:hidden">Pending</span>
            <span class="hidden sm:inline">Pending bonus</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-200/70 text-emerald-900 sm:flex" aria-hidden="true">
          <i class="fa-solid fa-coins text-sm"></i>
        </span>
        <div class="min-w-0">
          <p class="text-xl font-black leading-none tracking-tight text-emerald-700">
            +{{ referralStats.pointsEarned }} <span class="text-xs font-bold">pts</span>
          </p>
          <p class="mt-1 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <span class="sm:hidden">Earned</span>
            <span class="hidden sm:inline">Points earned</span>
          </p>
        </div>
      </div>
    </section>

    <!-- 3. Main Workspace: Unified Sharing Hub (Left) & How It Works / FAQs (Right) -->
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <!-- Left Column: Unified Share Hub (7 cols) -->
      <div class="space-y-6 lg:col-span-7">
        <section class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h2 class="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-share-nodes text-brighture-bronze text-base" aria-hidden="true"></i> Share your referral
            </h2>
            <p class="mt-1 text-xs text-slate-500">
              Share your personal link or code. When friends join and purchase their first plan, both of you get rewarded.
            </p>
          </div>

          <!-- Section A: Primary Invite Link with Single Action Set -->
          <div>
            <label for="referral-link" class="text-xs font-bold text-slate-700 block mb-1.5">
              Personal invite link <span class="font-normal text-slate-500">(discount automatically applied at registration)</span>
            </label>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div class="relative flex-1 flex items-center rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-3.5 pr-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200/50">
                <i class="fa-solid fa-link shrink-0 text-xs text-slate-400 mr-2" aria-hidden="true"></i>
                <input
                  id="referral-link"
                  :value="link"
                  readonly
                  class="min-w-0 flex-1 truncate bg-transparent font-mono text-xs text-slate-800 outline-none select-all"
                  @focus="$event.target.select()"
                />
              </div>

              <!-- Single clean action group: Copy, Share (if native), and QR -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="copyLink"
                  :class="linkCopied ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-brighture-gold text-slate-950 hover:bg-[#FFD933]'"
                  class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <i :class="linkCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" aria-hidden="true"></i>
                  <span>{{ linkCopied ? 'Copied link!' : 'Copy link' }}</span>
                </button>

                <button
                  v-if="canShare"
                  type="button"
                  @click="shareNative"
                  class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                  title="Share using your device"
                >
                  <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
                  <span class="hidden sm:inline">Share</span>
                </button>

                <button
                  type="button"
                  @click="showQrModal = true"
                  class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                  title="Show QR Code"
                >
                  <i class="fa-solid fa-qrcode text-amber-600" aria-hidden="true"></i>
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section B: Personal Referral Code (Compact Manual Entry Row) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4">
            <div class="min-w-0">
              <span class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <i class="fa-solid fa-ticket text-amber-600" aria-hidden="true"></i>
                Referral code for manual registration
              </span>
              <p class="mt-0.5 text-[11px] text-slate-500">
                For friends entering your code manually in the registration form.
              </p>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div class="rounded-xl bg-white border border-slate-200 px-3 py-1.5 font-mono text-sm font-black tracking-widest text-slate-900 select-all shadow-xs">
                {{ code }}
              </div>
              <button
                type="button"
                @click="copyCode"
                :class="codeCopied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'"
                class="inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
              >
                <i :class="codeCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="text-xs" aria-hidden="true"></i>
                <span>{{ codeCopied ? 'Copied code' : 'Copy code' }}</span>
              </button>
            </div>
          </div>

          <!-- Section C: One-Click Sharing Channels -->
          <div>
            <p class="text-xs font-bold text-slate-700 mb-2">Send directly via</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                v-for="channel in channels"
                :key="channel.key"
                type="button"
                @click="shareVia(channel.key)"
                :class="channel.bg"
                class="flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold shadow-xs transition hover:opacity-95 active:scale-95 cursor-pointer"
              >
                <i :class="channel.icon" class="text-base" aria-hidden="true"></i>
                <span>{{ channel.label }}</span>
              </button>
            </div>
          </div>

          <!-- Section D: Helpful Sharing Tips (Integrated, no separate bulky card) -->
          <div class="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-3.5 flex items-start gap-3">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-xs" aria-hidden="true">
              <i class="fa-solid fa-lightbulb"></i>
            </span>
            <div class="text-xs text-slate-600 leading-relaxed">
              <strong class="text-slate-800">Quick tip:</strong> Share your invite link in group chats, language exchange meetups, or on social profiles. Points are credited automatically right after your friend's first plan is confirmed.
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: How it Works & Program FAQs (5 cols) -->
      <div class="space-y-6 lg:col-span-5">
        <!-- 1. How it works (Timeline) -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h3 class="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-brighture-bronze text-sm" aria-hidden="true"></i> How it works
          </h3>
          <ol class="space-y-3">
            <li
              v-for="step in steps"
              :key="step.title"
              class="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
            >
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brighture-gold text-slate-950 text-xs font-black">
                {{ step.step }}
              </span>
              <div class="min-w-0">
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ step.title }}</p>
                <p class="mt-0.5 text-xs leading-relaxed text-slate-500">{{ step.detail }}</p>
              </div>
            </li>
          </ol>
          <!-- The rules open in a pop-up, so the page keeps two balanced
               columns and the fine print is one click away. -->
          <button
            type="button"
            @click="showRulesModal = true"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer"
          >
            <i class="fa-solid fa-circle-info text-brighture-bronze" aria-hidden="true"></i>
            <span>Program rules &amp; details</span>
          </button>
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
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          @click.self="showQrModal = false"
        >
          <div class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center">
            <!-- Close icon button -->
            <button
              type="button"
              @click="showQrModal = false"
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              aria-label="Close QR Modal"
            >
              <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
            </button>

            <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brighture-bronze">
              <i class="fa-solid fa-qrcode" aria-hidden="true"></i> Instant Scan
            </span>
            <h4 id="qr-modal-title" class="mt-2 text-lg font-black text-slate-900">Scan to Register</h4>
            <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Have your friend scan this QR code with their phone camera to open registration with your referral code automatically applied.
            </p>

            <!-- SVG QR Code Visualization -->
            <div class="mt-5 mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 border-2 border-slate-900 shadow-sm">
              <svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor" aria-hidden="true">
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

            <!-- Modal Action Buttons: Copy link & Done (Distinct purposes) -->
            <div class="mt-4 flex gap-2">
              <button
                type="button"
                @click="copyLink"
                :class="linkCopied ? 'bg-emerald-600 text-white' : 'bg-brighture-gold text-slate-950 hover:bg-[#FFD933]'"
                class="flex-1 rounded-xl py-2.5 text-xs font-extrabold transition cursor-pointer shadow-xs"
              >
                <i :class="linkCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="mr-1" aria-hidden="true"></i>
                {{ linkCopied ? 'Link copied!' : 'Copy invite link' }}
              </button>
              <button
                type="button"
                @click="showQrModal = false"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Program Rules Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRulesModal"
          class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 pt-6 backdrop-blur-sm sm:pt-12"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rules-modal-title"
          @click.self="showRulesModal = false"
        >
          <div class="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              @click="showRulesModal = false"
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close program rules"
            >
              <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
            </button>
            <h3 id="rules-modal-title" class="flex items-center gap-2 pr-10 text-base font-extrabold tracking-tight text-slate-900">
              <i class="fa-solid fa-circle-info text-sm text-brighture-bronze" aria-hidden="true"></i> Program rules &amp; details
            </h3>
            <ul class="mt-4 space-y-3 text-xs">
              <li v-for="item in faqs" :key="item.question" class="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <strong class="mb-0.5 block font-bold text-slate-900">{{ item.question }}</strong>
                <span class="block leading-relaxed text-slate-600">{{ item.answer }}</span>
              </li>
            </ul>
            <p class="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
              Points are deposited into your wallet once your friend's payment clears. Brighture points can be applied towards any 1-on-1 English lesson.
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import {
  REFERRAL_CODE,
  REFERRAL_TERMS,
  referralUrl,
  referralShareMessage,
} from '@/lib/referral';
import referralIllustration from '@/assets/referral-illustration.svg';
import coinsImage from '@/assets/coins.svg';

const user = useUserStore();
const terms = REFERRAL_TERMS;
const code = REFERRAL_CODE;
const link = referralUrl(code);
const sampleMessage = computed(() => referralShareMessage(code));

const codeCopied = ref(false);
const linkCopied = ref(false);
const canShare = ref(false);
const showQrModal = ref(false);
const showRulesModal = ref(false);

let codeTimeout = null;
let linkTimeout = null;

const steps = [
  {
    step: '1',
    title: 'Share your link or code',
    detail: 'Send your referral code or personal link to a friend via message, email, or social media.',
  },
  {
    step: '2',
    title: 'Your friend signs up & saves',
    detail: `They get ${terms.friendDiscountLabel} USD off their first plan when purchasing within ${terms.windowDays} days of registration.`,
  },
  {
    step: '3',
    title: `You get ${terms.referrerPoints} bonus points`,
    detail: `Once their plan purchase completes, ${terms.referrerPoints} points are immediately credited to your balance to book classes.`,
  },
];

const faqs = [
  {
    question: 'Who can I invite?',
    answer: 'Any friend, family member, or colleague who does not currently have a Brighture student account.',
  },
  {
    question: 'How does my friend redeem the discount?',
    answer: `Using your direct link applies the ${terms.friendDiscountLabel} USD discount automatically at checkout. If registering manually, they can enter your referral code.`,
  },
  {
    question: 'When are referral points credited?',
    answer: `Bonus points (${terms.referrerPoints} pts per friend) are added to your balance as soon as their initial payment is processed.`,
  },
  {
    question: 'Is there any referral limit?',
    answer: 'None! You can refer as many friends as you want and earn points for every successful enrollment.',
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

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code);
    codeCopied.value = true;
    if (codeTimeout) clearTimeout(codeTimeout);
    codeTimeout = setTimeout(() => {
      codeCopied.value = false;
    }, 2500);
  } catch {
    /* clipboard unavailable */
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(link);
    linkCopied.value = true;
    if (linkTimeout) clearTimeout(linkTimeout);
    linkTimeout = setTimeout(() => {
      linkCopied.value = false;
    }, 2500);
  } catch {
    /* clipboard unavailable */
  }
};

const shareNative = async () => {
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

const handleKeyDown = (e) => {
  if (e.key !== 'Escape') return;
  showQrModal.value = false;
  showRulesModal.value = false;
};

onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (codeTimeout) clearTimeout(codeTimeout);
  if (linkTimeout) clearTimeout(linkTimeout);
});
</script>
