<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500">
    <!-- Header Greeting & Quick Actions -->
    <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Learner
          </span>
          <span class="text-xs text-zinc-400 font-medium">• {{ user.profile.level }}</span>
        </div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
          Welcome back, {{ user.profile.firstName }} 👋
        </h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">
          Here is your live schedule and English learning activity.
        </p>
      </div>

      <!-- Quick Action Buttons (Full width on small screens) -->
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <RouterLink
          to="/booking"
          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm transition active:scale-95 shadow-xs whitespace-nowrap"
        >
          <span>🗓️</span> Book Class
        </RouterLink>
        <button
          @click="showFreeConversationModal = true"
          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs sm:text-sm border border-zinc-200/80 transition active:scale-95 shadow-xs whitespace-nowrap"
        >
          <span>⚡</span> Free Convo
        </button>
      </div>
    </section>

    <!-- 1. FEATURED NEXT IMMEDIATE CLASS (RESPONSIVE SPOTLIGHT) -->
    <section v-if="user.nextUpcomingClass" class="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-4 sm:p-6 shadow-sm border border-zinc-800">
      <div class="relative z-10 space-y-4">
        <!-- Top Status Pill -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              Starts in {{ user.nextUpcomingClass.minutesUntil }} mins
            </span>
            <span class="text-xs text-zinc-400">
              {{ user.nextUpcomingClass.timeFull }}
            </span>
          </div>
          <span class="text-[11px] text-zinc-400 font-medium hidden sm:inline">Next Class</span>
        </div>

        <!-- Instructor & Subject Info -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div class="flex items-start gap-3 sm:gap-4">
            <button
              type="button"
              @click="openTeacherDetails({ name: user.nextUpcomingClass.teacherName, photo: user.nextUpcomingClass.teacherPhoto, specialty: '[SF] Speech Fluency, [LS1], [DC]', rating: '4.98', major: 'B.A. in English Linguistics', expertise: '[SF] Speech Fluency & [EP] Exam Prep' })"
              class="relative group shrink-0"
              title="View teacher profile"
            >
              <img
                :src="user.nextUpcomingClass.teacherPhoto"
                :alt="user.nextUpcomingClass.teacherName"
                class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-zinc-700 transition group-hover:border-zinc-500"
              />
            </button>

            <div class="min-w-0 flex-1">
              <h2 class="text-base sm:text-xl font-bold tracking-tight text-white leading-snug">
                {{ user.nextUpcomingClass.subject }}
              </h2>
              <p class="text-xs sm:text-sm text-zinc-400 font-normal mt-0.5">
                with <button @click="openTeacherDetails({ name: user.nextUpcomingClass.teacherName, photo: user.nextUpcomingClass.teacherPhoto, specialty: '[SF] Speech Fluency, [LS1], [DC]', rating: '4.98', major: 'B.A. in English Linguistics', expertise: '[SF] Speech Fluency & [EP] Exam Prep' })" class="text-zinc-200 font-semibold hover:underline">{{ user.nextUpcomingClass.teacherName }}</button>
                • Topic: <span class="text-zinc-300">{{ user.nextUpcomingClass.topic }}</span>
              </p>
              <span
                v-if="user.nextUpcomingClass.isSubstitute"
                class="mt-1.5 inline-flex items-center rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-medium text-amber-200"
              >
                Substitute Teacher
              </span>
            </div>
          </div>

          <!-- Action Buttons (Full-width row on mobile) -->
          <div class="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <a
              :href="user.nextUpcomingClass.meetLink"
              target="_blank"
              class="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition active:scale-95 shadow-sm whitespace-nowrap"
            >
              <span>📹</span> Enter Class
            </a>
            <button
              type="button"
              @click="detailsLesson = user.nextUpcomingClass"
              class="flex-1 lg:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm transition border border-zinc-700 whitespace-nowrap active:scale-95"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. QUICK HUB SHORTCUTS (2x2 on mobile, 4 in a row on sm+) -->
    <section class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      <RouterLink
        to="/booking"
        class="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 group shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-[0.98]"
      >
        <div class="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-sm mb-2.5 group-hover:scale-105 transition-transform">
          🗓️
        </div>
        <div class="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-zinc-700 truncate">Book Lesson</div>
        <div class="text-[10px] sm:text-[11px] text-zinc-400 font-normal mt-0.5 truncate">Select teacher & time</div>
      </RouterLink>

      <button
        @click="showFreeConversationModal = true"
        class="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 group shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left active:scale-[0.98]"
      >
        <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center text-sm mb-2.5 group-hover:scale-105 transition-transform">
          ⚡
        </div>
        <div class="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-zinc-700 truncate">Instant Convo</div>
        <div class="text-[10px] sm:text-[11px] text-zinc-400 font-normal mt-0.5 truncate">Free practice room</div>
      </button>

      <RouterLink
        to="/writing"
        class="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 group shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-[0.98]"
      >
        <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-sm mb-2.5 group-hover:scale-105 transition-transform">
          ✍️
        </div>
        <div class="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-zinc-700 truncate">Writing Review</div>
        <div class="text-[10px] sm:text-[11px] text-zinc-400 font-normal mt-0.5 truncate">2 in progress</div>
      </RouterLink>

      <RouterLink
        to="/analytics"
        class="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 group shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-[0.98]"
      >
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-2.5 group-hover:scale-105 transition-transform">
          📈
        </div>
        <div class="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-zinc-700 truncate">Analytics</div>
        <div class="text-[10px] sm:text-[11px] text-zinc-400 font-normal mt-0.5 truncate">{{ user.stats.attendanceRate }}% attendance</div>
      </RouterLink>
    </section>

    <!-- 3. SCHEDULED CLASSES LIST -->
    <section class="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
            Upcoming Schedule
          </h2>
          <span class="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold">
            {{ scheduledLessons.length }}
          </span>
        </div>
        <RouterLink to="/booking" class="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition">
          + Book More
        </RouterLink>
      </div>

      <div class="divide-y divide-zinc-100">
        <div
          v-for="lesson in scheduledLessons"
          :key="lesson.id"
          class="p-4 sm:p-5 hover:bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition"
        >
          <!-- Left info -->
          <div class="flex items-start gap-3">
            <button
              type="button"
              @click="openTeacherDetails({ name: lesson.teacherName, photo: lesson.teacherPhoto, specialty: lesson.subject, rating: '4.95' })"
              class="relative shrink-0"
              title="View teacher profile"
            >
              <img
                :src="lesson.teacherPhoto"
                :alt="lesson.teacherName"
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-zinc-200 shadow-2xs"
              />
            </button>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs sm:text-sm font-bold text-zinc-900">{{ lesson.subject }}</span>
                <span v-if="lesson.isSubstitute" class="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/60">Substitute</span>
              </div>
              <p class="text-xs text-zinc-500 font-medium mt-0.5">
                with <span class="text-zinc-700 font-semibold">{{ lesson.teacherName }}</span> • {{ lesson.classType }}
              </p>
              <p class="text-xs text-zinc-400 font-medium mt-0.5">
                📅 {{ lesson.date }} • {{ lesson.time }}
              </p>
            </div>
          </div>

          <!-- Right actions (Full touch targets on mobile) -->
          <div class="flex items-center gap-2 self-stretch sm:self-center justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
            <a
              v-if="lesson.meetLink"
              :href="lesson.meetLink"
              target="_blank"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition active:scale-95"
            >
              <span>📹</span> Join
            </a>
            <button
              type="button"
              @click="detailsLesson = lesson"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition active:scale-95 text-center"
            >
              Details
            </button>
            <button
              type="button"
              @click="cancelTargetLesson = lesson"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
              title="Cancel class"
              aria-label="Cancel class"
            >
              ✕
            </button>
          </div>
        </div>

        <div v-if="!scheduledLessons.length" class="p-8 text-center text-xs text-zinc-400">
          No other scheduled classes.
          <RouterLink to="/booking" class="text-zinc-700 font-semibold hover:underline ml-1">
            Book now →
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 4. QUICK INSTRUCTORS OVERVIEW -->
    <section class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
            Available Instructors
          </h2>
          <p class="text-xs text-zinc-400">Top-rated teachers with upcoming openings.</p>
        </div>
        <RouterLink
          to="/booking"
          class="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition"
        >
          Full Calendar →
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="instructor in quickInstructors"
          :key="instructor.id"
          class="border border-zinc-200/70 rounded-xl p-3.5 hover:border-zinc-300 transition-all flex flex-col justify-between bg-zinc-50/40 group"
        >
          <div class="flex items-start gap-3">
            <button
              type="button"
              @click="openTeacherDetails(instructor)"
              class="relative shrink-0"
              title="View profile"
            >
              <img
                :src="instructor.photo"
                :alt="instructor.name"
                class="w-11 h-11 rounded-xl object-cover border border-zinc-200 group-hover:scale-105 transition"
              />
            </button>

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  @click="openTeacherDetails(instructor)"
                  class="text-xs font-bold text-zinc-900 truncate hover:text-zinc-700 text-left"
                >
                  {{ instructor.name }}
                </button>
                <span class="text-[11px] text-amber-600 font-semibold">★ {{ instructor.rating }}</span>
              </div>
              <p class="text-[11px] text-zinc-400 truncate mt-0.5">{{ instructor.specialty }}</p>
              <div class="mt-1 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] font-medium text-emerald-700">{{ instructor.nextAvailable }}</span>
              </div>
            </div>
          </div>

          <div class="mt-3 flex gap-2">
            <button
              @click="openTeacherDetails(instructor)"
              class="flex-1 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition text-center active:scale-95"
            >
              Profile
            </button>
            <RouterLink
              to="/booking"
              class="flex-1 py-1.5 rounded-lg bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition text-center active:scale-95"
            >
              Book
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. WRITING TASKS PREVIEW -->
    <section class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
            Writing Submissions
          </h2>
          <p class="text-xs text-zinc-400">Recent drafts and teacher revisions.</p>
        </div>
        <RouterLink to="/writing" class="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition">
          Open Hub →
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="task in writingTasks"
          :key="task.id"
          class="border border-zinc-200/70 rounded-xl p-3.5 sm:p-4 hover:border-zinc-300 transition-all cursor-pointer flex flex-col justify-between bg-zinc-50/30 active:scale-[0.99]"
          @click="$router.push('/writing')"
        >
          <div>
            <div class="flex justify-between items-start mb-2">
              <span :class="`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${task.statusColor}`">
                {{ task.status }}
              </span>
              <span class="text-[11px] text-zinc-400">{{ task.date }}</span>
            </div>
            <h3 class="text-xs font-bold text-zinc-800 line-clamp-1 mb-1">{{ task.title }}</h3>
          </div>
          <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100">
            <div class="flex items-center gap-2">
              <img :src="task.teacherPhoto" class="w-5 h-5 rounded-full object-cover" />
              <span class="text-xs font-medium text-zinc-500">{{ task.teacherName }}</span>
            </div>
            <span class="text-xs font-semibold text-zinc-700">View thread →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals (Full responsive / Mobile friendly) -->
    <FreeConversationModal
      :isOpen="showFreeConversationModal"
      @close="showFreeConversationModal = false"
    />

    <ClassDetailsModal
      :lesson="detailsLesson"
      @close="detailsLesson = null"
      @cancel="requestCancelFromDetails"
      @edit="requestEditFromDetails"
    />

    <EditClassModal
      :lesson="editLesson"
      @close="editLesson = null"
      @save="saveLessonEdits"
    />

    <CancelClassModal
      :lesson="cancelTargetLesson"
      @close="cancelTargetLesson = null"
      @confirm="confirmCancelLesson"
    />

    <TeacherDataModal
      :teacher="selectedTeacherForModal"
      @close="selectedTeacherForModal = null"
      @book="handleBookFromTeacherModal"
    />
  </div>
