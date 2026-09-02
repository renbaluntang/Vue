<template>
  <div class="flex h-screen supports-[height:100dvh]:h-[100dvh] w-full bg-[#f8fafc] font-sans text-slate-800 antialiased overflow-hidden">
    <RouteProgress />

    <!-- Desktop Sidebar (Hidden on mobile & small tablet, visible on lg+) -->
    <aside
      class="hidden lg:flex flex-shrink-0 bg-white border-r border-slate-200/80 flex-col shadow-sm z-20 transition-[width] duration-200 ease-out"
      :class="isSidebarCollapsed ? 'w-[76px]' : 'w-60 xl:w-72'"
    >
      <!-- Collapsed Header: Student Avatar with Single Clean Tooltip -->
      <div
        v-if="isSidebarCollapsed"
        class="py-4 px-2 border-b border-slate-100 flex items-center justify-center text-center bg-gradient-to-b from-slate-50/60 to-white flex-shrink-0"
      >
        <RouterLink
          to="/profile"
          class="relative group flex items-center justify-center shrink-0 w-12 h-12 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
          :title="`${user.fullName} (Profile)`"
        >
          <img
            :src="user.profile.photo"
            alt="Student Avatar"
            class="w-12 h-12 aspect-square shrink-0 rounded-full shadow-md border-2 border-white ring-4 ring-brighture-gold/30 object-cover transition-all duration-300 group-hover:scale-105 group-hover:ring-brighture-gold"
          />
        </RouterLink>
      </div>

      <!-- Expanded Header: Full User Profile Snapshot with Edit Profile Link -->
      <div
        v-else
        class="sidebar-profile p-6 border-b border-slate-100 flex flex-col items-center text-center bg-gradient-to-b from-slate-50/60 to-white"
      >
        <RouterLink to="/profile" class="relative mb-3 group block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold focus-visible:ring-offset-2">
          <!-- Big Profile Image -->
          <img
            :src="user.profile.photo"
            alt="Student Avatar"
            class="sidebar-avatar w-24 h-24 xl:w-28 xl:h-28 rounded-full shadow-md border-4 border-white ring-4 ring-brighture-gold/20 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <!-- Hover Edit Overlay -->
          <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold backdrop-blur-[1px]">
            <i class="fa-solid fa-camera text-sm mb-0.5"></i>
            <span>Edit</span>
          </div>
          <span
            class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200 flex items-center justify-center text-[11px] text-white font-bold group-hover:opacity-0 transition-opacity"
            title="Online & Ready"
          >
            ✓
          </span>
          <div class="sidebar-rank absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-brighture-gold to-amber-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wider whitespace-nowrap">
            {{ user.stats.rank }}
          </div>
        </RouterLink>

        <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ user.fullName }}</h2>

        <!-- Level & Streak Badges -->
        <div class="sidebar-badges mt-3 flex flex-wrap items-center justify-center gap-1.5 w-full">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-brighture-cream text-brighture-bronze text-xs font-extrabold rounded-xl border border-brighture-gold/20 shadow-2xs">
            🎯 {{ user.profile.level.split(' ')[0] }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-brighture-cream text-brighture-bronze text-xs font-black rounded-xl border border-brighture-gold/30 shadow-2xs">
            🔥 {{ user.stats.currentStreak }}d streak
          </span>
        </div>
      </div>

      <!-- Navigation Links -->
      <!-- overflow-x is hidden on purpose. A scroll container cannot have a
           visible x-axis and a scrolling y-axis: setting overflow-y makes
           overflow-x compute to auto, which clipped the collapsed flyouts and
           put a horizontal scrollbar under the rail. The popups are position:
           fixed instead, anchored by anchorRailPopup, so they escape entirely. -->
      <nav
        ref="railEl"
        class="nav-rail flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden"
        :class="isSidebarCollapsed ? 'px-3' : 'px-4 custom-scrollbar space-y-1.5'"
        @scroll="onRailScroll"
      >
        <template v-for="item in navItems" :key="item.path || item.key">
          <button
            v-if="item.action"
            @click="item.action"
            @mouseenter="anchorRailPopup"
            @focusin="anchorRailPopup"
            @mouseleave="releaseRailPopup"
            class="relative flex items-center rounded-2xl text-sm font-bold transition-all duration-150 group text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink"
            :class="isSidebarCollapsed ? 'justify-center mx-auto w-12 h-12 p-0' : 'justify-between w-full px-4 py-3'"
          >
            <div class="flex items-center gap-3">
              <i :class="[item.icon]" class="w-5 text-center text-lg transition-transform group-hover:scale-110"></i>
              <span :class="isSidebarCollapsed ? 'sr-only' : ''">{{ t(item.label) }}</span>
            </div>
            <span
              v-if="isSidebarCollapsed"
              aria-hidden="true"
              data-rail-popup
              data-popup-align="middle"
              class="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {{ t(item.label) }}
            </span>
          </button>

          <!-- Expandable group -->
          <div
            v-else-if="item.children"
            class="relative group/flyout"
            @mouseenter="anchorRailPopup"
            @focusin="anchorRailPopup"
            @mouseleave="releaseRailPopup"
          >
            <button
              type="button"
              @click="onGroupClick(item)"
              :aria-expanded="isSidebarCollapsed ? null : (isGroupOpen(item) ? 'true' : 'false')"
              :aria-haspopup="isSidebarCollapsed ? 'true' : null"
              :class="[
                'relative flex items-center rounded-2xl text-sm font-bold transition-all duration-150 group',
                isSidebarCollapsed ? 'justify-center mx-auto w-12 h-12 p-0' : 'justify-between w-full px-4 py-3',
                groupHasActiveChild(item)
                  ? (isSidebarCollapsed ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-md shadow-brighture-amber/40' : 'text-brighture-ink bg-brighture-cream')
                  : 'text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink'
              ]"
            >
              <span class="flex items-center gap-3">
                <i :class="[item.icon, (isSidebarCollapsed && groupHasActiveChild(item)) ? '!text-brighture-ink' : '']" class="w-5 text-center text-lg transition-transform group-hover:scale-110"></i>
                <span :class="isSidebarCollapsed ? 'sr-only' : ''">{{ t(item.label) }}</span>
              </span>
              <i
                v-if="!isSidebarCollapsed"
                class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200"
                :class="isGroupOpen(item) ? 'rotate-180' : ''"
              ></i>
            </button>

            <!-- Collapsed Flyout on Hover -->
            <div
              v-if="isSidebarCollapsed"
              data-rail-popup
              data-popup-align="top"
              class="invisible fixed z-50 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 opacity-0 shadow-xl transition-opacity duration-150 group-hover/flyout:visible group-hover/flyout:opacity-100 group-focus-within/flyout:visible group-focus-within/flyout:opacity-100"
            >
              <p class="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {{ t(item.label) }}
              </p>
              <RouterLink
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-bold transition"
                :class="[
                  isCurrentRoute(child.path)
                    ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink'
                    : 'text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink'
                ]"
              >
                <i :class="[child.icon, isCurrentRoute(child.path) ? '!text-brighture-ink' : '']" class="w-4 text-center text-sm"></i>
                <span>{{ t(child.label) }}</span>
              </RouterLink>
            </div>

            <!-- Expanded Nested Submenu -->
            <div v-show="isGroupOpen(item) && !isSidebarCollapsed" class="mt-1 ml-5 space-y-1 border-l border-slate-200 pl-3">
              <RouterLink
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150"
                :class="[
                  isCurrentRoute(child.path)
                    ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm shadow-brighture-amber/40'
                    : 'text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink'
                ]"
              >
                <i :class="[child.icon, isCurrentRoute(child.path) ? '!text-brighture-ink' : '']" class="w-4 text-center text-sm"></i>
                <span>{{ t(child.label) }}</span>
              </RouterLink>
            </div>
          </div>

          <RouterLink
            v-else
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
            <div class="flex items-center gap-3">
              <i :class="[item.icon, isCurrentRoute(item.path) ? '!text-brighture-ink' : '']" class="w-5 text-center text-lg transition-transform group-hover:scale-110"></i>
              <span :class="isSidebarCollapsed ? 'sr-only' : ''">{{ t(item.label) }}</span>
            </div>
            <span
              v-if="isSidebarCollapsed"
              aria-hidden="true"
              data-rail-popup
              data-popup-align="middle"
              class="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {{ t(item.label) }}
            </span>
          </RouterLink>
        </template>
      </nav>

      <!-- Bottom Actions: Settings / User Menu Popover Trigger (Shadcn style) -->
      <div class="relative border-t border-slate-100 bg-slate-50/60 p-3 flex-shrink-0">
        <!-- Invisible backdrop to close popover on outside click -->
        <div
          v-if="isUserMenuOpen"
          class="fixed inset-0 z-40"
          @click="isUserMenuOpen = false"
        ></div>

        <!-- Floating Popover Menu (Shadcn-style flyout) -->
        <div
          v-if="isUserMenuOpen"
          class="absolute z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95"
          :class="isSidebarCollapsed ? 'left-full bottom-2 ml-3 w-64' : 'bottom-full left-3 right-3 mb-2 w-auto min-w-[230px]'"
        >
          <!-- User Profile Header -->
          <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-1.5">
            <img
              :src="user.profile.photo"
              alt="Avatar"
              class="w-10 h-10 rounded-full object-cover border border-white shadow-xs ring-1 ring-slate-200"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-black text-slate-900 truncate">{{ user.fullName }}</p>
              <p class="text-[11px] text-slate-500 font-medium truncate">{{ user.profile.level.split(' ')[0] }} &bull; {{ user.stats.rank }}</p>
            </div>
          </div>

          <!-- Menu Items -->
          <div class="space-y-0.5">
            <RouterLink
              to="/profile"
              @click="isUserMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink transition"
            >
              <i class="fa-solid fa-user-gear w-4 text-center text-slate-400"></i>
              <span>Profile</span>
            </RouterLink>

            <a
              :href="`mailto:${SUPPORT_EMAIL}`"
              @click="isUserMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink transition"
            >
              <i class="fa-solid fa-headset w-4 text-center text-sky-500"></i>
              <span>Contact us</span>
            </a>
          </div>

          <!-- Divider -->
          <div class="my-1.5 border-t border-slate-100"></div>

          <!-- Logout Action -->
          <button
            type="button"
            @click="isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
          >
            <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-slate-400"></i>
            <span>Log out</span>
          </button>
        </div>

        <!-- Trigger Button when Collapsed (Settings gear) -->
        <button
          v-if="isSidebarCollapsed"
          type="button"
          @click="toggleUserMenu"
          class="relative flex h-11 w-11 mx-auto items-center justify-center rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
          :class="isUserMenuOpen ? 'bg-slate-200/80 text-slate-900 shadow-inner' : ''"
          title="Settings"
        >
          <i class="fa-solid fa-gear text-lg transition-transform duration-200" :class="isUserMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"></i>
        </button>

        <!-- Trigger Button when Expanded (Settings row with icon & chevron) -->
        <button
          v-else
          type="button"
          @click="toggleUserMenu"
          class="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-[0.99] group"
          :class="isUserMenuOpen ? 'bg-slate-100 text-slate-900' : ''"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <i class="fa-solid fa-gear text-sm text-slate-500 group-hover:text-slate-900 transition-transform duration-200" :class="isUserMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"></i>
            <span class="truncate">Settings</span>
          </div>
          <i class="fa-solid fa-ellipsis-vertical text-slate-400 group-hover:text-slate-600 text-xs"></i>
        </button>
      </div>
    </aside>

    <!-- Mobile Drawer Overlay & Sidebar (for mobile & tablet) -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
      @click="isMobileMenuOpen = false"
    ></div>

    <aside
      class="fixed top-0 left-0 h-screen supports-[height:100dvh]:h-[100dvh] w-72 sm:w-80 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 lg:hidden"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Mobile Profile Snapshot with Big Avatar + PLAIN Points Display -->
      <div class="drawer-profile p-6 border-b border-slate-100 flex flex-col items-center text-center relative bg-gradient-to-b from-slate-50 to-white">
        <button
          @click="isMobileMenuOpen = false"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          aria-label="Close Navigation"
        >
          ✕
        </button>

        <RouterLink to="/profile" @click="isMobileMenuOpen = false" class="mb-2 rounded-full">
          <img
            :src="user.profile.photo"
            alt="Avatar"
            class="drawer-avatar w-24 h-24 rounded-full shadow-md border-4 border-white ring-4 ring-brighture-gold/10 object-cover"
          />
        </RouterLink>
        <h2 class="text-base font-black text-slate-900">{{ user.fullName }}</h2>

        <!-- PLAIN Points Display in Mobile Drawer (No Background) -->
        <div class="drawer-points mt-3.5 w-full text-center space-y-0.5">
          <div class="flex items-baseline justify-center gap-1.5 text-slate-900">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Points :</span>
            <span class="text-xl font-black text-slate-900">{{ user.profile.pointsBalance }}</span>
            <span class="text-xs font-black text-brighture-bronze">PTS</span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">
            Expires: {{ user.profile.pointsExpiry }}
          </p>
        </div>
      </div>

      <!-- Mobile Nav List -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1.5">
        <template v-for="item in navItems.filter(i => !i.action)" :key="item.key || item.path">
        <!-- Expandable group -->
        <div v-if="item.children">
          <button
            type="button"
            @click="toggleGroup(item)"
            :aria-expanded="isGroupOpen(item) ? 'true' : 'false'"
            :class="[
              'flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 group',
              groupHasActiveChild(item) ? 'text-brighture-ink bg-brighture-cream' : 'text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink'
            ]"
          >
            <span class="flex items-center gap-3">
              <i :class="[item.icon]" class="w-5 text-center text-lg transition-transform group-hover:scale-110"></i>
              <span>{{ t(item.label) }}</span>
            </span>
            <i
              class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200"
              :class="isGroupOpen(item) ? 'rotate-180' : ''"
            ></i>
          </button>

          <div v-show="isGroupOpen(item)" class="mt-1 ml-5 space-y-1 border-l border-slate-200 pl-3">
            <RouterLink
              v-for="child in item.children"
              :key="child.path"
              :to="child.path"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150"
              :class="[
                isCurrentRoute(child.path)
                ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm shadow-brighture-amber/40'
                : 'text-slate-600 hover:bg-brighture-cream hover:text-brighture-ink'
              ]"
            >
              <i :class="[child.icon, isCurrentRoute(child.path) ? '!text-brighture-ink' : '']" class="w-4 text-center text-sm"></i>
              <span>{{ t(child.label) }}</span>
            </RouterLink>
          </div>
        </div>

        <RouterLink
          v-else
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-md shadow-brighture-amber/40'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <div class="flex items-center gap-3">
            <i
              :class="[item.icon, isCurrentRoute(item.path) ? '!text-brighture-ink' : '']"
              class="w-5 text-center text-lg"
            ></i>
            <span>{{ t(item.label) }}</span>
          </div>
        </RouterLink>
        </template>
      </nav>

      <!-- shrink-0 so a long nav list can never squeeze these off the panel, and
           the safe-area padding keeps them clear of the iOS home indicator.
           Same Settings group as the desktop sidebar — Profile, Contact us and
           Log out live behind one gear rather than sitting loose in the drawer,
           so the drawer footer is one row tall in landscape. -->
      <div class="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        <div v-show="isUserMenuOpen" class="space-y-0.5 pb-1.5 mb-1.5 border-b border-slate-200/70">
          <RouterLink
            to="/profile"
            @click="isMobileMenuOpen = false; isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink rounded-xl transition"
          >
            <i class="fa-solid fa-user-gear w-4 text-center text-slate-400"></i>
            <span>{{ t('nav.profile') }}</span>
          </RouterLink>

          <a
            :href="`mailto:${SUPPORT_EMAIL}`"
            @click="isMobileMenuOpen = false; isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink rounded-xl transition"
          >
            <i class="fa-solid fa-headset w-4 text-center text-sky-500"></i>
            <span>Contact us</span>
          </a>

          <button
            @click="isMobileMenuOpen = false; isUserMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-slate-400"></i>
            <span>{{ t('nav.logout') }}</span>
          </button>
        </div>

        <button
          type="button"
          @click="toggleUserMenu"
          :aria-expanded="isUserMenuOpen ? 'true' : 'false'"
          class="flex items-center justify-between w-full px-4 py-3 text-xs font-bold rounded-xl transition group"
          :class="isUserMenuOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'"
        >
          <span class="flex items-center gap-3">
            <i
              class="fa-solid fa-gear w-4 text-center text-slate-500 transition-transform duration-200"
              :class="isUserMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"
            ></i>
            <span>Settings</span>
          </span>
          <i
            class="fa-solid fa-chevron-up text-[10px] text-slate-400 transition-transform duration-200"
            :class="isUserMenuOpen ? '' : 'rotate-180'"
          ></i>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- UPCOMING ONLINE CLASS FLOATING NOTIFICATION / HEADER BAR (Shown on subpages, merged into Hero on Dashboard) -->
      <div
        v-if="user.nextUpcomingClass && !isDashboardRoute"
        class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white px-3 sm:px-6 py-1.5 text-xs font-semibold flex flex-nowrap items-center gap-2 sm:gap-3 shadow-md flex-shrink-0 z-30"
      >
        <!-- Stays one line at every width: the label and class share a single
             truncating row so the Join button can never wrap underneath it. -->
        <p class="min-w-0 flex-1 truncate leading-5">
          <strong class="text-[11px] font-extrabold uppercase tracking-wide text-slate-300">
            <span class="hidden sm:inline">Next class in </span>{{ user.nextUpcomingClass.minutesUntil }}m
          </strong>
          <span class="mx-1.5 text-slate-600">&middot;</span>
          <span class="text-slate-200">
            {{ user.nextUpcomingClass.subject }} with <strong>{{ user.nextUpcomingClass.teacherName }}</strong> at {{ user.nextUpcomingClass.time }}
          </span>
        </p>

        <a
          :href="user.nextUpcomingClass.meetLink"
          target="_blank"
          class="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs shadow-xs transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <span>📹</span>
          <span class="hidden sm:inline">Join Online Class</span>
          <span class="sm:hidden">Join</span>
        </a>
      </div>

      <!-- Top Sticky Header with Refined Points Capsule and Language Selector -->
      <header class="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 sticky top-0">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <!-- Mobile Hamburger Toggle -->
          <button
            @click="isMobileMenuOpen = true"
            class="lg:hidden shrink-0 -ml-1 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open Menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Desktop Sidebar Collapse/Expand Toggle -->
          <button
            type="button"
            @click="toggleSidebar"
            class="hidden lg:inline-flex shrink-0 items-center justify-center -ml-1 h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            :aria-expanded="!isSidebarCollapsed"
            aria-label="Toggle sidebar"
          >
            <i
              class="fa-solid fa-bars-staggered text-sm transition-transform duration-200"
              :class="isSidebarCollapsed ? 'rotate-180 text-brighture-bronze' : 'text-slate-600'"
            ></i>
          </button>

          <!-- Current Page Title -->
          <h1 class="min-w-0 text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span class="truncate">{{ currentPageTitle }}</span>
          </h1>
        </div>

        <!-- Header Right Utilities (Points Pill + Booking CTA + Lang) -->
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <!-- REDESIGNED POINTS PILL (Clickable -> Opens History) -->
          <RouterLink
            to="/points"
            class="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 border border-slate-700/60"
            title="View Point History"
          >
            <i class="fa-solid fa-coins text-[11px] text-amber-400"></i>
            <span class="tracking-tight"><strong>{{ user.profile.pointsBalance }}</strong> <span class="text-slate-400 font-medium">pts</span></span>
            <span class="text-[10px] text-slate-400 font-medium hidden sm:inline border-l border-slate-700 pl-2">Exp: {{ user.profile.pointsExpiry }}</span>
          </RouterLink>


          <!-- Language Selector -->
          <select
            v-model="$i18n.locale"
            class="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-1.5 px-2 outline-none hover:border-slate-300 focus:border-brighture-amber transition"
          >
            <option value="en">EN</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </header>

      <!-- Scrollable Main Viewport (with bottom padding on mobile for bottom bar) -->
      <main class="flex-1 overflow-y-auto pb-20 lg:pb-8">
        <RouterView />
      </main>

      <!-- Mobile / Tablet Bottom Navigation Bar (Hidden on desktop lg+) -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 flex items-center justify-around z-30 shadow-lg box-content pb-[env(safe-area-inset-bottom)]">
        <RouterLink
          v-for="item in mobileBottomNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center flex-1 py-1 text-center transition"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm shadow-brighture-amber/40 rounded-xl'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <i
            :class="[item.icon, isCurrentRoute(item.path) ? '!text-brighture-ink' : '']"
            class="mb-0.5 text-lg leading-none"
          ></i>
          <span class="text-[10px] tracking-tight truncate">{{ item.shortLabel }}</span>
        </RouterLink>

        <!-- Settings is permanently on screen in the desktop sidebar, so it needs
             a permanent home here too. Without it the only route to Profile,
             Contact us or Log out on a phone is knowing the drawer exists. -->
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
          <i
            class="fa-solid fa-gear mb-0.5 text-lg leading-none"
            :class="isCurrentRoute('/profile') ? '!text-brighture-ink' : 'text-slate-500'"
          ></i>
          <span class="text-[10px] tracking-tight truncate">Settings</span>
        </button>
      </nav>

      <!-- Settings Bottom Sheet (mobile & tablet) -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isSettingsSheetOpen"
          class="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs"
          @click="isSettingsSheetOpen = false"
        ></div>
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="isSettingsSheetOpen"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          class="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl"
        >
          <!-- Pinned to the sheet, not the scrolling body, so it stays in the
               corner however far the content scrolls. -->
          <button
            type="button"
            @click="isSettingsSheetOpen = false"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-xs ring-1 ring-slate-200 transition hover:text-slate-900 active:scale-95"
            aria-label="Close settings"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>

          <!-- Capped and scrollable: a phone in landscape has ~360px of height,
               and the sheet must never grow past what is on screen. -->
          <div class="max-h-[85vh] supports-[max-height:100dvh]:max-h-[85dvh] overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <!-- Grab handle: the visual cue that this panel came from the edge. -->
            <div class="mx-auto mb-6 h-1.5 w-10 shrink-0 rounded-full bg-slate-300"></div>

            <div class="space-y-1">
              <RouterLink
                to="/profile"
                @click="isSettingsSheetOpen = false"
                class="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-brighture-cream hover:text-brighture-ink active:scale-[0.99]"
              >
                <i class="fa-solid fa-user-gear w-5 text-center text-slate-400"></i>
                <span>{{ t('nav.profile') }}</span>
                <i class="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300"></i>
              </RouterLink>

              <a
                :href="`mailto:${SUPPORT_EMAIL}`"
                @click="isSettingsSheetOpen = false"
                class="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-brighture-cream hover:text-brighture-ink active:scale-[0.99]"
              >
                <i class="fa-solid fa-headset w-5 text-center text-sky-500"></i>
                <span>Contact us</span>
                <i class="fa-solid fa-chevron-right ml-auto text-[10px] text-slate-300"></i>
              </a>

              <div class="my-1.5 border-t border-slate-100"></div>

              <button
                type="button"
                @click="isSettingsSheetOpen = false"
                class="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.99]"
              >
                <i class="fa-solid fa-arrow-right-from-bracket w-5 text-center text-slate-400"></i>
                <span>{{ t('nav.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import RouteProgress from '../../components/RouteProgress.vue';
import brightureLogo from '@/assets/logo-black.svg';
import brightureIcon from '@/assets/icon-black.svg';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const user = useUserStore();

const isMobileMenuOpen = ref(false);
// TODO: confirm the real support address before launch.
const SUPPORT_EMAIL = 'support@brighture-edu.com';

// --- Collapsed-rail popups ---------------------------------------------------
// The rail has to scroll (a landscape phone has no room for eight rows), and a
// scrolling box clips anything that reaches outside it. So the flyouts and hover
// labels are position: fixed, which no ancestor can clip — the cost is that
// fixed ignores the trigger, so we place them by hand on hover and keep them
// glued while the rail scrolls underneath.
const railEl = ref(null);
let hoveredRailHost = null;

const placeRailPopup = (host) => {
  const popup = host?.querySelector('[data-rail-popup]');
  if (!popup) return;
  const anchor = host.getBoundingClientRect();
  popup.style.left = `${Math.round(anchor.right + 12)}px`;

  if (popup.dataset.popupAlign === 'middle') {
    popup.style.top = `${Math.round(anchor.top + anchor.height / 2)}px`;
    return;
  }
  // Flyouts hang downward, so near the foot of a short screen they have to be
  // pulled back up to stay on it.
  const height = popup.offsetHeight;
  const maxTop = window.innerHeight - height - 8;
  popup.style.top = `${Math.round(Math.max(8, Math.min(anchor.top, maxTop)))}px`;
};

const anchorRailPopup = (event) => {
  if (!isSidebarCollapsed.value) return;
  hoveredRailHost = event.currentTarget;
  placeRailPopup(hoveredRailHost);
};

const releaseRailPopup = () => {
  hoveredRailHost = null;
};

/** Keeps an open popup attached to its row while the rail scrolls. */
const onRailScroll = () => {
  if (hoveredRailHost) placeRailPopup(hoveredRailHost);
};

const isUserMenuOpen = ref(false);
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// Close user menu on route navigation
watch(() => route.path, () => {
  isUserMenuOpen.value = false;
});

// Sidebar width preference. Persisted so it survives a reload; a blocked or
// empty localStorage just falls back to expanded.
const SIDEBAR_KEY = 'brighture:sidebar-collapsed';
const readCollapsed = () => {
  try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
};
const isSidebarCollapsed = ref(readCollapsed());
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  try { localStorage.setItem(SIDEBAR_KEY, isSidebarCollapsed.value ? '1' : '0'); } catch { /* ignore */ }
};

// Collapsed, the row is a link to the group's first page — the children are
// reachable from the flyout. Expanding the whole sidebar on click made the
// layout jump for what looked like a normal nav tap.
const onGroupClick = (item) => {
  if (isSidebarCollapsed.value) {
    const first = item.children?.[0];
    if (first && !isCurrentRoute(first.path)) router.push(first.path);
    return;
  }
  toggleGroup(item);
};


const navItems = [
  { path: '/', label: 'nav.dashboard', icon: 'fa-solid fa-chart-pie text-sky-500' },
  { path: '/booking', label: 'nav.book', icon: 'fa-solid fa-calendar-days text-indigo-500' },
  { path: '/history', label: 'nav.history', icon: 'fa-solid fa-clock-rotate-left text-violet-500' },
  { path: '/writing', label: 'nav.writing', icon: 'fa-solid fa-pen-nib text-rose-500' },
  { path: '/analytics', label: 'nav.analytics', icon: 'fa-solid fa-chart-line text-emerald-500' },
  // The ledger and the top-up are two views of the same balance, so they sit
  // together behind one expandable row rather than as two peers.
  {
    key: 'points',
    label: 'nav.pointsGroup',
    icon: 'fa-solid fa-coins text-amber-500',
    children: [
      { path: '/points', label: 'nav.points', icon: 'fa-solid fa-clock-rotate-left text-amber-500' },
      { path: '/purchase', label: 'nav.purchase', icon: 'fa-solid fa-cart-shopping text-teal-500' },
    ],
  },
  { path: '/refer', label: 'nav.refer', icon: 'fa-solid fa-user-plus text-violet-500' },
  // No '/profile' here on purpose — it lives above Logout at the bottom.
];

const mobileBottomNavItems = [
  { path: '/', shortLabel: 'Dashboard', icon: 'fa-solid fa-chart-pie text-sky-500' },
  { path: '/booking', shortLabel: 'Book Class', icon: 'fa-solid fa-calendar-days text-indigo-500' },
  { path: '/analytics', shortLabel: 'Badges', icon: 'fa-solid fa-medal text-amber-500' },
  { path: '/history', shortLabel: 'History', icon: 'fa-solid fa-clock-rotate-left text-violet-500' },
  // No '/profile' tab: Settings takes the last slot and Profile lives inside it,
  // exactly as it does on the desktop sidebar.
];

// Settings gets its own bottom sheet rather than reusing the nav drawer: the
// drawer is a full-height panel of unrelated navigation, and sliding all of it
// in to show three rows means the answer arrives buried in the thing you did
// not ask for. The sheet rises from the tab that summoned it instead.
const isSettingsSheetOpen = ref(false);

// Any navigation out of the sheet should leave it closed behind you.
watch(() => route.path, () => { isSettingsSheetOpen.value = false; });

// A group opens itself when one of its pages is active; clicking the row then
// overrides that until the route changes again.
const openGroups = ref({});
const groupHasActiveChild = (item) => item.children?.some((child) => isCurrentRoute(child.path)) ?? false;
const isGroupOpen = (item) => openGroups.value[item.key] ?? groupHasActiveChild(item);
const toggleGroup = (item) => { openGroups.value[item.key] = !isGroupOpen(item); };


const isCurrentRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === '';
  }
  return route.path.startsWith(path);
};

