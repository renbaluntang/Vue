<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <!-- Leaving with unsaved edits: asked here, in the page, never in a browser dialog. -->
    <div
      v-if="pendingLeave"
      ref="leaveBar"
      class="sticky top-0 z-20 mb-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-md sm:flex-row sm:items-center"
      role="alert"
    >
      <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
      <p class="flex-1 text-sm font-semibold text-amber-900">You have unsaved changes to this template. Leave without saving them?</p>
      <div class="flex gap-2">
        <button type="button" @click="pendingLeave = null" class="rounded-xl bg-white px-3.5 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">Keep editing</button>
        <button type="button" @click="leaveAnyway" class="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-black text-white hover:bg-rose-700">Leave without saving</button>
      </div>
    </div>

    <div v-if="notFound" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
      <i class="fa-regular fa-file text-3xl text-slate-300"></i>
      <p class="mt-3 text-sm font-bold text-slate-700">This template no longer exists.</p>
      <RouterLink to="/templates" class="mt-3 inline-block text-sm font-bold text-brighture-bronze hover:text-brighture-ink">Back to all templates</RouterLink>
    </div>

    <template v-else-if="draft">
      <!-- Title bar -->
      <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0">
          <RouterLink to="/templates" class="text-xs font-bold text-slate-500 hover:text-slate-800">
            <i class="fa-solid fa-arrow-left mr-1"></i>All templates
          </RouterLink>
          <h2 class="mt-1 truncate text-xl font-black text-slate-900">{{ draft.name || (isNew ? 'New template' : 'Untitled template') }}</h2>
          <p class="mt-0.5 text-xs font-semibold text-slate-500">
            <template v-if="isNew">Not saved yet. It is saved as version 1.</template>
            <template v-else>Version {{ original.version }} · saving makes version {{ original.version + 1 }}</template>
            <span v-if="dirty" class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800">Unsaved changes</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="dirty && !isNew"
            type="button"
            @click="onDiscard"
            class="rounded-xl px-3.5 py-2.5 text-sm font-bold transition"
            :class="discardArmed ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'text-slate-600 hover:bg-slate-100'"
          >
            {{ discardArmed ? 'Click again to discard' : 'Discard changes' }}
          </button>
          <button
            type="button"
            @click="save"
            :disabled="!dirty && !isNew"
            class="inline-flex items-center gap-2 rounded-xl bg-brighture-gold px-5 py-2.5 text-sm font-black text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i class="fa-solid fa-floppy-disk"></i>
            {{ isNew ? 'Save template' : 'Save as new version' }}
          </button>
        </div>
      </div>

      <div
        v-if="errorList.length && showErrors"
        class="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        role="alert"
      >
        <p class="font-black"><i class="fa-solid fa-circle-exclamation mr-1.5"></i>Fix these before saving:</p>
        <ul class="mt-1.5 list-disc space-y-0.5 pl-6 text-xs font-semibold">
          <li v-for="e in errorList" :key="e">{{ e }}</li>
        </ul>
      </div>

      <!-- On narrow screens the editor and the preview take turns. -->
      <div class="mb-4 flex rounded-xl bg-slate-100 p-1 text-xs font-black lg:hidden">
        <button
          v-for="v in ['edit', 'preview']"
          :key="v"
          type="button"
          @click="view = v"
          class="flex-1 rounded-lg py-2 transition"
          :class="view === v ? 'bg-white text-brighture-ink shadow-sm' : 'text-slate-500'"
        >
          {{ v === 'edit' ? 'Edit' : 'Preview' }}
        </button>
      </div>

      <div class="grid gap-6 lg:grid-cols-12">
        <!-- ===================== Editor ===================== -->
        <div class="space-y-5 lg:col-span-7" :class="view === 'edit' ? '' : 'hidden lg:block'">
          <section class="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div>
              <label for="tpl-name" class="text-xs font-bold text-slate-700">Template name <span class="text-rose-500">*</span></label>
              <input
                id="tpl-name"
                v-model="draft.name"
                type="text"
                maxlength="120"
                placeholder="e.g. Trial Lesson Feedback (TA) — 2027"
                class="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                :class="showErrors && errors.name ? 'border-rose-400' : 'border-slate-200 focus:border-brighture-gold'"
              />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="tpl-type" class="text-xs font-bold text-slate-700">Assessment type</label>
                <select
                  id="tpl-type"
                  v-model="draft.type"
                  :disabled="!isNew"
                  class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option v-for="t in Object.values(ASSESSMENT_TYPES)" :key="t.code" :value="t.code">{{ t.code }} — {{ t.short }}</option>
                </select>
                <p v-if="!isNew" class="mt-1 text-[11px] text-slate-500">The type is fixed once a template is saved. Duplicate it to reuse the questions for another type.</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-700">Status</p>
                <p v-if="original?.active" class="mt-1.5 flex items-center gap-2 rounded-lg bg-brighture-cream px-3 py-2 text-xs font-semibold text-brighture-ink">
                  <i class="fa-solid fa-circle-check text-brighture-bronze"></i>
                  Active: new {{ draft.type }} assessments use this template.
                </p>
                <label v-else class="mt-1.5 flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                  <input v-model="draft.active" type="checkbox" class="mt-0.5 h-4 w-4 accent-brighture-ink" />
                  <span>Make this the active {{ draft.type }} template when I save. <span class="font-normal text-slate-500">The current one becomes inactive.</span></span>
                </label>
              </div>
            </div>
            <div>
              <label for="tpl-desc" class="text-xs font-bold text-slate-700">Description</label>
              <textarea
                id="tpl-desc"
                v-model="draft.description"
                rows="2"
                maxlength="400"
                placeholder="What this assessment covers and roughly how long each part takes. Teachers see this above the form."
                class="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
              ></textarea>
            </div>
          </section>

          <!-- Fixed fields: shown, never editable, so no template can leak the level to a student. -->
          <section class="rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
            <h3 class="flex items-center gap-2 text-sm font-black text-sky-900">
              <i class="fa-solid fa-lock text-sky-600"></i>
              Every assessment also has these fixed fields
            </h3>
            <p class="mt-1 text-xs leading-relaxed text-sky-900/80">
              They sit outside the template, so you can't edit or remove them, and no template question can ever show the level to a student.
            </p>
            <ul class="mt-3 space-y-1.5 text-xs text-sky-950">
              <li class="flex gap-2"><i class="fa-solid fa-layer-group mt-0.5 w-4 text-center text-sky-600"></i><span><strong class="font-black">BRELAS rating</strong> (required): B0, or 1–15, which sets the level (B1–A) and its band. Admins and teachers only.</span></li>
              <li class="flex gap-2"><i class="fa-solid fa-note-sticky mt-0.5 w-4 text-center text-sky-600"></i><span><strong class="font-black">NFA</strong>: internal notes for the next teacher. Never shown to the student.</span></li>
              <li class="flex gap-2"><i class="fa-solid fa-eye mt-0.5 w-4 text-center text-emerald-600"></i><span><strong class="font-black">Current performance</strong> and <strong class="font-black">What to work on</strong>: the only parts the student sees.</span></li>
              <li class="flex gap-2"><i class="fa-solid fa-calendar-plus mt-0.5 w-4 text-center text-sky-600"></i><span><strong class="font-black">Recommended next CS</strong>, on counseling sessions (CS) only.</span></li>
            </ul>
            <p class="mt-3 text-xs leading-relaxed text-sky-900/80">
              Template answers are internal too: students never see them.
            </p>
          </section>

          <!-- Sections -->
          <section
            v-for="(section, si) in draft.sections"
            :key="section.id"
            class="rounded-2xl border bg-white"
            :class="showErrors && errors[section.id] ? 'border-rose-300' : 'border-slate-200'"
          >
            <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">{{ si + 1 }}</span>
              <input
                v-model="section.title"
                type="text"
                maxlength="80"
                placeholder="Section title, e.g. Interview"
                :aria-label="`Section ${si + 1} title`"
                class="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-1.5 text-sm font-black text-slate-900 hover:border-slate-200 focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
              />
              <div class="flex shrink-0 items-center gap-0.5">
                <IconButton icon="fa-solid fa-arrow-up" label="Move section up" :disabled="si === 0" @click="move(draft.sections, si, -1)" />
                <IconButton icon="fa-solid fa-arrow-down" label="Move section down" :disabled="si === draft.sections.length - 1" @click="move(draft.sections, si, 1)" />
                <button
                  type="button"
                  @click="removeSection(si)"
                  class="ml-1 rounded-lg px-2 py-1.5 text-xs font-bold transition"
                  :class="armed === section.id ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'"
                  :aria-label="`Delete section ${section.title}`"
                >
                  <i class="fa-regular fa-trash-can"></i>
                  <span v-if="armed === section.id" class="ml-1">Delete with {{ section.fields.length }} {{ section.fields.length === 1 ? 'question' : 'questions' }}?</span>
                </button>
              </div>
            </div>
            <p v-if="showErrors && errors[section.id]" class="px-4 pt-2 text-xs font-semibold text-rose-600">{{ errors[section.id] }}</p>

            <ul class="divide-y divide-slate-100">
              <li v-for="(field, fi) in section.fields" :key="field.id" class="px-4 py-3">
                <!-- Collapsed row -->
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="openField = openField === field.id ? null : field.id"
                    class="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    :aria-expanded="openField === field.id ? 'true' : 'false'"
                  >
                    <i :class="fieldType(field.type).icon" class="w-4 shrink-0 text-center text-slate-400"></i>
                    <span class="min-w-0 truncate text-sm font-bold" :class="field.label ? 'text-slate-800' : 'italic text-slate-400'">
                      {{ field.label || 'Untitled question' }}
                    </span>
                    <span v-if="field.required" class="shrink-0 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-black text-rose-600">Required</span>
                    <span class="hidden shrink-0 text-[11px] font-semibold text-slate-400 sm:inline">{{ fieldType(field.type).label }}</span>
                    <i v-if="showErrors && errors[field.id]" class="fa-solid fa-circle-exclamation shrink-0 text-rose-500" :title="errors[field.id]"></i>
                    <i class="fa-solid fa-chevron-down ml-auto shrink-0 text-[10px] text-slate-400 transition-transform" :class="openField === field.id ? 'rotate-180' : ''"></i>
                  </button>
                  <div class="flex shrink-0 items-center gap-0.5">
                    <IconButton icon="fa-solid fa-arrow-up" label="Move question up" :disabled="fi === 0" @click="move(section.fields, fi, -1)" />
                    <IconButton icon="fa-solid fa-arrow-down" label="Move question down" :disabled="fi === section.fields.length - 1" @click="move(section.fields, fi, 1)" />
                    <button
                      type="button"
                      @click="removeField(section, fi)"
                      class="rounded-lg px-2 py-1.5 text-xs font-bold transition"
                      :class="armed === field.id ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'"
                      aria-label="Delete question"
                    >
                      <i class="fa-regular fa-trash-can"></i>
                      <span v-if="armed === field.id" class="ml-1">Delete?</span>
                    </button>
                  </div>
                </div>

                <!-- Field editor -->
                <div v-if="openField === field.id" class="mt-3 space-y-3 rounded-xl bg-slate-50 p-3.5">
                  <p v-if="showErrors && errors[field.id]" class="text-xs font-semibold text-rose-600">{{ errors[field.id] }}</p>
                  <div class="grid gap-3 sm:grid-cols-3">
                    <div class="sm:col-span-2">
                      <label :for="`lbl-${field.id}`" class="text-[11px] font-bold text-slate-600">Question <span class="text-rose-500">*</span></label>
                      <input
                        :id="`lbl-${field.id}`"
                        v-model="field.label"
                        type="text"
                        maxlength="120"
                        placeholder="e.g. Pronunciation"
                        class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                      />
                    </div>
                    <div>
                      <label :for="`type-${field.id}`" class="text-[11px] font-bold text-slate-600">Answer type</label>
                      <select
                        :id="`type-${field.id}`"
                        :value="field.type"
                        @change="changeType(field, $event.target.value)"
                        class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                      >
                        <option v-for="t in FIELD_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                      </select>
                    </div>
                  </div>
                  <p class="-mt-1 text-[11px] text-slate-500">{{ fieldType(field.type).hint }}</p>

                  <!-- Options -->
                  <div v-if="fieldType(field.type).hasOptions">
                    <p class="text-[11px] font-bold text-slate-600">
                      Options <span class="font-normal text-slate-500">— at least two{{ field.type === 'rating' ? ', best first' : '' }}</span>
                    </p>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
                      <span
                        v-for="(opt, oi) in field.options"
                        :key="`${opt}-${oi}`"
                        class="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white py-0.5 pl-2.5 pr-1 text-xs font-bold text-slate-700"
                      >
                        <span v-if="field.type === 'rating'" class="mr-1 text-[10px] font-black text-slate-400">{{ oi + 1 }}</span>
                        {{ opt }}
                        <button type="button" :disabled="oi === 0" @click="move(field.options, oi, -1)" class="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" :aria-label="`Move ${opt} earlier`">
                          <i class="fa-solid fa-chevron-left text-[9px]"></i>
                        </button>
                        <button type="button" :disabled="oi === field.options.length - 1" @click="move(field.options, oi, 1)" class="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" :aria-label="`Move ${opt} later`">
                          <i class="fa-solid fa-chevron-right text-[9px]"></i>
                        </button>
                        <button type="button" @click="field.options.splice(oi, 1)" class="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600" :aria-label="`Remove ${opt}`">
                          <i class="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </span>
                      <span v-if="!field.options.length" class="text-xs italic text-slate-400">No options yet.</span>
                    </div>
                    <form class="mt-2 flex gap-2" @submit.prevent="addOption(field)">
                      <input
                        v-model="optionDraft[field.id]"
                        type="text"
                        maxlength="60"
                        placeholder="Add an option and press Enter"
                        :aria-label="`New option for ${field.label || 'this question'}`"
                        class="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                      />
                      <button type="submit" class="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
                        <i class="fa-solid fa-plus mr-1"></i>Add
                      </button>
                    </form>
                    <p v-if="optionError[field.id]" class="mt-1 text-[11px] font-semibold text-rose-600">{{ optionError[field.id] }}</p>
                  </div>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <div :class="fieldType(field.type).hasMax ? 'sm:col-span-2' : 'sm:col-span-3'">
                      <label :for="`help-${field.id}`" class="text-[11px] font-bold text-slate-600">Help text for the teacher</label>
                      <input
                        :id="`help-${field.id}`"
                        v-model="field.help"
                        type="text"
                        maxlength="200"
                        placeholder="Optional. Shown under the question."
                        class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                      />
                    </div>
                    <div v-if="fieldType(field.type).hasMax">
                      <label :for="`max-${field.id}`" class="text-[11px] font-bold text-slate-600">Max characters</label>
                      <input
                        :id="`max-${field.id}`"
                        v-model.number="field.max"
                        type="number"
                        min="1"
                        max="5000"
                        placeholder="No limit"
                        class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
                      />
                    </div>
                  </div>

                  <label class="inline-flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="field.required ? 'true' : 'false'"
                      @click="field.required = !field.required"
                      class="relative h-5 w-9 rounded-full transition"
                      :class="field.required ? 'bg-brighture-ink' : 'bg-slate-300'"
                    >
                      <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" :class="field.required ? 'left-[18px]' : 'left-0.5'"></span>
                    </button>
                    Required: the teacher can't submit without answering
                  </label>
                </div>
              </li>
            </ul>

            <div class="px-4 py-3" :class="section.fields.length ? 'border-t border-slate-100' : ''">
              <button type="button" @click="addField(section)" class="text-xs font-black text-brighture-bronze hover:text-brighture-ink">
                <i class="fa-solid fa-plus mr-1"></i>Add question
              </button>
            </div>
          </section>

          <button
            type="button"
            @click="addSection"
            class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-black text-slate-600 transition hover:border-brighture-gold hover:text-brighture-ink"
          >
            <i class="fa-solid fa-plus"></i>
            Add section
          </button>

          <p class="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <i class="fa-solid fa-circle-info mt-0.5 text-slate-400"></i>
            <span>
              Saving creates a new version. Assessments already written keep the version they used, so editing a question never changes past results.
              <template v-if="!isNew && usage">This template is behind {{ usage }} {{ usage === 1 ? 'assessment' : 'assessments' }} so far.</template>
            </span>
          </p>
        </div>

        <!-- ===================== Preview ===================== -->
        <aside class="lg:col-span-5" :class="view === 'preview' ? '' : 'hidden lg:block'">
          <div class="lg:sticky lg:top-4">
            <p class="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <i class="fa-regular fa-eye"></i>
              Preview: what the teacher fills in
            </p>
            <div class="lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-1">
              <TemplatePreview :template="draft" />
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, h, nextTick, reactive, ref, watch } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { ASSESSMENT_TYPES } from '@/lib/brelas';
import TemplatePreview from './components/TemplatePreview.vue';
import { FIELD_TYPES, fieldType, newId, showToast } from './adminUi';

