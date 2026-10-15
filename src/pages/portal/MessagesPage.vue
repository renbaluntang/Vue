<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

    <div class="min-w-0">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
      <p class="text-slate-500 font-medium mt-1">Ask your instructors questions between lessons.</p>
    </div>

    <!-- Two columns on desktop; on a phone the list and the thread take turns. -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:h-[calc(100vh-15rem)] lg:min-h-[34rem]">

      <!-- ===================== Instructor list ===================== -->
      <div
        class="lg:col-span-4 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        :class="activeId ? 'hidden lg:flex' : 'flex'"
      >
        <div class="shrink-0 space-y-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-sm font-extrabold text-slate-800">Your instructors</h2>
            <span
              v-if="totalUnread"
              class="rounded-full bg-brighture-gold px-2 py-0.5 text-[10px] font-black text-brighture-ink tabular-nums"
            >
              {{ totalUnread }} unread
            </span>
          </div>
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <label for="msg-search" class="sr-only">Search instructors and messages</label>
            <input
              id="msg-search"
              v-model="search"
              type="search"
              placeholder="Search instructors or messages"
              class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all focus:border-brighture-amber focus:ring-4 focus:ring-brighture-gold/20"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-1.5">
          <button
            v-for="c in filteredContacts"
            :key="c.teacherId"
            type="button"
            @click="openThread(c.teacherId)"
            class="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition"
            :class="activeId === c.teacherId
              ? 'bg-brighture-cream border-brighture-gold/30 shadow-inner'
              : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'"
          >
            <AppImage
              :src="c.photo"
              :alt="c.name"
              class="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <p class="truncate text-sm" :class="c.unread ? 'font-black text-slate-900' : 'font-bold text-slate-800'">
                  {{ c.name }}
                </p>
                <span v-if="c.last" class="shrink-0 text-[11px] font-bold text-slate-400 tabular-nums">
                  {{ relativeLabel(c.last.at, school.now) }}
                </span>
              </div>
              <div class="mt-0.5 flex items-center gap-2">
                <p
                  class="min-w-0 flex-1 truncate text-xs"
                  :class="c.unread ? 'font-bold text-slate-700' : 'font-medium text-slate-500'"
                >
                  <template v-if="c.last">
                    <span v-if="c.last.from === 'student'" class="text-slate-400">You: </span>
                    <i v-if="c.last.attachment && !c.last.text" class="fa-solid fa-paperclip mr-1 text-slate-400"></i>{{ c.last.text || c.last.attachment?.name }}
                  </template>
                  <span v-else class="italic text-slate-400">No messages yet — say hello</span>
                </p>
                <span
                  v-if="c.unread"
                  class="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-brighture-gold px-1.5 text-[10px] font-black text-brighture-ink tabular-nums"
                  :aria-label="`${c.unread} unread`"
                >{{ c.unread }}</span>
              </div>
            </div>
          </button>

          <p
            v-if="!contacts.length"
            class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
          >
            No instructors yet. Once you book a lesson, you can message your instructor here.
          </p>
          <p
            v-else-if="!filteredContacts.length"
            class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
          >
            Nothing matches “{{ search }}”.
          </p>
        </div>
      </div>

      <!-- ===================== Conversation ===================== -->
      <div
        class="lg:col-span-8 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm h-[75dvh] lg:h-auto"
        :class="!activeId ? 'hidden lg:flex' : 'flex'"
      >
        <template v-if="activeTeacher">
          <div class="z-10 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3.5 shadow-sm sm:px-5">
            <button
              type="button"
              @click="closeThread"
              class="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 lg:hidden"
              aria-label="Back to instructors"
            >
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            </button>

            <AppImage
              :src="activeTeacher.photo"
              :alt="activeTeacher.name"
              eager
              class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
            />

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-base font-bold text-slate-900 sm:text-lg">{{ activeTeacher.name }}</h2>
              <p class="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                <template v-if="nextLesson">
                  <i class="fa-solid fa-calendar-check mr-1 text-indigo-500"></i>
                  Next lesson: <span class="font-bold text-slate-700">{{ dateIn(nextLesson.start, TOKYO) }} · {{ clockIn(nextLesson.start, TOKYO) }} JST</span>
                  <span class="hidden sm:inline"> · {{ nextLesson.subject }}</span>
                </template>
                <template v-else>No upcoming lesson booked with this instructor</template>
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div ref="scrollEl" class="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
            <div
              v-if="!activeMessages.length"
              class="flex h-full flex-col items-center justify-center p-6 text-center"
            >
              <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-white text-2xl shadow-inner"><i class="fa-solid fa-hand text-amber-500" aria-hidden="true"></i></div>
              <h3 class="text-lg font-bold text-slate-800">Start the conversation</h3>
              <p class="mt-1 max-w-xs text-sm font-medium text-slate-500">
                Send {{ firstName(activeTeacher.name) }} a question about your lessons, homework or materials.
              </p>
            </div>

            <template v-for="(msg, i) in activeMessages" :key="msg.id">
              <!-- A day divider whenever the Tokyo date changes. -->
              <div v-if="dayChanged(i)" class="flex items-center gap-3 py-1">
                <span class="h-px flex-1 bg-slate-200"></span>
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{ dateIn(msg.at, TOKYO) }}</span>
                <span class="h-px flex-1 bg-slate-200"></span>
              </div>

              <div
                class="group flex max-w-[92%] gap-2.5 sm:max-w-[80%] sm:gap-3"
                :class="msg.from === 'student' ? 'ml-auto flex-row-reverse' : ''"
              >
                <AppImage
                  :src="msg.from === 'student' ? me.photo : activeTeacher.photo"
                  :alt="msg.from === 'student' ? me.name : activeTeacher.name"
                  class="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm"
                />

                <div class="min-w-0 space-y-1" :class="msg.from === 'student' ? 'text-right' : 'text-left'">
                  <div
                    class="flex items-center gap-2 text-xs font-semibold text-slate-400"
                    :class="msg.from === 'student' ? 'flex-row-reverse' : ''"
                  >
                    <span class="text-slate-600">{{ msg.from === 'student' ? 'You' : firstName(activeTeacher.name) }}</span>
                    <span class="tabular-nums">{{ clockIn(msg.at, TOKYO) }}</span>
                  </div>

                  <div class="relative flex items-end gap-1.5" :class="msg.from === 'student' ? 'flex-row-reverse' : ''">
                    <div class="min-w-0 space-y-2">
                      <div
                        v-if="msg.text"
                        class="whitespace-pre-wrap break-words p-3.5 text-left text-sm leading-relaxed shadow-sm"
                        :class="msg.from === 'student'
                          ? 'rounded-2xl rounded-tr-sm bg-brighture-gold text-brighture-ink'
                          : 'rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-800'"
                      >{{ msg.text }}</div>

                      <!-- Shared file: shown for reference only, the prototype
                           has nothing to download. -->
                      <div
                        v-if="msg.attachment"
                        class="flex w-64 max-w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm"
                      >
                        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                          <i :class="msg.attachment.icon || 'fa-solid fa-file text-slate-500'"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-xs font-black text-slate-800">{{ msg.attachment.name }}</p>
                          <p class="text-[10px] font-medium text-slate-500">
                            {{ [msg.attachment.size, msg.attachment.type].filter(Boolean).join(' · ') }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Quick reactions: revealed on hover or keyboard focus. -->
                    <div
                      class="flex shrink-0 gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                    >
                      <button
                        v-for="emoji in REACTIONS"
                        :key="emoji"
                        type="button"
                        @click="react(msg, emoji)"
                        class="flex h-7 w-7 items-center justify-center rounded-full text-sm transition hover:scale-110 hover:bg-slate-100"
                        :class="msg.reactions?.includes(emoji) ? 'bg-brighture-cream' : ''"
                        :aria-label="`${msg.reactions?.includes(emoji) ? 'Remove' : 'Add'} ${reactionLabel(emoji)} reaction`"
                        :aria-pressed="msg.reactions?.includes(emoji) ? 'true' : 'false'"
                        :title="reactionLabel(emoji)"
                      ><i :class="reactionIcon(emoji)" aria-hidden="true"></i></button>
                    </div>
                  </div>

                  <div
                    v-if="msg.reactions?.length"
                    class="flex gap-1"
                    :class="msg.from === 'student' ? 'justify-end' : 'justify-start'"
                  >
                    <button
                      v-for="emoji in msg.reactions"
                      :key="emoji"
                      type="button"
                      @click="react(msg, emoji)"
                      class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs shadow-xs transition hover:border-brighture-gold/50"
                      :aria-label="`Remove ${reactionLabel(emoji)} reaction`"
                    ><i :class="reactionIcon(emoji)" aria-hidden="true"></i></button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Composer -->
          <div class="shrink-0 border-t border-slate-200 bg-white p-3.5 sm:p-5">
            <div class="relative">
              <label for="msg-compose" class="sr-only">Message {{ activeTeacher.name }}</label>
              <textarea
                id="msg-compose"
                ref="composerEl"
                v-model="draft"
                rows="2"
                :placeholder="`Message ${firstName(activeTeacher.name)}…`"
                @keydown.enter="onEnter"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-14 text-sm text-slate-800 outline-none transition-all focus:border-brighture-amber focus:bg-white focus:ring-4 focus:ring-brighture-gold/20"
              ></textarea>
              <button
                type="button"
                @click="send"
                :disabled="!draft.trim()"
                class="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brighture-gold text-brighture-ink shadow-md transition-all hover:bg-brighture-gold-deep hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send message"
              >
                <i class="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </div>
            <p class="mt-1.5 px-1 text-[11px] font-medium text-slate-400">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </template>

        <!-- EMPTY STATE (desktop only — on a phone the list fills this slot) -->
        <div v-else class="hidden h-full flex-col items-center justify-center p-8 text-center lg:flex">
          <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-3xl shadow-inner">
            <i class="fa-solid fa-comments text-sky-600" aria-hidden="true"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800">Select an instructor</h3>
          <p class="mt-1 max-w-xs font-medium text-slate-500">
            Choose a conversation from the left to read it or send a message.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppImage from '../../components/AppImage.vue';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { CURRENT_STUDENT_ID } from '../../lib/schoolSeed';
import { TOKYO, clockIn, dateIn, relativeLabel } from '../../lib/schoolTime';

const school = useSchoolStore();
const route = useRoute();
const router = useRouter();

const ME = CURRENT_STUDENT_ID;
const REACTIONS = ['👍', '❤️'];
// Reactions are stored as emoji in the shared store (the teacher portal reads
// the same values), so they are only drawn as icons here.
const REACTION_ICONS = {
  '👍': { icon: 'fa-solid fa-thumbs-up text-sky-600', label: 'Like' },
  '❤️': { icon: 'fa-solid fa-heart text-rose-500', label: 'Love' },
};
const reactionIcon = (emoji) => REACTION_ICONS[emoji]?.icon ?? 'fa-solid fa-face-smile text-amber-500';
const reactionLabel = (emoji) => REACTION_ICONS[emoji]?.label ?? 'this';

const me = computed(() => school.student(ME));
const firstName = (name) => String(name ?? '').split(' ')[0];

/**
 * One row per instructor: everyone the student already has a thread with,
 * plus everyone they take lessons from, so a first message is one tap away.
 * The thread itself is only created when that first message is sent.
 */
const contacts = computed(() => {
  const threads = school.threadsForStudent(ME);
  const ids = new Set(threads.map((t) => t.teacherId));
  school.lessonsForStudent(ME).forEach((l) => { if (l.teacherId) ids.add(l.teacherId); });

  return [...ids].map((teacherId) => {
    const thread = threads.find((t) => t.teacherId === teacherId) ?? null;
    const t = school.teacher(teacherId);
    return {
      teacherId,
      name: t.name,
      photo: t.photo,
      thread,
      last: thread?.messages[thread.messages.length - 1] ?? null,
      unread: thread ? school.unreadIn(thread, 'student') : 0,
    };
  }).sort((a, b) => {
    // Latest conversation first; instructors with no messages yet go last.
    if (a.last && b.last) return b.last.at.localeCompare(a.last.at);
    if (a.last) return -1;
    if (b.last) return 1;
    return a.name.localeCompare(b.name);
  });
});

const totalUnread = computed(() => contacts.value.reduce((sum, c) => sum + c.unread, 0));

const search = ref('');
const filteredContacts = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return contacts.value;
  return contacts.value.filter((c) =>
    c.name.toLowerCase().includes(q)
    || c.thread?.messages.some((m) => m.text?.toLowerCase().includes(q)));
});

