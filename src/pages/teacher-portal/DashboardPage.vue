<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- ===== Greeting + next lesson ===== -->
    <header>
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        Good day, {{ teacher.profile.firstName }} 👋
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        {{ teacher.todaysReservations.length }} lesson{{ teacher.todaysReservations.length === 1 ? '' : 's' }} today ·
        {{ teacher.attentionItems.length }} item{{ teacher.attentionItems.length === 1 ? '' : 's' }} need you
      </p>
    </header>

    <!-- ===== Stats ===== -->
    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="stat in statCards" :key="stat.label" class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2">
          <i :class="stat.icon" class="text-sm"></i>
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ stat.label }}</p>
        </div>
        <p class="mt-1.5 text-2xl font-black text-slate-900">{{ stat.value }}</p>
      </div>
    </section>

    <!-- The one dark surface on the page, so the next lesson is unmistakably
         the thing to look at. Mirrors the student portal's spotlight: status
         pills on top, the person on the left, the lesson in the middle, and the
         two actions stacked at equal width on the right. -->
    <section
      v-if="next"
      class="relative overflow-hidden rounded-3xl p-4 text-white shadow-xl sm:p-6"
      style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 42%, #0b1220 100%);"
    >
      <div class="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brighture-gold/10 blur-3xl"></div>

      <div class="relative">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
            Next lesson &bull; starts in {{ next.minutesUntil }} mins
          </span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200">
            {{ teacher.localRange(next) }}
          </span>
          <span v-if="next.substitution" class="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300">
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
              class="h-20 w-20 rounded-full ring-2 ring-brighture-gold/60 transition group-hover:ring-brighture-gold"
            />
            <span class="max-w-[7rem] truncate text-xs font-bold text-white">{{ next.studentName }}</span>
            <span class="text-[11px] font-bold text-brighture-gold group-hover:underline">View student →</span>
          </button>

          <div class="min-w-0 flex-1">
            <h2 class="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-white">
              {{ next.subject }}
            </h2>
            <p class="mt-1 text-sm font-bold text-white">
              <span class="text-brighture-gold">Topic:</span> {{ next.topic }}
            </p>
            <p class="mt-1.5 text-xs text-slate-400">
              {{ next.membership }} · {{ next.category }} · {{ next.point }} pts
            </p>
          </div>

          <div class="flex shrink-0 flex-col gap-2 lg:w-52 lg:self-center">
            <a
              v-if="next.meetLink"
              :href="next.meetLink"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-emerald-400 active:scale-95"
            >
              📹 Enter Google Meet
            </a>
            <p
              v-else
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3.5 text-center text-xs font-bold text-rose-300"
            >
              <i class="fa-solid fa-triangle-exclamation"></i> No meeting link
            </p>
            <button
              type="button"
              @click="selectedStudent = next"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15 active:scale-95"
            >
              Lesson Details
            </button>
          </div>
        </div>
      </div>
    </section>

    <p v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      No upcoming reservations. Open more slots in
      <RouterLink to="/schedule" class="font-bold text-brighture-bronze hover:underline">Scheduling</RouterLink>.
    </p>

    <div class="grid gap-6 xl:grid-cols-3">
      <!-- ===== Today ===== -->
      <section class="min-w-0 space-y-3 xl:col-span-2">
        <div class="flex items-center justify-between gap-3">
          <h2 class="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <span class="h-5 w-2 rounded-full bg-brighture-gold"></span> Today's Lessons
          </h2>
          <RouterLink to="/reservations" class="shrink-0 text-xs font-bold text-brighture-bronze hover:underline">
            View all →
          </RouterLink>
        </div>

        <ol v-if="teacher.todaysReservations.length" class="space-y-2">
          <li
            v-for="row in teacher.todaysReservations"
            :key="row.id"
            class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-brighture-gold/50"
          >
            <!-- The clock reads first: on a teaching day the time is the thing
                 you scan for, not the name. -->
            <div class="w-16 shrink-0 text-center">
              <p class="text-sm font-black text-slate-900">{{ timeOnly(teacher.localStart(row)) }}</p>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ zoneShort }}</p>
            </div>

            <div class="h-10 w-px shrink-0 bg-slate-200"></div>

            <AppImage :src="row.studentPhoto" :alt="row.studentName" class="h-10 w-10 shrink-0 rounded-xl" />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-slate-900">{{ row.studentName }}</p>
              <p class="truncate text-[11px] text-slate-500">{{ row.subject }}</p>
            </div>

            <!-- border-transparent on the filled controls so all three share a
                 box model with the outlined Details button and line up. -->
            <div class="flex shrink-0 items-center gap-2">
              <a
                v-if="row.meetLink"
                :href="row.meetLink"
                target="_blank"
                rel="noopener"
                class="rounded-xl border border-transparent bg-emerald-500 px-3 py-2 text-[11px] font-extrabold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
              >
                Meet
              </a>
              <span v-else class="rounded-xl border border-transparent bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">
                No link
              </span>

              <button
                type="button"
                @click="selectedStudent = row"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                Details
              </button>
            </div>
          </li>
        </ol>

        <p v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Nothing scheduled today.
        </p>

        <!-- ===== Week at a glance ===== -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-sm font-black uppercase tracking-wider text-slate-400">Week at a glance</h3>
            <RouterLink to="/schedule" class="text-xs font-bold text-brighture-bronze hover:underline">Edit availability →</RouterLink>
          </div>

          <p class="mt-2 text-xs text-slate-500">
            <strong class="text-slate-800">{{ teacher.weeklyBooked }}</strong> booked of
            <strong class="text-slate-800">{{ teacher.weeklyOpen }}</strong> slots you opened
          </p>

          <div class="mt-4 flex items-end justify-between gap-2">
            <div v-for="day in teacher.weeklyLoad" :key="day.key" class="flex flex-1 flex-col items-center gap-1.5">
              <!-- Booked stacks under free so the column height is the offer and
                   the gold portion is what actually sold. -->
              <div class="flex h-24 w-full max-w-[36px] flex-col justify-end overflow-hidden rounded-lg bg-slate-100">
                <div
                  v-if="day.free"
                  class="w-full bg-slate-200"
                  :style="{ height: `${barHeight(day.free)}%` }"
                  :title="`${day.free} slots still open`"
                ></div>
                <div
                  v-if="day.booked"
                  class="w-full bg-gradient-to-t from-brighture-gold-deep to-brighture-gold"
                  :style="{ height: `${barHeight(day.booked)}%` }"
                  :title="`${day.booked} lessons booked`"
                ></div>
              </div>
              <p class="text-[10px] font-bold text-slate-500">{{ day.label }}</p>
              <p class="text-[10px] font-black text-slate-800">{{ day.booked }}</p>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-brighture-gold"></span> Booked</span>
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-slate-200"></span> Still open</span>
          </div>
        </div>
      </section>

      <!-- ===== Needs attention + ratings ===== -->
      <section class="min-w-0 space-y-6">
        <div class="space-y-3">
          <h2 class="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <span class="h-5 w-2 rounded-full bg-rose-400"></span> Needs Your Attention
          </h2>

          <div v-if="teacher.attentionItems.length" class="space-y-2">
            <RouterLink
              v-for="item in teacher.attentionItems"
              :key="item.id"
              :to="item.to"
              class="group flex items-start gap-3 rounded-2xl border bg-white p-3.5 shadow-sm transition hover:shadow-md"
              :class="item.urgent ? 'border-rose-200' : 'border-slate-200/80 hover:border-brighture-gold/50'"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                :class="item.urgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'"
              >
                <i :class="item.kind === 'writing' ? 'fa-solid fa-pen-nib' : 'fa-solid fa-comment-dots'"></i>
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-slate-900">{{ item.title }}</p>
                <p class="truncate text-[11px] text-slate-500">{{ item.subtitle }}</p>
                <p class="mt-0.5 text-[11px] font-bold" :class="item.urgent ? 'text-rose-600' : 'text-slate-400'">
                  {{ item.meta }}
                </p>
              </div>
              <i class="fa-solid fa-chevron-right mt-1 shrink-0 text-[10px] text-slate-300 transition-transform group-hover:translate-x-0.5"></i>
            </RouterLink>
          </div>

          <p v-else class="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            All caught up.
          </p>
        </div>

        <div class="space-y-3">
          <h2 class="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <span class="h-5 w-2 rounded-full bg-amber-400"></span> Recent Ratings
          </h2>

          <div class="space-y-2">
            <article
              v-for="lesson in teacher.recentRatings"
              :key="lesson.id"
              class="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-sm font-bold text-slate-900">{{ lesson.studentName }}</p>
                <span class="shrink-0 text-xs font-black text-amber-500">★ {{ lesson.studentRating }}</span>
              </div>
              <p class="truncate text-[11px] text-slate-500">{{ lesson.subject }}</p>
              <p v-if="lesson.studentComment" class="mt-1.5 text-[11px] italic leading-relaxed text-slate-600">
                “{{ lesson.studentComment }}”
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
import { ref, computed } from 'vue';
import AppImage from '../../components/AppImage.vue';
import StudentDetailModal from '../../components/teacher/StudentDetailModal.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();
const next = computed(() => teacher.nextReservation);

