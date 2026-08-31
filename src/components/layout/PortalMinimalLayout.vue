<template>
  <div class="flex h-screen supports-[height:100dvh]:h-[100dvh] w-full bg-[#fafafa] font-sans text-zinc-800 antialiased overflow-hidden">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex w-64 xl:w-68 flex-shrink-0 bg-white border-r border-zinc-200/80 flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20">
      <!-- Brand & Profile Header -->
      <div class="p-6 border-b border-zinc-100 flex flex-col items-center text-center bg-gradient-to-b from-zinc-50/50 to-white">
        <!-- Student Avatar -->
        <RouterLink to="/profile" class="relative mb-3 group block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold focus-visible:ring-offset-2" title="View your profile">
          <img
            :src="user.profile.photo"
            alt="Student Avatar"
            class="w-20 h-20 rounded-full shadow-sm border-2 border-white ring-2 ring-zinc-200/80 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            class="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200 flex items-center justify-center text-[9px] text-white font-bold"
            title="Online"
          >
            ✓
          </span>
        </RouterLink>

        <h2 class="text-base font-bold text-zinc-900 tracking-tight">{{ user.fullName }}</h2>

        <!-- Minimalist Points Display -->
        <RouterLink
          to="/points"
          class="mt-3.5 w-full px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/60 flex items-center justify-between transition group"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span class="text-xs font-semibold text-zinc-600 group-hover:text-zinc-900">Points</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-extrabold text-zinc-900 tracking-tight">{{ user.profile.pointsBalance }}</span>
            <span class="text-[11px] font-bold text-zinc-400">PTS</span>
          </div>
        </RouterLink>

        <!-- Badges Pill -->
        <div class="mt-2.5 flex items-center justify-center gap-2 w-full">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 text-zinc-700 text-[11px] font-medium rounded-md border border-zinc-200/60">
            🎯 {{ user.profile.level.split(' ')[0] }}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50/80 text-amber-800 text-[11px] font-medium rounded-md border border-amber-200/60">
            🔥 {{ user.stats.currentStreak }}d streak
          </span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-zinc-900 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
          ]"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-base transition-transform group-hover:scale-105">{{ item.icon }}</span>
            <span>{{ t(item.label) }}</span>
          </div>
          <span
            v-if="item.badge"
            :class="[
              'text-[10px] font-semibold px-2 py-0.5 rounded-md transition',
              isCurrentRoute(item.path)
                ? 'bg-zinc-800 text-zinc-200'
                : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-800'
            ]"
          >
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <!-- Bottom Profile & Logout -->
      <div class="p-3 border-t border-zinc-100 bg-zinc-50/40 space-y-1">
        <RouterLink
          to="/profile"
          class="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
        >
          <span class="text-sm">⚙️</span> {{ t('nav.profile') }}
        </RouterLink>
        <button class="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-zinc-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition">
          <span class="text-sm">🚪</span> {{ t('nav.logout') }}
        </button>
      </div>
    </aside>

    <!-- Mobile Drawer Overlay & Sidebar (Mobile View) -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
      @click="isMobileMenuOpen = false"
    ></div>

    <aside
      class="fixed top-0 left-0 h-screen supports-[height:100dvh]:h-[100dvh] w-72 sm:w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out lg:hidden"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-5 border-b border-zinc-100 flex flex-col items-center text-center relative bg-gradient-to-b from-zinc-50 to-white">
        <button
          @click="isMobileMenuOpen = false"
          class="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm transition"
          aria-label="Close Navigation"
        >
          ✕
        </button>

        <img
          :src="user.profile.photo"
          alt="Avatar"
          class="w-16 h-16 rounded-full shadow-sm border-2 border-white ring-2 ring-zinc-200/80 object-cover mb-2"
        />
        <h2 class="text-base font-bold text-zinc-900">{{ user.fullName }}</h2>
        <p class="text-xs text-zinc-400">{{ user.profile.level.split(' ')[0] }}</p>

        <RouterLink
          to="/points"
          @click="isMobileMenuOpen = false"
          class="mt-3 w-full px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 flex items-center justify-between transition"
        >
          <span class="text-xs font-semibold text-zinc-500">Points Balance</span>
          <span class="text-sm font-extrabold text-zinc-900">{{ user.profile.pointsBalance }} <span class="text-xs font-medium text-zinc-400">PTS</span></span>
        </RouterLink>
      </div>

      <nav class="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition active:scale-[0.99]"
          :class="[
            isCurrentRoute(item.path)
              ? 'bg-zinc-900 text-white shadow-xs font-semibold'
              : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ t(item.label) }}</span>
          </div>
          <span
            v-if="item.badge"
            :class="[
              'text-[10px] font-semibold px-2 py-0.5 rounded-md',
              isCurrentRoute(item.path) ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-500'
            ]"
          >
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <div class="shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-zinc-100 bg-zinc-50/50 space-y-1">
        <RouterLink
          to="/profile"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
        >
          <span>⚙️</span> {{ t('nav.profile') }}
        </RouterLink>
        <button
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-medium text-zinc-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition"
        >
          <span>🚪</span> {{ t('nav.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Minimalist Upcoming Class Alert (Shown on subpages) -->
      <div
        v-if="user.nextUpcomingClass && !isDashboardRoute"
        class="bg-zinc-900 text-white px-3 sm:px-6 py-1.5 text-xs font-medium flex flex-nowrap items-center justify-between gap-2.5 flex-shrink-0 z-30 border-b border-zinc-800"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div class="truncate text-[11px] sm:text-xs">
            <span class="mr-1 font-semibold text-zinc-300">
              Next class in {{ user.nextUpcomingClass.minutesUntil }}m:
            </span>
            <span class="text-zinc-300">
              {{ user.nextUpcomingClass.subject }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0 ml-auto">
          <a
            :href="user.nextUpcomingClass.meetLink"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] sm:text-xs shadow-xs transition active:scale-95"
          >
            <span>📹</span> Join
          </a>
        </div>
      </div>

      <!-- Top Sticky Minimalist Header -->
      <header class="h-14 bg-white/90 backdrop-blur-md border-b border-zinc-200/70 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-10 sticky top-0">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <button
            @click="isMobileMenuOpen = true"
            class="lg:hidden p-2 -ml-1 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition active:scale-95"
            aria-label="Open Menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Current Page Title -->
          <h1 class="min-w-0 text-sm sm:text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <span class="truncate">{{ currentPageTitle }}</span>
          </h1>
        </div>

        <!-- Header Right Utilities -->
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <!-- Minimalist Points Capsule (Clickable -> Opens /points) -->
          <RouterLink
            to="/points"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition border border-zinc-200/60 active:scale-95"
            title="View Point History"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
            <span><strong>{{ user.profile.pointsBalance }}</strong> <span class="text-zinc-500 font-normal">pts</span></span>
          </RouterLink>

          <!-- Quick Booking CTA (Desktop & Tablet) -->
          <RouterLink
            to="/booking"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition active:scale-95"
          >
            <span>🗓️</span> Book Class
          </RouterLink>

          <!-- Language Selector -->
          <select
            v-model="$i18n.locale"
            class="bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 py-1 px-1.5 sm:px-2 outline-none hover:border-zinc-300 focus:border-zinc-400 transition"
          >
            <option value="en">EN</option>
            <option value="ja">JA</option>
          </select>
        </div>
      </header>

      <!-- Scrollable Main Viewport (Responsive bottom padding to avoid mobile bottom nav overlap) -->
      <main class="flex-1 overflow-y-auto pb-24 sm:pb-28 lg:pb-8 bg-[#fafafa]">
        <RouterView />
      </main>

      <!-- Mobile Bottom Navigation Bar (Ultra-clean, native feeling, touch-friendly) -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-2 flex items-center justify-around z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
        <RouterLink
          v-for="item in mobileBottomNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-150 active:scale-95 touch-manipulation"
          :class="isCurrentRoute(item.path) ? 'text-zinc-900 font-bold' : 'text-zinc-400 font-medium hover:text-zinc-700'"
        >
          <span class="text-lg leading-none transition-transform" :class="isCurrentRoute(item.path) ? 'scale-110' : ''">{{ item.icon }}</span>
          <span class="text-[10px] mt-1 tracking-tight truncate">{{ item.shortLabel }}</span>
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

const navItems = computed(() => [
  { path: '/', label: 'nav.dashboard', icon: '📊' },
  { path: '/booking', label: 'nav.book', icon: '🗓️' },
  { path: '/analytics', label: 'nav.analytics', icon: '📈' },
  { path: '/counseling', label: 'nav.counseling', icon: '🧭' },
  { path: '/history', label: 'nav.history', icon: '📜' },
  { path: '/writing', label: 'nav.writing', icon: '✍️' },
  { path: '/points', label: 'nav.points', icon: 'fa-solid fa-coins text-amber-500', badge: `${user.profile.pointsBalance} pts` },
  { path: '/purchase', label: 'nav.purchase', icon: '🛒' },
]);

const mobileBottomNavItems = [
  { path: '/', shortLabel: 'Dashboard', icon: '📊' },
  { path: '/booking', shortLabel: 'Book', icon: '🗓️' },
  { path: '/analytics', shortLabel: 'Progress', icon: '📈' },
  { path: '/history', shortLabel: 'History', icon: '📜' },
  { path: '/profile', shortLabel: 'Profile', icon: '👤' },
];

const isCurrentRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === '';
  }
  return route.path.startsWith(path);
};

const isDashboardRoute = computed(() => {
  return route.path === '/' || route.path === '' || route.path === '/student-portal-v2' || route.path === '/student-portal-v2/';
});

const currentPageTitle = computed(() => {
  const currentNav = navItems.value.find(item => isCurrentRoute(item.path));
  return currentNav ? t(currentNav.label) : 'Student Portal';
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e4e4e7;
  border-radius: 3px;
}
</style>
