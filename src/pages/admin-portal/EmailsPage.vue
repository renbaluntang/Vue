<template>
  <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
    <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <i class="fa-solid fa-envelope-open-text"></i>
      </span>
      <div class="text-sm text-slate-600">
        <p>
          When a student books or cancels a trial lesson (TA) or counseling session (CS), an email goes to the student, the teacher and the admin team.
          This is the log of those emails, newest first.
        </p>
        <p class="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <i class="fa-solid fa-shield-halved"></i>
          The level is never included in any of these emails.
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="group" aria-label="Filter by recipient">
        <button
          v-for="r in recipients"
          :key="r.value"
          type="button"
          @click="to = r.value"
          class="rounded-lg px-3 py-1.5 transition"
          :class="to === r.value ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          {{ r.label }}
        </button>
      </div>
      <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="group" aria-label="Filter by event">
        <button
          v-for="e in events"
          :key="e.value"
          type="button"
          @click="event = e.value"
          class="rounded-lg px-3 py-1.5 transition"
          :class="event === e.value ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          {{ e.label }}
        </button>
      </div>
    </div>

    <div v-if="!outbox.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <i class="fa-regular fa-envelope text-3xl text-slate-300"></i>
      <p class="mt-3 text-sm font-bold text-slate-700">No emails yet</p>
      <p class="mx-auto mt-1 max-w-md text-xs text-slate-500">
        Book or cancel a TA or CS lesson in the student portal and the three emails it sends will appear here.
      </p>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead class="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">Sent</th>
              <th class="px-4 py-3">To</th>
              <th class="px-4 py-3">Subject</th>
              <th class="px-4 py-3">Lesson time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="m in rows" :key="m.id">
              <td class="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600">{{ stamp(m.at) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <i :class="RECIPIENT_ICONS[m.to] ?? 'fa-solid fa-user'" class="w-4 text-center text-slate-400"></i>
                  <div>
                    <p class="font-bold text-slate-800">{{ m.name }}</p>
                    <p class="text-[11px] capitalize text-slate-500">{{ m.to }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded px-1.5 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[m.type]">{{ m.type }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-black ring-1"
                    :class="m.event === 'booked' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'"
                  >
                    {{ m.event === 'booked' ? 'Booked' : 'Cancelled' }}
                  </span>
                  <span class="text-slate-800">{{ m.subject }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{{ stamp(m.start) }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="4" class="px-4 py-10 text-center text-sm text-slate-500">No emails match these filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { TYPE_STYLES, stamp } from './adminUi';

const school = useSchoolStore();

const recipients = [
  { value: 'all', label: 'Everyone' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'admin', label: 'Admin' },
];
const events = [
  { value: 'all', label: 'All' },
  { value: 'booked', label: 'Bookings' },
  { value: 'cancelled', label: 'Cancellations' },
];
const RECIPIENT_ICONS = {
  student: 'fa-solid fa-user-graduate',
  teacher: 'fa-solid fa-chalkboard-user',
  admin: 'fa-solid fa-user-shield',
};

const to = ref('all');
const event = ref('all');

const outbox = computed(() => school.db.outbox ?? []);
const rows = computed(() => outbox.value
  .filter((m) => to.value === 'all' || m.to === to.value)
  .filter((m) => event.value === 'all' || m.event === event.value)
  .slice()
  .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? '')));
</script>
