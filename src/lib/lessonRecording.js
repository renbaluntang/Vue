/**
 * Lesson recordings.
 *
 * Recording needs the student's permission. The teacher presses Record in
 * Google Meet by hand; Meet saves the file in the teacher's own Drive, and in
 * the real system the backend then moves it into the shared drive, renames it
 * and links it to the lesson. Here the store holds the result of that step.
 *
 * Shared by both portals. Nothing here mentions the student's level.
 */
import { partsIn, MANILA } from '@/lib/schoolTime';

/** How long the portal shows a recording's link after the lesson. */
export const RECORDING_LINK_DAYS = 30;

const pad = (n) => String(n).padStart(2, '0');

/** "SF" from "[SF] Speech Fluency". */
const subjectCode = (subject) => (String(subject).match(/^\[([^\]]+)\]/)?.[1] ?? 'Lesson').replace(/\d+$/, '');

/**
 * Where the backend files it: the teacher's folder, then the student's ID.
 * Teacher first so each folder can be shared with its teacher in one step;
 * the file name starts with the date, so no month folder is needed.
 */
export const recordingFolder = (teacher, student) =>
  `Lesson Recordings / ${teacher.name} (${teacher.id}) / ${student.id}`;

/** "2026-11-11 1900 · Taro Yamada (21) · SF", so the drive sorts by date. */
export const recordingFileName = (lesson, student) => {
  const p = partsIn(lesson.start, MANILA);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)} ${pad(p.hour)}${pad(p.minute)} · ${student.name} (${student.id}) · ${subjectCode(lesson.subject)}`;
};

/**
 * What a past lesson shows:
 * - 'recorded'    the file is filed and the link is still shown
 * - 'expired'     filed, but older than RECORDING_LINK_DAYS, so the link is gone
 * - 'processing'  ended in the last 3 hours with permission and no file yet,
 *                 since Google can take a while to process a video
 * - 'none'        no recording arrived
 * null for lessons that did not take place.
 */
export const recordingState = (lesson, student, now = Date.now()) => {
  if (!lesson || lesson.status !== 'completed') return null;
  const ended = new Date(lesson.start).getTime() + lesson.duration * 60_000;
  if (lesson.recording?.url) {
    return now - ended > RECORDING_LINK_DAYS * 86_400_000 ? 'expired' : 'recorded';
  }
  if (student?.recordingConsent && now > ended && now - ended < 3 * 3_600_000) return 'processing';
  return 'none';
};
