<template>
  <div class="overflow-hidden rounded-3xl bg-white text-slate-800">
    <!-- Gradient header -->
    <div
      class="relative px-6 pt-8 pb-6 text-center"
      style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%);"
    >
      <!-- The modal drops its close button in here; the page leaves it empty. -->
      <slot name="corner" />
      <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
        <i class="fa-solid fa-gift text-3xl text-white"></i>
      </div>
      <h2 class="text-xl font-black text-white">Refer a Friend</h2>
      <p class="mt-1 text-sm text-violet-100">Share your link. Both of you benefit.</p>
    </div>

    <div class="px-6 py-6 space-y-5">
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-center">
          <i class="fa-solid fa-coins text-2xl text-violet-500 mb-1"></i>
          <p class="text-xl font-black text-violet-900">+{{ terms.referrerPoints }} pts</p>
          <p class="text-xs text-violet-600 font-semibold">You earn</p>
          <p class="text-[10px] text-violet-400 mt-0.5 leading-tight">when they buy a plan &amp; start learning</p>
        </div>
        <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
          <i class="fa-solid fa-tag text-2xl text-emerald-500 mb-1"></i>
          <p class="text-xl font-black text-emerald-900">{{ terms.friendDiscountLabel }} off</p>
          <p class="text-xs text-emerald-600 font-semibold">Friend gets</p>
          <!-- "first purchase" is the actual condition, and the rules below say
               so too — the card should not imply a standing discount. -->
          <p class="text-[10px] text-emerald-400 mt-0.5 leading-tight">USD off their first purchase</p>
        </div>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Referral Link</p>
        <div class="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5">
          <i class="fa-solid fa-link text-slate-400 text-xs shrink-0"></i>
          <span class="flex-1 truncate text-xs text-slate-700 font-mono select-all">{{ referralLink }}</span>
          <button
            type="button"
            @click="copyReferralLink"
            :class="`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              referralCopied ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'
            }`"
          >
            <i :class="referralCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
            {{ referralCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-ticket text-amber-500"></i>
          <span class="text-xs font-semibold text-amber-700">Your code:</span>
          <span class="font-black text-sm tracking-widest text-amber-900">{{ referralCode }}</span>
        </div>
        <button type="button" @click="copyReferralCode" class="text-[10px] font-bold text-amber-600 hover:text-amber-800 cursor-pointer transition">
          {{ codeCopied ? 'Copied!' : 'Copy code' }}
        </button>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Share via</p>
        <div class="flex gap-2">
          <button type="button" @click="shareVia('whatsapp')" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white hover:opacity-90 transition active:scale-95 cursor-pointer">
            <i class="fa-brands fa-whatsapp text-base"></i> WhatsApp
          </button>
          <button type="button" @click="shareVia('twitter')" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:opacity-90 transition active:scale-95 cursor-pointer">
            <i class="fa-brands fa-x-twitter text-base"></i> X / Twitter
          </button>
          <button type="button" @click="shareVia('email')" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-700 py-2.5 text-xs font-bold text-white hover:opacity-90 transition active:scale-95 cursor-pointer">
            <i class="fa-solid fa-envelope text-base"></i> Email
          </button>
        </div>
      </div>

      <template v-if="details">
      <!-- Full programme details, matching the referral page on mypage. -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500">How it works</p>
        <ul class="space-y-2.5">
          <li v-for="rule in rules" :key="rule.title" class="flex items-start gap-2.5">
            <i :class="rule.icon" class="mt-0.5 w-4 shrink-0 text-center text-xs text-violet-500"></i>
            <div>
              <p class="text-xs font-bold text-slate-800">{{ rule.title }}</p>
              <p class="text-[11px] leading-relaxed text-slate-500">{{ rule.detail }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">How to refer</p>
        <ul class="space-y-1.5">
          <li v-for="(step, index) in howTo" :key="step" class="flex items-start gap-2.5">
            <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black text-slate-600">
              {{ index + 1 }}
            </span>
            <span class="text-[11px] leading-relaxed text-slate-600">{{ step }}</span>
          </li>
        </ul>
      </div>
      </template>

      <p class="text-center text-[10px] text-slate-400">
        Rewards are credited after your friend&rsquo;s first purchase clears. Brighture may amend or end the
        programme at any time.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// The /refer page lays the programme rules out itself, so it switches these off
// rather than printing "How it works" twice on one screen.
defineProps({
  details: { type: Boolean, default: true },
});
import {
  REFERRAL_CODE,
  REFERRAL_TERMS,
  REFERRAL_RULES,
  REFERRAL_HOW_TO,
  referralUrl,
  referralShareMessage,
} from '../lib/referral';

const terms = REFERRAL_TERMS;
const rules = REFERRAL_RULES;
const howTo = REFERRAL_HOW_TO;

const referralCode = ref(REFERRAL_CODE);
const referralLink = computed(() => referralUrl(referralCode.value));
const referralCopied = ref(false);
const codeCopied = ref(false);

const copy = async (text, flag) => {
  try {
    await navigator.clipboard.writeText(text);
    flag.value = true;
    setTimeout(() => { flag.value = false; }, 2500);
  } catch { /* clipboard unavailable — the value is select-all-able instead */ }
};

const copyReferralLink = () => copy(referralLink.value, referralCopied);
const copyReferralCode = () => copy(referralCode.value, codeCopied);

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
