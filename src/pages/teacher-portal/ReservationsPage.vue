<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- ================================================================= -->
    <!-- Page Header & Stats Overview                                      -->
    <!-- ================================================================= -->
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Live Booking Sync
          </span>
          <span v-if="teacher.nextReservation" class="text-xs font-bold text-slate-500 hidden sm:inline">
            • Next lesson in {{ teacher.nextReservation.minutesUntil }} mins
          </span>
        </div>
        <h1 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Reservations
        </h1>
        <p class="mt-0.5 text-sm text-slate-500">
          All scheduled lessons booked with you, sorted chronologically with topics and meeting links.
        </p>
      </div>

      <!-- Quick Action / Timezone Selector in Header -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <div class="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-xs text-xs font-semibold text-slate-600">
          <i class="fa-regular fa-clock text-slate-400"></i>
          <span class="text-slate-400 hidden sm:inline">Clock:</span>
          <select
            v-model="timeZoneMode"
            aria-label="Timezone display preference"
            class="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            <option value="manila">Manila (PHT UTC+8)</option>
            <option value="tokyo">Tokyo (JST UTC+9)</option>
            <option value="student">Student Local Time</option>
          </select>
        </div>

        <span class="rounded-2xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
          {{ filteredReservations.length }} of {{ teacher.reservations.length }} shown
        </span>
      </div>
    </header>

    <!-- ================================================================= -->
    <!-- KPI Metric Cards                                                  -->
    <!-- ================================================================= -->
    <section class="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Booked</span>
          <span class="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <i class="fa-solid fa-calendar-check text-xs"></i>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-2xl font-black text-slate-900">{{ teacher.reservations.length }}</p>
          <span class="text-xs font-medium text-slate-500">lessons</span>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today</span>
          <span class="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <i class="fa-solid fa-bolt text-xs"></i>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-2xl font-black text-slate-900">{{ teacher.todaysReservations.length }}</p>
          <span class="text-xs font-medium text-emerald-600 font-bold">today</span>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Free Conv.</span>
          <span class="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <i class="fa-solid fa-comments text-xs"></i>
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-2xl font-black text-slate-900">{{ freeConversationCount }}</p>
          <span class="text-xs font-medium text-slate-500">slots</span>
        </div>
      </div>

    </section>

    <!-- ================================================================= -->
    <!-- Next Up Imminent Spotlight Banner (Visible on 'all' and 'today')  -->
    <!-- ================================================================= -->
    <section
      v-if="teacher.nextReservation && (activeTab === 'all' || activeTab === 'today') && !searchQuery"
      class="relative overflow-hidden rounded-3xl p-4 sm:p-5 text-white shadow-md border border-slate-800"
      style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #111827 100%);"
    >
      <div class="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brighture-gold/15 blur-2xl"></div>

      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="relative shrink-0">
            <AppImage
              :src="teacher.nextReservation.studentPhoto"
              :alt="teacher.nextReservation.studentName"
              eager
              class="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover ring-2 ring-brighture-gold/80 shadow-md"
            />
            <span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950 font-black ring-2 ring-slate-900">
              ✓
            </span>
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1 rounded-full bg-brighture-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brighture-ink shadow-xs">
                <span class="h-1.5 w-1.5 rounded-full bg-slate-900 animate-ping"></span>
                Up Next • In {{ teacher.nextReservation.minutesUntil }} mins
              </span>
              <span class="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                {{ teacher.localRange(teacher.nextReservation) }}
              </span>
              <span v-if="teacher.nextReservation.substitution" class="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Sub
              </span>
            </div>

            <h2 class="mt-1.5 text-base sm:text-lg font-extrabold text-white truncate">
              {{ teacher.nextReservation.studentName }}
              <span class="text-xs font-normal text-slate-300 ml-1.5 sm:inline">
                ({{ teacher.nextReservation.subject }})
              </span>
            </h2>

            <p class="mt-0.5 text-xs text-slate-300 truncate max-w-xl">
              <span class="text-brighture-gold font-bold">Topic:</span> {{ teacher.nextReservation.topic }}
            </p>
          </div>
        </div>

        <!-- Quick actions for Next Lesson -->
        <div class="flex shrink-0 items-center gap-2 pt-2 md:pt-0 border-t border-slate-700/60 md:border-t-0">
          <a
            v-if="teacher.nextReservation.meetLink"
            :href="teacher.nextReservation.meetLink"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            <span>📹</span>
            <span>Join Room</span>
          </a>
          <button
            type="button"
            @click="selectedStudent = teacher.nextReservation"
            class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs font-bold text-white transition active:scale-95 whitespace-nowrap"
          >
            <i class="fa-solid fa-user-circle text-xs"></i>
            <span>Details</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- Filter, Search & View Controls Bar                                -->
    <!-- ================================================================= -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search student, subject, topic..."
          class="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 pl-9 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-brighture-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brighture-gold/20"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
          aria-label="Clear search"
        >
          ✕
        </button>
      </div>

      <!-- View Switcher & Actions -->
      <div class="flex items-center justify-between sm:justify-end gap-2">
        <!-- View mode toggle (hidden on small screens, cards are default there) -->
        <div class="hidden lg:inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            @click="viewMode = 'table'"
            :class="viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition"
            title="Table View"
          >
            <i class="fa-solid fa-table-list text-[11px]"></i>
            <span>Table</span>
          </button>
          <button
            type="button"
            @click="viewMode = 'grid'"
            :class="viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition"
            title="Cards View"
          >
            <i class="fa-solid fa-grip text-[11px]"></i>
            <span>Cards</span>
          </button>
        </div>

        <button
          v-if="searchQuery || activeTab !== 'all'"
          type="button"
          @click="resetFilters"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
        >
          <i class="fa-solid fa-rotate-left text-[10px]"></i>
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="activeTab = tab.key"
        class="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95"
        :class="activeTab === tab.key
          ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
          : 'border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
      >
        <span>{{ tab.label }}</span>
        <span
          class="rounded-full px-1.5 py-0.2 text-[10px] font-black"
          :class="activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- ================================================================= -->
    <!-- MAIN CONTENT: Grouped by Date                                     -->
    <!-- ================================================================= -->
    <div v-if="groupedReservations.length" class="space-y-8">
      <section
        v-for="group in groupedReservations"
        :key="group.dateKey"
        class="space-y-3"
      >
        <!-- Date Header Banner -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-2xs"
              :class="group.isToday ? 'bg-brighture-gold text-brighture-ink' : 'bg-slate-100 text-slate-600'"
            >
              <i class="fa-regular fa-calendar"></i>
            </span>
            <h2 class="text-sm sm:text-base font-extrabold text-slate-900">
              {{ group.displayDate }}
            </h2>
          </div>

          <span
            v-if="group.isToday"
            class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800"
          >
            Today
          </span>
          <span
            v-else-if="group.isTomorrow"
            class="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-800"
          >
            Tomorrow
          </span>

          <span class="text-xs font-bold text-slate-400">
            • {{ group.items.length }} lesson{{ group.items.length === 1 ? '' : 's' }}
          </span>

          <div class="h-px flex-1 bg-slate-200/80 ml-2"></div>
        </div>

        <!-- ============================================================= -->
        <!-- VIEW 1: Desktop Table (When viewMode === 'table')              -->
        <!-- ============================================================= -->
        <div
          v-if="viewMode === 'table'"
          class="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
        >
          <div class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-sm">
              <thead class="bg-slate-50/90 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th class="px-5 py-3.5">Time & Clock</th>
                  <th class="px-4 py-3.5">Student</th>
                  <th class="px-4 py-3.5">Subject & Topic</th>
                  <th class="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="row in group.items"
                  :key="row.id"
                  class="align-middle transition-colors hover:bg-slate-50/80 group"
                  :class="row.id === teacher.nextReservation?.id ? 'bg-amber-50/30' : ''"
                >
                  <!-- Time & Clock -->
                  <td class="px-5 py-4 whitespace-nowrap">
                    <div class="flex items-start gap-2.5">
                      <div class="flex flex-col">
                        <div class="flex items-center gap-1.5">
                          <span class="font-extrabold text-slate-900 text-sm">
                            {{ formatPrimaryTime(row) }}
                          </span>
                          <span
                            v-if="row.id === teacher.nextReservation?.id"
                            class="rounded-full bg-brighture-gold px-1.5 py-0.2 text-[9px] font-black text-brighture-ink shadow-2xs"
                          >
                            NEXT
                          </span>
                        </div>
                        <span class="text-[11px] font-medium text-slate-500">
                          {{ formatSecondaryTime(row) }}
                        </span>
                        <span v-if="timeZoneMode !== 'student'" class="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                          {{ formatStudentTimeShort(row) }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Student Profile -->
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <AppImage
                        :src="row.studentPhoto"
                        :alt="row.studentName"
                        class="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div class="min-w-0">
                        <button
                          type="button"
                          @click="selectedStudent = row"
                          class="block truncate text-sm font-extrabold text-slate-900 hover:text-brighture-bronze transition text-left"
                        >
                          {{ row.studentName }}
                        </button>
                        <div class="flex items-center gap-1.5 mt-0.5">
                          <span class="text-[10px] font-bold text-slate-400">#{{ row.studentId }}</span>
                          <span
                            class="rounded-md px-1.5 py-0.2 text-[9px] font-bold"
                            :class="row.membership === 'Trial' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'"
                          >
                            {{ row.membership }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Subject & Topic -->
                  <td class="px-4 py-4 max-w-xs">
                    <div class="space-y-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span
                          class="rounded-lg px-2 py-0.5 text-[10px] font-black"
                          :class="subjectBadgeStyle(row.subject)"
                        >
                          {{ extractSubjectCode(row.subject) }}
                        </span>
                        <span class="text-xs font-extrabold text-slate-800">
                          {{ cleanSubjectTitle(row.subject) }}
                        </span>
                        <span
                          v-if="row.substitution"
                          class="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800"
                          title="Substitution Lesson"
                        >
                          Sub
                        </span>
                      </div>
                      <p v-if="row.topic" class="text-xs font-medium text-slate-600 truncate" :title="row.topic">
                        <span class="text-slate-400 font-normal">Topic:</span> {{ row.topic }}
                      </p>
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="px-5 py-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <a
                        v-if="row.meetLink"
                        :href="row.meetLink"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-2 text-xs font-black text-slate-950 shadow-2xs transition hover:scale-105 active:scale-95"
                        title="Open Google Meet room"
                      >
                        <span>📹</span>
                        <span>Meet</span>
                      </a>
                      <span
                        v-else
                        class="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 border border-rose-200/60"
                        title="Meeting room link not generated yet"
                      >
                        <i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
                        <span>No link</span>
                      </span>

                      <!-- Details Button -->
                      <button
                        type="button"
                        @click="selectedStudent = row"
                        class="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition active:scale-95 shadow-2xs"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- VIEW 2: Desktop Cards Grid (When viewMode === 'grid')         -->
        <!-- ============================================================= -->
        <div
          v-if="viewMode === 'grid'"
          class="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <article
            v-for="row in group.items"
            :key="row.id"
            class="flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md relative overflow-hidden"
            :class="row.id === teacher.nextReservation?.id
              ? 'border-brighture-gold ring-2 ring-brighture-gold/30'
              : 'border-slate-200/80'"
          >
            <div class="space-y-3.5">
              <!-- Top Card Header: Time & Next Beacon -->
              <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-xs">
                    <i class="fa-regular fa-clock"></i>
                  </span>
                  <div>
                    <p class="text-xs font-black text-slate-900 leading-none">
                      {{ formatPrimaryTime(row) }}
                    </p>
                    <p class="text-[10px] text-slate-400 mt-0.5">
                      {{ formatSecondaryTime(row) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  <span
                    v-if="row.id === teacher.nextReservation?.id"
                    class="rounded-full bg-brighture-gold px-2 py-0.5 text-[10px] font-black text-brighture-ink"
                  >
                    NEXT
                  </span>
                </div>
              </div>

              <!-- Student Row -->
              <div class="flex items-center gap-3">
                <AppImage
                  :src="row.studentPhoto"
                  :alt="row.studentName"
                  class="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div class="min-w-0 flex-1">
                  <button
                    type="button"
                    @click="selectedStudent = row"
                    class="block truncate text-sm font-black text-slate-900 hover:text-brighture-bronze text-left"
                  >
                    {{ row.studentName }}
                  </button>
                  <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span class="text-[10px] font-semibold text-slate-400">#{{ row.studentId }}</span>
                    <span class="rounded-full bg-slate-100 px-2 py-0.2 text-[9px] font-bold text-slate-600">
                      {{ row.membership }}
                    </span>
                    <span v-if="row.substitution" class="rounded-full bg-amber-100 px-2 py-0.2 text-[9px] font-bold text-amber-800">
                      Sub
                    </span>
                  </div>
                </div>
              </div>

              <!-- Subject & Topic Box -->
              <div class="rounded-xl bg-slate-50/90 p-3 border border-slate-100 space-y-1">
                <div class="flex items-center gap-1.5">
                  <span
                    class="rounded-md px-1.5 py-0.5 text-[9px] font-black"
                    :class="subjectBadgeStyle(row.subject)"
                  >
                    {{ extractSubjectCode(row.subject) }}
                  </span>
                  <span class="text-xs font-bold text-slate-800 truncate">
                    {{ cleanSubjectTitle(row.subject) }}
                  </span>
                </div>
                <p v-if="row.topic" class="text-xs text-slate-600 font-medium line-clamp-2">
                  <strong class="text-slate-700">Topic:</strong> {{ row.topic }}
                </p>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                v-if="row.meetLink"
                :href="row.meetLink"
                target="_blank"
                rel="noopener"
                class="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2 px-3 text-center text-xs font-extrabold text-slate-950 transition active:scale-95 shadow-2xs"
              >
                📹 Join Meet
              </a>
              <span
                v-else
                class="flex-1 rounded-xl bg-rose-50 py-2 px-3 text-center text-[11px] font-bold text-rose-700 border border-rose-200/60"
              >
                No link
              </span>

              <button
                type="button"
                @click="selectedStudent = row"
                class="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 px-3 text-center text-xs font-bold text-slate-700 transition active:scale-95"
              >
                Details
              </button>
            </div>
          </article>
        </div>

        <!-- ============================================================= -->
        <!-- VIEW 3: Mobile & Tablet Cards (< lg)                          -->
        <!-- ============================================================= -->
        <div class="space-y-3 lg:hidden">
          <article
            v-for="row in group.items"
            :key="row.id"
            class="rounded-2xl border bg-white p-4 shadow-xs transition"
            :class="row.id === teacher.nextReservation?.id
              ? 'border-brighture-gold ring-1 ring-brighture-gold'
              : 'border-slate-200/80'"
          >
            <!-- Card Header: Time slot + Status badge -->
            <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-[11px]">
                  <i class="fa-regular fa-clock"></i>
                </span>
                <div>
                  <span class="text-xs font-extrabold text-slate-900">
                    {{ formatPrimaryTime(row) }}
                  </span>
                  <span class="text-[10px] text-slate-400 ml-1.5">
                    ({{ formatSecondaryTime(row) }})
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <span
                  v-if="row.id === teacher.nextReservation?.id"
                  class="rounded-full bg-brighture-gold px-2 py-0.5 text-[9px] font-black text-brighture-ink"
                >
                  NEXT
                </span>
              </div>
            </div>

            <!-- Student Profile Row -->
            <div class="mt-3 flex items-start gap-3">
              <AppImage
                :src="row.studentPhoto"
                :alt="row.studentName"
                class="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div class="min-w-0 flex-1">
                <button
                  type="button"
                  @click="selectedStudent = row"
                  class="block truncate text-sm font-extrabold text-slate-900 hover:text-brighture-bronze text-left"
                >
                  {{ row.studentName }}
                </button>
                <p class="truncate text-xs font-semibold text-slate-600 mt-0.5">
                  {{ row.subject }}
                </p>
                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                    {{ row.membership }}
                  </span>
                  <span v-if="row.substitution" class="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                    Sub
                  </span>
                </div>
              </div>
            </div>

            <!-- Topic Banner -->
            <div v-if="row.topic" class="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700">
              <span class="font-bold text-slate-900">Topic:</span> {{ row.topic }}
            </div>

            <!-- Action Buttons -->
            <div class="mt-3.5 flex gap-2">
              <a
                v-if="row.meetLink"
                :href="row.meetLink"
                target="_blank"
                rel="noopener"
                class="flex-1 rounded-xl bg-emerald-500 py-2.5 px-3 text-center text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400 active:scale-95 shadow-2xs"
              >
                📹 Join Meet
              </a>
              <span
                v-else
                class="flex-1 rounded-xl bg-rose-50 py-2.5 px-3 text-center text-[11px] font-bold text-rose-700 border border-rose-200/60"
              >
                No link
              </span>

              <button
                type="button"
                @click="selectedStudent = row"
                class="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                Details
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Reminder footer info note -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-xs">
        <div class="flex items-center gap-2.5 text-xs text-slate-500 justify-center sm:justify-start">
          <i class="fa-solid fa-circle-info text-sky-500 text-sm"></i>
          <span>Meeting rooms become joinable 5 minutes prior to scheduled start. Google Calendar sync runs continuously.</span>
        </div>
        <a
          href="mailto:support@brighture-edu.com"
          class="mt-2 sm:mt-0 text-xs font-bold text-brighture-bronze hover:underline shrink-0"
        >
          Report missing link →
        </a>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- EMPTY STATE                                                       -->
    <!-- ================================================================= -->
    <div
      v-else
      class="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs space-y-3"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 text-2xl">
        <i class="fa-solid fa-calendar-xmark"></i>
      </div>
      <h3 class="text-base font-extrabold text-slate-800">No reservations found</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        {{ searchQuery
          ? `No upcoming lessons match your search "${searchQuery}".`
          : 'There are no upcoming lessons matching the selected filter.'
        }}
      </p>
      <div class="pt-2">
        <button
          type="button"
          @click="resetFilters"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95"
        >
          <i class="fa-solid fa-rotate-left text-[10px]"></i>
          <span>Clear Filters</span>
        </button>
      </div>
    </div>

    <!-- Student Detail Modal Dialog -->
    <StudentDetailModal :student="selectedStudent" @close="selectedStudent = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AppImage from '../../components/AppImage.vue';
import StudentDetailModal from '../../components/teacher/StudentDetailModal.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

// --- View Preferences --------------------------------------------------------
const viewMode = ref('table'); // 'table' | 'grid'
const timeZoneMode = ref('manila'); // 'manila' | 'tokyo' | 'student'
const searchQuery = ref('');
const activeTab = ref('all');
const selectedStudent = ref(null);

// --- Stats Computeds ---------------------------------------------------------
const freeConversationCount = computed(() =>
  teacher.reservations.filter((r) => r.category === 'Free Conversation').length
);

// --- Filter Tabs -------------------------------------------------------------
const tabs = computed(() => [
  { key: 'all', label: 'All upcoming', count: teacher.reservations.length },
  { key: 'today', label: 'Today', count: teacher.todaysReservations.length },
  {
    key: 'later',
    label: 'Tomorrow & Later',
    count: teacher.reservations.filter((r) => !teacher.todaysReservations.some((t) => t.id === r.id)).length,
  },
  { key: 'fc', label: 'Free Conversation', count: freeConversationCount.value },
  {
    key: 'sub',
    label: 'Substitutions',
    count: teacher.reservations.filter((r) => r.substitution).length,
  },
]);

// --- Filtering Logic ---------------------------------------------------------
const filteredReservations = computed(() => {
  let list = teacher.reservations;

  // Tab filter
  if (activeTab.value === 'today') {
    list = teacher.todaysReservations;
  } else if (activeTab.value === 'later') {
    list = list.filter((r) => !teacher.todaysReservations.some((t) => t.id === r.id));
  } else if (activeTab.value === 'fc') {
    list = list.filter((r) => r.category === 'Free Conversation');
  } else if (activeTab.value === 'sub') {
    list = list.filter((r) => r.substitution);
  }

  // Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        (r.topic && r.topic.toLowerCase().includes(q)) ||
        String(r.studentId).includes(q) ||
        (r.note && r.note.toLowerCase().includes(q))
    );
  }

  return list;
});

// --- Date Grouping -----------------------------------------------------------
const extractDateKey = (row) => {
  // e.g. "Sep 2, 2026 18:00" -> "Sep 2, 2026"
  const parts = row.startManila.split(' ');
  return parts.slice(0, 3).join(' ');
};

const groupedReservations = computed(() => {
  const groupsMap = new Map();

  const firstReservation = teacher.reservations[0];
  const todayKey = firstReservation ? extractDateKey(firstReservation) : '';

  // Determine tomorrow's key (e.g. Sep 3, 2026)
  const tomorrowKey = teacher.reservations.find(
    (r) => extractDateKey(r) !== todayKey
  ) ? extractDateKey(teacher.reservations.find((r) => extractDateKey(r) !== todayKey)) : '';

  filteredReservations.value.forEach((item) => {
    const dateKey = extractDateKey(item);
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, {
        dateKey,
        isToday: dateKey === todayKey,
        isTomorrow: dateKey === tomorrowKey,
        displayDate: formatGroupHeaderDate(dateKey),
        items: [],
      });
    }
    groupsMap.get(dateKey).items.push(item);
  });

  return Array.from(groupsMap.values());
});

