/**
 * The one set of sample data both portals share.
 *
 * The student portal is Taro Yamada (student 21); the instructor portal is
 * Jirvy Dela Torre (teacher 184). Every lesson, writing ticket, message thread
 * and exam below exists once, and each portal shows its own side of it — so a
 * lesson Taro books appears in Jirvy's reservations, feedback Jirvy writes
 * appears in Taro's history, and so on.
 *
 * Times are written as Manila wall-clock times on days relative to `anchor`
 * (the Manila date the data was seeded or last re-based on), then stored as
 * UTC ISO strings. See useSchoolStore for how the set follows the calendar.
 */
import { seedMaterials } from '@/lib/lessonMaterials';
import { manilaAt } from '@/lib/schoolTime';

export const SEED_VERSION = 1;

/** Ids of the signed-in user on each side of the prototype. */
export const CURRENT_STUDENT_ID = 21;
export const CURRENT_TEACHER_ID = 184;

const photo = (id) => `https://images.unsplash.com/photo-${id}?w=300&auto=format&fit=crop&q=80`;

export const seedStudents = () => ({
  21: { id: 21, name: 'Taro Yamada', photo: photo('1535713875002-d1d0cf377fde'), membership: 'Regular', category: 'Online', timezone: 'Asia/Tokyo', level: 'B2 Upper-Intermediate' },
  34: { id: 34, name: 'Aiko Tanaka', photo: photo('1517841905240-472988babdf9'), membership: 'Regular', category: 'Online', timezone: 'Asia/Tokyo', level: 'B1 Intermediate' },
  12: { id: 12, name: 'Kenji Sato', photo: photo('1500648767791-00dcc994a43e'), membership: 'Trial', category: 'Free Conversation', timezone: 'Asia/Tokyo', level: 'A2 Pre-Intermediate' },
  45: { id: 45, name: 'Mika Kobayashi', photo: photo('1494790108377-be9c29b29330'), membership: 'Regular', category: 'Online', timezone: 'Europe/London', level: 'B2 Upper-Intermediate' },
  58: { id: 58, name: 'Daiki Suzuki', photo: photo('1507003211169-0a1dd7228f2d'), membership: 'Regular', category: 'Online', timezone: 'Asia/Tokyo', level: 'B1 Intermediate' },
  63: { id: 63, name: 'Yuka Morita', photo: photo('1544005313-94ddf0286df2'), membership: 'Trial', category: 'Free Conversation', timezone: 'Asia/Tokyo', level: 'A2 Pre-Intermediate' },
});

/** Keyed by the teacher-image id the rest of the app already uses. */
export const seedTeachers = () => ({
  184: { id: 184, name: 'Jirvy Dela Torre' },
  178: { id: 178, name: 'Jane Pasanting' },
  176: { id: 176, name: 'Analyn Yosores' },
  175: { id: 175, name: 'Sandra Auman' },
  139: { id: 139, name: 'Nash Tatoy' },
});

const SF = '[SF] Speech Fluency';
const PP = '[PP101] Pronunciation — Vowels';
const DC = '[DC] Daily Conversation';
const RW = '[RW] Reading & Writing';
const LS = '[LS1] Listening & Speaking';
const EP = '[EP] Exam Prep';
const FC = '[FC] Free Conversation';

/**
 * Lessons. status: 'booked' | 'completed' | 'cancelled' | 'no-show'.
 * points = what the student paid; 30-minute lessons cost 5, 50-minute 9.
 */
