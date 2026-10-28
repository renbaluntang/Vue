<template>
  <div v-if="teacher" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200" @click="$emit('close')">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in zoom-in-95" @click.stop>
      <!-- Header -->
      <div class="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-5 rounded-full bg-brighture-gold"></span>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">Instructor Profile & Details</h2>
        </div>
        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition font-bold text-sm"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Body Content -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
        <!-- Top Teacher Card -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div class="flex w-full max-w-[220px] shrink-0 flex-col items-center sm:w-[180px]">
            <AppImage
              :src="teacher.photo || getTeacherModalImage(teacher)"
              :alt="teacher.name"
              eager
              class="aspect-square w-full rounded-2xl object-cover shadow-md border-2 border-white ring-2 ring-slate-100"
            />
          </div>

          <div class="text-center sm:text-left space-y-2 flex-1">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">{{ teacher.name }}</h3>
            </div>
            <div class="relative min-w-0 rounded-2xl rounded-tl-md border border-amber-400 bg-[#fffaf0] p-4 pl-11 text-left">
              <span class="absolute -left-[7px] top-6 hidden h-3 w-3 rotate-45 border-b border-l border-amber-400 bg-[#fffaf0] sm:block" aria-hidden="true"></span>
              <i class="fa-solid fa-quote-left absolute left-4 top-4 text-lg text-amber-400" aria-hidden="true"></i>
              <p class="m-0 text-sm leading-relaxed text-slate-700">{{ selfIntro }}</p>
            </div>
            <div class="grid w-full grid-cols-2 gap-2">
              <button
                type="button"
                @click="openVideo('intro')"
                class="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-bold shadow-2xs transition active:scale-95 sm:px-3"
                :class="activeVideo === 'intro' ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900'"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <i class="fa-solid fa-play text-[7px]" aria-hidden="true"></i>
                </span>
                <span class="truncate">Get to know {{ firstName }}</span>
              </button>
              <button
                type="button"
                @click="openVideo('demo')"
                class="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-bold shadow-2xs transition active:scale-95 sm:px-3"
                :class="activeVideo === 'demo' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900'"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <i class="fa-solid fa-chalkboard-user text-[8px]" aria-hidden="true"></i>
                </span>
                <span class="truncate">See {{ firstName }} teach</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Video player, opened by the two buttons above -->
        <div v-if="activeVideo" class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          <div class="flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
            <p class="truncate text-xs font-bold text-white">
              {{ activeVideo === 'demo' ? `See ${firstName} teach` : `Get to know ${firstName}` }}
            </p>
            <button
              type="button"
              @click="activeVideo = null"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close video"
            >
              <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
            </button>
          </div>
          <TeacherIntroVideo :key="activeVideo" :video-id="activeVideo === 'demo' ? DEMO_VIDEO_ID : INTRO_VIDEO_ID" />
        </div>

        <!-- The same fields as the instructor's production profile, as cards; the
             rate lives here as "Required points" rather than in the header. -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="row in facts"
            :key="row.label"
            class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
            :class="row.wide ? 'sm:col-span-2' : ''"
          >
            <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ row.label }}</p>
            <p class="m-0 mt-1 text-sm font-bold text-slate-800">{{ row.items.join(', ') }}</p>
          </div>
        </div>

        <!-- Subjects Taught (Accurate Brighture List) -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Subjects Taught ({{ displaySubjects.length }})</span>
            <span class="text-[10px] text-slate-500 font-medium lowercase">authentic specialties</span>
          </div>
          <!-- An even two-column grid, so long names don't leave ragged rows. -->
          <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <span
              v-for="sub in displaySubjects"
              :key="sub.code"
              class="flex min-w-0 items-center px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs"
            >
              <SubjectCode :subject="sub.code" />
            </span>
          </div>
        </div>

      </div>

      <!-- Footer Action -->
      <div class="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
        <button
          @click="$emit('book', teacher); $emit('close')"
          class="px-5 py-2.5 rounded-xl bg-[#FFCD00] hover:bg-[#FFD933] text-black font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
        >
          Book Class with {{ teacher.name }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { imageForKey, teacherImage } from '@/lib/teacherImages';
import AppImage from './AppImage.vue';
import SubjectCode from './SubjectCode.vue';
import TeacherIntroVideo from './TeacherIntroVideo.vue';
import {
  INTRO_VIDEO_ID,
  DEMO_VIDEO_ID,
  parseSubjectCodes,
  findInstructor,
  pointsForDuration,
  SUBJECT_LABELS,
  getTeacherProfile,
} from '@/pages/student-view-v4/constants';

const props = defineProps({
  teacher: Object,
});

defineEmits(['close', 'book']);

/** Which video is open: 'intro', 'demo', or null. */
const activeVideo = ref(null);
const openVideo = (kind) => { activeVideo.value = activeVideo.value === kind ? null : kind; };
const firstName = computed(() => (props.teacher?.name || '').split(' ')[0]);

// A different instructor opens with no video playing.
watch(() => props.teacher, () => { activeVideo.value = null; });

const getTeacherModalImage = (teacher) => {
  if (teacher?.photo) return teacher.photo;
  // Booking-list teachers carry their own portrait key rather than a photo URL.
  if (teacher?.imageKey) return imageForKey(teacher.imageKey);
  return teacherImage(teacher?.name);
};

/** Background rows, short cards first, then the long expertise list across the full width. Dashboard
 *  cards don't carry majors or rates, so they come from the catalogue entry. */
const facts = computed(() => {
  const match = findInstructor(props.teacher);
  const profile = match ? getTeacherProfile(match) : {};
  const rate30 = match ? pointsForDuration(match, 30) : props.teacher?.points || 4;
  const rate60 = match ? pointsForDuration(match, 60) : (props.teacher?.points || 4) * 2;
  return [
    { label: 'Major at university', items: props.teacher?.majors ?? profile.majors ?? ['Education', 'Language'] },
    { label: 'Required points', items: [`${rate30} pts (30m)`, `${rate60} pts (1hr)`] },
    { label: 'Areas of expertise', wide: true, items: props.teacher?.areas ?? profile.areas ?? ['Conversation', 'Grammar'] },
  ];
});

/** The catalogue's self-introduction wins over the copy a dashboard card carries. */
const selfIntro = computed(() => {
  const match = findInstructor(props.teacher);
  return (match && getTeacherProfile(match).selfIntro) || props.teacher?.selfIntro
    || 'Hello! I am passionate about helping students overcome hesitation and speak natural, confident English with customized guidance on fluency, pronunciation, and vocabulary.';
});

const displaySubjects = computed(() => {
  if (!props.teacher) return [];
  const spec = findInstructor(props.teacher)?.specialty || props.teacher.specialty || props.teacher.expertise || '';
  let codes = parseSubjectCodes(spec);
  if (!codes.length && props.teacher.id) {
    const profile = getTeacherProfile(props.teacher);
    if (profile?.expertise) {
      codes = parseSubjectCodes(profile.expertise);
    }
  }
  if (!codes.length) {
    codes = ['SF', 'DC'];
  }
  return codes.map((code) => ({
    code,
    name: SUBJECT_LABELS[code] || code,
  }));
});
</script>
