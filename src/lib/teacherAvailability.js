// When a catalogue teacher can next be booked, worked out the same way the
// booking page's calendar does: the sample availability pattern, checked
// against the shared store so a published board or an existing booking wins.
// Kept here rather than in a page so the dashboard and the booking page can't
// disagree about a teacher's next free time.
import { partsIn, tokyoAt, TOKYO, minutesUntil } from '@/lib/schoolTime';
import { BOOKING_DAYS, BOOKING_TIME_SLOTS, getSlotStatus, formatSlotTo12Hour } from '@/pages/student-view-v4/constants';

/** Tokyo calendar date `offset` days from today, as 'YYYY-MM-DD'. The grid times are JST. */
const tokyoDayIso = (offset) => {
  const p = partsIn(new Date().toISOString(), TOKYO);
  return new Date(Date.UTC(p.year, p.month, p.day + offset)).toISOString().slice(0, 10);
};

/** The instant a booking-grid cell starts at. */
export const slotStartIso = (dayIndex, slotIndex) => tokyoAt(tokyoDayIso(dayIndex), BOOKING_TIME_SLOTS[slotIndex]);

/**
 * Whether a booking-grid cell is open for this catalogue teacher. The sample
 * pattern only decides for teachers who have not published their own board.
 */
export const isCatalogueSlotOpen = (school, teacher, dayIndex, slotIndex) => {
  const mock = getSlotStatus(teacher.id, dayIndex, slotIndex);
  if (!teacher.imageKey) return mock === 'Available';
  return school.isTeacherSlotOpen(teacher.imageKey, slotStartIso(dayIndex, slotIndex), 30, mock === 'Available');
};

/**
 * The first open 30-minute slot in the next two weeks, as
 * { iso, label } with a label like 'Today, 8:00 PM JST', or null if none.
 */
export const nextOpenSlot = (school, teacher) => {
  for (let day = 0; day < BOOKING_DAYS.length; day += 1) {
    for (let slot = 0; slot < BOOKING_TIME_SLOTS.length; slot += 1) {
      if (!isCatalogueSlotOpen(school, teacher, day, slot)) continue;
      const iso = slotStartIso(day, slot);
      if (minutesUntil(iso) <= 0) continue;
      const dayLabel = day === 0
        ? 'Today'
        : day === 1
          ? 'Tomorrow'
          : new Date(`${tokyoDayIso(day)}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { iso, label: `${dayLabel}, ${formatSlotTo12Hour(BOOKING_TIME_SLOTS[slot])} JST` };
    }
  }
  return null;
};
