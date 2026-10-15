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
          <div class="relative group flex-shrink-0">
            <AppImage
              :src="teacher.photo || getTeacherModalImage(teacher)"
              :alt="teacher.name"
              eager
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-md border-2 border-white ring-2 ring-slate-100"
            />
          </div>

          <div class="text-center sm:text-left space-y-2 flex-1">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">{{ teacher.name }}</h3>
            </div>
            <p class="text-sm font-semibold text-brighture-bronze">{{ teacher.specialty || '[SF] Speech Fluency, [LS1] Listening & Speaking, [DC] Daily Conversation' }}</p>

            <!-- Rates -->
            <div class="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span class="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                Rate: <strong>{{ teacher.points || 4 }} pts (30m)</strong> · <strong>{{ (teacher.points || 4) * 2 }} pts (1hr)</strong>
              </span>
            </div>
          </div>

          <div class="flex w-full max-w-[220px] shrink-0 flex-col gap-2 sm:w-[200px] sm:self-center">
            <!-- Two short videos, stacked on the right; they play right here -->
            <button
              type="button"
              @click="openVideo('intro')"
              class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition active:scale-95"
              :class="activeVideo === 'intro' ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900'"
            >
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                <i class="fa-solid fa-play text-[7px]" aria-hidden="true"></i>
              </span>
              Get to know {{ firstName }}
            </button>
            <button
              type="button"
              @click="openVideo('demo')"
              class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition active:scale-95"
              :class="activeVideo === 'demo' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900'"
            >
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <i class="fa-solid fa-chalkboard-user text-[8px]" aria-hidden="true"></i>
              </span>
              See {{ firstName }} teach
            </button>
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

        <!-- Major & Expertise Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <i class="fa-solid fa-graduation-cap text-indigo-600" aria-hidden="true"></i> Major / Degree
            </div>
            <p class="mt-1 text-sm font-bold text-slate-800">
              {{ teacher.major || 'B.A. in English Linguistics & Education' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <i class="fa-solid fa-bullseye text-rose-500" aria-hidden="true"></i> Core Expertise
            </div>
            <p class="mt-1 text-sm font-bold text-slate-800">
              {{ teacher.expertise || '[SF] Speech Fluency, [PP101] Pronunciation, [EP] Exam Prep' }}
            </p>
          </div>
        </div>

        <!-- Subjects Taught (Accurate Brighture List) -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Subjects Covered ({{ displaySubjects.length }})</span>
            <span class="text-[10px] text-slate-500 font-medium lowercase">authentic specialties</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="sub in displaySubjects"
              :key="sub.code"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition shadow-2xs"
              :class="sub.style.badgeClass"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="sub.style.dotClass"></span>
              <span>{{ sub.name }}</span>
            </span>
          </div>
        </div>

        <!-- Self Introduction -->
        <div class="relative rounded-2xl border border-brighture-gold/20 bg-gradient-to-r from-brighture-cream/50 to-white p-4 pl-5">
          <div class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-brighture-gold"></div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-brighture-bronze mb-1">Instructor Self-Introduction</p>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
            "{{ teacher.selfIntro || 'Hello! I am passionate about helping students overcome hesitation and speak natural, confident English with customized guidance on fluency, pronunciation, and vocabulary.' }}"
          </p>
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
import { imageForKey } from '@/lib/teacherImages';
import AppImage from './AppImage.vue';
import TeacherIntroVideo from './TeacherIntroVideo.vue';
import {
  INTRO_VIDEO_ID,
  DEMO_VIDEO_ID,
  parseSubjectCodes,
  SUBJECT_LABELS,
  getSubjectBadgeStyle,
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
  return imageForKey(184);
};

const displaySubjects = computed(() => {
  if (!props.teacher) return [];
  const spec = props.teacher.specialty || props.teacher.expertise || '';
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
    style: getSubjectBadgeStyle(code, false),
  }));
});
</script>
