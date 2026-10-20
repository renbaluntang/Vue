<template>
  <div class="space-y-3">
    <!-- 1. Lesson length first: it decides what a click on the grid books,
         so it is the loudest thing above the calendar — a dark panel with a
         numbered step, not a quiet toolbar control. -->
    <div class="relative overflow-hidden rounded-2xl bg-slate-900 px-3.5 py-3 text-white shadow-lg sm:px-4">
      <div class="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brighture-gold/15 blur-2xl"></div>
      <div class="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex min-w-0 items-center gap-2.5">
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brighture-gold text-xs font-black text-brighture-ink shadow-md">1</span>
          <div class="min-w-0">
            <p class="m-0 text-sm font-black tracking-tight sm:text-base">Choose your lesson length</p>
            <p class="m-0 text-[11px] text-slate-300">Pick this first — clicking a time on the calendar books this much.</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 md:w-[22rem]" role="radiogroup" aria-label="Lesson length">
          <button
            v-for="d in DURATIONS"
            :key="d.minutes"
            type="button"
            role="radio"
            :aria-checked="duration === d.minutes"
            @click="setDuration(d.minutes)"
            class="flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left transition"
            :class="duration === d.minutes
              ? 'border-brighture-gold bg-brighture-gold text-brighture-ink shadow-lg shadow-brighture-gold/20'
              : 'border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'"
          >
            <!-- One line: the length (its number carries it), then the price -->
            <span class="flex min-w-0 items-center gap-2">
              <span class="flex items-baseline gap-1 leading-none">
                <span class="text-xl font-black tracking-tight tabular-nums">{{ d.minutes === 60 ? 1 : 30 }}</span>
                <span class="text-sm font-bold">{{ d.minutes === 60 ? 'hour' : 'min' }}</span>
              </span>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
                :class="duration === d.minutes ? 'bg-brighture-ink/10 text-brighture-ink' : 'bg-white/10 text-slate-200'"
              >
                {{ pointsForDuration(teacher, d.minutes) }} pt{{ pointsForDuration(teacher, d.minutes) === 1 ? '' : 's' }}
              </span>
            </span>
            <i
              class="text-base"
              :class="duration === d.minutes ? 'fa-solid fa-circle-check text-brighture-ink' : 'fa-regular fa-circle text-white/35'"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Then the time -->
    <p class="m-0 flex items-center gap-2 px-1 pt-1 text-sm font-black text-slate-900">
      <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">2</span>
      Pick a time
      <span class="text-xs font-medium text-slate-500">— hover the calendar to see your {{ durationLabel }} lesson</span>
    </p>

    <!-- 2. Where in the calendar -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-2xs">
          <button
            type="button"
            @click="shift(-1)"
            :disabled="!canGoBack"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="viewMode === 'week' ? 'Previous week' : 'Previous day'"
          >
            <i class="fa-solid fa-chevron-left text-[11px]" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            @click="goTo(today)"
            class="rounded-full px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100"
          >
            Today
          </button>
          <button
            type="button"
            @click="shift(1)"
            :disabled="!canGoForward"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="viewMode === 'week' ? 'Next week' : 'Next day'"
          >
            <i class="fa-solid fa-chevron-right text-[11px]" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Jump to any date the teacher could have opened -->
        <div class="relative" ref="pickerWrap">
          <button
            type="button"
            @click="togglePicker"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs transition hover:border-slate-300"
            :aria-expanded="pickerOpen"
          >
            <i class="fa-regular fa-calendar text-sky-600" aria-hidden="true"></i>
            {{ rangeLabel }}
            <i class="fa-solid fa-chevron-down text-[9px] text-slate-400" aria-hidden="true"></i>
          </button>

          <div
            v-if="pickerOpen"
            class="absolute left-0 top-full z-40 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
          >
            <div class="mb-2 flex items-center justify-between">
              <button
                type="button"
                @click="pickerMonth = addMonths(pickerMonth, -1)"
                :disabled="pickerMonth <= monthOf(today)"
                class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                aria-label="Previous month"
              >
                <i class="fa-solid fa-chevron-left text-[10px]" aria-hidden="true"></i>
              </button>
              <p class="m-0 text-sm font-black text-slate-900">{{ monthTitle(pickerMonth) }}</p>
              <button
                type="button"
                @click="pickerMonth = addMonths(pickerMonth, 1)"
                :disabled="pickerMonth >= monthOf(lastDay)"
                class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                aria-label="Next month"
              >
                <i class="fa-solid fa-chevron-right text-[10px]" aria-hidden="true"></i>
              </button>
            </div>
            <div class="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-slate-400">
              <span v-for="(d, k) in ['S','M','T','W','T','F','S']" :key="k">{{ d }}</span>
            </div>
            <!-- The week on screen is one band across its row, rounded at the
                 ends; in Week view, hovering a date previews its whole week,
                 since that is what a click jumps to. -->
            <div class="mt-1 grid grid-cols-7 gap-y-1" @mouseleave="hoveredPickerRow = null">
              <button
                v-for="(cell, k) in monthCells"
                :key="cell.iso"
                type="button"
                :disabled="!cell.inRange"
                @click="goTo(cell.iso); pickerOpen = false"
                @mouseenter="hoveredPickerRow = Math.floor(k / 7)"
                class="relative flex h-8 items-center justify-center text-xs font-semibold transition-colors"
                :class="[
                  bandClass(cell, k),
                  !cell.inMonth || !cell.inRange ? 'text-slate-300' : 'text-slate-800',
                  cell.inVisible ? 'font-bold text-slate-900' : '',
                ]"
              >
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-full"
                  :class="cell.iso === today ? 'bg-slate-900 font-black text-white' : (viewMode === 'day' && cell.inRange ? 'hover:bg-slate-100' : '')"
                >{{ cell.day }}</span>
                <span v-if="cell.hasOpen" class="absolute bottom-0.5 h-1 w-1 rounded-full bg-emerald-500"></span>
              </button>
            </div>
            <p class="m-0 mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Days {{ firstName }} has open time
            </p>
          </div>
        </div>

        <button
          v-if="nextOpening && !nextOpeningVisible"
          type="button"
          @click="goTo(nextOpening.dateIso)"
          class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
        >
          <i class="fa-solid fa-forward text-[10px]" aria-hidden="true"></i>
          Next opening: {{ nextOpening.label }}
        </button>
      </div>

      <div class="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-0.5" role="tablist" aria-label="Calendar view">
        <button
          v-for="v in ['week', 'day']"
          :key="v"
          type="button"
          role="tab"
          :aria-selected="viewMode === v"
          @click="viewMode = v"
          class="rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition"
          :class="viewMode === v ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'"
        >
          {{ v }}
        </button>
      </div>
    </div>

    <!-- 3. The calendar, with the confirmation card beside the chosen slot -->
    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <div :style="{ minWidth: (viewMode === 'week' ? 560 : 260) + 'px' }">
        <div
          class="grid border-b border-slate-200 bg-slate-50/80"
          :style="{ gridTemplateColumns: `56px repeat(${columns.length}, 1fr)` }"
        >
          <div class="border-r border-slate-200"></div>
          <div
            v-for="col in columns"
            :key="col.iso"
            class="border-r border-slate-200 px-0.5 py-2 text-center last:border-r-0"
            :class="col.past ? 'opacity-50' : ''"
          >
            <div class="text-[10px] font-bold uppercase tracking-wide text-slate-500">{{ col.dow }}</div>
            <div
              class="mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black"
              :class="col.iso === today ? 'bg-slate-900 text-white' : 'text-slate-800'"
            >{{ col.day }}</div>
          </div>
        </div>

        <div
          class="relative grid"
          :style="{ gridTemplateColumns: `56px repeat(${columns.length}, 1fr)` }"
        >
          <!-- Hour labels -->
          <div class="relative border-r border-slate-200" :style="{ height: gridHeight + 'px' }">
            <div
              v-for="(slot, i) in BOOKING_TIME_SLOTS"
              v-show="i % 2 === 0"
              :key="`h-${slot}`"
              class="absolute right-2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 tabular-nums"
              :style="{ top: (i * CALENDAR_ROW_HEIGHT) + 'px' }"
            >{{ i === 0 ? '' : formatSlotTo12Hour(slot) }}</div>
          </div>

          <div
            v-for="(col, colIdx) in columns"
            :key="`c-${col.iso}`"
            class="relative border-r border-slate-200 last:border-r-0"
            :class="col.past ? 'bg-slate-50' : ''"
            :style="{ height: gridHeight + 'px' }"
            @mouseleave="hovered = null"
          >
            <div
              v-for="(slot, i) in BOOKING_TIME_SLOTS"
              :key="`g-${slot}`"
              class="absolute inset-x-0 border-t"
              :class="i % 2 === 0 ? 'border-slate-200' : 'border-dashed border-slate-100'"
              :style="{ top: (i * CALENDAR_ROW_HEIGHT) + 'px' }"
            ></div>

            <!-- Hours of today that have already gone -->
            <div
              v-if="col.iso === today && pastHeight > 0"
              class="pointer-events-none absolute inset-x-0 top-0 bg-slate-100/80"
              :style="{ height: pastHeight + 'px' }"
            ></div>

            <!-- Open time: one solid block per unbroken stretch -->
            <div
              v-for="run in col.runs"
              :key="`r-${run.start}`"
              class="pointer-events-none absolute left-1 right-1 overflow-hidden rounded-lg border-l-[3px] border-emerald-500 bg-emerald-50 px-1.5 py-1 text-[10px] font-semibold leading-tight text-emerald-800"
              :style="{ top: (run.start * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (run.span * CALENDAR_ROW_HEIGHT - 2) + 'px' }"
            >
              Open<span v-if="run.span > 1" class="font-normal opacity-75"> · {{ formatSlotTo12Hour(BOOKING_TIME_SLOTS[run.start]) }}–{{ endLabel(run.start, run.span * 30) }}</span>
            </div>

            <!-- One click target per open half-hour -->
            <template v-for="(slot, i) in BOOKING_TIME_SLOTS" :key="`b-${slot}`">
              <button
                v-if="col.open[i] && !isSelected(col.iso, i)"
                type="button"
                :aria-label="`Book ${durationLabel} starting ${formatSlotTo12Hour(slot)} on ${col.long}`"
                @mouseenter="hovered = { iso: col.iso, i }"
                @focus="hovered = { iso: col.iso, i }"
                @click="select(col.iso, i, colIdx)"
                class="absolute left-1 right-1 rounded-lg bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                :style="{ top: (i * CALENDAR_ROW_HEIGHT) + 'px', height: CALENDAR_ROW_HEIGHT + 'px' }"
              ></button>
            </template>

            <!-- Hover preview, the length that would be booked. Solid fill, so the
                 open block's label underneath never shows through it. -->
            <div
              v-if="hovered && hovered.iso === col.iso && !isSelected(col.iso, hovered.i)"
              class="pointer-events-none absolute left-1 right-1 z-10 flex items-start rounded-lg border-2 border-dashed px-1.5 py-0.5 text-[10px] font-bold"
              :class="fits(col, hovered.i) ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm' : 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm'"
              :style="{ top: (hovered.i * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (span * CALENDAR_ROW_HEIGHT - 2) + 'px' }"
            >
              {{ fits(col, hovered.i) ? `${formatSlotTo12Hour(BOOKING_TIME_SLOTS[hovered.i])} · ${durationLabel}` : 'Only 30 min free here' }}
            </div>

            <!-- The student's own lessons with this teacher -->
            <div
              v-for="own in col.own"
              :key="`o-${own.id}`"
              class="pointer-events-none absolute left-1 right-1 overflow-hidden rounded-lg border-l-[3px] border-indigo-500 bg-indigo-50 px-1.5 py-1 text-[10px] font-semibold leading-tight text-indigo-900"
              :style="{ top: (own.start * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (own.span * CALENDAR_ROW_HEIGHT - 2) + 'px' }"
            >
              <i class="fa-solid fa-circle-check mr-0.5 text-[9px] text-indigo-500" aria-hidden="true"></i>Your lesson
            </div>

            <!-- The chosen slot -->
            <button
              v-if="selection && selection.iso === col.iso"
              type="button"
              @click="selection = null"
              class="absolute left-1 right-1 z-20 overflow-hidden rounded-lg border-2 border-amber-500 bg-amber-100 px-1.5 py-1 text-left text-[10px] font-black leading-tight text-amber-950 shadow-md"
              :style="{ top: (selection.i * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (span * CALENDAR_ROW_HEIGHT - 2) + 'px' }"
              title="Click to deselect"
            >
              {{ formatSlotTo12Hour(BOOKING_TIME_SLOTS[selection.i]) }}–{{ endLabel(selection.i, duration) }}
            </button>

            <!-- Now line -->
            <div
              v-if="col.iso === today && nowTop !== null"
              class="pointer-events-none absolute inset-x-0 z-10 flex items-center"
              :style="{ top: nowTop + 'px' }"
            >
              <div class="-ml-1 h-2 w-2 rounded-full bg-rose-500"></div>
              <div class="h-px flex-1 bg-rose-500"></div>
            </div>
          </div>

          <!-- Confirmation card beside the chosen slot (wide screens) -->
          <div
            v-if="selection && !narrow"
            ref="cardRef"
            class="absolute z-30 w-[290px]"
            :style="cardStyle"
            @click.stop
          >
            <ConfirmCard />
          </div>
        </div>
      </div>
    </div>

    <!-- On narrow screens the card sits under the calendar -->
    <div v-if="selection && narrow" ref="cardRef">
      <ConfirmCard />
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] font-medium text-slate-500">
      <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm border-l-2 border-emerald-500 bg-emerald-50"></span> Open</span>
      <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm border-2 border-amber-500 bg-amber-100"></span> Your pick</span>
      <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm border-l-2 border-indigo-500 bg-indigo-50"></span> Already booked by you</span>
      <span class="ml-auto">All times JST · bookable up to {{ MAX_DAYS_AHEAD / 30 }} months ahead</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, h } from 'vue';
