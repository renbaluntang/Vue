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
      <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-brighture-bronze">
              <i class="fa-solid fa-repeat text-sm"></i>
            </div>
            <div>
              <h3 id="repeat-modal-title" class="text-base font-extrabold text-slate-900">Repeat Schedule</h3>
              <p class="text-xs text-slate-500">Apply recurring hours across Monday to Friday or custom days</p>
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
          <!-- Mode Tabs: Quick Presets / Copy Day / Custom Range -->
          <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              type="button"
              @click="tab = 'copy'"
              class="flex-1 rounded-lg py-1.5 transition text-center"
              :class="tab === 'copy' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'"
            >
              <i class="fa-solid fa-copy mr-1 text-brighture-bronze"></i>
              Copy a Day (e.g. Mon → Mon–Fri)
            </button>
            <button
              type="button"
              @click="tab = 'range'"
              class="flex-1 rounded-lg py-1.5 transition text-center"
              :class="tab === 'range' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'"
            >
              <i class="fa-regular fa-clock mr-1 text-brighture-bronze"></i>
              Set Time Range
            </button>
          </div>

          <!-- TAB 1: Copy a Day's Schedule to other days -->
          <div v-if="tab === 'copy'" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Copy schedule from
              </label>
              <select
                v-model="sourceDay"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-brighture-gold focus:outline-none cursor-pointer"
              >
                <option v-for="d in days" :key="d.key" :value="d.key">
                  {{ d.label }} ({{ d.date }}) — {{ countOpenSlots(d.key) }} open, {{ countReservedSlots(d.key) }} reserved
                </option>
              </select>
            </div>

            <!-- Target Days -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Apply to days
                </label>
                <!-- Quick Preset Buttons -->
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="selectWeekdays"
                    class="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900 hover:bg-amber-100 transition"
                  >
                    Mon–Fri (Weekdays)
                  </button>
                  <button
                    type="button"
                    @click="selectAllDays"
                    class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition"
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
                  @click="toggleTargetDay(d.key)"
                  class="flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-bold transition active:scale-95"
                  :class="targetDays.includes(d.key)
                    ? 'border-brighture-gold bg-amber-50/90 text-brighture-ink shadow-xs font-black'
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

            <!-- Preview box -->
            <div class="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <div class="flex items-center gap-1.5 font-bold text-slate-800">
                <i class="fa-solid fa-circle-info text-brighture-bronze"></i>
                <span>Summary</span>
              </div>
              <p>
                Will duplicate <strong class="text-slate-900">{{ getDayLabel(sourceDay) }}</strong>'s schedule
                (<strong class="text-amber-950">{{ countOpenSlots(sourceDay) }} open</strong>,
                <strong class="text-indigo-900">{{ countReservedSlots(sourceDay) }} reserved</strong> slots) to
                <strong class="text-slate-900">{{ targetDaysLabels.join(', ') || 'no days selected' }}</strong>.
              </p>
            </div>
          </div>

          <!-- TAB 2: Set Time Range for Mon-Fri -->
          <div v-if="tab === 'range'" class="space-y-4">
            <!-- Range Status Option -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Apply hours as
              </label>
              <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  @click="rangeTargetStatus = 'open'"
                  class="flex-1 rounded-lg py-1.5 transition text-center"
                  :class="rangeTargetStatus === 'open' ? 'bg-amber-100 text-amber-950 shadow-xs font-black' : 'hover:text-slate-900'"
                >
                  <span class="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                  Open (Students can book)
                </button>
                <button
                  type="button"
                  @click="rangeTargetStatus = 'reserved'"
                  class="flex-1 rounded-lg py-1.5 transition text-center"
                  :class="rangeTargetStatus === 'reserved' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'hover:text-slate-900'"
                >
                  <span class="inline-block h-2 w-2 rounded-full bg-white mr-1"></span>
                  Reserve
                </button>
              </div>
            </div>

            <!-- Reason when reserved -->
            <div v-if="rangeTargetStatus === 'reserved'">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Reason for Reservation
              </label>
              <input
                type="text"
                v-model="rangeReason"
                placeholder="e.g. Manager Scheduled Class, Demo Lesson, Meeting..."
                class="w-full rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-bold text-indigo-950 shadow-2xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Start Time
                </label>
                <select
                  v-model="rangeStart"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-brighture-gold focus:outline-none cursor-pointer"
                >
                  <option v-for="s in slots" :key="s.key" :value="s.key">
                    {{ s.manila }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  End Time
                </label>
                <select
                  v-model="rangeEnd"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-brighture-gold focus:outline-none cursor-pointer"
                >
                  <option v-for="s in slots" :key="s.key" :value="s.key">
                    {{ s.manila }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Target Days -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Apply to days
                </label>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="selectWeekdays"
                    class="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900 hover:bg-amber-100 transition"
                  >
                    Mon–Fri (Weekdays)
                  </button>
                  <button
                    type="button"
                    @click="selectAllDays"
                    class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition"
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
                  @click="toggleTargetDay(d.key)"
                  class="flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-bold transition active:scale-95"
                  :class="targetDays.includes(d.key)
                    ? 'border-brighture-gold bg-amber-50/90 text-brighture-ink shadow-xs font-black'
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

            <!-- Quick Presets -->
            <div class="pt-2">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Presets</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="applyPreset('mon-fri-9-17')"
                  class="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left text-xs font-bold text-slate-700 hover:bg-amber-50 hover:border-brighture-gold transition"
                >
                  <div class="flex items-center gap-1.5">
                    <i class="fa-solid fa-briefcase text-brighture-bronze text-[11px]"></i>
                    <span>Mon–Fri (9–17) Open</span>
                  </div>
                  <p class="text-[10px] font-normal text-slate-500 mt-0.5">8h weekday workday</p>
                </button>

                <button
                  type="button"
                  @click="applyPreset('mon-fri-morning')"
                  class="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left text-xs font-bold text-slate-700 hover:bg-amber-50 hover:border-brighture-gold transition"
                >
                  <div class="flex items-center gap-1.5">
                    <i class="fa-solid fa-sun text-amber-500 text-[11px]"></i>
                    <span>Mon–Fri (9–12) Open</span>
                  </div>
                  <p class="text-[10px] font-normal text-slate-500 mt-0.5">Morning 3h blocks</p>
                </button>

                <button
                  type="button"
                  @click="applyPreset('mon-fri-manager')"
                  class="rounded-xl border border-indigo-200 bg-indigo-50/50 p-2 text-left text-xs font-bold text-indigo-900 hover:bg-indigo-100 hover:border-indigo-400 transition"
                >
                  <div class="flex items-center gap-1.5">
                    <i class="fa-solid fa-user-tie text-indigo-600 text-[11px]"></i>
                    <span>Mon–Fri (16–17) Reserve</span>
                  </div>
                  <p class="text-[10px] font-normal text-slate-500 mt-0.5">Manager class hold</p>
                </button>
              </div>
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
            <span>Apply to Schedule</span>
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

const tab = ref('copy'); // 'copy' | 'range'
const sourceDay = ref('mon');
const targetDays = ref(['mon', 'tue', 'wed', 'thu', 'fri']);

const rangeStart = ref('t9');
const rangeEnd = ref('t17');
const rangeTargetStatus = ref('open'); // 'open' | 'reserved'
const rangeReason = ref('Manager Scheduled Class');

const days = computed(() => teacher.scheduleDays);
const slots = computed(() => teacher.scheduleSlots);

const countOpenSlots = (dayKey) => {
  return teacher.scheduleSlots.filter((slot) => teacher.isOpen(dayKey, slot.key)).length;
};

const countReservedSlots = (dayKey) => {
  return teacher.scheduleSlots.filter((slot) => teacher.isReserved(dayKey, slot.key)).length;
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

const applyPreset = (presetKey) => {
  selectWeekdays();
  if (presetKey === 'mon-fri-9-17') {
    rangeStart.value = 't9';
    rangeEnd.value = 't17';
    rangeTargetStatus.value = 'open';
  } else if (presetKey === 'mon-fri-morning') {
    rangeStart.value = 't9';
    rangeEnd.value = 't12';
    rangeTargetStatus.value = 'open';
  } else if (presetKey === 'mon-fri-manager') {
    rangeStart.value = 't16';
    rangeEnd.value = 't17';
    rangeTargetStatus.value = 'reserved';
    rangeReason.value = 'Manager Scheduled Class';
  }
};

const applySchedule = () => {
  if (tab.value === 'copy') {
    // Copy sourceDay's exact slot states (Open, Reserved, Closed) to all selected targetDays
    const sourceSlotsState = {};
    teacher.scheduleSlots.forEach((slot) => {
      const id = `${sourceDay.value}-${slot.key}`;
      sourceSlotsState[slot.key] = teacher.availability[id];
    });

    targetDays.value.forEach((dayKey) => {
      teacher.scheduleSlots.forEach((slot) => {
        const id = `${dayKey}-${slot.key}`;
        const srcVal = sourceSlotsState[slot.key];
        if (srcVal) {
          teacher.availability[id] = typeof srcVal === 'object' ? { ...srcVal } : srcVal;
        } else {
          delete teacher.availability[id];
        }
      });
    });
  } else if (tab.value === 'range') {
    const startHour = parseInt(rangeStart.value.replace('t', ''), 10);
    const endHour = parseInt(rangeEnd.value.replace('t', ''), 10);
    const minH = Math.min(startHour, endHour);
    const maxH = Math.max(startHour, endHour);

    targetDays.value.forEach((dayKey) => {
      teacher.scheduleSlots.forEach((slot) => {
        const h = parseInt(slot.key.replace('t', ''), 10);
        if (h >= minH && h <= maxH) {
          if (rangeTargetStatus.value === 'reserved') {
            teacher.setSlotStatus(dayKey, slot.key, 'reserved', rangeReason.value);
          } else {
            teacher.setSlotStatus(dayKey, slot.key, 'open');
          }
        }
      });
    });
  }

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
