<template>
  <!-- The language setting, shared by every student layout's settings area.
       A dropdown, because the list is longer than a toggle can hold. The
       choice is saved by src/i18n, so it survives a reload. -->
  <label class="flex w-full items-center rounded-xl font-bold" :class="rowClass">
    <i class="fa-solid fa-language w-4 text-center text-sky-500" aria-hidden="true"></i>
    <span>Language</span>
    <span class="relative ml-auto shrink-0">
      <select
        v-model="locale"
        class="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-7 text-[11px] font-bold text-slate-800 outline-none transition hover:border-slate-300 focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/30"
      >
        <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">{{ lang.label }}</option>
      </select>
      <i class="fa-solid fa-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400" aria-hidden="true"></i>
    </span>
  </label>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { LANGUAGES } from '@/i18n';

defineProps({
  /** Padding, gap and text size, so the row matches the menu it sits in. */
  rowClass: { type: String, default: 'gap-3 px-3 py-2 text-xs text-slate-700' },
});

const { locale } = useI18n({ useScope: 'global' });
</script>
