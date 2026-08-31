import studentImage from "@/assets/student-1.svg";
import { TEACHER_IMAGES, imageForKey } from "@/lib/teacherImages";

// Real Brighture instructors. `imageKey` is this teacher's own portrait key, so
// the photo can never drift onto the wrong name. Subjects and point costs are
// taken from the live booking page ("LS" there is this app's [LS1]).
export const INSTRUCTORS = [
  { id: 1, name: "Jirvy Dela Torre", imageKey: 184, points: 2, specialty: "[DC]" },
  { id: 2, name: "Jane Pasanting", imageKey: 178, points: 4, specialty: "[SF], [LS1], [DC], [RW], [PP101], [PP102], [PP201], [PP202], [EP], [TA]" },
  { id: 3, name: "Analyn Yosores", imageKey: 176, points: 4, specialty: "[SF], [LS1], [DC], [RW], [PP101], [PP102], [PP201], [PP202], [EP], [TA], [CS]" },
  { id: 4, name: "Sandra Auman", imageKey: 175, points: 5, specialty: "[SF], [LS1], [DC], [RW], [PP101], [PP102], [PP201], [PP202], [EP], [TA], [CS]" },
  { id: 5, name: "Nash Tatoy", imageKey: 139, points: 5, specialty: "[SF], [LS1], [DC], [RW], [PP101], [PP102], [PP201], [PP202], [EP], [TA], [CS]" },
];

// Display names for the exact subject codes requested:
export const SUBJECT_LABELS = {
  "[SF]": "[SF] Speech Fluency",
  "[LS1]": "[LS1] Listening & Speaking",
  "[DC]": "[DC] Daily Conversation",
  "[RW]": "[RW] Reading & Writing",
  "[SC]": "[SC] Social Conversation",
  "[PP101]": "[PP101] Pronunciation — Vowels",
  "[PP102]": "[PP102] Pronunciation — R-controlled Vowels",
  "[PP201]": "[PP201] Pronunciation — Consonants",
  "[PP202]": "[PP202] Pronunciation — American T",
  "[EP]": "[EP] Exam Prep",
  "[TA]": "[TA] Trial Lesson & Assessment",
  "[CS]": "[CS] Counseling Session",
};

export const ALL_SUBJECTS_OPTION = { label: "All Subjects", value: "ALL" };

export const toSubjectOption = (code) => ({ value: code, label: SUBJECT_LABELS[code] ?? code });

/** Codes a single teacher is listed as teaching, e.g. "[SC], [LS1]" -> ["[SC]", "[LS1]"]. */
export const parseSubjectCodes = (specialty) =>
  (specialty ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

/** Subject options for one teacher — only what they actually teach. */
export const getTeacherSubjectOptions = (teacher) => [
  ALL_SUBJECTS_OPTION,
  ...parseSubjectCodes(teacher?.specialty).map(toSubjectOption),
];

export const SUBJECT_FILTER_OPTIONS = [
  ALL_SUBJECTS_OPTION,
  ...[
    "[SF]",
    "[LS1]",
    "[DC]",
    "[RW]",
    "[SC]",
    "[PP101]",
    "[PP102]",
    "[PP201]",
    "[PP202]",
    "[EP]",
    "[TA]",
    "[CS]",
  ].map(toSubjectOption),
];

export const SUBJECT_CATEGORIES = [
  {
    id: "conversation",
    name: "Conversation & Fluency",
    shortName: "Conversation",
    icon: "💬",
    codes: ["[SF]", "[LS1]", "[DC]", "[RW]", "[SC]"],
    subjects: [
      { code: "[SF]", badge: "SF", name: "Speech Fluency", short: "Speech Fluency" },
      { code: "[DC]", badge: "DC", name: "Daily Conversation", short: "Daily Conversation" },
      { code: "[LS1]", badge: "LS1", name: "Listening & Speaking", short: "Listening & Speaking" },
      { code: "[SC]", badge: "SC", name: "Social Conversation", short: "Social Conversation" },
      { code: "[RW]", badge: "RW", name: "Reading & Writing", short: "Reading & Writing" },
    ],
  },
  {
    id: "pronunciation",
    name: "Pronunciation Series",
    shortName: "Pronunciation",
    icon: "🗣️",
    codes: ["[PP101]", "[PP102]", "[PP201]", "[PP202]"],
    subjects: [
      { code: "[PP101]", badge: "PP101", name: "Pronunciation — Vowels", short: "PP101 Vowels" },
      { code: "[PP102]", badge: "PP102", name: "Pronunciation — R-controlled Vowels", short: "PP102 R-Vowels" },
      { code: "[PP201]", badge: "PP201", name: "Pronunciation — Consonants", short: "PP201 Consonants" },
      { code: "[PP202]", badge: "PP202", name: "Pronunciation — American T", short: "PP202 American T" },
    ],
  },
  {
    id: "specialized",
    name: "Specialized & Assessment",
    shortName: "Specialized",
    icon: "🎯",
    codes: ["[EP]", "[TA]", "[CS]"],
    subjects: [
      { code: "[EP]", badge: "EP", name: "Exam Prep", short: "Exam Prep" },
      { code: "[TA]", badge: "TA", name: "Trial Lesson & Assessment", short: "Trial & Assessment" },
      { code: "[CS]", badge: "CS", name: "Counseling Session", short: "Counseling" },
    ],
  },
];

export const isSubjectMatchingFilter = (teacherSpecialty, filterValue) => {
  if (!filterValue || filterValue === "ALL") return true;
  if (filterValue.startsWith("CAT_")) {
    const catId = filterValue.replace("CAT_", "");
    const cat = SUBJECT_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      return cat.codes.some((code) => (teacherSpecialty ?? "").includes(code));
    }
  }
  return (teacherSpecialty ?? "").includes(filterValue);
};

