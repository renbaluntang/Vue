<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-brighture-bronze">Teaching record</p>
        <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Your teaching, in focus.</h1>
        <p class="mt-1 text-sm text-slate-500">See the work that students return for, and where your teaching time is going.</p>
      </div>

      <div class="inline-flex shrink-0 self-start rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:self-auto">
        <button
          v-for="range in teacher.analytics.ranges"
          :key="range"
          type="button"
          @click="activeRange = range"
          class="rounded-xl px-3 py-1.5 text-xs font-bold transition"
          :class="activeRange === range ? 'bg-brighture-gold text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-900'"
        >
          {{ range }}
        </button>
      </div>
    </header>

    <!-- ===== Headline figures ===== -->
    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="card in kpis" :key="card.label" class="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{{ card.label }}</p>
          <span class="grid h-8 w-8 place-items-center rounded-xl" :class="card.iconBg">
            <i :class="card.icon" class="text-sm"></i>
          </span>
        </div>
        <p class="mt-2 text-2xl font-black tracking-tight text-slate-950">{{ card.value }}</p>
        <p v-if="card.hint" class="mt-0.5 text-[11px] text-slate-400">{{ card.hint }}</p>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-3">
      <!-- ===== Capacity =====
           One ratio against a limit, so it is drawn as a meter: a single arc
           on a lighter step of its own ramp, not two series competing. The
           total sits inside the ring, which is what the ring is for. -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 class="text-base font-black text-slate-900">Class summary</h2>
        <p class="mt-0.5 text-[11px] font-medium text-slate-400 tabular-nums">{{ weekRangeLabel }}</p>

        <!-- The number belongs in the middle of the ring, so it is laid over
             the svg rather than inside it — the svg is rotated, and rotated
             type is a thing to avoid, not to counter-rotate. -->
        <div class="relative mx-auto mt-6 grid h-[168px] w-[168px] place-items-center">
          <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90" role="img" :aria-label="capacityLabel">
            <circle cx="60" cy="60" :r="RING_R" fill="none" stroke="#FCE9A8" stroke-width="11" />
            <circle
              v-if="capacity.booked"
              cx="60" cy="60" :r="RING_R"
              fill="none"
              stroke="#B88600"
              stroke-width="11"
              stroke-linecap="butt"
              :stroke-dasharray="capacity.dash"
              stroke-dashoffset="-1"
            />
          </svg>

          <div class="absolute text-center">
            <p class="text-3xl font-black leading-none text-slate-900">{{ capacity.open }}</p>
            <p class="mt-1 text-[11px] font-medium text-slate-400">Slots</p>
          </div>
        </div>

        <ul class="mt-6 space-y-3">
          <li class="flex items-center gap-2.5">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background:#B88600"></span>
            <span class="text-xs font-black text-slate-900 tabular-nums">{{ capacity.booked }}</span>
            <span class="min-w-0 truncate text-xs font-medium text-slate-500">Booked class</span>
          </li>
          <li class="flex items-center gap-2.5">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-amber-300/70" style="background:#FCE9A8"></span>
            <span class="text-xs font-black text-slate-900 tabular-nums">{{ capacity.free }}</span>
            <span class="min-w-0 truncate text-xs font-medium text-slate-500">Still open</span>
          </li>
        </ul>

        <p v-if="!capacity.open" class="mt-4 text-xs text-slate-500">
          No hours opened in this period. Students cannot book you until there are some.
        </p>
      </section>
      <!-- ===== Volume ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Slots open vs booked</p>
            <h2 class="mt-1 text-base font-black text-slate-900">Slot booking rate</h2>
          </div>
          <p class="text-xs font-bold text-slate-500">
            {{ totalBookedSlots }} booked / {{ totalOpenSlots }} total · {{ overallBookingRate }}% booked
          </p>
        </div>

        <div class="mt-5 flex items-end justify-between gap-3">
          <div v-for="point in data.series" :key="point.label" class="flex flex-1 flex-col items-center gap-2">
            <!-- Numbers above bar: booked / total slots and percentage -->
            <div class="text-center">
              <p class="text-[11px] font-black text-slate-800 tabular-nums">
                {{ pointBooked(point) }}
                <span class="text-[10px] font-medium text-slate-400">/{{ pointTotal(point) }}</span>
              </p>
              <p class="text-[10px] font-bold text-brighture-bronze tabular-nums">
                {{ pointPercentage(point) }}%
              </p>
            </div>
            <!-- Progress bar representing booked percentage of total open slots -->
            <div
              class="flex h-40 w-full max-w-[56px] items-end overflow-hidden rounded-t-xl bg-slate-100"
              :title="`${pointBooked(point)} of ${pointTotal(point)} slots booked (${pointPercentage(point)}%)`"
            >
              <div
                class="w-full rounded-t-xl bg-gradient-to-t from-brighture-gold-deep to-brighture-gold transition-[height] duration-300 motion-reduce:transition-none"
                :style="{ height: `${pointPercentage(point)}%` }"
              ></div>
            </div>
            <p class="text-[11px] font-bold text-slate-500">{{ point.label }}</p>
          </div>
        </div>
      </section>

      <!-- ===== Ratings ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Student voice</p>
        <h2 class="mt-1 text-base font-black text-slate-900">Rating breakdown</h2>
        <p class="mt-1 text-3xl font-black text-slate-900">
          {{ data.rating }}
          <span class="align-middle text-base font-bold text-amber-500">★</span>
        </p>
        <p class="text-[11px] text-slate-400">from {{ totalRatings }} rated lessons</p>

        <ul class="mt-4 space-y-2">
          <li v-for="row in data.ratings" :key="row.stars" class="flex items-center gap-2.5">
            <span class="w-8 shrink-0 text-[11px] font-bold text-slate-500 tabular-nums">{{ row.stars }}★</span>
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-amber-400"
                :style="{ width: `${share(row.count, totalRatings)}%` }"
              ></div>
            </div>
            <span class="w-8 shrink-0 text-right text-[11px] font-bold text-slate-700 tabular-nums">{{ row.count }}</span>
          </li>
        </ul>
      </section>

      <!-- ===== Subject mix ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Curriculum balance</p>
        <h2 class="mt-1 text-base font-black text-slate-900">Subject mix</h2>

        <ul class="mt-4 space-y-3">
          <li v-for="subject in data.subjects" :key="subject.code" class="flex items-center gap-3">
            <span class="w-12 shrink-0 rounded-lg bg-slate-100 px-1.5 py-1 text-center text-[10px] font-black text-slate-600">
              {{ subject.code }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <p class="truncate text-xs font-bold text-slate-700">{{ subject.label }}</p>
                <p class="shrink-0 text-[11px] font-bold text-slate-500 tabular-nums">
                  {{ subject.lessons }} · {{ share(subject.lessons, data.lessons) }}%
                </p>
              </div>
              <div class="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-brighture-gold to-brighture-gold-deep"
                  :style="{ width: `${share(subject.lessons, data.lessons)}%` }"
                ></div>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- ===== Attendance ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reliability</p>
        <h2 class="mt-1 text-base font-black text-slate-900">Attendance</h2>
        <p class="mt-1 text-3xl font-black text-slate-900">{{ data.completionRate }}%</p>
        <p class="text-[11px] text-slate-400">of scheduled lessons completed</p>

        <!-- One stacked bar, because these four numbers are parts of a whole. -->
        <div class="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            v-for="row in data.attendance.filter((r) => r.count)"
            :key="row.label"
            class="h-full first:rounded-l-full last:rounded-r-full"
            :class="toneBg[row.tone]"
            :style="{ width: `${share(row.count, attendanceTotal)}%` }"
            :title="`${row.label}: ${row.count}`"
          ></div>
        </div>

        <ul class="mt-4 space-y-2">
          <li v-for="row in data.attendance" :key="row.label" class="flex items-center gap-2.5">
            <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :class="toneBg[row.tone]"></span>
            <span class="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">{{ row.label }}</span>
            <span class="shrink-0 text-xs font-bold text-slate-800 tabular-nums">{{ row.count }}</span>
          </li>
        </ul>
      </section>

    </div>

    <p class="text-[11px] text-slate-400">
      Figures cover {{ activeRange.toLowerCase() }} and exclude lessons still upcoming.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

const activeRange = ref(teacher.analytics.ranges[0]);
const data = computed(() => teacher.analytics.byRange[activeRange.value]);

const kpis = computed(() => [
  {
    label: 'Lessons taught', value: data.value.lessons, icon: 'fa-solid fa-chalkboard-user text-sky-600', iconBg: 'bg-sky-50',
  },
  {
    label: 'Hours taught', value: data.value.hours, icon: 'fa-solid fa-clock text-indigo-600', iconBg: 'bg-indigo-50',
  },
  {
    label: 'Feedback turnaround',
    value: `${data.value.feedbackHours}h`,
    hint: 'median after a lesson',
    icon: 'fa-solid fa-comment-dots text-rose-500',
    iconBg: 'bg-rose-50',
  },
  {
    label: 'Returning students',
    value: `${data.value.repeatShare}%`,
    hint: 'booked you again',
    icon: 'fa-solid fa-repeat text-emerald-500',
    iconBg: 'bg-emerald-50',
  },
]);

const totalRatings = computed(() => data.value.ratings.reduce((sum, row) => sum + row.count, 0));
const attendanceTotal = computed(() => data.value.attendance.reduce((sum, row) => sum + row.count, 0));

/** Guarded so an empty range renders a flat bar instead of NaN. */
const share = (value, total) => (total ? Math.round((value / total) * 100) : 0);

const pointBooked = (point) => point.booked ?? point.lessons ?? 0;
const pointTotal = (point) => point.total ?? point.lessons ?? 1;
const pointPercentage = (point) => {
  const total = pointTotal(point);
  const booked = pointBooked(point);
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((booked / total) * 100)));
};

