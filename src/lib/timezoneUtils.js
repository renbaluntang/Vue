/**
 * Comprehensive timezone utilities for scheduling comparison and conversion.
 * Uses native Intl.DateTimeFormat for accurate daylight-saving and UTC calculations.
 */

export const MAJOR_TIMEZONES = [
  // Primary school & student regions
  { id: 'Asia/Manila', label: 'Manila (PHT)', city: 'Manila', country: 'Philippines', region: 'Asia', abbr: 'PHT' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)', city: 'Tokyo', country: 'Japan', region: 'Asia', abbr: 'JST' },
  { id: 'Asia/Seoul', label: 'Seoul (KST)', city: 'Seoul', country: 'South Korea', region: 'Asia', abbr: 'KST' },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)', city: 'Singapore', country: 'Singapore', region: 'Asia', abbr: 'SGT' },
  { id: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia', abbr: 'HKT' },
  { id: 'Asia/Taipei', label: 'Taipei (CST)', city: 'Taipei', country: 'Taiwan', region: 'Asia', abbr: 'CST' },
  { id: 'Asia/Bangkok', label: 'Bangkok (ICT)', city: 'Bangkok', country: 'Thailand', region: 'Asia', abbr: 'ICT' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', abbr: 'GST' },
  { id: 'Asia/Kolkata', label: 'India (IST)', city: 'New Delhi', country: 'India', region: 'Asia', abbr: 'IST' },

  // Americas
  { id: 'America/New_York', label: 'New York (ET)', city: 'New York', country: 'United States', region: 'Americas', abbr: 'ET' },
  { id: 'America/Chicago', label: 'Chicago (CT)', city: 'Chicago', country: 'United States', region: 'Americas', abbr: 'CT' },
  { id: 'America/Denver', label: 'Denver (MT)', city: 'Denver', country: 'United States', region: 'Americas', abbr: 'MT' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT)', city: 'Los Angeles', country: 'United States', region: 'Americas', abbr: 'PT' },
  { id: 'America/Toronto', label: 'Toronto (ET)', city: 'Toronto', country: 'Canada', region: 'Americas', abbr: 'ET' },
  { id: 'America/Vancouver', label: 'Vancouver (PT)', city: 'Vancouver', country: 'Canada', region: 'Americas', abbr: 'PT' },
  { id: 'America/Sao_Paulo', label: 'São Paulo (BRT)', city: 'São Paulo', country: 'Brazil', region: 'Americas', abbr: 'BRT' },

  // Europe
  { id: 'Europe/London', label: 'London (GMT/BST)', city: 'London', country: 'United Kingdom', region: 'Europe', abbr: 'UK' },
  { id: 'Europe/Paris', label: 'Paris (CET/CEST)', city: 'Paris', country: 'France', region: 'Europe', abbr: 'CET' },
  { id: 'Europe/Berlin', label: 'Berlin (CET/CEST)', city: 'Berlin', country: 'Germany', region: 'Europe', abbr: 'CET' },
  { id: 'Europe/Madrid', label: 'Madrid (CET/CEST)', city: 'Madrid', country: 'Spain', region: 'Europe', abbr: 'CET' },

  // Oceania
  { id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', city: 'Sydney', country: 'Australia', region: 'Oceania', abbr: 'AEST' },
  { id: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)', city: 'Melbourne', country: 'Australia', region: 'Oceania', abbr: 'AEST' },
  { id: 'Australia/Perth', label: 'Perth (AWST)', city: 'Perth', country: 'Australia', region: 'Oceania', abbr: 'AWST' },
  { id: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', city: 'Auckland', country: 'New Zealand', region: 'Oceania', abbr: 'NZST' },

  // Universal
  { id: 'UTC', label: 'Coordinated Universal Time (UTC)', city: 'UTC', country: 'Global', region: 'Global', abbr: 'UTC' },
];

/**
 * Normalizes an IANA timezone identifier from a user profile or string.
 * Example: "Asia/Manila (PHT)" -> "Asia/Manila"
 */
export function normalizeTimeZone(tz) {
  if (!tz) return 'Asia/Manila';
  const cleaned = tz.replace(/\s*\(.*?\)\s*$/, '').trim();
  const found = MAJOR_TIMEZONES.find((t) => t.id.toLowerCase() === cleaned.toLowerCase());
  return found ? found.id : cleaned;
}

/**
 * Gets timezone information object by ID.
 */
export function getTimeZoneInfo(tzId) {
  const norm = normalizeTimeZone(tzId);
  const match = MAJOR_TIMEZONES.find((t) => t.id === norm);
  if (match) return match;
  const city = norm.split('/').pop().replace(/_/g, ' ');
  return {
    id: norm,
    label: `${city} (${norm})`,
    city,
    country: '',
    region: 'Other',
    abbr: city.slice(0, 3).toUpperCase(),
  };
}

/**
 * Calculates current UTC offset in minutes for a timezone at a specific reference date.
 */
export function getUtcOffsetMinutes(tzId, date = new Date()) {
  try {
    const str = new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      timeZoneName: 'longOffset',
    }).format(date);
    const match = str.match(/GMT([+-]\d{1,2})(:(\d{2}))?/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const mins = match[3] ? parseInt(match[3], 10) : 0;
    return hours * 60 + (hours >= 0 ? mins : -mins);
  } catch (e) {
    return 0;
  }
}

/**
 * Calculates difference in hours/minutes between target timezone and base timezone.
 * Returns { totalMinutes, hoursDiff, formattedDiff, isAhead, isBehind, isSame }
 */
export function calculateTimeDifference(baseTzId, targetTzId, date = new Date()) {
  const baseOffset = getUtcOffsetMinutes(baseTzId, date);
  const targetOffset = getUtcOffsetMinutes(targetTzId, date);
  const diffMinutes = targetOffset - baseOffset;
  const diffHours = diffMinutes / 60;

  if (diffMinutes === 0) {
    return {
      diffMinutes: 0,
      diffHours: 0,
      formattedDiff: 'Same time',
      shortDiff: '±0h',
      isAhead: false,
      isBehind: false,
      isSame: true,
    };
  }

  const sign = diffMinutes > 0 ? '+' : '-';
  const absMinutes = Math.abs(diffMinutes);
  const wholeHours = Math.floor(absMinutes / 60);
  const remMinutes = absMinutes % 60;

  let formatted = `${sign}${wholeHours}h`;
  if (remMinutes > 0) {
    formatted += ` ${remMinutes}m`;
  }
  const descriptor = diffMinutes > 0 ? 'ahead' : 'behind';

  return {
    diffMinutes,
    diffHours,
    formattedDiff: `${formatted} ${descriptor}`,
    shortDiff: formatted,
    isAhead: diffMinutes > 0,
    isBehind: diffMinutes < 0,
    isSame: false,
  };
}

/**
 * Converts a slot time string (e.g. "09:00" in base timezone) into the target timezone.
 * Returns { time24: '10:00', time12: '10:00 AM', dayShift: 0 | 1 | -1, periodOfDay: 'morning'|'afternoon'|'evening'|'night' }
 */
export function convertSlotTime(slotTimeStr, baseTzId, targetTzId, referenceDate = new Date()) {
  const [baseH, baseM] = slotTimeStr.split(':').map(Number);
  const baseOffset = getUtcOffsetMinutes(baseTzId, referenceDate);
  const targetOffset = getUtcOffsetMinutes(targetTzId, referenceDate);
  const diffMinutes = targetOffset - baseOffset;

  let totalMinutes = baseH * 60 + (baseM || 0) + diffMinutes;
  let dayShift = 0;

  while (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    dayShift -= 1;
  }
  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    dayShift += 1;
  }

  const targetH = Math.floor(totalMinutes / 60);
  const targetM = totalMinutes % 60;

  const time24 = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`;
  
  const h12 = targetH % 12 === 0 ? 12 : targetH % 12;
  const ampm = targetH >= 12 ? 'PM' : 'AM';
  const time12 = `${h12}:${String(targetM).padStart(2, '0')} ${ampm}`;

  let periodOfDay = 'morning';
  if (targetH >= 6 && targetH < 12) periodOfDay = 'morning';
  else if (targetH >= 12 && targetH < 17) periodOfDay = 'afternoon';
  else if (targetH >= 17 && targetH < 21) periodOfDay = 'evening';
  else periodOfDay = 'night';

  return {
    time24,
    time12,
    hour: targetH,
    minute: targetM,
    dayShift,
    dayShiftLabel: dayShift === 1 ? '+1d' : dayShift === -1 ? '-1d' : '',
    periodOfDay,
  };
}

/**
 * Returns formatted current time in the given timezone.
 */
export function getCurrentTimeInZone(tzId, date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return '--:--';
  }
}
