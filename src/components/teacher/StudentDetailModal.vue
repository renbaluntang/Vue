<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="student"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-5 backdrop-blur-xs overflow-y-auto"
      @click.self="$emit('close')"
    >
      <!-- Landscape Rectangle Modal Container: wide aspect layout, self-contained card matching user image -->
      <div
        class="relative w-full max-w-4xl overflow-hidden rounded-[26px] bg-white shadow-2xl transition-all border border-slate-200 max-h-[92vh] flex flex-col"
        @click.stop
      >
        <!-- Dark Header Block with Student Avatar and Close Button (Exact styling from reference image) -->
        <div class="relative bg-[#1e2738] p-5 sm:p-6 text-white shrink-0">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Rounded square avatar with golden border -->
              <AppImage
                :src="student.studentPhoto || studentImage"
                :alt="student.studentName || student.student"
                class="h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 rounded-2xl object-cover ring-2 ring-[#c5a059] shadow-sm"
              />

              <div class="min-w-0">
                <p class="m-0 text-[11px] font-black uppercase tracking-wider text-[#e6b95c]">
                  STUDENT #{{ student.studentId }}
                </p>
                <h3 class="m-0 text-xl sm:text-2xl font-black text-white truncate mt-0.5">
                  {{ student.studentName || student.student }}
                </h3>
                <p class="m-0 text-xs text-slate-300 font-medium mt-0.5 truncate">
                  {{ student.membership || 'Regular' }} · {{ student.category || student.lessonClass || 'Online' }}
                </p>
              </div>
            </div>

            <!-- Header Action buttons -->
            <div class="flex items-center gap-2">
              <router-link
                to="/chat"
                @click="$emit('close')"
                class="flex items-center gap-1.5 rounded-full bg-brighture-gold/20 hover:bg-brighture-gold/30 text-amber-300 hover:text-amber-200 border border-amber-400/30 px-3 py-1.5 text-xs font-black transition"
                title="Chat with student"
              >
                <i class="fa-solid fa-comments text-xs"></i>
                <span class="hidden sm:inline">Message</span>
              </router-link>

              <!-- Round close button inside dark header -->
              <button
                type="button"
                @click="$emit('close')"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-slate-200 hover:bg-white/25 hover:text-white transition"
                aria-label="Close modal"
              >
                <i class="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Scrollable Modal Body: Wide Landscape Content Grid -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-white">
          
          <!-- Row 1: SUBJECT beside LESSON TIME. Points were the student's
               side of the booking — what it cost them — and say nothing the
               instructor acts on. -->
          <div class="grid grid-cols-12 items-stretch gap-3 sm:gap-4">
            <!-- SUBJECT -->
            <div class="col-span-12 flex flex-col justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-5">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SUBJECT
              </p>
              <p class="m-0 text-sm sm:text-base font-extrabold text-slate-900 mt-1" :title="student.subject">
                {{ student.subject }}
              </p>
            </div>

            <!-- LESSON TIME -->
            <div class="col-span-12 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-7">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LESSON TIME
              </p>
              <div class="mt-2 space-y-1.5 text-xs sm:text-sm">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 text-slate-500 font-medium">Your time</span>
                  <span class="font-bold text-slate-900 text-right">{{ teacherExactTime }}</span>
                </div>
                <div class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 text-slate-500 font-medium">Student</span>
                  <span class="font-bold text-slate-900 text-right">{{ studentExactTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 3: REQUEST FROM THE STUDENT Card -->
          <div
            v-if="student.note || student.studentMessage"
            class="rounded-2xl border border-[#faecd2] bg-[#fdfbf6] p-4"
          >
            <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-[#996b27]">
              REQUEST FROM THE STUDENT
            </p>
            <p class="m-0 text-xs sm:text-sm italic text-slate-700 leading-relaxed mt-1.5">
              “{{ student.note || student.studentMessage }}”
            </p>
          </div>

          <!-- Row 4: Start Lesson Button (Green with camera icon) -->
          <div>
            <a
              v-if="student.meetLink"
              :href="student.meetLink"
              target="_blank"
              rel="noopener"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2db572] hover:bg-[#269e63] py-3.5 px-4 text-center text-sm font-black text-white shadow-xs transition active:scale-[0.99]"
            >
              <i class="fa-solid fa-video text-sm"></i>
              <span>Start Lesson</span>
            </a>
            <button
              v-else
              type="button"
              disabled
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3.5 px-4 text-center text-xs font-bold text-slate-400 cursor-not-allowed"
            >
              <span>No meeting link available</span>
            </button>
          </div>

          <!-- Row 5: Navigation Pills (Exact layout from user screenshot) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <!-- Basic Info Pill -->
            <button
              type="button"
              @click="toggleTab('basic')"
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition"
              :class="activeTab === 'basic'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-[#edf2f7] hover:bg-[#e2e8f0] text-slate-700'"
            >
              <i class="fa-solid fa-user text-[11px]" :class="activeTab === 'basic' ? 'text-[#e6b95c]' : 'text-slate-500'"></i>
              <span>Basic Info</span>
            </button>

            <!-- Lesson Logs Pill -->
            <button
              type="button"
              @click="toggleTab('logs')"
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition"
              :class="activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-[#edf2f7] hover:bg-[#e2e8f0] text-slate-700'"
            >
              <i class="fa-solid fa-clock-rotate-left text-[11px]" :class="activeTab === 'logs' ? 'text-blue-400' : 'text-slate-500'"></i>
              <span>Lesson Logs</span>
              <span
                class="rounded-full px-1.5 py-0.2 text-[10px] font-black"
                :class="activeTab === 'logs' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'"
              >
                {{ studentLogs.length }}
              </span>
            </button>

            <!-- Reservation List Pill -->
            <button
              type="button"
              @click="toggleTab('reservations')"
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition"
              :class="activeTab === 'reservations'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-[#edf2f7] hover:bg-[#e2e8f0] text-slate-700'"
            >
              <i class="fa-regular fa-calendar-check text-[11px]" :class="activeTab === 'reservations' ? 'text-emerald-400' : 'text-slate-500'"></i>
              <span>Reservation List</span>
              <span
                class="rounded-full px-1.5 py-0.2 text-[10px] font-black"
                :class="activeTab === 'reservations' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'"
              >
                {{ studentReservations.length }}
              </span>
            </button>

            <!-- Materials Pill -->
            <button
              type="button"
              @click="toggleTab('materials')"
              class="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition"
              :class="activeTab === 'materials'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-[#edf2f7] hover:bg-[#e2e8f0] text-slate-700'"
            >
              <i class="fa-regular fa-folder-open text-[11px]" :class="activeTab === 'materials' ? 'text-purple-400' : 'text-slate-500'"></i>
              <span>Materials</span>
            </button>
          </div>

          <!-- Expandable Detail Panels (Revealed when a tab is selected) -->
          <div v-if="activeTab" class="pt-2 animate-in fade-in duration-200 border-t border-slate-100">
            
            <!-- TAB 1: BASIC INFO -->
            <div v-if="activeTab === 'basic'" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <!-- Personal Details -->
                <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 space-y-2.5">
                  <p class="font-bold text-[11px] uppercase tracking-wider text-slate-400 m-0">Personal Details</p>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Name</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.firstName }} {{ studentProfile.lastName }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Teacher Display (Romaji)</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.romaji }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Gender</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.gender }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Date of Birth</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.birthDate }}</span>
                  </div>

                  <div class="flex justify-between items-center py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Email</span>
                    <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-900">
                      <span>{{ studentProfile.email }}</span>
                      <button
                        type="button"
                        @click="copyText(studentProfile.email, 'email')"
                        class="text-slate-400 hover:text-slate-700 transition"
                        title="Copy Email"
                      >
                        <i :class="copiedField === 'email' ? 'fa-solid fa-check text-emerald-600' : 'fa-regular fa-copy'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-500">Google Account</span>
                    <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-900">
                      <span>{{ studentProfile.googleAccount }}</span>
                      <button
                        type="button"
                        @click="copyText(studentProfile.googleAccount, 'gmail')"
                        class="text-slate-400 hover:text-slate-700 transition"
                        title="Copy Gmail"
                      >
                        <i :class="copiedField === 'gmail' ? 'fa-solid fa-check text-emerald-600' : 'fa-regular fa-copy'"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Learning Profile & Curriculum -->
                <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 space-y-2.5">
                  <p class="font-bold text-[11px] uppercase tracking-wider text-slate-400 m-0">Learning & Curriculum</p>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Membership</span>
                    <span class="font-semibold text-slate-900">{{ student.membership || 'Regular' }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Level</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.level }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Student Timezone</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.timezone }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Primary Objective</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.learningObjective }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Target Goal</span>
                    <span class="font-semibold text-slate-900 truncate max-w-[170px]" :title="studentProfile.targetGoal">
                      {{ studentProfile.targetGoal }}
                    </span>
                  </div>

                  <div class="flex justify-between py-1">
                    <span class="font-medium text-slate-500">Member Since</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.memberSince }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: LESSON LOGS -->
            <div v-if="activeTab === 'logs'" class="space-y-3.5">
              <div class="flex flex-wrap items-center gap-2">
                <input
                  v-model="logTeacherFilter"
                  type="text"
                  placeholder="Filter instructor..."
                  class="rounded-full bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
                <input
                  v-model="logSubjectFilter"
                  type="text"
                  placeholder="Filter subject..."
                  class="rounded-full bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
                <button
                  v-if="logTeacherFilter || logSubjectFilter"
                  type="button"
                  @click="logTeacherFilter = ''; logSubjectFilter = ''"
                  class="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 font-semibold"
                >
                  Clear
                </button>
                <span class="ml-auto text-xs text-slate-500">
                  <span class="font-semibold text-slate-800">{{ filteredLogs.length }}</span> logged
                </span>
              </div>

              <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                <table class="w-full min-w-[580px] text-xs">
                  <thead>
                    <tr class="text-left border-b border-slate-100 bg-[#f8fafc]">
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructor</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Feedback</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="log in filteredLogs" :key="log.id" class="align-top hover:bg-slate-50/50 transition">
                      <td class="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {{ log.dateManila || log.date }}
                      </td>
                      <td class="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {{ log.instructorName }}
                      </td>
                      <td class="py-3 px-3 font-semibold text-slate-900">
                        {{ log.subject }}
                      </td>
                      <td class="py-3 px-3 text-slate-600 leading-relaxed whitespace-pre-line max-w-xs">
                        {{ log.feedback }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 3: RESERVATION LIST -->
            <div v-if="activeTab === 'reservations'" class="space-y-3.5">
              <div class="flex items-center justify-between text-xs text-slate-500">
                <span>Upcoming scheduled lessons for this student</span>
                <span><span class="font-semibold text-slate-800">{{ studentReservations.length }}</span> booked</span>
              </div>

              <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                <table class="w-full min-w-[580px] text-xs">
                  <thead>
                    <tr class="text-left border-b border-slate-100 bg-[#f8fafc]">
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Appointed Date</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructor</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Focus / Topic</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="res in studentReservations" :key="res.id" class="align-top hover:bg-slate-50/50 transition">
                      <td class="py-3 px-3 whitespace-nowrap">
                        <div class="font-semibold text-slate-900">{{ res.startManila || teacher.localStart(res) }}</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">{{ res.startStudent || res.startTokyo }} (Student)</div>
                      </td>
                      <td class="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {{ res.instructorName }}
                      </td>
                      <td class="py-3 px-3 font-semibold text-slate-900">
                        {{ res.subject }}
                      </td>
                      <td class="py-3 px-3 text-slate-600">
                        <p class="m-0 font-semibold text-slate-900">{{ res.topic || 'General curriculum discussion' }}</p>
                        <p v-if="res.note" class="m-0 text-[11px] text-slate-400 italic mt-0.5">“{{ res.note }}”</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 4: MATERIALS -->
            <div v-if="activeTab === 'materials'" class="pt-1">
              <EditableMaterials :entry="studentAsEntry" />
            </div>

          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import AppImage from '../AppImage.vue';
import EditableMaterials from '@/pages/app-panel/EditableMaterials.vue';
import studentImage from '@/assets/student-1.svg';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

const props = defineProps({
  /** A reservation row or student reference; null closes the modal. */
  student: { type: Object, default: null },
});
defineEmits(['close']);

// Tab navigation: initially null so the card looks exactly like the image, and clicking a pill expands it
const activeTab = ref(null);

const toggleTab = (tab) => {
  activeTab.value = activeTab.value === tab ? null : tab;
};

// Filter state for Lesson Logs
const logTeacherFilter = ref('');
const logSubjectFilter = ref('');

// Copy to clipboard notification
const copiedField = ref(null);
const copyText = (text, field) => {
  if (!text) return;
  navigator.clipboard?.writeText(text);
  copiedField.value = field;
  setTimeout(() => {
    if (copiedField.value === field) copiedField.value = null;
  }, 1800);
};

// Formatted clocks matching the reference card image
const teacherExactTime = computed(() => {
  if (!props.student) return 'Oct 9, 2026 18:00';
  const raw = props.student.startManila || teacher.localStart(props.student) || 'Oct 9, 2026 18:00';
  return raw.replace(/\(.*?\)/g, '').trim();
});

const studentExactTime = computed(() => {
  if (!props.student) return 'Oct 9, 2026 19:00 (UTC +09:00) Tokyo';
  if (props.student.startStudent) return props.student.startStudent;
  if (props.student.startTokyo) return `${props.student.startTokyo} (UTC +09:00) Tokyo`;
  return 'Oct 9, 2026 19:00 (UTC +09:00) Tokyo';
});

// Adapter object for EditableMaterials
const studentAsEntry = computed(() => {
  if (!props.student) return {};
  return {
    ...props.student,
    student: props.student.studentName || props.student.student,
    subject: props.student.subject,
    studentId: props.student.studentId,
  };
});

// Accurate mapping matching student-portal/profile fields
const studentProfilesMap = {
  'Taro Yamada': {
    firstName: 'Taro',
    lastName: 'Yamada',
    romaji: 'Taro Yamada',
    gender: 'Male',
    birthDate: 'July 1994',
    email: 'taro.yamada@example.com',
    googleAccount: 'taro.yamada@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Business English & Negotiations',
    targetGoal: 'Business Negotiations & IELTS 7.5',
    level: 'B2 Upper-Intermediate',
    memberSince: 'March 2025',
  },
  'Aiko Tanaka': {
    firstName: 'Aiko',
    lastName: 'Tanaka',
    romaji: 'Aiko Tanaka',
    gender: 'Female',
    birthDate: 'November 1993',
    email: 'aiko.tanaka@example.jp',
    googleAccount: 'aiko.tanaka@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Pronunciation & Speaking',
    targetGoal: 'Accent Neutralization & Speech Fluency',
    level: 'B1 Intermediate',
    memberSince: 'January 2025',
  },
  'Kenji Sato': {
    firstName: 'Kenji',
    lastName: 'Sato',
    romaji: 'Kenji Sato',
    gender: 'Male',
    birthDate: 'August 1990',
    email: 'kenji.sato@example.jp',
    googleAccount: 'kenji.sato@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Daily Conversation',
    targetGoal: 'Travel and Overseas Everyday Communication',
    level: 'A2 Pre-Intermediate',
    memberSince: 'September 2025',
  },
  'Mika Kobayashi': {
    firstName: 'Mika',
    lastName: 'Kobayashi',
    romaji: 'Mika Kobayashi',
    gender: 'Female',
    birthDate: 'February 1995',
    email: 'mika.koba@example.jp',
    googleAccount: 'mika.koba@gmail.com',
    timezone: 'Europe/London (GMT)',
    learningObjective: 'Exam Preparation',
    targetGoal: 'IELTS Academic Target Band 7.5',
    level: 'B2 Upper-Intermediate',
    memberSince: 'November 2024',
  },
  'Shigeko Kimura': {
    firstName: 'Shigeko',
    lastName: 'Kimura',
    romaji: 'Shigeko Kimura',
    gender: 'Female',
    birthDate: 'July 1979',
    email: 'shigeko.kimura@example.com',
    googleAccount: 'shigeko.kimura@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Personal / Travel',
    targetGoal: 'Everyday Travel Fluency',
    level: 'B1 Intermediate',
    memberSince: 'June 2024',
  },
  'Mina Mori': {
    firstName: 'Mina',
    lastName: 'Mori',
    romaji: 'Mina Mori',
    gender: 'Female',
    birthDate: 'June 1984',
    email: 'mina.mori@example.com',
    googleAccount: 'mina.mori@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Business English',
    targetGoal: 'Presentations & Executive Meetings',
    level: 'B2 Upper-Intermediate',
    memberSince: 'April 2024',
  },
};

const studentProfile = computed(() => {
  if (!props.student) return {};
  const name = props.student.studentName || props.student.student;
  if (name && studentProfilesMap[name]) {
    return studentProfilesMap[name];
  }
  const parts = (name || 'Student Name').split(' ');
  return {
    firstName: parts[0] || 'Student',
    lastName: parts.slice(1).join(' ') || '',
    romaji: name || 'Student Name',
    gender: 'Unspecified',
    birthDate: 'June 1992',
    email: 'student@example.com',
    googleAccount: 'student@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'General Conversation',
    targetGoal: 'Improve Speaking & Vocabulary',
    level: 'B1 Intermediate',
    memberSince: 'January 2025',
  };
});

// Student's completed Lesson Logs
const studentLogs = computed(() => {
  if (!props.student) return [];
  const sId = props.student.studentId;
  const sName = props.student.studentName || props.student.student;

  const logsFromStore = (teacher.lessonLog || []).filter(
    (l) => (sId && l.studentId === sId) || (sName && l.studentName === sName)
  );

  if (logsFromStore.length) {
    return logsFromStore.map((l) => ({
      ...l,
      instructorName: teacher.fullName,
      feedback: l.feedback || l.studentComment || 'Improved fluency and sentence pacing.',
      adminNote: l.hiddenNote || 'No administrative issues reported.',
    }));
  }

  return [
    {
      id: `log-1-${sId}`,
      subject: props.student.subject || '[DC] Daily Conversation',
      dateManila: '02/11/2026 13:00',
      instructorName: 'Alma Oliviero',
      feedback: 'Points achieved: stronger sentence control and clearer idea organization.\nPoints for improvement: reduce grammar slips and improve transition words.',
      adminNote: 'B2.5 No spelling concern.\nhttps://docs.google.com/document/d/example-log-1',
    },
    {
      id: `log-2-${sId}`,
      subject: '[PP201] Pronunciation - Consonants',
      dateManila: '01/18/2026 15:00',
      instructorName: 'Hanna Pekitpikit',
      feedback: 'Points achieved: better /r/ and /l/ production with reading drills.\nPoints for improvement: stabilize word stress and pacing.',
      adminNote: 'B2.5 Needs follow-up reading drill.',
    },
  ];
});

const filteredLogs = computed(() => {
  return studentLogs.value.filter((log) => {
    const matchTeacher = !logTeacherFilter.value.trim() ||
      (log.instructorName || '').toLowerCase().includes(logTeacherFilter.value.toLowerCase().trim());
    const matchSubject = !logSubjectFilter.value.trim() ||
      (log.subject || '').toLowerCase().includes(logSubjectFilter.value.toLowerCase().trim());
    return matchTeacher && matchSubject;
  });
});

// Student's full reservation list
const studentReservations = computed(() => {
  if (!props.student) return [];
  const sId = props.student.studentId;
  const sName = props.student.studentName || props.student.student;

  const resList = (teacher.reservations || []).filter(
    (r) => (sId && r.studentId === sId) || (sName && r.studentName === sName)
  );

  if (!resList.length && props.student) {
    return [{
      ...props.student,
      instructorName: props.student.instructorName || teacher.fullName,
    }];
  }

  return resList.map((r) => ({
    ...r,
    instructorName: r.instructorName || teacher.fullName,
  }));
});
</script>
