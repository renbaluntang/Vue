<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-20">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1">
      <div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight">Writing Corrections</h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">Submit passages for direct instructor review and feedback.</p>
      </div>
      <button 
        v-if="!isCreatingNew"
        @click="openNewSubmission"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm transition active:scale-95 shadow-xs"
      >
        <span>+</span> New Submission (5 pts)
      </button>
    </div>

    <!-- Responsive Layout: Stacked Master-Detail on mobile/tablet, 2-column on lg+ -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[72vh] lg:min-h-[580px]">
      
      <!-- List Column (Hidden on mobile when viewing a thread or composer) -->
      <div
        :class="[
          'lg:col-span-4 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden',
          (activeThread || isCreatingNew) ? 'hidden lg:flex' : 'flex'
        ]"
      >
        <div class="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h2 class="text-xs sm:text-sm font-bold text-zinc-900">Your Tickets</h2>
          <span class="text-[11px] font-medium text-zinc-400">{{ tickets.length }} Submissions</span>
        </div>
        <div class="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 custom-scrollbar">
          <div 
            v-for="ticket in tickets" 
            :key="ticket.id"
            @click="selectThread(ticket)"
            :class="[
              'p-3.5 rounded-xl cursor-pointer transition border active:scale-[0.99]',
              activeThread?.id === ticket.id 
                ? 'bg-zinc-100/80 border-zinc-300 shadow-2xs' 
                : 'bg-white border-zinc-100 hover:bg-zinc-50/80 hover:border-zinc-200'
            ]"
          >
            <div class="flex justify-between items-start mb-1.5">
              <span :class="`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${ticket.statusColor}`">
                {{ ticket.status }}
              </span>
              <span class="text-[11px] text-zinc-400 font-medium">{{ ticket.date }}</span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-zinc-800 line-clamp-1 mb-2">{{ ticket.title }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img :src="ticket.teacherPhoto" class="w-5 h-5 rounded-full object-cover border border-zinc-200" />
                <span class="text-xs text-zinc-500 font-medium">{{ ticket.teacherName || 'Unassigned' }}</span>
              </div>
              <span class="text-xs font-semibold text-zinc-400 lg:hidden">View →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail / New Submission Column (Shown on mobile when thread or composer is active) -->
      <div
        :class="[
          'lg:col-span-8 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-h-[480px] lg:min-h-0',
          (!activeThread && !isCreatingNew) ? 'hidden lg:flex' : 'flex'
        ]"
      >
        
        <!-- 1. NEW SUBMISSION COMPOSER VIEW -->
        <div v-if="isCreatingNew" class="flex flex-col h-full animate-in fade-in">
          <div class="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/40 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <button
                @click="closeDetailView"
                class="lg:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200 transition font-bold text-sm"
                title="Back to tickets list"
              >
                ← Back
              </button>
              <div>
                <h2 class="text-sm sm:text-base font-bold text-zinc-900">New Writing Submission</h2>
                <p class="text-[11px] text-zinc-400">Cost: 5 points • Max 250 words</p>
              </div>
            </div>
            <button @click="isCreatingNew = false" class="w-7 h-7 rounded-lg bg-zinc-200/70 hidden sm:flex items-center justify-center text-zinc-600 hover:bg-zinc-300 text-xs font-bold">✕</button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Topic / Passage Title</label>
              <input
                type="text"
                placeholder="e.g., Self Introduction for European Clients"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-sm text-zinc-800 outline-none focus:border-zinc-400 focus:bg-white transition"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-700 mb-1.5 flex justify-between">
                <span>English Text</span>
                <span :class="wordCount > 250 ? 'text-rose-500 font-bold' : 'text-zinc-400'">{{ wordCount }} / 250 words</span>
              </label>
              <textarea 
                v-model="newSubmissionText"
                rows="7" 
                placeholder="Write or paste your English passage here. Our instructors will correct grammar, natural flow, and vocabulary choices."
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 px-3.5 text-sm text-zinc-800 outline-none focus:border-zinc-400 focus:bg-white transition resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div class="p-3.5 sm:p-4 border-t border-zinc-100 bg-zinc-50/40 flex justify-end gap-2">
            <button @click="closeDetailView" class="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition">Cancel</button>
            <button 
              :disabled="wordCount > 250 || wordCount === 0"
              class="px-5 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Submit Passage
            </button>
          </div>
        </div>

        <!-- 2. ACTIVE THREAD VIEW -->
        <div v-else-if="activeThread" class="flex flex-col h-full animate-in fade-in">
          <!-- Thread Header -->
          <div class="p-3.5 sm:p-4 border-b border-zinc-100 bg-zinc-50/40 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <button
                @click="closeDetailView"
                class="lg:hidden p-1.5 -ml-1 rounded-lg text-zinc-700 hover:bg-zinc-200 transition font-bold text-xs shrink-0"
                title="Back to tickets list"
              >
                ← Back
              </button>
              <img :src="activeThread.teacherPhoto" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-zinc-200 shrink-0" />
              <div class="min-w-0 flex-1">
                <h2 class="text-xs sm:text-sm font-bold text-zinc-900 truncate">{{ activeThread.title }}</h2>
                <p class="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">{{ activeThread.teacherName }} • {{ activeThread.date }}</p>
              </div>
            </div>
            <span :class="`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide shrink-0 ${activeThread.statusColor}`">
              {{ activeThread.status }}
            </span>
          </div>

          <!-- Thread Messages -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <!-- Student initial submission -->
            <div class="flex gap-2.5 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
              <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-900 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0">
                You
              </div>
              <div class="bg-zinc-100 text-zinc-800 p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap border border-zinc-200/60">
                {{ activeThread.originalText }}
              </div>
            </div>

            <!-- Teacher Correction & Review -->
            <div v-if="activeThread.teacherResponse" class="flex gap-2.5 sm:gap-3 max-w-[95%] sm:max-w-[90%] ml-auto flex-row-reverse">
              <img :src="activeThread.teacherPhoto" class="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-zinc-200 shrink-0" />
              <div class="bg-emerald-50/80 border border-emerald-200/80 text-zinc-800 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2.5">
                <div class="font-bold text-emerald-900 text-[11px] sm:text-xs flex items-center gap-1.5 border-b border-emerald-200/60 pb-1.5">
                  <span>✓</span> Teacher Feedback & Corrections
                </div>
                <div class="whitespace-pre-wrap text-zinc-800">{{ activeThread.teacherResponse }}</div>
              </div>
            </div>
          </div>

          <!-- Thread Reply Input -->
          <div class="p-3 sm:p-3.5 border-t border-zinc-100 bg-zinc-50/40">
            <div class="flex items-center gap-2">
              <input
                type="text"
                placeholder="Reply to instructor regarding this revision…"
                class="flex-1 rounded-xl border border-zinc-200 bg-white py-2 px-3 sm:px-3.5 text-xs sm:text-sm text-zinc-800 outline-none focus:border-zinc-400 transition"
              />
              <button class="px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition shrink-0 active:scale-95">
                Send
              </button>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 hidden lg:flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-2">
          <span class="text-2xl">✍️</span>
          <p class="text-xs font-medium">Select a ticket from the left or submit a new draft.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isCreatingNew = ref(false);
