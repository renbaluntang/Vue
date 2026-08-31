<script setup>
import { DURATIONS, pointsForDuration } from "./constants";

defineProps({
  value: { type: Number, required: true },
  teacher: { type: Object, default: null },
  size: { type: String, default: "md" },
});

const emit = defineEmits(["change"]);
</script>

<template>
  <div
    role="radiogroup"
    aria-label="Lesson length"
    :class="`inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 ${
      size === 'sm' ? 'text-[11px]' : 'text-sm'
    }`"
  >
    <button
      v-for="option in DURATIONS"
      :key="option.minutes"
      type="button"
      role="radio"
      :aria-checked="value === option.minutes"
      @click="emit('change', option.minutes)"
      :class="`rounded-full px-3 py-1.5 font-bold transition ${
        value === option.minutes ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
      }`"
    >
      {{ option.label }}
      <span
        v-if="teacher"
        :class="`ml-1 font-normal ${value === option.minutes ? 'text-slate-600' : 'text-slate-500'}`"
      >
        · {{ pointsForDuration(teacher, option.minutes) }} pts
      </span>
    </button>
  </div>
</template>
