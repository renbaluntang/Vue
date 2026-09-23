<template>
  <div class="availability-calendar flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div class="flex min-h-0 flex-1 items-stretch">
      <div class="flex min-w-0 flex-1 flex-col">
        <!-- Below xl the panel is a sheet, so the legend still needs a home on
             the board itself. -->
        <div class="flex items-center gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-2 xl:hidden">
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Open
          </span>
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span class="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Reserved
          </span>
        </div>

        <div ref="host" class="cjs-host min-h-0 flex-1"></div>
      </div>

      <!-- Inspector. A panel rather than a popover: this outgrew a tooltip —
           status, three clocks, every hour in the block — and a floating card
           covers the very thing being edited. Docked at xl, a sheet below it. -->
      <aside
        class="fixed inset-x-0 bottom-0 z-50 max-h-[76vh] flex-col overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl
               xl:static xl:z-auto xl:max-h-none xl:w-[19rem] xl:shrink-0 xl:rounded-none xl:border-l xl:border-t-0 xl:shadow-none"
        :class="picked ? 'flex' : 'hidden xl:flex'"
        aria-label="Availability block"
      >
        <template v-if="picked">
          <div class="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div class="min-w-0">
              <!-- The range is what the reader came for, so it leads. The day
                   names itself above it rather than sharing the line. -->
              <p class="text-[11px] font-bold text-slate-500">{{ picked.dayLong }}</p>
              <p class="mt-0.5 flex items-baseline gap-2">
                <span class="text-lg font-extrabold leading-tight tracking-tight tabular-nums text-slate-900">
                  {{ pickedTimes.friendly }}
                </span>
                <span class="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">
                  {{ picked.duration }}
                </span>
              </p>
              <p class="mt-1">
                <span
                  v-if="picked.status === 'reserved'"
                  class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-800 ring-1 ring-indigo-200/80"
                >
                  <i class="fa-solid fa-bookmark text-[9px]"></i> Reserved
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800 ring-1 ring-emerald-200/80"
                >
                  <i class="fa-solid fa-check text-[9px]"></i> Open for Booking
                </span>
                <span v-if="picked.reason && picked.status === 'reserved'" class="ml-1.5 text-[11px] font-semibold text-slate-500">
                  {{ picked.reason }}
                </span>
              </p>
            </div>
            <button
              type="button"
              @click="picked = null"
              class="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <!-- Not stretched: on a tall board a pinned footer strands the
               actions half a screen below the hours they act on. -->
          <div class="overflow-y-auto px-4 py-3">
            <!-- The same hours in the zones this instructor teaches across. -->
            <dl v-if="comparisonTimes.length" class="space-y-1">
              <div v-for="comp in comparisonTimes" :key="comp.tzId" class="flex items-baseline justify-between gap-3 text-[11px]">
                <dt class="truncate font-medium text-slate-500">{{ comp.city }}</dt>
                <dd class="shrink-0 font-bold tabular-nums text-slate-800">{{ comp.start }} – {{ comp.end }}</dd>
              </div>
            </dl>

            <div v-if="pickedHours.length > 1" class="mt-4">
              <p class="text-[11px] font-bold text-slate-500">Hours in this block</p>
              <ul class="mt-1.5 space-y-0.5">
                <li
                  v-for="hour in pickedHours"
                  :key="hour.key"
                  class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
                >
                  <span class="flex items-center gap-2 text-xs font-bold tabular-nums text-slate-700">
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="hour.reserved ? 'bg-indigo-500' : 'bg-emerald-500'"></span>
                    {{ hour.label }}
                  </span>
                  <button
                    type="button"
                    @click="removeHour(hour.key)"
                    class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    :title="`Remove ${hour.label}`"
                    :aria-label="`Remove ${hour.label}`"
                  >
                    <i class="fa-solid fa-xmark text-[11px]"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div class="space-y-1.5 border-t border-slate-100 px-4 py-3">
            <button
              v-if="picked.status === 'open'"
              type="button"
              @click="setPickedStatus('reserved', 'Manager Scheduled Class')"
              class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-100 active:scale-95"
            >
              <i class="fa-solid fa-bookmark text-[10px] text-indigo-600"></i>
              Change to Reserved
            </button>
            <button
              v-else
              type="button"
              @click="setPickedStatus('open')"
              class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
            >
              <i class="fa-solid fa-check text-[10px]"></i>
              Make Available for Students (Open)
            </button>

            <button
              type="button"
              @click="removePicked"
              class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition active:scale-95"
              :class="pickedHours.length > 1
                ? 'text-slate-500 hover:bg-slate-100 hover:text-rose-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'"
            >
              <i class="fa-regular fa-trash-can text-[11px]"></i>
              <span>{{ pickedHours.length > 1 ? `Remove all ${picked.duration}` : 'Close / Remove time' }}</span>
            </button>
          </div>
        </template>

        <!-- At rest the panel carries the legend, so the board keeps the strip
             it used to spend on one. An empty panel would be worse than none. -->
        <div v-else class="hidden flex-col gap-4 px-4 py-4 xl:flex">
          <div class="space-y-2">
            <p class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Open
              <span class="font-normal text-slate-400">students can book</span>
            </p>
            <p class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span class="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Reserved
              <span class="font-normal text-slate-400">held, not bookable</span>
            </p>
          </div>
          <p class="border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
            Click any half hour to open it. Drag an edge to change a block's
            length, or select it to change its status.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Schedule } from '@calendarjs/ce';
import '@calendarjs/ce/dist/style.css';
import { useTeacherStore } from '../../stores/useTeacherStore';
import {
  getTimeZoneInfo,
  calculateTimeDifference,
  convertSlotTime,
  normalizeTimeZone,
} from '../../lib/timezoneUtils';

const props = defineProps({
  timezones: {
    type: Array,
    default: () => [],
  },
  baseTimezone: {
    type: String,
    default: 'Asia/Manila',
  },
});

const teacher = useTeacherStore();

/**
 * Availability is stored in Manila hours and nothing else — the grid, the
 * events, `picked`. Every zone the instructor views it in is a projection of
 * that, converted at the moment of display. Treating a stored hour as if it
 * were already in the viewed zone is what made a 9 AM Manila block read "9 AM"
 * on the Tokyo board, an hour off its own gridline.
 */
const CANONICAL_ZONE = 'Asia/Manila';

