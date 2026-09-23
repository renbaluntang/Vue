<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Scheduling</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Tap a slot to open or close it. Times shown in
          <strong class="font-bold text-slate-800">{{ activeZoneInfo.city }} ({{ activeZoneInfo.abbr }})</strong>
          <template v-if="activeZoneDiff.isSame">.</template>
          <template v-else>
            .
            <button
              type="button"
              @click="teacher.viewTimezone = primaryZoneId"
              class="ml-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-extrabold text-amber-900 transition hover:bg-amber-200 active:scale-95"
              title="Switch back to your profile timezone"
            >
              Reset to {{ primaryZoneInfo.abbr }}
            </button>
          </template>
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <!-- Counts, not controls: one readout, in the same two colours the
             board uses, so "open" never means emerald in one place and amber
             in another. -->
        <div class="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-2xs">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <strong class="tabular-nums text-slate-900">{{ teacher.openHours }}h</strong> open
          </span>
          <span class="h-3 w-px bg-slate-200"></span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
            <strong class="tabular-nums text-slate-900">{{ teacher.reservedHours }}h</strong> reserved
          </span>
        </div>

        <button
          type="button"
          @click="save"
          :disabled="!isDirty"
          class="rounded-2xl bg-brighture-gold px-5 py-2.5 text-sm font-extrabold text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40"
        >
          {{ saved ? '✓ Registered' : 'Register' }}
        </button>
      </div>
    </header>

    <!-- Which week, and how to look at it. The verbs that change it come after. -->
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <WeekNavigator class="min-w-0" />

      <!-- The grid is faster for "every Tuesday afternoon"; the calendar is
           faster for "9 to 5 on weekdays". Both write the same states. -->
      <div class="inline-flex h-9 shrink-0 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <button
          type="button"
          @click="view = 'grid'"
          :aria-pressed="view === 'grid' ? 'true' : 'false'"
          class="inline-flex items-center gap-1.5 px-3.5 text-xs transition"
          :class="view === 'grid' ? 'bg-slate-900 font-bold text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
        >
          <i class="fa-solid fa-table-cells text-[11px]"></i>
          <span>Grid</span>
        </button>
        <span class="w-px bg-slate-200" aria-hidden="true"></span>
        <button
          type="button"
          @click="view = 'calendar'"
          :aria-pressed="view === 'calendar' ? 'true' : 'false'"
          class="inline-flex items-center gap-1.5 px-3.5 text-xs transition"
          :class="view === 'calendar' ? 'bg-slate-900 font-bold text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
        >
          <i class="fa-regular fa-calendar text-[11px]"></i>
          <span>Calendar</span>
        </button>
      </div>
    </div>

    <!-- The verbs, on their own line under the week they act on. Every control
         here is 36px tall and sits on one baseline; the previous row mixed
         24, 30, 34 and 36 and nothing lined up. -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        @click="isRepeatModalOpen = true"
        class="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        title="Copy one day's hours across the days you choose"
      >
        <i class="fa-solid fa-repeat text-xs text-brighture-bronze"></i>
        <span>Repeat schedule…</span>
      </button>

      <button
        type="button"
        @click="isReserveModalOpen = true"
        class="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        title="Block time for a manager-scheduled class or meeting"
      >
        <i class="fa-solid fa-bookmark text-xs text-indigo-600"></i>
        <span>Reserve time…</span>
      </button>

      <span class="mx-0.5 hidden h-5 w-px bg-slate-200 sm:block"></span>

      <button
        type="button"
        @click="clearAll"
        class="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-500 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 active:scale-95"
        title="Close every slot this week"
      >
        <i class="fa-regular fa-trash-can text-[11px]"></i>
        <span>Clear week</span>
      </button>

    </div>

    <AvailabilityCalendar
      v-if="view === 'calendar'"
      class="schedule-board"
      :timezones="addedTimezones"
      :base-timezone="activeTimezone"
    />

    <!-- The grid scrolls inside its own box; the page itself never scrolls
         sideways, which is what makes this usable on a phone. -->
    <div v-show="view === 'grid'" class="schedule-board flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <!-- Matches the calendar's height so switching views does not resize the
           page, and scrolls inside itself rather than growing it. -->
      <div class="schedule-grid-scroll min-h-0 flex-1 overflow-auto">
        <!-- table-fixed: with auto layout a single "Manager" label widened
             that whole day column, so the week read as uneven even though every
             slot is the same one hour. Fixed layout splits the row evenly and
             the label truncates instead. -->
        <table class="w-full min-w-[680px] table-fixed border-collapse text-center">
          <thead>
            <tr class="bg-slate-50">
              <th class="sticky left-0 top-0 z-30 bg-slate-50 px-2 py-2.5 text-center border-r border-slate-200/80 w-24 min-w-24">
                <div class="flex flex-col items-center justify-center leading-tight">
                  <span class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">ZONE</span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 mt-0.5">
                    {{ activeZoneInfo.abbr }}
                  </span>
                </div>
              </th>
              <th v-for="day in teacher.scheduleDays" :key="day.key" class="sticky top-0 z-20 bg-slate-50 px-2 py-2">
                <p class="text-xs font-black" :class="day.isToday ? 'text-brighture-bronze' : 'text-slate-700'">
                  {{ day.label }}
                </p>
                <p class="text-[10px] tabular-nums" :class="day.isToday ? 'font-bold text-brighture-bronze' : 'text-slate-400'">
                  {{ day.date }}
                </p>
                <button
                  type="button"
                  @click="toggleDay(day.key)"
                  class="mt-1 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                  :title="`Toggle all slots for ${day.label}`"
                >
                  All
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in teacher.scheduleSlots" :key="slot.key" class="border-t border-slate-100">
              <th class="sticky left-0 z-10 bg-white px-2 py-1.5 text-center border-r border-slate-100 w-24 min-w-24">
                <button
                  type="button"
                  @click="toggleRow(slot.key)"
                  class="w-full flex flex-col items-center justify-center text-center transition hover:text-brighture-bronze group py-0.5"
                  :title="`Toggle this hour across the week`"
                >
                  <span class="font-mono text-xs font-black text-slate-900 tabular-nums">
                    {{ activeSlotTime(slot) }}
                  </span>
                  <span
                    v-if="!activeZoneDiff.isSame"
                    class="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 tabular-nums"
                    :title="`Base Manila time: ${slot.manila}`"
                  >
                    {{ slot.manila }}
                  </span>
                </button>
              </th>
              <td v-for="day in teacher.scheduleDays" :key="day.key" class="p-1">
                <button
                  type="button"
                  @click="onCellClick(day.key, slot.key)"
                  @contextmenu.prevent="onCellCycle(day.key, slot.key)"
                  :aria-pressed="teacher.isOpen(day.key, slot.key) || teacher.isReserved(day.key, slot.key)"
                  :title="cellTitle(day.key, slot.key, slot)"
                  class="relative group flex h-8 w-full min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border px-1 text-[11px] font-black transition active:scale-95"
                  :class="cellClass(day.key, slot.key)"
                >
                  <span v-if="teacher.isOpen(day.key, slot.key)">✓</span>
                  <span v-else-if="teacher.isReserved(day.key, slot.key)" class="flex items-center gap-1 text-[10px]">
                    <i class="fa-solid fa-bookmark text-[9px]"></i>
                    <span class="hidden min-w-0 truncate sm:inline">{{ cellShortReason(day.key, slot.key) }}</span>
                  </span>
                  <span v-else class="text-transparent group-hover:text-slate-400 text-xs">+</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
      <p>
        <span class="font-bold text-slate-700">Tip:</span>
        Click any slot to toggle open/closed. Click <strong>Reserve Time</strong> above to hold slots for manager-scheduled classes or meetings.
      </p>
      <p class="text-slate-400">
        Reserved slots are blocked from student self-booking.
      </p>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-12 opacity-0"
      leave-active-class="transition duration-150 ease-in" leave-to-class="translate-y-12 opacity-0"
    >
      <div
        v-if="isDirty"
        data-unsaved-bar
        class="fixed bottom-20 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-white shadow-2xl lg:bottom-6"
      >
        <p class="min-w-0 truncate text-xs font-semibold text-slate-200 sm:text-sm">
          You have unregistered schedule changes.
        </p>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" @click="revert" class="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white">
            Revert
          </button>
          <button
            type="button"
            @click="save"
            class="rounded-xl bg-brighture-gold px-5 py-2 text-xs font-extrabold text-slate-950 shadow-md transition hover:bg-brighture-gold-deep active:scale-95"
          >
            Register
          </button>
        </div>
      </div>
    </Transition>

    <!-- Repeat Schedule Modal (e.g. Mon to Fri) -->
    <RepeatScheduleModal
      :is-open="isRepeatModalOpen"
      @close="isRepeatModalOpen = false"
      @applied="onScheduleApplied"
    />

    <!-- Reserve Time Modal (Set Time & Reason) -->
    <ReserveModal
      :is-open="isReserveModalOpen"
      @close="isReserveModalOpen = false"
      @applied="onScheduleApplied"
    />
  </div>
