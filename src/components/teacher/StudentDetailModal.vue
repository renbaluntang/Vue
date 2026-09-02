<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="student"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      @click.self="$emit('close')"
    >
      <!-- Capped and internally scrollable, or the card runs off short screens. -->
      <div
        class="relative w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-3xl max-h-[92vh] supports-[max-height:100dvh]:max-h-[92dvh]"
        @click.stop
      >
        <div class="relative bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white sm:p-6">
          <button
            type="button"
            @click="$emit('close')"
            class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>

          <div class="flex items-center gap-4 pr-10">
            <AppImage :src="student.studentPhoto" :alt="student.studentName" class="h-16 w-16 shrink-0 rounded-2xl ring-2 ring-brighture-gold/40" />
            <div class="min-w-0">
              <p class="text-[11px] font-bold uppercase tracking-widest text-brighture-gold">Student #{{ student.studentId }}</p>
              <h3 class="truncate text-xl font-extrabold">{{ student.studentName }}</h3>
              <p class="truncate text-xs text-slate-300">{{ student.membership }} · {{ student.category }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4 p-5 sm:p-6">
          <dl class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
              <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</dt>
              <dd class="mt-0.5 text-sm font-bold text-slate-900">{{ student.subject }}</dd>
            </div>
            <div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
              <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Point</dt>
              <dd class="mt-0.5 text-sm font-bold text-slate-900">{{ student.point }} pts</dd>
            </div>
          </dl>

          <div class="rounded-2xl border border-slate-200/80 p-4">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson time</p>
            <!-- Two clocks only: the one the instructor works in and the one
                 the student sees. School time is the same as one of them for
                 whoever is reading, so a third row was noise. -->
            <ul class="mt-2 space-y-1.5 text-xs">
              <li class="flex justify-between gap-3">
                <span class="text-slate-500">Your time</span>
                <span class="text-right font-bold text-slate-800">{{ teacher.localStart(student) }}</span>
              </li>
              <li class="flex justify-between gap-3">
                <span class="text-slate-500">Student</span>
                <span class="text-right font-bold text-slate-800">{{ student.startStudent }}</span>
              </li>
            </ul>
          </div>

          <div v-if="student.note" class="rounded-2xl border border-brighture-gold/30 bg-brighture-cream p-4">
            <p class="text-[10px] font-bold uppercase tracking-wider text-brighture-bronze">Request from the student</p>
            <p class="mt-1.5 text-sm italic leading-relaxed text-slate-700">“{{ student.note }}”</p>
          </div>

          <a
            v-if="student.meetLink"
            :href="student.meetLink"
            target="_blank"
            rel="noopener"
            class="block rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
          >
            📹 Start Lesson
          </a>
          <p v-else class="rounded-2xl bg-rose-50 px-4 py-3 text-center text-xs font-bold text-rose-700">
            No meeting link yet — contact admin support.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import AppImage from '../AppImage.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

defineProps({
  /** A reservation row; null closes the modal. */
  student: { type: Object, default: null },
});
defineEmits(['close']);
</script>