import {
  BOOKING_TIME_SLOTS, CALENDAR_ROW_HEIGHT, DURATIONS,
  formatSlotTo12Hour, addMinutesToSlotLabel, getSlotStatus, pointsForDuration,
} from '@/pages/student-view-v4/constants';
import { TOKYO, partsIn, tokyoAt, dayDiff } from '@/lib/schoolTime';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { useUserStore } from '@/stores/useUserStore';

const props = defineProps({
  /** An INSTRUCTORS entry (id, name, imageKey, points, specialty). */
  teacher: { type: Object, required: true },
  /** Optional starting point carried over from the page's date/time filter. */
  initialDate: { type: String, default: '' },
  initialTime: { type: String, default: '' },
  initialDuration: { type: Number, default: 30 },
});
const emit = defineEmits(['review']);

const school = useSchoolStore();
const user = useUserStore();

/** Teachers can open time this far ahead, so the calendar reaches it. */
const MAX_DAYS_AHEAD = 180;

// ── Dates (all Tokyo calendar dates, 'YYYY-MM-DD') ─────────────────────
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => {
  const t = new Date(Date.UTC(y, m, d));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};
const partsOfIso = (iso) => { const [y, m, d] = iso.split('-').map(Number); return { y, m: m - 1, d }; };
const addDaysIso = (iso, n) => { const { y, m, d } = partsOfIso(iso); return isoOf(y, m, d + n); };
const dowOf = (iso) => { const { y, m, d } = partsOfIso(iso); return new Date(Date.UTC(y, m, d)).getUTCDay(); };
const monthOf = (iso) => iso.slice(0, 7);
const addMonths = (ym, n) => { const [y, m] = ym.split('-').map(Number); return isoOf(y, m - 1 + n, 1).slice(0, 7); };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthTitle = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const shortDate = (iso) => { const { m, d } = partsOfIso(iso); return `${SHORT[m]} ${d}`; };

