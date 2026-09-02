<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500 pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">Lesson History</h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">Archive of completed 1-on-1 classes, teacher feedback, and notes.</p>
      </div>
      <RouterLink
        to="/booking"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm shadow-xs hover:bg-zinc-800 transition active:scale-95 text-center"
      >
        <span>🗓️</span> Book Another Class
      </RouterLink>
    </div>

    <!-- History List -->
    <div class="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-zinc-100 overflow-hidden">
      <div
        v-for="item in pastLessons"
        :key="item.id"
        class="p-3.5 sm:p-5 hover:bg-zinc-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
      >
        <div class="flex items-start gap-3">
          <img
            :src="item.teacherPhoto"
            :alt="item.teacherName"
            class="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs sm:text-sm font-bold text-zinc-900">{{ item.subject }}</span>
              <span class="px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">Completed</span>
            </div>
            <p class="text-xs text-zinc-500 font-medium mt-0.5">
              Teacher: <span class="text-zinc-800 font-semibold">{{ item.teacherName }}</span> • Topic: {{ item.topic }}
            </p>
            <p class="text-[11px] sm:text-xs text-zinc-400 font-medium mt-0.5">
              📅 {{ item.date }} • {{ item.duration }}m • {{ item.pointsDeducted }} pts
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-center justify-end pt-1 sm:pt-0">
          <button
            @click="selectedLessonFeedback = item"
            class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition active:scale-95 text-center"
          >
            Review Notes
          </button>
        </div>
      </div>
    </div>

    <!-- Feedback Modal (Responsive dialog / bottom-sheet on mobile) -->
    <div
      v-if="selectedLessonFeedback"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/50 backdrop-blur-xs"
      @click="selectedLessonFeedback = null"
    >
      <div
        class="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-zinc-200 animate-in fade-in slide-in-from-bottom-5 max-h-[85vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 class="text-sm sm:text-base font-bold text-zinc-900">Lesson Feedback & Notes</h3>
          <button @click="selectedLessonFeedback = null" class="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 font-bold text-sm">✕</button>
        </div>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <div class="flex items-center gap-3">
            <img :src="selectedLessonFeedback.teacherPhoto" class="w-9 h-9 rounded-xl object-cover border border-zinc-200" />
            <div>
              <div class="font-bold text-zinc-900">{{ selectedLessonFeedback.teacherName }}</div>
              <div class="text-[11px] text-zinc-400">{{ selectedLessonFeedback.date }}</div>
            </div>
          </div>
          <div class="p-3.5 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-100 whitespace-pre-wrap leading-relaxed text-zinc-800 text-xs sm:text-sm">
            {{ selectedLessonFeedback.feedback }}
          </div>
        </div>
        <div class="flex justify-end pt-2">
          <button
            @click="selectedLessonFeedback = null"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { imageForKey } from '@/lib/teacherImages';
import { ref } from 'vue';

const selectedLessonFeedback = ref(null);

const pastLessons = ref([
  {
    id: 101,
    date: 'Aug 19, 2026',
    teacherName: 'Sarah Jenkins',
    teacherPhoto: imageForKey(184),
    subject: '[SF] Speech Fluency & Discussion',
    topic: 'International Marketing & Market Fit',
    duration: 30,
    pointsDeducted: 5,
    feedback: `Taro showed strong vocabulary in strategic discussion today.\n\nKey takeaways:\n1. Improved cadence when delivering conclusions.\n2. Remember to use linking phrases like "In light of that" or "Consequently" instead of repeatedly saying "And so".\n\nOverall Rating: 5/5 ⭐`,
  },
  {
    id: 102,
    date: 'Aug 16, 2026',
    teacherName: 'James Anderson',
    teacherPhoto: imageForKey(178),
    subject: '[PP101] Pronunciation Training — Vowels',
    topic: 'Short vowels vs Long vowels distinction',
    duration: 50,
    pointsDeducted: 9,
    feedback: `Good effort on distinguishing /ɪ/ and /iː/ (ship vs sheep) and /æ/ vs /ʌ/ (cat vs cut).\n\nDaily homework: practice reading the 5 tongue twisters aloud for 3 minutes before sleep.\n\nOverall Rating: 4.8/5 ⭐`,
  },
  {
    id: 103,
    date: 'Aug 12, 2026',
    teacherName: 'Emily Rivera',
    teacherPhoto: imageForKey(176),
    subject: '[DC] Daily Conversation',
    topic: 'Weekend activities & travel experiences in Kyoto',
    duration: 30,
    pointsDeducted: 5,
    feedback: `Great casual flow and natural reactions. You asked engaging follow-up questions.\n\nOverall Rating: 5/5 ⭐`,
  },
]);
</script>
