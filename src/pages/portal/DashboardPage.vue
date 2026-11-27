<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
    <!-- Keep the subscription notice directly below the portal header. -->
    <div
      v-if="showRenewalReminder"
      role="status"
      class="group relative flex flex-col gap-3.5 sm:gap-4 overflow-hidden rounded-[20px] sm:rounded-[22px] bg-[linear-gradient(110deg,#0F1319_0%,#161C26_55%,#1E1A10_100%)] px-4 py-3 sm:px-6 sm:py-3.5 text-white shadow-lg shadow-slate-900/15 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 border border-white/10"
    >
      <!-- The same ink and gold as the next-class card, so the notice reads as part of the page rather than an ad. -->
      <div class="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#FFCD00]/15 blur-2xl"></div>
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
      <div class="relative z-10 flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div class="relative flex shrink-0 items-center justify-center">
          <img
            :src="coinsImage"
            alt="Subscription Coins"
            class="h-10 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105 sm:h-11"
          />
        </div>
        <p class="min-w-0 text-[13px] font-medium leading-normal tracking-[-0.01em] text-slate-300 sm:text-sm">
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
      <div class="relative z-10 flex shrink-0 items-center justify-end gap-2.5 sm:gap-3">
        <RouterLink
          to="/purchase"
          class="inline-flex items-center justify-center rounded-full bg-[#FFCD00] px-5 py-2 text-[13px] font-extrabold text-slate-950 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-[#FFD933] hover:shadow-md active:scale-[0.98] sm:px-6 sm:text-sm"
        >
          Renew
        </RouterLink>
        <button
          type="button"
          @click="renewalReminderDismissed = true"
          class="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white active:scale-95 sm:h-8 sm:w-8"
          aria-label="Dismiss reminder"
        >
          <i class="fa-solid fa-xmark text-xs sm:text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Top of the page: the latest school announcements, with the two
         quick actions beside them on wide screens (xl) and under them below
         that. -->
    <section class="flex flex-col xl:flex-row gap-5 xl:gap-6 items-stretch xl:items-center">
      <!-- The newest posts from the blog's Announcement category as a list.
           Three rows show at once; the list scrolls to reveal all five, and
           the button under it steps through them for people who don't notice
           the list scrolls. Each row's Read more opens the post on the blog
           in a new tab. -->
      <section aria-labelledby="announcements-title" class="min-w-0 w-full flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2 sm:px-5">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="w-2.5 h-5 rounded-full bg-brighture-gold shrink-0" aria-hidden="true"></span>
            <!-- Title and source share one line to keep the header slim. It
                 stays a size smaller than the page's section headings because
                 it heads a card, not a section. -->
            <div class="flex min-w-0 items-baseline gap-2">
              <h2 id="announcements-title" class="m-0 text-base font-extrabold tracking-tight text-slate-900">Announcements</h2>
              <p class="m-0 hidden truncate text-xs font-medium text-slate-400 sm:block">from the Brighture blog</p>
            </div>
          </div>
          <a
            :href="ANNOUNCEMENTS_URL"
            target="_blank"
            rel="noopener"
            class="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-slate-900"
          >
            View all
            <i class="fa-solid fa-arrow-up-right-from-square text-[9px]" aria-hidden="true"></i>
          </a>
        </header>

        <div
          ref="annList"
          class="ann-list overflow-y-auto overscroll-contain motion-safe:scroll-smooth"
          @scroll.passive="onAnnScroll"
        >
          <div
            v-for="post in latestAnnouncements"
            :key="post.id"
            class="ann-row flex items-center gap-2.5 border-b border-slate-100 pl-2.5 pr-4 last:border-b-0 sm:pl-3.5 sm:pr-5"
            :class="post.pinned ? 'bg-brighture-cream/40' : ''"
          >
            <!-- The tag leads the row, so pinned and new posts stand out when
                 scanning down the titles. Its slot has the same width on every
                 row, tag or not, so the titles start on one line. -->
            <span class="flex w-9 shrink-0 justify-center">
              <span v-if="post.pinned" class="text-brighture-bronze" title="Pinned">
                <i class="fa-solid fa-thumbtack text-xs" aria-hidden="true"></i>
                <span class="sr-only">Pinned:</span>
              </span>
              <span v-else-if="isNewPost(post.date)" class="rounded-full bg-emerald-50 px-1.5 py-px text-[11px] font-bold text-emerald-700">New</span>
            </span>
            <span class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800" :title="post.title">{{ post.title }}</span>
            <time :datetime="post.date" class="hidden shrink-0 whitespace-nowrap text-[11px] font-medium tabular-nums text-slate-400 md:inline">{{ formatPostDate(post.date) }}</time>
            <!-- The post's title is in the link's accessible name, so a list
                 of "Read more" links still says where each one goes. -->
            <a
              :href="post.url"
              target="_blank"
              rel="noopener"
              :aria-label="`Read more: ${post.title} (opens the blog)`"
              class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-brighture-gold hover:bg-brighture-cream hover:text-brighture-bronze focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            >
              Read more
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px]" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        <!-- Steps the list down one row at a time; at the end it takes you
             back to the top. -->
        <button
          v-if="latestAnnouncements.length > 3"
          type="button"
          class="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brighture-gold"
          @click="scrollAnnouncements"
        >
          <i class="fa-solid text-[10px]" :class="annAtEnd ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
          {{ annAtEnd ? 'Back to top' : 'Show more' }}
        </button>
      </section>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-2 xl:grid-cols-1 gap-2.5 sm:gap-3 w-full xl:w-52 xl:shrink-0">
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
          <i class="fa-solid fa-bolt shrink-0 text-[#FFCD00]" aria-hidden="true"></i> <span>Talk Now</span>
        </button>

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
      <div
        class="grid grid-cols-1 items-start gap-x-6 gap-y-4 xl:items-stretch"
        :class="referralHidden ? '' : 'xl:grid-cols-[minmax(0,1fr)_330px]'"
        :data-referral="referralHidden ? null : ''"
      >
        <!-- In the first column only, so the links sit over the classes card
             rather than over the referral card beside it. -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span>
            <h2 class="min-w-0 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              Scheduled Online Classes
            </h2>
            <span v-if="upcomingLessons.length" class="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-extrabold">
              {{ upcomingLessons.length }} Upcoming
            </span>
          </div>
          <div class="flex items-center gap-3">
            <RouterLink to="/history" class="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
              <span>Past lessons</span>
              <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
            </RouterLink>
          </div>
        </div>
        <div class="min-w-0 xl:col-start-1 xl:flex xl:flex-col">
      <!-- Unified Card Container -->
      <div class="relative bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <!-- 1. FEATURED NEXT IMMEDIATE CLASS (SPOTLIGHT) -->
        <div
          v-if="user.nextUpcomingClass"
          class="relative overflow-hidden text-white p-6 sm:p-8 squeezed:p-6 border-b border-slate-900/50 bg-[radial-gradient(115%_135%_at_90%_-12%,rgba(255,205,0,0.17)_0%,rgba(255,205,0,0.07)_26%,rgba(255,205,0,0.02)_44%,transparent_64%),radial-gradient(85%_115%_at_2%_108%,rgba(255,189,0,0.10)_0%,rgba(255,189,0,0.035)_32%,transparent_66%),linear-gradient(140deg,#0F1319_0%,#131925_24%,#161C26_48%,#111722_72%,#0A0D12_100%)]"
        >
          <!-- lit top edge, so the card reads as raised rather than cut out -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

          <div class="relative z-10 space-y-6">
            <!-- Status row -->
            <div class="flex flex-wrap items-center gap-2.5">
              <!-- Two parts: a solid tag says what this card is, and the
                   countdown beside it carries the number the student scans for. -->
              <span class="inline-flex items-stretch overflow-hidden rounded-full border border-emerald-400/40 bg-emerald-500/10 text-xs">
                <span class="inline-flex items-center bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-950">
                  Next class
                </span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 font-semibold text-emerald-100">
                  <i class="fa-regular fa-clock text-[11px] text-emerald-300" aria-hidden="true"></i>
                  in <strong class="font-black text-white">{{ countdownLabel(user.nextUpcomingClass.minutesUntil) }}</strong>
                </span>
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
                {{ nextPrepLeft === 0 ? 'Material reviewed' : 'Material to review' }}
              </button>
            </div>

            <!-- From xl to about 1380px the referral card sits beside this one
                 and squeezes it, so the photo, title and buttons step down a
                 size there to keep the buttons on the right. The `squeezed:`
                 variant (tailwind.config.js) covers exactly that: that width
                 range, and only while the referral card is shown
                 (data-referral on the grid). -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 squeezed:gap-4">
              <!-- Teacher alongside the class it belongs to -->
              <div class="flex min-w-0 items-start gap-4 sm:gap-5 max-w-2xl squeezed:gap-3">
                <button
                  type="button"
                  @click="openTeacherDetails(teacherForModal(user.nextUpcomingClass))"
                  class="group w-20 sm:w-24 shrink-0 text-center"
                  title="View teacher profile"
                >
                  <AppImage
                    :src="user.nextUpcomingClass.teacherPhoto"
                    :alt="user.nextUpcomingClass.teacherName"
                    eager
                    class="w-20 h-20 sm:w-24 sm:h-24 squeezed:h-20 squeezed:w-20 mx-auto rounded-full border-2 border-brighture-amber/70 transition group-hover:border-brighture-gold/50 group-hover:scale-105"
                  />
                </button>

                <!-- Who first, then what and when: the teacher's name is the
                     heading (and opens their profile, like the photo), the
                     subject sits under it, then the time. -->
                <div class="min-w-0 pt-1">
                  <h3 class="flex min-w-0 text-xl sm:text-2xl squeezed:text-xl font-extrabold tracking-tight text-white">
                    <button
                      type="button"
                      @click="openTeacherDetails(teacherForModal(user.nextUpcomingClass))"
                      class="min-w-0 truncate text-left transition hover:text-brighture-gold focus:outline-none focus-visible:underline"
                      title="View teacher profile"
                    >
                      {{ user.nextUpcomingClass.teacherName }}
                    </button>
                  </h3>
                  <p class="mt-1.5 flex min-w-0 items-center text-sm font-semibold text-slate-200">
                    <SubjectCode :subject="user.nextUpcomingClass.subject" size="sm" />
                  </p>
                  <p class="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                    <i class="fa-regular fa-clock text-xs text-slate-400" aria-hidden="true"></i>
                    {{ user.nextUpcomingClass.timeFull }}
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
                  class="inline-flex w-full items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base squeezed:px-4 squeezed:py-3 squeezed:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap"
                >
                  <!-- A soft shadow on the icon and label lifts them off the
                       green, the same treatment as the teacher's join button. -->
                  <GoogleMeetIcon size="lg" class="[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]" />
                  <span class="[text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">Enter Google Meet</span>
                </a>
                <button
                  type="button"
                  @click="openDetails(user.nextUpcomingClass)"
                  class="inline-flex w-full items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm sm:text-base squeezed:px-4 squeezed:py-3 squeezed:text-sm transition border border-white/15 text-center whitespace-nowrap"
                >
                  <i class="fa-solid fa-circle-info" aria-hidden="true"></i> Class Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Nothing booked: the spotlight keeps its place and dark surface, so
             the page doesn't jump when the first class is booked, and offers
             the two ways to get into a lesson instead. -->
        <div
          v-else
          class="relative overflow-hidden px-6 py-8 text-white sm:px-8 sm:py-10 bg-[radial-gradient(115%_135%_at_90%_-12%,rgba(255,205,0,0.17)_0%,rgba(255,205,0,0.07)_26%,rgba(255,205,0,0.02)_44%,transparent_64%),linear-gradient(140deg,#0F1319_0%,#161C26_48%,#0A0D12_100%)]"
        >
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          <!-- Demo only, as on the lesson list: lets a presenter add a class
               back from the empty state. Invisible until hovered or focused. -->
          <div class="absolute left-0 top-1/2 z-10 -translate-y-1/2 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100" aria-label="Demo controls">
            <button type="button" @click="demoAddClass" class="inline-flex h-6 w-5 items-center justify-center rounded-r-md bg-white/20 text-[10px] text-white hover:bg-white/30" title="Demo: add a class" aria-label="Demo: add a class">
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
            </button>
          </div>
          <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-4">
              <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brighture-gold ring-1 ring-inset ring-white/15">
                <i class="fa-regular fa-calendar-plus text-xl" aria-hidden="true"></i>
              </span>
              <div class="min-w-0">
                <h3 class="m-0 text-xl font-extrabold tracking-tight sm:text-2xl">You have no classes booked</h3>
                <p class="m-0 mt-1.5 max-w-md text-sm font-medium leading-relaxed text-slate-300">
                  Pick a teacher and a time that suits you, or talk to a teacher who is free right now.
                </p>
              </div>
            </div>
            <div class="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
              <RouterLink
                to="/booking"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#FFCD00] px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-black/20 transition hover:bg-[#FFD933] active:scale-[0.98]"
              >
                <i class="fa-solid fa-calendar-days" aria-hidden="true"></i> Book a class
              </RouterLink>
              <button
                type="button"
                @click="showFreeConversationModal = true"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                <i class="fa-solid fa-bolt text-brighture-gold" aria-hidden="true"></i> Talk Now
              </button>
            </div>
          </div>
        </div>

        <!-- 2. SUBSEQUENT SCHEDULED LESSONS. Only under a featured class: with
             nothing booked the empty state above says it all, and "after this
             one" would point at a class that isn't there. -->
        <div v-if="user.nextUpcomingClass" class="sched relative px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 bg-white space-y-3">
          <!-- Demo only: there is no backend, so these let a presenter add or
               remove a class to show the list at different lengths. They stay
               invisible on the card's left edge until hovered or focused. -->
          <div class="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100" aria-label="Demo controls">
            <button type="button" @click="demoAddClass" class="inline-flex h-6 w-5 items-center justify-center rounded-r-md bg-slate-800 text-[10px] text-white hover:bg-slate-700" title="Demo: add a class" aria-label="Demo: add a class">
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
            </button>
            <button type="button" @click="demoRemoveClass" :disabled="!scheduledLessons.length" class="inline-flex h-6 w-5 items-center justify-center rounded-r-md bg-slate-800 text-[10px] text-white hover:bg-slate-700 disabled:opacity-40" title="Demo: remove a class" aria-label="Demo: remove a class">
              <i class="fa-solid fa-minus" aria-hidden="true"></i>
            </button>
          </div>

          <!-- The count lives once, in the section header's badge. -->
          <h3 class="m-0 text-sm font-extrabold text-slate-900 leading-tight">Later classes</h3>

          <!-- Desktop Table View -->
          <div v-if="scheduledLessons.length" class="sched__table">
            <table class="w-full table-fixed text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <!-- The actions column holds one Details button, so it gets a
                       fixed width and the rest goes to the columns with text. -->
                  <th class="w-[30%] py-3 px-2.5 sm:px-3">Date &amp; time</th>
                  <th class="w-[24%] py-3 px-2.5 sm:px-3">Teacher</th>
                  <th class="py-3 px-2.5 sm:px-3">Subject</th>
                  <th class="sched__actions py-3 px-2.5 sm:px-3 text-right"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr
                  v-for="lesson in scheduledLessons"
                  :key="lesson.id"
                  class="transition-colors hover:bg-slate-50/70 group"
                  :class="lesson.isNext ? 'bg-brighture-cream/30' : ''"
                >
                  <td class="py-3.5 px-2.5 sm:px-3 align-middle">
                    <div class="flex items-center gap-2">
                      <span v-if="lesson.isNext" class="w-2 h-2 rounded-full bg-emerald-500" title="Next upcoming lesson"></span>
                      <div>
                        <div class="whitespace-nowrap font-bold text-slate-800">{{ lesson.date }}</div>
                        <div class="whitespace-nowrap text-slate-500 text-[11px] font-semibold mt-0.5">{{ lesson.time }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-2.5 sm:px-3 align-middle">
                    <button
                      type="button"
                      @click="openTeacherDetails(teacherForModal(lesson))"
                      class="flex min-w-0 items-center gap-2 text-left group/teacher cursor-pointer"
                      title="View teacher profile"
                    >
                      <AppImage
                        :src="lesson.teacherPhoto"
                        :alt="lesson.teacherName"
                        class="h-9 w-9 shrink-0 rounded-full ring-2 ring-white outline outline-1 outline-slate-200 shadow-2xs transition group-hover/teacher:outline-brighture-gold/50"
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
                  <td class="py-3.5 px-2.5 sm:px-3 align-middle">
                    <!-- A flex parent lets the name shrink and end in an ellipsis. -->
                    <div class="flex min-w-0 font-bold text-slate-700" :title="lesson.subject"><SubjectCode :subject="lesson.subject" size="sm" /></div>
                  </td>
                  <!-- Only the featured class above gets a Meet button; these come
                       later, so their link waits in class details until it's their
                       turn. Rescheduling stays in class details too. -->
                  <td class="py-3 px-2.5 sm:px-3 align-middle">
                    <div class="flex items-center justify-end">
                      <button
                        type="button"
                        @click="detailsLesson = lesson"
                        class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer"
                        title="View class details"
                      >
                        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                        <span class="sched__details-label">Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Narrow / Mobile View: Restructured 2-line Thumb-Sized Stacked List (Never Horizontal Scroll or Chunky Disjointed Cards) -->
          <div v-if="scheduledLessons.length" class="sched__rows border border-slate-200/90 rounded-2xl overflow-hidden bg-white divide-y divide-slate-100 shadow-2xs">
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
                <!-- From sm up: when | photo | who and what, like an agenda. The
                     time leads in a fixed-width column, so times and names line
                     up down the list and the row has no gap in the middle. On
                     phones the time sits at the right end instead, where the
                     row is narrow enough that nothing is left empty. -->
                <div class="flex items-center gap-3">
                  <div class="hidden w-28 shrink-0 border-r border-slate-100 pr-3 sm:block">
                    <p class="m-0 text-sm font-black tabular-nums tracking-tight text-slate-900">{{ startTime(lesson.time) }}</p>
                    <p class="m-0 mt-0.5 truncate text-[11px] font-medium text-slate-500">{{ lesson.date }}</p>
                  </div>

                  <AppImage
                    :src="lesson.teacherPhoto"
                    :alt="lesson.teacherName"
                    class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                  />

                  <div class="min-w-0 flex-1">
                    <p class="m-0 truncate text-sm font-bold text-slate-900">{{ lesson.teacherName }}</p>
                    <div class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                      <SubjectCode :subject="lesson.subject" size="sm" />
                    </div>
                    <div v-if="lesson.isSubstitute || lesson.isNext" class="mt-1.5 flex flex-wrap gap-1">
                      <span
                        v-if="lesson.isNext"
                        class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200"
                      >
                        Next up
                      </span>
                      <span
                        v-if="lesson.isSubstitute"
                        class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200"
                      >
                        <i class="fa-solid fa-arrows-rotate text-[8px]" aria-hidden="true"></i> Substitute
                      </span>
                    </div>
                  </div>

                  <div class="shrink-0 text-right sm:hidden">
                    <p class="m-0 text-sm font-black tabular-nums tracking-tight text-slate-900">{{ startTime(lesson.time) }}</p>
                    <p class="m-0 mt-1 text-xs font-medium text-slate-500">{{ lesson.date }}</p>
                  </div>

                  <i
                    class="fa-solid fa-chevron-down shrink-0 text-[10px] text-slate-400 transition-transform duration-200 group-hover:text-slate-600"
                    :class="{ 'rotate-180 text-brighture-bronze': isLessonOpen(lesson) }"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>

              <!-- Expanded In-Place Drawer: Hidden isn't deleted. Tap the row. Actions slide in. Two fields expand in place. A full record, never a new page for a glance -->
              <div
                v-if="isLessonOpen(lesson)"
                class="bg-slate-50/80 border-t border-slate-100 px-3.5 sm:px-4 py-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <!-- The row above already shows the teacher, subject, date and
                     start, so the drawer adds only what it doesn't: the full time
                     range and a way to the teacher's profile. -->
                <div class="flex items-center justify-between gap-3 text-xs">
                  <span class="inline-flex min-w-0 items-center gap-1.5 font-semibold text-slate-600">
                    <i class="fa-regular fa-clock text-slate-400" aria-hidden="true"></i>
                    <span class="truncate tabular-nums">{{ lesson.time }}</span>
                  </span>
                  <button
                    type="button"
                    @click.stop="openTeacherDetails(teacherForModal(lesson))"
                    class="shrink-0 text-[11px] font-bold text-brighture-bronze hover:underline cursor-pointer"
                  >
                    Teacher profile →
                  </button>
                </div>

                <!-- Actions: one row of three. No Meet button here: only the
                     featured class above gets one. Reschedule's column is a
                     little wider so its word fits on a 360px phone. -->
                <div>
                  <div class="grid grid-cols-[1fr_1.25fr_1fr] gap-1.5">
                    <button
                      type="button"
                      @click.stop="detailsLesson = lesson"
                      class="inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-1.5 py-2 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100 active:scale-95"
                    >
                      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                      <span class="truncate">Details</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="requestRescheduleFromDetails(lesson)"
                      class="inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-amber-200 bg-amber-50 px-1.5 py-2 text-[11px] font-bold text-amber-900 shadow-2xs transition hover:border-amber-300 hover:bg-amber-100 active:scale-95"
                    >
                      <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
                      <span class="truncate">Reschedule</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="cancelTargetLesson = lesson"
                      :disabled="!canCancelRow(lesson)"
                      class="inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-1.5 py-2 text-[11px] font-bold text-slate-500 shadow-2xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500"
                      :title="canCancelRow(lesson) ? 'Cancel class' : LEVEL_CHECK_CANCEL_NOTE"
                    >
                      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                      <span class="truncate">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <i class="fa-regular fa-calendar text-base" aria-hidden="true"></i>
            </span>
            <p class="m-0 text-sm font-bold text-slate-700">Nothing else booked</p>
            <p class="m-0 text-xs font-medium text-slate-400">Classes you book after this one will show here.</p>
          </div>
        </div>

        <!-- Policies sit on the card's bottom edge. The lesson list above
             takes any spare height, so no blank band opens under this row
             when the card stretches to the referral card's height. The rules
             open in a pop-up above the row instead of expanding the card. -->
        <div ref="policiesWrap" class="relative border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-6">
          <button
            type="button"
            @click="policiesOpen = !policiesOpen"
            class="inline-flex items-center gap-2 rounded-full py-1 text-xs font-bold text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            :class="policiesOpen ? 'text-slate-800' : ''"
            :aria-expanded="policiesOpen"
            aria-controls="booking-policies"
          >
            <i class="fa-solid fa-circle-info text-[13px] text-slate-400" aria-hidden="true"></i>
            Booking & cancellation policies
          </button>
          <div
            v-if="policiesOpen"
            id="booking-policies"
            role="dialog"
            aria-label="Booking & cancellation policies"
            class="absolute bottom-full left-4 z-30 mb-2 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-lg sm:left-6"
          >
            <p class="m-0 flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <i class="fa-solid fa-shield-halved text-xs text-slate-400" aria-hidden="true"></i>
              Booking & cancellation policies
            </p>
            <ul class="m-0 mt-3 list-none space-y-2.5 p-0 text-xs leading-relaxed text-slate-500">
              <li><strong class="block font-bold text-slate-700">Cancelling a class</strong>Free until 3 hours before start time (points refunded).</li>
              <li><strong class="block font-bold text-slate-700">Trial lesson or counseling</strong>Free until {{ LEVEL_CHECK_CANCEL_MINUTES }} minutes before start time.</li>
              <li><strong class="block font-bold text-slate-700">Changing a class</strong>Update the subject or lesson notes until 2 hours before.</li>
            </ul>
          </div>
        </div>
      </div>
        </div>

        <!-- Referral Card: stretched to the height of the classes card beside it.
             Below xl there is no column for it, so it moves to the foot of the
             page instead of pushing the rest of the dashboard down. -->
        <Teleport v-if="!referralHidden" defer to="#dashboard-referral-foot" :disabled="isWide">
        <aside class="w-full xl:col-start-2 xl:row-start-2 xl:flex xl:flex-col" aria-label="Referral rewards">
          <div class="xl:flex-1 relative flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:flex xl:flex-col overflow-hidden rounded-3xl border border-slate-900/40 bg-gradient-to-br from-[#0B0F19] via-[#1A1A3A] to-[#2A184A] text-white shadow-sm transition-all duration-300 hover:shadow-md">
            <!-- Hero Visual Header. The gradient sits on the card, so the
                 header and the reward details below read as one surface. -->
            <div class="xl:flex-1 relative flex flex-col justify-between overflow-hidden p-5 sm:p-6 text-white">
              <!-- Lit top edge -->
              <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent"></div>
              <!-- Ambient glows -->
              <span aria-hidden="true" class="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FFCD00]/12 blur-2xl"></span>
              <span aria-hidden="true" class="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-violet-600/15 blur-2xl"></span>

              <div class="relative z-10 space-y-3">
                <!-- Top badge row -->
                <div class="flex items-center justify-between gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-xs">
                    <i class="fa-solid fa-gift text-amber-300 text-[11px]" aria-hidden="true"></i>
                    Referral Rewards
                  </span>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="referralCloseAsk = true"
                      class="-mr-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
                      title="Hide this card"
                      aria-label="Hide the referral card"
                    >
                      <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>

                <!-- Title & message -->
                <div>
                  <h3 class="text-xl sm:text-[22px] font-black tracking-tight leading-tight text-white">
                    Give $20, Get 5 Pts
                  </h3>
                  <p class="mt-1 text-xs leading-relaxed text-indigo-100/85 font-medium">
                    Invite friends to Brighture. When they begin learning, both of you earn rewards.
                  </p>
                </div>
              </div>

              <!-- Illustration. It takes the
                   leftover height and centres in it, so it sits midway between
                   the title and the reward details however tall the card gets. -->
              <div class="relative z-10 flex w-full flex-1 items-center justify-center py-4">
                <div class="relative flex w-full items-center justify-center">
                  <img
                    :src="referralIllustration"
                    alt="Refer a friend to Brighture"
                    class="h-auto w-full max-w-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>

            <!-- Body: Rewards, Code & Action -->
            <div class="relative z-10 flex flex-col justify-between gap-3.5 p-4 pt-0 sm:p-5 sm:pt-0 md:pt-5 xl:pt-0">
              <!-- Dual reward cards -->
              <div class="grid grid-cols-2 gap-2">
                <!-- For your friend -->
                <div class="relative overflow-hidden rounded-2xl border border-indigo-300/25 bg-indigo-400/10 p-2.5 sm:p-3 transition-all hover:border-indigo-300/40">
                  <div class="flex items-center gap-1.5 text-indigo-200">
                    <i class="fa-solid fa-tag text-[10px]" aria-hidden="true"></i>
                    <span class="text-[9px] font-extrabold uppercase tracking-wide">Friend gets</span>
                  </div>
                  <p class="mt-1 text-base sm:text-lg font-black text-white tracking-tight leading-none">
                    {{ REFERRAL_TERMS.friendDiscountLabel }} <span class="text-[11px] font-bold text-indigo-200">OFF</span>
                  </p>
                  <p class="mt-1 text-[10px] font-medium text-slate-300 leading-tight">
                    first plan purchase
                  </p>
                </div>

                <!-- For you -->
                <div class="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-amber-400/10 p-2.5 sm:p-3 transition-all hover:border-amber-300/50">
                  <div class="flex items-center gap-1.5 text-amber-300">
                    <i class="fa-solid fa-coins text-[10px]" aria-hidden="true"></i>
                    <span class="text-[9px] font-extrabold uppercase tracking-wide">You earn</span>
                  </div>
                  <p class="mt-1 text-base sm:text-lg font-black text-white tracking-tight leading-none">
                    +{{ REFERRAL_TERMS.referrerPoints }} <span class="text-[11px] font-bold text-amber-300">PTS</span>
                  </p>
                  <p class="mt-1 text-[10px] font-medium text-slate-300 leading-tight">
                    for booking classes
                  </p>
                </div>
              </div>

              <!-- Your Referral Code Box -->
              <div class="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-3 transition-colors hover:border-white/20">
                <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-ticket text-amber-300 text-[11px]"></i> Your referral code
                  </span>
                  <span v-if="referralCodeCopied" class="text-emerald-300 font-extrabold flex items-center gap-1">
                    <i class="fa-solid fa-check text-[10px]"></i> Copied!
                  </span>
                </div>
                <div class="mt-1.5 flex items-center justify-between gap-2">
                  <div class="min-w-0 flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-center sm:text-left">
                    <span class="font-mono text-sm sm:text-base font-black tracking-widest text-white select-all">
                      {{ REFERRAL_CODE }}
                    </span>
                  </div>
                  <button
                    type="button"
                    @click="copyReferralCode"
                    :class="referralCodeCopied
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20 hover:text-white'"
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center self-stretch rounded-xl border transition-all active:scale-95 cursor-pointer shadow-xs"
                    :title="referralCodeCopied ? 'Code copied!' : 'Copy referral code'"
                    :aria-label="referralCodeCopied ? 'Code copied' : 'Copy referral code'"
                  >
                    <i :class="referralCodeCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="text-sm" aria-hidden="true"></i>
                  </button>
                </div>
              </div>

              <!-- Primary Action & Navigation -->
              <div class="space-y-2 pt-0.5">
                <button
                  type="button"
                  @click="shareOrCopyReferral"
                  class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFCD00] hover:bg-[#FFD933] text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-extrabold shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                >
                  <i :class="referralLinkCopied ? 'fa-solid fa-check' : canShare ? 'fa-solid fa-share-nodes' : 'fa-regular fa-copy'" class="text-xs"></i>
                  <span>{{ referralLinkCopied ? 'Invite link copied!' : canShare ? 'Share invite' : 'Copy invite link' }}</span>
                </button>

                <div class="flex items-center justify-between px-1 text-[11px]">
                  <RouterLink
                    to="/refer"
                    class="font-bold text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>View referral status</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </RouterLink>
                </div>
              </div>

              <p class="text-[10px] leading-relaxed text-slate-400 text-center sm:text-left">
                Bonus points are credited once your friend's first plan purchase clears.
              </p>
            </div>

            <!-- Asked inside the card rather than in a pop-up, so the choice
                 sits right where the student clicked and nothing else moves. -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0"
              leave-active-class="transition duration-150 ease-in"
              leave-to-class="opacity-0"
            >
              <div
                v-if="referralCloseAsk"
                role="dialog"
                aria-modal="true"
                aria-labelledby="referral-close-title"
                class="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-5 backdrop-blur-sm"
                @keydown.esc="referralCloseAsk = false"
              >
                <div class="w-full max-w-xs">
                  <h4 id="referral-close-title" class="text-base font-black text-white">Hide this card?</h4>
                  <p class="mt-1 text-xs leading-relaxed text-slate-300">
                    You can still invite friends anytime from <strong class="font-bold text-white">Refer a Friend</strong> in the menu.
                  </p>
                  <div class="mt-4 space-y-2">
                    <button
                      v-for="option in REFERRAL_HIDE_OPTIONS"
                      :key="option.key"
                      type="button"
                      @click="hideReferralCard(option.key)"
                      class="flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left transition hover:border-white/30 hover:bg-white/10 cursor-pointer"
                    >
                      <i :class="option.icon" class="w-4 text-center text-sm text-amber-300" aria-hidden="true"></i>
                      <span class="min-w-0">
                        <span class="block text-xs font-extrabold text-white">{{ option.label }}</span>
                        <span class="block text-[10px] text-slate-400">{{ option.hint }}</span>
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="referralCloseAsk = false"
                    class="mt-3 w-full rounded-xl px-3 py-2 text-xs font-bold text-slate-300 transition hover:text-white cursor-pointer"
                  >
                    Keep it
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </aside>
        </Teleport>
      </div>
    </section>

    <!-- What the teacher wrote after the student's most recent completed
         lesson: the thing most worth coming back to the dashboard for. Only
         the written feedback shows; the full record (materials, recording,
         rating) stays on Lesson History, which the links open at this lesson. -->
    <section v-if="lastFeedback" aria-labelledby="last-feedback-title" class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h2 id="last-feedback-title" class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span> Feedback from your last lesson
        </h2>
        <RouterLink to="/history" class="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
          <span>All lessons</span>
          <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
        </RouterLink>
      </div>

      <article class="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:p-6">
        <button
          type="button"
          @click="openTeacherDetails(teacherForModal(lastFeedback))"
          class="group flex shrink-0 items-center gap-3 text-left sm:w-44 sm:flex-col sm:items-start"
          title="View teacher profile"
        >
          <AppImage
            :src="lastFeedback.teacherPhoto"
            :alt="lastFeedback.teacherName"
            class="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 transition group-hover:ring-amber-200 sm:h-14 sm:w-14"
          />
          <span class="min-w-0">
            <span class="block truncate text-sm font-extrabold text-slate-900 transition group-hover:text-brighture-bronze">{{ lastFeedback.teacherName }}</span>
            <span class="mt-0.5 block text-xs font-medium text-slate-500">{{ lastFeedback.date }}</span>
          </span>
        </button>

        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 text-xs font-bold text-slate-700">
            <SubjectCode :subject="lastFeedback.subject" size="sm" />
          </div>
          <blockquote
            v-if="lastFeedback.written"
            class="m-0 mt-2.5 border-l-2 border-brighture-gold pl-3.5 text-sm leading-relaxed text-slate-700 line-clamp-4 whitespace-pre-line"
          >{{ lastFeedback.feedback }}</blockquote>
          <p v-else class="m-0 mt-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-500">
            <i class="fa-regular fa-hourglass-half mr-1.5 text-slate-400" aria-hidden="true"></i>
            {{ lastFeedback.teacherName }} hasn't written feedback for this lesson yet. Check back soon.
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <RouterLink
              v-if="lastFeedback.written"
              :to="{ path: '/history', query: { lesson: lastFeedback.id } }"
              class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
            >
              Read full feedback
              <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
            </RouterLink>
            <RouterLink
              v-if="!lastFeedback.yourRating"
              :to="{ path: '/history', query: { rate: lastFeedback.id } }"
              class="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-2xs transition hover:border-amber-300 hover:bg-amber-100"
            >
              <i class="fa-regular fa-star" aria-hidden="true"></i>
              Rate this lesson
            </RouterLink>
          </div>
        </div>
      </article>
    </section>

    <!-- FEATURED INSTRUCTORS SECTION -->
    <section class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span> Featured Instructors
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Explore instructor profiles and specialties.</p>
        </div>
        <RouterLink
          to="/booking"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition self-start sm:self-auto"
        >
          <span>View 14-day booking calendar</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </RouterLink>
      </div>

      <!-- Clean, unified instructor cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          v-for="instructor in quickInstructors"
          :key="instructor.id"
          @click="openTeacherDetails(instructor)"
          class="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer"
        >
          <div>
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <AppImage
                  :src="instructor.photo"
                  :alt="instructor.name"
                  class="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-amber-200 transition-all"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <h3 class="truncate text-sm font-extrabold text-slate-900 group-hover:text-brighture-bronze transition-colors">
                    {{ instructor.name }}
                  </h3>
                </div>
                <p
                  class="mt-0.5 flex items-center gap-1 text-[11px] font-medium"
                  :class="instructor.next ? 'text-emerald-700' : 'text-slate-400'"
                >
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="instructor.next ? 'bg-emerald-500' : 'bg-slate-300'" aria-hidden="true"></span>
                  <span class="truncate">{{ instructor.next ? `Next open: ${instructor.next.label}` : 'No open times in the next 2 weeks' }}</span>
                </p>
              </div>
            </div>

            <!-- Subject Badges (First 3 + count if more) -->
            <div class="mt-3 flex flex-wrap gap-1">
              <SubjectCode
                v-for="code in bookableCodes(instructor).slice(0, 3)"
                :key="code"
                :subject="code"
                :show-name="false"
                size="sm"
                variant="neutral"
              />
              <span
                v-if="bookableCodes(instructor).length > 3"
                class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100"
              >
                +{{ bookableCodes(instructor).length - 3 }}
              </span>
            </div>
          </div>

          <!-- The card itself opens the profile, so the footer's one job is
               booking: it opens this teacher's calendar on the booking page. -->
          <RouterLink
            :to="{ path: '/booking', query: { teacher: instructor.imageKey } }"
            @click.stop
            class="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-[#FFCD00] px-3 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-[#FFD933] active:scale-[0.98]"
          >
            <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
            Book {{ instructor.name }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- WRITING TASKS SECTION -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span> In-Progress Writing Corrections
        </h2>
        <RouterLink to="/writing" class="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
          <span>Open writing chat</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p
          v-if="!writingTasks.length"
          class="md:col-span-2 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-medium text-slate-400"
        >
          No corrections in progress.
          <RouterLink to="/writing" class="font-bold text-slate-700 hover:underline">Submit a passage →</RouterLink>
        </p>
        <div
          v-for="task in writingTasks"
          :key="task.id"
          class="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group cursor-pointer flex flex-col justify-between"
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
            <p v-if="task.excerpt" class="m-0 mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
              <span v-if="task.replied" class="font-bold text-emerald-700">{{ task.teacherName || 'Your teacher' }}: </span>{{ task.excerpt }}
            </p>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div class="flex items-center gap-2">
              <img v-if="task.teacherPhoto" :src="task.teacherPhoto" class="w-6 h-6 rounded-full object-cover" />
              <span v-else class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                <i class="fa-solid fa-hourglass-half"></i>
              </span>
              <span class="text-xs font-semibold text-slate-600">{{ task.teacherName || 'Waiting for an assessor' }}</span>
            </div>
            <i class="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Where the referral card lands on tablet and phone (see above). -->
    <div id="dashboard-referral-foot" class="xl:hidden"></div>

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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import coinsImage from '@/assets/coins.svg';
import { useUserStore } from '../../stores/useUserStore';
import { useSchoolStore, DEMO_RESET_AT_KEY } from '../../stores/useSchoolStore';
import { CURRENT_STUDENT_ID } from '@/lib/schoolSeed';
import { announcements, ANNOUNCEMENTS_URL } from '@/lib/announcements';
import FreeConversationModal from '../../components/FreeConversationModal.vue';
import ClassDetailsModal from '../../components/ClassDetailsModal.vue';
import CancelClassModal from '../../components/CancelClassModal.vue';
import { assessmentTypeOf, ASSESSMENT_TYPES, LEVEL_CHECK_CANCEL_MINUTES } from '@/lib/brelas';
import EditClassModal from '../../components/EditClassModal.vue';
import RescheduleClassModal from '../../components/RescheduleClassModal.vue';
import TeacherDataModal from '../../components/TeacherDataModal.vue';
import SubjectCode from '../../components/SubjectCode.vue';
import { parseSubject, parseSubjectCodes, INSTRUCTORS, findInstructor } from '@/pages/student-view-v4/constants';
import { nextOpenSlot } from '@/lib/teacherAvailability';
import {
  REFERRAL_CODE,
  REFERRAL_TERMS,
  referralUrl,
  referralShareMessage,
} from '@/lib/referral';
import referralIllustration from '@/assets/referral-illustration.svg';

const router = useRouter();
const user = useUserStore();
const school = useSchoolStore();

// Booked lessons come from the shared store, so the teacher portal sees the same list.
const upcomingLessons = computed(() => user.upcomingLessons);

const showFreeConversationModal = ref(false);
const referralCodeCopied = ref(false);
const referralLinkCopied = ref(false);
const canShare = ref(false);

onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
});

