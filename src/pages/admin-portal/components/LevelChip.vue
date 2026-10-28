<template>
  <!-- Unassessed is drawn dashed and muted on purpose: it is the absence of a
       rating, and must never be mistaken for B0, which is a real result. -->
  <span
    v-if="info.value === null"
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-bold italic text-slate-500"
    title="No assessment yet"
  >
    <i class="fa-regular fa-circle-question text-[10px]"></i>
    Unassessed
  </span>
  <span
    v-else
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-black ring-1"
    :class="BAND_STYLES[info.band]"
    :title="title"
  >
    {{ info.code }}
    <template v-if="info.rating">
      <span v-if="compact" class="font-semibold opacity-80 tabular-nums">{{ info.rating }}</span>
      <span v-else class="font-semibold opacity-80">{{ info.band }}</span>
    </template>
    <span v-else-if="!compact" class="font-semibold opacity-80">No foundation yet</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { BAND_STYLES, RATING_MAX, levelInfo } from '@/lib/brelas';

const props = defineProps({
  /** The stored rating: 1–15, 'B0', or null for Unassessed. */
  value: { type: [Number, String], default: null },
  /** Code and rating only, for tight table cells and history rows. */
  compact: { type: Boolean, default: false },
});
const info = computed(() => levelInfo(props.value));
const title = computed(() => (info.value.rating
  ? `${info.value.label} · ${info.value.band} · rating ${info.value.rating}/${RATING_MAX} · CEFR ${info.value.cefr} (reference)`
  : `${info.value.label}: assessed, no foundation yet · CEFR ${info.value.cefr} (reference)`));
</script>