export const getSubjectInstructorCount = (codeOrCat) => {
  return INSTRUCTORS.filter((teacher) => isSubjectMatchingFilter(teacher.specialty, codeOrCat)).length;
};

/** Every subject at least one instructor teaches, in the order first seen. */
export const ALL_TAUGHT_SUBJECT_OPTIONS = [
  ALL_SUBJECTS_OPTION,
  ...[...new Set(INSTRUCTORS.flatMap((teacher) => parseSubjectCodes(teacher.specialty)))].map(
    toSubjectOption
  ),
];

const buildDays = () => {
  const base = new Date();
  return Array.from({ length: 14 }, (_, idx) => {
    const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + idx);
    return {
      key: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      label: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
    };
  });
};

export const BOOKING_DAYS = buildDays();

// Half-hour granularity lets a lesson start on either the hour or the half-hour,
// which is what makes a true 30-min booking (vs. only ever booking a full hour) possible.
// A slot's start time must leave room for its own 30 min before the window closes.
const buildHalfHourSlots = (startHour, endHour) => {
  const slots = [];
  for (let totalMinutes = startHour * 60; totalMinutes + 30 <= endHour * 60; totalMinutes += 30) {
    const hh = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const mm = (totalMinutes % 60).toString().padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
};

export const WORK_START_HOUR = 8;
export const WORK_END_HOUR = 17;
export const LUNCH_HOUR = 12;

export const BOOKING_TIME_SLOTS = buildHalfHourSlots(WORK_START_HOUR, WORK_END_HOUR);

export const formatSlotTo12Hour = (timeStr) => {
  if (!timeStr) return "";
  const [hh, mm] = timeStr.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const displayHh = hh % 12 === 0 ? 12 : hh % 12;
  const displayMm = mm.toString().padStart(2, "0");
  return `${displayHh}:${displayMm} ${period}`;
};

export const addMinutesToSlotLabel = (slots, slotIndex, minutes) => {
  const [hh, mm] = slots[slotIndex].split(":").map(Number);
  const total = hh * 60 + mm + minutes;
  const endHh = Math.floor(total / 60) % 24;
  const endMm = total % 60;
  return `${endHh.toString().padStart(2, "0")}:${endMm.toString().padStart(2, "0")}`;
};

// Card and modal share one list so a teacher keeps the same face everywhere.
export const TEACHER_LIST_IMAGES = TEACHER_IMAGES;

export const getTeacherPhoto = (teacher) =>
  (teacher?.imageKey ? imageForKey(teacher.imageKey) : null) ??
  TEACHER_LIST_IMAGES[((teacher?.id ?? 1) - 1) % TEACHER_LIST_IMAGES.length] ??
  studentImage;

export const TEACHER_MODAL_IMAGES = TEACHER_IMAGES;

export const getTeacherModalImage = (teacher) => getTeacherPhoto(teacher);

export const TEACHER_INTRO_VIDEO = "https://www.youtube.com/embed/lGGJPOQzdW0";

export const TEACHER_PROFILE_BY_ID = {
  1: {
    major: "Education, English Linguistics",
    expertise: "[SF] Speech Fluency, [LS1] Listening & Speaking, [DC] Daily Conversation",
    subjectsTaught:
      "[SF] Speech Fluency, [LS1] Listening & Speaking, [DC] Daily Conversation, [PP101] Pronunciation — Vowels",
    selfIntro:
      "Hello! I am dedicated to helping learners speak English with clarity and confidence. My classes are practical, engaging, and interactive so you can level up one step at a time.",
  },
};

export const getTeacherProfile = (teacher) =>
  TEACHER_PROFILE_BY_ID[teacher.id] ?? {
    major: "Education, Language Teaching",
    expertise: "Conversation, Pronunciation, Fluency & Exam Prep",
    subjectsTaught: teacher.specialty,
    selfIntro:
      "Hello! I focus on practical English communication and personalized feedback. We will build your confidence step by step with clear goals for each lesson.",
  };

// Simple deterministic hash — different primes from startSeed so results are independent.
const pseudoRand = (a, b, c) => (a * 31 + b * 37 + c * 41) % 100;

// Returns info about a reserved block that STARTS at this slot, or null if not a start.
const getReservedBlockInfo = (teacherId, dayIndex, slotIndex) => {
  const startVal = pseudoRand(teacherId, dayIndex * 3, slotIndex * 5);
  if (startVal >= 25) return null; // 75% -> Available
  const durVal = pseudoRand(teacherId * 2 + 1, dayIndex * 7 + 3, slotIndex * 11 + 2);
  return { span: durVal < 50 ? 2 : 1 };
};

export const getSlotStatus = (teacherId, dayIndex, slotIndex) => {
  const slotLabel = BOOKING_TIME_SLOTS[slotIndex];
  const [hh, mm] = slotLabel.split(":").map(Number);
  if (hh === LUNCH_HOUR) {
    return "Unavailable";
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotStartMinutes = hh * 60 + mm;

  if (dayIndex < 0 || (dayIndex === 0 && slotStartMinutes < currentMinutes)) {
    return "Unavailable";
  }

  if (slotIndex > 0) {
    const prevInfo = getReservedBlockInfo(teacherId, dayIndex, slotIndex - 1);
    if (prevInfo && prevInfo.span === 2) {
      return "Reserved";
    }
  }

  const info = getReservedBlockInfo(teacherId, dayIndex, slotIndex);
  return info ? "Reserved" : "Available";
};

export const FAVORITES_STORAGE_KEY = "student_view_v4_favorites";

export const DURATIONS = [
  { minutes: 30, label: "30 min", spanSlots: 1 },
  { minutes: 60, label: "1 hour", spanSlots: 2 },
];

export const pointsForDuration = (teacher, minutes) =>
  minutes >= 60 ? teacher.points : Math.max(1, Math.ceil(teacher.points / 2));

export const CALENDAR_ROW_HEIGHT = 32;

export const computeCalendarBlocks = (teacherId, dayIndex, slots, getStatus) => {
  const blocks = [];
  let index = 0;
  while (index < slots.length) {
    const status = getStatus(teacherId, dayIndex, index);
    if (status !== "Selected") {
      index += 1;
      continue;
    }
    let span = 1;
    while (
      index + span < slots.length &&
      getStatus(teacherId, dayIndex, index + span) === "Selected"
    ) {
      span += 1;
    }
    blocks.push({ startIndex: index, span, status });
    index += span;
  }
  return blocks;
};

export const getInitialFavorites = () => {
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
