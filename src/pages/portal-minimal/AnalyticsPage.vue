<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500 pb-20">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-semibold mb-1">
          <span>📈</span> Learning Analytics
        </div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Progress & Achievements
        </h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">
          Track your lesson milestones, language skills, and earned badges.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <div class="bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-2">
          <span class="text-lg sm:text-xl">🔥</span>
          <div>
            <div class="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-amber-700">Active Streak</div>
            <div class="text-xs sm:text-sm font-extrabold text-amber-900">{{ user.stats.currentStreak }} Days in a Row</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards (2x2 grid on mobile) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <div class="bg-white border border-zinc-200/80 rounded-2xl p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] sm:text-xs font-medium text-zinc-400">Total Lessons</span>
          <span class="text-sm">🎓</span>
        </div>
        <div>
          <div class="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">{{ user.stats.totalLessons }}</div>
          <div class="text-[10px] sm:text-[11px] font-medium text-emerald-600 mt-0.5">+4 this week</div>
        </div>
      </div>

      <div class="bg-white border border-zinc-200/80 rounded-2xl p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] sm:text-xs font-medium text-zinc-400">Class Hours</span>
          <span class="text-sm">⏱️</span>
        </div>
        <div>
          <div class="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">{{ user.stats.completedHours }}<span class="text-xs font-semibold text-zinc-400 ml-1">hrs</span></div>
          <div class="text-[10px] sm:text-[11px] font-medium text-zinc-500 mt-0.5">1-on-1 Practice</div>
        </div>
      </div>

      <div class="bg-white border border-zinc-200/80 rounded-2xl p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] sm:text-xs font-medium text-zinc-400">Attendance</span>
          <span class="text-sm">✅</span>
        </div>
        <div>
          <div class="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">{{ user.stats.attendanceRate }}%</div>
          <div class="text-[10px] sm:text-[11px] font-medium text-zinc-500 mt-0.5">On-time rate</div>
        </div>
      </div>

      <div class="bg-white border border-zinc-200/80 rounded-2xl p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] sm:text-xs font-medium text-zinc-400">Current Level</span>
          <span class="text-sm">🏆</span>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">{{ user.profile.level.split(' ')[0] }}</div>
          <div class="text-[10px] sm:text-[11px] font-medium text-zinc-500 mt-0.5 truncate">{{ user.profile.level }}</div>
        </div>
      </div>
    </div>

    <!-- Skill Progress & Weekly Goal Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <!-- Left: Language Skills Assessment -->
      <div class="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-zinc-900">
              Skills Assessment
            </h2>
            <p class="text-xs text-zinc-400 mt-0.5">Evaluated across your online lessons</p>
          </div>
          <span class="text-xs font-semibold text-zinc-500">CEFR B2 Level</span>
        </div>

        <div class="space-y-3.5 pt-1">
          <div v-for="skill in user.skills" :key="skill.name" class="space-y-1.5">
            <div class="flex justify-between text-xs font-medium">
              <span class="text-zinc-700">{{ skill.name }}</span>
              <span class="text-zinc-900 font-bold">{{ skill.level }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 bg-zinc-800"
                :style="{ width: `${skill.level}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Weekly Goal Tracker -->
      <div class="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3.5">
            <div>
              <h2 class="text-sm sm:text-base font-bold text-zinc-900">Weekly Target</h2>
              <p class="text-xs text-zinc-400 mt-0.5">5 live classes per week</p>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
              On Track
            </span>
          </div>

          <div class="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center space-y-1.5">
            <div class="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {{ user.stats.weeklyGoalMet }} <span class="text-sm sm:text-base font-normal text-zinc-400">/ {{ user.stats.weeklyGoalTotal }} classes</span>
            </div>
            <p class="text-[11px] sm:text-xs text-zinc-500">1 more session needed to reach this week's goal!</p>
          </div>

          <div class="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3.5">
            <div
              v-for="(day, idx) in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
              :key="day"
              :class="`p-2 sm:p-2.5 rounded-xl text-center border transition ${
                idx < user.stats.weeklyGoalMet
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                  : 'bg-white text-zinc-400 border-zinc-200'
              }`"
            >
              <div class="text-[10px] uppercase font-bold">{{ day }}</div>
              <div class="text-xs mt-0.5 sm:mt-1">{{ idx < user.stats.weeklyGoalMet ? '✓' : '—' }}</div>
            </div>
          </div>
        </div>

        <RouterLink
          to="/booking"
          class="mt-4 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs text-center transition block active:scale-95 shadow-xs"
        >
          Book Target Class →
        </RouterLink>
      </div>
    </div>

    <!-- Badges & Achievements Section -->
    <div class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-zinc-900">Earned Badges</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Collect trophies as you build streaks and finish classes</p>
        </div>
        <span class="text-xs font-semibold text-zinc-600">
          {{ user.badges.filter(b => b.unlocked).length }} / {{ user.badges.length }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        <div
          v-for="badge in user.badges"
          :key="badge.id"
          :class="`p-3.5 rounded-xl border transition flex items-start gap-3 ${
            badge.unlocked
              ? 'bg-zinc-50/40 border-zinc-200'
              : 'bg-zinc-50/20 border-zinc-100 opacity-60'
          }`"
        >
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-center text-lg shrink-0">
            {{ badge.icon }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <h3 class="text-xs font-bold text-zinc-900 truncate">{{ badge.title }}</h3>
              <span v-if="badge.unlocked" class="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 shrink-0">Unlocked</span>
              <span v-else class="text-[9px] sm:text-[10px] font-medium text-zinc-400 shrink-0">{{ badge.progress }}</span>
            </div>
            <p class="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{{ badge.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/useUserStore';
const user = useUserStore();
</script>
