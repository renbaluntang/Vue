<script setup>
import { ref, computed, watch } from "vue";
import DurationToggle from "./student-view-v4/DurationToggle.vue";
import CalendarViewToggle from "./student-view-v4/CalendarViewToggle.vue";
import BookingConfirmationPage from "./student-view-v4/BookingConfirmationPage.vue";
import DateTimeFilterPopover from "./student-view-v4/DateTimeFilterPopover.vue";
import SubjectFilterBar from "./student-view-v4/SubjectFilterBar.vue";
import {
  INSTRUCTORS,
  SUBJECT_LABELS,
  SUBJECT_FILTER_OPTIONS,
  isSubjectMatchingFilter,
  BOOKING_DAYS,
  BOOKING_TIME_SLOTS,
  formatSlotTo12Hour,
  addMinutesToSlotLabel,
  getTeacherPhoto,
  getTeacherModalImage,
  TEACHER_INTRO_VIDEO,
  getTeacherProfile,
  getTeacherSubjectOptions,
  parseSubjectCodes,
  getSlotStatus,
  DURATIONS,
  pointsForDuration,
  CALENDAR_ROW_HEIGHT,
  computeCalendarBlocks,
  getInitialFavorites,
} from "./student-view-v4/constants";

const favorites = ref(getInitialFavorites());
const slotOverrides = ref({});
const profileTeacher = ref(null);
const hoveredBookingCell = ref(null);
const bookingDuration = ref(30);
const bookingNotice = ref(null);
const calendarViewMode = ref("week");
const calendarDayCursor = ref(0);
const pendingBooking = ref(null);
const confirmationDraft = ref(null);
const confirmMessage = ref("");
const confirmSubject = ref("");

// Modern Redesign state
const search = ref("");
const subjectFilter = ref("ALL");
const favoritesOnly = ref(false);
const activeVideoTeacher = ref(null);
const cardColumns = ref(1);

// Popover / Date & Time state
const isPopoverOpen = ref(false);

// Confirmed state
const selectedDayKey = ref("");
const selectedTime = ref("");
const filterDuration = ref(30);

// Temporary popover state
const tempSelectedDayKey = ref("");
const tempSelectedTime = ref("");
const tempFilterDuration = ref(30);

const bookingSubject = ref("ALL");

// Clears every instructor filter, including the popover's uncommitted draft
// state, so reopening it doesn't restore what was just reset.
const resetFilters = () => {
  search.value = "";
  subjectFilter.value = "ALL";
  favoritesOnly.value = false;
  selectedDayKey.value = "";
  selectedTime.value = "";
  filterDuration.value = 30;
  tempSelectedDayKey.value = "";
  tempSelectedTime.value = "";
  tempFilterDuration.value = 30;
};

watch(
  favorites,
  (value) => {
    window.localStorage.setItem("student_view_v4_favorites", JSON.stringify(value));
  },
  { immediate: true }
);

watch(bookingNotice, (value, _oldValue, onCleanup) => {
  if (!value) {
    return;
  }
  const timer = setTimeout(() => {
    bookingNotice.value = null;
  }, 4500);
  onCleanup(() => clearTimeout(timer));
});

const openTeacherProfile = (teacher) => {
  profileTeacher.value = teacher;
  hoveredBookingCell.value = null;
  bookingNotice.value = null;
  // Carry the searched subject into the booking page, but only when this
  // teacher actually teaches it — otherwise the code has no matching option
  // (also covers a subject left over from the previously opened teacher).
  bookingSubject.value = parseSubjectCodes(teacher.specialty).includes(subjectFilter.value)
    ? subjectFilter.value
    : "ALL";

  const dayIndex = selectedDayKey.value
    ? BOOKING_DAYS.findIndex((day) => day.key === selectedDayKey.value)
    : -1;
  const slotIndex = selectedTime.value ? BOOKING_TIME_SLOTS.indexOf(selectedTime.value) : -1;

  // A filtered date means the student already picked a day — open straight to it
  // in Day view instead of dropping them on week one.
  if (dayIndex >= 0) {
    calendarViewMode.value = "day";
    calendarDayCursor.value = dayIndex;
  } else {
    calendarViewMode.value = "week";
    calendarDayCursor.value = 0;
  }

  if (dayIndex >= 0 && slotIndex >= 0) {
    bookingDuration.value = filterDuration.value;
    pendingBooking.value = {
      teacherId: teacher.id,
      dayIndex,
      slotIndex,
      minutes: filterDuration.value,
      span: filterDuration.value === 60 ? 2 : 1,
    };
  } else {
    pendingBooking.value = null;
  }
};

const closeTeacherProfile = () => {
  profileTeacher.value = null;
  hoveredBookingCell.value = null;
  pendingBooking.value = null;
  confirmationDraft.value = null;
};

