<template>
  <div class="animate-in fade-in duration-500">
    <div class="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-10 max-w-5xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Purchase Points</h1>
          <p class="text-sm text-slate-500 font-medium">
            Balance: {{ user.profile.pointsBalance }} pts · Expires {{ user.profile.pointsExpiry }}
          </p>
        </div>
        <RouterLink
          :to="{ path: '/points', query: { tab: 'purchases' } }"
          class="shrink-0 inline-flex items-center gap-2 text-xs font-bold text-brighture-bronze hover:text-brighture-ink transition"
        >
          <i class="fa-solid fa-receipt"></i> Purchase history
        </RouterLink>
      </div>
    </div>

    <PointsPurchase embedded />
  </div>
</template>

<script setup>
import PointsPurchase from '../PointsPurchase.vue';
import { useUserStore } from '../../stores/useUserStore';

const user = useUserStore();
</script>
