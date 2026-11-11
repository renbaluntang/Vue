<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Writing Corrections</h1>
        <p class="text-slate-500 font-medium mt-1">Send a passage and your assessor corrects it, then answers your questions.</p>
      </div>
      <button
        v-if="!isCreatingNew"
        type="button"
        @click="startNew"
        :disabled="!canAfford"
        class="w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl border border-transparent bg-brighture-gold text-brighture-ink font-bold transition-colors hover:bg-brighture-gold-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        :title="canAfford ? '' : `You need ${user.WRITING_COST} points to submit`"
      >
        <i class="fa-solid fa-plus text-sm" aria-hidden="true"></i>
        New submission
        <span class="font-semibold text-brighture-ink/70 tabular-nums">· {{ user.WRITING_COST }} pts</span>
      </button>
    </div>

    <!-- Two columns on desktop; on a phone the list and the thread take turns. -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:h-[calc(100vh-15rem)] lg:min-h-[34rem]">

      <!-- ===================== Ticket list ===================== -->
      <div
        class="lg:col-span-4 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
        :class="activeId || isCreatingNew ? 'hidden lg:flex' : 'flex'"
      >
        <div class="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <h2 class="text-sm font-extrabold text-slate-800">Your passages</h2>
          <span class="text-xs font-semibold text-slate-500 tabular-nums">
            {{ user.openWritingCount }} open
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <button
            v-for="ticket in sortedTickets"
            :key="ticket.id"
            type="button"
            @click="openTicket(ticket.id)"
            class="relative w-full rounded-xl border p-4 text-left transition-colors"
            :class="activeId === ticket.id
              ? 'bg-slate-50 border-slate-200 before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-brighture-gold'
              : 'bg-white border-transparent hover:bg-slate-50'"
            :aria-current="activeId === ticket.id ? 'true' : undefined"
          >
            <div class="mb-2 flex items-start justify-between gap-2">
              <span
                class="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                :class="statusClass(ticket)"
              >
                {{ stateLabel(ticket) }}
              </span>
              <span class="shrink-0 text-xs font-medium text-slate-500 tabular-nums">{{ ticket.date }}</span>
            </div>

            <p class="mb-2 line-clamp-1 text-sm font-bold text-slate-900">{{ ticket.title }}</p>

            <div class="flex items-center gap-2">
              <AppImage
                v-if="ticket.teacherPhoto"
                :src="ticket.teacherPhoto"
                :alt="ticket.teacherName"
                class="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span
                v-else
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black text-slate-400"
                aria-hidden="true"
              >?</span>
              <span class="min-w-0 flex-1 truncate text-xs font-semibold text-slate-500">
                {{ ticket.teacherName || 'Waiting for an assessor' }}
              </span>
              <span
                v-if="hasNewReply(ticket)"
                class="shrink-0 rounded-full bg-brighture-ink px-2 py-0.5 text-[11px] font-semibold text-white"
              >New reply</span>
            </div>
          </button>

          <p
            v-if="!sortedTickets.length"
            class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
          >
            No submissions yet. Send your first passage to get it corrected.
          </p>
        </div>
      </div>

      <!-- ===================== Thread / new submission ===================== -->
      <div
        class="lg:col-span-8 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white h-[75dvh] lg:h-auto"
        :class="!activeId && !isCreatingNew ? 'hidden lg:flex' : 'flex'"
      >

        <!-- NEW SUBMISSION -->
        <div v-if="isCreatingNew" class="flex h-full flex-col animate-in fade-in zoom-in-95">
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:p-6">
            <div class="min-w-0">
              <h2 class="text-lg font-bold text-slate-900 sm:text-xl">New writing submission</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">
                Costs {{ user.WRITING_COST }} points · Max {{ WORD_CAP }} words · Balance
                <span class="font-bold text-slate-700 tabular-nums">{{ user.profile.pointsBalance }} pts</span>
              </p>
            </div>
            <button
              type="button"
              @click="isCreatingNew = false"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300"
              aria-label="Cancel submission"
            ><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
          </div>

          <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <div>
              <label for="wr-title" class="mb-2 block text-sm font-bold text-slate-700">Title</label>
              <input
                id="wr-title"
                v-model="newTitle"
                type="text"
                placeholder="e.g., Self Introduction Draft"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
              />
            </div>
            <div>
              <label for="wr-passage" class="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Passage</span>
                <span class="tabular-nums" :class="overCap ? 'text-red-600' : 'text-slate-500'">
                  {{ wordCount }} / {{ WORD_CAP }} words
                </span>
              </label>
              <textarea
                id="wr-passage"
                v-model="newBody"
                rows="10"
                placeholder="Write or paste your English text. Emoji are not accepted."
                class="w-full resize-none rounded-xl border border-slate-200 bg-white px-5 py-4 font-paper text-[17px] leading-[1.7] text-slate-900 outline-none transition-all placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
              ></textarea>
            </div>
          </div>

          <div class="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:p-6">
            <button
              type="button"
              @click="isCreatingNew = false"
              class="rounded-xl px-5 py-2.5 font-bold text-slate-500 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="submit"
              :disabled="overCap || wordCount === 0 || !canAfford"
              class="rounded-xl border border-transparent bg-brighture-gold px-5 py-2.5 font-bold text-brighture-ink transition-colors hover:bg-brighture-gold-deep disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              Submit passage
            </button>
          </div>
        </div>

        <!-- THREAD -->
        <template v-else-if="activeTicket">
          <div class="z-10 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-3.5 sm:px-5">
            <button
              type="button"
              @click="activeId = null"
              class="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 lg:hidden"
              aria-label="Back to your passages"
            >
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            </button>

            <AppImage
              v-if="activeTicket.teacherPhoto"
              :src="activeTicket.teacherPhoto"
              :alt="activeTicket.teacherName"
              eager
              class="hidden h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200 sm:block"
            />

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-base font-bold text-slate-900 sm:text-lg">{{ activeTicket.title }}</h2>
              <div class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs">
                <span
                  class="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  :class="statusClass(activeTicket)"
                >
                  {{ stateLabel(activeTicket) }}
                </span>
                <span class="font-medium text-slate-500">
                  {{ activeTicket.teacherName ? `Assessor ${activeTicket.teacherName}` : 'No assessor yet' }}
                </span>
              </div>
            </div>

            <button
              v-if="activeTicket.status !== 'Complete'"
              type="button"
              @click="user.finishWritingTicket(activeTicket.id)"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] sm:px-4"
            >
              <i class="fa-solid fa-check text-[11px] text-emerald-600" aria-hidden="true"></i>
              <span class="hidden sm:inline">Mark as finished</span>
              <span class="sm:hidden">Finish</span>
            </button>
            <span
              v-else
              class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"
            >
              <i class="fa-solid fa-circle-check text-[11px]" aria-hidden="true"></i>
              Complete
            </span>
          </div>

          <!-- The thread. The student's passage and any corrected version are
               set as pages in a reading serif; everything else is conversation
               around them, kept small and quiet. -->
          <div ref="scrollEl" class="flex-1 space-y-6 overflow-y-auto bg-[#F3F4F6] px-3 py-5 sm:px-6 sm:py-6">
            <template v-for="(msg, index) in activeTicket.messages" :key="msg.id">
              <!-- The passage itself: the first message is always it. -->
              <article
                v-if="index === 0 && msg.from === 'student'"
                class="mx-auto max-w-[44rem] rounded-xl border border-slate-200 bg-white px-5 py-5 sm:px-10 sm:py-8"
                aria-label="Your passage"
              >
                <header class="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-100 pb-3">
                  <h3 class="m-0 text-sm font-bold text-slate-900">Your passage</h3>
                  <p class="m-0 flex gap-3 text-xs font-medium text-slate-500 tabular-nums">
                    <span>{{ activeTicket.words }} words</span>
                    <span>Sent {{ msg.time }}</span>
                  </p>
                </header>
                <p class="m-0 whitespace-pre-wrap font-paper text-[17px] leading-[1.7] text-slate-900">{{ msg.body }}</p>
              </article>

              <!-- A correction: the assessor's version drawn over the student's
                   words, with their note to the student underneath. -->
              <article
                v-else-if="msg.correction"
                class="mx-auto max-w-[44rem] overflow-hidden rounded-xl border border-slate-200 bg-white"
                :aria-label="`Correction from ${activeTicket.teacherName}`"
              >
                <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 sm:px-10">
                  <div class="flex min-w-0 items-center gap-2.5">
                    <AppImage
                      :src="activeTicket.teacherPhoto"
                      :alt="activeTicket.teacherName"
                      class="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <p class="m-0 min-w-0 text-sm">
                      <span class="font-bold text-slate-900">Corrected by {{ activeTicket.teacherName }}</span>
                      <span class="ml-2 text-xs font-medium text-slate-500 tabular-nums">{{ msg.time }}</span>
                    </p>
                  </div>
                  <!-- Changes shows the edits on the student's words; Clean copy
                       is the finished text to copy into the real email. -->
                  <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold" role="group" aria-label="How to show the correction">
                    <button
                      v-for="mode in ['changes', 'clean']"
                      :key="mode"
                      type="button"
                      @click="viewMode[msg.id] = mode"
                      :aria-pressed="modeFor(msg) === mode"
                      class="rounded-md px-2.5 py-1 transition-colors"
                      :class="modeFor(msg) === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                    >{{ mode === 'changes' ? `Changes (${changesIn(msg)})` : 'Clean copy' }}</button>
                  </div>
                </header>

                <div v-if="modeFor(msg) === 'changes'" class="px-5 py-5 sm:px-10 sm:py-7">
                  <CorrectionMarkup :original="activeTicket.messages[0]?.body" :corrected="msg.correction" />
                </div>
                <p
                  v-else
                  class="m-0 whitespace-pre-wrap px-5 py-5 font-paper text-[17px] leading-[1.7] text-slate-900 sm:px-10 sm:py-7"
                >{{ msg.correction }}</p>

                <div v-if="msg.body" class="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-10">
                  <p class="m-0 mb-1 text-xs font-semibold text-slate-500">Note from {{ activeTicket.teacherName }}</p>
                  <p class="m-0 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{{ msg.body }}</p>
                </div>
              </article>

              <!-- Everything else is conversation. -->
              <div
                v-else
                class="mx-auto flex max-w-[44rem] gap-2.5"
                :class="msg.from === 'student' ? 'flex-row-reverse' : ''"
              >
                <AppImage
                  :src="msg.from === 'student' ? user.profile.photo : activeTicket.teacherPhoto"
                  :alt="msg.from === 'student' ? user.fullName : activeTicket.teacherName"
                  class="mt-5 h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div class="min-w-0 max-w-[85%] space-y-1" :class="msg.from === 'student' ? 'text-right' : 'text-left'">
                  <p
                    class="m-0 flex items-center gap-2 text-xs font-medium text-slate-500"
                    :class="msg.from === 'student' ? 'flex-row-reverse' : ''"
                  >
                    <span class="font-semibold text-slate-700">{{ msg.from === 'student' ? 'You' : activeTicket.teacherName }}</span>
                    <span class="tabular-nums">{{ msg.time }}</span>
                  </p>
                  <p
                    class="m-0 whitespace-pre-wrap px-3.5 py-2.5 text-left text-sm leading-relaxed"
                    :class="msg.from === 'student'
                      ? 'rounded-2xl rounded-tr-md bg-slate-200/70 text-slate-900'
                      : 'rounded-2xl rounded-tl-md border border-slate-200 bg-white text-slate-800'"
                  >{{ msg.body }}</p>
                </div>
              </div>
            </template>

            <!-- Before any correction arrives, say what happens next. -->
            <p
              v-if="awaitingCorrection"
              class="mx-auto max-w-[44rem] text-center text-xs font-medium text-slate-500"
            >
              {{ activeTicket.teacherName
                ? `${activeTicket.teacherName} is correcting your passage. The marked-up version will appear here.`
                : 'An assessor will pick up your passage soon. The marked-up version will appear here.' }}
            </p>
          </div>

          <!-- Reply box -->
          <div v-if="canReply" class="shrink-0 border-t border-slate-200 bg-white p-3.5 sm:p-5">
            <div class="mb-2 flex items-center justify-between gap-2 px-1">
              <span class="text-xs font-semibold text-slate-600">Reply to your assessor</span>
              <span
                class="text-xs font-semibold tabular-nums"
                :class="activeTicket.remainingSends === 1 ? 'text-brighture-bronze' : 'text-slate-500'"
              >
                {{ activeTicket.remainingSends }} {{ activeTicket.remainingSends === 1 ? 'reply' : 'replies' }} left
              </span>
            </div>
            <div class="relative">
              <label for="wr-reply" class="sr-only">Reply to your assessor</label>
              <textarea
                id="wr-reply"
                v-model="reply"
                rows="3"
                placeholder="Ask a follow-up question or reply"
                @keydown.enter.meta.prevent="send"
                @keydown.enter.ctrl.prevent="send"
                class="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-14 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
              ></textarea>
              <button
                type="button"
                @click="send"
                :disabled="!reply.trim()"
                class="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brighture-gold text-brighture-ink transition-colors hover:bg-brighture-gold-deep active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                aria-label="Send reply"
              >
                <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div
            v-else
            class="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-xs font-medium text-slate-500"
          >
            {{ activeTicket.status === 'Complete'
              ? 'This ticket is finished. You can still read the whole thread.'
              : 'No sends left on this ticket. Start a new submission to ask more.' }}
          </div>
        </template>

        <!-- EMPTY STATE (desktop only — on a phone the list fills this slot) -->
        <div v-else class="hidden h-full flex-col items-center justify-center p-8 text-center lg:flex">
          <i class="fa-regular fa-file-lines mb-3 text-3xl text-slate-300" aria-hidden="true"></i>
          <h3 class="text-lg font-bold text-slate-800">Choose a passage</h3>
          <p class="mt-1 max-w-xs text-sm font-medium text-slate-500">
            Open one on the left to read its correction, or send a new one.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import AppImage from '../../components/AppImage.vue';
