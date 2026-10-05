<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-100 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      @click.self="close"
    >
      <div
        ref="modalEl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-title"
        class="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div class="shrink-0 border-b border-slate-200 px-6 py-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 id="template-title" class="text-lg font-black tracking-tight text-slate-900">
                Schedule template
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">
                The hours you teach in a normal week. Every week starts from this, until you change
                that week on its own.
              </p>
              <button
                type="button"
                @click="clearTemplate"
                :disabled="isEmpty"
                class="mt-1.5 cursor-pointer text-[11px] font-bold text-rose-600 transition hover:text-rose-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
              >
                {{ pendingClear ? 'Clear every hour? Tap again' : 'Clear template' }}
              </button>
            </div>

            <button
              type="button"
              @click="close"
              aria-label="Close"
              class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- How to use the board on the left, what it currently holds on the
               right — both at the foot of the header, reading as a caption for
               the thing directly beneath them. -->
          <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <p class="text-slate-500">Drag across the board to pick hours, then open or reserve them.</p>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{{ openCount }} open
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-indigo-800">
              <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>{{ reservedCount }} reserved
              </span>
            </div>
          </div>
        </div>

        <!-- Day names, outside the scroller so they stay put -->
        <!-- The scrollbar takes width from the board below but not from this
             row, so the same amount is reserved here. It was being set as a
             custom property on the scroller and read here, on its sibling —
             properties inherit downwards, not sideways, so it never applied. -->
        <div
          class="flex shrink-0 border-b border-slate-200 bg-slate-50/70"
          :style="{ paddingRight: `${scrollbar}px` }"
        >
          <div class="w-14 shrink-0 border-r border-slate-200"></div>
          <div class="grid flex-1" :style="{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }">
            <div
              v-for="d in DAYS"
              :key="`h-${d.key}`"
              class="border-r border-slate-200 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              {{ d.short }}
            </div>
          </div>
        </div>

        <!-- The board. Same gesture as the calendar: press, drag, release. -->
        <div
          ref="scroller"
          class="relative flex min-h-0 flex-1 overflow-y-auto select-none"
          @scroll="measureScrollbar"
        >
          <div class="w-14 shrink-0 border-r border-slate-200 bg-white">
            <div v-for="h in 24" :key="`t-${h}`" class="relative" :style="{ height: `${ROW * 2}px` }">
              <span
                class="absolute right-2 text-[10px] font-bold tabular-nums text-slate-400"
                :class="h === 1 ? 'top-0.5' : '-top-2'"
              >
                {{ hourLabel(h - 1) }}
              </span>
            </div>
          </div>

          <div
            class="relative grid flex-1"
            :style="{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))`, height: `${48 * ROW}px` }"
            @mousedown="onDown"
          >
            <!-- One grid, drawn above the cells so a rule never changes weight -->
            <div class="pointer-events-none absolute inset-0 z-[5] flex flex-col">
              <div
                v-for="h in 24"
                :key="`r-${h}`"
                class="border-b border-slate-200/80"
                :style="{ height: `${ROW * 2}px` }"
              ></div>
            </div>
            <div
              class="pointer-events-none absolute inset-0 z-[5] grid"
              :style="{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }"
            >
              <div v-for="d in DAYS" :key="`v-${d.key}`" class="border-r border-slate-200"></div>
            </div>

            <div
              v-for="(d, col) in DAYS"
              :key="d.key"
              :ref="(el) => (colEls[col] = el)"
              class="relative cursor-crosshair"
            >
              <div
                v-for="slot in 48"
                :key="slot"
                class="transition-colors"
                :style="{ height: `${ROW}px` }"
                :class="cellClass(d.key, slot - 1, col)"
              ></div>

              <!-- A run reads as one block with its hours on it. Flat colour
                   alone meant the only way to know what a held run was for was
                   to select it and look at the panel. -->
              <div
                v-for="run in runsIn(d.key)"
                :key="`run-${d.key}-${run.start}`"
                class="pointer-events-none absolute inset-x-0 z-[4] flex items-start overflow-hidden px-1"
                :style="{ top: `${run.start * ROW}px`, height: `${(run.end - run.start + 1) * ROW}px` }"
              >
                <span
                  class="truncate text-[9px] font-bold leading-[14px]"
                  :class="run.status === 'open' ? 'text-emerald-800/80' : 'text-indigo-900/80'"
                >{{ run.text }}</span>
              </div>
            </div>

            <!-- The swept run -->
            <div
              v-if="selection"
              class="pointer-events-none absolute z-[6] rounded-md border-2 border-amber-500 shadow-[0_0_0_3px_rgb(245_158_11_/_0.18)]"
              :style="sweepBox"
            ></div>

          </div>
        </div>

        <!-- The span, then what is selected. The span is a setting that every
             action here obeys, not a property of one sweep, so it stays put
             whether or not anything is selected — it can be chosen before the
             first drag rather than discovered after it. -->
        <div class="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div class="flex flex-wrap items-center gap-2 text-[11px]">
            <span class="font-semibold text-slate-500">For</span>
            <div class="flex items-center gap-1 rounded-full bg-white p-0.5 ring-1 ring-slate-200">
              <button
                v-for="opt in SPANS"
                :key="opt.value"
                type="button"
                :aria-pressed="repeatSpan === opt.value ? 'true' : 'false'"
                @click="repeatSpan = opt.value"
                class="cursor-pointer rounded-full px-2.5 py-1 font-bold transition"
                :class="repeatSpan === opt.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'"
              >
                {{ opt.label }}
              </button>
            </div>

            <label v-if="repeatSpan === 'weeks'" class="flex items-center gap-1.5 text-slate-500">
              <input
                type="number"
                v-model.number="repeatWeeks"
                @change="repeatWeeks = clampInt(repeatWeeks, 1, 52)"
                @blur="repeatWeeks = clampInt(repeatWeeks, 1, 52)"
                min="1"
                max="52"
                aria-label="Number of weeks"
                class="w-12 rounded-md border border-slate-200 bg-white px-2 py-1 text-center font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
              />
              <span>{{ repeatWeeks === 1 ? 'week' : 'weeks' }}</span>
            </label>

            <input
              v-if="repeatSpan === 'until'"
              type="date"
              v-model="repeatUntil"
              :min="teacher.manilaNow.iso"
              aria-label="Repeat until this date"
              class="rounded-md border border-slate-200 bg-white px-2 py-1 font-bold text-slate-800 focus:border-indigo-400 focus:outline-none"
            />

            <p class="basis-full text-[11px] text-slate-400">{{ spanNote }}</p>
          </div>

          <div v-if="pendingOps.length" class="mt-2.5 space-y-1 border-t border-slate-200 pt-2.5">
            <div
              v-for="(op, i) in pendingOps"
              :key="`op-${i}`"
              class="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[11px] ring-1 ring-slate-200"
            >
              <span
                class="h-2 w-2 shrink-0 rounded-full"
                :class="op.status === 'open' ? 'bg-emerald-500' : op.status === 'reserved' ? 'bg-indigo-500' : 'bg-slate-400'"
              ></span>
              <span class="min-w-0 flex-1 truncate text-slate-600">{{ op.label }}</span>
              <button
                type="button"
                :aria-label="`Remove ${op.label}`"
                @click="pendingOps.splice(i, 1)"
                class="shrink-0 cursor-pointer rounded px-1 text-slate-400 transition hover:text-rose-600"
              >
                <i class="fa-solid fa-xmark text-[10px]"></i>
              </button>
            </div>
            <p class="text-[11px] text-slate-400">
              Dated runs — written to those weeks when you save, on top of the template.
            </p>
          </div>
        </div>

        <!-- The actions, on the selection itself. They used to live in a bar
             at the foot of the modal, a long way from the hours they were
             about — you picked a run at the top of the board and then had to
             look to the bottom of the dialog to do anything with it. -->
        <div
          v-if="summary"
          ref="cardEl"
          class="absolute z-[8] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          :style="popoverStyle"
          @mousedown.stop
        >
          <div class="flex items-start gap-1 px-1 pb-1.5">
            <p class="min-w-0 flex-1 text-[11px] leading-tight text-slate-500">
              <strong class="font-extrabold text-slate-900">{{ summary.label }}</strong>
              <span class="tabular-nums"> {{ summary.time }}</span>
              <br />
              <span>{{ summary.slots }} {{ summary.slots === 1 ? 'slot' : 'slots' }} · {{ selectionFill.note }}</span>
            </p>
            <button
              type="button"
              @click="selection = null; askingLabel = false"
              aria-label="Cancel selection"
              class="-mr-0.5 -mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <i class="fa-solid fa-xmark text-[11px]"></i>
            </button>
          </div>

            <div v-if="!askingLabel" class="flex flex-col gap-1">
              <button
                v-if="selectionFill.kind !== 'filled'"
                type="button"
                @click="apply('open')"
                class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95"
              >
                <i class="fa-solid fa-check text-[10px]"></i> Open
              </button>
              <button
                v-if="selectionFill.kind !== 'filled'"
                type="button"
                @click="askingLabel = true"
                class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
              >
                <i class="fa-solid fa-bookmark text-[10px]"></i> Reserve
              </button>
              <button
                v-if="selectionFill.kind !== 'empty'"
                type="button"
                @click="apply('closed')"
                class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 active:scale-95"
              >
                <i class="fa-regular fa-trash-can text-[10px]"></i> Clear
              </button>
            </div>

            <!-- Reserve asks what for. The field is the whole step, so it takes
                 focus and Enter finishes it. -->
            <div v-else class="flex flex-col gap-1">
              <input
                ref="labelInput"
                type="text"
                v-model="reserveLabel"
                aria-label="What are these hours for?"
                placeholder="What is it for?"
                @keydown.enter.prevent="apply('reserved')"
                @keydown.esc.prevent="askingLabel = false"
                class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
              />
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="apply('reserved')"
                  class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                >
                  <i class="fa-solid fa-bookmark text-[10px]"></i> Hold
                </button>
                <button
                  type="button"
                  @click="askingLabel = false"
                  class="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100"
                >
                  Back
                </button>
              </div>
              <p class="px-1 text-[10px] leading-tight text-slate-400">Leave it blank to just hold the time.</p>
            </div>
          </div>

        <!-- A week edited on its own stops following the template, so a change
             here would appear not to reach it. Saying so, and offering to put
             those weeks back, is what makes "every week" true. -->
        <label
          v-if="editedWeekCount && repeatSpan === 'always'"
          class="flex shrink-0 cursor-pointer items-start gap-2.5 border-t border-amber-200 bg-amber-50 px-6 py-2.5 text-[11px] text-amber-900"
        >
          <input type="checkbox" v-model="replaceEditedWeeks" class="mt-0.5 h-3.5 w-3.5 accent-amber-600 cursor-pointer" />
          <span>
            <strong class="font-bold">
              Apply to the {{ editedWeekCount }} upcoming {{ editedWeekCount === 1 ? 'week' : 'weeks' }} you edited by hand
            </strong>
            — those weeks stopped following the template; ticking this gives them these hours and
            discards their own. Weeks already past are left alone.
          </span>
        </label>

        <!-- Footer -->
        <div class="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-6 py-3">
          <p class="min-w-0 truncate text-[11px] text-slate-400">{{ primaryAction.hint }}</p>

          <div class="flex items-center gap-2">
            <!-- Nothing to save until something changes, so the button is not
                 there to be pressed pointlessly — and its presence is the only
                 notice the modal gives that there is unsaved work. -->
            <button
              type="button"
              @click="close"
              class="cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {{ isDirty ? 'Cancel' : 'Close' }}
            </button>
            <button
              type="button"
              :disabled="!primaryAction.enabled"
              :title="primaryAction.hint"
              @click="runPrimary"
              class="cursor-pointer rounded-full bg-brighture-gold px-5 py-1.5 text-xs font-extrabold text-brighture-ink shadow-xs transition hover:bg-brighture-gold-deep active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {{ primaryAction.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { useTeacherStore } from '@/stores/useTeacherStore';