export const seedLessons = (anchor) => {
  const at = (day, time) => manilaAt(anchor, day, time);
  const base = { duration: 30, points: 5, substitution: false, meetLink: '', note: '', topic: '', feedback: '', hiddenNote: '', feedbackSubmitted: false, teacherScore: null, studentRating: null, studentComment: '', cancelReason: '', refunded: false };
  const L = (o) => ({ ...base, ...o });
  return [
    // ── Booked ──────────────────────────────────────────────────────────
    L({ id: 'r-501', studentId: 21, teacherId: 184, start: at(0, '18:00'), status: 'booked', subject: SF, topic: 'Cross-Border Negotiations & Pitching', meetLink: 'https://meet.google.com/abc-defg-hij', note: 'I want to focus on cross-border negotiation phrasing. Please correct my intonation.',
      // Jirvy picked two things to read first; Taro has opened one of them.
      prepMaterialIds: ['m-2101', 'm-2104'], reviewed: { 'm-2101': at(-1, '21:10') } }),
    L({ id: 'r-502', studentId: 34, teacherId: 184, start: at(0, '20:00'), status: 'booked', subject: PP, topic: 'Vowel contrasts: /æ/ versus /ʌ/', meetLink: 'https://meet.google.com/klm-nopq-rst', note: 'Vowel drills again please — /æ/ and /ʌ/ are still hard for me.' }),
    L({ id: 'r-503', studentId: 12, teacherId: 184, start: at(1, '09:00'), status: 'booked', subject: DC, topic: 'Everyday small talk & self-introduction', substitution: true, note: 'First lesson — nervous about speaking, please go slowly.' }),
    L({ id: 'r-504', studentId: 45, teacherId: 184, start: at(1, '13:00'), status: 'booked', subject: RW, topic: 'IELTS Task 2 essay structure', meetLink: 'https://meet.google.com/uvw-xyza-bcd', note: 'Reviewing my IELTS Task 2 essay structure.' }),
    L({ id: 'r-505', studentId: 58, teacherId: 184, start: at(1, '15:30'), status: 'booked', subject: LS, topic: 'Tech Trends: AI & Workplace Automation', meetLink: 'https://meet.google.com/qrs-tuvw-xyz', note: 'Looking forward to discussing industry terminology and podcast summaries.' }),
    L({ id: 'r-506', studentId: 63, teacherId: 184, start: at(2, '10:00'), status: 'booked', subject: FC, topic: 'Travel plans to Cebu & cultural exchange', meetLink: 'https://meet.google.com/efg-hijk-lmn', note: 'Practicing everyday English for my upcoming trip to Cebu.' }),
    // Taro's lessons with other instructors.
    L({ id: 'r-511', studentId: 21, teacherId: 175, start: at(1, '19:00'), duration: 50, points: 9, status: 'booked', subject: DC, topic: 'Open Topic & Fluency', substitution: true, meetLink: 'https://meet.google.com/xyz-uvwx-rst', note: 'I want to talk about my weekend plans and practise asking follow-up questions.' }),
    L({ id: 'r-512', studentId: 21, teacherId: 178, start: at(3, '18:30'), status: 'booked', subject: PP, topic: 'Level 2 / Drills', note: 'Please focus on /r/ and /l/ — I still mix up "right" and "light".' }),
    L({ id: 'r-513', studentId: 21, teacherId: 176, start: at(5, '20:00'), duration: 50, points: 9, status: 'booked', subject: RW, topic: 'Business Email Drafting', meetLink: 'https://meet.google.com/klm-nopq-tuv', note: 'Can we review a follow-up email to a client after a missed deadline?' }),

    // ── Past, with Jirvy ────────────────────────────────────────────────
    L({ id: 'l-410', studentId: 21, teacherId: 184, start: at(-1, '18:00'), status: 'completed', subject: SF, topic: 'Counter-offers and closing a deal', feedbackSubmitted: true, teacherScore: 5, studentRating: 5, studentComment: 'Very clear explanations, I could follow every correction.', feedback: `Strong session, Taro. Your counter-offer phrasing was natural and confident.

Next time:
1. Pause before your key pitch point so it lands.
2. Swap "I think maybe" for "I'd suggest" when proposing terms.` }),
    L({ id: 'l-409', studentId: 34, teacherId: 184, start: at(-1, '15:00'), status: 'completed', subject: PP, topic: 'Short vowels in context', studentRating: 5 }),
    L({ id: 'l-408', studentId: 12, teacherId: 184, start: at(-2, '11:00'), status: 'completed', subject: DC, topic: 'Trial lesson: introductions', studentRating: 4, studentComment: 'Friendly and patient.' }),
    L({ id: 'l-407', studentId: 45, teacherId: 184, start: at(-3, '13:00'), status: 'no-show', subject: RW, topic: 'IELTS Task 2 essay structure', feedbackSubmitted: true }),
    L({ id: 'l-101', studentId: 21, teacherId: 184, start: at(-14, '18:00'), status: 'completed', subject: SF, topic: 'International Marketing & Market Fit', feedbackSubmitted: true, teacherScore: 5, feedback: `Taro showed strong vocabulary in strategic discussion today.

Key takeaways:
1. Improved cadence when delivering conclusions.
2. Use linking phrases like "In light of that" or "Consequently" instead of repeatedly saying "And so".` }),
    L({ id: 'l-105', studentId: 21, teacherId: 184, start: at(-25, '19:00'), duration: 50, points: 9, status: 'completed', subject: EP, topic: 'IELTS Speaking Part 2 — long turn', feedbackSubmitted: true, teacherScore: 4.9, feedback: 'Your two-minute long turn is now well structured. Watch the filler pause before examples — try "for instance" to buy the same time.' }),

    // ── Taro's past lessons with other instructors ──────────────────────
    L({ id: 'l-102', studentId: 21, teacherId: 178, start: at(-17, '19:00'), duration: 50, points: 9, status: 'completed', subject: PP, topic: 'Short vowels vs long vowels', feedbackSubmitted: true, teacherScore: 4.8, feedback: `Good effort distinguishing /ɪ/ and /iː/ (ship vs sheep) and /æ/ vs /ʌ/ (cat vs cut).

Homework: read the five tongue twisters aloud for three minutes before sleep.` }),
    L({ id: 'l-103', studentId: 21, teacherId: 175, start: at(-18, '18:00'), status: 'cancelled', subject: DC, topic: 'Open topic & fluency', refunded: true, cancelReason: 'Cancelled more than 3 hours before the start time — 5 points were refunded in full.' }),
    L({ id: 'l-104', studentId: 21, teacherId: 176, start: at(-21, '18:00'), status: 'completed', subject: DC, topic: 'Weekend activities & travel in Kyoto', feedbackSubmitted: true, teacherScore: 5, feedback: 'Great casual flow and natural reactions. You asked engaging follow-up questions without prompting.' }),
    L({ id: 'l-106', studentId: 21, teacherId: 178, start: at(-28, '18:30'), status: 'completed', subject: LS, topic: 'Following fast native speech', feedbackSubmitted: true, teacherScore: 4.7, feedback: 'You caught most reduced forms ("gonna", "wanna"). Next time we will work on numbers and dates at speed.' }),
  ];
};

