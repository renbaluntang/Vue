<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brighture-cream border border-brighture-gold/30 text-brighture-bronze text-xs font-bold mb-2">
          <span>📈</span> Learning Analytics & Achievements
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Progress & Badges
        </h1>
        <p class="text-sm text-slate-500 font-medium mt-1">
          Track your online lesson milestones, language proficiency, and earned achievements.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
          <span class="text-2xl">🔥</span>
          <div>
            <div class="text-[10px] uppercase font-extrabold tracking-wider text-amber-600">Active Streak</div>
            <div class="text-base font-black text-amber-900">{{ user.stats.currentStreak }} Days In A Row</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards (Responsive grid) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500">Total Lessons</span>
          <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg">
            🎓
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">{{ user.stats.totalLessons }}</div>
          <div class="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span>↑ 4 classes</span> this week
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500">Live Class Hours</span>
          <div class="w-10 h-10 rounded-xl bg-brighture-cream text-brighture-bronze flex items-center justify-center text-lg">
            ⏱️
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">{{ user.stats.completedHours }}<span class="text-sm font-bold text-slate-400 ml-1">hrs</span></div>
          <div class="text-[11px] font-semibold text-brighture-bronze mt-1">
            Online 1-on-1 English
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500">Attendance Rate</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            ✅
          </div>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-600">{{ user.stats.attendanceRate }}%</div>
          <div class="text-[11px] font-semibold text-slate-400 mt-1">
            On-time attendance
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500">Current Level</span>
          <div class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-lg">
            🏆
          </div>
        </div>
        <div>
          <div class="text-xl sm:text-2xl font-black text-slate-900">{{ user.profile.level.split(' ')[0] }}</div>
          <div class="text-[11px] font-semibold text-slate-700 mt-1 truncate">
            {{ user.profile.level }}
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Progress & Weekly Goal Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      <!-- Left: Language Proficiency Breakdown -->
      <div class="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-5 rounded-full bg-brighture-gold"></span> English Skills Assessment
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Evaluated continuously by teachers across your online lessons</p>
          </div>
          <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700">CEFR B2+</span>
        </div>

        <div class="space-y-4">
          <div v-for="skill in user.skills" :key="skill.name" class="space-y-1.5">
            <div class="flex justify-between text-xs font-bold">
              <span class="text-slate-700">{{ skill.name }}</span>
              <span class="text-slate-900 font-extrabold">{{ skill.level }} / 100</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
              <div
                class="h-full rounded-full transition-all duration-1000 shadow-sm"
                :class="skill.color"
                :style="{ width: `${skill.level}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-brighture-cream/70 border border-brighture-gold/20 p-4 text-xs text-brighture-ink flex items-start gap-3">
          <span class="text-xl">💡</span>
          <div>
            <strong class="font-bold">Instructor Recommendation:</strong>
            <p class="mt-0.5 text-brighture-bronze">
              Focus on <em>Pronunciation & Accent Training</em> in your upcoming online lessons to reach the C1 Advanced milestone.
            </p>
          </div>
        </div>
      </div>

      <!-- Right: Weekly Schedule & Goal -->
      <div class="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-5 rounded-full bg-emerald-500"></span> Weekly Online Lesson Goal
            </h2>
            <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {{ user.stats.weeklyGoalMet }}/{{ user.stats.weeklyGoalTotal }} Completed
            </span>
          </div>

          <div class="mt-6 text-center">
            <div class="inline-flex items-center justify-center w-28 h-28 rounded-full border-8 border-emerald-500 bg-emerald-50 text-emerald-800 font-black text-2xl mb-3 shadow-inner">
              80%
            </div>
            <p class="text-sm font-bold text-slate-800">Almost there! 1 more class to complete your weekly target.</p>
            <p class="text-xs text-slate-500 mt-1">Consistent weekly practice yields 3x faster speaking fluency gains.</p>
          </div>

          <!-- Weekly Days Check -->
          <div class="grid grid-cols-7 gap-1.5 mt-6 text-center">
            <div
              v-for="(day, idx) in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
              :key="day"
              class="px-1 py-2 rounded-xl text-xs font-bold transition"
              :class="idx < 4 ? 'bg-emerald-500 text-white shadow-xs' : idx === 4 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-400'"
            >
              <div class="text-[9px] uppercase tracking-wide">{{ day }}</div>
              <!-- fixed-height, centred marker row so "Today" sits on the same
                   baseline as the ✓/— glyphs instead of riding above them -->
              <div class="mt-1 h-5 flex items-center justify-center leading-none">
                <span v-if="idx < 4" class="text-sm">✓</span>
                <span v-else-if="idx === 4" class="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">Today</span>
                <span v-else class="text-sm">—</span>
              </div>
            </div>
          </div>
        </div>

        <RouterLink
          to="/booking"
          class="w-full py-3.5 px-4 rounded-2xl bg-[#FFCD00] text-black font-bold text-center text-sm shadow-md hover:bg-[#FFD933] transition block mt-4"
        >
          Book Next Online Class →
        </RouterLink>
      </div>
    </div>

    <!-- Achievement Badges Showcase -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>🏅</span> Student Badges & Accomplishments
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Unlock prestige badges as you complete online English sessions.</p>
        </div>
        <div class="text-xs font-bold text-slate-500">
          Unlocked: <strong class="text-brighture-bronze font-extrabold">{{ user.badges.filter(b => b.unlocked).length }}</strong> of {{ user.badges.length }}
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div
          v-for="badge in user.badges"
          :key="badge.id"
          class="relative rounded-2xl border p-5 transition-all duration-200 group"
          :class="badge.unlocked ? 'border-slate-200 bg-white hover:border-brighture-gold/50 hover:shadow-md' : 'border-dashed border-slate-200 bg-slate-50/70 opacity-75'"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 bg-gradient-to-br text-white"
              :class="badge.bgGradient"
            >
              {{ badge.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 truncate">{{ badge.title }}</h3>
                <span
                  class="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded"
                  :class="badge.unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'"
                >
                  {{ badge.tier }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ badge.desc }}</p>
              
              <div class="mt-3 flex items-center justify-between text-[11px]">
                <span v-if="badge.unlocked" class="font-bold text-emerald-600 flex items-center gap-1">
                  <span>✓</span> Unlocked {{ badge.date }}
                </span>
                <span v-else class="font-bold text-slate-500 flex items-center gap-1">
                  <span>🔒</span> In Progress ({{ badge.progress }})
                </span>
              </div>
            </div>
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
