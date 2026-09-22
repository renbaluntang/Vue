<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Lesson Log</h1>
        <p class="mt-0.5 text-sm text-slate-500">Completed lessons, student ratings and your feedback.</p>
      </div>
      <div
        v-if="teacher.pendingFeedback.length"
        class="shrink-0 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900"
      >
        {{ teacher.pendingFeedback.length }} lesson{{ teacher.pendingFeedback.length === 1 ? '' : 's' }} awaiting feedback
      </div>
    </header>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="activeTab = tab.key"
        class="rounded-2xl px-4 py-2 text-xs font-bold transition"
        :class="activeTab === tab.key
          ? 'bg-slate-900 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="relative max-w-md">
      <label for="lesson-log-search" class="sr-only">Search lesson log</label>
      <svg
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        id="lesson-log-search"
        v-model="searchQuery"
        type="search"
        placeholder="Search by student, subject, date, or status"
        class="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/30"
      >
      <button
        v-if="searchQuery"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Clear lesson log search"
        @click="searchQuery = ''"
      >
        Clear
      </button>
    </div>

    <!-- Cards below lg, table above: eight columns will not fit a phone. -->
    <div class="space-y-3 lg:hidden">
      <article
        v-for="lesson in visibleLessons"
        :key="lesson.id"
        class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">{{ lesson.studentName }}</p>
            <p class="truncate text-[11px] text-slate-500">{{ lesson.subject }}</p>
          </div>
          <span
            class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ring-1"
            :class="statusMeta(lesson.status).chip"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="statusMeta(lesson.status).dot"></span>
            {{ lesson.status }}
          </span>
        </div>

        <dl class="mt-3 space-y-1 border-t border-slate-100 pt-3 text-[11px]">
          <div class="flex justify-between gap-2"><dt class="text-slate-400">Manila</dt><dd class="font-bold text-slate-700">{{ lesson.dateManila }}</dd></div>
          <div class="flex justify-between gap-2">
            <dt class="text-slate-400">Student rating</dt>
            <dd class="font-bold text-slate-700">{{ lesson.studentRating ? `★ ${lesson.studentRating}` : '—' }}</dd>
          </div>
        </dl>

        <p v-if="lesson.studentComment" class="mt-2 rounded-xl bg-slate-50 p-2.5 text-[11px] italic text-slate-600">
          “{{ lesson.studentComment }}”
        </p>

        <div class="mt-3 flex gap-2">
          <button
            type="button"
            @click="feedbackLesson = lesson"
            class="flex-1 rounded-xl border border-transparent px-3 py-2.5 text-xs font-extrabold transition active:scale-95"
            :class="lesson.feedbackSubmitted
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'bg-brighture-gold text-brighture-ink hover:bg-brighture-gold-deep'"
          >
            {{ lesson.feedbackSubmitted ? 'View feedback' : 'Write feedback' }}
          </button>
          <button
            type="button"
            @click="materialsLesson = lesson"
            class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <i class="fa-regular fa-folder-open text-[11px] text-slate-400"></i>
            Materials
            <span v-if="teacher.materialCount(lesson.studentId)" class="tabular-nums text-slate-400">
              ({{ teacher.materialCount(lesson.studentId) }})
            </span>
          </button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[780px] text-sm">
          <thead class="bg-slate-50 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">Appointed date</th>
              <th class="px-4 py-3">Student</th>
              <th class="px-4 py-3">Subject</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3">Evaluation from the student</th>
              <th class="px-4 py-3 text-center">Feedback</th>
              <th class="px-4 py-3 text-center">Materials</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="lesson in visibleLessons" :key="lesson.id" class="align-top hover:bg-slate-50/70">
              <td class="px-4 py-3">
                <p class="font-bold text-slate-900">{{ lesson.dateManila }}</p>
                <p class="text-[11px] text-slate-500">{{ lesson.dateTokyo }} · Tokyo</p>
              </td>
              <td class="px-4 py-3 font-bold text-slate-800">{{ lesson.studentName }}</td>
              <td class="px-4 py-3">
                <p class="text-slate-800">{{ lesson.subject }}</p>
                <p class="text-[11px] text-slate-500">{{ lesson.category }}</p>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1"
                  :class="statusMeta(lesson.status).chip"
                >
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="statusMeta(lesson.status).dot"></span>
                  {{ lesson.status }}
                </span>
              </td>
              <td class="px-4 py-3 max-w-xs">
                <p v-if="lesson.studentRating" class="font-bold text-amber-600">★ {{ lesson.studentRating }}</p>
                <p v-if="lesson.studentComment" class="text-[12px] italic text-slate-500">“{{ lesson.studentComment }}”</p>
                <p v-if="!lesson.studentRating && !lesson.studentComment" class="text-slate-400">—</p>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  @click="feedbackLesson = lesson"
                  class="rounded-xl px-3 py-1.5 text-[11px] font-extrabold transition active:scale-95"
                  :class="lesson.feedbackSubmitted
                    ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    : 'bg-brighture-gold text-brighture-ink hover:bg-brighture-gold-deep'"
                >
                  {{ lesson.feedbackSubmitted ? 'View' : 'Write' }}
                </button>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  @click="materialsLesson = lesson"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                  :title="`Lesson materials for ${lesson.studentName}`"
                >
                  <i class="fa-regular fa-folder-open text-[11px] text-slate-400"></i>
                  <span class="tabular-nums">{{ teacher.materialCount(lesson.studentId) || 'Add' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="!visibleLessons.length" class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {{ searchQuery ? 'No lessons match your search.' : 'Nothing in this view yet.' }}
    </p>

    <StudentMaterialsModal :student="materialsLesson" @close="materialsLesson = null" />

    <LessonFeedbackModal
      :lesson="feedbackLesson"
      @close="feedbackLesson = null"
      @submit="saveFeedback"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LessonFeedbackModal from '../../components/teacher/LessonFeedbackModal.vue';
import StudentMaterialsModal from '../../components/teacher/StudentMaterialsModal.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

const tabs = [
  { key: 'all', label: 'All lessons' },
  { key: 'pending', label: 'Feedback pending' },
];
const activeTab = ref('all');
const searchQuery = ref('');

const visibleLessons = computed(() => {
  const lessons = activeTab.value === 'pending' ? teacher.pendingFeedback : teacher.lessonLog;
  const query = searchQuery.value.trim().toLocaleLowerCase();

  if (!query) return lessons;

  return lessons.filter((lesson) => [
    lesson.studentName,
    lesson.subject,
    lesson.category,
    lesson.status,
    lesson.dateManila,
    lesson.dateTokyo,
    lesson.studentComment,
  ].some((value) => value?.toLocaleLowerCase().includes(query)));
});

const feedbackLesson = ref(null);
const materialsLesson = ref(null);

const saveFeedback = ({ id, feedback, hiddenNote }) => {
  teacher.submitFeedback(id, { feedback, hiddenNote });
  feedbackLesson.value = null;
};

/**
 * A status is a word plus a colour, and the colour carries most of the meaning —
 * the dot makes it readable at a glance without leaning on hue alone.
 */
const STATUS_STYLES = {
  completed: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  noShow: { chip: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  other: { chip: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
};

const statusMeta = (status) => {
  const value = String(status ?? '');
  if (value.startsWith('No show')) return STATUS_STYLES.noShow;
  if (value === 'Completed') return STATUS_STYLES.completed;
  return STATUS_STYLES.other;
};
</script>