const filteredInstructors = computed(() => {
  let list = [...INSTRUCTORS];

  if (favoritesOnly.value) {
    list = list.filter((teacher) => favorites.value.includes(teacher.id));
  }

  if (subjectFilter.value !== "ALL") {
    list = list.filter((teacher) => isSubjectMatchingFilter(teacher.specialty, subjectFilter.value));
  }

  if (selectedDayKey.value || selectedTime.value) {
    const selectedDayIndex = selectedDayKey.value
      ? BOOKING_DAYS.findIndex((day) => day.key === selectedDayKey.value)
      : -1;
    const selectedSlotIndex = selectedTime.value ? BOOKING_TIME_SLOTS.indexOf(selectedTime.value) : -1;

    list = list.filter((teacher) => {
      // If duration is 60 min, we need 2 consecutive slots open.
      const spanRequired = filterDuration.value === 60 ? 2 : 1;

      const checkSlotIsAvailable = (dayIdx, slotIdx) => {
        if (slotIdx + spanRequired > BOOKING_TIME_SLOTS.length) return false;
        for (let s = 0; s < spanRequired; s++) {
          if (getSlotStatus(teacher.id, dayIdx, slotIdx + s) !== "Available") {
            return false;
          }
        }
        return true;
      };

      if (selectedDayKey.value && selectedTime.value) {
        return (
          selectedDayIndex >= 0 &&
          selectedSlotIndex >= 0 &&
          checkSlotIsAvailable(selectedDayIndex, selectedSlotIndex)
        );
      }

      if (selectedDayKey.value) {
        return BOOKING_TIME_SLOTS.some((_slot, slotIdx) => checkSlotIsAvailable(selectedDayIndex, slotIdx));
      }

      if (selectedTime.value) {
        return BOOKING_DAYS.some((_, dayIdx) => checkSlotIsAvailable(dayIdx, selectedSlotIndex));
      }

      return true;
    });
  }

  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim();
    list = list.filter((teacher) => {
      const profile = getTeacherProfile(teacher);
      return (
        teacher.name.toLowerCase().includes(query) ||
        teacher.specialty.toLowerCase().includes(query) ||
        profile.major.toLowerCase().includes(query) ||
        profile.expertise.toLowerCase().includes(query)
      );
    });
  }

  return list.sort((left, right) => {
    const leftFav = favorites.value.includes(left.id) ? 1 : 0;
    const rightFav = favorites.value.includes(right.id) ? 1 : 0;
    if (leftFav !== rightFav) {
      return rightFav - leftFav;
    }
    return right.id - left.id;
  });
});

const toggleFavorite = (teacherId) => {
  favorites.value = favorites.value.includes(teacherId)
    ? favorites.value.filter((id) => id !== teacherId)
    : [...favorites.value, teacherId];
};

const slotKey = (teacherId, dayIndex, slotIndex) => `${teacherId}-${dayIndex}-${slotIndex}`;

const getDisplaySlotStatus = (teacherId, dayIndex, slotIndex) => {
  const key = slotKey(teacherId, dayIndex, slotIndex);
  return slotOverrides.value[key] ?? getSlotStatus(teacherId, dayIndex, slotIndex);
};

const isPendingSlot = (teacherId, dayIndex, slotIndex) =>
  pendingBooking.value !== null &&
  pendingBooking.value.teacherId === teacherId &&
  pendingBooking.value.dayIndex === dayIndex &&
  slotIndex >= pendingBooking.value.slotIndex &&
  slotIndex < pendingBooking.value.slotIndex + pendingBooking.value.span;

const handleBookingSlotClick = (teacher, dayIndex, slotIndex) => {
  if (isPendingSlot(teacher.id, dayIndex, slotIndex)) {
    pendingBooking.value = null;
    return;
  }

  const durationConfig = DURATIONS.find((option) => option.minutes === bookingDuration.value);
  const span = durationConfig.spanSlots;

  if (slotIndex + span > BOOKING_TIME_SLOTS.length) {
    bookingNotice.value = {
      type: "error",
      message: `${durationConfig.label} won't fit before the schedule closes for this day. Pick an earlier time.`,
    };
    return;
  }

  const indices = Array.from({ length: span }, (_, offset) => slotIndex + offset);
  const allAvailable = indices.every(
    (index) => getDisplaySlotStatus(teacher.id, dayIndex, index) === "Available"
  );

  if (!allAvailable) {
    bookingNotice.value = {
      type: "error",
      message:
        span > 1
          ? `That start time only has 30 min free. Switch to a 30-min lesson or choose another time for a full hour.`
          : `That slot is no longer available. Please choose another time.`,
    };
    return;
  }

  pendingBooking.value = { teacherId: teacher.id, dayIndex, slotIndex, span, minutes: bookingDuration.value };
  hoveredBookingCell.value = null;
};

