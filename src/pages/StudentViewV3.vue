<script setup>
import { computed, ref, watch } from "vue";
import studentImage from "@/assets/student-1.svg";
import teacherPhoto1 from "@/assets/Adobe Express - file.png";
import teacherPhoto2 from "@/assets/Adobe Express - file (1).png";
import teacherPhoto3 from "@/assets/Adobe Express - file (2).png";
import teacherPhoto4 from "@/assets/Adobe Express - file (3).png";

const SUBJECTS = [
  "[SC] Daily Conversation",
  "[LS1] Listening & Speaking",
  "[DC] Daily Conversation",
  "[PP] Pronunciation",
  "[SF] Speech Fluency",
  "[PP102] Pronunciation - R controlled vowels",
  "[EP] Exam Prep",
  "[TL] Trial Lesson & Assessment",
  "[CJ] Counseling Session",
];

const INSTRUCTORS = [
  { id: 1, name: "Ralph Dela Cruz", points: 3, specialty: "[SC], [LS1], [DC]", active: true },
  { id: 2, name: "Christine Magsino", points: 6, specialty: "[EP], [PP], [SF]", active: true },
  { id: 3, name: "Ashley Tanaka", points: 4, specialty: "[LS1], [PP], [EP]", active: true },
  { id: 4, name: "Sandra Ramos", points: 7, specialty: "[DC], [SC], [EP]", active: true },
  { id: 5, name: "Meg Santos", points: 5, specialty: "[SC], [PP], [TL]", active: true },
  { id: 6, name: "Mark Villanueva", points: 3, specialty: "[SF], [PP102], [DC]", active: true },
  { id: 7, name: "Mika Sumiyoshi", points: 6, specialty: "[LS1], [EP], [SC]", active: true },
  { id: 8, name: "Hannah Kim", points: 4, specialty: "[DC], [PP], [SF]", active: true },
  { id: 9, name: "Catherine Alegre", points: 7, specialty: "[LS1], [EP], [TL]", active: true },
  { id: 10, name: "Arei Castor", points: 5, specialty: "[PP], [DC], [CJ]", active: true },
  { id: 11, name: "Mikaela Antonio", points: 6, specialty: "[SC], [PP102], [EP]", active: true },
  { id: 12, name: "Michelle Tanagao", points: 4, specialty: "[LS1], [SF], [DC]", active: true },
];

const TIME_SLOTS = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const BOOKING_DAYS = Array.from({ length: 14 }, (_, idx) => {
  const base = new Date();
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + idx);
  return {
    key: date.toISOString().slice(0, 10),
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    label: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
  };
});
const BOOKING_TIME_SLOTS = Array.from({ length: 24 }, (_, hour) =>
  `${hour.toString().padStart(2, "0")}:00`
);
const TIME_ZONES = [
  { label: "Tokyo (UTC+09:00)", value: "Asia/Tokyo" },
  { label: "Manila (UTC+08:00)", value: "Asia/Manila" },
  { label: "UTC", value: "UTC" },
  { label: "Los Angeles (UTC-08:00)", value: "America/Los_Angeles" },
  { label: "New York (UTC-05:00)", value: "America/New_York" },
];
const TEACHER_INTRO_VIDEO = "https://www.youtube.com/embed/Lfh7aA6hPtY?autoplay=1&mute=0";
const TEACHER_MODAL_IMAGES = [teacherPhoto1, teacherPhoto2, teacherPhoto3, teacherPhoto4];
// One portrait per instructor — keys verified to return real teacher photos
// (this endpoint also serves placeholders, graphics and stock images).
const TEACHER_LIST_IMAGES = [
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=181",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=178",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=177",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=176",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=175",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=174",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=120",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=121",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=122",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=184",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=126",
  "https://brighture-edu.com/api.html?model=teacher&cmd=image&key=170",
];
const TEACHER_PROFILE_BY_ID = {
  1: {
    major: "Education, Literature",
    expertise: "Pronunciation, Grammar, Beginners, Advanced, TOEIC, Writing",
    subjectsTaught:
      "[SF] Speech Fluency, [DC] Daily Conversation, [PP101] Pronunciation - Vowels, [PP102] Pronunciation - R-controlled Vowels, [PP201] Pronunciation - Consonants, [PP202] Pronunciation - American T",
    selfIntro:
      "Hello! I am an ESL teacher dedicated to helping learners speak English with clarity and confidence. My classes are practical, engaging, and interactive so you can level up one step at a time.",
  },
};

