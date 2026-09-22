<template>
  <div class="availability-calendar relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <!-- Calendar Legend Bar -->
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-600">
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Calendar Legend:</span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-2xs"></span>
          <span class="text-slate-800 font-bold">Open</span>
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-2xs"></span>
          <span class="text-indigo-950 font-bold">Reserved</span>
        </span>
      </div>
      <div class="text-[11px] text-slate-400">
        Click any block to inspect or manage status.
      </div>
    </div>

    <div ref="host" class="cjs-host"></div>

    <!-- Click a block to inspect it and change status or take it off schedule -->
    <div
      v-if="picked"
      ref="popoverEl"
      class="absolute z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
      :style="{ top: picked.top + 'px', left: picked.left + 'px' }"
      role="dialog"
      aria-label="Availability block"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <!-- Status tag -->
          <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span
              v-if="picked.status === 'reserved'"
              class="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-black text-indigo-800"
            >
              <i class="fa-solid fa-bookmark text-[9px]"></i>
              <span>Reserved</span>
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-black text-emerald-800"
            >
              <i class="fa-solid fa-check text-[9px]"></i>
              <span>Open for Booking</span>
            </span>
            <span v-if="picked.reason && picked.status === 'reserved'" class="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
              • {{ picked.reason }}
            </span>
          </div>

          <p class="text-xs font-extrabold text-slate-900">{{ picked.day }}</p>
          <p class="mt-0.5 text-xs font-bold tabular-nums text-slate-800">
            {{ pickedTimes.start }} – {{ pickedTimes.end }}
            <span class="text-[10px] text-slate-400 font-semibold ml-1">({{ primaryZoneLabel }})</span>
          </p>
          <p class="mt-0.5 text-[11px] font-semibold text-slate-500">
            {{ pickedTimes.friendly }}
            <span class="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
              {{ picked.duration }}
            </span>
          </p>

          <!-- Equivalent times in other configured timezones -->
          <div v-if="comparisonTimes.length > 0" class="mt-2 pt-2 border-t border-slate-100 space-y-1">
            <div
              v-for="comp in comparisonTimes"
              :key="comp.tzId"
              class="flex items-center justify-between text-[11px]"
            >
              <span class="text-slate-500 font-medium truncate">{{ comp.city }}:</span>
              <span class="font-mono text-slate-800 font-bold tabular-nums ml-2 flex items-center gap-1">
                <span>{{ comp.start }} – {{ comp.end }}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="picked = null"
          class="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark text-[11px]"></i>
        </button>
      </div>

      <!-- Quick status change actions -->
      <div class="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
        <div v-if="picked.status === 'open'" class="space-y-1.5">
          <button
            type="button"
            @click="setPickedStatus('reserved', 'Manager Scheduled Class')"
            class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition active:scale-95 cursor-pointer"
          >
            <i class="fa-solid fa-bookmark text-[10px] text-indigo-600"></i>
            Change to Reserved
          </button>
        </div>

        <div v-else class="space-y-1.5">
          <button
            type="button"
            @click="setPickedStatus('open')"
            class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 cursor-pointer"
          >
            <i class="fa-solid fa-check text-[10px]"></i>
            Make Available for Students (Open)
          </button>
        </div>

        <!-- Each hour the block covers, individually removable. A merged block
             hides the fact that it is several one-hour slots; this puts them
             back within reach without making the instructor aim at a third of
             a rectangle. -->
        <div v-if="pickedHours.length > 1" class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Hours in this block</p>
          <ul class="max-h-36 space-y-0.5 overflow-y-auto">
            <li
              v-for="hour in pickedHours"
              :key="hour.key"
              class="flex items-center justify-between gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-50"
            >
              <span class="flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-slate-700">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="hour.reserved ? 'bg-indigo-500' : 'bg-emerald-500'"></span>
                {{ hour.label }}
              </span>
              <button
                type="button"
                @click="removeHour(hour.key)"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                :title="`Remove ${hour.label}`"
                :aria-label="`Remove ${hour.label}`"
              >
                <i class="fa-solid fa-xmark text-[11px]"></i>
              </button>
            </li>
          </ul>
        </div>

        <button
          type="button"
          @click="removePicked"
          class="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer"
          :class="pickedHours.length > 1
            ? 'text-slate-500 hover:bg-slate-100 hover:text-rose-700'
            : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'"
        >
          <i class="fa-regular fa-trash-can text-[11px]"></i>
          <span>{{ pickedHours.length > 1 ? `Remove all ${picked.duration}` : 'Close / Remove time' }}</span>
        </button>
      </div>
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
const RESERVED_COLOR = '#6366F1';

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
};
const hourLabel = (h) => `${String(h % 24).padStart(2, '0')}:00`;

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
 * "09:00" + "12:00" -> "3 hrs". Plotting a week should not make the instructor
 * subtract times in their head; the block already knows how long it is.
 */
