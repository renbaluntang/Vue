<template>
  <div class="flex h-screen supports-[height:100dvh]:h-[100dvh] w-full bg-[#f8fafc] font-sans text-slate-800 antialiased overflow-hidden">
    <!-- Desktop Sidebar (Hidden on mobile & small tablet, visible on lg+) -->
    <aside class="hidden lg:flex w-72 flex-shrink-0 bg-white border-r border-slate-200/80 flex-col shadow-sm z-20">
      <!-- User Profile Snapshot with BIG Profile Image + PLAIN Points Balance (No Background) -->
      <div class="p-6 border-b border-slate-100 flex flex-col items-center text-center bg-gradient-to-b from-slate-50/60 to-white">
        <RouterLink to="/profile" class="relative mb-3 group block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold focus-visible:ring-offset-2" title="View your profile">
          <!-- Bigger Profile Image (w-28 h-28) -->
          <img
            :src="user.profile.photo"
            alt="Student Avatar"
            class="w-24 h-24 xl:w-28 xl:h-28 rounded-full shadow-md border-4 border-white ring-4 ring-indigo-50/80 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200 flex items-center justify-center text-[10px] text-white font-bold"
            title="Online & Ready"
          >
            ✓
          </span>
          <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wider whitespace-nowrap">
            {{ user.stats.rank }}
          </div>
        </RouterLink>

        <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ user.fullName }}</h2>

        <!-- PLAIN POINTS BALANCE (NO BACKGROUND) -->
        <div class="mt-3.5 w-full text-center space-y-0.5">
          <div class="flex items-baseline justify-center gap-1.5 text-slate-900">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Points:</span>
            <span class="text-2xl font-black text-slate-900 tracking-tight">{{ user.profile.pointsBalance }}</span>
            <span class="text-xs font-black text-indigo-600 tracking-wider">PTS</span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">
            Expires: {{ user.profile.pointsExpiry }}
          </p>
        </div>

        <!-- Level & Streak Badges -->
        <div class="mt-3 flex flex-wrap items-center justify-center gap-1.5 w-full">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-extrabold rounded-xl border border-indigo-100/80 shadow-2xs">
            🎯 {{ user.profile.level.split(' ')[0] }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl border border-indigo-200/80 shadow-2xs">
            🔥 {{ user.stats.currentStreak }}d streak
          </span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 group"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <div class="flex items-center gap-3">
            <i :class="item.icon" class="w-5 text-center text-lg transition-transform group-hover:scale-110"></i>
            <span>{{ t(item.label) }}</span>
          </div>
        </RouterLink>
      </nav>

      <!-- Bottom Profile & Logout -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        <RouterLink
          to="/profile"
          class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <i class="fa-solid fa-user w-4 text-center text-slate-500"></i> {{ t('nav.profile') }}
        </RouterLink>
        <button class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
          <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-slate-400"></i> {{ t('nav.logout') }}
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
      <div class="p-6 border-b border-slate-100 flex flex-col items-center text-center relative bg-gradient-to-b from-slate-50 to-white">
        <button
          @click="isMobileMenuOpen = false"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          aria-label="Close Navigation"
        >
          ✕
        </button>

        <img
          :src="user.profile.photo"
          alt="Avatar"
          class="w-24 h-24 rounded-full shadow-md border-4 border-white ring-4 ring-indigo-50 object-cover mb-2"
        />
        <h2 class="text-base font-black text-slate-900">{{ user.fullName }}</h2>

        <!-- PLAIN Points Display in Mobile Drawer (No Background) -->
        <div class="mt-3.5 w-full text-center space-y-0.5">
          <div class="flex items-baseline justify-center gap-1.5 text-slate-900">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Points:</span>
            <span class="text-xl font-black text-slate-900">{{ user.profile.pointsBalance }}</span>
            <span class="text-xs font-black text-indigo-600">PTS</span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">
            Expires: {{ user.profile.pointsExpiry }}
          </p>
        </div>
      </div>

      <!-- Mobile Nav List -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          ]"
        >
          <div class="flex items-center gap-3">
            <i :class="item.icon" class="w-5 text-center text-lg"></i>
            <span>{{ t(item.label) }}</span>
          </div>
        </RouterLink>
      </nav>

      <!-- shrink-0 so a long nav list can never squeeze these two off the panel,
           and the safe-area padding keeps them clear of the iOS home indicator. -->
      <div class="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        <RouterLink
          to="/profile"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <i class="fa-solid fa-user w-4 text-center text-slate-500"></i> {{ t('nav.profile') }}
        </RouterLink>
        <button
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
        >
          <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-slate-400"></i> {{ t('nav.logout') }}
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
            class="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open Menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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
            class="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-1.5 px-2 outline-none hover:border-slate-300 focus:border-indigo-400 transition"
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
          :class="isCurrentRoute(item.path) ? 'text-indigo-600 font-extrabold' : 'text-slate-500 font-medium hover:text-slate-900'"
        >
          <i :class="item.icon" class="mb-0.5 text-lg leading-none"></i>
          <span class="text-[10px] tracking-tight truncate">{{ item.shortLabel }}</span>
        </RouterLink>
      </nav>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';

const { t } = useI18n();
const route = useRoute();
const user = useUserStore();

const isMobileMenuOpen = ref(false);

const navItems = [
  { path: '/', label: 'nav.dashboard', icon: 'fa-solid fa-chart-pie text-sky-500' },
  { path: '/booking', label: 'nav.book', icon: 'fa-solid fa-calendar-days text-indigo-500' },
  { path: '/history', label: 'nav.history', icon: 'fa-solid fa-clock-rotate-left text-violet-500' },
  { path: '/writing', label: 'nav.writing', icon: 'fa-solid fa-pen-nib text-rose-500' },
  { path: '/analytics', label: 'nav.analytics', icon: 'fa-solid fa-chart-line text-emerald-500' },
  { path: '/points', label: 'nav.points', icon: 'fa-solid fa-coins text-amber-500' },
  { path: '/purchase', label: 'nav.purchase', icon: 'fa-solid fa-cart-shopping text-teal-500' },
  // No '/profile' here on purpose — it lives above Logout at the bottom.
];

const mobileBottomNavItems = [
  { path: '/', shortLabel: 'Dashboard', icon: 'fa-solid fa-chart-pie text-sky-500' },
  { path: '/booking', shortLabel: 'Book Class', icon: 'fa-solid fa-calendar-days text-indigo-500' },
  { path: '/analytics', shortLabel: 'Badges', icon: 'fa-solid fa-medal text-amber-500' },
  { path: '/history', shortLabel: 'History', icon: 'fa-solid fa-clock-rotate-left text-violet-500' },
  { path: '/profile', shortLabel: 'Profile', icon: 'fa-solid fa-user text-slate-500' },
];

const isCurrentRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === '';
  }
  return route.path.startsWith(path);
};

const isDashboardRoute = computed(() => {
  return route.path === '/' || route.path === '' || route.path === '/student-portal' || route.path === '/student-portal/';
});

const currentPageTitle = computed(() => {
  const currentNav = navItems.find(item => isCurrentRoute(item.path));
  return currentNav ? t(currentNav.label) : 'Student Portal';
});
</script>

<style scoped>
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
