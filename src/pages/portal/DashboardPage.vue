<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
    <!-- Top-level orientation: concise, dated, and action-led. -->
    <section class="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
      <div class="space-y-1.5">
        <img :src="brightureLogo" alt="Brighture" class="h-5 sm:h-6 w-auto" />
        <div class="flex items-baseline gap-3 flex-wrap">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
            Learning overview
          </h1>
          <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">This week</span>
        </div>
        <p class="text-sm text-slate-500 font-medium">
          {{ user.profile.firstName }}, your next class and weekly progress are ready to review.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto lg:shrink-0">
        <RouterLink
          to="/booking"
          class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[#FFCD00] text-black font-bold text-[13px] sm:text-sm leading-tight text-center hover:bg-[#FFD933] active:scale-[0.98] transition-all"
        >
          <i class="fa-solid fa-calendar-days shrink-0" aria-hidden="true"></i> <span>Book Online Class</span>
        </RouterLink>

        <button
          data-tour="talk-now"
          @click="showFreeConversationModal = true"
          class="relative group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-slate-950 text-white font-bold text-[13px] sm:text-sm leading-tight text-center hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <span class="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full shadow-md">
            Instant
          </span>
          <i class="fa-solid fa-bolt shrink-0 text-[#FFCD00]" aria-hidden="true"></i> <span>Talk Now</span>
        </button>

      </div>
    </section>

    <!-- Subscription reminder: from five days out until it is renewed, and
         stronger once it has lapsed. Dismissing hides it for this visit only,
         so it is back on the next one while the date still stands. -->
    <!-- Subscription reminder: from five days out until it is renewed, and
         stronger once it has lapsed. Dismissing hides it for this visit only,
         so it is back on the next one while the date still stands. -->
    <div
      v-if="showRenewalReminder"
      role="status"
      class="group relative flex flex-col gap-3.5 sm:gap-4 overflow-hidden rounded-[20px] sm:rounded-[22px] bg-gradient-to-r from-[#3e47c9] via-[#4852d4] to-[#515ee0] px-4 py-3 sm:px-6 sm:py-3.5 text-white shadow-lg shadow-indigo-600/20 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 border border-white/10"
    >
      <!-- Subtle ambient background glow and glossy gradient overlay -->
      <div class="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl"></div>
      <div class="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-white/[0.08] to-transparent"></div>

      <!-- Left content: Coins icon + message -->
      <div class="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div class="relative shrink-0 flex items-center justify-center">
          <img
            :src="coinsImage"
            alt="Subscription Coins"
            class="h-10 sm:h-11 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <p class="min-w-0 text-[13px] sm:text-sm font-medium leading-normal text-indigo-50/95 tracking-[-0.01em]">
          <template v-if="user.subscriptionDaysLeft < 0">
            Your subscription <strong class="font-extrabold text-white">has ended</strong>. Renew it to keep booking classes.
          </template>
          <template v-else-if="user.subscriptionDaysLeft === 0">
            Your subscription <strong class="font-extrabold text-white">ends today</strong>. Renew it to keep booking classes.
          </template>
          <template v-else>
            Your subscription ends in
            <strong class="font-extrabold text-white">{{ user.subscriptionDaysLeft }} day{{ user.subscriptionDaysLeft === 1 ? '' : 's' }}</strong>.
            Renew it to keep booking classes.
          </template>
        </p>
      </div>

      <!-- Right actions: Pill button + close mark -->
      <div class="relative z-10 flex shrink-0 items-center justify-end gap-2.5 sm:gap-3">
        <RouterLink
          to="/purchase"
          class="inline-flex items-center justify-center rounded-full bg-white px-5 sm:px-6 py-2 text-[13px] sm:text-sm font-extrabold text-[#3b44c4] shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          Renew
        </RouterLink>
        <button
          type="button"
          @click="renewalReminderDismissed = true"
          class="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white cursor-pointer active:scale-95"
          aria-label="Dismiss reminder"
        >
          <i class="fa-solid fa-xmark text-xs sm:text-sm"></i>
        </button>
      </div>
    </div>

    <!-- The week is the dashboard's one primary metric; the rest is supporting evidence. -->
    <section aria-label="Learning progress" class="border-y border-slate-200 py-3.5 sm:py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.6fr))] gap-4 lg:gap-0">
      <div class="lg:pr-8">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Weekly class goal</p>
            <p class="mt-1 text-3xl sm:text-4xl font-black tracking-[-0.06em] tabular-nums text-slate-950 leading-none">
              {{ user.stats.weeklyGoalMet }}<span class="text-slate-300">/{{ user.stats.weeklyGoalTotal }}</span>
            </p>
          </div>
          <p class="max-w-[13rem] text-right text-xs leading-4 font-medium text-slate-500">
            {{ user.stats.weeklyGoalTotal - user.stats.weeklyGoalMet }} more class{{ user.stats.weeklyGoalTotal - user.stats.weeklyGoalMet === 1 ? '' : 'es' }} completes your target for {{ weekRangeLabel }}.
          </p>
        </div>
        <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div class="h-full rounded-full bg-[#FFCD00]" :style="{ width: `${(user.stats.weeklyGoalMet / user.stats.weeklyGoalTotal) * 100}%` }"></div>
        </div>
      </div>
      <div class="lg:border-l lg:border-slate-200 lg:px-6">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Lessons completed</p>
        <p class="mt-0.5 text-xl font-extrabold tabular-nums tracking-tight text-slate-950">{{ user.stats.totalLessons }}</p>
        <p class="mt-0.5 text-xs text-slate-500">all time</p>
      </div>
      <div class="lg:border-l lg:border-slate-200 lg:px-6">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Attendance</p>
        <p class="mt-0.5 text-xl font-extrabold tabular-nums tracking-tight text-slate-950">{{ user.stats.attendanceRate }}%</p>
        <p class="mt-0.5 text-xs text-slate-500">last 90 days</p>
      </div>
      <div class="lg:border-l lg:border-slate-200 lg:pl-6">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Points available</p>
        <p class="mt-0.5 text-xl font-extrabold tabular-nums tracking-tight text-slate-950">{{ user.profile.pointsBalance }}</p>
        <RouterLink to="/points" class="mt-0.5 inline-block text-xs font-bold text-slate-600 hover:text-slate-950">View point history →</RouterLink>
      </div>
    </section>

    <!-- Result toast for reschedule / cancel / edit: pinned to the top right
         of the window, so it never pushes the page down. It closes itself
         after a few seconds, or on ✕. -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-6"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="opacity-0 translate-x-6"
      >
        <div
          v-if="rescheduleSuccessNotice"
          role="status"
          aria-live="polite"
          class="fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl"
          :class="noticeIsError ? 'border-rose-200' : 'border-emerald-200'"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            :class="noticeIsError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
          >
            <i :class="noticeIsError ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-check'"></i>
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <p class="text-xs font-black" :class="noticeIsError ? 'text-rose-800' : 'text-emerald-800'">
              {{ noticeIsError ? 'Something went wrong' : 'Done' }}
            </p>
            <p class="mt-0.5 text-xs sm:text-sm font-semibold leading-snug text-slate-700">
              {{ rescheduleSuccessNotice }}
            </p>
          </div>
          <button
            @click="rescheduleSuccessNotice = null"
            class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- MERGED & UNIFIED: SCHEDULED ONLINE CLASSES SECTION -->
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span>
          <h2 class="min-w-0 text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Scheduled Online Classes
          </h2>
          <span class="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-extrabold">
            {{ upcomingLessons.length }} Upcoming
          </span>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink to="/booking" class="text-xs font-bold text-brighture-bronze hover:text-brighture-bronze">
            + Book Another Class
          </RouterLink>
          <span class="text-slate-300">•</span>
          <RouterLink to="/history" class="text-xs font-bold text-slate-500 hover:text-slate-700">
            Past Lessons History →
          </RouterLink>
        </div>
      </div>

      <!-- Unified Card Container -->
      <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <!-- 1. FEATURED NEXT IMMEDIATE CLASS (SPOTLIGHT) -->
        <div
          v-if="user.nextUpcomingClass"
          class="relative overflow-hidden text-white p-6 sm:p-8 border-b border-slate-900/50 bg-[radial-gradient(115%_135%_at_90%_-12%,rgba(255,205,0,0.17)_0%,rgba(255,205,0,0.07)_26%,rgba(255,205,0,0.02)_44%,transparent_64%),radial-gradient(85%_115%_at_2%_108%,rgba(255,189,0,0.10)_0%,rgba(255,189,0,0.035)_32%,transparent_66%),linear-gradient(140deg,#0F1319_0%,#131925_24%,#161C26_48%,#111722_72%,#0A0D12_100%)]"
        >
          <!-- lit top edge, so the card reads as raised rather than cut out -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

          <div class="relative z-10 space-y-6">
            <!-- Status row -->
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                NEXT CLASS • STARTS IN {{ countdownLabel(user.nextUpcomingClass.minutesUntil).toUpperCase() }}
              </span>
              <span class="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                {{ user.nextUpcomingClass.timeFull }}
              </span>
              <!-- Pre-class materials. Within 3 hours of the start an unfinished
                   list turns solid amber so it is hard to miss. -->
              <button
                v-if="nextPrep.total"
                type="button"
                @click="openDetails(user.nextUpcomingClass)"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition"
                :class="nextPrepLeft === 0
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : user.nextUpcomingClass.minutesUntil <= 180
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                    : 'bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/40 hover:bg-amber-400/30'"
              >
                <i :class="nextPrepLeft === 0 ? 'fa-solid fa-circle-check' : 'fa-solid fa-book-open'" aria-hidden="true"></i>
                {{ nextPrepLeft === 0 ? 'Materials reviewed' : `${nextPrepLeft} material${nextPrepLeft === 1 ? '' : 's'} to review` }}
              </button>
            </div>

            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <!-- Teacher alongside the class it belongs to -->
              <div class="flex items-start gap-4 sm:gap-5 max-w-2xl">
                <button
                  type="button"
                  @click="openTeacherDetails({ name: user.nextUpcomingClass.teacherName, photo: user.nextUpcomingClass.teacherPhoto, specialty: '[SF] Speech Fluency, [LS1], [DC]', rating: '4.98', major: 'B.A. in English Linguistics', expertise: '[SF] Speech Fluency & [EP] Exam Prep' })"
                  class="group w-20 sm:w-24 shrink-0 text-center"
                  title="View teacher profile"
                >
                  <AppImage
                    :src="user.nextUpcomingClass.teacherPhoto"
                    :alt="user.nextUpcomingClass.teacherName"
                    eager
                    class="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full border-2 border-brighture-amber/70 transition group-hover:border-brighture-gold/50 group-hover:scale-105"
                  />
                  <span class="mt-2 block truncate text-xs font-bold text-white transition group-hover:text-brighture-gold">
                    {{ user.nextUpcomingClass.teacherName }}
                  </span>
                  <span class="block text-[11px] font-semibold text-brighture-gold transition group-hover:text-brighture-gold">
                    View profile →
                  </span>
                </button>

                <div class="min-w-0 pt-1">
                  <h3 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {{ user.nextUpcomingClass.subject }}
                  </h3>
                  <p class="text-brighture-gold text-sm font-medium mt-1.5">
                    Topic: <strong class="text-white">{{ user.nextUpcomingClass.topic }}</strong>
                  </p>
                  <span
                    v-if="user.nextUpcomingClass.isSubstitute"
                    class="mt-2.5 inline-flex items-center rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 ring-1 ring-amber-400/40"
                  >
                    Substitute teacher
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col justify-center gap-2 sm:gap-3 w-full lg:w-auto lg:self-center shrink-0">
                <a
                  :href="user.nextUpcomingClass.meetLink"
                  target="_blank"
                  rel="noopener"
                  @click="onEnterMeet"
                  class="inline-flex w-full items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap"
                >
                  <GoogleMeetIcon size="lg" /> Enter Google Meet
                </a>
                <button
                  type="button"
                  @click="openDetails(user.nextUpcomingClass)"
                  class="inline-flex w-full items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm sm:text-base transition border border-white/15 text-center whitespace-nowrap"
                >
                  <i class="fa-solid fa-circle-info" aria-hidden="true"></i> Class Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. SUBSEQUENT SCHEDULED LESSONS -->
        <div class="sched p-4 sm:p-6 bg-white space-y-4">
          <div class="flex items-center justify-between gap-2 pb-1 border-b border-slate-100/80">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider text-slate-500">Upcoming Lesson Schedule</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 border border-slate-200">
                {{ scheduledLessons.length }} {{ scheduledLessons.length === 1 ? 'lesson' : 'lessons' }} after this one
              </span>
            </div>
            <RouterLink
              to="/booking"
              class="text-[11px] font-bold text-brighture-bronze hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>+ Book another</span>
            </RouterLink>
          </div>

          <!-- Desktop Table View -->
          <div class="sched__table overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th class="py-3 px-4">Date & Time</th>
                  <th class="py-3 px-4">Online Teacher</th>
                  <th class="py-3 px-4">Subject & Class</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr
                  v-for="lesson in scheduledLessons"
                  :key="lesson.id"
                  class="transition-colors hover:bg-slate-50/70 group"
                  :class="lesson.isNext ? 'bg-brighture-cream/30' : ''"
                >
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span v-if="lesson.isNext" class="w-2 h-2 rounded-full bg-emerald-500" title="Next upcoming lesson"></span>
                      <div>
                        <div class="font-bold text-slate-800">{{ lesson.date }}</div>
                        <div class="text-slate-500 text-xs font-semibold mt-0.5">{{ lesson.time }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <button
                      type="button"
                      @click="openTeacherDetails({ name: lesson.teacherName, photo: lesson.teacherPhoto, specialty: lesson.subject, rating: '4.95' })"
                      class="flex items-center gap-3 text-left group/teacher cursor-pointer"
                      title="View teacher profile"
                    >
                      <AppImage
                        :src="lesson.teacherPhoto"
                        :alt="lesson.teacherName"
                        class="w-10 h-10 rounded-full ring-2 ring-white outline outline-1 outline-slate-200 shadow-2xs transition group-hover/teacher:outline-brighture-gold/50"
                      />
                      <span class="min-w-0">
                        <span class="block truncate font-bold text-slate-800 transition group-hover/teacher:text-brighture-bronze">
                          {{ lesson.teacherName }}
                        </span>
                        <span
                          v-if="lesson.isSubstitute"
                          class="mt-1 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200"
                        >
                          Substitute
                        </span>
                      </span>
                    </button>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-700">{{ lesson.subject }}</div>
                    <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">{{ lesson.classType }}</div>
                  </td>
                  <!-- Non-Wrapping Action Buttons -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <div class="inline-flex items-center justify-end gap-2 flex-nowrap">
                      <a
                        v-if="lesson.meetLink"
                        :href="lesson.meetLink"
                        target="_blank"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 hover:scale-105 active:scale-95 transition whitespace-nowrap flex-shrink-0 shadow-2xs cursor-pointer"
                      >
                        <GoogleMeetIcon size="md" />
                        <span>Join Meet</span>
                      </a>
                      <button
                        type="button"
                        @click="requestRescheduleFromDetails(lesson)"
                        class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 font-bold text-xs hover:bg-amber-100 hover:border-amber-300 active:scale-95 transition whitespace-nowrap flex-shrink-0 cursor-pointer shadow-2xs"
                        title="Reschedule class"
                      >
                        <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
                        <span>Reschedule</span>
                      </button>
                      <button
                        type="button"
                        @click="detailsLesson = lesson"
                        class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition whitespace-nowrap flex-shrink-0 cursor-pointer shadow-2xs"
                        title="View class details"
                      >
                        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                        <span>Details</span>
                      </button>
                      <button
                        type="button"
                        @click="cancelTargetLesson = lesson"
                        class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0 cursor-pointer"
                        title="Cancel class"
                        aria-label="Cancel class"
                      >
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Narrow / Mobile View: Restructured 2-line Thumb-Sized Stacked List (Never Horizontal Scroll or Chunky Disjointed Cards) -->
          <div class="sched__rows border border-slate-200/90 rounded-2xl overflow-hidden bg-white divide-y divide-slate-100 shadow-2xs">
            <div
              v-for="lesson in scheduledLessons"
              :key="lesson.id"
              class="transition-colors group"
              :class="[
                lesson.isNext ? 'bg-amber-50/20' : 'hover:bg-slate-50/70',
                isLessonOpen(lesson) ? 'bg-slate-50/40' : ''
              ]"
            >
              <!-- Collapsed / 2-Line Row Surface: Thumb-Sized Tap Target -->
              <div
                @click="toggleLesson(lesson.id)"
                @keydown.enter="toggleLesson(lesson.id)"
                @keydown.space.prevent="toggleLesson(lesson.id)"
                tabindex="0"
                role="button"
                :aria-expanded="isLessonOpen(lesson)"
                class="w-full py-3 px-3.5 sm:px-4 cursor-pointer select-none focus:outline-none focus:bg-slate-100/60 transition-colors"
              >
                <!-- Line 1: Identity Left (Teacher + Subject), Value Right (Time Slot) -->
                <div class="flex items-center justify-between gap-3">
                  <!-- Left: Teacher Name & Subject Identity -->
                  <div class="flex items-center gap-2 min-w-0">
                    <AppImage
                      :src="lesson.teacherPhoto"
                      :alt="lesson.teacherName"
                      class="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="font-extrabold text-sm text-slate-900 truncate">
                        {{ lesson.teacherName }}
                      </span>
                      <span class="text-xs text-slate-500 font-medium truncate">
                        · {{ lesson.subject }}
                      </span>
                    </div>
                  </div>

                  <!-- Right: Rigid Value / Time Slot with Tabular Figures -->
                  <div class="text-right shrink-0">
                    <span class="font-black text-sm text-slate-900 tabular-nums tracking-tight">
                      {{ startTime(lesson.time) }}
                    </span>
                  </div>
                </div>

                <!-- Line 2: Status & Due Date Underneath (Label the ambiguous) -->
                <div class="flex items-center justify-between gap-2 mt-1">
                  <!-- Left: Contextual Date + State Badges -->
                  <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span class="text-[11px] text-slate-600 font-medium">
                      <span class="text-slate-400 font-normal">Starts:</span> <strong class="text-slate-700 font-semibold">{{ lesson.date }}</strong>
                    </span>

                    <span
                      v-if="lesson.isSubstitute"
                      class="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200/70 shrink-0"
                    >
                      <i class="fa-solid fa-arrows-rotate text-[7px]"></i> Sub
                    </span>

                    <span
                      v-if="lesson.isNext"
                      class="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 border border-emerald-200 shrink-0"
                    >
                      Next up
                    </span>

                    <span
                      v-if="lesson.classType"
                      class="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate"
                    >
                      {{ lesson.classType }}
                    </span>
                  </div>

                  <!-- Right: Expand Affordance Chevron -->
                  <div class="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-slate-600 shrink-0">
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200"
                      :class="{ 'rotate-180 text-brighture-bronze': isLessonOpen(lesson) }"
                    ></i>
                  </div>
                </div>
              </div>

              <!-- Expanded In-Place Drawer: Hidden isn't deleted. Tap the row. Actions slide in. Two fields expand in place. A full record, never a new page for a glance -->
              <div
                v-if="isLessonOpen(lesson)"
                class="bg-slate-50/80 border-t border-slate-100 px-3.5 sm:px-4 py-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <!-- Two Fields Expand In Place -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <!-- Field 1: Curriculum & Instructor -->
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <div class="min-w-0">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Class Curriculum</span>
                      <span class="font-bold text-slate-800 truncate block">{{ lesson.subject }}</span>
                      <span class="text-[11px] text-slate-500 font-medium block mt-0.5">{{ lesson.classType || 'One-on-one session' }}</span>
                    </div>
                    <button
                      type="button"
                      @click.stop="openTeacherDetails({ name: lesson.teacherName, photo: lesson.teacherPhoto, specialty: lesson.subject, rating: '4.95' })"
                      class="ml-2 text-[11px] font-bold text-brighture-bronze hover:underline shrink-0 cursor-pointer"
                    >
                      Teacher Profile →
                    </button>
                  </div>

                  <!-- Field 2: Scheduled Time Range & Meet Room -->
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <div class="min-w-0">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Scheduled Time</span>
                      <span class="font-bold text-slate-800 tabular-nums block">{{ lesson.time }}</span>
                      <span class="text-[11px] text-slate-500 font-medium block mt-0.5">Google Meet Room Ready</span>
                    </div>
                    <span v-if="lesson.isNext" class="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                      Live Soon
                    </span>
                  </div>
                </div>

                <!-- Actions Slide In -->
                <div class="pt-1 flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-1.5 flex-1 min-w-0">
                    <button
                      type="button"
                      @click.stop="detailsLesson = lesson"
                      class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition cursor-pointer shadow-2xs"
                    >
                      <i class="fa-solid fa-circle-info" aria-hidden="true"></i> Details
                    </button>
                    <button
                      type="button"
                      @click.stop="requestRescheduleFromDetails(lesson)"
                      class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100 hover:border-amber-300 active:scale-95 transition cursor-pointer shadow-2xs"
                    >
                      <i class="fa-solid fa-calendar-days" aria-hidden="true"></i> Reschedule
                    </button>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <a
                      v-if="lesson.meetLink"
                      :href="lesson.meetLink"
                      target="_blank"
                      @click.stop
                      class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <GoogleMeetIcon size="md" /> Join Meet
                    </a>
                    <button
                      type="button"
                      @click.stop="cancelTargetLesson = lesson"
                      class="h-8 w-8 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                      title="Cancel class"
                      aria-label="Cancel class"
                    >
                      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-if="!scheduledLessons.length" class="py-6 text-center text-sm font-medium text-slate-400">
            Nothing else booked yet.
            <RouterLink to="/booking" class="font-bold text-brighture-bronze hover:underline">
              Book another class →
            </RouterLink>
          </p>
        </div>

        <!-- Cancellation & Changes Footnote -->
        <div class="bg-slate-50 p-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            * <strong class="text-slate-600">Cancellation:</strong> Free cancellation up to 3h before class starts (Points refunded).<br class="hidden sm:inline" />
            * <strong class="text-slate-600">Changes:</strong> Subject & message can be adjusted until 2h prior.
          </div>
          <RouterLink to="/booking" class="font-bold text-brighture-bronze hover:text-brighture-bronze whitespace-nowrap">
            Schedule More Classes →
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- QUICK EASY CLASS BOOKING SECTION (WITH EXACT SUBJECTS) -->
    <section class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-calendar-days text-[#E0A800]" aria-hidden="true"></i> Quick Online Class Booking
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Click any instructor photo to view full profile & voice sample.</p>
        </div>
        <RouterLink
          to="/booking"
          class="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
        >
          View Full Schedule Calendar (14 Days) →
        </RouterLink>
      </div>

      <!-- Quick Instructors Grid (Click photo -> Open Teacher Data Modal) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="instructor in quickInstructors"
          :key="instructor.id"
          class="border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition-colors flex flex-col justify-between bg-white group"
        >
          <div class="flex items-start gap-3">
            <!-- CLICKABLE TEACHER PHOTO -->
            <div
              @click="openTeacherDetails(instructor)"
              class="relative cursor-pointer flex-shrink-0"
              title="Click to view instructor profile"
            >
              <AppImage
                :src="instructor.photo"
                :alt="instructor.name"
                class="w-12 h-12 rounded-lg border border-slate-200 group-hover:scale-105 transition"
              />
            </div>

            <div class="min-w-0 flex-1">
              <h3
                @click="openTeacherDetails(instructor)"
                class="text-sm font-bold text-slate-900 truncate hover:text-brighture-bronze cursor-pointer"
              >
                {{ instructor.name }}
              </h3>
              <p class="text-[11px] text-slate-500 truncate">{{ instructor.specialty }}</p>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              @click="openTeacherDetails(instructor)"
              class="flex-1 inline-flex items-center justify-center px-2 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs whitespace-nowrap hover:bg-slate-100 transition"
            >
              View Info
            </button>
            <RouterLink
              to="/booking"
              class="flex-1 inline-flex items-center justify-center px-2 py-2 rounded-lg bg-[#FFCD00] border border-transparent text-black font-bold text-xs whitespace-nowrap hover:bg-[#FFD933] transition"
            >
              Book →
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- WRITING TASKS SECTION -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-5 rounded-full bg-brighture-gold"></span> In-Progress Writing Corrections
        </h2>
        <RouterLink to="/writing" class="text-xs font-bold text-brighture-bronze hover:text-brighture-bronze">
          Open Writing Chat →
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p
          v-if="!writingTasks.length"
          class="md:col-span-2 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-medium text-slate-400"
        >
          No corrections in progress.
          <RouterLink to="/writing" class="font-bold text-brighture-bronze hover:underline">Submit a passage →</RouterLink>
        </p>
        <div
          v-for="task in writingTasks"
          :key="task.id"
          class="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-colors group cursor-pointer flex flex-col justify-between"
          @click="$router.push('/writing')"
        >
          <div>
            <div class="flex justify-between items-start mb-2">
              <span :class="`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${task.statusColor}`">
                {{ task.status }}
              </span>
              <span class="text-xs text-slate-400 font-semibold">{{ task.date }}</span>
            </div>
            <h3 class="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{{ task.title }}</h3>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div class="flex items-center gap-2">
              <img v-if="task.teacherPhoto" :src="task.teacherPhoto" class="w-6 h-6 rounded-full object-cover" />
              <span v-else class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                <i class="fa-solid fa-hourglass-half"></i>
              </span>
              <span class="text-xs font-semibold text-slate-600">{{ task.teacherName || 'Waiting for an assessor' }}</span>
            </div>
            <span class="text-xs font-bold text-brighture-bronze group-hover:translate-x-1 transition-transform">Reply Chat →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Refer a Friend Banner ===== -->
    <!-- A link, not a modal: the programme rules are long enough that they were
         overflowing short screens, and /refer already holds the full details. -->
    <RouterLink
      to="/refer"
      class="group relative block overflow-hidden rounded-xl border border-slate-800 bg-slate-950 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div class="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
            <i class="fa-solid fa-user-plus text-xl text-[#FFCD00]"></i>
          </div>
          <div>
            <h3 class="text-lg font-extrabold text-white leading-tight">Refer a Friend — Earn 5 Points</h3>
            <p class="mt-0.5 text-sm text-slate-300">
              Your friend gets <span class="font-bold text-white">$20 USD off</span> their plan &mdash; you earn <span class="font-bold text-white">5 points</span> once they buy a plan and start learning.
            </p>
          </div>
        </div>
        <!-- A span, not a button: the whole banner is already the link, and a
             button inside an anchor is invalid markup. -->
        <span
          class="shrink-0 flex items-center gap-2 rounded-lg bg-[#FFCD00] px-5 py-2.5 text-sm font-extrabold text-slate-950 transition group-hover:bg-[#FFD933] group-active:scale-[0.98]"
        >
          <i class="fa-solid fa-share-nodes text-sm"></i>
          Share &amp; Earn
        </span>
      </div>
    </RouterLink>
    <!-- ===== /Refer a Friend Banner ===== -->

    <!-- Talk Now Modal -->
    <FreeConversationModal
      :isOpen="showFreeConversationModal"
      @close="showFreeConversationModal = false"
    />

    <!-- Class Details Modal -->
    <ClassDetailsModal
      :lesson="detailsLesson"
      :join-intent="detailsJoinIntent"
      @close="detailsLesson = null; detailsJoinIntent = false"
      @cancel="requestCancelFromDetails"
      @reschedule="requestRescheduleFromDetails"
      @edit="requestEditFromDetails"
    />

    <!-- Edit Class Modal -->
    <EditClassModal
      :lesson="editLesson"
      @close="editLesson = null"
      @save="saveLessonEdits"
    />

    <!-- Cancel Class Confirmation -->
    <CancelClassModal
      :lesson="cancelTargetLesson"
      @close="cancelTargetLesson = null"
      @confirm="confirmCancelLesson"
      @reschedule="requestRescheduleFromCancel"
    />

    <!-- Reschedule Class Modal -->
    <RescheduleClassModal
      :lesson="rescheduleTargetLesson"
      @close="rescheduleTargetLesson = null"
      @confirm="confirmRescheduleLesson"
    />

    <!-- Teacher Details Modal -->
    <TeacherDataModal
      :teacher="selectedTeacherForModal"
      @close="selectedTeacherForModal = null"
      @book="handleBookFromTeacherModal"
    />

  </div>
</template>

<script setup>
import GoogleMeetIcon from '../../components/GoogleMeetIcon.vue';
import { countdownLabel } from '@/lib/schoolTime';
import { imageForKey } from '@/lib/teacherImages';
import AppImage from '../../components/AppImage.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import brightureLogo from '@/assets/logo-black.svg';
import coinsImage from '@/assets/coins.svg';
import { useUserStore } from '../../stores/useUserStore';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { TOKYO, partsIn } from '../../lib/schoolTime';
import FreeConversationModal from '../../components/FreeConversationModal.vue';
import ClassDetailsModal from '../../components/ClassDetailsModal.vue';
import CancelClassModal from '../../components/CancelClassModal.vue';
import EditClassModal from '../../components/EditClassModal.vue';
import RescheduleClassModal from '../../components/RescheduleClassModal.vue';
import TeacherDataModal from '../../components/TeacherDataModal.vue';

const router = useRouter();
const user = useUserStore();
const school = useSchoolStore();

// Booked lessons come from the shared store, so the teacher portal sees the same list.
const upcomingLessons = computed(() => user.upcomingLessons);

// "Oct 12–18": the Monday-to-Sunday week (JST) the weekly goal counts.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekRangeLabel = computed(() => {
  const p = partsIn(new Date(school.now).toISOString(), TOKYO);
  const today = new Date(Date.UTC(p.year, p.month, p.day));
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const start = `${MONTHS[monday.getUTCMonth()]} ${monday.getUTCDate()}`;
  return monday.getUTCMonth() === sunday.getUTCMonth()
    ? `${start}–${sunday.getUTCDate()}`
    : `${start}–${MONTHS[sunday.getUTCMonth()]} ${sunday.getUTCDate()}`;
});

