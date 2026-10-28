<template>
  <!-- A working copy of the form a teacher fills in. Nothing typed here is saved:
       it only lets the admin try the questions before publishing them. -->
  <div class="space-y-4">
    <div class="rounded-2xl border border-slate-200 bg-white">
      <div class="border-b border-slate-100 px-4 py-3">
        <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{ typeLabel(template.type) }}</p>
        <h3 class="text-sm font-black text-slate-900">{{ template.name || 'Untitled template' }}</h3>
        <p v-if="template.description" class="mt-0.5 text-xs text-slate-500">{{ template.description }}</p>
      </div>

      <p v-if="!template.sections.length" class="px-4 py-6 text-center text-xs font-semibold text-slate-400">
        Add a section to see it here.
      </p>

      <fieldset v-for="section in template.sections" :key="section.id" class="border-b border-slate-100 last:border-0 px-4 py-4">
        <legend class="sr-only">{{ section.title }}</legend>
        <h4 class="mb-3 text-xs font-black uppercase tracking-wider text-slate-600">{{ section.title || 'Untitled section' }}</h4>
        <p v-if="!section.fields.length" class="text-xs text-slate-400">No questions in this section yet.</p>
        <div class="space-y-4">
          <div v-for="field in section.fields" :key="field.id">
            <label class="block text-xs font-bold text-slate-700" :for="`pv-${field.id}`">
              {{ field.label || 'Untitled question' }}
              <span v-if="field.required" class="text-rose-500" aria-label="required">*</span>
            </label>
            <p v-if="field.help" class="mt-0.5 text-[11px] text-slate-500">{{ field.help }}</p>

            <div v-if="field.type === 'rating'" class="mt-1.5 flex flex-wrap gap-1.5">
              <button
                v-for="opt in field.options"
                :key="opt"
                type="button"
                @click="values[field.id] = opt"
                class="rounded-lg border px-2.5 py-1 text-xs font-bold transition"
                :class="values[field.id] === opt ? 'border-brighture-ink bg-brighture-ink text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'"
              >
                {{ opt }}
              </button>
            </div>
            <select
              v-else-if="field.type === 'select'"
              :id="`pv-${field.id}`"
              v-model="values[field.id]"
              class="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
            >
              <option :value="undefined">Choose…</option>
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <div v-else-if="field.type === 'multiselect'" class="mt-1.5 flex flex-wrap gap-1.5">
              <button
                v-for="opt in field.options"
                :key="opt"
                type="button"
                @click="toggle(field.id, opt)"
                class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition"
                :class="(values[field.id] ?? []).includes(opt) ? 'border-brighture-gold bg-brighture-cream text-brighture-ink' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'"
              >
                <i v-if="(values[field.id] ?? []).includes(opt)" class="fa-solid fa-check text-[10px] text-brighture-bronze"></i>
                {{ opt }}
              </button>
            </div>
            <template v-else-if="field.type === 'text'">
              <input
                :id="`pv-${field.id}`"
                v-model="values[field.id]"
                type="text"
                :maxlength="field.max || undefined"
                class="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
              />
              <p v-if="field.max" class="mt-0.5 text-right text-[10px] text-slate-400">{{ (values[field.id] ?? '').length }} / {{ field.max }}</p>
            </template>
            <template v-else-if="field.type === 'longtext'">
              <textarea
                :id="`pv-${field.id}`"
                v-model="values[field.id]"
                rows="3"
                :maxlength="field.max || undefined"
                class="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brighture-gold focus:outline-none focus:ring-2 focus:ring-brighture-gold/40"
              ></textarea>
              <p v-if="field.max" class="text-right text-[10px] text-slate-400">{{ (values[field.id] ?? '').length }} / {{ field.max }}</p>
            </template>
            <label v-else-if="field.type === 'checkbox'" class="mt-1.5 inline-flex items-center gap-2 text-sm text-slate-700">
              <input :id="`pv-${field.id}`" v-model="values[field.id]" type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-brighture-ink" />
              Yes
            </label>
          </div>
        </div>
      </fieldset>
    </div>

    <!-- The fixed part of every assessment, shown so the preview is the whole form. -->
    <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 space-y-3">
      <p class="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
        <i class="fa-solid fa-lock"></i>
        Always included — not part of the template
      </p>
      <div>
        <p class="text-xs font-bold text-slate-700">BRELAS rating <span class="text-rose-500">*</span></p>
        <div class="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">Choose a rating: B0, or 1–15 (level and band follow)</div>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-700">NFA <span class="font-semibold text-slate-400">— internal, never shown to the student</span></p>
        <div class="mt-1.5 h-12 rounded-lg border border-slate-200 bg-white"></div>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-700">Current performance <span class="font-semibold text-emerald-700">— the student sees this</span></p>
        <div class="mt-1.5 h-12 rounded-lg border border-slate-200 bg-white"></div>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-700">What to work on <span class="font-semibold text-emerald-700">— the student sees this</span></p>
        <div class="mt-1.5 h-12 rounded-lg border border-slate-200 bg-white"></div>
      </div>
      <div v-if="template.type === 'CS'">
        <p class="text-xs font-bold text-slate-700">Recommended next CS</p>
        <div class="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">e.g. In about 3 months</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { typeLabel } from '../adminUi';

defineProps({ template: { type: Object, required: true } });

const values = reactive({});
const toggle = (id, opt) => {
  const list = values[id] ?? [];
  values[id] = list.includes(opt) ? list.filter((v) => v !== opt) : [...list, opt];
};
</script>
