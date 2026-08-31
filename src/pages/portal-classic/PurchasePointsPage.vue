<template>
  <div class="animate-in fade-in duration-500">
    <div class="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-10 max-w-5xl mx-auto">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Purchase Points</h1>
        <p class="text-sm text-slate-500 font-medium">
          Balance: {{ user.profile.pointsBalance }} pts · Expires {{ user.profile.pointsExpiry }}
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