const route = useRoute();
const router = useRouter();
const school = useSchoolStore();

/** Small square icon button for move up / down. */
const IconButton = (props, { emit }) => h('button', {
  type: 'button',
  disabled: props.disabled,
  'aria-label': props.label,
  title: props.label,
  onClick: () => emit('click'),
  class: 'flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30',
}, [h('i', { class: `${props.icon} text-[11px]` })]);
IconButton.props = ['icon', 'label', 'disabled'];
IconButton.emits = ['click'];

const clone = (x) => JSON.parse(JSON.stringify(x));
const blankField = () => ({ id: newId('q'), label: '', type: 'longtext', required: false, help: '', options: [], max: 1000 });

const draft = ref(null);
const original = ref(null);
const baseline = ref('');
const notFound = ref(false);
const isNew = computed(() => !route.params.id);
const view = ref('edit');
const openField = ref(null);
const showErrors = ref(false);

/**
 * Loads the draft. An existing template is edited as a copy, so nothing
 * reaches the store until Save. A new one starts blank or as a copy of the
 * template picked on the list; copied questions keep their ids, which keeps
 * answers comparable between a template and its successor.
 */
const load = () => {
  notFound.value = false;
  showErrors.value = false;
  openField.value = null;
  if (route.params.id) {
    const tpl = school.findTemplate(route.params.id);
    if (!tpl) {
      notFound.value = true;
      draft.value = null;
      return;
    }
    original.value = clone(tpl);
    draft.value = clone(tpl);
  } else {
    const type = ASSESSMENT_TYPES[route.query.type] ? route.query.type : 'TA';
    const from = route.query.from ? school.findTemplate(route.query.from) : null;
    original.value = null;
    draft.value = from
      ? { ...clone(from), id: '', type, name: `${from.name} (copy)`, active: false, version: 1 }
      : { id: '', type, name: '', description: '', active: false, version: 1, sections: [{ id: newId('sec'), title: '', fields: [] }] };
  }
  draft.value.sections.forEach((s) => s.fields.forEach((f) => { if (!Array.isArray(f.options)) f.options = []; }));
  baseline.value = JSON.stringify(draft.value);
};
watch(() => route.fullPath, load, { immediate: true });

