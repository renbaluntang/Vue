/**
 * The school's materials library: every original lesson document, by subject.
 *
 * In the real system this is a database table of links that the content team
 * keeps up to date; the documents themselves live in the shared drive and are
 * never edited by teachers or students. A teacher sends a student a copy of
 * one, and the copy is what the student works in.
 *
 * Subjects come in two shapes, so the page can draw each the way the content
 * team already lays it out: a numbered list of lessons in sections (Daily
 * Conversation), or a grid where each row is a topic and each column a kind of
 * practice (Pronunciation: a sound × spelling, words, sentences, passages).
 *
 * The links are placeholders for the presentation.
 */

const doc = (id) => `https://docs.google.com/document/d/sample-${id}/edit`;

export const MATERIAL_SUBJECTS = [
  { code: 'DC', name: 'Daily Conversation', layout: 'list' },
  {
    code: 'PP',
    name: 'Pronunciation Practice',
    layout: 'grid',
    rowLabel: 'Sound',
    columns: ['Spelling', 'Words', 'Sentences', 'Passages'],
  },
  { code: 'SC', name: 'Speech Class', layout: 'list' },
  { code: 'EPW', name: 'Essay writing', layout: 'list' },
  { code: 'TC', name: 'Topic cards and R/L', layout: 'list' },
];

// Kids' lessons are numbered from 1 again, so they carry their own code in the
// copy's name (DCK1_21) and never clash with the adult lesson of that number.
const dc = (section, lessonNo, title) => ({
  id: `dc-${section === 'For kids' ? 'k' : 'a'}${lessonNo}`,
  code: section === 'For kids' ? 'DCK' : 'DC',
  subject: 'DC',
  group: section,
  lessonNo,
  title,
});

const DC_ITEMS = [
  dc('For adults · Beginners', 1, 'Objectives and mechanics'),
  dc('For adults · Beginners', 2, "Let's talk about our daily routine"),
  dc('For adults · Beginners', 3, "Let's talk about our friends"),
  dc('For adults · Beginners', 4, "Let's talk about social networking sites"),
  dc('For adults · Beginners', 5, "Let's talk about our childhood"),
  dc('For adults · Beginners', 6, "Let's talk about our memorable experiences"),
  dc('For adults · Beginners', 7, "Let's talk about rumors or gossip"),
  dc('For adults · Beginners', 8, "Let's talk about our needs and wants"),
  dc('For kids', 1, 'Hello and my name'),
  dc('For kids', 2, 'My family'),
  dc('For kids', 3, 'My favourite food'),
  dc('For kids', 4, 'At the park'),
];

// Each row is one sound; the R-controlled assessment is a row of its own with
// a single document.
const PP_SOUNDS = [
  { key: 'ar', label: '/ɑr/' },
  { key: 'er-schwa', label: '/ɜr/ and /ər/' },
  { key: 'or', label: '/ɔr/' },
  { key: 'air', label: '/ɛr/' },
  { key: 'ear', label: '/ɪr/ or /ɪər/' },
  { key: 'ire', label: '/aɪr/ or /aɪər/' },
  { key: 'ur', label: '/ʊr/' },
];

const PP_ITEMS = [
  ...PP_SOUNDS.flatMap((s) => ['Spelling', 'Words', 'Sentences', 'Passages'].map((column) => ({
    id: `pp-${s.key}-${column.toLowerCase()}`,
    subject: 'PP',
    group: s.label,
    column,
    title: `${s.label} ${column.toUpperCase()}`,
  }))),
  {
    id: 'pp-r-assessment',
    subject: 'PP',
    group: 'R-controlled assessment',
    column: 'Spelling',
    title: 'R-controlled vowel assessment',
    wide: true,
  },
];

const SC_ITEMS = [
  'Advance: dialogue materials',
  'Advance: speed reading',
  'Advance: famous speeches',
  'Advance: monologues',
  'Advance: extemporaneous speaking',
  'SF monologues 2',
  'SF B1–I1: additional materials',
].map((title, i) => ({ id: `sc-${i + 1}`, subject: 'SC', group: 'Speech class', title }));

const EPW_ITEMS = [
  'Opinion essay',
  'Discussion essay',
  'Advantages and disadvantages essay',
  'Problem–solution essay',
  'Two-part question essay',
].map((title, i) => ({ id: `epw-${i + 1}`, subject: 'EPW', group: 'Essay types', title }));

const TC_ITEMS = [
  { id: 'tc-1', subject: 'TC', group: 'Topic cards', title: 'Compilation of topic cards 1' },
  { id: 'tc-2', subject: 'TC', group: 'Topic cards', title: 'Compilation of topic cards 2' },
  { id: 'tc-3', subject: 'TC', group: 'Reading and listening', title: 'Compilation of R/L 1' },
];

export const MATERIAL_ITEMS = [...DC_ITEMS, ...PP_ITEMS, ...SC_ITEMS, ...EPW_ITEMS, ...TC_ITEMS]
  .map((item) => ({ ...item, url: doc(item.id) }));

const BY_ID = Object.fromEntries(MATERIAL_ITEMS.map((item) => [item.id, item]));

export const materialItem = (id) => BY_ID[id] ?? null;
export const materialSubject = (code) => MATERIAL_SUBJECTS.find((s) => s.code === code) ?? null;

/** What a teacher reads for an item: "Lesson 3 · Let's talk about our friends". */
export const itemLabel = (item) => (item.lessonNo ? `Lesson ${item.lessonNo} · ${item.title}` : item.title);

/**
 * The copy's name in the shared drive: the original's name and the student's
 * id, so people browsing the drive can tell copies apart. The system itself
 * finds copies by hidden tags, not by name.
 */
export const copyFileName = (item, studentId) => {
  if (item.lessonNo) return `${item.code ?? item.subject}${item.lessonNo}_${studentId}`;
  // Practice sheets are named by their id ("PP_ar-words_21"), since their
  // titles hold phonetic symbols and slashes that read badly as file names.
  if (item.column) return `${item.subject}_${item.id.replace(/^[a-z]+-/, '')}_${studentId}`;
  return `${item.title} (${studentId})`;
};

/** Where the copy lands in the shared drive. */
export const copyFolder = (item, studentId) => `Class Materials / ${item.subject} / ${studentId}`;