const totalBookedSlots = computed(() => {
  return data.value.series.reduce((sum, p) => sum + pointBooked(p), 0);
});

const totalOpenSlots = computed(() => {
  return data.value.series.reduce((sum, p) => sum + pointTotal(p), 0);
});

const overallBookingRate = computed(() => {
  if (!totalOpenSlots.value) return 0;
  return Math.round((totalBookedSlots.value / totalOpenSlots.value) * 100);
});

const bucketNoun = computed(() => (activeRange.value === 'This month' ? 'week' : 'period'));
const averagePerBucket = computed(() =>
  Math.round(data.value.lessons / Math.max(1, data.value.series.length))
);

/* The ring: one arc against a capacity, inset 1px at each end so the fill
   never butts straight into its own track. */
const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

/** The dates behind "This week"; the longer ranges name themselves. */
const weekRangeLabel = computed(() => {
  if (activeRange.value !== 'This week') return activeRange.value;
  const [y, m, d] = teacher.thisWeekStart.split('-').map(Number);
  const from = new Date(y, m - 1, d);
  const to = new Date(y, m - 1, d + 6);
  const mon = (x) => x.toLocaleDateString('en-US', { month: 'short' });
  const head = from.getMonth() === to.getMonth() ? `${from.getDate()}` : `${from.getDate()} ${mon(from)}`;
  return `${head} \u2192 ${to.getDate()} ${mon(to)} ${to.getFullYear()}`;
});

const capacityLabel = computed(
  () => `${capacity.value.booked} of ${capacity.value.open} open slots booked, ${activeRange.value.toLowerCase()}`
);

const capacity = computed(() => {
  const open = data.value.capacity?.open ?? 0;
  const booked = Math.min(data.value.capacity?.booked ?? 0, open);
  const free = Math.max(0, open - booked);
  const len = open && booked ? Math.max(0, (booked / open) * RING_C - 2) : 0;
  const hours = open / 2;
  return {
    open,
    booked,
    free,
    hours: Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`,
    dash: `${len} ${RING_C - len}`,
  };
});

const toneBg = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-400',
  slate: 'bg-slate-300',
};
</script>
