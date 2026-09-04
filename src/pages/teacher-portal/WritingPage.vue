<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Writing</h1>
        <p class="mt-0.5 text-sm text-slate-500">Correction threads assigned to you, oldest deadline first.</p>
      </div>
      <span
        v-if="overdueCount"
        class="shrink-0 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800"
      >
        {{ overdueCount }} overdue
      </span>
    </header>

    <!-- Two columns on desktop; on a phone the list and the thread take turns,
         same as the student portal's writing page. -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-13rem)] lg:min-h-[34rem]">

      <!-- ===================== Ticket list ===================== -->
      <div
        class="lg:col-span-4 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs"
        :class="activeId ? 'hidden lg:flex' : 'flex'"
      >
        <div class="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <h2 class="text-sm font-extrabold text-slate-800">Queue</h2>
          <span class="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-black text-slate-600 tabular-nums">
            {{ openCount }} open
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-2.5 space-y-2">
          <button
            v-for="task in sortedTasks"
            :key="task.id"
            type="button"
            @click="activeId = task.id"
            class="w-full rounded-2xl border p-3.5 text-left transition"
            :class="activeId === task.id
              ? 'border-brighture-gold/40 bg-brighture-cream shadow-inner'
              : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'"
          >
            <div class="flex items-start justify-between gap-2">
              <span
                class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                :class="urgencyClass(task)"
              >
                {{ task.state }}
              </span>
              <span
                class="shrink-0 text-[11px] font-bold tabular-nums"
                :class="task.state === 'Complete' ? 'text-slate-400' : (task.dueInHours < 0 ? 'text-rose-600' : 'text-slate-400')"
              >
                {{ dueLabel(task) }}
              </span>
            </div>

            <p class="mt-2 line-clamp-1 text-sm font-bold text-slate-900">{{ task.title }}</p>

            <div class="mt-2 flex items-center gap-2">
              <AppImage
                :src="task.studentPhoto"
                :alt="task.studentName"
                class="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span class="min-w-0 flex-1 truncate text-xs font-semibold text-slate-500">
                {{ task.studentName }}
              </span>
              <span class="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">
                {{ task.words }}w
              </span>
              <span
                v-if="awaitingReply(task)"
                class="h-2 w-2 shrink-0 rounded-full bg-brighture-gold"
                :title="`Waiting on your reply`"
              ></span>
            </div>
          </button>

          <p
            v-if="!sortedTasks.length"
            class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
          >
            No writing assigned to you right now.
          </p>
        </div>
      </div>

      <!-- ===================== Thread ===================== -->
      <div
        class="lg:col-span-8 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs h-[75dvh] lg:h-auto"
        :class="activeId ? 'flex' : 'hidden lg:flex'"
      >
        <template v-if="activeTask">
          <!-- Thread header -->
          <div class="z-10 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 shadow-2xs sm:px-5">
            <button
              type="button"
              @click="activeId = null"
              class="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 lg:hidden"
              aria-label="Back to queue"
            >
              <i class="fa-solid fa-arrow-left text-xs"></i>
            </button>

            <AppImage
              :src="activeTask.studentPhoto"
              :alt="activeTask.studentName"
              eager
              class="hidden h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200 sm:block"
            />

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-sm font-extrabold text-slate-900 sm:text-base">
                {{ activeTask.title }}
              </h2>
              <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                <span class="font-bold text-slate-600">{{ activeTask.studentName }}</span>
                <span class="text-slate-300">·</span>
                <span class="font-medium text-slate-500 tabular-nums">{{ activeTask.words }} words</span>
                <span class="text-slate-300">·</span>
                <span
                  class="font-bold"
                  :class="activeTask.state === 'Complete' ? 'text-emerald-600' : (activeTask.dueInHours < 0 ? 'text-rose-600' : 'text-slate-500')"
                >
                  {{ dueLabel(activeTask) }}
                </span>
              </div>
            </div>

            <button
              v-if="activeTask.state !== 'Complete'"
              type="button"
              @click="teacher.completeWritingTask(activeTask.id)"
              class="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
            >
              <span class="hidden sm:inline">Mark complete</span>
              <span class="sm:hidden">Done</span>
            </button>
            <span
              v-else
              class="shrink-0 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800"
            >
              Complete
            </span>
          </div>

          <!-- Submitted-at strip: the three clocks the legacy app showed, kept
               out of the message flow so they do not read as a message. -->
          <div class="shrink-0 border-b border-slate-100 bg-white px-4 py-2 text-[11px] text-slate-400 sm:px-5">
            Submitted
            <span class="font-bold text-slate-600">{{ activeTask.submittedManila }}</span>
            <span class="text-slate-300"> · Tokyo </span>
            <span class="font-bold text-slate-600">{{ activeTask.submittedTokyo }}</span>
          </div>

          <!-- Messages -->
          <div ref="scrollEl" class="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-4 sm:space-y-6 sm:p-6">
            <div
              v-for="msg in activeTask.messages"
              :key="msg.id"
              class="flex max-w-[92%] gap-2.5 sm:max-w-[85%] sm:gap-3.5"
              :class="msg.from === 'teacher' ? 'ml-auto flex-row-reverse' : ''"
            >
              <AppImage
                :src="msg.from === 'teacher' ? teacher.profile.photo : activeTask.studentPhoto"
                :alt="msg.from === 'teacher' ? teacher.fullName : activeTask.studentName"
                class="h-8 w-8 shrink-0 rounded-full object-cover shadow-xs sm:h-10 sm:w-10"
              />

              <div class="min-w-0 space-y-1" :class="msg.from === 'teacher' ? 'text-right' : 'text-left'">
                <div
                  class="flex items-center gap-2 text-xs font-semibold text-slate-400"
                  :class="msg.from === 'teacher' ? 'flex-row-reverse' : ''"
                >
                  <span class="text-slate-600">
                    {{ msg.from === 'teacher' ? 'You' : activeTask.studentName.split(' ')[0] }}
                  </span>
                  <span class="tabular-nums">{{ msg.time }}</span>
                </div>

                <!-- A correction travels attached to the message that explains
                     it, so the student never has to match one to the other. -->
                <div
                  v-if="msg.correction"
                  class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-left"
                >
                  <p class="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    Corrected version
                  </p>
                  <p class="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ msg.correction }}</p>
                </div>

                <div
                  v-if="msg.body"
                  class="whitespace-pre-wrap p-3.5 text-left text-sm leading-relaxed shadow-xs sm:p-4"
                  :class="msg.from === 'teacher'
                    ? 'rounded-2xl rounded-tr-sm bg-brighture-gold text-brighture-ink'
                    : 'rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-800'"
                >
                  {{ msg.body }}
                </div>
              </div>
            </div>
          </div>

          <!-- Composer -->
          <div v-if="activeTask.state !== 'Complete'" class="shrink-0 border-t border-slate-200 bg-white p-3.5 sm:p-4">
            <div class="mb-2 flex items-center justify-between gap-2 px-1">
              <span class="text-xs font-bold text-slate-500">
                Reply to {{ activeTask.studentName.split(' ')[0] }}
              </span>
              <button
                type="button"
                @click="showCorrection = !showCorrection"
                class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold transition"
                :class="showCorrection
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'"
                :aria-expanded="showCorrection ? 'true' : 'false'"
              >
                <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                {{ showCorrection ? 'Correction attached' : 'Attach correction' }}
              </button>
            </div>

            <div v-if="showCorrection" class="mb-2">
              <label for="wr-correction" class="sr-only">Corrected version</label>
              <textarea
                id="wr-correction"
                v-model="correction"
                rows="4"
                placeholder="Paste the corrected passage here."
                class="w-full resize-none rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              ></textarea>
            </div>

            <div class="relative">
              <label for="wr-reply" class="sr-only">Message to the student</label>
              <textarea
                id="wr-reply"
                v-model="reply"
                rows="3"
                placeholder="Explain the main patterns to work on…"
                @keydown.enter.meta.prevent="send"
                @keydown.enter.ctrl.prevent="send"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:bg-white focus:ring-4 focus:ring-brighture-gold/20"
              ></textarea>
              <button
                type="button"
                @click="send"
                :disabled="!canSend"
                class="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brighture-gold text-brighture-ink shadow-md transition hover:bg-brighture-gold-deep hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send reply"
              >
                <i class="fa-solid fa-arrow-up text-xs"></i>
              </button>
            </div>
          </div>

          <div v-else class="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-xs font-medium text-slate-500">
            This ticket is closed. The student can still read the thread.
          </div>
        </template>

        <!-- Empty state (desktop only — on a phone the list fills this slot) -->
        <div v-else class="hidden h-full flex-col items-center justify-center p-8 text-center lg:flex">
          <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-3xl shadow-inner">
            <i class="fa-solid fa-pen-nib text-slate-300"></i>
          </div>
          <h3 class="text-lg font-extrabold text-slate-800">Pick a thread</h3>
          <p class="mt-1 max-w-xs text-sm font-medium text-slate-500">
            Choose a submission from the queue to read the passage and send the correction back.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import AppImage from '../../components/AppImage.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

