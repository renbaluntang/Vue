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
        >
          ✕
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
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                ★ {{ teacher.rating || '4.95' }} Rating
              </span>
            </div>
            <p class="text-sm font-semibold text-brighture-bronze">{{ teacher.specialty || '[SF] Speech Fluency, [LS1] Listening & Speaking, [DC] Daily Conversation' }}</p>

            <!-- Rates & Audio Voice sample -->
            <div class="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span class="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                Rate: <strong>5 pts (30 min)</strong> · <strong>10 pts (1 hr)</strong>
              </span>

              <!-- Voice Audio Sample Button -->
              <button
                @click="isPlayingVoice = !isPlayingVoice"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs"
                :class="isPlayingVoice ? 'bg-brighture-gold text-brighture-ink' : 'bg-brighture-cream text-brighture-bronze border border-brighture-gold/30 hover:bg-brighture-gold/15'"
              >
                <span>{{ isPlayingVoice ? '⏸' : '🔊' }}</span>
                <span>{{ isPlayingVoice ? 'Playing Sample...' : 'Listen to Voice' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Major & Expertise Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>🎓</span> Major / Degree
            </div>
            <p class="mt-1 text-sm font-bold text-slate-800">
              {{ teacher.major || 'B.A. in English Linguistics & Education' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>🎯</span> Core Expertise
            </div>
            <p class="mt-1 text-sm font-bold text-slate-800">
              {{ teacher.expertise || '[SF] Speech Fluency, [PP101] Pronunciation, [EP] Exam Prep' }}
            </p>
          </div>
        </div>

        <!-- Subjects Taught (Accurate Brighture List) -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Subjects Taught (Online 1-on-1)
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="(sub, i) in (teacher.subjects || '[SF] Speech Fluency, [LS1] Listening & Speaking, [DC] Daily Conversation, [RW] Reading & Writing, [SC] Social Conversation, [PP101] Pronunciation — Vowels, [PP102] Pronunciation — R-controlled Vowels, [PP201] Pronunciation — Consonants, [PP202] Pronunciation — American T, [EP] Exam Prep, [TA] Trial Lesson & Assessment, [CS] Counseling Session').split(',')"
              :key="i"
              class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
            >
              {{ sub.trim() }}
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
      <div class="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition"
        >
          Close
        </button>

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
import { imageForKey } from '@/lib/teacherImages';
import AppImage from './AppImage.vue';
import { ref } from 'vue';

defineProps({
  teacher: Object,
});

defineEmits(['close', 'book']);

const isPlayingVoice = ref(false);

const getTeacherModalImage = (teacher) => {
  if (teacher?.photo) return teacher.photo;
  return imageForKey(184);
};
</script>
