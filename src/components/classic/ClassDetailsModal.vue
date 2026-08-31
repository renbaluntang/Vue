<template>
  <div
    v-if="lesson"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="$emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-details-title"
      class="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white sm:p-6">
        <div class="min-w-0">
          <p class="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Class details</p>
          <h2 id="class-details-title" class="mt-1 truncate text-lg font-extrabold sm:text-xl">
            {{ lesson.subject }}
          </h2>
          <p v-if="lesson.classType" class="mt-0.5 text-xs font-semibold text-indigo-600">
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

      <div class="space-y-5 p-5 sm:p-6">
        <!-- Teacher -->
        <div class="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5">
          <img
            :src="lesson.teacherPhoto"
            :alt="lesson.teacherName"
            class="h-12 w-12 rounded-full object-cover ring-2 ring-white"
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
        <dl class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-slate-200/80 p-3.5">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900">{{ lesson.date }}</dd>
          </div>
          <div class="rounded-2xl border border-slate-200/80 p-3.5">
            <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900">{{ lesson.time }}</dd>
          </div>
        </dl>

        <!-- Topic -->
        <div v-if="lesson.topic" class="rounded-2xl border border-slate-200/80 p-3.5">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson topic</p>
          <p class="mt-1 text-sm font-semibold text-slate-800">{{ lesson.topic }}</p>
        </div>

        <!-- Policy — mirrors the footnote under the schedule table -->
        <div class="rounded-2xl bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-500">
          <p><strong class="text-slate-600">Cancellation:</strong> free up to 3h before the class starts — points are refunded.</p>
          <p class="mt-1"><strong class="text-slate-600">Changes:</strong> subject and message can be adjusted until 2h prior.</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-4">
        <button
          @click="$emit('cancel', lesson)"
          class="rounded-xl px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
        >
          Cancel class
        </button>
        <div class="flex items-center gap-2">
          <button
            @click="$emit('edit', lesson)"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ✏️ Edit class
          </button>
          <a
            v-if="lesson.meetLink"
            :href="lesson.meetLink"
            target="_blank"
            class="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
          >
            <span>📹</span> Join Meet
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** null closes the modal — same pattern as TeacherDataModal. */
  lesson: Object,
});
defineEmits(['close', 'cancel', 'edit']);
</script>