// Tailwind's xl breakpoint: from here the referral card has its own column
// beside the classes card; below it the card is teleported to the page foot.
const wideQuery = window.matchMedia('(min-width: 1280px)');
const isWide = ref(wideQuery.matches);
const onWideChange = (e) => { isWide.value = e.matches; };
wideQuery.addEventListener('change', onWideChange);
onBeforeUnmount(() => wideQuery.removeEventListener('change', onWideChange));

// The student can hide the referral card. "For now" lasts until the tab
// closes; the other two choices are remembered in this browser. Each choice is
// saved as { until, at } (until is 'never', 'session' or an ISO date; at is
// when it was made), and one made before the last Reset demo data is ignored,
// so a reset from any tab or portal brings the card back. Storage can be
// blocked (private mode), in which case the card simply comes back next time.
const REFERRAL_HIDE_KEY = 'brighture:dashboard:referral-hidden';
const REFERRAL_SNOOZE_DAYS = 7;
const REFERRAL_HIDE_OPTIONS = [
  { key: 'session', icon: 'fa-regular fa-eye-slash', label: 'Hide for now', hint: 'It comes back next time you visit' },
  { key: 'snooze', icon: 'fa-regular fa-clock', label: `Remind me in ${REFERRAL_SNOOZE_DAYS} days`, hint: 'Hidden for a week' },
  { key: 'never', icon: 'fa-solid fa-ban', label: "Don't show again", hint: 'Remove it from your dashboard' },
];

