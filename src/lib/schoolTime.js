/**
 * Time helpers for the shared school data.
 *
 * Every moment in the shared store is a UTC ISO string. Each portal projects it
 * into the clock it shows: the instructor's Manila time, the school's Tokyo
 * time, or the student's own zone. Manila and Tokyo have no daylight saving, so
 * seeds can be written as fixed offsets.
 */

export const MANILA = 'Asia/Manila';
export const TOKYO = 'Asia/Tokyo';
const MANILA_OFFSET_MIN = 8 * 60;
const DAY_MS = 86_400_000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Normalises labels like 'Asia/Tokyo (JST)' to an IANA id. */
export const zoneId = (tz) => String(tz || TOKYO).split(' ')[0];

/** Calendar parts of an instant in a zone. */
export const partsIn = (iso, tz) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zoneId(tz),
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(iso));
  const at = (type) => parts.find((p) => p.type === type)?.value ?? '0';
  const hour = Number(at('hour')) % 24;
  return {
    year: Number(at('year')),
    month: Number(at('month')) - 1,
    day: Number(at('day')),
    hour,
    minute: Number(at('minute')),
  };
};

const pad = (n) => String(n).padStart(2, '0');

/** 'Sep 2, 2026 18:00' — the stamp format the instructor portal parses. */
export const stampIn = (iso, tz) => {
  const p = partsIn(iso, tz);
  return `${MONTHS[p.month]} ${p.day}, ${p.year} ${pad(p.hour)}:${pad(p.minute)}`;
};

/** 'Aug 19, 2026' */
export const dateIn = (iso, tz) => {
  const p = partsIn(iso, tz);
  return `${MONTHS[p.month]} ${pad(p.day)}, ${p.year}`;
};

/** '7:00 PM' */
export const clockIn = (iso, tz) => {
  const p = partsIn(iso, tz);
  return `${p.hour % 12 || 12}:${pad(p.minute)} ${p.hour < 12 ? 'AM' : 'PM'}`;
};

/** '7:00 PM - 7:30 PM' */
export const rangeIn = (iso, minutes, tz, sep = ' - ') =>
  `${clockIn(iso, tz)}${sep}${clockIn(addMinutes(iso, minutes), tz)}`;

/** Short zone name: 'JST', 'PHT', or 'GMT+1' style for others. */
export const zoneAbbr = (tz) => {
  const id = zoneId(tz);
  if (id === TOKYO) return 'JST';
  if (id === MANILA) return 'PHT';
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: id, timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value ?? id;
  } catch {
    return id;
  }
};

/** '(UTC +09:00) Tokyo' — the student-clock suffix the legacy portal shows. */
export const utcLabel = (tz) => {
  const id = zoneId(tz);
  let offset = 0;
  try {
    const name = new Intl.DateTimeFormat('en-US', { timeZone: id, timeZoneName: 'longOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
    const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
    if (m) offset = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
  } catch { /* keep 0 */ }
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  return `(UTC ${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}) ${id.split('/').pop().replace(/_/g, ' ')}`;
};

export const addMinutes = (iso, minutes) => new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
export const addDays = (iso, days) => new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();

/** Whole minutes from now until the instant (negative once it has passed). */
export const minutesUntil = (iso, now = Date.now()) => Math.round((new Date(iso).getTime() - now) / 60_000);

/** Today's date in Manila as 'YYYY-MM-DD'. */
export const manilaToday = (now = Date.now()) => {
  const p = partsIn(new Date(now).toISOString(), MANILA);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
};

/** Days between two 'YYYY-MM-DD' dates (b - a). */
export const dayDiff = (a, b) => {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
};

/**
 * A Manila wall-clock time on a day relative to an anchor date, as UTC ISO.
 * at('2026-10-14', 0, '18:00') -> the instant it is 18:00 in Manila that day.
 */
export const manilaAt = (anchorIso, dayOffset, hhmm) => {
  const [y, m, d] = anchorIso.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dayOffset, hh, mm) - MANILA_OFFSET_MIN * 60_000).toISOString();
};

/** The instant a Tokyo wall-clock time on a 'YYYY-MM-DD' date falls at. */
export const tokyoAt = (dateIso, hhmm) => {
  const [y, m, d] = dateIso.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - 9 * 60 * 60_000).toISOString();
};

/** Manila weekday key ('sun'…'sat') and minute-of-day for an instant. */
export const manilaSlotOf = (iso) => {
  const p = partsIn(iso, MANILA);
  const dow = new Date(Date.UTC(p.year, p.month, p.day)).getUTCDay();
  return {
    dateIso: `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`,
    dayKey: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dow],
    minutes: p.hour * 60 + p.minute,
  };
};

/** Sunday that starts the (Manila) week containing a 'YYYY-MM-DD' date. */
export const weekStartIso = (dateIso) => {
  const [y, m, d] = dateIso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() - t.getUTCDay());
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};

/** 't0930' for minute-of-day 570. */
export const slotKeyFor = (mins) => `t${pad(Math.floor(mins / 60) % 24)}${pad(mins % 60)}`;

/** Relative label for chat lists: 'Just now', '5m', '3h', 'Yesterday', 'Oct 2'. */
export const relativeLabel = (iso, now = Date.now()) => {
  const mins = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (mins < 24 * 60) return `${Math.floor(mins / 60)}h`;
  if (mins < 48 * 60) return 'Yesterday';
  const p = partsIn(iso, TOKYO);
  return `${MONTHS[p.month]} ${p.day}`;
};

/** Countdown text: '28m', '7h 20m', '1d 4h'. Negative counts as '0m'. */
export const countdownLabel = (minutes) => {
  const m = Math.max(0, Math.round(minutes ?? 0));
  if (m < 60) return `${m}m`;
  if (m < 24 * 60) return m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${Math.floor(m / 60)}h`;
  const h = Math.floor((m % (24 * 60)) / 60);
  return h ? `${Math.floor(m / 1440)}d ${h}h` : `${Math.floor(m / 1440)}d`;
};