/**
 * Writing tickets. `messages[0]` is always the student's passage.
 * teacherId null = waiting for an assessor; any instructor can pick it up.
 */
export const seedWriting = (anchor) => {
  const at = (day, time) => manilaAt(anchor, day, time);
  return [
    {
      id: 'w-88', studentId: 21, teacherId: 184, title: 'Business email — supplier delay apology', status: 'In Progress',
      submittedAt: at(-1, '14:20'), dueAt: at(0, '23:00'), remainingSends: 1,
      messages: [
        { id: 'm-1', from: 'student', at: at(-1, '14:20'), body: `Dear Mr. Tanaka,

I am writing to apologize about the delay of our shipment. We had a problem in the factory last week, so the products could not be finished on time.

We will send the products by next Friday. I am very sorry for the inconvenience.` },
        { id: 'm-2', from: 'student', at: at(-1, '14:26'), body: 'Sorry, one more thing — is "apologize about" correct here, or should it be "apologize for"?' },
      ],
    },
    {
      id: 'w-89', studentId: 45, teacherId: 184, title: 'IELTS Task 2 — remote work essay', status: 'In Progress',
      submittedAt: at(-1, '20:05'), dueAt: at(1, '22:00'), remainingSends: 2,
      messages: [
        { id: 'm-1', from: 'student', at: at(-1, '20:05'), body: `Some people believe that working from home is better for employees, while others think the office is necessary for teamwork. Discuss both views and give your own opinion.

In my opinion, remote work has more advantage than disadvantage. First, employees can save the commuting time, which in Tokyo is often two hours every day. Second, they can concentrate better because there is no interruption from colleagues.

However, I admit that new staff needs the office to learn from senior members.` },
      ],
    },
    {
      id: 'w-90', studentId: 34, teacherId: 184, title: 'Self-introduction rewrite', status: 'In Progress',
      submittedAt: at(-2, '09:40'), dueAt: at(-1, '20:00'), remainingSends: 1,
      messages: [
        { id: 'm-1', from: 'student', at: at(-2, '09:40'), body: `Hello everyone, my name is Aiko Tanaka. I work in the sales department for three years. I am interesting in international business and I want to improve my English for meeting with overseas client.

Nice to meet you all and I hope we can work together well.` },
        { id: 'm-2', from: 'teacher', at: at(-2, '11:05'), body: 'Thanks Aiko — I have your passage. I will send the full correction today. One quick note while you wait: "I am interesting" should be "I am interested". We use -ing for the thing, -ed for the person.' },
        { id: 'm-3', from: 'student', at: at(-2, '21:14'), body: 'Thank you! Could you also check whether "for three years" is right? My colleague said it should be "for three years now".' },
      ],
    },
    {
      id: 'wt-1', studentId: 21, teacherId: 176, title: 'Self Introduction Draft', status: 'In Progress',
      submittedAt: at(-3, '08:00'), dueAt: at(-1, '08:00'), remainingSends: 3,
      messages: [
        { id: 'm-1', from: 'student', at: at(-3, '08:00'), body: `Hi, I wrote this self introduction for my new job. Please check if the grammar is natural.

"Hello everyone, my name is Taro. I am joining the marketing team. I looking forward to work with you all."` },
        { id: 'm-2', from: 'teacher', at: at(-2, '09:30'), correction: 'Hello everyone, my name is Taro. I am joining the marketing team. I am looking forward to working with you all.', body: `Hi Taro!

This is a good start. The only change is the last sentence: when we use "look forward to", it must be followed by a noun or an -ing verb (gerund).` },
      ],
    },
    {
      id: 'wt-2', studentId: 21, teacherId: 184, title: 'Weekly Journal — Entry 5', status: 'Complete',
      submittedAt: at(-6, '19:00'), dueAt: at(-4, '19:00'), remainingSends: 0,
      messages: [
        { id: 'm-1', from: 'student', at: at(-6, '19:00'), body: 'Here is my journal entry about my weekend trip to Kyoto.' },
        { id: 'm-2', from: 'teacher', at: at(-5, '08:15'), body: 'Excellent writing! Very few mistakes this time, and the vocabulary was very descriptive.' },
      ],
    },
  ];
};

