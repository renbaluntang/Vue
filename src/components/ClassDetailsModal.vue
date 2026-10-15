<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <!-- Pinned near the top, like the instructor's lesson panel, so the
         header does not jump when the body is taller or shorter. -->
    <div
      v-if="lesson"
      class="fixed inset-0 z-50 !m-0 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-2 pt-6 pb-2 backdrop-blur-xs sm:px-5 sm:pt-12 sm:pb-5"
      @click.self="$emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-details-title"
        class="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4.25rem)]"
        @click.stop
      >
        <!-- Dark header: who the lesson is with, and how soon -->
        <div class="shrink-0 bg-[#1e2738] px-5 pt-5 text-white sm:px-6 sm:pt-6">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3.5">
              <AppImage
                :src="lesson.teacherPhoto"
                :alt="lesson.teacherName"
                eager
                class="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm ring-2 ring-[#c5a059] sm:h-[72px] sm:w-[72px]"
              />
              <div class="min-w-0">
                <p class="m-0 text-[11px] font-black uppercase tracking-wider text-[#e6b95c]">
                  {{ lesson.isSubstitute ? 'Substitute instructor' : 'Your instructor' }}
                </p>
                <h2 id="class-details-title" class="m-0 mt-0.5 truncate text-xl font-black sm:text-2xl">
                  {{ lesson.teacherName }}
                </h2>
                <p class="m-0 mt-0.5 truncate text-xs font-medium text-slate-300">
                  Online lesson<template v-if="lesson.duration"> · {{ lesson.duration }} min</template>
                  <template v-if="startsIn"> · <span class="font-bold text-emerald-300">starts in {{ startsIn }}</span></template>
                </p>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <RouterLink
                v-if="lesson.teacherId"
                :to="{ path: '/messages', query: { teacher: lesson.teacherId } }"
                @click="$emit('close')"
                class="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-brighture-gold/20 px-3 py-1.5 text-xs font-black text-amber-300 transition hover:bg-brighture-gold/30 hover:text-amber-200"
                title="Message your instructor"
              >
                <i class="fa-solid fa-comments text-xs" aria-hidden="true"></i>
                <span class="hidden sm:inline">Message</span>
              </RouterLink>
              <button
                type="button"
                @click="$emit('close')"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-slate-200 transition hover:bg-white/25 hover:text-white"
                aria-label="Close"
              >
                <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <!-- Folder tabs, the same set of dividers as the instructor's panel:
               left tabs sit over right ones, the open tab comes to the front. -->
          <div
            class="tab-row -ml-5 mt-5 flex items-end overflow-x-auto sm:-ml-6"
            role="tablist"
            aria-label="Class detail sections"
          >
            <button
              v-for="(tab, i) in tabs"
              :key="tab.key"
              :ref="el => setTabEl(el, i)"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.key"
              :tabindex="activeTab === tab.key ? 0 : -1"
              @click="activeTab = tab.key"
              @keydown="onTabKey($event, i)"
              class="folder-tab relative flex h-9 w-[11.5rem] shrink-0 items-center justify-center gap-2 px-6 text-xs font-bold transition-colors outline-none focus:outline-none focus-visible:outline-none"
              :class="[
                i === 0 ? '' : '-ml-7',
                activeTab === tab.key ? 'bg-white text-slate-900' : 'bg-[var(--tab-bg)] text-slate-700 hover:bg-slate-100',
              ]"
              :style="{ zIndex: activeTab === tab.key ? tabs.length + 1 : tabs.length - i, '--tab-bg': tabShade(i) }"
            >
              <i :class="[tab.icon, activeTab === tab.key ? tab.iconOn : 'text-slate-500']" class="text-[11px]" aria-hidden="true"></i>
              <span class="whitespace-nowrap">{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-white p-5 sm:p-6">
          <!-- TAB: CLASS DETAILS -->
          <div v-if="activeTab === 'class'" class="space-y-4">
          <!-- Subject beside lesson time, as on the instructor's side -->
          <div class="grid grid-cols-12 items-stretch gap-3 sm:gap-4">
            <div class="col-span-12 flex flex-col justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-5">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
              <p class="m-0 mt-1 text-sm font-extrabold text-slate-900 sm:text-base">{{ lesson.subject }}</p>
              <p v-if="lesson.topic || lesson.classType" class="m-0 mt-1 text-xs font-semibold text-slate-500">
                {{ lesson.topic || lesson.classType }}
              </p>
            </div>

            <div class="col-span-12 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-7">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson time</p>
              <div class="mt-2 space-y-1.5 text-xs sm:text-sm">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 font-medium text-slate-500">Your time</span>
                  <span class="text-right font-bold text-slate-900">{{ yourTime }}</span>
                </div>
                <div v-if="teacherTime" class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 font-medium text-slate-500">Instructor</span>
                  <span class="text-right font-bold text-slate-900">{{ teacherTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- The message the instructor reads before the lesson -->
          <div v-if="lesson.note" class="rounded-2xl border border-[#faecd2] bg-[#fdfbf6] p-4">
            <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-[#996b27]">Your message to the instructor</p>
            <!-- One line in the source: pre-wrap would print any newline or
                 indent around the text, pushing the quotes onto their own lines. -->
            <p class="m-0 mt-1.5 whitespace-pre-wrap text-xs italic leading-relaxed text-slate-700 sm:text-sm">“{{ lesson.note.trim() }}”</p>
          </div>
          <button
            v-else
            type="button"
            @click="$emit('edit', lesson)"
            class="flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-left text-xs font-semibold text-slate-500 transition hover:border-amber-300 hover:bg-[#fdfbf6] hover:text-slate-700"
          >
            <i class="fa-regular fa-message text-slate-400" aria-hidden="true"></i>
            Tell your instructor what you want to focus on
            <i class="fa-solid fa-arrow-right ml-auto text-[10px]" aria-hidden="true"></i>
          </button>

          <!-- Before your class: what to look at first. Opening a material
               ticks it; the tick can also be set by hand. Progress is shared
               with the instructor's side. -->
          <div
            v-if="prep.total"
            ref="prepCard"
            class="rounded-2xl border p-4 transition-shadow"
            :class="[
              prepDone ? 'border-emerald-100 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40',
              highlightPrep ? 'ring-4 ring-amber-300/50' : '',
            ]"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider" :class="prepDone ? 'text-emerald-700' : 'text-[#996b27]'">
                <i :class="prepDone ? 'fa-solid fa-circle-check' : 'fa-solid fa-book-open'" class="mr-1" aria-hidden="true"></i>
                Before your class
              </p>
              <span class="text-[11px] font-bold tabular-nums" :class="prepDone ? 'text-emerald-700' : 'text-amber-800'">
                {{ prep.reviewed }} of {{ prep.total }} reviewed
              </span>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="prepDone ? 'bg-emerald-500' : 'bg-amber-400'"
                :style="{ width: `${(prep.reviewed / prep.total) * 100}%` }"
              ></div>
            </div>

            <ul class="m-0 mt-3 list-none space-y-2 p-0">
              <li
                v-for="item in prep.items"
                :key="item.id"
                class="flex items-center gap-3 rounded-xl border border-white bg-white p-2.5 shadow-2xs"
              >
                <button
                  type="button"
                  @click="toggleReviewed(item)"
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition"
                  :class="item.reviewedAt ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'"
                  :aria-label="item.reviewedAt ? `Mark ${item.title} as not reviewed` : `Mark ${item.title} as reviewed`"
                >
                  <i class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
                </button>
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1" :class="materialKind(item.kind).chip">
                  <i :class="materialKind(item.kind).icon" class="text-xs" aria-hidden="true"></i>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-xs font-bold sm:text-sm" :class="item.reviewedAt ? 'text-slate-500' : 'text-slate-900'">{{ item.title }}</span>
                  <span v-if="item.note" class="block truncate text-[11px] text-slate-500">{{ item.note }}</span>
                </span>
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                  @click="school.markMaterialReviewed(lesson.id, item.id, true)"
                  class="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Open <i class="fa-solid fa-arrow-up-right-from-square ml-0.5 text-[9px]" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
            <p class="m-0 mt-2 text-[11px] text-slate-500">
              {{ prep.chosen ? `Picked by ${firstName} for this lesson.` : 'Materials in this lesson’s subject.' }}
              {{ firstName }} can see what you’ve reviewed.
            </p>
          </div>

          <!-- Join. With materials still unopened, the first press asks once
               instead of joining; it never blocks. -->
          <div
            v-if="lesson.meetLink && showJoinPrompt && unreviewed"
            class="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            role="status"
          >
            <p class="m-0 text-sm font-bold text-amber-900">
              You haven’t opened {{ unreviewed }} material{{ unreviewed === 1 ? '' : 's' }} for this class.
            </p>
            <p class="m-0 mt-0.5 text-xs text-amber-800">A quick look now makes the lesson go further.</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="reviewNow"
                class="rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-black text-amber-950 transition hover:bg-amber-300"
              >
                Review now
              </button>
              <a
                :href="lesson.meetLink"
                target="_blank"
                rel="noopener"
                @click="showJoinPrompt = false"
                class="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
              >
                <GoogleMeetIcon size="sm" /> Join anyway
              </a>
            </div>
          </div>
          <a
            v-else-if="lesson.meetLink"
            :href="lesson.meetLink"
            target="_blank"
            rel="noopener"
            @click="onJoin"
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2db572] px-4 py-3.5 text-center text-sm font-black text-white shadow-xs transition hover:bg-[#269e63] active:scale-[0.99]"
          >
            <GoogleMeetIcon size="md" />
            <span>Join Google Meet</span>
          </a>
          <p
            v-else
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3.5 text-center text-xs font-bold text-slate-400"
          >
            <i class="fa-solid fa-link-slash" aria-hidden="true"></i>
            Meeting link not ready yet — it appears here before the class
          </p>

          <!-- Changes, under the policy they depend on -->
          <div class="rounded-2xl border border-slate-100 p-4">
            <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Change this class</p>
            <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                @click="$emit('edit', lesson)"
                class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <i class="fa-solid fa-pen text-slate-400" aria-hidden="true"></i>
                Edit subject &amp; message
              </button>
              <button
                type="button"
                @click="$emit('reschedule', lesson)"
                class="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-2.5 text-xs font-bold text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
              >
                <i class="fa-solid fa-calendar-days text-amber-600" aria-hidden="true"></i>
                Reschedule
              </button>
              <button
                type="button"
                @click="$emit('cancel', lesson)"
                class="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                Cancel class
              </button>
            </div>
            <ul class="mt-3 space-y-1 text-[11px] leading-relaxed text-slate-500">
              <li><strong class="text-slate-600">Cancellation:</strong> free up to 3h before the class starts — points are refunded.</li>
              <li><strong class="text-slate-600">Reschedule:</strong> move to another date or time without losing points.</li>
              <li><strong class="text-slate-600">Changes:</strong> subject and message can be changed until 2h before.</li>
            </ul>
          </div>
          </div>

          <!-- TAB: INSTRUCTOR INFO -->
          <div v-if="activeTab === 'instructor'" class="space-y-4">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div class="min-w-0 flex-1 space-y-2">
                <p class="m-0 text-sm font-semibold text-brighture-bronze">{{ instructor.specialtyLabel }}</p>
                <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span class="rounded-xl bg-slate-100 px-3 py-1 text-slate-700">
                    Rate: {{ instructor.rate30 }} pts (30m) · {{ instructor.rate60 }} pts (1hr)
                  </span>
                  <span class="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1 text-amber-800">
                    <i class="fa-solid fa-star text-[10px] text-amber-500" aria-hidden="true"></i>
                    {{ instructor.rating }} · {{ instructor.lessonCount.toLocaleString() }} lessons
                  </span>
                </div>
              </div>
              <div class="flex w-full shrink-0 flex-col gap-2 sm:w-[200px]">
                <button
                  v-for="v in VIDEOS"
                  :key="v.kind"
                  type="button"
                  @click="activeVideo = activeVideo === v.kind ? null : v.kind"
                  class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition active:scale-95"
                  :class="activeVideo === v.kind ? v.on : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900'"
                >
                  <span class="flex h-5 w-5 items-center justify-center rounded-full" :class="v.dot">
                    <i :class="v.icon" aria-hidden="true"></i>
                  </span>
                  {{ v.label(firstName) }}
                </button>
              </div>
            </div>

            <div v-if="activeVideo" class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
              <TeacherIntroVideo :key="activeVideo" :video-id="activeVideo === 'demo' ? DEMO_VIDEO_ID : INTRO_VIDEO_ID" />
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
                <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Major / Degree</p>
                <p class="m-0 mt-1 text-sm font-bold text-slate-800">{{ instructor.major }}</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
                <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Core expertise</p>
                <p class="m-0 mt-1 text-sm font-bold text-slate-800">{{ instructor.expertise }}</p>
              </div>
            </div>

            <div v-if="instructor.subjects.length" class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Subjects covered ({{ instructor.subjects.length }})</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="sub in instructor.subjects"
                  :key="sub.code"
                  class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold"
                  :class="sub.style.badgeClass"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="sub.style.dotClass"></span>
                  {{ sub.name }}
                </span>
              </div>
            </div>

            <div class="rounded-2xl border border-[#faecd2] bg-[#fdfbf6] p-4">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-[#996b27]">Self-introduction</p>
              <p class="m-0 mt-1.5 text-xs italic leading-relaxed text-slate-700 sm:text-sm">“{{ instructor.selfIntro }}”</p>
            </div>
          </div>

          <!-- TAB: LESSON HISTORY with this instructor -->
          <div v-if="activeTab === 'history'" class="space-y-3">
            <p class="m-0 text-xs text-slate-500">
              <span class="font-semibold text-slate-800">{{ history.length }}</span>
              class{{ history.length === 1 ? '' : 'es' }} taken with {{ firstName }}
            </p>
            <article
              v-for="past in history"
              :key="past.id"
              class="rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="m-0 text-sm font-bold text-slate-900">{{ past.subject }}</p>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                  :class="past.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                >{{ past.status }}</span>
              </div>
              <p class="m-0 mt-0.5 text-[11px] font-medium text-slate-500">
                {{ past.date }} · {{ past.time }}<template v-if="past.topic"> · {{ past.topic }}</template>
              </p>
              <p v-if="past.feedback" class="m-0 mt-2 whitespace-pre-line rounded-xl bg-[#f8fafc] p-3 text-xs leading-relaxed text-slate-700">{{ past.feedback }}</p>
              <p v-if="past.yourRating" class="m-0 mt-2 text-[11px] font-semibold text-amber-700">
                <i class="fa-solid fa-star text-[10px]" aria-hidden="true"></i> You rated {{ past.yourRating }}/5
              </p>
            </article>
            <p v-if="!history.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              You haven't taken a class with {{ firstName }} yet — this will be your first.
            </p>
          </div>

          <!-- TAB: MATERIALS shared by this instructor -->
          <div v-if="activeTab === 'materials'" class="space-y-2.5">
            <a
              v-for="item in materials"
              :key="item.id"
              :href="item.url || undefined"
              target="_blank"
              rel="noopener"
              class="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1" :class="materialKind(item.kind).chip">
                <i :class="materialKind(item.kind).icon" aria-hidden="true"></i>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-bold text-slate-900">{{ item.title }}</span>
                <span class="block text-[11px] font-medium text-slate-500">
                  {{ materialKind(item.kind).label }}<template v-if="item.subject"> · {{ item.subject }}</template> · {{ item.addedOn }}
                </span>
                <span v-if="item.note" class="mt-1 block text-xs text-slate-600">{{ item.note }}</span>
              </span>
              <i v-if="item.url" class="fa-solid fa-arrow-up-right-from-square mt-1 text-[11px] text-slate-400" aria-hidden="true"></i>
            </a>
            <p v-if="!materials.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              {{ firstName }} hasn't shared any materials with you yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import GoogleMeetIcon from './GoogleMeetIcon.vue';
import { computed, ref, watch } from 'vue';
import AppImage from './AppImage.vue';
import TeacherIntroVideo from './TeacherIntroVideo.vue';
import { MANILA, TOKYO, dateIn, rangeIn, countdownLabel } from '@/lib/schoolTime';
import { materialKind } from '@/lib/lessonMaterials';
import { useUserStore } from '@/stores/useUserStore';
import { useSchoolStore } from '@/stores/useSchoolStore';
import {
  INSTRUCTORS, INTRO_VIDEO_ID, DEMO_VIDEO_ID, SUBJECT_LABELS,
  parseSubjectCodes, getSubjectBadgeStyle, getTeacherProfile, pointsForDuration,
} from '@/pages/student-view-v4/constants';

const props = defineProps({
  /** null closes the modal — same pattern as TeacherDataModal. */
  lesson: Object,
  /** Opened from a Join button: show the "materials not opened" prompt straight away. */
  joinIntent: { type: Boolean, default: false },
});
defineEmits(['close', 'cancel', 'edit', 'reschedule']);

const user = useUserStore();
const school = useSchoolStore();

/* Pre-class materials for this lesson, from the shared store. */
const prep = computed(() => (props.lesson?.id ? school.prepFor(props.lesson.id) : { items: [], total: 0, reviewed: 0, chosen: false }));
const unreviewed = computed(() => prep.value.total - prep.value.reviewed);
const prepDone = computed(() => prep.value.total > 0 && unreviewed.value === 0);
const toggleReviewed = (item) => school.markMaterialReviewed(props.lesson.id, item.id, !item.reviewedAt);

const showJoinPrompt = ref(false);
const highlightPrep = ref(false);
const prepCard = ref(null);
/** First press with materials unopened asks instead of joining. */
const onJoin = (event) => {
  if (unreviewed.value > 0) {
    event.preventDefault();
    showJoinPrompt.value = true;
  }
};
const reviewNow = () => {
  showJoinPrompt.value = false;
  prepCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightPrep.value = true;
  setTimeout(() => { highlightPrep.value = false; }, 1600);
};

/* Tabs, mirroring the instructor's lesson panel from the student's side.
   It always opens on the class itself, and reopens there for a new lesson. */
const tabs = [
  { key: 'class', label: 'Class Details', icon: 'fa-solid fa-chalkboard-user', iconOn: 'text-amber-500' },
  { key: 'instructor', label: 'Instructor Info', icon: 'fa-solid fa-user', iconOn: 'text-[#c5a059]' },
  { key: 'history', label: 'Lesson History', icon: 'fa-solid fa-clock-rotate-left', iconOn: 'text-blue-500' },
  { key: 'materials', label: 'Materials', icon: 'fa-regular fa-folder-open', iconOn: 'text-purple-500' },
];
const activeTab = ref('class');
const activeVideo = ref(null);
watch(() => props.lesson?.id, () => {
  activeTab.value = 'class';
  activeVideo.value = null;
  showJoinPrompt.value = props.joinIntent && unreviewed.value > 0;
}, { immediate: true });

/* Solid steps down one grey ramp, as on the instructor side. */
const TAB_SHADES = ['#e8edf2', '#dde3ea', '#cfd7e0', '#c1cad5'];
const tabShade = (i) => TAB_SHADES[Math.min(i, TAB_SHADES.length - 1)];

const tabEls = ref([]);
const setTabEl = (el, i) => { if (el) tabEls.value[i] = el; };
const onTabKey = (event, index) => {
  const last = tabs.length - 1;
  const next = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  activeTab.value = tabs[next].key;
  tabEls.value[next]?.focus();
};

const firstName = computed(() => (props.lesson?.teacherName || '').split(' ')[0]);

const VIDEOS = [
  { kind: 'intro', label: (n) => `Get to know ${n}`, icon: 'fa-solid fa-play text-[7px]', dot: 'bg-red-100 text-red-600', on: 'border-red-200 bg-red-50 text-red-700' },
  { kind: 'demo', label: (n) => `See ${n} teach`, icon: 'fa-solid fa-chalkboard-user text-[8px]', dot: 'bg-indigo-100 text-indigo-600', on: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
];

/** Profile from the booking catalogue, matched by teacher id, then by name. */
const instructor = computed(() => {
  const l = props.lesson ?? {};
  const t = INSTRUCTORS.find((i) => i.imageKey === l.teacherId) ?? INSTRUCTORS.find((i) => i.name === l.teacherName);
  const profile = t ? getTeacherProfile(t) : {};
  const codes = parseSubjectCodes(t?.specialty);
  return {
    specialtyLabel: t?.specialty ?? '',
    rate30: t ? pointsForDuration(t, 30) : 5,
    rate60: t ? pointsForDuration(t, 60) : 9,
    rating: t?.rating ?? profile.rating ?? '—',
    lessonCount: t?.lessonCount ?? profile.lessonCount ?? 0,
    major: profile.major ?? 'Education & Language Teaching',
    expertise: profile.expertise ?? 'English Language & Communication',
    selfIntro: profile.selfIntro ?? 'Hello! I focus on practical English communication and personalised feedback.',
    subjects: codes.map((code) => ({ code, name: SUBJECT_LABELS[code] || code, style: getSubjectBadgeStyle(code, false) })),
  };
});

/** Classes this student actually took with this instructor, newest first —
 *  cancelled ones are left out. */
const history = computed(() => (user.pastLessons ?? []).filter(
  (p) => p.teacherName === props.lesson?.teacherName && p.status === 'completed'
));

/** Materials this instructor has shared with the student. */
const materials = computed(() => (user.lessonMaterials ?? []).filter((m) => m.addedBy === props.lesson?.teacherName));

/** The student's own clock; falls back to the row's labels when there is no instant. */
const yourTime = computed(() => {
  const l = props.lesson;
  if (!l) return '';
  if (l.start && l.duration) return `${l.date || dateIn(l.start, TOKYO)} · ${rangeIn(l.start, l.duration, TOKYO)} JST`;
  return [l.date, l.time].filter(Boolean).join(' · ');
});

/** The instructor teaches on Manila time; shown so both sides agree on the hour. */
const teacherTime = computed(() => {
  const l = props.lesson;
  if (!l?.start || !l?.duration) return '';
  return `${dateIn(l.start, MANILA)} · ${rangeIn(l.start, l.duration, MANILA)} PHT`;
});

const startsIn = computed(() => {
  const m = props.lesson?.minutesUntil;
  return typeof m === 'number' && m > 0 ? countdownLabel(m) : '';
});
</script>

<style scoped>
/* Same folder tabs as the instructor's lesson panel. */
.tab-row {
  scrollbar-width: none;
}
.tab-row::-webkit-scrollbar {
  display: none;
}
.folder-tab {
  clip-path: path('M0 36 Q8 36 10 28 L15 8 Q17 0 25 0 L159 0 Q167 0 169 8 L174 28 Q176 36 184 36 Z');
}
</style>
