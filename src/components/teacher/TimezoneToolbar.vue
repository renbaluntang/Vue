<template>
  <div class="inline-flex items-center gap-2 font-sans" ref="rootRef">
    <!-- Setting button ⚙️ (Google Calendar style). Hidden when the host already
         offers "Manage timezones" somewhere else, so there is one way in. -->
    <button
      v-if="showGear"
      type="button"
      @click="isSettingsOpen = true"
      aria-label="Timezone settings: Add and manage timezones"
      class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-xs transition hover:border-brighture-gold hover:text-slate-900 hover:bg-slate-50 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
      title="Timezone settings: Add and manage timezones"
    >
      <i class="fa-solid fa-gear text-sm"></i>
    </button>

    <!-- Dropdown button: Shows active timezone and lets you switch between added timezones -->
    <div class="relative" :class="pickerClass" ref="dropdownRef">
      <button
        type="button"
        @click="isDropdownOpen = !isDropdownOpen"
        :aria-expanded="isDropdownOpen ? 'true' : 'false'"
        aria-haspopup="menu"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-brighture-gold hover:bg-brighture-cream/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
        :title="`Current timezone: ${activeZoneInfo.label}. Click to switch.`"
      >
        <i class="fa-solid fa-earth-americas text-brighture-bronze text-xs"></i>
        <span class="font-extrabold text-slate-900">{{ activeZoneInfo.city }}</span>
        <span class="text-[11px] text-slate-500 font-semibold tabular-nums">({{ activeZoneInfo.abbr }})</span>
        <!-- No offset badge here: the trigger names where you are reading, and
             the offset is already on every row of the menu it opens. -->
        <i class="fa-solid fa-chevron-down text-[9px] text-slate-400 transition-transform duration-150" :class="{ 'rotate-180': isDropdownOpen }"></i>
      </button>

      <!-- Dropdown Menu: lists all the timezones that were added in settings -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0 -translate-y-1"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="transform scale-95 opacity-0 -translate-y-1"
      >
        <div
          v-if="isDropdownOpen"
          role="menu"
          class="absolute left-0 sm:right-0 sm:left-auto mt-1.5 z-40 w-72 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
        >
          <div class="px-3 py-2 border-b border-slate-100">
            <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Switch Timezone</p>
            <p class="text-xs text-slate-500 mt-0.5">Select from your {{ addedTimezones.length }} configured zones</p>
          </div>

          <div class="py-1 max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
            <button
              v-for="zoneId in addedTimezones"
              :key="zoneId"
              type="button"
              role="menuitem"
              @click="switchTimezone(zoneId)"
              class="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition active:scale-98"
              :class="zoneId === activeZoneId
                ? 'bg-amber-50/80 text-amber-950 font-bold'
                : 'text-slate-700 hover:bg-slate-50 font-medium'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <i
                  class="fa-solid fa-check text-xs text-brighture-bronze transition-opacity"
                  :class="zoneId === activeZoneId ? 'opacity-100' : 'opacity-0'"
                ></i>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-extrabold text-slate-900 truncate">{{ getZone(zoneId).city }}</span>
                    <span class="text-[11px] text-slate-500 font-normal">({{ getZone(zoneId).abbr }})</span>
                  </div>
                  <p class="text-[10px] text-slate-400 truncate">{{ getUtcOffset(zoneId) }}</p>
                </div>
              </div>

              <div class="flex flex-col items-end shrink-0 pl-2">
                <span class="font-mono text-xs font-bold text-slate-900 tabular-nums">
                  {{ liveTimes[zoneId] || '--:--' }}
                </span>
              </div>
            </button>
          </div>

          <!-- Quick link to open Settings modal -->
          <div class="pt-1.5 mt-1 border-t border-slate-100">
            <button
              type="button"
              @click="openSettingsFromDropdown"
              class="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-98"
            >
              <i class="fa-solid fa-gear text-slate-400 text-xs"></i>
              <span>Add / Manage Timezones</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Settings Modal: Triggered by ⚙️ Gear Button -->
    <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSettingsOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        @click.self="isSettingsOpen = false"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tz-settings-title"
      >
        <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl supports-[max-height:100dvh]:max-h-[90dvh] animate-in fade-in zoom-in-95 duration-150">
          <!-- Modal Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-brighture-bronze">
                <i class="fa-solid fa-gear text-sm"></i>
              </div>
              <div>
                <h3 id="tz-settings-title" class="text-base font-extrabold text-slate-900">Timezone Settings</h3>
                <p class="text-xs text-slate-500">These fill the header switcher and the block comparisons.</p>
              </div>
            </div>
            <button
              type="button"
              @click="isSettingsOpen = false"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Close settings"
            >
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
            <div class="flex items-baseline justify-between gap-3">
              <p class="text-[11px] font-black uppercase tracking-wider text-slate-500">Your timezones</p>
              <p class="text-[11px] font-semibold tabular-nums text-slate-400">
                {{ addedTimezones.length }} of {{ maxZones }}
              </p>
            </div>

            <div class="mt-2.5 space-y-2">
              <div
                v-for="(zoneId, idx) in addedTimezones"
                :key="idx"
                class="flex items-center gap-3 rounded-2xl border p-3 transition"
                :class="zoneId === primaryZoneId
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'"
              >
                <!-- The clock first: what time is it there is the question this
                     dialog exists to answer. A row index answered nothing. -->
                <div class="w-[4.75rem] shrink-0 text-center">
                  <p class="font-mono text-sm font-extrabold tabular-nums text-slate-900">
                    {{ liveTimes[zoneId] || '--:--' }}
                  </p>
                </div>

                <div class="h-9 w-px shrink-0 bg-slate-200/70"></div>

                <div class="min-w-0 flex-1">
                  <div class="relative">
                    <select
                      :value="zoneId"
                      @change="updateZoneAtIndex(idx, $event.target.value)"
                      :aria-label="`Timezone ${idx + 1}`"
                      class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 shadow-2xs transition focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/20 cursor-pointer"
                    >
                      <optgroup v-for="(group, region) in groupedTimezones" :key="region" :label="region">
                        <option v-for="item in group" :key="item.id" :value="item.id">
                          {{ item.city }}, {{ item.country }} ({{ item.abbr }})
                        </option>
                      </optgroup>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400"></i>
                  </div>
                  <p class="mt-1 pl-1 text-[10px] font-semibold tabular-nums text-slate-400">
                    {{ getUtcOffset(zoneId) }}
                  </p>
                </div>

                <button
                  v-if="addedTimezones.length > 1"
                  type="button"
                  @click="removeZoneAtIndex(idx)"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  :title="`Remove ${getZone(zoneId).city}`"
                  :aria-label="`Remove ${getZone(zoneId).city}`"
                >
                  <i class="fa-regular fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>

            <button
              v-if="addedTimezones.length < maxZones"
              type="button"
              @click="addTimezone"
              class="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-2.5 text-xs font-bold text-slate-600 transition hover:border-brighture-gold hover:bg-brighture-cream/20 hover:text-brighture-bronze active:scale-98"
            >
              <i class="fa-solid fa-plus text-xs text-brighture-bronze"></i>
              <span>Add another timezone</span>
            </button>

            <p v-else class="mt-2.5 text-center text-[11px] font-medium text-slate-400">
              That is the maximum of {{ maxZones }}. Remove one to add another.
            </p>
          </div>

          <!-- Modal Footer -->
          <div class="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <button
              type="button"
              @click="isSettingsOpen = false"
              class="rounded-xl bg-brighture-gold px-5 py-2 text-xs font-extrabold text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  MAJOR_TIMEZONES,
  normalizeTimeZone,
  getTimeZoneInfo,
  calculateTimeDifference,
  getCurrentTimeInZone,
  getUtcOffsetMinutes,
} from '../../lib/timezoneUtils';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  baseTimezone: {
    type: String,
    default: 'Asia/Manila',
  },
  maxZones: {
    type: Number,
    default: 8,
  },
  /** Show the built-in gear. Off when the host puts it in its own menu. */
  showGear: {
    type: Boolean,
    default: true,
  },
  /** Lets a parent open the manage-timezones dialog from elsewhere. */
  settingsOpen: {
    type: Boolean,
    default: false,
  },
  /** Applied to the picker itself, so a host can hide only the trigger and
      keep the dialog mounted. */
  pickerClass: {
    type: [String, Array, Object],
    default: '',
  },
});