/**
 * Message threads between a student and an instructor.
 * teacherReadAt / studentReadAt: everything after them counts as unread.
 */
export const seedThreads = (anchor) => {
  const at = (day, time) => manilaAt(anchor, day, time);
  const T = (studentId, messages, teacherReadAt, studentReadAt) => ({
    id: `t-${studentId}-184`, studentId, teacherId: 184, messages, teacherReadAt, studentReadAt,
  });
  return [
    T(21, [
      { id: 'm1', from: 'student', at: at(-1, '18:35'), text: "Good evening Teacher Jirvy! Thank you so much for today's Speech Fluency class on cross-border negotiations.", reactions: ['👍'] },
      { id: 'm2', from: 'teacher', at: at(-1, '18:40'), text: 'Good evening Taro! You did a fantastic job with the counter-offer phrasing today. Remember to pause before delivering your key pitch point.', reactions: [] },
      { id: 'm2_file', from: 'teacher', at: at(-1, '18:41'), text: 'Here is the executive negotiation phrasebook sheet we reviewed.', reactions: ['❤️'], attachment: { name: 'Executive_Negotiation_Drills_SF.pdf', size: '1.2 MB', type: 'PDF Document', icon: 'fa-solid fa-file-pdf text-rose-500' } },
      { id: 'm3', from: 'student', at: at(-1, '18:42'), text: 'Understood! I will review the negotiation phrases before our next session. Should I prepare an opening pitch draft?', reactions: [] },
      { id: 'm4', from: 'teacher', at: at(-1, '18:45'), text: 'Yes please! A 1-minute intro will be great practice. Looking forward to our next class!', reactions: [] },
    ], at(-1, '18:45'), at(-1, '18:44')),
    T(34, [
      { id: 'm5', from: 'student', at: at(-1, '16:15'), text: 'Hello Teacher Jirvy, I still find it difficult to distinguish /æ/ as in "cat" and /ʌ/ as in "cut". Do you have any audio drills?', reactions: [] },
      { id: 'm6', from: 'teacher', at: at(-1, '16:25'), text: "Hi Aiko! Keep your jaw slightly lower for /æ/. Practise the drill from our lesson with minimal pairs like cat/cut and bat/but.", reactions: ['👍'] },
      { id: 'm6_extra', from: 'student', at: at(-1, '16:30'), text: 'Teacher Jirvy, could you send the audio clip when you have a free moment?', reactions: [] },
    ], at(-1, '16:25'), at(-1, '16:30')),
    T(12, [
      { id: 'm7', from: 'student', at: at(-2, '12:15'), text: 'Teacher Jirvy, thank you for being patient with me during my first trial lesson. I was quite nervous.', reactions: ['❤️'] },
      { id: 'm8', from: 'teacher', at: at(-2, '12:30'), text: 'You did very well Kenji! Natural conversation takes time. Keep practicing the self-introduction points we discussed.', reactions: [] },
    ], at(-2, '12:30'), at(-2, '12:30')),
    T(45, [
      { id: 'm9', from: 'student', at: at(-3, '15:00'), text: 'Hi Jirvy, apologies for missing our previous session due to an emergency meeting. I have submitted my IELTS essay draft for your review.', reactions: [] },
      { id: 'm10', from: 'teacher', at: at(-3, '15:20'), text: 'No worries Mika! I have received your essay and will go over the thesis structure during our next class.', reactions: ['👍'] },
    ], at(-3, '15:20'), at(-3, '15:20')),
    T(58, [
      { id: 'm11', from: 'student', at: at(-4, '17:00'), text: 'Hi Jirvy! The tech article on AI automation you recommended was super interesting. Excited for our discussion next week!', reactions: ['❤️'] },
    ], at(-4, '17:00'), at(-4, '17:00')),
  ];
};