const SORT_STORAGE_KEY = "student_view_v3_sort_mode";
const FAVORITES_STORAGE_KEY = "student_view_v3_favorites";
const todayKey = BOOKING_DAYS[0].key;

const getTeacherProfile = (teacher) =>
  TEACHER_PROFILE_BY_ID[teacher.id] ?? {
    major: "Education, Language Teaching",
    expertise: "Conversation, Pronunciation, Grammar, Writing",
    subjectsTaught: teacher.specialty,
    selfIntro:
      "Hello! I focus on practical English communication and personalized feedback. We will build your confidence step by step with clear goals for each lesson.",
  };

const getTeacherModalImage = (teacher) =>
  TEACHER_MODAL_IMAGES[(teacher.id - 1) % TEACHER_MODAL_IMAGES.length] ?? studentImage;

const getTeacherListImage = (teacher) =>
  TEACHER_LIST_IMAGES[(teacher.id - 1) % TEACHER_LIST_IMAGES.length] ?? studentImage;

const getSlotStatus = (teacherId, dayIndex, slotIndex) => {
  const seed = (teacherId * 17 + dayIndex * 11 + slotIndex * 7) % 10;
  return seed > 2 ? "Available" : "Reserved";
};

const getWaitlistBaseCount = (teacherId, dayIndex) => ((teacherId * 3 + dayIndex * 2) % 8) + 1;

const getInitialSortMode = () => {
  const saved = window.localStorage.getItem(SORT_STORAGE_KEY);
  if (saved === "name_asc" || saved === "points_low" || saved === "points_high") {
    return saved;
  }
  return "name_asc";
};

const getInitialFavorites = () => {
  const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => Number.isInteger(id));
    }
  } catch {
    return [];
  }

  return [];
};

const toDateLabel = (dateKey) => {
  const parsed = new Date(`${dateKey}T00:00:00`);
  return parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const getTeacherStrengthRows = (teacher) => {
  const tags = teacher.specialty
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return tags.map((subject, idx) => {
    const strongRate = 68 + ((teacher.id * 13 + idx * 11) % 28);
    const offeredRate = Math.min(100, strongRate + 6 + ((teacher.id + idx) % 8));
    return { subject, strongRate, offeredRate };
  });
};

const search = ref("");
const selectedTeacherId = ref("");
const selectedSubjects = ref([]);
const selectedSubjectForSlotSearch = ref("");
const selectedTime = ref("");
const selectedTimeZone = ref("Asia/Tokyo");
const selectedDate = ref(todayKey);
const availabilityMode = ref("all_active");
const favorites = ref(getInitialFavorites());
const sortMode = ref(getInitialSortMode());
const slotOverrides = ref({});
const profileTeacher = ref(null);
const hoveredBookingCell = ref(null);
const bookingStep = ref("profile");
const reservationDraft = ref(null);
const myPoints = ref(4);
const reservations = ref([]);
const waitlistTeacherId = ref(INSTRUCTORS[0].id);
const waitlistJoined = ref({});
const waitlistNotifications = ref(false);

watch(sortMode, (value) => {
  window.localStorage.setItem(SORT_STORAGE_KEY, value);
});

watch(
  favorites,
  (value) => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(value));
  },
  { deep: true }
);

const selectedDayIndex = computed(() =>
  Math.max(
    0,
    BOOKING_DAYS.findIndex((day) => day.key === selectedDate.value)
  )
);
const selectedSlotIndex = computed(() =>
  selectedTime.value ? BOOKING_TIME_SLOTS.indexOf(selectedTime.value) : -1
);

const slotKey = (teacherId, dayIndex, slotIndex) => `${teacherId}-${dayIndex}-${slotIndex}`;