const emit = defineEmits([
  'update:modelValue',
  'change',
  'update:addedTimezones',
  'update:settingsOpen',
]);

const STORAGE_KEY = 'teacher_scheduling_added_timezones';
const ACTIVE_KEY = 'teacher_scheduling_active_timezone';

const isDropdownOpen = ref(false);
const isSettingsOpen = ref(false);
const dropdownRef = ref(null);
const rootRef = ref(null);

const primaryZoneId = computed(() => normalizeTimeZone(props.baseTimezone));

// List of timezones configured by the user
const addedTimezones = ref([]);

// Active selected timezone in the dropdown
const activeZoneId = ref('');

const initFromStorage = () => {
  let saved = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  if (Array.isArray(saved) && saved.length > 0) {
    addedTimezones.value = saved.map(normalizeTimeZone);
  } else {
    // Default added timezones: Base (Manila) + Tokyo
    const base = primaryZoneId.value;
    const secondary = base === 'Asia/Tokyo' ? 'Asia/Manila' : 'Asia/Tokyo';
    addedTimezones.value = [base, secondary];
  }

  let savedActive = '';
  try {
    savedActive = localStorage.getItem(ACTIVE_KEY);
  } catch (e) {}

  if (savedActive && addedTimezones.value.includes(savedActive)) {
    activeZoneId.value = savedActive;
  } else if (props.modelValue && addedTimezones.value.includes(props.modelValue)) {
    activeZoneId.value = props.modelValue;
  } else {
    activeZoneId.value = addedTimezones.value[0] || primaryZoneId.value;
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addedTimezones.value));
    localStorage.setItem(ACTIVE_KEY, activeZoneId.value);
  } catch (e) {}
};

