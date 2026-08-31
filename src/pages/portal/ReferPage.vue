<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Refer a Friend</h1>
      <p class="text-sm text-slate-500 font-medium">
        {{ REFERRAL_TERMS.friendDiscountLabel }} USD off for your friend, {{ REFERRAL_TERMS.referrerPoints }} points for you.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      <!-- Share card -->
      <div class="lg:col-span-3 border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <ReferAFriendPanel :details="false" />
      </div>

      <!-- How it works -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-5 sm:p-6">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">How it works</h2>
          <ol class="space-y-4">
            <li v-for="(step, index) in steps" :key="step.title" class="flex items-start gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brighture-gold text-brighture-ink text-xs font-black">
                {{ index + 1 }}
              </span>
              <div>
                <p class="text-sm font-bold text-slate-900">{{ step.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ step.detail }}</p>
              </div>
            </li>
          </ol>

          <div class="mt-5 pt-5 border-t border-slate-100">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">How to refer</h3>
            <ul class="space-y-1.5">
              <li v-for="way in howTo" :key="way" class="flex items-start gap-2">
                <i class="fa-solid fa-circle text-[4px] text-slate-300 mt-2 shrink-0"></i>
                <span class="text-xs text-slate-500 leading-relaxed">{{ way }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-5 sm:p-6">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Your referrals</h2>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
              <p class="text-2xl font-black text-slate-900">{{ referralStats.invited }}</p>
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Invited</p>
            </div>
            <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p class="text-2xl font-black text-emerald-700">{{ referralStats.pointsEarned }}</p>
              <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-0.5">Points earned</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">
            {{ referralStats.pending }} friend{{ referralStats.pending === 1 ? '' : 's' }} signed up but
            {{ referralStats.pending === 1 ? "hasn't" : "haven't" }} purchased points yet — your bonus lands
            as soon as they do.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ReferAFriendPanel from '../../components/ReferAFriendPanel.vue';
import { REFERRAL_CODE, REFERRAL_TERMS, REFERRAL_HOW_TO } from '../../lib/referral';

const howTo = REFERRAL_HOW_TO;

const steps = [
  {
    title: 'Share your link or code',
    detail: `Send your referral URL or code ${REFERRAL_CODE} to a friend — by message, email, social media, or your blog.`,
  },
  {
    title: 'They register with your code',
    detail: `Your friend gets ${REFERRAL_TERMS.friendDiscountLabel} USD off their plan, valid on their first purchase within ${REFERRAL_TERMS.windowDays} days of registering.`,
  },
  {
    title: `You get ${REFERRAL_TERMS.referrerPoints} points`,
    detail: `Once they buy a plan and start learning, ${REFERRAL_TERMS.referrerPoints} points are credited to your balance as a thank-you.`,
  },
];

// Prototype figures — wire to the API when referral tracking exists server-side.
const referralStats = {
  invited: 3,
  pointsEarned: 10,
  pending: 1,
};
</script>
