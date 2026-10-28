<template>
  <!-- One row per BRELAS level, each with its three ratings shown as bands, so
       picking a rating also shows the level and band it means. B0 stands on
       its own: assessed, with no foundation yet (not the same as Unassessed).
       A radio group, so arrow keys move the pick. -->
  <div role="radiogroup" :aria-label="label" class="space-y-1.5">
    <div
      v-for="lvl in rows"
      :key="lvl.code"
      class="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
    >
      <div class="min-w-0">
        <p class="m-0 text-xs font-black text-slate-900">{{ lvl.code }}</p>
        <p class="m-0 truncate text-[10px] font-medium text-slate-400">{{ lvl.label }} · CEFR {{ lvl.cefr }}</p>
      </div>

      <div v-if="lvl.code === 'B0'" class="flex">
        <button
          type="button"
          role="radio"
          :aria-checked="modelValue === 'B0'"
          :disabled="disabled"
          @click="$emit('update:modelValue', 'B0')"
          class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed"
          :class="modelValue === 'B0' ? 'border-brighture-ink bg-brighture-ink text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
        >
          No foundation yet
          <span v-if="current === 'B0'" class="text-[10px] font-semibold" :class="modelValue === 'B0' ? 'text-white/70' : 'text-slate-400'">current</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-3 gap-1.5">
        <button
          v-for="opt in lvl.options"
          :key="opt.value"
          type="button"
          role="radio"
          :aria-checked="modelValue === opt.value"
          :aria-label="`${opt.code} ${opt.band}, rating ${opt.rating}`"
          :disabled="disabled"
          @click="$emit('update:modelValue', opt.value)"
          class="flex min-w-0 flex-col items-start rounded-xl border px-2.5 py-1.5 text-left transition disabled:cursor-not-allowed"
          :class="modelValue === opt.value
            ? 'border-brighture-ink bg-brighture-ink text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
        >
          <span class="flex w-full items-center justify-between gap-1">
            <span class="text-xs font-black tabular-nums">{{ opt.rating }}</span>
            <span v-if="current === opt.value" class="text-[9px] font-semibold" :class="modelValue === opt.value ? 'text-white/70' : 'text-slate-400'">current</span>
          </span>
          <span class="truncate text-[10px] font-semibold" :class="modelValue === opt.value ? 'text-white/80' : 'text-slate-500'">{{ opt.band }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BRELAS_LEVELS, RATING_OPTIONS } from '@/lib/brelas';

defineProps({
  /** The chosen rating: 1–15, 'B0', or null. */
  modelValue: { type: [Number, String], default: null },
  /** The student's rating now, marked so a change is easy to see. */
  current: { type: [Number, String], default: null },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: 'BRELAS rating' },
});
defineEmits(['update:modelValue']);

// Highest level first, as in the reference table; B0 last.
const rows = [...BRELAS_LEVELS].reverse().map((lvl) => ({
  ...lvl,
  options: RATING_OPTIONS.filter((o) => o.code === lvl.code && o.rating !== null),
}));
</script>
