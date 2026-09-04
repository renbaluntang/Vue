<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="away-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="away-title"
      aria-describedby="away-desc"
      @keydown.esc.prevent="resume"
    >
      <div
        ref="cardEl"
        class="away-card w-full max-w-md rounded-3xl border p-6 text-center shadow-2xl sm:p-8"
        :class="fired ? 'border-rose-500/50 bg-slate-900' : 'border-slate-700/70 bg-slate-900'"
      >
        <span
          id="away-title"
          class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em]"
          :class="fired ? 'border-rose-400 text-rose-300' : 'border-amber-400 text-amber-300'"
        >
          <i class="fa-solid fa-moon text-xs"></i> Away
        </span>

        <!-- Countdown, with the label doing the explaining. A bare clock leaves
             the instructor guessing what happens when it runs out. -->
        <p
          class="mt-5 font-mono text-5xl font-black tabular-nums sm:text-6xl"
          :class="fired ? 'text-rose-400' : 'text-white'"
          role="timer"
          aria-live="off"
        >
          {{ clock }}
        </p>
        <p class="mt-1.5 text-xs font-bold uppercase tracking-wider" :class="fired ? 'text-rose-300' : 'text-slate-400'">
          {{ fired ? 'Administrator notified' : 'Until an administrator is notified' }}
        </p>

        <p id="away-desc" class="mt-5 text-sm leading-relaxed text-slate-300">
          New <strong class="text-white">Free Conversation</strong> reservations are paused.
          <!-- The reassurance the legacy message never gave, and the first thing
               an instructor actually wants to know. -->
          <span class="mt-1.5 block text-slate-400">
            Lessons already booked are unaffected and still start on time.
          </span>
        </p>

        <!-- An imminent lesson outranks the block: Away must never be the reason
             an instructor misses a class. -->
        <div
          v-if="teacher.imminentReservation"
          class="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-left"
        >
          <p class="text-[11px] font-black uppercase tracking-wider text-emerald-300">
            Lesson starts in {{ teacher.imminentReservation.minutesUntil }} min
          </p>
          <p class="mt-1 truncate text-sm font-bold text-white">
            {{ teacher.imminentReservation.studentName }}
          </p>
          <p class="truncate text-xs text-slate-400">{{ teacher.imminentReservation.subject }}</p>
          <a
            v-if="teacher.imminentReservation.meetLink"
            :href="teacher.imminentReservation.meetLink"
            target="_blank"
            rel="noopener"
            class="mt-3 flex items-center justify-center gap-2 rounded-xl border border-transparent bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
          >
            📹 Enter Google Meet
          </a>
        </div>

        <button
          ref="resumeEl"
          type="button"
          @click="resume"
          class="mt-6 w-full rounded-2xl border border-transparent bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Set to Available
        </button>

        <p class="mt-3 text-[11px] text-slate-500">
          Press <kbd class="rounded border border-slate-700 px-1 font-sans">Esc</kbd> to come back
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

/** Matches the legacy threshold: five minutes, then the office is told. */
const NOTIFY_AFTER_MS = 5 * 60 * 1000;

const open = computed(() => teacher.isAway && teacher.teachesFreeConversation);

const now = ref(Date.now());
let ticker = null;

const startTicking = () => {
  now.value = Date.now();
  if (!ticker) ticker = setInterval(() => { now.value = Date.now(); }, 1000);
};
const stopTicking = () => {
  if (ticker) { clearInterval(ticker); ticker = null; }
};

const remainingMs = computed(() => {
  if (!teacher.awaySince) return NOTIFY_AFTER_MS;
  return Math.max(0, NOTIFY_AFTER_MS - (now.value - teacher.awaySince));
});

const fired = computed(() => remainingMs.value === 0);

const clock = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000);
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
});

const cardEl = ref(null);
const resumeEl = ref(null);

const resume = () => { teacher.toggleAway(); };

// The overlay covers the page, so the page behind it must not scroll, and the
// way out must hold focus — otherwise a keyboard user is genuinely trapped.
let previousOverflow = '';
let previouslyFocused = null;

watch(open, async (isOpen) => {
  if (isOpen) {
    startTicking();
    previouslyFocused = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    await nextTick();
    resumeEl.value?.focus();
  } else {
    stopTicking();
    document.body.style.overflow = previousOverflow;
    previouslyFocused?.focus?.();
  }
}, { immediate: true });

onBeforeUnmount(() => {
  stopTicking();
  document.body.style.overflow = previousOverflow;
});
</script>

<style scoped>
/* The glow escalates only once the office has been told — before that it is a
   normal state, not an alarm. */
.away-card {
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
}
.away-card.border-rose-500\/50 {
  box-shadow: 0 0 0 1px rgb(244 63 94 / 0.35), 0 0 40px rgb(244 63 94 / 0.35);
  animation: away-pulse 2.4s ease-in-out infinite;
}

@keyframes away-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgb(244 63 94 / 0.35), 0 0 30px rgb(244 63 94 / 0.25); }
  50%      { box-shadow: 0 0 0 1px rgb(244 63 94 / 0.5), 0 0 52px rgb(244 63 94 / 0.45); }
}

@media (prefers-reduced-motion: reduce) {
  .away-card.border-rose-500\/50 { animation: none; }
}
</style>
