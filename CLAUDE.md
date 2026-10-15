# Brighture portals (Vue 3 prototype)

One Vite app that serves several front-end prototypes for Brighture, an online English school. The two that matter are the **student portal** (`/student-portal`) and the **teacher portal** (`/teacher-portal`). There is no backend: everything runs on seeded data in Pinia stores.

## Commands

- `npm run dev`: dev server (binds 0.0.0.0, allows `*.trycloudflare.com` hosts).
- `npx vite build`: the only automated check. There are no tests or linter, so run a build after every change.
- Production builds for GitHub Pages need `BASE_PATH=/Vue/`.

## How a URL becomes a portal

`src/main.js` strips the base path, then picks a root component and router by prefix:

| Prefix | Router | Pages | Layout |
|---|---|---|---|
| `/student-portal` | `router/index.js` | `pages/portal/` | `components/layout/PortalLayout.vue` |
| `/teacher-portal` | `router/teacher.js` | `pages/teacher-portal/` | `components/layout/TeacherPortalLayout.vue` |
| `/student-portal-classic` | `router/classic.js` | `pages/portal-classic/` | `PortalLayoutClassic.vue` |
| `/student-portal-v2`, `/student-5` | `router/minimal.js` | `pages/portal-minimal/` | `PortalMinimalLayout.vue` |

Other paths (`/login`, `/points-purchase`, `/student-2..4`, the legacy `/teacher` panel) mount standalone pages without a router. Classic and minimal are older variants. Keep them compiling, but new work goes into the main student portal.

## Data: one shared store, two portals

- **`src/stores/useSchoolStore.js` is the source of truth** for everything both sides see:
  - lessons (bookings, cancellations, feedback, ratings)
  - writing tickets
  - materials, and which ones a lesson needs reviewed first
  - message threads
  - exams and submissions
  - points wallets
  - the teacher's weekly availability
- It persists to `localStorage` (`brighture:school:v1`) and listens for `storage` events, so the two portals stay in sync across tabs in the same browser.
- **Settings → Reset demo data** in both portals calls `resetDemo()`.
- **`useUserStore` (student) and `useTeacherStore` (teacher) are views over it.** They keep their older public shapes (`nextUpcomingClass`, `pastLessons`, `reservations`, `lessonLog`, `writingTasks`, and so on) because many pages and the classic/minimal variants read them. Change data through the shared store's actions, not by mutating derived rows.
- **Seed data:** `src/lib/schoolSeed.js`.
  - The signed-in users are `CURRENT_STUDENT_ID = 21` (Taro Yamada) and `CURRENT_TEACHER_ID = 184` (Jirvy Dela Torre).
  - Teacher ids are the teacher-image keys (`lib/teacherImages.js`), the same as `imageKey` in `pages/student-view-v4/constants.js`.
  - If you change the shape of stored data, bump `SEED_VERSION`; old saved data is then discarded.
- **Analytics** (`useTeacherStore.analytics`) and student `stats`/`badges` are still static sample data.

## Time

- **Storage:** every timestamp in the shared store is a UTC ISO string. Seeds are written as Manila wall-clock times relative to an anchor day. Whenever the store opens on a later day, it shifts every date forward by the same number of days (`shiftAll`), so "tonight's lesson" is always tonight. Add any new timestamp field to `shiftAll`.
- **Display:** use `src/lib/schoolTime.js`.
  - The teacher sees Manila (PHT).
  - The student sees Tokyo (JST).
  - Use `countdownLabel()` for "in 2h 15m" countdowns.
- **Teacher availability:** keyed `${day}-t${HHMM}` in 30-minute Manila slots. `isTeacherSlotOpen()` is what student booking and rescheduling check.

## Conventions

- Vue 3 `<script setup>`, Tailwind 3, Font Awesome 7. Import from `src` with `@/`.
- **Brand colours:** `brighture.gold #FFCD00` for fills, `brighture.bronze #8A6600` for gold-coloured text (gold is too light for text on white), and `brighture.ink`/`cream`.
- **Comments explain why**, in full sentences, like the existing code. Match the comment density of the file you're in.
- **Icons are flat Font Awesome icons, never emoji.** Google Meet buttons use `components/GoogleMeetIcon.vue`.
- **No blinking or pulsing status animations** (no `animate-ping` or `animate-pulse` on indicators). They were removed on purpose.
- **Pop-ups (modals):**
  - Pin them near the top (`items-start pt-6 sm:pt-12`), so switching tabs never moves the header.
  - Never use `window.alert`, `confirm` or `prompt`. Build a two-step confirm or a message into the page instead.
- **Notifications:** brief success or error messages go in a toast in the top-right corner, not in a banner that pushes the page down.
- **Lesson panels:** the teacher's student panel (`components/teacher/StudentDetailModal.vue`) and the student's class panel (`components/ClassDetailsModal.vue`) share a folder-tab design. Tab shape comes from a `clip-path`, left tabs sit over right ones, and arrow keys switch tabs. Keep the two consistent.
- Wording on screen speaks to the person using it ("Your message to the instructor"), not about the system.

## Git

Commit locally when asked; the user pushes themselves. Don't run `git push`.