const primaryZone = computed(() => {
  if (props.baseTimezone) return normalizeTimeZone(props.baseTimezone);
  if (props.timezones && props.timezones.length > 0) return normalizeTimeZone(props.timezones[0]);
  return normalizeTimeZone(teacher.profile.timezone);
});

const primaryZoneLabel = computed(() => getTimeZoneInfo(primaryZone.value).abbr);

const comparisonTimes = computed(() => {
  if (!picked.value || !props.timezones || props.timezones.length <= 1) return [];
  const start = picked.value.start;
  const end = picked.value.end;
  const baseTz = primaryZone.value;

  return props.timezones
    .filter((tz) => normalizeTimeZone(tz) !== baseTz)
    .map((tzId) => {
      const norm = normalizeTimeZone(tzId);
      const info = getTimeZoneInfo(norm);
      // From the stored Manila hour, never from whatever zone is on screen.
      const convertedStart = convertSlotTime(start, CANONICAL_ZONE, norm);
      const convertedEnd = convertSlotTime(end, CANONICAL_ZONE, norm);
      return {
        tzId: norm,
        city: info.city,
        abbr: info.abbr,
        start: convertedStart.time12,
        end: convertedEnd.time12,
      };
    });
});

const host = ref(null);
let schedule = null;
let headObserver = null;
// Writes travel both ways; this stops the calendar's own change from being
// echoed straight back at it as a fresh setData.
let applying = false;

// Gold is the portal's action colour; a whole week painted in it reads as one
// enormous button. Emerald already means "open" everywhere else in both
// portals — Join Meet, Available, the online dot — so availability blocks
// borrow that instead, and gold goes back to meaning "press me".
const OPEN_COLOR = '#10B981';
const RESERVED_COLOR = '#4F46E5';

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
};
const hourLabel = (h) => `${String(h % 24).padStart(2, '0')}:00`;

/** Minutes in one grid slot — 30, not 60. */
const slotMinutes = () => teacher.SLOT_MINUTES ?? 30;

/** Every row the library draws is one slot, so a row is the drag step. */
const gridRows = () =>
  [...(host.value?.querySelectorAll('.lm-schedule tbody tr') ?? [])].filter((r) => r.offsetHeight > 0);

/**
 * How tall one slot is, measured on the grid rather than on the block being
 * dragged. A short block renders shorter than its true share of the hour, so
 * deriving the step from it made the same drag worth different amounts of time
 * depending on which block you grabbed.
 */
const slotHeight = () => {
  const row = gridRows()[0];
  return Math.max(1, row ? row.getBoundingClientRect().height : 30);
};
const clockText = (mins) =>
  mins >= 1440 ? '24:00' : `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** A stored Manila hour as it reads on the board the instructor is viewing. */
const toDisplay = (hhmm) => convertSlotTime(hhmm, CANONICAL_ZONE, primaryZone.value).time24;

/** "14:00" -> "2 PM"; keeps the minutes only when there are any. */
const to12 = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

/**
 * "09:00" + "10:30" -> "9 – 10:30 AM". Saying the meridiem twice when it does
 * not change is how a machine writes a time; it also costs width the day
 * columns do not have.
 */
const rangeLabel = (start, end) => {
  const a = to12(start);
  const b = to12(end);
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`;
};

/**
 * "09:00" + "12:00" -> "3 hrs". Plotting a week should not make the instructor
 * subtract times in their head; the block already knows how long it is.
 */
const durationLabel = (start, end) => {
  const mins = Math.max(0, toMinutes(end) - toMinutes(start));
  if (!mins) return '';
  // Under an hour it reads in minutes: "0.5 hrs" is a worse way to say 30 min.
  if (mins < 60) return `${mins} min`;
  const hours = Math.round((mins / 60) * 10) / 10;
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
};
// A slot ends where the next one begins. The last one ends at the end of the
// day; "00:00" there would read as a block that finishes before it starts.
const slotEnd = (slot) => clockText(toMinutes(slot.manila) + slotMinutes());

/**
 * Groups consecutive hours of the same state (Open or Reserved) into calendar event blocks.
 */
const gridToEvents = () => {
  const days = teacher.scheduleDays;
  const slots = teacher.scheduleSlots;
  const events = [];

  days.forEach((day, weekday) => {
    let runStart = null;
    let runStatus = null;
    let runReason = '';

    slots.forEach((slot, i) => {
      const status = teacher.getSlotStatus(day.key, slot.key);
      const reason = teacher.getSlotReason(day.key, slot.key);
      const active = status !== 'closed';

      if (active && runStart !== null && status === runStatus) {
        // Continue current run of same state
      } else {
        // If there was an active run ending, flush it
        if (runStart !== null) {
          const isRes = runStatus === 'reserved';
          const dur = durationLabel(slots[runStart].manila, slots[i].manila);
          events.push({
            guid: `${day.key}-${slots[runStart].key}`,
            weekday,
            start: slots[runStart].manila,
            end: slots[i].manila,
            title: isRes ? `${dur} • Reserved` : `${dur} • Open`,
            color: isRes ? RESERVED_COLOR : OPEN_COLOR,
            status: runStatus,
            reason: runReason,
          });
          runStart = null;
          runStatus = null;
          runReason = '';
        }
        // Start a new run if current slot is active
        if (active) {
          runStart = i;
          runStatus = status;
          runReason = reason;
        }
      }

      // Check boundary at end of day
      if (i === slots.length - 1 && runStart !== null) {
        const isRes = runStatus === 'reserved';
        const dur = durationLabel(slots[runStart].manila, slotEnd(slot));
        events.push({
          guid: `${day.key}-${slots[runStart].key}`,
          weekday,
          start: slots[runStart].manila,
          end: slotEnd(slot),
          title: isRes ? `${dur} • Reserved` : `${dur} • Open`,
          color: isRes ? RESERVED_COLOR : OPEN_COLOR,
          status: runStatus,
          reason: runReason,
        });
        runStart = null;
        runStatus = null;
        runReason = '';
      }
    });
  });

  return events;
};

