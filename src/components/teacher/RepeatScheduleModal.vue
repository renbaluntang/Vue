<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      @click.self="close"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repeat-modal-title"
    >
      <div class="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-brighture-bronze">
              <i class="fa-solid fa-repeat text-sm"></i>
            </div>
            <div>
              <h3 id="repeat-modal-title" class="text-base font-extrabold text-slate-900">Repeat Schedule</h3>
              <p class="text-xs text-slate-500">Set the same hours on several days at once</p>
            </div>
          </div>
          <button
            type="button"
            @click="close"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div class="space-y-4">
            <!-- Custom Shift List Builder -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hours</span>
                <button
                  type="button"
                  @click="addShift"
                  class="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition active:scale-95"
                >
                  <i class="fa-solid fa-plus text-[10px] text-brighture-bronze"></i>
                  <span>Add shift</span>
                </button>
              </div>

              <!-- Shifts Rows -->
              <div class="space-y-2">
                <div
                  v-for="(shift, idx) in shifts"
                  :key="shift.id"
                  class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-2xl border border-slate-200/90 bg-slate-50/60"
                >
                  <!-- Shift label number badge -->
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-700">
                      {{ idx + 1 }}
                    </span>
                    <span class="text-xs font-bold text-slate-700 sm:hidden">Shift {{ idx + 1 }}</span>
                  </div>

                  <!-- Start Time & End Time. All three fields of a shift are
                       dropdowns, and none of them said so — `appearance-none`
                       takes the native arrow away without putting one back. -->
                  <div class="flex items-center gap-2 flex-1">
                    <div class="relative flex-1 min-w-0">
                      <select
                        v-model="shift.start"
                        class="w-full appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-bold text-slate-800 shadow-2xs focus:border-brighture-gold focus:outline-none cursor-pointer"
                      >
                        <option v-for="s in slots" :key="s.key" :value="s.key">
                          {{ to12(s.manila) }}
                        </option>
                      </select>
                      <i class="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400"></i>
                    </div>
                    <span class="text-xs font-bold text-slate-400">to</span>
                    <div class="relative flex-1 min-w-0">
                      <select
                        v-model="shift.end"
                        class="w-full appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-bold text-slate-800 shadow-2xs focus:border-brighture-gold focus:outline-none cursor-pointer"
                      >
                        <option v-for="s in slots" :key="s.key" :value="s.key">
                          {{ to12(s.manila) }}
                        </option>
                      </select>
                      <i class="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400"></i>
                    </div>
                  </div>

                  <!-- Status. A dropdown like the two times beside it, so a
                       shift reads as one sentence of three fields; colour is
                       what still tells the two states apart at a glance. -->
                  <div class="flex items-center gap-1 shrink-0">
                    <div
                      class="relative w-28"
                      :class="shift.status === 'reserved' ? 'text-indigo-700' : 'text-emerald-700'"
                    >
                      <select
                        v-model="shift.status"
                        aria-label="Shift status"
                        class="w-full appearance-none rounded-xl border bg-white py-1.5 pl-2.5 pr-7 text-xs font-extrabold shadow-2xs focus:border-brighture-gold focus:outline-none cursor-pointer"
                        :class="shift.status === 'reserved'
                          ? 'border-indigo-200 text-indigo-700'
                          : 'border-emerald-200 text-emerald-700'"
                      >
                        <option value="open">Open</option>
                        <option value="reserved">Reserved</option>
                      </select>
                      <i class="fa-solid fa-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px]"></i>
                    </div>

                    <!-- Remove Shift Button -->
                    <button
                      v-if="shifts.length > 1"
                      type="button"
                      @click="removeShift(idx)"
                      class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Remove shift"
                    >
                      <i class="fa-regular fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Target Days Selector -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Days
                </label>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="selectWeekdays"
                    class="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900 hover:bg-amber-100 transition"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    @click="selectAllDays"
                    class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition"
                  >
                    All
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-7 gap-1.5">
                <button
                  v-for="d in days"
                  :key="d.key"
                  type="button"
                  @click="toggleTargetDay(d.key)"
                  class="flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-bold transition active:scale-95"
                  :class="targetDays.includes(d.key)
                    ? 'border-brighture-gold bg-amber-50/90 text-brighture-ink shadow-xs font-black ring-1 ring-brighture-gold/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                >
                  <span class="text-[11px]">{{ d.label }}</span>
                  <i
                    class="fa-solid fa-check text-[9px] mt-0.5 text-brighture-bronze transition-opacity"
                    :class="targetDays.includes(d.key) ? 'opacity-100' : 'opacity-0'"
                  ></i>
                </button>
              </div>
            </div>

            <!-- How often. Sits between the days and the summary because it
                 is the last thing to decide, and the summary right below is
                 the sentence it changes. -->
            <label
              class="flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 transition"
              :class="repeatWeekly
                ? 'border-brighture-gold bg-amber-50/70'
                : 'border-slate-200 bg-white hover:border-slate-300'"
            >
              <input
                type="checkbox"
                v-model="repeatWeekly"
                class="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brighture-gold-deep focus:ring-brighture-gold"
              />
              <span class="text-xs font-bold text-slate-800">Repeat every week</span>
            </label>

            <!-- What this is about to do: the hours as the headline, the
                 rest as the consequence. Written as a sentence rather than
                 facts strung together with middle dots — and those dots also
                 lost their spacing, since Vue drops a whitespace-only text
                 node that spans a newline. -->
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <p class="text-xs font-bold text-slate-900">{{ shiftsSummaryText }}</p>
              <p class="mt-1 text-[11px] leading-relaxed text-slate-500">
                <strong class="tabular-nums text-slate-600">{{ totalShiftsHours }}h</strong> a day on
                <strong class="text-slate-600">{{ targetDaysLabels.join(', ') || 'no days' }}</strong>,
                <strong class="text-slate-600">{{ repeatWeekly ? 'every week from now on' : 'this week only' }}</strong>.
                Every other hour on those days is closed.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
          <button
            type="button"
            @click="close"
            class="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="applySchedule"
            :disabled="targetDays.length === 0"
            class="inline-flex items-center gap-2 rounded-xl bg-brighture-gold px-5 py-2.5 text-xs font-extrabold text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i class="fa-solid fa-check text-xs"></i>
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'applied']);

