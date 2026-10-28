import { reactive, ref, watch } from 'vue';
import { MANILA, TOKYO, stampIn, dateIn, zoneAbbr } from '@/lib/schoolTime';
import { ASSESSMENT_TYPES, levelInfo } from '@/lib/brelas';

/**
 * Small pieces of state and formatting shared by the admin pages.
 *
 * The admin portal has no store of its own: every record lives in the shared
 * school store. What is here is purely about presentation — which clock the
 * admin reads times in, and the toast that confirms an action.
 */

const ZONE_KEY = 'brighture:admin:zone';

/**
 * The admin works with Japanese students and Philippine teachers, so times can
 * be read in either clock. Tokyo is the default because the school, its
 * students and the emails all speak JST. The choice is remembered per browser.
 */
export const displayZone = ref(
  (typeof localStorage !== 'undefined' && localStorage.getItem(ZONE_KEY) === MANILA) ? MANILA : TOKYO,
);
watch(displayZone, (z) => {
  try { localStorage.setItem(ZONE_KEY, z); } catch { /* private mode: keep it for this visit */ }
});

/** 'Oct 20, 2026 18:00 JST' in the admin's chosen clock. */
export const stamp = (iso) => (iso ? `${stampIn(iso, displayZone.value)} ${zoneAbbr(displayZone.value)}` : '—');
/** 'Oct 20, 2026' in the admin's chosen clock. */
export const day = (iso) => (iso ? dateIn(iso, displayZone.value) : '—');

/**
 * One toast at a time, top-right. A newer message replaces the older one
 * rather than stacking, because each confirms the action just taken.
 */
export const toast = reactive({ id: 0, message: '', tone: 'success' });
let toastTimer = null;
export const showToast = (message, tone = 'success') => {
  toast.id += 1;
  toast.message = message;
  toast.tone = tone;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.message = ''; }, 3600);
};
export const dismissToast = () => { toast.message = ''; };

/** Chip colours per assessment type, so TA / CS / FA read apart at a glance. */
export const TYPE_STYLES = {
  TA: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CS: 'bg-sky-50 text-sky-700 ring-sky-200',
  FA: 'bg-brighture-cream text-brighture-bronze ring-brighture-gold/50',
};
export const typeLabel = (code) => ASSESSMENT_TYPES[code]?.label ?? code;

export const STATUS_STYLES = {
  scheduled: 'bg-slate-100 text-slate-600 ring-slate-200',
  draft: 'bg-amber-50 text-amber-800 ring-amber-200',
  submitted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};
export const STATUS_LABELS = { scheduled: 'Scheduled', draft: 'Draft', submitted: 'Submitted' };

/** Who changed a level, in words an admin reads at a glance. */
export const BY_KIND = {
  migration: { label: 'Migration', style: 'bg-slate-100 text-slate-600 ring-slate-200', icon: 'fa-solid fa-database' },
  teacher: { label: 'Teacher', style: 'bg-sky-50 text-sky-700 ring-sky-200', icon: 'fa-solid fa-chalkboard-user' },
  admin: { label: 'Admin', style: 'bg-brighture-cream text-brighture-bronze ring-brighture-gold/50', icon: 'fa-solid fa-user-shield' },
};

/** Field types a template can use, in the order the builder offers them. */
export const FIELD_TYPES = [
  { value: 'rating', label: 'Rating scale', icon: 'fa-solid fa-star-half-stroke', hasOptions: true, hint: 'One choice from an ordered scale, best first.' },
  { value: 'select', label: 'Single choice', icon: 'fa-solid fa-circle-dot', hasOptions: true, hint: 'One choice from a dropdown.' },
  { value: 'multiselect', label: 'Multiple choice', icon: 'fa-solid fa-list-check', hasOptions: true, hint: 'Any number of choices.' },
  { value: 'text', label: 'Short text', icon: 'fa-solid fa-font', hasMax: true, hint: 'One line.' },
  { value: 'longtext', label: 'Long text', icon: 'fa-solid fa-align-left', hasMax: true, hint: 'A paragraph or more.' },
  { value: 'checkbox', label: 'Yes / no', icon: 'fa-solid fa-square-check', hint: 'A single tick box.' },
];
export const fieldType = (value) => FIELD_TYPES.find((t) => t.value === value) ?? FIELD_TYPES[3];

/** Short random id for new sections and questions. Answers are keyed by it, so it never changes once saved. */
export const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Sort key for a stored rating: highest first when sorted descending. B0 sits
 * below rating 1 (assessed, no foundation), and Unassessed below everything.
 */
export const ratingSortKey = (value) => (value === null || value === undefined ? -1 : value === 'B0' ? 0 : Number(value));

/** 'B2 · Satisfactory (5)', 'B0' or 'Unassessed': a rating in one line, for history rows and toasts. */
export const ratingText = (value) => {
  const info = levelInfo(value);
  return info.rating ? `${info.display} (${info.rating})` : info.display;
};