/** The reverse: every hour whose start falls inside a block receives that block's state. */
const eventsToGrid = (events) => {
  const days = teacher.scheduleDays;
  const slots = teacher.scheduleSlots;
  const next = {};

  events.forEach((ev) => {
    const day = days[Number(ev.weekday)];
    if (!day) return;
    const from = toMinutes(ev.start);
    const to = toMinutes(ev.end || ev.start);
    const isRes = ev.status === 'reserved' || ev.color === RESERVED_COLOR;
    const slotState = isRes ? { status: 'reserved', reason: ev.reason || 'Reserved' } : 'open';

    slots.forEach((slot) => {
      const at = toMinutes(slot.manila);
      if (at >= from && at < to) {
        next[`${day.key}-${slot.key}`] = slotState;
      }
    });
  });

  // Rebuild wholesale rather than diffing: a deleted block clears its hours
  days.forEach((day) => {
    slots.forEach((slot) => {
      const id = `${day.key}-${slot.key}`;
      if (next[id]) {
        teacher.availability[id] = next[id];
      } else {
        delete teacher.availability[id];
      }
    });
  });
};

/**
 * A block dragged out by hand arrives with default library color; default to Open.
 */
const stamp = (ev) => {
  if (!ev) return ev;
  const isRes = ev.status === 'reserved' || ev.color === RESERVED_COLOR;
  ev.title = `${durationLabel(ev.start, ev.end)} • ${isRes ? 'Reserved' : 'Open'}`;
  ev.color = isRes ? RESERVED_COLOR : OPEN_COLOR;
  ev.status = isRes ? 'reserved' : 'open';
  return ev;
};

/**
 * Dragging an edge changes a block's length without rebuilding the board, so
 * the label has to be refreshed in place — a rebuild mid-gesture would fight
 * the drag.
 */
/**
 * Label every block straight from its own data-start/data-end, including the
 * provisional one the library draws while a drag is in progress. That one is
 * not in getData() yet, so it fell back to the library's raw attributes — the
 * stored Manila hour — and the drag preview read an hour off the row it was
 * being drawn in whenever the board was viewed in another zone.
 */
/**
 * Two things fit on a block, so they have to be the two that are not already
 * obvious. When it runs is the headline on both. The second is what the block
 * cannot tell you by its size: on an open block that is how long it runs, and
 * on a held one it is what it is held for — the duration of a reservation is
 * the instructor's least pressing question about it.
 */
const writeFace = (el, ev, start, end) => {
  const reserved = ev?.status === 'reserved' || el.dataset.status === 'reserved';
  const range = rangeLabel(toDisplay(start), toDisplay(end));
  const span = durationLabel(start, end);
  const note = reserved ? (ev?.reason || 'Reserved') : span;

  const set = (name, value) => {
    if (el.dataset[name] !== value) el.dataset[name] = value;
  };
  set('status', reserved ? 'reserved' : 'open');
  // The library prints this into its own ::before when it is non-empty; the
  // reason is rendered from data-note now, so leaving it would double it up.
  set('description', '');
  // The library's own ::before reads data-title, so it stays the fallback for
  // the split second before this runs on a freshly drawn block.
  set('title', range);
  set('range', range);
  set('note', note);
  // How many slots tall, so the face can thin out when there is no room for
  // it. The library's own data-height would do, but it only writes that while
  // a block is being dragged — on a freshly drawn board it is not there at all.
  set('slots', String(Math.max(1, Math.round((toMinutes(end) - toMinutes(start)) / slotMinutes()))));
  // The face truncates on a narrow column; the tooltip never does.
  const full = reserved ? `${range} · ${span} · ${note}` : `${range} · ${span} · Open`;
  if (el.getAttribute('title') !== full) el.setAttribute('title', full);
};

const projectItemLabels = () => {
  const events = schedule?.getData() || [];
  host.value?.querySelectorAll('.lm-schedule-item').forEach((el) => {
    const { start, end } = el.dataset;
    if (!start || !end) return;

    const ev = events.find((e) => e.el === el) ||
      events.find((e) => e.start === start && e.end === end);
    writeFace(el, ev, start, end);
  });
};

const restampLabels = () => {
  (schedule?.getData() || []).forEach((ev) => {
    ev.title = durationLabel(ev.start, ev.end);
    if (!ev.el) return;
    // A drag writes preview times onto the element; if they are left behind,
    // the next lookup by start/end misses and the gesture falls through.
    ev.el.dataset.start = ev.start;
    ev.el.dataset.end = ev.end;
    writeFace(ev.el, ev, ev.start, ev.end);
  });
  projectItemLabels();
};

/** The block the instructor last clicked. */
const picked = ref(null);

/**
 * The whole interaction layer, restored: two-way sync with the board, the
 * gestures the library does not provide, and block selection.
 */
const pullFromCalendar = () => {
  if (!schedule || applying) return;
  applying = true;
  eventsToGrid(schedule.getData() || []);
  nextTick(() => {
    applying = false;
    restampLabels();
    syncCalendarTimeLabels();
  });
};

const pushToCalendar = () => {
  if (!schedule || applying) return;
  applying = true;
  schedule.setData(gridToEvents());
  nextTick(() => {
    applying = false;
    restampLabels();
    // setData rebuilds every block, so the event the panel was opened from
    // stops existing. The panel reads from the grid, so it only closes once
    // its own hours are gone.
    if (picked.value && !pickedHours.value.length) picked.value = null;
  });
};

const findEvent = (item) => {
  const data = schedule?.getData() || [];
  return (
    data.find((ev) => ev.el === item) ||
    data.find((ev) => ev.start === item.dataset.start && ev.end === item.dataset.end)
  );
};

const nextHourText = (hhmm) => clockText(toMinutes(hhmm) + slotMinutes());

const minutesToText = (mins) => clockText(Math.max(0, mins));

/* ---- Gestures ---------------------------------------------------------- */

// The library only creates a block when the pointer travels, so a tap or a
// steady-handed click is discarded and the slot silently fails to open. It also
// resizes from the bottom edge only. Both are handled here.
const DRAG_SLOP = 4;
const EDGE_GRAB = 7;
let pressAt = null;
let topDrag = null;
let moveDrag = null;
/** A completed move must not also register as a click on the block. */
let swallowClick = false;

const topEdgeOf = (e) => {
  const item = e.target?.closest?.('.lm-schedule-item');
  if (!item) return null;
  const box = item.getBoundingClientRect();
  return e.clientY - box.top <= EDGE_GRAB ? { item, box } : null;
};

const bottomEdgeOf = (e) => {
  const item = e.target?.closest?.('.lm-schedule-item');
  if (!item) return null;
  const box = item.getBoundingClientRect();
  return box.bottom - e.clientY <= EDGE_GRAB ? { item, box } : null;
};

