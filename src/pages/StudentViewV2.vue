<script setup>
import { imageForKey } from '@/lib/teacherImages';
import { ref, computed, watch } from "vue";
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
  { id: 1, name: "Ralph Dela Cruz", points: 3, specialty: "[SC], [LS1], [DC]" },
  { id: 2, name: "Christine Magsino", points: 6, specialty: "[EP], [PP], [SF]" },
  { id: 3, name: "Ashley Tanaka", points: 4, specialty: "[LS1], [PP], [EP]" },
  { id: 4, name: "Sandra Ramos", points: 7, specialty: "[DC], [SC], [EP]" },
  { id: 5, name: "Meg Santos", points: 5, specialty: "[SC], [PP], [TL]" },
  { id: 6, name: "Mark Villanueva", points: 3, specialty: "[SF], [PP102], [DC]" },
  { id: 7, name: "Mika Sumiyoshi", points: 6, specialty: "[LS1], [EP], [SC]" },
  { id: 8, name: "Hannah Kim", points: 4, specialty: "[DC], [PP], [SF]" },
  { id: 9, name: "Catherine Alegre", points: 7, specialty: "[LS1], [EP], [TL]" },
  { id: 10, name: "Arei Castor", points: 5, specialty: "[PP], [DC], [CJ]" },
  { id: 11, name: "Mikaela Antonio", points: 6, specialty: "[SC], [PP102], [EP]" },
  { id: 12, name: "Michelle Tanagao", points: 4, specialty: "[LS1], [SF], [DC]" },
];

const TIME_SLOTS = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const DAY_CAROUSEL_VISIBLE = 7;