const parseHide = (raw) => {
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};

const readReferralHidden = () => {
  try {
    const resetAt = Number(localStorage.getItem(DEMO_RESET_AT_KEY)) || 0;
    const saved = parseHide(sessionStorage.getItem(REFERRAL_HIDE_KEY))
      ?? parseHide(localStorage.getItem(REFERRAL_HIDE_KEY));
    if (!saved || !(saved.at > resetAt)) return false;
    if (saved.until === 'never' || saved.until === 'session') return true;
    return Date.parse(saved.until) > Date.now();
  } catch {
    // Storage blocked: show the card.
    return false;
  }
};

const referralHidden = ref(readReferralHidden());
const referralCloseAsk = ref(false);

// The policies popover closes on a click anywhere outside it or on Escape,
// like any other menu.
const policiesOpen = ref(false);
const policiesWrap = ref(null);
const onPoliciesPointer = (event) => {
  if (policiesOpen.value && policiesWrap.value && !policiesWrap.value.contains(event.target)) {
    policiesOpen.value = false;
  }
};
const onPoliciesKey = (event) => {
  if (event.key === 'Escape') policiesOpen.value = false;
};
onMounted(() => {
  document.addEventListener('pointerdown', onPoliciesPointer);
  document.addEventListener('keydown', onPoliciesKey);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPoliciesPointer);
  document.removeEventListener('keydown', onPoliciesKey);
});

