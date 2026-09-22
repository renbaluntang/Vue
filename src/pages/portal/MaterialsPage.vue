<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-5 sm:space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {{ t('nav.materials') }}
        </h1>
        <p class="mt-1 font-medium text-slate-500">{{ t('materials.subtitle') }}</p>
      </div>
      <span
        v-if="user.lessonMaterials.length"
        class="shrink-0 self-start rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white sm:self-auto"
      >
        {{ t('materials.count', { n: user.lessonMaterials.length }) }}
      </span>
    </header>

    <!-- Grouped by subject: what a student wants is "the pronunciation stuff",
         not a reverse-chronological pile. -->
    <section
      v-for="group in user.materialsBySubject"
      :key="group.subject"
      class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div class="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <span class="h-4 w-1.5 shrink-0 rounded-full bg-brighture-gold"></span>
        <h2 class="min-w-0 truncate text-sm font-extrabold text-slate-800">{{ group.subject }}</h2>
        <span class="ml-auto shrink-0 text-[11px] font-bold text-slate-400 tabular-nums">
          {{ group.items.length }}
        </span>
      </div>

      <ul class="divide-y divide-slate-100">
        <li
          v-for="item in group.items"
          :key="item.id"
          class="flex items-start gap-3 p-4 transition hover:bg-slate-50/70 sm:px-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm ring-1"
            :class="materialKind(item.kind).chip"
          >
            <i :class="materialKind(item.kind).icon"></i>
          </span>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">{{ item.title }}</p>
            <p class="mt-0.5 text-[11px] font-semibold text-slate-500">
              {{ materialKind(item.kind).label }} · {{ item.addedOn }}
              <template v-if="item.addedBy"> · {{ item.addedBy }}</template>
            </p>
            <p v-if="item.note" class="mt-1.5 rounded-xl bg-brighture-cream/70 px-3 py-2 text-xs italic text-slate-700">
              {{ item.note }}
            </p>
          </div>

          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener"
            class="inline-flex shrink-0 items-center gap-1.5 self-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <span>{{ t('materials.open') }}</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-400"></i>
          </a>
        </li>
      </ul>
    </section>

    <p
      v-if="!user.lessonMaterials.length"
      class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-medium text-slate-500"
    >
      {{ t('materials.empty') }}
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { materialKind } from '../../lib/lessonMaterials';
import { useUserStore } from '../../stores/useUserStore';

const { t } = useI18n();
const user = useUserStore();
</script>