const showFreeConversationModal = ref(false);

// Five days' warning before a subscription ends, and on after it lapses.
const RENEWAL_WARNING_DAYS = 5;
const renewalReminderDismissed = ref(false);
const showRenewalReminder = computed(() => {
  const days = user.subscriptionDaysLeft;
  return days !== null && days <= RENEWAL_WARNING_DAYS && !renewalReminderDismissed.value;
});
const selectedTeacherForModal = ref(null);

// The spotlight already shows the next class, so the table lists the ones after it.
const scheduledLessons = computed(() =>
  upcomingLessons.value.filter((lesson) => lesson.id !== user.nextUpcomingClass?.id)
);

const detailsLesson = ref(null);
const detailsJoinIntent = ref(false);
const openDetails = (lesson, joinIntent = false) => {
  detailsJoinIntent.value = joinIntent;
  detailsLesson.value = lesson;
};

/* Materials to look at before the next class (shared with the instructor). */
const nextPrep = computed(() => (user.nextUpcomingClass?.id
  ? school.prepFor(user.nextUpcomingClass.id)
  : { items: [], total: 0, reviewed: 0 }));
const nextPrepLeft = computed(() => nextPrep.value.total - nextPrep.value.reviewed);

/** Joining with materials unopened opens Class Details with a one-time prompt instead. */
const onEnterMeet = (event) => {
  if (nextPrepLeft.value > 0) {
    event.preventDefault();
    openDetails(user.nextUpcomingClass, true);
  }
};

