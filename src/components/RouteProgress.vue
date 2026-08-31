<template>
  <Transition
    enter-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-500"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px]"
      role="progressbar"
      aria-label="Loading page"
      :aria-valuenow="Math.round(progress)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="route-progress h-full bg-gradient-to-r from-brighture-gold to-brighture-gold-deep shadow-[0_0_10px_rgba(224,168,0,.6)]"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const visible = ref(false);
const progress = ref(0);
let creep = null;
let settle = null;

const stopCreep = () => { if (creep) { clearInterval(creep); creep = null; } };

const start = () => {
  clearTimeout(settle);
  stopCreep();
  visible.value = true;
  progress.value = 12;
  // Route chunks have no measurable progress, so ease toward 90% and let the
  // finish jump the rest — movement that never quite completes reads as work
  // happening, where a fixed bar reads as stuck.
  creep = setInterval(() => {
    progress.value += Math.max(0.4, (90 - progress.value) * 0.12);
    if (progress.value >= 90) stopCreep();
  }, 160);
};

const done = () => {
  stopCreep();
  progress.value = 100;
  settle = setTimeout(() => {
    visible.value = false;
    progress.value = 0;
  }, 320);
};

// Guards registered in setup must be torn down with the component, or a
// remounted layout stacks duplicates that fight over the same bar.
const offBefore = router.beforeEach((to, from, next) => {
  if (to.fullPath !== from.fullPath) start();
  next();
});
const offAfter = router.afterEach(done);
const offError = router.onError(done);

onBeforeUnmount(() => {
  offBefore();
  offAfter();
  offError();
  stopCreep();
  clearTimeout(settle);
});
</script>

<style scoped>
.route-progress { transition: width .18s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .route-progress { transition: none; }
}
</style>