// Grouped timezones for select optgroups
const groupedTimezones = computed(() => {
  const groups = {};
  MAJOR_TIMEZONES.forEach((tz) => {
    if (!groups[tz.region]) groups[tz.region] = [];
    groups[tz.region].push(tz);
  });
  return groups;
});

const getZone = (id) => getTimeZoneInfo(id);
const activeZoneInfo = computed(() => getTimeZoneInfo(activeZoneId.value));
const activeZoneDiff = computed(() => calculateTimeDifference(primaryZoneId.value, activeZoneId.value));

const getDiff = (baseId, targetId) => calculateTimeDifference(baseId, targetId);

const getUtcOffset = (tzId) => {
  const minutes = getUtcOffsetMinutes(tzId);
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''}`;
};

// Switching active timezone via dropdown
const switchTimezone = (zoneId) => {
  activeZoneId.value = zoneId;
  isDropdownOpen.value = false;
  emit('update:modelValue', zoneId);
  emit('change', zoneId);
  saveToStorage();
};

const openSettingsFromDropdown = () => {
  isDropdownOpen.value = false;
  isSettingsOpen.value = true;
};

// Adding/removing timezones in settings
const addTimezone = () => {
  if (addedTimezones.value.length >= props.maxZones) return;
  const pool = ['Asia/Tokyo', 'America/New_York', 'Europe/London', 'America/Los_Angeles', 'Australia/Sydney', 'Asia/Singapore', 'Pacific/Auckland'];
  const existing = new Set(addedTimezones.value);
  const nextId = pool.find((id) => !existing.has(id)) || 'UTC';
  addedTimezones.value.push(nextId);
  emitAdded();
};

const removeZoneAtIndex = (index) => {
  if (addedTimezones.value.length <= 1) return;
  const [removed] = addedTimezones.value.splice(index, 1);
  if (activeZoneId.value === removed) {
    activeZoneId.value = addedTimezones.value[0];
    emit('update:modelValue', activeZoneId.value);
    emit('change', activeZoneId.value);
  }
  emitAdded();
};

const updateZoneAtIndex = (index, newTzId) => {
  const norm = normalizeTimeZone(newTzId);
  const oldId = addedTimezones.value[index];
  addedTimezones.value[index] = norm;
  if (activeZoneId.value === oldId) {
    activeZoneId.value = norm;
    emit('update:modelValue', norm);
    emit('change', norm);
  }
  emitAdded();
};

const emitAdded = () => {
  emit('update:addedTimezones', [...addedTimezones.value]);
  saveToStorage();
};

// Live clocks
const liveTimes = ref({});
let clockTimer = null;

const updateLiveTimes = () => {
  const now = new Date();
  const times = {};
  addedTimezones.value.forEach((tz) => {
    times[tz] = getCurrentTimeInZone(tz, now);
  });
  liveTimes.value = times;
};

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    isDropdownOpen.value = false;
    isSettingsOpen.value = false;
  }
};

onMounted(() => {
  initFromStorage();
  emit('update:modelValue', activeZoneId.value);
  emit('update:addedTimezones', [...addedTimezones.value]);
  updateLiveTimes();
  clockTimer = setInterval(updateLiveTimes, 1000);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
});

watch(
  () => props.baseTimezone,
  (newBase) => {
    if (newBase) {
      const norm = normalizeTimeZone(newBase);
      if (!addedTimezones.value.includes(norm)) {
        addedTimezones.value.unshift(norm);
        emitAdded();
      }
    }
  }
);

// Two-way with the parent, so a menu item elsewhere can raise this dialog and
// closing it here clears the parent's flag.
watch(() => props.settingsOpen, (open) => { if (open !== isSettingsOpen.value) isSettingsOpen.value = open; });
watch(isSettingsOpen, (open) => { if (open !== props.settingsOpen) emit('update:settingsOpen', open); });

defineExpose({
  addedTimezones,
  activeZoneId,
});
</script>
