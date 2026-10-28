<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-5 sm:space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {{ t('nav.feedback') }}
        </h1>
        <p class="mt-1 font-medium text-slate-500">
          What your instructor noticed in your trial lesson and counseling sessions, and what to focus on next.
        </p>
      </div>
      <RouterLink
        :to="{ path: '/booking', query: { subject: CS_CODE } }"
        class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 sm:self-auto"
      >
        <i class="fa-solid fa-calendar-plus" aria-hidden="true"></i>
        Book a counseling session
      </RouterLink>
    </header>

    <!-- Lessons that are over but whose feedback is still being written. They
         come from the lesson list, so nothing from an unfinished assessment is
         ever shown here. -->
    <section
      v-for="item in user.pendingFeedback"
      :key="`pending-${item.lessonId}`"
      class="flex items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-4 sm:px-5"
    >
      <img :src="item.teacherPhoto" :alt="item.teacherName" class="h-10 w-10 shrink-0 rounded-xl object-cover" />
      <div class="min-w-0 flex-1">
        <p class="m-0 text-sm font-bold text-slate-900">{{ item.typeLabel }} · {{ dateIn(item.scheduledAt, TOKYO) }}</p>
        <p class="m-0 mt-0.5 text-xs font-medium text-slate-500">
          <i class="fa-solid fa-pen-to-square mr-1 text-slate-400" aria-hidden="true"></i>
          {{ item.teacherName.split(' ')[0] }} is writing your feedback. It appears here as soon as it is ready.
        </p>
      </div>
      <span class="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:inline">
        Feedback pending
      </span>
    </section>

    <article
      v-for="(item, i) in user.assessmentFeedback"
      :key="`${item.type}-${item.submittedAt}-${i}`"
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- Which session, when, and with whom -->
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:px-6">
        <img :src="item.teacherPhoto" :alt="item.teacherName" class="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-white shadow-xs" />
        <div class="min-w-0 flex-1">
          <p class="m-0 text-sm font-extrabold text-slate-900">{{ item.typeLabel }}</p>
          <p class="m-0 mt-0.5 text-xs font-semibold text-slate-500">
            {{ dateIn(item.scheduledAt || item.submittedAt, TOKYO) }} · with {{ item.teacherName }}
          </p>
        </div>
        <span class="shrink-0 rounded-full bg-brighture-cream px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-brighture-bronze ring-1 ring-brighture-gold/30">
          {{ TYPE_TAGS[item.type] || 'Assessment' }}
        </span>
      </div>

      <div class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
        <section class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <h2 class="m-0 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
            <i class="fa-solid fa-chart-line" aria-hidden="true"></i> How you're doing
          </h2>
          <p class="m-0 mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {{ item.performance || 'Your instructor did not add notes here.' }}
          </p>
        </section>

        <section class="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
          <h2 class="m-0 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brighture-bronze">
            <i class="fa-solid fa-bullseye" aria-hidden="true"></i> What to work on
          </h2>
          <!-- Teachers often write numbered points; those become a real list
               so each one reads as its own step. Anything else keeps its lines. -->
          <ol v-if="workOnPoints(item.workOn)" class="m-0 mt-2 space-y-2 p-0">
            <li v-for="(point, k) in workOnPoints(item.workOn)" :key="k" class="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brighture-gold text-[10px] font-black text-brighture-ink">{{ k + 1 }}</span>
              <span class="min-w-0">{{ point }}</span>
            </li>
          </ol>
          <p v-else class="m-0 mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {{ item.workOn || 'Your instructor did not add notes here.' }}
          </p>
        </section>
      </div>

      <!-- The instructor's suggestion for the next counseling session -->
      <div
        v-if="item.nextCs || item.type === 'CS'"
        class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p class="m-0 flex items-start gap-2 text-sm text-slate-600">
          <i class="fa-regular fa-calendar mt-0.5 text-sky-600" aria-hidden="true"></i>
          <span>
            <strong class="font-bold text-slate-800">Next counseling session:</strong>
            <template v-if="item.nextCs"> your instructor suggests <strong class="font-bold text-slate-800">{{ lowerFirst(item.nextCs) }}</strong>.</template>
            <template v-else> book one whenever you'd like a progress check.</template>
          </span>
        </p>
        <RouterLink
          :to="{ path: '/booking', query: { subject: CS_CODE } }"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brighture-gold px-4 py-2.5 text-xs font-extrabold text-brighture-ink shadow-xs transition hover:bg-brighture-gold-deep"
        >
          Book a counseling session <i class="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
        </RouterLink>
      </div>
    </article>

    <!-- Nothing yet -->
    <div
      v-if="!user.assessmentFeedback.length && !user.pendingFeedback.length"
      class="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>
      </div>
      <p class="mx-auto mt-3 max-w-sm text-sm font-semibold text-slate-600">
        After a trial lesson or counseling session, your instructor's feedback appears here.
      </p>
      <RouterLink
        :to="{ path: '/booking', query: { subject: user.taEligible ? TA_CODE : CS_CODE } }"
        class="mt-4 inline-flex items-center gap-2 rounded-xl bg-brighture-gold px-4 py-2.5 text-xs font-extrabold text-brighture-ink shadow-xs transition hover:bg-brighture-gold-deep"
      >
        <i class="fa-solid fa-calendar-plus" aria-hidden="true"></i>
        {{ user.taEligible ? 'Book your free trial lesson' : 'Book a counseling session' }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/useUserStore';
import { TOKYO, dateIn } from '@/lib/schoolTime';

// This page reads only user.assessmentFeedback and user.pendingFeedback,
// which carry the teacher's feedback and never the student's level.
const { t } = useI18n();
const user = useUserStore();

const CS_CODE = '[CS]';
const TA_CODE = '[TA]';
const TYPE_TAGS = { TA: 'Trial', CS: 'Counseling', FA: 'Assessment' };

/** "In about 3 months" -> "in about 3 months", to sit inside a sentence. */
const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * The "what to work on" text as separate points when the teacher numbered
 * them ("1. …", "2) …") or bulleted them; null when it is plain prose.
 */
const workOnPoints = (text) => {
  const lines = String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const marker = /^(\d+[.)]|[-•*])\s+/;
  if (lines.length < 2 || !lines.every((line) => marker.test(line))) return null;
  return lines.map((line) => line.replace(marker, ''));
};
</script>
