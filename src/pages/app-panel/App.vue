<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import studentImage from "@/assets/student-1.svg";
import ProfileLessonLogs from "./ProfileLessonLogs.vue";
import ProfileReservationList from "./ProfileReservationList.vue";
import EditableMaterials from "./EditableMaterials.vue";
import AnalyticsDashboard from "./AnalyticsDashboard.vue";
import {
  NAV_ITEMS,
  MAX_DAY_OFFSET,
  buildSchedule,
  formatAppointment,
  formatDate,
  formatReservationDateLines,
  getNextClass,
  isSameDay,
  isClassDone,
  getFeaturedClass,
  formatCountdown,
  minutesToClock,
  getMinutesOfDay,
  applyMinutesToDate,
  getStudentProfile,
} from "./data.js";

const activeNav = ref("Scheduling");
const now = ref(new Date());
const simulatedNow = ref(null);
const isTimeModalOpen = ref(false);
const draftMinutes = ref(getMinutesOfDay(new Date()));
const simulationSpeed = ref(50);
const isSimulationRunning = ref(false);
const dayOffset = ref(0);
const isSidebarOpen = ref(false);
const detailsEntry = ref(null);
const detailsTab = ref(null);
const studentProfileEntry = ref(null);
const studentProfileTab = ref(null);

// buildSchedule mirrors the React useMemo(() => buildSchedule(new Date()), []) —
// computed once, it never changes for the lifetime of this component.
const schedule = buildSchedule(new Date());

const effectiveNow = computed(() => simulatedNow.value ?? now.value);

// Tick the clock every 30s, same as the React setInterval effect.
let clockTimer = null;
onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 1000 * 30);
});
onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});

// Time-simulation effect: recreated whenever isSimulationRunning, simulationSpeed,
// or now changes — same dependency set as the React useEffect.
let simulationTimer = null;
function clearSimulationTimer() {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}
watch(
  [isSimulationRunning, simulationSpeed, now],
  () => {
    clearSimulationTimer();
    if (!isSimulationRunning.value) {
      return;
    }
    simulationTimer = setInterval(() => {
      const base = simulatedNow.value ?? now.value;
      simulatedNow.value = new Date(base.getTime() + 1000 * simulationSpeed.value);
    }, 1000);
  },
  { immediate: true }
);
onUnmounted(() => clearSimulationTimer());

const todayCount = computed(
  () =>
    schedule.filter(
      (entry) => isSameDay(entry.date, effectiveNow.value) && !isClassDone(entry, effectiveNow.value)
    ).length
);

const viewDate = computed(() => {
  const next = new Date(effectiveNow.value);
  next.setDate(effectiveNow.value.getDate() + dayOffset.value);
  return next;
});

const nextClass = computed(() => getFeaturedClass(schedule, effectiveNow.value));

const featuredCardEntry = ref(nextClass.value);
const isFeaturedTransitioning = ref(false);