const dirty = computed(() => !!draft.value && JSON.stringify(draft.value) !== baseline.value);
const usage = computed(() => (original.value ? school.assessments.filter((a) => a.templateId === original.value.id).length : 0));

// ── Editing ───────────────────────────────────────────────────────────
const move = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
};

const addSection = () => {
  draft.value.sections.push({ id: newId('sec'), title: '', fields: [] });
};
const addField = (section) => {
  const f = blankField();
  section.fields.push(f);
  openField.value = f.id;
  nextTick(() => document.getElementById(`lbl-${f.id}`)?.focus());
};

/**
 * Deleting a section or a question takes two clicks. An empty section goes on
 * the first, since there is nothing to lose. The arm wears off after a few
 * seconds so an old armed button can't be hit by accident later.
 */
const armed = ref(null);
let armTimer = null;
const arm = (id) => {
  armed.value = id;
  clearTimeout(armTimer);
  armTimer = setTimeout(() => { armed.value = null; }, 4000);
};
const removeSection = (si) => {
  const s = draft.value.sections[si];
  if (s.fields.length && armed.value !== s.id) return arm(s.id);
  armed.value = null;
  draft.value.sections.splice(si, 1);
};
const removeField = (section, fi) => {
  const f = section.fields[fi];
  const untouched = !f.label && !f.options.length && !f.help;
  if (!untouched && armed.value !== f.id) return arm(f.id);
  armed.value = null;
  section.fields.splice(fi, 1);
};

