~<template>
  <div
    role="status"
    aria-live="polite"
    class="inline-flex h-9 max-w-full items-center gap-1 rounded-xl border border-slate-200 bg-white pl-3 pr-1 shadow-2xs"
  >
    <p class="min-w-0 truncate pr-2 text-xs text-slate-500">
      <strong class="font-extrabold tabular-nums text-slate-900">{{ amount }}</strong> unsaved
    </p>

    <button
      type="button"
      @click="$emit('revert')"
      class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 active:scale-95"
    >
      Discard
    </button>
    <button
      type="button"
      @click="$emit('register')"
      class="shrink-0 rounded-lg bg-brighture-gold px-3.5 py-1 text-xs font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95"
    >
      Save
    </button>
  </div>
</template>

<script setup>
defineProps({
  /** How much of the week differs from the last saved version, e.g. "1.5h". */
  amount: { type: String, default: '' },
});
defineEmits(['revert', 'register']);
</script>