</template>

<script setup>
import { imageForKey } from '@/lib/teacherImages';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import FreeConversationModal from '../../components/FreeConversationModal.vue';
import ClassDetailsModal from '../../components/ClassDetailsModal.vue';
import CancelClassModal from '../../components/CancelClassModal.vue';
import EditClassModal from '../../components/EditClassModal.vue';
import TeacherDataModal from '../../components/TeacherDataModal.vue';

const router = useRouter();
const user = useUserStore();

const showFreeConversationModal = ref(false);
const selectedTeacherForModal = ref(null);

const scheduledLessons = computed(() =>
  upcomingLessons.value.filter((lesson) => lesson.id !== user.nextUpcomingClass?.id)
);

const detailsLesson = ref(null);
const editLesson = ref(null);
const cancelTargetLesson = ref(null);

const requestCancelFromDetails = (lesson) => {
  detailsLesson.value = null;
  cancelTargetLesson.value = lesson;
};

const saveLessonEdits = (updated) => {
  if (user.nextUpcomingClass && updated.id === user.nextUpcomingClass.id) {
    user.nextUpcomingClass.subject = updated.subject;
    user.nextUpcomingClass.topic = updated.topic;
  } else {
    upcomingLessons.value = upcomingLessons.value.map((item) =>
      item.id === updated.id ? { ...item, subject: updated.subject, topic: updated.topic } : item
    );
  }
  editLesson.value = null;
};