const props = defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'saved']);

const teacher = useTeacherStore();

const ROW = 14; // half-hour row height; 48 of them make the day
const DAYS = [
  { key: 'sun', short: 'Sun', letter: 'S', name: 'Sunday' },
  { key: 'mon', short: 'Mon', letter: 'M', name: 'Monday' },
  { key: 'tue', short: 'Tue', letter: 'T', name: 'Tuesday' },
  { key: 'wed', short: 'Wed', letter: 'W', name: 'Wednesday' },
  { key: 'thu', short: 'Thu', letter: 'T', name: 'Thursday' },
  { key: 'fri', short: 'Fri', letter: 'F', name: 'Friday' },
  { key: 'sat', short: 'Sat', letter: 'S', name: 'Saturday' },
];

/**
 * The modal edits a copy, not the live pattern.
 *
 * Cancel has to mean something: a template is the shape every unedited week
 * takes, so changing it by accident changes weeks the instructor is not even
 * looking at. Nothing leaves this component until Save.
 */
const draft = ref({});
const scroller = ref(null);
const labelInput = ref(null);
const askingLabel = ref(false);
const POPOVER_W = 190;
/** Where the drag finished, in the board's own coordinates. */
const lastPoint = ref({ x: 0, y: 0 });
const modalEl = ref(null);
/** The board scrolls, so what counts as "room below" moves with it. */
const scrollY = ref(0);
const colEls = ref([]);
const selection = ref(null); // { fromDay, fromSlot, toDay, toSlot }
const SPANS = [
  { value: 'always', label: 'Every week' },
  { value: 'weeks', label: 'A run of weeks' },
  { value: 'until', label: 'Until a date' },
];
const repeatSpan = ref('always');
const repeatWeeks = ref(5);
const repeatUntil = ref('');
/** Dated writes queued up; the template grid above cannot show them. */
const pendingOps = ref([]);

