import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { findPlan, isSubscription } from '@/lib/plans';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { CURRENT_STUDENT_ID } from '@/lib/schoolSeed';
import { TOKYO, partsIn, dateIn, clockIn, rangeIn, minutesUntil } from '@/lib/schoolTime';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');

/** Calendar-day number of an instant in Tokyo, for "today / tomorrow" sums. */
const tokyoDayNumber = (iso) => {
  const p = partsIn(iso, TOKYO);
  return Math.round(Date.UTC(p.year, p.month, p.day) / 86_400_000);
};

/** 'Today, Oct 14' / 'Tomorrow, Oct 15' / 'Fri, Oct 17' — in Tokyo time. */
const relativeDayLabel = (iso, now) => {
  const p = partsIn(iso, TOKYO);
  const short = `${MONTHS[p.month]} ${p.day}`;
  const diff = tokyoDayNumber(iso) - tokyoDayNumber(new Date(now).toISOString());
  if (diff === 0) return `Today, ${short}`;
  if (diff === 1) return `Tomorrow, ${short}`;
  return `${WEEKDAYS[new Date(Date.UTC(p.year, p.month, p.day)).getUTCDay()]}, ${short}`;
};

/** 'Oct 14, 09:00' — the stamp on a writing message, in Tokyo time. */
const messageStamp = (iso) => {
  if (!iso) return '';
  const p = partsIn(iso, TOKYO);
  return `${MONTHS[p.month]} ${p.day}, ${pad(p.hour)}:${pad(p.minute)}`;
};

/** Wallet reasons as the shared store writes them, in the ledger's own words. */
const LEDGER_REASONS = {
  'Lesson booked': 'Online Lesson Booking',
  Refund: 'Class Cancellation Refund',
  'Writing correction': 'Writing Correction Submitted',
};

