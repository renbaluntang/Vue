import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { teacherImage, imageForKey } from '@/lib/teacherImages';
import { findPlan, isSubscription } from '@/lib/plans';

export const useUserStore = defineStore('user', () => {
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
    pointsBalance: 120,
    pointsExpiry: '2026-09-30',
    planId: 'sub-40',
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

  const pointLedger = ref([
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

  // Completed / cancelled classes behind the Lesson History page. The Aug 15
  // cancellation is the same event as the "Class Cancellation Refund" ledger row.
  const pastLessons = ref([
    {
      id: 101,
      date: 'Aug 19, 2026',
      time: '7:00 PM - 7:30 PM JST',
      teacherName: 'Jirvy Dela Torre',
      teacherPhoto: teacherImage('Jirvy Dela Torre'),
      subject: '[SF] Speech Fluency & Discussion',
      topic: 'International Marketing & Market Fit',
      duration: 30,
      pointsDeducted: 5,
      status: 'completed',
      yourRating: null,
      yourComment: '',
      rating: 5,
      feedback: `Taro showed strong vocabulary in strategic discussion today.

Key takeaways:
1. Improved cadence when delivering conclusions.
2. Use linking phrases like "In light of that" or "Consequently" instead of repeatedly saying "And so".`,
    },
    {
      id: 102,
      date: 'Aug 16, 2026',
      time: '8:00 PM - 8:50 PM JST',
      teacherName: 'Jane Pasanting',
      teacherPhoto: teacherImage('Jane Pasanting'),
      subject: '[PP101] Pronunciation — Vowels',
      topic: 'Short vowels vs long vowels',
      duration: 50,
      pointsDeducted: 9,
      status: 'completed',
      yourRating: null,
      yourComment: '',
      rating: 4.8,
      feedback: `Good effort distinguishing /ɪ/ and /iː/ (ship vs sheep) and /æ/ vs /ʌ/ (cat vs cut).

Homework: read the five tongue twisters aloud for three minutes before sleep.`,
    },
    {
      id: 103,
      date: 'Aug 15, 2026',
      time: '7:00 PM - 7:30 PM JST',
      teacherName: 'Sandra Auman',
      teacherPhoto: teacherImage('Sandra Auman'),
      subject: '[DC] Daily Conversation',
      topic: 'Open topic & fluency',
      duration: 30,
      pointsDeducted: 0,
      status: 'cancelled',
      yourRating: null,
      yourComment: '',
      rating: null,
      feedback: 'Cancelled more than 3 hours before the start time — 5 points were refunded in full.',
    },
    {
      id: 104,
      date: 'Aug 12, 2026',
      time: '7:00 PM - 7:30 PM JST',
      teacherName: 'Analyn Yosores',
      teacherPhoto: teacherImage('Analyn Yosores'),
      subject: '[DC] Daily Conversation',
      topic: 'Weekend activities & travel in Kyoto',
      duration: 30,
      pointsDeducted: 5,
      status: 'completed',
      yourRating: null,
      yourComment: '',
      rating: 5,
      feedback: `Great casual flow and natural reactions. You asked engaging follow-up questions without prompting.`,
    },
    {
      id: 105,
      date: 'Aug 08, 2026',
      time: '8:00 PM - 8:50 PM JST',
      teacherName: 'Jirvy Dela Torre',
      teacherPhoto: teacherImage('Jirvy Dela Torre'),
      subject: '[EP] Exam Prep',
      topic: 'IELTS Speaking Part 2 — long turn',
      duration: 50,
      pointsDeducted: 9,
      status: 'completed',
      yourRating: null,
      yourComment: '',
      rating: 4.9,
      feedback: `Your two-minute long turn is now well structured. Watch the filler pause before examples — try "for instance" to buy the same time.`,
    },
    {
      id: 106,
      date: 'Aug 05, 2026',
      time: '7:30 PM - 8:00 PM JST',
      teacherName: 'Jane Pasanting',
      teacherPhoto: teacherImage('Jane Pasanting'),
      subject: '[LS1] Listening & Speaking',
      topic: 'Following fast native speech',
      duration: 30,
      pointsDeducted: 5,
      status: 'completed',
      yourRating: null,
      yourComment: '',
      rating: 4.7,
      feedback: `You caught most reduced forms ("gonna", "wanna"). Next time we will work on numbers and dates at speed.`,
    },
  ]);

  // Same lesson as the first entry of the dashboard's upcomingLessons — the id
  // is shared so the schedule table can exclude whatever is already featured.
  const nextUpcomingClass = ref({
    id: 1,
    date: 'Today',
    time: '7:00 PM - 7:30 PM',
    timeFull: '7:00 PM - 7:30 PM JST',
    minutesUntil: 28,
    isLiveSoon: true,
    teacherName: 'Jirvy Dela Torre',
    teacherPhoto: imageForKey(184),
    subject: '[SF] Speech Fluency & Discussion',
    topic: 'Cross-Border Negotiations & Pitching',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    isSubstitute: false,
  });

  // Writing correction tickets, newest activity first. Mirrors the instructor
  // side: `messages[0]` is always the student's original passage, so a thread
  // needs no separate "submission" field, and a correction travels attached to
  // the message that explains it.
  const writingTickets = ref([
    {
      id: 'wt-1',
      title: 'Self Introduction Draft',
      status: 'In Progress',
      date: 'Oct 14, 2026',
      teacherName: 'Analyn Y.',
      teacherPhoto: teacherImage('Analyn Y.'),
      words: 34,
      remainingSends: 3,
      messages: [
        {
          id: 'm-1',
          from: 'student',
          time: 'Oct 14, 09:00',
          body: `Hi, I wrote this self introduction for my new job. Please check if the grammar is natural.

"Hello everyone, my name is Taro. I am joining the marketing team. I looking forward to work with you all."`,
        },
        {
          id: 'm-2',
          from: 'teacher',
          time: 'Oct 15, 10:30',
          correction: 'Hello everyone, my name is Taro. I am joining the marketing team. I am looking forward to working with you all.',
          body: `Hi Taro!

This is a good start. The only change is the last sentence: when we use "look forward to", it must be followed by a noun or an -ing verb (gerund).`,
        },
      ],
    },
    {
      id: 'wt-2',
      title: 'Weekly Journal — Entry 5',
      status: 'Complete',
      date: 'Oct 10, 2026',
      teacherName: 'Jirvy Dela Torre',
      teacherPhoto: teacherImage('Jirvy Dela Torre'),
      words: 12,
      remainingSends: 0,
      messages: [
        {
          id: 'm-1',
          from: 'student',
          time: 'Oct 10, 20:00',
          body: 'Here is my journal entry about my weekend trip to Kyoto.',
        },
        {
          id: 'm-2',
          from: 'teacher',
          time: 'Oct 11, 09:15',
          body: 'Excellent writing! Very few mistakes this time, and the vocabulary was very descriptive.',
        },
      ],
    },
  ]);

  const openWritingCount = computed(
    () => writingTickets.value.filter((ticket) => ticket.status !== 'Complete').length
  );

  /** What a single correction costs, and what the ledger row will say. */
  const WRITING_COST = 5;

  /** Appends the student's follow-up and spends one of the thread's sends. */
  const sendWritingReply = (ticketId, body) => {
    const ticket = writingTickets.value.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === 'Complete' || ticket.remainingSends < 1) return;
    const text = (body ?? '').trim();
    if (!text) return;
    ticket.messages.push({
      id: `m-${ticket.messages.length + 1}`,
      from: 'student',
      time: 'Just now',
      body: text,
    });
    ticket.remainingSends -= 1;
  };

  /** Closes the thread. It stays readable — only the reply box goes away. */
  const finishWritingTicket = (ticketId) => {
    const ticket = writingTickets.value.find((t) => t.id === ticketId);
    if (ticket) ticket.status = 'Complete';
  };

  /**
   * Opens a new ticket and charges the points, writing the ledger row the
   * Point History page already shows for past corrections. Returns the new
   * ticket so the page can jump straight to it, or null if the balance is short.
   */
  const submitWriting = ({ title, body }) => {
    const text = (body ?? '').trim();
    if (!text || profile.value.pointsBalance < WRITING_COST) return null;

    const name = (title ?? '').trim() || 'Untitled passage';
    const words = text.split(/\s+/).filter(Boolean).length;

    const ticket = {
      id: `wt-${Date.now()}`,
      title: name,
      status: 'In Progress',
      date: 'Just now',
      teacherName: null,
      teacherPhoto: null,
      words,
      remainingSends: 3,
      messages: [{ id: 'm-1', from: 'student', time: 'Just now', body: text }],
    };
    writingTickets.value.unshift(ticket);

    profile.value.pointsBalance -= WRITING_COST;
    pointLedger.value.unshift({
      id: Date.now(),
      date: 'Just now',
      time: '',
      points: -WRITING_COST,
      reason: 'Writing Correction Submitted',
      detail: name,
      type: 'debit',
      balanceAfter: profile.value.pointsBalance,
    });

    return ticket;
  };

  /** The student's rating of the teacher for one past lesson. */
  const rateLesson = (id, rating, comment = '') => {
    const lesson = pastLessons.value.find((item) => item.id === id);
    if (!lesson || lesson.status !== 'completed') return;
    lesson.yourRating = rating;
    lesson.yourComment = comment.trim();
  };

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
    fullName,
    setBanner,
    clearBanner,
  };
});
