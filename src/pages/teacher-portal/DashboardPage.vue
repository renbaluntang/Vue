<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- ===== Header: Named period, no waving hand, clear operational status ===== -->
    <header class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Instructor Overview • {{ zoneShort }}
        </p>
        <h2 class="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {{ todayWeekday }}
          <span class="px-1 font-normal text-slate-300">·</span>
          <span class="font-medium tabular-nums text-slate-600">{{ todayDate }}</span>
        </h2>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium tabular-nums border border-slate-200/60">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          {{ teacher.todaysReservations.length }} lesson{{ teacher.todaysReservations.length === 1 ? '' : 's' }} scheduled today
        </span>
        <span v-if="teacher.attentionItems.length" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-medium tabular-nums">
          {{ teacher.attentionItems.length }} action item{{ teacher.attentionItems.length === 1 ? '' : 's' }} pending
        </span>
      </div>
    </header>

    <!-- ===== Metrics: one primary metric big, three secondary small ===== -->
    <!-- Equal cards read as a spreadsheet with padding — nothing tells the eye
         where to land. Today's load is the hero because it is the only figure
         the instructor acts on in the next few hours; the rest are reference. -->
    <!-- No pastel tiles: hairline border, white ground, the number does the work. -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      <!-- Primary: today's load -->
      <div class="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Lessons today</span>

          <div class="mt-3 flex items-baseline justify-between gap-4">
            <div class="min-w-0">
              <p class="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 tabular-nums">
                {{ teacher.todaysReservations.length }}<span class="ml-1.5 align-baseline text-base font-semibold text-slate-400">scheduled</span>
              </p>
              <p class="mt-1.5 truncate text-xs text-slate-500">
                {{ todayStudents || 'Nobody booked yet' }}
              </p>
            </div>

            <!-- The shape of the day, not a repeat of the next-lesson card below. -->
            <ul v-if="todayTimes.length" class="flex shrink-0 flex-col items-end gap-1">
              <li
                v-for="time in todayTimes"
                :key="time"
                class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700"
              >
                {{ time }}
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span class="truncate tabular-nums">{{ todaySpan || 'Nothing scheduled today' }}</span>
          <RouterLink to="/reservations" class="shrink-0 font-semibold text-slate-700 hover:text-slate-950">View reservations &rarr;</RouterLink>
        </div>
      </div>

      <!-- Secondary: reference figures, one line each -->
      <div class="lg:col-span-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Lesson logs due</p>
            <p class="mt-2 text-2xl font-bold tracking-tight tabular-nums" :class="teacher.pendingFeedback.length ? 'text-amber-700' : 'text-slate-900'">
              {{ teacher.pendingFeedback.length }}
              <span class="text-xs font-normal text-slate-500">to complete</span>
            </p>
          </div>
          <RouterLink to="/lessons" class="mt-3 text-xs font-medium text-brighture-bronze hover:underline border-t border-slate-100 pt-2 block">
            Complete logs &rarr;
          </RouterLink>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Hours taught</p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {{ teacher.stats.hoursThisMonth }}
              <span class="text-xs font-normal text-slate-500">hrs</span>
            </p>
          </div>
          <p class="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
            {{ currentMonthName }} to date
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Student rating</p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {{ teacher.stats.averageRating }}
              <span class="text-xs font-normal text-slate-500">avg</span>
            </p>
          </div>
          <p class="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2 tabular-nums">
            {{ teacher.stats.lessonsThisMonth }} lessons rated
          </p>
        </div>
      </div>
    </section>

    <!-- ===== Next Lesson Spotlight ===== -->
    <!-- Tell 1: One flat accent. No multi-stop gradients, no blurred gold blob. -->
    <!-- Tell 4: Hairline borders, tighter radius (rounded-xl), no shadow-xl. -->
    <!-- Tell 5: Tabular digits on countdown and time range. -->
    <section
      v-if="next"
      class="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6 text-white"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-md bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 tabular-nums">
          Next lesson • starts in {{ next.minutesUntil }} mins
        </span>
        <span class="rounded-md bg-slate-800 border border-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-300 tabular-nums">
          {{ teacher.localRange(next) }}
        </span>
        <span v-if="next.substitution" class="rounded-md bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 text-xs font-medium text-amber-300">
          Substitution
        </span>
      </div>

      <div class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <button
          type="button"
          @click="selectedStudent = next"
          class="group flex shrink-0 flex-col items-center gap-1.5 self-start lg:self-center"
        >
          <AppImage
            :src="next.studentPhoto"
            :alt="next.studentName"
            eager
            class="h-16 w-16 rounded-full border-2 border-slate-700 transition group-hover:border-brighture-gold"
          />
          <span class="max-w-[7rem] truncate text-xs font-bold text-white">{{ next.studentName }}</span>
          <span class="text-[11px] font-medium text-brighture-gold group-hover:underline">View student &rarr;</span>
        </button>

        <div class="min-w-0 flex-1">
          <h2 class="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-white">
            {{ next.subject }}
          </h2>
          <p class="mt-1 text-sm text-slate-200">
            <span class="font-medium text-brighture-gold">Topic:</span> {{ next.topic }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            {{ next.membership }} • {{ next.lessonClass }}
          </p>
        </div>

        <div class="flex shrink-0 flex-col gap-2 lg:w-48 lg:self-center">
          <a
            v-if="next.meetLink"
            :href="next.meetLink"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
          >
            <i class="fa-solid fa-video text-xs"></i> Enter Google Meet
          </a>
          <p
            v-else
            class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2.5 text-center text-xs font-medium text-rose-300"
          >
            <i class="fa-solid fa-triangle-exclamation"></i> No meeting link
          </p>
          <button
            type="button"
            @click="selectedStudent = next"
            class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-5 py-2.5 text-xs font-medium text-slate-200 transition active:scale-[0.98]"
          >
            Lesson Details
          </button>
        </div>
      </div>
    </section>

    <p v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      No upcoming reservations. Open more slots in
      <RouterLink to="/schedule" class="font-bold text-brighture-bronze hover:underline">Scheduling</RouterLink>.
    </p>

    <!-- ===== Main Workspace: Today's Lessons + Week at a Glance vs Attention Items ===== -->
    <div class="grid gap-6 xl:grid-cols-3">
      <!-- Left Column: Today + Week load -->
      <section class="min-w-0 space-y-4 xl:col-span-2">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3">
          <h2 class="flex items-center gap-2 text-base font-bold text-slate-900">
            <span class="h-4 w-1.5 rounded-full bg-brighture-gold"></span> Today's Lessons
          </h2>
          <RouterLink to="/reservations" class="shrink-0 text-xs font-medium text-brighture-bronze hover:underline">
            View all reservations &rarr;
          </RouterLink>
        </div>

        <ol v-if="teacher.todaysReservations.length" class="space-y-2">
          <li
            v-for="row in teacher.todaysReservations"
            :key="row.id"
            class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300"
          >
            <!-- Clock first, tabular numbers -->
            <div class="w-16 shrink-0 text-center">
              <p class="text-sm font-bold text-slate-900 tabular-nums">{{ timeOnly(teacher.localStart(row)) }}</p>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ zoneShort }}</p>
            </div>

            <div class="h-9 w-px shrink-0 bg-slate-200"></div>

            <AppImage :src="row.studentPhoto" :alt="row.studentName" class="h-9 w-9 shrink-0 rounded-md object-cover" />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-900">{{ row.studentName }}</p>
              <p class="truncate text-xs text-slate-500">{{ row.subject }}</p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <a
                v-if="row.meetLink"
                :href="row.meetLink"
                target="_blank"
                rel="noopener"
                class="rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-[0.98]"
              >
                Meet
              </a>
              <span v-else class="rounded-md bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-[11px] font-medium text-rose-700">
                No link
              </span>

              <button
                type="button"
                @click="selectedStudent = row"
                class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
              >
                Details
              </button>
            </div>
          </li>
        </ol>

        <p v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Nothing scheduled today.
        </p>

        <!-- ===== Week at a glance ===== -->
        <!-- Tell 1: Flat solid accent bar fill (no gradient). -->
        <!-- Tell 4: Hairline borders, no floating drop shadow. -->
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Week at a glance</h3>
              <p class="mt-1 text-xs text-slate-500">
                <strong class="font-bold text-slate-900 tabular-nums">{{ teacher.weeklyBooked }}</strong> booked of
                <strong class="font-bold text-slate-900 tabular-nums">{{ teacher.weeklyOpen }}</strong> slots opened
              </p>
            </div>
            <RouterLink to="/schedule" class="text-xs font-medium text-brighture-bronze hover:underline">
              Edit availability &rarr;
            </RouterLink>
          </div>

          <div class="mt-5 flex items-end justify-between gap-2">
            <div v-for="day in teacher.weeklyLoad" :key="day.key" class="flex flex-1 flex-col items-center gap-1.5">
              <div class="flex h-24 w-full max-w-[32px] flex-col justify-end overflow-hidden rounded-md bg-slate-100">
                <div
                  v-if="day.free"
                  class="w-full bg-slate-200"
                  :style="{ height: `${barHeight(day.free)}%` }"
                  :title="`${day.free} slots still open`"
                ></div>
                <!-- Flat accent solid fill, no gradient -->
                <div
                  v-if="day.booked"
                  class="w-full bg-brighture-gold"
                  :style="{ height: `${barHeight(day.booked)}%` }"
                  :title="`${day.booked} lessons booked`"
                ></div>
              </div>
              <p class="text-[10px] font-medium text-slate-500">{{ day.label }}</p>
              <p class="text-[10px] font-bold text-slate-800 tabular-nums">{{ day.booked }}</p>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-xs bg-brighture-gold"></span>
              Booked
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-xs bg-slate-200"></span>
              Open slots
            </span>
          </div>
        </div>
      </section>

      <!-- Right Column: Needs attention and recent feedback -->
      <section class="min-w-0 space-y-6">
        <!-- Attention Queue: Semantic color only for urgent items, no decorative tiles -->
        <div class="space-y-3">
          <h2 class="flex items-center gap-2 text-base font-bold text-slate-900">
            <span class="h-4 w-1.5 rounded-full bg-rose-500"></span> Needs Your Attention
          </h2>

          <div v-if="teacher.attentionItems.length" class="space-y-2">
            <RouterLink
              v-for="item in teacher.attentionItems"
              :key="item.id"
              :to="item.to"
              class="group flex items-start gap-3 rounded-lg border bg-white p-3 transition-colors"
              :class="item.urgent ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                :class="item.urgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'"
              >
                <i :class="item.kind === 'writing' ? 'fa-solid fa-pen-nib' : 'fa-solid fa-comment-dots'"></i>
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-bold text-slate-900">{{ item.title }}</p>
                <p class="truncate text-[11px] text-slate-500">{{ item.subtitle }}</p>
                <p class="mt-0.5 text-[11px] font-medium tabular-nums" :class="item.urgent ? 'text-rose-600 font-semibold' : 'text-slate-400'">
                  {{ item.meta }}
                </p>
              </div>
              <i class="fa-solid fa-chevron-right mt-1 shrink-0 text-[10px] text-slate-300 transition-transform group-hover:translate-x-0.5"></i>
            </RouterLink>
          </div>

          <p v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            All caught up.
          </p>
        </div>

        <!-- Recent feedback remains available without exposing a score. -->
        <div class="space-y-3">
          <h2 class="flex items-center gap-2 text-base font-bold text-slate-900">
            <span class="h-4 w-1.5 rounded-full bg-slate-400"></span> Recent Student Feedback
          </h2>

          <div class="space-y-2">
            <article
              v-for="lesson in teacher.recentRatings"
              :key="lesson.id"
              class="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-xs font-bold text-slate-900">{{ lesson.studentName }}</p>
              </div>
              <p class="truncate text-[11px] text-slate-500">{{ lesson.subject }}</p>
              <p v-if="lesson.studentComment" class="mt-1.5 text-xs italic leading-relaxed text-slate-600">
                &ldquo;{{ lesson.studentComment }}&rdquo;
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>

    <StudentDetailModal :student="selectedStudent" @close="selectedStudent = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import AppImage from '../../components/AppImage.vue';
