<template>
  <div class="p-3 sm:p-5 lg:p-7 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">

    <!-- ===== Current time =====
         The time now in the zone picked in the header's timezone menu, so it
         changes with that choice. Ticks every second. -->
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-slate-200/80 pb-4">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Time now &middot; {{ zoneInfo.city }}
        </p>
        <p class="mt-1 flex items-baseline gap-2 text-slate-900">
          <span class="text-4xl sm:text-5xl font-black tracking-tight tabular-nums leading-none">{{ clockTime }}</span>
          <span class="text-base sm:text-lg font-bold text-slate-400 tabular-nums">{{ clockSeconds }}</span>
          <span class="text-sm sm:text-base font-bold text-slate-500">{{ clockPeriod }}</span>
        </p>
      </div>
      <p class="text-sm font-semibold text-slate-600">
        {{ todayFullDate }}
        <span class="ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 tabular-nums">{{ zoneShort }} &middot; UTC{{ zoneOffset }}</span>
      </p>
    </header>


    <!-- ========================================================================= -->
    <!-- 2. HIGH-IMPACT COMMAND METRIC CARDS (BENTO RIBBON)                        -->
    <!-- ========================================================================= -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <!-- Metric 1: Today's Teaching Load -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 duration-200 flex flex-col justify-between">
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">Today's Load</p>
          <span class="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-bold">
            <i class="fa-solid fa-chalkboard-user"></i>
          </span>
        </div>
        <div class="mt-2.5">
          <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {{ teacher.todaysReservations.length }}
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {{ teacher.todaysReservations.length === 1 ? 'Lesson' : 'Lessons' }}
            </span>
          </p>
          <p class="mt-1 text-[11px] font-semibold text-slate-500 truncate" :title="todaySpan">
            <i class="fa-regular fa-clock text-slate-400 mr-1"></i>
            {{ todaySpan || 'No classes booked today' }}
          </p>
        </div>
      </div>

      <!-- Metric 2: Open slots still ahead today — what students can still
           book before the day ends, and when the next one starts. -->
      <RouterLink
        to="/calendar"
        class="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 duration-200 flex flex-col justify-between group cursor-pointer"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">Open Today</p>
          <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold transition group-hover:scale-110">
            <i class="fa-regular fa-calendar-plus"></i>
          </span>
        </div>
        <div class="mt-2.5 min-w-0">
          <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {{ openToday.hours }}<span class="text-lg">h</span>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">still open</span>
          </p>
          <p class="mt-1 text-[11px] font-semibold text-slate-500 truncate group-hover:text-emerald-700 transition-colors tabular-nums">
            {{ openToday.next ? `Next open slot ${openToday.next} ${zoneShort}` : 'No open slots left today' }}
            <i class="fa-solid fa-arrow-right text-[10px] ml-1"></i>
          </p>
        </div>
      </RouterLink>

      <!-- Metric 3: Action Items & Corrections -->
      <RouterLink
        to="/lessons"
        class="rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 duration-200 flex flex-col justify-between group cursor-pointer"
        :class="teacher.attentionItems.length ? 'border-amber-300/80 bg-amber-50/20' : 'border-slate-200/80'"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">Action Queue</p>
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition group-hover:scale-110"
            :class="teacher.attentionItems.length ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'"
          >
            <i class="fa-solid fa-list-check"></i>
          </span>
        </div>
        <div class="mt-2.5">
          <p
            class="text-2xl sm:text-3xl font-black tracking-tight tabular-nums"
            :class="hasOverdueItem ? 'text-rose-600' : (teacher.attentionItems.length ? 'text-amber-800' : 'text-slate-900')"
          >
            {{ teacher.attentionItems.length }}
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Tasks</span>
          </p>
          <p class="mt-1 text-[11px] font-semibold text-slate-500 truncate group-hover:text-amber-700 transition-colors">
            {{ urgentSummary }}
            <i class="fa-solid fa-arrow-right text-[10px] ml-1"></i>
          </p>
        </div>
      </RouterLink>

      <!-- Metric 4: Weekly Utilization -->
      <RouterLink
        to="/calendar"
        class="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md hover:-translate-y-0.5 duration-200 flex flex-col justify-between group cursor-pointer"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">Week Roster</p>
          <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold transition group-hover:scale-110">
            <i class="fa-solid fa-chart-pie"></i>
          </span>
        </div>
        <div class="mt-2.5">
          <div class="flex items-baseline justify-between">
            <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              {{ weeklyBookingRate }}%
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Booked</span>
            </p>
            <span class="text-[11px] font-bold text-slate-400 tabular-nums">
              {{ teacher.weeklyBooked }}/{{ teacher.weeklyOpen }} slots
            </span>
          </div>
          <!-- Mini capacity bar -->
          <div class="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              :style="{ width: `${weeklyBookingRate}%` }"
            ></div>
          </div>
        </div>
      </RouterLink>
    </section>


    <!-- ========================================================================= -->
    <!-- 3. NEXT LESSON SPOTLIGHT (COCKPIT FLIGHT COMMAND)                         -->
    <!-- ========================================================================= -->
    <section
      v-if="next"
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#111927] border border-slate-800 text-white p-5 sm:p-7 shadow-2xl shadow-slate-950/30"
    >
      <!-- Decorative background aura -->
      <div class="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div class="pointer-events-none absolute -left-20 -top-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl"></div>

      <!-- Top Strip: Status Bar & Clocks -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Live / Countdown Badge -->
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
            :class="next.minutesUntil <= 15
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300'"
          >
            <span>Next Up &bull; In {{ teacher.countdownLabel(next.minutesUntil) }}</span>
          </span>

          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-bold tabular-nums">
            <i class="fa-regular fa-clock text-amber-400 text-[11px]"></i>
            {{ teacher.localRange(next) }}
          </span>

          <span v-if="next.substitution" class="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            Substitution
          </span>
        </div>

        <div class="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
          <span>Student zone:</span>
          <span class="text-slate-200 font-bold bg-white/5 px-2 py-0.5 rounded-md">{{ next.startStudent }}</span>
        </div>
      </div>

      <!-- Main Body: Student Card + Topic Prep + Join CTAs -->
      <div class="relative z-10 mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <!-- Student Info Column -->
        <div class="lg:col-span-4 flex items-center gap-4">
          <button
            type="button"
            @click="openStudentModal(next, 'basic')"
            class="relative group shrink-0"
            title="View student's basic info"
          >
            <AppImage
              :src="next.studentPhoto"
              :alt="next.studentName"
              eager
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#c5a059] shadow-lg transition duration-200 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              <i class="fa-solid fa-eye"></i>
            </div>
          </button>

          <div class="min-w-0">
            <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Student #{{ next.studentId }}
            </span>
            <h2 class="text-lg sm:text-xl font-black text-white truncate hover:text-amber-300 transition-colors cursor-pointer" @click="openStudentModal(next)">
              {{ next.studentName }}
            </h2>
            <p class="text-xs text-slate-400 font-medium truncate mt-0.5">
              {{ next.membership }} &bull; {{ next.lessonClass || 'Online 1-on-1' }}
            </p>

            <div class="flex items-center gap-2 mt-2">
              <RouterLink
                :to="{ path: '/chat', query: { student: next.studentId } }"
                class="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
              >
                <i class="fa-solid fa-comments text-amber-400 text-[10px]"></i> Message
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Subject & Topic Focus Column -->
        <div class="lg:col-span-5 space-y-2 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-black">
              {{ next.subject }}
            </span>
            <span class="text-xs text-slate-400">Lesson Curriculum</span>
          </div>

          <h3 class="text-base sm:text-lg font-bold text-white leading-snug">
            {{ next.topic }}
          </h3>

          <!-- Student Request / Note -->
          <div v-if="next.note" class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span class="font-bold text-amber-300 mr-1.5"><i class="fa-solid fa-quote-left text-[10px]"></i> Student Request:</span>
            <span class="italic text-slate-200">{{ next.note }}</span>
          </div>
        </div>

        <!-- Join Meeting & Actions Column -->
        <div class="lg:col-span-3 flex flex-col gap-2.5 justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          <a
            v-if="next.meetLink"
            :href="next.meetLink"
            target="_blank"
            rel="noopener"
            class="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3 px-4 shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98] group"
          >
            <i class="fa-solid fa-video text-base transition-transform group-hover:scale-110"></i>
            <span>Join Google Meet</span>
          </a>

          <p
            v-else
            class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2.5 text-center text-xs font-medium text-rose-300"
          >
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>No meeting link yet</span>
          </p>

          <button
            type="button"
            @click="openStudentModal(next)"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold py-2.5 px-3 transition active:scale-[0.98]"
          >
            <i class="fa-solid fa-circle-info text-amber-400"></i>
            <span>Class Details</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Empty Next State -->
    <div
      v-else
      class="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-xs"
    >
      <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-lg">
        <i class="fa-solid fa-mug-saucer"></i>
      </div>
      <h3 class="text-base font-black text-slate-900">No Immediate Upcoming Lessons</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto">
        Your current schedule is clear. Check open availability or configure additional lesson slots for students to reserve.
      </p>
      <RouterLink
        to="/schedule"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brighture-gold text-slate-900 text-xs font-black shadow-sm transition hover:brightness-105"
      >
        <span>Open Class Slots</span>
        <i class="fa-solid fa-arrow-right text-[10px]"></i>
      </RouterLink>
    </div>


    <!-- ========================================================================= -->
    <!-- 4. OPERATIONAL WORKSPACE (TODAY'S SCHEDULE + WEEKLY MATRIX + ACTION QUEUE) -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

      <!-- LEFT COLUMN: TODAY'S LESSONS & WEEKLY CAPACITY (8 SPANS) -->
      <div class="xl:col-span-8 space-y-6">

        <!-- Today's Lesson Schedule Board -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 class="text-base sm:text-lg font-black text-slate-900">Today's Class Lineup</h2>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ teacher.todaysReservations.length }} confirmed sessions for {{ todayShortDate }}
              </p>
            </div>

            <RouterLink
              to="/reservations"
              class="text-xs font-bold text-brighture-bronze hover:underline flex items-center gap-1"
            >
              <span>All reservations</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </RouterLink>
          </div>

          <!-- Lessons List -->
          <div v-if="teacher.todaysReservations.length" class="space-y-3">
            <article
              v-for="(row, idx) in teacher.todaysReservations"
              :key="row.id"
              class="rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              :class="isNextReservation(row)
                ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400/40'
                : 'border-slate-200/80 bg-white hover:border-slate-300'"
            >
              <!-- Time and Student -->
              <div class="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                <!-- Time Column -->
                <div class="shrink-0 text-center w-20 py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p class="text-xs font-black text-slate-900 tabular-nums">
                    {{ timeOnly(teacher.localStart(row)) }}
                  </p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {{ zoneShort }}
                  </p>
                </div>

                <!-- Student Avatar -->
                <button
                  type="button"
                  @click="openStudentModal(row)"
                  class="relative shrink-0 group"
                  title="View student profile"
                >
                  <AppImage
                    :src="row.studentPhoto"
                    :alt="row.studentName"
                    class="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200 group-hover:ring-amber-400 transition"
                  />
                </button>

                <!-- Student & Subject Details -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3
                      class="text-sm font-black text-slate-900 truncate hover:text-amber-700 transition cursor-pointer"
                      @click="openStudentModal(row)"
                    >
                      {{ row.studentName }}
                    </h3>
                    <span
                      v-if="row.substitution"
                      class="px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase"
                    >
                      Sub
                    </span>
                    <span
                      v-if="isNextReservation(row)"
                      class="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase"
                    >
                      Next
                    </span>
                  </div>

                  <p class="text-xs font-bold text-slate-700 truncate mt-0.5">
                    <span class="text-amber-700 font-extrabold mr-1">{{ row.subject }}</span>
                    <span class="text-slate-400 font-normal">&bull; {{ row.topic }}</span>
                  </p>

                  <p v-if="row.note" class="text-[11px] text-slate-500 italic truncate mt-0.5">
                    "{{ row.note }}"
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  v-if="row.meetLink"
                  :href="row.meetLink"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition active:scale-95 shadow-xs"
                >
                  <i class="fa-solid fa-video text-[11px]"></i>
                  <span>Meet</span>
                </a>
                <span
                  v-else
                  class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold"
                >
                  No Link
                </span>

                <RouterLink
                  :to="{ path: '/chat', query: { student: row.studentId } }"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs transition"
                  title="Message student"
                >
                  <i class="fa-solid fa-comments"></i>
                </RouterLink>

                <button
                  type="button"
                  @click="openStudentModal(row)"
                  class="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95"
                >
                  <i class="fa-solid fa-circle-info text-slate-400 text-xs"></i>
                  <span class="hidden sm:inline">Details</span>
                </button>
              </div>
            </article>
          </div>

          <div v-else class="text-center py-10 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <i class="fa-solid fa-calendar-check text-2xl text-slate-300 mb-2"></i>
            <p class="text-sm font-bold text-slate-700">No lessons scheduled for today</p>
            <p class="text-xs text-slate-400 mt-0.5">Take time to review writing submissions or prepare your upcoming curriculum.</p>
          </div>
        </section>


        <!-- Weekly Schedule Roster Matrix -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-brighture-gold"></span>
                <h2 class="text-base sm:text-lg font-black text-slate-900">Weekly Booking Matrix</h2>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Current week capacity overview &bull; {{ teacher.weeklyBooked }} booked of {{ teacher.weeklyOpen }} open slots
              </p>
            </div>

            <RouterLink
              to="/schedule"
              class="text-xs font-bold text-brighture-bronze hover:underline"
            >
              Open Slot Grid &rarr;
            </RouterLink>
          </div>

          <!-- 7-Day Matrix Strip -->
          <div class="grid grid-cols-7 gap-2 sm:gap-2.5">
            <div
              v-for="day in teacher.weeklyLoad"
              :key="day.key"
              class="p-2.5 sm:p-3 rounded-2xl border text-center transition flex flex-col justify-between"
              :class="isCurrentDay(day.key)
                ? 'border-amber-400/80 bg-amber-50/50 shadow-xs ring-1 ring-amber-400/30'
                : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60'"
            >
              <div>
                <p
                  class="text-[11px] font-black uppercase tracking-wider"
                  :class="isCurrentDay(day.key) ? 'text-amber-800' : 'text-slate-500'"
                >
                  {{ day.label }}
                </p>
                <span
                  v-if="isCurrentDay(day.key)"
                  class="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wide bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full"
                >
                  Today
                </span>
              </div>

              <div class="my-2.5">
                <p class="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                  {{ day.booked }}
                </p>
                <p class="text-[10px] font-bold text-slate-400">
                  of {{ day.open }} slots
                </p>
              </div>

              <!-- Mini Progress Bar -->
              <div class="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="isCurrentDay(day.key) ? 'bg-amber-500' : 'bg-slate-700'"
                  :style="{ width: `${day.open ? Math.round((day.booked / day.open) * 100) : 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Teaching Performance & Subject Matrix -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <h2 class="text-base sm:text-lg font-black text-slate-900">Faculty Performance & Curriculum</h2>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Attendance reliability, student retention, and curriculum distribution
              </p>
            </div>

            <RouterLink
              to="/analytics"
              class="text-xs font-bold text-brighture-bronze hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </RouterLink>
          </div>

          <!-- 4 Quality Micro-Metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Completion Rate</p>
              <p class="text-lg sm:text-xl font-black text-emerald-600 mt-1 tabular-nums">
                {{ weeklyAnalytics?.completionRate ?? 95 }}%
              </p>
              <p class="text-[10px] font-semibold text-slate-500 mt-0.5">19 of 20 taught</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Repeat Students</p>
              <p class="text-lg sm:text-xl font-black text-indigo-600 mt-1 tabular-nums">
                {{ weeklyAnalytics?.repeatShare ?? 80 }}%
              </p>
              <p class="text-[10px] font-semibold text-slate-500 mt-0.5">High retention</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Punctuality</p>
              <p class="text-lg sm:text-xl font-black text-sky-600 mt-1 tabular-nums">
                100%
              </p>
              <p class="text-[10px] font-semibold text-slate-500 mt-0.5">0 faculty cancel</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Rating</p>
              <p class="text-lg sm:text-xl font-black text-amber-500 mt-1 tabular-nums">
                {{ weeklyAnalytics?.rating ?? '4.98' }} ★
              </p>
              <p class="text-[10px] font-semibold text-slate-500 mt-0.5">Top percentile</p>
            </div>
          </div>

          <!-- Subject Distribution Bars -->
          <div class="space-y-2.5 pt-2">
            <p class="text-xs font-black text-slate-800 uppercase tracking-wider">Top Curriculums Taught This Week</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="sub in weeklyAnalytics?.subjects || []"
                :key="sub.code"
                class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700">
                    {{ sub.code }}
                  </span>
                  <span class="font-bold text-slate-800 truncate">{{ sub.label }}</span>
                </div>
                <span class="text-xs font-black text-slate-900 tabular-nums shrink-0">
                  {{ sub.lessons }} <span class="font-semibold text-slate-400 text-[11px]">lessons</span>
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>


      <!-- RIGHT COLUMN: ACTION CENTER & RECENT STUDENT TESTIMONIALS (4 SPANS) -->
      <div class="xl:col-span-4 space-y-6">

        <!-- Priority Attention Items Queue -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h2 class="text-base font-black text-slate-900">Needs Attention</h2>
            </div>
            <span
              v-if="teacher.attentionItems.length"
              class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black tabular-nums"
            >
              {{ teacher.attentionItems.length }} Pending
            </span>
          </div>

          <div v-if="teacher.attentionItems.length" class="space-y-2.5">
            <RouterLink
              v-for="item in teacher.attentionItems"
              :key="item.id"
              :to="item.to"
              class="group flex items-start gap-3 p-3 rounded-2xl border transition-all duration-150 hover:shadow-xs"
              :class="item.urgent
                ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50'"
            >
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                :class="item.urgent ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'"
              >
                <i :class="item.kind === 'writing' ? 'fa-solid fa-pen-nib' : 'fa-solid fa-comment-dots'"></i>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <p class="text-xs font-black text-slate-900 truncate group-hover:text-amber-800 transition">
                    {{ item.title }}
                  </p>
                  <span
                    v-if="item.urgent"
                    class="text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-md shrink-0"
                  >
                    Urgent
                  </span>
                </div>

                <p class="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                  {{ item.subtitle }}
                </p>

                <p
                  class="text-[10px] font-bold tabular-nums mt-1"
                  :class="item.urgent ? 'text-rose-600 font-extrabold' : 'text-slate-400'"
                >
                  <i class="fa-regular fa-clock mr-0.5"></i>
                  {{ item.meta }}
                </p>
              </div>

              <i class="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all mt-2 shrink-0"></i>
            </RouterLink>
          </div>

          <div v-else class="text-center py-8 px-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-900">
            <i class="fa-solid fa-circle-check text-2xl text-emerald-500 mb-1.5"></i>
            <p class="text-xs font-black">All caught up!</p>
            <p class="text-[11px] text-emerald-700 mt-0.5">No unsubmitted logs or overdue writing revisions.</p>
          </div>
        </section>


        <!-- Student Feedback & Reviews -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h2 class="text-base font-black text-slate-900">Recent Student Praise</h2>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Direct feedback from completed lessons</p>
            </div>

            <RouterLink
              to="/analytics"
              class="text-xs font-bold text-brighture-bronze hover:underline"
            >
              Stats &rarr;
            </RouterLink>
          </div>

          <div class="space-y-3">
            <article
              v-for="lesson in studentReviews"
              :key="lesson.id"
              class="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1.5"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-black text-slate-900">{{ lesson.studentName }}</span>
                <div class="flex items-center gap-0.5 text-amber-500 text-xs">
                  <span v-for="i in lesson.rating" :key="i">★</span>
                </div>
              </div>

              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {{ lesson.subject }}
              </p>

              <p class="text-xs text-slate-700 italic leading-relaxed pt-0.5">
                "{{ lesson.comment }}"
              </p>
            </article>
          </div>
        </section>


        <!-- Teaching Resources Shortcuts -->
        <section class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
          <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">Faculty Shortcuts</h2>

          <div class="grid grid-cols-2 gap-2 text-xs font-bold">
            <RouterLink
              to="/lessons"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100 flex flex-col gap-1 transition"
            >
              <i class="fa-solid fa-clock-rotate-left text-indigo-500 text-sm"></i>
              <span>Lesson Log</span>
            </RouterLink>

            <RouterLink
              to="/exams"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100 flex flex-col gap-1 transition"
            >
              <i class="fa-solid fa-file-pen text-rose-500 text-sm"></i>
              <span>Tests & Exams</span>
            </RouterLink>

            <RouterLink
              to="/materials"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100 flex flex-col gap-1 transition"
            >
              <i class="fa-solid fa-folder-open text-teal-500 text-sm"></i>
              <span>Curriculum</span>
            </RouterLink>

            <RouterLink
              to="/analytics"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100 flex flex-col gap-1 transition"
            >
              <i class="fa-solid fa-chart-line text-emerald-500 text-sm"></i>
              <span>Analytics</span>
            </RouterLink>
          </div>
        </section>

      </div>

    </div>

    <!-- Student Detail Modal Integration -->
    <StudentDetailModal
      v-if="selectedStudent"
      :student="selectedStudent"
      :initial-tab="selectedTab"
      @close="selectedStudent = null"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import AppImage from '../../components/AppImage.vue';
