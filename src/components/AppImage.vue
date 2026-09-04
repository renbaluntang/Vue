<template>
  <!-- Sizing and rounding classes go on the wrapper; the image fills it, so the
       skeleton occupies exactly the same box and nothing reflows on load. -->
  <span class="app-image relative block overflow-hidden bg-slate-100">
    <!-- The image is never hidden with display:none. A lazy image that is not
         displayed is never "near the viewport", so the browser never fetches
         it, so @load never fires and the skeleton stays up forever — hidden
         because unloaded, unloaded because hidden. Fading with opacity keeps a
         real layout box, which is what lazy loading needs to trigger. -->
    <img
      ref="imgEl"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="app-image__img absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
      :class="state === 'loaded' ? 'opacity-100' : 'opacity-0'"
      @load="state = 'loaded'"
      @error="state = 'error'"
    />

    <!-- Overlays come after the image so they paint above it without z-index. -->
    <span v-if="state === 'loading'" class="app-image__skeleton absolute inset-0" aria-hidden="true"></span>

    <span
      v-if="state === 'error'"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500"
      aria-hidden="true"
    >
      <span class="text-[0.7em] font-black uppercase tracking-wider">{{ initials }}</span>
    </span>
  </span>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

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

// A cached image can finish decoding before the listener is attached, in which
// case no load event ever arrives. Ask the element directly once it is in the
// DOM rather than waiting for an event that already happened.
const imgEl = ref(null);
const settleIfCached = () => {
  const img = imgEl.value;
  if (img?.complete && img.naturalWidth > 0) state.value = 'loaded';
  else if (img?.complete && img.naturalWidth === 0 && img.getAttribute('src')) state.value = 'error';
};

onMounted(settleIfCached);
watch(() => props.src, () => nextTick(settleIfCached));

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

@media (prefers-reduced-motion: reduce) {
  .app-image__skeleton { animation: none; background: rgb(226 232 240); }
  .app-image__img { transition: none; }
}
</style>