// ── Which thread is open ─────────────────────────────────────────────────
// `?teacher=<id>` wins; otherwise desktop opens the latest conversation so the
// pane is never blank, and a phone starts on the list.
const queryTeacher = () => {
  const id = Number(route.query.teacher);
  return Number.isFinite(id) && id > 0 ? id : null;
};
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024;

const activeId = ref(queryTeacher() ?? (isDesktop() ? contacts.value[0]?.teacherId ?? null : null));

watch(() => route.query.teacher, () => {
  const id = queryTeacher();
  if (id) activeId.value = id;
});

const openThread = (teacherId) => {
  activeId.value = teacherId;
  if (route.query.teacher) router.replace({ query: { ...route.query, teacher: undefined } });
};
const closeThread = () => {
  activeId.value = null;
  if (route.query.teacher) router.replace({ query: { ...route.query, teacher: undefined } });
};

const activeTeacher = computed(() => (activeId.value ? school.teacher(activeId.value) : null));
const activeThread = computed(() =>
  school.threadsForStudent(ME).find((t) => t.teacherId === activeId.value) ?? null);
const activeMessages = computed(() => activeThread.value?.messages ?? []);

const nextLesson = computed(() => {
  if (!activeId.value) return null;
  return school.lessonsForStudent(ME).find((l) =>
    l.teacherId === activeId.value && l.status === 'booked' && new Date(l.start).getTime() > school.now) ?? null;
});

