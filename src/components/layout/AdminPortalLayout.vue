<template>
  <div class="flex h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden bg-slate-50 font-sans text-slate-900">
    <RouteProgress />

    <!-- ===================== Desktop Sidebar (lg+) ===================== -->
    <aside class="hidden lg:flex w-64 flex-shrink-0 flex-col bg-white border-r border-slate-200/80 shadow-sm z-20">
      <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <img :src="logo" alt="Brighture" class="h-7 w-auto" />
        <p class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brighture-ink px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brighture-gold">
          <i class="fa-solid fa-user-shield text-[9px]"></i>
          Admin
        </p>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        <p class="px-3.5 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Level check</p>
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors group"
          :class="isCurrent(item.path) ? 'bg-brighture-gold text-brighture-ink' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <span class="flex items-center gap-3 min-w-0">
            <i :class="[item.icon, isCurrent(item.path) ? '!text-brighture-ink' : 'text-slate-400 group-hover:text-slate-600']" class="w-5 text-center text-base"></i>
            <span class="truncate">{{ item.label }}</span>
          </span>
          <span
            v-if="badgeFor(item)"
            class="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
            :class="isCurrent(item.path) ? 'bg-brighture-ink/10 text-brighture-ink' : 'bg-slate-100 text-slate-600'"
          >
            {{ badgeFor(item) }}
          </span>
        </RouterLink>
      </nav>

      <div class="relative border-t border-slate-100 bg-slate-50/60 p-3 flex-shrink-0">
        <div v-if="isMenuOpen" class="fixed inset-0 z-40" @click="isMenuOpen = false"></div>
        <div v-if="isMenuOpen" class="absolute bottom-full left-3 right-3 z-50 mb-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          <ZoneSwitch class="mx-1 mb-1.5" />
          <!-- Two clicks, not a browser confirm: the first arms it, the second
               throws away every change made in any of the portals. -->
          <button
            type="button"
            @click="onResetDemo"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-bold transition"
            :class="resetArmed ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink'"
          >
            <i class="fa-solid fa-rotate-left w-4 text-center" :class="resetArmed ? 'text-rose-500' : 'text-slate-400'"></i>
            <span>{{ resetArmed ? 'Click again to reset' : 'Reset demo data' }}</span>
            <span v-if="resetArmed" class="ml-auto text-[10px] font-bold text-rose-500">All portals</span>
          </button>
        </div>
        <button
          type="button"
          @click="isMenuOpen = !isMenuOpen"
          class="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          :class="isMenuOpen ? 'bg-slate-100 text-slate-900' : ''"
        >
          <span class="flex items-center gap-2.5">
            <i class="fa-solid fa-gear text-sm text-slate-500 transition-transform duration-200" :class="isMenuOpen ? 'rotate-90 text-brighture-bronze' : ''"></i>
            Settings
          </span>
          <i class="fa-solid fa-ellipsis-vertical text-slate-400 text-xs"></i>
        </button>
      </div>
    </aside>

    <!-- ===================== Mobile Drawer ===================== -->
    <div v-if="isDrawerOpen" class="fixed inset-0 bg-slate-900/60 z-40 lg:hidden" @click="isDrawerOpen = false"></div>
    <aside
      class="fixed top-0 left-0 h-screen supports-[height:100dvh]:h-[100dvh] w-72 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 lg:hidden"
      :class="isDrawerOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="relative px-5 py-5 border-b border-slate-100">
        <img :src="logo" alt="Brighture" class="h-6 w-auto" />
        <p class="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Admin panel</p>
        <button
          type="button"
          @click="isDrawerOpen = false"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          aria-label="Close navigation"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <nav class="flex-1 overflow-y-auto p-4 space-y-1.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="isCurrent(item.path) ? 'bg-brighture-gold text-brighture-ink' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <span class="flex items-center gap-3">
            <i :class="[item.icon, isCurrent(item.path) ? '!text-brighture-ink' : 'text-slate-400']" class="w-5 text-center text-base"></i>
            {{ item.label }}
          </span>
          <span v-if="badgeFor(item)" class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">{{ badgeFor(item) }}</span>
        </RouterLink>
      </nav>
      <div class="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-slate-50/50 space-y-2">
        <ZoneSwitch />
        <button
          type="button"
          @click="onResetDemo"
          class="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold rounded-xl transition"
          :class="resetArmed ? 'bg-rose-50 text-rose-700' : 'text-slate-700 hover:bg-brighture-cream hover:text-brighture-ink'"
        >
          <i class="fa-solid fa-rotate-left w-4 text-center" :class="resetArmed ? 'text-rose-500' : 'text-slate-400'"></i>
          <span>{{ resetArmed ? 'Tap again to reset' : 'Reset demo data' }}</span>
        </button>
      </div>
    </aside>

    <!-- ===================== Main ===================== -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <header class="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-3 px-4 sm:px-6 flex-shrink-0 z-30">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            @click="isDrawerOpen = true"
            class="lg:hidden shrink-0 -ml-1 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open menu"
          >
            <i class="fa-solid fa-bars text-lg"></i>
          </button>
          <h1 class="truncate text-base sm:text-lg font-black text-slate-900 tracking-tight">{{ pageTitle }}</h1>
        </div>
        <ZoneSwitch class="hidden sm:flex" />
      </header>

      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- Toast: top-right, over everything, so a confirmation never shifts the page. -->
    <div class="pointer-events-none fixed top-4 right-4 z-[90] flex max-w-[calc(100vw-2rem)] flex-col items-end">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="toast.message"
          :key="toast.id"
          role="status"
          class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-xl w-80 max-w-full"
          :class="toast.tone === 'error' ? 'border-rose-200 text-rose-800' : 'border-emerald-200 text-slate-800'"
        >
          <i
            class="mt-0.5"
            :class="toast.tone === 'error' ? 'fa-solid fa-circle-exclamation text-rose-500' : 'fa-solid fa-circle-check text-emerald-500'"
          ></i>
          <p class="flex-1 leading-snug">{{ toast.message }}</p>
          <button type="button" @click="dismissToast" class="text-slate-400 hover:text-slate-700" aria-label="Dismiss">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import RouteProgress from '@/components/RouteProgress.vue';
