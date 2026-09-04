<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
    <!-- Top Welcome & Online Class Quick CTA Header -->
    <section class="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <img :src="brightureLogo" alt="Brighture" class="h-6 sm:h-7 w-auto" />
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, <span class="text-brighture-bronze">{{ user.profile.firstName }}</span> 👋
        </h1>
        <p class="text-sm text-slate-500 font-medium">
          Ready for your next speaking session? Manage your scheduled classes and practice online.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto lg:shrink-0">
        <RouterLink
          to="/booking"
          class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FFCD00] text-black font-bold text-[13px] sm:text-sm leading-tight text-center shadow-md hover:bg-[#FFD933] hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <span class="shrink-0">🗓️</span> <span>Book Online Class</span>
        </RouterLink>

        <button
          data-tour="talk-now"
          @click="showFreeConversationModal = true"
          class="relative group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-[13px] sm:text-sm leading-tight text-center shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <span class="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full shadow-md">
            Instant
          </span>
          <span class="shrink-0">⚡</span> <span>Talk Now</span>
        </button>

      </div>
    </section>

    <!-- MERGED & UNIFIED: SCHEDULED ONLINE CLASSES SECTION -->
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span class="w-2.5 h-6 rounded-full bg-brighture-gold shrink-0"></span>
          <h2 class="min-w-0 text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Scheduled Online Classes
          </h2>
          <span class="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-extrabold">
            {{ upcomingLessons.length }} Upcoming
          </span>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink to="/booking" class="text-xs font-bold text-brighture-bronze hover:text-brighture-bronze">
            + Book Another Class
          </RouterLink>
          <span class="text-slate-300">•</span>
          <RouterLink to="/history" class="text-xs font-bold text-slate-500 hover:text-slate-700">
            Past Lessons History →
          </RouterLink>
        </div>
      </div>

      <!-- Unified Card Container -->
      <div class="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <!-- 1. FEATURED NEXT IMMEDIATE CLASS (SPOTLIGHT) -->
        <div
          v-if="user.nextUpcomingClass"
          class="relative overflow-hidden text-white p-6 sm:p-8 border-b border-slate-900/50 bg-[radial-gradient(115%_135%_at_90%_-12%,rgba(255,205,0,0.17)_0%,rgba(255,205,0,0.07)_26%,rgba(255,205,0,0.02)_44%,transparent_64%),radial-gradient(85%_115%_at_2%_108%,rgba(255,189,0,0.10)_0%,rgba(255,189,0,0.035)_32%,transparent_66%),linear-gradient(140deg,#0F1319_0%,#131925_24%,#161C26_48%,#111722_72%,#0A0D12_100%)]"
        >
          <!-- lit top edge, so the card reads as raised rather than cut out -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

          <div class="relative z-10 space-y-6">
            <!-- Status row -->
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                NEXT CLASS • STARTS IN {{ user.nextUpcomingClass.minutesUntil }} MINS
              </span>
              <span class="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                {{ user.nextUpcomingClass.timeFull }}
              </span>
            </div>

            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <!-- Teacher alongside the class it belongs to -->
              <div class="flex items-start gap-4 sm:gap-5 max-w-2xl">
                <button
                  type="button"
                  @click="openTeacherDetails({ name: user.nextUpcomingClass.teacherName, photo: user.nextUpcomingClass.teacherPhoto, specialty: '[SF] Speech Fluency, [LS1], [DC]', rating: '4.98', major: 'B.A. in English Linguistics', expertise: '[SF] Speech Fluency & [EP] Exam Prep' })"
                  class="group w-20 sm:w-24 shrink-0 text-center"
                  title="View teacher profile"
                >
                  <AppImage
                    :src="user.nextUpcomingClass.teacherPhoto"
                    :alt="user.nextUpcomingClass.teacherName"
                    eager
                    class="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full border-2 border-brighture-amber/70 transition group-hover:border-brighture-gold/50 group-hover:scale-105"
                  />
                  <span class="mt-2 block truncate text-xs font-bold text-white transition group-hover:text-brighture-gold">
                    {{ user.nextUpcomingClass.teacherName }}
                  </span>
                  <span class="block text-[11px] font-semibold text-brighture-gold transition group-hover:text-brighture-gold">
                    View profile →
                  </span>
                </button>

                <div class="min-w-0 pt-1">
                  <h3 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {{ user.nextUpcomingClass.subject }}
                  </h3>
                  <p class="text-brighture-gold text-sm font-medium mt-1.5">
                    Topic: <strong class="text-white">{{ user.nextUpcomingClass.topic }}</strong>
                  </p>
                  <span
                    v-if="user.nextUpcomingClass.isSubstitute"
                    class="mt-2.5 inline-flex items-center rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 ring-1 ring-amber-400/40"
                  >
                    Substitute teacher
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col justify-center gap-2 sm:gap-3 w-full lg:w-auto lg:self-center shrink-0">
                <a
                  :href="user.nextUpcomingClass.meetLink"
                  target="_blank"
                  class="inline-flex w-full items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap"
                >
                  <span>📹</span> Enter Google Meet
                </a>
                <button
                  type="button"
                  @click="detailsLesson = user.nextUpcomingClass"
                  class="inline-flex w-full items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm sm:text-base transition border border-white/15 text-center whitespace-nowrap"
                >
                  Class Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. SUBSEQUENT SCHEDULED LESSONS TABLE -->
        <div class="p-4 sm:p-6 bg-white space-y-3">
          <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Upcoming Lesson Schedule</span>
            <span>{{ scheduledLessons.length }} after this one</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th class="py-3 px-4">Date & Time</th>
                  <th class="py-3 px-4">Online Teacher</th>
                  <th class="py-3 px-4">Subject & Class</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr
                  v-for="lesson in scheduledLessons"
                  :key="lesson.id"
                  class="transition-colors hover:bg-slate-50/70 group"
                  :class="lesson.isNext ? 'bg-brighture-cream/30' : ''"
                >
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span v-if="lesson.isNext" class="w-2 h-2 rounded-full bg-emerald-500" title="Next upcoming lesson"></span>
                      <div>
                        <div class="font-bold text-slate-800">{{ lesson.date }}</div>
                        <div class="text-slate-500 text-xs font-semibold mt-0.5">{{ lesson.time }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <button
                      type="button"
                      @click="openTeacherDetails({ name: lesson.teacherName, photo: lesson.teacherPhoto, specialty: lesson.subject, rating: '4.95' })"
                      class="flex items-center gap-3 text-left group/teacher"
                      title="View teacher profile"
                    >
                      <AppImage
                        :src="lesson.teacherPhoto"
                        :alt="lesson.teacherName"
                        class="w-10 h-10 rounded-full ring-2 ring-white outline outline-1 outline-slate-200 shadow-2xs transition group-hover/teacher:outline-brighture-gold/50"
                      />
                      <span class="min-w-0">
                        <span class="block truncate font-bold text-slate-800 transition group-hover/teacher:text-brighture-bronze">
                          {{ lesson.teacherName }}
                        </span>
                        <span
                          v-if="lesson.isSubstitute"
                          class="mt-1 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200"
                        >
                          Substitute
                        </span>
                      </span>
                    </button>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-700">{{ lesson.subject }}</div>
                    <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">{{ lesson.classType }}</div>
                  </td>
                  <!-- Non-Wrapping Action Buttons -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <div class="inline-flex items-center justify-end gap-2 flex-nowrap">
                      <a
                        v-if="lesson.meetLink"
                        :href="lesson.meetLink"
                        target="_blank"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 hover:scale-105 active:scale-95 transition whitespace-nowrap flex-shrink-0 shadow-2xs"
                      >
                        <span>📹</span>
                        <span>Join Meet</span>
                      </a>
                      <button
                        type="button"
                        @click="detailsLesson = lesson"
                        class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition whitespace-nowrap flex-shrink-0"
                        title="View class details"
                      >
                        <span>ℹ️</span>
                        <span>Details</span>
                      </button>
                      <button
                        type="button"
                        @click="cancelTargetLesson = lesson"
                        class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
                        title="Cancel class"
                        aria-label="Cancel class"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="!scheduledLessons.length" class="py-6 text-center text-sm font-medium text-slate-400">
            Nothing else booked yet.
            <RouterLink to="/booking" class="font-bold text-brighture-bronze hover:underline">
              Book another class →
            </RouterLink>
          </p>
        </div>

        <!-- Cancellation & Changes Footnote -->
        <div class="bg-slate-50 p-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            * <strong class="text-slate-600">Cancellation:</strong> Free cancellation up to 3h before class starts (Points refunded).<br class="hidden sm:inline" />
            * <strong class="text-slate-600">Changes:</strong> Subject & message can be adjusted until 2h prior.
          </div>
          <RouterLink to="/booking" class="font-bold text-brighture-bronze hover:text-brighture-bronze whitespace-nowrap">
            Schedule More Classes →
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- QUICK EASY CLASS BOOKING SECTION (WITH EXACT SUBJECTS) -->
    <section class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>🗓️</span> Quick Online Class Booking
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Click any instructor photo to view full profile & voice sample.</p>
        </div>
        <RouterLink
          to="/booking"
          class="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
        >
          View Full Schedule Calendar (14 Days) →
        </RouterLink>
      </div>

      <!-- Quick Instructors Grid (Click photo -> Open Teacher Data Modal) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="instructor in quickInstructors"
          :key="instructor.id"
          class="border border-slate-200/80 rounded-2xl p-4 hover:border-brighture-gold/50 hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50 group"
        >
          <div class="flex items-start gap-3">
            <!-- CLICKABLE TEACHER PHOTO -->
            <div
              @click="openTeacherDetails(instructor)"
              class="relative cursor-pointer flex-shrink-0"
              title="Click to view instructor profile"
            >
              <AppImage
                :src="instructor.photo"
                :alt="instructor.name"
                class="w-12 h-12 rounded-xl border border-slate-200 shadow-2xs group-hover:scale-105 transition"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <h3
                  @click="openTeacherDetails(instructor)"
                  class="text-sm font-bold text-slate-900 truncate hover:text-brighture-bronze cursor-pointer"
                >
                  {{ instructor.name }}
                </h3>
                <span class="text-xs text-amber-500 font-bold">★ {{ instructor.rating }}</span>
              </div>
              <p class="text-[11px] text-slate-500 truncate">{{ instructor.specialty }}</p>
              <div class="mt-1 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] font-bold text-emerald-700">{{ instructor.nextAvailable }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              @click="openTeacherDetails(instructor)"
              class="flex-1 inline-flex items-center justify-center px-2 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs whitespace-nowrap hover:bg-slate-100 transition shadow-2xs"
            >
              View Info
            </button>
            <RouterLink
              to="/booking"
              class="flex-1 inline-flex items-center justify-center px-2 py-2 rounded-xl bg-[#FFCD00] border border-transparent text-black font-bold text-xs whitespace-nowrap hover:bg-[#FFD933] transition shadow-2xs"
            >
              Book →
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- WRITING TASKS SECTION -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-5 rounded-full bg-brighture-gold"></span> In-Progress Writing Corrections
        </h2>
        <RouterLink to="/writing" class="text-xs font-bold text-brighture-bronze hover:text-brighture-bronze">
          Open Writing Chat →
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="task in writingTasks"
          :key="task.id"
          class="bg-white border border-slate-200/80 rounded-3xl p-5 hover:border-brighture-gold/50 hover:shadow-sm transition-all group cursor-pointer flex flex-col justify-between"
          @click="$router.push('/writing')"
        >
          <div>
            <div class="flex justify-between items-start mb-2">
              <span :class="`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${task.statusColor}`">
                {{ task.status }}
              </span>
              <span class="text-xs text-slate-400 font-semibold">{{ task.date }}</span>
            </div>
            <h3 class="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{{ task.title }}</h3>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div class="flex items-center gap-2">
              <img :src="task.teacherPhoto" class="w-6 h-6 rounded-full object-cover" />
              <span class="text-xs font-semibold text-slate-600">{{ task.teacherName }}</span>
            </div>
            <span class="text-xs font-bold text-brighture-bronze group-hover:translate-x-1 transition-transform">Reply Chat →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Refer a Friend Banner ===== -->
    <!-- A link, not a modal: the programme rules are long enough that they were
         overflowing short screens, and /refer already holds the full details. -->
    <RouterLink
      to="/refer"
      class="group relative block overflow-hidden rounded-2xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brighture-cream"
      style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #0ea5e9 100%);"
    >
      <div class="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
      <div class="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-2xl"></div>
      <div class="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <i class="fa-solid fa-user-plus text-2xl text-white"></i>
          </div>
          <div>
            <h3 class="text-lg font-extrabold text-white leading-tight">Refer a Friend — Earn 5 Points</h3>
            <p class="mt-0.5 text-sm text-violet-100">
              Your friend gets <span class="font-bold text-white">$20 USD off</span> their plan &mdash; you earn <span class="font-bold text-white">5 points</span> once they buy a plan and start learning.
            </p>
          </div>
        </div>
        <!-- A span, not a button: the whole banner is already the link, and a
             button inside an anchor is invalid markup. -->
        <span
          class="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-violet-700 shadow-lg shadow-violet-900/30 transition group-hover:bg-violet-50 group-hover:scale-105 group-active:scale-95"
        >
          <i class="fa-solid fa-share-nodes text-sm"></i>
          Share &amp; Earn
        </span>
      </div>
    </RouterLink>
    <!-- ===== /Refer a Friend Banner ===== -->

    <!-- Talk Now Modal -->
    <FreeConversationModal
      :isOpen="showFreeConversationModal"
      @close="showFreeConversationModal = false"
    />

    <!-- Class Details Modal -->
    <ClassDetailsModal
      :lesson="detailsLesson"
      @close="detailsLesson = null"
      @cancel="requestCancelFromDetails"
      @edit="requestEditFromDetails"
    />

    <!-- Edit Class Modal -->
    <EditClassModal
      :lesson="editLesson"
      @close="editLesson = null"
      @save="saveLessonEdits"
    />

    <!-- Cancel Class Confirmation -->
    <CancelClassModal
      :lesson="cancelTargetLesson"
      @close="cancelTargetLesson = null"
      @confirm="confirmCancelLesson"
    />

    <!-- Teacher Details Modal -->
    <TeacherDataModal
      :teacher="selectedTeacherForModal"
      @close="selectedTeacherForModal = null"
      @book="handleBookFromTeacherModal"
    />

  </div>
</template>

<script setup>
import { imageForKey } from '@/lib/teacherImages';
import AppImage from '../../components/AppImage.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import brightureLogo from '@/assets/logo-black.svg';
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

// The spotlight already shows the next class, so the table lists the ones after it.
const scheduledLessons = computed(() =>
  upcomingLessons.value.filter((lesson) => lesson.id !== user.nextUpcomingClass?.id)
);

const detailsLesson = ref(null);
const editLesson = ref(null);
const cancelTargetLesson = ref(null);

// The details modal hands off to the confirmation rather than cancelling outright.
const requestCancelFromDetails = (lesson) => {
  detailsLesson.value = null;
  cancelTargetLesson.value = lesson;
};

const saveLessonEdits = (updated) => {
  // The spotlight class is the store's, the table rows are this page's.
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

const handleBookFromTeacherModal = (teacher) => {
  router.push('/booking');
};

const quickInstructors = ref([
  {
    id: 1,
    name: 'Jirvy Dela Torre',
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
    name: 'Jane Pasanting',
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
    name: 'Analyn Yosores',
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
    name: 'Sandra Auman',
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
    teacherName: 'Jirvy Dela Torre',
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
    teacherName: 'Sandra Auman',
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
    status: 'Teacher Reviewed',
    statusColor: 'bg-emerald-100 text-emerald-700',
    title: '[RW] Self Introduction Draft for Marketing',
    teacherName: 'Analyn Yosores',
    teacherPhoto: imageForKey(176),
  },
  {
    id: 2,
    date: 'Aug 18',
    status: 'In Progress',
    statusColor: 'bg-slate-100 text-slate-700',
    title: '[RW] Weekly Journal - Business Trip Reflection',
    teacherName: 'Jirvy Dela Torre',
    teacherPhoto: imageForKey(184),
  },
]);
</script>