const changeType = (field, type) => {
  field.type = type;
  const t = fieldType(type);
  if (!t.hasMax) delete field.max;
  else if (field.max === undefined) field.max = type === 'text' ? 200 : 1000;
};

const optionDraft = reactive({});
const optionError = reactive({});
const addOption = (field) => {
  const value = (optionDraft[field.id] ?? '').trim();
  optionError[field.id] = '';
  if (!value) return;
  if (field.options.some((o) => o.toLowerCase() === value.toLowerCase())) {
    optionError[field.id] = `"${value}" is already an option.`;
    return;
  }
  field.options.push(value);
  optionDraft[field.id] = '';
};

// ── Validation and save ───────────────────────────────────────────────
/** Problems keyed by what they belong to, so each can be flagged in place. */
const errors = computed(() => {
  const out = {};
  const d = draft.value;
  if (!d) return out;
  if (!d.name?.trim()) out.name = 'Give the template a name.';
  if (!d.sections.length) out.sections = 'Add at least one section.';
  d.sections.forEach((s, si) => {
    const where = s.title?.trim() || `Section ${si + 1}`;
    if (!s.title?.trim()) out[s.id] = `Section ${si + 1} needs a title.`;
    else if (!s.fields.length) out[s.id] = `"${where}" has no questions. Add one or delete the section.`;
    s.fields.forEach((f, fi) => {
      if (!f.label?.trim()) out[f.id] = `Question ${fi + 1} in "${where}" needs a label.`;
      else if (fieldType(f.type).hasOptions && f.options.length < 2) out[f.id] = `"${f.label}" needs at least two options.`;
      else if (fieldType(f.type).hasMax && f.max !== undefined && f.max !== '' && !(f.max >= 1)) out[f.id] = `"${f.label}" needs a max length of at least 1, or leave it empty.`;
    });
  });
  return out;
});
const errorList = computed(() => Object.values(errors.value));

