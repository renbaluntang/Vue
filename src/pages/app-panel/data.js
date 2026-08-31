// Shared constants and helpers for the Teacher Panel (App) page.
// Ported 1:1 from the React version's App.jsx top-level constants/helpers.

export const NAV_ITEMS = [
  { label: "Scheduling", icon: "schedule" },
  { label: "Analytics", icon: "analytics" },
  { label: "Calendar", icon: "calendar_month" },
  { label: "Reservations", icon: "event_available" },
  { label: "Lesson log", icon: "history" },
  { label: "Writing", icon: "edit" },
  { label: "Profile Setting", icon: "person" },
];

export const SUBJECTS = [
  "[LS1] Listening & Speaking",
  "[DC] Daily Conversation",
  "[PP102] Pronunciation — R-controlled Vowels",
  "[SF] Speech Fluency",
  "[EP] Exam Prep",
];

export const STUDENTS = [
  "Mina Mori",
  "Shigeko Kimura",
  "Rie Kato",
  "Ryo Kawai",
  "Hiroki Kobayashi",
  "Yuki Aizawa",
  "Naomi Sato",
  "Aiko Tanaka",
  "Kenji Watanabe",
  "Sakura Ito",
];

export const TIME_SLOTS = [9, 13, 16];
export const MAX_DAY_OFFSET = 7;
export const LESSON_DURATION_MINUTES = 50;
export const INSTRUCTORS = ["Alma Oliviero", "Noah Carter", "Erika Santos", "Liam Miller"];
export const STUDENT_PROFILE_BY_NAME = {
  "Mina Mori": {
    romanName: "Mina Mori",
    japaneseName: "森 美奈",
    gender: "Female",
    birthDate: "06/1984",
    email: "mina.mori@example.com",
    gmail: "mina.mori@example.com",
    learningPurpose: "Business",
    examScores: "TOEIC 785 2018/10",
    hiddenNote: "-",
    timeZone: "Tokyo (Asia) - UTC+09:00",
  },
};

export const buildSchedule = (baseDate) => {
  const entries = [];
  let id = 1;

  for (let dayOffset = 0; dayOffset <= MAX_DAY_OFFSET; dayOffset += 1) {
    TIME_SLOTS.forEach((hour, slotIndex) => {
      const index = dayOffset * TIME_SLOTS.length + slotIndex;
      entries.push({
        id,
        date: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate() + dayOffset,
          hour,
          0
        ),
        student: STUDENTS[index % STUDENTS.length],
        member: "Regular",
        category: "Online",
        subject: SUBJECTS[index % SUBJECTS.length],
        points: 5,
        substitution: slotIndex % 2 === 0 ? "No Need" : "Necessary",
        region: "Philippines / Japan",
        meetingUrl: "https://meet.google.com/",
        difficulty: 45 + ((index * 7) % 50),
        studentId: 3350 + index,
        instructorId: 80 + (index % 10),
        instructorName: INSTRUCTORS[index % INSTRUCTORS.length],
        studentMessage: "Please focus on pronunciation drills and daily conversation pacing.",
      });
      id += 1;
    });
  }

  return entries;
};

export const formatTime = (date, useUtc = false) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: useUtc ? "UTC" : undefined,
  });

export const formatDate = (date, useUtc = false) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: useUtc ? "UTC" : undefined,
  });

export const formatAppointment = (date) => {
  const local = `${formatDate(date)} ${formatTime(date)}`;
  const utc = `${formatDate(date, true)} ${formatTime(date, true)} (UTC)`;
  return [local, utc];
};

export const formatReservationDateLines = (date) => {
  const manila = date.toLocaleString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  });
  const tokyo = date.toLocaleString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  });
  const utc = date.toLocaleString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return [
    `${manila} (Philippines)`,
    `${tokyo} (Japan)`,
    `${utc} (UTC +09:00 JST) (Tokyo Asia)`,
  ];
};

export const getNextClass = (schedule, now) =>
  schedule.find((entry) => entry.date.getTime() > now.getTime()) ?? schedule[0];

export const isSameDay = (left, right) => left.toDateString() === right.toDateString();
export const isClassDone = (entry, now) =>
  now.getTime() >= entry.date.getTime() + LESSON_DURATION_MINUTES * 60 * 1000;
export const isClassOngoing = (entry, now) =>
  now.getTime() >= entry.date.getTime() &&
  now.getTime() < entry.date.getTime() + LESSON_DURATION_MINUTES * 60 * 1000;

export const getFeaturedClass = (schedule, now) => {
  const ongoing = schedule.find((entry) => isClassOngoing(entry, now));
  if (ongoing) {
    return ongoing;
  }
  return schedule.find((entry) => entry.date.getTime() > now.getTime()) ?? schedule[0];
};

export const formatCountdown = (targetDate, now) => {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return "In class now";
  }

  const totalMinutes = Math.ceil(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `Starts in ${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `Starts in ${hours}h ${minutes}m`;
  }
  return `Starts in ${minutes} min`;
};

export const minutesToClock = (totalMinutes) => {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

export const getMinutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();

export const applyMinutesToDate = (date, minutesOfDay) => {
  const updated = new Date(date);
  updated.setHours(Math.floor(minutesOfDay / 60), minutesOfDay % 60, 0, 0);
  return updated;
};

export const getStudentProfile = (entry) =>
  STUDENT_PROFILE_BY_NAME[entry.student] ?? {
    romanName: entry.student,
    japaneseName: "N/A",
    gender: "Female",
    birthDate: "07/1979",
    email: "student@example.com",
    gmail: "student@example.com",
    learningPurpose: "Personal use such as traveling",
    examScores: "TOEIC 755 2016/3, Eiken Grade 2 1999/7",
    hiddenNote: "-",
    timeZone: "Tokyo (Asia) - UTC+09:00",
  };
