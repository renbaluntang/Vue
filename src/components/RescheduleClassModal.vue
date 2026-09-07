<template>
  <div
    v-if="lesson"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="$emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
      class="flex w-full max-w-2xl sm:max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 max-h-[94vh] supports-[max-height:100dvh]:max-h-[94dvh]"
    >
      <!-- Header -->
      <div class="shrink-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 text-white sm:px-6 sm:py-5">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/30">
              <i class="fa-regular fa-calendar-days text-[9px]"></i> Reschedule
            </span>
            <span class="text-xs text-slate-400 font-medium truncate">
              {{ lesson.subject }}
            </span>
          </div>
          <h2 id="reschedule-modal-title" class="mt-1 text-lg font-extrabold sm:text-xl text-white">
            Reschedule with {{ teacherName }}
          </h2>
        </div>
        <button
          @click="$emit('close')"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white transition hover:bg-white/20 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Main Content -->
      <div class="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
        <!-- Compact Current Booking Strip -->
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <AppImage
              :src="lesson.teacherPhoto"
              :alt="lesson.teacherName"
              eager
              class="h-8 w-8 rounded-full ring-2 ring-white shrink-0"
            />
            <div class="min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Schedule:</span>
              <span class="font-extrabold text-slate-800 ml-1.5">{{ lesson.date }} · {{ lesson.time }}</span>
            </div>
          </div>
          <div class="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <i class="fa-solid fa-shield-halved text-[10px]"></i>
            <span>Points preserved (0 pts deducted)</span>
          </div>
        </div>

        <!-- Date & View Navigation Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <!-- Day Carousel / Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              v-for="d in availableDaysList"
              :key="d.key"
              type="button"
              @click="selectDayKey(d.key)"
              :class="[
                'shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl text-center border transition cursor-pointer',
                selectedDayKey === d.key
                  ? 'border-brighture-amber bg-amber-50 text-slate-900 ring-2 ring-brighture-amber/30 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              ]"
            >
              <span class="text-[10px] font-bold uppercase" :class="selectedDayKey === d.key ? 'text-amber-800' : 'text-slate-400'">
                {{ d.shortDay }}
              </span>
              <span class="text-xs font-black">{{ d.shortDate }}</span>
              <span
                class="text-[9px] font-extrabold mt-0.5 px-1.5 py-0.2 rounded-full"
                :class="d.openCount > 0 ? (selectedDayKey === d.key ? 'bg-amber-200/80 text-amber-900' : 'bg-emerald-50 text-emerald-700') : 'text-slate-300'"
              >
                {{ d.openCount > 0 ? `${d.openCount} open` : 'Full' }}
              </span>
            </button>
          </div>

          <!-- View Mode Toggle (1 Day / 3 Days) -->
          <div class="hidden sm:inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shrink-0 self-end sm:self-center">
            <button
              type="button"
              @click="viewMode = '1day'"
              :class="[
                'px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer',
                viewMode === '1day' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              ]"
            >
              1 Day
            </button>
            <button
              type="button"
              @click="viewMode = '3day'"
              :class="[
                'px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer',
                viewMode === '3day' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              ]"
            >
              3 Days
            </button>
          </div>
        </div>

        <!-- Timetable Calendar Container (Exact look from Brighture booking) -->
        <div class="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <!-- Calendar Column Headers -->
          <div
            class="grid border-b border-slate-200 bg-slate-50 text-slate-800"
            :style="{ gridTemplateColumns: `56px repeat(${activeColumns.length}, 1fr)` }"
          >
            <div class="border-r border-slate-200 bg-slate-50/70 p-2 text-center text-[10px] font-bold text-slate-400">
              JST
            </div>
            <div
              v-for="col in activeColumns"
              :key="col.key"
              class="border-r border-slate-200 px-2 py-2 text-center last:border-r-0"
            >
              <div class="text-xs sm:text-sm font-extrabold text-slate-800">
                {{ col.fullLabel }}
              </div>
              <div class="text-[10px] font-semibold text-emerald-600 mt-0.5">
                {{ getDayOpenSlotCount(col.dayIndex) }} open slots
              </div>
            </div>
          </div>

          <!-- Calendar Scrollable Grid (Fixed height with auto-scroll) -->
          <div
            ref="calendarGridRef"
            class="max-h-[380px] sm:max-h-[420px] overflow-y-auto relative scrollbar-thin select-none"
          >
            <div
              class="grid relative"
              :style="{ gridTemplateColumns: `56px repeat(${activeColumns.length}, 1fr)` }"
            >
              <!-- Time Column on Left -->
              <div class="relative border-r border-slate-200 bg-slate-50/60 shrink-0">
                <div
                  v-for="(slot, i) in BOOKING_TIME_SLOTS"
                  :key="`time-${slot}`"
                  class="absolute right-2 -translate-y-1/2 whitespace-nowrap text-[9px] sm:text-[10px] font-semibold text-slate-400"
                  :style="{ top: i * CALENDAR_ROW_HEIGHT + 'px' }"
                >
                  {{ formatSlotTo12Hour(slot) }}
                </div>
                <div :style="{ height: BOOKING_TIME_SLOTS.length * CALENDAR_ROW_HEIGHT + 'px' }" />
              </div>

              <!-- Day Column(s) -->
              <div
                v-for="col in activeColumns"
                :key="`col-${col.key}`"
                class="relative border-r border-slate-200 last:border-r-0 bg-white"
                :style="{ height: BOOKING_TIME_SLOTS.length * CALENDAR_ROW_HEIGHT + 'px' }"
                @mouseleave="hoveredSlot = null"
              >
                <!-- Horizontal Grid Lines -->
                <div
                  v-for="(slot, i) in BOOKING_TIME_SLOTS"
                  :key="`line-${slot}`"
                  :class="`absolute left-0 right-0 border-t ${i % 2 === 0 ? 'border-slate-200/90' : 'border-slate-100'}`"
                  :style="{ top: i * CALENDAR_ROW_HEIGHT + 'px' }"
                />

                <!-- Open Available Slots -->
                <template v-for="(slot, i) in BOOKING_TIME_SLOTS" :key="`open-${col.key}-${slot}`">
                  <button
                    v-if="isSlotAvailable(col.dayIndex, i) && !isSelected(col.dayIndex, i)"
                    type="button"
                    :title="`Stage 30 min starting ${formatSlotTo12Hour(slot)}`"
                    @mouseenter="hoveredSlot = { dayKey: col.key, dayIndex: col.dayIndex, slotIndex: i, slotTime: formatSlotTo12Hour(slot) }"
                    @click="selectSlot(col, i, slot)"
                    class="absolute left-1 right-1 flex items-center justify-start overflow-hidden rounded-md border-l-2 border-emerald-500 bg-emerald-50 px-2 py-0.5 text-left text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100 cursor-pointer shadow-2xs z-10"
                    :style="{ top: (i * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (CALENDAR_ROW_HEIGHT - 2) + 'px' }"
                  >
                    <span>Open</span>
                  </button>
                </template>

                <!-- Hover State: Dashed Amber Box with Tooltip (Matching Screenshot) -->
                <div
                  v-if="hoveredSlot && hoveredSlot.dayKey === col.key && isSlotAvailable(col.dayIndex, hoveredSlot.slotIndex) && !isSelected(col.dayIndex, hoveredSlot.slotIndex)"
                  class="pointer-events-none absolute left-1 right-1 z-20 rounded-md border-2 border-dashed border-amber-400 bg-amber-500/10"
                  :style="{
                    top: (hoveredSlot.slotIndex * CALENDAR_ROW_HEIGHT + 1) + 'px',
                    height: (CALENDAR_ROW_HEIGHT - 2) + 'px'
                  }"
                >
                  <!-- Tooltip Balloon (Exact replica of screenshot) -->
                  <div class="absolute -top-7 left-1 z-30 whitespace-nowrap rounded bg-slate-800/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg pointer-events-none flex items-center gap-1">
                    <span>Stage 30 min starting {{ hoveredSlot.slotTime }}</span>
                    <span class="absolute -bottom-1 left-2 h-1.5 w-1.5 rotate-45 bg-slate-800/95"></span>
                  </div>
                </div>

                <!-- Selected Slot Highlight -->
                <div
                  v-if="selectedBooking && selectedBooking.dayKey === col.key"
                  class="absolute left-1 right-1 z-25 overflow-hidden rounded-md border-l-2 border-brighture-gold bg-brighture-cream px-2 py-0.5 text-[11px] font-extrabold text-brighture-ink shadow-sm ring-2 ring-amber-400/40"
                  :style="{
                    top: (selectedBooking.slotIndex * CALENDAR_ROW_HEIGHT + 1) + 'px',
                    height: (CALENDAR_ROW_HEIGHT - 2) + 'px'
                  }"
                >
                  <div class="flex items-center justify-between">
                    <span class="truncate">✓ Rescheduled: {{ selectedBooking.start12 }}</span>
                    <span class="text-[9px] font-bold text-amber-900 opacity-90 hidden sm:inline">30 min</span>
                  </div>
                </div>

                <!-- Current Time Yellow Indicator Line (if column is today) -->
                <div
                  v-if="col.dayIndex === 0 && getNowLineTop() !== null"
                  class="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                  :style="{ top: getNowLineTop() + 'px' }"
                >
                  <div class="-ml-1 h-2 w-2 rounded-full bg-amber-400 border border-white shadow-xs" />
                  <div class="h-[1.5px] flex-1 bg-amber-400 shadow-2xs" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Schedule Confirmation Banner -->
        <div
          v-if="selectedBooking"
          class="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/50 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-900 border border-amber-300 flex items-center justify-center text-base shrink-0">
              🗓️
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-amber-800 tracking-wider">New Selected Time:</div>
              <div class="text-sm font-extrabold text-slate-900 mt-0.5">
                {{ selectedBooking.dateLabel }} · {{ selectedBooking.start12 }} - {{ selectedBooking.end12 }} JST
              </div>
            </div>
          </div>
          <div class="text-xs text-slate-600 font-medium">
            With <strong class="text-slate-900">{{ teacherName }}</strong>
          </div>
        </div>
        <div
          v-else
          class="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center text-xs text-slate-500"
        >
          <i class="fa-regular fa-hand-pointer mr-1.5 text-slate-400"></i>
          Click an <span class="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Open</span> slot in the timetable above to pick your new time.
        </div>

        <!-- Optional Reason Note -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Reason for Rescheduling <span class="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            v-model="rescheduleReason"
            type="text"
            placeholder="e.g. Schedule conflict, work meeting, personal matter..."
            class="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brighture-gold transition"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="shrink-0 flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-3 sm:p-4">
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-xs cursor-pointer"
        >
          Keep original schedule
        </button>

        <button
          type="button"
          :disabled="!selectedBooking"
          @click="handleConfirm"
          :class="[
            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold transition sm:px-6 sm:text-xs shadow-xs cursor-pointer',
            selectedBooking
              ? 'bg-brighture-gold text-brighture-ink hover:bg-brighture-gold-deep active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          ]"
        >
          <i class="fa-solid fa-calendar-check"></i>
          <span>Confirm Reschedule</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import AppImage from './AppImage.vue';
