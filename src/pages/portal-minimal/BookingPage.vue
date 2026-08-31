<script setup>
import { ref, computed, watch } from "vue";
import DurationToggle from "../student-view-v4/DurationToggle.vue";
import CalendarViewToggle from "../student-view-v4/CalendarViewToggle.vue";
import BookingConfirmationPage from "../student-view-v4/BookingConfirmationPage.vue";
import DateTimeFilterPopover from "../student-view-v4/DateTimeFilterPopover.vue";
import TeacherDataModal from "../../components/TeacherDataModal.vue";
import SubjectFilterBar from "../student-view-v4/SubjectFilterBar.vue";
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
} from "../student-view-v4/constants";

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
const tempSubjectFilter = ref("ALL");

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
  tempSubjectFilter.value = "ALL";
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
};

const closeTeacherProfile = () => {
  profileTeacher.value = null;
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
      message: `Selected duration (${bookingDuration.value}m) extends beyond teacher hours.`,
    };
    return;
  }

  for (let offset = 0; offset < span; offset++) {
    const status = getDisplaySlotStatus(teacher.id, dayIndex, slotIndex + offset);
    if (status !== "Available") {
      bookingNotice.value = {
        type: "error",
        message: "One or more slots in this time range are unavailable.",
      };
      return;
    }
  }

  pendingBooking.value = {
    teacherId: teacher.id,
    teacher,
    dayIndex,
    slotIndex,
    span,
    minutes: bookingDuration.value,
  };
};

const openDateTimePopover = () => {
  tempSelectedDayKey.value = selectedDayKey.value;
  tempSelectedTime.value = selectedTime.value;
  tempFilterDuration.value = filterDuration.value;
  tempSubjectFilter.value = subjectFilter.value;
  isPopoverOpen.value = true;
};

const confirmDateTimeFilters = () => {
  selectedDayKey.value = tempSelectedDayKey.value;
  selectedTime.value = tempSelectedTime.value;
  filterDuration.value = tempFilterDuration.value;
  subjectFilter.value = tempSubjectFilter.value;
  isPopoverOpen.value = false;
};

const clearDateTimeFilters = () => {
  selectedDayKey.value = "";
  selectedTime.value = "";
  filterDuration.value = 30;
  tempSelectedDayKey.value = "";
  tempSelectedTime.value = "";
  tempFilterDuration.value = 30;
  isPopoverOpen.value = false;
};

const openConfirmationForPending = () => {
  if (!pendingBooking.value) return;
  const current = pendingBooking.value;
  const subjectOptions = getTeacherSubjectOptions(current.teacher);

  confirmationDraft.value = {
    teacher: current.teacher,
    dayIndex: current.dayIndex,
    slotIndex: current.slotIndex,
    minutes: current.minutes,
    span: current.span,
  };
  confirmSubject.value = subjectOptions[0]?.value ?? "GENERAL";
  confirmMessage.value = "";
};

const cancelBookingConfirmation = () => {
  confirmationDraft.value = null;
  confirmSubject.value = "";
  confirmMessage.value = "";
};

const finalizeBooking = () => {
  if (!confirmationDraft.value) return;
  const draft = confirmationDraft.value;
  const nextOverrides = { ...slotOverrides.value };

  for (let offset = 0; offset < draft.span; offset++) {
    const key = slotKey(draft.teacher.id, draft.dayIndex, draft.slotIndex + offset);
    nextOverrides[key] = "Reserved_You";
  }

  slotOverrides.value = nextOverrides;
  pendingBooking.value = null;

  const dayLabel = BOOKING_DAYS[draft.dayIndex]?.label ?? "";
  const startSlot = BOOKING_TIME_SLOTS[draft.slotIndex] ?? "";
  bookingNotice.value = {
    type: "success",
    message: `Class booked with ${draft.teacher.name} on ${dayLabel} at ${formatSlotTo12Hour(startSlot)} (${draft.minutes}m).`,
  };

  confirmationDraft.value = null;
  confirmSubject.value = "";
  confirmMessage.value = "";
};

