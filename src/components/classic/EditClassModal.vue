<template>
  <div
    v-if="lesson"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="$emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-class-title"
      class="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white sm:p-6">
        <div class="min-w-0">
          <p class="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Edit class</p>
          <h2 id="edit-class-title" class="mt-1 truncate text-lg font-extrabold sm:text-xl">
            {{ lesson.teacherName }}
          </h2>
          <p class="mt-0.5 text-xs font-semibold text-indigo-600">{{ lesson.date }} · {{ lesson.time }}</p>
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
        <!-- Subject -->
        <div>
          <label for="edit-subject" class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Subject
          </label>
          <select
            id="edit-subject"
            v-model="subject"
            class="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-50"
          >
            <!-- The booked subject may predate this list, so keep it selectable. -->
            <option v-if="!SUBJECT_OPTIONS.includes(lesson.subject)" :value="lesson.subject">
              {{ lesson.subject }}
            </option>
            <option v-for="option in SUBJECT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Topic / message to the teacher -->
        <div>
          <label for="edit-topic" class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Lesson topic &amp; message for your teacher
          </label>
          <textarea
            id="edit-topic"
            v-model="topic"
            rows="4"
            maxlength="500"
            placeholder="e.g. I want to practise pitching to a client — please correct my intonation."
            class="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-50"
          ></textarea>
          <p class="mt-1 text-right text-[10px] font-semibold text-slate-400">{{ topic.length }}/500</p>
        </div>

        <p class="rounded-xl bg-slate-50 p-3 text-[11px] font-medium leading-relaxed text-slate-500">
          Subject and message can be changed until <strong class="text-slate-600">2 hours</strong> before the
          class starts. The date, time and teacher cannot be edited — cancel and rebook to change those.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 p-4">
        <button
          @click="$emit('close')"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Discard
        </button>
        <button
          :disabled="!isDirty"
          @click="$emit('save', { ...lesson, subject, topic })"
          :class="`rounded-xl px-5 py-2.5 text-xs font-bold shadow-xs transition ${
            isDirty
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'cursor-not-allowed bg-slate-200 text-slate-400'
          }`"
        >
          Save changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { SUBJECT_LABELS } from '../../pages/student-view-v4/constants';

const props = defineProps({
  /** null closes the modal — same pattern as ClassDetailsModal. */
  lesson: Object,
});
defineEmits(['close', 'save']);

const SUBJECT_OPTIONS = Object.values(SUBJECT_LABELS);

const subject = ref('');
const topic = ref('');

// The modal stays mounted while `lesson` is null, so reseed the form whenever a
// different class is opened rather than on mount.
watch(
  () => props.lesson,
  (lesson) => {
    subject.value = lesson?.subject ?? '';
    topic.value = lesson?.topic ?? '';
  },
  { immediate: true }
);

const isDirty = computed(
  () => subject.value !== (props.lesson?.subject ?? '') || topic.value !== (props.lesson?.topic ?? '')
);
</script>