// A row shows what you scan for and hides what you only sometimes need. The
// next lesson starts open, because its Join button is the reason you came.
const openLessons = ref({});
const toggleLesson = (id) => { openLessons.value[id] = !isLessonOpen({ id, isNext: false }); };
const isLessonOpen = (lesson) => openLessons.value[lesson.id] ?? !!lesson.isNext;

/** "8:00 PM - 8:50 PM JST" -> "8:00 PM"; the full range lives in the row. */
const startTime = (time) => String(time || '').split(/\s*[-–]\s*/)[0].trim();
const editLesson = ref(null);
const cancelTargetLesson = ref(null);
const rescheduleTargetLesson = ref(null);
const rescheduleSuccessNotice = ref(null);
const noticeIsError = ref(false);
// Successes close after 5 seconds; errors stay a little longer to be read.
let noticeTimer = null;
const showNotice = (message, isError = false) => {
  rescheduleSuccessNotice.value = message;
  noticeIsError.value = isError;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { rescheduleSuccessNotice.value = null; }, isError ? 8000 : 5000);
};

// The details modal hands off to the confirmation rather than cancelling outright.
const requestCancelFromDetails = (lesson) => {
  detailsLesson.value = null;
  cancelTargetLesson.value = lesson;
};

const requestRescheduleFromDetails = (lesson) => {
  detailsLesson.value = null;
  rescheduleTargetLesson.value = lesson;
};