const cancelPendingBooking = () => {
  pendingBooking.value = null;
};

const goToBookingConfirmation = () => {
  if (!pendingBooking.value) {
    return;
  }
  confirmationDraft.value = pendingBooking.value;
  confirmMessage.value = "";
  // Carry over the subject chosen on the booking page. "ALL" isn't a real
  // lesson subject, so it starts the confirmation on the placeholder instead.
  confirmSubject.value = bookingSubject.value === "ALL" ? "" : bookingSubject.value;
};

const cancelBookingConfirmation = () => {
  confirmationDraft.value = null;
};

const finalizeBooking = () => {
  if (!confirmationDraft.value) {
    return;
  }
  const teacher = INSTRUCTORS.find((item) => item.id === confirmationDraft.value.teacherId);
  const { dayIndex, slotIndex, span, minutes } = confirmationDraft.value;
  const indices = Array.from({ length: span }, (_, offset) => slotIndex + offset);

  const next = { ...slotOverrides.value };
  indices.forEach((index) => {
    next[slotKey(confirmationDraft.value.teacherId, dayIndex, index)] = "Selected";
  });
  slotOverrides.value = next;

  const day = BOOKING_DAYS[dayIndex];
  const dayLabel = day ? `${day.day} ${day.label}` : "";
  const startLabel = formatSlotTo12Hour(BOOKING_TIME_SLOTS[slotIndex]);
  const endLabel = formatSlotTo12Hour(addMinutesToSlotLabel(BOOKING_TIME_SLOTS, slotIndex, minutes));
  const durationConfig = DURATIONS.find((option) => option.minutes === minutes);
  const subjectLabel = confirmSubject.value ? `${SUBJECT_LABELS[confirmSubject.value] ?? confirmSubject.value} · ` : "";
  bookingNotice.value = {
    type: "success",
    message: `Booked! ${subjectLabel}${durationConfig.label} with ${teacher.name} on ${dayLabel}, ${startLabel} – ${endLabel} (${pointsForDuration(
      teacher,
      minutes
    )} pts).`,
  };
  confirmationDraft.value = null;
  pendingBooking.value = null;
  confirmMessage.value = "";
  confirmSubject.value = "";
  closeTeacherProfile();
};

// --- Booking confirmation page derived state ---
const draftTeacher = computed(() =>
  confirmationDraft.value ? INSTRUCTORS.find((item) => item.id === confirmationDraft.value.teacherId) : null
);
const draftDay = computed(() => (confirmationDraft.value ? BOOKING_DAYS[confirmationDraft.value.dayIndex] : null));
const draftDayLabel = computed(() => (draftDay.value ? `${draftDay.value.day} ${draftDay.value.label}` : ""));
const draftStartLabel = computed(() =>
  confirmationDraft.value ? formatSlotTo12Hour(BOOKING_TIME_SLOTS[confirmationDraft.value.slotIndex]) : ""
);
const draftEndLabel = computed(() =>
  confirmationDraft.value
    ? formatSlotTo12Hour(
        addMinutesToSlotLabel(BOOKING_TIME_SLOTS, confirmationDraft.value.slotIndex, confirmationDraft.value.minutes)
      )
    : ""
);
const draftPoints = computed(() =>
  confirmationDraft.value && draftTeacher.value ? pointsForDuration(draftTeacher.value, confirmationDraft.value.minutes) : 0
);
const draftSubjectOptions = computed(() =>
  draftTeacher.value ? getTeacherSubjectOptions(draftTeacher.value).filter((opt) => opt.value !== "ALL") : []
);

// --- Date & time filter popover wiring ---
const openDateTimePopover = () => {
  // Load the committed date/time filters into the draft so the popover opens
  // showing what's actually applied. Subject is not part of this popover — the
  // chips row below owns `subjectFilter`.
  tempSelectedDayKey.value = selectedDayKey.value;
  tempSelectedTime.value = selectedTime.value;
  tempFilterDuration.value = filterDuration.value;
  isPopoverOpen.value = true;
};

const clearDateTimeFilters = () => {
  tempSelectedDayKey.value = "";
  tempSelectedTime.value = "";
  tempFilterDuration.value = 30;
  selectedDayKey.value = "";
  selectedTime.value = "";
  filterDuration.value = 30;
  subjectFilter.value = "ALL";
  isPopoverOpen.value = false;
};

const confirmDateTimeFilters = () => {
  selectedDayKey.value = tempSelectedDayKey.value;
  selectedTime.value = tempSelectedTime.value;
  filterDuration.value = tempFilterDuration.value;
  isPopoverOpen.value = false;
};