const newSubmissionText = ref('');

const wordCount = computed(() => {
  if (!newSubmissionText.value.trim()) return 0;
  return newSubmissionText.value.trim().split(/\s+/).length;
});

const tickets = ref([
  {
    id: 1,
    title: '[RW] Self Introduction Draft for Marketing',
    status: 'Reviewed',
    statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    date: 'Aug 20, 2026',
    teacherName: 'Emily Rivera',
    teacherPhoto: 'https://brighture-edu.com/api.html?model=teacher&cmd=image&key=176',
    originalText: `Hello everyone, my name is Taro. I have worked in global marketing for 4 years. I want to improve my speaking and presentation skills so that I can pitch to European clients effectively.`,
    teacherResponse: `Great introduction, Taro! Here are a few small refinements:\n• "I have worked in global marketing for 4 years" -> "I have been working in global marketing for four years." (More natural for ongoing experience)\n• "so that I can pitch to European clients effectively" -> "to deliver persuasive pitches to international stakeholders."`,
  },
  {
    id: 2,
    title: '[RW] Weekly Journal - Business Trip Reflection',
    status: 'In Progress',
    statusColor: 'bg-zinc-100 text-zinc-700',
    date: 'Aug 18, 2026',
    teacherName: 'Sarah Jenkins',
    teacherPhoto: 'https://brighture-edu.com/api.html?model=teacher&cmd=image&key=184',
    originalText: `Last week I visited the Singapore office. The meeting was very fruitful and we decided the roadmap for the next quarter.`,
    teacherResponse: null,
  },
]);

const activeThread = ref(tickets.value[0]);

const selectThread = (ticket) => {
  activeThread.value = ticket;
  isCreatingNew.value = false;
};

const openNewSubmission = () => {
  isCreatingNew.value = true;
  activeThread.value = null;
};

const closeDetailView = () => {
  activeThread.value = null;
  isCreatingNew.value = false;
};
</script>
