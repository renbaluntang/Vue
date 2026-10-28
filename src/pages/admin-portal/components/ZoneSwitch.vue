<template>
  <!-- Which clock every time in the admin portal is shown in. -->
  <div class="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-black" role="group" aria-label="Show times in">
    <button
      v-for="z in zones"
      :key="z.id"
      type="button"
      @click="displayZone = z.id"
      class="rounded-lg px-2.5 py-1 transition"
      :class="displayZone === z.id ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'"
      :aria-pressed="displayZone === z.id ? 'true' : 'false'"
      :title="z.title"
    >
      {{ z.label }}
    </button>
  </div>
</template>

<script setup>
import { MANILA, TOKYO } from '@/lib/schoolTime';
import { displayZone } from '../adminUi';

const zones = [
  { id: TOKYO, label: 'JST', title: 'Show times in Tokyo time' },
  { id: MANILA, label: 'PHT', title: 'Show times in Manila time' },
];
</script>
