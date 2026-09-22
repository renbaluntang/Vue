import studentImage from "@/assets/student-1.svg";
import { TEACHER_IMAGES, imageForKey } from "@/lib/teacherImages";

// Real Brighture instructors. `imageKey` is this teacher's own portrait key, so
// the photo can never drift onto the wrong name. Subjects and point costs are
// taken from the live booking page ("LS" there is this app's [LS1]).
export const INSTRUCTORS = [
  {
    id: 1,
    name: "Jirvy Dela Torre",
    imageKey: 184,
    points: 2,
    rating: 4.98,
    lessonCount: 1240,
    specialty: "[SF], [LS1], [DC], [EP]",
  },
  {
    id: 2,
    name: "Jane Pasanting",
    imageKey: 178,
    points: 4,
    rating: 4.95,
    lessonCount: 980,
    specialty: "[DC], [SC], [PP101], [PP102], [PP201], [PP202]",
  },
  {
    id: 3,
    name: "Analyn Yosores",
    imageKey: 176,
    points: 4,
    rating: 4.92,
    lessonCount: 850,
    specialty: "[RW], [SC], [LS1], [TA]",
  },
  {
    id: 4,
    name: "Sandra Auman",
    imageKey: 175,
    points: 5,
    rating: 4.89,
    lessonCount: 1120,
    specialty: "[SF], [SC], [DC], [CS]",
  },
  {
    id: 5,
    name: "Nash Tatoy",
    imageKey: 139,
    points: 5,
    rating: 4.96,
    lessonCount: 1450,
    specialty: "[LS1], [PP101], [PP201], [TA], [EP]",
  },
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
export const WORK_END_HOUR = 21;
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

// YouTube retired the parameters that used to strip player chrome: `showinfo`
// went in 2018 and `modestbranding` in 2023, so the title header and the logo
// cannot be turned off any more, and `rel=0` no longer removes the "More
// videos" grid — it only narrows it to this channel. These are the ones that
// still do something. `controls=0` takes the whole bottom bar with it
// (scrubber, CC, settings, YouTube wordmark); a 39-second intro does not need
// scrubbing, and the modal has its own Close. Drop `controls=0` to get the bar
// back. nocookie defers YouTube's tracking cookies until playback starts.
export const INTRO_VIDEO_ID = "lGGJPOQzdW0";

export const TEACHER_INTRO_VIDEO =
  `https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}` +
  "?autoplay=1" +
  "&rel=0" +              // related videos limited to Brighture's own channel
  "&controls=0" +         // no bottom bar
  "&iv_load_policy=3" +   // no annotations
  "&cc_load_policy=0" +   // no forced captions
  "&playsinline=1" +      // stays in the modal on iOS
  "&disablekb=1" +
  "&color=white";

export const TEACHER_PROFILE_BY_ID = {
  1: {
    major: "B.A. in English Linguistics & Education",
    expertise: "[SF] Speech Fluency, [LS1] Listening & Speaking, [EP] Exam Prep",
    selfIntro:
      "Hello! I specialize in helping students speak English naturally and confidently with structured feedback, fluency drills, and targeted test preparation.",
  },
  2: {
    major: "B.S. in Communication Studies",
    expertise: "[PP101] Vowels, [PP202] American T, [DC] Conversation",
    selfIntro:
      "I focus on natural American intonation and vowel clarity. Master vowels, consonants, and smooth linking to speak everyday English with effortless ease!",
  },
  3: {
    major: "M.A. in Applied English Linguistics",
    expertise: "[RW] Reading & Writing, [SC] Social Topics, [TA] Assessment",
    selfIntro:
      "Expressing complex thoughts clearly requires logical structure. I coach students in business email writing, essay composition, and insightful discussions.",
  },
  4: {
    major: "B.A. in Secondary Education",
    expertise: "[SF] Speech Fluency, [SC] Social Conversation, [CS] Counseling",
    selfIntro:
      "My classes are relaxing, fun, and highly communicative. You will do 80% of the talking to overcome speaking hesitation and build lasting fluency!",
  },
  5: {
    major: "B.A. in English Communication & Phonetics",
    expertise: "[PP101] Vowels & Consonants, [LS1] Listening, [EP] Exam Prep",
    selfIntro:
      "Accurate pronunciation unlocks listening comprehension. We will break down mouth shapes, tongue positions, and rhythm patterns for clear, authentic English.",
  },
};

export const getSubjectCategory = (code) => {
  for (const cat of SUBJECT_CATEGORIES) {
    if (cat.codes.includes(code)) return cat;
  }
  return null;
};

export const getSubjectBadgeStyle = (code, isMatch = false) => {
  if (isMatch) {
    return "bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-brighture-gold font-extrabold shadow-xs";
  }
  const cat = getSubjectCategory(code);
  if (!cat) return "bg-slate-50 text-slate-700 border-slate-200";
  if (cat.id === "conversation") {
    return "bg-sky-50 text-sky-800 border-sky-200/80";
  }
  if (cat.id === "pronunciation") {
    return "bg-amber-50 text-amber-800 border-amber-200/80";
  }
  if (cat.id === "specialized") {
    return "bg-purple-50 text-purple-800 border-purple-200/80";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

/**
 * Derives teacher profile using `teacher.specialty` as the single source of truth for subjects taught.
 */
export const getTeacherProfile = (teacher) => {
  if (!teacher) return {};
  const staticProfile = TEACHER_PROFILE_BY_ID[teacher.id] || {};
  const specialtyCodes = parseSubjectCodes(teacher.specialty);
  const subjectsTaught = specialtyCodes
    .map((code) => SUBJECT_LABELS[code] || code)
    .join(", ");

  return {
    major: staticProfile.major || "Education & Language Teaching",
    expertise: staticProfile.expertise || "English Language & Communication",
    subjectsTaught,
    selfIntro:
      staticProfile.selfIntro ||
      "Hello! I focus on practical English communication and personalized feedback to help you achieve your goals.",
    rating: teacher.rating || 4.95,
    lessonCount: teacher.lessonCount || 500,
  };
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