watch(
  () => route.path,
  () => {
    navItems.forEach((item) => {
      if (item.children && groupHasActiveChild(item)) openGroups.value[item.key] = true;
    });
  },
  { immediate: true }
);

const isDashboardRoute = computed(() => {
  return route.path === '/' || route.path === '' || route.path === '/student-portal' || route.path === '/student-portal/';
});

const currentPageTitle = computed(() => {
  const flat = navItems.flatMap((item) => item.children ?? [item]);
  const currentNav = flat.find((item) => item.path && isCurrentRoute(item.path));
  return currentNav ? t(currentNav.label) : 'Student Portal';
});

</script>

<style scoped>
/* Landscape is a height problem, not a width one: a phone at 844x390 has less
   vertical room than the narrowest portrait phone. These rules trade the
   decorative half of the profile header for list space, so the nav and the
   Settings row below it stay reachable instead of being squeezed into a sliver.
   Keyed off height alone so they fire in landscape on any device. */
@media (max-height: 820px) {
  .sidebar-profile { padding: 1rem 1rem 0.875rem; }
  .sidebar-profile .sidebar-avatar { width: 4rem; height: 4rem; }
  .sidebar-profile .sidebar-badges { display: none; }
}

@media (max-height: 700px) {
  .sidebar-profile .sidebar-avatar { width: 3rem; height: 3rem; border-width: 2px; }
  .sidebar-profile .sidebar-rank { display: none; }
}

@media (max-height: 560px) {
  /* Stack the drawer header sideways: a centred column of avatar, name and
     points eats over half a landscape phone screen on its own. */
  .drawer-profile {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  .drawer-profile .drawer-avatar { width: 2.75rem; height: 2.75rem; border-width: 2px; }
  .drawer-profile .drawer-points { display: none; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
