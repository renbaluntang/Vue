/**
 * Lesson materials belong to a student, not to a single lesson: a vowel drill
 * handed out in week one is still the thing they practise in week six. So they
 * are keyed by student id and every lesson with that student shows the same
 * shelf.
 *
 * The instructor portal and the student portal are separate app mounts with
 * separate Pinia stores, so they cannot share runtime state. Seeding both from
 * this one module is what keeps the demo consistent: what Taro sees in his
 * portal is what his instructor sees against his name.
 */

/** How a material opens, and how it is labelled and coloured wherever it appears. */
export const MATERIAL_KINDS = {
  pdf: { label: 'PDF', icon: 'fa-regular fa-file-pdf', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  doc: { label: 'Document', icon: 'fa-regular fa-file-lines', chip: 'bg-sky-50 text-sky-700 ring-sky-200' },
  slides: { label: 'Slides', icon: 'fa-regular fa-file-powerpoint', chip: 'bg-amber-50 text-amber-800 ring-amber-200' },
  audio: { label: 'Audio', icon: 'fa-solid fa-headphones', chip: 'bg-violet-50 text-violet-700 ring-violet-200' },
  video: { label: 'Video', icon: 'fa-solid fa-film', chip: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  link: { label: 'Link', icon: 'fa-solid fa-link', chip: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

export const MATERIAL_KIND_OPTIONS = Object.entries(MATERIAL_KINDS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const materialKind = (kind) => MATERIAL_KINDS[kind] ?? MATERIAL_KINDS.link;

/** Student ids match the ones the instructor portal uses in its lesson log. */
export const SEED_MATERIALS = {
  21: [
    {
      id: 'm-2101',
      title: 'Cross-border negotiation phrasebook',
      kind: 'pdf',
      subject: '[SF] Speech Fluency',
      note: 'Pages 4–7 are the linking phrases we drilled.',
      url: 'https://example.com/materials/negotiation-phrasebook.pdf',
      addedOn: 'Sep 1, 2026',
      addedBy: 'Jirvy Dela Torre',
    },
    {
      id: 'm-2102',
      title: 'Vowel pairs — /ɪ/ vs /iː/ listening set',
      kind: 'audio',
      subject: '[PP101] Pronunciation',
      note: 'Three minutes a night before sleep.',
      url: 'https://example.com/materials/vowel-pairs.mp3',
      addedOn: 'Aug 16, 2026',
      addedBy: 'Jane Pasanting',
    },
    {
      id: 'm-2103',
      title: 'Business email openings and sign-offs',
      kind: 'doc',
      subject: '[RW] Reading & Writing',
      note: '',
      url: 'https://example.com/materials/email-openings.docx',
      addedOn: 'Aug 12, 2026',
      addedBy: 'Analyn Yosores',
    },
  ],
  34: [
    {
      id: 'm-3401',
      title: 'Self-introduction template',
      kind: 'doc',
      subject: '[DC] Daily Conversation',
      note: 'Fill in the blanks before the next lesson.',
      url: 'https://example.com/materials/self-intro-template.docx',
      addedOn: 'Aug 31, 2026',
      addedBy: 'Jirvy Dela Torre',
    },
  ],
  45: [
    {
      id: 'm-4501',
      title: 'IELTS Task 2 — essay structures',
      kind: 'slides',
      subject: '[RW] Reading & Writing',
      note: 'Compare the four-paragraph and five-paragraph plans.',
      url: 'https://example.com/materials/ielts-task2.pdf',
      addedOn: 'Sep 1, 2026',
      addedBy: 'Jirvy Dela Torre',
    },
  ],
};

/** A fresh copy, so one store's edits never reach through to another's seed. */
export const seedMaterials = () =>
  Object.fromEntries(
    Object.entries(SEED_MATERIALS).map(([id, items]) => [id, items.map((item) => ({ ...item }))])
  );
