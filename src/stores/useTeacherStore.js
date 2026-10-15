import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { imageForKey } from '@/lib/teacherImages';
import { convertSlotTime, getTimeZoneInfo, normalizeTimeZone } from '@/lib/timezoneUtils';
import { CURRENT_TEACHER_ID } from '@/lib/schoolSeed';
import {
  MANILA, TOKYO, stampIn, rangeIn, utcLabel, minutesUntil, manilaSlotOf, weekStartIso,
} from '@/lib/schoolTime';
import { useSchoolStore } from './useSchoolStore';

/** The signed-in instructor: Jirvy Dela Torre. */
const TEACHER_ID = CURRENT_TEACHER_ID;

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

  /**
   * How long until something, split into the units people actually think in.
   *
   * "273 mins" is a number you have to divide before it tells you anything,
   * and past a day it stops meaning anything at all — "2680 mins" is a wait
   * nobody can picture.
   */
  const countdownLabel = (minutes) => {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    if (total < 60) return `${total}m`;
    const parts = [];
    const days = Math.floor(total / 1440);
    const hours = Math.floor((total % 1440) / 60);
    const mins = total % 60;
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (mins) parts.push(`${mins}m`);
    return parts.join(' ');
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
    reservations.value.find((row) => row.minutesUntil >= 0 && row.minutesUntil <= 15) ?? null
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



  /**
   * The school's shared records. Lessons, writing tickets and materials live
   * there, once, so a booking Taro makes in the student portal is the same row
   * Jirvy sees here. This store keeps the shapes the instructor pages were
   * built against and maps the shared records onto them.
   */
  const school = useSchoolStore();

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /** 'Sep 2, 2026 18:00' -> 'Sep 2, 18:00', the short label message threads use. */
  const shortStamp = (iso) => stampIn(iso, MANILA).replace(/, \d{4} /, ', ');
  /** 'Sep 2, 2026' in Manila, for "added on" style labels. */
  const manilaDate = (iso) => stampIn(iso, MANILA).split(' ').slice(0, 3).join(' ');

  // Upcoming reservations, soonest first.
  const reservations = computed(() => {
    const now = nowTick.value;
    return school.lessonsForTeacher(TEACHER_ID)
      .filter((lesson) => lesson.status === 'booked')
      .map((lesson) => {
        const s = school.student(lesson.studentId);
        return {
          id: lesson.id,
          topic: lesson.topic,
          studentId: lesson.studentId,
          studentName: s.name,
          studentPhoto: s.photo,
          membership: s.membership,
          category: s.category,
          subject: lesson.subject,
          lessonClass: 'Online',
          point: lesson.points,
          substitution: lesson.substitution,
          // Counted off the real clock, so the countdown in the header cannot
          // drift from the time beside it.
          minutesUntil: minutesUntil(lesson.start, now),
          startManila: stampIn(lesson.start, MANILA),
          startTokyo: stampIn(lesson.start, TOKYO),
          rangeManila: `${rangeIn(lesson.start, lesson.duration, MANILA, ' – ')} PHT`,
          rangeTokyo: `${rangeIn(lesson.start, lesson.duration, TOKYO, ' – ')} JST`,
          startStudent: `${stampIn(lesson.start, s.timezone)} ${utcLabel(s.timezone)}`,
          // Deliberately possibly empty: the legacy portal warns instead of linking.
          meetLink: lesson.meetLink,
          note: lesson.note,
          start: lesson.start,
          duration: lesson.duration,
        };
      });
  });

  /** The soonest lesson that has not already started. */
  const nextReservation = computed(
    () => reservations.value.find((row) => row.minutesUntil >= 0) ?? null
  );
  const laterReservations = computed(() =>
    reservations.value.filter((row) => row !== nextReservation.value)
  );

  /** A lesson is joinable five minutes out, matching the legacy rule. */
  const canJoin = (reservation) =>
    !!reservation.meetLink && reservation.minutesUntil <= 5;

  // Writing submissions awaiting a correction.
  // Correction tickets are conversations, not one-shot submissions: the student
  // sends a passage, the instructor sends back a corrected version plus notes,
  // and the student can come back with follow-up questions. `messages[0]` is
  // always the student's original passage, so the thread needs no separate
  // "submission" field.
  const countWords = (text) => (String(text ?? '').trim().match(/\S+/g) ?? []).length;

  const writingTasks = computed(() => {
    const now = nowTick.value;
    return school.writingForTeacher(TEACHER_ID).map((ticket) => {
      const s = school.student(ticket.studentId);
      const dueInHours = Math.round(minutesUntil(ticket.dueAt, now) / 60);
      const complete = ticket.status === 'Complete';
      const overdue = !complete && minutesUntil(ticket.dueAt, now) < 0;
      return {
        id: ticket.id,
        studentId: ticket.studentId,
        studentName: s.name,
        studentPhoto: s.photo,
        title: ticket.title,
        submittedManila: stampIn(ticket.submittedAt, MANILA),
        submittedTokyo: stampIn(ticket.submittedAt, TOKYO),
        state: complete ? 'Complete' : overdue ? 'Overdue' : 'In progress',
        urgency: complete ? 'normal' : overdue ? 'danger' : dueInHours < 12 ? 'warning' : 'normal',
        words: countWords(ticket.messages[0]?.body),
        dueInHours,
        remainingSends: ticket.remainingSends,
        messages: ticket.messages.map((m) => ({ ...m, time: shortStamp(m.at) })),
      };
    });
  });

  const pendingWritingCount = computed(
    () => writingTasks.value.filter((task) => task.state !== 'Complete').length
  );

  /** Appends the instructor's reply, optionally carrying a corrected passage. */
  const sendWritingReply = (taskId, { body, correction }) =>
    school.replyWriting(taskId, { from: 'teacher', body: body ?? '', correction, teacherId: TEACHER_ID });

  /** Closes the ticket so it drops out of the pending queue and badge count. */
  const completeWritingTask = (taskId) => school.completeWriting(taskId);

  // Lesson materials hang off the student, not the lesson — the same handout
  // is the one they are still working through three lessons later. The shelf
  // is shared, so what is added here is what the student sees.
  const materialsByStudent = computed(() => school.db.materials);

  const materialsFor = (studentId) => school.materialsFor(studentId);
  const materialCount = (studentId) => materialsFor(studentId).length;

  const addMaterial = (studentId, material) => {
    const title = (material?.title ?? '').trim();
    if (!studentId || !title) return null;
    return school.addMaterial(studentId, {
      id: `m-${studentId}-${Date.now()}`,
      title,
      kind: material.kind || 'link',
      subject: (material.subject ?? '').trim(),
      note: (material.note ?? '').trim(),
      url: (material.url ?? '').trim(),
      addedOn: manilaDate(new Date().toISOString()),
      addedBy: `${profile.value.firstName} ${profile.value.lastName}`,
    });
  };

  const removeMaterial = (studentId, id) => school.removeMaterial(studentId, id);

  const STATUS_LABELS = { completed: 'Completed', 'no-show': 'No show (student)', cancelled: 'Cancelled' };

  // Lessons that have happened (or were meant to), newest first.
  const lessonLog = computed(() => {
    const now = nowTick.value;
    return school.lessonsForTeacher(TEACHER_ID)
      .filter((lesson) => STATUS_LABELS[lesson.status] && minutesUntil(lesson.start, now) <= 0)
      .reverse()
      .map((lesson) => {
        const s = school.student(lesson.studentId);
        return {
          id: lesson.id,
          studentId: lesson.studentId,
          studentName: s.name,
          dateManila: stampIn(lesson.start, MANILA),
          dateTokyo: stampIn(lesson.start, TOKYO),
          category: s.category,
          subject: lesson.subject,
          point: lesson.points,
          status: STATUS_LABELS[lesson.status],
          studentRating: lesson.studentRating,
          studentComment: lesson.studentComment,
          feedbackSubmitted: lesson.feedbackSubmitted,
          feedback: lesson.feedback,
          hiddenNote: lesson.hiddenNote,
        };
      });
  });

  const pendingFeedback = computed(() =>
    lessonLog.value.filter((lesson) => !lesson.feedbackSubmitted && lesson.status === 'Completed')
  );

  const submitFeedback = (lessonId, { feedback, hiddenNote }) => {
    school.submitFeedback(lessonId, { feedback, hiddenNote });
  };

  // Availability grid. Days are columns, half-hour slots are rows, exactly like
  // the legacy scheduling matrix; `open` is what the instructor offers.
  /**
   * Week navigation. The schedule is a repeating weekly pattern, and each real
   * week follows it until the instructor changes that week — at which point the
   * week keeps its own hours as an exception. That is how rostering usually
   * works: you set a normal week once, then deal with the weeks that are not
   * normal.
   */
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** Midday, so a day's identity never moves under daylight saving. */
  const atNoon = (value) => {
    const d = value instanceof Date ? new Date(value) : new Date(`${value}T12:00:00`);
    d.setHours(12, 0, 0, 0);
    return d;
  };
  const isoDay = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const weekStartOf = (value) => {
    const d = atNoon(value);
    d.setDate(d.getDate() - d.getDay());
    return isoDay(d);
  };

  /**
   * Now, read on the canonical clock rather than the viewer's. Availability is
   * stored in Manila, so "today" and "already passed" have to be Manila's — a
   * viewer in Tokyo is an hour ahead and would otherwise cross into tomorrow,
   * and grey out an hour the instructor can still teach.
   */
  const nowTick = ref(Date.now());
  setInterval(() => { nowTick.value = Date.now(); }, 30000);

  const manilaNow = computed(() => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: CANONICAL_ZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date(nowTick.value));
    const at = (type) => parts.find((part) => part.type === type)?.value ?? '00';
    // Some locales render midnight as hour 24.
    const hour = at('hour') === '24' ? 0 : Number(at('hour'));
    return {
      iso: `${at('year')}-${at('month')}-${at('day')}`,
      minutes: hour * 60 + Number(at('minute')),
    };
  });

  const activeWeekStart = ref(weekStartOf(new Date()));
  const thisWeekStart = computed(() => weekStartOf(new Date()));

  /*
   * There is no publishing horizon any more.
   *
   * The pattern used to be shown for two weeks and nothing after, so a template
   * applied to "every week" reached the next fortnight and stopped — which is
   * not what those words say. A week follows the template until it is given
   * hours of its own.
   */

  const scheduleDays = computed(() => {
    const start = atNoon(activeWeekStart.value);
    return DAY_KEYS.map((key, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        key,
        label: DAY_LABELS[i],
        date: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
        iso: isoDay(d),
        dayOfMonth: d.getDate(),
        isToday: isoDay(d) === manilaNow.value.iso,
      };
    });
  });

  /** Manila hours the school actually books, paired with their Tokyo clock. */
  // Every hour of the day, not a 07:00-20:00 window. The old range was fixed in
  // Manila hours, so simply viewing the board in another zone slid the whole
  // day sideways and put early or late hours out of reach entirely — a Tokyo
  // instructor could not open 07:00 JST because it is 06:00 in Manila.
  /**
   * Half-hour granularity: lessons are 30 minutes, so an hour-only grid could
   * not express the shift that starts at half past. Every hour assumption in
   * the app reads this constant rather than the number 60.
   */
  const SLOT_MINUTES = 30;
  const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
  const clockText = (mins) =>
    `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  /** "09:30" -> "t0930": one stable key per slot, minutes included. */
  const slotKeyFor = (mins) => `t${clockText(mins).replace(':', '')}`;

  const scheduleSlots = ref(
    Array.from({ length: (24 * 60) / SLOT_MINUTES }, (_, i) => {
      const mins = i * SLOT_MINUTES;
      return {
        key: slotKeyFor(mins),
        minutes: mins,
        manila: clockText(mins),
        tokyo: clockText(mins + 60),
      };
    })
  );

  /**
   * The board is published through the school's records, so the student
   * booking page offers exactly the hours set here. The sample week below is
   * only a fallback for a record that has no board yet.
   */
  const sharedBoard = school.availabilityFor(TEACHER_ID);
  const cloneJson = (value) => JSON.parse(JSON.stringify(value ?? {}));

  const weekPattern = ref(
    sharedBoard?.weekPattern ? cloneJson(sharedBoard.weekPattern) : (() => {
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
      // The seed is written in whole hours; each one covers both its halves.
      Object.entries(openByDay).forEach(([day, hours]) => {
        hours.forEach((hour) => {
          for (let i = 0; i < SLOTS_PER_HOUR; i += 1) {
            seed[`${day}-${slotKeyFor(hour * 60 + i * SLOT_MINUTES)}`] = 'open';
          }
        });
      });

      const hold = (day, hour, reason) => {
        for (let i = 0; i < SLOTS_PER_HOUR; i += 1) {
          seed[`${day}-${slotKeyFor(hour * 60 + i * SLOT_MINUTES)}`] = { status: 'reserved', reason };
        }
      };
      hold('wed', 13, 'Demo Lesson');
      hold('fri', 16, 'Team Meeting / Sync');

      return seed;
    })()
  );

  /** Weeks that have stopped following the pattern, keyed by their Sunday. */
  const weekOverrides = ref(cloneJson(sharedBoard?.weekOverrides));

  /**
   * Everything already reads and writes `availability`, so pointing it at
   * either the pattern or the active week's exception keeps every caller —
   * grid, calendar, modals — working unchanged.
   */
  const availability = computed(
    () => weekOverrides.value[activeWeekStart.value] ?? weekPattern.value
  );

  const weekFollowsPattern = computed(() => !weekOverrides.value[activeWeekStart.value]);
  const weekHasOwnHours = (iso) => !!weekOverrides.value[iso];
  const editedWeeks = computed(() => Object.keys(weekOverrides.value));

  const copyMap = (map) =>
    Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, typeof v === 'object' && v ? { ...v } : v])
    );

  /**
   * Called before any write. Editing a week that still follows the pattern
   * forks it rather than quietly rewriting every other week too.
   */
  const beginWeekEdit = () => {
    if (weekOverrides.value[activeWeekStart.value]) return;
    // Editing a week starts from what it was already showing, which is the
    // template.
    weekOverrides.value[activeWeekStart.value] = copyMap(weekPattern.value);
  };

  /** Drop this week's exception and go back to the repeating pattern. */
  const followPattern = () => {
    delete weekOverrides.value[activeWeekStart.value];
  };

  /**
   * Write straight into the repeating pattern. Going via the week and then
   * promoting it would carry today's holes into every week that follows —
   * hours that have already passed cannot be set on this week, so they would
   * come out missing from the template too. The week's own edits are kept as
   * the base, then its exception is dropped: it now says what the pattern
   * says, so it no longer needs a copy of its own.
   */
  const writePattern = (mutate) => {
    const next = copyMap(weekOverrides.value[activeWeekStart.value] ?? weekPattern.value);
    mutate(next);
    weekPattern.value = next;
    delete weekOverrides.value[activeWeekStart.value];
  };

  /**
   * The template, handed out as a copy and taken back whole.
   *
   * The editor works on the copy so Cancel can mean cancel: this map is the
   * shape every unedited week takes, so a stray change reaches weeks nobody is
   * looking at.
   */
  /** Whether an hour is in the template, i.e. whether it comes back every week. */
  const patternHasSlot = (dayKey, slotKey) =>
    readStatus(weekPattern.value, dayKey, slotKey) !== 'closed';

  /** Take hours out of the template, so they stop coming back. */
  const clearPatternSlots = (pairs) => {
    const next = copyMap(weekPattern.value);
    pairs.forEach(({ dayKey, slotKey }) => { delete next[`${dayKey}-${slotKey}`]; });
    weekPattern.value = next;
  };

  /**
   * Hours a repeat rule wrote, kept per week as `{ [weekStart]: { id: true } }`.
   *
   * A daily or custom rule does not touch the weekly template: it writes real
   * hours into each week it covers, and those weeks' own maps say nothing
   * about where the hours came from. Without this record the board cannot tell
   * an hour that comes back from one put down on its own.
   */
  const recurringSlots = ref(cloneJson(sharedBoard?.recurringSlots));

  /*
   * Two-way sync with the shared board. Every edit is written back whole; a
   * change from elsewhere (another tab, a demo reset) is adopted whole. Both
   * sides compare serialised text first, so the write an adoption causes, and
   * the adoption a write causes, each stop after one step instead of looping.
   */
  const localBoardJson = () => JSON.stringify({
    weekPattern: weekPattern.value,
    weekOverrides: weekOverrides.value,
    recurringSlots: recurringSlots.value,
  });
  const sharedBoardJson = () => {
    const board = school.availabilityFor(TEACHER_ID);
    return board ? JSON.stringify({
      weekPattern: board.weekPattern ?? {},
      weekOverrides: board.weekOverrides ?? {},
      recurringSlots: board.recurringSlots ?? {},
    }) : '';
  };

  watch([weekPattern, weekOverrides, recurringSlots], () => {
    if (localBoardJson() === sharedBoardJson()) return;
    school.setAvailability(TEACHER_ID, {
      weekPattern: weekPattern.value,
      weekOverrides: weekOverrides.value,
      recurringSlots: recurringSlots.value,
    });
  }, { deep: true, immediate: true });

  watch(sharedBoardJson, (json) => {
    if (!json || json === localBoardJson()) return;
    const board = JSON.parse(json);
    weekPattern.value = board.weekPattern;
    weekOverrides.value = board.weekOverrides;
    recurringSlots.value = board.recurringSlots;
  });

  const markRecurring = (weekStartIso, dayKey, slotKey, on = true) => {
    const week = weekStartOf(weekStartIso);
    const id = `${dayKey}-${slotKey}`;
    const current = recurringSlots.value[week];
    if (on) {
      recurringSlots.value[week] = { ...(current || {}), [id]: true };
      return;
    }
    if (!current?.[id]) return;
    const next = { ...current };
    delete next[id];
    if (Object.keys(next).length) recurringSlots.value[week] = next;
    else delete recurringSlots.value[week];
  };

  const isRecurringOn = (weekStartIso, dayKey, slotKey) =>
    !!recurringSlots.value[weekStartOf(weekStartIso)]?.[`${dayKey}-${slotKey}`];

  /**
   * Whether an hour on the week in view comes back — because the template
   * carries it, or because a repeat rule wrote it. Both answers mean the same
   * thing to the instructor, so the board asks one question.
   */
  const slotRepeats = (dayKey, slotKey) =>
    patternHasSlot(dayKey, slotKey) || isRecurringOn(activeWeekStart.value, dayKey, slotKey);

  /** Take hours out of every upcoming week a rule wrote them into. */
  const clearRecurringSlots = (pairs) => {
    Object.keys(recurringSlots.value)
      .filter((iso) => iso >= thisWeekStart.value)
      .forEach((iso) => {
        pairs.forEach(({ dayKey, slotKey }) => {
          if (!isRecurringOn(iso, dayKey, slotKey)) return;
          setSlotStatusOn(iso, dayKey, slotKey, 'closed');
        });
      });
  };

  const clonePattern = () => copyMap(weekPattern.value);
  const setPattern = (map) => { weekPattern.value = copyMap(map); };

  /**
   * Put weeks back under the template's authority.
   *
   * A week that was edited on its own stops following the pattern, so a later
   * change to the template appears not to reach it. Dropping those exceptions
   * is what makes "applies every week" true. Weeks already behind us keep
   * theirs — they are a record of what was taught, not a plan.
   */
  const upcomingEditedWeeks = computed(() =>
    Object.keys(weekOverrides.value).filter((iso) => iso >= thisWeekStart.value)
  );

  /**
   * Reserved hours a week holds that the template did not hand it.
   *
   * Forking a week copies the template, holds included, so "is this slot
   * reserved" cannot tell a promise apart from an inherited placeholder.
   * Comparing against the template it was forked from can: what the template
   * also reserves belongs to the template and may be replaced, and what only
   * the week has was put there for that week alone.
   */
  const ownHolds = (own, pattern) => {
    if (!own) return [];
    return Object.keys(own)
      .filter((key) => statusAt(own, key) === 'reserved' && statusAt(pattern, key) !== 'reserved')
      .map((key) => {
        const value = own[key];
        return {
          key,
          value: typeof value === 'object' && value ? { ...value } : value,
          reason: typeof value === 'object' && value ? value.reason || '' : '',
        };
      });
  };

  /** Everything a template change would destroy if it were allowed to. */
  const upcomingHolds = computed(() =>
    upcomingEditedWeeks.value.flatMap((iso) =>
      ownHolds(weekOverrides.value[iso], weekPattern.value).map((hold) => ({
        weekStartIso: iso,
        ...hold,
      }))
    )
  );

  /**
   * Make `nextPattern` the template, and put every upcoming week back under it.
   *
   * Hours a week was given on its own are availability, and availability is
   * what a template is for, so those are replaced — that is what makes "every
   * week" true. A reserved hour is not availability: it is time promised to
   * somebody, and a template has no business deleting it. Those are carried
   * across and laid back on top, unless the instructor asks otherwise.
   *
   * Returns the holds it protected, so the caller can say what it kept.
   */
  const republishPattern = (nextPattern, { keepHolds = true } = {}) => {
    const previous = weekPattern.value;
    const next = { ...weekOverrides.value };
    const kept = [];

    upcomingEditedWeeks.value.forEach((iso) => {
      const holds = keepHolds ? ownHolds(next[iso], previous) : [];
      if (!holds.length) {
        delete next[iso];
        return;
      }
      const merged = copyMap(nextPattern);
      holds.forEach((hold) => {
        merged[hold.key] = hold.value;
        kept.push({ weekStartIso: iso, ...hold });
      });
      next[iso] = merged;
    });

    weekPattern.value = copyMap(nextPattern);
    weekOverrides.value = next;
    return kept;
  };

  /** Promote this week's hours to the pattern every other week follows. */
  const applyWeekToPattern = () => {
    const own = weekOverrides.value[activeWeekStart.value];
    if (!own) return;
    weekPattern.value = copyMap(own);
    delete weekOverrides.value[activeWeekStart.value];
  };

  const goToWeek = (iso) => { activeWeekStart.value = weekStartOf(iso); };
  const shiftWeek = (weeks) => {
    const d = atNoon(activeWeekStart.value);
    d.setDate(d.getDate() + weeks * 7);
    activeWeekStart.value = isoDay(d);
  };
  const goToThisWeek = () => { activeWeekStart.value = thisWeekStart.value; };

  const statusAt = (map, key) => {
    const val = map?.[key];
    if (!val) return 'closed';
    if (val === true || val === 'open' || (typeof val === 'object' && val?.status === 'open')) return 'open';
    if (val === 'reserved' || (typeof val === 'object' && val?.status === 'reserved')) return 'reserved';
    return 'closed';
  };

  const readStatus = (map, dayKey, slotKey) => statusAt(map, `${dayKey}-${slotKey}`);

  /** The hours a given week is actually running, template or its own. */
  const hoursFor = (weekStartIso) =>
    weekOverrides.value[weekStartOf(weekStartIso)] ?? weekPattern.value;

  const getSlotStatusOn = (weekStartIso, dayKey, slotKey) =>
    readStatus(hoursFor(weekStartIso), dayKey, slotKey);

  const getSlotStatus = (dayKey, slotKey) => readStatus(availability.value, dayKey, slotKey);

  const isOpen = (dayKey, slotKey) => getSlotStatus(dayKey, slotKey) === 'open';
  const isReserved = (dayKey, slotKey) => getSlotStatus(dayKey, slotKey) === 'reserved';
  const isClosed = (dayKey, slotKey) => getSlotStatus(dayKey, slotKey) === 'closed';

  const getSlotReason = (dayKey, slotKey) => {
    const val = availability.value[`${dayKey}-${slotKey}`];
    if (typeof val === 'object' && val?.reason) return val.reason;
    if (val === 'reserved') return 'Reserved';
    return '';
  };

  /**
   * Whether a slot has already begun. Hours that have started are not offers
   * any more — a student cannot book into one — so nothing may change them.
   * ISO dates compare correctly as strings, which is why they are built that
   * way.
   */
  const isPastSlot = (dayKey, slotKey) => {
    const day = scheduleDays.value.find((d) => d.key === dayKey);
    const slot = scheduleSlots.value.find((sl) => sl.key === slotKey);
    if (!day || !slot) return false;
    if (day.iso !== manilaNow.value.iso) return day.iso < manilaNow.value.iso;
    return slot.minutes <= manilaNow.value.minutes;
  };

  /**
   * Free Conversation, as it stands this minute.
   *
   * The header carries this, so it must read the hours *this* week has rather
   * than the week the schedule page happens to be showing — `availability`
   * follows `activeWeekStart`, which moves as the instructor pages through the
   * calendar, and the badge would otherwise report another week's Tuesday.
   *
   * `live` is the honest question a student's request meets: not "is the
   * instructor willing" but "is this half hour open, right now". Away answers
   * it on its own; an open hour that has not come round yet does not.
   */
  const thisWeekHours = computed(
    () => weekOverrides.value[thisWeekStart.value] ?? weekPattern.value
  );

  /**
   * Open slots in the week on the clock.
   *
   * `weeklyOpen` counts the week the schedule page is parked on, which is the
   * right answer there and the wrong one anywhere that says "this week" — page
   * the calendar to December and the figure would follow it.
   */
  const thisWeekOpenSlots = computed(
    () => Object.keys(thisWeekHours.value).filter((key) => statusAt(thisWeekHours.value, key) === 'open').length
  );

  const freeConversationNow = computed(() => {
    const now = manilaNow.value;
    const hours = thisWeekHours.value;
    const dayIndex = new Date(`${now.iso}T12:00:00`).getDay();
    const slotStart = Math.floor(now.minutes / SLOT_MINUTES) * SLOT_MINUTES;
    const openAt = (dayOffset, minutes) =>
      readStatus(hours, DAY_KEYS[(dayIndex + dayOffset) % 7], slotKeyFor(minutes)) === 'open';

    const inOpenHour = openAt(0, slotStart);

    // How much of the current run is left, so the badge can say until when.
    let endsAt = slotStart;
    if (inOpenHour) {
      while (endsAt + SLOT_MINUTES < 24 * 60 && openAt(0, endsAt + SLOT_MINUTES)) {
        endsAt += SLOT_MINUTES;
      }
      endsAt += SLOT_MINUTES;
    }

    // Otherwise, the next hour that opens — a week is far enough to look.
    let next = null;
    for (let offset = 0; offset < 7 && !next; offset += 1) {
      const from = offset === 0 ? slotStart + SLOT_MINUTES : 0;
      for (let mins = from; mins < 24 * 60; mins += SLOT_MINUTES) {
        if (openAt(offset, mins)) {
          next = { dayOffset: offset, minutes: mins };
          break;
        }
      }
    }

    return {
      away: isAway.value,
      live: !isAway.value && inOpenHour,
      /** Set only while live: the minute the current open run ends. */
      endsAt: inOpenHour ? endsAt : null,
      /** Set only when not live: when the next open hour begins. */
      next,
      /** True when the hours exist but the instructor turned them off. */
      pausedInOpenHour: isAway.value && inOpenHour,
    };
  });

  /** Every edit in the portal lands here, so the rule is enforced once. */
  const setSlotStatus = (dayKey, slotKey, status, reason = '') => {
    if (isPastSlot(dayKey, slotKey)) return;
    beginWeekEdit();
    const id = `${dayKey}-${slotKey}`;
    if (status === 'closed') {
      // The hour is gone, so the record of what put it there goes with it.
      markRecurring(activeWeekStart.value, dayKey, slotKey, false);
      delete availability.value[id];
    } else if (status === 'reserved') {
      availability.value[id] = { status: 'reserved', reason: reason || 'Reserved' };
    } else {
      availability.value[id] = 'open';
    }
  };

  /**
   * Write into a week other than the one on screen.
   *
   * Every write goes through `setSlotStatus`, which resolves "has this hour
   * begun?" through `scheduleDays` — and that follows `activeWeekStart`. So the
   * honest way to write into another week is to stand in it: move the pointer,
   * write, move back. Doing the arithmetic separately would mean a second copy
   * of the past-hour rule, and two copies drift.
   *
   * Returns how many slots actually changed, so a caller can tell the
   * instructor what it managed rather than what it attempted.
   */
  const withWeek = (weekStartIso, fn) => {
    const here = activeWeekStart.value;
    activeWeekStart.value = weekStartOf(weekStartIso);
    try {
      return fn();
    } finally {
      activeWeekStart.value = here;
    }
  };

  const setSlotStatusOn = (weekStartIso, dayKey, slotKey, status, reason = '') =>
    withWeek(weekStartIso, () => {
      if (isPastSlot(dayKey, slotKey)) return 0;
      setSlotStatus(dayKey, slotKey, status, reason);
      return 1;
    });

  // Cycle slot: closed -> open -> reserved -> closed
  // No sample note by default: cycling a slot says it is held, not why.
  // `setSlotStatus` labels an unexplained hold "Reserved".
  const cycleSlot = (dayKey, slotKey, defaultReason = '') => {
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

  /** Slots are half-hours now, so anything user-facing counts in hours. */
  const asHours = (slots) => Math.round((slots / SLOTS_PER_HOUR) * 10) / 10;
  const openHours = computed(() => asHours(openSlotCount.value));
  const reservedHours = computed(() => asHours(reservedSlotCount.value));

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
    ranges: ['This week', 'This month', 'Last 3 months', 'This year'],
    byRange: {
      // Seven days of the same week the schedule board shows, so the capacity
      // ring and the availability grid cannot disagree about it.
      'This week': {
        lessons: 20,
        hours: '10.0',
        rating: 4.97,
        completionRate: 95,
        students: 12,
        repeatShare: 80,
        capacity: { open: 54, booked: 20 },
        series: [
          { label: 'Mon', booked: 5, total: 10 },
          { label: 'Tue', booked: 4, total: 9 },
          { label: 'Wed', booked: 3, total: 8 },
          { label: 'Thu', booked: 5, total: 11 },
          { label: 'Fri', booked: 2, total: 9 },
          { label: 'Sat', booked: 1, total: 7 },
        ],
        subjects: [
          { code: 'SF', label: 'Speech Fluency', lessons: 7 },
          { code: 'DC', label: 'Daily Conversation', lessons: 5 },
          { code: 'FC', label: 'Free Conversation', lessons: 4 },
          { code: 'LS1', label: 'Listening 1', lessons: 3 },
          { code: 'EP', label: 'Exam Prep', lessons: 1 },
        ],
        ratings: [
          { stars: 5, count: 16 },
          { stars: 4, count: 2 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ],
        attendance: [
          { label: 'Completed', count: 19, tone: 'emerald' },
          { label: 'Student no-show', count: 0, tone: 'rose' },
          { label: 'Cancelled by student', count: 1, tone: 'amber' },
          { label: 'Cancelled by you', count: 0, tone: 'slate' },
        ],
        peakDay: { name: 'Thursday & Monday', share: '25%', lessons: 5, note: 'Highest booking rate (50%)' },
        peakHour: { window: '2PM – 4PM & 7PM – 9PM', slot: '2PM (64 classes)', share: '35%', note: 'Afternoon & evening demand peaks' },
        peakDays: [
          { day: 'Mon', full: 'Monday', lessons: 5, bookedRate: 50, isPeak: true },
          { day: 'Tue', full: 'Tuesday', lessons: 4, bookedRate: 44, isPeak: false },
          { day: 'Wed', full: 'Wednesday', lessons: 3, bookedRate: 38, isPeak: false },
          { day: 'Thu', full: 'Thursday', lessons: 5, bookedRate: 45, isPeak: true },
          { day: 'Fri', full: 'Friday', lessons: 2, bookedRate: 22, isPeak: false },
          { day: 'Sat', full: 'Saturday', lessons: 1, bookedRate: 14, isPeak: false },
          { day: 'Sun', full: 'Sunday', lessons: 0, bookedRate: 0, isPeak: false },
        ],
        peakHours: [
          { time: '1AM', value: 0 },
          { time: '2AM', value: 0 },
          { time: '3AM', value: 0 },
          { time: '4AM', value: 0 },
          { time: '5AM', value: 4 },
          { time: '6AM', value: 13 },
          { time: '7AM', value: 17 },
          { time: '8AM', value: 22 },
          { time: '9AM', value: 36 },
          { time: '10AM', value: 42 },
          { time: '11AM', value: 46 },
          { time: '12PM', value: 48 },
          { time: '1PM', value: 56 },
          { time: '2PM', value: 64, isPeak: true },
          { time: '3PM', value: 60 },
          { time: '4PM', value: 58 },
          { time: '5PM', value: 51 },
          { time: '6PM', value: 42 },
          { time: '7PM', value: 37 },
          { time: '8PM', value: 31 },
          { time: '9PM', value: 23 },
          { time: '10PM', value: 13 },
          { time: '11PM', value: 8 },
          { time: '12AM', value: 2 },
        ],
      },
      'This month': {
        lessons: 62,
        hours: '31.0',
        capacity: { open: 216, booked: 62 },
        rating: 4.98,
        completionRate: 99,
        students: 24,
        repeatShare: 78,
        // Lessons per calendar week within the range.
        series: [
          { label: 'W1', booked: 14, total: 48 },
          { label: 'W2', booked: 17, total: 58 },
          { label: 'W3', booked: 16, total: 56 },
          { label: 'W4', booked: 15, total: 54 },
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
        peakDay: { name: 'Thursday', share: '24%', lessons: 15, note: 'Consistent mid-week demand' },
        peakHour: { window: '1PM – 4PM & 6PM – 8PM', slot: '2PM (66 classes)', share: '38%', note: 'Evening rush across all weeks' },
        peakDays: [
          { day: 'Mon', full: 'Monday', lessons: 13, bookedRate: 38, isPeak: false },
          { day: 'Tue', full: 'Tuesday', lessons: 11, bookedRate: 35, isPeak: false },
          { day: 'Wed', full: 'Wednesday', lessons: 10, bookedRate: 32, isPeak: false },
          { day: 'Thu', full: 'Thursday', lessons: 15, bookedRate: 46, isPeak: true },
          { day: 'Fri', full: 'Friday', lessons: 7, bookedRate: 24, isPeak: false },
          { day: 'Sat', full: 'Saturday', lessons: 4, bookedRate: 18, isPeak: false },
          { day: 'Sun', full: 'Sunday', lessons: 2, bookedRate: 10, isPeak: false },
        ],
        peakHours: [
          { time: '1AM', value: 0 },
          { time: '2AM', value: 0 },
          { time: '3AM', value: 0 },
          { time: '4AM', value: 0 },
          { time: '5AM', value: 5 },
          { time: '6AM', value: 14 },
          { time: '7AM', value: 18 },
          { time: '8AM', value: 25 },
          { time: '9AM', value: 38 },
          { time: '10AM', value: 44 },
          { time: '11AM', value: 47 },
          { time: '12PM', value: 50 },
          { time: '1PM', value: 58 },
          { time: '2PM', value: 66, isPeak: true },
          { time: '3PM', value: 62 },
          { time: '4PM', value: 59 },
          { time: '5PM', value: 53 },
          { time: '6PM', value: 45 },
          { time: '7PM', value: 39 },
          { time: '8PM', value: 33 },
          { time: '9PM', value: 24 },
          { time: '10PM', value: 14 },
          { time: '11PM', value: 9 },
          { time: '12AM', value: 2 },
        ],
      },
      'Last 3 months': {
        lessons: 178,
        hours: '89.0',
        capacity: { open: 648, booked: 178 },
        rating: 4.96,
        completionRate: 98,
        students: 41,
        repeatShare: 74,
        series: [
          { label: 'Jun', booked: 54, total: 207 },
          { label: 'Jul', booked: 62, total: 225 },
          { label: 'Aug', booked: 62, total: 216 },
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
        peakDay: { name: 'Thursday', share: '23%', lessons: 41, note: 'Preferred day for Speech Fluency' },
        peakHour: { window: '1PM – 4PM & 6PM – 9PM', slot: '2PM (68 classes)', share: '36%', note: 'Highest student retention rate' },
        peakDays: [
          { day: 'Mon', full: 'Monday', lessons: 36, bookedRate: 36, isPeak: false },
          { day: 'Tue', full: 'Tuesday', lessons: 32, bookedRate: 33, isPeak: false },
          { day: 'Wed', full: 'Wednesday', lessons: 29, bookedRate: 30, isPeak: false },
          { day: 'Thu', full: 'Thursday', lessons: 41, bookedRate: 44, isPeak: true },
          { day: 'Fri', full: 'Friday', lessons: 22, bookedRate: 24, isPeak: false },
          { day: 'Sat', full: 'Saturday', lessons: 12, bookedRate: 16, isPeak: false },
          { day: 'Sun', full: 'Sunday', lessons: 6, bookedRate: 11, isPeak: false },
        ],
        peakHours: [
          { time: '1AM', value: 0 },
          { time: '2AM', value: 0 },
          { time: '3AM', value: 0 },
          { time: '4AM', value: 0 },
          { time: '5AM', value: 6 },
          { time: '6AM', value: 16 },
          { time: '7AM', value: 20 },
          { time: '8AM', value: 27 },
          { time: '9AM', value: 40 },
          { time: '10AM', value: 46 },
          { time: '11AM', value: 49 },
          { time: '12PM', value: 52 },
          { time: '1PM', value: 60 },
          { time: '2PM', value: 68, isPeak: true },
          { time: '3PM', value: 64 },
          { time: '4PM', value: 61 },
          { time: '5PM', value: 54 },
          { time: '6PM', value: 46 },
          { time: '7PM', value: 40 },
          { time: '8PM', value: 34 },
          { time: '9PM', value: 26 },
          { time: '10PM', value: 16 },
          { time: '11PM', value: 10 },
          { time: '12AM', value: 3 },
        ],
      },
      'This year': {
        lessons: 486,
        hours: '243.0',
        capacity: { open: 2106, booked: 486 },
        rating: 4.95,
        completionRate: 98,
        students: 68,
        repeatShare: 71,
        series: [
          { label: 'Jan', booked: 32, total: 180 },
          { label: 'Feb', booked: 34, total: 162 },
          { label: 'Mar', booked: 42, total: 184 },
          { label: 'Apr', booked: 40, total: 174 },
          { label: 'May', booked: 46, total: 184 },
          { label: 'Jun', booked: 46, total: 168 },
          { label: 'Jul', booked: 58, total: 184 },
          { label: 'Aug', booked: 62, total: 180 },
          { label: 'Sep', booked: 58, total: 162 },
          { label: 'Oct', booked: 44, total: 176 },
          { label: 'Nov', booked: 18, total: 172 },
          { label: 'Dec', booked: 6, total: 180 },
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
        peakDay: { name: 'Thursday & Monday', share: '22%', lessons: 108, note: 'Dominates weekly student bookings' },
        peakHour: { window: '1PM – 4PM & 6PM – 9PM', slot: '2PM (70 classes)', share: '37%', note: 'Annual highest reservation volume' },
        peakDays: [
          { day: 'Mon', full: 'Monday', lessons: 104, bookedRate: 36, isPeak: false },
          { day: 'Tue', full: 'Tuesday', lessons: 88, bookedRate: 32, isPeak: false },
          { day: 'Wed', full: 'Wednesday', lessons: 82, bookedRate: 30, isPeak: false },
          { day: 'Thu', full: 'Thursday', lessons: 108, bookedRate: 43, isPeak: true },
          { day: 'Fri', full: 'Friday', lessons: 62, bookedRate: 25, isPeak: false },
          { day: 'Sat', full: 'Saturday', lessons: 28, bookedRate: 15, isPeak: false },
          { day: 'Sun', full: 'Sunday', lessons: 14, bookedRate: 9, isPeak: false },
        ],
        peakHours: [
          { time: '1AM', value: 0 },
          { time: '2AM', value: 0 },
          { time: '3AM', value: 0 },
          { time: '4AM', value: 0 },
          { time: '5AM', value: 7 },
          { time: '6AM', value: 17 },
          { time: '7AM', value: 22 },
          { time: '8AM', value: 29 },
          { time: '9AM', value: 42 },
          { time: '10AM', value: 48 },
          { time: '11AM', value: 51 },
          { time: '12PM', value: 55 },
          { time: '1PM', value: 62 },
          { time: '2PM', value: 70, isPeak: true },
          { time: '3PM', value: 65 },
          { time: '4PM', value: 62 },
          { time: '5PM', value: 56 },
          { time: '6PM', value: 48 },
          { time: '7PM', value: 42 },
          { time: '8PM', value: 36 },
          { time: '9PM', value: 28 },
          { time: '10PM', value: 18 },
          { time: '11PM', value: 11 },
          { time: '12AM', value: 3 },
        ],
      },
    },
  });

  /** Lessons per weekday in the week on screen, from the shared lesson records. */
  const lessonsBookedByDay = computed(() => {
    const counts = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };
    school.lessonsForTeacher(TEACHER_ID)
      .filter((lesson) => lesson.status === 'booked' || lesson.status === 'completed')
      .forEach((lesson) => {
        const { dateIso, dayKey } = manilaSlotOf(lesson.start);
        if (weekStartIso(dateIso) === activeWeekStart.value) counts[dayKey] += 1;
      });
    return counts;
  });

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
    const [y, m, d] = manilaNow.value.iso.split('-').map(Number);
    const today = `${MONTH_ABBR[m - 1]} ${d}, ${y} `;
    return reservations.value.filter((row) => row.startManila.startsWith(today));
  });

  /** Everything waiting on the instructor, most urgent first. */
  const attentionItems = computed(() => [
    ...writingTasks.value
      .filter((task) => task.state !== 'Complete' && task.dueInHours < 12)
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

  /** Student messages not yet seen, across every thread — the Messages badge. */
  const unreadMessageCount = computed(() =>
    school.threadsForTeacher(TEACHER_ID).reduce((sum, thread) => sum + school.unreadIn(thread, 'teacher'), 0)
  );

  const fullName = computed(() => `${profile.value.firstName} ${profile.value.lastName}`);

  return {
    profile, fullName, isAway, toggleAway, teachesFreeConversation, googleCalendarLinked,
    googleCalendarAccount, googleCalendarSyncedAt, calendarSettingsOpen,
    linkGoogleCalendar, unlinkGoogleCalendar,
    usesTokyo, localStart, localRange, countdownLabel, viewZoneId, viewZoneAbbr, awaySince, imminentReservation,
    viewTimezone, viewTimezones, timezoneSettingsOpen,
    reservations, nextReservation, laterReservations, canJoin,
    writingTasks, pendingWritingCount, sendWritingReply, completeWritingTask,
    lessonLog, pendingFeedback, submitFeedback,
    materialsByStudent, materialsFor, materialCount, addMaterial, removeMaterial,
    scheduleDays, scheduleSlots, availability, getSlotStatus, isOpen, isReserved, isClosed,
    activeWeekStart, thisWeekStart, weekOverrides, weekFollowsPattern, weekHasOwnHours,
    editedWeeks, beginWeekEdit, followPattern, applyWeekToPattern, writePattern,
    withWeek, setSlotStatusOn,
    goToWeek, shiftWeek, goToThisWeek, weekStartOf,
    manilaNow, isPastSlot, freeConversationNow, thisWeekOpenSlots,
    clonePattern, setPattern, upcomingEditedWeeks, republishPattern, upcomingHolds, getSlotStatusOn,
    recurringSlots, markRecurring, isRecurringOn, slotRepeats, clearRecurringSlots,
    patternHasSlot, clearPatternSlots,
    getSlotReason, setSlotStatus, cycleSlot, toggleSlot, setDay, setDayStatus, setSlotRow, setSlotRowStatus,
    openSlotCount, reservedSlotCount, openHours, reservedHours, SLOT_MINUTES, SLOTS_PER_HOUR,
    weeklyLoad, weeklyBooked, weeklyOpen, todaysReservations, attentionItems, recentRatings,
    unreadMessageCount, teacherId: TEACHER_ID,
    analytics,
  };
});
