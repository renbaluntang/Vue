<template>
  <!-- A subject as a square letter box in its own colour ("SF"), optionally
       followed by its name. Every screen that shows a subject code uses this,
       so the boxes look the same in both portals. The radius is fixed in px
       because the theme's rounded-md follows --radius and would turn a small
       box into a circle. -->
  <span class="inline-flex min-w-0 items-center gap-2 align-middle">
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-[5px] border font-black leading-none tracking-tight"
      :class="[info.boxClass, sizeClass, fontClass]"
      :title="info.name"
      aria-hidden="true"
    >{{ info.badge }}</span>
    <span v-if="showName" class="min-w-0 truncate">{{ info.name }}</span>
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
  /** sm 20px, md 24px, lg 32px. */
  size: { type: String, default: 'md' },
});

const info = computed(() => parseSubject(props.subject));

const SIZES = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-8 w-8' };
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