const clock = ref(Date.now());
let ticker = null;
const today = computed(() => {
  const p = partsIn(new Date(clock.value).toISOString(), TOKYO);
  return isoOf(p.year, p.month, p.day);
});
const lastDay = computed(() => addDaysIso(today.value, MAX_DAYS_AHEAD));

// ── View ──────────────────────────────────────────────────────────────
const viewMode = ref(props.initialDate ? 'day' : 'week');
const anchor = ref(props.initialDate || today.value);
const duration = ref(props.initialDuration === 60 ? 60 : 30);
const span = computed(() => (duration.value === 60 ? 2 : 1));
const durationLabel = computed(() => (duration.value === 60 ? '1 hour' : '30 min'));
const firstName = computed(() => props.teacher.name.split(' ')[0]);

const weekStart = computed(() => addDaysIso(anchor.value, -dowOf(anchor.value)));
const visibleDates = computed(() => (viewMode.value === 'week'
  ? Array.from({ length: 7 }, (_, i) => addDaysIso(weekStart.value, i))
  : [anchor.value]));

const canGoBack = computed(() => visibleDates.value[0] > today.value);
const canGoForward = computed(() => visibleDates.value[visibleDates.value.length - 1] < lastDay.value);
const shift = (dir) => { anchor.value = addDaysIso(anchor.value, dir * (viewMode.value === 'week' ? 7 : 1)); };
const goTo = (iso) => {
  anchor.value = iso < today.value ? today.value : iso > lastDay.value ? lastDay.value : iso;
};