const requestEditFromDetails = (lesson) => {
  detailsLesson.value = null;
  editLesson.value = lesson;
};

const confirmCancelLesson = (lesson) => {
  upcomingLessons.value = upcomingLessons.value.filter((item) => item.id !== lesson.id);
  if (lesson.id === user.nextUpcomingClass?.id) {
    user.nextUpcomingClass = null;
  }
  cancelTargetLesson.value = null;
};

const openTeacherDetails = (teacher) => {
  selectedTeacherForModal.value = teacher;
};

const handleBookFromTeacherModal = () => {
  router.push('/booking');
};

const quickInstructors = ref([
  {
    id: 1,
    name: 'Sarah Jenkins',
    photo: imageForKey(184),
    specialty: '[SF] Speech Fluency, [LS1], [DC]',
    rating: '4.98',
    nextAvailable: 'Today 20:00',
    major: 'B.A. in English Linguistics & Education',
    expertise: '[SF] Speech Fluency & [EP] Exam Prep',
    selfIntro: 'Hello! I specialize in helping students speak English naturally and confidently with structured feedback and fluency drills.',
  },
  {
    id: 2,
    name: 'James Anderson',
    photo: imageForKey(178),
    specialty: '[DC] Daily Conversation, [PP101], [PP102]',
    rating: '4.95',
    nextAvailable: 'Today 21:00',
    major: 'B.S. in Communication Studies',
    expertise: '[PP101] Pronunciation — Vowels & [PP202] American T',
    selfIntro: 'I focus on clear intonation and natural American pronunciation. Let\'s practice speaking fluidly on everyday topics!',
  },
  {
    id: 3,
    name: 'Emily Rivera',
    photo: imageForKey(176),
    specialty: '[RW] Reading & Writing, [SC], [EP]',
    rating: '4.92',
    nextAvailable: 'Tomorrow 10:00',
    major: 'M.A. in Applied English Linguistics',
    expertise: '[RW] Reading & Writing & Grammar Logic',
    selfIntro: 'Writing and articulating thoughts clearly requires structure. I enjoy coaching students on expression, essays, and conversation.',
  },
  {
    id: 4,
    name: 'Mark Davis',
    photo: imageForKey(175),
    specialty: '[SF] Speech Fluency, [PP201], [SC]',
    rating: '4.89',
    nextAvailable: 'Tomorrow 11:30',
    major: 'B.A. in Secondary Education',
    expertise: '[SF] Speech Fluency & [PP201] Consonants',
    selfIntro: 'My classes are relaxing, fun, and highly interactive. You will do 80% of the talking in our lessons!',
  },
]);