const durationLabel = (start, end) => {
  const mins = Math.max(0, toMinutes(end) - toMinutes(start));
  if (!mins) return '';
  const hours = Math.round((mins / 60) * 10) / 10;
  return `${hours} ${mins === 60 ? 'hr' : 'hrs'}`;
};
/** Slots are one hour long, so a slot's end is the next hour. */
const slotEnd = (slot) => {
  const next = toMinutes(slot.manila) / 60 + 1;
  // The last slot ends at the end of the day; "00:00" there would read as a
  // block that finishes before it starts.
  return next >= 24 ? '24:00' : hourLabel(next);
};

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
const projectItemLabels = () => {
  host.value?.querySelectorAll('.lm-schedule-item').forEach((el) => {
    const { start, end } = el.dataset;
    if (!start || !end) return;
    const range = `${to12(toDisplay(start))} – ${to12(toDisplay(end))}`;
    if (el.dataset.range !== range) el.dataset.range = range;
    const title = durationLabel(start, end);
    if (el.dataset.title !== title) el.dataset.title = title;
  });
};

const restampLabels = () => {
  (schedule?.getData() || []).forEach((ev) => {
    const label = durationLabel(ev.start, ev.end);
    ev.title = label;
    if (!ev.el) return;
    ev.el.setAttribute('data-title', label);
    // The gutter reads 12-hour, so the blocks must too. Written as an extra
    // attribute rather than replacing the library's own, so that if this never
    // runs the block still falls back to showing its 24-hour range.
    ev.el.setAttribute('data-range', `${to12(toDisplay(ev.start))} – ${to12(toDisplay(ev.end))}`);
  });
  projectItemLabels();
};

/** The block the instructor last clicked, and where to park its popover. */
const picked = ref(null);
const popoverEl = ref(null);

/**
 * Derived, not captured at click time: switching zone with the popover open
 * has to move these numbers along with the grid behind them.
 */
const pickedTimes = computed(() => {
  if (!picked.value) return null;
  const start = toDisplay(picked.value.start);
  const end = toDisplay(picked.value.end);
  return { start, end, friendly: `${to12(start)} – ${to12(end)}` };
});

/**
 * Below the block is the natural place for this, but the unsaved-changes bar is
 * fixed to the bottom of the viewport and lands on top of it — and the button
 * it covers is the destructive one. So measure the real popover, and flip it
 * above the block whenever the space underneath is spoken for.
 */
const placePopover = () => {
  const el = popoverEl.value;
  const pick = picked.value;
  if (!el || !pick?.rect || !host.value) return;

  const hostBox = host.value.getBoundingClientRect();
  const height = el.offsetHeight;
  const bar = document.querySelector('[data-unsaved-bar]');
  const floor = (bar ? bar.getBoundingClientRect().top : window.innerHeight) - 10;
  const ceiling = hostBox.top + 6;

  let top = pick.rect.bottom + 6;
  if (top + height > floor) top = pick.rect.top - height - 6;
  // Neither side fits: sit as low as the bar allows rather than off the card.
  if (top < ceiling) top = Math.max(ceiling, floor - height);

  pick.top = top - hostBox.top;
};

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
    // setData rebuilds every block, so the event the popover was opened from
    // stops existing. That used to close it — which meant removing one hour
    // dismissed the list before a second could be removed. It reads from the
    // grid now, so it only closes once its own hours are gone.
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

/**
 * The library only creates a block when the pointer actually travels, so a tap
 * or a steady-handed click — zero pixels of movement — is discarded and the
 * slot silently fails to open. Distinguish the two gestures ourselves: a real
 * drag is left to the library, a click opens the hour it landed on.
 */
let pressAt = null;

const DRAG_SLOP = 4;

const onHostPointerDown = (e) => {
  pressAt = {
    x: e.clientX,
    y: e.clientY,
    // Where the gesture *began* is the only reliable signal: by the time it
    // ends the library has dropped a provisional block under the cursor, so
    // the end target says nothing about what was clicked.
    onItem: !!e.target?.closest?.('.lm-schedule-item'),
  };
};

const onHostPointerUp = (e) => {
  const press = pressAt;
  pressAt = null;
  if (!press) return;

  const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_SLOP;
  // A drag is the library's to handle; a press on an existing block belongs to
  // the popover.
  if (moved || press.onItem) return;

  const hit = cellAt(e);
  if (hit && !teacher.isOpen(hit.day.key, hit.slot.key) && !teacher.isReserved(hit.day.key, hit.slot.key)) {
    teacher.setSlotStatus(hit.day.key, hit.slot.key, 'open');
  }
};