const rangeLabel = computed(() => {
  const ds = visibleDates.value;
  if (ds.length === 1) return `${DOW[dowOf(ds[0])]}, ${shortDate(ds[0])}, ${ds[0].slice(0, 4)}`;
  return `${shortDate(ds[0])} – ${shortDate(ds[6])}, ${ds[6].slice(0, 4)}`;
});

// ── Availability ──────────────────────────────────────────────────────
const SLOTS = BOOKING_TIME_SLOTS.length;
const gridHeight = SLOTS * CALENDAR_ROW_HEIGHT;

/** Whether one half-hour is open: the teacher's real board where there is
 *  one, the sample pattern otherwise, never in the past or over a booking. */
const isOpen = (iso, i) => {
  const offset = dayDiff(today.value, iso);
  if (offset < 0 || offset > MAX_DAYS_AHEAD) return false;
  const mock = getSlotStatus(props.teacher.id, offset, i) === 'Available';
  return school.isTeacherSlotOpen(props.teacher.imageKey, tokyoAt(iso, BOOKING_TIME_SLOTS[i]), 30, mock);
};

/** This student's lessons with this teacher on a date, as grid rows. */
const ownOn = (iso) => user.upcomingLessons
  .filter((l) => l.teacherId === props.teacher.imageKey && l.start)
  .map((l) => {
    const p = partsIn(l.start, TOKYO);
    if (isoOf(p.year, p.month, p.day) !== iso) return null;
    const start = BOOKING_TIME_SLOTS.indexOf(`${pad(p.hour)}:${pad(p.minute)}`);
    return start === -1 ? null : { id: l.id, start, span: Math.max(1, Math.round(l.duration / 30)) };
  })
  .filter(Boolean);

