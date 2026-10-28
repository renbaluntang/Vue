<template>
  <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="max-w-2xl">
        <p class="text-sm text-slate-600">
          Templates hold the questions a teacher answers after a level check. Each type has one
          <strong class="font-bold text-slate-800">active</strong> template, which every new assessment of that type uses.
        </p>
      </div>
      <button
        type="button"
        @click="openNew()"
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brighture-gold px-4 py-2.5 text-sm font-black text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep"
      >
        <i class="fa-solid fa-plus"></i>
        New template
      </button>
    </div>

    <section v-for="group in groups" :key="group.code" class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 text-sm font-black text-slate-900">
          <span class="rounded-md px-2 py-0.5 text-[11px] font-black ring-1" :class="TYPE_STYLES[group.code]">{{ group.code }}</span>
          {{ group.label }}
        </h2>
        <button
          type="button"
          @click="openNew(group.code)"
          class="text-xs font-bold text-brighture-bronze hover:text-brighture-ink"
        >
          <i class="fa-solid fa-plus mr-1"></i>New {{ group.code }} template
        </button>
      </div>

      <p v-if="!group.items.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No {{ group.code }} templates yet. New {{ group.code }} assessments will have no template questions until you add one.
      </p>
      <p
        v-else-if="!group.items.some((t) => t.active)"
        class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800"
      >
        <i class="fa-solid fa-triangle-exclamation"></i>
        No {{ group.code }} template is active, so new {{ group.code }} assessments start without template questions. Set one active.
      </p>

      <ul class="space-y-2.5">
        <li
          v-for="t in group.items"
          :key="t.id"
          class="rounded-2xl border bg-white p-4 shadow-sm transition"
          :class="t.active ? 'border-brighture-gold/60' : 'border-slate-200'"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-sm font-black text-slate-900">{{ t.name }}</h3>
                <span
                  v-if="t.active"
                  class="inline-flex items-center gap-1 rounded-full bg-brighture-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brighture-ink"
                >
                  <i class="fa-solid fa-circle-check text-[9px]"></i> Active
                </span>
                <span v-else class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">Inactive</span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">v{{ t.version }}</span>
              </div>
              <p v-if="t.description" class="mt-1 text-xs text-slate-500 line-clamp-2">{{ t.description }}</p>
              <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500">
                <span><i class="fa-regular fa-clock mr-1 text-slate-400"></i>Updated {{ day(t.updatedAt) }}</span>
                <span><i class="fa-solid fa-list-ul mr-1 text-slate-400"></i>{{ questionCount(t) }} questions in {{ t.sections.length }} sections</span>
                <span><i class="fa-solid fa-clipboard-check mr-1 text-slate-400"></i>In use by {{ usage(t.id) }} {{ usage(t.id) === 1 ? 'assessment' : 'assessments' }}</span>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-1.5 md:justify-end">
              <RouterLink
                :to="`/templates/${t.id}`"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                <i class="fa-solid fa-pen text-[11px]"></i> Edit
              </RouterLink>
              <button
                type="button"
                @click="duplicate(t)"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                <i class="fa-regular fa-copy text-[11px]"></i> Duplicate
              </button>
              <button
                v-if="!t.active"
                type="button"
                @click="activate(t)"
                class="inline-flex items-center gap-1.5 rounded-lg border border-brighture-gold/60 bg-brighture-cream px-3 py-1.5 text-xs font-bold text-brighture-ink transition hover:bg-brighture-gold"
              >
                <i class="fa-solid fa-check text-[11px]"></i> Set active
              </button>
              <button
                type="button"
                @click="onDelete(t)"
                class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition"
                :class="deleteArmed === t.id ? 'border-rose-300 bg-rose-600 text-white hover:bg-rose-700' : 'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'"
              >
                <i class="fa-regular fa-trash-can text-[11px]"></i>
                {{ deleteArmed === t.id ? 'Click again to delete' : 'Delete' }}
              </button>
            </div>
          </div>

          <!-- Why a delete was refused, right where it was asked for. -->
          <div
            v-if="blocked?.id === t.id"
            class="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900"
          >
            <i class="fa-solid fa-box-archive mt-0.5 text-amber-600"></i>
            <p class="flex-1 leading-relaxed">
              <template v-if="blocked.reason === 'active'">
                <strong class="font-black">This is the active {{ t.type }} template.</strong>
                Set another {{ t.type }} template active first, so new assessments still have questions.
              </template>
              <template v-else>
                <strong class="font-black">Archive instead.</strong>
                {{ usage(t.id) }} {{ usage(t.id) === 1 ? 'assessment was' : 'assessments were' }} written with this template, and their results are read against it, so it can't be deleted.
                Leave it inactive: it stays on file for those results, and no new assessment will use it.
              </template>
            </p>
            <button type="button" @click="blocked = null" class="text-amber-700 hover:text-amber-900" aria-label="Dismiss">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- ===================== New template ===================== -->
    <!-- !mt-0: the page's space-y spacing would otherwise push this fixed layer 20px down from the top. -->
    <div v-if="newOpen" class="fixed inset-0 z-50 !mt-0 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 pt-6 pb-6 sm:pt-12" @click.self="newOpen = false">
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="new-tpl-title">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="new-tpl-title" class="text-base font-black text-slate-900">New template</h2>
          <button type="button" @click="newOpen = false" class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="space-y-5 px-5 py-5">
          <div>
            <p class="text-xs font-bold text-slate-700">Assessment type</p>
            <div class="mt-2 grid gap-2 sm:grid-cols-3">
              <button
                v-for="g in groups"
                :key="g.code"
                type="button"
                @click="newType = g.code; newFrom = ''"
                class="rounded-xl border px-3 py-2.5 text-left transition"
                :class="newType === g.code ? 'border-brighture-ink bg-brighture-cream' : 'border-slate-200 hover:border-slate-400'"
              >
                <span class="block text-sm font-black text-slate-900">{{ g.code }}</span>
                <span class="block text-[11px] leading-tight text-slate-500">{{ g.short }}</span>
              </button>
            </div>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-700">Start from</p>
            <div class="mt-2 space-y-2">
              <label class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition" :class="newFrom === '' ? 'border-brighture-ink bg-brighture-cream' : 'border-slate-200 hover:border-slate-400'">
                <input v-model="newFrom" type="radio" value="" class="accent-brighture-ink" />
                <span>
                  <span class="block text-sm font-bold text-slate-900">A blank template</span>
                  <span class="block text-[11px] text-slate-500">One empty section, ready for your questions.</span>
                </span>
              </label>
              <label
                v-for="t in templatesToCopy"
                :key="t.id"
                class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition"
                :class="newFrom === t.id ? 'border-brighture-ink bg-brighture-cream' : 'border-slate-200 hover:border-slate-400'"
              >
                <input v-model="newFrom" type="radio" :value="t.id" class="accent-brighture-ink" />
                <span class="min-w-0">
                  <span class="block truncate text-sm font-bold text-slate-900">A copy of "{{ t.name }}"</span>
                  <span class="block text-[11px] text-slate-500">{{ t.type }} · v{{ t.version }} · {{ questionCount(t) }} questions{{ t.active ? ' · active' : '' }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button type="button" @click="newOpen = false" class="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="button" @click="startNew" class="rounded-xl bg-brighture-ink px-4 py-2 text-sm font-black text-white hover:bg-black">
            Open the builder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { ASSESSMENT_TYPES } from '@/lib/brelas';
import { TYPE_STYLES, day, showToast } from './adminUi';

const school = useSchoolStore();
const router = useRouter();

const groups = computed(() => Object.values(ASSESSMENT_TYPES).map((type) => ({
  code: type.code,
  label: type.label,
  short: type.short,
  // Active first, then the most recently edited, so the one in force leads.
  items: school.templates
    .filter((t) => t.type === type.code)
    .sort((a, b) => Number(b.active) - Number(a.active) || (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')),
})));

const usage = (id) => school.assessments.filter((a) => a.templateId === id).length;
const questionCount = (t) => t.sections.reduce((n, s) => n + s.fields.length, 0);

const duplicate = (t) => {
  const copy = JSON.parse(JSON.stringify(t));
  // An empty id makes saveTemplate treat it as new: a fresh id at version 1.
  const saved = school.saveTemplate({ ...copy, id: '', name: `${t.name} (copy)`, active: false });
  showToast(`Duplicated as "${saved.name}". It stays inactive until you set it active.`);
};

const activate = (t) => {
  school.setTemplateActive(t.id);
  showToast(`"${t.name}" is now the active ${t.type} template. New ${t.type} assessments will use it.`);
};

/**
 * Delete takes two clicks. A template still behind past results, or the one
 * in force, cannot go at all, so for those the first click explains why
 * instead of arming a delete that would only be refused.
 */
const deleteArmed = ref(null);
const blocked = ref(null);
let disarmTimer = null;
const onDelete = (t) => {
  blocked.value = null;
  if (t.active) {
    blocked.value = { id: t.id, reason: 'active' };
    return;
  }
  if (usage(t.id) > 0) {
    blocked.value = { id: t.id, reason: 'in-use' };
    return;
  }
  if (deleteArmed.value !== t.id) {
    deleteArmed.value = t.id;
    clearTimeout(disarmTimer);
    disarmTimer = setTimeout(() => { deleteArmed.value = null; }, 4000);
    return;
  }
  deleteArmed.value = null;
  if (school.deleteTemplate(t.id)) {
    showToast(`"${t.name}" deleted.`);
  } else {
    blocked.value = { id: t.id, reason: 'in-use' };
  }
};

const newOpen = ref(false);
const newType = ref('TA');
const newFrom = ref('');
// Any template can seed a new one, even of another type (the skills section is
// shared), but those of the chosen type are listed first.
const templatesToCopy = computed(() => [...school.templates]
  .sort((a, b) => Number(b.type === newType.value) - Number(a.type === newType.value) || Number(b.active) - Number(a.active)));
const openNew = (type = 'TA') => {
  newType.value = type;
  // Most new templates are a revision of the one in force, so offer that first.
  newFrom.value = school.activeTemplate(type)?.id ?? '';
  newOpen.value = true;
};
const startNew = () => {
  newOpen.value = false;
  router.push({ path: '/templates/new', query: { type: newType.value, ...(newFrom.value ? { from: newFrom.value } : {}) } });
};
</script>