// --- Teacher profile modal / calendar navigation ---
const weekStartIndex = computed(() => Math.floor(calendarDayCursor.value / 7) * 7);
const columns = computed(() =>
  calendarViewMode.value === "week"
    ? BOOKING_DAYS.slice(weekStartIndex.value, weekStartIndex.value + 7)
    : [BOOKING_DAYS[calendarDayCursor.value]]
);
const dayIndexForColumn = (colIdx) =>
  calendarViewMode.value === "week" ? weekStartIndex.value + colIdx : calendarDayCursor.value;
const prevDisabled = computed(() =>
  calendarViewMode.value === "week" ? weekStartIndex.value === 0 : calendarDayCursor.value === 0
);
const nextDisabled = computed(() =>
  calendarViewMode.value === "week"
    ? weekStartIndex.value + 7 >= BOOKING_DAYS.length
    : calendarDayCursor.value >= BOOKING_DAYS.length - 1
);
const goPrev = () => {
  calendarDayCursor.value =
    calendarViewMode.value === "week"
      ? Math.max(0, Math.floor(calendarDayCursor.value / 7) * 7 - 7)
      : Math.max(0, calendarDayCursor.value - 1);
};
const goNext = () => {
  calendarDayCursor.value =
    calendarViewMode.value === "week"
      ? Math.min(BOOKING_DAYS.length - 7, Math.floor(calendarDayCursor.value / 7) * 7 + 7)
      : Math.min(BOOKING_DAYS.length - 1, calendarDayCursor.value + 1);
};
const goToday = () => {
  calendarDayCursor.value = 0;
};
const headerLabel = computed(() =>
  calendarViewMode.value === "week"
    ? `${columns.value[0].label} – ${columns.value[columns.value.length - 1].label}`
    : `${columns.value[0].day}, ${columns.value[0].label}`
);

// Mirrors the React component computing `now = new Date()` fresh on every
// render — there is no ticking timer in the original, so this is a plain
// function (not a cached computed) re-evaluated whenever the template
// re-renders for any other reason.
const getNowLineTop = () => {
  const now = new Date();
  const nowMinutesFromStart = now.getHours() * 60 + now.getMinutes() - 8 * 60;
  return nowMinutesFromStart >= 0 && nowMinutesFromStart <= (BOOKING_TIME_SLOTS.length - 1) * 30
    ? (nowMinutesFromStart / 30) * CALENDAR_ROW_HEIGHT
    : null;
};

// --- Grid layout helpers (shared expressions used across the card list) ---
const containerMaxWidthClass = computed(() =>
  cardColumns.value === 3 ? "max-w-[1530px]" : cardColumns.value === 2 ? "max-w-[1360px]" : "max-w-[1240px]"
);
const sectionColsClass = computed(() =>
  cardColumns.value === 3
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    : cardColumns.value === 2
    ? "grid-cols-1 md:grid-cols-2"
    : "grid-cols-1"
);
const cardBodyGridClass = computed(() =>
  cardColumns.value === 3
    ? "grid-cols-1"
    : cardColumns.value === 2
    ? "grid-cols-1 xl:grid-cols-[150px,1fr]"
    : "md:grid-cols-[200px,1fr]"
);
const cardPhotoAspectClass = computed(() =>
  cardColumns.value === 3 ? "max-w-full aspect-video" : "max-w-[200px] aspect-[4/3] sm:aspect-square"
);

const GRID_LAYOUT_OPTIONS = [
  { cols: 1, label: "1 per row" },
  { cols: 2, label: "2 per row" },
  { cols: 3, label: "3 per row" },
];
</script>