import {
  INSTRUCTORS,
  BOOKING_DAYS,
  BOOKING_TIME_SLOTS,
  formatSlotTo12Hour,
  addMinutesToSlotLabel,
  getSlotStatus,
  CALENDAR_ROW_HEIGHT,
} from '@/pages/student-view-v4/constants';

const props = defineProps({
  lesson: Object,
});

const emit = defineEmits(['close', 'confirm']);

const viewMode = ref('1day'); // '1day' | '3day'
const selectedDayKey = ref('');
const selectedBooking = ref(null);
const hoveredSlot = ref(null);
const rescheduleReason = ref('');
const calendarGridRef = ref(null);

// Identify teacher
const teacher = computed(() => {
  if (!props.lesson) return null;
  const name = props.lesson.teacherName?.trim().toLowerCase();
  return (
    INSTRUCTORS.find(
      (t) => t.name.toLowerCase() === name || name?.includes(t.name.toLowerCase())
    ) || INSTRUCTORS[0]
  );
});

const teacherName = computed(() => props.lesson?.teacherName || teacher.value?.name || 'Instructor');

// Days list (starting from today idx = 0 or tomorrow idx = 1 through 10 days)
const availableDaysList = computed(() => {
  if (!teacher.value) return [];
  return BOOKING_DAYS.slice(0, 10).map((d, i) => {
    let openCount = 0;
    BOOKING_TIME_SLOTS.forEach((_, slotIdx) => {
      if (getSlotStatus(teacher.value.id, i, slotIdx) === 'Available') {
        openCount++;
      }
    });

    const dateParts = d.key.split('-');
    const dateObj = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const shortDay = i === 0 ? 'Today' : d.day.slice(0, 3);
    const shortDate = `${monthStr}/${dayStr}`;
    const fullLabel = `${d.day}, ${monthStr}/${dayStr}`;

    return {
      dayIndex: i,
      key: d.key,
      day: d.day,
      shortDay,
      shortDate,
      fullLabel,
      openCount,
    };
  });
});

