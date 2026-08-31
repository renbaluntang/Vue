<template>
  <div class="animate-in fade-in duration-500 pb-20">
    <div class="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 max-w-5xl mx-auto">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Purchase Points</h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal">
          Current balance: {{ user.profile.pointsBalance }} pts · Expires {{ user.profile.pointsExpiry }}
        </p>
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
