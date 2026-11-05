<template>
  <!-- A subject as a square letter box in its own gradient with white
       letters ("SF"), optionally followed by its name. Every screen that shows
       a subject code uses this, so the boxes look the same in both portals.
       The radius is fixed in px per size because the theme's rounded-md
       follows --radius and would turn a small box into a circle. The inset
       highlight along the top edge gives the box a little depth. -->
  <span class="inline-flex min-w-0 items-center gap-2 align-middle">
    <span
      class="inline-flex shrink-0 items-center justify-center bg-gradient-to-br font-black leading-none tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(15,23,42,0.15)]"
      :class="[info.boxClass, sizeClass, fontClass]"
      :title="info.name"
      aria-hidden="true"
    >{{ info.badge }}</span>
    <!-- iconOnMobile keeps the name for screen readers on narrow screens. -->
    <span v-if="showName" class="min-w-0 truncate" :class="iconOnMobile ? 'sr-only sm:not-sr-only' : ''">{{ info.name }}</span>
    <span v-else class="sr-only">{{ info.name }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { parseSubject } from '@/pages/student-view-v4/constants';

const props = defineProps({
  /** "[SF] Speech Fluency", "[SF]", "SF" or plain text. */
  subject: { type: String, default: '' },
  /** Show the subject's name after the box. */
  showName: { type: Boolean, default: true },
  /** Below the sm breakpoint, show only the box (the name stays readable by screen readers). */
  iconOnMobile: { type: Boolean, default: false },
  /** sm 20px, md 24px, lg 32px. */
  size: { type: String, default: 'md' },
});

const info = computed(() => parseSubject(props.subject));

const SIZES = { sm: 'h-5 w-5 rounded-[5px]', md: 'h-6 w-6 rounded-[6px]', lg: 'h-8 w-8 rounded-[8px]' };
const sizeClass = computed(() => SIZES[props.size] ?? SIZES.md);

// Longer codes (LS1, PP101) shrink their letters so the box stays square.
const fontClass = computed(() => {
  const n = info.value.badge.length;
  const big = props.size === 'lg';
  if (n <= 2) return big ? 'text-[11px]' : props.size === 'sm' ? 'text-[8px]' : 'text-[9px]';
  if (n === 3) return big ? 'text-[10px]' : props.size === 'sm' ? 'text-[7px]' : 'text-[8px]';
  return big ? 'text-[8px]' : props.size === 'sm' ? 'text-[5.5px]' : 'text-[6.5px]';
});
</script>
