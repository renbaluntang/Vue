<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import BookingScheduler from "../../components/BookingScheduler.vue";
import BookingConfirmationPage from "../student-view-v4/BookingConfirmationPage.vue";
import TeacherDataModal from "../../components/TeacherDataModal.vue";
import FreeConversationModal from "../../components/FreeConversationModal.vue";
import TeacherIntroVideo from "../../components/TeacherIntroVideo.vue";
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
  INTRO_VIDEO_ID,
  DEMO_VIDEO_ID,
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
  { kind: 'intro', icon: 'fa-solid fa-play text-red-500', label: (t) => `Get to know ${t.name.split(' ')[0]}` },
  { kind: 'demo', icon: 'fa-solid fa-clapperboard text-indigo-500', label: (t) => `See ${t.name.split(' ')[0]} teach` },
];

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
        teacher.name.toLowerCase().includes(query) ||
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
const cardBodyGridClass = "md:grid-cols-[200px,1fr]";
const cardPhotoAspectClass = "max-w-[200px] aspect-square";
</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] px-3 py-6 pb-10 text-slate-800 sm:px-6">
    <div :class="`mx-auto space-y-6 transition-all duration-300 ${containerMaxWidthClass}`">
      <!-- The free trial lesson & assessment, for a new student who has not
           taken it. It sits above everything else because it is the best
           first booking, and it disappears for good once it is booked. -->
      <section
        v-if="user.taEligible"
        class="relative overflow-hidden rounded-2xl border border-brighture-gold/40 bg-brighture-cream p-5 shadow-sm sm:p-6"
        aria-labelledby="trial-promo-title"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3.5">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brighture-gold text-lg text-brighture-ink shadow-sm">
              <i class="fa-solid fa-gift" aria-hidden="true"></i>
            </span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 id="trial-promo-title" class="m-0 text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">Your free trial lesson &amp; assessment</h2>
                <span class="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">Free · once</span>
              </div>
              <p class="m-0 mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                Meet an instructor, talk about your goals, and get personal feedback on how you're doing and what to work on. It costs no points.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="showTrialInstructors"
            class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 sm:w-auto"
          >
            Choose a trial instructor <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
          </button>
        </div>
      </section>

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
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.08] text-lg shadow-inner"><i class="fa-solid fa-bolt text-[#FFCD00]" aria-hidden="true"></i></span>
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
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
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
            :exclude-codes="excludedCodes"
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
      <section ref="instructorList" :class="`grid scroll-mt-24 gap-5 transition-all duration-300 ${sectionColsClass}`">
        <article
          v-for="teacher in filteredInstructors"
          :key="teacher.id"
          class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-amber-400/80 hover:shadow-xl hover:shadow-slate-200/50"
        >
          <div>
            <!-- Header Row: Instructor Name, Lesson Stats, Rates & Favorite Button -->
            <div class="flex flex-col gap-3 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="m-0 text-xl font-extrabold tracking-tight">
                  <button
                    type="button"
                    @click="openTeacherInfo(teacher)"
                    class="text-slate-900 cursor-pointer hover:text-amber-600 transition flex items-center gap-2"
                    :aria-label="`View ${teacher.name}'s teacher information`"
                    title="View teacher information"
                  >
                    <span>{{ teacher.name }}</span>
                  </button>
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
                  <i class="fa-solid fa-star" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <!-- Body Content -->
            <div :class="`mt-5 grid gap-5 ${cardBodyGridClass}`">
              <!-- Left Column: Instructor Photo & Video Actions -->
              <div class="flex flex-col items-center sm:items-start gap-3">
                <button
                  type="button"
                  @click="openTeacherInfo(teacher)"
                  :class="`relative w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm group/avatar cursor-pointer ${cardPhotoAspectClass}`"
                  :aria-label="`View ${teacher.name}'s teacher information`"
                  title="View teacher information"
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
                    <i class="fa-solid fa-user text-[#FFCD00]" aria-hidden="true"></i> View Profile
                  </div>
                </button>

                <!-- Video Buttons (Distinct Icons & Clarifying Labels) -->
                <div class="flex w-full max-w-[200px] flex-col gap-2">
                  <button
                    type="button"
                    @click.stop="openVideo(teacher, 'intro')"
                    class="inline-flex w-full touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 active:scale-95 cursor-pointer"
                    title="A short video about them"
                  >
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-[9px]"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
                    <span>Get to know {{ teacher.name.split(' ')[0] }}</span>
                  </button>

                  <button
                    type="button"
                    @click.stop="openVideo(teacher, 'demo')"
                    class="inline-flex w-full touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 active:scale-95 cursor-pointer"
                    title="A few minutes of a real class"
                  >
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px]"><i class="fa-solid fa-clapperboard" aria-hidden="true"></i></span>
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
                      <span>Subjects Taught ({{ offeredCodes(teacher).length }})</span>
                    </div>
                    <span v-if="subjectFilter !== 'ALL'" class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      <i class="fa-solid fa-check" aria-hidden="true"></i> Filter match
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="code in offeredCodes(teacher)"
                      :key="code"
                      :class="[
                        'inline-flex max-w-full items-center rounded-lg border px-2 py-1 text-xs font-semibold transition-all shadow-2xs',
                        subjectChipClass(code)
                      ]"
                    >
                      <SubjectCode :subject="code" size="sm" />
                    </span>
                  </div>
                </div>

                <!-- Teacher Introduction Quote Box -->
                <div class="relative rounded-2xl border border-slate-200/80 bg-gradient-to-r from-amber-50/30 via-slate-50/80 to-white p-3.5 pl-4 shadow-2xs">
                  <div class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-amber-400" />
                  <p class="m-0 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <i class="fa-solid fa-comments text-sky-600" aria-hidden="true"></i>
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
                <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
                <span>Select &amp; Book Class</span>
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
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
              <i :class="tab.icon" aria-hidden="true"></i>
              {{ tab.label(activeVideo.teacher) }}
            </button>
          </div>

          <button
            type="button"
            @click="closeVideo"
            aria-label="Close video"
            class="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Close <i class="fa-solid fa-xmark ml-1" aria-hidden="true"></i>
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
            <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
            Book a class with {{ activeVideo.teacher.name.split(' ')[0] }}
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>

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
                v-for="code in offeredCodes(profileTeacher)"
                :key="code"
                :class="[
                  'inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold shadow-2xs',
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