</template>

<script setup>
import AvailabilityCalendar from '../../components/teacher/AvailabilityCalendar.vue';
import WeekNavigator from '../../components/teacher/WeekNavigator.vue';
import RepeatScheduleModal from '../../components/teacher/RepeatScheduleModal.vue';
import ReserveModal from '../../components/teacher/ReserveModal.vue';
import { ref, computed, watch } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';
import {
  getTimeZoneInfo,
  calculateTimeDifference,
  convertSlotTime,
  normalizeTimeZone,
} from '../../lib/timezoneUtils';

const teacher = useTeacherStore();

const view = ref('calendar');
const isRepeatModalOpen = ref(false);
const isReserveModalOpen = ref(false);

const onScheduleApplied = () => {
  touch();
};

// The picker lives in the portal header now, so the selection is store state.
const activeTimezone = computed(() => teacher.viewTimezone);
const addedTimezones = computed(() => teacher.viewTimezones);

const primaryZoneId = computed(() => normalizeTimeZone(teacher.profile.timezone));
const primaryZoneInfo = computed(() => getTimeZoneInfo(primaryZoneId.value));

const activeZoneId = computed(() => normalizeTimeZone(activeTimezone.value || primaryZoneId.value));
const activeZoneInfo = computed(() => getTimeZoneInfo(activeZoneId.value));
const activeZoneDiff = computed(() => calculateTimeDifference(primaryZoneId.value, activeZoneId.value));

