<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import BookingScheduler from "../../components/BookingScheduler.vue";
import BookingConfirmationPage from "../student-view-v4/BookingConfirmationPage.vue";
import TeacherDataModal from "../../components/TeacherDataModal.vue";
import FreeConversationModal from "../../components/FreeConversationModal.vue";
import TeacherVideoModal from "../../components/TeacherVideoModal.vue";
import { REFERRAL_TERMS } from "../../lib/referral";
import DateTimeFilterPopover from "../student-view-v4/DateTimeFilterPopover.vue";
import SubjectFilterBar from "../student-view-v4/SubjectFilterBar.vue";
import SubjectCode from "../../components/SubjectCode.vue";
import {
  INSTRUCTORS,
  SUBJECT_LABELS,
  SUBJECT_FILTER_OPTIONS,
  isSubjectMatchingFilter,
  BOOKING_DAYS,
  BOOKING_TIME_SLOTS,
  formatSlotTo12Hour,
  getTeacherPhoto,
  getTeacherModalImage,
  getTeacherProfile,
  parseSubjectCodes,
  getSubjectBadgeStyle,
  getSubjectCategory,
  getSlotStatus,
  pointsForDuration,
  getInitialFavorites,
} from "../student-view-v4/constants";
import { useUserStore } from "../../stores/useUserStore";
import { useSchoolStore } from "../../stores/useSchoolStore";
import { TOKYO, partsIn, tokyoAt } from "../../lib/schoolTime";

const user = useUserStore();
const school = useSchoolStore();
const route = useRoute();

// ── Level checks ──────────────────────────────────────────────────────
// The trial lesson & assessment (TA) is free and taken once, by new students
// only. Once it is used (or for anyone who never qualified) the [TA] subject
// is removed from everything this page offers: filters, cards, the subject
// list on the confirmation step.
const TA_CODE = "[TA]";
// Free Conversation is the on-demand "Talk Now" lesson, so it is never a
// subject to book into a slot.
const excludedCodes = computed(() => (user.taEligible ? ["[FC]"] : [TA_CODE, "[FC]"]));
/** The subject codes a teacher can be booked for by this student. */
const offeredCodes = (teacher) => parseSubjectCodes(teacher.specialty).filter((code) => !excludedCodes.value.includes(code));
/** The specialty string with unbookable subjects taken out, for filtering and search. */
const offeredSpecialty = (teacher) => offeredCodes(teacher).join(", ");

/** Tokyo calendar date `offset` days from today, as 'YYYY-MM-DD'. The grid times are JST. */
const tokyoDayIso = (offset) => {
  const p = partsIn(new Date().toISOString(), TOKYO);
  return new Date(Date.UTC(p.year, p.month, p.day + offset)).toISOString().slice(0, 10);
};

/** The instant a grid cell starts at. */
const slotStartIso = (dayIndex, slotIndex) => tokyoAt(tokyoDayIso(dayIndex), BOOKING_TIME_SLOTS[slotIndex]);

const instructorById = (teacherId) => INSTRUCTORS.find((item) => item.id === teacherId);

/**
 * Slot status from the sample pattern, checked against the shared store: a
 * slot is only Available if the teacher is actually free then (their published
 * board, or the sample pattern for teachers without one, and no other booking).
 */
const getSlotStatusLive = (teacherId, dayIndex, slotIndex) => {
  const mock = getSlotStatus(teacherId, dayIndex, slotIndex);
  const key = instructorById(teacherId)?.imageKey;
  if (!key) return mock;
  const open = school.isTeacherSlotOpen(key, slotStartIso(dayIndex, slotIndex), 30, mock === "Available");
  if (open) return "Available";
  return mock === "Available" ? "Reserved" : mock;
};


const favorites = ref(getInitialFavorites());
const showFreeConversationModal = ref(false);
const profileTeacher = ref(null);
const infoTeacher = ref(null);

const bookingNotice = ref(null);

// Modern Redesign state
const search = ref("");
const subjectFilter = ref("ALL");
const favoritesOnly = ref(false);
// Which clip is open, and whose. The card offers two now and they are
// different content, so the teacher alone no longer identifies the video.
const activeVideo = ref(null); // { teacher, kind: 'intro' | 'demo' }
const openVideo = (teacher, kind) => { activeVideo.value = { teacher, kind }; };
const closeVideo = () => { activeVideo.value = null; };