const requestRescheduleFromCancel = (lesson) => {
  cancelTargetLesson.value = null;
  rescheduleTargetLesson.value = lesson;
};

const confirmRescheduleLesson = ({ lesson, start, newDate, newTime }) => {
  rescheduleTargetLesson.value = null;
  if (!start || !user.rescheduleLesson(lesson.id, start)) {
    showNotice('That time is no longer free with this teacher — your class was not moved. Please pick another slot.', true);
    return;
  }
  showNotice(`Class successfully rescheduled to ${newDate} at ${newTime}!`);
};

const saveLessonEdits = (updated) => {
  user.editLesson(updated.id, { subject: updated.subject, topic: updated.topic, note: updated.note });
  editLesson.value = null;
  showNotice('Class details updated — your teacher will see the changes.');
};

const requestEditFromDetails = (lesson) => {
  detailsLesson.value = null;
  editLesson.value = lesson;
};

// Free up to 3h before the start (the shared store refunds); later, no refund.
const confirmCancelLesson = (lesson) => {
  cancelTargetLesson.value = null;
  const result = user.cancelLesson(lesson.id);
  if (!result) {
    showNotice('This class could not be cancelled — it may already have started or been cancelled.', true);
    return;
  }
  showNotice(
    result.refunded
      ? `Class cancelled — ${result.points} points refunded.`
      : 'Class cancelled — no refund, as it was less than 3 hours before the start.'
  );
};