/** Exams written by instructors and assigned to students. */
export const seedExams = (anchor) => {
  const at = (day, time) => manilaAt(anchor, day, time);
  return [
    {
      id: 'exam-1', teacherId: 184, assignedTo: [21, 34, 58],
      title: 'Speech Fluency (SF) - Level 3 Assessment', subject: 'SF',
      description: 'Comprehensive evaluation of conversational fluidity, idiom usage, and structured discourse.',
      durationMinutes: 45, status: 'Published', updatedAt: at(-6, '10:00'),
      questions: [
        { id: 'q1', type: 'mcq', prompt: 'Which transitional phrase best introduces a contrasting argument in a persuasive speech?', options: ['In addition to that', 'On the other hand', 'For instance', 'As a matter of fact'], correctIndex: 1, explanation: '"On the other hand" signals a direct contrast or opposing viewpoint.', points: 5 },
        { id: 'q2', type: 'mcq', prompt: 'Identify the sentence with natural conversational cadence:', options: ['I did go to the store yesterday because I wanted to buy apples.', 'I went to the store yesterday to grab some apples.', 'The apples were bought by me yesterday at the store.', 'Going yesterday store apples grabbed.'], correctIndex: 1, explanation: 'Active voice with "grab some apples" reflects natural colloquial phrasing.', points: 5 },
        { id: 'q3', type: 'essay', prompt: 'Discuss the advantages and challenges of remote working compared to traditional office environments. Provide personal examples or observations.', minWords: 150, maxWords: 250, rubricFocus: 'Discourse markers, cohesion, varied vocabulary, coherence', sampleAnswer: 'Expect clear introduction stating preference, 2 body paragraphs balancing flexibility vs isolation, and concise conclusion.', points: 20 },
      ],
    },
    {
      id: 'exam-2', teacherId: 184, assignedTo: [21, 12],
      title: 'Daily Conversation (DC) Idioms & Phrasal Verbs', subject: 'DC',
      description: 'Weekly quiz targeting high-frequency phrasal verbs and workplace expressions.',
      durationMinutes: 30, status: 'Published', updatedAt: at(-9, '10:00'),
      questions: [
        { id: 'q4', type: 'mcq', prompt: 'What does "call it a day" mean?', options: ['To phone a friend during daylight', 'To stop working on something for the rest of the day', 'To celebrate a calendar holiday', 'To postpone until next week'], correctIndex: 1, explanation: '"Call it a day" means to conclude an activity or work session.', points: 5 },
        { id: 'q5', type: 'essay', prompt: 'Describe a memorable travel experience where you had to communicate with someone who spoke a different language. How did you overcome the barrier?', minWords: 100, maxWords: 180, rubricFocus: 'Storytelling past tense forms, descriptive adjectives', sampleAnswer: 'Evaluate past tense accuracy (simple past vs past continuous), narrative pacing.', points: 15 },
      ],
    },
    {
      id: 'exam-3', teacherId: 184, assignedTo: [45],
      title: 'Reading & Writing (RW) Essay Practice: Climate Action', subject: 'RW',
      description: 'Argumentative essay test evaluating thesis construction and counterarguments.',
      durationMinutes: 50, status: 'Draft', updatedAt: at(-5, '10:00'),
      questions: [
        { id: 'q6', type: 'essay', prompt: 'Should single-use plastics be completely banned worldwide, or should recycling programs be modernized instead? Present your thesis and supporting arguments.', minWords: 200, maxWords: 350, rubricFocus: 'Thesis clarity, argumentation, paragraph structure, lexical sophistication', sampleAnswer: 'Well-structured 4-paragraph argument essay with counter-argument concession.', points: 30 },
      ],
    },
  ];
};