const runsOf = (open) => {
  const runs = [];
  let start = -1;
  open.forEach((o, i) => {
    if (o && start === -1) start = i;
    if (!o && start !== -1) { runs.push({ start, span: i - start }); start = -1; }
  });
  if (start !== -1) runs.push({ start, span: open.length - start });
  return runs;
};

const columns = computed(() => visibleDates.value.map((iso) => {
  const open = BOOKING_TIME_SLOTS.map((_, i) => isOpen(iso, i));
  return {
    iso,
    dow: DOW[dowOf(iso)],
    day: partsOfIso(iso).d,
    long: `${DOW[dowOf(iso)]} ${shortDate(iso)}`,
    past: iso < today.value,
    open,
    runs: runsOf(open),
    own: ownOn(iso),
  };
}));

const fits = (col, i) => i + span.value <= SLOTS && Array.from({ length: span.value }, (_, k) => col.open[i + k]).every(Boolean);
const endLabel = (i, minutes) => formatSlotTo12Hour(addMinutesToSlotLabel(BOOKING_TIME_SLOTS, i, minutes));

/** Soonest open half-hour from today, for the "next opening" shortcut. */
const nextOpening = computed(() => {
  for (let d = 0; d <= MAX_DAYS_AHEAD; d += 1) {
    const iso = addDaysIso(today.value, d);
    const i = BOOKING_TIME_SLOTS.findIndex((_, k) => isOpen(iso, k));
    if (i !== -1) return { dateIso: iso, label: `${DOW[dowOf(iso)]} ${shortDate(iso)}, ${formatSlotTo12Hour(BOOKING_TIME_SLOTS[i])}` };
  }
  return null;
});
const nextOpeningVisible = computed(() => nextOpening.value && visibleDates.value.includes(nextOpening.value.dateIso));

