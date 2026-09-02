<template>
  <div class="flex h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden bg-slate-50 font-sans text-slate-900">
    <RouteProgress />

    <!-- ===================== Desktop Sidebar (lg+) ===================== -->
    <aside
      class="hidden lg:flex flex-shrink-0 flex-col bg-white border-r border-slate-200/80 shadow-sm z-20 transition-[width] duration-200 ease-out"
      :class="isSidebarCollapsed ? 'w-[76px]' : 'w-60 xl:w-72'"
    >
      <!-- Collapsed identity -->
      <div
        v-if="isSidebarCollapsed"
        class="py-4 px-2 border-b border-slate-100 flex items-center justify-center bg-gradient-to-b from-slate-50/60 to-white flex-shrink-0"
      >
        <RouterLink
          to="/profile"
          class="relative group flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
          :title="`${teacher.fullName} (Profile)`"
        >
          <img
            :src="teacher.profile.photo"
            alt="Instructor avatar"
            class="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white ring-4 transition-all duration-300 group-hover:scale-105"
            :class="showAway ? 'ring-amber-400/40' : 'ring-emerald-400/40'"
          />
        </RouterLink>
      </div>

      <!-- Expanded identity -->
      <div
        v-else
        class="sidebar-profile p-6 border-b border-slate-100 flex flex-col items-center text-center bg-gradient-to-b from-slate-50/60 to-white"
      >
        <RouterLink to="/profile" class="relative mb-3 group block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold focus-visible:ring-offset-2">
          <img
            :src="teacher.profile.photo"
            alt="Instructor avatar"
            class="sidebar-avatar w-24 h-24 rounded-full object-cover shadow-md border-4 border-white ring-4 transition-transform duration-300 group-hover:scale-105"
            :class="showAway ? 'ring-amber-400/30' : 'ring-emerald-400/30'"
          />
          <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold backdrop-blur-[1px]">
            <i class="fa-solid fa-camera text-sm mb-0.5"></i>
            <span>Edit</span>
          </div>
        </RouterLink>

        <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ teacher.fullName }}</h2>
        <p class="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructor</p>

        <div class="sidebar-badges mt-3 flex flex-wrap items-center justify-center gap-1.5 w-full">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-brighture-cream text-brighture-bronze text-xs font-extrabold rounded-xl border border-brighture-gold/20">
            ★ {{ teacher.profile.rating }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-brighture-cream text-brighture-bronze text-xs font-black rounded-xl border border-brighture-gold/30">
            🎓 {{ teacher.stats.lessonsThisMonth }} this month
          </span>
        </div>
      </div>

      <!-- overflow-x is hidden on purpose: a box cannot scroll on y and stay
           visible on x, so the flyouts below are position: fixed instead. -->
      <nav
        class="nav-rail flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden"
        :class="isSidebarCollapsed ? 'px-3' : 'px-4 custom-scrollbar space-y-1.5'"
        @scroll="onRailScroll"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @mouseenter="anchorRailPopup"
          @focusin="anchorRailPopup"
          @mouseleave="releaseRailPopup"
          class="relative flex items-center rounded-2xl text-sm font-bold transition-all duration-150 group"
          :class="[
            isSidebarCollapsed ? 'justify-center mx-auto w-12 h-12 p-0' : 'justify-between px-4 py-3',
            isCurrentRoute(item.path)
              ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-md shadow-brighture-amber/40'
              : 'text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink'
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <i
              :class="[item.icon, isCurrentRoute(item.path) ? '!text-brighture-ink' : '']"
              class="w-5 text-center text-lg transition-transform group-hover:scale-110"
            ></i>
            <span :class="isSidebarCollapsed ? 'sr-only' : 'truncate'">{{ item.label }}</span>
          </div>

          <span
            v-if="!isSidebarCollapsed && badgeFor(item)"
            class="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
            :class="isCurrentRoute(item.path) ? 'bg-brighture-ink/10 text-brighture-ink' : 'bg-rose-100 text-rose-700'"
          >
            {{ badgeFor(item) }}
          </span>

          <!-- Collapsed dot: the count still has to register at rail width. -->
          <span
            v-if="isSidebarCollapsed && badgeFor(item)"
            class="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black leading-none text-white tabular-nums"
          >
            {{ badgeFor(item) }}
          </span>

          <span
            v-if="isSidebarCollapsed"
            data-rail-popup
            data-popup-align="middle"
            aria-hidden="true"
            class="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </nav>

      <!-- Settings -->
      <div class="relative border-t border-slate-100 bg-slate-50/60 p-3 flex-shrink-0">
        <div v-if="isUserMenuOpen" class="fixed inset-0 z-40" @click="isUserMenuOpen = false"></div>

        <div
          v-if="isUserMenuOpen"
          class="absolute z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
          :class="isSidebarCollapsed ? 'left-full bottom-2 ml-3 w-64' : 'bottom-full left-3 right-3 mb-2 min-w-[230px]'"
        >
          <RouterLink
            to="/profile"
            @click="isUserMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink transition"
          >
            <i class="fa-solid fa-user-gear w-4 text-center text-slate-400"></i>
            <span>Profile Setting</span>
          </RouterLink>

          <a
            :href="`mailto:${SUPPORT_EMAIL}`"
            @click="isUserMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink transition"
          >
            <i class="fa-solid fa-headset w-4 text-center text-sky-500"></i>
            <span>Contact admin</span>
          </a>

          <div class="my-1.5 border-t border-slate-100"></div>

          <button
            type="button"
            @click="isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
          >
            <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-slate-400"></i>
            <span>Sign out</span>
          </button>
        </div>

        <button
          v-if="isSidebarCollapsed"
          type="button"
          @click="toggleUserMenu"
          class="flex h-11 w-11 mx-auto items-center justify-center rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
          :class="isUserMenuOpen ? 'bg-slate-200/80 text-slate-900' : ''"
          title="Settings"
        >
          <i class="fa-solid fa-gear text-lg transition-transform duration-200" :class="isUserMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"></i>
        </button>

        <button
          v-else
          type="button"
          @click="toggleUserMenu"
          class="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all group"
          :class="isUserMenuOpen ? 'bg-slate-100 text-slate-900' : ''"
        >
          <span class="flex items-center gap-2.5 min-w-0">
            <i class="fa-solid fa-gear text-sm text-slate-500 transition-transform duration-200" :class="isUserMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"></i>
            <span class="truncate">Settings</span>
          </span>
          <i class="fa-solid fa-ellipsis-vertical text-slate-400 text-xs"></i>
        </button>
      </div>
    </aside>

    <!-- ===================== Mobile Drawer ===================== -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <aside
      class="fixed top-0 left-0 h-screen supports-[height:100dvh]:h-[100dvh] w-72 sm:w-80 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 lg:hidden"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="drawer-profile p-6 border-b border-slate-100 flex flex-col items-center text-center relative bg-gradient-to-b from-slate-50 to-white">
        <button
          @click="isMobileMenuOpen = false"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          aria-label="Close navigation"
        >
          ✕
        </button>

        <RouterLink to="/profile" @click="isMobileMenuOpen = false" class="mb-2 rounded-full">
          <img
            :src="teacher.profile.photo"
            alt="Instructor avatar"
            class="drawer-avatar w-24 h-24 rounded-full object-cover shadow-md border-4 border-white ring-4"
            :class="showAway ? 'ring-amber-400/25' : 'ring-emerald-400/25'"
          />
        </RouterLink>
        <h2 class="text-base font-black text-slate-900">{{ teacher.fullName }}</h2>
        <p class="drawer-sub text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructor</p>
      </div>

      <nav class="flex-1 overflow-y-auto p-4 space-y-1.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-md shadow-brighture-amber/40'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <span class="flex items-center gap-3">
            <i :class="[item.icon, isCurrentRoute(item.path) ? '!text-brighture-ink' : '']" class="w-5 text-center text-lg"></i>
            <span>{{ item.label }}</span>
          </span>
          <span
            v-if="badgeFor(item)"
            class="rounded-full px-2 py-0.5 text-[10px] font-black"
            :class="isCurrentRoute(item.path) ? 'bg-brighture-ink/10 text-brighture-ink' : 'bg-rose-100 text-rose-700'"
          >
            {{ badgeFor(item) }}
          </span>
        </RouterLink>
      </nav>

      <div class="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        <div v-show="isUserMenuOpen" class="space-y-0.5 pb-1.5 mb-1.5 border-b border-slate-200/70">
          <RouterLink
            to="/profile"
            @click="isMobileMenuOpen = false; isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brighture-cream rounded-xl transition"
          >
            <i class="fa-solid fa-user-gear w-4 text-center text-slate-400"></i>
            <span>Profile Setting</span>
          </RouterLink>
          <a
            :href="`mailto:${SUPPORT_EMAIL}`"
            @click="isMobileMenuOpen = false; isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brighture-cream rounded-xl transition"
          >
            <i class="fa-solid fa-headset w-4 text-center text-sky-500"></i>
            <span>Contact admin</span>
          </a>
          <button
            @click="isMobileMenuOpen = false; isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-slate-400"></i>
            <span>Sign out</span>
          </button>
        </div>

        <button
          type="button"
          @click="toggleUserMenu"
          :aria-expanded="isUserMenuOpen ? 'true' : 'false'"
          class="flex items-center justify-between w-full px-4 py-3 text-xs font-bold rounded-xl transition"
          :class="isUserMenuOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'"
        >
          <span class="flex items-center gap-3">
            <i class="fa-solid fa-gear w-4 text-center text-slate-500 transition-transform duration-200" :class="isUserMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"></i>
            <span>Settings</span>
          </span>
          <i class="fa-solid fa-chevron-up text-[10px] text-slate-400 transition-transform duration-200" :class="isUserMenuOpen ? '' : 'rotate-180'"></i>
        </button>
      </div>
    </aside>

    <!-- ===================== Main ===================== -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Next lesson strip: one line at every width, like the student portal. -->
      <div
        v-if="teacher.nextReservation && !isDashboardRoute"
        class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white px-3 sm:px-6 py-1.5 text-xs font-semibold flex flex-nowrap items-center gap-2 sm:gap-3 shadow-md flex-shrink-0 z-30"
      >
        <p class="min-w-0 flex-1 truncate leading-5">
          <strong class="text-[11px] font-extrabold uppercase tracking-wide text-slate-300">
            <span class="hidden sm:inline">Next lesson in </span>{{ teacher.nextReservation.minutesUntil }}m
          </strong>
          <span class="mx-1.5 text-slate-600">•</span>
          {{ teacher.nextReservation.studentName }}
          <span class="hidden sm:inline text-slate-400">— {{ teacher.nextReservation.subject }}</span>
        </p>
        <a
          v-if="teacher.nextReservation.meetLink"
          :href="teacher.nextReservation.meetLink"
          target="_blank"
          rel="noopener"
          class="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <span>📹</span>
          <span class="hidden sm:inline">Start Lesson</span>
          <span class="sm:hidden">Start</span>
        </a>
      </div>

      <header class="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 sticky top-0">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            @click="isMobileMenuOpen = true"
            class="lg:hidden shrink-0 -ml-1 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open Menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            type="button"
            @click="toggleSidebar"
            class="hidden lg:inline-flex shrink-0 items-center justify-center -ml-1 h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            aria-label="Toggle sidebar"
          >
            <i
              class="text-sm transition-colors duration-200"
              :class="isSidebarCollapsed ? 'fa-solid fa-angles-right text-brighture-bronze' : 'fa-solid fa-angles-left text-slate-600'"
            ></i>
          </button>

          <h1 class="min-w-0 text-base sm:text-lg font-black text-slate-900 tracking-tight">
            <span class="truncate">{{ currentPageTitle }}</span>
          </h1>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <!-- A segmented control, not a toggle: both states are on screen and
               labelled, so setting yourself Away is a deliberate pick rather
               than a single click that silently stops your bookings. The FC
               chip says what the setting actually governs. -->
          <div
            v-if="teacher.teachesFreeConversation"
            role="radiogroup"
            aria-label="Booking availability"
            class="inline-flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5"
          >
            <button
              v-for="option in statusOptions"
              :key="option.label"
              type="button"
              role="radio"
              :aria-checked="teacher.isAway === option.away"
              @click="setAway(option.away)"
              :title="option.hint"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
              :class="teacher.isAway === option.away
                ? `bg-white shadow-sm ${option.activeText}`
                : 'text-slate-500 hover:text-slate-700'"
            >
              <span
                v-if="!option.away"
                class="h-2 w-2 rounded-full"
                :class="teacher.isAway ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'"
              ></span>
              <i
                v-else
                class="fa-solid fa-moon text-[10px]"
                :class="teacher.isAway ? 'text-amber-500' : 'text-slate-400'"
              ></i>

              <!-- The active label always shows; the other one waits for room. -->
              <span :class="teacher.isAway === option.away ? '' : 'hidden sm:inline'">{{ option.label }}</span>

              <span
                v-if="!option.away"
                class="hidden rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none sm:inline"
                :class="teacher.isAway ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'"
                title="Free Conversation"
              >
                FC
              </span>
            </button>
          </div>

          <!-- Calendar status, not a toggle: one stray click in a header should
               never unlink an instructor's calendar. It routes to Profile,
               where the connect/disconnect control lives. -->
          <RouterLink
            to="/profile"
            class="inline-flex items-center gap-2 rounded-full border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            :class="teacher.googleCalendarLinked
              ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              : 'border-amber-300 bg-amber-50 text-amber-800'"
            :title="teacher.googleCalendarLinked
              ? 'Google Calendar is linked — reservations sync automatically'
              : 'Google Calendar is not connected'"
          >
            <i
              class="fa-brands fa-google text-[11px]"
              :class="teacher.googleCalendarLinked ? 'text-sky-500' : 'text-amber-500'"
            ></i>
            <span class="hidden sm:inline">
              {{ teacher.googleCalendarLinked ? 'Calendar linked' : 'Not connected' }}
            </span>
          </RouterLink>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto pb-20 lg:pb-8">
        <RouterView />
      </main>

      <!-- Bottom bar -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 flex items-center justify-around z-30 shadow-lg box-content pb-[env(safe-area-inset-bottom)]">
        <RouterLink
          v-for="item in bottomNavItems"
          :key="item.path"
          :to="item.path"
          class="relative flex flex-col items-center justify-center flex-1 py-1 text-center transition"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm shadow-brighture-amber/40 rounded-xl'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <span
            v-if="badgeFor(item)"
            class="absolute right-2 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black leading-none text-white tabular-nums"
          >
            {{ badgeFor(item) }}
          </span>
          <i :class="[item.icon, isCurrentRoute(item.path) ? '!text-brighture-ink' : '']" class="mb-0.5 text-lg leading-none"></i>
          <span class="text-[10px] tracking-tight truncate">{{ item.shortLabel }}</span>
        </RouterLink>

        <button
          type="button"
          @click="isSettingsSheetOpen = true"
          :aria-expanded="isSettingsSheetOpen ? 'true' : 'false'"
          aria-haspopup="dialog"
          class="flex flex-col items-center justify-center flex-1 py-1 text-center transition"
          :class="isCurrentRoute('/profile')
            ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm shadow-brighture-amber/40 rounded-xl'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <i class="fa-solid fa-gear mb-0.5 text-lg leading-none" :class="isCurrentRoute('/profile') ? '!text-brighture-ink' : 'text-slate-500'"></i>
          <span class="text-[10px] tracking-tight truncate">Settings</span>
        </button>
      </nav>

      <!-- Settings sheet -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 ease-in" leave-to-class="opacity-0"
      >
        <div
          v-if="isSettingsSheetOpen"
          class="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs"
          @click="isSettingsSheetOpen = false"
        ></div>
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-y-full"
        leave-active-class="transition-transform duration-200 ease-in" leave-to-class="translate-y-full"
      >
        <div
          v-if="isSettingsSheetOpen"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          class="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl"
        >
          <button
            type="button"
            @click="isSettingsSheetOpen = false"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-xs ring-1 ring-slate-200 transition hover:text-slate-900 active:scale-95"
            aria-label="Close settings"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>

          <div class="max-h-[85vh] supports-[max-height:100dvh]:max-h-[85dvh] overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div class="mx-auto mb-6 h-1.5 w-10 shrink-0 rounded-full bg-slate-300"></div>

            <div class="space-y-1">
              <RouterLink
                to="/profile"
                @click="isSettingsSheetOpen = false"
                class="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-brighture-cream hover:text-brighture-ink active:scale-[0.99]"
              >
                <i class="fa-solid fa-user-gear w-5 text-center text-slate-400"></i>
                <span>Profile Setting</span>
                <i class="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300"></i>
              </RouterLink>

              <button
                v-if="teacher.teachesFreeConversation"
                type="button"
                @click="teacher.toggleAway(); isSettingsSheetOpen = false"
                class="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-brighture-cream hover:text-brighture-ink active:scale-[0.99]"
              >
                <i class="w-5 text-center" :class="teacher.isAway ? 'fa-solid fa-play text-emerald-500' : 'fa-solid fa-moon text-amber-500'"></i>
                <span>{{ teacher.isAway ? 'Set to Available' : 'Set to Away' }}</span>
              </button>

              <a
                :href="`mailto:${SUPPORT_EMAIL}`"
                @click="isSettingsSheetOpen = false"
                class="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-brighture-cream hover:text-brighture-ink active:scale-[0.99]"
              >
                <i class="fa-solid fa-headset w-5 text-center text-sky-500"></i>
                <span>Contact admin</span>
                <i class="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300"></i>
              </a>

              <div class="my-1.5 border-t border-slate-100"></div>

              <button
                type="button"
                @click="isSettingsSheetOpen = false"
                class="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.99]"
              >
                <i class="fa-solid fa-arrow-right-from-bracket w-5 text-center text-slate-400"></i>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Away takeover, carried over from the legacy portal: while Away the
         instructor must not miss that reservations are paused. -->
    <div
      v-if="teacher.isAway && teacher.teachesFreeConversation"
      class="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-xl flex items-center gap-3"
    >
      <i class="fa-solid fa-moon text-amber-500"></i>
      <p class="min-w-0 flex-1 text-xs font-bold text-amber-900">
        You are Away — no new Free Conversation reservations.
      </p>
      <button
        type="button"
        @click="teacher.toggleAway()"
        class="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-white transition hover:bg-amber-600 active:scale-95"
      >
        Resume
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import RouteProgress from '../RouteProgress.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const route = useRoute();
const teacher = useTeacherStore();

// TODO: confirm the real instructor-support address before launch.
const SUPPORT_EMAIL = 'support@brighture-edu.com';

// The portal is instructor-facing and the teaching staff work in English, so
// unlike the student portal this one carries no locale switch.
const navItems = [
  { path: '/', label: 'Dashboard', shortLabel: 'Home', icon: 'fa-solid fa-chart-pie text-sky-500' },
  { path: '/reservations', label: 'Reservations', shortLabel: 'Lessons', icon: 'fa-solid fa-calendar-check text-indigo-500' },
  { path: '/schedule', label: 'Scheduling', shortLabel: 'Schedule', icon: 'fa-solid fa-table-cells text-teal-500' },
  { path: '/lessons', label: 'Lesson Log', shortLabel: 'Log', icon: 'fa-solid fa-clock-rotate-left text-violet-500', badge: 'feedback' },
  { path: '/writing', label: 'Writing', shortLabel: 'Writing', icon: 'fa-solid fa-pen-nib text-rose-500', badge: 'writing' },
];

// Profile is reached through Settings — the sidebar, the drawer footer, the
// settings sheet and the avatar all lead there — so it takes no nav slot of its
// own in either the rail or the bottom bar.
const bottomNavItems = ['/', '/reservations', '/schedule', '/writing']
  .map((path) => navItems.find((item) => item.path === path));

/** Titles for pages that are not in the nav list. */
const offNavTitles = { '/profile': 'Profile Setting' };

const badgeFor = (item) => {
  if (item.badge === 'writing') return teacher.pendingWritingCount || 0;
  if (item.badge === 'feedback') return teacher.pendingFeedback.length || 0;
  return 0;
};

const isCurrentRoute = (path) => (path === '/' ? route.path === '/' : route.path.startsWith(path));
const isDashboardRoute = computed(() => route.path === '/');

const currentPageTitle = computed(() => {
  const current = navItems.find((item) => isCurrentRoute(item.path));
  if (current) return current.label;
  const offNav = Object.keys(offNavTitles).find((path) => isCurrentRoute(path));
  return offNav ? offNavTitles[offNav] : 'Instructor Portal';
});

// --- Sidebar collapse --------------------------------------------------------
const SIDEBAR_KEY = 'brighture:teacher-sidebar-collapsed';
const readCollapsed = () => {
  try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
};
const isSidebarCollapsed = ref(readCollapsed());
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  try { localStorage.setItem(SIDEBAR_KEY, isSidebarCollapsed.value ? '1' : '0'); } catch { /* private mode */ }
};