// Most overdue first — the queue order the correction deadline implies. Closed
// tickets sink to the bottom rather than disappearing, so a reply can still be
// re-read after it is sent.
const sortedTasks = computed(() =>
  [...teacher.writingTasks].sort((a, b) => {
    const closed = (t) => (t.state === 'Complete' ? 1 : 0);
    return closed(a) - closed(b) || a.dueInHours - b.dueInHours;
  })
);

const openCount = computed(() => teacher.writingTasks.filter((t) => t.state !== 'Complete').length);
const overdueCount = computed(
  () => teacher.writingTasks.filter((t) => t.state !== 'Complete' && t.dueInHours < 0).length
);

// Desktop opens the first thread so the pane is never blank on arrival; the
// phone layout starts on the list, because there the thread would cover it.
const activeId = ref(
  typeof window !== 'undefined' && window.innerWidth >= 1024 ? sortedTasks.value[0]?.id ?? null : null
);
const activeTask = computed(() => teacher.writingTasks.find((t) => t.id === activeId.value) ?? null);

/** A thread needs the instructor when the student spoke last. */
const awaitingReply = (task) =>
  task.state !== 'Complete' && task.messages[task.messages.length - 1]?.from === 'student';

const reply = ref('');
const correction = ref('');
const showCorrection = ref(false);
const scrollEl = ref(null);

const canSend = computed(() => Boolean(reply.value.trim() || correction.value.trim()));

const toBottom = () => {
  nextTick(() => {
    const el = scrollEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

// Switching threads must not carry a half-typed reply into someone else's.
watch(activeId, () => {
  reply.value = '';
  correction.value = '';
  showCorrection.value = false;
  toBottom();
});

const send = () => {
  if (!canSend.value || !activeTask.value) return;
  teacher.sendWritingReply(activeTask.value.id, { body: reply.value, correction: correction.value });
  reply.value = '';
  correction.value = '';
  showCorrection.value = false;
  toBottom();
};

const urgencyClass = (task) => {
  if (task.state === 'Complete') return 'bg-emerald-100 text-emerald-700';
  return {
    danger: 'bg-rose-100 text-rose-700',
    warning: 'bg-amber-100 text-amber-800',
    normal: 'bg-slate-100 text-slate-600',
  }[task.urgency] ?? 'bg-slate-100 text-slate-600';
};

const dueLabel = (task) => {
  if (task.state === 'Complete') return 'closed';
  return task.dueInHours < 0 ? `${Math.abs(task.dueInHours)}h overdue` : `due in ${task.dueInHours}h`;
};
</script>