// ── Date picker ───────────────────────────────────────────────────────
const pickerOpen = ref(false);
const pickerMonth = ref(monthOf(anchor.value));
const pickerWrap = ref(null);
const togglePicker = () => {
  pickerMonth.value = monthOf(anchor.value);
  pickerOpen.value = !pickerOpen.value;
};
const monthCells = computed(() => {
  const [y, m] = pickerMonth.value.split('-').map(Number);
  const first = isoOf(y, m - 1, 1);
  const start = addDaysIso(first, -dowOf(first));
  return Array.from({ length: 42 }, (_, k) => {
    const iso = addDaysIso(start, k);
    const inRange = iso >= today.value && iso <= lastDay.value;
    return {
      iso,
      day: partsOfIso(iso).d,
      inMonth: monthOf(iso) === pickerMonth.value,
      inRange,
      inVisible: visibleDates.value.includes(iso),
      hasOpen: inRange && monthOf(iso) === pickerMonth.value && BOOKING_TIME_SLOTS.some((_, i) => isOpen(iso, i)),
    };
  });
});
/** Row of the month grid under the pointer, for the week preview. */
const hoveredPickerRow = ref(null);

/** Band styling: the visible week (or day) in cream, a hovered week in grey,
 *  each rounded only where its run starts and ends. */
const bandClass = (cell, k) => {
  const col = k % 7;
  const row = Math.floor(k / 7);
  const inBand = (c) => c && c.inVisible;
  if (cell.inVisible) {
    const left = col === 0 || !inBand(monthCells.value[k - 1]);
    const right = col === 6 || !inBand(monthCells.value[k + 1]);
    return ['bg-brighture-cream', left ? 'rounded-l-full' : '', right ? 'rounded-r-full' : ''];
  }
  if (viewMode.value === 'week' && hoveredPickerRow.value === row && cell.inRange) {
    const left = col === 0 || !monthCells.value[k - 1]?.inRange;
    const right = col === 6 || !monthCells.value[k + 1]?.inRange;
    return ['bg-slate-100', left ? 'rounded-l-full' : '', right ? 'rounded-r-full' : ''];
  }
  return '';
};

const onDocClick = (e) => { if (pickerOpen.value && pickerWrap.value && !pickerWrap.value.contains(e.target)) pickerOpen.value = false; };

