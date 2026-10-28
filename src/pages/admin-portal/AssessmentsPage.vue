<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <p class="max-w-2xl text-sm text-slate-600">
        Every level check: trial lessons (TA) and counseling sessions (CS) that students book, and fixed-class assessments (FA) you schedule.
        Open one to read its full results.
      </p>
      <button
        type="button"
        @click="openSchedule"
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brighture-gold px-4 py-2.5 text-sm font-black text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep"
      >
        <i class="fa-solid fa-calendar-plus"></i>
        Schedule fixed-class assessment
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative lg:w-80">
        <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
        <input
          v-model="search"
          type="search"
          placeholder="Search by student or teacher"
          aria-label="Search assessments"
          class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="group" aria-label="Filter by type">
          <button
            v-for="t in ['All', 'TA', 'CS', 'FA']"
            :key="t"
            type="button"
            @click="type = t"
            class="rounded-lg px-3 py-1.5 transition"
            :class="type === t ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            :title="t === 'All' ? 'All types' : typeLabel(t)"
          >
            {{ t }}
          </button>
        </div>
        <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="group" aria-label="Filter by status">
          <button
            v-for="s in ['All', 'scheduled', 'draft', 'submitted']"
            :key="s"
            type="button"
            @click="status = s"
            class="rounded-lg px-3 py-1.5 transition"
            :class="status === s ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          >
            {{ s === 'All' ? 'All' : STATUS_LABELS[s] }}
            <span class="ml-0.5 text-[10px] text-slate-400">{{ countFor(s) }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead class="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Student</th>
              <th class="px-4 py-3">Teacher</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Level given</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="a in rows"
              :key="a.id"
              @click="openId = a.id"
              @keydown.enter="openId = a.id"
              tabindex="0"
              class="cursor-pointer transition hover:bg-brighture-cream/60 focus:bg-brighture-cream/60 focus:outline-none"
            >
              <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">{{ stamp(a.scheduledAt) }}</td>
              <td class="px-4 py-3">
                <span class="rounded px-1.5 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[a.type]" :title="typeLabel(a.type)">{{ a.type }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <img :src="school.student(a.studentId).photo" alt="" class="h-7 w-7 rounded-full object-cover" />
                  <span class="font-bold text-slate-900">{{ school.student(a.studentId).name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ school.teacher(a.teacherId).name }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-[10px] font-black ring-1" :class="STATUS_STYLES[a.status]">{{ STATUS_LABELS[a.status] }}</span>
              </td>
              <td class="px-4 py-3">
                <LevelChip v-if="a.status === 'submitted'" :value="a.level" compact />
                <span v-else class="text-slate-400">—</span>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">No assessments match these filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================== Assessment detail ===================== -->
    <!-- !mt-0: the page's space-y spacing would otherwise push this fixed layer 20px down from the top. -->
    <div v-if="opened" class="fixed inset-0 z-50 !mt-0 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 pt-6 pb-6 sm:pt-12" @click.self="closeDetail">
      <div class="w-full max-w-3xl rounded-2xl bg-slate-50 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="as-title">
        <div class="flex items-start gap-3 rounded-t-2xl border-b border-slate-200 bg-white px-5 py-4">
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-2">
              <span class="rounded px-1.5 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[opened.type]">{{ opened.type }}</span>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">{{ typeLabel(opened.type) }}</span>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-black ring-1" :class="STATUS_STYLES[opened.status]">{{ STATUS_LABELS[opened.status] }}</span>
            </p>
            <h2 id="as-title" class="mt-1 text-base font-black text-slate-900">
              {{ school.student(opened.studentId).name }}
              <span class="font-semibold text-slate-500">with {{ school.teacher(opened.teacherId).name }}</span>
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{ stamp(opened.scheduledAt) }}
              <template v-if="opened.submittedAt"> · submitted {{ stamp(opened.submittedAt) }}</template>
              <template v-if="opened.scheduledBy"> · scheduled by {{ opened.scheduledBy }}</template>
            </p>
          </div>
          <button type="button" @click="closeDetail" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-4 px-5 py-5">
          <a
            v-if="opened.meetLink && opened.status !== 'submitted'"
            :href="opened.meetLink"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            <GoogleMeetIcon size="sm" />
            {{ opened.meetLink.replace('https://', '') }}
          </a>
          <AssessmentResults :assessment="opened" />
        </div>

        <div v-if="opened.type === 'FA' && opened.status !== 'submitted'" class="flex flex-col gap-2 rounded-b-2xl border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-slate-500">
            {{ cancelArmed ? 'This removes the assessment for the student and the teacher. Click again to confirm.' : 'Plans changed? You can cancel a fixed-class assessment until it is submitted.' }}
          </p>
          <button
            type="button"
            @click="onCancelFa"
            class="shrink-0 rounded-xl px-4 py-2 text-sm font-black transition"
            :class="cancelArmed ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50'"
          >
            {{ cancelArmed ? 'Yes, cancel it' : 'Cancel assessment' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== Schedule FA ===================== -->
    <div v-if="scheduleOpen" class="fixed inset-0 z-50 !mt-0 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 pt-6 pb-6 sm:pt-12" @click.self="scheduleOpen = false">
      <form class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="fa-title" @submit.prevent="schedule">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="fa-title" class="text-base font-black text-slate-900">Schedule fixed-class assessment</h2>
            <p class="text-xs text-slate-500">For fixed-class and corporate students. No booking and no points: it goes straight on the teacher's list.</p>
          </div>
          <button type="button" @click="scheduleOpen = false" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-5 px-5 py-5">
          <p v-if="faTemplate" class="flex items-center gap-2 rounded-xl bg-brighture-cream px-3.5 py-2 text-xs font-semibold text-brighture-ink">
            <i class="fa-solid fa-clipboard-list text-brighture-bronze"></i>
            Uses the active FA template: <strong class="font-black">{{ faTemplate.name }}</strong> (v{{ faTemplate.version }})
          </p>
          <p v-else class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>No FA template is active, so these assessments would have no template questions.
              <RouterLink to="/templates" class="underline">Set one active first.</RouterLink></span>
          </p>

          <!-- Students -->
          <div>
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-slate-700">Students <span class="text-rose-500">*</span></p>
              <p class="text-[11px] font-semibold text-slate-500">{{ fa.students.length }} selected · one assessment each</p>
            </div>
            <input
              v-model="studentSearch"
              type="search"
              placeholder="Find a student"
              aria-label="Find a student"
              class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
            />
            <ul class="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border" :class="faErrors.students ? 'border-rose-300' : 'border-slate-200'">
              <li v-for="s in studentOptions" :key="s.id">
                <label class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
                  <input v-model="fa.students" type="checkbox" :value="s.id" class="h-4 w-4 accent-brighture-ink" />
                  <img :src="s.photo" alt="" class="h-7 w-7 rounded-full object-cover" />
                  <span class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{{ s.name }}</span>
                  <span class="hidden text-[11px] text-slate-500 sm:inline">{{ s.category }}</span>
                  <LevelChip :value="school.currentLevel(s.id)" compact />
                </label>
              </li>
            </ul>
            <p v-if="faErrors.students" class="mt-1 text-xs font-semibold text-rose-600">{{ faErrors.students }}</p>
          </div>

          <!-- Teacher -->
          <div>
            <label for="fa-teacher" class="text-xs font-bold text-slate-700">Teacher <span class="text-rose-500">*</span></label>
            <select
              id="fa-teacher"
              v-model.number="fa.teacherId"
              class="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
              :class="faErrors.teacher ? 'border-rose-400' : 'border-slate-200 focus:border-brighture-gold'"
            >
              <option :value="null">Choose a teacher</option>
              <option v-for="t in assessors" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <p class="mt-1 text-[11px] text-slate-500">Only teachers cleared to run level checks are listed.</p>
            <p v-if="faErrors.teacher" class="mt-1 text-xs font-semibold text-rose-600">{{ faErrors.teacher }}</p>
          </div>

          <!-- When -->
          <div>
            <p class="text-xs font-bold text-slate-700">Date and time <span class="font-semibold text-slate-500">(Tokyo time, JST)</span> <span class="text-rose-500">*</span></p>
            <div class="mt-1.5 grid gap-3 sm:grid-cols-2">
              <input
                v-model="fa.date"
                type="date"
                aria-label="Date (JST)"
                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                :class="faErrors.when ? 'border-rose-400' : 'border-slate-200 focus:border-brighture-gold'"
              />
              <input
                v-model="fa.time"
                type="time"
                step="900"
                aria-label="Time (JST)"
                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                :class="faErrors.when ? 'border-rose-400' : 'border-slate-200 focus:border-brighture-gold'"
              />
            </div>
            <p v-if="startIso" class="mt-1 text-[11px] text-slate-500">
              That is {{ clockIn(startIso, MANILA) }} on {{ dateIn(startIso, MANILA) }} in Manila, the teacher's time.
            </p>
            <p v-if="faErrors.when" class="mt-1 text-xs font-semibold text-rose-600">{{ faErrors.when }}</p>
            <p v-else-if="teacherClash" class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <i class="fa-solid fa-triangle-exclamation"></i>
              {{ school.teacher(fa.teacherId).name }} already has a lesson within an hour of this time.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button type="button" @click="scheduleOpen = false" class="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" class="rounded-xl bg-brighture-ink px-4 py-2 text-sm font-black text-white hover:bg-black">
            Schedule {{ fa.students.length > 1 ? `${fa.students.length} assessments` : 'assessment' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { MANILA, TOKYO, clockIn, dateIn, partsIn, tokyoAt } from '@/lib/schoolTime';
import GoogleMeetIcon from '@/components/GoogleMeetIcon.vue';
import LevelChip from './components/LevelChip.vue';
import AssessmentResults from './components/AssessmentResults.vue';
import { STATUS_LABELS, STATUS_STYLES, TYPE_STYLES, stamp, typeLabel, showToast } from './adminUi';

const school = useSchoolStore();

// Started TA / CS lessons only get their assessment record when someone asks;
// asking here means the list includes lessons no teacher has opened yet.
onMounted(() => school.syncLessonAssessments());

const type = ref('All');
const status = ref('All');
const search = ref('');

const matchesSearch = (a) => {
  const q = search.value.trim().toLowerCase();
  return !q
    || school.student(a.studentId).name.toLowerCase().includes(q)
    || school.teacher(a.teacherId).name.toLowerCase().includes(q);
};
const byType = computed(() => school.assessments.filter((a) => (type.value === 'All' || a.type === type.value) && matchesSearch(a)));
const countFor = (s) => (s === 'All' ? byType.value.length : byType.value.filter((a) => a.status === s).length);
/** Newest first: upcoming FAs lead, then the most recent results. */
const rows = computed(() => byType.value
  .filter((a) => status.value === 'All' || a.status === status.value)
  .slice()
  .sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? '')));

// ── Detail ────────────────────────────────────────────────────────────
const openId = ref(null);
const opened = computed(() => (openId.value ? school.findAssessment(openId.value) : null));
const cancelArmed = ref(false);
const closeDetail = () => {
  openId.value = null;
  cancelArmed.value = false;
};
const onCancelFa = () => {
  if (!cancelArmed.value) {
    cancelArmed.value = true;
    return;
  }
  const name = school.student(opened.value.studentId).name;
  school.cancelFixedAssessment(opened.value.id);
  closeDetail();
  showToast(`The fixed-class assessment for ${name} is cancelled.`);
};
// A reset, or another tab, can remove the record being viewed.
watch(opened, (a) => { if (!a && openId.value) closeDetail(); });

// ── Schedule ──────────────────────────────────────────────────────────
const scheduleOpen = ref(false);
const studentSearch = ref('');
const fa = reactive({ students: [], teacherId: null, date: '', time: '10:00' });
const faErrors = reactive({ students: '', teacher: '', when: '' });
const faTemplate = computed(() => school.activeTemplate('FA'));
const assessors = computed(() => Object.values(school.db.teachers).filter((t) => t.canAssess));

// Every student is offered: corporate and fixed-class students are not flagged in the data.
const studentOptions = computed(() => {
  const q = studentSearch.value.trim().toLowerCase();
  return Object.values(school.db.students)
    .filter((s) => !q || s.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const pad = (n) => String(n).padStart(2, '0');
const tokyoTomorrow = () => {
  const p = partsIn(new Date(Date.now() + 86_400_000).toISOString(), TOKYO);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
};

const openSchedule = () => {
  fa.students = [];
  fa.teacherId = assessors.value[0]?.id ?? null;
  fa.date = tokyoTomorrow();
  fa.time = '10:00';
  studentSearch.value = '';
  Object.keys(faErrors).forEach((k) => { faErrors[k] = ''; });
  scheduleOpen.value = true;
};

const startIso = computed(() => (fa.date && fa.time ? tokyoAt(fa.date, fa.time) : null));
const teacherClash = computed(() => !!(fa.teacherId && startIso.value && school.teacherBusy(fa.teacherId, startIso.value, 60)));

const schedule = () => {
  faErrors.students = fa.students.length ? '' : 'Choose at least one student.';
  faErrors.teacher = fa.teacherId ? '' : 'Choose the teacher who will run it.';
  faErrors.when = '';
  if (!startIso.value) faErrors.when = 'Choose a date and a time.';
  else if (new Date(startIso.value).getTime() <= Date.now()) faErrors.when = 'That time has already passed. Choose a later one.';
  if (faErrors.students || faErrors.teacher || faErrors.when) return;

  fa.students.forEach((studentId) => {
    school.scheduleFixedAssessment({ studentId, teacherId: fa.teacherId, start: startIso.value, by: 'Admin' });
  });
  const n = fa.students.length;
  showToast(`${n === 1 ? 'Assessment' : `${n} assessments`} scheduled with ${school.teacher(fa.teacherId).name} for ${stamp(startIso.value)}.`);
  scheduleOpen.value = false;
};

const onKey = (e) => {
  if (e.key !== 'Escape') return;
  if (scheduleOpen.value) scheduleOpen.value = false;
  else if (openId.value) closeDetail();
};
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>