const formatGroupHeaderDate = (dateKey) => {
  // dateKey is "Sep 2, 2026"
  const parsed = new Date(dateKey);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateKey;
};

// --- Time Formatting Utilities -----------------------------------------------
const formatPrimaryTime = (row) => {
  if (timeZoneMode.value === 'tokyo') {
    return row.rangeTokyo || row.startTokyo;
  }
  if (timeZoneMode.value === 'student') {
    return row.startStudent;
  }
  return row.rangeManila || row.startManila;
};

const formatSecondaryTime = (row) => {
  if (timeZoneMode.value === 'tokyo') {
    return `Manila: ${row.rangeManila || row.startManila}`;
  }
  if (timeZoneMode.value === 'student') {
    return `Manila: ${row.rangeManila || row.startManila}`;
  }
  return `Tokyo: ${row.rangeTokyo || row.startTokyo}`;
};

const formatStudentTimeShort = (row) => {
  return `Student: ${row.startStudent}`;
};

// --- Subject & Code Utilities ------------------------------------------------
const extractSubjectCode = (subject) => {
  const match = subject.match(/\[(.*?)\]/);
  return match ? match[1] : 'ESL';
};

const cleanSubjectTitle = (subject) => {
  return subject.replace(/\[.*?\]\s*/, '');
};

const subjectBadgeStyle = (subject) => {
  const code = extractSubjectCode(subject).toUpperCase();
  if (code === 'SF') return 'bg-sky-100 text-sky-800 border border-sky-200/60';
  if (code.startsWith('PP')) return 'bg-purple-100 text-purple-800 border border-purple-200/60';
  if (code === 'DC' || code === 'FC') return 'bg-emerald-100 text-emerald-800 border border-emerald-200/60';
  if (code === 'RW') return 'bg-amber-100 text-amber-800 border border-amber-200/60';
  if (code.startsWith('LS')) return 'bg-indigo-100 text-indigo-800 border border-indigo-200/60';
  return 'bg-slate-100 text-slate-700';
};

const resetFilters = () => {
  searchQuery.value = '';
  activeTab.value = 'all';
};
</script>

<style scoped>
/* Scoped micro-enhancements */
</style>