/** Strips what a field's type doesn't use, so the stored template stays tidy. */
const cleaned = () => {
  const d = clone(draft.value);
  d.name = d.name.trim();
  d.description = (d.description ?? '').trim();
  d.sections.forEach((s) => {
    s.title = s.title.trim();
    s.fields.forEach((f) => {
      f.label = f.label.trim();
      f.help = (f.help ?? '').trim();
      const t = fieldType(f.type);
      if (!t.hasOptions) f.options = [];
      if (!t.hasMax || f.max === '' || f.max === undefined || f.max === null) delete f.max;
    });
  });
  return d;
};

const save = () => {
  showErrors.value = true;
  if (errorList.value.length) {
    const firstField = draft.value.sections.flatMap((s) => s.fields).find((f) => errors.value[f.id]);
    if (firstField) openField.value = firstField.id;
    return;
  }
  const wasNew = isNew.value;
  const saved = school.saveTemplate(cleaned());
  draft.value = clone(saved);
  original.value = clone(saved);
  baseline.value = JSON.stringify(draft.value);
  showErrors.value = false;
  showToast(wasNew
    ? `"${saved.name}" saved as version 1.${saved.active ? ` It is now the active ${saved.type} template.` : ''}`
    : `Saved as version ${saved.version}. Past assessments keep the version they were written with.`);
  if (wasNew) router.replace(`/templates/${saved.id}`);
};

const discardArmed = ref(false);
const onDiscard = () => {
  if (!discardArmed.value) {
    discardArmed.value = true;
    setTimeout(() => { discardArmed.value = false; }, 4000);
    return;
  }
  discardArmed.value = false;
  load();
};

// ── Unsaved-changes guard ─────────────────────────────────────────────
const pendingLeave = ref(null);
const leaveBar = ref(null);
let leaving = false;
onBeforeRouteLeave((to) => {
  if (leaving || !dirty.value) return true;
  pendingLeave.value = to.fullPath;
  nextTick(() => leaveBar.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  return false;
});
const leaveAnyway = () => {
  const to = pendingLeave.value;
  pendingLeave.value = null;
  leaving = true;
  router.push(to);
};
</script>
