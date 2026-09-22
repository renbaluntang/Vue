import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { imageForKey } from '@/lib/teacherImages';
import { seedMaterials } from '@/lib/lessonMaterials';
import { convertSlotTime, getTimeZoneInfo, normalizeTimeZone } from '@/lib/timezoneUtils';

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
  /** When Away began, so the overlay can run the admin-notification countdown. */
  const awaySince = ref(null);
  const toggleAway = () => {
    isAway.value = !isAway.value;
    awaySince.value = isAway.value ? Date.now() : null;
  };

  // Away only governs Free Conversation, so the control is meaningless to an
  // instructor who does not offer it — the UI hides it in that case.
  const teachesFreeConversation = computed(() => profile.value.subjects.includes('FC'));

  /**
   * Every reservation is stored in Manila time; every other clock in the portal
   * is a projection of it. `viewTimezone` — the header picker — decides which
   * projection is on screen, so the picker means the same thing on every page
   * rather than only on the schedule board.
   */
  const CANONICAL_ZONE = 'Asia/Manila';
  const viewZoneId = computed(() =>
    normalizeTimeZone(viewTimezone.value || profile.value.timezone)
  );
  const viewZoneAbbr = computed(() => getTimeZoneInfo(viewZoneId.value).abbr);

  const usesTokyo = computed(() => viewZoneId.value === 'Asia/Tokyo');

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /** A far-enough zone moves the calendar date too, not just the clock. */
  const shiftDateText = (dateText, days) => {
    if (!days) return dateText;
    const d = new Date(`${dateText} 12:00:00`);
    if (Number.isNaN(d.getTime())) return dateText;
    d.setDate(d.getDate() + days);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  /** "6:00 PM" -> "18:00". */
  const to24 = (clock) => {
    const m = String(clock).trim().match(/^(\d{1,2}):(\d{2})\s*([AP])M$/i);
    if (!m) return String(clock).trim();
    let hour = Number(m[1]) % 12;
    if (m[3].toUpperCase() === 'P') hour += 12;
    return `${String(hour).padStart(2, '0')}:${m[2]}`;
  };

  const project = (hhmm) => convertSlotTime(hhmm, CANONICAL_ZONE, viewZoneId.value);

  /** "Sep 2, 2026 18:00" in the viewed zone, date included when it rolls over. */
  const localStart = (row) => {
    const raw = row?.startManila ?? '';
    const parts = raw.match(/^(.*?)\s(\d{1,2}:\d{2})$/);
    if (!parts) return raw;
    const converted = project(parts[2]);
    return `${shiftDateText(parts[1], converted.dayShift)} ${converted.time24}`;
  };

  /** "6:00 PM – 6:30 PM PHT" in the viewed zone. */
  const localRange = (row) => {
    const raw = row?.rangeManila ?? '';
    const parts = raw.match(/^(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
    if (!parts) return raw;
    const from = project(to24(parts[1])).time12;
    const to = project(to24(parts[2])).time12;
    return `${from} – ${to} ${viewZoneAbbr.value}`;
  };

  /**
   * A lesson close enough that nothing may stand between the instructor and it.
   * The Away overlay surfaces this so being Away can never hide a class.
   */
  const imminentReservation = computed(() =>
    reservations.value.find((row) => row.minutesUntil <= 15) ?? null
  );

  /**
   * Which timezone the schedule is *read* in. The stored availability is always
   * Manila; this only changes how it is displayed. It lives here rather than on
   * the Scheduling page because the picker now sits in the portal header, above
   * the router view.
   */
  const viewTimezone = ref('Asia/Manila');
  const viewTimezones = ref([]);
  /** Raised by the sidebar Settings menu to open the manage-timezones dialog. */
  const timezoneSettingsOpen = ref(false);

  const googleCalendarLinked = ref(true);
  /** Which Google account the sync runs as, so "linked" names something. */
  const googleCalendarAccount = ref('jirvy.delatorre@brighture-edu.com');
  const googleCalendarSyncedAt = ref('Today, 07:40');
  /** Raised by the sidebar Settings menu to open the calendar dialog. */
  const calendarSettingsOpen = ref(false);

  /** Also the relink path: re-authorising is the same call with a fresh grant. */
  const linkGoogleCalendar = (account) => {
    googleCalendarLinked.value = true;
    if (account) googleCalendarAccount.value = account;
    googleCalendarSyncedAt.value = 'Just now';
  };

  const unlinkGoogleCalendar = () => {
    googleCalendarLinked.value = false;
    googleCalendarSyncedAt.value = '';
  };


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
    {
      id: 'r-505',
      topic: 'Tech Trends: AI & Workplace Automation',
      rangeManila: '3:30 PM – 4:00 PM PHT',
      rangeTokyo: '4:30 PM – 5:00 PM JST',
      studentId: 58,
      studentName: 'Daiki Suzuki',
      studentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      membership: 'Regular',
      category: 'Online',
      subject: '[LS1] Listening & Discussion',
      lessonClass: 'Online',
      point: 10,
      substitution: false,
      minutesUntil: 1570,
      startManila: 'Sep 3, 2026 15:30',
      startTokyo: 'Sep 3, 2026 16:30',
      startStudent: 'Sep 3, 2026 16:30 (UTC +09:00) Tokyo',
      meetLink: 'https://meet.google.com/qrs-tuvw-xyz',
      note: 'Looking forward to discussing industry terminology and podcast summaries.',
    },
    {
      id: 'r-506',
      topic: 'Travel plans to Cebu & cultural exchange',
      rangeManila: '10:00 AM – 10:30 AM PHT',
      rangeTokyo: '11:00 AM – 11:30 AM JST',
      studentId: 63,
      studentName: 'Yuka Morita',
      studentPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      membership: 'Trial',
      category: 'Free Conversation',
      subject: '[FC] Free Conversation',
      lessonClass: 'Online',
      point: 5,
      substitution: false,
      minutesUntil: 2680,
      startManila: 'Sep 4, 2026 10:00',
      startTokyo: 'Sep 4, 2026 11:00',
      startStudent: 'Sep 4, 2026 11:00 (UTC +09:00) Tokyo',
      meetLink: 'https://meet.google.com/efg-hijk-lmn',
      note: 'Practicing everyday English for my upcoming trip to Cebu.',
    },
  ]);

  const nextReservation = computed(() => reservations.value[0] ?? null);
  const laterReservations = computed(() => reservations.value.slice(1));

  /** A lesson is joinable five minutes out, matching the legacy rule. */
  const canJoin = (reservation) =>
    !!reservation.meetLink && reservation.minutesUntil <= 5;

  // Writing submissions awaiting a correction.
  // Correction tickets are conversations, not one-shot submissions: the student
  // sends a passage, the instructor sends back a corrected version plus notes,
  // and the student can come back with follow-up questions. `messages[0]` is
  // always the student's original passage, so the thread needs no separate
  // "submission" field.
  const writingTasks = ref([
    {
      id: 'w-88',
      studentId: 21,
      studentName: 'Taro Yamada',
      studentPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      title: 'Business email — supplier delay apology',
      submittedManila: 'Sep 1, 2026 14:20',
      submittedTokyo: 'Sep 1, 2026 15:20',
      state: 'In progress',
      urgency: 'warning',
      words: 245,
      dueInHours: 9,
      messages: [
        {
          id: 'm-1',
          from: 'student',
          time: 'Sep 1, 14:20',
          body: `Dear Mr. Tanaka,

I am writing to apologize about the delay of our shipment. We had a problem in the factory last week, so the products could not be finished on time.

We will send the products by next Friday. I am very sorry for the inconvenience.`,
        },
        {
          id: 'm-2',
          from: 'student',
          time: 'Sep 1, 14:26',
          body: 'Sorry, one more thing — is "apologize about" correct here, or should it be "apologize for"?',
        },
      ],
    },
    {
      id: 'w-89',
      studentId: 45,
      studentName: 'Mika Kobayashi',
      studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      title: 'IELTS Task 2 — remote work essay',
      submittedManila: 'Sep 1, 2026 20:05',
      submittedTokyo: 'Sep 1, 2026 21:05',
      state: 'In progress',
      urgency: 'normal',
      words: 312,
      dueInHours: 26,
      messages: [
        {
          id: 'm-1',
          from: 'student',
          time: 'Sep 1, 20:05',
          body: `Some people believe that working from home is better for employees, while others think the office is necessary for teamwork. Discuss both views and give your own opinion.

In my opinion, remote work has more advantage than disadvantage. First, employees can save the commuting time, which in Tokyo is often two hours every day. Second, they can concentrate better because there is no interruption from colleagues.

However, I admit that new staff needs the office to learn from senior members.`,
        },
      ],
    },
    {
      id: 'w-90',
      studentId: 34,
      studentName: 'Aiko Tanaka',
      studentPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      title: 'Self-introduction rewrite',
      submittedManila: 'Aug 31, 2026 09:40',
      submittedTokyo: 'Aug 31, 2026 10:40',
      state: 'Overdue',
      urgency: 'danger',
      words: 180,
      dueInHours: -4,
      messages: [
        {
          id: 'm-1',
          from: 'student',
          time: 'Aug 31, 09:40',
          body: `Hello everyone, my name is Aiko Tanaka. I work in the sales department for three years. I am interesting in international business and I want to improve my English for meeting with overseas client.

Nice to meet you all and I hope we can work together well.`,
        },
        {
          id: 'm-2',
          from: 'teacher',
          time: 'Aug 31, 11:05',
          body: 'Thanks Aiko — I have your passage. I will send the full correction today. One quick note while you wait: "I am interesting" should be "I am interested". We use -ing for the thing, -ed for the person.',
        },
        {
          id: 'm-3',
          from: 'student',
          time: 'Aug 31, 21:14',
          body: 'Thank you! Could you also check whether "for three years" is right? My colleague said it should be "for three years now".',
        },
      ],
    },
  ]);

  const pendingWritingCount = computed(
    () => writingTasks.value.filter((task) => task.state !== 'Complete').length
  );

  /** Appends the instructor's reply, optionally carrying a corrected passage. */
  const sendWritingReply = (taskId, { body, correction }) => {
    const task = writingTasks.value.find((t) => t.id === taskId);
    if (!task) return;
    const text = (body ?? '').trim();
    const fixed = (correction ?? '').trim();
    if (!text && !fixed) return;
    task.messages.push({
      id: `m-${task.messages.length + 1}`,
      from: 'teacher',
      time: 'Just now',
      body: text,
      correction: fixed || undefined,
    });
  };

  /** Closes the ticket so it drops out of the pending queue and badge count. */
  const completeWritingTask = (taskId) => {
    const task = writingTasks.value.find((t) => t.id === taskId);
    if (task) task.state = 'Complete';
  };

  // Lesson materials hang off the student, not the lesson — the same handout
  // is the one they are still working through three lessons later.
  const materialsByStudent = ref(seedMaterials());

  const materialsFor = (studentId) => materialsByStudent.value[studentId] ?? [];
  const materialCount = (studentId) => materialsFor(studentId).length;

  const addMaterial = (studentId, material) => {
    const title = (material?.title ?? '').trim();
    if (!studentId || !title) return null;
    const entry = {
      id: `m-${studentId}-${Date.now()}`,
      title,
      kind: material.kind || 'link',
      subject: (material.subject ?? '').trim(),
      note: (material.note ?? '').trim(),
      url: (material.url ?? '').trim(),
      addedOn: 'Just now',
      addedBy: `${profile.value.firstName} ${profile.value.lastName}`,
    };
    if (!materialsByStudent.value[studentId]) materialsByStudent.value[studentId] = [];
    materialsByStudent.value[studentId].unshift(entry);
    return entry;
  };

  const removeMaterial = (studentId, id) => {
    const list = materialsByStudent.value[studentId];
    if (!list) return;
    const at = list.findIndex((item) => item.id === id);
    if (at !== -1) list.splice(at, 1);
  };

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
  // Every hour of the day, not a 07:00-20:00 window. The old range was fixed in
  // Manila hours, so simply viewing the board in another zone slid the whole
  // day sideways and put early or late hours out of reach entirely — a Tokyo
  // instructor could not open 07:00 JST because it is 06:00 in Manila.
  const scheduleSlots = ref(
    Array.from({ length: 24 }, (_, i) => {
      const manilaHour = i;
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
        sun: [],
        mon: [9, 10, 11, 14, 15, 16],
        tue: [9, 10, 11, 14, 15, 16],
        wed: [14, 15, 16, 17],
        thu: [9, 10, 11, 14, 15, 16],
        fri: [9, 10, 11],
        sat: [10, 11],
      };
      Object.entries(openByDay).forEach(([day, hours]) => {
        hours.forEach((hour) => { seed[`${day}-t${hour}`] = 'open'; });
      });

      // Realistic seed for reserved slots (manager scheduled class, team meeting):
      seed['wed-t13'] = { status: 'reserved', reason: 'Manager Scheduled Class' };
      seed['fri-t16'] = { status: 'reserved', reason: 'Team Meeting / Sync' };

      return seed;
    })()
  );

  const getSlotStatus = (dayKey, slotKey) => {
    const val = availability.value[`${dayKey}-${slotKey}`];
    if (!val) return 'closed';
    if (val === true || val === 'open' || (typeof val === 'object' && val?.status === 'open')) return 'open';
    if (val === 'reserved' || (typeof val === 'object' && val?.status === 'reserved')) return 'reserved';
    return 'closed';
  };

  const isOpen = (dayKey, slotKey) => getSlotStatus(dayKey, slotKey) === 'open';
  const isReserved = (dayKey, slotKey) => getSlotStatus(dayKey, slotKey) === 'reserved';
  const isClosed = (dayKey, slotKey) => getSlotStatus(dayKey, slotKey) === 'closed';

  const getSlotReason = (dayKey, slotKey) => {
    const val = availability.value[`${dayKey}-${slotKey}`];
    if (typeof val === 'object' && val?.reason) return val.reason;
    if (val === 'reserved') return 'Reserved';
    return '';
  };

  const setSlotStatus = (dayKey, slotKey, status, reason = '') => {
    const id = `${dayKey}-${slotKey}`;
    if (status === 'closed') {
      delete availability.value[id];
    } else if (status === 'reserved') {
      availability.value[id] = { status: 'reserved', reason: reason || 'Reserved' };
    } else {
      availability.value[id] = 'open';
    }
  };

  // Cycle slot: closed -> open -> reserved -> closed
  const cycleSlot = (dayKey, slotKey, defaultReason = 'Personal (Break / Errands)') => {
    const current = getSlotStatus(dayKey, slotKey);
    if (current === 'closed') {
      setSlotStatus(dayKey, slotKey, 'open');
    } else if (current === 'open') {
      setSlotStatus(dayKey, slotKey, 'reserved', defaultReason);
    } else {
      setSlotStatus(dayKey, slotKey, 'closed');
    }
  };

  const toggleSlot = (dayKey, slotKey) => {
    const current = getSlotStatus(dayKey, slotKey);
    if (current === 'closed') {
      setSlotStatus(dayKey, slotKey, 'open');
    } else {
      setSlotStatus(dayKey, slotKey, 'closed');
    }
  };

  const setDay = (dayKey, open) => {
    const status = open ? 'open' : 'closed';
    scheduleSlots.value.forEach((slot) => {
      setSlotStatus(dayKey, slot.key, status);
    });
  };

  const setDayStatus = (dayKey, status, reason = '') => {
    scheduleSlots.value.forEach((slot) => {
      setSlotStatus(dayKey, slot.key, status, reason);
    });
  };

  const setSlotRow = (slotKey, open) => {
    const status = open ? 'open' : 'closed';
    scheduleDays.value.forEach((day) => {
      setSlotStatus(day.key, slotKey, status);
    });
  };

  const setSlotRowStatus = (slotKey, status, reason = '') => {
    scheduleDays.value.forEach((day) => {
      setSlotStatus(day.key, slotKey, status, reason);
    });
  };

  const openSlotCount = computed(() => {
    return Object.keys(availability.value).filter((key) => {
      const val = availability.value[key];
      return val === true || val === 'open' || (typeof val === 'object' && val?.status === 'open');
    }).length;
  });

  const reservedSlotCount = computed(() => {
    return Object.keys(availability.value).filter((key) => {
      const val = availability.value[key];
      return val === 'reserved' || (typeof val === 'object' && val?.status === 'reserved');
    }).length;
  });

  // Teaching analytics. Figures are consistent with `stats` above so the
  // dashboard and the analytics page never contradict each other.
  const analytics = ref({
    ranges: ['This month', 'Last 3 months', 'This year'],
    byRange: {
      'This month': {
        lessons: 62,
        hours: '31.0',
        rating: 4.98,
        completionRate: 99,
        feedbackHours: 6,
        repeatShare: 78,
        // Lessons per calendar week within the range.
        series: [
          { label: 'W1', lessons: 14 },
          { label: 'W2', lessons: 17 },
          { label: 'W3', lessons: 16 },
          { label: 'W4', lessons: 15 },
        ],
        subjects: [
          { code: 'SF', label: 'Speech Fluency', lessons: 24 },
          { code: 'DC', label: 'Daily Conversation', lessons: 15 },
          { code: 'FC', label: 'Free Conversation', lessons: 11 },
          { code: 'LS1', label: 'Listening 1', lessons: 8 },
          { code: 'EP', label: 'Exam Prep', lessons: 4 },
        ],
        ratings: [
          { stars: 5, count: 54 },
          { stars: 4, count: 6 },
          { stars: 3, count: 1 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ],
        attendance: [
          { label: 'Completed', count: 61, tone: 'emerald' },
          { label: 'Student no-show', count: 1, tone: 'rose' },
          { label: 'Cancelled by student', count: 3, tone: 'amber' },
          { label: 'Cancelled by you', count: 0, tone: 'slate' },
        ],
      },
      'Last 3 months': {
        lessons: 178,
        hours: '89.0',
        rating: 4.96,
        completionRate: 98,
        feedbackHours: 8,
        repeatShare: 74,
        series: [
          { label: 'Jun', lessons: 54 },
          { label: 'Jul', lessons: 62 },
          { label: 'Aug', lessons: 62 },
        ],
        subjects: [
          { code: 'SF', label: 'Speech Fluency', lessons: 66 },
          { code: 'DC', label: 'Daily Conversation', lessons: 44 },
          { code: 'FC', label: 'Free Conversation', lessons: 31 },
          { code: 'LS1', label: 'Listening 1', lessons: 24 },
          { code: 'EP', label: 'Exam Prep', lessons: 13 },
        ],
        ratings: [
          { stars: 5, count: 149 },
          { stars: 4, count: 24 },
          { stars: 3, count: 4 },
          { stars: 2, count: 1 },
          { stars: 1, count: 0 },
        ],
        attendance: [
          { label: 'Completed', count: 174, tone: 'emerald' },
          { label: 'Student no-show', count: 4, tone: 'rose' },
          { label: 'Cancelled by student', count: 9, tone: 'amber' },
          { label: 'Cancelled by you', count: 2, tone: 'slate' },
        ],
      },
      'This year': {
        lessons: 486,
        hours: '243.0',
        rating: 4.95,
        completionRate: 98,
        feedbackHours: 9,
        repeatShare: 71,
        series: [
          { label: 'Q1', lessons: 108 },
          { label: 'Q2', lessons: 132 },
          { label: 'Q3', lessons: 178 },
          { label: 'Q4', lessons: 68 },
        ],
        subjects: [
          { code: 'SF', label: 'Speech Fluency', lessons: 181 },
          { code: 'DC', label: 'Daily Conversation', lessons: 118 },
          { code: 'FC', label: 'Free Conversation', lessons: 84 },
          { code: 'LS1', label: 'Listening 1', lessons: 66 },
          { code: 'EP', label: 'Exam Prep', lessons: 37 },
        ],
        ratings: [
          { stars: 5, count: 402 },
          { stars: 4, count: 68 },
          { stars: 3, count: 12 },
          { stars: 2, count: 3 },
          { stars: 1, count: 1 },
        ],
        attendance: [
          { label: 'Completed', count: 474, tone: 'emerald' },
          { label: 'Student no-show', count: 12, tone: 'rose' },
          { label: 'Cancelled by student', count: 26, tone: 'amber' },
          { label: 'Cancelled by you', count: 5, tone: 'slate' },
        ],
      },
    },
  });

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
    googleCalendarAccount, googleCalendarSyncedAt, calendarSettingsOpen,
    linkGoogleCalendar, unlinkGoogleCalendar,
    usesTokyo, localStart, localRange, viewZoneId, viewZoneAbbr, awaySince, imminentReservation,
    viewTimezone, viewTimezones, timezoneSettingsOpen,
    reservations, nextReservation, laterReservations, canJoin,
    writingTasks, pendingWritingCount, sendWritingReply, completeWritingTask,
    lessonLog, pendingFeedback, submitFeedback,
    materialsByStudent, materialsFor, materialCount, addMaterial, removeMaterial,
    scheduleDays, scheduleSlots, availability, getSlotStatus, isOpen, isReserved, isClosed,
    getSlotReason, setSlotStatus, cycleSlot, toggleSlot, setDay, setDayStatus, setSlotRow, setSlotRowStatus,
    openSlotCount, reservedSlotCount,
    weeklyLoad, weeklyBooked, weeklyOpen, todaysReservations, attentionItems, recentRatings,
    analytics,
  };
});