// Columns shown on the timetable based on viewMode
const activeColumns = computed(() => {
  if (!availableDaysList.value.length) return [];
  const currentIndex = availableDaysList.value.findIndex((d) => d.key === selectedDayKey.value);
  const startIdx = currentIndex >= 0 ? currentIndex : 0;

  if (viewMode.value === '3day') {
    return availableDaysList.value.slice(startIdx, startIdx + 3);
  }
  return [availableDaysList.value[startIdx] || availableDaysList.value[0]];
});

const selectDayKey = (key) => {
  selectedDayKey.value = key;
  // Scroll to reasonable view if needed
  scrollToPreferredTime();
};

const getDayOpenSlotCount = (dayIndex) => {
  if (!teacher.value) return 0;
  let count = 0;
  BOOKING_TIME_SLOTS.forEach((_, slotIdx) => {
    if (getSlotStatus(teacher.value.id, dayIndex, slotIdx) === 'Available') count++;
  });
  return count;
};

// Check if a specific slot is available for this teacher
const isSlotAvailable = (dayIndex, slotIndex) => {
  if (!teacher.value) return false;
  return getSlotStatus(teacher.value.id, dayIndex, slotIndex) === 'Available';
};

const isSelected = (dayIndex, slotIndex) => {
  return (
    selectedBooking.value?.dayIndex === dayIndex &&
    selectedBooking.value?.slotIndex === slotIndex
  );
};

