<template>
  <div class="relative" ref="rootEl">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <!-- The week is the subject of this page, so it is set as a heading with
           its state underneath — not as one more pill in a row of pills. The
           arrows sit outside it: stepping is a different act from naming. -->
      <div class="flex items-center gap-2.5">
        <div class="inline-flex shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <button
            type="button"
            @click="teacher.shiftWeek(-1)"
            class="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            aria-label="Previous week"
          >
            <i class="fa-solid fa-chevron-left text-[11px]"></i>
          </button>
          <span class="w-px bg-slate-200" aria-hidden="true"></span>
          <button
            type="button"
            @click="teacher.shiftWeek(1)"
            class="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            aria-label="Next week"
          >
            <i class="fa-solid fa-chevron-right text-[11px]"></i>
          </button>
        </div>

        <div class="min-w-0">
          <button
            type="button"
            @click="isOpen = !isOpen"
            :aria-expanded="isOpen ? 'true' : 'false'"
            aria-haspopup="dialog"
            class="-mx-1 flex items-center gap-2 rounded-lg px-1 text-left transition hover:text-brighture-bronze"
            title="Pick a week"
          >
            <span class="text-lg font-extrabold leading-tight tracking-tight tabular-nums text-slate-900">
              {{ weekLabel }}
            </span>
            <span v-if="isThisWeek" class="text-xs font-bold text-brighture-bronze">Now</span>
            <i class="fa-solid fa-chevron-down text-[9px] text-slate-400 transition" :class="{ 'rotate-180': isOpen }"></i>
          </button>

          <!-- State, and the two actions that change it, as text. A press
               changes the week; reading what the week is should not look like
               something you press. -->
          <p class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-tight">
            <span v-if="teacher.weekFollowsPattern" class="text-slate-500">Follows your usual week</span>
            <span v-else class="font-bold text-amber-700">Hours set for this week only</span>

            <template v-if="!teacher.weekFollowsPattern">
              <button
                type="button"
                @click="teacher.applyWeekToPattern()"
                class="font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900"
                title="Make these hours the default for every week"
              >
                Use for every week
              </button>
              <button
                type="button"
                @click="teacher.followPattern()"
                class="font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900"
                title="Discard this week's hours and go back to your usual week"
              >
                Reset to usual
              </button>
            </template>
          </p>
        </div>
      </div>

      <button
        v-if="!isThisWeek"
        type="button"
        @click="teacher.goToThisWeek()"
        class="inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50 active:scale-95"
      >
        This week
      </button>
    </div>

    <!-- Month picker. Its unit is the week, so the row is what highlights and
         what gets picked — a single-day target would be a smaller hit area for
         a choice nobody is making. -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        role="dialog"
        aria-label="Pick a week"
        class="absolute left-0 top-full z-40 mt-2 w-[19rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5"
      >
        <div class="flex items-center justify-between gap-2 px-1 pb-2">
          <button
            type="button"
            @click="shiftMonth(-1)"
            class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Previous month"
          >
            <i class="fa-solid fa-chevron-left text-[10px]"></i>
          </button>
          <p class="text-sm font-extrabold text-slate-900">{{ monthLabel }}</p>
          <button
            type="button"
            @click="shiftMonth(1)"
            class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Next month"
          >
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        <div class="grid grid-cols-7 px-1 pb-1">
          <span
            v-for="(d, i) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
            :key="i"
            class="py-1 text-center text-[10px] font-bold text-slate-400"
          >
            {{ d }}
          </span>
        </div>

        <div class="space-y-0.5">
          <button
            v-for="week in monthWeeks"
            :key="week.start"
            type="button"
            @click="pick(week.start)"
            class="group relative grid w-full grid-cols-7 rounded-xl py-0.5 transition"
            :class="week.start === teacher.activeWeekStart
              ? 'bg-brighture-gold/90 ring-1 ring-brighture-gold-deep'
              : 'hover:bg-slate-100'"
            :aria-current="week.start === teacher.activeWeekStart ? 'true' : undefined"
            :title="week.start === teacher.activeWeekStart ? 'Showing this week' : `Show ${week.label}`"
          >
            <span
              v-if="week.edited"
              class="absolute -left-0.5 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-amber-500"
              aria-hidden="true"
            ></span>
            <span
              v-for="day in week.days"
              :key="day.iso"
              class="relative py-1.5 text-center text-xs tabular-nums transition"
              :class="[
                week.start === teacher.activeWeekStart ? 'font-extrabold text-brighture-ink' : (day.inMonth ? 'text-slate-700' : 'text-slate-300'),
                day.isToday && week.start !== teacher.activeWeekStart ? 'font-extrabold text-slate-900' : '',
              ]"
            >
              {{ day.dayOfMonth }}
              <span
                v-if="day.isToday"
                class="absolute inset-x-0 -bottom-0 mx-auto h-1 w-1 rounded-full"
                :class="week.start === teacher.activeWeekStart ? 'bg-brighture-ink' : 'bg-slate-900'"
              ></span>
            </span>
          </button>
        </div>

        <!-- Only weeks that differ carry a mark, so the marks mean something. -->
        <p class="mt-2 flex items-center gap-1.5 border-t border-slate-100 px-1 pt-2 text-[11px] text-slate-500">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          <span>{{ editedInMonth }} week{{ editedInMonth === 1 ? '' : 's' }} this month with their own hours</span>
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

