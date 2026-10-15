<template>
  <div
    v-if="lesson"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="$emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-class-title"
      class="w-full max-w-sm overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 text-center shadow-2xl animate-in zoom-in-95 max-h-[94vh] supports-[max-height:100dvh]:max-h-[94dvh]"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg">
        <i class="fa-solid fa-triangle-exclamation text-rose-500" aria-hidden="true"></i>
      </div>
      <h2 id="cancel-class-title" class="mt-4 text-lg font-extrabold text-slate-900">Cancel this class?</h2>
      <p class="mt-2 text-sm text-slate-500">
        <strong class="font-bold text-slate-700">{{ lesson.subject }}</strong> with
        {{ lesson.teacherName }} on {{ lesson.date }}, {{ lesson.time }}.
      </p>
      <!-- With a known start, say which side of the 3h line this cancellation falls. -->
      <p
        v-if="refundKnown && isFree"
        class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-semibold leading-relaxed text-emerald-800"
      >
        Free cancellation — it is more than 3h before the start, so your
        {{ lesson.points ? `${lesson.points} points are` : 'points are' }} refunded in full.
      </p>
      <p
        v-else-if="refundKnown"
        class="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] font-semibold leading-relaxed text-rose-800"
      >
        No refund — the class starts in less than 3h, so the
        {{ lesson.points ? `${lesson.points} points are` : 'points are' }} forfeited.
      </p>
      <p v-else class="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] font-medium leading-relaxed text-slate-500">
        Cancelling more than 3h before the start time refunds your points. Later than that, the
        points are forfeited.
      </p>

      <!-- Reschedule alternative tip -->
      <div class="mt-3 rounded-xl bg-amber-50/90 border border-amber-200 p-3 text-left flex items-start gap-2.5">
        <i class="fa-regular fa-calendar-days text-amber-600 text-sm mt-0.5 shrink-0"></i>
        <div class="text-[11px] text-amber-900 leading-snug">
          <span class="font-bold">Need a different time?</span>
          <p class="text-amber-800/90 mt-0.5">Reschedule instead to move this session without forfeiting your points.</p>
          <button
            type="button"
            @click="$emit('reschedule', lesson)"
            class="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 underline hover:text-amber-800 cursor-pointer"
          >
            Reschedule this class instead →
          </button>
        </div>
      </div>

      <div class="mt-5 flex gap-2.5">
        <button
          @click="$emit('close')"
          class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
        >
          Keep class
        </button>
        <button
          @click="$emit('confirm', lesson)"
          class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 cursor-pointer"
        >
          Cancel class
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  lesson: Object,
});
defineEmits(['close', 'confirm', 'reschedule']);

/** Free cancellation up to this many minutes before the start. */
const FREE_CANCEL_MINUTES = 180;
const refundKnown = computed(() => typeof props.lesson?.minutesUntil === 'number');
const isFree = computed(() => refundKnown.value && props.lesson.minutesUntil > FREE_CANCEL_MINUTES);
</script>