// A reset in another tab or portal does not reload this one, so pick it up
// from the storage event instead.
const onStorageChange = (event) => {
  if (event.key === DEMO_RESET_AT_KEY || event.key === REFERRAL_HIDE_KEY) {
    referralHidden.value = readReferralHidden();
  }
};
window.addEventListener('storage', onStorageChange);
onBeforeUnmount(() => window.removeEventListener('storage', onStorageChange));

const hideReferralCard = (choice) => {
  const at = Date.now();
  try {
    if (choice === 'session') {
      sessionStorage.setItem(REFERRAL_HIDE_KEY, JSON.stringify({ until: 'session', at }));
    } else {
      const until = choice === 'snooze'
        ? new Date(at + REFERRAL_SNOOZE_DAYS * 86400000).toISOString()
        : 'never';
      localStorage.setItem(REFERRAL_HIDE_KEY, JSON.stringify({ until, at }));
    }
  } catch {
    // Storage blocked: the card stays hidden until the page reloads.
  }
  referralCloseAsk.value = false;
  referralHidden.value = true;
  showNotice(
    choice === 'never'
      ? 'Referral card removed. You can still invite friends from Refer a Friend in the menu.'
      : choice === 'snooze'
        ? `Referral card hidden for ${REFERRAL_SNOOZE_DAYS} days.`
        : 'Referral card hidden for now.',
  );
};

