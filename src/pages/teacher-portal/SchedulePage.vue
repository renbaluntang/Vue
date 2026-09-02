<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Scheduling</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Tap a slot to open or close it. Times are shown in {{ zoneLabel }},
          the timezone set on your profile.
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <span class="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
          {{ teacher.openSlotCount }} slots open
        </span>
        <button
          type="button"
          @click="save"
          :disabled="!isDirty"
          class="rounded-2xl bg-brighture-gold px-5 py-2.5 text-sm font-extrabold text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40"
        >
          {{ saved ? '✓ Registered' : 'Register' }}
        </button>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        @click="clearAll"
        class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
      >
        Clear week
      </button>
    </div>

    <!-- The grid scrolls inside its own box; the page itself never scrolls
         sideways, which is what makes this usable on a phone. -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[680px] border-collapse text-center">
          <thead>
            <tr class="bg-slate-50">
              <th class="sticky left-0 z-10 bg-slate-50 px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                {{ zoneLabel }}
              </th>
              <th v-for="day in teacher.scheduleDays" :key="day.key" class="px-2 py-2">
                <p class="text-xs font-black text-slate-700">{{ day.label }}</p>
                <p class="text-[10px] text-slate-400">{{ day.date }}</p>
                <button
                  type="button"
                  @click="toggleDay(day.key)"
                  class="mt-1 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                >
                  All
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in teacher.scheduleSlots" :key="slot.key" class="border-t border-slate-100">
              <th class="sticky left-0 z-10 bg-white px-3 py-1.5 text-left">
                <button
                  type="button"
                  @click="toggleRow(slot.key)"
                  class="text-[11px] font-bold text-slate-600 transition hover:text-brighture-bronze"
                  title="Toggle this hour across the week"
                >
                  {{ slotTime(slot) }}
                </button>
              </th>
              <td v-for="day in teacher.scheduleDays" :key="day.key" class="p-1">
                <button
                  type="button"
                  @click="toggle(day.key, slot.key)"
                  :aria-pressed="teacher.isOpen(day.key, slot.key)"
                  :aria-label="`${day.label} ${slotTime(slot)} ${teacher.isOpen(day.key, slot.key) ? 'open' : 'closed'}`"
                  class="h-8 w-full rounded-lg border text-[10px] font-black transition active:scale-95"
                  :class="teacher.isOpen(day.key, slot.key)
                    ? 'border-transparent bg-gradient-to-r from-brighture-gold to-brighture-gold-deep text-brighture-ink shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-transparent hover:border-brighture-gold/50 hover:bg-brighture-cream'"
                >
                  ✓
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-xs text-slate-500">
      Open slots are offered to students immediately. Closing a slot that already
      has a reservation does not cancel it — contact admin support instead.
    </p>

    <!-- Unsaved bar, mirroring the student profile page's pattern. -->
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-12 opacity-0"
      leave-active-class="transition duration-150 ease-in" leave-to-class="translate-y-12 opacity-0"
    >
      <div
        v-if="isDirty"
        class="fixed bottom-20 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-white shadow-2xl lg:bottom-6"
      >
        <p class="min-w-0 truncate text-xs font-semibold text-slate-200 sm:text-sm">
          You have unregistered schedule changes.
        </p>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" @click="revert" class="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white">
            Revert
          </button>
          <button
            type="button"
            @click="save"
            class="rounded-xl bg-brighture-gold px-5 py-2 text-xs font-extrabold text-slate-950 shadow-md transition hover:bg-brighture-gold-deep active:scale-95"
          >
            Register
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

// One clock, and it is the instructor's own. Two columns of times invited the
// exact mistake they were meant to prevent: reading the wrong one.
const zoneLabel = computed(() => teacher.profile.timezone.split('/').pop());
const usesTokyo = computed(() => teacher.profile.timezone.includes('Tokyo'));
const slotTime = (slot) => (usesTokyo.value ? slot.tokyo : slot.manila);

// Snapshot on entry so Register/Revert have something to compare against.
const savedSnapshot = ref(JSON.stringify(teacher.availability));
const saved = ref(false);

const isDirty = computed(() => JSON.stringify(teacher.availability) !== savedSnapshot.value);

const touch = () => { saved.value = false; };
const toggle = (dayKey, slotKey) => { teacher.toggleSlot(dayKey, slotKey); touch(); };

/** "All" flips the whole column to whichever state is not already dominant. */
const toggleDay = (dayKey) => {
  const openCount = teacher.scheduleSlots.filter((slot) => teacher.isOpen(dayKey, slot.key)).length;
  teacher.setDay(dayKey, openCount < teacher.scheduleSlots.length);
  touch();
};

const toggleRow = (slotKey) => {
  const openCount = teacher.scheduleDays.filter((day) => teacher.isOpen(day.key, slotKey)).length;
  teacher.setSlotRow(slotKey, openCount < teacher.scheduleDays.length);
  touch();
};

const clearAll = () => {
  teacher.scheduleDays.forEach((day) => teacher.setDay(day.key, false));
  touch();
};

const revert = () => {
  Object.assign(teacher.availability, JSON.parse(savedSnapshot.value));
  saved.value = false;
};

const save = () => {
  savedSnapshot.value = JSON.stringify(teacher.availability);
  saved.value = true;
};
</script>
