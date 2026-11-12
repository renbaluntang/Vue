import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { imageForKey } from '@/lib/teacherImages';
import { buildSeed, SEED_VERSION } from '@/lib/schoolSeed';
import { ASSESSMENT_TYPES, assessmentTypeOf, levelInfo, isValidRating, LEVEL_CHECK_CANCEL_MINUTES } from '@/lib/brelas';
import {
  manilaToday, dayDiff, addDays, addMinutes, minutesUntil, manilaSlotOf, weekStartIso, slotKeyFor,
} from '@/lib/schoolTime';

/**
 * The school's shared records: the one place both portals read and write.
 *
 * The student and instructor portals are separate apps, so they cannot share
 * memory. This store keeps its data in localStorage under one key, and listens
 * for that key changing in another tab — so booking a lesson as Taro shows up
 * in Jirvy's reservations, in the same browser, without a reload. When a real
 * API arrives, this store is the seam: replace load/save with requests.
 *
 * Keeping the demo current: the sample data is dated relative to an anchor day.
 * Whenever the store opens on a later Manila day, every timestamp moves forward
 * by the same number of days, so "tonight's lesson" is always tonight. Records
 * created while using the app move with them.
 */

const STORAGE_KEY = 'brighture:school:v1';

/** When Reset demo data last ran (epoch ms), in any tab. */
export const DEMO_RESET_AT_KEY = 'brighture:demo-reset-at';

// Page settings that Reset demo data clears. Add a key here when a page starts
// remembering a new layout choice.
const PAGE_SETTING_KEYS = [
  'brighture:dashboard:referral-hidden',
  'brighture:sidebar-collapsed',
  'brighture:teacher-sidebar-collapsed',
  'brighture:admin:zone',
  'teacher_scheduling_added_timezones',
  'teacher_scheduling_active_timezone',
  'student_view_v4_favorites',
];
const WRITING_COST = 5;
/** Free cancellation up to this many minutes before the start. */
const FREE_CANCEL_MINUTES = 180;

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Every ISO timestamp field in the data, so a re-base can move them all. */
const shiftAll = (db, days) => {
  if (!days) return db;
  const s = (iso) => (iso ? addDays(iso, days) : iso);
  db.lessons.forEach((l) => {
    l.start = s(l.start);
    Object.keys(l.reviewed ?? {}).forEach((id) => { l.reviewed[id] = s(l.reviewed[id]); });
  });
  db.writing.forEach((w) => {
    w.submittedAt = s(w.submittedAt);
    w.dueAt = s(w.dueAt);
    w.messages.forEach((m) => { m.at = s(m.at); });
  });
  db.threads.forEach((t) => {
    t.teacherReadAt = s(t.teacherReadAt);
    t.studentReadAt = s(t.studentReadAt);
    t.messages.forEach((m) => { m.at = s(m.at); });
  });
  db.exams.forEach((e) => { e.updatedAt = s(e.updatedAt); });
  db.submissions.forEach((x) => { x.submittedAt = s(x.submittedAt); x.gradedAt = s(x.gradedAt); });
  Object.values(db.wallets).forEach((w) => w.entries.forEach((e) => { e.at = s(e.at); }));
  (db.templates ?? []).forEach((t) => { t.updatedAt = s(t.updatedAt); });
  (db.assessments ?? []).forEach((x) => { x.scheduledAt = s(x.scheduledAt); x.submittedAt = s(x.submittedAt); });
  (db.levelHistory ?? []).forEach((h) => { h.at = s(h.at); });
  (db.outbox ?? []).forEach((m) => { m.at = s(m.at); });
  (db.classCopies ?? []).forEach((c) => { c.sentAt = s(c.sentAt); });
  Object.values(db.students ?? {}).forEach((st) => { st.recordingConsentAt = s(st.recordingConsentAt); });
  if (db.levelReminder) db.levelReminder.at = s(db.levelReminder.at);
  return db;
};

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === SEED_VERSION ? parsed : null;
  } catch {
    return null;
  }
};

/** Stored data moved onto today, or a fresh seed. */
const loadDb = () => {
  const today = manilaToday();
  const stored = readStored();
  if (!stored) return buildSeed(today);
  const days = dayDiff(stored.anchor, today);
  if (days > 0) {
    shiftAll(stored, days);
    stored.anchor = today;
  }
  return stored;
};

