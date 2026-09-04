<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Writing Corrections</h1>
        <p class="text-slate-500 font-medium mt-1">Submit your English passages for professional review.</p>
      </div>
      <button
        v-if="!isCreatingNew"
        type="button"
        @click="startNew"
        :disabled="!canAfford"
        class="w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl border border-transparent bg-brighture-gold text-brighture-ink font-bold shadow-md transition-all hover:bg-brighture-gold-deep hover:shadow-lg sm:hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        :title="canAfford ? '' : `You need ${user.WRITING_COST} points to submit`"
      >
        <span>+</span> New Submission ({{ user.WRITING_COST }} pts)
      </button>
    </div>

    <!-- Two columns on desktop; on a phone the list and the thread take turns. -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:h-[calc(100vh-15rem)] lg:min-h-[34rem]">

      <!-- ===================== Ticket list ===================== -->
      <div
        class="lg:col-span-4 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        :class="activeId || isCreatingNew ? 'hidden lg:flex' : 'flex'"
      >
        <div class="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
          <h2 class="text-sm font-extrabold text-slate-800">Your tickets</h2>
          <span class="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-black text-slate-600 tabular-nums">
            {{ user.openWritingCount }} open
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <button
            v-for="ticket in sortedTickets"
            :key="ticket.id"
            type="button"
            @click="openTicket(ticket.id)"
            class="w-full rounded-2xl border p-4 text-left transition"
            :class="activeId === ticket.id
              ? 'bg-brighture-cream border-brighture-gold/30 shadow-inner'
              : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'"
          >
            <div class="mb-2 flex items-start justify-between gap-2">
              <span
                class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                :class="statusClass(ticket)"
              >
                {{ ticket.status }}
              </span>
              <span class="shrink-0 text-[11px] font-bold text-slate-400">{{ ticket.date }}</span>
            </div>

            <p class="mb-2 line-clamp-1 text-sm font-bold text-slate-800">{{ ticket.title }}</p>

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
                class="h-2 w-2 shrink-0 rounded-full bg-brighture-gold"
                title="New reply from your assessor"
              ></span>
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
        class="lg:col-span-8 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm h-[75dvh] lg:h-auto"
        :class="!activeId && !isCreatingNew ? 'hidden lg:flex' : 'flex'"
      >

        <!-- NEW SUBMISSION -->
        <div v-if="isCreatingNew" class="flex h-full flex-col animate-in fade-in zoom-in-95">
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:p-6">
            <div class="min-w-0">
              <h2 class="text-lg font-bold text-slate-900 sm:text-xl">New Writing Submission</h2>
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
            >✕</button>
          </div>

          <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <div>
              <label for="wr-title" class="mb-2 block text-sm font-bold text-slate-700">Title</label>
              <input
                id="wr-title"
                v-model="newTitle"
                type="text"
                placeholder="e.g., Self Introduction Draft"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-brighture-amber focus:ring-4 focus:ring-brighture-gold/20"
              />
            </div>
            <div>
              <label for="wr-passage" class="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Passage</span>
                <span class="tabular-nums" :class="overCap ? 'text-red-500' : 'text-slate-400'">
                  {{ wordCount }} / {{ WORD_CAP }} words
                </span>
              </label>
              <textarea
                id="wr-passage"
                v-model="newBody"
                rows="10"
                placeholder="Write or paste your English text here. No emojis allowed."
                class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-brighture-amber focus:ring-4 focus:ring-brighture-gold/20"
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
              class="rounded-xl border border-transparent bg-brighture-gold px-5 py-2.5 font-bold text-brighture-ink shadow-md transition hover:bg-brighture-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Passage
            </button>
          </div>
        </div>

        <!-- THREAD -->
        <template v-else-if="activeTicket">
          <div class="z-10 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3.5 shadow-sm sm:px-5">
            <button
              type="button"
              @click="activeId = null"
              class="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 lg:hidden"
              aria-label="Back to tickets"
            >
              ←
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
              <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  :class="statusClass(activeTicket)"
                >
                  {{ activeTicket.status }}
                </span>
                <span class="font-medium text-slate-500">
                  Assessor: {{ activeTicket.teacherName || 'pending' }}
                </span>
                <span class="text-slate-300">·</span>
                <span class="font-medium text-slate-500 tabular-nums">{{ activeTicket.words }} words</span>
              </div>
            </div>

            <button
              v-if="activeTicket.status !== 'Complete'"
              type="button"
              @click="user.finishWritingTicket(activeTicket.id)"
              class="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95 sm:px-4"
            >
              <span class="hidden sm:inline">Mark as Finished</span>
              <span class="sm:hidden">Finish</span>
            </button>
            <span
              v-else
              class="shrink-0 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800"
            >
              Complete
            </span>
          </div>

          <!-- Messages -->
          <div ref="scrollEl" class="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-4 sm:space-y-6 sm:p-6">
            <div
              v-for="msg in activeTicket.messages"
              :key="msg.id"
              class="flex max-w-[92%] gap-2.5 sm:max-w-[85%] sm:gap-4"
              :class="msg.from === 'student' ? 'ml-auto flex-row-reverse' : ''"
            >
              <AppImage
                :src="msg.from === 'student' ? user.profile.photo : activeTicket.teacherPhoto"
                :alt="msg.from === 'student' ? user.fullName : activeTicket.teacherName"
                class="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm sm:h-10 sm:w-10"
              />

              <div class="min-w-0 space-y-1" :class="msg.from === 'student' ? 'text-right' : 'text-left'">
                <div
                  class="flex items-center gap-2 text-xs font-semibold text-slate-400"
                  :class="msg.from === 'student' ? 'flex-row-reverse' : ''"
                >
                  <span class="text-slate-600">
                    {{ msg.from === 'student' ? 'You' : activeTicket.teacherName }}
                  </span>
                  <span class="tabular-nums">{{ msg.time }}</span>
                </div>

                <!-- The corrected passage rides with the message that explains
                     it, so the two never have to be matched up by hand. -->
                <div
                  v-if="msg.correction"
                  class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-left"
                >
                  <p class="text-[10px] font-black uppercase tracking-wider text-emerald-700">Corrected version</p>
                  <p class="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ msg.correction }}</p>
                </div>

                <div
                  v-if="msg.body"
                  class="whitespace-pre-wrap p-3.5 text-left text-sm leading-relaxed shadow-sm sm:p-4"
                  :class="msg.from === 'student'
                    ? 'rounded-2xl rounded-tr-sm bg-brighture-gold text-brighture-ink'
                    : 'rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-800'"
                >
                  {{ msg.body }}
                </div>
              </div>
            </div>
          </div>

          <!-- Reply box -->
          <div v-if="canReply" class="shrink-0 border-t border-slate-200 bg-white p-3.5 sm:p-5">
            <div class="mb-2 flex items-center justify-between gap-2 px-1">
              <span class="text-xs font-bold text-slate-500">Reply to your assessor</span>
              <span class="text-xs font-bold tabular-nums text-amber-500">
                {{ activeTicket.remainingSends }} sends remaining
              </span>
            </div>
            <div class="relative">
              <label for="wr-reply" class="sr-only">Reply to your assessor</label>
              <textarea
                id="wr-reply"
                v-model="reply"
                rows="3"
                placeholder="Type your reply or follow-up question here…"
                @keydown.enter.meta.prevent="send"
                @keydown.enter.ctrl.prevent="send"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-14 text-sm text-slate-800 outline-none transition-all focus:border-brighture-amber focus:bg-white focus:ring-4 focus:ring-brighture-gold/20"
              ></textarea>
              <button
                type="button"
                @click="send"
                :disabled="!reply.trim()"
                class="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brighture-gold text-brighture-ink shadow-md transition-all hover:bg-brighture-gold-deep hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send reply"
              >
                ↑
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
          <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-4xl shadow-inner">
            📬
          </div>
          <h3 class="text-xl font-bold text-slate-800">Select a ticket</h3>
          <p class="mt-1 max-w-xs font-medium text-slate-500">
            Choose a writing submission from the left to read the correction or reply.
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

const statusClass = (ticket) =>
  ticket.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';
</script>