// Slot time in the active viewing timezone
const activeSlotTime = (slot) => {
  const converted = convertSlotTime(slot.manila, 'Asia/Manila', activeZoneId.value);
  return converted.time24;
};

// Cell styling and display helpers
const cellClass = (dayKey, slotKey) => {
  if (teacher.isReserved(dayKey, slotKey)) {
    return 'border-transparent bg-indigo-500 text-white shadow-sm';
  }
  if (teacher.isOpen(dayKey, slotKey)) {
    return 'border-transparent bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm';
  }
  return 'border-slate-200 bg-slate-50 hover:border-brighture-gold/50 hover:bg-brighture-cream';
};

const cellShortReason = (dayKey, slotKey) => {
  const reason = teacher.getSlotReason(dayKey, slotKey);
  if (reason.toLowerCase().includes('manager')) return 'Manager';
  if (reason.toLowerCase().includes('meeting') || reason.toLowerCase().includes('team')) return 'Team';
  if (reason.toLowerCase().includes('personal')) return 'Personal';
  if (reason.toLowerCase().includes('grading')) return 'Grade';
  return 'Res';
};

const cellTitle = (dayKey, slotKey, slot) => {
  const status = teacher.getSlotStatus(dayKey, slotKey);
  const time = activeSlotTime(slot);
  if (status === 'open') return `${time} • Open (Available to students). Click to close.`;
  if (status === 'reserved') return `${time} • Reserved: ${teacher.getSlotReason(dayKey, slotKey)}. Click to manage reservation.`;
  return `${time} • Closed. Click to open for booking.`;
};

// Snapshot on entry so Register/Revert have something to compare against.
const allSlotIds = () =>
  teacher.scheduleDays.flatMap((day) => teacher.scheduleSlots.map((slot) => `${day.key}-${slot.key}`));