const openTeacherDetails = (teacher) => {
  selectedTeacherForModal.value = teacher;
};

const handleBookFromTeacherModal = (teacher) => {
  router.push('/booking');
};

const quickInstructors = ref([
  {
    id: 1,
    name: 'Jirvy Dela Torre',
    photo: imageForKey(184),
    specialty: '[SF] Speech Fluency, [LS1], [DC]',
    rating: '4.98',
    nextAvailable: 'Today 20:00',
    major: 'B.A. in English Linguistics & Education',
    expertise: '[SF] Speech Fluency & [EP] Exam Prep',
    selfIntro: 'Hello! I specialize in helping students speak English naturally and confidently with structured feedback and fluency drills.',
  },
  {
    id: 2,
    name: 'Jane Pasanting',
    photo: imageForKey(178),
    specialty: '[DC] Daily Conversation, [PP101], [PP102]',
    rating: '4.95',
    nextAvailable: 'Today 21:00',
    major: 'B.S. in Communication Studies',
    expertise: '[PP101] Pronunciation — Vowels & [PP202] American T',
    selfIntro: 'I focus on clear intonation and natural American pronunciation. Let\'s practice speaking fluidly on everyday topics!',
  },
  {
    id: 3,
    name: 'Analyn Yosores',
    photo: imageForKey(176),
    specialty: '[RW] Reading & Writing, [SC], [EP]',
    rating: '4.92',
    nextAvailable: 'Tomorrow 10:00',
    major: 'M.A. in Applied English Linguistics',
    expertise: '[RW] Reading & Writing & Grammar Logic',
    selfIntro: 'Writing and articulating thoughts clearly requires structure. I enjoy coaching students on expression, essays, and conversation.',
  },
  {
    id: 4,
    name: 'Sandra Auman',
    photo: imageForKey(175),
    specialty: '[SF] Speech Fluency, [PP201], [SC]',
    rating: '4.89',
    nextAvailable: 'Tomorrow 11:30',
    major: 'B.A. in Secondary Education',
    expertise: '[SF] Speech Fluency & [PP201] Consonants',
    selfIntro: 'My classes are relaxing, fun, and highly interactive. You will do 80% of the talking in our lessons!',
  },
]);

// Open writing tickets for the dashboard cards.
const writingTasks = computed(() =>
  user.writingTickets
    .filter((ticket) => ticket.status !== 'Complete')
    .map((ticket) => {
      const replied = ticket.messages[ticket.messages.length - 1]?.from === 'teacher';
      return {
        ...ticket,
        status: replied ? 'Teacher Replied' : 'In Progress',
        statusColor: replied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
      };
    })
);
</script>

<style scoped>
/* The breakpoint belongs to the table, not the screen. Six columns want about
   700px; below that the rows take over — so the same section dropped into a
   narrow panel restacks itself without knowing the window size. */
.sched { container-type: inline-size; }
.sched__table { display: none; }
.sched__rows { display: block; }

@container (min-width: 44rem) {
  .sched__table { display: block; }
  .sched__rows { display: none; }
}

/* Safari 15 and other pre-container-query engines fall back to the viewport. */
@supports not (container-type: inline-size) {
  @media (min-width: 64rem) {
    .sched__table { display: block; }
    .sched__rows { display: none; }
  }
}
</style>
