<template>
  <section class="flex flex-col gap-3 rounded-2xl border border-brighture-gold/40 bg-brighture-cream p-4 sm:flex-row sm:items-center sm:gap-4">
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brighture-gold text-brighture-ink">
      <i class="fa-solid fa-bell"></i>
    </span>
    <div class="min-w-0 flex-1">
      <h2 class="text-sm font-black text-brighture-ink">Remind teachers: never mention the level in feedback</h2>
      <p class="mt-0.5 text-xs leading-relaxed text-brighture-ink-soft">
        Students see "Current performance" and "What to work on", never their BRELAS level.
        Sending this reminds every teacher of the rule.
      </p>
      <p class="mt-1 text-[11px] font-bold text-brighture-bronze">
        <template v-if="reminder">Last sent {{ stamp(reminder.at) }} by {{ reminder.by }}</template>
        <template v-else>Not sent yet</template>
      </p>
    </div>
    <button
      type="button"
      @click="send"
      class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brighture-ink px-4 py-2.5 text-xs font-black text-white transition hover:bg-black"
    >
      <i class="fa-solid fa-paper-plane"></i>
      {{ reminder ? 'Send again' : 'Send reminder' }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { stamp, showToast } from '../adminUi';

const school = useSchoolStore();
const reminder = computed(() => school.db.levelReminder);

const send = () => {
  school.sendLevelReminder('Admin');
  showToast('Reminder sent to every teacher.');
};
</script>