const clampInt = (v, lo, hi) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const plusDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const pretty = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const reserveLabel = ref('');
const scrollbar = ref(0);

const keyOf = (dayKey, slot) => `${dayKey}-${teacher.scheduleSlots[slot]?.key}`;

const statusOf = (dayKey, slot) => {
  const v = draft.value[keyOf(dayKey, slot)];
  if (!v) return 'closed';
  if (v === true || v === 'open' || v?.status === 'open') return 'open';
  if (v === 'reserved' || v?.status === 'reserved') return 'reserved';
  return 'closed';
};

const hourLabel = (h) => (h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`);
const clockOf = (slot) => `${String(Math.floor(slot / 2)).padStart(2, '0')}:${slot % 2 ? '30' : '00'}`;

const rect = computed(() => {
  const s = selection.value;
  if (!s) return null;
  return {
    d0: Math.min(s.fromDay, s.toDay),
    d1: Math.max(s.fromDay, s.toDay),
    s0: Math.min(s.fromSlot, s.toSlot),
    s1: Math.max(s.fromSlot, s.toSlot),
  };
});

const cellClass = (dayKey, slot, col) => {
  const r = rect.value;
  const inSweep = r && col >= r.d0 && col <= r.d1 && slot >= r.s0 && slot <= r.s1;
  const status = statusOf(dayKey, slot);
  if (status === 'open') return inSweep ? 'bg-emerald-300' : 'bg-emerald-100 hover:bg-emerald-200';
  if (status === 'reserved') return inSweep ? 'bg-indigo-300' : 'bg-indigo-100 hover:bg-indigo-200';
  // Bare grid reacts too, so the board reads as something you act on before
  // anyone has tried dragging it.
  return inSweep ? 'bg-amber-200' : 'hover:bg-slate-100';
};

/**
 * Contiguous hours of the same kind, as one block. The grid is drawn cell by
 * cell, so without this a three-hour hold is thirty-six separate rectangles
 * with nowhere to put its name.
 */
const runsIn = (dayKey) => {
  const out = [];
  let cur = null;
  for (let sl = 0; sl < 48; sl += 1) {
    const status = statusOf(dayKey, sl);
    const v = draft.value[keyOf(dayKey, sl)];
    const reason = status === 'reserved' ? (v?.reason && v.reason !== 'Reserved' ? v.reason : '') : '';
    if (status === 'closed') { cur = null; continue; }
    if (cur && cur.status === status && cur.reason === reason) { cur.end = sl; continue; }
    cur = { start: sl, end: sl, status, reason };
    out.push(cur);
  }
  return out.map((run) => ({
    ...run,
    text: run.reason || `${clockOf(run.start)}–${clockOf(run.end + 1)}`,
  }));
};

/** The days the sweep covers. Drag across columns to take in more than one. */
const selectedDayKeys = computed(() => {
  const r = rect.value;
  return r ? DAYS.slice(r.d0, r.d1 + 1).map((d) => d.key) : [];
});

const sweepBox = computed(() => {
  const r = rect.value;
  const el = colEls.value[r?.d0];
  if (!r || !el) return {};
  const first = el.getBoundingClientRect();
  const last = colEls.value[r.d1]?.getBoundingClientRect() ?? first;
  const grid = el.parentElement.getBoundingClientRect();
  return {
    left: `${first.left - grid.left}px`,
    width: `${last.right - first.left}px`,
    top: `${r.s0 * ROW}px`,
    height: `${(r.s1 - r.s0 + 1) * ROW}px`,
  };
});

/**
 * What the swept hours already are.
 *
 * Offering "Clear" over bare grid, or "Open" over hours that are already open,
 * is offering to do nothing. The buttons below follow this instead: empty
 * hours can be opened or held, filled ones can be cleared, and a run that is
 * part one and part the other can be any of the three.
 */
const selectionFill = computed(() => {
  const r = rect.value;
  if (!r) return 'none';
  let open = 0;
  let reserved = 0;
  let empty = 0;
  selectedDayKeys.value.forEach((dayKey) => {
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const st = statusOf(dayKey, sl);
      if (st === 'open') open += 1;
      else if (st === 'reserved') reserved += 1;
      else empty += 1;
    }
  });
  const filled = open + reserved;
  return {
    open,
    reserved,
    empty,
    kind: !filled ? 'empty' : !empty ? 'filled' : 'mixed',
    note: !filled
      ? 'free'
      : !empty
        ? (open && reserved ? 'open and reserved' : open ? 'already open' : 'already reserved')
        : `${filled} taken, ${empty} free`,
  };
});

/**
 * Where the action card sits: beside the run, on whichever side has room, and
 * held inside the board so it cannot be pushed off the bottom by a late sweep.
 */
/**
 * The card's real height, measured rather than guessed.
 *
 * It was estimated from the number of buttons, and the estimate was 37px short
 * — which is precisely how far the card ended up sitting over the selection
 * when it was trying to clear it.
 */
const cardEl = ref(null);
const popoverHeight = ref(160);
const measureCard = () => {
  if (cardEl.value) popoverHeight.value = cardEl.value.offsetHeight;
};
watch([selection, askingLabel, reserveLabel], () => nextTick(measureCard), { deep: true });

/**
 * Where the card goes: beside the run, else above or below it, else off the
 * board entirely.
 *
 * It is positioned against the modal rather than the grid, because a sweep can
 * cover every hour on screen — and then there is no spot left inside the board
 * that does not sit on top of the selection. Being a child of the modal lets it
 * step off the board instead of covering the thing it describes.
 */
const popoverStyle = computed(() => {
  const r = rect.value;
  const first = colEls.value[r?.d0];
  const last = colEls.value[r?.d1];
  const sc = scroller.value;
  const modal = modalEl.value;
  // Touched so the card follows the board as it scrolls.
  const _ = scrollY.value;
  if (!r || !first || !last || !sc || !modal) return {};

  const W = POPOVER_W;
  const H = popoverHeight.value;
  const GAP = 8;
  const m = modal.getBoundingClientRect();
  const view = sc.getBoundingClientRect();
  const grid = first.parentElement.getBoundingClientRect();

  const selLeft = first.getBoundingClientRect().left;
  const selRight = last.getBoundingClientRect().right;
  // Only the part of the run actually on screen can be collided with.
  const selTop = Math.max(grid.top + r.s0 * ROW, view.top);
  const selBottom = Math.min(grid.top + (r.s1 + 1) * ROW, view.bottom);

  const place = (x, y) => ({ left: `${x - m.left}px`, top: `${y - m.top}px`, width: `${W}px` });
  const clampX = (x) => Math.max(m.left + 8, Math.min(x, m.right - W - 8));
  const clampY = (y) => Math.max(m.top + 2, Math.min(y, m.bottom - 2 - H));
  const clear = (x, y) =>
    x + W <= selLeft || x >= selRight || y + H <= selTop || y >= selBottom;
  const inModal = (x, y) =>
    x >= m.left + 2 && x + W <= m.right - 2 && y >= m.top + 2 && y + H <= m.bottom - 2;

  const beside = clampY(grid.top + r.s0 * ROW - 4);
  const centred = clampX(lastPoint.value.clientX - W / 2);

  // Beside the run first, then straight under it, then over it. Each is tried
  // where it belongs and again nudged back inside the modal, so a card that
  // would hang off the bottom slides up rather than being thrown to the top.
  for (const [x, y] of [
    [selRight + GAP, beside],
    [selLeft - GAP - W, beside],
    [centred, selBottom + GAP],
    [centred, clampY(selBottom + GAP)],
    [centred, selTop - GAP - H],
    [centred, clampY(selTop - GAP - H)],
  ]) {
    if (inModal(x, y) && clear(x, y)) return place(x, y);
  }

  // The run leaves nowhere adjacent: sit under the board, else over it.
  const under = view.bottom + 2;
  if (under + H <= m.bottom - 2) return place(centred, under);
  const over = view.top - 2 - H;
  if (over >= m.top + 2) return place(centred, over);
  return place(centred, clampY(selBottom + GAP));
});

const summary = computed(() => {
  const r = rect.value;
  if (!r) return null;
  const names = DAYS.slice(r.d0, r.d1 + 1).map((d) => d.short);
  return {
    label: names.length === 1 ? names[0] : `${names[0]}–${names[names.length - 1]}`,
    time: `${clockOf(r.s0)} – ${clockOf(r.s1 + 1)}`,
    slots: (r.d1 - r.d0 + 1) * (r.s1 - r.s0 + 1),
  };
});

/**
 * The dates a bounded repeat lands on. Hours already behind us are dropped
 * here as well as refused by the store, so the count the instructor reads is
 * the count that gets written.
 */
const datesForSpan = (dayKeys) => {
  if (repeatSpan.value === 'always') return [];
  if (!dayKeys.length) return [];
  const weekStart = new Date(`${teacher.thisWeekStart}T12:00:00`);
  const todayIso = teacher.manilaNow.iso;
  const weeks = repeatSpan.value === 'weeks' ? clampInt(repeatWeeks.value, 1, 52) : 52;
  const until = repeatSpan.value === 'until' ? repeatUntil.value : null;
  if (repeatSpan.value === 'until' && !until) return [];

  const out = [];
  let used = 0;
  for (let w = 0; used < weeks && w < 104; w += 1) {
    const base = plusDays(weekStart, w * 7);
    let any = false;
    for (let i = 0; i < DAYS.length; i += 1) {
      if (!dayKeys.includes(DAYS[i].key)) continue;
      const d = plusDays(base, i);
      const iso = isoOf(d);
      if (until && iso > until) return out;
      if (iso < todayIso) continue;
      out.push({ iso, dateObj: d, dayKey: DAYS[i].key, weekStartIso: isoOf(base) });
      any = true;
    }
    if (any) used += 1;
    if (until && !any && isoOf(base) > until) return out;
  }
  return out;
};

const spanDates = computed(() => (rect.value ? datesForSpan(selectedDayKeys.value) : []));

/** Every date the span covers, for laying the whole template onto the weeks. */
const applyDates = computed(() => datesForSpan(DAYS.map((d) => d.key)));

const spanNote = computed(() => {
  if (repeatSpan.value === 'always') return 'These hours repeat every week, with no end.';
  if (!selectedDayKeys.value.length) {
    return repeatSpan.value === 'weeks'
      ? `Hours you pick will be written to the next ${clampInt(repeatWeeks.value, 1, 52)} weeks, not to the template.`
      : 'Hours you pick will be written up to that date, not to the template.';
  }
  const dates = spanDates.value;
  if (!dates.length) return 'No dates yet — pick days, and a span that reaches ahead.';
  const last = dates[dates.length - 1];
  return `${dates.length} ${dates.length === 1 ? 'date' : 'dates'}, ${pretty(dates[0].dateObj)} – ${pretty(last.dateObj)}. Saved to those weeks, not to the template.`;
});

const openCount = computed(() => countBy('open'));
const reservedCount = computed(() => countBy('reserved'));
function countBy(status) {
  let n = 0;
  DAYS.forEach((d) => {
    for (let s = 0; s < 48; s += 1) if (statusOf(d.key, s) === status) n += 1;
  });
  return n % 2 === 0 ? `${n / 2}h` : `${(n / 2).toFixed(1)}h`;
}

/* ---- the sweep ---- */
const cellAt = (e) => {
  const els = colEls.value.filter(Boolean);
  if (!els.length) return null;
  let dayIdx = 0;
  els.forEach((el, i) => {
    if (e.clientX >= el.getBoundingClientRect().left) dayIdx = i;
  });
  const grid = els[0].parentElement.getBoundingClientRect();
  lastPoint.value = { clientX: e.clientX, clientY: e.clientY };
  const slot = Math.min(47, Math.max(0, Math.floor((e.clientY - grid.top) / ROW)));
  return { dayIdx, slot };
};

let dragging = false;
const onDown = (e) => {
  if (e.button !== 0) return;
  const at = cellAt(e);
  if (!at) return;
  e.preventDefault();
  dragging = true;
  pendingClear.value = false;
  askingLabel.value = false;
  selection.value = { fromDay: at.dayIdx, fromSlot: at.slot, toDay: at.dayIdx, toSlot: at.slot };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
};
const onMove = (e) => {
  if (!dragging || !selection.value) return;
  const at = cellAt(e);
  if (!at) return;
  selection.value.toDay = at.dayIdx;
  selection.value.toSlot = at.slot;
};
const onUp = () => {
  dragging = false;
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', onUp);
  if (rect.value) {
    reserveLabel.value = '';
  }
};

const apply = (status) => {
  const r = rect.value;
  if (!r || !selectedDayKeys.value.length) return;
  const label = reserveLabel.value.trim();

  if (repeatSpan.value === 'always') {
    const next = { ...draft.value };
    selectedDayKeys.value.forEach((dayKey) => {
      for (let s = r.s0; s <= r.s1; s += 1) {
        const id = keyOf(dayKey, s);
        if (status === 'closed') delete next[id];
        else if (status === 'reserved') next[id] = { status: 'reserved', reason: label || 'Reserved' };
        else next[id] = 'open';
      }
    });
    draft.value = next;
  } else {
    // A bounded run is dated schedule, so it is queued rather than folded into
    // the template — the grid above would otherwise show it as if it repeated
    // for ever.
    const dates = spanDates.value;
    if (!dates.length) return;
    const names = DAYS.filter((d) => selectedDayKeys.value.includes(d.key)).map((d) => d.short).join(', ');
    const verb = status === 'closed' ? 'Clear' : status === 'reserved' ? 'Reserve' : 'Open';
    pendingOps.value.push({
      status,
      reason: status === 'reserved' ? label || 'Reserved' : '',
      s0: r.s0,
      s1: r.s1,
      dates: dates.map((d) => ({ weekStartIso: d.weekStartIso, dayKey: d.dayKey })),
      label: `${verb} ${names} ${clockOf(r.s0)}–${clockOf(r.s1 + 1)} · ${dates.length} ${dates.length === 1 ? 'date' : 'dates'}${label ? ` · ${label}` : ''}`,
    });
  }

  selection.value = null;
  askingLabel.value = false;
  reserveLabel.value = '';
};

/**
 * Whether anything would actually be written.
 *
 * Compared on a sorted fingerprint rather than the object itself: the draft is
 * rebuilt by spreading and deleting keys, so two identical templates can hold
 * their keys in a different order and a plain comparison would call that a
 * change.
 */
const fingerprint = (map) =>
  Object.keys(map)
    .sort()
    .map((k) => {
      const v = map[k];
      const status = v === true || v === 'open' || v?.status === 'open'
        ? 'open'
        : v === 'reserved' || v?.status === 'reserved'
          ? 'reserved'
          : 'closed';
      return `${k}:${status}:${typeof v === 'object' && v ? v.reason || '' : ''}`;
    })
    .join('|');

const savedPrint = ref('');
const isDirty = computed(() => fingerprint(draft.value) !== savedPrint.value || pendingOps.value.length > 0);

const isEmpty = computed(() => !Object.keys(draft.value).length);
const pendingClear = ref(false);

const clearTemplate = () => {
  if (!pendingClear.value) {
    pendingClear.value = true;
    return;
  }
  draft.value = {};
  selection.value = null;
  pendingClear.value = false;
};

watch(askingLabel, (asking) => {
  if (asking) nextTick(() => labelInput.value?.focus());
});

const measureScrollbar = () => {
  const el = scroller.value;
  scrollY.value = el ? el.scrollTop : 0;
  scrollbar.value = el ? Math.max(0, el.offsetWidth - el.clientWidth) : 0;
};

const close = () => {
  selection.value = null;
  emit('close');
};

const editedWeekCount = computed(() => teacher.upcomingEditedWeeks.length);
const replaceEditedWeeks = ref(true);

/**
 * What the footer button will do, which depends on the span.
 *
 * "Every week" edits the template itself. A bounded span cannot be held in the
 * template at all, so it is laid onto the weeks as dated hours — and that is a
 * real action whether or not the template was touched, which is why the button
 * is no longer hidden when nothing has changed.
 */
const primaryAction = computed(() => {
  if (repeatSpan.value !== 'always') {
    const n = applyDates.value.length;
    return {
      key: 'apply',
      label: n ? `Apply to ${n} ${n === 1 ? 'date' : 'dates'}` : 'Apply to calendar',
      enabled: n > 0,
      hint: n
        ? `The whole template written onto those ${n} ${n === 1 ? 'date' : 'dates'}.`
        : 'Pick an end that reaches past today.',
    };
  }
  if (isDirty.value) return { key: 'save', label: 'Save template', enabled: true, hint: '' };
  return {
    key: 'republish',
    label: 'Apply to every week',
    enabled: true,
    hint: 'Puts every upcoming week back under this template.',
  };
});

/** Lay the template's hours onto each date the span covers. */
const applyToCalendar = () => {
  applyDates.value.forEach(({ weekStartIso, dayKey }) => {
    for (let sl = 0; sl < 48; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (!slotKey) continue;
      const status = statusOf(dayKey, sl);
      const v = draft.value[keyOf(dayKey, sl)];
      const reason = status === 'reserved' && typeof v === 'object' && v ? v.reason || '' : '';
      teacher.setSlotStatusOn(weekStartIso, dayKey, slotKey, status, reason);
    }
  });
};

const runPrimary = () => {
  const action = primaryAction.value;
  if (!action.enabled) return;
  if (action.key === 'apply') {
    if (isDirty.value) teacher.setPattern(draft.value);
    applyToCalendar();
    writePendingOps();
    emit('saved');
    emit('close');
    return;
  }
  save();
};

const writePendingOps = () => {
  pendingOps.value.forEach((op) => {
    op.dates.forEach(({ weekStartIso, dayKey }) => {
      for (let s = op.s0; s <= op.s1; s += 1) {
        const slotKey = teacher.scheduleSlots[s]?.key;
        if (slotKey) teacher.setSlotStatusOn(weekStartIso, dayKey, slotKey, op.status, op.reason);
      }
    });
  });
};

const save = () => {
  teacher.setPattern(draft.value);
  if (replaceEditedWeeks.value) teacher.resetWeeksToPattern();
  // Dated runs are written after the weeks are put back under the template,
  // so a bounded run sits on top of it rather than being wiped by it.
  writePendingOps();
  emit('saved');
  emit('close');
};

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    draft.value = teacher.clonePattern();
    savedPrint.value = fingerprint(draft.value);
    selection.value = null;
    reserveLabel.value = '';
    pendingClear.value = false;
    askingLabel.value = false;
    replaceEditedWeeks.value = true;
    repeatSpan.value = 'always';
    repeatWeeks.value = 5;
    repeatUntil.value = '';
    pendingOps.value = [];
    nextTick(() => {
      measureScrollbar();
      // Open on the working day rather than at midnight.
      if (scroller.value) scroller.value.scrollTop = 8 * 2 * ROW;
    });
  },
  { immediate: true }
);

const onKey = (e) => {
  if (!props.isOpen) return;
  if (e.key !== 'Escape') return;
  if (pendingClear.value) pendingClear.value = false;
  else if (askingLabel.value) askingLabel.value = false;
  else if (selection.value) selection.value = null;
  else close();
};
window.addEventListener('keydown', onKey);
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', onUp);
});
</script>