const dayChanged = (i) => {
  if (i === 0) return true;
  const msgs = activeMessages.value;
  return dateIn(msgs[i].at, TOKYO) !== dateIn(msgs[i - 1].at, TOKYO);
};

// ── Read marks & scrolling ───────────────────────────────────────────────
const draft = ref('');
const scrollEl = ref(null);
const toBottom = () => {
  nextTick(() => {
    const el = scrollEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

// An open thread is a read thread — including replies that land while it is
// on screen (from the instructor portal in another tab). Only writes when
// something is actually unread, so it never echoes saves back and forth.
const markReadIfNeeded = () => {
  const t = activeThread.value;
  if (t && school.unreadIn(t, 'student') > 0) school.markThreadRead(ME, t.teacherId, 'student');
};

watch(
  () => [activeId.value, activeMessages.value.length],
  ([id], [prevId] = []) => {
    markReadIfNeeded();
    toBottom();
    // Switching threads must not carry a half-typed message into another one.
    if (id !== prevId) draft.value = '';
  },
  { immediate: true },
);

// ── Sending ──────────────────────────────────────────────────────────────
const composerEl = ref(null);

const send = () => {
  const text = draft.value.trim();
  if (!text || !activeId.value) return;
  school.sendMessage(ME, activeId.value, { from: 'student', text });
  draft.value = '';
  toBottom();
  nextTick(() => composerEl.value?.focus());
};

// Enter sends, Shift+Enter is a newline. Enter while a Japanese IME is still
// composing only confirms the conversion, so it must not send.
const onEnter = (e) => {
  if (e.shiftKey || e.isComposing || e.keyCode === 229) return;
  e.preventDefault();
  send();
};

const react = (msg, emoji) => {
  if (!activeId.value) return;
  school.toggleReaction(ME, activeId.value, msg.id, emoji);
};
</script>
