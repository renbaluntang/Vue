<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import DurationToggle from "../student-view-v4/DurationToggle.vue";
import CalendarViewToggle from "../student-view-v4/CalendarViewToggle.vue";
import BookingConfirmationPage from "../student-view-v4/BookingConfirmationPage.vue";
import FreeConversationModal from "../../components/FreeConversationModal.vue";
import TeacherIntroVideo from "../../components/TeacherIntroVideo.vue";
import { REFERRAL_TERMS } from "../../lib/referral";
import DateTimeFilterPopover from "../student-view-v4/DateTimeFilterPopover.vue";
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
  INTRO_VIDEO_ID,
  DEMO_VIDEO_ID,
  getTeacherProfile,
  getTeacherSubjectOptions,
  parseSubjectCodes,
  getSubjectBadgeStyle,
  getSubjectCategory,
  getSlotStatus,
  DURATIONS,
  pointsForDuration,
  CALENDAR_ROW_HEIGHT,
  computeCalendarBlocks,
  getInitialFavorites,
} from "../student-view-v4/constants";

const favorites = ref(getInitialFavorites());
const showFreeConversationModal = ref(false);
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
// Which clip is open, and whose. The card offers two now and they are
// different content, so the teacher alone no longer identifies the video.
const activeVideo = ref(null); // { teacher, kind: 'intro' | 'demo' }
const openVideo = (teacher, kind) => { activeVideo.value = { teacher, kind }; };
const closeVideo = () => { activeVideo.value = null; };

const promoRail = ref(null);
const promoIndex = ref(0);
const promoLabels = ['Talk Now', 'Refer a Friend'];

/** Which card the rail has settled on, read off the scroll position. */
const syncPromoIndex = () => {
  const el = promoRail.value;
  if (!el || !el.firstElementChild) return;
  const step = el.firstElementChild.getBoundingClientRect().width + 12;
  promoIndex.value = Math.max(0, Math.min(promoLabels.length - 1, Math.round(el.scrollLeft / step)));
};

const goToPromo = (i) => {
  const el = promoRail.value;
  if (!el || !el.children[i]) return;
  // Centre the card rather than left-align it: the rail's side padding is half
  // the leftover width, so a card's snap point sits in the middle of the view.
  const card = el.children[i];
  el.scrollTo({ left: card.offsetLeft - el.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: 'smooth' });
};

/**
 * The rail moves on by itself, because the second card is otherwise only found
 * by people who think to swipe. It stops the moment a pointer or the keyboard
 * is on it, and never runs for anyone who has asked for less motion or is past
 * the breakpoint where both cards are already side by side.
 */
const promoPaused = ref(false);
let promoTimer = null;

const stopPromoAuto = () => {
  if (promoTimer) clearInterval(promoTimer);
  promoTimer = null;
};

const startPromoAuto = () => {
  stopPromoAuto();
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  promoTimer = setInterval(() => {
    const el = promoRail.value;
    if (promoPaused.value || !el) return;
    if (el.scrollWidth <= el.clientWidth + 2) return;
    goToPromo((promoIndex.value + 1) % promoLabels.length);
  }, 6000);
};

onMounted(startPromoAuto);
onBeforeUnmount(stopPromoAuto);

const videoTabs = [
  { kind: 'intro', icon: '▶', label: (t) => `Get to know ${t.name.split(' ')[0]}` },
  { kind: 'demo', icon: '🎬', label: (t) => `See ${t.name.split(' ')[0]} teach` },
];

/** The same subject names the card shows, read off the same field. */
const videoSubjects = (teacher) => {
  const names = parseSubjectCodes(teacher.specialty)
    .map((code) => (SUBJECT_LABELS[code] || code).replace(/^\[[^\]]+\]\s*/, ''));
  if (!names.length) return 'English';
  if (names.length <= 2) return names.join(' and ');
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
};

/** Straight from watching to picking a time, without going back to the card. */
const bookFromVideo = () => {
  const teacher = activeVideo.value?.teacher;
  closeVideo();
  if (teacher) openTeacherProfile(teacher);
};

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

// Teacher card friendly presentation helpers
const getCleanSubjectName = (code) => {
  const label = SUBJECT_LABELS[code] || code;
  return label.replace(/^\[[A-Z0-9]+\]\s*/i, "").trim();
};

