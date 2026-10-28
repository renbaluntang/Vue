/**
 * BRELAS — the Brighture level scale — and the level-check types.
 *
 * One level per student (not per subject), held as a rating from 1 to 15
 * (or B0) — see below.
 *
 * The level is for admins and teachers only. Nothing in this file may be
 * imported by the student portal for display — students see feedback, never
 * the level (see CLAUDE.md, "Level check").
 */

/*
 * What is stored is a RATING: a whole number from 1 to 15, or 'B0' for a
 * student who was assessed and has no foundation yet. Level and band are
 * derived from it, never stored:
 *   - level: every three ratings make one level (1–3 B1, 4–6 B2, … 13–15 A);
 *   - band: the rating's place inside its level — Needs improvement,
 *     Satisfactory, Very satisfactory.
 * CEFR is shown for reference only. null means Unassessed (no history),
 * which is not the same as B0.
 */
export const BRELAS_LEVELS = [
  { code: 'B0', label: 'Beginner 0', min: null, max: null, cefr: 'Pre-A1' },
  { code: 'B1', label: 'Beginner 1', min: 1, max: 3, cefr: 'A1' },
  { code: 'B2', label: 'Beginner 2', min: 4, max: 6, cefr: 'A2' },
  { code: 'I1', label: 'Intermediate 1', min: 7, max: 9, cefr: 'B1' },
  { code: 'I2', label: 'Intermediate 2', min: 10, max: 12, cefr: 'B2' },
  { code: 'A', label: 'Advanced', min: 13, max: 15, cefr: 'C1–C2' },
];

export const BANDS = ['Needs improvement', 'Satisfactory', 'Very satisfactory'];
export const RATING_MAX = 15;

/** Shown when a student has no assessment history. Not a level: B0 is. */
export const UNASSESSED = {
  value: null, code: null, label: 'Unassessed', band: null, rating: null, cefr: null,
  display: 'Unassessed', note: 'No assessment yet',
};

/** A stored value is 'B0' or a whole number 1–15. */
export const isValidRating = (v) => v === 'B0' || (Number.isInteger(v) && v >= 1 && v <= RATING_MAX);

/**
 * Everything derived from a stored rating: level code and name, band, CEFR
 * reference and a short display ("B2 · Satisfactory"). Unassessed for null.
 */
export const levelInfo = (value) => {
  if (value === 'B0') {
    const l = BRELAS_LEVELS[0];
    return { value, code: l.code, label: l.label, band: null, rating: null, cefr: l.cefr, display: 'B0', note: 'Assessed — no foundation yet' };
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > RATING_MAX) return UNASSESSED;
  const l = BRELAS_LEVELS.find((x) => x.min !== null && n >= x.min && n <= x.max);
  const band = BANDS[(n - 1) % 3];
  return { value: n, code: l.code, label: l.label, band, rating: n, cefr: l.cefr, display: `${l.code} · ${band}`, note: '' };
};

/** Every value a teacher or admin can pick, in order: B0, then 1–15. */
export const RATING_OPTIONS = ['B0', ...Array.from({ length: RATING_MAX }, (_, i) => i + 1)].map(levelInfo);

/**
 * Legacy a_level (1–8) to a rating, for migration. The old scale had half
 * steps (B1.5, I1.5) and no bands, so each maps to the middle of the closest
 * new level. [To confirm with the academic team.]
 */
const LEGACY_TO_RATING = { 1: 'B0', 2: 2, 3: 3, 4: 5, 5: 8, 6: 9, 7: 11, 8: 14 };
export const ratingFromLegacy = (n) => LEGACY_TO_RATING[Number(n)] ?? null;

/** Band colours, for chips on admin and teacher screens. */
export const BAND_STYLES = {
  'Needs improvement': 'bg-amber-50 text-amber-800 ring-amber-200',
  Satisfactory: 'bg-sky-50 text-sky-700 ring-sky-200',
  'Very satisfactory': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  null: 'bg-slate-100 text-slate-500 ring-slate-200',
  '—': 'bg-slate-100 text-slate-500 ring-slate-200',
};

/**
 * Level-check types. TA and CS are lessons the student books; FA is a
 * fixed-class / corporate assessment an admin schedules (no booking).
 */
export const ASSESSMENT_TYPES = {
  TA: { code: 'TA', label: 'Trial Lesson & Assessment', short: 'Trial assessment', subject: '[TA] Trial Lesson & Assessment', bookable: true, free: true },
  CS: { code: 'CS', label: 'Counseling Session', short: 'Counseling session', subject: '[CS] Counseling Session', bookable: true, free: false },
  FA: { code: 'FA', label: "Student's Assessment (fixed class / corporate)", short: 'Fixed-class assessment', subject: '[FA] Fixed-class Assessment', bookable: false, free: true },
};

/** '[TA] Trial Lesson…' -> 'TA'; null for a regular lesson. */
export const assessmentTypeOf = (subject) => {
  const code = /\[([^\]]+)\]/.exec(subject ?? '')?.[1];
  return code && ASSESSMENT_TYPES[code] ? code : null;
};

/** CS and TA can be cancelled until this many minutes before the start. */
export const LEVEL_CHECK_CANCEL_MINUTES = 50;

/**
 * Words that give a level away. Feedback goes to the student, so the teacher
 * is warned (not blocked) if it contains any of these.
 */
export const LEVEL_WORDS = /\b(BRELAS|level|rating|B0|B1|B2|I1|I2|beginner\s*[0-2]|intermediate\s*[12]|advanced level|CEFR|pre-?A1|[ABC][12])\b/i;
