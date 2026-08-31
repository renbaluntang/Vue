<template>
  <!-- Sizing and rounding classes go on the wrapper; the image fills it, so the
       skeleton occupies exactly the same box and nothing reflows on load. -->
  <span class="app-image relative block overflow-hidden bg-slate-100">
    <span v-if="state !== 'loaded'" class="app-image__skeleton absolute inset-0" aria-hidden="true"></span>

    <span
      v-if="state === 'error'"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500"
      aria-hidden="true"
    >
      <span class="text-[0.7em] font-black uppercase tracking-wider">{{ initials }}</span>
    </span>

    <img
      v-show="state === 'loaded'"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="app-image__img absolute inset-0 h-full w-full object-cover"
      @load="state = 'loaded'"
      @error="state = 'error'"
    />
  </span>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  /** Above-the-fold images skip lazy loading so they start immediately. */
  eager: { type: Boolean, default: false },
});

const state = ref('loading'); // loading | loaded | error

// A changed src means a new download — show the skeleton again rather than
// leaving the previous face on screen while the next one arrives.
watch(() => props.src, () => { state.value = 'loading'; });

const initials = computed(() =>
  (props.alt || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
);
</script>

<style scoped>
.app-image__skeleton {
  background: linear-gradient(
    100deg,
    rgb(226 232 240) 30%,
    rgb(248 250 252) 48%,
    rgb(226 232 240) 66%
  );
  background-size: 260% 100%;
  animation: app-image-sheen 1.35s ease-in-out infinite;
}

@keyframes app-image-sheen {
  from { background-position: 160% 0; }
  to   { background-position: -60% 0; }
}

.app-image__img {
  animation: app-image-fade .45s ease-out both;
}

@keyframes app-image-fade {
  from { opacity: 0; transform: scale(1.015); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .app-image__skeleton { animation: none; background: rgb(226 232 240); }
  .app-image__img { animation: none; }
}
</style>