// --- Collapsed-rail popups ---------------------------------------------------
// The rail scrolls, and a scrolling box clips anything reaching outside it, so
// the hover labels are position: fixed and placed by hand.
let hoveredRailHost = null;

const placeRailPopup = (host) => {
  const popup = host?.querySelector('[data-rail-popup]');
  if (!popup) return;
  const anchor = host.getBoundingClientRect();
  popup.style.left = `${Math.round(anchor.right + 12)}px`;
  popup.style.top = `${Math.round(anchor.top + anchor.height / 2)}px`;
};

const anchorRailPopup = (event) => {
  if (!isSidebarCollapsed.value) return;
  hoveredRailHost = event.currentTarget;
  placeRailPopup(hoveredRailHost);
};
const releaseRailPopup = () => { hoveredRailHost = null; };
const onRailScroll = () => { if (hoveredRailHost) placeRailPopup(hoveredRailHost); };

// --- Menus -------------------------------------------------------------------
const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const statusOptions = [
  {
    away: false,
    label: 'Available',
    hint: 'Students can book Free Conversation lessons with you.',
    activeText: 'text-emerald-800',
  },
  {
    away: true,
    label: 'Away',
    hint: 'No new Free Conversation reservations. Lessons already booked are unaffected.',
    activeText: 'text-amber-800',
  },
];