/** Which day column and which slot row the pointer is over. */
const cellAt = (e) => {
  const cell = e.target?.closest?.('td');
  const row = e.target?.closest?.('tbody tr');
  if (!cell || !row) return null;

  const columnIndex = [...row.children].indexOf(cell) - 1; // column 0 is the gutter
  const day = teacher.scheduleDays[columnIndex];
  if (!day) return null;

  // One row per slot, in order, so the row's position is the slot. Matching on
  // the hour label instead would miss every row that is a half hour, because
  // the library only prints a label on the hour.
  const slot = teacher.scheduleSlots[gridRows().indexOf(row)];
  return slot ? { day, slot } : null;
};

const onHostPointerDown = (e) => {
  // Cleared here rather than by the click it was meant to swallow: a drag that
  // called preventDefault produces no click at all, and the flag would then be
  // spent on the next genuine one.
  swallowClick = false;

  const item = e.target?.closest?.('.lm-schedule-item');
  const edge = topEdgeOf(e);

  pressAt = {
    x: e.clientX,
    y: e.clientY,
    // Where the gesture began is the only reliable signal: by the time it ends
    // the library has dropped a provisional block under the cursor, and the
    // pointer may have left the board altogether.
    onItem: !!item,
    item,
  };

  // The library offers no top edge, so that one is ours; the bottom is taken
  // as well so the two ends of a block answer to the same code, scroll the
  // board the same way, and cannot drift apart again.
  const lower = !edge ? bottomEdgeOf(e) : null;
  if (lower) {
    // Claim the gesture whatever happens next, before the lookup that might
    // fail — otherwise a miss handed the edge back to the library mid-drag.
    e.preventDefault();
    const ev = findEvent(lower.item);
    if (ev) {
      const startMin = toMinutes(ev.start);
      const endMin = toMinutes(ev.end || ev.start);
      topDrag = {
        ev,
        el: lower.item,
        edge: 'bottom',
        startMin,
        endMin,
        newEndMin: endMin,
        rowH: slotHeight(),
        pressY: e.clientY,
        pressScroll: scrollerEl()?.scrollTop ?? 0,
        baseTop: lower.item.offsetTop,
        baseHeight: lower.item.offsetHeight,
      };
      picked.value = null;
    }
    return;
  }

  // Anywhere that is not a resize edge picks the block up.
  if (item && !edge) {
    // The library has a move of its own — it reparents the block into the row
    // under the pointer — and it has to be shut out, or the block travels our
    // offset plus its own and runs at twice the speed of the cursor. It only
    // showed up once rows became half hours: at hour rows a half-hour step
    // never crossed a row boundary, so the library's move was a no-op.
    e.preventDefault();
    const ev = findEvent(item);
    const column = item.closest('td');
    if (ev && column) {
      const startMin = toMinutes(ev.start);
      const endMin = toMinutes(ev.end || ev.start);
      moveDrag = {
        ev,
        el: item,
        startMin,
        endMin,
        weekday: Number(ev.weekday),
        newStartMin: startMin,
        newWeekday: Number(ev.weekday),
        rowH: slotHeight(),
        colW: column.getBoundingClientRect().width,
        pressX: e.clientX,
        pressY: e.clientY,
        pressScroll: scrollerEl()?.scrollTop ?? 0,
        active: false,
      };
    }
    return;
  }

  if (!edge) return;
  const ev = findEvent(edge.item);
  if (!ev) return;

  const startMin = toMinutes(ev.start);
  const endMin = toMinutes(ev.end || ev.start);
  topDrag = {
    ev,
    el: edge.item,
    edge: 'top',
    startMin,
    endMin,
    newStartMin: startMin,
    rowH: slotHeight(),
    pressY: e.clientY,
    pressScroll: scrollerEl()?.scrollTop ?? 0,
    baseTop: edge.item.offsetTop,
    baseHeight: edge.item.offsetHeight,
  };
  picked.value = null;
  // Suppresses the compatibility mouse events the library listens on.
  e.preventDefault();
};

const scrollerEl = () => host.value?.querySelector('.lm-schedule');

/** Pointer travel measured against the board, which may itself be scrolling. */
const contentDelta = (drag) => {
  const box = scrollerEl();
  const scrolled = box ? box.scrollTop - drag.pressScroll : 0;
  return {
    dx: lastPointer.x - drag.pressX,
    dy: lastPointer.y - drag.pressY + scrolled,
  };
};

const applyMovePreview = () => {
  const drag = moveDrag;
  if (!drag || !lastPointer) return;
  const { dx, dy } = contentDelta(drag);

  const span = drag.endMin - drag.startMin;
  const days = teacher.scheduleDays.length;
  drag.newStartMin = Math.min(24 * 60 - span, Math.max(0, drag.startMin + Math.round(dy / drag.rowH) * slotMinutes()));
  drag.newWeekday = Math.min(days - 1, Math.max(0, drag.weekday + Math.round(dx / drag.colW)));

  const rows = (drag.newStartMin - drag.startMin) / slotMinutes();
  const cols = drag.newWeekday - drag.weekday;
  drag.el.dataset.dragging = 'true';
  drag.el.style.transform = `translate(${cols * drag.colW}px, ${rows * drag.rowH}px)`;
  drag.el.dataset.start = minutesToText(drag.newStartMin);
  drag.el.dataset.end = minutesToText(drag.newStartMin + span);
  projectItemLabels();
};

const applyTopPreview = () => {
  const drag = topDrag;
  if (!drag || !lastPointer) return;
  const { dy } = contentDelta(drag);
  const step = slotMinutes();
  const moved = Math.round(dy / drag.rowH) * step;

  if (drag.edge === 'bottom') {
    // One slot is the floor: a block cannot be shrunk into nothing.
    const next = Math.max(drag.startMin + step, Math.min(24 * 60, drag.endMin + moved));
    if (next === drag.newEndMin) return;
    drag.newEndMin = next;
    drag.el.style.height = `${((next - drag.startMin) / step) * drag.rowH}px`;
    drag.el.dataset.end = minutesToText(next);
    projectItemLabels();
    return;
  }

  const floor = toMinutes(teacher.scheduleSlots[0]?.manila ?? '00:00');
  const next = Math.min(drag.endMin - step, Math.max(floor, drag.startMin + moved));
  if (next === drag.newStartMin) return;

  drag.newStartMin = next;
  const shifted = (next - drag.startMin) / step;
  drag.el.style.top = `${drag.baseTop + shifted * drag.rowH}px`;
  drag.el.style.height = `${drag.baseHeight - shifted * drag.rowH}px`;
  drag.el.dataset.start = minutesToText(next);
  projectItemLabels();
};

