<template>
  <div
    v-if="lesson"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="$emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-details-title"
      class="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 max-h-[94vh] supports-[max-height:100dvh]:max-h-[94dvh]"
    >
      <!-- Header -->
      <div class="shrink-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 text-white sm:p-6">
        <div class="min-w-0">
          <p class="text-[11px] font-bold uppercase tracking-wider text-brighture-gold">Class details</p>
          <h2 id="class-details-title" class="mt-1 truncate text-lg font-extrabold sm:text-xl">
            {{ lesson.subject }}
          </h2>
          <p v-if="lesson.classType" class="mt-0.5 text-xs font-semibold text-brighture-gold">
            {{ lesson.classType }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white transition hover:bg-white/20"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-4 p-4 sm:space-y-5 sm:p-6">
        <!-- Teacher -->
        <div class="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5">
          <AppImage
            :src="lesson.teacherPhoto"
            :alt="lesson.teacherName"
            eager
            class="h-12 w-12 rounded-full ring-2 ring-white"
          />
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">{{ lesson.teacherName }}</p>
            <p class="text-[11px] font-semibold text-slate-500">Online instructor</p>
          </div>
          <span
            v-if="lesson.isSubstitute"
            class="ml-auto shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200"
          >
            Substitute
          </span>
        </div>

        <!-- When -->
        <dl class="grid grid-cols-2 gap-2 sm:gap-3">
          <div class="rounded-2xl border border-slate-200/80 p-3 sm:p-3.5">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</dt>
            <dd class="mt-0.5 text-[13px] font-bold leading-snug text-slate-900 sm:mt-1 sm:text-sm">{{ lesson.date }}</dd>
          </div>
          <div class="rounded-2xl border border-slate-200/80 p-3 sm:p-3.5">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</dt>
            <dd class="mt-0.5 text-[13px] font-bold leading-snug text-slate-900 sm:mt-1 sm:text-sm">{{ lesson.time }}</dd>
          </div>
        </dl>

        <!-- Topic -->
        <div v-if="lesson.topic" class="rounded-2xl border border-slate-200/80 p-3 sm:p-3.5">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson topic</p>
          <p class="mt-0.5 text-[13px] font-semibold leading-snug text-slate-800 sm:mt-1 sm:text-sm">{{ lesson.topic }}</p>
        </div>

        <!-- Policy — mirrors the footnote under the schedule table -->
        <div class="rounded-2xl bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-500">
          <p><strong class="text-slate-600">Cancellation:</strong> free up to 3h before the class starts — points are refunded.</p>
          <p class="mt-1"><strong class="text-slate-600">Changes:</strong> subject and message can be adjusted until 2h prior.</p>
        </div>

        <!-- Sits under the policy it depends on, and scrolls with the content —
             the pinned footer is for the two things you'd normally come here to do. -->
        <button
          @click="$emit('cancel', lesson)"
          class="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[11px] font-bold text-red-600 transition hover:bg-red-50 sm:text-xs"
        >
          Cancel this class
        </button>
      </div>

      <!-- Actions -->
      <!-- Pinned: only the two forward actions. Cancel lives in the body above. -->
      <div class="shrink-0 grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-3 sm:flex sm:items-center sm:justify-end sm:gap-3 sm:p-4">
        <button
          @click="$emit('edit', lesson)"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-xs"
        >
          ✏️ Edit class
        </button>
        <a
          v-if="lesson.meetLink"
          :href="lesson.meetLink"
          target="_blank"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-emerald-700 sm:px-5 sm:text-xs"
        >
          <span>📹</span> Join Meet
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppImage from './AppImage.vue';
defineProps({
  /** null closes the modal — same pattern as TeacherDataModal. */
  lesson: Object,
});
defineEmits(['close', 'cancel', 'edit']);
</script>
