<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
    <!-- Header -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <i class="fa-solid fa-comments text-base"></i>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Student Messages</h1>
            <p class="mt-0.5 text-xs sm:text-sm text-slate-500">
              Direct chat with students who have taken or reserved your classes.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick status indicator -->
      <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online as Jirvy Dela Torre</span>
        </span>
      </div>
    </header>

    <!-- Main Chat Container: 2-column split (Conversations list on left, Chat area on right) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-12.5rem)] min-h-[34rem] rounded-3xl overflow-hidden">
      
      <!-- ================= LEFT COLUMN: CONVERSATION LIST ================= -->
      <div
        class="lg:col-span-4 flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden"
        :class="activeStudentId && isMobileThreadOpen ? 'hidden lg:flex' : 'flex'"
      >
        <!-- Header & Search -->
        <div class="p-3.5 border-b border-slate-100 bg-slate-50/60 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-600">Students Directory</h2>
            <span class="px-2 py-0.5 rounded-full bg-slate-200/70 text-[11px] font-black text-slate-700 tabular-nums">
              {{ studentsList.length }} Students
            </span>
          </div>

          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by student name or subject..."
              class="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
            />
          </div>
        </div>

        <!-- Student Items -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
          <button
            v-for="student in filteredStudents"
            :key="student.id"
            type="button"
            @click="selectStudent(student.id)"
            class="w-full rounded-2xl p-3 text-left transition flex items-start gap-3 relative group"
            :class="activeStudentId === student.id
              ? 'bg-amber-500/10 border border-amber-300/60 shadow-xs'
              : 'hover:bg-slate-50 border border-transparent'"
          >
            <!-- Avatar with unread indicator -->
            <div class="relative shrink-0">
              <AppImage
                :src="student.photo"
                :alt="student.name"
                class="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
              />
              <span
                v-if="student.online"
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Online"
              ></span>
            </div>

            <!-- Student info & preview message -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <p class="text-xs font-extrabold text-slate-900 truncate">
                  {{ student.name }}
                </p>
                <span class="text-[10px] font-bold text-slate-400 shrink-0">
                  {{ getLastMessageTime(student.id) }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 mb-1">
                <span class="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 truncate max-w-[130px]">
                  {{ student.latestSubject }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  &bull; {{ student.totalClassesTaken }} {{ student.totalClassesTaken === 1 ? 'class' : 'classes' }}
                </span>
              </div>

              <p class="text-[11px] text-slate-500 truncate font-medium">
                {{ getLastMessagePreview(student.id) }}
              </p>
            </div>

            <!-- Unread badge -->
            <div
              v-if="getUnreadCount(student.id) > 0"
              class="shrink-0 self-center w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-xs"
            >
              {{ getUnreadCount(student.id) }}
            </div>
          </button>

          <div v-if="filteredStudents.length === 0" class="text-center py-10 px-4">
            <p class="text-xs font-bold text-slate-500">No students found</p>
          </div>
        </div>
      </div>

      <!-- ================= RIGHT COLUMN: CHAT WINDOW ================= -->
      <div
        class="lg:col-span-8 flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden"
        :class="!activeStudentId || !isMobileThreadOpen ? 'hidden lg:flex' : 'flex'"
      >
        <template v-if="activeStudent">
          <!-- Chat Header -->
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Mobile Back button -->
              <button
                type="button"
                @click="isMobileThreadOpen = false"
                class="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-200/60"
              >
                <i class="fa-solid fa-arrow-left text-sm"></i>
              </button>

              <AppImage
                :src="activeStudent.photo"
                :alt="activeStudent.name"
                class="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
              />

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-extrabold text-slate-900 truncate">
                    {{ activeStudent.name }}
                  </h3>
                  <span class="text-[10px] font-extrabold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    Student #{{ activeStudent.id }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 truncate">
                  {{ activeStudent.membership }} &bull; {{ activeStudent.timezone }} &bull; Last class: {{ activeStudent.lastClassDate }}
                </p>
              </div>
            </div>

            <!-- Class & Student Detail CTA -->
            <div class="flex items-center gap-2">
              <span
                class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                <i class="fa-solid fa-graduation-cap text-slate-400 text-[11px]"></i>
                {{ activeStudent.latestSubject }}
              </span>
            </div>
          </div>

          <!-- Class Context Pill Banner -->
          <div class="bg-amber-50/60 border-b border-amber-100/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-amber-900">
            <div class="flex items-center gap-2 truncate">
              <i class="fa-solid fa-circle-info text-amber-600 text-xs"></i>
              <span class="truncate">
                Completed <strong>{{ activeStudent.totalClassesTaken }}</strong> lessons with you &bull; Preferred topic: <em>{{ activeStudent.preferredTopic }}</em>
              </span>
            </div>
            <span class="text-[11px] text-amber-800 font-bold shrink-0 hidden md:inline">
              Rate: {{ activeStudent.rating ? `★ ${activeStudent.rating}` : '5.0' }}
            </span>
          </div>

          <!-- Messages Thread (Scrollable) -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fcfdfd]">
            <div
              v-for="msg in currentMessages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.sender === 'teacher' ? 'items-end' : 'items-start'"
            >
              <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                <!-- Student Avatar for their messages -->
                <AppImage
                  v-if="msg.sender === 'student'"
                  :src="activeStudent.photo"
                  :alt="activeStudent.name"
                  class="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                />

                <div class="space-y-1">
                  <div
                    class="rounded-3xl px-4 py-2.5 text-sm shadow-xs transition"
                    :class="msg.sender === 'teacher'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'"
                  >
                    <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>

                    <!-- Attached Resource / Material Link if any -->
                    <div
                      v-if="msg.attachment"
                      class="mt-2.5 p-2 rounded-xl flex items-center gap-2 text-xs"
                      :class="msg.sender === 'teacher' ? 'bg-white/10 text-amber-300' : 'bg-slate-50 text-amber-700 border border-slate-100'"
                    >
                      <i class="fa-solid fa-paperclip"></i>
                      <span class="font-bold underline cursor-pointer">{{ msg.attachment.name }}</span>
                    </div>
                  </div>

                  <div
                    class="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-medium"
                    :class="msg.sender === 'teacher' ? 'justify-end' : 'justify-start'"
                  >
                    <span>{{ msg.time }}</span>
                    <span v-if="msg.sender === 'teacher'">
                      <i class="fa-solid fa-check-double text-emerald-500 text-[10px]"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input Footer -->
          <div class="border-t border-slate-100 bg-white p-3 sm:p-4 shrink-0">
            <!-- Quick Pre-made replies pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
              <span class="text-[10px] font-black uppercase text-slate-400 shrink-0">Quick reply:</span>
              <button
                v-for="quick in quickReplies"
                :key="quick"
                type="button"
                @click="sendQuickReply(quick)"
                class="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 transition shrink-0 whitespace-nowrap"
              >
                {{ quick }}
              </button>
            </div>

            <!-- Message form -->
            <form @submit.prevent="sendMessage" class="flex items-end gap-2">
              <div class="relative flex-1">
                <textarea
                  v-model="newMessageText"
                  rows="2"
                  placeholder="Type a message, lesson recap, or assignment note..."
                  @keydown.enter.exact.prevent="sendMessage"
                  class="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 resize-none text-slate-800 placeholder-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="!newMessageText.trim()"
                class="h-11 px-5 rounded-2xl bg-brighture-gold hover:brightness-105 active:scale-[0.98] text-slate-900 font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <span>Send</span>
                <i class="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </form>
          </div>
        </template>

        <!-- No active student selected -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
          <div class="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
            <i class="fa-solid fa-comments"></i>
          </div>
          <h3 class="text-base font-extrabold text-slate-800">Select a student</h3>
          <p class="text-xs text-slate-500 max-w-xs mt-1">
            Choose a student from the directory on the left to start chatting and sending lesson follow-ups.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import AppImage from '../../components/AppImage.vue';

// Students who have attended lessons or have active reservations with this teacher
const studentsList = ref([
  {
    id: 21,
    name: 'Taro Yamada',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[SF] Speech Fluency',
    totalClassesTaken: 8,
    lastClassDate: 'Sep 1, 2026',
    preferredTopic: 'Cross-Border Negotiations & Pitching',
    rating: 5.0,
    online: true,
  },
  {
    id: 34,
    name: 'Aiko Tanaka',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[PP101] Pronunciation — Vowels',
    totalClassesTaken: 5,
    lastClassDate: 'Sep 1, 2026',
    preferredTopic: 'Vowel contrasts: /æ/ versus /ʌ/',
    rating: 5.0,
    online: true,
  },
  {
    id: 12,
    name: 'Kenji Sato',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    membership: 'Trial',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[DC] Daily Conversation',
    totalClassesTaken: 2,
    lastClassDate: 'Aug 31, 2026',
    preferredTopic: 'Everyday small talk & self-introduction',
    rating: 4.5,
    online: false,
  },
  {
    id: 45,
    name: 'Mika Kobayashi',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Europe/London (BST)',
    latestSubject: '[RW] Reading & Writing',
    totalClassesTaken: 6,
    lastClassDate: 'Aug 30, 2026',
    preferredTopic: 'IELTS Task 2 essay structure',
    rating: 5.0,
    online: false,
  },
  {
    id: 58,
    name: 'Daiki Suzuki',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    membership: 'Regular',
    timezone: 'Asia/Tokyo (JST)',
    latestSubject: '[LS1] Listening & Discussion',
    totalClassesTaken: 4,
    lastClassDate: 'Aug 29, 2026',
    preferredTopic: 'Tech Trends: AI & Workplace Automation',
    rating: 4.8,
    online: true,
  },
]);

// Seeded chat message histories per student ID
const chatHistory = ref({
  21: [
    {
      id: 'm1',
      sender: 'student',
      text: 'Good evening Teacher Jirvy! Thank you so much for today\'s Speech Fluency class on cross-border negotiations.',
      time: 'Sep 1, 18:35',
    },
    {
      id: 'm2',
      sender: 'teacher',
      text: 'Good evening Taro! You did a fantastic job with the counter-offer phrasing today. Remember to pause before delivering your key pitch point.',
      time: 'Sep 1, 18:40',
      attachment: { name: 'Negotiation_Phrases_Handout.pdf' },
    },
    {
      id: 'm3',
      sender: 'student',
      text: 'Understood! I will review the PDF handout before our next session tomorrow. Should I prepare an opening pitch draft?',
      time: 'Sep 1, 18:42',
    },
    {
      id: 'm4',
      sender: 'teacher',
      text: 'Yes please! A 1-minute intro will be great practice. Looking forward to our next class!',
      time: 'Sep 1, 18:45',
    },
  ],
  34: [
    {
      id: 'm5',
      sender: 'student',
      text: 'Hello Teacher Jirvy, I still find it difficult to distinguish /æ/ as in "cat" and /ʌ/ as in "cut". Do you have any audio drills?',
      time: 'Sep 1, 16:15',
    },
    {
      id: 'm6',
      sender: 'teacher',
      text: 'Hi Aiko! Keep your jaw slightly lower for /æ/. I\'ve linked the pronunciation drill recording from our lesson.',
      time: 'Sep 1, 16:25',
      attachment: { name: 'Vowel_Contrast_Audio_Drill.mp3' },
    },
  ],
  12: [
    {
      id: 'm7',
      sender: 'student',
      text: 'Teacher Jirvy, thank you for being patient with me during my first trial lesson. I was quite nervous.',
      time: 'Aug 31, 12:15',
    },
    {
      id: 'm8',
      sender: 'teacher',
      text: 'You did very well Kenji! Natural conversation takes time. Keep practicing the self-introduction points we discussed.',
      time: 'Aug 31, 12:30',
    },
  ],
  45: [
    {
      id: 'm9',
      sender: 'student',
      text: 'Hi Jirvy, apologies for missing our previous session due to an emergency meeting. I have submitted my IELTS essay draft for your review.',
      time: 'Aug 30, 15:00',
    },
    {
      id: 'm10',
      sender: 'teacher',
      text: 'No worries Mika! I have received your essay and will go over the thesis structure during our next class.',
      time: 'Aug 30, 15:20',
    },
  ],
  58: [
    {
      id: 'm11',
      sender: 'student',
      text: 'Hi Jirvy! The tech article on AI automation you recommended was super interesting. Excited for our discussion next week!',
      time: 'Aug 29, 17:00',
    },
  ],
});

const unreadCounts = ref({
  21: 0,
  34: 1,
  12: 0,
  45: 0,
  58: 0,
});

const activeStudentId = ref(21);
const isMobileThreadOpen = ref(true);
const searchQuery = ref('');
const newMessageText = ref('');
const chatContainer = ref(null);

const quickReplies = [
  'Thank you for today\'s class!',
  'Please review the attached material before our next lesson.',
  'Great pronunciation improvements today!',
  'See you in our next class!',
];

const activeStudent = computed(() => {
  return studentsList.value.find(s => s.id === activeStudentId.value) || null;
});

const currentMessages = computed(() => {
  return chatHistory.value[activeStudentId.value] || [];
});

const filteredStudents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return studentsList.value;
  return studentsList.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.latestSubject.toLowerCase().includes(q)
  );
});