const getSubjectCategoryBadge = (code) => {
  const cat = getSubjectCategory(code);
  if (!cat) return { name: "General", icon: "📚", badgeBg: "bg-slate-100 text-slate-700" };
  if (cat.id === "conversation") {
    return { name: "Conversation", icon: "💬", badgeBg: "bg-sky-100/90 text-sky-800" };
  }
  if (cat.id === "pronunciation") {
    return { name: "Pronunciation", icon: "🗣️", badgeBg: "bg-amber-100/90 text-amber-900" };
  }
  if (cat.id === "specialized") {
    return { name: "Specialized", icon: "🎯", badgeBg: "bg-purple-100/90 text-purple-900" };
  }
  return { name: "General", icon: "📚", badgeBg: "bg-slate-100 text-slate-700" };
};

const getCleanExpertise = (teacher) => {
  const raw = getTeacherProfile(teacher).expertise || "";
  // Strip code prefixes like [SF], [LS1], etc. so it's readable
  return raw.replace(/\[[A-Z0-9]+\]\s*/gi, "").trim();
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

// --- Grid layout (single column; the runtime switcher was removed) ---
const containerMaxWidthClass = "max-w-[1240px]";
const sectionColsClass = "grid-cols-1";
const cardBodyGridClass = "md:grid-cols-[200px,1fr]";
const cardPhotoAspectClass = "max-w-[200px] aspect-square";
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

  <div v-else class="min-h-screen bg-[#f1f5f9] px-3 py-6 pb-10 text-slate-800 sm:px-6">
    <div :class="`mx-auto space-y-6 transition-all duration-300 ${containerMaxWidthClass}`">
      <!-- Two ways in: start something now, or bring someone with you.
           Stacked, these two cost a whole phone screen before the teachers —
           the thing the page is for — come into view, so on small screens they
           share one swipeable rail and the grid returns at lg. -->
      <div
        ref="promoRail"
        @scroll.passive="syncPromoIndex"
        @pointerenter="promoPaused = true"
        @pointerleave="promoPaused = false"
        @focusin="promoPaused = true"
        @focusout="promoPaused = false"
        class="promo-rail -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[7%] pb-1 sm:-mx-6 sm:px-[15%] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        <!-- Instant option — the alternative to picking a slot below -->
        <section class="relative flex w-full shrink-0 snap-center flex-col overflow-hidden rounded-2xl lg:w-auto lg:shrink border border-white/10 p-5 text-white sm:p-6 shadow-xl shadow-black/20 bg-[radial-gradient(120%_140%_at_90%_10%,rgba(255,205,0,0.18)_0%,rgba(255,205,0,0.04)_40%,transparent_70%),radial-gradient(70%_90%_at_0%_100%,rgba(51,65,85,0.25)_0%,transparent_60%),linear-gradient(135deg,#131722_0%,#1a202c_48%,#0b0e14_100%)]">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div class="relative z-10 flex flex-1 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex items-start gap-3.5">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.08] text-xl shadow-inner">⚡</span>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-base font-extrabold tracking-tight sm:text-lg">Talk Now</h2>
                  <span class="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                    Instant
                  </span>
                </div>
                <p class="mt-0.5 text-xs font-medium text-slate-300 sm:text-sm">
                  Start a 25-minute lesson right now — teacher assigned automatically, 5 pts.
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="showFreeConversationModal = true"
              class="w-full shrink-0 rounded-2xl bg-brighture-gold px-6 py-3 text-sm font-bold text-brighture-ink shadow-md transition-all hover:bg-brighture-gold-deep hover:shadow-lg active:scale-95 xl:w-auto"
            >
              Start now
            </button>
          </div>
        </section>

        <!-- Referral — same construction, violet accent instead of gold -->
        <section class="relative flex w-full shrink-0 snap-center flex-col overflow-hidden rounded-2xl lg:w-auto lg:shrink border border-white/10 p-5 text-white sm:p-6 shadow-xl shadow-black/20 bg-[radial-gradient(120%_140%_at_90%_10%,rgba(139,92,246,0.24)_0%,rgba(139,92,246,0.06)_40%,transparent_70%),radial-gradient(70%_90%_at_0%_100%,rgba(51,65,85,0.25)_0%,transparent_60%),linear-gradient(135deg,#131722_0%,#1a202c_48%,#0b0e14_100%)]">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div class="relative z-10 flex flex-1 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex items-start gap-3.5">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.08] text-xl shadow-inner">
                <i class="fa-solid fa-user-plus text-base text-violet-300"></i>
              </span>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-base font-extrabold tracking-tight sm:text-lg">Refer a Friend</h2>
                  <span class="rounded-full bg-violet-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                    Both win
                  </span>
                </div>
                <p class="mt-0.5 text-xs font-medium text-slate-300 sm:text-sm">
                  {{ REFERRAL_TERMS.friendDiscountLabel }} USD off their plan — {{ REFERRAL_TERMS.referrerPoints }} pts for you once they buy.
                </p>
              </div>
            </div>
            <RouterLink
              to="/refer"
              class="w-full shrink-0 rounded-2xl bg-violet-500 px-6 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-violet-400 hover:shadow-lg active:scale-95 xl:w-auto"
            >
              Get my link
            </RouterLink>
          </div>
        </section>
      </div>

      <!-- Which card you are on, and a way to step between them without
           swiping. Hidden once both are side by side. -->
      <div class="-mt-1 flex items-center justify-center gap-2 lg:hidden">
        <button
          v-for="(label, i) in promoLabels"
          :key="label"
          type="button"
          :aria-label="`Show ${label}`"
          :aria-current="promoIndex === i ? 'true' : 'false'"
          @click="goToPromo(i); startPromoAuto()"
          class="h-1.5 cursor-pointer rounded-full transition-all duration-200"
          :class="promoIndex === i ? 'w-6 bg-slate-800' : 'w-1.5 bg-slate-300 hover:bg-slate-400'"
        ></button>
      </div>

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

          <!-- Popover trigger button (Mobile + Tablet + Desktop friendly) -->
          <div class="relative">
            <button
              type="button"
              @click="openDateTimePopover"
              :class="`flex h-[46px] items-center gap-2 rounded-2xl border px-3 sm:px-5 text-xs sm:text-sm font-semibold transition ${
                selectedDayKey || selectedTime
                  ? 'border-brighture-gold bg-brighture-cream text-brighture-ink'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-700'
              }`"
            >
              <svg class="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span v-if="selectedDayKey || selectedTime" class="truncate max-w-[120px] sm:max-w-none">
                <template v-if="selectedDayKey">{{ BOOKING_DAYS.find((d) => d.key === selectedDayKey)?.label }}</template>
                <template v-if="selectedDayKey && selectedTime">, </template>
                <template v-if="selectedTime">{{ formatSlotTo12Hour(selectedTime) }}</template>
              </span>
              <span v-else>
                <span class="hidden sm:inline">Search by Date &amp; Time</span>
                <span class="inline sm:hidden">Date/Time</span>
              </span>
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
          class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-amber-400/80 hover:shadow-xl hover:shadow-slate-200/50"
        >
          <div>
            <!-- Header Row: Instructor Name, Lesson Stats, Rates & Favorite Button -->
            <div class="flex flex-col gap-3 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <h3
                  @click="openTeacherProfile(teacher)"
                  class="m-0 text-xl font-extrabold tracking-tight text-slate-900 cursor-pointer hover:text-amber-600 transition flex items-center gap-2"
                  title="Click to view full schedule & profile"
                >
                  <span>{{ teacher.name }}</span>
                </h3>

                <!-- Experience Tag -->
                <div class="inline-flex items-center rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs">
                  <span class="text-slate-500 font-medium">
                    {{ (teacher.lessonCount || 850).toLocaleString() }}+ lessons taught
                  </span>
                </div>
              </div>

              <!-- Rates & Action Pill -->
              <div class="flex items-center justify-between sm:justify-end gap-2.5">
                <div class="inline-flex items-center gap-2 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/70 to-orange-50/50 px-3 py-1.5 text-xs shadow-2xs">
                  <span class="text-amber-800/80 font-bold uppercase tracking-wider text-[10px]">Lesson Cost:</span>
                  <span class="font-extrabold text-slate-800">
                    30 min <span class="text-amber-700">({{ pointsForDuration(teacher, 30) }} pts)</span>
                  </span>
                  <span class="text-amber-300 font-bold">/</span>
                  <span class="font-extrabold text-slate-800">
                    60 min <span class="text-amber-700">({{ pointsForDuration(teacher, 60) }} pts)</span>
                  </span>
                </div>

                <button
                  type="button"
                  @click="toggleFavorite(teacher.id)"
                  :class="`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all cursor-pointer ${
                    favorites.includes(teacher.id)
                      ? 'border-amber-300 bg-amber-50 text-amber-500 shadow-xs hover:bg-amber-100 scale-105'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50/40'
                  }`"
                  :aria-label="`Toggle favorite for ${teacher.name}`"
                  :title="favorites.includes(teacher.id) ? 'Saved as favorite teacher' : 'Save to favorite teachers'"
                >
                  ★
                </button>
              </div>
            </div>

            <!-- Body Content -->
            <div :class="`mt-5 grid gap-5 ${cardBodyGridClass}`">
              <!-- Left Column: Instructor Photo & Video Actions -->
              <div class="flex flex-col items-center sm:items-start gap-3">
                <div
                  @click="openTeacherProfile(teacher)"
                  :class="`relative w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm group/avatar cursor-pointer ${cardPhotoAspectClass}`"
                  title="Click to view teacher schedule & available slots"
                >
                  <img
                    :src="getTeacherModalImage(teacher)"
                    :alt="teacher.name"
                    class="h-full w-full object-cover object-top transition duration-500 group-hover/avatar:scale-105"
                  />
                  <!-- Only a thin footing, to seat the badge. The wash used to
                       be inset-0 and darkened the whole frame just so two lines
                       of text could sit on it. -->
                  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-950/70 to-transparent" />

                  <!-- What the photo does. Low and right: the crop is anchored
                       to the top, so this corner is shoulder, never face. -->
                  <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-xs transition group-hover/avatar:bg-slate-900">
                    <span>🗓️</span> View Schedule
                  </div>
                </div>

                <!-- Video Buttons (Distinct Icons & Clarifying Labels) -->
                <div class="flex w-full max-w-[200px] flex-col gap-2">
                  <button
                    type="button"
                    @click.stop="openVideo(teacher, 'intro')"
                    class="inline-flex w-full touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 active:scale-95 cursor-pointer"
                    title="A short video about them"
                  >
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-[10px]">▶</span>
                    <span>Get to know {{ teacher.name.split(' ')[0] }}</span>
                  </button>

                  <button
                    type="button"
                    @click.stop="openVideo(teacher, 'demo')"
                    class="inline-flex w-full touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 active:scale-95 cursor-pointer"
                    title="A few minutes of a real class"
                  >
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px]">🎬</span>
                    <span>See {{ teacher.name.split(' ')[0] }} teach</span>
                  </button>
                </div>
              </div>

              <!-- Right Column: Organized Teacher Details -->
              <div class="space-y-3.5">
                <!-- Academic Background & Teaching Focus Info Grid -->
                <div class="grid gap-2.5 sm:grid-cols-2">
                  <div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 shadow-2xs">
                    <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <svg class="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span>Academic Background</span>
                    </div>
                    <p class="mt-1 text-xs font-bold text-slate-800 m-0 leading-snug">{{ getTeacherProfile(teacher).major }}</p>
                  </div>

                  <div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 shadow-2xs">
                    <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <svg class="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Primary Specialization</span>
                    </div>
                    <p class="mt-1 text-xs font-semibold text-slate-700 m-0 leading-snug">{{ getCleanExpertise(teacher) }}</p>
                  </div>
                </div>

                <!-- Subjects Taught Badges with Clear Names & Category Pills -->
                <div class="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                      <svg class="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Subjects Taught ({{ parseSubjectCodes(teacher.specialty).length }})</span>
                    </div>
                    <span v-if="subjectFilter !== 'ALL'" class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      <span>✓</span> Filter match
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="code in parseSubjectCodes(teacher.specialty)"
                      :key="code"
                      :class="[
                        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all shadow-2xs',
                        getSubjectBadgeStyle(code, isSubjectMatchingFilter(code, subjectFilter) && subjectFilter !== 'ALL')
                      ]"
                    >
                      <!-- Subject Code Tag -->
                      <span class="rounded bg-black/10 px-1 py-0.2 text-[10px] font-mono font-black opacity-75">
                        {{ code.replace(/[\[\]]/g, '') }}
                      </span>
                      <!-- Readable Subject Title -->
                      <span>{{ getCleanSubjectName(code) }}</span>
                    </span>
                  </div>
                </div>

                <!-- Teacher Introduction Quote Box -->
                <div class="relative rounded-2xl border border-slate-200/80 bg-gradient-to-r from-amber-50/30 via-slate-50/80 to-white p-3.5 pl-4 shadow-2xs">
                  <div class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-amber-400" />
                  <p class="m-0 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <span>💬</span>
                    <span>Teacher Introduction</span>
                  </p>
                  <p class="m-0 text-xs leading-relaxed text-slate-700 italic line-clamp-3 font-normal">
                    "{{ getTeacherProfile(teacher).selfIntro }}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer CTA Bar -->
          <div class="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
            <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Available for instant booking — Choose from upcoming timetable</span>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                @click="openTeacherProfile(teacher)"
                class="flex-1 sm:flex-none inline-flex min-w-0 touch-manipulation items-center justify-center gap-2 whitespace-nowrap border border-amber-300 px-6 py-2.5 rounded-xl bg-[#FFCD00] hover:bg-[#FFD933] active:bg-amber-400 text-slate-900 font-extrabold text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>📅</span>
                <span>Select &amp; Book Class</span>
                <span>→</span>
              </button>
            </div>
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


    <!-- Video Lightbox Modal -->
    <div
      v-if="activeVideo"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4"
      @click="closeVideo"
    >
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-800"
        @click.stop
      >
        <div class="flex items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-white border-b border-slate-800">
          <!-- Both videos answer different questions about the same teacher, so
               they belong on one switch rather than behind two separate trips
               out to the card and back. -->
          <div
            role="tablist"
            :aria-label="`Videos from ${activeVideo.teacher.name}`"
            class="flex min-w-0 items-center gap-1 rounded-full bg-slate-800/80 p-1"
          >
            <button
              v-for="tab in videoTabs"
              :key="tab.kind"
              type="button"
              role="tab"
              :aria-selected="activeVideo.kind === tab.kind ? 'true' : 'false'"
              @click="activeVideo = { ...activeVideo, kind: tab.kind }"
              class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition"
              :class="activeVideo.kind === tab.kind
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white'"
            >
              <span>{{ tab.icon }}</span>
              {{ tab.label(activeVideo.teacher) }}
            </button>
          </div>

          <button
            type="button"
            @click="closeVideo"
            aria-label="Close video"
            class="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Close ✕
          </button>
        </div>

        <TeacherIntroVideo :video-id="activeVideo.kind === 'demo' ? DEMO_VIDEO_ID : INTRO_VIDEO_ID" />

        <!-- The point of watching. Booking sat two screens away, so the moment
             of "yes, them" had nowhere to go. -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-900 px-4 py-3">
          <p class="min-w-0 text-xs text-slate-400">
            {{ activeVideo.kind === 'demo'
              ? `This is what a class with ${activeVideo.teacher.name.split(' ')[0]} looks like.`
              : `${activeVideo.teacher.name.split(' ')[0]} teaches ${videoSubjects(activeVideo.teacher)}.` }}
          </p>
          <button
            type="button"
            @click="bookFromVideo"
            class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-amber-300 bg-[#FFCD00] px-5 py-2 text-xs font-extrabold text-slate-900 shadow-md transition hover:bg-[#FFD933] hover:shadow-lg active:scale-95"
          >
            <span>📅</span>
            Book a class with {{ activeVideo.teacher.name.split(' ')[0] }}
            <span>→</span>
          </button>
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
      class="fixed inset-0 z-50 flex items-end sm:items-start justify-center bg-slate-900/55 p-0 sm:p-4 sm:pt-8"
      @click="closeTeacherProfile"
    >
      <div
        class="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <!-- Modal drag handle (mobile) -->
        <div class="flex justify-center pt-3 pb-1 sm:hidden">
          <div class="h-1 w-10 rounded-full bg-slate-300"></div>
        </div>

        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <h2 class="m-0 text-base font-semibold text-slate-900 truncate pr-2">{{ profileTeacher.name }}</h2>
          <button
            @click="closeTeacherProfile"
            class="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div class="flex flex-col items-center gap-4 border-b border-slate-200 p-4 text-center sm:flex-row sm:items-center sm:text-left sm:p-5">
          <img
            :src="getTeacherPhoto(profileTeacher)"
            :alt="profileTeacher.name"
            class="h-20 w-20 sm:h-24 sm:w-24 flex-none rounded-2xl object-cover shadow-sm ring-2 ring-white outline outline-1 outline-slate-200"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <p class="m-0 text-lg sm:text-xl font-black text-slate-900">{{ profileTeacher.name }}</p>
            </div>

            <!-- Distinct subjects covered chips in modal header -->
            <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-1.5">
              <span
                v-for="code in parseSubjectCodes(profileTeacher.specialty)"
                :key="code"
                :class="[
                  'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold shadow-2xs',
                  getSubjectBadgeStyle(code, isSubjectMatchingFilter(code, subjectFilter) && subjectFilter !== 'ALL')
                ]"
              >
                <span v-if="isSubjectMatchingFilter(code, subjectFilter) && subjectFilter !== 'ALL'" class="text-amber-700 font-black">✓</span>
                <span>{{ SUBJECT_LABELS[code] || code }}</span>
              </span>
            </div>

            <div class="mt-2.5 flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs font-semibold">
              <span class="rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-slate-700">
                Rate: <strong>30m: {{ pointsForDuration(profileTeacher, 30) }} pts</strong> · <strong>1h: {{ pointsForDuration(profileTeacher, 60) }} pts</strong>
              </span>
              <span class="text-slate-400 font-normal hidden sm:inline">|</span>
              <span class="text-slate-500 font-medium text-xs">{{ getTeacherProfile(profileTeacher).major }}</span>
            </div>
          </div>
        </div>

        <div class="p-3 sm:p-5">
          <div class="rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm sm:p-4">
            <!-- Calendar toolbar: stacks to two rows on mobile -->
            <div class="mb-3 flex flex-col gap-2">
              <!-- Row 1: controls -->
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
                    class="appearance-none rounded-full border border-slate-200 bg-slate-100 py-1.5 pl-3 pr-8 text-[11px] font-semibold text-slate-700 outline-none transition hover:bg-slate-200 focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                  >
                    <option v-for="opt in getTeacherSubjectOptions(profileTeacher)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <svg class="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <!-- Row 2: date nav -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold text-slate-700">
                  {{ headerLabel }}
                </span>
                <div class="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    @click="goPrev"
                    :disabled="prevDisabled"
                    aria-label="Previous"
                    class="rounded-full px-2.5 py-1 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
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
                    class="rounded-full px-2.5 py-1 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white -mx-1 sm:mx-0">
              <!-- week mode: min 480px so 7 cols are usable; day mode: 220px -->
              <div :style="{ minWidth: (calendarViewMode === 'week' ? 480 : 220) + 'px' }">
                <div
                  class="grid border-b border-slate-200 bg-slate-50"
                  :style="{ gridTemplateColumns: `56px repeat(${columns.length}, 1fr)` }"
                >
                  <div class="border-r border-slate-200 bg-slate-50" />
                  <div
                    v-for="(day, colIdx) in columns"
                    :key="day.key"
                    class="border-r border-slate-200 bg-slate-50 px-0.5 py-2 text-center last:border-r-0"
                  >
                    <div class="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500">
                      {{ day.day.slice(0, 3) }}
                    </div>
                    <div
                      :class="`mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        dayIndexForColumn(colIdx) === 0 ? 'bg-primary text-white' : 'text-slate-800'
                      }`"
                    >
                      {{ day.label.slice(3) }}
                    </div>
                  </div>
                </div>

                <div class="max-h-[50dvh] sm:max-h-[420px] overflow-y-auto">
                  <div
                    class="grid"
                    :style="{ gridTemplateColumns: `56px repeat(${columns.length}, 1fr)` }"
                  >
                    <div class="relative border-r border-slate-200 bg-slate-50/50">
                      <div
                        v-for="(slot, i) in BOOKING_TIME_SLOTS"
                        :key="slot"
                        class="absolute right-1 -translate-y-1/2 whitespace-nowrap text-[9px] sm:text-[10px] font-medium text-slate-500"
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
                        class="absolute left-0.5 right-0.5 overflow-hidden rounded-md border-l-2 border-brighture-gold bg-brighture-cream px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-brighture-ink"
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
                        <div class="-ml-0.5 h-1.5 w-1.5 rounded-full bg-brighture-gold-deep" />
                        <div class="h-px flex-1 bg-brighture-gold-deep" />
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
  <FreeConversationModal
    :isOpen="showFreeConversationModal"
    @close="showFreeConversationModal = false"
  />
</template>

<style scoped>
/* The rail is swiped, so its scrollbar is noise on top of the cards. */
.promo-rail {
  scrollbar-width: none;
}
.promo-rail::-webkit-scrollbar {
  display: none;
}

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
