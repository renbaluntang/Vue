import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { imageForKey } from '@/lib/teacherImages';
import { buildSeed, SEED_VERSION } from '@/lib/schoolSeed';
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

  /** Throws away every change and starts again from the sample data. */
  const resetDemo = () => {
    db.value = buildSeed(manilaToday());
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

  /** Whether the teacher already has a booked lesson overlapping this window. */
  const teacherBusy = (teacherId, startIso, duration, ignoreId = null) => {
    const s = new Date(startIso).getTime();
    const e = s + duration * 60_000;
    return db.value.lessons.some((l) => l.teacherId === teacherId && l.status === 'booked' && l.id !== ignoreId
      && new Date(l.start).getTime() < e && new Date(l.start).getTime() + l.duration * 60_000 > s);
  };

  /**
   * Whether a student can book this window with this teacher. For a teacher
   * who publishes hours (Jirvy), every half hour must be open on their board
   * that week; for the rest, `fallback` (the sample availability) decides.
   * Past starts and clashes with another booking are always refused;
   * `ignoreId` lets a lesson being rescheduled overlap its own current time.
   */
  const isTeacherSlotOpen = (teacherId, startIso, duration, fallback = true, ignoreId = null) => {
    if (minutesUntil(startIso, now.value) < 0) return false;
    if (teacherBusy(teacherId, startIso, duration, ignoreId)) return false;
    const board = db.value.availability[teacherId];
    if (!board) return fallback;
    for (let m = 0; m < duration; m += 30) {
      const { dateIso, dayKey, minutes } = manilaSlotOf(addMinutes(startIso, m));
      const hours = board.weekOverrides?.[weekStartIso(dateIso)] ?? board.weekPattern;
      const val = hours?.[`${dayKey}-${slotKeyFor(minutes)}`];
      const open = val === true || val === 'open' || val?.status === 'open';
      if (!open) return false;
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
    if (points && !adjustWallet(studentId, -points, { reason: 'Lesson booked', detail: `${subject} with ${teacher(teacherId).name}`, type: 'debit' })) return null;
    const lesson = {
      id: uid('r'), studentId, teacherId, start, duration, points, subject, topic, note,
      status: 'booked', substitution: false,
      meetLink: meetLink ?? `https://meet.google.com/${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`,
      feedback: '', hiddenNote: '', feedbackSubmitted: false, teacherScore: null,
      studentRating: null, studentComment: '', cancelReason: '', refunded: false,
    };
    db.value.lessons.push(lesson);
    return lesson;
  };

  /** Cancels; refunds in full when it is more than 3 hours away. */
  const cancelLesson = (id, { reason = '' } = {}) => {
    const l = findLesson(id);
    if (!l || l.status !== 'booked') return null;
    const refund = minutesUntil(l.start, Date.now()) > FREE_CANCEL_MINUTES;
    l.status = 'cancelled';
    l.refunded = refund;
    l.cancelReason = refund
      ? `Cancelled more than 3 hours before the start time — ${l.points} points were refunded in full.${reason ? ` Reason: ${reason}` : ''}`
      : `Cancelled less than 3 hours before the start time — no refund.${reason ? ` Reason: ${reason}` : ''}`;
    if (refund && l.points) adjustWallet(l.studentId, l.points, { reason: 'Refund', detail: `${l.subject} cancelled`, type: 'refund' });
    return l;
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
    const picked = chosen
      ? l.prepMaterialIds.map((id) => mats.find((m) => m.id === id)).filter(Boolean)
      : mats.filter((m) => code && subjectCode(m.subject) === code);
    const items = picked.map((m) => ({ ...m, reviewedAt: l.reviewed?.[m.id] ?? null }));
    return { items, total: items.length, reviewed: items.filter((i) => i.reviewedAt).length, chosen };
  };

  /** The teacher's pick of materials for one lesson. */
  const setLessonPrep = (lessonId, ids) => {
    const l = findLesson(lessonId);
    if (l) l.prepMaterialIds = [...new Set(ids)];
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
    lessons, lessonsForTeacher, lessonsForStudent, findLesson, teacherBusy, isTeacherSlotOpen,
    bookLesson, cancelLesson, rescheduleLesson, updateLesson, submitFeedback, rateLesson,
    walletFor, adjustWallet,
    writing, writingForStudent, writingForTeacher, findTicket, submitWriting, replyWriting, completeWriting, WRITING_COST,
    materialsFor, addMaterial, removeMaterial,
    subjectCode, prepFor, setLessonPrep, markMaterialReviewed,
    threadsForTeacher, threadsForStudent, threadBetween, unreadIn, sendMessage, markThreadRead, toggleReaction,
    exams, examsForTeacher, examsForStudent, findExam, saveExam, deleteExam,
    submissionsForExam, submissionFor, examMaxScore, submissionScore, submitExam, gradeSubmission,
    availabilityFor, setAvailability,
  };
});
