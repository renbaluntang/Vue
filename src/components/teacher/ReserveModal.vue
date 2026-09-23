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
      aria-labelledby="reserve-modal-title"
    >
      <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-indigo-50/70 to-white">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <i class="fa-solid fa-bookmark text-sm"></i>
            </div>
            <div>
              <h3 id="reserve-modal-title" class="text-base font-extrabold text-slate-900">Reserve Time Slots</h3>
              <p class="text-xs text-slate-500">Hold slots for manager-scheduled classes, meetings, or offline tasks</p>
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
          <!-- 1. Select Days -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Select Days
              </label>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="selectWeekdays"
                  class="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-black text-indigo-900 hover:bg-indigo-100 transition"
                >
                  Mon–Fri (Weekdays)
                </button>
                <button
                  type="button"
                  @click="selectAllDays"
                  class="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  All Days
                </button>
              </div>
            </div>

            <div class="grid grid-cols-7 gap-1.5">
              <button
                v-for="d in days"
                :key="d.key"
                type="button"
                @click="toggleDay(d.key)"
                class="flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-bold transition active:scale-95 cursor-pointer"
                :class="selectedDays.includes(d.key)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-xs font-black'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
              >
                <span class="text-[11px]">{{ d.label }}</span>
                <i
                  class="fa-solid fa-check text-[9px] mt-0.5 text-indigo-600 transition-opacity"
                  :class="selectedDays.includes(d.key) ? 'opacity-100' : 'opacity-0'"
                ></i>
              </button>
            </div>
          </div>

          <!-- 2. Select Time Range -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              2. Select Time Range
            </label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-400 mb-1">Start Time</label>
                <select
                  v-model="rangeStart"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option v-for="s in slots" :key="s.key" :value="s.key">
                    {{ to12(s.manila) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-400 mb-1">End Time</label>
                <select
                  v-model="rangeEnd"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option v-for="s in slots" :key="s.key" :value="s.key">
                    {{ to12(s.manila) }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- 3. Type Reason -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              3. Reason for Reservation
            </label>
            <input
              type="text"
              v-model="reason"
              placeholder="e.g. Manager Scheduled Class, Demo Lesson, Team Meeting..."
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <!-- Summary preview -->
          <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-950 space-y-1">
            <div class="flex items-center gap-1.5 font-bold">
              <i class="fa-solid fa-circle-info text-indigo-600"></i>
              <span>Summary</span>
            </div>
            <p>
              Will hold <strong class="text-slate-900">{{ selectedTimeLabel }}</strong> on
              <strong class="text-slate-900">{{ selectedDaysLabels.join(', ') || 'no days selected' }}</strong>
              as <em class="font-bold text-indigo-900">"{{ reason.trim() || 'Manager Scheduled Class' }}"</em>.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
          <button
            type="button"
            @click="close"
            class="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="clearReservation"
              :disabled="selectedDays.length === 0"
              class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Clear in this range
            </button>
            <button
              type="button"
              @click="applyReservation"
              :disabled="selectedDays.length === 0"
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <i class="fa-solid fa-bookmark text-xs"></i>
              <span>Apply Reservation</span>
            </button>
          </div>
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

const selectedDays = ref(['mon', 'tue', 'wed', 'thu', 'fri']);
const rangeStart = ref('t1300');
const rangeEnd = ref('t1400');
const reason = ref('Manager Scheduled Class');

const days = computed(() => teacher.scheduleDays);
const slots = computed(() => teacher.scheduleSlots);

/** "13:30" -> "1:30 PM"; the label people actually read a roster in. */
const to12 = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

/** Slots are keyed by clock time now, so ranges compare on minutes. */
const slotMinutesOf = (key) => teacher.scheduleSlots.find((s) => s.key === key)?.minutes ?? 0;
const slotSpan = () => {
  const a = slotMinutesOf(rangeStart.value);
  const b = slotMinutesOf(rangeEnd.value);
  return { from: Math.min(a, b), to: Math.max(a, b) };
};

const getDayLabel = (dayKey) => {
  const match = days.value.find((d) => d.key === dayKey);
  return match ? match.label : dayKey;
};

const selectedDaysLabels = computed(() => selectedDays.value.map(getDayLabel));

/**
 * Reads as the block of time it actually holds. The old summary printed the
 * slot keys — "t13 – t14" — which named rows in the grid rather than hours in
 * the day, and stopped at the last slot's start instead of its end.
 */
const selectedTimeLabel = computed(() => {
  const { from, to } = slotSpan();
  const end = to + (teacher.SLOT_MINUTES ?? 30);
  const text = (mins) => `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return `${to12(text(from))} – ${to12(text(end))}`;
});

const toggleDay = (dayKey) => {
  const at = selectedDays.value.indexOf(dayKey);
  if (at === -1) selectedDays.value.push(dayKey);
  else selectedDays.value.splice(at, 1);
};

const selectWeekdays = () => {
  selectedDays.value = ['mon', 'tue', 'wed', 'thu', 'fri'];
};

const selectAllDays = () => {
  selectedDays.value = days.value.map((d) => d.key);
};

const applyReservation = () => {
  const { from, to } = slotSpan();
  const appliedReason = reason.value.trim() || 'Manager Scheduled Class';

  selectedDays.value.forEach((dayKey) => {
    teacher.scheduleSlots.forEach((slot) => {
      if (slot.minutes >= from && slot.minutes <= to) {
        teacher.setSlotStatus(dayKey, slot.key, 'reserved', appliedReason);
      }
    });
  });

  emit('applied');
  close();
};

const clearReservation = () => {
  const { from, to } = slotSpan();

  selectedDays.value.forEach((dayKey) => {
    teacher.scheduleSlots.forEach((slot) => {
      if (slot.minutes >= from && slot.minutes <= to && teacher.isReserved(dayKey, slot.key)) {
        teacher.setSlotStatus(dayKey, slot.key, 'closed');
      }
    });
  });

  emit('applied');
  close();
};

const close = () => {
  emit('close');
};

// Escape closes it, as it does for every other dialog in the portal. Without
// this the backdrop was the only way out with the keyboard.
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