import ZoneSwitch from '@/pages/admin-portal/components/ZoneSwitch.vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { toast, dismissToast, showToast } from '@/pages/admin-portal/adminUi';
import logo from '@/assets/logo-black.svg';

const route = useRoute();
const school = useSchoolStore();

const navItems = [
  { path: '/templates', label: 'Level check templates', icon: 'fa-solid fa-clipboard-list' },
  { path: '/levels', label: 'Students & levels', icon: 'fa-solid fa-layer-group' },
  { path: '/assessments', label: 'Assessments', icon: 'fa-solid fa-clipboard-check' },
  { path: '/emails', label: 'Emails', icon: 'fa-solid fa-envelope-open-text' },
];

// The builder lives under /templates/..., so its parent item stays lit.
const isCurrent = (path) => (route.meta.nav ?? route.path) === path || route.path.startsWith(`${path}/`);
const pageTitle = computed(() => route.meta.title ?? 'Admin');

/** Counts worth a glance: work waiting on a teacher, and students never assessed. */
const badgeFor = (item) => {
  if (item.path === '/assessments') {
    const open = school.assessments.filter((a) => a.status !== 'submitted').length;
    return open || null;
  }
  if (item.path === '/levels') {
    const unassessed = Object.keys(school.db.students).filter((id) => !school.currentLevel(Number(id))).length;
    return unassessed || null;
  }
  return null;
};

const isDrawerOpen = ref(false);
const isMenuOpen = ref(false);
watch(() => route.fullPath, () => {
  isDrawerOpen.value = false;
  isMenuOpen.value = false;
});

/**
 * Reset the shared demo records for every portal. The first press arms it and
 * the second does it; closing the menu in between disarms it, so a stray tap
 * later cannot wipe anything.
 */
const resetArmed = ref(false);
const onResetDemo = () => {
  if (!resetArmed.value) {
    resetArmed.value = true;
    return;
  }
  resetArmed.value = false;
  school.resetDemo();
  isMenuOpen.value = false;
  isDrawerOpen.value = false;
};
watch([isMenuOpen, isDrawerOpen], ([menu, drawer]) => {
  if (!menu && !drawer) resetArmed.value = false;
});
</script>
