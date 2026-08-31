<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brighture-cream text-xl">📜</span>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Lesson History</h1>
          <p class="text-sm text-slate-500 font-medium">
            Completed classes, teacher feedback and the points each one used.
          </p>
        </div>
      </div>
      <RouterLink
        to="/booking"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brighture-gold text-brighture-ink font-bold text-sm shadow-md hover:bg-brighture-gold-deep hover:shadow-lg transition-all"
      >
        <span>🗓️</span> Book Another Class
      </RouterLink>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classes taken</p>
        <p class="mt-1 text-2xl font-black text-slate-900">{{ user.stats.totalLessons }}</p>
      </div>
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours learned</p>
        <p class="mt-1 text-2xl font-black text-slate-900">{{ user.stats.completedHours }}</p>
      </div>
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance</p>
        <p class="mt-1 text-2xl font-black text-emerald-600">{{ user.stats.attendanceRate }}%</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-2">
      <button
        v-for="option in FILTERS"
        :key="option.value"
        type="button"
        @click="activeFilter = option.value"
        :class="`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
          activeFilter === option.value
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        }`"
      >
        {{ option.label }}
        <span class="ml-1 opacity-60">{{ countFor(option.value) }}</span>
      </button>
    </div>

    <!-- Lessons -->
    <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm divide-y divide-slate-100 overflow-hidden">
      <div
        v-for="lesson in filteredLessons"
        :key="lesson.id"
        class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/70"
      >
        <div class="flex items-start gap-3.5 min-w-0">
          <img
            :src="lesson.teacherPhoto"
            :alt="lesson.teacherName"
            class="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-slate-900">{{ lesson.subject }}</span>
              <span
                :class="`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  lesson.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                }`"
              >
                {{ lesson.status === 'completed' ? 'Completed' : 'Cancelled' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {{ lesson.teacherName }} · {{ lesson.topic }}
            </p>
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">
              {{ lesson.date }} · {{ lesson.time }} · {{ lesson.duration }} min ·
              {{ lesson.pointsDeducted ? `${lesson.pointsDeducted} pts` : 'refunded' }}
            </p>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2 self-end sm:self-center">
          <button
            v-if="lesson.status === 'completed'"
            type="button"
            @click="openRating(lesson)"
            :class="`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
              lesson.yourRating
                ? 'bg-brighture-cream text-brighture-bronze hover:bg-brighture-gold/25'
                : 'bg-brighture-gold text-brighture-ink hover:bg-brighture-gold-deep shadow-2xs'
            }`"
            :title="lesson.yourRating
              ? `You rated ${lesson.teacherName} ${lesson.yourRating} of 5 — click to change`
              : `Rate ${lesson.teacherName}`"
          >
            <span v-if="lesson.yourRating" class="tracking-[0.15em] text-sm leading-none">
              <span class="text-brighture-gold-deep">{{ '★'.repeat(lesson.yourRating) }}</span><span class="text-brighture-gold/40">{{ '★'.repeat(5 - lesson.yourRating) }}</span>
            </span>
            <span v-else>Rate teacher</span>
          </button>
          <button
            type="button"
            @click="openLesson = lesson"
            class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition"
          >
            {{ lesson.status === 'completed' ? 'Review notes' : 'Why cancelled' }}
          </button>
        </div>
      </div>

      <p v-if="!filteredLessons.length" class="py-10 text-center text-sm font-medium text-slate-400">
        No {{ activeFilter }} classes yet.
      </p>
    </div>

    <!-- Feedback -->
    <div
      v-if="openLesson"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="openLesson = null"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-feedback-title"
        class="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95"
      >
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 text-white sm:p-6">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-wider text-brighture-gold">
              {{ openLesson.status === 'completed' ? 'Teacher feedback' : 'Cancelled class' }}
            </p>
            <h2 id="lesson-feedback-title" class="mt-1 truncate text-lg font-extrabold sm:text-xl">
              {{ openLesson.subject }}
            </h2>
            <p class="mt-0.5 text-xs font-semibold text-slate-300">
              {{ openLesson.date }} · {{ openLesson.duration }} min
            </p>
          </div>
          <button
            @click="openLesson = null"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4 p-5 sm:p-6">
          <div class="flex items-center gap-3">
            <img
              :src="openLesson.teacherPhoto"
              :alt="openLesson.teacherName"
              class="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-slate-900">{{ openLesson.teacherName }}</p>
              <p class="text-[11px] font-semibold text-slate-500">{{ openLesson.topic }}</p>
            </div>
            <span
              v-if="openLesson.rating"
              class="ml-auto shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200"
              title="Your teacher's score for this lesson"
            >
              Lesson score {{ openLesson.rating }}/5
            </span>
          </div>

          <p class="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {{ openLesson.feedback }}
          </p>
        </div>

        <div class="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
          <button
            @click="openLesson = null"
            class="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Rate teacher -->
    <div
      v-if="ratingTarget"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="ratingTarget = null"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-teacher-title"
        class="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95"
      >
        <div class="p-6 text-center">
          <img
            :src="ratingTarget.teacherPhoto"
            :alt="ratingTarget.teacherName"
            class="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-white outline outline-1 outline-slate-200"
          />
          <h2 id="rate-teacher-title" class="mt-3 text-lg font-extrabold text-slate-900">
            Rate {{ ratingTarget.teacherName }}
          </h2>
          <p class="mt-1 text-xs font-semibold text-slate-500">
            {{ ratingTarget.subject }} · {{ ratingTarget.date }}
          </p>

          <!-- Stars -->
          <div class="mt-5 flex items-center justify-center gap-1.5" role="radiogroup" aria-label="Rating out of five">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              role="radio"
              :aria-checked="draftStars === star"
              :aria-label="`${star} of 5`"
              @click="draftStars = star"
              class="rounded-lg p-1 text-3xl leading-none transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
              :class="star <= draftStars ? 'text-brighture-gold-deep' : 'text-slate-200 hover:text-brighture-gold/60'"
            >
              ★
            </button>
          </div>
          <p class="mt-2 h-4 text-xs font-bold text-slate-500">{{ STAR_LABELS[draftStars] ?? '' }}</p>

          <textarea
            v-model="draftComment"
            rows="3"
            maxlength="300"
            placeholder="Anything you want to say about this lesson? (optional)"
            class="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-amber focus:ring-4 focus:ring-brighture-gold/20"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 p-4">
          <button
            @click="ratingTarget = null"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            :disabled="!draftStars"
            @click="submitRating"
            :class="`rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              draftStars
                ? 'bg-brighture-gold text-brighture-ink shadow-xs hover:bg-brighture-gold-deep'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
            }`"
          >
            {{ ratingTarget.yourRating ? 'Update rating' : 'Submit rating' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useUserStore } from '../../stores/useUserStore';

const user = useUserStore();

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const activeFilter = ref('all');
const openLesson = ref(null);

const STAR_LABELS = {
  1: 'Poor',
  2: 'Below expectations',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

const ratingTarget = ref(null);
const draftStars = ref(0);
const draftComment = ref('');

const openRating = (lesson) => {
  ratingTarget.value = lesson;
  draftStars.value = lesson.yourRating ?? 0;
  draftComment.value = lesson.yourComment ?? '';
};

const submitRating = () => {
  if (!draftStars.value) return;
  user.rateLesson(ratingTarget.value.id, draftStars.value, draftComment.value);
  ratingTarget.value = null;
};

const countFor = (value) =>
  value === 'all'
    ? user.pastLessons.length
    : user.pastLessons.filter((lesson) => lesson.status === value).length;

const filteredLessons = computed(() =>
  activeFilter.value === 'all'
    ? user.pastLessons
    : user.pastLessons.filter((lesson) => lesson.status === activeFilter.value)
);
</script>