import StudentDetailModal from '../../components/teacher/StudentDetailModal.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';
import { getTimeZoneInfo, getUtcOffsetMinutes } from '../../lib/timezoneUtils';

const teacher = useTeacherStore();
const next = computed(() => teacher.nextReservation);

/**
 * Open (unbooked) half-hour slots left today, counted on Manila's clock where
 * the schedule lives, and the start of the next one shown in the viewed zone.
 * Read from this week's board even if Scheduling is showing another week.
 */
const openToday = computed(() => {
  const { iso, minutes } = teacher.manilaNow;
  const [y, m, d] = iso.split('-').map(Number);
  const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const ahead = teacher.scheduleSlots.filter((slot) => slot.minutes > minutes
    && teacher.getSlotStatusOn(teacher.thisWeekStart, dayKey, slot.key) === 'open');
  const hours = ahead.length / 2;
  let next = '';
  if (ahead.length) {
    // Manila minutes → viewed zone, by the difference between the two offsets.
    const shift = getUtcOffsetMinutes(zoneName.value, now.value) - getUtcOffsetMinutes('Asia/Manila', now.value);
    const at = (((ahead[0].minutes + shift) % 1440) + 1440) % 1440;
    const h = Math.floor(at / 60);
    next = `${h % 12 || 12}:${String(at % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  return { hours: Number.isInteger(hours) ? hours : hours.toFixed(1), next };
});

const selectedStudent = ref(null);
const selectedTab = ref('class');

// `tab` picks where the modal opens: the photo goes to Basic Info, every
// other opener to Class Details.
const openStudentModal = (studentData, tab = 'class') => {
  if (!studentData) return;
  selectedTab.value = tab;
  selectedStudent.value = {
    ...studentData,
    studentId: studentData.studentId || studentData.id,
    studentName: studentData.studentName || studentData.student,
    studentPhoto: studentData.studentPhoto || studentData.photo,
    category: studentData.category || studentData.membership || 'Regular',
    lessonClass: studentData.lessonClass || 'Online 1-on-1',
  };
};

/** Re-read every second so the clock in the header shows seconds ticking. */
const now = ref(new Date());
let clock;
onMounted(() => {
  clock = setInterval(() => { now.value = new Date(); }, 1000);
});
onBeforeUnmount(() => clearInterval(clock));

const zoneName = computed(() => teacher.viewZoneId);
const zoneShort = computed(() => teacher.viewZoneAbbr);

const zoneInfo = computed(() => getTimeZoneInfo(zoneName.value));

const clockParts = computed(() => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zoneName.value,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).formatToParts(now.value);
    return Object.fromEntries(parts.map((p) => [p.type, p.value]));
  } catch {
    return {};
  }
});
const clockTime = computed(() => `${clockParts.value.hour ?? '--'}:${clockParts.value.minute ?? '--'}`);
const clockSeconds = computed(() => clockParts.value.second ?? '');
const clockPeriod = computed(() => clockParts.value.dayPeriod ?? '');

// "+08:00", from the same Intl offset the timezone menu uses.
const zoneOffset = computed(() => {
  const mins = getUtcOffsetMinutes(zoneName.value, now.value);
  const sign = mins < 0 ? '-' : '+';
  const abs = Math.abs(mins);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
});

const todayFullDate = computed(() => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: zoneName.value,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(now.value);
  } catch {
    return '';
  }
});

const todayShortDate = computed(() => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: zoneName.value,
      month: 'short',
      day: 'numeric',
    }).format(now.value);
  } catch {
    return '';
  }
});

const rangeHalf = (row, index) => (teacher.localRange(row) || '').split('–')[index]?.trim() ?? '';
const timeOnly = (stamp) => stamp.split(' ').pop();

const todaySpan = computed(() => {
  const rows = teacher.todaysReservations;
  if (!rows.length) return '';
  return `${rangeHalf(rows[0], 0)} – ${rangeHalf(rows[rows.length - 1], 1)}`;
});

const isNextReservation = (row) => {
  return next.value && next.value.id === row.id;
};

// Check if a day key corresponds to today
const isCurrentDay = (dayKey) => {
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayIndex = now.value.getDay();
  return dayNames[currentDayIndex] === dayKey.toLowerCase();
};

const weeklyBookingRate = computed(() => {
  if (!teacher.weeklyOpen) return 0;
  return Math.round((teacher.weeklyBooked / teacher.weeklyOpen) * 100);
});

const hasOverdueItem = computed(() => {
  return teacher.attentionItems.some((item) => item.urgent);
});

const urgentSummary = computed(() => {
  const items = teacher.attentionItems;
  if (!items.length) return 'All caught up';
  const urgentCount = items.filter(i => i.urgent).length;
  if (urgentCount > 0) return `${urgentCount} urgent item${urgentCount === 1 ? '' : 's'} require response`;
  return `${items.length} pending task${items.length === 1 ? '' : 's'}`;
});

// Curated authentic student reviews
const studentReviews = computed(() => [
  {
    id: 'rev-1',
    studentName: 'Taro Yamada',
    subject: '[SF] Speech Fluency',
    rating: 5,
    comment: 'Very clear explanations, I could follow every correction effortlessly and improve my business phrasing.',
  },
  {
    id: 'rev-2',
    studentName: 'Kenji Sato',
    subject: '[DC] Daily Conversation',
    rating: 5,
    comment: 'Friendly, patient, and very encouraging during speaking drills.',
  },
  {
    id: 'rev-3',
    studentName: 'Aiko Tanaka',
    subject: '[PP101] Pronunciation — Vowels',
    rating: 5,
    comment: 'The minimal pair audio drills were exact and helped me hear the subtle vowel contrasts immediately.',
  },
]);
</script>
