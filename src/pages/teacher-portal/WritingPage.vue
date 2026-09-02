<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Writing</h1>
        <p class="mt-0.5 text-sm text-slate-500">Submissions assigned to you, oldest deadline first.</p>
      </div>
      <span
        v-if="overdueCount"
        class="shrink-0 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800"
      >
        {{ overdueCount }} overdue
      </span>
    </header>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="task in sortedTasks"
        :key="task.id"
        class="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-brighture-gold/50 hover:shadow-md"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider" :class="urgencyClass(task.urgency)">
            {{ task.state }}
          </span>
          <span class="text-[11px] font-bold" :class="task.dueInHours < 0 ? 'text-rose-600' : 'text-slate-400'">
            {{ dueLabel(task) }}
          </span>
        </div>

        <p class="mt-2 text-sm font-bold text-slate-900">{{ task.title }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ task.studentName }} · {{ task.words }} words</p>

        <dl class="mt-3 space-y-1 border-t border-slate-100 pt-3 text-[11px]">
          <div class="flex justify-between gap-2"><dt class="text-slate-400">Submitted</dt><dd class="font-bold text-slate-700">{{ task.submittedManila }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-slate-400">Tokyo</dt><dd class="font-bold text-slate-700">{{ task.submittedTokyo }}</dd></div>
        </dl>

        <button
          type="button"
          @click="openTask = task"
          class="mt-4 w-full rounded-xl bg-brighture-gold px-3 py-2.5 text-xs font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95"
        >
          Edit / Respond
        </button>
      </article>
    </div>

    <p v-if="!sortedTasks.length" class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      No writing assigned to you right now.
    </p>

    <!-- Correction workspace -->
    <Transition
      enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
    >
      <div
        v-if="openTask"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="openTask = null"
      >
        <div
          class="relative w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-3xl max-h-[92vh] supports-[max-height:100dvh]:max-h-[92dvh]"
          @click.stop
        >
          <div class="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
            <div class="min-w-0">
              <h3 class="truncate text-lg font-extrabold text-slate-900">{{ openTask.title }}</h3>
              <p class="truncate text-xs text-slate-500">{{ openTask.studentName }} · submitted {{ openTask.submittedManila }}</p>
            </div>
            <button
              type="button"
              @click="openTask = null"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close"
            >
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <div class="space-y-4 p-5">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student's submission</p>
              <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{{ sampleBody }}</p>
            </div>

            <div>
              <label for="wr-correction" class="mb-1.5 block text-xs font-bold text-slate-700">Corrected version</label>
              <textarea
                id="wr-correction"
                v-model="correction"
                rows="6"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,205,0,0.15)]"
                placeholder="Paste the corrected text here."
              ></textarea>
            </div>

            <div>
              <label for="wr-comment" class="mb-1.5 block text-xs font-bold text-slate-700">Comment to the student</label>
              <textarea
                id="wr-comment"
                v-model="comment"
                rows="4"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,205,0,0.15)]"
                placeholder="Explain the main patterns to work on."
              ></textarea>
            </div>
          </div>

          <div class="sticky bottom-0 flex gap-2 border-t border-slate-100 bg-white/95 p-4 backdrop-blur">
            <button
              type="button"
              @click="openTask = null"
              class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              Save draft
            </button>
            <button
              type="button"
              @click="send"
              :disabled="!correction.trim()"
              class="flex-1 rounded-2xl bg-brighture-gold px-4 py-3 text-sm font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40"
            >
              Send to student
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

// Most overdue first — the queue order the correction deadline actually implies.
const sortedTasks = computed(() =>
  [...teacher.writingTasks].sort((a, b) => a.dueInHours - b.dueInHours)
);

const overdueCount = computed(() => teacher.writingTasks.filter((t) => t.dueInHours < 0).length);

const openTask = ref(null);
const correction = ref('');
const comment = ref('');

watch(openTask, () => { correction.value = ''; comment.value = ''; });

const sampleBody = `Dear Mr. Tanaka,

I am writing to apologize about the delay of our shipment. We had a problem in the factory last week, so the products could not be finished on time.

We will send the products by next Friday. I am very sorry for the inconvenience.`;

const send = () => {
  if (!correction.value.trim()) return;
  const index = teacher.writingTasks.findIndex((task) => task.id === openTask.value.id);
  if (index !== -1) teacher.writingTasks.splice(index, 1);
  openTask.value = null;
};

const urgencyClass = (urgency) => ({
  danger: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-800',
  normal: 'bg-slate-100 text-slate-600',
}[urgency] ?? 'bg-slate-100 text-slate-600');

const dueLabel = (task) =>
  task.dueInHours < 0 ? `${Math.abs(task.dueInHours)}h overdue` : `due in ${task.dueInHours}h`;
</script>