/**
 * Dragging toward an edge scrolls the board, so a block can be carried to an
 * hour that is off screen. The top zone starts below the sticky header, which
 * is the part of the board you cannot drop onto.
 */
const AUTOSCROLL_ZONE = 56;
const AUTOSCROLL_MAX = 16;
let autoScrollFrame = null;
let lastPointer = null;

const stopAutoScroll = () => {
  if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);
  autoScrollFrame = null;
};

const stepAutoScroll = () => {
  autoScrollFrame = null;
  const box = scrollerEl();
  const dragging = (moveDrag && moveDrag.active) || topDrag;
  if (!box || !dragging || !lastPointer) return;

  const rect = box.getBoundingClientRect();
  const headH = box.querySelector('thead')?.getBoundingClientRect().height ?? 0;
  // Against what is on screen, not the element: the board is often taller than
  // the window, so its own bottom edge sits below anywhere a pointer can go and
  // the lower zone could never be reached.
  const zoneTop = Math.max(rect.top + headH, 0);
  const zoneBottom = Math.min(rect.bottom, window.innerHeight);
  const fromTop = lastPointer.y - zoneTop;
  const fromBottom = zoneBottom - lastPointer.y;

  let speed = 0;
  if (fromTop < AUTOSCROLL_ZONE) {
    speed = -Math.ceil(((AUTOSCROLL_ZONE - Math.max(fromTop, -AUTOSCROLL_ZONE)) / AUTOSCROLL_ZONE) * AUTOSCROLL_MAX);
  } else if (fromBottom < AUTOSCROLL_ZONE) {
    speed = Math.ceil(((AUTOSCROLL_ZONE - Math.max(fromBottom, -AUTOSCROLL_ZONE)) / AUTOSCROLL_ZONE) * AUTOSCROLL_MAX);
  }

  if (speed) {
    const before = box.scrollTop;
    box.scrollTop = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, before + speed));
    if (box.scrollTop !== before) {
      if (moveDrag) applyMovePreview();
      else applyTopPreview();
    }
  }
  autoScrollFrame = requestAnimationFrame(stepAutoScroll);
};

const startAutoScroll = () => {
  if (!autoScrollFrame) autoScrollFrame = requestAnimationFrame(stepAutoScroll);
};

const onHostPointerMove = (e) => {
  lastPointer = { x: e.clientX, y: e.clientY };

  if (moveDrag) {
    // A press only becomes a drag once it travels; below that it is still a
    // click, and clicking a block opens the panel.
    if (!moveDrag.active) {
      const moved = Math.hypot(e.clientX - moveDrag.pressX, e.clientY - moveDrag.pressY);
      if (moved <= DRAG_SLOP) return;
      moveDrag.active = true;
    }
    e.preventDefault();
    applyMovePreview();
    startAutoScroll();
    return;
  }

  if (!topDrag) {
    // Name all three zones ourselves. Giving the block a default `grab` cursor
    // masked the library's inline resize cursor on the lower edge, so the two
    // edges have to be set here rather than left half to the library.
    const item = e.target?.closest?.('.lm-schedule-item');
    if (item) {
      const box = item.getBoundingClientRect();
      const nearTop = e.clientY - box.top <= EDGE_GRAB;
      const nearBottom = box.bottom - e.clientY <= EDGE_GRAB;
      item.style.cursor = nearTop || nearBottom ? 'ns-resize' : '';
    }
    return;
  }

  e.preventDefault();
  applyTopPreview();
  startAutoScroll();
};

const finishTopDrag = () => {
  const drag = topDrag;
  // Bail before touching pressAt: clearing it unconditionally wiped the state
  // click-to-open reads.
  if (!drag) return false;
  topDrag = null;
  pressAt = null;

  const day = teacher.scheduleDays[Number(drag.ev.weekday)];
  const unchanged = drag.edge === 'bottom'
    ? drag.newEndMin === drag.endMin
    : drag.newStartMin === drag.startMin;
  if (!day || unchanged) {
    pushToCalendar();
    return true;
  }

  const status = drag.ev.status === 'reserved' ? 'reserved' : 'open';
  const reason = drag.ev.reason || '';

  if (drag.edge === 'bottom') {
    const to = Math.max(drag.endMin, drag.newEndMin);
    teacher.scheduleSlots.forEach((slot) => {
      const at = slot.minutes ?? toMinutes(slot.manila);
      if (at < drag.startMin || at >= to) return;
      if (at >= drag.newEndMin) teacher.setSlotStatus(day.key, slot.key, 'closed');
      else teacher.setSlotStatus(day.key, slot.key, status, reason);
    });
    return true;
  }

  const from = Math.min(drag.startMin, drag.newStartMin);
  teacher.scheduleSlots.forEach((slot) => {
    const at = slot.minutes ?? toMinutes(slot.manila);
    if (at < from || at >= drag.endMin) return;
    if (at < drag.newStartMin) teacher.setSlotStatus(day.key, slot.key, 'closed');
    else teacher.setSlotStatus(day.key, slot.key, status, reason);
  });
  return true;
};

/** Lift the hours out of where they were and set them down where they landed. */
const finishMoveDrag = () => {
  const drag = moveDrag;
  if (!drag) return false;
  moveDrag = null;
  if (!drag.active) return false;

  pressAt = null;
  swallowClick = true;
  drag.el.style.transform = '';
  delete drag.el.dataset.dragging;

  const days = teacher.scheduleDays;
  const from = days[drag.weekday];
  const to = days[drag.newWeekday];
  if (!from || !to) { pushToCalendar(); return true; }
  if (drag.newWeekday === drag.weekday && drag.newStartMin === drag.startMin) {
    pushToCalendar();
    return true;
  }

  // Read the whole run before writing: the source and target can overlap, and
  // clearing as we go would erase hours we are about to need.
  const carried = [];
  teacher.scheduleSlots.forEach((slot) => {
    const at = toMinutes(slot.manila);
    if (at < drag.startMin || at >= drag.endMin) return;
    carried.push({
      offset: at - drag.startMin,
      status: teacher.isReserved(from.key, slot.key) ? 'reserved' : 'open',
      reason: teacher.getSlotReason(from.key, slot.key),
    });
  });

  carried.forEach(({ offset }) => {
    const slot = teacher.scheduleSlots.find((sl) => toMinutes(sl.manila) === drag.startMin + offset);
    if (slot) teacher.setSlotStatus(from.key, slot.key, 'closed');
  });
  carried.forEach(({ offset, status, reason }) => {
    const slot = teacher.scheduleSlots.find((sl) => toMinutes(sl.manila) === drag.newStartMin + offset);
    if (slot) teacher.setSlotStatus(to.key, slot.key, status, reason);
  });
  return true;
};

