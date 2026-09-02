<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Reservations</h1>
        <p class="mt-0.5 text-sm text-slate-500">
          Every lesson booked with you, soonest first.
        </p>
      </div>
      <span class="shrink-0 self-start rounded-2xl bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-800 sm:self-auto">
        {{ filtered.length }} of {{ teacher.reservations.length }} shown
      </span>
    </header>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="activeTab = tab.key"
        class="rounded-2xl px-4 py-2 text-xs font-bold transition"
        :class="activeTab === tab.key
          ? 'bg-slate-900 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Cards below lg, table above: the legacy grid is nine columns wide and no
         phone renders that without turning into a sideways mess. -->
    <div class="space-y-3 lg:hidden">
      <article
        v-for="row in filtered"
        :key="row.id"
        class="rounded-2xl border bg-white p-4 shadow-sm"
        :class="row.id === teacher.nextReservation?.id ? 'border-brighture-gold' : 'border-slate-200/80'"
      >
        <div class="flex items-start gap-3">
          <AppImage :src="row.studentPhoto" :alt="row.studentName" class="h-12 w-12 shrink-0 rounded-xl" />
          <div class="min-w-0 flex-1">
            <button type="button" @click="selectedStudent = row" class="block truncate text-sm font-bold text-slate-900 hover:text-brighture-bronze">
              {{ row.studentName }}
            </button>
            <p class="truncate text-[11px] text-slate-500">{{ row.subject }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-1.5">
              <span v-if="row.id === teacher.nextReservation?.id" class="rounded-full bg-brighture-gold px-2 py-0.5 text-[10px] font-black text-brighture-ink">Next</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{{ row.membership }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{{ row.point }} pts</span>
              <span v-if="row.substitution" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Sub</span>
            </div>
          </div>
        </div>

        <dl class="mt-3 space-y-1 border-t border-slate-100 pt-3 text-[11px]">
          <div class="flex justify-between gap-2"><dt class="text-slate-400">Manila</dt><dd class="font-bold text-slate-700">{{ row.startManila }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-slate-400">Tokyo</dt><dd class="font-bold text-slate-700">{{ row.startTokyo }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-slate-400">Student</dt><dd class="truncate font-bold text-slate-700">{{ row.startStudent }}</dd></div>
        </dl>

        <p v-if="row.note" class="mt-2 rounded-xl bg-slate-50 p-2.5 text-[11px] italic text-slate-600">“{{ row.note }}”</p>

        <div class="mt-3 flex gap-2">
          <a
            v-if="row.meetLink"
            :href="row.meetLink"
            target="_blank"
            rel="noopener"
            class="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-center text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
          >
            Google Meet
          </a>
          <span v-else class="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-center text-[11px] font-bold text-rose-700">No link</span>
          <button
            type="button"
            @click="selectedStudent = row"
            class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            Details
          </button>
        </div>
      </article>
    </div>

    <div class="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-sm">
          <thead class="bg-slate-50 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th class="px-4 py-3">Appointed date</th>
              <th class="px-4 py-3">Student</th>
              <th class="px-4 py-3">Membership</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Subject</th>
              <th class="px-4 py-3 text-center">Point</th>
              <th class="px-4 py-3 text-center">Sub.</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in filtered"
              :key="row.id"
              class="align-top hover:bg-slate-50/70"
              :class="row.id === teacher.nextReservation?.id ? 'bg-brighture-cream/40' : ''"
            >
              <td class="px-4 py-3">
                <p class="font-bold text-slate-900">
                  {{ row.startManila }}
                  <span v-if="row.id === teacher.nextReservation?.id" class="ml-1 rounded-full bg-brighture-gold px-1.5 py-0.5 text-[9px] font-black text-brighture-ink align-middle">NEXT</span>
                </p>
                <p class="text-[11px] text-slate-500">{{ row.startTokyo }} · Tokyo</p>
                <p class="text-[11px] text-slate-400">{{ row.startStudent }}</p>
              </td>
              <td class="px-4 py-3">
                <button type="button" @click="selectedStudent = row" class="font-bold text-brighture-bronze hover:underline">
                  {{ row.studentName }}
                </button>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ row.membership }}</td>
              <td class="px-4 py-3 text-slate-600">{{ row.category }}</td>
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-800">{{ row.subject }}</p>
                <p class="text-[11px] text-slate-500">{{ row.lessonClass }}</p>
              </td>
              <td class="px-4 py-3 text-center font-bold text-slate-800">{{ row.point }}</td>
              <td class="px-4 py-3 text-center text-slate-600">{{ row.substitution ? 'Yes' : 'No' }}</td>
              <td class="px-4 py-3 text-center">
                <a
                  v-if="row.meetLink"
                  :href="row.meetLink"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-950 transition hover:bg-emerald-400"
                >
                  📹 Meet
                </a>
                <span v-else class="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                  <i class="fa-solid fa-triangle-exclamation"></i> No link
                </span>
              </td>
              <td class="px-4 py-3 max-w-xs text-[12px] italic text-slate-500">{{ row.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500">
        The Google Meet button appears five minutes before each lesson starts.
      </p>
    </div>

    <p v-if="!filtered.length" class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      No reservations in this view.
    </p>

    <StudentDetailModal :student="selectedStudent" @close="selectedStudent = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AppImage from '../../components/AppImage.vue';
import StudentDetailModal from '../../components/teacher/StudentDetailModal.vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

const tabs = [
  { key: 'all', label: 'All upcoming' },
  { key: 'today', label: 'Today' },
  { key: 'fc', label: 'Free Conversation' },
];
const activeTab = ref('all');

const filtered = computed(() => {
  if (activeTab.value === 'today') return teacher.todaysReservations;
  if (activeTab.value === 'fc') return teacher.reservations.filter((row) => row.category === 'Free Conversation');
  return teacher.reservations;
});

const selectedStudent = ref(null);
</script>