import { useUserStore } from '../../stores/useUserStore';
import { diffWords, changeCount } from '@/lib/wordDiff';
import CorrectionMarkup from '../../components/CorrectionMarkup.vue';

const user = useUserStore();

const WORD_CAP = 250;

// Open tickets first, then closed ones — a finished ticket stays readable
// rather than dropping off the list.
const sortedTickets = computed(() =>
  [...user.writingTickets].sort((a, b) => {
    const closed = (t) => (t.status === 'Complete' ? 1 : 0);
    return closed(a) - closed(b);
  })
);

/** A thread needs the student's eyes when the assessor spoke last. */
const hasNewReply = (ticket) =>
  ticket.status !== 'Complete' && ticket.messages[ticket.messages.length - 1]?.from === 'teacher';

// Desktop opens the first thread so the pane is never blank on arrival; the
// phone layout starts on the list, because there the thread would cover it.
const activeId = ref(
  typeof window !== 'undefined' && window.innerWidth >= 1024 ? sortedTickets.value[0]?.id ?? null : null
);
const activeTicket = computed(() => user.writingTickets.find((t) => t.id === activeId.value) ?? null);

const isCreatingNew = ref(false);
const newTitle = ref('');
const newBody = ref('');
const reply = ref('');
const scrollEl = ref(null);