/** Away can only read as Away when the setting it governs is in play. */
const showAway = computed(() => teacher.isAway && teacher.teachesFreeConversation);

const setAway = (away) => {
  if (teacher.isAway !== away) teacher.toggleAway();
};
const isSettingsSheetOpen = ref(false);
const toggleUserMenu = () => { isUserMenuOpen.value = !isUserMenuOpen.value; };

watch(() => route.path, () => {
  isUserMenuOpen.value = false;
  isSettingsSheetOpen.value = false;
  isMobileMenuOpen.value = false;
});
</script>

<style scoped>
/* Landscape is a height problem: a phone at 844x390 has less vertical room than
   the narrowest portrait phone. Trade the decorative half of the header for
   list space so the nav and the Settings row below it stay reachable. */
@media (max-height: 820px) {
  .sidebar-profile { padding: 1rem 1rem 0.875rem; }
  .sidebar-profile .sidebar-avatar { width: 4rem; height: 4rem; }
  .sidebar-profile .sidebar-badges { display: none; }
}

@media (max-height: 700px) {
  .sidebar-profile .sidebar-avatar { width: 3rem; height: 3rem; border-width: 2px; }
}

@media (max-height: 560px) {
  .drawer-profile {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  .drawer-profile .drawer-avatar { width: 2.75rem; height: 2.75rem; border-width: 2px; }
  .drawer-profile .drawer-sub { display: none; }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>