/** The same subject names the card shows, read off the same field. */
const videoSubjects = (teacher) => {
  const names = offeredCodes(teacher)
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
// Subject chips stay neutral so each subject's own letter-box colour reads;
// only a chip that matches the active filter is lit up.
const subjectChipClass = (code) =>
  subjectFilter.value !== "ALL" && isSubjectMatchingFilter(code, subjectFilter.value)
    ? getSubjectBadgeStyle(code, true)
    : "bg-white text-slate-700 border-slate-200";

const getSubjectCategoryBadge = (code) => {
  const cat = getSubjectCategory(code);
  if (!cat) return { name: "General", icon: "fa-solid fa-book text-slate-500", badgeBg: "bg-slate-100 text-slate-700" };
  if (cat.id === "conversation") {
    return { name: "Conversation", icon: "fa-solid fa-comments text-sky-600", badgeBg: "bg-sky-100/90 text-sky-800" };
  }
  if (cat.id === "pronunciation") {
    return { name: "Pronunciation", icon: "fa-solid fa-microphone-lines text-amber-600", badgeBg: "bg-amber-100/90 text-amber-900" };
  }
  if (cat.id === "specialized") {
    return { name: "Specialized", icon: "fa-solid fa-bullseye text-violet-600", badgeBg: "bg-purple-100/90 text-purple-900" };
  }
  return { name: "General", icon: "fa-solid fa-book text-slate-500", badgeBg: "bg-slate-100 text-slate-700" };
};

watch(
  favorites,
  (value) => {
    window.localStorage.setItem("student_view_v4_favorites", JSON.stringify(value));
  },
  { immediate: true }
);

// The notice stays exactly as long as its border countdown runs. Hovering or
// focusing it pauses both (WCAG 2.2.1: people get the time they need to read
// it or reach Undo), and leaving resumes from where it stopped.
const NOTICE_MS = 15000;
const noticeKey = ref(0);
const noticePaused = ref(false);
let noticeTimer = null;
let noticeLeft = NOTICE_MS;
let noticeStartedAt = 0;
const startNoticeTimer = () => {
  clearTimeout(noticeTimer);
  noticeStartedAt = Date.now();
  noticeTimer = setTimeout(() => { bookingNotice.value = null; }, noticeLeft);
};
const pauseNotice = () => {
  if (!bookingNotice.value || noticePaused.value) return;
  noticePaused.value = true;
  clearTimeout(noticeTimer);
  noticeLeft -= Date.now() - noticeStartedAt;
};
const resumeNotice = () => {
  if (!bookingNotice.value || !noticePaused.value) return;
  noticePaused.value = false;
  startNoticeTimer();
};
watch(bookingNotice, (value) => {
  clearTimeout(noticeTimer);
  noticePaused.value = false;
  if (!value) return;
  noticeKey.value += 1; // restarts the countdown when a new notice replaces one
  noticeLeft = NOTICE_MS;
  startNoticeTimer();
});
onBeforeUnmount(() => clearTimeout(noticeTimer));

/** Takes back the booking the notice is about, with a full refund. */
const undoLastBooking = () => {
  const id = bookingNotice.value?.lessonId;
  if (!id) return;
  const undone = school.undoBooking(id);
  bookingNotice.value = undone
    ? { type: "info", title: "Booking undone", message: "The lesson was removed and your points were refunded." }
    : { type: "error", title: "Could not undo", message: "That lesson can no longer be undone. Cancel it from your dashboard instead." };
};

const openTeacherProfile = (teacher) => {
  profileTeacher.value = teacher;
  lastPick.value = null;
  bookingNotice.value = null;
  // Carry the searched subject into the booking calendar, but only when this
  // teacher actually teaches it — otherwise the code has no matching option
  // (also covers a subject left over from the previously opened teacher).
  bookingSubject.value = offeredCodes(teacher).includes(subjectFilter.value)
    ? subjectFilter.value
    : "ALL";
};

const openTeacherInfo = (teacher) => {
  infoTeacher.value = teacher;
};

const closeTeacherInfo = () => {
  infoTeacher.value = null;
};

const bookFromTeacherInfo = (teacher) => {
  closeTeacherInfo();
  // Opened from the calendar's own header: the calendar is already there.
  if (profileTeacher.value?.id === teacher?.id) return;
  openTeacherProfile(teacher);
};

/**
 * Where the calendar opens: back on the slot just reviewed, if the student
 * cancelled out of the confirmation page; otherwise the page's date/time
 * filter, if one is set.
 */
const lastPick = ref(null);
const schedulerStart = computed(() => {
  if (lastPick.value) return { date: lastPick.value.dateIso, time: lastPick.value.time, minutes: lastPick.value.minutes };
  const dayIndex = selectedDayKey.value ? BOOKING_DAYS.findIndex((day) => day.key === selectedDayKey.value) : -1;
  return {
    date: dayIndex >= 0 ? tokyoDayIso(dayIndex) : "",
    time: dayIndex >= 0 ? selectedTime.value || "" : "",
    minutes: filterDuration.value,
  };
});

// --- Confirmation page ---
const confirmationDraft = ref(null);
const confirmSubject = ref("");
const confirmMessage = ref("");
const confirmSubjectOptions = computed(() =>
  confirmationDraft.value
    ? offeredCodes(confirmationDraft.value.teacher).map((code) => ({ value: code, label: SUBJECT_LABELS[code] ?? code }))
    : []
);

/** The card beside the slot hands its pick over for the full confirmation. */
const openConfirmation = (pick) => {
  confirmationDraft.value = { ...pick, teacher: profileTeacher.value };
  lastPick.value = pick;
  confirmMessage.value = "";
  // Carry the searched subject over; "ALL" is not a real lesson subject.
  confirmSubject.value = bookingSubject.value === "ALL" ? "" : bookingSubject.value;
};

/** What the booking takes from the wallet: nothing for the free trial. */
const confirmPoints = computed(() => {
  if (!confirmationDraft.value) return 0;
  return confirmSubject.value === TA_CODE && user.taEligible ? 0 : confirmationDraft.value.points;
});

const cancelConfirmation = () => {
  confirmationDraft.value = null;
};

const finalizeBooking = () => {
  const draft = confirmationDraft.value;
  if (!draft) return;
  // Booked in the shared store, so it shows on the dashboard and in the
  // teacher's reservations. It refuses a taken slot or a short balance.
  // The cost is read first: booking the trial ends eligibility, which would
  // otherwise flip it back to the regular price.
  const cost = confirmPoints.value;
  const wasTrial = confirmSubject.value === TA_CODE;
  const booked = user.bookLesson({
    teacherId: draft.teacher.imageKey,
    start: draft.start,
    duration: draft.minutes,
    subject: confirmSubject.value ? SUBJECT_LABELS[confirmSubject.value] ?? confirmSubject.value : "Lesson",
    note: confirmMessage.value.trim(),
    points: cost,
  });
  confirmationDraft.value = null;
  if (!booked) {
    bookingNotice.value = {
      type: "error",
      message:
        wasTrial && cost !== 0
          ? "Your free trial lesson & assessment has already been booked. Choose another subject."
          : user.profile.pointsBalance < cost
            ? `Not enough points — this lesson costs ${cost} pts and you have ${user.profile.pointsBalance}.`
            : "That slot was just taken. Please choose another time.",
    };
    return;
  }
  bookingNotice.value = {
    type: "success",
    title: "Lesson booked",
    lessonId: booked.id,
    teacherName: draft.teacher.name,
    photo: getTeacherPhoto(draft.teacher),
    subject: booked.subject,
    when: draft.dayLabel,
    time: `${draft.startLabel} – ${draft.endLabel} JST`,
    length: draft.minutes === 60 ? "1 hour" : "30 min",
    points: cost,
    left: user.profile.pointsBalance,
    // Kept for screen readers and the error path, which only has text.
    message: `${draft.minutes === 60 ? "1 hour" : "30 min"} with ${draft.teacher.name}, ${draft.dayLabel}, ${draft.startLabel} – ${draft.endLabel} JST.`,
  };
  lastPick.value = null;
  confirmSubject.value = "";
  confirmMessage.value = "";
  closeTeacherProfile();
};

const closeTeacherProfile = () => {
  profileTeacher.value = null;
  lastPick.value = null;
};

const filteredInstructors = computed(() => {
  let list = [...INSTRUCTORS];

  if (favoritesOnly.value) {
    list = list.filter((teacher) => favorites.value.includes(teacher.id));
  }

  if (subjectFilter.value !== "ALL") {
    list = list.filter((teacher) => isSubjectMatchingFilter(offeredSpecialty(teacher), subjectFilter.value));
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
          if (getSlotStatusLive(teacher.id, dayIdx, slotIdx + s) !== "Available") {
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
        // The card shows the nickname, but a surname typed in still finds them.
        teacher.name.toLowerCase().includes(query) ||
        (teacher.fullName ?? '').toLowerCase().includes(query) ||
        offeredSpecialty(teacher).toLowerCase().includes(query) ||
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

// A link such as /booking?subject=[CS] (from Assessment Feedback) opens the
// list already filtered to that subject, if this student may book it.
const applySubjectQuery = () => {
  const code = route.query.subject;
  if (typeof code === "string" && SUBJECT_LABELS[code] && !excludedCodes.value.includes(code)) {
    subjectFilter.value = code;
  }
};
watch(() => route.query.subject, applySubjectQuery, { immediate: true });

// A link such as /booking?teacher=184 (Book a class, from a class panel) opens
// that instructor's booking calendar straight away. The id is the teacher-image
// key the lessons store.
const applyTeacherQuery = () => {
  const key = Number(route.query.teacher);
  const teacher = Number.isFinite(key) ? INSTRUCTORS.find((item) => item.imageKey === key) : null;
  if (teacher) openTeacherProfile(teacher);
};
watch(() => route.query.teacher, applyTeacherQuery, { immediate: true });

// A filter can be left on [TA] after the trial is booked; it is no longer
// on offer then, so fall back to all subjects.
watch(excludedCodes, (codes) => {
  if (codes.includes(subjectFilter.value)) subjectFilter.value = "ALL";
});

const instructorList = ref(null);
/** The trial promo: show only the instructors who give it, then bring them into view. */
const showTrialInstructors = () => {
  resetFilters();
  subjectFilter.value = TA_CODE;
  nextTick(() => instructorList.value?.scrollIntoView?.({ behavior: "smooth", block: "start" }));
};

const toggleFavorite = (teacherId) => {
  favorites.value = favorites.value.includes(teacherId)
    ? favorites.value.filter((id) => id !== teacherId)
    : [...favorites.value, teacherId];
};





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


// --- Grid layout (single column; the runtime switcher was removed) ---
const containerMaxWidthClass = "max-w-[1240px]";
const sectionColsClass = "grid-cols-1";
const cardBodyGridClass = "md:grid-cols-[148px,1fr]";
const cardPhotoAspectClass = "max-w-[148px] aspect-square";
</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] px-3 py-6 pb-12 text-slate-800 sm:px-6">
    <div :class="`mx-auto space-y-6 transition-all duration-300 ${containerMaxWidthClass}`">
      <!-- 1. Page Header with Points Balance pill -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Book a Lesson
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500 font-medium">
            Browse our professional English instructors, check schedules, and reserve your 1-on-1 classes.
          </p>
        </div>

        <!-- Quick balance indicator linking to point purchase/history -->
        <RouterLink
          to="/points"
          class="inline-flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-white hover:bg-amber-50/60 px-4 py-2.5 transition active:scale-[0.98] shadow-xs group shrink-0"
          title="View your points balance"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
            <i class="fa-solid fa-coins text-amber-700 text-sm" aria-hidden="true"></i>
          </div>
          <div>
            <span class="block text-[10px] font-bold uppercase tracking-wider text-amber-800">Available Points</span>
            <span class="block text-sm font-black text-slate-950">
              {{ user.profile.pointsBalance }} pts
              <span class="text-xs font-semibold text-brighture-bronze group-hover:translate-x-0.5 transition-transform inline-block ml-0.5">→</span>
            </span>
          </div>
        </RouterLink>
      </header>

      <!-- 2. The free trial lesson & assessment (for eligible new students) -->
      <section
        v-if="user.taEligible"
        class="relative overflow-hidden rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4 sm:p-5 shadow-xs"
        aria-labelledby="trial-promo-title"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3.5">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brighture-gold text-base text-slate-950 shadow-xs">
              <i class="fa-solid fa-gift" aria-hidden="true"></i>
            </span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 id="trial-promo-title" class="m-0 text-base font-extrabold tracking-tight text-slate-900">Your free trial lesson &amp; assessment</h2>
                <span class="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">Free · once</span>
              </div>
              <p class="m-0 mt-0.5 text-xs font-medium text-slate-600 sm:text-sm">
                Meet an instructor, talk about your goals, and get personal feedback on how you're doing. It costs no points.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="showTrialInstructors"
            class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 sm:w-auto cursor-pointer"
          >
            Choose a trial instructor <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
          </button>
        </div>
      </section>

      <!-- 3. Talk Now (Instant Lesson Option) -->
      <section class="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900 p-4 sm:p-5 text-white shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brighture-gold text-base" aria-hidden="true">
              <i class="fa-solid fa-bolt"></i>
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="text-sm sm:text-base font-extrabold tracking-tight text-white">Talk Now</h2>
                <span class="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">Instant</span>
              </div>
              <p class="mt-0.5 text-xs text-slate-300">
                Need to practice right away? Start a 25-minute lesson now — teacher assigned automatically (5 pts).
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="showFreeConversationModal = true"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brighture-gold hover:bg-[#FFD933] px-5 py-2.5 text-xs font-black text-slate-950 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>Start lesson now</span>
            <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
          </button>
        </div>
      </section>

      <!-- 4. Search & Filter Bar -->
      <header class="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <!-- Row 1: Search + Date & Time Popover Trigger -->
        <div class="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          <!-- Search input -->
          <div class="relative flex-1">
            <svg
              class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              v-model="search"
              placeholder="Search by instructor name, specialty, or subject…"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200/50"
            />
            <button
              v-if="search"
              type="button"
              @click="search = ''"
              aria-label="Clear search"
              class="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition"
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
            <span
              v-else
              class="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 sm:block"
            >
              ⌘K
            </span>
          </div>

          <!-- Popover trigger button -->
          <div class="relative">
            <button
              type="button"
              @click="openDateTimePopover"
              :class="`flex h-[38px] sm:h-[42px] items-center gap-2 rounded-xl border px-3 sm:px-4 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedDayKey || selectedTime
                  ? 'border-brighture-gold bg-amber-50/80 text-slate-900'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-700'
              }`"
            >
              <svg class="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span v-if="selectedDayKey || selectedTime" class="truncate max-w-[120px] sm:max-w-none">
                <template v-if="selectedDayKey">{{ BOOKING_DAYS.find((d) => d.key === selectedDayKey)?.label }}</template>
                <template v-if="selectedDayKey && selectedTime">, </template>
                <template v-if="selectedTime">{{ formatSlotTo12Hour(selectedTime) }}</template>
              </span>
              <span v-else>
                <span class="hidden sm:inline">Date &amp; Time</span>
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

        <!-- Row 2: SubjectFilterBar with count and reset -->
        <div class="mt-2.5 border-t border-slate-100 px-4 py-2 sm:px-6">
          <SubjectFilterBar
            v-model="subjectFilter"
            v-model:favorites-only="favoritesOnly"
            :favorites-count="favorites.length"
            :exclude-codes="excludedCodes"
          >
            <template #end>
              <span class="whitespace-nowrap text-[11px] font-medium tabular-nums text-slate-400">
                <strong class="font-bold text-slate-600">{{ filteredInstructors.length }}</strong> of {{ INSTRUCTORS.length }}
              </span>
              <button
                v-if="search || subjectFilter !== 'ALL' || favoritesOnly || selectedDayKey || selectedTime"
                type="button"
                @click="resetFilters"
                class="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
              >
                <i class="fa-solid fa-rotate-left text-[10px]" aria-hidden="true"></i>
                Reset
              </button>
            </template>
          </SubjectFilterBar>
        </div>
      </header>

      <!-- 5. Instructors Grid List (Clean, user-friendly cards) -->
      <section ref="instructorList" :class="`grid scroll-mt-24 gap-4 transition-all duration-300 ${sectionColsClass}`">
        <article
          v-for="teacher in filteredInstructors"
          :key="teacher.id"
          class="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-amber-300 hover:shadow-md"
        >
          <!-- Favourite star, pinned to the card's top-right corner at every
               width so it's always in the same place. -->
          <button
            type="button"
            @click="toggleFavorite(teacher.id)"
            :class="`absolute right-4 top-4 z-10 inline-flex h-7 w-7 sm:right-5 sm:top-5 items-center justify-center rounded-lg border text-xs transition-all cursor-pointer ${
            favorites.includes(teacher.id)
              ? 'border-amber-300 bg-amber-50 text-amber-500 shadow-xs hover:bg-amber-100 scale-105'
              : 'border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50/40'
            }`"
            :aria-label="`Toggle favorite for ${teacher.name}`"
            :title="favorites.includes(teacher.id) ? 'Saved as favorite teacher' : 'Save to favorite teachers'"
          >
            <i class="fa-solid fa-star" aria-hidden="true"></i>
          </button>

          <!-- Three columns on laptop screens: the photo at a fixed size (a
               share of the width made it too big), then what the teacher
               teaches and the actions at 5 : 2. The grid stretches every
               column to the tallest one, so the booking button sits in the
               bottom-right corner. On tablets the actions drop to a row under
               the photo and details; on phones everything stacks. -->
          <div class="flex flex-1 flex-col gap-4 sm:grid sm:grid-cols-[148px_1fr] sm:gap-5 lg:grid-cols-[164px_minmax(0,5fr)_minmax(0,2fr)]">
            <!-- Photo, centred down the card's height so it doesn't hang at
                 the top when the details run long. -->
            <div class="mx-auto w-full max-w-xs sm:max-w-none sm:self-center">
              <!-- Avatar Photo -->
              <button
                type="button"
                @click="openTeacherInfo(teacher)"
                class="relative w-full aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-xs group/avatar cursor-pointer"
                :aria-label="`View ${teacher.name}'s profile`"
                title="View teacher profile"
              >
                <img
                  :src="getTeacherModalImage(teacher)"
                  :alt="teacher.name"
                  class="h-full w-full object-cover object-top transition duration-500 group-hover/avatar:scale-105"
                />
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div class="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1 rounded-lg bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-sm transition group-hover/avatar:bg-slate-900">
                  <i class="fa-solid fa-id-card text-brighture-gold text-[10px]" aria-hidden="true"></i>
                  <span>Profile</span>
                </div>
              </button>
            </div>

            <!-- Teacher details. Thin vertical rules divide the columns,
                 instead of a line under the name. -->
            <div class="min-w-0 sm:border-l sm:border-slate-100 sm:pl-5">
              <!-- Top Row: Name and Rates. On phones the right padding keeps
                   the name clear of the favourite star. -->
              <div class="flex flex-col pr-12 sm:flex-row sm:items-start lg:pr-0 justify-between gap-2.5">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="m-0 text-lg sm:text-xl font-black tracking-tight">
                      <button
                        type="button"
                        @click="openTeacherInfo(teacher)"
                        class="text-slate-900 hover:text-amber-600 transition cursor-pointer text-left font-black"
                      >
                        {{ teacher.name }}
                      </button>
                    </h3>
                  </div>

                  <!-- Teacher Major / Specialty -->
                  <p class="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <i class="fa-solid fa-graduation-cap text-slate-400" aria-hidden="true"></i>
                    <span>{{ getTeacherProfile(teacher).major }}</span>
                  </p>
                </div>

                <!-- Rates Pill -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-amber-200/80 bg-amber-50/60 px-2.5 py-1 text-xs shadow-xs">
                    <span class="text-amber-800 font-bold uppercase tracking-wider text-[10px]">Lesson:</span>
                    <span class="font-bold text-slate-800 text-xs">
                      30m <span class="text-amber-700 font-black">({{ pointsForDuration(teacher, 30) }} pts)</span>
                    </span>
                    <span class="text-amber-300 font-bold">·</span>
                    <span class="font-bold text-slate-800 text-xs">
                      60m <span class="text-amber-700 font-black">({{ pointsForDuration(teacher, 60) }} pts)</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Self Intro Quote -->
              <p class="mt-2.5 text-xs sm:text-sm text-slate-600 italic leading-relaxed line-clamp-2">
                "{{ getTeacherProfile(teacher).selfIntro }}"
              </p>

              <!-- Subjects Taught Badges -->
              <!-- Below laptop width the full chips took several rows, so
                   phones and tablets get one line of subject boxes next to
                   the label (each box names its subject on hover and to
                   screen readers). From lg the named chips return, and the
                   label keeps its own column so a second row of chips starts
                   under the first chip rather than under the label. -->
              <div class="mt-3 flex items-center gap-2 lg:items-start">
                <span class="shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-400 lg:pt-1">Subjects ({{ offeredCodes(teacher).length }}):</span>
                <div class="flex min-w-0 flex-wrap gap-1 lg:hidden">
                  <SubjectCode
                    v-for="code in offeredCodes(teacher)"
                    :key="code"
                    :subject="code"
                    :show-name="false"
                  />
                </div>
                <div class="hidden min-w-0 flex-wrap gap-1 lg:flex">
                <span
                  v-for="code in offeredCodes(teacher)"
                  :key="code"
                  :class="[
                    'inline-flex max-w-full items-center rounded-md border py-0.5 pl-0.5 pr-1.5 text-[11px] font-semibold leading-none',
                    subjectChipClass(code)
                  ]"
                >
                  <SubjectCode :subject="code" size="sm" />
                </span>
                </div>
              </div>
            </div>

            <!-- Actions. In the three-column layout the three buttons sit
                 together as one group, centred in the space below the
                 favourite star pinned in the card's corner. -->
            <div class="flex flex-col gap-3 sm:col-span-2 lg:border-l lg:border-slate-100 lg:pl-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-1 lg:flex-col lg:items-stretch lg:justify-center lg:gap-2 lg:pt-10">
              <div class="grid grid-cols-2 gap-1.5 sm:flex lg:grid lg:grid-cols-1">
                  <button
                    type="button"
                    @click.stop="openVideo(teacher, 'intro')"
                    class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 py-1.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition active:scale-95 cursor-pointer min-h-[36px]"
                    :title="`Watch ${teacher.name}'s intro video`"
                  >
                    <i class="fa-solid fa-play shrink-0 text-xs" aria-hidden="true"></i>
                    <span class="truncate">Intro Video</span>
                  </button>

                  <button
                    type="button"
                    @click.stop="openVideo(teacher, 'demo')"
                    class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 py-1.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition active:scale-95 cursor-pointer min-h-[36px]"
                    :title="`Watch a sample lesson with ${teacher.name}`"
                  >
                    <i class="fa-solid fa-clapperboard shrink-0 text-xs" aria-hidden="true"></i>
                    <span class="truncate">Class Demo</span>
                  </button>
              </div>
              <div>
                <button
                  type="button"
                  @click="openTeacherProfile(teacher)"
                  class="inline-flex items-center justify-center gap-2 rounded-xl bg-brighture-gold hover:bg-[#FFD933] active:bg-amber-400 text-slate-950 font-black text-xs px-6 lg:px-3 py-2.5 shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer min-h-[40px] w-full whitespace-nowrap sm:w-auto lg:w-full"
                >
                  <i class="fa-solid fa-calendar-days text-xs" aria-hidden="true"></i>
                  <span>Book a class</span>
                  <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </article>

        <div v-if="filteredInstructors.length === 0" class="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          </div>
          <h3 class="mt-3 text-base font-semibold text-slate-800">No teachers found</h3>
          <p class="mt-1 text-xs text-slate-500">
            Try adjusting your search terms or resetting filters.
          </p>
          <button
            type="button"
            @click="resetFilters"
            class="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <!-- 6. Referral Banner at the foot of the page -->
      <aside
        aria-label="Refer a friend"
        class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 sm:px-5 text-slate-900 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800 shadow-xs" aria-hidden="true">
              <i class="fa-solid fa-gift text-sm"></i>
            </span>
            <p class="min-w-0 text-xs sm:text-sm text-slate-600">
              <strong class="font-black text-slate-900">Refer a friend:</strong>
              Give {{ REFERRAL_TERMS.friendDiscountLabel }} USD off their plan, earn {{ REFERRAL_TERMS.referrerPoints }} pts once they buy.
            </p>
          </div>
          <RouterLink
            to="/refer"
            class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brighture-gold hover:bg-[#FFD933] px-4 py-2 text-center text-xs font-extrabold text-slate-950 shadow-xs transition active:scale-95"
          >
            <span>Get invite link</span>
            <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </aside>
    </div>

    <!-- Video Lightbox Modal -->
    <TeacherVideoModal
      v-if="activeVideo"
      :name="activeVideo.teacher.name"
      :kind="activeVideo.kind"
      :subjects="videoSubjects(activeVideo.teacher)"
      @update:kind="(kind) => (activeVideo = { ...activeVideo, kind })"
      @close="closeVideo"
      @book="bookFromVideo"
    />

    <!-- Result notice, top right, below the header so it never covers the
         next-class bar. Its border is a countdown: a coloured line runs down
         around the edge over 15 seconds, and the notice closes as it runs
         out. Hover or focus pauses it. -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-6"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-x-6"
    >
      <div
        v-if="bookingNotice"
        :key="noticeKey"
        class="fixed right-4 top-28 z-[70] w-[calc(100vw-2rem)] max-w-sm"
        :role="bookingNotice.type === 'error' ? 'alert' : 'status'"
        aria-live="polite"
        @mouseenter="pauseNotice"
        @mouseleave="resumeNotice"
        @focusin="pauseNotice"
        @focusout="resumeNotice"
      >
        <div class="relative rounded-2xl bg-white shadow-xl">
          <svg class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <rect x="0" y="0" width="100%" height="100%" rx="16" ry="16" fill="none" class="stroke-slate-200" stroke-width="2" />
            <rect
              x="0" y="0" width="100%" height="100%" rx="16" ry="16" fill="none"
              pathLength="100"
              stroke-width="2.5"
              stroke-linecap="round"
              class="notice-countdown"
              :class="bookingNotice.type === 'success' ? 'stroke-emerald-500' : bookingNotice.type === 'error' ? 'stroke-rose-500' : 'stroke-slate-400'"
              :style="{ animationDuration: `${NOTICE_MS}ms`, animationPlayState: noticePaused ? 'paused' : 'running' }"
            />
          </svg>

          <!-- Booked: who, when, and what it cost, as scannable lines -->
          <div v-if="bookingNotice.type === 'success'" class="relative p-4">
            <div class="flex items-start gap-3">
              <div class="relative shrink-0">
                <img :src="bookingNotice.photo" :alt="bookingNotice.teacherName" class="h-11 w-11 rounded-xl object-cover" />
                <span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white ring-2 ring-white">
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="m-0 text-sm font-black text-slate-900">{{ bookingNotice.title }}</p>
                <p class="m-0 truncate text-xs font-medium text-slate-500">
                  {{ bookingNotice.length }} with <span class="font-bold text-slate-700">{{ bookingNotice.teacherName }}</span>
                </p>
              </div>
              <button
                type="button"
                @click="bookingNotice = null"
                class="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notice"
              >
                <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
              </button>
            </div>

            <dl class="m-0 mt-3 space-y-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
              <div class="flex items-center gap-2.5">
                <dt class="w-4 shrink-0 text-center text-sky-600"><i class="fa-regular fa-calendar" aria-hidden="true"></i><span class="sr-only">Date</span></dt>
                <dd class="m-0 font-bold text-slate-900">{{ bookingNotice.when }}</dd>
              </div>
              <div class="flex items-center gap-2.5">
                <dt class="w-4 shrink-0 text-center text-sky-600"><i class="fa-regular fa-clock" aria-hidden="true"></i><span class="sr-only">Time</span></dt>
                <dd class="m-0 font-semibold text-slate-700 tabular-nums">{{ bookingNotice.time }}</dd>
              </div>
              <div v-if="bookingNotice.subject" class="flex items-center gap-2.5">
                <dt class="w-4 shrink-0 text-center text-indigo-500"><i class="fa-solid fa-book-open" aria-hidden="true"></i><span class="sr-only">Subject</span></dt>
                <dd class="m-0 flex min-w-0 font-semibold text-slate-700"><SubjectCode :subject="bookingNotice.subject" size="sm" /></dd>
              </div>
              <div class="flex items-center gap-2.5">
                <dt class="w-4 shrink-0 text-center text-amber-500"><i class="fa-solid fa-coins" aria-hidden="true"></i><span class="sr-only">Points</span></dt>
                <dd class="m-0 font-semibold text-slate-700 tabular-nums">
                  <template v-if="bookingNotice.points">{{ bookingNotice.points }} pts used</template>
                  <template v-else>Free</template>
                  · <span class="text-slate-500">{{ bookingNotice.left }} left</span>
                </dd>
              </div>
            </dl>

            <div class="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                @click="undoLastBooking"
                class="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <i class="fa-solid fa-rotate-left mr-1 text-[11px]" aria-hidden="true"></i> Undo
              </button>
              <RouterLink
                to="/"
                class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                View on dashboard <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
              </RouterLink>
            </div>
          </div>

          <!-- Errors and simple notes -->
          <div v-else class="relative flex items-start gap-3 p-4">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
              :class="bookingNotice.type === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'"
            >
              <i :class="bookingNotice.type === 'error' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-rotate-left'" aria-hidden="true"></i>
            </span>
            <div class="min-w-0 flex-1 pt-0.5">
              <p class="m-0 text-xs font-black" :class="bookingNotice.type === 'error' ? 'text-rose-800' : 'text-slate-800'">
                {{ bookingNotice.title || (bookingNotice.type === 'error' ? 'Could not book' : 'Done') }}
              </p>
              <p class="m-0 mt-0.5 text-xs font-semibold leading-snug text-slate-700 sm:text-sm">{{ bookingNotice.message }}</p>
            </div>
            <button
              type="button"
              @click="bookingNotice = null"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notice"
            >
              <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>

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

        <!-- The name appears once, under the photo; the close button sits in the corner. -->
        <div class="relative flex flex-col items-center gap-4 border-b border-slate-200 p-4 text-center sm:flex-row sm:items-center sm:text-left sm:p-5 sm:pr-14">
          <button
            type="button"
            @click="closeTeacherProfile"
            class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
          <!-- The name sits under the photo, so the details beside them get
               the full width. -->
          <div class="flex flex-none flex-col items-center gap-2">
            <!-- The photo and name open the instructor's full profile over the calendar. -->
            <button
              type="button"
              @click="openTeacherInfo(profileTeacher)"
              class="group relative flex-none cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
              :aria-label="`View ${profileTeacher.name}'s profile`"
            >
              <img
                :src="getTeacherPhoto(profileTeacher)"
                :alt="profileTeacher.name"
                class="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover shadow-sm ring-2 ring-white outline outline-1 outline-slate-200 transition group-hover:brightness-95 group-hover:outline-amber-300"
              />
              <span class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] text-slate-700 shadow ring-1 ring-slate-200 transition group-hover:text-brighture-bronze" aria-hidden="true">
                <i class="fa-solid fa-user"></i>
              </span>
            </button>
            <h2 class="m-0 text-base font-black text-slate-900">
              <button
                type="button"
                @click="openTeacherInfo(profileTeacher)"
                class="group inline-flex cursor-pointer items-center gap-1 rounded transition hover:text-brighture-bronze focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
              >
                <span class="underline-offset-4 group-hover:underline">{{ profileTeacher.name }}</span>
                <i class="fa-solid fa-chevron-right text-[10px] text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brighture-bronze" aria-hidden="true"></i>
              </button>
            </h2>
          </div>
          <div class="min-w-0 flex-1">
            <!-- Distinct subjects covered chips in modal header -->
            <div class="flex flex-wrap justify-center sm:justify-start gap-1.5">
              <span
                v-for="code in offeredCodes(profileTeacher)"
                :key="code"
                :class="[
                  'inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold shadow-xs',
                  subjectChipClass(code)
                ]"
              >
                <i v-if="isSubjectMatchingFilter(code, subjectFilter) && subjectFilter !== 'ALL'" class="fa-solid fa-check text-amber-700" aria-hidden="true"></i>
                <SubjectCode :subject="code" size="sm" />
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

        <!-- Booking calendar: lesson length, date jumping up to six months
             ahead, and a confirmation card beside the chosen slot. -->
        <div class="p-3 sm:p-5">
          <BookingScheduler
            :key="profileTeacher.id"
            :teacher="profileTeacher"
            :initial-date="schedulerStart.date"
            :initial-time="schedulerStart.time"
            :initial-duration="schedulerStart.minutes"
            :free="bookingSubject === TA_CODE && user.taEligible"
            @review="openConfirmation"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- Final step: the confirmation modal, opened from the card beside the
       chosen slot. It floats over the calendar, so Cancel leaves the pick
       exactly where it was. -->
  <BookingConfirmationPage
    v-if="confirmationDraft"
    variant="modal"
    :teacher="confirmationDraft.teacher"
    :day-label="confirmationDraft.dayLabel"
    :start-label="confirmationDraft.startLabel"
    :end-label="confirmationDraft.endLabel"
    :minutes="confirmationDraft.minutes"
    :points="confirmPoints"
    :subject="confirmSubject"
    :subject-options="confirmSubjectOptions"
    :message="confirmMessage"
    :balance="user.profile.pointsBalance"
    @update:subject="confirmSubject = $event"
    @update:message="confirmMessage = $event"
    @cancel="cancelConfirmation"
    @submit="finalizeBooking"
  />

  <FreeConversationModal
    :isOpen="showFreeConversationModal"
    @close="showFreeConversationModal = false"
  />
  <TeacherDataModal
    :teacher="infoTeacher"
    @close="closeTeacherInfo"
    @book="bookFromTeacherInfo"
  />
</template>

<style scoped>
/* The notice border drains like a loading bar: full at the start, gone when
   the notice closes. pathLength="100" makes the dash maths length-free. */
.notice-countdown {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  animation-name: notice-drain;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes notice-drain {
  to { stroke-dashoffset: 100; }
}
@media (prefers-reduced-motion: reduce) {
  .notice-countdown { animation: none; }
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
