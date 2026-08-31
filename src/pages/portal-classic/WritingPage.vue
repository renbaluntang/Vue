<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Writing Corrections</h1>
        <p class="text-slate-500 font-medium mt-1">Submit your English passages for professional review.</p>
      </div>
      <button 
        v-if="!isCreatingNew"
        @click="isCreatingNew = true; activeThread = null"
        class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg sm:hover:scale-105 active:scale-95"
      >
        <span>+</span> New Submission (5 pts)
      </button>
    </div>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:h-[70vh] lg:min-h-[600px]">
      
      <!-- List Column -->
      <div
        :class="[
          'lg:col-span-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex-col overflow-hidden',
          activeThread || isCreatingNew ? 'hidden lg:flex' : 'flex'
        ]"
      >
        <div class="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 class="font-bold text-slate-800">Your Tickets</h2>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div 
            v-for="ticket in tickets" 
            :key="ticket.id"
            @click="activeThread = ticket; isCreatingNew = false"
            :class="[
              'p-4 rounded-2xl cursor-pointer transition-all border',
              activeThread?.id === ticket.id 
                ? 'bg-indigo-50 border-indigo-100 shadow-inner' 
                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
            ]"
          >
            <div class="flex justify-between items-start mb-2">
              <span :class="`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${ticket.statusColor}`">
                {{ ticket.status }}
              </span>
              <span class="text-[11px] text-slate-400 font-bold">{{ ticket.date }}</span>
            </div>
            <p class="text-sm font-bold text-slate-800 line-clamp-1 mb-2">{{ ticket.title }}</p>
            <div class="flex items-center gap-2">
              <img :src="ticket.teacherPhoto" class="w-6 h-6 rounded-full object-cover" />
              <span class="text-xs font-semibold text-slate-500">{{ ticket.teacherName || 'Unassigned' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Thread / New Submission Column -->
      <div
        :class="[
          'lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex-col overflow-hidden',
          'h-[75dvh] lg:h-auto',
          !activeThread && !isCreatingNew ? 'hidden lg:flex' : 'flex'
        ]"
      >
        
        <!-- NEW SUBMISSION VIEW -->
        <div v-if="isCreatingNew" class="flex flex-col h-full animate-in fade-in zoom-in-95">
          <div class="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-slate-900">New Writing Submission</h2>
              <p class="text-xs font-medium text-slate-500 mt-1">Cost: 5 points • Max 250 words</p>
            </div>
            <button @click="isCreatingNew = false" class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300">✕</button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Title</label>
              <input type="text" placeholder="e.g., Self Introduction Draft" class="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                <span>Passage</span>
                <span :class="wordCount > 250 ? 'text-red-500' : 'text-slate-400'">{{ wordCount }} / 250 words</span>
              </label>
              <textarea 
                v-model="newSubmissionText"
                rows="10" 
                placeholder="Write or paste your English text here. No emojis allowed."
                class="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div class="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button @click="isCreatingNew = false" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition">Cancel</button>
            <button 
              :disabled="wordCount > 250 || wordCount === 0"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Passage
            </button>
          </div>
        </div>

        <!-- THREAD VIEW -->
        <div v-else-if="activeThread" class="flex flex-col h-full animate-in fade-in zoom-in-95">
          <!-- Thread Header -->
          <div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3 justify-between shadow-sm z-10">
            <button
              type="button"
              @click="activeThread = null"
              class="lg:hidden -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              aria-label="Back to submissions"
            >
              ←
            </button>
            <div class="min-w-0 flex-1">
              <h2 class="text-base sm:text-lg font-bold text-slate-900 truncate">{{ activeThread.title }}</h2>
              <div class="flex items-center gap-2 mt-1">
                <span :class="`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${activeThread.statusColor}`">
                  {{ activeThread.status }}
                </span>
                <span class="text-xs text-slate-500 font-medium">• Assessor: {{ activeThread.teacherName || 'Pending' }}</span>
              </div>
            </div>
            <button class="shrink-0 px-3 sm:px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs bg-red-50 hover:bg-red-100 transition">
              <span class="hidden sm:inline">Mark as Finished</span>
              <span class="sm:hidden">Finish</span>
            </button>
          </div>
          
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 bg-slate-50/50">
            <div v-for="msg in activeThread.messages" :key="msg.id" :class="['flex gap-2.5 sm:gap-4 max-w-[92%] sm:max-w-[85%]', msg.isStudent ? 'ml-auto flex-row-reverse' : '']">
              <img :src="msg.avatar" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm flex-shrink-0" />
              <div :class="['space-y-1', msg.isStudent ? 'text-right' : 'text-left']">
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-400" :class="msg.isStudent ? 'flex-row-reverse' : ''">
                  <span class="text-slate-600">{{ msg.author }}</span>
                  <span>{{ msg.time }}</span>
                </div>
                <div :class="[
                  'p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                  msg.isStudent 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                ]">
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- Reply Box -->
          <div class="p-3.5 sm:p-5 border-t border-slate-200 bg-white">
            <div class="flex justify-between items-center mb-2 px-1">
              <span class="text-xs font-bold text-slate-500">Reply to teacher</span>
              <span class="text-xs font-bold text-amber-500">{{ activeThread.remainingSends }} sends remaining</span>
            </div>
            <div class="relative">
              <textarea 
                rows="3" 
                placeholder="Type your reply or follow-up question here..."
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-14 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
              ></textarea>
              <button class="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all shadow-md">
                ↑
              </button>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div v-else class="hidden lg:flex flex-col items-center justify-center h-full text-center p-8">
          <div class="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl mb-4 shadow-inner">
            📬
          </div>
          <h3 class="text-xl font-bold text-slate-800">Select a Ticket</h3>
          <p class="text-slate-500 font-medium mt-1">Choose a writing submission from the left to view the thread or reply.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { teacherImage } from '@/lib/teacherImages';
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/useUserStore';

const user = useUserStore();

const isCreatingNew = ref(false);
const activeThread = ref(null);
const newSubmissionText = ref('');

const wordCount = computed(() => {
  return newSubmissionText.value.trim().split(/\s+/).filter(word => word.length > 0).length;
});

// Mock Data
const tickets = ref([
  {
    id: 1,
    title: 'Self Introduction Draft',
    status: 'In Progress',
    statusColor: 'bg-blue-100 text-blue-700',
    date: 'Oct 14, 2026',
    teacherName: 'Analyn Y.',
    teacherPhoto: teacherImage('Analyn Y.'),
    remainingSends: 3,
    messages: [
      {
        id: 1,
        author: user.profile.firstName,
        avatar: user.profile.photo,
        isStudent: true,
        time: 'Oct 14, 09:00 AM',
        content: 'Hi, I wrote this self introduction for my new job. Please check if the grammar is natural.\n\n"Hello everyone, my name is Taro. I am joining the marketing team. I looking forward to work with you all."'
      },
      {
        id: 2,
        author: 'Analyn Y.',
        avatar: teacherImage('Analyn Y.'),
        isStudent: false,
        time: 'Oct 15, 10:30 AM',
        content: 'Hi Taro!\n\nThis is a good start. However, we need to adjust the grammar slightly to make it sound more natural.\n\nOriginal: "I looking forward to work with you all."\nCorrected: "I am looking forward to working with you all."\n\nWhen we use "look forward to", it must be followed by a noun or an -ing verb (gerund).'
      }
    ]
  },
  {
    id: 2,
    title: 'Weekly Journal - Entry 5',
    status: 'Complete',
    statusColor: 'bg-emerald-100 text-emerald-700',
    date: 'Oct 10, 2026',
    teacherName: 'Jirvy Dela Torre',
    teacherPhoto: teacherImage('Jirvy Dela Torre'),
    remainingSends: 0,
    messages: [
      {
        id: 1,
        author: user.profile.firstName,
        avatar: user.profile.photo,
        isStudent: true,
        time: 'Oct 10, 08:00 PM',
        content: 'Here is my journal entry about my weekend trip to Kyoto.'
      },
      {
        id: 2,
        author: 'Jirvy Dela Torre',
        avatar: teacherImage('Jirvy Dela Torre'),
        isStudent: false,
        time: 'Oct 11, 09:15 AM',
        content: 'Excellent writing! Very few mistakes this time. The vocabulary was very descriptive.'
      }
    ]
  }
]);
</script>