const selectStudent = (studentId) => {
  activeStudentId.value = studentId;
  isMobileThreadOpen.value = true;
  unreadCounts.value[studentId] = 0;
  scrollToBottom();
};

const getLastMessagePreview = (studentId) => {
  const msgs = chatHistory.value[studentId];
  if (!msgs || msgs.length === 0) return 'No messages yet';
  const last = msgs[msgs.length - 1];
  return (last.sender === 'teacher' ? 'You: ' : '') + last.text;
};

const getLastMessageTime = (studentId) => {
  const msgs = chatHistory.value[studentId];
  if (!msgs || msgs.length === 0) return '';
  return msgs[msgs.length - 1].time;
};

const getUnreadCount = (studentId) => {
  return unreadCounts.value[studentId] || 0;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const sendMessage = () => {
  const text = newMessageText.value.trim();
  if (!text || !activeStudentId.value) return;

  if (!chatHistory.value[activeStudentId.value]) {
    chatHistory.value[activeStudentId.value] = [];
  }

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  chatHistory.value[activeStudentId.value].push({
    id: 'm_' + Date.now(),
    sender: 'teacher',
    text,
    time: `Today, ${timeStr}`,
  });

  newMessageText.value = '';
  scrollToBottom();
};

const sendQuickReply = (text) => {
  newMessageText.value = text;
  sendMessage();
};
</script>