export const useUserStore = defineStore('user', () => {
  // Lessons, writing, materials and points live in the shared school store, so
  // the instructor portal sees the same records. This store projects student
  // 21's side of them into the shapes the student pages already use.
  const school = useSchoolStore();
  const STUDENT_ID = CURRENT_STUDENT_ID;

  const profile = ref({
    firstName: 'Taro',
    lastName: 'Yamada',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    gender: 'male',
    birthYear: 1994,
    birthMonth: 7,
    email: 'taro.yamada@example.com',
    googleAccount: 'taro.yamada@gmail.com',
    learningObjective: 'business',
    timezone: 'Asia/Tokyo (JST)',
    locale: 'en',
    level: 'B2 Upper-Intermediate',
    targetGoal: 'Business Negotiations & IELTS 7.5',
    memberSince: 'March 2025',
    // Mirrors the shared wallet; kept on the profile for the layouts that read it.
    pointsBalance: 120,
    pointsExpiry: '2026-09-30',
    planId: 'sub-40',
    // Last day the current subscription period covers.
    planEndsOn: '2026-10-17',
  });

  const stats = ref({
    totalLessons: 48,
    completedHours: '24.5',
    attendanceRate: 98,
    currentStreak: 12, // days
    weeklyGoalMet: 4, // out of 5 classes
    weeklyGoalTotal: 5,
    rank: 'Gold Scholar',
  });

  // Payment receipts, newest first. Mirrors the legacy mypage purchase table:
  // amounts are stored as minor-unit-free numbers plus their currency so a JPY
  // subscription and a USD top-up can live in the same list.
  const purchaseHistory = ref([
    {
      id: 'p-0',
      date: 'Sep 2, 2026',
      time: '10:15',
      planId: 'sub-40',
      planName: 'Subscription 40',
      amount: 154,
      currency: 'USD',
      points: 40,
      type: 'subscription',
      method: 'PayPal',
      status: 'paid',
      receiptId: 'BR-20260902-1015',
    },
    {
      id: 'p-1',
      date: 'Aug 26, 2026',
      time: '08:23',
      planId: 'one-5',
      planName: 'Starter 5',
      amount: 25,
      currency: 'USD',
      points: 5,
      type: 'one-time',
      method: 'Stripe',
      status: 'paid',
      receiptId: 'BR-20260826-0823',
    },
    {
      id: 'p-2',
      date: 'Jul 1, 2026',
      time: '09:30',
      planId: 'one-5',
      planName: 'Starter 5',
      amount: 25,
      currency: 'USD',
      points: 5,
      type: 'one-time',
      method: 'Stripe',
      status: 'paid',
      receiptId: 'BR-20260701-0930',
    },
    {
      id: 'p-3',
      date: 'Jul 1, 2026',
      time: '09:11',
      planId: 'one-5',
      planName: 'Starter 5',
      amount: 25,
      currency: 'USD',
      points: 5,
      type: 'one-time',
      method: 'Stripe',
      status: 'refunded',
      receiptId: 'BR-20260701-0911',
    },
    {
      id: 'p-4',
      date: 'Jun 18, 2026',
      time: '14:57',
      planId: 'one-20',
      planName: 'Standard 20',
      amount: 85,
      currency: 'USD',
      points: 20,
      type: 'one-time',
      method: 'PayPal',
      status: 'paid',
      receiptId: 'BR-20260618-1457',
    },
    {
      id: 'p-5',
      date: 'May 10, 2026',
      time: '18:20',
      planId: 'sub-40',
      planName: 'Subscription 40',
      amount: 154,
      currency: 'USD',
      points: 40,
      type: 'subscription',
      method: 'PayPal',
      status: 'paid',
      receiptId: 'BR-20260510-1820',
    },
    {
      id: 'p-6',
      date: 'Apr 10, 2026',
      time: '16:26',
      planId: 'sub-40',
      planName: 'Subscription 40',
      amount: 154,
      currency: 'USD',
      points: 40,
      type: 'subscription',
      method: 'PayPal',
      status: 'paid',
      receiptId: 'BR-20260410-1626',
    },
  ]);

  // History from before the shared wallet existed. Its last balance (120) is
  // where the wallet starts, so live rows continue it without a jump.
  const seedLedger = [
    {
      id: 1,
      date: 'Aug 20, 2026',
      time: '6:30 PM JST',
      points: -5,
      reason: 'Online Lesson Booking',
      detail: 'Business English w/ Jirvy Dela Torre',
      type: 'debit',
      balanceAfter: 120,
    },
    {
      id: 2,
      date: 'Aug 18, 2026',
      time: '2:15 PM JST',
      points: -5,
      reason: 'Writing Correction Submitted',
      detail: 'Self Introduction Draft for Marketing',
      type: 'debit',
      balanceAfter: 125,
    },
    {
      id: 3,
      date: 'Aug 15, 2026',
      time: '11:00 AM JST',
      points: +5,
      reason: 'Class Cancellation Refund',
      detail: 'Full refund (cancelled ≥3h before start)',
      type: 'refund',
      balanceAfter: 130,
    },
    {
      id: 4,
      date: 'Aug 01, 2026',
      time: '12:00 AM JST',
      points: +40,
      reason: 'Subscription renewal',
      detail: 'Subscription 40 (40 points added)',
      type: 'credit',
      balanceAfter: 125,
    },
    {
      id: 5,
      date: 'Jul 24, 2026',
      time: '4:45 PM JST',
      points: +10,
      reason: 'Friend Referral Bonus',
      detail: 'Invited Kenji S. who registered',
      type: 'credit',
      balanceAfter: 75,
    },
    {
      id: 6,
      date: 'Jul 01, 2026',
      time: '12:00 AM JST',
      points: +40,
      reason: 'Subscription renewal',
      detail: 'Subscription 40 (40 points added)',
      type: 'credit',
      balanceAfter: 65,
    },
    {
      id: 7,
      date: 'Jun 15, 2026',
      time: '9:00 AM JST',
      points: +15,
      reason: 'Welcome Onboarding Bonus',
      detail: 'Level-Check & Questionnaire Reward',
      type: 'credit',
      balanceAfter: 15,
    },
  ];

  const wallet = computed(() => school.walletFor(STUDENT_ID));

  // The wallet is the source of truth; the profile copy follows it.
  watch(
    () => wallet.value.balance,
    (balance) => { profile.value.pointsBalance = balance; },
    // sync: a page that books and then reads the balance sees the new one.
    { immediate: true, flush: 'sync' }
  );

  // The photo lives on the shared student record (instructors see it too);
  // the profile copy follows it, so a new photo survives a reload.
  watch(
    () => school.db.students[STUDENT_ID]?.photo,
    (photo) => { if (photo) profile.value.photo = photo; },
    { immediate: true }
  );

  /** Live wallet rows (newest first), then the static history behind them. */
  const pointLedger = computed(() => [
    ...wallet.value.entries.map((entry) => ({
      id: entry.id,
      date: dateIn(entry.at, TOKYO),
      time: `${clockIn(entry.at, TOKYO)} JST`,
      points: entry.points,
      reason: LEDGER_REASONS[entry.reason] ?? entry.reason,
      detail: entry.detail,
      type: entry.type,
      balanceAfter: entry.balanceAfter,
    })),
    ...seedLedger,
  ]);

  const skills = ref([
    { name: 'Speaking & Fluency', level: 82, color: 'bg-blue-500' },
    { name: 'Business Vocabulary', level: 86, color: 'bg-emerald-500' },
    { name: 'Pronunciation & Accent', level: 78, color: 'bg-indigo-500' },
    { name: 'Grammar & Accuracy', level: 88, color: 'bg-amber-500' },
    { name: 'Listening Comprehension', level: 91, color: 'bg-purple-500' },
  ]);

  const badges = ref([
    {
      id: 'streak_10',
      title: '10-Day Streak',
      desc: 'Attended live classes 10 days in a row without missing',
      icon: '🔥',
      tier: 'Gold',
      unlocked: true,
      date: 'Aug 18, 2026',
      bgGradient: 'from-amber-400 to-orange-500'
    },
    {
      id: 'grammar_guru',
      title: 'Grammar Ace',
      desc: 'Scored 90%+ in 15 consecutive lesson reviews',
      icon: '🎯',
      tier: 'Diamond',
      unlocked: true,
      date: 'Aug 14, 2026',
      bgGradient: 'from-blue-500 to-cyan-400'
    },
    {
      id: 'convo_champ',
      title: 'Conversation Champ',
      desc: 'Completed 20 live 1-on-1 English discussion sessions',
      icon: '🗣️',
      tier: 'Gold',
      unlocked: true,
      date: 'Aug 02, 2026',
      bgGradient: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'writing_master',
      title: 'Writing Pioneer',
      desc: 'Submitted 10 detailed essays and passed revisions',
      icon: '✍️',
      tier: 'Silver',
      unlocked: true,
      date: 'Jul 24, 2026',
      bgGradient: 'from-purple-400 to-pink-500'
    },
    {
      id: 'early_bird',
      title: 'Morning Scholar',
      desc: 'Completed 5 morning classes before 8:00 AM',
      icon: '🌅',
      tier: 'Bronze',
      unlocked: false,
      progress: '3/5',
      bgGradient: 'from-slate-300 to-slate-400'
    },
    {
      id: 'milestone_50',
      title: '50-Class Legend',
      desc: 'Attend 50 online 1-on-1 lessons with teachers',
      icon: '👑',
      tier: 'Diamond',
      unlocked: false,
      progress: '48/50',
      bgGradient: 'from-slate-300 to-slate-400'
    },
  ]);

  // ── Lessons ───────────────────────────────────────────────────────────
  const teacherOf = (id) => school.teacher(id);
  const myLessons = computed(() => school.lessonsForStudent(STUDENT_ID));

  /** A booked lesson in the dashboard's row shape. */
  const toUpcoming = (l, index) => {
    const t = teacherOf(l.teacherId);
    const range = rangeIn(l.start, l.duration, TOKYO);
    return {
      id: l.id,
      date: relativeDayLabel(l.start, school.now),
      time: `${range} JST`,
      teacherId: l.teacherId,
      teacherName: t.name,
      teacherPhoto: t.photo,
      isSubstitute: !!l.substitution,
      isNext: index === 0,
      subject: l.subject,
      classType: l.topic,
      topic: l.topic,
      meetLink: l.meetLink,
      note: l.note,
      minutesUntil: minutesUntil(l.start, school.now),
      start: l.start,
      duration: l.duration,
      points: l.points,
    };
  };

  /** Booked lessons that have not ended yet, soonest first. */
  const upcomingLessons = computed(() =>
    myLessons.value
      .filter((l) => l.status === 'booked' && minutesUntil(l.start, school.now) + l.duration > 0)
      .map(toUpcoming)
  );

  // The legacy dashboards clear the spotlight by assigning null; remember
  // which lesson they dismissed rather than breaking on a read-only value.
  const dismissedNextId = ref(null);
  const nextUpcomingClass = computed({
    get: () => {
      const lesson = upcomingLessons.value.find((l) => l.id !== dismissedNextId.value);
      if (!lesson) return null;
      return {
        ...lesson,
        time: rangeIn(lesson.start, lesson.duration, TOKYO),
        timeFull: lesson.time,
        isLiveSoon: lesson.minutesUntil <= 60,
      };
    },
    set: (value) => {
      if (value === null) dismissedNextId.value = upcomingLessons.value[0]?.id ?? null;
    },
  });

  // Completed / cancelled classes behind the Lesson History page, newest first.
  // A no-show counts as cancelled here, with its points kept.
  const pastLessons = computed(() =>
    myLessons.value
      .filter((l) => l.status !== 'booked' && minutesUntil(l.start, school.now) <= 0)
      .reverse()
      .map((l) => {
        const t = teacherOf(l.teacherId);
        const completed = l.status === 'completed';
        let feedback;
        if (completed) feedback = l.feedback || 'Your teacher has not written feedback for this lesson yet. Check back soon.';
        else if (l.status === 'no-show') feedback = 'Marked as a no-show — the points for this lesson were not refunded.';
        else feedback = l.cancelReason || 'This lesson was cancelled.';
        return {
          id: l.id,
          date: dateIn(l.start, TOKYO),
          time: `${rangeIn(l.start, l.duration, TOKYO)} JST`,
          teacherId: l.teacherId,
          teacherName: t.name,
          teacherPhoto: t.photo,
          subject: l.subject,
          topic: l.topic,
          duration: l.duration,
          pointsDeducted: l.refunded ? 0 : l.points,
          status: completed ? 'completed' : 'cancelled',
          yourRating: l.studentRating,
          yourComment: l.studentComment ?? '',
          rating: l.teacherScore,
          feedback,
        };
      })
  );

  /** The student's rating of the teacher for one past lesson. */
  const rateLesson = (id, rating, comment = '') => {
    school.rateLesson(id, rating, (comment ?? '').trim());
  };

  /**
   * Books a lesson for this student and takes the points. Returns the lesson,
   * or null when the slot is taken or the balance is short.
   */
  const bookLesson = ({ teacherId, start, duration = 30, subject, topic = '', note = '', points = 5 }) => {
    if (!school.isTeacherSlotOpen(teacherId, start, duration)) return null;
    return school.bookLesson({ studentId: STUDENT_ID, teacherId, start, duration, points, subject, topic, note });
  };

  /**
   * Cancels a lesson. Returns { refunded, points } so the page can say what
   * happened, or null if it could not be cancelled.
   */
  const cancelLesson = (id, reason = '') => {
    const lesson = school.cancelLesson(id, { reason });
    return lesson ? { refunded: lesson.refunded, points: lesson.points } : null;
  };

  /** Moves a lesson to a new start (ISO). Null if the teacher is busy then. */
  const rescheduleLesson = (id, startIso) => school.rescheduleLesson(id, startIso);

  /** Subject, topic and the message to the teacher. */
  const editLesson = (id, { subject, topic, note } = {}) => school.updateLesson(id, { subject, topic, note });

  // ── Writing ───────────────────────────────────────────────────────────
  // Writing correction tickets, newest activity first. `messages[0]` is always
  // the student's original passage, and a correction travels attached to the
  // message that explains it.
  const writingTickets = computed(() =>
    school.writingForStudent(STUDENT_ID)
      .map((w) => {
        const t = w.teacherId === null ? null : teacherOf(w.teacherId);
        const first = w.messages[0]?.body ?? '';
        return {
          id: w.id,
          title: w.title,
          status: w.status,
          date: dateIn(w.submittedAt, TOKYO),
          teacherName: t?.name ?? null,
          teacherPhoto: t?.photo ?? null,
          words: first.trim().split(/\s+/).filter(Boolean).length,
          remainingSends: w.remainingSends,
          lastAt: w.messages[w.messages.length - 1]?.at ?? w.submittedAt,
          messages: w.messages.map((m) => ({ ...m, time: messageStamp(m.at) })),
        };
      })
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
  );

  const openWritingCount = computed(
    () => writingTickets.value.filter((ticket) => ticket.status !== 'Complete').length
  );

  /** What a single correction costs, and what the ledger row will say. */
  const WRITING_COST = school.WRITING_COST;

  /** Appends the student's follow-up and spends one of the thread's sends. */
  const sendWritingReply = (ticketId, body) => {
    school.replyWriting(ticketId, { from: 'student', body: body ?? '' });
  };

  /** Closes the thread. It stays readable — only the reply box goes away. */
  const finishWritingTicket = (ticketId) => {
    school.completeWriting(ticketId);
  };

  /**
   * Opens a new ticket; the shared store charges the points and writes the
   * ledger row. Returns the new ticket so the page can jump straight to it, or
   * null if the balance is short.
   */
  const submitWriting = ({ title, body }) =>
    school.submitWriting({ studentId: STUDENT_ID, title: (title ?? '').trim() || 'Untitled passage', body });

  // ── Materials ─────────────────────────────────────────────────────────
  // The same shelf the instructor sees against this student's name.
  const lessonMaterials = computed(() => school.materialsFor(STUDENT_ID));

  /** Newest first, and grouped by subject for the materials page. */
  const materialsBySubject = computed(() => {
    const groups = new Map();
    lessonMaterials.value.forEach((item) => {
      const key = item.subject || 'General';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()].map(([subject, items]) => ({ subject, items }));
  });

  const bannerNotice = ref(null);
  
  const setBanner = (message, type = 'info') => {
    bannerNotice.value = { message, type };
  };
  
  const clearBanner = () => {
    bannerNotice.value = null;
  };

  /** The student's plan, resolved from the purchase catalogue. */
  const plan = computed(() => findPlan(profile.value.planId));
  const planName = computed(() => plan.value?.name ?? 'No active plan');
  const planIsSubscription = computed(() => isSubscription(profile.value.planId));

  /** Whole days until the subscription ends; 0 on the last day, negative once
   *  it has lapsed, null without a subscription to end. */
  const subscriptionDaysLeft = computed(() => {
    if (!planIsSubscription.value || !profile.value.planEndsOn) return null;
    const [y, m, d] = profile.value.planEndsOn.split('-').map(Number);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((new Date(y, m - 1, d) - start) / 86400000);
  });

  /** Refunds are excluded — they never left the student's wallet. */
  const totalSpent = computed(() =>
    purchaseHistory.value
      .filter((row) => row.status === 'paid')
      .reduce((sum, row) => sum + row.amount, 0)
  );

  const lastPurchase = computed(() => purchaseHistory.value[0] ?? null);

  const fullName = computed(() => `${profile.value.firstName} ${profile.value.lastName}`);

  return {
    profile,
    stats,
    skills,
    badges,
    pointLedger,
    purchaseHistory,
    totalSpent,
    lastPurchase,
    pastLessons,
    rateLesson,
    upcomingLessons,
    bookLesson,
    cancelLesson,
    rescheduleLesson,
    editLesson,
    lessonMaterials,
    materialsBySubject,
    writingTickets,
    openWritingCount,
    WRITING_COST,
    sendWritingReply,
    finishWritingTicket,
    submitWriting,
    nextUpcomingClass,
    bannerNotice,
    plan,
    planName,
    planIsSubscription,
    subscriptionDaysLeft,
    fullName,
    setBanner,
    clearBanner,
  };
});
