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
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
        ⚠️
      </div>
      <h2 id="cancel-class-title" class="mt-4 text-lg font-extrabold text-slate-900">Cancel this class?</h2>
      <p class="mt-2 text-sm text-slate-500">
        <strong class="font-bold text-slate-700">{{ lesson.subject }}</strong> with
        {{ lesson.teacherName }} on {{ lesson.date }}, {{ lesson.time }}.
      </p>
      <p class="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] font-medium leading-relaxed text-slate-500">
        Cancelling more than 3h before the start time refunds your points. Later than that, the
        points are forfeited.
      </p>

      <div class="mt-5 flex gap-2.5">
        <button
          @click="$emit('close')"
          class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Keep class
        </button>
        <button
          @click="$emit('confirm', lesson)"
          class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
        >
          Cancel class
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lesson: Object,
});
defineEmits(['close', 'confirm']);
</script>
