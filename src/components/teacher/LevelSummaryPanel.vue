<template>
  <!-- A student's BRELAS level for teacher screens: the level, its band and
       step, the internal NFA note, and the history behind it. Never rendered
       in the student portal. -->
  <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">BRELAS level</p>
        <div class="mt-1.5 flex flex-wrap items-center gap-2">
          <!-- Unassessed is not a level, so it gets a dashed outline rather
               than a band colour; B0 is a real, assessed level. -->
          <span
            v-if="!summary.code"
            class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1 text-sm font-bold italic text-slate-500"
          >
            <i class="fa-regular fa-circle-question text-xs" aria-hidden="true"></i>
            Unassessed
          </span>
          <template v-else>
            <span class="text-base font-black text-slate-900">{{ summary.code }}</span>
            <span class="text-xs font-semibold text-slate-500">{{ summary.label }}</span>
            <span v-if="summary.band" class="rounded-full px-2 py-0.5 text-[11px] font-bold ring-1" :class="BAND_STYLES[summary.band]">{{ summary.band }}</span>
            <span v-if="summary.rating" class="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black tabular-nums text-slate-600 ring-1 ring-slate-200">Rating {{ summary.rating }}/15</span>
            <span v-else class="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">No foundation yet</span>
            <span class="text-[10px] font-semibold text-slate-400">CEFR {{ summary.cefr }} (reference)</span>
          </template>
        </div>
        <p class="m-0 mt-1 text-[11px] text-slate-400">
          <template v-if="summary.lastChanged">Last changed {{ when(summary.lastChanged) }}</template>
          <template v-else>No assessment yet</template>
        </p>
      </div>
      <button
        v-if="canChange"
        type="button"
        @click="$emit('change')"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <i class="fa-solid fa-arrow-right-arrow-left text-[10px] text-slate-400" aria-hidden="true"></i>
        Change level
      </button>
    </div>

    <div v-if="summary.nfa" class="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2">
      <p class="m-0 text-[10px] font-black uppercase tracking-wider text-brighture-bronze">
        <i class="fa-solid fa-lock mr-1" aria-hidden="true"></i>NFA · internal
      </p>
      <p class="m-0 mt-0.5 text-xs leading-relaxed text-slate-700">{{ summary.nfa }}</p>
    </div>

    <div v-if="summary.history.length" class="mt-3">
      <button
        type="button"
        @click="open = !open"
        :aria-expanded="open"
        class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 transition hover:text-slate-900"
      >
        <i class="fa-solid fa-chevron-right text-[9px] transition-transform" :class="open ? 'rotate-90' : ''" aria-hidden="true"></i>
        {{ open ? 'Hide history' : 'View history' }} ({{ summary.history.length }})
      </button>
      <ol v-if="open" class="m-0 mt-2 list-none space-y-2 p-0">
        <li
          v-for="h in [...summary.history].reverse()"
          :key="h.id"
          class="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs"
        >
          <div class="flex flex-wrap items-center gap-1.5 font-bold text-slate-800">
            <!-- History reads in ratings ("B2 · Satisfactory (5)"), the value stored -->
            <span :class="h.from ? '' : 'italic text-slate-400'">{{ h.from ? historyLabel(h.from) : 'Unassessed' }}</span>
            <i class="fa-solid fa-arrow-right text-[9px] text-slate-400" aria-hidden="true"></i>
            <span>{{ historyLabel(h.to) }}</span>
            <span class="ml-auto text-[11px] font-semibold text-slate-400">{{ when(h.at) }}</span>
          </div>
          <p class="m-0 mt-0.5 text-[11px] text-slate-500">
            Set by: <span class="font-semibold text-slate-700">{{ byLabel(h.by) }}</span>
            <template v-if="h.reason"> · {{ h.reason }}</template>
          </p>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { BAND_STYLES, levelInfo } from '@/lib/brelas';
import { MANILA, dateIn, clockIn } from '@/lib/schoolTime';
import { useSchoolStore } from '@/stores/useSchoolStore';

const props = defineProps({
  studentId: { type: [Number, String], required: true },
  canChange: { type: Boolean, default: true },
  /** Start with the history open, for screens where it is the point. */
  historyOpen: { type: Boolean, default: false },
});
defineEmits(['change']);

const school = useSchoolStore();
const summary = computed(() => school.levelSummary(props.studentId));

const open = ref(props.historyOpen);
watch(() => props.studentId, () => { open.value = props.historyOpen; });

const when = (iso) => `${dateIn(iso, MANILA)}, ${clockIn(iso, MANILA)} PHT`;

/** "Migration" for carried-over levels; otherwise the person and their role. */
const byLabel = (by) => {
  if (!by) return 'Unknown';
  if (typeof by === 'string') return by;
  if (by.kind === 'migration') return 'migration';
  return by.kind === 'admin' ? `${by.name} (admin)` : by.name;
};

const historyLabel = (value) => {
  const info = levelInfo(value);
  return info.rating ? `${info.display} (${info.rating})` : info.display;
};
</script>