const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(REFERRAL_CODE);
    referralCodeCopied.value = true;
    window.setTimeout(() => { referralCodeCopied.value = false; }, 2500);
  } catch {
    router.push('/refer');
  }
};

const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralUrl());
    referralLinkCopied.value = true;
    window.setTimeout(() => { referralLinkCopied.value = false; }, 2500);
  } catch {
    router.push('/refer');
  }
};

const shareOrCopyReferral = async () => {
  if (canShare.value) {
    try {
      await navigator.share({
        title: 'Brighture English Referral',
        text: referralShareMessage(),
        url: referralUrl(),
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  await copyReferralLink();
};

// Five days' warning before a subscription ends, and on after it lapses.
const RENEWAL_WARNING_DAYS = 5;
const renewalReminderDismissed = ref(false);
const showRenewalReminder = computed(() => {
  const days = user.subscriptionDaysLeft;
  return days !== null && days <= RENEWAL_WARNING_DAYS && !renewalReminderDismissed.value;
});
const selectedTeacherForModal = ref(null);

// The announcement list shows the five newest posts; View all opens the rest
// on the blog.
const latestAnnouncements = announcements.slice(0, 5);

const postParts = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
// Posts from the last two weeks get a small New tag.
const isNewPost = (iso) => school.now - postParts(iso).getTime() < 14 * 24 * 3600 * 1000;
// The list shows three rows and scrolls for the rest. The button moves it
// down one row per press and, once the last row is in view, back to the top.
const annList = ref(null);
const annAtEnd = ref(false);
const onAnnScroll = () => {
  const el = annList.value;
  if (el) annAtEnd.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
};
const scrollAnnouncements = () => {
  const el = annList.value;
  if (!el) return;
  if (annAtEnd.value) el.scrollTo({ top: 0 });
  else el.scrollBy({ top: el.querySelector('.ann-row')?.offsetHeight ?? 52 });
};
const formatPostDate = (iso) => postParts(iso)
  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// The spotlight already shows the next class, so the table lists the ones after it.
const scheduledLessons = computed(() =>
  upcomingLessons.value.filter((lesson) => lesson.id !== user.nextUpcomingClass?.id)
);

// Demo controls. Adding books a free class a day after the latest one, with
// the first teacher who is free then, so it never touches the points wallet.
// Removing takes back the latest class outright, as if it was never booked.
const DEMO_SUBJECTS = ['[DC] Daily Conversation', '[RW] Reading & Writing', '[LS1] Listening & Speaking', '[PP101] Pronunciation — Vowels', '[EP] Exam Prep'];
const demoAddClass = () => {
  const starts = upcomingLessons.value.map((l) => school.findLesson(l.id)?.start).filter(Boolean).sort();
  const base = starts.length ? new Date(starts.at(-1)) : new Date(Date.now() + 2 * 3600 * 1000);
  const start = new Date(base.getTime() + 24 * 3600 * 1000);
  start.setUTCMinutes(Math.round(start.getUTCMinutes() / 30) * 30, 0, 0);
  // Start from a different teacher each time, so added classes vary.
  const all = Object.keys(school.db.teachers).map(Number);
  const offset = scheduledLessons.value.length % all.length;
  const teacherIds = [...all.slice(offset), ...all.slice(0, offset)];
  const subject = DEMO_SUBJECTS[scheduledLessons.value.length % DEMO_SUBJECTS.length];
  for (const teacherId of teacherIds) {
    const booked = school.bookLesson({ studentId: CURRENT_STUDENT_ID, teacherId, start: start.toISOString(), points: 0, subject });
    if (booked) return;
  }
};
const demoRemoveClass = () => {
  const last = [...scheduledLessons.value]
    .sort((a, b) => (school.findLesson(a.id)?.start ?? '').localeCompare(school.findLesson(b.id)?.start ?? ''))
    .at(-1);
  if (last) school.undoBooking(last.id);
};

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

// Level checks (trial / counseling) close for cancelling 50 minutes before
// the start; the shared store decides, so the button and the store agree.
const LEVEL_CHECK_CANCEL_NOTE = `Level checks can be cancelled until ${LEVEL_CHECK_CANCEL_MINUTES} minutes before the start.`;
const canCancelRow = (lesson) => !assessmentTypeOf(lesson?.subject) || user.canCancel(lesson.id);

// Free up to 3h before the start (the shared store refunds); later, no refund.
const confirmCancelLesson = (lesson) => {
  cancelTargetLesson.value = null;
  const checkType = assessmentTypeOf(lesson.subject);
  const result = user.cancelLesson(lesson.id);
  if (!result) {
    showNotice(
      checkType
        ? `${LEVEL_CHECK_CANCEL_NOTE} This one could not be cancelled.`
        : 'This class could not be cancelled — it may already have started or been cancelled.',
      true
    );
    return;
  }
  if (checkType) {
    const label = ASSESSMENT_TYPES[checkType].label;
    showNotice(result.points ? `${label} cancelled — ${result.points} points refunded.` : `${label} cancelled.`);
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
  const key = findInstructor(teacher)?.imageKey;
  router.push(key ? { path: '/booking', query: { teacher: key } } : '/booking');
};

// The newest completed lesson. `written` tells real feedback apart from the
// "not written yet" text the History rows fill in, so the card can say so in
// its own words instead of quoting a placeholder as if the teacher wrote it.
const lastFeedback = computed(() => {
  const lesson = user.pastLessons.find((row) => row.status === 'completed');
  if (!lesson) return null;
  return { ...lesson, written: Boolean(school.findLesson(lesson.id)?.feedback) };
});

// The catalogue teachers with the soonest open slot, worked out from the same
// availability the booking calendar uses, so the time on each card is one the
// student can actually book. A teacher with nothing open in the next two
// weeks drops to the end rather than off the list.
const quickInstructors = computed(() =>
  INSTRUCTORS
    .map((teacher) => ({ ...teacher, photo: imageForKey(teacher.imageKey), next: nextOpenSlot(school, teacher) }))
    .sort((a, b) => (a.next ? Date.parse(a.next.iso) : Infinity) - (b.next ? Date.parse(b.next.iso) : Infinity))
    .slice(0, 4)
);

/** Subjects this student can book with a teacher: never Talk Now's [FC], and [TA] only while it is still theirs to take. */
const bookableCodes = (teacher) =>
  parseSubjectCodes(teacher.specialty).filter((code) => code !== '[FC]' && (user.taEligible || code !== '[TA]'));

// A lesson row only knows the teacher's id, name and photo. The pop-up reads
// majors, expertise and the self-introduction from the catalogue entry, so
// hand it that entry; a teacher outside the catalogue (a substitute, say)
// falls back to what the row has.
const teacherForModal = (row) =>
  findInstructor(row) ?? { name: row.teacherName, photo: row.teacherPhoto, teacherId: row.teacherId, specialty: row.subject };

// Open writing tickets for the dashboard cards.
const writingTasks = computed(() =>
  user.writingTickets
    .filter((ticket) => ticket.status !== 'Complete')
    .map((ticket) => {
      const last = ticket.messages[ticket.messages.length - 1];
      const replied = last?.from === 'teacher';
      // Once the teacher has answered, their reply is the news; until then a
      // line of the student's own passage says which piece this is.
      const source = replied ? last : ticket.messages[0];
      return {
        ...ticket,
        replied,
        excerpt: (source?.body || source?.correction || '').replace(/\s+/g, ' ').trim(),
        status: replied ? 'Teacher Replied' : 'In Progress',
        statusColor: replied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
      };
    })
);
</script>

<style scoped>
/* Announcement list. Every row is the same height, so three of them (plus
   the hairlines between them) set the visible height of the list. */
.ann-row { height: 3.25rem; }
.ann-list { max-height: calc(3 * 3.25rem + 2px); scrollbar-width: thin; }

/* The breakpoint belongs to the table, not the screen. With the actions
   column cut to one button, four columns read well from about 500px, which
   covers the dashboard column on a 13" laptop. Below that, the rows take over,
   so the same section restacks itself when placed in a narrow panel. */
.sched { container-type: inline-size; }
.sched__table { display: none; }
.sched__rows { display: block; }

@container (min-width: 31rem) {
  .sched__table { display: block; }
  .sched__rows { display: none; }
}
/* Until the table is roomy, Details shows as its icon alone (the label stays
   for screen readers), so the date and subject keep their width. */
.sched__actions { width: 3.75rem; }
.sched__details-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@container (min-width: 40rem) {
  .sched__actions { width: 6.5rem; }
  .sched__details-label { position: static; width: auto; height: auto; overflow: visible; clip-path: none; }
}

/* Safari 15 and other pre-container-query engines fall back to the viewport. */
@supports not (container-type: inline-size) {
  @media (min-width: 64rem) {
    .sched__table { display: block; }
    .sched__rows { display: none; }
  }
}
</style>
