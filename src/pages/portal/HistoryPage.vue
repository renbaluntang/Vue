<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brighture-cream text-lg"><i class="fa-solid fa-clock-rotate-left text-brighture-bronze" aria-hidden="true"></i></span>
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
        <i class="fa-solid fa-calendar-days" aria-hidden="true"></i> Book Another Class
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
          <AppImage
            :src="lesson.teacherPhoto"
            :alt="lesson.teacherName"
            class="w-11 h-11 rounded-xl border border-slate-200 shrink-0"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="flex min-w-0 text-sm font-bold text-slate-900"><SubjectCode :subject="lesson.subject" size="sm" /></span>
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
            <!-- What the teacher provided for this lesson -->
            <div v-if="lesson.materials?.length" class="mt-2 flex flex-wrap items-center gap-1.5">
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Materials</span>
              <a
                v-for="m in lesson.materials"
                :key="m.id"
                :href="m.url || undefined"
                target="_blank"
                rel="noopener"
                class="inline-flex max-w-[16rem] items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold ring-1 transition hover:brightness-95"
                :class="materialKind(m.kind).chip"
                :title="m.note || m.title"
              >
                <i :class="materialKind(m.kind).icon" class="text-[10px]" aria-hidden="true"></i>
                <span class="truncate">{{ m.title }}</span>
              </a>
            </div>
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
            <span v-if="lesson.yourRating" class="inline-flex items-center gap-0.5 text-sm leading-none">
              <i v-for="n in 5" :key="n" class="fa-solid fa-star" :class="n <= lesson.yourRating ? 'text-brighture-gold-deep' : 'text-brighture-gold/40'" aria-hidden="true"></i>
            </span>
            <span v-else>Rate teacher</span>
          </button>
          <!-- The lesson's recording, while its link is still shown. -->
          <a
            v-if="recordingOf(lesson) === 'recorded'"
            :href="school.findLesson(lesson.id).recording.url"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <i class="fa-solid fa-circle-play text-[11px] text-slate-500" aria-hidden="true"></i> Watch recording
          </a>
          <span v-else-if="recordingOf(lesson) === 'processing'" class="text-[11px] font-semibold text-slate-400">Recording processing</span>
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
            <h2 id="lesson-feedback-title" class="mt-1 flex min-w-0 text-lg font-extrabold sm:text-xl">
              <SubjectCode :subject="openLesson.subject" />
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
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div class="space-y-4 p-5 sm:p-6">
          <div class="flex items-center gap-3">
            <AppImage
              :src="openLesson.teacherPhoto"
              :alt="openLesson.teacherName"
              eager
              class="h-10 w-10 rounded-xl ring-1 ring-slate-200"
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

          <div v-if="openLesson.materials?.length">
            <p class="m-0 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Materials from {{ openLesson.teacherName.split(' ')[0] }}
            </p>
            <ul class="m-0 list-none space-y-2 p-0">
              <li v-for="m in openLesson.materials" :key="m.id">
                <a
                  :href="m.url || undefined"
                  target="_blank"
                  rel="noopener"
                  class="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1" :class="materialKind(m.kind).chip">
                    <i :class="materialKind(m.kind).icon" class="text-xs" aria-hidden="true"></i>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-bold text-slate-900">{{ m.title }}</span>
                    <span class="block text-[11px] font-medium text-slate-500">{{ materialKind(m.kind).label }} · added {{ m.addedOn }}</span>
                    <span v-if="m.note" class="mt-0.5 block text-xs italic text-slate-600">{{ m.note }}</span>
                  </span>
                  <i v-if="m.url" class="fa-solid fa-arrow-up-right-from-square mt-1 text-[11px] text-slate-400" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
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

    <!-- Rate teacher. Pinned near the top like every other pop-up, so the
         dialog doesn't jump when the comment box grows. -->
    <div
      v-if="ratingTarget"
      class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 pt-6 backdrop-blur-xs animate-in fade-in duration-200 sm:pt-12"
      @click.self="ratingTarget = null"
      @keydown.esc="ratingTarget = null"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-teacher-title"
        class="relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5 animate-in zoom-in-95"
      >
        <button
          type="button"
          @click="ratingTarget = null"
          class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>

        <!-- A warm cream band behind the photo ties the dialog to the brand
             without colouring the whole surface. -->
        <div class="bg-gradient-to-b from-brighture-cream to-white px-6 pb-2 pt-8 text-center sm:px-8">
          <div class="relative mx-auto w-fit">
            <AppImage
              :src="ratingTarget.teacherPhoto"
              :alt="ratingTarget.teacherName"
              eager
              class="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-[0_6px_20px_-6px_rgba(138,102,0,0.45)]"
            />
          </div>
          <h2 id="rate-teacher-title" class="mt-4 text-xl font-extrabold tracking-tight text-brighture-ink">
            How was your lesson with {{ firstName(ratingTarget.teacherName) }}?
          </h2>
          <p class="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
            <SubjectCode :subject="ratingTarget.subject" size="sm" /><span aria-hidden="true">·</span><span>{{ ratingTarget.date }}</span>
          </p>
        </div>

        <div class="px-6 pb-6 sm:px-8">
          <!-- Stars. Hovering previews the rating across every star up to the
               pointer; choosing one replays a short fill from left to right so
               the pick feels set rather than merely recoloured. Arrow keys
               move the rating like any radio group. -->
          <div
            :key="`stars-${shakeKey}`"
            class="mt-5 flex items-center justify-center gap-1"
            :class="shakeKey ? 'stars-shake' : ''"
            role="radiogroup"
            :aria-invalid="missingStars"
            :aria-describedby="missingStars ? 'rate-teacher-warning' : undefined"
            aria-label="Rating out of five"
            @mouseleave="hoverStars = 0"
            @keydown.right.prevent="stepStars(1)"
            @keydown.up.prevent="stepStars(1)"
            @keydown.left.prevent="stepStars(-1)"
            @keydown.down.prevent="stepStars(-1)"
          >
            <button
              v-for="star in 5"
              :key="star"
              :ref="(el) => (starButtons[star - 1] = el)"
              type="button"
              role="radio"
              :aria-checked="draftStars === star"
              :aria-label="`${star} of 5, ${STAR_LABELS[star]}`"
              :tabindex="star === (draftStars || 1) ? 0 : -1"
              @mouseenter="hoverStars = star"
              @click="pickStars(star)"
              class="group/star rounded-xl p-1.5 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            >
              <i
                :key="star <= draftStars ? `on-${popKey}` : 'off'"
                class="fa-solid fa-star block text-[2.5rem] transition-[color,transform] duration-150 ease-out group-hover/star:scale-110 motion-reduce:transition-none"
                :class="[
                  star <= shownStars ? 'star-on' : 'text-slate-200',
                  star <= draftStars && popKey ? 'star-pop' : '',
                ]"
                :style="star <= draftStars && popKey ? { animationDelay: `${(star - 1) * 45}ms` } : null"
                aria-hidden="true"
              ></i>
            </button>
          </div>
          <!-- Submitting without a star swaps the hint for a warning in the
               same spot, so nothing below shifts. -->
          <p
            v-if="missingStars && !shownStars"
            id="rate-teacher-warning"
            class="mt-2 flex h-5 items-center justify-center gap-1.5 text-center text-sm font-bold text-rose-600"
            role="alert"
          >
            <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
            Choose a star rating before you submit
          </p>
          <p v-else class="mt-2 h-5 text-center text-sm font-bold" :class="shownStars ? 'text-brighture-bronze' : 'text-slate-400'" aria-live="polite">
            {{ STAR_LABELS[shownStars] ?? 'Tap a star to rate' }}
          </p>

          <label for="rate-teacher-comment" class="mt-5 block text-xs font-bold text-slate-700">
            {{ commentPrompt }} <span class="font-semibold text-slate-400">(optional)</span>
          </label>
          <div class="relative mt-1.5">
            <textarea
              id="rate-teacher-comment"
              v-model="draftComment"
              rows="3"
              maxlength="300"
              placeholder="Your message to the instructor"
              class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 pb-6 pt-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-amber focus:bg-white focus:ring-4 focus:ring-brighture-gold/20"
            ></textarea>
            <span class="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] font-semibold tabular-nums text-slate-400">
              {{ draftComment.length }}/300
            </span>
          </div>

          <!-- Equal halves. Submit stays clickable without a rating so the
               student gets told why instead of facing a dead button. -->
          <div class="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              @click="ratingTarget = null"
              class="h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="submitRating"
              class="h-11 rounded-xl border text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold focus-visible:ring-offset-2"
              :class="draftStars
                ? 'border-transparent bg-gradient-to-br from-[#FFE066] via-brighture-gold to-[#F5A000] text-brighture-ink shadow-md shadow-brighture-amber/30 hover:brightness-105'
                : 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200/70'"
            >
              {{ ratingTarget.yourRating ? 'Update rating' : 'Submit rating' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppImage from '../../components/AppImage.vue';
import SubjectCode from '../../components/SubjectCode.vue';
import { computed, ref } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import { materialKind } from '@/lib/lessonMaterials';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { CURRENT_STUDENT_ID } from '@/lib/schoolSeed';
import { recordingState } from '@/lib/lessonRecording';

const user = useUserStore();
const school = useSchoolStore();

/** 'recorded' | 'processing' | 'expired' | 'none' for a past class. */
const recordingOf = (lesson) => recordingState(school.findLesson(lesson.id), school.student(CURRENT_STUDENT_ID), school.now);

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
// The star under the pointer, so the row previews a rating before it's chosen.
const hoverStars = ref(0);
// Bumped on every pick so the chosen stars re-mount and replay their fill.
// Zero on open, so a saved rating shows without animating.
const popKey = ref(0);
const starButtons = ref([]);
// Set when Submit is pressed with no stars; cleared as soon as one is picked.
const missingStars = ref(false);
// Bumped on each empty submit so the star row re-mounts and replays its shake.
const shakeKey = ref(0);

const shownStars = computed(() => hoverStars.value || draftStars.value);

const firstName = (name = '') => name.split(' ')[0];

// The question follows the rating, so a low score asks what to fix and a
// high one asks what worked.
const commentPrompt = computed(() => {
  if (!draftStars.value) return 'Anything you want to say about this lesson?';
  return draftStars.value <= 3 ? 'What could have been better?' : 'What did you enjoy most?';
});

const openRating = (lesson) => {
  ratingTarget.value = lesson;
  draftStars.value = lesson.yourRating ?? 0;
  draftComment.value = lesson.yourComment ?? '';
  hoverStars.value = 0;
  popKey.value = 0;
  missingStars.value = false;
  shakeKey.value = 0;
};

const pickStars = (star) => {
  draftStars.value = star;
  popKey.value += 1;
  missingStars.value = false;
};

const stepStars = (delta) => {
  const next = Math.min(5, Math.max(1, (draftStars.value || 0) + delta));
  pickStars(next);
  starButtons.value[next - 1]?.focus();
};

const submitRating = () => {
  if (!draftStars.value) {
    missingStars.value = true;
    shakeKey.value += 1;
    return;
  }
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

<style scoped>
/* Filled stars run from light to deep gold, top to bottom, so they read as
   lit rather than flat yellow. */
.star-on {
  background: linear-gradient(180deg, #ffe066 0%, #ffcd00 45%, #f5a000 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 3px rgba(224, 168, 0, 0.35));
  /* The star glyph pokes out of its line box and a clipped background only
     paints inside the box, so pad it (and pull the margin back) or the tips
     get cut off and the gold stars look shorter than the grey ones. */
  padding: 0.12em 0;
  margin: -0.12em 0;
}

/* One short bounce when a star is chosen; it plays once and stops. */
.star-pop {
  animation: star-pop 360ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes star-pop {
  0% { transform: scale(0.6); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* A short sideways shake when Submit is pressed without a rating. */
.stars-shake {
  animation: stars-shake 380ms ease-in-out;
}

@keyframes stars-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@media (prefers-reduced-motion: reduce) {
  .star-pop,
  .stars-shake { animation: none; }
}
</style>