const teacher = useTeacherStore();

const targetDays = ref(['mon', 'tue', 'wed', 'thu', 'fri']);
/** Whether these hours become the usual week or apply to this one only. */
const repeatWeekly = ref(false);
/** "13:30" -> "1:30 PM". */
const to12 = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

// Configurable shifts list (supports split shifts like 8-12 + 1-5, or 7-10 + 1-4 + 6-7)
const shifts = ref([
  { id: 1, start: 't0800', end: 't1200', status: 'open' },
  { id: 2, start: 't1300', end: 't1700', status: 'open' },
]);

const days = computed(() => teacher.scheduleDays);
const slots = computed(() => teacher.scheduleSlots);

const addShift = () => {
  shifts.value.push({
    id: Date.now(),
    start: 't1800',
    end: 't2000',
    status: 'open',
  });
};

const removeShift = (index) => {
  shifts.value.splice(index, 1);
};

const getDayLabel = (dayKey) => {
  const match = days.value.find((d) => d.key === dayKey);
  return match ? match.label : dayKey;
};

const targetDaysLabels = computed(() => {
  return targetDays.value.map(getDayLabel);
});

const toggleTargetDay = (dayKey) => {
  const at = targetDays.value.indexOf(dayKey);
  if (at === -1) targetDays.value.push(dayKey);
  else targetDays.value.splice(at, 1);
};

const selectWeekdays = () => {
  targetDays.value = ['mon', 'tue', 'wed', 'thu', 'fri'];
};

const selectAllDays = () => {
  targetDays.value = days.value.map((d) => d.key);
};

const minutesOf = (key) => teacher.scheduleSlots.find((s) => s.key === key)?.minutes ?? 0;

const totalShiftsHours = computed(() => {
  let totalMin = 0;
  shifts.value.forEach((shift) => {
    const from = minutesOf(shift.start);
    const to = minutesOf(shift.end);
    if (to > from) totalMin += (to - from);
  });
  return Math.round((totalMin / 60) * 10) / 10;
});

const shiftsSummaryText = computed(() => {
  return shifts.value
    .map((s) => {
      const fromSlot = teacher.scheduleSlots.find((slot) => slot.key === s.start);
      const toSlot = teacher.scheduleSlots.find((slot) => slot.key === s.end);
      const from12 = fromSlot ? to12(fromSlot.manila) : s.start;
      const to12Label = toSlot ? to12(toSlot.manila) : s.end;
      return `${from12}–${to12Label}`;
    })
    .join(', ');
});

/** What the shifts say one slot should be, or null for closed. */
const shiftStateFor = (slot) => {
  const match = shifts.value.find((s) => {
    const from = minutesOf(s.start);
    const to = minutesOf(s.end);
    return slot.minutes >= from && slot.minutes < to;
  });
  if (!match) return null;
  return match.status === 'reserved'
    ? { status: 'reserved', reason: 'Reserved Shift' }
    : 'open';
};

const applySchedule = () => {
  if (repeatWeekly.value) {
    // Written into the pattern, not into this week: the template has no idea
    // what time it is, so the hours that have already passed today belong in
    // it just the same.
    teacher.writePattern((pattern) => {
      targetDays.value.forEach((dayKey) => {
        teacher.scheduleSlots.forEach((slot) => {
          const id = `${dayKey}-${slot.key}`;
          const state = shiftStateFor(slot);
          if (state) pattern[id] = state;
          else delete pattern[id];
        });
      });
    });
  } else {
    teacher.beginWeekEdit();
    targetDays.value.forEach((dayKey) => {
      teacher.scheduleSlots.forEach((slot) => {
        const state = shiftStateFor(slot);
        // Through setSlotStatus even when closing, so an hour that has already
        // begun is left alone rather than deleted out from under the rule.
        if (state === 'open') teacher.setSlotStatus(dayKey, slot.key, 'open');
        else if (state) teacher.setSlotStatus(dayKey, slot.key, 'reserved', state.reason);
        else teacher.setSlotStatus(dayKey, slot.key, 'closed');
      });
    });
  }

  emit('applied');
  close();
};

const close = () => {
  emit('close');
};

const onKeydown = (e) => { if (e.key === 'Escape' && props.isOpen) close(); };
watch(
  () => props.isOpen,
  (open) => {
    if (open) document.addEventListener('keydown', onKeydown);
    else document.removeEventListener('keydown', onKeydown);
  },
  { immediate: true }
);
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>