const selectSlot = (col, slotIndex, rawSlot) => {
  const start12 = formatSlotTo12Hour(rawSlot);
  const endSlot = addMinutesToSlotLabel(BOOKING_TIME_SLOTS, slotIndex, 30);
  const end12 = formatSlotTo12Hour(endSlot);

  selectedBooking.value = {
    dayKey: col.key,
    dayIndex: col.dayIndex,
    slotIndex,
    rawSlot,
    start12,
    end12,
    dateLabel: col.fullLabel,
    timeFull: `${start12} - ${end12} JST`,
  };
};

// Current time line top position (matching screenshot)
const getNowLineTop = () => {
  const now = new Date();
  const nowMinutesFromStart = now.getHours() * 60 + now.getMinutes() - 8 * 60;
  if (nowMinutesFromStart >= 0 && nowMinutesFromStart <= (BOOKING_TIME_SLOTS.length - 1) * 30) {
    return (nowMinutesFromStart / 30) * CALENDAR_ROW_HEIGHT;
  }
  return null;
};

// Auto scroll to current time or afternoon so the user immediately sees the active timetable
const scrollToPreferredTime = () => {
  nextTick(() => {
    if (calendarGridRef.value) {
      // Scroll to ~2:00 PM (slot 12 = 384px) or nowLine
      const nowTop = getNowLineTop();
      const targetScroll = nowTop !== null ? Math.max(0, nowTop - 80) : 12 * CALENDAR_ROW_HEIGHT;
      calendarGridRef.value.scrollTop = targetScroll;
    }
  });
};

// Reset on modal open
watch(
  [() => props.lesson, availableDaysList],
  ([newLesson, days]) => {
    if (newLesson && days.length) {
      // Default to today or tomorrow with open slots
      const firstOpen = days.find((d) => d.openCount > 0) || days[0];
      selectedDayKey.value = firstOpen.key;
      selectedBooking.value = null;
      hoveredSlot.value = null;
      rescheduleReason.value = '';
      scrollToPreferredTime();
    }
  },
  { immediate: true }
);

const handleConfirm = () => {
  if (!selectedBooking.value || !props.lesson) return;
  emit('confirm', {
    lesson: props.lesson,
    newDate: selectedBooking.value.dateLabel,
    newTime: selectedBooking.value.timeFull,
    reason: rescheduleReason.value,
  });
};
</script>