const buildDays = () => {
  const base = new Date();
  return Array.from({ length: 14 }, (_, idx) => {
    const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + idx);
    return {
      key: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
};

const DAYS = buildDays();
const TEACHER_INTRO_VIDEO = "https://www.youtube.com/embed/Lfh7aA6hPtY?autoplay=1&mute=0";
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
const TEACHER_MODAL_IMAGES = [teacherPhoto1, teacherPhoto2, teacherPhoto3, teacherPhoto4];
// One portrait per instructor — keys verified to return real teacher photos
// (this endpoint also serves placeholders, graphics and stock images).
const TEACHER_LIST_IMAGES = [
  imageForKey(181),
  imageForKey(178),
  imageForKey(177),
  imageForKey(176),
  imageForKey(175),
  imageForKey(174),
  imageForKey(120),
  imageForKey(121),
  imageForKey(122),
  imageForKey(184),
  imageForKey(126),
  imageForKey(170),
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

const shuffleIds = (ids) => {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const SORT_STORAGE_KEY = "student_view_v2_sort_mode";
const FAVORITES_STORAGE_KEY = "student_view_v2_favorites";

const getInitialSortMode = () => {
  const saved = window.localStorage.getItem(SORT_STORAGE_KEY);
  if (
    saved === "none" ||
    saved === "new" ||
    saved === "old" ||
    saved === "points_low" ||
    saved === "points_high"
  ) {
    return saved;
  }
  return "new";
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

const selectedDay = ref(0);
const dayWindowStart = ref(0);
const search = ref("");
const selectedSubjects = ref([]);
const favorites = ref(getInitialFavorites());
const sortMode = ref(getInitialSortMode());
const slotOverrides = ref({});
const randomOrder = shuffleIds(INSTRUCTORS.map((teacher) => teacher.id));
const profileTeacher = ref(null);
const isWeekScheduleOpen = ref(false);
const hoveredBookingCell = ref(null);

watch(
  sortMode,
  (value) => {
    window.localStorage.setItem(SORT_STORAGE_KEY, value);
  },
  { immediate: true }
);

watch(
  favorites,
  (value) => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(value));
  },
  { immediate: true }
);

const openTeacherProfile = (teacher) => {
  profileTeacher.value = teacher;
  isWeekScheduleOpen.value = false;
  hoveredBookingCell.value = null;
};

const filteredInstructors = computed(() => {
  const filtered = INSTRUCTORS.filter((teacher) => {
    const nameMatch = teacher.name.toLowerCase().includes(search.value.toLowerCase());
    const subjectMatch =
      selectedSubjects.value.length === 0 ||
      selectedSubjects.value.some((subject) => teacher.specialty.includes(subject.slice(0, 5)));
    return nameMatch && subjectMatch;
  });

  return filtered.sort((left, right) => {
    const leftFav = favorites.value.includes(left.id) ? 1 : 0;
    const rightFav = favorites.value.includes(right.id) ? 1 : 0;
    if (leftFav !== rightFav) {
      return rightFav - leftFav;
    }

    if (sortMode.value === "none") {
      return randomOrder.indexOf(left.id) - randomOrder.indexOf(right.id);
    }
    if (sortMode.value === "points_low") {
      return left.points - right.points || left.id - right.id;
    }
    if (sortMode.value === "points_high") {
      return right.points - left.points || right.id - left.id;
    }
    return sortMode.value === "new" ? right.id - left.id : left.id - right.id;
  });
});

const slotKey = (teacherId, dayIndex, slotIndex) => `${teacherId}-${dayIndex}-${slotIndex}`;

const getDisplaySlotStatus = (teacherId, dayIndex, slotIndex) => {
  const key = slotKey(teacherId, dayIndex, slotIndex);
  return slotOverrides.value[key] ?? getSlotStatus(teacherId, dayIndex, slotIndex);
};

const handleSlotClick = (teacherId, dayIndex, slotIndex) => {
  const key = slotKey(teacherId, dayIndex, slotIndex);
  const current = getDisplaySlotStatus(teacherId, dayIndex, slotIndex);
  if (current !== "Available") {
    return;
  }
  slotOverrides.value = { ...slotOverrides.value, [key]: "Selected" };
};

const maxDayWindowStart = Math.max(0, DAYS.length - DAY_CAROUSEL_VISIBLE);
const visibleDays = computed(() =>
  DAYS.slice(dayWindowStart.value, dayWindowStart.value + DAY_CAROUSEL_VISIBLE)
);

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

const selectedDayLabel = computed(() =>
  DAYS[selectedDay.value] ? `${DAYS[selectedDay.value].day}, ${DAYS[selectedDay.value].label}` : ""
);

const teacherCards = computed(() =>
  filteredInstructors.value.map((teacher) => {
    const statuses = TIME_SLOTS.map((_, slotIndex) =>
      getDisplaySlotStatus(teacher.id, selectedDay.value, slotIndex)
    );
    const availableCount = statuses.filter((status) => status === "Available").length;
    return {
      teacher,
      statuses,
      availableCount,
    };
  })
);

const closeProfile = () => {
  profileTeacher.value = null;
  isWeekScheduleOpen.value = false;
  hoveredBookingCell.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#e2e8f0_45%,_#f8fafc)] px-3 py-5 text-slate-800 sm:px-6">
    <div class="mx-auto max-w-[1320px] space-y-5">
      <section class="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
        <div class="bg-gradient-to-r from-amber-100 via-rose-50 to-sky-100 px-4 py-5 sm:px-6 sm:py-6">
          <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Student Panel 2</p>
          <h1 class="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Find the right teacher faster</h1>
          <p class="mt-2 text-sm text-slate-600">
            Teachers are arranged as responsive cards with instant slot visibility for your selected day.
          </p>
        </div>

        <div class="space-y-4 p-4 sm:p-5">
          <div class="flex justify-center">
            <div class="relative w-full max-w-[760px]">
              <button
                type="button"
                @click="dayWindowStart = Math.max(0, dayWindowStart - 1)"
                :disabled="dayWindowStart === 0"
                class="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Show previous days"
              >
                <span aria-hidden="true">◀</span>
              </button>
              <button
                type="button"
                @click="dayWindowStart = Math.min(maxDayWindowStart, dayWindowStart + 1)"
                :disabled="dayWindowStart >= maxDayWindowStart"
                class="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Show next days"
              >
                <span aria-hidden="true">▶</span>
              </button>
              <div class="grid grid-cols-4 gap-2 px-9 sm:grid-cols-7">
                <button
                  v-for="(day, idx) in visibleDays"
                  :key="day.key"
                  @click="selectedDay = dayWindowStart + idx"
                  :class="[
                    'rounded-lg border px-2 py-2 text-xs font-semibold transition sm:text-sm',
                    selectedDay === dayWindowStart + idx
                      ? 'border-slate-700 bg-slate-700 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
                  ]"
                >
                  <span class="block">{{ day.label }}</span>
                  <span class="block">{{ day.day }}</span>
                </button>
              </div>
            </div>
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

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search instructor name"
              v-model="search"
              class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:ml-1">
              <span class="text-sm font-semibold text-slate-600">Sort:</span>
              <select
                v-model="sortMode"
                class="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="none">None</option>
                <option value="new">New Teachers</option>
                <option value="old">Old Teachers</option>
                <option value="points_low">Points Low to High</option>
                <option value="points_high">Points High to Low</option>
              </select>
            </div>
          </div>

          <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 sm:text-sm">
            Selected day: {{ selectedDayLabel }} • Matching teachers: {{ teacherCards.length }}
          </div>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="{ teacher, statuses, availableCount } in teacherCards"
          :key="teacher.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-3">
            <button
              type="button"
              class="flex items-center gap-3 border-0 bg-transparent p-0 text-left"
              @click="openTeacherProfile(teacher)"
            >
              <img
                :src="getTeacherListImage(teacher)"
                :alt="teacher.name"
                class="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p class="m-0 text-sm font-semibold text-slate-900">{{ teacher.name }}</p>
                <p class="m-0 mt-1 text-xs text-slate-500">{{ teacher.specialty }}</p>
              </div>
            </button>
            <button
              @click="toggleFavorite(teacher.id)"
              :class="[
                'inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition',
                favorites.includes(teacher.id)
                  ? 'border-amber-300 bg-amber-100 text-amber-600'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-amber-500',
              ]"
              :aria-label="`Toggle favorite for ${teacher.name}`"
            >
              ★
            </button>
          </div>

          <div class="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <span>Points: {{ teacher.points }}</span>
            <span class="font-semibold text-emerald-700">{{ availableCount }} slots available</span>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              v-for="(slot, slotIndex) in TIME_SLOTS"
              :key="`${teacher.id}-${slot}`"
              type="button"
              :disabled="statuses[slotIndex] !== 'Available'"
              @click="handleSlotClick(teacher.id, selectedDay, slotIndex)"
              :class="[
                'rounded-lg px-2 py-2 text-[11px] font-semibold',
                statuses[slotIndex] === 'Available'
                  ? 'bg-[#f3c623] text-[#4b3a00] hover:brightness-95'
                  : statuses[slotIndex] === 'Selected'
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 text-slate-600',
                statuses[slotIndex] === 'Available' ? 'cursor-pointer' : 'cursor-default',
              ]"
            >
              <span class="block">{{ slot }}</span>
              <span class="block">{{ statuses[slotIndex] }}</span>
            </button>
          </div>
        </article>
      </section>

      <section
        v-if="teacherCards.length === 0"
        class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
      >
        No instructors match your filters. Try clearing subject filters or search text.
      </section>
    </div>

    <div
      v-if="profileTeacher"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/55 p-4 pt-8"
      @click="closeProfile"
    >
      <div
        class="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <h2 class="m-0 text-base font-semibold text-slate-900">{{ profileTeacher.name }}</h2>
          <button
            @click="closeProfile"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

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
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
            <button
              type="button"
              @click="
                isWeekScheduleOpen = !isWeekScheduleOpen;
                hoveredBookingCell = null;
              "
              class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              {{ isWeekScheduleOpen ? "Hide Schedule" : "Book a Lesson" }}
            </button>
          </div>

          <div class="overflow-hidden rounded-lg border border-slate-300 bg-white">
            <table class="hidden w-full border-collapse text-left text-sm sm:table">
              <tbody>
                <tr>
                  <th class="w-[210px] border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                    Major at University
                  </th>
                  <td class="border-b border-slate-300 px-3 py-3 text-slate-700">
                    {{ getTeacherProfile(profileTeacher).major }}
                  </td>
                </tr>
                <tr>
                  <th class="border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                    Areas of Expertise
                  </th>
                  <td class="border-b border-slate-300 px-3 py-3 text-slate-700">
                    {{ getTeacherProfile(profileTeacher).expertise }}
                  </td>
                </tr>
                <tr>
                  <th class="border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                    Subjects Taught
                  </th>
                  <td class="border-b border-slate-300 px-3 py-3 text-slate-700">
                    {{ getTeacherProfile(profileTeacher).subjectsTaught }}
                  </td>
                </tr>
                <tr>
                  <th class="border-b border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                    Required Points
                  </th>
                  <td class="border-b border-slate-300 px-3 py-3 text-slate-700">
                    online {{ profileTeacher.points }} points
                  </td>
                </tr>
                <tr>
                  <th class="border-r border-slate-300 bg-slate-100 px-3 py-3 align-top font-semibold text-slate-700">
                    Self-introduction Comment
                  </th>
                  <td class="px-3 py-3 leading-relaxed text-slate-700">
                    {{ getTeacherProfile(profileTeacher).selfIntro }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="space-y-2 p-3 text-sm sm:hidden">
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Major at University
                </p>
                <p class="mt-1 m-0 text-slate-700">{{ getTeacherProfile(profileTeacher).major }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Areas of Expertise
                </p>
                <p class="mt-1 m-0 text-slate-700">{{ getTeacherProfile(profileTeacher).expertise }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subjects Taught
                </p>
                <p class="mt-1 m-0 text-slate-700">{{ getTeacherProfile(profileTeacher).subjectsTaught }}</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Required Points
                </p>
                <p class="mt-1 m-0 text-slate-700">online {{ profileTeacher.points }} points</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Self-introduction Comment
                </p>
                <p class="mt-1 m-0 text-slate-700">{{ getTeacherProfile(profileTeacher).selfIntro }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isWeekScheduleOpen" class="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
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
                    :class="[
                      'border-b border-r border-slate-200 px-3 py-2 text-center font-semibold text-slate-600 last:border-r-0',
                      hoveredBookingCell?.dayIndex === dayIndex ? 'bg-amber-100' : '',
                    ]"
                  >
                    <span class="block">{{ day.day }}</span>
                    <span class="block text-[10px] text-slate-500 sm:text-xs">{{ day.label }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(slot, slotIndex) in BOOKING_TIME_SLOTS" :key="`weekly-${slot}`">
                  <td
                    :class="[
                      'sticky left-0 z-10 border-b border-r border-slate-200 px-3 py-2 font-semibold text-slate-600',
                      hoveredBookingCell?.slotIndex === slotIndex ? 'bg-amber-100' : 'bg-white',
                    ]"
                  >
                    {{ slot }}
                  </td>
                  <td
                    v-for="(day, dayIndex) in BOOKING_DAYS"
                    :key="`weekly-${slot}-${day.key}`"
                    @mouseenter="hoveredBookingCell = { dayIndex, slotIndex }"
                    :class="[
                      'border-b border-r border-slate-200 px-2 py-2 text-center last:border-r-0',
                      hoveredBookingCell?.slotIndex === slotIndex && hoveredBookingCell?.dayIndex === dayIndex
                        ? 'bg-amber-100'
                        : hoveredBookingCell?.slotIndex === slotIndex || hoveredBookingCell?.dayIndex === dayIndex
                          ? 'bg-amber-50'
                          : 'bg-white',
                    ]"
                  >
                    <button
                      type="button"
                      :disabled="getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) !== 'Available'"
                      @click="handleSlotClick(profileTeacher.id, dayIndex, slotIndex)"
                      :class="[
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs',
                        getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) === 'Available'
                          ? 'bg-[#f3c623] text-[#4b3a00]'
                          : getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) === 'Selected'
                            ? 'bg-primary text-white'
                            : 'bg-slate-200 text-slate-600',
                        getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) === 'Available'
                          ? 'cursor-pointer hover:brightness-95'
                          : 'cursor-default',
                      ]"
                    >
                      {{ getDisplaySlotStatus(profileTeacher.id, dayIndex, slotIndex) }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