// ── Selection and the confirmation card ───────────────────────────────
const hovered = ref(null);
const selection = ref(null); // { iso, i, colIdx }
const error = ref('');
const cardRef = ref(null);

const isSelected = (iso, i) => !!selection.value && selection.value.iso === iso
  && i >= selection.value.i && i < selection.value.i + span.value;

const select = (iso, i, colIdx) => {
  error.value = '';
  selection.value = { iso, i, colIdx };
  hovered.value = null;
  nextTick(() => cardRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }));
};

const selectedCol = computed(() => (selection.value ? columns.value.find((c) => c.iso === selection.value.iso) : null));
const selectionFits = computed(() => !!selectedCol.value && fits(selectedCol.value, selection.value.i));

const setDuration = (minutes) => { duration.value = minutes; error.value = ''; };

const points = computed(() => pointsForDuration(props.teacher, duration.value));
const balance = computed(() => user.profile.pointsBalance);

/** Beside the chosen column: to its right in the left half of the week, to its left otherwise. */
const cardStyle = computed(() => {
  if (!selection.value) return {};
  const n = columns.value.length;
  const col = columns.value.findIndex((c) => c.iso === selection.value.iso);
  const top = Math.max(4, Math.min(selection.value.i * CALENDAR_ROW_HEIGHT - 8, gridHeight - 360));
  if (n === 1) return { top: `${top}px`, right: '12px' };
  const frac = (k) => `(100% - 56px) * ${k} / ${n}`;
  return col < n / 2
    ? { top: `${top}px`, left: `calc(56px + ${frac(col + 1)} + 8px)` }
    : { top: `${top}px`, right: `calc(${frac(n - col)} + 8px)` };
});

/**
 * Hands the pick to the full confirmation page, where the student chooses the
 * subject and writes a message before booking.
 */
const review = () => {
  error.value = '';
  if (!selection.value || !selectionFits.value) {
    error.value = 'That time no longer fits this lesson length. Pick another start time.';
    return;
  }
  if (balance.value < points.value) {
    error.value = `This lesson costs ${points.value} pts and you have ${balance.value}. Top up points to book it.`;
    return;
  }
  const { iso, i } = selection.value;
  emit('review', {
    dateIso: iso,
    time: BOOKING_TIME_SLOTS[i],
    start: tokyoAt(iso, BOOKING_TIME_SLOTS[i]),
    minutes: duration.value,
    points: points.value,
    dayLabel: `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dowOf(iso)]}, ${shortDate(iso)}`,
    startLabel: formatSlotTo12Hour(BOOKING_TIME_SLOTS[i]),
    endLabel: endLabel(i, duration.value),
  });
};

/* The card is one render function so it can appear beside the slot on wide
   screens and under the calendar on narrow ones without duplicating markup. */