const wordCount = computed(() => newBody.value.trim().split(/\s+/).filter(Boolean).length);
const overCap = computed(() => wordCount.value > WORD_CAP);
const canAfford = computed(() => user.profile.pointsBalance >= user.WRITING_COST);
const canReply = computed(
  () => activeTicket.value?.status !== 'Complete' && (activeTicket.value?.remainingSends ?? 0) > 0
);

const toBottom = () => {
  nextTick(() => {
    const el = scrollEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

const openTicket = (id) => {
  activeId.value = id;
  isCreatingNew.value = false;
};

const startNew = () => {
  isCreatingNew.value = true;
  activeId.value = null;
};

// Switching threads must not carry a half-typed reply into another one.
watch(activeId, () => {
  reply.value = '';
  toBottom();
});

const send = () => {
  if (!reply.value.trim() || !activeTicket.value) return;
  user.sendWritingReply(activeTicket.value.id, reply.value);
  reply.value = '';
  toBottom();
};

const submit = () => {
  if (overCap.value || wordCount.value === 0) return;
  const ticket = user.submitWriting({ title: newTitle.value, body: newBody.value });
  if (!ticket) return;
  newTitle.value = '';
  newBody.value = '';
  isCreatingNew.value = false;
  openTicket(ticket.id);
};

const isCorrected = (ticket) => ticket.messages.some((m) => m.correction);

/** Where a ticket stands, in the student's terms rather than a workflow status. */
const stateLabel = (ticket) => {
  if (ticket.status === 'Complete') return 'Finished';
  if (isCorrected(ticket)) return 'Corrected';
  return ticket.teacherName ? 'Being corrected' : 'Waiting for an assessor';
};
const statusClass = (ticket) => {
  if (ticket.status === 'Complete') return 'bg-slate-100 text-slate-600';
  if (isCorrected(ticket)) return 'bg-[#0F766E]/10 text-[#0F766E]';
  return 'bg-amber-50 text-brighture-bronze';
};

const awaitingCorrection = computed(() =>
  !!activeTicket.value && activeTicket.value.status !== 'Complete' && !isCorrected(activeTicket.value));

/* Each correction opens on its changes; the student can flip one to a clean
   copy without affecting the others. */
const viewMode = ref({});
const modeFor = (msg) => viewMode.value[msg.id] ?? 'changes';

// The markup is worked out once per correction and reused while the thread
// is open, since the passage and correction never change after sending.
const diffCache = new Map();
const segmentsFor = (msg) => {
  const passage = activeTicket.value?.messages[0]?.body ?? '';
  const key = `${activeTicket.value?.id}:${msg.id}`;
  if (!diffCache.has(key)) diffCache.set(key, diffWords(passage, msg.correction));
  return diffCache.get(key);
};
const changesIn = (msg) => changeCount(segmentsFor(msg));
</script>
