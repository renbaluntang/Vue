<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

    <!-- ===================== LIST ===================== -->
    <template v-if="view === 'list'">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div class="min-w-0">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Tests &amp; Exams</h1>
          <p class="text-slate-500 font-medium mt-1">Assessments your instructors have assigned to you.</p>
        </div>

        <div class="flex shrink-0 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Filter exams">
          <button
            v-for="f in FILTERS"
            :key="f.key"
            type="button"
            role="tab"
            :aria-selected="filter === f.key ? 'true' : 'false'"
            @click="filter = f.key"
            class="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition"
            :class="filter === f.key
              ? 'bg-brighture-gold text-brighture-ink shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'"
          >
            {{ f.label }}
            <span
              class="rounded-full px-1.5 text-[10px] font-black tabular-nums"
              :class="filter === f.key ? 'bg-white/60' : 'bg-slate-100 text-slate-500'"
            >{{ counts[f.key] }}</span>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <button
          v-for="row in filteredRows"
          :key="row.exam.id"
          type="button"
          @click="openExam(row.exam.id)"
          class="group w-full rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 text-left shadow-sm transition hover:border-brighture-gold/40 hover:shadow-md"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="flex min-w-0 flex-1 gap-4">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brighture-cream text-lg text-brighture-bronze">
                <i class="fa-solid fa-file-pen"></i>
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-600">{{ row.exam.subject }}</span>
                  <span class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" :class="row.status.cls">
                    {{ row.status.label }}
                  </span>
                </div>
                <p class="mt-1.5 text-sm sm:text-base font-bold text-slate-900 group-hover:text-brighture-ink">{{ row.exam.title }}</p>
                <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                  <span class="flex items-center gap-1.5">
                    <AppImage :src="row.teacher.photo" :alt="row.teacher.name" class="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200" />
                    {{ row.teacher.name }}
                  </span>
                  <span><i class="fa-regular fa-clock mr-1 text-slate-400"></i>{{ row.exam.durationMinutes }} min</span>
                  <span><i class="fa-solid fa-list-ol mr-1 text-slate-400"></i>{{ row.exam.questions.length }} questions</span>
                  <span><i class="fa-solid fa-star mr-1 text-slate-400"></i>{{ row.max }} pts</span>
                </div>
              </div>
            </div>

            <div class="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
              <span v-if="row.sub" class="text-right">
                <span class="block text-lg font-black text-slate-900 tabular-nums">
                  {{ school.submissionScore(row.sub) }}<span class="text-sm text-slate-400"> / {{ row.max }}</span>
                </span>
                <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {{ row.sub.graded ? 'Final score' : 'So far' }}
                </span>
              </span>
              <span
                class="rounded-xl px-4 py-2 text-xs font-bold transition"
                :class="row.sub
                  ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  : 'bg-brighture-gold text-brighture-ink shadow-md group-hover:bg-brighture-gold-deep'"
              >
                {{ row.sub ? 'View results' : 'Start' }}
              </span>
            </div>
          </div>
        </button>

        <div
          v-if="!filteredRows.length"
          class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"
        >
          <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-2xl shadow-inner"><i class="fa-solid fa-file-pen text-indigo-600" aria-hidden="true"></i></div>
          <h3 class="text-lg font-bold text-slate-800">
            {{ !rows.length ? 'No tests assigned yet' : filter === 'todo' ? 'All caught up' : 'Nothing finished yet' }}
          </h3>
          <p class="mx-auto mt-1 max-w-sm text-sm font-medium text-slate-500">
            {{ !rows.length
              ? 'When an instructor assigns you a test, it will appear here.'
              : filter === 'todo' ? 'You have taken every test assigned to you.' : 'Tests you submit will appear here with your results.' }}
          </p>
        </div>
      </div>
    </template>

    <!-- ===================== START SCREEN ===================== -->
    <template v-else-if="view === 'intro' && activeExam">
      <button type="button" @click="backToList" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900">
        ← All tests
      </button>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 bg-gradient-to-b from-brighture-cream to-white p-6 sm:p-8">
          <span class="rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brighture-bronze ring-1 ring-brighture-gold/30">{{ activeExam.subject }}</span>
          <h1 class="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{{ activeExam.title }}</h1>
          <p class="mt-2 text-sm font-medium leading-relaxed text-slate-600">{{ activeExam.description }}</p>
          <p class="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <AppImage :src="activeTeacher.photo" :alt="activeTeacher.name" class="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200" />
            Assigned by {{ activeTeacher.name }}
          </p>
        </div>

        <div class="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 text-center">
          <div class="p-4">
            <p class="text-xl font-black text-slate-900 tabular-nums">{{ activeExam.durationMinutes }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minutes</p>
          </div>
          <div class="p-4">
            <p class="text-xl font-black text-slate-900 tabular-nums">{{ activeExam.questions.length }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions</p>
          </div>
          <div class="p-4">
            <p class="text-xl font-black text-slate-900 tabular-nums">{{ school.examMaxScore(activeExam) }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</p>
          </div>
        </div>

        <div class="space-y-3 p-6 sm:p-8">
          <h2 class="text-sm font-extrabold text-slate-800">Before you begin</h2>
          <ul class="space-y-2 text-sm font-medium text-slate-600">
            <li class="flex gap-2.5"><i class="fa-regular fa-clock mt-0.5 w-4 text-center text-indigo-500"></i>The timer starts as soon as you press Start and cannot be paused. When it reaches zero, your answers are submitted automatically.</li>
            <li v-if="mcqCount" class="flex gap-2.5"><i class="fa-solid fa-circle-check mt-0.5 w-4 text-center text-emerald-500"></i>{{ mcqCount }} multiple-choice {{ mcqCount === 1 ? 'question is' : 'questions are' }} marked instantly.</li>
            <li v-if="essayCount" class="flex gap-2.5"><i class="fa-solid fa-pen mt-0.5 w-4 text-center text-rose-500"></i>{{ essayCount }} written {{ essayCount === 1 ? 'answer is' : 'answers are' }} graded by your instructor. Keep within the word range shown.</li>
            <li class="flex gap-2.5"><i class="fa-solid fa-lock mt-0.5 w-4 text-center text-slate-400"></i>You can submit only once. Stay on this page until you finish — leaving discards your answers.</li>
          </ul>

          <div class="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
            <button type="button" @click="backToList" class="rounded-xl px-5 py-2.5 font-bold text-slate-500 transition hover:bg-slate-100">
              Not now
            </button>
            <button
              type="button"
              @click="startExam"
              class="rounded-xl border border-transparent bg-brighture-gold px-6 py-2.5 font-bold text-brighture-ink shadow-md transition hover:bg-brighture-gold-deep hover:shadow-lg active:scale-95"
            >
              Start test
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===================== TAKING ===================== -->
    <template v-else-if="view === 'taking' && activeExam">
      <!-- Pinned bar: timer and progress stay in view while scrolling. -->
      <div class="sticky top-0 z-20 -mx-4 sm:mx-0 border-b sm:border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm sm:rounded-2xl">
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-900">{{ activeExam.title }}</p>
            <div class="mt-1.5 flex items-center gap-2">
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-brighture-gold transition-all" :style="{ width: `${progressPct}%` }"></div>
              </div>
              <span class="shrink-0 text-[11px] font-bold text-slate-500 tabular-nums">{{ answeredCount }}/{{ activeExam.questions.length }} answered</span>
            </div>
          </div>
          <span
            class="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-black tabular-nums"
            :class="remainingMs <= 60_000
              ? 'bg-rose-100 text-rose-700 animate-pulse motion-reduce:animate-none'
              : remainingMs <= 5 * 60_000 ? 'bg-amber-100 text-amber-800' : 'bg-slate-900 text-white'"
            role="timer"
            :aria-label="`Time remaining ${timerLabel}`"
          >
            <i class="fa-regular fa-clock text-xs"></i>{{ timerLabel }}
          </span>
        </div>
      </div>

      <div class="space-y-4">
        <section
          v-for="(q, i) in activeExam.questions"
          :key="q.id"
          class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Question {{ i + 1 }} · {{ q.type === 'mcq' ? 'Multiple choice' : 'Written answer' }}
            </span>
            <span class="rounded-md bg-brighture-cream px-2 py-0.5 text-[10px] font-black text-brighture-bronze tabular-nums">{{ q.points }} pts</span>
          </div>
          <p class="text-sm sm:text-base font-bold leading-relaxed text-slate-900">{{ q.prompt }}</p>

          <!-- Multiple choice -->
          <fieldset v-if="q.type === 'mcq'" class="mt-4 space-y-2">
            <legend class="sr-only">Options for question {{ i + 1 }}</legend>
            <label
              v-for="(opt, oi) in q.options"
              :key="oi"
              class="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition"
              :class="answers[q.id] === oi
                ? 'border-brighture-gold bg-brighture-cream text-slate-900 shadow-inner'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
            >
              <input
                type="radio"
                :name="`q-${q.id}`"
                :value="oi"
                v-model="answers[q.id]"
                class="h-4 w-4 shrink-0 accent-[#E0A800]"
              />
              <span class="font-black text-slate-400">{{ LETTERS[oi] }}.</span>
              <span>{{ opt }}</span>
            </label>
          </fieldset>

          <!-- Essay -->
          <div v-else class="mt-4">
            <label :for="`essay-${q.id}`" class="sr-only">Your answer to question {{ i + 1 }}</label>
            <textarea
              :id="`essay-${q.id}`"
              v-model="answers[q.id]"
              rows="9"
              placeholder="Write your answer here…"
              class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition-all focus:border-brighture-amber focus:ring-4 focus:ring-brighture-gold/20"
            ></textarea>
            <div class="mt-1.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold">
              <span class="text-slate-400">
                <template v-if="q.rubricFocus">Focus: {{ q.rubricFocus }}</template>
              </span>
              <span class="tabular-nums" :class="wordTone(q)">
                {{ words(answers[q.id]) }} words
                <span class="font-medium text-slate-400">· {{ rangeLabel(q) }}</span>
              </span>
            </div>
          </div>
        </section>
      </div>

      <!-- Submit, with an in-page confirmation step. -->
      <div class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div v-if="!confirming" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm font-medium text-slate-500">
            {{ answeredCount === activeExam.questions.length ? 'Every question has an answer.' : `${activeExam.questions.length - answeredCount} question(s) still unanswered.` }}
          </p>
          <button
            type="button"
            @click="confirming = true"
            class="rounded-xl border border-transparent bg-brighture-gold px-6 py-2.5 font-bold text-brighture-ink shadow-md transition hover:bg-brighture-gold-deep active:scale-95"
          >
            Submit test
          </button>
        </div>

        <div v-else class="space-y-3 animate-in fade-in zoom-in-95">
          <p class="text-sm font-extrabold text-slate-900">Submit your answers now?</p>
          <ul class="space-y-1 text-sm font-medium text-slate-600">
            <li v-if="answeredCount < activeExam.questions.length" class="flex gap-2">
              <i class="fa-solid fa-triangle-exclamation mt-0.5 text-amber-500"></i>
              {{ activeExam.questions.length - answeredCount }} question(s) unanswered — they will score 0.
            </li>
            <li v-for="q in essaysOutOfRange" :key="q.id" class="flex gap-2">
              <i class="fa-solid fa-triangle-exclamation mt-0.5 text-amber-500"></i>
              Question {{ activeExam.questions.indexOf(q) + 1 }} has {{ words(answers[q.id]) }} words ({{ rangeLabel(q) }}).
            </li>
            <li class="flex gap-2">
              <i class="fa-solid fa-lock mt-0.5 text-slate-400"></i>
              You cannot change your answers after submitting.
            </li>
          </ul>
          <div class="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" @click="confirming = false" class="rounded-xl px-5 py-2.5 font-bold text-slate-500 transition hover:bg-slate-100">
              Keep working
            </button>
            <button
              type="button"
              @click="submit"
              class="rounded-xl border border-transparent bg-slate-900 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95"
            >
              Yes, submit
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===================== RESULTS ===================== -->
    <template v-else-if="view === 'result' && activeExam && activeSub">
      <button type="button" @click="backToList" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900">
        ← All tests
      </button>

      <div
        v-if="justSubmitted"
        class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
      >
        <i class="fa-solid fa-circle-check mt-0.5"></i>
        <span>
          {{ autoSubmitted ? 'Time is up — your answers were submitted automatically.' : 'Your answers were submitted.' }}
          <template v-if="!activeSub.graded"> {{ firstName(activeTeacher.name) }} will grade your written answers soon.</template>
        </span>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <div class="min-w-0 flex-1">
            <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-600">{{ activeExam.subject }}</span>
            <h1 class="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{{ activeExam.title }}</h1>
            <p class="mt-1 text-xs font-medium text-slate-500">
              Submitted {{ dateIn(activeSub.submittedAt, TOKYO) }} at {{ clockIn(activeSub.submittedAt, TOKYO) }} JST · {{ activeTeacher.name }}
            </p>
          </div>
          <div class="shrink-0 rounded-2xl px-6 py-4 text-center" :class="activeSub.graded ? 'bg-brighture-cream' : 'bg-slate-50'">
            <p class="text-3xl font-black text-slate-900 tabular-nums">
              {{ school.submissionScore(activeSub) }}<span class="text-lg text-slate-400"> / {{ school.examMaxScore(activeExam) }}</span>
            </p>
            <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider" :class="activeSub.graded ? 'text-brighture-bronze' : 'text-amber-600'">
              {{ activeSub.graded ? 'Final score' : 'Awaiting grading' }}
            </p>
          </div>
        </div>

        <div v-if="activeSub.teacherComment" class="border-t border-slate-100 bg-slate-50/60 p-5 sm:px-8">
          <div class="flex gap-3">
            <AppImage :src="activeTeacher.photo" :alt="activeTeacher.name" class="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-600">Comment from {{ activeTeacher.name }}</p>
              <p class="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ activeSub.teacherComment }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <section
          v-for="(q, i) in activeExam.questions"
          :key="q.id"
          class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">Question {{ i + 1 }}</span>
            <span class="rounded-md px-2 py-0.5 text-[10px] font-black tabular-nums" :class="resultChip(q).cls">{{ resultChip(q).label }}</span>
          </div>
          <p class="text-sm sm:text-base font-bold leading-relaxed text-slate-900">{{ q.prompt }}</p>

          <template v-if="q.type === 'mcq'">
            <ul class="mt-4 space-y-2">
              <li
                v-for="(opt, oi) in q.options"
                :key="oi"
                class="flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-medium"
                :class="optionClass(q, oi)"
              >
                <span class="font-black opacity-60">{{ LETTERS[oi] }}.</span>
                <span class="min-w-0 flex-1">{{ opt }}</span>
                <span v-if="oi === q.correctIndex" class="shrink-0 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <i class="fa-solid fa-check mr-1"></i>Correct
                </span>
                <span v-else-if="activeSub.answers[q.id] === oi" class="shrink-0 text-[10px] font-black uppercase tracking-wider text-rose-700">
                  <i class="fa-solid fa-xmark mr-1"></i>Your answer
                </span>
              </li>
            </ul>
            <p v-if="activeSub.answers[q.id] === undefined" class="mt-2 text-xs font-bold text-slate-400">Not answered</p>
            <p v-if="q.explanation" class="mt-3 rounded-2xl bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600">
              <i class="fa-solid fa-lightbulb mr-1.5 text-amber-500"></i>{{ q.explanation }}
            </p>
          </template>

          <template v-else>
            <div class="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">{{ activeSub.answers[q.id] || 'No answer submitted.' }}</div>
            <p class="mt-1.5 px-1 text-right text-xs font-bold text-slate-400 tabular-nums">{{ words(activeSub.answers[q.id]) }} words · {{ rangeLabel(q) }}</p>
          </template>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppImage from '../../components/AppImage.vue';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { CURRENT_STUDENT_ID } from '../../lib/schoolSeed';
import { TOKYO, clockIn, dateIn } from '../../lib/schoolTime';

const school = useSchoolStore();
const route = useRoute();
const router = useRouter();

const ME = CURRENT_STUDENT_ID;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'done', label: 'Done' },
];

const firstName = (name) => String(name ?? '').split(' ')[0];
const words = (text) => (typeof text === 'string' ? text.trim().split(/\s+/).filter(Boolean).length : 0);
const rangeLabel = (q) => {
  if (q.minWords && q.maxWords) return `${q.minWords}–${q.maxWords} words`;
  if (q.minWords) return `at least ${q.minWords} words`;
  if (q.maxWords) return `up to ${q.maxWords} words`;
  return 'no word limit';
};
const inRange = (q, n) => (!q.minWords || n >= q.minWords) && (!q.maxWords || n <= q.maxWords);

// ── List ─────────────────────────────────────────────────────────────────
const statusOf = (sub, max) => {
  if (!sub) return { label: 'Not started', cls: 'bg-amber-100 text-amber-800' };
  if (!sub.graded) return { label: 'Submitted — awaiting grading', cls: 'bg-sky-100 text-sky-800' };
  return { label: `Graded · ${school.submissionScore(sub)}/${max}`, cls: 'bg-emerald-100 text-emerald-700' };
};

const rows = computed(() =>
  school.examsForStudent(ME).map((exam) => {
    const sub = school.submissionFor(exam.id, ME);
    const max = school.examMaxScore(exam);
    return { exam, sub, max, teacher: school.teacher(exam.teacherId), status: statusOf(sub, max) };
  }).sort((a, b) => {
    // To-do first, then newest.
    if (!!a.sub !== !!b.sub) return a.sub ? 1 : -1;
    return (b.exam.updatedAt ?? '').localeCompare(a.exam.updatedAt ?? '');
  }));

const filter = ref('all');
const counts = computed(() => ({
  all: rows.value.length,
  todo: rows.value.filter((r) => !r.sub).length,
  done: rows.value.filter((r) => r.sub).length,
}));
const filteredRows = computed(() => {
  if (filter.value === 'todo') return rows.value.filter((r) => !r.sub);
  if (filter.value === 'done') return rows.value.filter((r) => r.sub);
  return rows.value;
});

// ── Active exam ──────────────────────────────────────────────────────────
// view: 'list' | 'intro' | 'taking' | 'result'
const view = ref('list');
const activeId = ref(null);
const activeExam = computed(() => school.examsForStudent(ME).find((e) => e.id === activeId.value) ?? null);
const activeSub = computed(() => (activeId.value ? school.submissionFor(activeId.value, ME) : null));
const activeTeacher = computed(() => school.teacher(activeExam.value?.teacherId));
const mcqCount = computed(() => activeExam.value?.questions.filter((q) => q.type === 'mcq').length ?? 0);
const essayCount = computed(() => activeExam.value?.questions.filter((q) => q.type === 'essay').length ?? 0);

const justSubmitted = ref(false);
const autoSubmitted = ref(false);

const openExam = (id) => {
  activeId.value = id;
  justSubmitted.value = false;
  autoSubmitted.value = false;
  view.value = school.submissionFor(id, ME) ? 'result' : 'intro';
  window.scrollTo?.({ top: 0 });
  document.querySelector('main')?.scrollTo?.({ top: 0 });
};

const backToList = () => {
  stopTimer();
  view.value = 'list';
  activeId.value = null;
  if (route.query.exam) router.replace({ query: { ...route.query, exam: undefined } });
};

// `?exam=<id>` deep-links straight to an exam (start screen or results).
const openFromQuery = () => {
  const id = route.query.exam;
  if (id && school.examsForStudent(ME).some((e) => e.id === id) && view.value !== 'taking') openExam(id);
};
openFromQuery();
watch(() => route.query.exam, openFromQuery);

// ── Taking ───────────────────────────────────────────────────────────────
const answers = reactive({});
const confirming = ref(false);
const deadline = ref(0);
const tick = ref(Date.now());
let timer = null;

const stopTimer = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

const startExam = () => {
  if (!activeExam.value || activeSub.value) return;
  Object.keys(answers).forEach((k) => { delete answers[k]; });
  confirming.value = false;
  deadline.value = Date.now() + activeExam.value.durationMinutes * 60_000;
  tick.value = Date.now();
  stopTimer();
  timer = setInterval(() => {
    tick.value = Date.now();
    if (tick.value >= deadline.value) submit({ auto: true });
  }, 1000);
  view.value = 'taking';
};

onBeforeUnmount(stopTimer);

const remainingMs = computed(() => Math.max(0, deadline.value - tick.value));
const timerLabel = computed(() => {
  const s = Math.ceil(remainingMs.value / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
});

const isAnswered = (q) => (q.type === 'mcq' ? answers[q.id] !== undefined : words(answers[q.id]) > 0);
const answeredCount = computed(() => activeExam.value?.questions.filter(isAnswered).length ?? 0);
const progressPct = computed(() => {
  const total = activeExam.value?.questions.length || 1;
  return Math.round((answeredCount.value / total) * 100);
});
const essaysOutOfRange = computed(() =>
  (activeExam.value?.questions ?? []).filter((q) => q.type === 'essay' && words(answers[q.id]) > 0 && !inRange(q, words(answers[q.id]))));

const wordTone = (q) => {
  const n = words(answers[q.id]);
  if (!n) return 'text-slate-400';
  if (q.maxWords && n > q.maxWords) return 'text-red-500';
  if (q.minWords && n < q.minWords) return 'text-amber-600';
  return 'text-emerald-600';
};

// The store also refuses a second submission; this guard keeps the timer and
// a fast double-click from even trying.
let submitting = false;
const submit = ({ auto = false } = {}) => {
  if (submitting || !activeExam.value) return;
  submitting = true;
  stopTimer();
  if (!school.submissionFor(activeExam.value.id, ME)) {
    const payload = {};
    activeExam.value.questions.forEach((q) => {
      if (q.type === 'mcq') { if (answers[q.id] !== undefined) payload[q.id] = answers[q.id]; } else payload[q.id] = (answers[q.id] ?? '').trim();
    });
    school.submitExam({ examId: activeExam.value.id, studentId: ME, answers: payload });
  }
  confirming.value = false;
  justSubmitted.value = true;
  autoSubmitted.value = auto;
  view.value = 'result';
  submitting = false;
  document.querySelector('main')?.scrollTo?.({ top: 0 });
};

// If the exam is withdrawn or reset from another tab, fall back to the list.
watch(activeExam, (exam) => {
  if (!exam && view.value !== 'list') backToList();
});
// A demo reset can remove the submission under an open results view.
watch(activeSub, (sub) => {
  if (!sub && view.value === 'result') view.value = 'intro';
});

// ── Results ──────────────────────────────────────────────────────────────
const optionClass = (q, oi) => {
  const chosen = activeSub.value?.answers[q.id];
  if (oi === q.correctIndex) return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (oi === chosen) return 'border-rose-300 bg-rose-50 text-rose-900';
  return 'border-slate-200 text-slate-500';
};

const resultChip = (q) => {
  const sub = activeSub.value;
  if (q.type === 'mcq') {
    const right = sub.answers[q.id] === q.correctIndex;
    return right
      ? { label: `${q.points}/${q.points} pts`, cls: 'bg-emerald-100 text-emerald-700' }
      : { label: `0/${q.points} pts`, cls: 'bg-rose-100 text-rose-700' };
  }
  const score = sub.essayScores?.[q.id];
  if (score === undefined || score === null) return { label: `Awaiting grading · ${q.points} pts`, cls: 'bg-amber-100 text-amber-800' };
  return { label: `${score}/${q.points} pts`, cls: 'bg-brighture-cream text-brighture-bronze' };
};
</script>