const ConfirmCard = () => {
  const sel = selection.value;
  if (!sel) return null;
  const fitsNow = selectionFits.value;
  return h('div', { class: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl' }, [
    h('div', { class: 'flex items-start justify-between gap-2' }, [
      h('div', { class: 'min-w-0' }, [
        h('p', { class: 'm-0 text-[10px] font-black uppercase tracking-[0.14em] text-brighture-bronze' }, 'New lesson'),
        h('p', { class: 'm-0 mt-0.5 text-sm font-black text-slate-900' }, `${DOW[dowOf(sel.iso)]}, ${shortDate(sel.iso)}`),
        h('p', { class: 'm-0 text-xs font-semibold text-slate-600 tabular-nums' },
          `${formatSlotTo12Hour(BOOKING_TIME_SLOTS[sel.i])} – ${endLabel(sel.i, duration.value)} JST · with ${firstName.value}`),
      ]),
      h('button', {
        type: 'button',
        class: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700',
        'aria-label': 'Cancel this pick',
        onClick: () => { selection.value = null; },
      }, [h('i', { class: 'fa-solid fa-xmark text-sm', 'aria-hidden': 'true' })]),
    ]),

    // Length, repeated here so it can be changed without leaving the card
    h('div', { class: 'mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1' },
      DURATIONS.map((d) => h('button', {
        type: 'button',
        class: `rounded-lg px-2 py-1.5 text-xs font-bold transition ${duration.value === d.minutes ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`,
        onClick: () => setDuration(d.minutes),
      }, `${d.label} · ${pointsForDuration(props.teacher, d.minutes)} pt${pointsForDuration(props.teacher, d.minutes) === 1 ? '' : 's'}`))),
    !fitsNow ? h('p', { class: 'm-0 mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700' },
      'Only 30 minutes are free from this start. Choose 30 min or another time.') : null,

    h('div', { class: 'mt-3 flex items-center justify-between rounded-xl bg-brighture-cream/60 px-3 py-2 text-xs' }, [
      h('span', { class: 'font-semibold text-slate-600' }, 'Cost'),
      h('span', { class: 'font-black text-slate-900 tabular-nums' }, [
        `${points.value} pts `,
        h('span', { class: 'font-semibold text-slate-500' }, `· ${balance.value} → ${Math.max(0, balance.value - points.value)} left`),
      ]),
    ]),
    error.value ? h('p', { class: 'm-0 mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700' }, error.value) : null,

    h('div', { class: 'mt-3 grid grid-cols-2 gap-2' }, [
      h('button', {
        type: 'button',
        class: 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50',
        onClick: () => { selection.value = null; },
      }, 'Cancel'),
      h('button', {
        type: 'button',
        disabled: !fitsNow,
        class: 'rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40',
        onClick: review,
      }, ['Continue ', h('i', { class: 'fa-solid fa-arrow-right ml-0.5 text-[10px]', 'aria-hidden': 'true' })]),
    ]),
  ]);
};

// ── Now line, narrow layout, keyboard ─────────────────────────────────
const nowTop = computed(() => {
  const p = partsIn(new Date(clock.value).toISOString(), TOKYO);
  const mins = p.hour * 60 + p.minute - Number(BOOKING_TIME_SLOTS[0].slice(0, 2)) * 60;
  return mins >= 0 && mins <= SLOTS * 30 ? (mins / 30) * CALENDAR_ROW_HEIGHT : null;
});

/** How much of today's column is already in the past (0 before opening, all of it after closing). */
const pastHeight = computed(() => {
  const p = partsIn(new Date(clock.value).toISOString(), TOKYO);
  const mins = p.hour * 60 + p.minute - Number(BOOKING_TIME_SLOTS[0].slice(0, 2)) * 60;
  return Math.max(0, Math.min(gridHeight, (mins / 30) * CALENDAR_ROW_HEIGHT));
});

const narrow = ref(false);
const measure = () => { narrow.value = window.innerWidth < 768; };
const onKey = (e) => {
  if (e.key !== 'Escape') return;
  if (pickerOpen.value) pickerOpen.value = false;
  else if (selection.value) selection.value = null;
};

onMounted(() => {
  measure();
  window.addEventListener('resize', measure);
  document.addEventListener('mousedown', onDocClick);
  document.addEventListener('keydown', onKey);
  ticker = setInterval(() => { clock.value = Date.now(); }, 30_000);
  // A date and time carried over from the page's filter starts staged.
  if (props.initialDate && props.initialTime) {
    const i = BOOKING_TIME_SLOTS.indexOf(props.initialTime);
    const col = columns.value.find((c) => c.iso === props.initialDate);
    if (i !== -1 && col?.open[i]) select(props.initialDate, i, 0);
  }
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', measure);
  document.removeEventListener('mousedown', onDocClick);
  document.removeEventListener('keydown', onKey);
  clearInterval(ticker);
});

// A new teacher or view drops any pick that is no longer on screen.
watch(visibleDates, (dates) => { if (selection.value && !dates.includes(selection.value.iso)) selection.value = null; });
</script>