const upcomingLessons = ref([
  {
    id: 1,
    date: 'Today, Aug 21',
    time: '7:00 PM - 7:30 PM JST',
    teacherName: 'Sarah Jenkins',
    teacherPhoto: imageForKey(184),
    isSubstitute: false,
    isNext: true,
    subject: '[SF] Speech Fluency & Discussion',
    classType: 'Level 4 / Material B',
    meetLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 2,
    date: 'Tomorrow, Aug 22',
    time: '8:00 PM - 8:50 PM JST',
    teacherName: 'Mark Davis',
    teacherPhoto: imageForKey(175),
    isSubstitute: true,
    isNext: false,
    subject: '[DC] Daily Conversation',
    classType: 'Open Topic & Fluency',
    meetLink: 'https://meet.google.com/xyz-uvwx-rst',
  },
]);

const writingTasks = ref([
  {
    id: 1,
    date: 'Aug 20',
    status: 'Reviewed',
    statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    title: '[RW] Self Introduction Draft for Marketing',
    teacherName: 'Emily Rivera',
    teacherPhoto: imageForKey(176),
  },
  {
    id: 2,
    date: 'Aug 18',
    status: 'In Progress',
    statusColor: 'bg-zinc-100 text-zinc-700',
    title: '[RW] Weekly Journal - Business Trip Reflection',
    teacherName: 'Sarah Jenkins',
    teacherPhoto: imageForKey(184),
  },
]);
</script>