export const useSchoolStore = defineStore('school', () => {
  const db = ref(loadDb());

  // Save on every change. A change made in another tab arrives as a storage
  // event; adopting it replaces db, and the save that follows writes the same
  // text back, which other tabs ignore because the value did not change.
  let adopting = false;
  watch(db, (value) => {
    if (adopting) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* storage full or blocked */ }
  }, { deep: true, immediate: true });

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue);
        if (next?.version !== SEED_VERSION) return;
        adopting = true;
        db.value = next;
        queueMicrotask(() => { adopting = false; });
      } catch { /* ignore malformed */ }
    });
  }

  /** Clock for countdowns; ticks every 30 seconds. */
  const now = ref(Date.now());
  setInterval(() => { now.value = Date.now(); }, 30_000);

  /**
   * Throws away every change and starts again from the sample data, along
   * with the page settings people change as they click around (hidden
   * dashboard cards, a collapsed sidebar, favourite teachers, added time
   * zones), so the demo looks the way it did on first open. Language and
   * dark mode are kept: they are the viewer's own choice, not demo state.
   */
  const resetDemo = () => {
    db.value = buildSeed(manilaToday());
    try {
      // Written here rather than left to the watcher, which runs after this
      // function returns and would be cut off by the reload below.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db.value));
      // Other open tabs are not reloaded, and their sessionStorage is out of
      // reach from here, so pages that remember a choice compare it against
      // this time and drop anything saved before it.
      localStorage.setItem(DEMO_RESET_AT_KEY, String(Date.now()));
      for (const key of PAGE_SETTING_KEYS) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    } catch { /* storage blocked: the reload still starts from the seed */ }
    // The settings above are read once when each page opens, so reload to
    // pick up their defaults everywhere instead of resetting each by hand.
    if (typeof window !== 'undefined') window.location.reload();
  };

  // ── People ────────────────────────────────────────────────────────────
  const student = (id) => db.value.students[id] ?? { id, name: `Student ${id}`, photo: '', membership: 'Regular', category: 'Online', timezone: 'Asia/Tokyo' };
  const teacher = (id) => {
    const t = db.value.teachers[id];
    return { id, name: t?.name ?? 'Unassigned', photo: imageForKey(id) };
  };

  // ── Lessons ───────────────────────────────────────────────────────────
  const lessons = computed(() => [...db.value.lessons].sort((a, b) => a.start.localeCompare(b.start)));
  const lessonsForTeacher = (teacherId) => lessons.value.filter((l) => l.teacherId === teacherId);
  const lessonsForStudent = (studentId) => lessons.value.filter((l) => l.studentId === studentId);
  const findLesson = (id) => db.value.lessons.find((l) => l.id === id);

  /**
   * The student's answer to "may teachers record my lessons". Kept with when
   * it was given, since permission is what the recording step checks.
   */
  const setRecordingConsent = (studentId, allowed) => {
    const st = db.value.students[studentId];
    if (!st) return;
    st.recordingConsent = !!allowed;
    st.recordingConsentAt = new Date().toISOString();
  };

  /** Whether the teacher already has a booked lesson overlapping this window. */
  const teacherBusy = (teacherId, startIso, duration, ignoreId = null) => {
    const s = new Date(startIso).getTime();
    const e = s + duration * 60_000;
    return db.value.lessons.some((l) => l.teacherId === teacherId && l.status === 'booked' && l.id !== ignoreId
      && new Date(l.start).getTime() < e && new Date(l.start).getTime() + l.duration * 60_000 > s);
  };

  /**
   * Sample bookings by other students, so a teacher's week doesn't look
   * empty: about one working hour in five, picked by a stable hash of the
   * teacher, Manila date and hour, so the same hours stay taken on every
   * render. Demo data only; these are not lessons in the store.
   */
  const sampleTaken = (teacherId, startIso) => {
    const { dateIso, minutes } = manilaSlotOf(startIso);
    const text = `${teacherId}|${dateIso}|${Math.floor(minutes / 60)}`;
    let hash = 0;
    for (let k = 0; k < text.length; k += 1) hash = (hash * 31 + text.charCodeAt(k)) >>> 0;
    return hash % 100 < 20;
  };

  /** Whether the teacher's board has this half hour open that week. */
  const boardOpen = (board, startIso) => {
    const { dateIso, dayKey, minutes } = manilaSlotOf(startIso);
    const hours = board.weekOverrides?.[weekStartIso(dateIso)] ?? board.weekPattern;
    const val = hours?.[`${dayKey}-${slotKeyFor(minutes)}`];
    return val === true || val === 'open' || val?.status === 'open';
  };

  /**
   * One half hour as a student's calendar sees it: 'open', 'booked' (within
   * the teacher's hours but taken, by a lesson or a sample booking) or
   * 'closed' (past, or outside the teacher's hours). For a teacher without a
   * board, `fallback` (the sample availability) decides open or closed.
   */
  const teacherSlotState = (teacherId, startIso, fallback = true, ignoreId = null) => {
    if (minutesUntil(startIso, now.value) < 0) return 'closed';
    const board = db.value.availability[teacherId];
    const working = board ? boardOpen(board, startIso) : fallback;
    if (!working) return 'closed';
    if (teacherBusy(teacherId, startIso, 30, ignoreId) || sampleTaken(teacherId, startIso)) return 'booked';
    return 'open';
  };

  /**
   * Whether a student can book this window with this teacher: every half
   * hour in it must be open. Past starts, clashes with another booking and
   * sample bookings are always refused; `ignoreId` lets a lesson being
   * rescheduled overlap its own current time.
   */
  const isTeacherSlotOpen = (teacherId, startIso, duration, fallback = true, ignoreId = null) => {
    for (let m = 0; m < duration; m += 30) {
      if (teacherSlotState(teacherId, addMinutes(startIso, m), fallback, ignoreId) !== 'open') return false;
    }
    return true;
  };

  /** Adds a ledger row and moves the balance. Returns false if it would go negative. */
  const adjustWallet = (studentId, delta, { reason, detail = '', type }) => {
    const w = db.value.wallets[studentId] ?? (db.value.wallets[studentId] = { balance: 0, entries: [] });
    if (w.balance + delta < 0) return false;
    w.balance += delta;
    w.entries.unshift({
      id: uid('pl'), at: new Date().toISOString(), points: delta, reason, detail,
      type: type ?? (delta < 0 ? 'debit' : 'credit'), balanceAfter: w.balance,
    });
    return true;
  };
  const walletFor = (studentId) => db.value.wallets[studentId] ?? { balance: 0, entries: [] };

  /** Books a lesson and takes the points. Returns the lesson, or null. */
  const bookLesson = ({ studentId, teacherId, start, duration = 30, points = 5, subject, topic = '', note = '', meetLink }) => {
    if (teacherBusy(teacherId, start, duration)) return null;
    // Level checks: TA is free and only for an eligible new student.
    const checkType = assessmentTypeOf(subject);
    if (checkType === 'TA') {
      if (!taEligible(studentId)) return null;
      points = 0;
    }
    if (points && !adjustWallet(studentId, -points, { reason: 'Lesson booked', detail: `${subject} with ${teacher(teacherId).name}`, type: 'debit' })) return null;
    const lesson = {
      id: uid('r'), studentId, teacherId, start, duration, points, subject, topic, note,
      status: 'booked', substitution: false,
      meetLink: meetLink ?? `https://meet.google.com/${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`,
      feedback: '', hiddenNote: '', feedbackSubmitted: false, teacherScore: null,
      studentRating: null, studentComment: '', cancelReason: '', refunded: false,
    };
    db.value.lessons.push(lesson);
    if (checkType) notifyLevelCheck('booked', lesson);
    return lesson;
  };

  /** Cancels; refunds in full when it is more than 3 hours away. */
  const cancelLesson = (id, { reason = '' } = {}) => {
    const l = findLesson(id);
    if (!l || l.status !== 'booked') return null;
    // CS / TA: cancellable until 50 minutes before; refunds whatever was paid.
    const checkType = assessmentTypeOf(l.subject);
    if (checkType) {
      if (minutesUntil(l.start, Date.now()) < LEVEL_CHECK_CANCEL_MINUTES) return null;
      l.status = 'cancelled';
      l.refunded = !!l.points;
      l.cancelReason = `${ASSESSMENT_TYPES[checkType].label} cancelled.${l.points ? ` ${l.points} points were refunded.` : ''}${reason ? ` Reason: ${reason}` : ''}`;
      if (l.points) adjustWallet(l.studentId, l.points, { reason: 'Refund', detail: `${l.subject} cancelled`, type: 'refund' });
      notifyLevelCheck('cancelled', l);
      return l;
    }
    const refund = minutesUntil(l.start, Date.now()) > FREE_CANCEL_MINUTES;
    l.status = 'cancelled';
    l.refunded = refund;
    l.cancelReason = refund
      ? `Cancelled more than 3 hours before the start time — ${l.points} points were refunded in full.${reason ? ` Reason: ${reason}` : ''}`
      : `Cancelled less than 3 hours before the start time — no refund.${reason ? ` Reason: ${reason}` : ''}`;
    if (refund && l.points) adjustWallet(l.studentId, l.points, { reason: 'Refund', detail: `${l.subject} cancelled`, type: 'refund' });
    return l;
  };

  /**
   * Takes back a booking made moments ago: the lesson is removed outright
   * (not cancelled — it never really happened) and the points come back in
   * full. Only for a lesson still booked.
   */
  const undoBooking = (id) => {
    const i = db.value.lessons.findIndex((l) => l.id === id && l.status === 'booked');
    if (i === -1) return false;
    const [l] = db.value.lessons.splice(i, 1);
    if (l.points) adjustWallet(l.studentId, l.points, { reason: 'Booking undone', detail: `${l.subject} with ${teacher(l.teacherId).name}`, type: 'refund' });
    return true;
  };

  const rescheduleLesson = (id, start) => {
    const l = findLesson(id);
    if (!l || l.status !== 'booked') return null;
    if (teacherBusy(l.teacherId, start, l.duration, id)) return null;
    l.start = start;
    return l;
  };

  /** Student edits: subject, topic, message to the teacher. */
  const updateLesson = (id, patch) => {
    const l = findLesson(id);
    if (!l) return null;
    ['subject', 'topic', 'note'].forEach((k) => { if (patch[k] !== undefined) l[k] = patch[k]; });
    return l;
  };

  const submitFeedback = (id, { feedback, hiddenNote = '', score = null }) => {
    const l = findLesson(id);
    if (!l) return;
    l.feedback = feedback;
    l.hiddenNote = hiddenNote;
    l.feedbackSubmitted = true;
    if (score !== null) l.teacherScore = score;
  };

  const rateLesson = (id, rating, comment = '') => {
    const l = findLesson(id);
    if (!l || l.status !== 'completed') return;
    l.studentRating = rating;
    l.studentComment = comment;
  };

  // ── Writing ───────────────────────────────────────────────────────────
  const writing = computed(() => db.value.writing);
  const writingForStudent = (studentId) => db.value.writing.filter((w) => w.studentId === studentId);
  /** A teacher's own tickets plus any still waiting for an assessor. */
  const writingForTeacher = (teacherId) => db.value.writing.filter((w) => w.teacherId === teacherId || w.teacherId === null);
  const findTicket = (id) => db.value.writing.find((w) => w.id === id);

  const submitWriting = ({ studentId, title, body }) => {
    const text = (body ?? '').trim();
    if (!text) return null;
    if (!adjustWallet(studentId, -WRITING_COST, { reason: 'Writing correction', detail: title || 'Untitled', type: 'debit' })) return null;
    const at = new Date().toISOString();
    const ticket = {
      id: uid('w'), studentId, teacherId: null, title: (title ?? '').trim() || 'Untitled', status: 'In Progress',
      submittedAt: at, dueAt: addMinutes(at, 48 * 60), remainingSends: 3,
      messages: [{ id: 'm-1', from: 'student', at, body: text }],
    };
    db.value.writing.unshift(ticket);
    return ticket;
  };

  /** A reply on a ticket. A teacher reply claims an unassigned ticket. */
  const replyWriting = (id, { from, body = '', correction = '', teacherId = null }) => {
    const t = findTicket(id);
    if (!t || t.status === 'Complete') return null;
    const text = body.trim();
    const fixed = (correction ?? '').trim();
    if (!text && !fixed) return null;
    if (from === 'student') {
      if (t.remainingSends <= 0) return null;
      t.remainingSends -= 1;
    } else if (t.teacherId === null && teacherId) {
      t.teacherId = teacherId;
    }
    const msg = { id: `m-${t.messages.length + 1}`, from, at: new Date().toISOString(), body: text };
    if (fixed) msg.correction = fixed;
    t.messages.push(msg);
    return msg;
  };

  const completeWriting = (id) => {
    const t = findTicket(id);
    if (t) t.status = 'Complete';
  };

  // ── Materials ─────────────────────────────────────────────────────────
  const materialsFor = (studentId) => db.value.materials[studentId] ?? [];
  const addMaterial = (studentId, entry) => {
    if (!db.value.materials[studentId]) db.value.materials[studentId] = [];
    db.value.materials[studentId].unshift(entry);
    return entry;
  };
  const removeMaterial = (studentId, id) => {
    const list = db.value.materials[studentId];
    if (!list) return;
    const i = list.findIndex((m) => m.id === id);
    if (i !== -1) list.splice(i, 1);
  };

  // ── Class copies ──────────────────────────────────────────────────────
  // A student's own copy of a library document. In production the backend
  // copies the original into the shared drive and shares it; here the copy is
  // only a record, so the presentation shows the flow without Google.
  const classCopiesFor = (studentId) => (db.value.classCopies ?? [])
    .filter((c) => c.studentId === studentId);
  const classCopyOf = (studentId, itemId) => (db.value.classCopies ?? [])
    .find((c) => c.studentId === studentId && c.itemId === itemId) ?? null;
  /** One copy per student per document: sending again returns the existing one. */
  const sendClassCopy = (studentId, itemId, teacherId) => {
    const existing = classCopyOf(studentId, itemId);
    if (existing) return existing;
    if (!db.value.classCopies) db.value.classCopies = [];
    const id = uid('cc');
    const entry = {
      id,
      studentId,
      itemId,
      url: `https://docs.google.com/document/d/sample-copy-${id}/edit`,
      sentBy: { id: teacherId, name: teacher(teacherId).name },
      sentAt: new Date().toISOString(),
    };
    db.value.classCopies.push(entry);
    return entry;
  };

  // ── Level check ───────────────────────────────────────────────────────
  // BRELAS levels, assessments and their templates. The level is only ever
  // read by admin and teacher screens; the student portal reads feedback.

  /** True while a student can still take their one free trial (TA). */
  const taEligible = (studentId) => !!db.value.students[studentId]?.isNew
    && !db.value.lessons.some((l) => l.studentId === studentId && assessmentTypeOf(l.subject) === 'TA' && l.status !== 'cancelled');

  /** Whether a booked lesson can still be cancelled by the student now. */
  const canCancel = (lessonId) => {
    const l = findLesson(lessonId);
    if (!l || l.status !== 'booked') return false;
    // Same clock as cancelLesson, so the button and the store never disagree.
    const left = minutesUntil(l.start, Date.now());
    return assessmentTypeOf(l.subject) ? left >= LEVEL_CHECK_CANCEL_MINUTES : left > 0;
  };

  /**
   * Emails for CS / TA booking and cancellation, to the student, the teacher
   * and admin. There is no mail server in the prototype, so they are logged
   * to an outbox an admin can read. They never mention the level.
   */
  const notifyLevelCheck = (event, l) => {
    const type = ASSESSMENT_TYPES[assessmentTypeOf(l.subject)];
    const who = student(l.studentId).name;
    const t = teacher(l.teacherId).name;
    const verb = event === 'booked' ? 'booked' : 'cancelled';
    const at = new Date().toISOString();
    if (!db.value.outbox) db.value.outbox = [];
    [
      { to: 'student', name: who, subject: `Your ${type.label} is ${verb}` },
      { to: 'teacher', name: t, subject: `${type.label} ${verb}: ${who}` },
      { to: 'admin', name: 'Brighture admin', subject: `[${type.code}] ${verb} — ${who} with ${t}` },
    ].forEach((m) => db.value.outbox.unshift({ id: uid('mail'), at, event, lessonId: l.id, type: type.code, start: l.start, ...m }));
  };

  // Templates — one active template per type; each save makes a new version.
  const templates = computed(() => db.value.templates ?? []);
  const findTemplate = (id) => templates.value.find((t) => t.id === id) ?? null;
  const activeTemplate = (type) => templates.value.find((t) => t.type === type && t.active) ?? null;
  /** Saves a template. Editing bumps the version; past assessments keep a snapshot. */
  const saveTemplate = (template) => {
    const copy = JSON.parse(JSON.stringify(template));
    const list = db.value.templates;
    const i = list.findIndex((t) => t.id === copy.id);
    copy.updatedAt = new Date().toISOString();
    if (i === -1) {
      copy.id = copy.id || uid('tpl');
      copy.version = 1;
      if (copy.active) list.forEach((t) => { if (t.type === copy.type) t.active = false; });
      list.unshift(copy);
    } else {
      copy.version = (list[i].version ?? 1) + 1;
      if (copy.active) list.forEach((t) => { if (t.type === copy.type && t.id !== copy.id) t.active = false; });
      list.splice(i, 1, copy);
    }
    return copy;
  };
  const setTemplateActive = (id) => {
    const t = findTemplate(id);
    if (!t) return;
    db.value.templates.forEach((x) => { if (x.type === t.type) x.active = x.id === id; });
  };
  const deleteTemplate = (id) => {
    if ((db.value.assessments ?? []).some((a) => a.templateId === id)) return false; // in use: archive instead
    db.value.templates = db.value.templates.filter((t) => t.id !== id);
    return true;
  };

  // Assessments
  const assessments = computed(() => db.value.assessments ?? []);
  const findAssessment = (id) => assessments.value.find((a) => a.id === id) ?? null;
  const assessmentsForTeacher = (teacherId) => assessments.value.filter((a) => a.teacherId === teacherId);
  const assessmentsForStudent = (studentId) => assessments.value.filter((a) => a.studentId === studentId);

  /**
   * The only assessment data the student portal may read: submitted feedback.
   * Picks fields explicitly so the level, rating and NFA never leave the store.
   */
  const feedbackForStudent = (studentId) => assessments.value
    .filter((a) => a.studentId === studentId && a.status === 'submitted')
    .map((a) => ({
      id: a.id, type: a.type, teacherId: a.teacherId, lessonId: a.lessonId,
      scheduledAt: a.scheduledAt, submittedAt: a.submittedAt,
      performance: a.performance, workOn: a.workOn, nextCs: a.nextCs,
    }));

  /**
   * The assessment for a TA / CS lesson, created as a draft from the type's
   * active template the first time anyone asks for it (once the lesson has
   * started). The template is snapshotted so later edits do not change it.
   */
  const assessmentForLesson = (lessonId) => {
    const existing = assessments.value.find((a) => a.lessonId === lessonId);
    if (existing) return existing;
    const l = findLesson(lessonId);
    const type = l && assessmentTypeOf(l.subject);
    if (!type || l.status === 'cancelled' || minutesUntil(l.start, now.value) > 0) return null;
    const tpl = activeTemplate(type);
    const record = {
      id: uid('as'), type, studentId: l.studentId, teacherId: l.teacherId, lessonId: l.id,
      templateId: tpl?.id ?? null, templateVersion: tpl?.version ?? null, templateSnapshot: tpl ? JSON.parse(JSON.stringify(tpl)) : null,
      status: 'draft', scheduledAt: l.start, submittedAt: null,
      level: null, nfa: '', performance: '', workOn: '', nextCs: '', answers: {},
    };
    db.value.assessments.push(record);
    return db.value.assessments[db.value.assessments.length - 1];
  };

  /** Makes sure every started TA / CS lesson has its assessment record. */
  const syncLessonAssessments = () => {
    db.value.lessons
      .filter((l) => assessmentTypeOf(l.subject) && l.status !== 'cancelled' && minutesUntil(l.start, now.value) <= 0)
      .forEach((l) => assessmentForLesson(l.id));
  };

  /** The template an assessment was written against (its snapshot, else the current one). */
  const templateFor = (assessment) => assessment?.templateSnapshot ?? findTemplate(assessment?.templateId) ?? activeTemplate(assessment?.type);

  /** Admin: schedule a fixed-class assessment. No booking, no points. */
  const scheduleFixedAssessment = ({ studentId, teacherId, start, by = 'Admin' }) => {
    const tpl = activeTemplate('FA');
    const record = {
      id: uid('as'), type: 'FA', studentId, teacherId, lessonId: null,
      templateId: tpl?.id ?? null, templateVersion: tpl?.version ?? null, templateSnapshot: tpl ? JSON.parse(JSON.stringify(tpl)) : null,
      status: 'scheduled', scheduledAt: start, submittedAt: null, scheduledBy: by,
      meetLink: `https://meet.google.com/fa-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`,
      level: null, nfa: '', performance: '', workOn: '', nextCs: '', answers: {},
    };
    db.value.assessments.push(record);
    return record;
  };
  const cancelFixedAssessment = (id) => {
    const a = findAssessment(id);
    if (a && a.type === 'FA' && a.status !== 'submitted') db.value.assessments = db.value.assessments.filter((x) => x.id !== id);
  };

  /** Saves work in progress without submitting. */
  const saveAssessmentDraft = (id, patch) => {
    const a = findAssessment(id);
    if (!a || a.status === 'submitted') return null;
    ['answers', 'level', 'nfa', 'performance', 'workOn', 'nextCs'].forEach((k) => { if (patch[k] !== undefined) a[k] = patch[k]; });
    if (a.status === 'scheduled') a.status = 'draft';
    return a;
  };

  /**
   * Submits an assessment. If its level differs from the student's current
   * one, the change is recorded in the history with the assessment as reason.
   */
  const submitAssessment = (id, patch, by) => {
    const a = saveAssessmentDraft(id, patch);
    if (!a || !isValidRating(a.level)) return null;
    a.status = 'submitted';
    a.submittedAt = new Date().toISOString();
    const current = currentLevel(a.studentId);
    if (current !== a.level) {
      recordLevel(a.studentId, a.level, { by, reason: `Assessment: ${ASSESSMENT_TYPES[a.type].label}`, assessmentId: a.id, nfa: a.nfa });
    }
    return a;
  };

  // Levels
  const levelHistoryFor = (studentId) => (db.value.levelHistory ?? []).filter((h) => h.studentId === studentId).sort((x, y) => x.at.localeCompare(y.at));
  /** Current BRELAS rating (1–15 or 'B0'), or null for Unassessed. */
  const currentLevel = (studentId) => levelHistoryFor(studentId).at(-1)?.to ?? null;
  /** The latest NFA note: from the newest submitted assessment, else migration. */
  const currentNfa = (studentId) => {
    const latest = assessments.value
      .filter((a) => a.studentId === studentId && a.status === 'submitted' && a.nfa)
      .sort((x, y) => (y.submittedAt ?? '').localeCompare(x.submittedAt ?? ''))[0];
    return latest?.nfa ?? [...levelHistoryFor(studentId)].reverse().find((h) => h.nfa)?.nfa ?? '';
  };
  /** Everything admin and teacher screens show about a student's level. */
  const levelSummary = (studentId) => {
    const code = currentLevel(studentId);
    const info = levelInfo(code);
    const history = levelHistoryFor(studentId);
    return { code, ...info, nfa: currentNfa(studentId), history, lastChanged: history.at(-1)?.at ?? null };
  };

  const recordLevel = (studentId, to, { by, reason, assessmentId = null, nfa = '' }) => {
    if (!db.value.levelHistory) db.value.levelHistory = [];
    const entry = { id: uid('lh'), studentId, from: currentLevel(studentId), to, by, reason, assessmentId, nfa, at: new Date().toISOString() };
    db.value.levelHistory.push(entry);
    return entry;
  };

  /** Admin / teacher: set or change the rating any time. A reason is required. */
  const setLevel = (studentId, to, { by, reason }) => {
    if (!isValidRating(to) || !(reason ?? '').trim()) return null;
    if (currentLevel(studentId) === to) return null;
    return recordLevel(studentId, to, { by, reason: reason.trim() });
  };

  /** Shared library items tagged with a BRELAS level code (B0, B1 … A). */
  const library = computed(() => db.value.library ?? []);
  /** Items for a student's level; accepts a rating or a level code. */
  const libraryForLevel = (value) => {
    const code = typeof value === 'string' && !isValidRating(value) ? value : levelInfo(value).code;
    return code ? library.value.filter((m) => m.level === code) : [];
  };

  /** Admin's standing reminder to teachers: never mention the level in feedback. */
  const sendLevelReminder = (by = 'Admin') => {
    db.value.levelReminder = { at: new Date().toISOString(), by };
  };

  // ── Pre-class preparation ─────────────────────────────────────────────
  /** '[SF] Speech Fluency' -> 'SF', so a material and a lesson can be matched by subject. */
  const subjectCode = (label) => /\[([^\]]+)\]/.exec(label ?? '')?.[1] ?? '';

  /**
   * What to look at before a lesson. The teacher can pick materials for the
   * lesson; until they do, it is the student's materials in the lesson's
   * subject. Each item carries when the student reviewed it for this lesson.
   */
  const prepFor = (lessonId) => {
    const l = findLesson(lessonId);
    if (!l) return { items: [], total: 0, reviewed: 0, chosen: false };
    const mats = materialsFor(l.studentId);
    // Once the teacher has chosen — even "none" — their choice stands.
    const chosen = Array.isArray(l.prepMaterialIds);
    const code = subjectCode(l.subject);
    // One material per class: the teacher's pick, or else the newest in the
    // lesson's subject (the shelf is newest first).
    const picked = chosen
      ? l.prepMaterialIds.map((id) => mats.find((m) => m.id === id)).filter(Boolean).slice(0, 1)
      : mats.filter((m) => code && subjectCode(m.subject) === code).slice(0, 1);
    const items = picked.map((m) => ({ ...m, reviewedAt: l.reviewed?.[m.id] ?? null }));
    return { items, total: items.length, reviewed: items.filter((i) => i.reviewedAt).length, chosen };
  };

  /**
   * What the teacher provided for a lesson, for looking back at it: their own
   * pick if they made one, otherwise their materials in the lesson's subject.
   * Unlike prepFor, it never borrows another teacher's files.
   */
  const materialsForLesson = (lessonId) => {
    const l = findLesson(lessonId);
    if (!l) return [];
    const mats = materialsFor(l.studentId);
    if (Array.isArray(l.prepMaterialIds)) {
      return l.prepMaterialIds.map((id) => mats.find((m) => m.id === id)).filter(Boolean).slice(0, 1);
    }
    const code = subjectCode(l.subject);
    const name = teacher(l.teacherId).name;
    return mats.filter((m) => code && subjectCode(m.subject) === code && m.addedBy === name).slice(0, 1);
  };

  /** The teacher's pick for one lesson: one material, or none. */
  const setLessonPrep = (lessonId, ids) => {
    const l = findLesson(lessonId);
    if (l) l.prepMaterialIds = [...new Set(ids)].slice(0, 1);
  };

  /** The student marks a material reviewed (or un-reviewed) for a lesson. */
  const markMaterialReviewed = (lessonId, materialId, reviewed = true) => {
    const l = findLesson(lessonId);
    if (!l) return;
    if (!l.reviewed) l.reviewed = {};
    if (reviewed) l.reviewed[materialId] = l.reviewed[materialId] ?? new Date().toISOString();
    else delete l.reviewed[materialId];
  };

  // ── Messages ──────────────────────────────────────────────────────────
  const threadsForTeacher = (teacherId) => db.value.threads.filter((t) => t.teacherId === teacherId);
  const threadsForStudent = (studentId) => db.value.threads.filter((t) => t.studentId === studentId);
  /** The thread between a student and a teacher, created on first use. */
  const threadBetween = (studentId, teacherId) => {
    let t = db.value.threads.find((x) => x.studentId === studentId && x.teacherId === teacherId);
    if (!t) {
      t = { id: `t-${studentId}-${teacherId}`, studentId, teacherId, messages: [], teacherReadAt: null, studentReadAt: null };
      db.value.threads.push(t);
      t = db.value.threads[db.value.threads.length - 1];
    }
    return t;
  };
  /** Messages from the other side newer than this side's read mark. */
  const unreadIn = (thread, side) => {
    const other = side === 'teacher' ? 'student' : 'teacher';
    const mark = side === 'teacher' ? thread.teacherReadAt : thread.studentReadAt;
    return thread.messages.filter((m) => m.from === other && (!mark || m.at > mark)).length;
  };
  const sendMessage = (studentId, teacherId, { from, text = '', attachment = null }) => {
    const body = text.trim();
    if (!body && !attachment) return null;
    const t = threadBetween(studentId, teacherId);
    const msg = { id: uid('msg'), from, at: new Date().toISOString(), text: body, reactions: [] };
    if (attachment) msg.attachment = attachment;
    t.messages.push(msg);
    if (from === 'teacher') t.teacherReadAt = msg.at; else t.studentReadAt = msg.at;
    return msg;
  };
  const markThreadRead = (studentId, teacherId, side) => {
    const t = db.value.threads.find((x) => x.studentId === studentId && x.teacherId === teacherId);
    if (!t) return;
    const at = new Date().toISOString();
    if (side === 'teacher') t.teacherReadAt = at; else t.studentReadAt = at;
  };
  const toggleReaction = (studentId, teacherId, messageId, emoji) => {
    const t = db.value.threads.find((x) => x.studentId === studentId && x.teacherId === teacherId);
    const m = t?.messages.find((x) => x.id === messageId);
    if (!m) return;
    const i = m.reactions.indexOf(emoji);
    if (i === -1) m.reactions.push(emoji); else m.reactions.splice(i, 1);
  };

  // ── Exams ─────────────────────────────────────────────────────────────
  const exams = computed(() => db.value.exams);
  const examsForTeacher = (teacherId) => db.value.exams.filter((e) => e.teacherId === teacherId);
  /** Published exams assigned to a student. */
  const examsForStudent = (studentId) => db.value.exams.filter((e) => e.status === 'Published' && e.assignedTo.includes(studentId));
  const findExam = (id) => db.value.exams.find((e) => e.id === id);
  /** Inserts or replaces an exam by id. */
  const saveExam = (exam) => {
    const copy = JSON.parse(JSON.stringify({ ...exam, updatedAt: new Date().toISOString() }));
    if (!copy.id) copy.id = uid('exam');
    if (!Array.isArray(copy.assignedTo)) copy.assignedTo = [];
    const i = db.value.exams.findIndex((e) => e.id === copy.id);
    if (i === -1) db.value.exams.unshift(copy); else db.value.exams.splice(i, 1, copy);
    return copy;
  };
  const deleteExam = (id) => {
    db.value.exams = db.value.exams.filter((e) => e.id !== id);
    db.value.submissions = db.value.submissions.filter((s) => s.examId !== id);
  };
  const submissionsForExam = (examId) => db.value.submissions.filter((s) => s.examId === examId);
  const submissionFor = (examId, studentId) => db.value.submissions.find((s) => s.examId === examId && s.studentId === studentId) ?? null;
  const examMaxScore = (exam) => exam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  /** Total so far: MCQ marks plus any essay marks given. */
  const submissionScore = (sub) => sub.mcqScore + Object.values(sub.essayScores ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);

  /** Marks multiple choice automatically; essays wait for the teacher. */
  const submitExam = ({ examId, studentId, answers }) => {
    const exam = findExam(examId);
    if (!exam || submissionFor(examId, studentId)) return null;
    const mcqScore = exam.questions
      .filter((q) => q.type === 'mcq' && answers[q.id] === q.correctIndex)
      .reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const hasEssay = exam.questions.some((q) => q.type === 'essay');
    const sub = {
      id: uid('sub'), examId, studentId, submittedAt: new Date().toISOString(), answers: { ...answers },
      mcqScore, essayScores: {}, graded: !hasEssay, gradedAt: hasEssay ? null : new Date().toISOString(), teacherComment: '',
    };
    db.value.submissions.push(sub);
    return sub;
  };

  const gradeSubmission = (id, { essayScores = {}, comment = '' }) => {
    const sub = db.value.submissions.find((s) => s.id === id);
    if (!sub) return;
    sub.essayScores = { ...essayScores };
    sub.teacherComment = comment;
    sub.graded = true;
    sub.gradedAt = new Date().toISOString();
  };

  // ── Availability ──────────────────────────────────────────────────────
  const availabilityFor = (teacherId) => db.value.availability[teacherId] ?? null;
  /** Replaces a teacher's board (pattern, per-week exceptions, repeat marks). */
  const setAvailability = (teacherId, { weekPattern, weekOverrides, recurringSlots }) => {
    db.value.availability[teacherId] = JSON.parse(JSON.stringify({ weekPattern, weekOverrides, recurringSlots }));
  };

  return {
    db, now, resetDemo,
    student, teacher,
    lessons, lessonsForTeacher, lessonsForStudent, findLesson, teacherBusy, isTeacherSlotOpen, teacherSlotState,
    bookLesson, cancelLesson, undoBooking, rescheduleLesson, updateLesson, submitFeedback, rateLesson,
    walletFor, adjustWallet,
    writing, writingForStudent, writingForTeacher, findTicket, submitWriting, replyWriting, completeWriting, WRITING_COST,
    materialsFor, addMaterial, removeMaterial,
    classCopiesFor, classCopyOf, sendClassCopy,
    setRecordingConsent,
    subjectCode, prepFor, materialsForLesson, setLessonPrep, markMaterialReviewed,
    threadsForTeacher, threadsForStudent, threadBetween, unreadIn, sendMessage, markThreadRead, toggleReaction,
    exams, examsForTeacher, examsForStudent, findExam, saveExam, deleteExam,
    submissionsForExam, submissionFor, examMaxScore, submissionScore, submitExam, gradeSubmission,
    availabilityFor, setAvailability,
    // Level check
    taEligible, canCancel,
    templates, findTemplate, activeTemplate, saveTemplate, setTemplateActive, deleteTemplate,
    assessments, findAssessment, assessmentsForTeacher, assessmentsForStudent, feedbackForStudent, assessmentForLesson, syncLessonAssessments,
    templateFor, scheduleFixedAssessment, cancelFixedAssessment, saveAssessmentDraft, submitAssessment,
    levelHistoryFor, currentLevel, currentNfa, levelSummary, setLevel,
    library, libraryForLevel, sendLevelReminder,
  };
});
