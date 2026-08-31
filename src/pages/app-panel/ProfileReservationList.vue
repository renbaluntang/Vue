<script setup>
import { formatDate, formatTime } from "./data.js";

defineProps({
  entry: { type: Object, required: true },
});
</script>

<template>
  <div class="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
    <p class="m-0 font-semibold text-slate-800">Reservation List</p>
    <div class="rounded border border-slate-200 bg-white p-3">
      <p class="m-0 text-sm text-slate-700">
        Upcoming reservation for <span class="font-semibold text-slate-900">{{ entry.student }}</span>:
      </p>
      <p class="mt-2 text-sm text-slate-800">
        {{ formatDate(entry.date) }} at {{ formatTime(entry.date) }}
      </p>
    </div>
  </div>
</template>