const getDisplaySlotStatus = (teacherId, dayIndex, slotIndex) => {
  const key = slotKey(teacherId, dayIndex, slotIndex);
  return slotOverrides.value[key] ?? getSlotStatus(teacherId, dayIndex, slotIndex);
};

const hasOpenSlotOnDay = (teacher, dayIndex) =>
  TIME_SLOTS.some((_, slotIndex) => getDisplaySlotStatus(teacher.id, dayIndex, slotIndex) !== "Reserved");

const hasOpenSlotAfterDay = (teacher, dayIndex) => {
  for (let index = dayIndex + 1; index < BOOKING_DAYS.length; index += 1) {
    if (hasOpenSlotOnDay(teacher, index)) {
      return true;
    }
  }
  return false;
};

const matchesSpecificDateTime = (teacher) => {
  if (selectedSlotIndex.value < 0) {
    return true;
  }
  return getDisplaySlotStatus(teacher.id, selectedDayIndex.value, selectedSlotIndex.value) !== "Reserved";
};

const filteredInstructors = computed(() => {
  const loweredSearch = search.value.trim().toLowerCase();

  const filtered = INSTRUCTORS.filter((teacher) => {
    if (!teacher.active) {
      return false;
    }

    if (selectedTeacherId.value && String(teacher.id) !== selectedTeacherId.value) {
      return false;
    }

    const nameMatch = loweredSearch === "" || teacher.name.toLowerCase().includes(loweredSearch);
    if (!nameMatch) {
      return false;
    }

    const multiSubjectMatch =
      selectedSubjects.value.length === 0 ||
      selectedSubjects.value.some((subject) => teacher.specialty.includes(subject.slice(0, 5)));
    if (!multiSubjectMatch) {
      return false;
    }

    const slotSubjectMatch =
      !selectedSubjectForSlotSearch.value ||
      teacher.specialty.includes(selectedSubjectForSlotSearch.value.slice(0, 5));
    if (!slotSubjectMatch) {
      return false;
    }

    if (!matchesSpecificDateTime(teacher)) {
      return false;
    }

    if (availabilityMode.value === "with_slots_on_date") {
      return hasOpenSlotOnDay(teacher, selectedDayIndex.value);
    }
    if (availabilityMode.value === "with_future_slots") {
      return hasOpenSlotAfterDay(teacher, selectedDayIndex.value);
    }

    return true;
  });

  return filtered.sort((left, right) => {
    if (sortMode.value === "points_low") {
      return left.points - right.points || left.name.localeCompare(right.name);
    }
    if (sortMode.value === "points_high") {
      return right.points - left.points || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
});

const openTeacherProfile = (teacher) => {
  profileTeacher.value = teacher;
  bookingStep.value = "profile";
  reservationDraft.value = null;
  hoveredBookingCell.value = null;
};

const closeTeacherProfile = () => {
  profileTeacher.value = null;
  bookingStep.value = "profile";
  reservationDraft.value = null;
  hoveredBookingCell.value = null;
};

const toggleSubject = (subject) => {
  selectedSubjects.value = selectedSubjects.value.includes(subject)
    ? selectedSubjects.value.filter((item) => item !== subject)
    : [...selectedSubjects.value, subject];
};

const toggleFavorite = (teacherId) => {
  favorites.value = favorites.value.includes(teacherId)
    ? favorites.value.filter((id) => id !== teacherId)
    : [...favorites.value, teacherId];
};

const beginReservation = (teacher, dayIndex, slotIndex) => {
  if (getDisplaySlotStatus(teacher.id, dayIndex, slotIndex) !== "Available") {
    return;
  }

  reservationDraft.value = {
    teacher,
    dayIndex,
    slotIndex,
    subject: selectedSubjectForSlotSearch.value || SUBJECTS[0],
    timeZone: selectedTimeZone.value,
  };
  bookingStep.value = "details";
};

const confirmReservation = () => {
  if (!reservationDraft.value) {
    return;
  }

  const requiredPoints = reservationDraft.value.teacher.points;
  if (myPoints.value < requiredPoints) {
    return;
  }

  const key = slotKey(
    reservationDraft.value.teacher.id,
    reservationDraft.value.dayIndex,
    reservationDraft.value.slotIndex
  );
  slotOverrides.value = { ...slotOverrides.value, [key]: "Selected" };
  myPoints.value -= requiredPoints;
  reservations.value = [
    {
      id: Date.now(),
      teacherId: reservationDraft.value.teacher.id,
      teacherName: reservationDraft.value.teacher.name,
      dayIndex: reservationDraft.value.dayIndex,
      slotIndex: reservationDraft.value.slotIndex,
      subject: reservationDraft.value.subject,
      timeZone: reservationDraft.value.timeZone,
      pointsUsed: requiredPoints,
    },
    ...reservations.value,
  ];
  bookingStep.value = "complete";
};

const cancelReservation = (reservationId) => {
  const target = reservations.value.find((item) => item.id === reservationId);
  if (!target) {
    return;
  }

  const key = slotKey(target.teacherId, target.dayIndex, target.slotIndex);
  const next = { ...slotOverrides.value };
  delete next[key];
  slotOverrides.value = next;
  reservations.value = reservations.value.filter((item) => item.id !== reservationId);
};

const selectedWaitlistCount = computed(
  () =>
    getWaitlistBaseCount(waitlistTeacherId.value, selectedDayIndex.value) +
    (waitlistJoined.value[waitlistTeacherId.value] ? 1 : 0)
);

const waitlistAvailableTeachers = computed(() =>
  filteredInstructors.value.filter((teacher) => hasOpenSlotOnDay(teacher, selectedDayIndex.value))
);

const toggleWaitlistJoined = () => {
  waitlistJoined.value = {
    ...waitlistJoined.value,
    [waitlistTeacherId.value]: !waitlistJoined.value[waitlistTeacherId.value],
  };
};
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#e2e8f0_45%,_#f8fafc)] px-3 py-5 text-slate-800 sm:px-6">
    <div class="mx-auto max-w-[1320px] space-y-5">
      <section class="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
        <div class="bg-gradient-to-r from-amber-100 via-rose-50 to-sky-100 px-4 py-5 sm:px-6 sm:py-6">
          <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Student Panel 3</p>
          <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            My Brighture - Reservation & Cancellation
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            Mobile-friendly instructor list with popup booking, waitlist, and reservation completion actions.
          </p>
        </div>

        <div class="space-y-4 p-4 sm:p-5">
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
              v-model="availabilityMode"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all_active">All active instructors</option>
              <option value="with_slots_on_date">Instructors with slots on selected date (booked included)</option>
              <option value="with_future_slots">Only instructors with slots after selected date</option>
            </select>

            <select
              v-model="selectedTeacherId"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All instructors</option>
              <option v-for="teacher in INSTRUCTORS" :key="`pick-${teacher.id}`" :value="String(teacher.id)">
                {{ teacher.name }}
              </option>
            </select>

            <input
              type="text"
              placeholder="Free word search"
              v-model="search"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <select
              v-model="sortMode"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="name_asc">Sort by Name (A-Z)</option>
              <option value="points_low">Sort by Points (Low to High)</option>
              <option value="points_high">Sort by Points (High to Low)</option>
            </select>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
              <span class="text-xs font-semibold uppercase text-slate-500">Date</span>
              <input
                type="date"
                :min="BOOKING_DAYS[0].key"
                :max="BOOKING_DAYS[BOOKING_DAYS.length - 1].key"
                :value="selectedDate"
                @change="(event) => (selectedDate = event.target.value || BOOKING_DAYS[0].key)"
                class="h-10 w-full border-0 bg-transparent text-sm outline-none"
              />
            </div>

            <select
              v-model="selectedTime"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Any time</option>
              <option v-for="slot in BOOKING_TIME_SLOTS" :key="`pull-${slot}`" :value="slot">
                {{ slot }}
              </option>
            </select>

            <select
              v-model="selectedTimeZone"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="zone in TIME_ZONES" :key="zone.value" :value="zone.value">
                {{ zone.label }}
              </option>
            </select>

            <select
              v-model="selectedSubjectForSlotSearch"
              class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Any subject</option>
              <option v-for="subject in SUBJECTS" :key="`subject-filter-${subject}`" :value="subject">
                {{ subject }}
              </option>
            </select>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="subject in SUBJECTS" :key="subject" class="flex items-center gap-2 text-xs text-slate-700 sm:text-sm">
              <input
                type="checkbox"
                :checked="selectedSubjects.includes(subject)"
                @change="toggleSubject(subject)"
                class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>{{ subject }}</span>
            </label>
          </div>

          <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 sm:text-sm">
            Showing {{ filteredInstructors.length }} instructors for {{ toDateLabel(selectedDate) }}
            {{ selectedTime ? ` at ${selectedTime}` : " (all times)" }} in {{ selectedTimeZone }}.
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="m-0 text-base font-semibold text-slate-900">My Reservation List</h2>
          <span class="text-xs text-slate-500">Easy cancellation on smartphone</span>
        </div>
        <div class="space-y-2">
          <div v-if="reservations.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            No reservations yet.
          </div>
          <div
            v-for="reservation in reservations"
            :key="reservation.id"
            class="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="text-sm text-slate-700">
              <p class="m-0 font-semibold text-slate-900">{{ reservation.teacherName }}</p>
              <p class="m-0 mt-1 text-xs text-slate-600">
                {{ BOOKING_DAYS[reservation.dayIndex]?.label }} {{ BOOKING_TIME_SLOTS[reservation.slotIndex] }} | {{ reservation.subject }}
              </p>
              <p class="m-0 mt-1 text-xs text-slate-600">Time zone: {{ reservation.timeZone }}</p>
            </div>
            <button
              type="button"
              @click="cancelReservation(reservation.id)"
              class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Cancel reservation
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="m-0 text-base font-semibold text-slate-900">Waitlist</h2>
          <label class="inline-flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              v-model="waitlistNotifications"
              class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Notifications
          </label>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="space-y-2">
            <select
              :value="String(waitlistTeacherId)"
              @change="(event) => (waitlistTeacherId = Number(event.target.value))"
              class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="teacher in INSTRUCTORS" :key="`wait-${teacher.id}`" :value="teacher.id">
                {{ teacher.name }}
              </option>
            </select>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              Students on waiting list: <span class="font-semibold">{{ selectedWaitlistCount }}</span>
            </div>
            <button
              type="button"
              @click="toggleWaitlistJoined"
              class="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              {{ waitlistJoined[waitlistTeacherId] ? "Leave waitlist" : "Join waitlist" }}
            </button>
          </div>

          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Available instructors below</p>
            <div class="mt-2 space-y-1 text-sm text-slate-700">
              <p v-for="teacher in waitlistAvailableTeachers.slice(0, 6)" :key="`wl-${teacher.id}`" class="m-0">
                {{ teacher.name }}
              </p>
              <p v-if="waitlistAvailableTeachers.length === 0" class="m-0 text-slate-500">
                No matching instructors available in this criterion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="teacher in filteredInstructors"
          :key="teacher.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-3">
            <button
              type="button"
              class="flex items-center gap-3 border-0 bg-transparent p-0 text-left"
              @click="openTeacherProfile(teacher)"
            >
              <img :src="getTeacherListImage(teacher)" :alt="teacher.name" class="h-14 w-14 rounded-full object-cover" />
              <div>
                <p class="m-0 text-sm font-semibold text-slate-900">{{ teacher.name }}</p>
                <p class="m-0 mt-1 text-xs text-slate-500">{{ teacher.specialty }}</p>
              </div>
            </button>
            <button
              @click="toggleFavorite(teacher.id)"
              :class="`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
                favorites.includes(teacher.id)
                  ? 'border-amber-300 bg-amber-100 text-amber-600'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-amber-500'
              }`"
              :aria-label="`Toggle favorite for ${teacher.name}`"
            >
              ★
            </button>
          </div>

          <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">Points: {{ teacher.points }}</div>

          <button
            type="button"
            @click="openTeacherProfile(teacher)"
            class="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            View profile
          </button>
        </article>
      </section>

      <section v-if="filteredInstructors.length === 0" class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No instructors match your filters. Try clearing subject filters or search text.
      </section>
    </div>

    <div
      v-if="profileTeacher"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/55 p-4 pt-8"
      @click="closeTeacherProfile"
    >
      <div
        class="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <div class="flex items-center gap-2">
            <button
              v-if="bookingStep !== 'profile'"
              type="button"
              @click="bookingStep = 'profile'"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </button>
            <h2 class="m-0 text-base font-semibold text-slate-900">{{ profileTeacher.name }}</h2>
          </div>
          <button
            @click="closeTeacherProfile"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <template v-if="bookingStep === 'profile'">
          <div class="grid gap-4 p-4 sm:grid-cols-[360px,1fr] sm:p-5">
            <div class="space-y-3">
              <img
                :src="getTeacherModalImage(profileTeacher)"
                :alt="profileTeacher.name"
                class="mx-auto aspect-video w-full object-cover"
              />
              <div class="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  class="h-full w-full"
                  :src="TEACHER_INTRO_VIDEO"
                  :title="`${profileTeacher.name} intro video`"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            <div class="space-y-3">
              <div class="overflow-hidden rounded-lg border border-slate-300 bg-white">
                <table class="w-full border-collapse text-left text-sm">
                  <tbody>
                    <tr>
                      <th class="w-[210px] border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                        Major at University
                      </th>
                      <td class="border-b border-slate-300 px-3 py-3 text-slate-700">{{ getTeacherProfile(profileTeacher).major }}</td>
                    </tr>
                    <tr>
                      <th class="border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                        Areas of Expertise
                      </th>
                      <td class="border-b border-slate-300 px-3 py-3 text-slate-700">{{ getTeacherProfile(profileTeacher).expertise }}</td>
                    </tr>
                    <tr>
                      <th class="border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                        Subjects Taught
                      </th>
                      <td class="border-b border-slate-300 px-3 py-3 text-slate-700">{{ getTeacherProfile(profileTeacher).subjectsTaught }}</td>
                    </tr>
                    <tr>
                      <th class="border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                        Required Points
                      </th>
                      <td class="px-3 py-3 text-slate-700">online {{ profileTeacher.points }} points</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="rounded-lg border border-slate-300 bg-white p-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Subject strengths and offered rate</p>
                <div class="mt-2 space-y-2 text-sm">
                  <div
                    v-for="row in getTeacherStrengthRows(profileTeacher)"
                    :key="`${profileTeacher.id}-${row.subject}`"
                    class="rounded-lg bg-slate-50 p-2"
                  >
                    <p class="m-0 font-semibold text-slate-800">{{ row.subject }}</p>
                    <p class="m-0 mt-1 text-xs text-slate-600">Strong subject fit: {{ row.strongRate }}%</p>
                    <p class="m-0 text-xs text-slate-600">Actually offered lessons: {{ row.offeredRate }}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="m-0 text-sm font-semibold text-slate-900 sm:text-base">
                {{ profileTeacher.name }} 2-Week Schedule
              </h3>
              <span class="text-xs text-slate-500">Click available slots to book</span>
            </div>

            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table
                class="min-w-[860px] w-full border-collapse text-xs sm:text-sm"
                @mouseleave="hoveredBookingCell = null"
              >
                <thead class="bg-slate-50">
                  <tr>
                    <th class="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600">
                      Time
                    </th>
                    <th
                      v-for="(day, dayIndex) in BOOKING_DAYS"
                      :key="`week-day-${day.key}`"
                      :class="`border-b border-r border-slate-200 px-3 py-2 text-center font-semibold text-slate-600 last:border-r-0 ${
                        hoveredBookingCell?.dayIndex === dayIndex ? 'bg-amber-100' : ''
                      }`"
                    >
                      <span class="block">{{ day.day }}</span>
                      <span class="block text-[10px] text-slate-500 sm:text-xs">{{ day.label }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(slot, slotIndex) in BOOKING_TIME_SLOTS" :key="`weekly-${slot}`">
                    <td
                      :class="`sticky left-0 z-10 border-b border-r border-slate-200 px-3 py-2 font-semibold text-slate-600 ${
                        hoveredBookingCell?.slotIndex === slotIndex ? 'bg-amber-100' : 'bg-white'
                      }`"
                    >
                      {{ slot }}
                    </td>
                    <td
                      v-for="(day, dayIndex) in BOOKING_DAYS"
                      :key="`weekly-${slot}-${day.key}`"
                      @mouseenter="hoveredBookingCell = { dayIndex, slotIndex }"
                      :class="`border-b border-r border-slate-200 px-2 py-2 text-center last:border-r-0 ${
                        hoveredBookingCell?.slotIndex === slotIndex && hoveredBookingCell?.dayIndex === dayIndex
                          ? 'bg-amber-100'
                          : hoveredBookingCell?.slotIndex === slotIndex || hoveredBookingCell?.dayIndex === dayIndex
                            ? 'bg-amber-50'
                            : 'bg-white'
                      }`"
                    >
                      <button
                        type="button"
                        :disabled="getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) !== 'Available'"
                        @click="beginReservation(profileTeacher, dayIndex, slotIndex)"
                        :class="`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${
                          getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) === 'Available'
                            ? 'bg-[#f3c623] text-[#4b3a00]'
                            : getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) === 'Selected'
                              ? 'bg-primary text-white'
                              : 'bg-slate-200 text-slate-600'
                        } ${
                          getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) === 'Available'
                            ? 'cursor-pointer hover:brightness-95'
                            : 'cursor-default'
                        }`"
                      >
                        {{ getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <div v-if="bookingStep === 'details' && reservationDraft" class="space-y-4 p-4 sm:p-5">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="m-0 text-base font-semibold text-slate-900">Reservation details</h3>
              <button
                type="button"
                @click="bookingStep = 'profile'"
                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Back
              </button>
            </div>
            <p class="m-0 text-sm text-slate-700">Instructor: {{ reservationDraft.teacher.name }}</p>
            <p class="m-0 mt-1 text-sm text-slate-700">
              Date/Time: {{ BOOKING_DAYS[reservationDraft.dayIndex]?.label }} {{ BOOKING_TIME_SLOTS[reservationDraft.slotIndex] }}
            </p>
            <p class="m-0 mt-1 text-sm text-slate-700">Time zone: {{ reservationDraft.timeZone }}</p>
            <div class="mt-3">
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</label>
              <select
                v-model="reservationDraft.subject"
                class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option v-for="subject in SUBJECTS" :key="`reserve-subject-${subject}`" :value="subject">
                  {{ subject }}
                </option>
              </select>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="m-0 text-sm text-slate-700">Your points: <span class="font-semibold">{{ myPoints }}</span></p>
            <p class="m-0 mt-1 text-sm text-slate-700">
              Required points: <span class="font-semibold">{{ reservationDraft.teacher.points }}</span>
            </p>
            <div v-if="myPoints < reservationDraft.teacher.points" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Not enough points. Purchase additional points to continue.
              <button
                type="button"
                @click="myPoints += 5"
                class="mt-2 block rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Quick purchase +5 points
              </button>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              @click="bookingStep = 'profile'"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </button>
            <button
              type="button"
              :disabled="myPoints < reservationDraft.teacher.points"
              @click="confirmReservation"
              class="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm reservation
            </button>
          </div>
        </div>

        <div v-if="bookingStep === 'complete' && reservationDraft" class="space-y-4 p-4 sm:p-5">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 class="m-0 text-base font-semibold text-emerald-900">Reservation completed</h3>
            <p class="m-0 mt-2 text-sm text-emerald-900">
              {{ reservationDraft.teacher.name }} on {{ BOOKING_DAYS[reservationDraft.dayIndex]?.label }} at {{ BOOKING_TIME_SLOTS[reservationDraft.slotIndex] }} ({{ reservationDraft.timeZone }})
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="closeTeacherProfile"
              class="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Return to reservation list screen
            </button>
            <button
              type="button"
              @click="bookingStep = 'profile'"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Return to instructor details
            </button>
            <button
              type="button"
              @click="window.location.href = '/'"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to My Page
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