/** Which day column and which hour row the pointer is over. */
const cellAt = (e) => {
  const cell = e.target?.closest?.('td');
  const row = e.target?.closest?.('.lm-schedule-hour');
  if (!cell || !row) return null;

  const columnIndex = [...row.children].indexOf(cell) - 1; // column 0 is the gutter
  const day = teacher.scheduleDays[columnIndex];
  if (!day) return null;

  const base = row.querySelector('.lm-schedule-index')?.dataset.baseTime;
  const slot =
    teacher.scheduleSlots.find((s) => s.manila === base) ??
    teacher.scheduleSlots[[...host.value.querySelectorAll('.lm-schedule-hour')]
      .filter((r) => r.offsetHeight > 0)
      .indexOf(row)];

  return slot ? { day, slot } : null;
};

const onHostClick = (e) => {
  const item = e.target?.closest?.('.lm-schedule-item');

  // A click on empty grid opens that hour, which the drag gesture alone never
  // did. A click that ended a drag is the library's to handle, not ours.
  if (!item) { picked.value = null; return; }
  const ev = findEvent(item);
  if (!ev) { picked.value = null; return; }

  const hostBox = host.value.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  picked.value = {
    ev,
    status: ev.status || (ev.color === RESERVED_COLOR ? 'reserved' : 'open'),
    reason: ev.reason || '',
    // Viewport rect of the block, so placement can reason about the fixed bar.
    rect: { top: box.top, bottom: box.bottom },
    start: ev.start,
    end: ev.end,
    duration: durationLabel(ev.start, ev.end),
    dayKey: teacher.scheduleDays[Number(ev.weekday)]?.key ?? '',
    day: teacher.scheduleDays[Number(ev.weekday)]?.label ?? 'This day',
    // Below the block, nudged back inside the calendar when it would overhang.
    top: Math.min(box.bottom - hostBox.top + 6, hostBox.height - 120),
    left: Math.min(Math.max(box.left - hostBox.left, 6), Math.max(hostBox.width - 280, 6)),
  };

  // Height is only knowable once it is on the page.
  nextTick(placePopover);
};

const setPickedStatus = (newStatus, reason = '') => {
  const pick = picked.value;
  if (!pick?.dayKey) return;
  const keys = pickedHours.value.map((hour) => hour.key);
  keys.forEach((key) => teacher.setSlotStatus(pick.dayKey, key, newStatus, reason));

  picked.value = null;
  pushToCalendar();
};

const nextHourText = (hhmm) => {
  const next = toMinutes(hhmm) / 60 + 1;
  return next >= 24 ? '24:00' : `${String(next).padStart(2, '0')}:00`;
};

/**
 * Every hour the block covers, read live from the grid rather than from the
 * event. Guessing which third of a block the pointer landed on made removing a
 * specific hour a matter of aim; listing them makes it a matter of reading.
 * Deriving from the store also means the list survives the split that removing
 * a middle hour causes, when the event object underneath stops existing.
 */
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
      label: `${to12(toDisplay(slot.manila))} – ${to12(toDisplay(nextHourText(slot.manila)))}`,
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
    const openH = teacher.scheduleSlots.filter((slot) => teacher.isOpen(day.key, slot.key)).length;
    const resH = teacher.scheduleSlots.filter((slot) => teacher.isReserved(day.key, slot.key)).length;

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
    grid: 60,
    snap: 60,
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
  host.value.addEventListener('pointerup', onHostPointerUp);
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
  headObserver?.disconnect();
  headObserver = null;
  host.value?.removeEventListener('pointerdown', onHostPointerDown);
  host.value?.removeEventListener('pointerup', onHostPointerUp);
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

/* Blocks are gold, and the library sets their label to white — about 1.6:1,
   which is unreadable. The title and time render as pseudo-elements, so they
   inherit from the item itself. */
.availability-calendar :deep(.lm-schedule-item) {
  color: #06281E;
  border: 1px solid rgb(6 40 30 / 0.14);
  border-left: 3px solid #047857;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgb(6 40 30 / 0.12);
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

/* The range sits opposite the duration on the same line; at 0.7em and inherited
   colour it was the faintest thing on the block despite being the detail the
   instructor checks most. */
.availability-calendar :deep(.lm-schedule-item)::before {
  font-weight: 800;
}
.availability-calendar :deep(.lm-schedule-item)::after {
  font-size: 0.72em;
  font-weight: 700;
  opacity: 0.8;
}
.availability-calendar :deep(.lm-schedule-item[data-range])::after {
  content: attr(data-range);
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