const getScheduleSignature = () => {
  return allSlotIds()
    .map((id) => {
      const val = teacher.availability[id];
      if (!val) return '';
      if (val === true || val === 'open' || (typeof val === 'object' && val?.status === 'open')) return `${id}:O`;
      if (val === 'reserved' || (typeof val === 'object' && val?.status === 'reserved')) {
        return `${id}:R:${val?.reason || ''}`;
      }
      return '';
    })
    .filter(Boolean)
    .sort()
    .join(';');
};

const savedSnapshot = ref(getScheduleSignature());
const saved = ref(false);
/** Whether this week was still following the pattern when it was last saved. */
const savedFollowedPattern = ref(teacher.weekFollowsPattern);

// A different week is a different sheet: it carries its own saved state, not
// the outgoing week's.
watch(() => teacher.activeWeekStart, () => {
  savedSnapshot.value = getScheduleSignature();
  savedFollowedPattern.value = teacher.weekFollowsPattern;
  saved.value = false;
});

const isDirty = computed(() => getScheduleSignature() !== savedSnapshot.value);

// The calendar writes straight to the store without going through the grid's
// handlers, so "have we saved this?" has to be derived, not hand-flagged.
watch(isDirty, (dirty) => { if (dirty) saved.value = false; });

const touch = () => { saved.value = false; };

const onCellClick = (dayKey, slotKey) => {
  const current = teacher.getSlotStatus(dayKey, slotKey);
  if (current === 'open') {
    teacher.setSlotStatus(dayKey, slotKey, 'closed');
  } else if (current === 'closed') {
    teacher.setSlotStatus(dayKey, slotKey, 'open');
  } else if (current === 'reserved') {
    teacher.setSlotStatus(dayKey, slotKey, 'closed');
  }
  touch();
};

const onCellCycle = (dayKey, slotKey) => {
  teacher.cycleSlot(dayKey, slotKey, 'Manager Scheduled Class');
  touch();
};

/** "All" button for day column toggles open / closed across that day. */
const toggleDay = (dayKey) => {
  const openCount = teacher.scheduleSlots.filter((slot) => teacher.isOpen(dayKey, slot.key)).length;
  teacher.setDay(dayKey, openCount < teacher.scheduleSlots.length);
  touch();
};

/** "All" button for hour row toggles open / closed across the week. */
const toggleRow = (slotKey) => {
  const openCount = teacher.scheduleDays.filter((day) => teacher.isOpen(day.key, slotKey)).length;
  teacher.setSlotRow(slotKey, openCount < teacher.scheduleDays.length);
  touch();
};

const clearAll = () => {
  teacher.scheduleDays.forEach((day) => teacher.setDay(day.key, false));
  touch();
};

const revert = () => {
  const parts = savedSnapshot.value.split(';').filter(Boolean);
  const restored = {};
  parts.forEach((p) => {
    const [id, type, ...rest] = p.split(':');
    if (type === 'O') {
      restored[id] = 'open';
    } else if (type === 'R') {
      restored[id] = { status: 'reserved', reason: rest.join(':') };
    }
  });

  // Undoing back to a week that followed the pattern means dropping the
  // exception, not writing the pattern's hours into a copy of it.
  if (savedFollowedPattern.value) {
    teacher.followPattern();
  } else {
    teacher.beginWeekEdit();
    allSlotIds().forEach((id) => {
      if (restored[id]) {
        teacher.availability[id] = restored[id];
      } else {
        delete teacher.availability[id];
      }
    });
  }
  saved.value = false;
};

const save = () => {
  savedSnapshot.value = getScheduleSignature();
  savedFollowedPattern.value = teacher.weekFollowsPattern;
  saved.value = true;
};

</script>

<style scoped>
/*
 * Nine hours on screen at a time. Slots are half-hours, so that is eighteen
 * rows; the board scrolls to reach the rest of the day rather than trying to
 * fit twenty-four hours into whatever the window happens to be.
 */
.schedule-board {
  --hour-height: 60px;
  --visible-hours: 9;
  height: calc(var(--visible-hours) * var(--hour-height) + 5.5rem);
}
.schedule-grid-scroll { min-height: 0; }
</style>