const visibleSchedule = computed(() => {
  const dayEntries = schedule.filter((entry) => isSameDay(entry.date, viewDate.value));
  const scopedEntries =
    dayOffset.value === 0
      ? dayEntries.filter((entry) => !isClassDone(entry, effectiveNow.value))
      : dayEntries;
  const featuredOnThisDay = isSameDay(nextClass.value.date, viewDate.value);
  const hasFeatured = scopedEntries.some((entry) => entry.id === nextClass.value.id);
  if (featuredOnThisDay && !hasFeatured) {
    return [nextClass.value, ...scopedEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  return scopedEntries;
});

// Featured-card transition effect, ported from the React useEffect keyed on
// [nextClass, featuredCardEntry.id].
let featuredTransitionTimer = null;
watch(nextClass, (updated) => {
  if (featuredCardEntry.value.id === updated.id) {
    return;
  }

  isFeaturedTransitioning.value = true;
  if (featuredTransitionTimer) {
    clearTimeout(featuredTransitionTimer);
  }
  featuredTransitionTimer = setTimeout(() => {
    featuredCardEntry.value = updated;
    isFeaturedTransitioning.value = false;
  }, 260);
});
onUnmounted(() => {
  if (featuredTransitionTimer) clearTimeout(featuredTransitionTimer);
});

const featuredAppointment = computed(() => formatAppointment(featuredCardEntry.value.date));
const nextLocal = computed(() => featuredAppointment.value[0]);
const nextUtc = computed(() => featuredAppointment.value[1]);

const nowAppointment = computed(() => formatAppointment(effectiveNow.value));
const nowLocalDate = computed(() => nowAppointment.value[0]);
const nowLocalTime = computed(() => nowAppointment.value[1]);

const countdownLabel = computed(() => formatCountdown(featuredCardEntry.value.date, effectiveNow.value));
const minutesToFeaturedClass = computed(() =>
  Math.ceil((featuredCardEntry.value.date.getTime() - effectiveNow.value.getTime()) / 60000)
);
const featuredCountdownClass = computed(() =>
  minutesToFeaturedClass.value <= 15
    ? "bg-red-600 text-white"
    : minutesToFeaturedClass.value <= 60
      ? "bg-amber-500 text-white"
      : "bg-emerald-600 text-white"
);
const scheduleTitleDate = computed(() => formatDate(viewDate.value));
const detailDateLines = computed(() =>
  detailsEntry.value ? formatReservationDateLines(detailsEntry.value.date) : []
);
const detailsProfile = computed(() => (detailsEntry.value ? getStudentProfile(detailsEntry.value) : null));
const studentProfileData = computed(() =>
  studentProfileEntry.value ? getStudentProfile(studentProfileEntry.value) : null
);

const draftClock = computed(() => minutesToClock(draftMinutes.value));
const hourAngle = computed(() => (draftMinutes.value / 60) * 30);
const minuteAngle = computed(() => (draftMinutes.value % 60) * 6);
const previewNow = computed(() => applyMinutesToDate(effectiveNow.value, draftMinutes.value));
const previewClass = computed(() => getFeaturedClass(schedule, previewNow.value));
const previewMinutesToClass = computed(() =>
  Math.ceil((previewClass.value.date.getTime() - previewNow.value.getTime()) / 60000)
);
const modalCountdownColor = computed(() =>
  previewMinutesToClass.value <= 15
    ? "text-red-600"
    : previewMinutesToClass.value <= 60
      ? "text-amber-600"
      : "text-emerald-600"
);
const isAnalyticsView = computed(() => activeNav.value === "Analytics");
const simulationSpeeds = [50, 100, 200];

function selectNav(item) {
  activeNav.value = item.label;
  isSidebarOpen.value = false;
}

function showDetails(entry) {
  detailsTab.value = null;
  detailsEntry.value = entry;
}

function showMaterials(entry) {
  detailsTab.value = "materials";
  detailsEntry.value = entry;
}

function openFeaturedProfile() {
  studentProfileEntry.value = nextClass.value;
  studentProfileTab.value = null;
}

function closeDetailsModal() {
  detailsEntry.value = null;
}

function toggleDetailsTab(tab) {
  detailsTab.value = detailsTab.value === tab ? null : tab;
}

function closeStudentProfileModal() {
  studentProfileEntry.value = null;
  studentProfileTab.value = null;
}

function toggleStudentProfileTab(tab) {
  studentProfileTab.value = studentProfileTab.value === tab ? null : tab;
}

function openTimeModal() {
  draftMinutes.value = getMinutesOfDay(effectiveNow.value);
  isTimeModalOpen.value = true;
}

function toggleSimulation() {
  if (isSimulationRunning.value) {
    isSimulationRunning.value = false;
    return;
  }
  simulatedNow.value = applyMinutesToDate(effectiveNow.value, draftMinutes.value);
  isSimulationRunning.value = true;
}

function useRealTime() {
  isSimulationRunning.value = false;
  simulatedNow.value = null;
  isTimeModalOpen.value = false;
}

function applySimulatedTime() {
  simulatedNow.value = applyMinutesToDate(effectiveNow.value, draftMinutes.value);
  isSimulationRunning.value = false;
  isTimeModalOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-900">
    <div class="grid min-h-screen grid-cols-1 lg:grid-cols-[272px,1fr]">
      <div
        :class="`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`"
        @click="isSidebarOpen = false"
        aria-hidden="true"
      />
      <aside
        :class="`fixed inset-y-0 left-0 z-40 flex w-[272px] transform flex-col gap-6 bg-gradient-to-b from-[#192833] via-[#18242d] to-[#161f26] px-4 pb-8 pt-6 text-slate-100 shadow-xl transition-transform duration-300 lg:static lg:w-auto lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`"
      >
        <div class="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 font-semibold shadow-card">
          <span class="text-base">Instructor Menu</span>
          <button
            class="rounded-lg bg-white/20 p-2 text-white transition hover:bg-white/30 lg:hidden"
            aria-label="Close menu"
            @click="isSidebarOpen = false"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="text-xs uppercase tracking-[0.08em] text-slate-200/70">
          Main Navigation
        </div>
        <nav class="flex flex-col gap-2">
          <button
            v-for="item in NAV_ITEMS"
            :key="item.label"
            :class="`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
              item.label === activeNav
                ? 'bg-primary/40 text-white shadow-md'
                : 'text-slate-100/90 hover:bg-white/10 hover:text-white'
            }`"
            @click="selectNav(item)"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="truncate">{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <main class="overflow-x-hidden px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <header class="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <button
              class="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
              @click="isSidebarOpen = true"
              aria-label="Open menu"
            >
              <span class="material-symbols-outlined text-base">menu</span>
              Menu
            </button>
            <h1 class="m-0 font-display text-3xl text-slate-900 sm:text-4xl">{{ activeNav }}</h1>
            <p class="mt-1 text-sm text-slate-500">
              {{
                isAnalyticsView
                  ? "Track instructor performance and class completion."
                  : "Plan your day and monitor upcoming classes."
              }}
            </p>
          </div>
          <div class="grid w-full grid-cols-[7fr,3fr] items-start gap-3 md:w-auto md:min-w-[360px]">
            <div class="flex h-28 min-w-0 flex-col justify-center rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-3 shadow-card backdrop-blur sm:px-4">
              <span class="block text-xs font-semibold text-slate-700 sm:text-sm">
                {{ nowLocalDate }}
              </span>
              <span class="block text-lg font-bold text-slate-900 sm:text-xl">
                {{ nowLocalTime }}
              </span>
              <span
                v-if="simulatedNow"
                class="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
              >
                Simulated{{ isSimulationRunning ? ` ${simulationSpeed}x` : "" }}
              </span>
            </div>
            <div class="flex h-28 min-w-0 flex-col items-center justify-center rounded-2xl border border-[#b7c5a2] bg-gradient-to-br from-[#d8e2c8] to-[#b7c79b] px-3 py-3 text-center shadow-card">
              <span class="text-[0.64rem] uppercase tracking-[0.08em] text-slate-700 sm:text-[0.72rem]">
                Classes Today
              </span>
              <span class="mt-1 block text-xl font-bold text-slate-900 sm:text-2xl">
                {{ todayCount }}
              </span>
            </div>
          </div>
        </header>

        <AnalyticsDashboard v-if="isAnalyticsView" :schedule="schedule" :now="effectiveNow" />
        <section v-else class="grid gap-6">
          <div
            :class="`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-card backdrop-blur transition-all duration-500 ease-in-out sm:p-6 ${
              isFeaturedTransitioning ? 'scale-[0.995] opacity-60' : 'scale-100 opacity-100'
            }`"
          >
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[0.7rem] uppercase tracking-[0.12em] text-primary-dark font-semibold">
                  Up Next
                </span>
                <span :class="`rounded-full px-3 py-1 text-xs font-semibold ${featuredCountdownClass}`">
                  {{ countdownLabel }}
                </span>
              </div>
            </div>
            <div class="mt-5 grid items-start gap-6 lg:grid-cols-[220px,1fr]">
              <button
                type="button"
                @click="openFeaturedProfile"
                class="group relative mx-auto block w-full max-w-[210px] border-0 bg-transparent p-0"
                title="Open student profile"
              >
                <img
                  :src="studentImage"
                  :alt="`${featuredCardEntry.student} profile`"
                  class="aspect-square w-full rounded-full object-cover shadow-lg transition group-hover:brightness-95"
                />
                <span class="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  Open profile
                </span>
              </button>
              <div>
                <button
                  type="button"
                  @click="openFeaturedProfile"
                  class="mb-1 inline-block border-0 bg-transparent p-0 text-left font-display text-2xl text-slate-900 underline-offset-4 transition hover:text-primary-dark hover:underline"
                  title="Open student profile"
                >
                  {{ featuredCardEntry.student }}
                </button>
                <p class="text-sm text-slate-500">{{ featuredCardEntry.subject }}</p>
                <div class="mt-5 grid grid-cols-1 gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <span class="block text-[0.75rem] uppercase tracking-[0.08em] text-slate-500">
                      Local Time
                    </span>
                    <span class="font-semibold text-slate-900">{{ nextLocal }}</span>
                  </div>
                  <div>
                    <span class="block text-[0.75rem] uppercase tracking-[0.08em] text-slate-500">
                      UTC Date &amp; Time
                    </span>
                    <span class="font-semibold text-slate-900">{{ nextUtc }}</span>
                  </div>
                  <div>
                    <span class="block text-[0.75rem] uppercase tracking-[0.08em] text-slate-500">
                      Membership
                    </span>
                    <span class="font-semibold text-slate-900">{{ featuredCardEntry.member }}</span>
                  </div>
                  <div>
                    <span class="block text-[0.75rem] uppercase tracking-[0.08em] text-slate-500">
                      Category
                    </span>
                    <span class="font-semibold text-slate-900">{{ featuredCardEntry.category }}</span>
                  </div>
                  <div class="col-span-2">
                    <div class="mb-1 flex items-center justify-between text-[0.75rem] uppercase tracking-[0.08em] text-slate-500">
                      <span>Student Difficulty</span>
                      <span>{{ featuredCardEntry.difficulty }}%</span>
                    </div>
                    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                        :style="{ width: `${featuredCardEntry.difficulty}%` }"
                      />
                    </div>
                  </div>
                </div>
                <div class="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    @click="showDetails(featuredCardEntry)"
                    class="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
                  >
                    Details
                  </button>
                  <button
                    @click="showMaterials(featuredCardEntry)"
                    class="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
                  >
                    Materials
                  </button>
                  <a
                    :href="featuredCardEntry.meetingUrl"
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-dark sm:w-auto"
                  >
                    Enter class
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-card backdrop-blur sm:p-5">
            <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
              <h3 class="m-0 text-lg font-semibold text-slate-900">
                Scheduled Lessons ({{ scheduleTitleDate }})
              </h3>
              <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <button
                  v-if="dayOffset > 0"
                  @click="dayOffset = Math.max(0, dayOffset - 1)"
                  class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                >
                  Previous Day
                </button>
                <button
                  @click="dayOffset = Math.min(MAX_DAY_OFFSET, dayOffset + 1)"
                  :disabled="dayOffset >= MAX_DAY_OFFSET"
                  class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  Next Day
                </button>
              </div>
            </div>

            <div class="grid gap-3 md:hidden">
              <article
                v-for="entry in visibleSchedule"
                :key="`mobile-${entry.id}`"
                :class="`rounded-2xl border bg-gradient-to-br p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  entry.id === nextClass.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 from-white to-slate-50 hover:border-primary/40'
                }`"
              >
                <p
                  v-if="entry.id === nextClass.id"
                  class="m-0 mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-dark"
                >
                  Featured Student
                </p>
                <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {{ entry.student }}
                </p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ entry.subject }}</p>
                <p class="mt-2 text-sm text-slate-700">{{ formatAppointment(entry.date)[0] }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ formatAppointment(entry.date)[1] }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ entry.region }}</p>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-xs text-slate-600">
                    {{ entry.member }} • {{ entry.category }}
                  </span>
                  <div class="flex items-center gap-2">
                    <button
                      @click="showDetails(entry)"
                      class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-100"
                    >
                      Details
                    </button>
                    <button
                      @click="showMaterials(entry)"
                      class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-100"
                    >
                      Materials
                    </button>
                  </div>
                </div>
              </article>
              <article
                v-if="visibleSchedule.length === 0"
                class="rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500"
              >
                No classes scheduled for this day.
              </article>
            </div>

            <div class="hidden overflow-x-auto md:block">
              <table class="min-w-full border-collapse text-sm">
                <thead>
                  <tr class="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                    <th class="border-b border-slate-200 px-3 py-3">Date &amp; Time</th>
                    <th class="border-b border-slate-200 px-3 py-3">Student Name</th>
                    <th class="border-b border-slate-200 px-3 py-3">Membership Type</th>
                    <th class="border-b border-slate-200 px-3 py-3">Category</th>
                    <th class="border-b border-slate-200 px-3 py-3">Subject</th>
                    <th class="border-b border-slate-200 px-3 py-3">Point</th>
                    <th class="border-b border-slate-200 px-3 py-3">Substitution</th>
                    <th class="border-b border-slate-200 px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-900">
                  <tr
                    v-for="(entry, idx) in visibleSchedule"
                    :key="entry.id"
                    :class="`transition duration-200 hover:bg-primary/10 ${
                      entry.id === nextClass.id
                        ? 'bg-primary/10 ring-1 ring-inset ring-primary/20'
                        : idx % 2 === 0
                          ? 'bg-slate-50/70'
                          : 'bg-white'
                    }`"
                  >
                    <td class="align-top px-3 py-3">
                      <div class="grid gap-1">
                        <span>{{ formatAppointment(entry.date)[0] }}</span>
                        <span>{{ formatAppointment(entry.date)[1] }}</span>
                        <span class="text-slate-500">{{ entry.region }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 font-semibold text-primary-dark">{{ entry.student }}</td>
                    <td class="px-3 py-3">{{ entry.member }}</td>
                    <td class="px-3 py-3">{{ entry.category }}</td>
                    <td class="px-3 py-3">{{ entry.subject }}</td>
                    <td class="px-3 py-3">{{ entry.points }}</td>
                    <td class="px-3 py-3">{{ entry.substitution }}</td>
                    <td class="px-3 py-3">
                      <div class="flex flex-wrap items-center gap-2">
                        <button
                          @click="showDetails(entry)"
                          class="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-100"
                        >
                          Details
                        </button>
                        <button
                          @click="showMaterials(entry)"
                          class="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-100"
                        >
                          Materials
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="visibleSchedule.length === 0">
                    <td colspan="8" class="px-3 py-8 text-center text-slate-500">
                      No classes scheduled for this day.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>

    <button
      v-if="!isAnalyticsView"
      @click="openTimeModal"
      class="fixed bottom-5 right-5 z-40 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-primary-dark"
    >
      Simulate Time
    </button>

    <div
      v-if="detailsEntry"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
      @click="closeDetailsModal"
    >
      <div
        class="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div>
            <p class="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark">
              Reservation
            </p>
            <h3 class="m-0 text-xl font-semibold text-slate-900 sm:text-2xl">Details</h3>
          </div>
          <button
            @click="closeDetailsModal"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div class="space-y-5 bg-slate-50/70 p-4 sm:p-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div class="sm:col-span-2 lg:col-span-3">
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Date / Time
                </p>
                <div class="mt-2 space-y-1 text-sm text-slate-700">
                  <p v-for="line in detailDateLines" :key="line" class="m-0">
                    {{ line }}
                  </p>
                </div>
              </div>

              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Category
                </p>
                <p class="mt-1 text-sm font-medium text-slate-800">{{ detailsEntry.category }}</p>
              </div>
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Subject
                </p>
                <p class="mt-1 text-sm font-medium text-slate-800">{{ detailsEntry.subject }}</p>
              </div>
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Points Used
                </p>
                <p class="mt-1 text-sm font-medium text-slate-800">{{ detailsEntry.points }}</p>
              </div>

              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Student
                </p>
                <p class="mt-1 text-sm font-medium text-slate-800">
                  {{ detailsEntry.student }} (ID: {{ detailsEntry.studentId }})
                </p>
              </div>
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Instructor
                </p>
                <p class="mt-1 text-sm font-medium text-slate-800">
                  {{ detailsEntry.instructorName }} (ID: {{ detailsEntry.instructorId }})
                </p>
              </div>
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Substitution
                </p>
                <p class="mt-1 text-sm font-medium text-slate-800">{{ detailsEntry.substitution }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Student's Message
            </p>
            <p class="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {{ detailsEntry.studentMessage }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="mb-4 flex flex-wrap gap-2">
              <button
                @click="toggleDetailsTab('profile')"
                :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  detailsTab === 'profile'
                    ? 'bg-primary text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`"
              >
                Student Profile
              </button>
              <button
                @click="toggleDetailsTab('logs')"
                :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  detailsTab === 'logs'
                    ? 'bg-primary text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`"
              >
                Lesson Logs
              </button>
              <button
                @click="toggleDetailsTab('reservations')"
                :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  detailsTab === 'reservations'
                    ? 'bg-primary text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`"
              >
                Reservation List
              </button>
              <button
                @click="toggleDetailsTab('materials')"
                :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  detailsTab === 'materials'
                    ? 'bg-primary text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`"
              >
                Materials
              </button>
            </div>

            <div v-if="detailsTab === 'profile'" class="grid gap-4 bg-slate-50 p-4 sm:grid-cols-[260px,1fr]">
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <div class="flex items-center justify-center">
                  <img
                    :src="studentImage"
                    :alt="`${detailsEntry.student} profile`"
                    class="h-44 w-44 rounded-full object-cover"
                  />
                </div>
                <div class="mt-4 space-y-2 border-t border-slate-200 pt-3">
                  <div>
                    <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">ID:</p>
                    <p class="m-0 text-sm text-slate-800">{{ detailsEntry.studentId }}</p>
                  </div>
                  <div>
                    <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Name in Roman:
                    </p>
                    <p class="m-0 inline-flex items-center gap-1 text-sm text-slate-800">
                      {{ detailsProfile.romanName }}
                      <span class="material-symbols-outlined text-base text-slate-500">
                        content_copy
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Name in Japanese:
                    </p>
                    <p class="m-0 inline-flex items-center gap-1 text-sm text-slate-800">
                      {{ detailsProfile.japaneseName }}
                      <span class="material-symbols-outlined text-base text-slate-500">
                        content_copy
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Membership type:</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsEntry.member }}</p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Gender:</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsProfile.gender }}</p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Birth Date:</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsProfile.birthDate }}</p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">E-mail:</p>
                  <p class="m-0 inline-flex items-center gap-1 px-4 py-3 text-sm text-slate-800">
                    {{ detailsProfile.email }}
                    <span class="material-symbols-outlined text-base text-slate-500">
                      content_copy
                    </span>
                  </p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Gmail:</p>
                  <p class="m-0 inline-flex items-center gap-1 px-4 py-3 text-sm text-slate-800">
                    {{ detailsProfile.gmail }}
                    <span class="material-symbols-outlined text-base text-slate-500">
                      content_copy
                    </span>
                  </p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Learning Purpose:</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsProfile.learningPurpose }}</p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Exam Score(s):</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsProfile.examScores }}</p>
                </div>
                <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Hidden Note:</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsProfile.hiddenNote }}</p>
                </div>
                <div class="grid grid-cols-[220px,1fr]">
                  <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Time Zone:</p>
                  <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ detailsProfile.timeZone }}</p>
                </div>
              </div>
            </div>

            <div v-if="detailsTab === 'logs'" class="space-y-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <div class="flex flex-wrap gap-2">
                <input
                  type="text"
                  readonly
                  value="Teacher's name"
                  class="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500"
                />
                <input
                  type="text"
                  readonly
                  value="Subject"
                  class="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500"
                />
                <button class="rounded bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Search
                </button>
                <button class="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  Clear
                </button>
              </div>
              <div class="overflow-x-auto rounded border border-slate-200 bg-white">
                <table class="min-w-[900px] border-collapse text-xs">
                  <thead class="bg-slate-100 text-slate-600">
                    <tr>
                      <th class="border-b border-slate-200 px-2 py-2 text-left">Appointed Date</th>
                      <th class="border-b border-slate-200 px-2 py-2 text-left">Instructor Name</th>
                      <th class="border-b border-slate-200 px-2 py-2 text-left">Subject</th>
                      <th class="border-b border-slate-200 px-2 py-2 text-left">Feedback to the student</th>
                      <th class="border-b border-slate-200 px-2 py-2 text-left">Note for administrator/instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="align-top">
                      <td class="border-b border-slate-100 px-2 py-2">
                        02/11/2026 13:00 (Philippines)
                        <br />
                        02/11/2026 14:00 (Japan)
                      </td>
                      <td class="border-b border-slate-100 px-2 py-2">Alma Oliviero</td>
                      <td class="border-b border-slate-100 px-2 py-2">[DC] Daily Conversation</td>
                      <td class="border-b border-slate-100 px-2 py-2">
                        Points achieved: stronger sentence control and clearer idea organization.
                        <br />
                        Points for improvement: reduce grammar slips and improve transition words.
                      </td>
                      <td class="border-b border-slate-100 px-2 py-2">
                        B2.5 No spelling concern.
                        <br />
                        https://docs.google.com/document/d/example-log-1
                      </td>
                    </tr>
                    <tr class="align-top">
                      <td class="px-2 py-2">
                        01/18/2026 15:00 (Philippines)
                        <br />
                        01/18/2026 16:00 (Japan)
                      </td>
                      <td class="px-2 py-2">Hanna Pekitpikit</td>
                      <td class="px-2 py-2">[PP201] Pronunciation - Consonants</td>
                      <td class="px-2 py-2">
                        Points achieved: better /r/ and /l/ production with reading drills.
                        <br />
                        Points for improvement: stabilize word stress and pacing.
                      </td>
                      <td class="px-2 py-2">
                        B2.5 Needs follow-up reading drill.
                        <br />
                        https://docs.google.com/document/d/example-log-2
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="detailsTab === 'reservations'" class="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              Reservation history for {{ detailsEntry.student }} will appear here.
            </div>

            <EditableMaterials v-if="detailsTab === 'materials'" :entry="detailsEntry" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isTimeModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      @click="isTimeModalOpen = false"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        @click.stop
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="m-0 text-lg font-semibold text-slate-900">Simulate Current Time</h3>
          <button
            @click="isTimeModalOpen = false"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div class="mb-4 flex items-center justify-center">
          <div class="relative h-44 w-44 rounded-full border-4 border-slate-200 bg-slate-50">
            <div class="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700" />
            <div
              class="absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-full rounded bg-slate-600 origin-bottom"
              :style="{ transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)` }"
            />
            <div
              class="absolute left-1/2 top-1/2 h-16 w-0.5 -translate-x-1/2 -translate-y-full rounded bg-primary origin-bottom"
              :style="{ transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)` }"
            />
          </div>
        </div>

        <p class="mb-2 text-center text-xl font-bold text-slate-900">{{ draftClock }}</p>
        <input
          type="range"
          min="0"
          max="1439"
          v-model.number="draftMinutes"
          class="w-full accent-primary"
        />
        <p class="mt-2 text-center text-xs text-slate-500">
          Drag the slider to set time and preview student change.
        </p>
        <p :class="`mt-2 text-center text-sm font-semibold ${modalCountdownColor}`">
          {{ formatCountdown(previewClass.date, previewNow) }}
        </p>

        <div class="mt-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Speed
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="speed in simulationSpeeds"
              :key="speed"
              @click="simulationSpeed = speed"
              :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                simulationSpeed === speed
                  ? 'bg-primary text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`"
            >
              {{ speed }}x
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button
            @click="toggleSimulation"
            class="rounded-lg border border-primary bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            {{ isSimulationRunning ? "Pause" : "Start" }}
          </button>
          <button
            @click="useRealTime"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Use Real Time
          </button>
          <button
            @click="applySimulatedTime"
            class="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Apply Simulated Time
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="studentProfileEntry"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
      @click="closeStudentProfileModal"
    >
      <div
        class="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <h3 class="m-0 text-base font-semibold text-slate-900">Student Profile</h3>
          <button
            @click="closeStudentProfileModal"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div class="grid gap-4 bg-slate-50 p-4 sm:grid-cols-[260px,1fr] sm:p-5">
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-center">
              <img
                :src="studentImage"
                :alt="`${studentProfileEntry.student} profile`"
                class="h-56 w-56 rounded-full object-cover"
              />
            </div>
            <div class="mt-4 space-y-2 border-t border-slate-200 pt-3">
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">ID:</p>
                <p class="m-0 text-sm text-slate-800">{{ studentProfileEntry.studentId }}</p>
              </div>
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Name in Roman:
                </p>
                <p class="m-0 inline-flex items-center gap-1 text-sm text-slate-800">
                  {{ studentProfileData.romanName }}
                  <span class="material-symbols-outlined text-base text-slate-500">content_copy</span>
                </p>
              </div>
              <div>
                <p class="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Name in Japanese:
                </p>
                <p class="m-0 inline-flex items-center gap-1 text-sm text-slate-800">
                  {{ studentProfileData.japaneseName }}
                  <span class="material-symbols-outlined text-base text-slate-500">content_copy</span>
                </p>
              </div>
            </div>
          </div>

          <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Membership type:</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileEntry.member }}</p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Gender:</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileData.gender }}</p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Birth Date:</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileData.birthDate }}</p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">E-mail:</p>
              <p class="m-0 inline-flex items-center gap-2 px-4 py-3 text-sm text-slate-800">
                {{ studentProfileData.email }}
                <span class="material-symbols-outlined text-base text-slate-500">content_copy</span>
              </p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Gmail:</p>
              <p class="m-0 inline-flex items-center gap-2 px-4 py-3 text-sm text-slate-800">
                {{ studentProfileData.gmail }}
                <span class="material-symbols-outlined text-base text-slate-500">content_copy</span>
              </p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Learning Purpose:</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileData.learningPurpose }}</p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Exam Score(s):</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileData.examScores }}</p>
            </div>
            <div class="grid grid-cols-[220px,1fr] border-b border-slate-200">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Hidden Note:</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileData.hiddenNote }}</p>
            </div>
            <div class="grid grid-cols-[220px,1fr]">
              <p class="m-0 bg-slate-100 px-4 py-3 text-sm text-slate-700">Time Zone:</p>
              <p class="m-0 px-4 py-3 text-sm text-slate-800">{{ studentProfileData.timeZone }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <button
              @click="toggleStudentProfileTab('logs')"
              :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                studentProfileTab === 'logs'
                  ? 'bg-primary text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`"
            >
              Lesson Logs
            </button>
            <button
              @click="toggleStudentProfileTab('reservations')"
              :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                studentProfileTab === 'reservations'
                  ? 'bg-primary text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`"
            >
              Reservation List
            </button>
            <button
              @click="toggleStudentProfileTab('materials')"
              :class="`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                studentProfileTab === 'materials'
                  ? 'bg-primary text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`"
            >
              Materials
            </button>
          </div>
        </div>

        <div v-if="studentProfileTab" class="border-t border-slate-200 bg-white px-4 py-4 sm:px-5 sm:py-5">
          <ProfileLessonLogs v-if="studentProfileTab === 'logs'" :entry="studentProfileEntry" />
          <ProfileReservationList v-if="studentProfileTab === 'reservations'" :entry="studentProfileEntry" />
          <EditableMaterials v-if="studentProfileTab === 'materials'" :entry="studentProfileEntry" />
        </div>
      </div>
    </div>
  </div>
</template>