const draftTeacher = computed(() => confirmationDraft.value?.teacher ?? null);
const draftDayLabel = computed(() => {
  if (!confirmationDraft.value) return "";
  return BOOKING_DAYS[confirmationDraft.value.dayIndex]?.label ?? "";
});
const draftStartLabel = computed(() => {
  if (!confirmationDraft.value) return "";
  return formatSlotTo12Hour(BOOKING_TIME_SLOTS[confirmationDraft.value.slotIndex] ?? "");
});
const draftEndLabel = computed(() => {
  if (!confirmationDraft.value) return "";
  const start = BOOKING_TIME_SLOTS[confirmationDraft.value.slotIndex] ?? "";
  return addMinutesToSlotLabel(start, confirmationDraft.value.minutes);
});
const draftPoints = computed(() => {
  if (!confirmationDraft.value) return 0;
  return pointsForDuration(confirmationDraft.value.teacher, confirmationDraft.value.minutes);
});
const draftSubjectOptions = computed(() => {
  if (!confirmationDraft.value) return [];
  return getTeacherSubjectOptions(confirmationDraft.value.teacher);
});
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

  <div v-else class="min-h-screen bg-[#fafafa] px-3.5 sm:px-6 py-4 sm:py-6 pb-28 text-zinc-800">
    <div class="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      
      <!-- Notice Alert -->
      <div
        v-if="bookingNotice"
        class="rounded-xl p-3.5 text-xs font-semibold flex items-center justify-between border"
        :class="bookingNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'"
      >
        <span>{{ bookingNotice.message }}</span>
        <button @click="bookingNotice = null" class="font-bold p-1">✕</button>
      </div>

      <!-- Top Search & Filter Bar (Mobile-friendly flex wrapping) -->
      <header class="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div class="relative flex-1">
            <svg
              class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              v-model="search"
              placeholder="Search by teacher name, specialty, or subjects…"
              class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
            />
            <button
              v-if="search"
              type="button"
              @click="search = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold"
            >
              ✕
            </button>
          </div>

          <div class="relative flex items-center gap-2">
            <button
              type="button"
              @click="openDateTimePopover"
              :class="`flex-1 sm:flex-initial flex h-10 items-center justify-center gap-2 rounded-xl border px-3 sm:px-4 text-xs font-semibold transition active:scale-95 whitespace-nowrap ${
                selectedDayKey || selectedTime
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-zinc-50 hover:bg-white text-zinc-700'
              }`"
            >
              <span>📅</span>
              <span v-if="selectedDayKey || selectedTime">
                {{ BOOKING_DAYS.find((d) => d.key === selectedDayKey)?.label || 'Date' }} {{ selectedTime ? formatSlotTo12Hour(selectedTime) : '' }}
              </span>
              <span v-else>Date & Time Filter</span>
            </button>

            <button
              v-if="search || subjectFilter !== 'ALL' || favoritesOnly || selectedDayKey || selectedTime"
              @click="resetFilters"
              class="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs text-zinc-500 font-semibold"
              title="Reset all filters"
            >
              Reset
            </button>

            <DateTimeFilterPopover
              :is-open="isPopoverOpen"
              @close="isPopoverOpen = false"
              v-model:temp-day="tempSelectedDayKey"
              v-model:temp-time="tempSelectedTime"
              v-model:temp-duration="tempFilterDuration"
              v-model:temp-subject="tempSubjectFilter"
              @clear="clearDateTimeFilters"
              @confirm="confirmDateTimeFilters"
            />
          </div>
        </div>

        <!-- Subject & Category Filter + Favorites -->
        <div class="mt-3.5 pt-3 border-t border-zinc-100">
          <SubjectFilterBar
            v-model="subjectFilter"
            v-model:favorites-only="favoritesOnly"
            :favorites-count="favorites.length"
          />
        </div>
      </header>

      <!-- Instructors List -->
      <section class="space-y-4">
        <article
          v-for="teacher in filteredInstructors"
          :key="teacher.id"
          class="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs hover:border-zinc-300 transition"
        >
          <!-- Teacher header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3.5 border-b border-zinc-100">
            <div class="flex items-start gap-3">
              <img
                :src="getTeacherPhoto(teacher)"
                :alt="teacher.name"
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-zinc-200 cursor-pointer shrink-0"
                @click="openTeacherProfile(teacher)"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3
                    @click="openTeacherProfile(teacher)"
                    class="text-sm sm:text-base font-bold text-zinc-900 hover:text-zinc-600 cursor-pointer truncate"
                  >
                    {{ teacher.name }}
                  </h3>
                  <span class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                  </span>
                </div>
                <p class="text-[11px] sm:text-xs text-zinc-400 font-medium mt-0.5 truncate">{{ teacher.major }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-amber-600 font-bold">★ 4.95</span>
                  <span class="text-zinc-300">•</span>
                  <span class="text-xs text-zinc-500 font-medium">30m: <strong>{{ pointsForDuration(teacher, 30) }} pts</strong></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 self-stretch sm:self-center justify-end pt-1 sm:pt-0">
              <button
                type="button"
                @click="toggleFavorite(teacher.id)"
                class="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 text-xs transition active:scale-95 text-center font-medium"
                title="Toggle favorite"
              >
                {{ favorites.includes(teacher.id) ? '★ Saved' : '☆ Save' }}
              </button>
              <button
                type="button"
                @click="openTeacherProfile(teacher)"
                class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs transition active:scale-95 text-center"
              >
                Profile & Schedule
              </button>
            </div>
          </div>

          <!-- Schedule Quick Grid / Slots (Horizontally touch scrollable on mobile) -->
          <div class="mt-3.5 pt-1">
            <div class="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span class="text-[11px] sm:text-xs">Select a slot to book:</span>
              <div class="flex items-center gap-2 text-[10px] text-zinc-400">
                <span class="inline-block w-2 h-2 rounded-xs bg-emerald-50 border border-emerald-400"></span> Open
                <span class="inline-block w-2 h-2 rounded-xs bg-zinc-200"></span> Booked
              </div>
            </div>

            <!-- Responsive slots strip -->
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <div
                v-for="(day, dayIdx) in BOOKING_DAYS.slice(0, 7)"
                :key="day.key"
                class="rounded-xl border border-zinc-100 bg-zinc-50/70 p-2 text-center shrink-0 min-w-[85px] sm:min-w-0"
              >
                <div class="text-[11px] font-bold text-zinc-800">{{ day.day }}</div>
                <div class="text-[10px] text-zinc-400">{{ day.date }}</div>
                <div class="mt-2 space-y-1">
                  <button
                    v-for="timeSlot in ['09:00', '11:00', '15:00', '19:00']"
                    :key="timeSlot"
                    @click="handleBookingSlotClick(teacher, dayIdx, BOOKING_TIME_SLOTS.indexOf(timeSlot))"
                    :disabled="getDisplaySlotStatus(teacher.id, dayIdx, BOOKING_TIME_SLOTS.indexOf(timeSlot)) !== 'Available'"
                    :class="`w-full py-1 rounded text-[10px] font-bold transition active:scale-95 ${
                      isPendingSlot(teacher.id, dayIdx, BOOKING_TIME_SLOTS.indexOf(timeSlot))
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : getDisplaySlotStatus(teacher.id, dayIdx, BOOKING_TIME_SLOTS.indexOf(timeSlot)) === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 cursor-pointer'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-60'
                    }`"
                  >
                    {{ timeSlot }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div v-if="!filteredInstructors.length" class="p-10 text-center bg-white rounded-2xl border border-zinc-200/80">
          <p class="text-sm font-semibold text-zinc-700">No instructors match your current filter.</p>
          <button @click="resetFilters" class="mt-3 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold">
            Reset Filters
          </button>
        </div>
      </section>

      <!-- Bottom Floating Pending Booking Bar (Positioned above mobile bottom nav: bottom-20 on mobile, bottom-6 on lg) -->
      <div
        v-if="pendingBooking"
        class="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg bg-zinc-900 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-3"
      >
        <div class="text-xs">
          <div class="font-bold text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            {{ pendingBooking.teacher.name }}
          </div>
          <p class="text-[11px] text-zinc-300 mt-0.5">
            {{ BOOKING_DAYS[pendingBooking.dayIndex]?.label }} • {{ formatSlotTo12Hour(BOOKING_TIME_SLOTS[pendingBooking.slotIndex]) }} ({{ pendingBooking.minutes }}m)
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="pendingBooking = null"
            class="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition active:scale-95"
          >
            Cancel
          </button>
          <button
            @click="openConfirmationForPending"
            class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95 whitespace-nowrap shadow-sm"
          >
            Confirm →
          </button>
        </div>
      </div>

    </div>

    <!-- Teacher Profile Modal -->
    <TeacherDataModal
      :teacher="profileTeacher"
      @close="closeTeacherProfile"
      @book="closeTeacherProfile"
    />
  </div>
</template>