import StudentDetailModal from '../../components/teacher/StudentDetailModal.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();
const next = computed(() => teacher.nextReservation);

const selectedStudent = ref(null);
/**
 * The clock is real, not seeded: a dashboard that claims the wrong day is worse
 * than one that shows none. It re-reads every minute so a tab left open
 * overnight rolls over instead of going stale.
 */
const now = ref(new Date());
let clock;
onMounted(() => { clock = setInterval(() => { now.value = new Date(); }, 60_000); });
onBeforeUnmount(() => clearInterval(clock));

// Follow the header picker, not the profile: a zone label that disagrees with
// the times printed beside it is worse than no label at all.
const zoneName = computed(() => teacher.viewZoneId);
const zoneShort = computed(() => teacher.viewZoneAbbr);

// Dated in the instructor's own timezone, so a trip abroad never shifts the day.
const formatToday = (options) => {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: zoneName.value, ...options }).format(now.value);
  } catch {
    return new Intl.DateTimeFormat('en-US', options).format(now.value);
  }
};

const todayWeekday = computed(() => formatToday({ weekday: 'long' }));

/** "6:00 PM – 6:30 PM PHT" -> "6:00 PM"; the end half for the day's span. */
const rangeHalf = (row, index) => (teacher.localRange(row) || '').split('–')[index]?.trim() ?? '';

const todayTimes = computed(() => teacher.todaysReservations.map((row) => rangeHalf(row, 0)));

const todayStudents = computed(() =>
  teacher.todaysReservations.map((row) => row.studentName).join(' · ')
);

/** "Sep 2, 2026 18:00" -> "18:00". */
const timeOnly = (stamp) => stamp.split(' ').pop();

/** First start to last finish — how long the instructor is actually on call. */
const todaySpan = computed(() => {
  const rows = teacher.todaysReservations;
  if (!rows.length) return '';
  return `${rangeHalf(rows[0], 0)} – ${rangeHalf(rows[rows.length - 1], 1)}`;
});
const todayDate = computed(() => formatToday({ month: 'long', day: 'numeric', year: 'numeric' }));
const currentMonthName = computed(() => formatToday({ month: 'long', year: 'numeric' }));

// Scaled against the busiest day so the tallest column always fills the track.
const busiestDay = computed(() =>
  Math.max(1, ...teacher.weeklyLoad.map((day) => Math.max(day.open, day.booked)))
);
const barHeight = (value) => Math.round((value / busiestDay.value) * 100);
</script>
