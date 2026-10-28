<template>
  <div class="space-y-5">
    <p
      v-if="assessment.status !== 'submitted'"
      class="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600"
    >
      <i class="fa-solid fa-hourglass-half mt-0.5 text-slate-400"></i>
      <span v-if="assessment.status === 'scheduled'">This assessment has not taken place yet. Results appear here once the teacher writes them.</span>
      <span v-else>The teacher has started but not submitted this assessment. What they have saved so far is shown below.</span>
    </p>

    <!-- Fixed fields: part of every assessment, whatever the template says. -->
    <section class="rounded-2xl border border-slate-200 bg-white">
      <h3 class="border-b border-slate-100 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Result</h3>
      <dl class="divide-y divide-slate-100 text-sm">
        <div class="flex flex-wrap items-center gap-3 px-4 py-3">
          <dt class="w-40 shrink-0 text-xs font-bold text-slate-500">BRELAS level</dt>
          <dd class="flex flex-wrap items-center gap-2">
            <LevelChip :value="assessment.level" />
            <span v-if="level.rating" class="text-xs font-semibold text-slate-500">Rating {{ level.rating }}/{{ RATING_MAX }}</span>
            <span v-if="level.cefr" class="text-[11px] font-semibold text-slate-400">CEFR {{ level.cefr }} (reference)</span>
          </dd>
        </div>
        <div class="px-4 py-3">
          <dt class="flex items-center gap-2 text-xs font-bold text-slate-500">
            NFA
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">Internal</span>
          </dt>
          <dd class="mt-1 whitespace-pre-line text-slate-800">{{ assessment.nfa || '—' }}</dd>
        </div>
        <div class="px-4 py-3">
          <dt class="flex items-center gap-2 text-xs font-bold text-slate-500">
            Current performance
            <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">Student sees</span>
          </dt>
          <dd class="mt-1 whitespace-pre-line text-slate-800">{{ assessment.performance || '—' }}</dd>
        </div>
        <div class="px-4 py-3">
          <dt class="flex items-center gap-2 text-xs font-bold text-slate-500">
            What to work on
            <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">Student sees</span>
          </dt>
          <dd class="mt-1 whitespace-pre-line text-slate-800">{{ assessment.workOn || '—' }}</dd>
        </div>
        <div v-if="assessment.type === 'CS'" class="flex flex-wrap items-center gap-3 px-4 py-3">
          <dt class="w-40 shrink-0 text-xs font-bold text-slate-500">Recommended next CS</dt>
          <dd class="text-slate-800">{{ assessment.nextCs || '—' }}</dd>
        </div>
      </dl>
    </section>

    <!-- Template answers, read against the version the teacher actually filled in. -->
    <section v-if="template" class="rounded-2xl border border-slate-200 bg-white">
      <h3 class="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-500">
        Template answers
        <span class="normal-case tracking-normal font-semibold text-slate-400">{{ template.name }} · v{{ assessment.templateVersion ?? template.version }}</span>
      </h3>
      <div v-for="section in template.sections" :key="section.id" class="border-b border-slate-100 last:border-0 px-4 py-3">
        <h4 class="text-xs font-black text-slate-700">{{ section.title }}</h4>
        <dl class="mt-2 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <div
            v-for="field in section.fields"
            :key="field.id"
            :class="field.type === 'longtext' || field.type === 'multiselect' ? 'sm:col-span-2' : ''"
          >
            <dt class="text-[11px] font-bold text-slate-500">{{ field.label }}</dt>
            <dd class="mt-0.5 text-sm text-slate-800">
              <template v-if="isEmpty(answers[field.id], field)"><span class="text-slate-400">—</span></template>
              <div v-else-if="field.type === 'multiselect'" class="flex flex-wrap gap-1.5">
                <span v-for="v in answers[field.id]" :key="v" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{{ v }}</span>
              </div>
              <span v-else-if="field.type === 'checkbox'" class="inline-flex items-center gap-1.5 font-semibold">
                <i :class="answers[field.id] ? 'fa-solid fa-square-check text-emerald-600' : 'fa-regular fa-square text-slate-400'"></i>
                {{ answers[field.id] ? 'Yes' : 'No' }}
              </span>
              <span v-else-if="field.type === 'rating'" class="font-semibold">
                {{ answers[field.id] }}
                <span v-if="ratingPos(field, answers[field.id])" class="ml-1 text-xs font-medium text-slate-400">{{ ratingPos(field, answers[field.id]) }}</span>
              </span>
              <p v-else class="whitespace-pre-line">{{ answers[field.id] }}</p>
            </dd>
          </div>
        </dl>
      </div>
    </section>
    <p v-else class="text-xs font-semibold text-slate-500">The template this assessment used is no longer available.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import LevelChip from './LevelChip.vue';
import { RATING_MAX, levelInfo } from '@/lib/brelas';

const props = defineProps({ assessment: { type: Object, required: true } });
const school = useSchoolStore();

const template = computed(() => school.templateFor(props.assessment));
const answers = computed(() => props.assessment.answers ?? {});
const level = computed(() => levelInfo(props.assessment.level));

const isEmpty = (value, field) => {
  // An unticked box is still an answer once the assessment is submitted.
  if (field.type === 'checkbox') return value === undefined && props.assessment.status !== 'submitted';
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || value === '';
};

/** '(2 of 5)': where the answer sits on its scale, best first. */
const ratingPos = (field, value) => {
  const i = (field.options ?? []).indexOf(value);
  return i === -1 ? '' : `(${i + 1} of ${field.options.length})`;
};
</script>
