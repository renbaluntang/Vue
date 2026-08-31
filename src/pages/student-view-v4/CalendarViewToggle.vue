<script setup>
defineProps({
  value: { type: String, required: true },
});

const emit = defineEmits(["change"]);

const MODES = ["week", "day"];
</script>

<template>
  <div
    role="tablist"
    aria-label="Calendar view"
    class="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-[11px] font-semibold"
  >
    <button
      v-for="mode in MODES"
      :key="mode"
      type="button"
      role="tab"
      :aria-selected="value === mode"
      @click="emit('change', mode)"
      :class="`rounded-full px-3 py-1.5 capitalize transition ${
        value === mode ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
      }`"
    >
      {{ mode }}
    </button>
  </div>
</template>
