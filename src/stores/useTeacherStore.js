import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { imageForKey } from '@/lib/teacherImages';

/**
 * Prototype data for the instructor portal. Shapes follow the legacy teacher
 * app (web_root/teacher) so a real API can drop in without reworking the views:
 * every reservation carries the three clocks that app shows — the instructor's
 * Manila time, the school's Tokyo time, and the student's own zone.
 */
export const useTeacherStore = defineStore('teacher', () => {
  const profile = ref({
    firstName: 'Jirvy',
    lastName: 'Dela Torre',
    photo: imageForKey(184),
    email: 'jirvy.delatorre@brighture-edu.com',
    timezone: 'Asia/Manila (PHT)',
    schoolTimezone: 'Asia/Tokyo (JST)',
    major: 'B.A. in English Linguistics & Education',
    introVideo: 'https://www.youtube.com/watch?v=example',
    selfIntro:
      'I specialise in helping students speak English naturally and confidently with structured feedback and fluency drills.',
    subjects: ['SF', 'LS1', 'DC', 'FC', 'EP'],
    memberSince: 'August 2023',
    rating: 4.98,
  });

  /** Away pauses new Free Conversation reservations, as in the legacy app. */
  const isAway = ref(false);
  const toggleAway = () => { isAway.value = !isAway.value; };

  // Away only governs Free Conversation, so the control is meaningless to an
  // instructor who does not offer it — the UI hides it in that case.
  const teachesFreeConversation = computed(() => profile.value.subjects.includes('FC'));

  const usesTokyo = computed(() => profile.value.timezone.includes('Tokyo'));

  /** Start time and range in whichever zone the instructor set on their profile. */
  const localStart = (row) => (usesTokyo.value ? row.startTokyo : row.startManila);
  const localRange = (row) => (usesTokyo.value ? row.rangeTokyo : row.rangeManila);

  const googleCalendarLinked = ref(true);

  const stats = ref({
    lessonsThisMonth: 62,
    hoursThisMonth: '31.0',
    feedbackPending: 2,
    averageRating: 4.98,
    completionRate: 99,
  });

  // Upcoming reservations, soonest first.
  const reservations = ref([
    {
      id: 'r-501',
      topic: 'Cross-Border Negotiations & Pitching',
      rangeManila: '6:00 PM – 6:30 PM PHT',
      rangeTokyo: '7:00 PM – 7:30 PM JST',
      studentId: 21,
      studentName: 'Taro Yamada',
      studentPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      membership: 'Regular',
      category: 'Online',
      subject: '[SF] Speech Fluency',
      lessonClass: 'Online',
      point: 10,
      substitution: false,
      minutesUntil: 28,
      startManila: 'Sep 2, 2026 18:00',
      startTokyo: 'Sep 2, 2026 19:00',
      startStudent: 'Sep 2, 2026 19:00 (UTC +09:00) Tokyo',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      note: 'I want to focus on cross-border negotiation phrasing. Please correct my intonation.',
    },
    {
      id: 'r-502',
      topic: 'Vowel contrasts: /æ/ versus /ʌ/',
      rangeManila: '8:00 PM – 8:30 PM PHT',
      rangeTokyo: '9:00 PM – 9:30 PM JST',
      studentId: 34,
      studentName: 'Aiko Tanaka',
      studentPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      membership: 'Regular',
      category: 'Online',
      subject: '[PP101] Pronunciation — Vowels',
      lessonClass: 'Online',
      point: 10,
      substitution: false,
      minutesUntil: 148,
      startManila: 'Sep 2, 2026 20:00',
      startTokyo: 'Sep 2, 2026 21:00',
      startStudent: 'Sep 2, 2026 21:00 (UTC +09:00) Tokyo',
      meetLink: 'https://meet.google.com/klm-nopq-rst',
      note: 'Vowel drills again please — /æ/ and /ʌ/ are still hard for me.',
    },
    {
      id: 'r-503',
      topic: 'Everyday small talk & self-introduction',
      rangeManila: '9:00 AM – 9:30 AM PHT',
      rangeTokyo: '10:00 AM – 10:30 AM JST',
      studentId: 12,
      studentName: 'Kenji Sato',
      studentPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      membership: 'Trial',
      category: 'Free Conversation',
      subject: '[DC] Daily Conversation',
      lessonClass: 'Online',
      point: 5,
      substitution: true,
      minutesUntil: 1180,
      startManila: 'Sep 3, 2026 09:00',
      startTokyo: 'Sep 3, 2026 10:00',
      startStudent: 'Sep 3, 2026 10:00 (UTC +09:00) Tokyo',
      // Deliberately missing: the legacy portal warns instead of linking.
      meetLink: '',
      note: 'First lesson — nervous about speaking, please go slowly.',
    },
    {
      id: 'r-504',
      topic: 'IELTS Task 2 essay structure',
      rangeManila: '1:00 PM – 1:30 PM PHT',
      rangeTokyo: '2:00 PM – 2:30 PM JST',
      studentId: 45,
      studentName: 'Mika Kobayashi',
      studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      membership: 'Regular',
      category: 'Online',
      subject: '[RW] Reading & Writing',
      lessonClass: 'Online',
      point: 10,
      substitution: false,
      minutesUntil: 1420,
      startManila: 'Sep 3, 2026 13:00',
      startTokyo: 'Sep 3, 2026 14:00',
      startStudent: 'Sep 3, 2026 06:00 (UTC +01:00) London',
      meetLink: 'https://meet.google.com/uvw-xyza-bcd',
      note: 'Reviewing my IELTS Task 2 essay structure.',
    },
  ]);

  const nextReservation = computed(() => reservations.value[0] ?? null);
  const laterReservations = computed(() => reservations.value.slice(1));

  /** A lesson is joinable five minutes out, matching the legacy rule. */
  const canJoin = (reservation) =>
    !!reservation.meetLink && reservation.minutesUntil <= 5;

  // Writing submissions awaiting a correction.
  const writingTasks = ref([
    {
      id: 'w-88',
      studentId: 21,
      studentName: 'Taro Yamada',
      title: 'Business email — supplier delay apology',
      submittedManila: 'Sep 1, 2026 14:20',
      submittedTokyo: 'Sep 1, 2026 15:20',
      state: 'In progress',
      urgency: 'warning',
      words: 245,
      dueInHours: 9,
    },
    {
      id: 'w-89',
      studentId: 45,
      studentName: 'Mika Kobayashi',
      title: 'IELTS Task 2 — remote work essay',
      submittedManila: 'Sep 1, 2026 20:05',
      submittedTokyo: 'Sep 1, 2026 21:05',
      state: 'In progress',
      urgency: 'normal',
      words: 312,
      dueInHours: 26,
    },
    {
      id: 'w-90',
      studentId: 34,
      studentName: 'Aiko Tanaka',
      title: 'Self-introduction rewrite',
      submittedManila: 'Aug 31, 2026 09:40',
      submittedTokyo: 'Aug 31, 2026 10:40',
      state: 'Overdue',
      urgency: 'danger',
      words: 180,
      dueInHours: -4,
    },
  ]);

  const pendingWritingCount = computed(() => writingTasks.value.length);

  // Completed lessons, newest first.
  const lessonLog = ref([
    {
      id: 'l-410',
      studentId: 21,
      studentName: 'Taro Yamada',
      dateManila: 'Sep 1, 2026 18:00',
      dateTokyo: 'Sep 1, 2026 19:00',
      category: 'Online',
      subject: '[SF] Speech Fluency',
      point: 10,
      status: 'Completed',
      studentRating: 5,
      studentComment: 'Very clear explanations, I could follow every correction.',
      feedbackSubmitted: true,
    },
    {
      id: 'l-409',
      studentId: 34,
      studentName: 'Aiko Tanaka',
      dateManila: 'Sep 1, 2026 15:00',
      dateTokyo: 'Sep 1, 2026 16:00',
      category: 'Online',
      subject: '[PP101] Pronunciation — Vowels',
      point: 10,
      status: 'Completed',
      studentRating: 5,
      studentComment: '',
      feedbackSubmitted: false,
    },
    {
      id: 'l-408',
      studentId: 12,
      studentName: 'Kenji Sato',
      dateManila: 'Aug 31, 2026 11:00',
      dateTokyo: 'Aug 31, 2026 12:00',
      category: 'Free Conversation',
      subject: '[DC] Daily Conversation',
      point: 5,
      status: 'Completed',
      studentRating: 4,
      studentComment: 'Friendly and patient.',
      feedbackSubmitted: false,
    },
    {
      id: 'l-407',
      studentId: 45,
      studentName: 'Mika Kobayashi',
      dateManila: 'Aug 30, 2026 13:00',
      dateTokyo: 'Aug 30, 2026 14:00',
      category: 'Online',
      subject: '[RW] Reading & Writing',
      point: 10,
      status: 'No show (student)',
      studentRating: null,
      studentComment: '',
      feedbackSubmitted: true,
    },
  ]);

  const pendingFeedback = computed(() =>
    lessonLog.value.filter((lesson) => !lesson.feedbackSubmitted && lesson.status === 'Completed')
  );

  const submitFeedback = (lessonId, { feedback, hiddenNote }) => {
    const lesson = lessonLog.value.find((row) => row.id === lessonId);
    if (!lesson) return;
    lesson.feedbackSubmitted = true;
    lesson.feedback = feedback;
    lesson.hiddenNote = hiddenNote;
  };

  // Availability grid. Days are columns, half-hour slots are rows, exactly like
  // the legacy scheduling matrix; `open` is what the instructor offers.
  const scheduleDays = ref([
    { key: 'sun', label: 'Sun', date: '09/06' },
    { key: 'mon', label: 'Mon', date: '09/07' },
    { key: 'tue', label: 'Tue', date: '09/08' },
    { key: 'wed', label: 'Wed', date: '09/09' },
    { key: 'thu', label: 'Thu', date: '09/10' },
    { key: 'fri', label: 'Fri', date: '09/11' },
    { key: 'sat', label: 'Sat', date: '09/12' },
  ]);

  /** Manila hours the school actually books, paired with their Tokyo clock. */
  const scheduleSlots = ref(
    Array.from({ length: 14 }, (_, i) => {
      const manilaHour = 7 + i;
      return {
        key: `t${manilaHour}`,
        manila: `${String(manilaHour).padStart(2, '0')}:00`,
        tokyo: `${String((manilaHour + 1) % 24).padStart(2, '0')}:00`,
      };
    })
  );

  const availability = ref(
    (() => {
      const seed = {};
      const openByDay = {
        sun: [], mon: [9, 10, 11, 14, 15, 16], tue: [9, 10, 11, 14, 15, 16],
        wed: [13, 14, 15, 16, 17], thu: [9, 10, 11, 14, 15, 16],
        fri: [9, 10, 11, 12], sat: [10, 11],
      };
      Object.entries(openByDay).forEach(([day, hours]) => {
        hours.forEach((hour) => { seed[`${day}-t${hour}`] = true; });
      });
      return seed;
    })()
  );

  const isOpen = (dayKey, slotKey) => !!availability.value[`${dayKey}-${slotKey}`];
  const toggleSlot = (dayKey, slotKey) => {
    const id = `${dayKey}-${slotKey}`;
    availability.value[id] = !availability.value[id];
  };
  const setDay = (dayKey, open) => {
    scheduleSlots.value.forEach((slot) => { availability.value[`${dayKey}-${slot.key}`] = open; });
  };
  const setSlotRow = (slotKey, open) => {
    scheduleDays.value.forEach((day) => { availability.value[`${day.key}-${slotKey}`] = open; });
  };
  const openSlotCount = computed(() => Object.values(availability.value).filter(Boolean).length);

  /** Booked lessons per weekday, paired with the slots left open that day. */
  const lessonsBookedByDay = ref({ sun: 0, mon: 5, tue: 4, wed: 3, thu: 5, fri: 2, sat: 1 });

  const weeklyLoad = computed(() =>
    scheduleDays.value.map((day) => {
      const open = scheduleSlots.value.filter((slot) => isOpen(day.key, slot.key)).length;
      const booked = lessonsBookedByDay.value[day.key] ?? 0;
      return { ...day, open, booked, free: Math.max(0, open - booked) };
    })
  );

  const weeklyBooked = computed(() => weeklyLoad.value.reduce((sum, day) => sum + day.booked, 0));
  const weeklyOpen = computed(() => weeklyLoad.value.reduce((sum, day) => sum + day.open, 0));

  /** Today is whatever day the soonest reservations share. */
  const todaysReservations = computed(() => {
    const first = reservations.value[0];
    if (!first) return [];
    const today = first.startManila.split(' ').slice(0, 3).join(' ');
    return reservations.value.filter((row) => row.startManila.startsWith(today));
  });

  /** Everything waiting on the instructor, most urgent first. */
  const attentionItems = computed(() => [
    ...writingTasks.value
      .filter((task) => task.dueInHours < 12)
      .map((task) => ({
        id: `w-${task.id}`,
        kind: 'writing',
        title: task.title,
        subtitle: task.studentName,
        urgent: task.dueInHours < 0,
        meta: task.dueInHours < 0 ? `${Math.abs(task.dueInHours)}h overdue` : `due in ${task.dueInHours}h`,
        to: '/writing',
      })),
    ...pendingFeedback.value.map((lesson) => ({
      id: `f-${lesson.id}`,
      kind: 'feedback',
      title: `Feedback for ${lesson.studentName}`,
      subtitle: lesson.subject,
      urgent: false,
      meta: lesson.dateManila,
      to: '/lessons',
    })),
  ]);

  const recentRatings = computed(() =>
    lessonLog.value.filter((lesson) => lesson.studentRating).slice(0, 3)
  );

  const fullName = computed(() => `${profile.value.firstName} ${profile.value.lastName}`);

  return {
    profile, fullName, isAway, toggleAway, teachesFreeConversation, googleCalendarLinked, stats,
    usesTokyo, localStart, localRange,
    reservations, nextReservation, laterReservations, canJoin,
    writingTasks, pendingWritingCount,
    lessonLog, pendingFeedback, submitFeedback,
    scheduleDays, scheduleSlots, availability, isOpen, toggleSlot, setDay, setSlotRow, openSlotCount,
    weeklyLoad, weeklyBooked, weeklyOpen, todaysReservations, attentionItems, recentRatings,
  };
});