const selectedStudent = ref(null);

/** "Asia/Manila (PHT)" -> "PHT". */
const zoneShort = computed(() => teacher.profile.timezone.match(/\(([^)]+)\)/)?.[1] ?? '');

const statCards = computed(() => [
  { label: 'Lessons this month', value: teacher.stats.lessonsThisMonth, icon: 'fa-solid fa-chalkboard-user text-sky-500' },
  { label: 'Hours taught', value: teacher.stats.hoursThisMonth, icon: 'fa-solid fa-clock text-indigo-500' },
  { label: 'Feedback pending', value: teacher.pendingFeedback.length, icon: 'fa-solid fa-comment-dots text-rose-500' },
  // No star in the value: the card's amber icon already says what this is,
  // and a second star renders in the body text colour, which reads as black.
  { label: 'Average rating', value: teacher.stats.averageRating, icon: 'fa-solid fa-star text-amber-500' },
]);

/** "Sep 2, 2026 18:00" -> "18:00". */
const timeOnly = (stamp) => stamp.split(' ').pop();

// Scaled against the busiest day so the tallest column always fills the track.
const busiestDay = computed(() =>
  Math.max(1, ...teacher.weeklyLoad.map((day) => Math.max(day.open, day.booked)))
);
const barHeight = (value) => Math.round((value / busiestDay.value) * 100);
</script>
