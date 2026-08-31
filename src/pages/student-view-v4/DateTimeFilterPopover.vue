<script setup>
import {
  DURATIONS,
  BOOKING_DAYS,
  BOOKING_TIME_SLOTS,
  formatSlotTo12Hour,
} from "./constants";

defineProps({
  isOpen: { type: Boolean, required: true },
  tempDay: { type: String, default: "" },
  tempTime: { type: String, default: "" },
  tempDuration: { type: Number, required: true },
});

const emit = defineEmits([
  "close",
  "update:tempDay",
  "update:tempTime",
  "update:tempDuration",
  "confirm",
  "clear",
]);

// Build simple calendar month from BOOKING_DAYS range.
// Just for visual sake, we map the current month — computed once, since the
// popover only ever needs to show "this month" for the lifetime of a session.
const base = new Date();
const year = base.getFullYear();
const month = base.getMonth();
const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();

const calendarCells = [];
for (let i = 0; i < firstDay; i++) calendarCells.push(null);
for (let i = 1; i <= daysInMonth; i++) {
  const d = new Date(year, month, i);
  const dateStr = d.toISOString().slice(0, 10);
  const isBookable = BOOKING_DAYS.some((bd) => bd.key === dateStr);
  calendarCells.push({
    date: i,
    fullDate: dateStr,
    isBookable,
  });
}

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthName = base.toLocaleDateString("en-US", { month: "long", year: "numeric" });
</script>

<template>
  <template v-if="isOpen">
    <div class="fixed inset-0 z-40" @click="emit('close')" />
    <div class="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-[#1a1a1a] p-5 shadow-2xl ring-1 ring-white/10 text-white animate-in fade-in slide-in-from-top-2">
      <!-- Header - Duration -->
      <div class="mb-4">
        <div class="flex w-full rounded-full bg-[#2a2a2a] p-1 text-sm font-semibold">
          <button
            v-for="opt in DURATIONS"
            :key="opt.minutes"
            type="button"
            @click="emit('update:tempDuration', opt.minutes)"
            :class="`flex-1 rounded-full py-1.5 transition ${
              tempDuration === opt.minutes ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Calendar Month Header -->
      <div class="flex items-center justify-between mb-4 px-2">
        <button type="button" class="text-gray-400 hover:text-white">‹</button>
        <span class="font-bold text-[15px]">{{ monthName }}</span>
        <button type="button" class="text-gray-400 hover:text-white">›</button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-y-2 mb-5 text-center">
        <div v-for="d in daysOfWeek" :key="d" class="text-[11px] text-gray-400 font-semibold">{{ d }}</div>
        <template v-for="(cell, i) in calendarCells" :key="cell ? cell.fullDate : `empty-${i}`">
          <div v-if="!cell" />
          <button
            v-else
            type="button"
            :disabled="!cell.isBookable"
            @click="emit('update:tempDay', cell.fullDate)"
            :class="`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
              tempDay === cell.fullDate
                ? 'bg-white text-black font-bold'
                : cell.isBookable
                ? 'hover:bg-[#333] text-gray-200'
                : 'text-gray-600 cursor-not-allowed opacity-50'
            }`"
          >
            {{ cell.date }}
          </button>
        </template>
      </div>

      <!-- Time selector -->
      <div class="border-t border-white/10 pt-4 mb-4">
        <label class="block text-xs font-semibold text-gray-400 mb-2">Start Time</label>
        <div class="relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <select
            :value="tempTime"
            @change="emit('update:tempTime', $event.target.value)"
            class="w-full appearance-none rounded-xl border border-[#333] bg-[#222] py-2.5 pl-9 pr-8 text-sm text-white outline-none focus:border-white transition"
          >
            <option value="">Any time</option>
            <option v-for="slot in BOOKING_TIME_SLOTS" :key="slot" :value="slot">{{ formatSlotTo12Hour(slot) }}</option>
          </select>
          <svg class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          type="button"
          @click="emit('clear')"
          class="flex-1 rounded-xl bg-[#222] py-2.5 text-sm font-semibold text-white transition hover:bg-[#333]"
        >
          Clear
        </button>
        <button
          type="button"
          @click="emit('confirm')"
          class="flex-1 rounded-xl bg-[#FFCD00] py-2.5 text-sm font-bold text-black transition hover:bg-[#FFD933]"
        >
          Confirm
        </button>
      </div>
    </div>
  </template>
</template>
