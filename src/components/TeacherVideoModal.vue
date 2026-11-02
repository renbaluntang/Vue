<template>
  <!-- An instructor's two videos in one pop-up, used by the booking page and the
       class panel. It sits above other pop-ups, so it can open from inside one. -->
  <div
    class="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/75 backdrop-blur-xs p-4 pt-6 sm:pt-12"
    @click.stop="$emit('close')"
    @keydown.esc.stop="$emit('close')"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="`Videos from ${name}`"
      class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-800 outline-none"
      @click.stop
    >
      <div class="flex items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-white border-b border-slate-800">
        <!-- Both videos answer different questions about the same teacher, so
             they belong on one switch rather than behind two separate trips
             out to the card and back. -->
        <div
          role="tablist"
          :aria-label="`Videos from ${name}`"
          class="flex min-w-0 items-center gap-1 rounded-full bg-slate-800/80 p-1"
        >
          <button
            v-for="tab in TABS"
            :key="tab.kind"
            type="button"
            role="tab"
            :aria-selected="kind === tab.kind ? 'true' : 'false'"
            @click="$emit('update:kind', tab.kind)"
            class="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition"
            :class="kind === tab.kind
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-300 hover:text-white'"
          >
            <i :class="tab.icon" aria-hidden="true"></i>
            {{ tab.label(firstName) }}
          </button>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          aria-label="Close video"
          class="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          Close <i class="fa-solid fa-xmark ml-1" aria-hidden="true"></i>
        </button>
      </div>

      <TeacherIntroVideo :key="kind" :video-id="kind === 'demo' ? DEMO_VIDEO_ID : INTRO_VIDEO_ID" />

      <!-- The point of watching. Booking sat two screens away, so the moment
           of "yes, them" had nowhere to go. -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-900 px-4 py-3">
        <p class="min-w-0 text-xs text-slate-400">
          {{ kind === 'demo'
            ? `This is what a class with ${firstName} looks like.`
            : `${firstName} teaches ${subjects || 'English'}.` }}
        </p>
        <button
          type="button"
          @click="$emit('book')"
          class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-amber-300 bg-[#FFCD00] px-5 py-2 text-xs font-extrabold text-slate-900 shadow-md transition hover:bg-[#FFD933] hover:shadow-lg active:scale-95"
        >
          <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
          Book a class with {{ firstName }}
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import TeacherIntroVideo from './TeacherIntroVideo.vue';
import { INTRO_VIDEO_ID, DEMO_VIDEO_ID } from '@/pages/student-view-v4/constants';

const props = defineProps({
  /** The instructor's full name. */
  name: { type: String, required: true },
  /** Which video is showing: 'intro' or 'demo'. */
  kind: { type: String, default: 'intro' },
  /** "Speech Fluency, Daily Conversation and 3 more", for the intro's caption. */
  subjects: { type: String, default: '' },
});

defineEmits(['update:kind', 'close', 'book']);

const TABS = [
  { kind: 'intro', icon: 'fa-solid fa-play text-red-500', label: (n) => `Get to know ${n}` },
  { kind: 'demo', icon: 'fa-solid fa-clapperboard text-indigo-500', label: (n) => `See ${n} teach` },
];

const firstName = computed(() => props.name.split(' ')[0]);

// Focus the pop-up so Escape closes it without a click first.
const dialog = ref(null);
onMounted(() => dialog.value?.focus());
</script>
