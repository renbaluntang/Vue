<template>
  <!-- Shown on the Calendar page. Says why an edit did nothing: the half hour has a student's lesson in
       it, and closing or holding it would not cancel that lesson. Top right
       like the portal's other notices, so it never pushes the page down; it
       closes itself after a few seconds, or on ✕. -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-6"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-x-6"
    >
      <div
        v-if="visible"
        role="status"
        aria-live="polite"
        class="fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-amber-200 bg-white p-4 shadow-xl"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm text-amber-800">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
        </span>
        <div class="min-w-0 flex-1 pt-0.5">
          <p class="m-0 text-xs font-black text-slate-900">That time has a booked lesson</p>
          <p class="m-0 mt-0.5 text-xs font-semibold leading-snug text-slate-600">
            A student is booked then, so it stays open. To free it, the lesson needs to be cancelled or moved first.
          </p>
        </div>
        <button
          type="button"
          @click="visible = false"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss notice"
        >
          <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useTeacherStore } from '@/stores/useTeacherStore';

const teacher = useTeacherStore();
const visible = ref(false);
let timer = null;

// A drag across several booked half hours refuses each one; the toast just
// stays up (its timer restarts) rather than stacking copies.
watch(() => teacher.blockedEdit?.at, (at) => {
  if (!at) return;
  visible.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => { visible.value = false; }, 6000);
});
onBeforeUnmount(() => clearTimeout(timer));
</script>