<template>
  <BookingConfirmationPage
    v-if="confirmationDraft"
    :teacher="draftTeacher"
    :day-label="draftDayLabel"
    :start-label="draftStartLabel"
    :end-label="draftEndLabel"
    :minutes="confirmationDraft.minutes"
    :points="draftPoints"
    :subject="confirmSubject"
    :subject-options="draftSubjectOptions"
    :message="confirmMessage"
    @update:subject="confirmSubject = $event"
    @update:message="confirmMessage = $event"
    @cancel="cancelBookingConfirmation"
    @submit="finalizeBooking"
  />

  <div v-else class="min-h-screen bg-[#f1f5f9] px-3 py-6 pb-24 text-slate-800 sm:px-6">
    <div :class="`mx-auto space-y-6 transition-all duration-300 ${containerMaxWidthClass}`">
      <!-- Top Header & Search Filter Bar -->
      <header class="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <!-- Row 1: Search + Date + Time -->
        <div class="flex items-center gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <!-- Search input — grows -->
          <div class="relative flex-1">
            <svg
              class="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              v-model="search"
              placeholder="Search by instructor name, specialty, or subject…"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none ring-0 transition-all placeholder:text-slate-400 focus:border-[#FFCD00] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,205,0,0.15)]"
            />
            <button
              v-if="search"
              type="button"
              @click="search = ''"
              aria-label="Clear search"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-500 transition hover:bg-slate-300 hover:text-slate-700"
            >
              ✕
            </button>
            <span
              v-else
              class="absolute right-4 top-1/2 -translate-y-1/2 hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 sm:block"
            >
              ⌘K
            </span>
          </div>

          <!-- Popover trigger button -->
          <div class="relative hidden sm:block">
            <button
              type="button"
              @click="openDateTimePopover"
              :class="`flex h-[46px] items-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition ${
                selectedDayKey || selectedTime
                  ? 'border-[#FFCD00] bg-[#FFFBE6] text-slate-800'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-700'
              }`"
            >
              <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span v-if="selectedDayKey || selectedTime">
                <template v-if="selectedDayKey">{{ BOOKING_DAYS.find((d) => d.key === selectedDayKey)?.label }}</template>
                <template v-if="selectedDayKey && selectedTime">, </template>
                <template v-if="selectedTime">{{ formatSlotTo12Hour(selectedTime) }}</template>
              </span>
              <template v-else>Search by Date &amp; Time</template>
            </button>

            <DateTimeFilterPopover
              :is-open="isPopoverOpen"
              @close="isPopoverOpen = false"
              v-model:temp-day="tempSelectedDayKey"
              v-model:temp-time="tempSelectedTime"
              v-model:temp-duration="tempFilterDuration"
              @clear="clearDateTimeFilters"
              @confirm="confirmDateTimeFilters"
            />
          </div>
        </div>

        <!-- Row 2: Subject & Category Filter + Favorites -->
        <div class="mt-3 border-t border-slate-100 px-5 py-3 sm:px-6">
          <SubjectFilterBar
            v-model="subjectFilter"
            v-model:favorites-only="favoritesOnly"
            :favorites-count="favorites.length"
          />
        </div>

        <!-- Bottom: count + reset -->
        <div class="flex items-center justify-between border-t border-slate-100 px-5 py-3 sm:px-6">
          <span class="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600">
              {{ filteredInstructors.length }}
            </span>
            of {{ INSTRUCTORS.length }} instructors
          </span>
          <button
            v-if="search || subjectFilter !== 'ALL' || favoritesOnly || selectedDayKey || selectedTime"
            type="button"
            @click="resetFilters"
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset filters
          </button>
        </div>
      </header>

      <!-- Instructors Grid List -->
      <section :class="`grid gap-5 transition-all duration-300 ${sectionColsClass}`">
        <article
          v-for="teacher in filteredInstructors"
          :key="teacher.id"
          class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6"
        >
          <div>
            <!-- Header Row: Name, Status, Points, Favorite -->
            <div class="flex flex-col gap-3 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="m-0 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  {{ teacher.name }}
                </h3>
                <span class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Available Today
                </span>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-2">
                <div class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <span class="text-slate-400">Rate:</span>
                  <span class="font-semibold text-slate-800">
                    30m: <strong>{{ pointsForDuration(teacher, 30) }} pts</strong>
                  </span>
                  <span class="text-slate-300">·</span>
                  <span class="font-semibold text-slate-800">
                    1h: <strong>{{ pointsForDuration(teacher, 60) }} pts</strong>
                  </span>
                </div>

                <button
                  type="button"
                  @click="toggleFavorite(teacher.id)"
                  :class="`inline-flex h-8 w-8 items-center justify-center rounded-xl border text-xs transition ${
                    favorites.includes(teacher.id)
                      ? 'border-amber-300 bg-amber-50 text-amber-500 shadow-2xs hover:bg-amber-100'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-500'
                  }`"
                  :aria-label="`Toggle favorite for ${teacher.name}`"
                  :title="favorites.includes(teacher.id) ? 'Remove from favorites' : 'Add to favorites'"
                >
                  ★
                </button>
              </div>
            </div>

            <!-- Body Content -->
            <div :class="`mt-5 grid gap-5 ${cardBodyGridClass}`">
              <!-- Left Column: Photo & Video Preview Button -->
              <div class="flex flex-col items-center sm:items-start gap-3">
                <div
                  :class="`relative w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs group/avatar ${cardPhotoAspectClass}`"
                >
                  <img
                    :src="getTeacherModalImage(teacher)"
                    :alt="teacher.name"
                    class="h-full w-full object-cover object-top transition duration-500 group-hover/avatar:scale-105"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-70" />
                  <button
                    type="button"
                    @click="activeVideoTeacher = teacher"
                    class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-2 rounded-lg bg-slate-900/90 backdrop-blur-xs px-3 py-2 text-[11px] font-semibold text-white shadow-md transition hover:bg-red-600"
                  >
                    <svg class="h-3.5 w-3.5 fill-red-500" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Video
                  </button>
                </div>
              </div>

              <!-- Right Column: Clean Metadata Cards -->
              <div class="space-y-3">
                <!-- Major & Expertise Cards -->
                <div class="grid gap-2.5 sm:grid-cols-2">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      </svg>
                      Major
                    </div>
                    <p class="mt-0.5 text-xs font-bold text-slate-800 m-0 leading-snug">{{ getTeacherProfile(teacher).major }}</p>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expertise
                    </div>
                    <p class="mt-0.5 text-xs font-semibold text-slate-700 m-0 leading-snug">{{ getTeacherProfile(teacher).expertise }}</p>
                  </div>
                </div>

                <!-- Subjects Taught Badges -->
                <div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    <svg class="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Subjects Taught
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="(subject, idx) in getTeacherProfile(teacher).subjectsTaught.split(',')"
                      :key="idx"
                      class="inline-flex items-center rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 shadow-2xs"
                    >
                      {{ subject.trim() }}
                    </span>
                  </div>
                </div>

                <!-- Self Introduction Quote Box -->
                <div class="relative rounded-xl border border-slate-200/70 bg-gradient-to-r from-slate-50 to-white p-3 pl-3.5">
                  <div class="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-slate-900" />
                  <p class="m-0 text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Self Introduction
                  </p>
                  <p class="m-0 text-xs leading-relaxed text-slate-700 italic line-clamp-3">
                    "{{ getTeacherProfile(teacher).selfIntro }}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer CTA Bar -->
          <div class="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
            <div class="flex items-center gap-1.5 text-[11px] text-slate-500">
              <svg class="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Instant booking available</span>
            </div>
            <button
              type="button"
              @click="openTeacherProfile(teacher)"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
            >
              View schedule &amp; book
              <span class="text-xs">→</span>
            </button>
          </div>
        </article>

        <div v-if="filteredInstructors.length === 0" class="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            🔍
          </div>
          <h3 class="mt-3 text-base font-semibold text-slate-800">No teachers found</h3>
          <p class="mt-1 text-xs text-slate-500">
            Try adjusting your search terms or resetting filters.
          </p>
          <button
            type="button"
            @click="resetFilters"
            class="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      </section>
    </div>

    <!-- Floating Bottom Grid Layout Switcher -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-white shadow-2xl backdrop-blur-md transition-all">
      <span class="text-xs font-semibold text-slate-300">View Grid:</span>
      <div class="flex items-center gap-1">
        <button
          v-for="item in GRID_LAYOUT_OPTIONS"
          :key="item.cols"
          type="button"
          @click="cardColumns = item.cols"
          :class="`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            cardColumns === item.cols ? 'bg-white text-slate-900 shadow-md scale-105' : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
          }`"
        >
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Video Lightbox Modal -->
    <div
      v-if="activeVideoTeacher"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4"
      @click="activeVideoTeacher = null"
    >
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-800"
        @click.stop
      >
        <div class="flex items-center justify-between bg-slate-900 px-4 py-3 text-white border-b border-slate-800">
          <div class="flex items-center gap-2">
            <h3 class="m-0 text-sm font-semibold">{{ activeVideoTeacher.name }} — Video Intro</h3>
          </div>
          <button
            type="button"
            @click="activeVideoTeacher = null"
            class="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Close ✕
          </button>
        </div>
        <div class="aspect-video w-full">
          <iframe
            class="h-full w-full"
            :src="`${TEACHER_INTRO_VIDEO}?autoplay=1`"
            :title="`${activeVideoTeacher.name} introduction video`"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
      </div>
    </div>

    <div
      v-if="bookingNotice"
      :class="`fixed inset-x-0 top-4 z-[60] mx-auto w-full max-w-md rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl sm:top-6 ${
        bookingNotice.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'
      }`"
      role="status"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="m-0">{{ bookingNotice.message }}</p>
        <button
          type="button"
          @click="bookingNotice = null"
          class="rounded-md px-1.5 text-xs font-bold opacity-70 transition hover:opacity-100"
          aria-label="Dismiss notice"
        >
          ×
        </button>
      </div>
    </div>

    <div
      v-if="profileTeacher"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/55 p-4 pt-8"
      @click="closeTeacherProfile"
    >
      <div
        class="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <h2 class="m-0 text-base font-semibold text-slate-900">{{ profileTeacher.name }}</h2>
          <button
            @click="closeTeacherProfile"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div class="flex flex-col items-center gap-3 border-b border-slate-200 p-4 text-center sm:flex-row sm:items-center sm:text-left sm:p-5">
          <img
            :src="getTeacherPhoto(profileTeacher)"
            :alt="profileTeacher.name"
            class="h-24 w-24 flex-none rounded-full object-cover shadow"
          />
          <div>
            <p class="m-0 text-lg font-semibold text-slate-900">{{ profileTeacher.name }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ profileTeacher.specialty }}</p>
            <p class="mt-1 text-sm font-semibold text-primary-dark">
              30 min: {{ pointsForDuration(profileTeacher, 30) }} pts · 1 hour:
              {{ pointsForDuration(profileTeacher, 60) }} pts
            </p>
          </div>
        </div>

        <div class="p-4 sm:p-5">
          <div class="rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm sm:p-4">
            <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-2">
                <CalendarViewToggle :value="calendarViewMode" @change="calendarViewMode = $event" />
                <DurationToggle
                  :value="bookingDuration"
                  @change="bookingDuration = $event"
                  :teacher="profileTeacher"
                  size="sm"
                />
                <div class="relative">
                  <select
                    v-model="bookingSubject"
                    class="appearance-none rounded-full border border-slate-200 bg-slate-100 py-1.5 pl-3 pr-8 text-[11px] font-semibold text-slate-700 outline-none transition hover:bg-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option v-for="opt in getTeacherSubjectOptions(profileTeacher)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <svg class="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-700 sm:text-sm">
                  {{ headerLabel }}
                </span>
                <div class="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    @click="goPrev"
                    :disabled="prevDisabled"
                    aria-label="Previous"
                    class="rounded-full px-2 py-1 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    @click="goToday"
                    class="rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-800 transition hover:bg-white"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    @click="goNext"
                    :disabled="nextDisabled"
                    aria-label="Next"
                    class="rounded-full px-2 py-1 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <div :style="{ minWidth: (calendarViewMode === 'week' ? 640 : 260) + 'px' }">
                <div
                  class="grid border-b border-slate-200 bg-slate-50"
                  :style="{ gridTemplateColumns: `76px repeat(${columns.length}, 1fr)` }"
                >
                  <div class="border-r border-slate-200 bg-slate-50" />
                  <div
                    v-for="(day, colIdx) in columns"
                    :key="day.key"
                    class="border-r border-slate-200 bg-slate-50 px-1 py-2 text-center last:border-r-0"
                  >
                    <div class="text-[10px] uppercase tracking-wide text-slate-500">
                      {{ day.day.slice(0, 3) }}
                    </div>
                    <div
                      :class="`mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        dayIndexForColumn(colIdx) === 0 ? 'bg-primary text-white' : 'text-slate-800'
                      }`"
                    >
                      {{ day.label.slice(3) }}
                    </div>
                  </div>
                </div>

                <div class="max-h-[420px] overflow-y-auto">
                  <div
                    class="grid"
                    :style="{ gridTemplateColumns: `76px repeat(${columns.length}, 1fr)` }"
                  >
                    <div class="relative border-r border-slate-200 bg-slate-50/50">
                      <div
                        v-for="(slot, i) in BOOKING_TIME_SLOTS"
                        :key="slot"
                        class="absolute right-2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-slate-500"
                        :style="{ top: i * CALENDAR_ROW_HEIGHT + 'px' }"
                      >
                        {{ formatSlotTo12Hour(slot) }}
                      </div>
                      <div :style="{ height: BOOKING_TIME_SLOTS.length * CALENDAR_ROW_HEIGHT + 'px' }" />
                    </div>

                    <div
                      v-for="(day, colIdx) in columns"
                      :key="day.key"
                      class="relative border-r border-slate-200 last:border-r-0"
                      :style="{ height: BOOKING_TIME_SLOTS.length * CALENDAR_ROW_HEIGHT + 'px' }"
                      @mouseleave="hoveredBookingCell = null"
                    >
                      <div
                        v-for="(slot, i) in BOOKING_TIME_SLOTS"
                        :key="`grid-${slot}`"
                        :class="`absolute left-0 right-0 border-t ${i % 2 === 0 ? 'border-slate-200' : 'border-slate-100'}`"
                        :style="{ top: i * CALENDAR_ROW_HEIGHT + 'px' }"
                      />

                      <!-- Reserved blocks removed as per request -->

                      <template v-for="(slot, i) in BOOKING_TIME_SLOTS" :key="`open-wrap-${slot}`">
                        <button
                          v-if="!isPendingSlot(profileTeacher.id, dayIndexForColumn(colIdx), i) && getDisplaySlotStatus(profileTeacher.id, dayIndexForColumn(colIdx), i) === 'Available'"
                          type="button"
                          :title="`Stage ${bookingDuration === 60 ? '1 hour' : '30 min'} starting ${formatSlotTo12Hour(slot)}`"
                          @mouseenter="hoveredBookingCell = { dayIndex: dayIndexForColumn(colIdx), slotIndex: i }"
                          @click="handleBookingSlotClick(profileTeacher, dayIndexForColumn(colIdx), i)"
                          class="absolute left-0.5 right-0.5 flex items-center justify-start overflow-hidden rounded-md border-l-2 border-emerald-500 bg-emerald-50 px-1.5 py-0.5 text-left text-[10px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          :style="{ top: (i * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (CALENDAR_ROW_HEIGHT - 2) + 'px' }"
                        >
                          <span>Open</span>
                        </button>
                      </template>

                      <div
                        v-if="hoveredBookingCell && hoveredBookingCell.dayIndex === dayIndexForColumn(colIdx) && getDisplaySlotStatus(profileTeacher.id, dayIndexForColumn(colIdx), hoveredBookingCell.slotIndex) === 'Available'"
                        class="pointer-events-none absolute left-0.5 right-0.5 rounded-md border-2 border-dashed border-amber-400 bg-amber-500/10"
                        :style="{
                          top: (hoveredBookingCell.slotIndex * CALENDAR_ROW_HEIGHT + 1) + 'px',
                          height: ((bookingDuration === 60 ? 2 : 1) * CALENDAR_ROW_HEIGHT - 2) + 'px'
                        }"
                      />

                      <div
                        v-for="block in computeCalendarBlocks(profileTeacher.id, dayIndexForColumn(colIdx), BOOKING_TIME_SLOTS, getDisplaySlotStatus)"
                        :key="`sel-${block.startIndex}`"
                        class="absolute left-0.5 right-0.5 overflow-hidden rounded-md border-l-2 border-sky-500 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-sky-900"
                        :style="{ top: (block.startIndex * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (block.span * CALENDAR_ROW_HEIGHT - 2) + 'px' }"
                      >
                        <div>Your lesson</div>
                        <div class="font-normal opacity-80">
                          {{ formatSlotTo12Hour(BOOKING_TIME_SLOTS[block.startIndex]) }} – {{ formatSlotTo12Hour(addMinutesToSlotLabel(BOOKING_TIME_SLOTS, block.startIndex, block.span * 30)) }}
                        </div>
                      </div>

                      <button
                        v-if="pendingBooking && pendingBooking.teacherId === profileTeacher.id && pendingBooking.dayIndex === dayIndexForColumn(colIdx)"
                        type="button"
                        @click="handleBookingSlotClick(profileTeacher, dayIndexForColumn(colIdx), pendingBooking.slotIndex)"
                        title="Tap to remove this selection"
                        class="absolute left-0.5 right-0.5 animate-breathe overflow-hidden rounded-md border-l-2 border-amber-400 px-1.5 py-0.5 text-left text-[10px] font-semibold text-amber-900 hover:border-amber-600 motion-reduce:animate-none motion-reduce:bg-amber-50"
                        :style="{ top: (pendingBooking.slotIndex * CALENDAR_ROW_HEIGHT + 1) + 'px', height: (pendingBooking.span * CALENDAR_ROW_HEIGHT - 2) + 'px' }"
                      >
                        <div>Pending — tap to remove</div>
                        <div class="font-normal opacity-80">
                          {{ formatSlotTo12Hour(BOOKING_TIME_SLOTS[pendingBooking.slotIndex]) }} –
                          {{ formatSlotTo12Hour(addMinutesToSlotLabel(BOOKING_TIME_SLOTS, pendingBooking.slotIndex, pendingBooking.minutes)) }}
                        </div>
                      </button>

                      <div
                        v-if="dayIndexForColumn(colIdx) === 0 && getNowLineTop() !== null"
                        class="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                        :style="{ top: getNowLineTop() + 'px' }"
                      >
                        <div class="-ml-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <div class="h-px flex-1 bg-rose-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="pendingBooking && pendingBooking.teacherId === profileTeacher.id"
              class="mt-3 flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="m-0">
                <span class="font-semibold">Selected:</span>
                {{ BOOKING_DAYS[pendingBooking.dayIndex].day }}
                {{ BOOKING_DAYS[pendingBooking.dayIndex].label }},
                {{ formatSlotTo12Hour(BOOKING_TIME_SLOTS[pendingBooking.slotIndex]) }} –
                {{ formatSlotTo12Hour(addMinutesToSlotLabel(BOOKING_TIME_SLOTS, pendingBooking.slotIndex, pendingBooking.minutes)) }}
                ({{ pointsForDuration(profileTeacher, pendingBooking.minutes) }} pts)
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="cancelPendingBooking"
                  class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="goToBookingConfirmation"
                  class="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </div>

            <!-- Legend removed as per request -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile chip strip: scrollable without a visible scrollbar, and faded on the
   right so it reads as "more to the side" rather than cut off. */
.chip-strip {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding-left: 1.25rem;
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
}
.chip-strip::-webkit-scrollbar { display: none; }

@media (min-width: 640px) {
  .chip-strip {
    -webkit-mask-image: none;
    mask-image: none;
  }
}
</style>
