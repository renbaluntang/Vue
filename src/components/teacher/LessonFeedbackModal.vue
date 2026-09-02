<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="lesson"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="relative w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-3xl max-h-[92vh] supports-[max-height:100dvh]:max-h-[92dvh]"
        @click.stop
      >
        <div class="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div class="min-w-0">
            <h3 class="truncate text-lg font-extrabold text-slate-900">Lesson feedback</h3>
            <p class="truncate text-xs text-slate-500">{{ lesson.studentName }} · {{ lesson.subject }}</p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="space-y-4 p-5">
          <dl class="grid grid-cols-2 gap-2 text-xs">
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson date</dt>
              <dd class="mt-0.5 font-bold text-slate-800">{{ lesson.dateManila }}</dd>
              <dd class="text-[11px] text-slate-500">{{ lesson.dateTokyo }} · Tokyo</dd>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Point</dt>
              <dd class="mt-0.5 font-bold text-slate-800">{{ lesson.point }} pts</dd>
              <dd class="text-[11px] text-slate-500">Student #{{ lesson.studentId }}</dd>
            </div>
          </dl>

          <div>
            <label for="fb-student" class="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Feedback to the student</span>
              <span class="text-[10px] font-bold text-rose-600">Required</span>
            </label>
            <textarea
              id="fb-student"
              v-model="feedback"
              rows="5"
              maxlength="1000"
              placeholder="What went well, what to practise before the next lesson…"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,205,0,0.15)]"
            ></textarea>
            <p class="mt-1 text-right text-[11px] text-slate-400">{{ feedback.length }} / 1000</p>
          </div>

          <div>
            <label for="fb-admin" class="mb-1.5 block text-xs font-bold text-slate-700">
              Note for administrators
              <span class="font-medium text-slate-400">— not shown to the student</span>
            </label>
            <textarea
              id="fb-admin"
              v-model="hiddenNote"
              rows="3"
              maxlength="1000"
              placeholder="Anything the office should know."
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,205,0,0.15)]"
            ></textarea>
          </div>
        </div>

        <div class="sticky bottom-0 flex gap-2 border-t border-slate-100 bg-white/95 p-4 backdrop-blur">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submit"
            :disabled="!feedback.trim()"
            class="flex-1 rounded-2xl bg-brighture-gold px-4 py-3 text-sm font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  lesson: { type: Object, default: null },
});
const emit = defineEmits(['close', 'submit']);

const feedback = ref('');
const hiddenNote = ref('');

// A new lesson means a blank form, not the previous instructor's draft.
watch(() => props.lesson, (lesson) => {
  feedback.value = lesson?.feedback ?? '';
  hiddenNote.value = lesson?.hiddenNote ?? '';
});

const submit = () => {
  if (!feedback.value.trim()) return;
  emit('submit', { id: props.lesson.id, feedback: feedback.value, hiddenNote: hiddenNote.value });
};
</script>