const isOpen = ref(false);
const rootEl = ref(null);

const atNoon = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setHours(12, 0, 0, 0);
  return d;
};
const isoDay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 20 – 26", or "Sep 27 – Oct 3" when the week straddles a month. */
const weekLabel = computed(() => {
  const start = atNoon(teacher.activeWeekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const left = `${SHORT[start.getMonth()]} ${start.getDate()}`;
  const right = start.getMonth() === end.getMonth()
    ? `${end.getDate()}`
    : `${SHORT[end.getMonth()]} ${end.getDate()}`;
  return `${left} – ${right}`;
});

const isThisWeek = computed(() => teacher.activeWeekStart === teacher.thisWeekStart);

// The month on show follows the chosen week until the reader pages away from it.
const monthCursor = ref(atNoon(teacher.activeWeekStart));
watch(() => teacher.activeWeekStart, (iso) => { monthCursor.value = atNoon(iso); });

const monthLabel = computed(
  () => `${MONTHS[monthCursor.value.getMonth()]} ${monthCursor.value.getFullYear()}`
);
const shiftMonth = (delta) => {
  const d = new Date(monthCursor.value);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  monthCursor.value = d;
};

const monthWeeks = computed(() => {
  const cursor = monthCursor.value;
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const todayIso = isoDay(new Date());

  return Array.from({ length: 6 }, (_, w) => {
    const start = new Date(gridStart);
    start.setDate(start.getDate() + w * 7);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        iso: isoDay(d),
        dayOfMonth: d.getDate(),
        inMonth: d.getMonth() === cursor.getMonth(),
        isToday: isoDay(d) === todayIso,
      };
    });
    const startIso = isoDay(start);
    return {
      start: startIso,
      days,
      label: `${SHORT[start.getMonth()]} ${start.getDate()}`,
      edited: teacher.weekHasOwnHours(startIso),
    };
  });
});

const editedInMonth = computed(() => monthWeeks.value.filter((w) => w.edited).length);

const pick = (iso) => {
  teacher.goToWeek(iso);
  isOpen.value = false;
};

const onOutside = (e) => {
  if (isOpen.value && rootEl.value && !rootEl.value.contains(e.target)) isOpen.value = false;
};
const onKey = (e) => { if (e.key === 'Escape') isOpen.value = false; };

onMounted(() => {
  document.addEventListener('click', onOutside);
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onOutside);
  document.removeEventListener('keydown', onKey);
});
</script>
