<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
    <LevelReminderCard />

    <!-- Filters -->
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="relative md:w-80">
        <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
        <input
          v-model="search"
          type="search"
          placeholder="Search students by name"
          aria-label="Search students"
          class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
        />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="level"
          aria-label="Filter by level"
          class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
        >
          <option value="All">All levels</option>
          <option v-for="l in BRELAS_LEVELS" :key="l.code" :value="l.code">{{ l.code }} — {{ l.label }}</option>
        </select>
        <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="group" aria-label="Filter by band">
          <button
            v-for="b in bands"
            :key="b"
            type="button"
            @click="band = b"
            class="rounded-lg px-3 py-1.5 transition"
            :class="band === b ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          >
            {{ b }}
          </button>
        </div>
        <label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
          <input v-model="unassessedOnly" type="checkbox" class="h-4 w-4 accent-brighture-ink" />
          Unassessed only
        </label>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[920px] text-left text-sm">
          <thead class="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">Student</th>
              <th class="px-4 py-3">BRELAS level</th>
              <th class="px-4 py-3">Band</th>
              <th class="px-4 py-3">Rating</th>
              <th class="px-4 py-3">NFA</th>
              <th class="px-4 py-3">Last changed</th>
              <th class="px-4 py-3">
                <span title="Eligible for one free Trial Lesson & Assessment">New student (free TA)</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in rows"
              :key="row.id"
              @click="openStudent(row.id)"
              @keydown.enter="openStudent(row.id)"
              tabindex="0"
              class="cursor-pointer transition hover:bg-brighture-cream/60 focus:bg-brighture-cream/60 focus:outline-none"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="row.photo" alt="" class="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm" />
                  <div class="min-w-0">
                    <p class="truncate font-bold text-slate-900">{{ row.name }}</p>
                    <p class="text-[11px] text-slate-500">#{{ row.id }} · {{ row.membership }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3"><LevelChip :value="row.summary.value" compact /></td>
              <td class="px-4 py-3">
                <span v-if="row.summary.band" class="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1" :class="BAND_STYLES[row.summary.band]">{{ row.summary.band }}</span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-3 tabular-nums">
                <span v-if="row.summary.rating" class="font-bold text-slate-800">{{ row.summary.rating }}<span class="font-semibold text-slate-400">/15</span></span>
                <span v-else-if="row.summary.code === 'B0'" class="text-xs font-semibold text-slate-500">B0</span>
                <span v-else class="text-slate-400">—</span>
                <span v-if="row.summary.cefr" class="block text-[10px] font-semibold text-slate-400">CEFR {{ row.summary.cefr }}</span>
              </td>
              <td class="max-w-[240px] px-4 py-3">
                <p class="truncate text-xs text-slate-600" :title="row.summary.nfa">{{ row.summary.nfa || '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{{ row.summary.lastChanged ? day(row.summary.lastChanged) : '—' }}</td>
              <td class="px-4 py-3" @click.stop @keydown.enter.stop>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="row.isNew ? 'true' : 'false'"
                    :aria-label="`${row.name}: eligible for a free trial`"
                    @click="toggleNew(row)"
                    class="relative h-5 w-9 shrink-0 rounded-full transition"
                    :class="row.isNew ? 'bg-emerald-500' : 'bg-slate-300'"
                  >
                    <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" :class="row.isNew ? 'left-[18px]' : 'left-0.5'"></span>
                  </button>
                  <span v-if="row.isNew && !row.taEligible" class="text-[11px] font-semibold text-slate-500">Trial booked</span>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-slate-500">No students match these filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p class="text-xs text-slate-500">
      <i class="fa-solid fa-circle-info mr-1 text-slate-400"></i>
      Each level has three ratings, one per band: Needs improvement, Satisfactory, Very satisfactory (1–3 is B1, 4–6 B2, up to 13–15 A).
      "Unassessed" means the student has never been rated. B0 is a real result: assessed, with no foundation yet. CEFR is for reference only.
    </p>

    <!-- ===================== Student drawer ===================== -->
    <!-- !mt-0: the page's space-y spacing would otherwise push this fixed layer 20px down from the top. -->
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
      <div v-if="selected" class="fixed inset-0 z-40 !mt-0 bg-slate-900/50" @click="closeStudent"></div>
    </Transition>
    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full" leave-active-class="transition-transform duration-200 ease-in" leave-to-class="translate-x-full">
      <aside
        v-if="selected"
        class="fixed inset-y-0 right-0 z-50 !mt-0 flex w-full max-w-2xl flex-col bg-slate-50 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="`${selected.name}: level and history`"
      >
        <header class="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <img :src="selected.photo" alt="" class="h-11 w-11 rounded-full object-cover" />
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-base font-black text-slate-900">{{ selected.name }}</h2>
            <p class="text-xs text-slate-500">#{{ selected.id }} · {{ selected.membership }} · {{ selected.category }}</p>
          </div>
          <button type="button" @click="closeStudent" class="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div ref="drawerBody" class="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <!-- Summary -->
          <section class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex flex-wrap items-center gap-2">
              <LevelChip :value="summary.value" />
              <span v-if="summary.code" class="text-xs font-semibold text-slate-500">{{ summary.label }}</span>
              <span v-if="summary.cefr" class="text-[11px] font-semibold text-slate-400">CEFR {{ summary.cefr }} (reference)</span>
            </div>
            <!-- Fifteen steps in five groups of three: one group per level,
                 its three cells the bands. -->
            <div v-if="summary.rating" class="mt-3">
              <div class="flex gap-2" :aria-label="`Rating ${summary.rating} of 15`">
                <div v-for="g in 5" :key="g" class="flex flex-1 gap-0.5">
                  <span
                    v-for="k in 3"
                    :key="k"
                    class="h-2 flex-1 rounded-full"
                    :class="(g - 1) * 3 + k <= summary.rating ? 'bg-brighture-gold' : 'bg-slate-100'"
                  ></span>
                </div>
              </div>
              <div class="mt-1 flex gap-2 text-[9px] font-bold text-slate-400">
                <span v-for="c in ['B1', 'B2', 'I1', 'I2', 'A']" :key="c" class="flex-1 text-center">{{ c }}</span>
              </div>
              <p class="mt-1 text-[11px] font-bold text-slate-500">Rating {{ summary.rating }} of 15 · {{ summary.band }}</p>
            </div>
            <p v-else-if="summary.code === 'B0'" class="mt-2 text-xs text-slate-500">Assessed — no foundation yet (no rating).</p>
            <p v-else class="mt-2 text-xs text-slate-500">No level yet. Set one below, or wait for the first assessment.</p>
            <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-[11px] font-bold text-slate-500">Last changed</dt>
                <dd class="text-slate-800">{{ summary.lastChanged ? stamp(summary.lastChanged) : '—' }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-bold text-slate-500">Free trial (TA)</dt>
                <dd class="text-slate-800">{{ selected.isNew ? (school.taEligible(selected.id) ? 'Eligible' : 'Booked or taken') : 'Not eligible' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-[11px] font-bold text-slate-500">NFA <span class="font-semibold text-slate-400">(internal)</span></dt>
                <dd class="whitespace-pre-line text-slate-800">{{ summary.nfa || '—' }}</dd>
              </div>
            </dl>
          </section>

          <!-- Change level -->
          <section class="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 class="text-sm font-black text-slate-900">{{ summary.code ? 'Change level' : 'Set level' }}</h3>
            <p class="mt-0.5 text-xs text-slate-500">The change is recorded in the history with your reason. The student is not told.</p>
            <form class="mt-3 space-y-3" @submit.prevent="changeLevel">
              <div>
                <label for="new-level" class="text-[11px] font-bold text-slate-600">New BRELAS rating</label>
                <select
                  id="new-level"
                  v-model="form.to"
                  class="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                  :class="formErrors.to ? 'border-rose-400' : 'border-slate-200 focus:border-brighture-gold'"
                >
                  <option value="">Choose a rating</option>
                  <!-- One group per level, highest first; the value is the rating -->
                  <optgroup v-for="g in ratingGroups" :key="g.code" :label="`${g.code} — ${g.label} (CEFR ${g.cefr})`">
                    <option v-for="o in g.options" :key="o.value" :value="o.value" :disabled="o.value === summary.value">
                      {{ o.rating ? `${o.rating} — ${o.band}` : 'B0 — No foundation yet' }}{{ o.value === summary.value ? ' · current' : '' }}
                    </option>
                  </optgroup>
                </select>
                <p v-if="formErrors.to" class="mt-1 text-xs font-semibold text-rose-600">{{ formErrors.to }}</p>
              </div>
              <div>
                <label for="level-reason" class="text-[11px] font-bold text-slate-600">Reason <span class="text-rose-500">*</span></label>
                <textarea
                  id="level-reason"
                  v-model="form.reason"
                  rows="3"
                  maxlength="500"
                  placeholder="e.g. Corrected after reviewing the CS recording with the teacher."
                  class="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                  :class="formErrors.reason ? 'border-rose-400' : 'border-slate-200 focus:border-brighture-gold'"
                ></textarea>
                <p v-if="formErrors.reason" class="mt-1 text-xs font-semibold text-rose-600">{{ formErrors.reason }}</p>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="rounded-xl bg-brighture-ink px-4 py-2 text-sm font-black text-white hover:bg-black">
                  {{ summary.code ? 'Change level' : 'Set level' }}
                </button>
              </div>
            </form>
          </section>

          <!-- History -->
          <section>
            <h3 class="mb-2 text-sm font-black text-slate-900">Change history</h3>
            <p v-if="!history.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
              No changes yet. This student is unassessed.
            </p>
            <ol v-else class="space-y-2.5">
              <li v-for="h in history" :key="h.id" class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold" :class="h.from === null ? 'italic text-slate-400' : 'text-slate-500'">{{ ratingText(h.from) }}</span>
                  <i class="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
                  <span class="text-sm font-black text-slate-900">{{ ratingText(h.to) }}</span>
                  <span class="ml-auto whitespace-nowrap text-[11px] font-semibold text-slate-500">{{ stamp(h.at) }}</span>
                </div>
                <p class="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  Set by:
                  <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ring-1" :class="(BY_KIND[h.by?.kind] ?? BY_KIND.admin).style">
                    <i :class="(BY_KIND[h.by?.kind] ?? BY_KIND.admin).icon" class="text-[9px]"></i>
                    {{ (BY_KIND[h.by?.kind] ?? BY_KIND.admin).label }}
                  </span>
                  <span v-if="h.by?.kind !== 'migration'" class="font-bold text-slate-800">{{ h.by?.name }}</span>
                </p>
                <p class="mt-1 whitespace-pre-line text-sm text-slate-800">{{ h.reason }}</p>
                <p v-if="h.nfa && h.by?.kind === 'migration'" class="mt-1 text-xs text-slate-500">
                  <span class="font-bold">NFA carried over:</span> {{ h.nfa }}
                </p>
                <button
                  v-if="h.assessmentId && school.findAssessment(h.assessmentId)"
                  type="button"
                  @click="showAssessment(h.assessmentId)"
                  class="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brighture-bronze hover:text-brighture-ink"
                >
                  <span class="rounded px-1.5 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[school.findAssessment(h.assessmentId).type]">{{ school.findAssessment(h.assessmentId).type }}</span>
                  View the {{ ASSESSMENT_TYPES[school.findAssessment(h.assessmentId).type].short.toLowerCase() }}
                </button>
              </li>
            </ol>
          </section>

          <!-- Assessments -->
          <section>
            <h3 class="mb-2 text-sm font-black text-slate-900">Assessments</h3>
            <p v-if="!studentAssessments.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
              No assessments yet.
            </p>
            <ul v-else class="space-y-2.5">
              <li v-for="a in studentAssessments" :key="a.id" :id="`as-row-${a.id}`" class="rounded-2xl border bg-white" :class="openAssessment === a.id ? 'border-brighture-gold/60' : 'border-slate-200'">
                <button type="button" @click="openAssessment = openAssessment === a.id ? null : a.id" class="flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left">
                  <span class="rounded px-1.5 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[a.type]">{{ a.type }}</span>
                  <span class="text-sm font-bold text-slate-800">{{ stamp(a.scheduledAt) }}</span>
                  <span class="text-xs text-slate-500">with {{ school.teacher(a.teacherId).name }}</span>
                  <span class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-black ring-1" :class="STATUS_STYLES[a.status]">{{ STATUS_LABELS[a.status] }}</span>
                  <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform" :class="openAssessment === a.id ? 'rotate-180' : ''"></i>
                </button>
                <div v-if="openAssessment === a.id" class="border-t border-slate-100 px-4 py-4">
                  <AssessmentResults :assessment="a" />
                </div>
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { ASSESSMENT_TYPES, BAND_STYLES, BANDS, BRELAS_LEVELS, RATING_OPTIONS, levelInfo } from '@/lib/brelas';
import LevelChip from './components/LevelChip.vue';
import LevelReminderCard from './components/LevelReminderCard.vue';
import AssessmentResults from './components/AssessmentResults.vue';
import { BY_KIND, STATUS_LABELS, STATUS_STYLES, TYPE_STYLES, day, ratingSortKey, ratingText, stamp, showToast } from './adminUi';

const school = useSchoolStore();

const bands = ['All', ...BANDS];

/** Rating choices grouped by level, highest level first, B0 last. */
const ratingGroups = [...BRELAS_LEVELS].reverse().map((l) => ({
  ...l,
  options: RATING_OPTIONS.filter((o) => o.code === l.code),
}));
const band = ref('All');
const unassessedOnly = ref(false);
const level = ref('All');
const search = ref('');

const allRows = computed(() => Object.values(school.db.students).map((s) => ({
  ...s,
  summary: school.levelSummary(s.id),
  taEligible: school.taEligible(s.id),
})));

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return allRows.value
    .filter((r) => (band.value === 'All' || r.summary.band === band.value))
    .filter((r) => level.value === 'All' || r.summary.code === level.value)
    .filter((r) => !unassessedOnly.value || r.summary.value === null)
    .filter((r) => !q || r.name.toLowerCase().includes(q))
    // Highest rating first; B0 below rating 1; Unassessed last.
    .sort((a, b) => ratingSortKey(b.summary.value) - ratingSortKey(a.summary.value) || a.name.localeCompare(b.name));
});

const toggleNew = (row) => {
  const s = school.db.students[row.id];
  s.isNew = !s.isNew;
  showToast(s.isNew
    ? `${s.name} can now book one free Trial Lesson & Assessment.`
    : `${s.name} can no longer book a free trial.`);
};

// ── Drawer ────────────────────────────────────────────────────────────
const selectedId = ref(null);
const selected = computed(() => (selectedId.value ? school.db.students[selectedId.value] ?? null : null));
const summary = computed(() => school.levelSummary(selectedId.value));
const history = computed(() => [...summary.value.history].reverse());
const studentAssessments = computed(() => school.assessmentsForStudent(selectedId.value)
  .slice()
  .sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? '')));
const openAssessment = ref(null);
const drawerBody = ref(null);

const form = reactive({ to: '', reason: '' });
const formErrors = reactive({ to: '', reason: '' });
const resetForm = () => {
  form.to = '';
  form.reason = '';
  formErrors.to = '';
  formErrors.reason = '';
};

const openStudent = (id) => {
  selectedId.value = id;
  openAssessment.value = null;
  resetForm();
};
const closeStudent = () => { selectedId.value = null; };

const showAssessment = (id) => {
  openAssessment.value = id;
  nextTick(() => document.getElementById(`as-row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
};

/** setLevel refuses silently without a reason or with no change, so say why here first. */
const changeLevel = () => {
  formErrors.to = '';
  formErrors.reason = '';
  if (form.to === '' || form.to === null) formErrors.to = 'Choose the new rating.';
  else if (form.to === summary.value.value) formErrors.to = 'That is already the current rating.';
  if (!form.reason.trim()) formErrors.reason = 'Add a reason. Every level change needs one, so the next admin or teacher knows why.';
  if (formErrors.to || formErrors.reason) return;
  const entry = school.setLevel(selectedId.value, form.to, { by: { kind: 'admin', name: 'Admin' }, reason: form.reason });
  if (!entry) {
    showToast('The level could not be changed. Try again.', 'error');
    return;
  }
  showToast(`${selected.value.name} is now ${ratingText(entry.to)}. The change is in the history.`);
  resetForm();
  drawerBody.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

const onKey = (e) => { if (e.key === 'Escape' && selectedId.value) closeStudent(); };
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
// A reset can remove the student being viewed.
watch(selected, (s) => { if (!s) selectedId.value = null; });
</script>