const onHostPointerUp = (e) => {
  stopAutoScroll();
  if (finishMoveDrag()) return;
  if (finishTopDrag()) return;

  const press = pressAt;
  pressAt = null;
  if (!press) return;

  const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_SLOP;
  if (moved) return;

  // A press on a block opens the panel, and it has to happen here: claiming
  // the gesture on pointerdown — which is what keeps the library's own move
  // out of it — suppresses the compatibility events, and click is one of them.
  if (press.onItem) {
    openPanel(press.item);
    return;
  }

  const hit = cellAt(e);
  if (hit && !teacher.isOpen(hit.day.key, hit.slot.key) && !teacher.isReserved(hit.day.key, hit.slot.key)) {
    teacher.setSlotStatus(hit.day.key, hit.slot.key, 'open');
  }
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const openPanel = (item) => {
  const ev = item ? findEvent(item) : null;
  if (!ev) { picked.value = null; return; }

  picked.value = {
    ev,
    status: ev.status || (ev.color === RESERVED_COLOR ? 'reserved' : 'open'),
    reason: ev.reason || '',
    start: ev.start,
    end: ev.end,
    duration: durationLabel(ev.start, ev.end),
    dayKey: teacher.scheduleDays[Number(ev.weekday)]?.key ?? '',
    day: teacher.scheduleDays[Number(ev.weekday)]?.label ?? 'This day',
    // The panel has room for the whole word.
    dayLong: DAY_NAMES[Number(ev.weekday)] ?? 'This day',
  };
};

// A press on a block is handled on pointerup; this is left for the presses
// that never reach it — on the board's empty space, which closes the panel.
const onHostClick = (e) => {
  if (swallowClick) { swallowClick = false; return; }
  openPanel(e.target?.closest?.('.lm-schedule-item'));
};


/**
 * Derived, not captured at click time: switching zone with the popover open
 * has to move these numbers along with the grid behind them.
 */
const pickedTimes = computed(() => {
  if (!picked.value) return null;
  const start = toDisplay(picked.value.start);
  const end = toDisplay(picked.value.end);
  return { start, end, friendly: rangeLabel(start, end) };
});

const pickedHours = computed(() => {
  const pick = picked.value;
  if (!pick?.dayKey) return [];
  const from = toMinutes(pick.start);
  const to = toMinutes(pick.end);

  return teacher.scheduleSlots
    .filter((slot) => {
      const at = toMinutes(slot.manila);
      return at >= from && at < to;
    })
    .map((slot) => ({
      key: slot.key,
      label: rangeLabel(toDisplay(slot.manila), toDisplay(nextHourText(slot.manila))),
      reserved: teacher.isReserved(pick.dayKey, slot.key),
    }))
    .filter((hour) => teacher.isOpen(pick.dayKey, hour.key) || hour.reserved);
});

/** Close one hour. The popover stays put unless it just emptied itself. */
const removeHour = (slotKey) => {
  const pick = picked.value;
  if (!pick?.dayKey) return;
  teacher.setSlotStatus(pick.dayKey, slotKey, 'closed');
  if (!pickedHours.value.length) picked.value = null;
};

const removePicked = () => {
  const pick = picked.value;
  if (!pick?.dayKey) return;
  // Snapshot first: the list shrinks as the grid is written to.
  const keys = pickedHours.value.map((hour) => hour.key);
  keys.forEach((key) => teacher.setSlotStatus(pick.dayKey, key, 'closed'));
  picked.value = null;
  pushToCalendar();
};

/**
 * A full day is 24 rows, and opening on a band of empty night hours hides the
 * schedule. Start where the week actually begins — the earliest open hour, or
 * 07:00 on an empty board.
 */
const scrollToFirstOpen = () => {
  const scroller = host.value?.querySelector('.lm-schedule');
  if (!scroller) return;

  const events = schedule?.getData() || [];
  const earliest = events.reduce(
    (min, ev) => Math.min(min, toMinutes(ev.start)),
    Number.POSITIVE_INFINITY
  );
  const target = Number.isFinite(earliest) ? Math.max(0, earliest / 60 - 1) : 7;

  const rows = [...host.value.querySelectorAll('.lm-schedule-hour')].filter((r) => r.offsetHeight > 0);
  const row = rows[Math.round(target)];
  if (row) scroller.scrollTop = row.offsetTop;
};

const onKeydown = (e) => { if (e.key === 'Escape') picked.value = null; };

const syncCalendarTimeLabels = () => {
  if (!host.value) return;

  // 1. Timezone indicator in the top-left corner header above hours
  const cornerHeader = host.value.querySelector('.lm-schedule thead tr td:first-child');
  if (cornerHeader) {
    cornerHeader.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.2;padding:2px 0;">
        <span style="font-size:9px;font-weight:800;letter-spacing:0.05em;color:#64748b;text-transform:uppercase;">ZONE</span>
        <span style="font-size:10px;font-weight:900;padding:1px 5px;border-radius:4px;background:#fef3c7;color:#78350f;margin-top:2px;">${primaryZoneLabel.value}</span>
      </div>
    `;
  }

  // 2. How much is open and reserved on each day, read straight off the grid.
  const dayCells = host.value.querySelectorAll('.lm-schedule thead td[data-weekday]');
  dayCells.forEach((cell, index) => {
    const day = teacher.scheduleDays[index];
    if (!day) return;
    const per = teacher.SLOTS_PER_HOUR ?? 2;
    const round = (n) => Math.round((n / per) * 10) / 10;
    const openH = round(teacher.scheduleSlots.filter((slot) => teacher.isOpen(day.key, slot.key)).length);
    const resH = round(teacher.scheduleSlots.filter((slot) => teacher.isReserved(day.key, slot.key)).length);

    let badge = cell.querySelector('.cjs-day-total');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cjs-day-total';
      cell.appendChild(badge);
    }
    if (openH && resH) {
      badge.textContent = `${openH}h open · ${resH}h res`;
    } else if (openH) {
      badge.textContent = `${openH}h open`;
    } else if (resH) {
      badge.textContent = `${resH}h res`;
    } else {
      badge.textContent = 'closed';
    }
    badge.dataset.empty = (openH || resH) ? 'false' : 'true';
  });

  // 3. Update time labels on the side to reflect the selected timezone
  const indexEls = host.value.querySelectorAll('.lm-schedule .lm-schedule-hour > td:first-child .lm-schedule-index');
  let seenVisible = false;
  indexEls.forEach((el) => {
    if (!el.dataset.baseTime) {
      el.dataset.baseTime = el.innerText.trim();
    }
    const baseTime = el.dataset.baseTime;
    if (!baseTime) return;

    const converted = convertSlotTime(baseTime, CANONICAL_ZONE, primaryZone.value);
    el.innerText = to12(converted.time24);
    el.setAttribute('title', `${converted.time24} · ${converted.time12} (${primaryZoneLabel.value})`);

    // Each label straddles the gridline it names. The topmost one would be
    // swallowed by the sticky header, so that one sits below its line instead.
    const row = el.closest('.lm-schedule-hour');
    const visible = !!row && row.offsetHeight > 0;
    if (visible && !seenVisible) {
      seenVisible = true;
      el.dataset.edge = 'first';
    } else {
      delete el.dataset.edge;
    }
  });
};

onMounted(() => {
  const slots = teacher.scheduleSlots;
  const firstHour = slots[0]?.manila ?? '07:00';
  const lastEnd = slots.length ? slotEnd(slots[slots.length - 1]) : '21:00';

  schedule = Schedule(host.value, {
    type: 'week',
    // No dates on the columns — the instructor's week repeats, which is exactly
    // what the availability grid has always meant.
    weekly: true,
    // `grid` is not a look, it is the library's only time resolution: it maps
    // rows to the clock as `row / (60 / grid)`, so at 60 the minutes can only
    // ever come out :00 and every gesture rounded itself back to a whole hour.
    // `snap` cannot rescue that — anything finer than `grid` is ignored. Half
    // hours need half-hour rows; the hour lines and labels are drawn on every
    // second one, so the board still reads like a timetable.
    grid: 30,
    overlap: false,
    validRange: [firstHour, lastEnd],
    data: gridToEvents(),
    // Stamp before the block reaches the board, so it never flashes blue.
    onbeforecreate: (self, events) => { (events || []).forEach(stamp); },
    onbeforeinsert: (self, event) => stamp(event),
    // Every mutation — drag, resize, create, delete — lands here.
    onchange: pullFromCalendar,
    oncreate: pullFromCalendar,
    ondelete: pullFromCalendar,
    onchangeevent: pullFromCalendar,
  });

  // The library re-renders its own table on delete, status change and resize,
  // which throws away the day totals and zone labels we append to its header.
  // A nextTick is not reliably late enough — sometimes the rebuild lands after
  // it — so watch for the badges going missing and put them straight back.
  headObserver = new MutationObserver(() => {
    if (!host.value) return;
    projectItemLabels();
    if (!host.value.querySelector('.cjs-day-total')) syncCalendarTimeLabels();
  });
  // data-start/data-end change on every step of a drag or resize. The
  // attributes we write back are deliberately not in the filter, so relabelling
  // cannot retrigger the observer.
  headObserver.observe(host.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-start', 'data-end'],
  });

  host.value.addEventListener('pointerdown', onHostPointerDown);
  host.value.addEventListener('pointermove', onHostPointerMove);
  // On window, not the host: a resize that runs past the board's edge still has
  // to end somewhere.
  window.addEventListener('pointerup', onHostPointerUp);
  host.value.addEventListener('click', onHostClick);
  document.addEventListener('keydown', onKeydown);

  nextTick(() => {
    restampLabels();
    syncCalendarTimeLabels();
    scrollToFirstOpen();
  });
});

// Watch primaryZone to update side time labels and indicator
watch(
  primaryZone,
  () => {
    nextTick(() => {
      restampLabels();
      syncCalendarTimeLabels();
    });
  }
);

// Changes made outside the calendar (Clear week, the grid view, a preset) have
// to reach it too.
watch(
  () => teacher.availability,
  () => {
    if (!applying) {
      pushToCalendar();
      nextTick(() => { syncCalendarTimeLabels(); });
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  stopAutoScroll();
  headObserver?.disconnect();
  headObserver = null;
  host.value?.removeEventListener('pointerdown', onHostPointerDown);
  host.value?.removeEventListener('pointermove', onHostPointerMove);
  window.removeEventListener('pointerup', onHostPointerUp);
  host.value?.removeEventListener('click', onHostClick);
  document.removeEventListener('keydown', onKeydown);
  if (schedule && typeof schedule.destroy === 'function') schedule.destroy();
  schedule = null;
});
</script>

<style scoped>
/* The library ships its own palette; these pull it onto the Brighture ramp
   without touching its markup. */
.availability-calendar :deep(table) { font-family: inherit; }

/* The board is a fixed 900px tall in the library's own CSS, which overflows a
   laptop screen and wastes a desktop one. It fills whatever the page column
   gives it instead, so the height comes from the window rather than a number. */
.availability-calendar :deep(.lm-schedule) {
  height: 100% !important;
  max-height: none !important;
}



/* The library letters its blocks in white on whatever colour they carry, which
   on the open green is about 1.6:1. Both states are lettered here instead, and
   the left rule is the one piece of chrome that separates them at a glance —
   open reads as the instructor's own time, held reads as someone else's. */
.availability-calendar :deep(.lm-schedule-item) {
  border: 1px solid rgb(6 40 30 / 0.14);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(6 40 30 / 0.12);
  /* A block can be picked up anywhere, so the whole face says so. The library
     sets its own resize cursor inline on the lower edge, and the top edge is
     set inline too, so both still win over this. */
  cursor: grab;
  transition: box-shadow 0.12s ease, filter 0.12s ease;

  /* One line by default. A flex line is broken on the items' natural widths,
     before any of them shrink, so leaving this to wrap put the duration under
     the time on exactly the blocks whose time happened to be long — the same
     two facts landing in two different layouts down one column. */
  display: flex;
  flex-wrap: nowrap;
  align-content: flex-start;
  justify-content: space-between;
  align-items: baseline;
  gap: 0 6px;
  padding: 3px 7px;
  line-height: 1.2;
  overflow: hidden;
}

.availability-calendar :deep(.lm-schedule-item[data-status='open']) {
  color: #05321F;
  border-left: 3px solid #047857;
}

.availability-calendar :deep(.lm-schedule-item[data-status='reserved']) {
  color: #ffffff;
  border-color: rgb(255 255 255 / 0.2);
  border-left: 3px solid #312E81;
}

.availability-calendar :deep(.lm-schedule-item:hover) {
  filter: brightness(1.05);
  box-shadow: 0 3px 8px rgb(6 40 30 / 0.24);
}

/* Lifted off the board while it is being carried, so it is obvious which block
   is moving and that the hours underneath are a destination, not a state. */
/* Above its neighbours, below the sticky header the library keeps at 4 — a
   block carried past the top of the board should slide under the day names,
   not cover them. */
.availability-calendar :deep(.lm-schedule-item[data-dragging='true']) {
  cursor: grabbing;
  z-index: 3;
  opacity: 0.92;
  box-shadow: 0 10px 22px rgb(6 40 30 / 0.3);
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .availability-calendar :deep(.lm-schedule-item) { transition: none; }
}

/* Width of the time column on the left */
.availability-calendar :deep(.lm-schedule table thead td:first-child),
.availability-calendar :deep(.lm-schedule table tbody td:first-child),
.availability-calendar :deep(.lm-schedule .lm-schedule-hour > td:first-child) {
  width: 62px !important;
  min-width: 62px !important;
  max-width: 62px !important;
  vertical-align: top;
  text-align: right;
  padding: 0 !important;
}

/* The body half of the hour column is flush with the card. Only the body —
   the header cell above it is sticky and has to stay opaque. */
.availability-calendar :deep(.lm-schedule table tbody td:first-child),
.availability-calendar :deep(.lm-schedule .lm-schedule-hour > td:first-child) {
  background-color: transparent;
}

/* Corner header above time column: Timezone indicator */
.availability-calendar :deep(.lm-schedule thead td:first-child) {
  padding: 6px 2px !important;
  /* Opaque, not transparent: this cell is sticky, so hour labels scroll
     underneath it and would otherwise read straight through the zone badge.
     White matches the card, so it still looks flush. */
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: table-cell !important;
  vertical-align: middle !important;
  text-align: center !important;
}

/* The day's open hours, under the weekday name. The header cell is otherwise
   empty — its weekday label is a ::before and its ::after is the bottom rule —
   so this rides as a real child and leaves the table layout alone. */
.availability-calendar :deep(.cjs-day-total) {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #047857;
  font-variant-numeric: tabular-nums;
}
.availability-calendar :deep(.cjs-day-total[data-empty='true']) {
  color: #cbd5e1;
  font-weight: 700;
}

/* When the block runs, set as the one thing on it worth reading from across
   the week. Tabular figures so a column of blocks lines up down the page. */
.availability-calendar :deep(.lm-schedule-item)::before {
  content: attr(data-range);
  flex: 1 1 auto;
  min-width: 0;
  height: auto;
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* The second fact: how long an open block runs, or what a held one is held
   for. Quieter than the time in every case — it is the answer to the second
   question, never the first. */
.availability-calendar :deep(.lm-schedule-item)::after {
  content: attr(data-note);
  flex: 0 1 auto;
  min-width: 0;
  font-size: 10px;
  font-weight: 700;
  opacity: 0.78;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* From an hour up there is a second line, and the note takes it rather than
   splitting the width with the time. A day column is about twelve characters
   wide: side by side, neither fact fitted and both were cut — "9 AM – 1…" next
   to "3 …". Stacked, the block reads when first and what second, and it is the
   same shape whether the column is wide or narrow. */
.availability-calendar :deep(.lm-schedule-item:not([data-slots='1'])) {
  flex-wrap: wrap;
}
.availability-calendar :deep(.lm-schedule-item:not([data-slots='1']))::after {
  flex: 0 0 100%;
  margin-top: 1px;
}

/* A reason is a phrase rather than a figure, so it is allowed to run on — two
   lines, which is as much as an hour-tall block has room for. */
.availability-calendar :deep(.lm-schedule-item[data-status='reserved']:not([data-slots='1']))::after {
  font-weight: 600;
  opacity: 0.88;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* Half an hour is 30px. Only the time fits, and on an open block the time
   already says how long it is. */
.availability-calendar :deep(.lm-schedule-item[data-slots='1']) {
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 6px;
}
.availability-calendar :deep(.lm-schedule-item[data-slots='1'])::before {
  font-size: 10px;
}
.availability-calendar :deep(.lm-schedule-item[data-slots='1'][data-status='open'])::after {
  display: none;
}

/* The hour column carries no rules of its own: the gridlines belong to the
   schedule, not to the numbers. Lines running through the labels chopped each
   one into its own little box and fought the straddled alignment above. */
.availability-calendar :deep(.lm-schedule tbody td:first-child),
.availability-calendar :deep(.lm-schedule .lm-schedule-hour > td:first-child) {
  border-top: 0 !important;
}

/* One rule per day column. Without them a block only implied which day it
   belonged to — the eye had to travel up to the header and back down. */
.availability-calendar :deep(.lm-schedule tbody td:not(:first-child)),
.availability-calendar :deep(.lm-schedule thead td:not(:first-child)) {
  border-right: 1px solid #eef2f7;
}
.availability-calendar :deep(.lm-schedule tbody td:last-child),
.availability-calendar :deep(.lm-schedule thead td:last-child) {
  border-right: 0;
}

/* Hour labels sit ON the line they name, right-aligned against the grid, the
   way a wall calendar reads — rather than floating in the middle of the hour,
   where the eye has to guess which of the two lines the number belongs to. */
.availability-calendar :deep(.lm-schedule .lm-schedule-index) {
  position: absolute !important;
  top: 0 !important;
  right: 10px !important;
  left: auto !important;
  bottom: auto !important;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  transform: translateY(-50%);
  font-family: inherit !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em !important;
  color: #94a3b8 !important;
  white-space: nowrap !important;
  font-variant-numeric: tabular-nums !important;
}

/* The first label has no line above it to straddle. */
.availability-calendar :deep(.lm-schedule .lm-schedule-index[data-edge='first']) {
  transform: none;
  top: 4px !important;
}
</style>