/**
 * Submitted exams. mcqScore is marked automatically; essays wait for the
 * instructor (essayScores filled in on grading, graded = true).
 */
export const seedSubmissions = (anchor) => {
  const at = (day, time) => manilaAt(anchor, day, time);
  return [
    {
      id: 'sub-1', examId: 'exam-2', studentId: 21, submittedAt: at(-7, '20:10'),
      answers: { q4: 1, q5: 'Last year I travelled to Seoul. At a small restaurant the owner did not speak English or Japanese, so I used gestures and a translation app. I pointed at pictures on the menu and we laughed a lot. In the end she gave me a free dessert. I learned that a smile is a common language.' },
      mcqScore: 5, essayScores: { q5: 12 }, graded: true, gradedAt: at(-6, '09:00'),
      teacherComment: 'Nice narrative and good use of past tense. Watch articles: "a translation app", not "translation app".',
    },
    {
      id: 'sub-2', examId: 'exam-2', studentId: 12, submittedAt: at(-1, '21:00'),
      answers: { q4: 3, q5: 'When I go to Thailand I want buy food. The man not understand me. I show him the picture in my phone and he understand. It was very fun.' },
      mcqScore: 0, essayScores: {}, graded: false, gradedAt: null, teacherComment: '',
    },
  ];
};

/** The shared material seed plus the pitch script Jirvy set for tonight's lesson. */
const seedMaterialsWithPrep = () => {
  const materials = seedMaterials();
  (materials[21] ??= []).unshift({
    id: 'm-2104',
    title: 'Pitch opening — 1-minute script template',
    kind: 'doc',
    subject: '[SF] Speech Fluency',
    note: 'Draft your 1-minute opening using this outline before we meet.',
    url: 'https://example.com/materials/pitch-opening-template',
    addedOn: 'Yesterday',
    addedBy: 'Jirvy Dela Torre',
  });
  return materials;
};

/** Points wallets. `entries` are ledger rows added at runtime, newest first. */
export const seedWallets = () => ({
  21: { balance: 120, entries: [] },
});

/**
 * Weekly availability per instructor, in Manila time, keyed `${day}-${slot}`.
 * Same shape the instructor store edits. Only Jirvy publishes real hours in
 * the prototype; other instructors fall back to sample availability.
 */
export const seedAvailability = () => {
  const pattern = {};
  const openByDay = {
    sun: [],
    mon: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20],
    tue: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20],
    wed: [14, 15, 16, 17, 18, 19],
    thu: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20],
    fri: [9, 10, 11, 17, 18, 19],
    sat: [10, 11, 13, 14],
  };
  const key = (day, mins) => `${day}-t${String(Math.floor(mins / 60)).padStart(2, '0')}${String(mins % 60).padStart(2, '0')}`;
  Object.entries(openByDay).forEach(([day, hours]) => {
    hours.forEach((h) => { pattern[key(day, h * 60)] = 'open'; pattern[key(day, h * 60 + 30)] = 'open'; });
  });
  const hold = (day, h, reason) => {
    pattern[key(day, h * 60)] = { status: 'reserved', reason };
    pattern[key(day, h * 60 + 30)] = { status: 'reserved', reason };
  };
  hold('wed', 13, 'Demo Lesson');
  hold('fri', 16, 'Team Meeting / Sync');
  return { 184: { weekPattern: pattern, weekOverrides: {}, recurringSlots: {} } };
};

export const buildSeed = (anchor) => ({
  version: SEED_VERSION,
  anchor,
  students: seedStudents(),
  teachers: seedTeachers(),
  lessons: seedLessons(anchor),
  writing: seedWriting(anchor),
  materials: seedMaterialsWithPrep(),
  threads: seedThreads(anchor),
  exams: seedExams(anchor),
  submissions: seedSubmissions(anchor),
  wallets: seedWallets(),
  availability: seedAvailability(),
});
